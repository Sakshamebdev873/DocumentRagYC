"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
import { getPendingWorkflows, updateWorkflowAction } from "@/requests";
import { useSession } from "@/lib/useSession";
import type { WorkflowDraft } from "@/lib/types";

export default function MonitorPage() {
  const { ready, user, token } = useSession();
  const [drafts, setDrafts] = useState<WorkflowDraft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !token) return;
    void loadDrafts(token);
  }, [ready, token]);

  async function loadDrafts(authToken: string) {
    try {
      const pending = await getPendingWorkflows(authToken);
      setDrafts(pending);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workflows");
    }
  }

  async function act(id: string, action: "EXECUTE" | "DISCARD") {
    if (!token) return;
    try {
      await updateWorkflowAction(id, action, token);
      setMessage(`Workflow ${action.toLowerCase()}d.`);
      await loadDrafts(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update workflow");
    }
  }

  if (!ready) return null;

  return (
    <AppShell user={user}>
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <GlassCard title="Operational summary" subtitle="Lightweight observability for the human review loop.">
          <div className="grid gap-4">
            <Metric label="Pending drafts" value={String(drafts.length)} />
            <Metric label="Mode" value="Human-in-the-loop" />
            <Metric label="Action endpoint" value="POST /workflow/:id/action" />
          </div>
          {message ? <p className="mt-4 text-sm text-emerald-300">{message}</p> : null}
          {error ? <p className="mt-2 text-sm text-rose-300">{error}</p> : null}
        </GlassCard>

        <GlassCard title="Draft queue" subtitle="Cards animate in and let reviewers process pending workflows directly.">
          <div className="grid gap-4">
            {drafts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/15 bg-black/20 p-6 text-sm text-zinc-400">
                Queue is empty.
              </div>
            ) : (
              drafts.map((draft, index) => (
                <div
                  key={draft.id}
                  className="rounded-3xl border border-white/10 bg-black/20 p-5 animate-[rise_0.8s_ease]"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">{draft.draftType}</p>
                      <h3 className="mt-2 text-lg font-semibold">{String(draft.draftContent.title ?? draft.query)}</h3>
                      <p className="mt-2 text-sm leading-7 text-zinc-400">Created {new Date(draft.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => act(draft.id, "EXECUTE")} className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-medium text-slate-950 transition hover:scale-[1.02]">Execute</button>
                      <button onClick={() => act(draft.id, "DISCARD")} className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium transition hover:border-rose-300/40 hover:bg-rose-400/10">Discard</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-2 text-xl font-semibold break-words">{value}</p>
    </div>
  );
}
