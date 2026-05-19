"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
import { getPendingWorkflows, runQuery, updateWorkflowAction } from "@/requests";
import { useSession } from "@/lib/useSession";
import type { WorkflowDraft } from "@/lib/types";

export default function DashboardPage() {
  const { ready, user, token } = useSession();
  const [query, setQuery] = useState("");
  const [drafts, setDrafts] = useState<WorkflowDraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !token) return;
    void refreshDrafts(token);
  }, [ready, token]);

  async function refreshDrafts(authToken: string) {
    try {
      const data = await getPendingWorkflows(authToken);
      setDrafts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load drafts");
    }
  }

  async function submitQuery(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const draft = await runQuery(query, token);
      setMessage(`Draft created: ${draft.draftType}`);
      setQuery("");
      await refreshDrafts(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(id: string, action: "EXECUTE" | "DISCARD") {
    if (!token) return;

    setError(null);
    try {
      await updateWorkflowAction(id, action, token);
      await refreshDrafts(token);
      setMessage(`Draft ${action === "EXECUTE" ? "executed" : "discarded"}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    }
  }

  if (!ready) return null;

  return (
    <AppShell user={user}>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <GlassCard
          title="Ask the knowledge engine"
          subtitle="Submit a secure prompt. The backend will create a human-review workflow draft from permitted document context."
        >
          <form onSubmit={submitQuery} className="space-y-4">
            <textarea
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              required
              rows={6}
              placeholder="Draft a regulatory summary for our HR retention policy changes..."
              className="w-full rounded-3xl border border-white/10 bg-black/20 px-5 py-4 text-sm text-white outline-none transition focus:border-cyan-300/40 focus:bg-white/8"
            />
            <div className="flex flex-wrap items-center gap-3">
              <button
                disabled={loading}
                className="rounded-full bg-cyan-400 px-5 py-3 font-medium text-slate-950 transition duration-300 hover:scale-[1.02] hover:bg-cyan-300 disabled:opacity-70"
              >
                {loading ? "Generating draft..." : "Generate workflow draft"}
              </button>
              {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
              {error ? <p className="text-sm text-rose-300">{error}</p> : null}
            </div>
          </form>
        </GlassCard>

        <GlassCard title="Session context" subtitle="Your current access scope determines which document chunks can be retrieved.">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <Stat label="Role" value={user?.role ?? "-"} />
            <Stat label="Department" value={user?.department ?? "Global"} />
            <Stat label="Pending drafts" value={String(drafts.length)} />
          </div>
        </GlassCard>
      </div>

      <div className="mt-6">
        <GlassCard title="Pending workflow drafts" subtitle="Review generated outputs and choose whether to execute or discard them.">
          <div className="grid gap-4">
            {drafts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/15 bg-black/20 p-6 text-sm text-zinc-400">
                No pending drafts yet. Create one from the query panel.
              </div>
            ) : (
              drafts.map((draft, index) => (
                <article
                  key={draft.id}
                  className="rounded-3xl border border-white/10 bg-black/20 p-5 animate-[rise_0.8s_ease]"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">{draft.draftType}</p>
                        <h3 className="mt-2 text-xl font-semibold">{String(draft.draftContent.title ?? "Generated draft")}</h3>
                      </div>
                      <p className="text-sm leading-7 text-zinc-300">{String(draft.draftContent.content ?? draft.query)}</p>
                      {Array.isArray(draft.draftContent.actionItems) && draft.draftContent.actionItems.length > 0 ? (
                        <ul className="space-y-2 text-sm text-zinc-400">
                          {draft.draftContent.actionItems.map((item, itemIndex) => (
                            <li key={`${draft.id}-${itemIndex}`} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                              {item}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 gap-3">
                      <button
                        onClick={() => handleAction(draft.id, "EXECUTE")}
                        className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-medium text-slate-950 transition hover:scale-[1.02]"
                      >
                        Execute
                      </button>
                      <button
                        onClick={() => handleAction(draft.id, "DISCARD")}
                        className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:border-rose-300/40 hover:bg-rose-400/10"
                      >
                        Discard
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
