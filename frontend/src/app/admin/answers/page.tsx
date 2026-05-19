"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
import { useSession } from "@/lib/useSession";
import type { ApprovedAnswer } from "@/lib/types";
import { getAdminApprovedAnswers } from "@/requests";

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
      const data = await getAdminApprovedAnswers(authToken);
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
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <GlassCard title="Approved answer operations" subtitle="Monitor every final answer created through the human approval workflow.">
          <div className="grid gap-4">
            <Metric label="Approved answers" value={String(answers.length)} />
            <Metric label="Route" value="/api/admin/answers" />
            <Metric label="Audience" value="Engineering organizations" />
          </div>
          {error ? <p className="mt-4 text-sm text-rose-700">{error}</p> : null}
        </GlassCard>

        <GlassCard title="Final answer library" subtitle="Review what teams can trust and reuse across onboarding, incidents, and internal APIs.">
          {loading ? (
            <div className="theme-panel rounded-[28px] p-6 text-sm text-[#6d6773]">Loading approved answers...</div>
          ) : answers.length === 0 ? (
            <div className="theme-panel rounded-[28px] p-6 text-sm text-[#6d6773]">No approved answers have been created yet.</div>
          ) : (
            <div className="grid gap-4">
              {answers.map((answer) => (
                <article key={answer.id} className="theme-dark-card rounded-[28px] p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-white/55">{answer.draftType}</p>
                      <h2 className="mt-2 text-lg font-semibold text-white">{answer.title}</h2>
                      <p className="mt-2 text-sm text-white/65">{answer.query}</p>
                    </div>
                    <div className="rounded-[22px] bg-white/8 px-4 py-3 text-sm text-white/75">
                      <p>Approved by: {answer.approvedByRole}</p>
                      <p className="mt-1">Department: {answer.department ?? "All departments"}</p>
                      <p className="mt-1">At: {new Date(answer.approvedAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-white/75">{answer.content}</p>
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
