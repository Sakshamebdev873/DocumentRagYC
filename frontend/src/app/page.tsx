"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

import { api } from "../lib/api";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api.post("/auth/login", { email, password });
      console.log(data);

      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (err: any) {
      console.log(err);

      setError(err.message || "Login failed.");
    }
    setLoading(false);
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Agentic Platform</h1>
      <p className={styles.subtitle}>Secure RAG & Autonomous Workflow</p>

      <form onSubmit={handleLogin} className={`card ${styles.loginForm}`}>
        {error && <div style={{ color: "var(--danger)" }}>{error}</div>}
        <input
          type="email"
          placeholder="Email Address"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "AUTHENTICATING..." : "SIGN IN"}
        </button>
      </form>
    </main>
  );
}
