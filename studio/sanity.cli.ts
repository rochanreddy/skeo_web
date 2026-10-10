import { defineCliConfig } from 'sanity/cli'
import { dataset, projectId } from './env'

// `npm run deploy` publishes the Studio to https://skeo.sanity.studio.
export default defineCliConfig({
  api: { projectId, dataset },
  studioHost: 'skeo',
})
