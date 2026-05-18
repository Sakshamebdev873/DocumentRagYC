"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../page.module.css";
import Link from "next/link";
import { api, getUser } from "../../lib/api";
import EmployeeWorkspace from "../../components/EmployeeWorkspace";

export default function Dashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
      router.push("/");
    } else {
      setToken(savedToken);
      const user = getUser();
      if (user && user.role) {
        setUserRole(user.role);
      }
      if (user?.role === "ADMIN") {
        fetchWorkflows();
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  const fetchWorkflows = async () => {
    try {
      const data = await api.get("/workflow/pending");
      setWorkflows(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query || !token) return;
    setLoading(true);
    try {
      await api.post("/query", { query });
      setQuery("");
      fetchWorkflows();
    } catch (err: any) {
      console.log(err.message);

      alert("Error: " + err.message);
    }
    setLoading(false);
  };

  const handleAction = async (id: string, action: "EXECUTE" | "DISCARD") => {
    try {
      await api.patch(`/workflow/${id}`, { action });
      fetchWorkflows();
    } catch (err: any) {
      alert("Action failed: " + err.message);
    }
  };

  if (!token || !userRole) return null;

  return (
    <main className={styles.container} style={{ justifyContent: "flex-start" }}>
      <header className={styles.header} style={{ marginBottom: "24px" }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 className={styles.title} style={{ fontSize: "1.5rem", marginBottom: 0 }}>
            {userRole === "ADMIN" ? "Admin Workspace" : "Employee Workspace"}
          </h1>
          <span className="status-chip status-secure" style={{ fontFamily: "var(--font-mono)" }}>
            System Active
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {userRole === "ADMIN" && (
            <Link href="/admin/ingestion" className="btn btn-ghost" style={{ display: "inline-flex", alignItems: "center" }}>
              Admin Tools
            </Link>
          )}
          <button onClick={handleLogout} className="btn btn-ghost">
            Logout
          </button>
        </div>
      </header>

      {userRole === "EMPLOYEE" ? (
        <EmployeeWorkspace token={token} />
      ) : (
        <div className={styles.dashboard}>
          {/* Left Column: Admin Agent Console */}
          <div className="card">
            <h2 style={{ marginTop: 0, fontSize: "18px", fontWeight: 600 }}>Agent Console</h2>
            <form onSubmit={handleQuery} className={styles.queryBox}>
              <textarea
                className="input"
                rows={6}
                style={{ fontFamily: "var(--font-mono)" }}
                placeholder="> Enter prompt for AI Agent..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "EXECUTING..." : "EXECUTE"}
              </button>
            </form>
          </div>

          {/* Right Column: Admin Workflow Approvals */}
          <div className="card">
            <h2 style={{ marginTop: 0, fontSize: "18px", fontWeight: 600 }}>Pending Approvals</h2>
            {workflows.length === 0 ? (
              <p style={{ color: "var(--foreground-muted)", fontSize: "14px" }}>No workflows awaiting review.</p>
            ) : (
              workflows.map((wf) => (
                <div key={wf.id} className={styles.workflowItem}>
                  <div className={styles.workflowHeader}>
                    <div className={styles.workflowType}>
                      {wf.draftType}
                      <div className={styles.workflowQuery}>
                        {wf.query}
                      </div>
                    </div>
                    <span className="status-chip status-pending" style={{ fontFamily: "var(--font-mono)" }}>PENDING</span>
                  </div>

                  <div className={styles.terminalLog} style={{ fontFamily: "var(--font-mono)" }}>
                    <div className={styles.terminalTitle}>OUTPUT LOG</div>
                    {wf.draftContent?.title && <div style={{ fontWeight: "bold", marginBottom: "8px" }}>{wf.draftContent.title}</div>}
                    {wf.draftContent?.content}
                  </div>

                  <div className={styles.workflowActions}>
                    <button onClick={() => handleAction(wf.id, "EXECUTE")} className="btn btn-success" style={{ flex: 1 }}>Approve & Execute</button>
                    <button onClick={() => handleAction(wf.id, "DISCARD")} className="btn btn-danger" style={{ flex: 1 }}>Discard</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </main>
  );
}
