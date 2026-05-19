"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
import { LoadingGrid } from "@/components/LoadingCard";
import { useSession } from "@/lib/useSession";
import type { ApprovedAnswer } from "@/lib/types";
import { getApprovedAnswers } from "@/requests";

export default function AdminAnswersPage() {
  const { ready, user, token } = useSession({ requireAdmin: true });
  const [answers, setAnswers] = useState<ApprovedAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !token) return;
    void loadAnswers(token);
  }, [ready, token]);

  async function loadAnswers(authToken: string) {
    setLoading(true);
    setError(null);

    try {
      const data = await getApprovedAnswers(authToken);
      setAnswers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load approved answers");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) return null;

  return (
    <AppShell user={user}>
      <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <GlassCard title="Approved answer oversight" subtitle="Review the final answers your teams can rely on across engineering and legal workflows.">
          <div className="grid gap-4">
            <Metric label="Visible approved answers" value={String(answers.length)} />
            <Metric label="Review layer" value="Human-approved" />
            <Metric label="Audience" value="Admin oversight" />
          </div>
          {error ? <p className="mt-4 text-sm text-rose-700">{error}</p> : null}
        </GlassCard>

        <GlassCard title="Approved answers" subtitle="A cleaner admin view of final answers promoted from workflow drafts.">
          {loading ? (
            <LoadingGrid count={3} dark />
          ) : answers.length === 0 ? (
            <div className="theme-panel rounded-[28px] p-6 text-sm text-[#6d6773]">No approved answers have been created yet.</div>
          ) : (
            <div className="space-y-4">
              {answers.map((answer) => (
                <article
                  key={answer.id}
                  className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(29,23,46,0.96),rgba(18,14,31,0.96))] p-5 shadow-[0_20px_50px_rgba(16,12,28,0.22)]"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">{answer.draftType}</p>
                      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">{answer.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-white/60">From query: {answer.query}</p>
                    </div>

                    <div className="w-full max-w-[300px] shrink-0 rounded-[24px] bg-white/8 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Approval details</p>
                      <div className="mt-3 space-y-2 text-sm text-white/72">
                        <p>Approved: {new Date(answer.approvedAt).toLocaleString()}</p>
                        <p>Approved by: {answer.approvedByRole}</p>
                        <p>Department: {answer.department ?? "All departments"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[24px] bg-white/6 px-5 py-5 text-[15px] leading-8 text-white/76 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                    {answer.content}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2.5">
                    <span className="rounded-full border border-[#3d6f50] bg-[#163224] px-4 py-2 text-xs font-semibold text-[#d6f2df]">
                      {answer.status}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-semibold text-white/72">
                      Role: {answer.allowedRole}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-semibold text-white/72">
                      Sources: {answer.sourceChunks.length}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
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
