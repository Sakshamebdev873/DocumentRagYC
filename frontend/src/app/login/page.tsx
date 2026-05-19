"use client";

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
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_25%),linear-gradient(180deg,#020617_0%,#111827_50%,#020617_100%)] px-6 py-12 text-white">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[32px] border border-white/10 bg-white/6 p-8 shadow-2xl backdrop-blur animate-[rise_0.8s_ease] md:p-10">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Secure access</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Sign in to your enterprise knowledge workspace</h1>
          <p className="mt-4 max-w-xl text-base leading-8 text-zinc-300">
            Your backend expects AES-obfuscated request payloads and returns encrypted responses. This
            frontend is already wired to that flow.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <Feature title="JWT" text="One-day session token" />
            <Feature title="RBAC" text="Admin and employee roles" />
            <Feature title="Secure" text="Encrypted payload transport" />
          </div>
        </section>

        <section className="rounded-[32px] border border-cyan-400/15 bg-slate-950/70 p-8 shadow-2xl backdrop-blur animate-[rise_1s_ease] md:p-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm text-zinc-300">Email</label>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                required
                className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 outline-none transition focus:border-cyan-300/40 focus:bg-white/10"
                placeholder="admin@company.com"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-zinc-300">Password</label>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                required
                className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 outline-none transition focus:border-cyan-300/40 focus:bg-white/10"
                placeholder="********"
              />
            </div>
            {error ? <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}
            <button
              disabled={loading}
              className="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition duration-300 hover:scale-[1.01] hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
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
    <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
      <p className="font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-7 text-zinc-400">{text}</p>
    </div>
  );
}
