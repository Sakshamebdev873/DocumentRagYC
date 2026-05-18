"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../../page.module.css";
import Link from "next/link";
import { api } from "../../../lib/api";

export default function AdminRBAC() {
  const router = useRouter();
  
  // Provisioning Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
      router.push("/");
    }
  }, [router]);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const payload: any = { email, password };
      if (department) payload.department = department;
      
      await api.post("/admin/users", payload);
      alert("Employee account created successfully!");
      setEmail("");
      setPassword("");
      setDepartment("");
    } catch (err: any) {
      alert("Creation failed: " + err.message);
    }
    setLoading(false);
  };

  return (
    <main className={styles.container} style={{ justifyContent: "flex-start" }}>
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 className={styles.title} style={{ fontSize: "1.5rem", marginBottom: 0 }}>
            Security & RBAC Configuration
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href="/admin/ingestion" className="btn btn-ghost" style={{ display: "inline-flex", alignItems: "center" }}>
            Data Ingestion
          </Link>
          <Link href="/dashboard" className="btn btn-ghost" style={{ display: "inline-flex", alignItems: "center" }}>
            Back to Workspace
          </Link>
        </div>
      </header>

      <div className={styles.dashboard}>
        {/* Left Column: Employee Provisioning */}
        <div className="card">
          <h2 style={{marginTop: 0, fontSize: "18px", fontWeight: 600}}>Employee Provisioning</h2>
          <p style={{color: "var(--foreground-muted)", fontSize: "14px", marginBottom: "24px"}}>
            Securely create an account for a new employee. There is no public registration.
          </p>

          <form onSubmit={handleCreateEmployee} className={styles.loginForm}>
            <input
              type="email"
              className="input"
              placeholder="Employee Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className="input"
              placeholder="Temporary Password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <input
              type="text"
              className="input"
              placeholder="Department (Optional, e.g., HR)"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: "8px" }}>
              {loading ? "PROVISIONING..." : "CREATE ACCOUNT"}
            </button>
          </form>
        </div>

        {/* Right Column: Access Control Policies */}
        <div className="card">
          <h2 style={{marginTop: 0, fontSize: "18px", fontWeight: 600}}>Access Control Policies</h2>
          <p style={{color: "var(--foreground-muted)", fontSize: "14px", marginBottom: "24px"}}>
            Enforce role-based access boundaries at the database layer.
          </p>
          
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--foreground-muted)", textTransform: "uppercase" }}>
                <th style={{ textAlign: "left", padding: "12px 8px" }}>Department</th>
                <th style={{ textAlign: "left", padding: "12px 8px" }}>Clearance Level</th>
                <th style={{ textAlign: "left", padding: "12px 8px" }}>Status</th>
                <th style={{ textAlign: "right", padding: "12px 8px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid var(--border-muted)" }}>
                <td style={{ padding: "16px 8px" }}>Legal & Compliance</td>
                <td style={{ padding: "16px 8px", fontFamily: "var(--font-mono)", fontSize: "12px" }}>ADMIN_ONLY</td>
                <td style={{ padding: "16px 8px" }}><span className="status-chip status-secure">ENFORCED</span></td>
                <td style={{ padding: "16px 8px", textAlign: "right" }}><button className="btn btn-ghost">EDIT</button></td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--border-muted)" }}>
                <td style={{ padding: "16px 8px" }}>General Operations</td>
                <td style={{ padding: "16px 8px", fontFamily: "var(--font-mono)", fontSize: "12px" }}>EMPLOYEE</td>
                <td style={{ padding: "16px 8px" }}><span className="status-chip status-secure">ENFORCED</span></td>
                <td style={{ padding: "16px 8px", textAlign: "right" }}><button className="btn btn-ghost">EDIT</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
