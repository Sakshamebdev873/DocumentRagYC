"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
import { getAdminPendingWorkflows, updateAdminWorkflowAction } from "@/requests";
import { useSession } from "@/lib/useSession";
import type { ApprovedAnswer, WorkflowDraft } from "@/lib/types";

export default function MonitorPage() {
  const { ready, user, token } = useSession({ requireAdmin: true });
  const [drafts, setDrafts] = useState<WorkflowDraft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [latestApproved, setLatestApproved] = useState<ApprovedAnswer | null>(null);

  useEffect(() => {
    if (!ready || !token) return;
    void loadDrafts(token);
  }, [ready, token]);

  async function loadDrafts(authToken: string) {
    try {
      const pending = await getAdminPendingWorkflows(authToken);
      setDrafts(pending);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workflows");
    }
  }

  async function act(id: string, action: "EXECUTE" | "DISCARD") {
    if (!token) return;
    try {
      const result = await updateAdminWorkflowAction(id, action, token);
      if (action === "EXECUTE") {
        setLatestApproved(result.approvedAnswer);
        setMessage("Draft approved and saved as final answer.");
      } else {
        setLatestApproved(null);
        setMessage("Draft discarded and kept only in workflow history.");
      }
      await loadDrafts(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update workflow");
    }
  }

  if (!ready) return null;

  return (
    <AppShell user={user}>
      <div className="grid gap-4 sm:gap-5 xl:grid-cols-[0.8fr_1.2fr] xl:gap-6">
        <GlassCard title="Operational summary" subtitle="Approve grounded drafts into trusted engineering answers or reject weak ones before teams rely on them.">
          <div className="grid gap-3 sm:gap-4">
            <Metric label="Pending drafts" value={String(drafts.length)} />
            <Metric label="Mode" value="Human-reviewed approvals" />
            <Metric label="Final output" value="Approved answer" />
          </div>
          {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}
          {latestApproved ? <p className="mt-2 text-sm text-[#5c5664]">Latest approved answer: {latestApproved.title}</p> : null}
          {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}
        </GlassCard>

        <GlassCard title="Draft queue" subtitle="Review pending answers for runbooks, API docs, incident guidance, and internal policy questions.">
          <div className="grid gap-3 sm:gap-4">
            {drafts.length === 0 ? (
              <div className="theme-panel rounded-[24px] p-5 text-sm text-[#6d6773] sm:rounded-[28px] sm:p-6">
                Queue is empty.
              </div>
            ) : (
              drafts.map((draft, index) => (
                <div
                  key={draft.id}
                  className="theme-dark-card rounded-[24px] p-4 animate-[rise_0.8s_ease] sm:rounded-[28px] sm:p-5"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-white/55 sm:text-xs sm:tracking-[0.3em]">{draft.draftType}</p>
                      <h3 className="mt-2 text-base font-semibold text-white sm:text-lg">{String(draft.draftContent.title ?? draft.query)}</h3>
                      <p className="mt-2 text-sm leading-7 text-white/65">Created {new Date(draft.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto lg:flex-col xl:flex-row">
                      <button onClick={() => act(draft.id, "EXECUTE")} className="theme-button-secondary w-full px-4 py-2.5 text-sm font-medium sm:w-auto">
                        Execute
                      </button>
                      <button onClick={() => act(draft.id, "DISCARD")} className="w-full rounded-full border border-white/15 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/8 sm:w-auto">
                        Discard
                      </button>
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
    <div className="theme-panel rounded-[20px] p-4 sm:rounded-[24px] sm:p-5">
      <p className="text-sm text-[#756e7a]">{label}</p>
      <p className="mt-2 break-words text-lg font-semibold text-[#171326] sm:text-xl">{value}</p>
    </div>
  );
}
