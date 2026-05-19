"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
import { uploadDocument } from "@/requests";
import { useSession } from "@/lib/useSession";

export default function IngestionPage() {
  const { ready, user, token } = useSession({ requireAdmin: true });
  const [file, setFile] = useState<File | null>(null);
  const [department, setDepartment] = useState("");
  const [allowedRole, setAllowedRole] = useState<"EMPLOYEE" | "ADMIN">("EMPLOYEE");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || !token) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const result = await uploadDocument(
        {
          file,
          department: department || undefined,
          allowedRole,
        },
        token,
      );
      setMessage(`${result.message} | ID ${result.documentId}`);
      setFile(null);
      setDepartment("");
      setAllowedRole("EMPLOYEE");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) return null;

  return (
    <AppShell user={user}>
      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <GlassCard title="Upload protected documents" subtitle="Send PDF or spreadsheet files into the ingestion pipeline with role and department visibility.">
          <form onSubmit={handleUpload} className="space-y-4">
            <label className="block rounded-3xl border border-dashed border-cyan-300/35 bg-black/20 p-8 text-center transition hover:border-cyan-300/60 hover:bg-white/6">
              <input
                type="file"
                required
                accept=".pdf,.xlsx,.xls,.csv,.txt,.doc,.docx"
                className="hidden"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
              <span className="block text-lg font-medium">{file ? file.name : "Choose a document to upload"}</span>
              <span className="mt-2 block text-sm text-zinc-400">PDF, spreadsheet, text, or office files</span>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-zinc-300">Allowed role</label>
                <select
                  value={allowedRole}
                  onChange={(event) => setAllowedRole(event.target.value as "EMPLOYEE" | "ADMIN")}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
                >
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm text-zinc-300">Department</label>
                <input
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                  placeholder="HR, ENGINEERING, LEGAL"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
                />
              </div>
            </div>

            {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}

            <button className="rounded-full bg-cyan-400 px-5 py-3 font-medium text-slate-950 transition hover:scale-[1.02] disabled:opacity-70" disabled={loading || !file}>
              {loading ? "Uploading..." : "Start ingestion"}
            </button>
          </form>
        </GlassCard>

        <GlassCard title="Ingestion policy" subtitle="Reflects your backend rules around admin-only documents and department scoping.">
          <div className="space-y-4 text-sm leading-7 text-zinc-300">
            <Policy title="Role-aware uploads" text="Only admins can upload documents restricted to the ADMIN role." />
            <Policy title="Department filters" text="Leave department empty for global visibility, or assign a unit for narrower access." />
            <Policy title="Async processing" text="Uploads return a processing acknowledgement while embeddings and chunking happen server-side." />
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}

function Policy({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
      <p className="font-semibold text-white">{title}</p>
      <p className="mt-2 text-zinc-400">{text}</p>
    </div>
  );
}
