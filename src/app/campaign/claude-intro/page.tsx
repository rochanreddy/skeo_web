import { BundlePage, bundleMeta } from '../ai-bundle/BundlePage'

/**
 * /campaign/claude-intro: the Claude bundle landing page (ai-bundle/BundlePage).
 * The previous page is <EverythingAiLanding kind="claude" video /> from
 * ../everything-ai/Landing; to bring it back, render that here (git history).
 */
export const generateMetadata = () => bundleMeta('claude')

export default function ClaudeIntroPage() {
  return <BundlePage kind="claude" />
}
