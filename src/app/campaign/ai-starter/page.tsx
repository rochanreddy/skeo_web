import { StarterPage, starterMeta, VARIANTS } from './StarterPage'

/** /campaign/ai-starter: the simple page, brown theme, with the walkthrough video. Not indexed (see starterMeta). */
export const generateMetadata = () => starterMeta(VARIANTS.main.path)

export default function Page() {
  return <StarterPage variant={VARIANTS.main} />
}
