import Link from "next/link";

const featureCards = [
  {
    title: "Role-aware engineering retrieval",
    text: "Search onboarding docs, internal APIs, architecture notes, security policies, and runbooks with department-aware access controls.",
  },
  {
    title: "Human-reviewed AI answers",
    text: "Generate grounded drafts, route them through review, and approve only what your teams should trust.",
  },
  {
    title: "Approved internal knowledge",
    text: "Turn reviewed outputs into reusable final answers for platform, support, security, and product teams.",
  },
];

const highlights = [
  "Internal AI copilot",
  "Trusted final answers",
  "Role-aware retrieval",
  "Engineering team workflows",
];

export default function Home() {
  return (
    <main className="theme-shell min-h-screen px-4 py-5 text-[#171326] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <section className="theme-panel overflow-hidden rounded-[36px] p-4 shadow-[0_30px_90px_rgba(34,28,52,0.08)] md:p-5">
          <div className="rounded-[32px] bg-[linear-gradient(180deg,#f1ece4_0%,#ebe5dc_52%,#ddd6cf_100%)] p-6 md:p-8 lg:p-10">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#171326]/8 pb-4">
              <div className="flex items-center gap-2 text-sm font-medium text-[#171326]">
                <span className="text-lg">?</span>
                DocumentRag
              </div>
              <div className="hidden items-center gap-6 text-sm text-[#6a6370] md:flex">
                <span>Runbooks</span>
                <span>API Docs</span>
                <span>Reviews</span>
                <span>Security</span>
              </div>
              <Link href="/login" className="theme-button-primary px-5 py-2.5 text-sm">
                Launch Workspace
              </Link>
            </div>

            <div className="grid gap-8 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
              <div>
                <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-[#171326] sm:text-6xl lg:text-7xl">
                  Internal AI copilot for engineering knowledge.
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-[#675f6b]">
                  Search docs, review AI answers, and approve what teams can trust across onboarding, incidents, architecture, and internal support.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/login" className="theme-button-primary px-6 py-3 font-medium">
                    Enter secure workspace
                  </Link>
                  <Link href="/answers" className="theme-button-secondary px-6 py-3 font-medium">
                    View approved answers
                  </Link>
                </div>
              </div>

              <div className="rounded-[30px] bg-[radial-gradient(circle_at_center,_rgba(123,100,255,0.18),_transparent_28%),linear-gradient(180deg,#251d3f_0%,#171326_100%)] p-4 shadow-[0_30px_80px_rgba(23,19,38,0.2)]">
                <div className="grid min-h-[380px] content-end gap-4 rounded-[24px] border border-white/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-5">
                  {featureCards.map((card, index) => (
                    <article
                      key={card.title}
                      className="rounded-[24px] border border-white/7 bg-[rgba(255,255,255,0.04)] p-5 text-white animate-[slideUpFade_0.8s_ease]"
                      style={{ animationDelay: `${index * 120}ms` }}
                    >
                      <h2 className="text-xl font-semibold">{card.title}</h2>
                      <p className="mt-2 text-sm leading-7 text-white/68">{card.text}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="theme-panel rounded-[32px] p-6 md:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-[#7c7390]">Why software teams use DocumentRag</p>
                <h2 className="mt-3 text-4xl font-semibold text-[#171326]">A secure trust layer for internal engineering AI.</h2>
              </div>
              <Link href="/workflows" className="theme-button-secondary px-5 py-2.5 text-sm">
                Explore review history
              </Link>
            </div>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-[#6d6773]">
              Help employees answer questions like how to deploy a service, where incident escalation starts, which environments need approval, what the API auth convention is, and how remote work or support playbooks work internally.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {highlights.map((item, index) => (
              <div
                key={item}
                className={index % 2 === 0 ? "theme-panel rounded-[28px] p-5" : "theme-dark-card rounded-[28px] p-5"}
              >
                <p className={index % 2 === 0 ? "text-lg font-semibold text-[#171326]" : "text-lg font-semibold text-white"}>{item}</p>
                <p className={index % 2 === 0 ? "mt-2 text-sm leading-7 text-[#6d6773]" : "mt-2 text-sm leading-7 text-white/65"}>
                  Built for internal developer docs, incident runbooks, architecture decisions, support workflows, and secure knowledge reuse.
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
