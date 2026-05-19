"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
import { LoadingGrid } from "@/components/LoadingCard";
import { useSession } from "@/lib/useSession";
import type { ApprovedAnswer } from "@/lib/types";
import { getApprovedAnswers } from "@/requests";

export default function AnswersPage() {
  const { ready, user, token } = useSession();
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
      <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <GlassCard title="Trusted answer library" subtitle="Human-approved answers your team can reuse with confidence.">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <Stat label="Approved answers" value={String(answers.length)} />
            <Stat label="Access scope" value={user?.department ?? "Cross-team"} />
            <Stat label="Review model" value="Human-approved" />
            <Stat label="Primary use" value="Engineering knowledge" />
          </div>
          {error ? <p className="mt-4 text-sm text-rose-700">{error}</p> : null}
        </GlassCard>

        <GlassCard title="Approved answers" subtitle="Final answers for runbooks, onboarding docs, policies, and internal developer guidance.">
          {loading ? (
            <LoadingGrid count={3} />
          ) : answers.length === 0 ? (
            <div className="theme-panel rounded-[28px] p-6 text-sm text-[#6d6773]">
              No approved answers yet. Review and execute a draft to save trusted knowledge here.
            </div>
          ) : (
            <div className="space-y-4">
              {answers.map((answer) => (
                <article
                  key={answer.id}
                  className="rounded-[30px] border border-white/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,242,236,0.94))] p-5 shadow-[0_18px_42px_rgba(27,20,41,0.08)]"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] uppercase tracking-[0.3em] text-[#7a7383]">{answer.draftType}</p>
                      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#171326]">{answer.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-[#6d6773]">From query: {answer.query}</p>
                    </div>

                    <div className="w-full max-w-[280px] shrink-0 rounded-[24px] bg-white/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-[#746b8d]">Approval details</p>
                      <div className="mt-3 space-y-2 text-sm text-[#5c5664]">
                        <p>Approved: {new Date(answer.approvedAt).toLocaleString()}</p>
                        <p>Approved by: {answer.approvedByRole}</p>
                        <p>Department: {answer.department ?? "All departments"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[24px] bg-white/72 px-5 py-5 text-[15px] leading-8 text-[#4f4955] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
                    {answer.content}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2.5">
                    <span className="rounded-full border border-[#d7eadb] bg-[#eff8f1] px-4 py-2 text-xs font-semibold text-[#245237]">
                      {answer.status}
                    </span>
                    <span className="rounded-full border border-[#ddd4e6] bg-white/85 px-4 py-2 text-xs font-semibold text-[#5f596d]">
                      Role: {answer.allowedRole}
                    </span>
                    <span className="rounded-full border border-[#ddd4e6] bg-white/85 px-4 py-2 text-xs font-semibold text-[#5f596d]">
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="theme-panel rounded-[24px] p-5">
      <p className="text-sm text-[#756e7a]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#171326]">{value}</p>
    </div>
  );
}
