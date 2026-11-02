/**
 * An edition in four facts, above its lineup: The Model, Access Granted and
 * PySanAntonio all use it, so DEVSA's conferences read as one family where the
 * facts are concerned and differ only in brand.
 *
 * More Human Than Human uses it too.
 *
 * Each page builds its facts from its own data files and passes them in. Large
 * value, small label under it, as a <dl>; two columns on a phone, and one
 * per fact from md (four, or three for More Human Than Human).
 */
export function ConferenceFacts({ facts }: { facts: { value: string; label: string }[] }) {
  return (
    <section className="page-shell pb-14 md:pb-20">
      <dl className={`grid grid-cols-2 gap-x-6 gap-y-8 border-y border-white/10 py-8 md:py-10 ${facts.length === 3 ? "md:grid-cols-3" : "md:grid-cols-4"}`}>
        {facts.map((f) => (
          <div key={f.label} className="min-w-0">
            <dt className="sr-only">{f.label}</dt>
            <dd className="text-balance font-sans text-xl font-black leading-tight tracking-[-0.01em] text-white md:text-2xl">
              {f.value}
            </dd>
            <dd className="mt-1.5 text-sm text-white/55">{f.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
