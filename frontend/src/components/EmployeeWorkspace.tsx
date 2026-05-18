"use client";

import { useState, useEffect } from "react";
import { api } from "../lib/api";
import styles from "../app/page.module.css";

export default function EmployeeWorkspace({ token }: { token: string }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const fetchHistory = async () => {
    try {
      const data = await api.get("/workflow/pending");
      // For the employee side, "pending workflows" are effectively chat history responses
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    
    // Optimistically add user query to UI
    const tempQuery = query;
    setQuery("");

    try {
      await api.post("/query", { query: tempQuery });
      fetchHistory(); // Refresh to get the new AI response draft
    } catch (err: any) {
      alert("Error: " + err.message);
    }
    setLoading(false);
  };

  const handleAction = async (id: string, action: "EXECUTE" | "DISCARD") => {
    try {
      await api.patch(`/workflow/${id}`, { action });
      fetchHistory();
    } catch (err: any) {
      alert("Action failed: " + err.message);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="card" style={{ flex: 1, minHeight: "400px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <h2 style={{marginTop: 0, fontSize: "18px", fontWeight: 600}}>AI Agent Chat</h2>
        
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
          {history.length === 0 ? (
            <p style={{color: "var(--foreground-muted)", fontSize: "14px", textAlign: "center", marginTop: "40px"}}>
              Send a message to start interacting with your AI Agent.
            </p>
          ) : (
            history.slice().reverse().map((msg) => (
              <div key={msg.id} style={{ display: "flex", flexDirection: "column", gap: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
                <div style={{ alignSelf: "flex-end", backgroundColor: "var(--border)", padding: "12px", borderRadius: "8px 8px 0px 8px", maxWidth: "80%" }}>
                  <span style={{ fontSize: "12px", color: "var(--foreground-muted)", marginBottom: "4px", display: "block" }}>You</span>
                  {msg.query}
                </div>
                
                <div style={{ alignSelf: "flex-start", backgroundColor: "var(--background)", border: "1px solid var(--border)", padding: "16px", borderRadius: "8px 8px 8px 0px", maxWidth: "90%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", color: "var(--primary-fixed)", fontWeight: "bold" }}>Agent Response ({msg.draftType})</span>
                  </div>
                  
                  {msg.draftContent?.title && <h3 style={{fontSize: "14px", marginTop: 0}}>{msg.draftContent.title}</h3>}
                  <div style={{ fontSize: "14px", whiteSpace: "pre-wrap", color: "var(--foreground)", fontFamily: "var(--font-mono)" }}>
                    {msg.draftContent?.content}
                  </div>
                  
                  {msg.draftContent?.actionItems && msg.draftContent.actionItems.length > 0 && (
                    <div style={{ marginTop: "12px", padding: "8px", backgroundColor: "#000", borderRadius: "4px" }}>
                      <strong style={{fontSize: "12px", color: "var(--secondary)"}}>Action Items:</strong>
                      <ul style={{ margin: "4px 0 0 16px", fontSize: "12px", color: "var(--foreground-muted)" }}>
                        {msg.draftContent.actionItems.map((item: string, i: number) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                    <button onClick={() => handleAction(msg.id, "EXECUTE")} className="btn btn-success" style={{fontSize: "12px", padding: "6px 12px"}}>Approve & Save</button>
                    <button onClick={() => handleAction(msg.id, "DISCARD")} className="btn btn-danger" style={{fontSize: "12px", padding: "6px 12px"}}>Discard</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleQuery} style={{ display: "flex", gap: "12px", marginTop: "auto" }}>
          <input
            type="text"
            className="input"
            style={{ flex: 1 }}
            placeholder="Ask the agent a question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="btn btn-primary" disabled={loading || !query}>
            {loading ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
