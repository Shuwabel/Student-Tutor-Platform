import { Fragment } from 'react'

/** Inline `code` only; everything else is plain text, so no HTML is ever injected. */
function inline(text: string) {
  return text.split(/(`[^`]+`)/g).map((part, i) =>
    part.startsWith('`') && part.endsWith('`') && part.length > 2 ? <code key={i}>{part.slice(1, -1)}</code> : <Fragment key={i}>{part}</Fragment>,
  )
}

/** Renders lesson text written in the light markup described in lib/types.ts. */
export default function LessonBody({ body }: { body: string }) {
  const blocks = body.replace(/\r\n/g, '\n').split(/\n{2,}/)
  return (
    <div className="lesson text-[1.05rem] leading-relaxed">
      {blocks.map((raw, i) => {
        const block = raw.replace(/\s+$/, '')
        if (!block.trim()) return null
        const lines = block.split('\n')
        if (lines.every((l) => /^ {4}/.test(l))) return <pre key={i}>{lines.map((l) => l.slice(4)).join('\n')}</pre>
        if (block.startsWith('## ')) return <h2 key={i}>{inline(block.slice(3))}</h2>
        if (lines.every((l) => l.startsWith('- '))) return <ul key={i}>{lines.map((l, j) => <li key={j}>{inline(l.slice(2))}</li>)}</ul>
        if (block.startsWith('> ')) return <blockquote key={i}>{inline(lines.map((l) => l.replace(/^> ?/, '')).join(' '))}</blockquote>
        return <p key={i}>{inline(lines.join(' '))}</p>
      })}
    </div>
  )
}
