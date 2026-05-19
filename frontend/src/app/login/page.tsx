"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, saveSession } from "@/requests";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const session = await login(email, password);
      saveSession(session);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="theme-shell flex min-h-screen items-center justify-center px-5 py-8 text-[#171326]">
      <div className="grid w-full max-w-7xl gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="theme-panel overflow-hidden rounded-[36px] p-6 shadow-[0_24px_80px_rgba(35,28,57,0.08)] md:p-8">
          <div className="rounded-[30px] bg-[linear-gradient(180deg,#f4efe7_0%,#ebe3d9_100%)] p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm uppercase tracking-[0.35em] text-[#746b8d]">Secure access</p>
              <Link href="/" className="theme-button-secondary px-4 py-2 text-sm">
                Back to homepage
              </Link>
            </div>
            <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight text-[#171326] sm:text-6xl">
              Sign in to your internal AI copilot for engineering and legal knowledge.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#665f6b]">
              Search internal documents, review generated drafts, and approve the answers your teams can trust.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <Feature title="Role-aware" text="Scoped by admin, employee, and department" />
              <Feature title="Grounded" text="Answers stay tied to internal documents" />
              <Feature title="Reviewable" text="Execute or discard every workflow draft" />
            </div>
          </div>
        </section>

        <section className="theme-dark-card rounded-[36px] p-6 shadow-[0_24px_70px_rgba(24,18,40,0.22)] md:p-8">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.35em] text-white/60">Sign in</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Access your knowledge command center</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm text-white/70">Email</label>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                required
                className="w-full rounded-[22px] border border-white/10 bg-white/7 px-4 py-3 text-white outline-none transition focus:border-white/20 focus:bg-white/10"
                placeholder="admin@documentrag.dev"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/70">Password</label>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                required
                className="w-full rounded-[22px] border border-white/10 bg-white/7 px-4 py-3 text-white outline-none transition focus:border-white/20 focus:bg-white/10"
                placeholder="********"
              />
            </div>
            {error ? <p className="rounded-[22px] border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</p> : null}
            <button disabled={loading} className="theme-button-primary w-full px-4 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-70">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="theme-panel rounded-[24px] p-4">
      <p className="font-semibold text-[#171326]">{title}</p>
      <p className="mt-2 text-sm leading-7 text-[#6d6773]">{text}</p>
    </div>
  );
}
