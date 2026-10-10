import { defineField, defineType } from 'sanity'

/** The row at the foot of the tool list that cannot be bought yet. Words only — the logos are code. */
export const comingSoon = defineType({
  name: 'comingSoon',
  title: 'Coming soon row',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Heading',
      type: 'string',
      description: 'e.g. "ChatGPT, Gemini, n8n, Lovable and more".',
      validation: (r) => r.required().max(120),
    }),
    defineField({
      name: 'subtitle',
      title: 'Line underneath',
      type: 'text',
      rows: 2,
      validation: (r) => r.required().max(200),
    }),
  ],
  preview: { prepare: () => ({ title: 'Coming soon row' }) },
})
