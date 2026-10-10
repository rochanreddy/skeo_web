import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { dataset, projectId } from './env'
import { schemaTypes } from './schemaTypes'

/**
 * skeo's Studio, hosted at skeo.sanity.studio (`npm run deploy`).
 *
 * Every document here is fixed: one per plan, one "coming soon" row, one
 * campaign. They are created by `npm run seed` with the website's current
 * values, and the menu below opens each by its ID — there is no "new" and no
 * "delete", because the website only knows the plans the code knows (see
 * schemaTypes/plan.ts). Editing is publish, discard, or roll back.
 */

const PLANS = [
  { key: 'claude', title: 'Claude Course' },
  { key: 'playbooks', title: 'Claude Playbooks' },
  { key: 'library', title: 'AI Library' },
  { key: 'member', title: 'Everything AI (all access)' },
  { key: 'earlyaccess', title: 'Everything AI — Early Access' },
  { key: 'teams', title: 'Teams' },
]

const FIXED_TYPES = ['plan', 'comingSoon', 'campaign']

export default defineConfig({
  name: 'default',
  title: 'skeo',
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('skeo')
          .items([
            S.listItem()
              .title('Pricing & courses')
              .id('pricing')
              .child(
                S.list()
                  .title('Pricing & courses')
                  .items([
                    ...PLANS.map((p) =>
                      S.listItem()
                        .title(p.title)
                        .id(`plan-${p.key}`)
                        .child(S.document().schemaType('plan').documentId(`plan-${p.key}`).title(p.title)),
                    ),
                    S.divider(),
                    S.listItem()
                      .title('Coming soon row')
                      .id('comingSoon')
                      .child(S.document().schemaType('comingSoon').documentId('comingSoon')),
                  ]),
              ),
            S.listItem()
              .title('Campaign — Everything AI')
              .id('campaignEverythingAi')
              .child(S.document().schemaType('campaign').documentId('campaignEverythingAi').title('Campaign — Everything AI')),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
    templates: (prev) => prev.filter((t) => !FIXED_TYPES.includes(t.schemaType)),
  },
  document: {
    actions: (input, { schemaType }) =>
      FIXED_TYPES.includes(schemaType)
        ? input.filter(({ action }) => ['publish', 'discardChanges', 'restore'].includes(action ?? ''))
        : input,
    newDocumentOptions: (prev) => prev.filter((item) => !FIXED_TYPES.includes(item.templateId)),
  },
})
