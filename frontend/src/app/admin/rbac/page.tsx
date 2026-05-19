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
      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <GlassCard title="Provision employee access" subtitle="Create department-scoped employee users through the admin endpoint.">
          <form onSubmit={handleCreate} className="space-y-4">
            <Field label="Employee email" value={email} onChange={setEmail} placeholder="employee@company.com" type="email" />
            <Field label="Temporary password" value={password} onChange={setPassword} placeholder="At least 6 characters" type="password" />
            <Field label="Department" value={department} onChange={setDepartment} placeholder="HR, ENGINEERING, LEGAL" />
            {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
            <button disabled={loading} className="rounded-full bg-cyan-400 px-5 py-3 font-medium text-slate-950 transition hover:scale-[1.02] disabled:opacity-70">
              {loading ? "Creating..." : "Create employee"}
            </button>
          </form>
        </GlassCard>

        <GlassCard title="RBAC model" subtitle="Summarizes the authorization behavior enforced by the backend middleware and Prisma filters.">
          <div className="grid gap-4">
            <Info title="Admin scope" text="Admins can create users and upload admin-only documents." />
            <Info title="Employee scope" text="Employees query only chunks available to EMPLOYEE role and matching department filters." />
            <Info title="Soft-delete aware" text="Inactive users are blocked by authentication middleware even if they still hold a token." />
          </div>
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
      <label className="mb-2 block text-sm text-zinc-300">{label}</label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition focus:border-cyan-300/40"
      />
    </div>
  );
}

function Info({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
      <p className="font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-7 text-zinc-400">{text}</p>
    </div>
  );
}
