import { ChatGptMark, ClaudeMark, GeminiMark, LovableMark, N8nMark } from '@/components/tools/marks'
import { hasToolLogo, ToolLogoMark } from '../everything-ai/ToolLogos'

/**
 * A tool's logo, as the main campaign page draws it: the site's own marks for
 * the five it has, ToolLogos for the rest, a monogram otherwise. `id` keeps
 * the Lovable gradient's ids unique when the same mark appears twice.
 */
export function ToolMark({ name, mark, className, id = '' }: { name: string; mark?: string; className?: string; id?: string }) {
  switch (mark) {
    case 'claude':
      return <ClaudeMark className={className} />
    case 'chatgpt':
      return <ChatGptMark className={`${className ?? ''} kit-mono`} />
    case 'gemini':
      return <GeminiMark className={className} />
    case 'n8n':
      return <N8nMark className={className} />
    case 'lovable':
      return <LovableMark className={className} idPrefix={`kit-lovable-${id}`} />
    default:
      if (mark && hasToolLogo(mark)) return <ToolLogoMark mark={mark} className={className} />
      return (
        <span className={`${className ?? ''} kit-monogram`} aria-hidden="true">
          {name[0]}
        </span>
      )
  }
}
