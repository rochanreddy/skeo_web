import { redirect } from 'next/navigation'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import { isAuthenticated, usingDefaultPassword } from '@/lib/admin/auth'

// The cookie decides what renders, so this can never be prerendered.
export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  // Checked on the server: an unauthenticated visitor never receives the
  // dashboard markup at all, rather than being hidden from it in the browser.
  if (!(await isAuthenticated())) redirect('/admin/login')

  return <AdminDashboard defaultPassword={usingDefaultPassword()} />
}
