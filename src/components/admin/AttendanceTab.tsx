'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { AdminClass, Attendance, AttendanceRow } from '@/lib/admin/classes'
import type { ZoomSession } from '@/lib/admin/zoom'
import { ITEM_NAMES, Status, downloadCsv, matches } from './AdminTabs'
import { Drawer, Facts, Pager, openRow, useListView, type SortOption } from './AdminList'

/**
 * Class attendance — menler's Attendance tab, for skeo.
 *
 * Pick a class and see everyone Zoom recorded in it, plus everyone who paid for
 * its course and never showed, and take it away as a CSV. Linking a class to
 * its Zoom session happens here too: attendance is the only reason the link is
 * stored, so sending someone to another tab first would be pure friction.
 */

const COURSES = ['claude', 'playbooks', 'library', 'member', 'earlyaccess'] as const

const day = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }) : '—'
const clock = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' }) : '—'
const stamp = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' })
const telHref = (phone: string) => `tel:${phone.replace(/\s/g, '')}`
const waHref = (phone: string) => `https://wa.me/${phone.replace(/\D/g, '').replace(/^(\d{10})$/, '91$1')}`

/** What the buyers are expected at: "Claude Course buyers (and Everything AI)". */
const audience = (course: string) =>
  course === 'member' || course === 'earlyaccess' ? 'Everything AI and Early Access buyers' : `${ITEM_NAMES[course] ?? course} buyers, plus Everything AI and Early Access`

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: 'no-store', ...init, headers: init?.body ? { 'Content-Type': 'application/json' } : undefined })
  if (res.status === 401) {
    window.location.href = '/admin/login'
    throw new Error('Signed out.')
  }
  const body = (await res.json().catch(() => ({}))) as T & { ok?: boolean; error?: string; wrongSession?: boolean }
  if (!body.ok) throw Object.assign(new Error(body.error || `Could not load (${res.status}).`), { wrongSession: Boolean(body.wrongSession) })
  return body
}

type Filter = 'all' | 'attended' | 'noshow' | 'walkin'

const SORTS: SortOption<AttendanceRow>[] = [
  { key: 'time', label: 'Time in call', compare: (a, b) => b.minutes - a.minutes || Number(b.attended) - Number(a.attended) },
  { key: 'name', label: 'Name A–Z', compare: (a, b) => (a.name || a.email).localeCompare(b.name || b.email) },
  { key: 'joined', label: 'Joined first', compare: (a, b) => (a.joinedAt ?? '9').localeCompare(b.joinedAt ?? '9') },
]
const joinedOf = (r: AttendanceRow) => r.joinedAt

