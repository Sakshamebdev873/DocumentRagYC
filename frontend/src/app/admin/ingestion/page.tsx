"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
import { LoadingGrid } from "@/components/LoadingCard";
import { deleteAdminDocument, getAdminDocuments, getEmployees, updateDocumentVisibility, uploadDocument } from "@/requests";
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
  const [pageLoading, setPageLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [assignmentTargetId, setAssignmentTargetId] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !token) return;
    void loadPageData(token);
  }, [ready, token]);

  async function loadPageData(authToken: string) {
    setPageLoading(true);
    try {
      await Promise.all([loadDocuments(authToken), loadEmployees(authToken)]);
    } finally {
      setPageLoading(false);
    }
  }

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

  async function handleDelete(documentId: string) {
    if (!token) return;

    setDeletingId(documentId);
    setError(null);
    setMessage(null);

    try {
      await deleteAdminDocument(documentId, token);
      setDocuments((current) => current.filter((document) => document.id !== documentId));
      setMessage("Document deleted. You can upload a fresh version now.");
      if (assignmentTargetId === documentId) {
        setAssignmentTargetId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete document");
    } finally {
      setDeletingId(null);
    }
  }

  const assignmentTarget = useMemo(
    () => documents.find((document) => document.id === assignmentTargetId) ?? null,
    [assignmentTargetId, documents],
  );

  const relevantEmployees = useMemo(() => {
    if (!assignmentTarget) return [];
    return employees.filter((employee) => !assignmentTarget.department || employee.department === assignmentTarget.department);
  }, [assignmentTarget, employees]);

  if (!ready) return null;

  return (
    <AppShell user={user}>
      <div className="grid gap-4 sm:gap-5 xl:grid-cols-[1fr_0.95fr] xl:gap-6">
        <GlassCard title="Upload protected documents" subtitle="Admins upload once, assign users with a cleaner modal flow, and can delete a file anytime before reuploading a new version.">
          <form onSubmit={handleUpload} className="space-y-4">
            <label className="theme-panel block cursor-pointer rounded-[24px] p-6 text-center transition hover:bg-white/80 sm:rounded-[28px] sm:p-8">
              <input
                type="file"
                required
                accept=".pdf,.xlsx,.xls,.csv,.txt,.doc,.docx"
                className="hidden"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
              <span className="block text-sm font-medium text-[#171326] sm:text-base">{file ? file.name : "Choose a document to upload"}</span>
              <span className="mt-2 block text-xs text-[#756e7a] sm:text-sm">PDF, spreadsheet, text, or office files</span>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-[#655f69]">Allowed role</label>
                <select
                  value={allowedRole}
                  onChange={(event) => setAllowedRole(event.target.value as "EMPLOYEE" | "ADMIN")}
                  className="theme-input w-full cursor-pointer rounded-[18px] px-4 py-3 text-sm outline-none sm:rounded-[22px]"
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
                  className="theme-input w-full rounded-[18px] px-4 py-3 text-sm outline-none sm:rounded-[22px]"
                />
              </div>
            </div>

            {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
            {error ? <p className="text-sm text-rose-700">{error}</p> : null}

            <button className="theme-button-primary w-full cursor-pointer px-5 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto" disabled={loading || !file}>
              {loading ? "Uploading..." : "Start ingestion"}
            </button>
          </form>
        </GlassCard>

        <GlassCard title="Recent uploads" subtitle="Each document stays private until you open assignment and choose exactly who should receive access.">
          {pageLoading ? (
            <LoadingGrid count={3} />
          ) : (
            <div className="space-y-4">
              {documents.length === 0 ? (
                <div className="theme-panel rounded-[20px] px-4 py-3 text-sm text-[#6d6773] sm:rounded-[24px]">
                  No uploaded documents yet.
                </div>
              ) : (
                documents.map((document) => (
                  <div key={document.id} className="rounded-[28px] border border-white/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(247,242,236,0.92))] p-4 shadow-[0_18px_42px_rgba(27,20,41,0.08)] sm:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-lg font-semibold tracking-tight text-[#171326] sm:text-xl">{document.filename}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-[#ddd4e6] bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5f596d]">
                            {document.allowedRole}
                          </span>
                          <span className="rounded-full border border-[#ddd4e6] bg-white/85 px-3 py-1 text-[11px] text-[#6d6773]">
                            {document.department ?? "Shared document"}
                          </span>
                          <span className="rounded-full border border-[#d7eadb] bg-[#eff8f1] px-3 py-1 text-[11px] font-semibold text-[#245237]">
                            {document.ingestionStatus}
                          </span>
                        </div>
                      </div>

                      <div className="w-full max-w-[340px] shrink-0 rounded-[24px] bg-white/80 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                        <div className="mb-3 flex items-center justify-between rounded-[18px] bg-[#f5f1f8] px-3 py-2">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-[#746b8d]">Access</p>
                          <p className="text-xs font-semibold text-[#171326]">{document.visibleToUserIds.length} assigned</p>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                          <button
                            onClick={() => setAssignmentTargetId(document.id)}
                            className="rounded-[18px] bg-[#171326] px-4 py-3 text-xs font-semibold text-[#fff8f0] shadow-[0_12px_28px_rgba(23,19,38,0.22)] transition hover:translate-y-[-1px] hover:bg-[#221c3b] cursor-pointer"
                          >
                            Manage assignment
                          </button>
                          <button
                            onClick={() => void handleDelete(document.id)}
                            disabled={deletingId === document.id}
                            className="rounded-[18px] border border-[#e7b5bb] bg-[#fff7f8] px-4 py-3 text-xs font-semibold text-[#8a3340] transition hover:bg-[#ffedf0] cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {deletingId === document.id ? "Deleting..." : "Delete file"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </GlassCard>
      </div>

      {assignmentTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171326]/45 px-4 py-6 backdrop-blur-sm">
          <div className="theme-panel w-full max-w-3xl rounded-[32px] p-5 shadow-[0_30px_80px_rgba(23,19,38,0.22)] sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.32em] text-[#7a7383]">Assignment center</p>
                <h2 className="mt-2 text-xl font-semibold text-[#171326] sm:text-2xl">{assignmentTarget.filename}</h2>
                <p className="mt-2 text-sm leading-6 text-[#5c5664]">
                  Choose exactly which users should be able to query this document. This view makes it clear who can receive access and who cannot.
                </p>
              </div>
              <button
                onClick={() => setAssignmentTargetId(null)}
                className="rounded-full border border-[#cfc7d8] bg-white px-4 py-2 text-xs font-semibold text-[#3e3749] transition hover:bg-[#f7f4fa] cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="theme-panel rounded-[22px] p-4">
                <p className="text-xs text-[#756e7a]">Allowed role</p>
                <p className="mt-2 text-base font-semibold text-[#171326]">{assignmentTarget.allowedRole}</p>
              </div>
              <div className="theme-panel rounded-[22px] p-4">
                <p className="text-xs text-[#756e7a]">Department</p>
                <p className="mt-2 text-base font-semibold text-[#171326]">{assignmentTarget.department ?? "Shared"}</p>
              </div>
              <div className="theme-panel rounded-[22px] p-4">
                <p className="text-xs text-[#756e7a]">Assigned users</p>
                <p className="mt-2 text-base font-semibold text-[#171326]">{assignmentTarget.visibleToUserIds.length}</p>
              </div>
            </div>

            <div className="mt-6 max-h-[420px] overflow-y-auto pr-1">
              {relevantEmployees.length === 0 ? (
                <div className="theme-panel rounded-[24px] p-5 text-sm text-[#6d6773]">
                  No matching employees are available for this document yet.
                </div>
              ) : (
                <div className="grid gap-3">
                  {relevantEmployees.map((employee) => {
                    const active = assignmentTarget.visibleToUserIds.includes(employee.id);
                    return (
                      <button
                        key={employee.id}
                        onClick={() => void toggleAccess(assignmentTarget.id, employee.id)}
                        disabled={savingId === assignmentTarget.id}
                        className={[
                          "cursor-pointer rounded-[24px] border px-4 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-70",
                          active
                            ? "border-[#6daf7d] bg-[#ecf7ee] text-[#124326] shadow-[0_8px_20px_rgba(18,67,38,0.08)]"
                            : "border-[#d7cfdf] bg-white text-[#4f4955] shadow-[0_8px_18px_rgba(23,19,38,0.06)] hover:border-[#171326]/25 hover:bg-[#faf8fc]",
                        ].join(" ")}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold break-all">{employee.email}</p>
                            <p className="mt-1 text-xs opacity-75">Department: {employee.department ?? "No department"}</p>
                          </div>
                          <span
                            className={
                              active
                                ? "rounded-full bg-[#124326] px-3 py-1 text-[11px] font-semibold text-white"
                                : "rounded-full border border-[#d8d1e0] bg-[#f5f1f8] px-3 py-1 text-[11px] font-semibold text-[#5c5664]"
                            }
                          >
                            {active ? "Assigned" : "Assign access"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
