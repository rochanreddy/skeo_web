import { StarterPage, starterMeta, VARIANTS } from '../ai-starter/StarterPage'

/** /campaign/ai-starter-lite: the same page without the video. Not indexed (see starterMeta). */
export const generateMetadata = () => starterMeta(VARIANTS.lite.path)

export default function Page() {
  return <StarterPage variant={VARIANTS.lite} />
}
