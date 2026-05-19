"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
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
            <div className="theme-panel rounded-[28px] p-6 text-sm text-[#6d6773]">Loading approved answers...</div>
          ) : answers.length === 0 ? (
            <div className="theme-panel rounded-[28px] p-6 text-sm text-[#6d6773]">
              No approved answers yet. Review and execute a draft to save trusted knowledge here.
            </div>
          ) : (
            <div className="space-y-4">
              {answers.map((answer) => (
                <article key={answer.id} className="theme-panel rounded-[30px] p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-[#7a7383]">{answer.draftType}</p>
                      <h2 className="mt-3 text-xl font-semibold text-[#171326]">{answer.title}</h2>
                      <p className="mt-2 text-sm text-[#6d6773]">From query: {answer.query}</p>
                    </div>
                    <div className="theme-chip rounded-[20px] px-4 py-3 text-sm text-[#5c5664] sm:min-w-[240px]">
                      <p>Approved: {new Date(answer.approvedAt).toLocaleString()}</p>
                      <p className="mt-1">Approved by: {answer.approvedByRole}</p>
                      <p className="mt-1">Department: {answer.department ?? "All departments"}</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-[24px] bg-white/55 px-4 py-4 text-sm leading-7 text-[#4f4955] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                    {answer.content}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-[#5c5664]">
                    <span className="theme-chip rounded-full px-4 py-2">Status: {answer.status}</span>
                    <span className="theme-chip rounded-full px-4 py-2">Visible role: {answer.allowedRole}</span>
                    <span className="theme-chip rounded-full px-4 py-2">Sources: {answer.sourceChunks.length}</span>
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
