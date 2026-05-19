"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
import { getPendingWorkflows, runQuery, updateWorkflowAction } from "@/requests";
import { useSession } from "@/lib/useSession";
import type { ApprovedAnswer, WorkflowDraft } from "@/lib/types";

export default function DashboardPage() {
  const { ready, user, token } = useSession();
  const [query, setQuery] = useState("");
  const [drafts, setDrafts] = useState<WorkflowDraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [latestApproved, setLatestApproved] = useState<ApprovedAnswer | null>(null);

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
    setLatestApproved(null);

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
      const result = await updateWorkflowAction(id, action, token);
      await refreshDrafts(token);

      if (action === "EXECUTE") {
        setLatestApproved(result.approvedAnswer);
        setMessage("Draft approved and saved as final answer.");
      } else {
        setLatestApproved(null);
        setMessage("Draft discarded and recorded in workflow history.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    }
  }

  if (!ready) return null;

  return (
    <AppShell user={user}>
      <div className="grid gap-4 sm:gap-5 xl:grid-cols-[1.15fr_0.85fr] xl:gap-6">
        <GlassCard
          title="Engineering knowledge workspace"
          subtitle="Ask about runbooks, onboarding docs, API conventions, incident playbooks, and internal policies."
        >
          <form onSubmit={submitQuery} className="grid gap-4">
            <textarea
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ask about deployment steps, incident escalation, remote work policy, or API auth conventions"
              className="min-h-[180px] rounded-[28px] border border-white/50 bg-white/70 px-5 py-4 text-base text-[#171326] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none transition focus:border-[#171326]/20 focus:ring-2 focus:ring-[#171326]/10"
              required
            />
            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" disabled={loading} className="theme-button-primary px-6 py-3 text-sm font-medium disabled:opacity-70">
                {loading ? "Generating..." : "Create review draft"}
              </button>
              <span className="text-sm text-[#6d6773]">Human review is required before an answer becomes trusted knowledge.</span>
            </div>
          </form>

          {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}
          {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}
          {latestApproved ? (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link href="/answers" className="theme-button-secondary px-5 py-2.5 text-sm">
                View approved answers
              </Link>
              <p className="text-sm text-[#5a5362]">Latest saved answer: {latestApproved.title}</p>
            </div>
          ) : null}
        </GlassCard>

        <GlassCard title="Pending drafts" subtitle="Review drafts before they become trusted answers for your team.">
          <div className="grid gap-3 sm:gap-4">
            {drafts.length === 0 ? (
              <div className="theme-panel rounded-[24px] p-5 text-sm text-[#6d6773] sm:rounded-[28px] sm:p-6">
                No pending drafts. Ask a new engineering question to start a review.
              </div>
            ) : (
              drafts.map((draft) => (
                <article key={draft.id} className="theme-panel rounded-[26px] p-4 sm:p-5">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[#7a7383] sm:text-xs sm:tracking-[0.3em]">{draft.draftType}</p>
                  <h3 className="mt-2 text-lg font-semibold text-[#171326]">{String(draft.draftContent.title ?? draft.query)}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#5c5664]">{String(draft.draftContent.content ?? draft.query)}</p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <button onClick={() => handleAction(draft.id, "EXECUTE")} className="theme-button-primary px-5 py-2.5 text-sm font-medium">
                      Execute
                    </button>
                    <button onClick={() => handleAction(draft.id, "DISCARD")} className="theme-button-secondary px-5 py-2.5 text-sm font-medium">
                      Discard
                    </button>
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
