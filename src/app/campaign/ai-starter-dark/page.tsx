import { StarterPage, starterMeta, VARIANTS } from '../ai-starter/StarterPage'

/** /campaign/ai-starter-dark: the same page in the dark (charcoal) theme. Not indexed (see starterMeta). */
export const generateMetadata = () => starterMeta(VARIANTS.dark.path)

export default function Page() {
  return <StarterPage variant={VARIANTS.dark} />
}
