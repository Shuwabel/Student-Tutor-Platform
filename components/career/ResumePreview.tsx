import type { Resume } from '@/lib/types'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h3 className="border-b border-border pb-1 text-xs font-bold uppercase tracking-wide">{title}</h3>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  )
}

export default function ResumePreview({ resume: r }: { resume: Resume }) {
  const contact = [r.email, r.phone, r.location].filter(Boolean).join('  |  ')
  const exp = r.experience.filter((e) => e.role || e.org)
  const edu = r.education.filter((e) => e.school || e.degree)
  return (
    <article aria-label="Resume preview" className="rounded-md border border-border bg-card p-6 text-sm leading-relaxed">
      <h2 className="break-words text-2xl font-bold">{r.fullName || 'Your name'}</h2>
      {r.headline && <p className="text-muted-foreground">{r.headline}</p>}
      {contact && <p className="callno mt-1 break-words text-xs font-normal text-muted-foreground">{contact}</p>}
      {r.summary.trim() && (
        <Section title="Summary">
          <p className="whitespace-pre-line break-words">{r.summary}</p>
        </Section>
      )}
      {r.skills.length > 0 && (
        <Section title="Skills">
          <p className="break-words">{r.skills.join(', ')}</p>
        </Section>
      )}
      {exp.length > 0 && (
        <Section title="Experience">
          {exp.map((e, i) => (
            <div key={i}>
              <p className="font-semibold">{[e.role, e.org].filter(Boolean).join(', ')}</p>
              {e.years && <p className="text-xs text-muted-foreground">{e.years}</p>}
              {e.bullets.some((b) => b.trim()) && (
                <ul className="mt-1 list-disc space-y-0.5 pl-5">
                  {e.bullets.filter((b) => b.trim()).map((b, j) => <li key={j} className="break-words">{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </Section>
      )}
      {edu.length > 0 && (
        <Section title="Education">
          {edu.map((e, i) => (
            <div key={i}>
              <p className="font-semibold">{[e.degree, e.school].filter(Boolean).join(', ')}</p>
              {e.years && <p className="text-xs text-muted-foreground">{e.years}</p>}
            </div>
          ))}
        </Section>
      )}
    </article>
  )
}
