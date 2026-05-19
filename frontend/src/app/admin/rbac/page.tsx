"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
import { createEmployee } from "@/requests";
import { useSession } from "@/lib/useSession";

export default function RbacPage() {
  const { ready, user, token } = useSession({ requireAdmin: true });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const created = await createEmployee({ email, password, department: department || undefined }, token);
      setMessage(`Employee created: ${String((created as { email?: string }).email ?? email)}`);
      setEmail("");
      setPassword("");
      setDepartment("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "User creation failed");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) return null;

  return (
    <AppShell user={user}>
      <div className="grid gap-4 sm:gap-5 xl:grid-cols-[1fr] xl:gap-6">
        <GlassCard title="Provision employee access" subtitle="Create department-scoped employee users through the admin endpoint.">
          <form onSubmit={handleCreate} className="space-y-4">
            <Field label="Employee email" value={email} onChange={setEmail} placeholder="employee@company.com" type="email" />
            <Field label="Temporary password" value={password} onChange={setPassword} placeholder="At least 6 characters" type="password" />
            <Field label="Department" value={department} onChange={setDepartment} placeholder="HR, ENGINEERING, LEGAL" />
            {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
            {error ? <p className="text-sm text-rose-700">{error}</p> : null}
            <button disabled={loading} className="theme-button-primary w-full px-5 py-3 text-sm font-medium disabled:opacity-70 sm:w-auto">
              {loading ? "Creating..." : "Create employee"}
            </button>
          </form>
        </GlassCard>
      </div>
    </AppShell>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-[#655f69]">{label}</label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        className="theme-input w-full rounded-[18px] px-4 py-3 outline-none transition focus:border-[#171326]/15 sm:rounded-[22px]"
      />
    </div>
  );
}
