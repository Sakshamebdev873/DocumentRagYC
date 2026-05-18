"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../../page.module.css";
import Link from "next/link";

import { api } from "../../../lib/api";

export default function AdminIngestion() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [department, setDepartment] = useState("");
  const [allowedRole, setAllowedRole] = useState("EMPLOYEE");
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
      router.push("/");
    } else {
      setToken(savedToken);
    }
  }, [router]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("allowedRole", allowedRole);
    if (department.trim() !== "") {
      formData.append("department", department.trim());
    }

    setLoading(true);
    try {
      // isFormData = true flag passed to our global api client
      await api.post("/upload", formData, true);
      alert("File uploaded successfully and is being processed.");
      setDepartment("");
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    }
    setLoading(false);
  };

  if (!token) return null;

  return (
    <main className={styles.container} style={{ justifyContent: "flex-start" }}>
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 className={styles.title} style={{ fontSize: "1.5rem", marginBottom: 0 }}>
            Admin: Secure Data Ingestion
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href="/dashboard" className="btn btn-ghost" style={{ display: "inline-flex", alignItems: "center" }}>
            Back to Workspace
          </Link>
          <Link href="/admin/rbac" className="btn btn-ghost" style={{ display: "inline-flex", alignItems: "center" }}>
            RBAC Settings
          </Link>
          <Link href="/admin/monitor" className="btn btn-ghost" style={{ display: "inline-flex", alignItems: "center" }}>
            System Monitor
          </Link>
        </div>
      </header>

      <div style={{ width: "100%", maxWidth: "1440px", marginTop: "24px" }}>
        <div className="card" style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{marginTop: 0, fontSize: "18px", fontWeight: 600}}>Upload Organization Knowledge</h2>
          <p style={{color: "var(--foreground-muted)", fontSize: "14px", marginBottom: "24px"}}>
            Select a document to securely vectorize and ingest into the RAG database.
          </p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "bold", color: "var(--foreground-muted)", marginBottom: "8px", display: "block" }}>
                Target Department (Leave blank for Global access)
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g. HR, ENGINEERING, LEGAL"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: "bold", color: "var(--foreground-muted)", marginBottom: "8px", display: "block" }}>
                Minimum Clearance Level
              </label>
              <select className="input" value={allowedRole} onChange={(e) => setAllowedRole(e.target.value)}>
                <option value="EMPLOYEE">Standard Employee</option>
                <option value="ADMIN">Admin Only</option>
              </select>
            </div>
          </div>

          <div style={{ 
            border: "1px dashed var(--border)", 
            padding: "48px", 
            borderRadius: "4px",
            textAlign: "center",
            backgroundColor: "var(--background)"
          }}>
            <div className={styles.fileUpload}>
              <button className="btn btn-primary" disabled={loading}>
                {loading ? "PROCESSING..." : "SELECT FILE"}
              </button>
              <input type="file" onChange={handleUpload} accept=".pdf,.txt,.xlsx,.csv" disabled={loading} />
            </div>
            <div style={{ marginTop: "16px", fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--foreground-muted)" }}>
              Supported: PDF, TXT, XLSX, CSV
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
