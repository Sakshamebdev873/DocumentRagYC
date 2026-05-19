"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
import { getApprovedAnswerByDraftId, getWorkflowHistory } from "@/requests";
import { useSession } from "@/lib/useSession";
import type { ApprovedAnswer, WorkflowDraft } from "@/lib/types";

const statusTone: Record<WorkflowDraft["status"], string> = {
  PENDING: "border-[#f1c37d] bg-[#f1c37d]/18 text-[#5f4306]",
  EXECUTED: "border-[#8fd0a0] bg-[#8fd0a0]/18 text-[#124326]",
  DISCARDED: "border-[#db9aa1] bg-[#db9aa1]/20 text-[#5c1f27]",
};

const filters: Array<{ key: "ALL" | WorkflowDraft["status"]; label: string }> = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "EXECUTED", label: "Executed" },
  { key: "DISCARDED", label: "Discarded" },
];

export default function WorkflowHistoryPage() {
  const { ready, user, token } = useSession();
  const [drafts, setDrafts] = useState<WorkflowDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]["key"]>("ALL");
  const [answerLinks, setAnswerLinks] = useState<Record<string, ApprovedAnswer | null>>({});

  useEffect(() => {
    if (!ready || !token) return;
    void loadHistory(token);
  }, [ready, token]);

  async function loadHistory(authToken: string) {
    setLoading(true);
    setError(null);

    try {
      const history = await getWorkflowHistory(authToken);
      setDrafts(history);

      const executedDrafts = history.filter((draft) => draft.status === "EXECUTED");
      const entries = await Promise.all(
        executedDrafts.map(async (draft) => {
          try {
            const answer = await getApprovedAnswerByDraftId(draft.id, authToken);
            return [draft.id, answer] as const;
          } catch {
            return [draft.id, null] as const;
          }
        }),
      );
      setAnswerLinks(Object.fromEntries(entries));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workflow history");
    } finally {
      setLoading(false);
    }
  }

  const summary = useMemo(() => {
    return drafts.reduce(
      (accumulator, draft) => {
        accumulator.total += 1;
        accumulator[draft.status.toLowerCase() as "pending" | "executed" | "discarded"] += 1;
        return accumulator;
      },
      { total: 0, pending: 0, executed: 0, discarded: 0 },
    );
  }, [drafts]);

  const visibleDrafts = useMemo(() => {
    if (activeFilter === "ALL") {
      return drafts;
    }
    return drafts.filter((draft) => draft.status === activeFilter);
  }, [activeFilter, drafts]);

  if (!ready) return null;

  return (
    <AppShell user={user}>
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <GlassCard title="Workflow history" subtitle="Track every draft, approval, and rejection across your engineering knowledge workflow.">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <Stat label="Total drafts" value={String(summary.total)} />
            <Stat label="Pending" value={String(summary.pending)} />
            <Stat label="Executed" value={String(summary.executed)} />
            <Stat label="Discarded" value={String(summary.discarded)} />
          </div>
          {error ? <p className="mt-4 text-sm text-rose-700">{error}</p> : null}
        </GlassCard>

        <GlassCard title="Timeline" subtitle="Review history stays here. Trusted final knowledge lives in approved answers.">
          <div className="sticky top-3 z-10 -mx-1 mb-4 overflow-x-auto px-1 pb-2">
            <div className="flex min-w-max gap-2">
              {filters.map((filter) => {
                const active = activeFilter === filter.key;
                return (
                  <button
                    key={filter.key}
                    onClick={() => setActiveFilter(filter.key)}
                    className={active ? "theme-button-primary px-4 py-2 text-sm" : "theme-button-secondary px-4 py-2 text-sm"}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="theme-panel rounded-[28px] p-6 text-sm text-[#6d6773]">Loading workflow history...</div>
          ) : visibleDrafts.length === 0 ? (
            <div className="theme-panel rounded-[28px] p-6 text-sm text-[#6d6773]">No workflow history matches this filter yet.</div>
          ) : (
            <div className="space-y-4">
              {visibleDrafts.map((draft, index) => {
                const linkedAnswer = answerLinks[draft.id];

                return (
                  <article
                    key={draft.id}
                    className="theme-panel rounded-[30px] p-4 sm:p-5 animate-[rise_0.8s_ease]"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <p className="text-xs uppercase tracking-[0.3em] text-[#7a7383]">{draft.draftType}</p>
                            <span className={`rounded-full border px-3 py-1 text-xs font-medium ${statusTone[draft.status]}`}>
                              {draft.status}
                            </span>
                          </div>
                          <h3 className="mt-3 text-xl font-semibold text-[#171326]">{String(draft.draftContent.title ?? draft.query)}</h3>
                        </div>
                        <div className="theme-chip rounded-[20px] px-4 py-3 text-sm text-[#5c5664] sm:min-w-[220px]">
                          <p>Created: {new Date(draft.createdAt).toLocaleString()}</p>
                          <p className="mt-1">Updated: {new Date(draft.updatedAt).toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="rounded-[24px] bg-white/55 px-4 py-4 text-sm leading-7 text-[#4f4955] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                        {String(draft.draftContent.content ?? draft.query)}
                      </div>

                      {draft.status === "EXECUTED" && linkedAnswer ? (
                        <div className="flex flex-wrap items-center gap-3 rounded-[22px] bg-[#ecf7ee] px-4 py-3 text-sm text-[#124326]">
                          <span>Approved and saved as a trusted final answer.</span>
                          <Link href="/answers" className="theme-button-secondary px-4 py-2 text-sm">
                            View approved answers
                          </Link>
                        </div>
                      ) : null}

                      {draft.status === "DISCARDED" ? (
                        <div className="rounded-[22px] bg-[#fff1f2] px-4 py-3 text-sm text-[#7a2d38]">
                          {String(draft.draftContent.reviewOutcome ?? "Rejected during review")}
                          {draft.draftContent.reviewActorRole ? ` by ${String(draft.draftContent.reviewActorRole)}` : ""}
                          {draft.draftContent.reviewedAt ? ` on ${new Date(String(draft.draftContent.reviewedAt)).toLocaleString()}` : ""}
                        </div>
                      ) : null}

                      {Array.isArray(draft.draftContent.actionItems) && draft.draftContent.actionItems.length > 0 ? (
                        <div className="grid gap-2 sm:grid-cols-2">
                          {draft.draftContent.actionItems.map((item, itemIndex) => (
                            <div key={`${draft.id}-${itemIndex}`} className="rounded-[20px] bg-[#171326] px-4 py-3 text-sm text-white/85 shadow-[0_14px_28px_rgba(23,19,38,0.12)]">
                              {item}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </GlassCard>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="theme-panel rounded-[24px] p-5">
      <p className="text-sm text-[#756e7a]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#171326]">{value}</p>
    </div>
  );
}
