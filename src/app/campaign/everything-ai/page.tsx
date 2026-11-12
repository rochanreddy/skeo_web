import { BundlePage, bundleMeta } from '../ai-bundle/BundlePage'

/**
 * /campaign/everything-ai: the bundle landing page (ai-bundle/BundlePage).
 * The previous page is EverythingAiLanding in ./Landing; to bring it back,
 * render <EverythingAiLanding /> here with its old metadata (git history).
 */
export const generateMetadata = () => bundleMeta('all')

export default function EverythingAiPage() {
  return <BundlePage kind="all" />
}
