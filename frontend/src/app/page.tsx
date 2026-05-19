import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.2),_transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_50%,#020617_100%)] px-6 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] opacity-30" />
      <section className="relative z-10 w-full max-w-5xl rounded-[36px] border border-white/10 bg-white/6 p-8 shadow-2xl backdrop-blur md:p-12 animate-[rise_0.9s_ease]">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-cyan-300">DocumentRag platform</p>
            <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">
              Enterprise RAG, secure workflows, and modern human review.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
              This frontend mirrors your backend: login, query drafting, ingestion, RBAC user creation,
              and workflow approval with animated, glassmorphism-inspired UI.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/login"
                className="rounded-full bg-cyan-400 px-6 py-3 font-medium text-slate-950 transition duration-300 hover:scale-[1.02] hover:bg-cyan-300"
              >
                Open secure workspace
              </Link>
              <Link
                href="/dashboard"
                className="rounded-full border border-white/15 px-6 py-3 font-medium text-white transition duration-300 hover:border-cyan-300/40 hover:bg-white/8"
              >
                Preview dashboard
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            {[
              ["Auth", "Encrypted login and JWT session persistence"],
              ["Query", "Submit secure document requests for AI draft creation"],
              ["Workflow", "Approve or discard generated drafts with full context"],
              ["Admin", "Upload content and provision employees by department"],
            ].map(([title, text], index) => (
              <div
                key={title}
                className="rounded-3xl border border-white/10 bg-black/20 p-5 shadow-lg animate-[pulseGlow_5s_ease-in-out_infinite]"
                style={{ animationDelay: `${index * 180}ms` }}
              >
                <p className="text-lg font-semibold">{title}</p>
                <p className="mt-2 text-sm leading-7 text-zinc-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
