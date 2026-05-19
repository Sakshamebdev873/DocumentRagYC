"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
import { getAdminDocuments, getEmployees, updateDocumentVisibility, uploadDocument } from "@/requests";
import { useSession } from "@/lib/useSession";
import type { AdminDocument, AdminEmployee } from "@/lib/types";

export default function IngestionPage() {
  const { ready, user, token } = useSession({ requireAdmin: true });
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [employees, setEmployees] = useState<AdminEmployee[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [department, setDepartment] = useState("");
  const [allowedRole, setAllowedRole] = useState<"EMPLOYEE" | "ADMIN">("EMPLOYEE");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !token) return;
    void Promise.all([loadDocuments(token), loadEmployees(token)]);
  }, [ready, token]);

  async function loadDocuments(authToken: string) {
    try {
      const data = await getAdminDocuments(authToken);
      setDocuments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documents");
    }
  }

  async function loadEmployees(authToken: string) {
    try {
      const data = await getEmployees(authToken);
      setEmployees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load employees");
    }
  }

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
      await loadDocuments(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  async function toggleAccess(documentId: string, userId: string) {
    if (!token) return;

    const targetDocument = documents.find((document) => document.id === documentId);
    if (!targetDocument) return;

    const nextVisibleIds = targetDocument.visibleToUserIds.includes(userId)
      ? targetDocument.visibleToUserIds.filter((id) => id !== userId)
      : [...targetDocument.visibleToUserIds, userId];

    setSavingId(documentId);
    setError(null);

    try {
      const updated = await updateDocumentVisibility(documentId, nextVisibleIds, token);
      setDocuments((current) => current.map((document) => (document.id === documentId ? updated : document)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update document access");
    } finally {
      setSavingId(null);
    }
  }

  if (!ready) return null;

  return (
    <AppShell user={user}>
      <div className="grid gap-4 sm:gap-5 xl:grid-cols-[1fr_0.95fr] xl:gap-6">
        <GlassCard title="Upload protected documents" subtitle="Admins upload once, then explicitly assign which users can read each document.">
          <form onSubmit={handleUpload} className="space-y-4">
            <label className="theme-panel block rounded-[24px] p-6 text-center transition hover:bg-white/80 sm:rounded-[28px] sm:p-8">
              <input
                type="file"
                required
                accept=".pdf,.xlsx,.xls,.csv,.txt,.doc,.docx"
                className="hidden"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
              <span className="block text-base font-medium text-[#171326] sm:text-lg">{file ? file.name : "Choose a document to upload"}</span>
              <span className="mt-2 block text-sm text-[#756e7a]">PDF, spreadsheet, text, or office files</span>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-[#655f69]">Allowed role</label>
                <select
                  value={allowedRole}
                  onChange={(event) => setAllowedRole(event.target.value as "EMPLOYEE" | "ADMIN")}
                  className="theme-input w-full rounded-[18px] px-4 py-3 outline-none sm:rounded-[22px]"
                >
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm text-[#655f69]">Department label</label>
                <input
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                  placeholder="ENGINEERING, LEGAL, FINANCE"
                  className="theme-input w-full rounded-[18px] px-4 py-3 outline-none sm:rounded-[22px]"
                />
              </div>
            </div>

            {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
            {error ? <p className="text-sm text-rose-700">{error}</p> : null}

            <button className="theme-button-primary w-full px-5 py-3 text-sm font-medium disabled:opacity-70 sm:w-auto" disabled={loading || !file}>
              {loading ? "Uploading..." : "Start ingestion"}
            </button>
          </form>
        </GlassCard>

        <GlassCard title="Recent uploads" subtitle="Uploaded documents stay invisible to employees until you assign user access.">
          <div className="space-y-4">
            {documents.length === 0 ? (
              <div className="theme-panel rounded-[20px] px-4 py-3 text-sm text-[#6d6773] sm:rounded-[24px]">
                No uploaded documents yet.
              </div>
            ) : (
              documents.map((document) => {
                const relevantEmployees = employees.filter(
                  (employee) => !document.department || employee.department === document.department,
                );

                return (
                  <div key={document.id} className="theme-panel rounded-[24px] p-4 sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-[#171326]">{document.filename}</p>
                        <p className="mt-1 text-sm text-[#6d6773]">
                          {document.allowedRole} · {document.department ?? "No department label"} · {document.ingestionStatus}
                        </p>
                      </div>
                      <div className="theme-chip rounded-full px-3 py-1 text-xs">Assigned users: {document.visibleToUserIds.length}</div>
                    </div>

                    <div className="mt-4 grid gap-2">
                      {relevantEmployees.length === 0 ? (
                        <p className="text-sm text-[#6d6773]">No matching employees to assign yet.</p>
                      ) : (
                        relevantEmployees.map((employee) => {
                          const active = document.visibleToUserIds.includes(employee.id);
                          return (
                            <button
                              key={employee.id}
                              onClick={() => void toggleAccess(document.id, employee.id)}
                              disabled={savingId === document.id}
                              className={
                                active
                                  ? "rounded-[18px] border border-[#8fd0a0] bg-[#8fd0a0]/18 px-4 py-3 text-left text-sm text-[#124326]"
                                  : "rounded-[18px] border border-[#d8d3de] bg-white/60 px-4 py-3 text-left text-sm text-[#4f4955]"
                              }
                            >
                              {employee.email} {active ? "· has access" : "· no access"}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
