"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../../page.module.css";
import Link from "next/link";

export default function AdminMonitor() {
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
      router.push("/");
    }
  }, [router]);

  return (
    <main className={styles.container} style={{ justifyContent: "flex-start" }}>
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 className={styles.title} style={{ fontSize: "1.5rem", marginBottom: 0 }}>
            Data Ingestion Monitor
          </h1>
          <span className="status-chip status-secure" style={{ fontFamily: "var(--font-mono)" }}>
            PIPELINE HEALTHY
          </span>
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

      <div style={{ width: "100%", maxWidth: "1440px", marginTop: "24px" }}>
        <div className="card">
          <h2 style={{marginTop: 0, fontSize: "18px", fontWeight: 600}}>Vectorization Queue</h2>
          
          <div className={styles.terminalLog} style={{ fontFamily: "var(--font-mono)", marginTop: "16px" }}>
            <div className={styles.terminalTitle}>SYSTEM LOG: /var/log/ingestion</div>
            <div>[2023-10-27 14:32:01] INFO  - Chunking policy_Q3.pdf... SUCCESS (128 chunks)</div>
            <div>[2023-10-27 14:32:05] INFO  - Embedding generating via text-embedding-004...</div>
            <div>[2023-10-27 14:32:18] INFO  - Uploading vectors to MongoDB Atlas... SUCCESS</div>
            <div>[2023-10-27 14:32:20] INFO  - Index update triggered...</div>
            <div style={{ color: "var(--secondary)" }}>[2023-10-27 14:32:21] INFO  - Document ingested and secured successfully.</div>
          </div>
        </div>
      </div>
    </main>
  );
}
