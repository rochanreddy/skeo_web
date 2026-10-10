/**
 * The Sanity project skeo's content lives in. Not a secret — it is in every
 * Studio URL — so it is written here as the fallback, the way menler's Studio
 * does it: the hosted Studio (skeo.sanity.studio) is built without your local
 * environment, and has to know where to connect on its own.
 *
 * The website reads the same project from SANITY_PROJECT_ID (see src/lib/cms).
 */
export const projectId = process.env.SANITY_STUDIO_PROJECT_ID || '2f5ib3fj'
export const dataset = process.env.SANITY_STUDIO_DATASET || 'production'
