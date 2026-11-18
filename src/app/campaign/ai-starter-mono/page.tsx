import { StarterPage, starterMeta, VARIANTS } from '../ai-starter/StarterPage'

/** /campaign/ai-starter-mono: the same page in black and white. Not indexed (see starterMeta). */
export const generateMetadata = () => starterMeta(VARIANTS.mono.path)

export default function Page() {
  return <StarterPage variant={VARIANTS.mono} />
}