export function AttendanceTab() {
  const [classes, setClasses] = useState<AdminClass[] | null>(null)
  const [zoom, setZoom] = useState(true)
  const [listErr, setListErr] = useState('')
  const [id, setId] = useState('')
  /** 'new' to add a class; 'edit' to relink the one on screen. */
  const [form, setForm] = useState<'' | 'new' | 'edit'>('')

  const [data, setData] = useState<Attendance | null>(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [q, setQ] = useState('')
  const [openKey, setOpenKey] = useState<string | null>(null)
  /* Zoom reports take seconds; switching class while one is in flight must not
     let the earlier answer land under the new class's heading. Each fetch takes
     a ticket, and an answer not holding the current one is dropped. */
  const ticket = useRef(0)

  const loadClasses = useCallback(async (select?: string) => {
    try {
      const body = await api<{ zoom: boolean; classes: AdminClass[] }>('/api/admin/classes')
      setZoom(body.zoom)
      setClasses(body.classes)
      setListErr('')
      // The newest class is nearly always why this page is open.
      setId((prev) => select ?? (body.classes.some((c) => c.id === prev) ? prev : body.classes[0]?.id ?? ''))
      if (!body.classes.length) setForm('new')
    } catch (e) {
      setListErr(e instanceof Error ? e.message : 'Could not load classes.')
    }
  }, [])
  useEffect(() => {
    void loadClasses()
  }, [loadClasses])

  const current = classes?.find((c) => c.id === id) ?? null

  const fetchAttendance = useCallback(
    async (uuid = '') => {
      if (!id) return
      const mine = ++ticket.current
      setLoading(true)
      setErr('')
      setData(null)
      try {
        const body = await api<Attendance & { classId: string }>(`/api/admin/classes/${id}/attendance${uuid ? `?uuid=${encodeURIComponent(uuid)}` : ''}`)
        if (ticket.current === mine && body.classId === id) setData(body)
      } catch (e) {
        if (ticket.current === mine) setErr(e instanceof Error ? e.message : 'Could not reach Zoom.')
      } finally {
        if (ticket.current === mine) setLoading(false)
      }
    },
    [id],
  )

  // Load as soon as a class is chosen — a button to see the only thing this page is for is a step with no decision in it.
  useEffect(() => {
    ticket.current += 1
    setData(null)
    setErr('')
    setFilter('all')
    setOpenKey(null)
    if (id && zoom && form !== 'edit') void fetchAttendance()
  }, [id, zoom, form, fetchAttendance])

  const s = data?.summary
  const rows = useMemo(
    () =>
      (data?.rows ?? []).filter(
        (r) =>
          (filter === 'attended' ? r.attended : filter === 'noshow' ? !r.attended : filter === 'walkin' ? r.attended && !r.registered : true) &&
          matches(q, r.name, r.email, r.phone),
      ),
    [data, filter, q],
  )
  const view = useListView(rows, { sorts: SORTS, dateOf: joinedOf })

  /* Does the session on screen belong to the class on screen? A wrong link
     does not look wrong — it looks like a class nobody paid for. Judged on who
     was in the room: a class shares people with its buyers, an unrelated one
     does not. */
  const mismatch =
    data && s && s.attended > 5 && s.walkIns === s.attended
      ? `Not one of the ${s.attended} attendees is among the ${s.registered} people who paid for ${ITEM_NAMES[current?.course ?? ''] ?? 'this course'}, which almost always means a different session is linked.`
      : ''

  async function remove() {
    if (!current || !window.confirm(`Remove “${current.title || 'this class'}” from attendance? Nothing in Zoom changes.`)) return
    try {
      await api(`/api/admin/classes/${current.id}`, { method: 'DELETE' })
      setId('')
      await loadClasses('')
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not remove it.')
    }
  }

  function csv() {
    if (!data || !current) return
    downloadCsv(
      `attendance-${(current.title || 'class').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
      ['Name', 'Email', 'Phone', 'Attended', 'Joined', 'Left', 'Minutes', 'Rejoins', 'Paid for the course'],
      data.rows.map((r) => [r.name, r.email, r.phone, r.attended ? 'yes' : 'no', r.joinedAt ? stamp(r.joinedAt) : '', r.leftAt ? stamp(r.leftAt) : '', r.minutes, r.sessions, r.registered ? 'yes' : 'no']),
    )
  }

  if (listErr) return <p className="admin-notice is-error">{listErr}</p>
  if (!classes) return <p className="admin-empty">Loading classes…</p>

  const open = data?.rows.find((r, i) => `${r.email || r.name}#${i}` === openKey) ?? null
  const FILTERS: [Filter, string, number | undefined][] = [
    ['all', 'Everyone', data?.rows.length],
    ['attended', 'Attended', s?.attended],
    ['noshow', 'Did not join', s?.noShows],
    ['walkin', 'Not a buyer', s?.walkIns],
  ]

  return (
    <section className="panel panel-wide">
      <header className="panel-head">
        <div>
          <h2>Attendance</h2>
          <p>Who joined each Zoom class, for how long, and who paid for the course but never showed.</p>
        </div>
        {data && !data.empty && !mismatch && (
          <button type="button" className="admin-btn admin-btn-quiet" onClick={csv}>
            ⭳ Download list (CSV)
          </button>
        )}
      </header>

      {!zoom && (
        <div className="admin-notice is-warn">
          <b>Zoom is not connected yet.</b> Attendance comes from Zoom&rsquo;s meeting reports. In skeo&rsquo;s Zoom, create a{' '}
          <b>Server-to-Server OAuth</b> app (Zoom Marketplace → Develop → Build App) with the <code>report:read:admin</code> scope,
          then set <code>ZOOM_ACCOUNT_ID</code>, <code>ZOOM_CLIENT_ID</code>, <code>ZOOM_CLIENT_SECRET</code> and{' '}
          <code>ZOOM_USER_ID</code> (the email of the Zoom user who hosts the classes) in Vercel and redeploy. Reports need a paid
          Zoom plan.
        </div>
      )}

      {zoom && (
        <>
          <div className="tab-toolbar">
            <select className="tab-search class-pick" value={id} onChange={(e) => { setForm(''); setId(e.target.value) }} aria-label="Class">
              {!classes.length && <option value="">No classes yet</option>}
              {classes.map((c, i) => (
                <option key={c.id} value={c.id}>
                  {i === 0 ? '★ ' : ''}
                  {c.startTime ? `${day(c.startTime)} · ` : ''}
                  {c.title || `Meeting ${c.meetingId}`} — {ITEM_NAMES[c.course] ?? c.course}, {c.registered} paid
                </option>
              ))}
            </select>
            {current && form !== 'edit' && (
              <button type="button" className="admin-btn" onClick={() => void fetchAttendance(data?.uuid)} disabled={loading}>
                {loading ? 'Asking Zoom…' : 'Refresh'}
              </button>
            )}
            <button type="button" className="admin-btn admin-btn-quiet" onClick={() => setForm(form === 'new' ? '' : 'new')}>
              {form === 'new' ? 'Cancel' : '+ Add a class'}
            </button>
          </div>

          {form && (
            <ClassForm
              key={form + id}
              editing={form === 'edit' ? current : null}
              hasClasses={classes.length > 0}
              onCancel={() => setForm('')}
              onSaved={(savedId) => {
                setForm('')
                void loadClasses(savedId)
              }}
            />
          )}

          {current && form !== 'edit' && (
            <p className="class-line">
              {audience(current.course)} count as registered · Zoom meeting <b>{current.meetingId}</b>
              {' · '}
              <button type="button" className="linkish" onClick={() => setForm('edit')}>
                wrong session or course? change it
              </button>
              {' · '}
              <button type="button" className="linkish" onClick={() => void remove()}>
                remove
              </button>
            </p>
          )}

          {err && (
            <div className="admin-notice is-error">
              {err}
              <br />
              <small>Zoom only reports on sessions that have finished, and takes about half an hour to settle afterwards.</small>
            </div>
          )}

          {/* Numbers we don't believe are not shown: a warning above a table still
              leaves the table to be read, screenshotted and exported. */}
          {data && mismatch && (
            <div className="admin-notice is-error">
              <b>Not showing this — it looks like the wrong session.</b> {mismatch}{' '}
              <button type="button" onClick={() => setForm('edit')}>
                Pick the right session
              </button>
            </div>
          )}

          {data?.empty && (
            <p className="admin-empty">
              <b>No attendance for this session yet.</b>{' '}
              {data.empty === 'no-sessions'
                ? 'Zoom has no finished run of this meeting. It reports a class about half an hour after it ends.'
                : 'Zoom recorded nobody in this session.'}
            </p>
          )}

          {loading && !data && <p className="admin-empty">Asking Zoom who was there…</p>}

          {data && s && !data.empty && !mismatch && (
            <>
              <p className="class-line">
                Showing <b>{data.meeting?.topic || 'this session'}</b>
                {data.meeting?.startTime && <> · {day(data.meeting.startTime)}, {clock(data.meeting.startTime)}</>}
                {data.meeting?.durationMinutes ? <> · ran {data.meeting.durationMinutes} min</> : null}
              </p>

              <div className="money-boxes">
                <div className="money-box">
                  <span>Attended</span>
                  <b>{s.attended}</b>
                  <small>{s.walkIns ? `${s.walkIns} not on the buyer list` : 'all of them buyers'}</small>
                </div>
                <div className="money-box">
                  <span>Paid for the course</span>
                  <b>{s.registered}</b>
                  <small>{s.registered ? `${Math.round(((s.attended - s.walkIns) / s.registered) * 100)}% of them came` : 'nobody yet'}</small>
                </div>
                <div className={`money-box${s.noShows ? ' is-warn' : ''}`}>
                  <span>Did not join</span>
                  <b>{s.noShows}</b>
                  <small>paid, never showed</small>
                </div>
                <div className="money-box">
                  <span>Avg time</span>
                  <b>
                    {s.avgMinutes}
                    <small className="unit"> min</small>
                  </b>
                  <small>{data.meeting?.durationMinutes ? `of a ${data.meeting.durationMinutes}-min class` : 'per attendee'}</small>
                </div>
              </div>

              <div className="tab-toolbar">
                <input className="tab-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, phone…" />
                <div className="seg" role="group" aria-label="Who to show">
                  {FILTERS.map(([k, label, n]) => (
                    <button key={k} type="button" className={filter === k ? 'is-on' : ''} onClick={() => setFilter(k)}>
                      {label} {n !== undefined && <em>{n}</em>}
                    </button>
                  ))}
                </div>
                {data.instances.length > 1 && (
                  <label className="list-field">
                    <span>Session</span>
                    <select value={data.uuid} onChange={(e) => void fetchAttendance(e.target.value)}>
                      {data.instances.map((i) => (
                        <option key={i.uuid} value={i.uuid}>
                          {stamp(i.startTime)}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <label className="list-field">
                  <span>Sort</span>
                  <select value={view.controls.sort} onChange={(e) => view.controls.setSort(e.target.value)}>
                    {SORTS.map((o) => (
                      <option key={o.key} value={o.key}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {view.all.length === 0 ? (
                <p className="admin-empty">Nobody in this group.</p>
              ) : (
                <div className="table-scroll">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Contact</th>
                        <th>Joined</th>
                        <th>Left</th>
                        <th>Time in call</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {view.shown.map((r) => {
                        const key = `${r.email || r.name}#${data.rows.indexOf(r)}`
                        return (
                          <tr key={key} {...openRow(() => setOpenKey(key))}>
                            <td>
                              <b>{r.name || '—'}</b>
                            </td>
                            <td className="wrap">
                              {r.phone || '—'}
                              <small>{r.email || 'no email in Zoom'}</small>
                            </td>
                            <td>{clock(r.joinedAt)}</td>
                            <td>{clock(r.leftAt)}</td>
                            <td>
                              {r.attended ? <b>{r.minutes} min</b> : '—'}
                              {r.sessions > 1 && <small>rejoined {r.sessions}×</small>}
                            </td>
                            <td>
                              {!r.attended && <Status tone="warn">Did not join</Status>}
                              {r.attended && !r.registered && <Status tone="quiet">Not a buyer</Status>}
                              {r.attended && r.registered && <Status tone="good">Attended</Status>}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <Pager {...view.pager} />
              <p className="panel-note">
                Matched on email, so a buyer who joined Zoom with a different address shows as &ldquo;Not a buyer&rdquo;, and again
                under &ldquo;Did not join&rdquo;. Rejoins are merged — the time shown is total minutes connected. Click anyone for
                their details.
              </p>
            </>
          )}

          {open && (
            <Drawer title={open.attended ? 'Attendee' : 'Did not join'} onClose={() => setOpenKey(null)}>
              <Facts
                rows={[
                  ['Name', open.name || '—'],
                  ['Email', open.email ? <a key="e" href={`mailto:${open.email}`}>{open.email}</a> : '—'],
                  ['Phone', open.phone ? <a key="p" href={telHref(open.phone)}>{open.phone}</a> : '—'],
                ]}
              />
              <Facts
                title="In this class"
                rows={[
                  ['Attended', open.attended ? <Status key="a" tone="good">Yes</Status> : <Status key="a" tone="warn">No</Status>],
                  ['Joined', open.joinedAt ? stamp(open.joinedAt) : '—'],
                  ['Left', open.leftAt ? stamp(open.leftAt) : '—'],
                  ['Time in call', open.attended ? `${open.minutes} min${open.sessions > 1 ? `, rejoined ${open.sessions}×` : ''}` : '—'],
                  ['Paid for the course', open.registered ? 'Yes' : 'No — not on the buyer list by this email'],
                ]}
              />
              {!open.attended && open.phone && (
                <div className="drawer-actions">
                  <a className="admin-btn" href={telHref(open.phone)}>
                    Call {open.name.split(' ')[0] || 'them'}
                  </a>
                  <a className="admin-btn admin-btn-quiet" href={waHref(open.phone)} target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                </div>
              )}
            </Drawer>
          )}
        </>
      )}
    </section>
  )
}

/**
 * Link a Zoom session to a course. Picking from the account's real sessions
 * beats hunting a meeting id in the Zoom portal; the paste box stays as the
 * fallback for when Zoom won't list them.
 */
function ClassForm({
  editing,
  hasClasses,
  onCancel,
  onSaved,
}: {
  editing: AdminClass | null
  hasClasses: boolean
  onCancel: () => void
  onSaved: (id: string) => void
}) {
  const [sessions, setSessions] = useState<ZoomSession[] | null>(null)
  const [sessionsErr, setSessionsErr] = useState('')
  const [pick, setPick] = useState('')
  const [pasted, setPasted] = useState('')
  const [course, setCourse] = useState<string>(editing?.course ?? 'claude')
  const [title, setTitle] = useState(editing?.title ?? '')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    api<{ sessions: ZoomSession[] }>('/api/admin/zoom/sessions')
      .then((b) => setSessions(b.sessions))
      .catch((e) => {
        setSessions([])
        setSessionsErr(e instanceof Error ? e.message : 'Zoom would not list them.')
      })
  }, [])

  const chosen = sessions?.find((m) => m.uuid === pick) ?? null

  async function save() {
    setSaving(true)
    setErr('')
    const body = chosen
      ? { link: chosen.id, uuid: chosen.uuid, startTime: chosen.startTime, course, title: title.trim() || chosen.topic }
      : { link: pasted, uuid: '', course, title: title.trim() }
    try {
      if (editing) {
        await api(`/api/admin/classes/${editing.id}`, { method: 'PATCH', body: JSON.stringify(chosen || pasted.trim() ? body : { course, title: title.trim() }) })
        onSaved(editing.id)
      } else {
        const res = await api<{ id: string }>('/api/admin/classes', { method: 'POST', body: JSON.stringify(body) })
        onSaved(res.id)
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not save.')
    } finally {
      setSaving(false)
    }
  }

  const canSave = editing ? true : Boolean(chosen || pasted.trim())

  return (
    <div className="class-form">
      <b>{editing ? 'Change this class' : hasClasses ? 'Add a class' : 'Add your first class'}</b>
      <p>
        {editing
          ? 'Pick the right session, or just change the course. Leave the session empty to keep the one linked now.'
          : 'Pick the Zoom session, then the course it was for. Everyone who paid for that course is expected in it.'}
      </p>

      {sessions === null ? (
        <p className="admin-empty">Listing your Zoom sessions…</p>
      ) : sessions.length > 0 ? (
        <label className="list-field wide">
          <span>Zoom session (last 90 days)</span>
          <select value={pick} onChange={(e) => setPick(e.target.value)}>
            <option value="">{editing ? 'Keep the current session' : 'Choose a session…'}</option>
            {sessions.map((m) => (
              <option key={m.uuid} value={m.uuid}>
                {stamp(m.startTime)} · {m.topic || 'Untitled meeting'}
                {m.participants != null ? ` · ${m.participants} joined` : ''}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <>
          <label className="list-field wide">
            <span>Meeting ID</span>
            <input value={pasted} onChange={(e) => setPasted(e.target.value)} placeholder="823 5894 9022 or https://us06web.zoom.us/j/82358949022" />
          </label>
          <small className="class-form-hint">
            From Zoom → Meetings → <b>Previous</b>. Spaces are fine.
            {sessionsErr && <> Sessions can&rsquo;t be listed automatically: {sessionsErr}</>}
          </small>
        </>
      )}

      <div className="class-form-row">
        <label className="list-field">
          <span>Course</span>
          <select value={course} onChange={(e) => setCourse(e.target.value)}>
            {COURSES.map((c) => (
              <option key={c} value={c}>
                {ITEM_NAMES[c]}
              </option>
            ))}
          </select>
        </label>
        <label className="list-field wide">
          <span>Name (optional)</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={chosen?.topic || 'Defaults to the Zoom topic'} />
        </label>
      </div>
      <small className="class-form-hint">Registered: {audience(course)}.</small>

      {err && <p className="admin-notice is-error">{err}</p>}
      <div className="drawer-actions">
        <button type="button" className="admin-btn" onClick={() => void save()} disabled={saving || !canSave}>
          {saving ? 'Saving…' : editing ? 'Save changes' : 'Link this class'}
        </button>
        {(editing || hasClasses) && (
          <button type="button" className="admin-btn admin-btn-quiet" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
