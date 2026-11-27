/** Typographic cover for projects without a screenshot: warm paper card with the title set large. */
export function ProjectCover({ title, tech }: { title: string; tech: string[] }) {
  return (
    <div
      aria-hidden
      className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8"
      style={{
        background:
          "radial-gradient(120% 90% at 0% 0%, color-mix(in oklab, var(--accent) 22%, transparent), transparent 60%), radial-gradient(90% 80% at 100% 100%, color-mix(in oklab, var(--accent-2) 26%, transparent), transparent 60%), var(--bg-2)",
      }}
    >
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{tech.slice(0, 3).join(" · ")}</span>
      <span className="font-serif text-4xl leading-[1.05] font-medium text-fg sm:text-5xl">{title}</span>
    </div>
  );
}
