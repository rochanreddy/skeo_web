import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * /campaign/everything-ai — the offer and the copy around it.
 *
 * The PRICE is not here: it is the "Everything AI — Early Access" plan under
 * Pricing & courses, because that is the number the checkout charges. Keeping
 * one copy of it means the page can never advertise one price and bill another.
 *
 * The limits match what the website accepts (src/lib/cms.ts). They are about
 * the layout as much as correctness: the hero is set for three short lines,
 * and a fourth paragraph in it would push the button below the fold.
 */

const line = (max: number) => defineArrayMember({ type: 'string', validation: (r) => r.required().max(max) })

export const campaign = defineType({
  name: 'campaign',
  title: 'Campaign — Everything AI',
  type: 'document',
  groups: [
    { name: 'offer', title: 'Offer', default: true },
    { name: 'hero', title: 'Top of page' },
    { name: 'pricing', title: 'Offer box' },
    { name: 'faq', title: 'FAQ' },
  ],
  fields: [
    defineField({
      name: 'endsAt',
      title: 'Offer ends',
      type: 'datetime',
      group: 'offer',
      description:
        'The countdown counts to this moment, and checkout stops selling Early Access after it. Set in India time.',
      options: { timeStep: 15 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'was',
      title: 'Original price (₹), shown struck through',
      type: 'number',
      group: 'offer',
      description: 'Must be higher than the Early Access price — the "% OFF" is worked out from the two.',
      validation: (r) =>
        r.required().integer().min(1).max(100000).custom(async (value, { getClient }) => {
          if (typeof value !== 'number') return true
          const price = await getClient({ apiVersion: '2025-02-19' }).fetch<number | null>(
            '*[_id in ["plan-earlyaccess", "drafts.plan-earlyaccess"]] | order(_updatedAt desc)[0].amount',
          )
          return typeof price === 'number' && value <= price
            ? `Must be more than the Early Access price (₹${price.toLocaleString('en-IN')}).`
            : true
        }),
    }),
    defineField({
      name: 'terms',
      title: 'Terms line',
      type: 'string',
      group: 'offer',
      description: 'Under the hero price, e.g. "One-time payment · Lifetime access".',
      validation: (r) => r.required().max(120),
    }),
    defineField({
      name: 'announcement',
      title: 'Top bar',
      type: 'object',
      group: 'offer',
      fields: [
        defineField({ name: 'lead', title: 'Label', type: 'string', validation: (r) => r.required().max(40) }),
        defineField({ name: 'cta', title: 'Button', type: 'string', validation: (r) => r.required().max(30) }),
      ],
    }),
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',
      group: 'hero',
      fields: [
        defineField({
          name: 'lines',
          title: 'Headline lines',
          type: 'array',
          of: [line(60)],
          description: 'One per line. The second is set in the accent colour. Up to 4.',
          validation: (r) => r.required().min(1).max(4),
        }),
        defineField({ name: 'lede', title: 'Paragraph', type: 'text', rows: 3, validation: (r) => r.required().max(300) }),
        defineField({ name: 'cta', title: 'Button', type: 'string', validation: (r) => r.required().max(30) }),
        defineField({
          name: 'checks',
          title: 'Ticks under the button',
          type: 'array',
          of: [line(40)],
          validation: (r) => r.required().min(1).max(6),
        }),
      ],
    }),
    defineField({
      name: 'valueStack',
      title: 'What the pass lists (hero card)',
      type: 'array',
      group: 'hero',
      of: [line(40)],
      description: 'Shown in two columns. Up to 12.',
      validation: (r) => r.required().min(1).max(12),
    }),
    defineField({
      name: 'pricing',
      title: 'Offer box',
      type: 'object',
      group: 'pricing',
      fields: [
        defineField({ name: 'plan', title: 'Plan name', type: 'string', validation: (r) => r.required().max(80) }),
        defineField({
          name: 'items',
          title: 'What is included',
          type: 'array',
          of: [line(40)],
          validation: (r) => r.required().min(1).max(14),
        }),
        defineField({ name: 'cta', title: 'Button', type: 'string', validation: (r) => r.required().max(30) }),
        defineField({ name: 'small', title: 'Small print', type: 'string', validation: (r) => r.required().max(120) }),
      ],
    }),
    defineField({
      name: 'faq',
      title: 'Questions',
      type: 'array',
      group: 'faq',
      description: 'Also published as FAQ markup for Google, word for word. Up to 12.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'faqItem',
          fields: [
            defineField({ name: 'q', title: 'Question', type: 'string', validation: (r) => r.required().max(200) }),
            defineField({ name: 'a', title: 'Answer', type: 'text', rows: 3, validation: (r) => r.required().max(600) }),
          ],
          preview: { select: { title: 'q', subtitle: 'a' } },
        }),
      ],
      validation: (r) => r.required().min(1).max(12),
    }),
  ],
  preview: { prepare: () => ({ title: 'Campaign — Everything AI' }) },
})
