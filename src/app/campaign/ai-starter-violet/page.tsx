import { StarterPage, starterMeta, VARIANTS } from '../ai-starter/StarterPage'

/** /campaign/ai-starter-violet: the same page in the violet theme. Not indexed (see starterMeta). */
export const generateMetadata = () => starterMeta(VARIANTS.violet.path)

export default function Page() {
  return <StarterPage variant={VARIANTS.violet} />
}
