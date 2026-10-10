import { defineField, defineType } from 'sanity'

/**
 * One thing skeo sells: a single tool course, a bundle, or the teams plan.
 *
 * There is exactly one document per plan, created by the seed script with a
 * fixed ID (plan-claude, plan-member, …). Editors cannot add or delete plans
 * here: a new course needs code — its logo, its checkout row, what the LMS
 * unlocks for it — so a plan that exists only in Sanity would be a price for
 * something nobody can receive.
 *
 * THE PRICE IS WHAT PEOPLE ARE CHARGED. The website's checkout reads it, so
 * the rules below are the same ones the website applies before using a value
 * (src/lib/cms.ts). A value that breaks them never reaches a buyer: the site
 * keeps the previous price instead.
 */

const MODULE_KEYS = ['claude', 'playbooks', 'library']

export const plan = defineType({
  name: 'plan',
  title: 'Plan',
  type: 'document',
  fields: [
    defineField({
      name: 'key',
      title: 'Plan key',
      type: 'string',
      readOnly: true,
      description: 'How the website and checkout know this plan. Set by the seed script; never changes.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'title',
      title: 'Name',
      type: 'string',
      description: 'Shown on the pricing card, in the cart, at checkout and on the receipt.',
      validation: (r) => r.required().max(80),
    }),
    defineField({
      name: 'eyebrow',
      title: 'Label above the name',
      type: 'string',
      description: 'Small capitals, e.g. "CLAUDE COURSE".',
      validation: (r) => r.max(40),
    }),
    defineField({
      name: 'amount',
      title: 'Price (₹)',
      type: 'number',
      description:
        'In rupees, whole numbers only. This is the amount charged at checkout. Visitors outside India see it converted to dollars.',
      hidden: ({ document }) => document?.key === 'teams',
      validation: (r) => [
        r.custom((value, { document }) => {
          if (document?.key === 'teams') return true
          if (typeof value !== 'number') return 'A price is required.'
          if (!Number.isInteger(value)) return 'Whole rupees only — no paise.'
          if (value < 1) return 'The price must be at least ₹1.'
          if (value > 100000) return 'The price cannot be more than ₹1,00,000.'
          return true
        }),
        // Not an error — just a second look before an extra zero goes live.
        r
          .custom((value) =>
            typeof value === 'number' && value >= 5000
              ? `₹${value.toLocaleString('en-IN')} is high for skeo. Check there is no extra zero before publishing.`
              : true,
          )
          .warning(),
      ],
    }),
    defineField({
      name: 'subtitle',
      title: 'One-line description',
      type: 'text',
      rows: 2,
      description: 'The line under the name in the tool list on the pricing card.',
      hidden: ({ document }) => !MODULE_KEYS.includes(String(document?.key)),
      validation: (r) => r.max(200),
    }),
    defineField({
      name: 'features',
      title: 'What is included',
      type: 'array',
      of: [{ type: 'string', validation: (r) => r.max(120) }],
      description: 'The ticked list on the pricing card. One short line each; up to 10.',
      validation: (r) => r.required().min(1).max(10),
    }),
  ],
  preview: {
    select: { title: 'title', amount: 'amount', key: 'key' },
    prepare: ({ title, amount, key }) => ({
      title: title || key,
      subtitle: key === 'teams' ? 'Custom pricing' : typeof amount === 'number' ? `₹${amount.toLocaleString('en-IN')}` : 'No price set',
    }),
  },
})
