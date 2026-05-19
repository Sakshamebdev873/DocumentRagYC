"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
import { createEmployee, getEmployees } from "@/requests";
import { useSession } from "@/lib/useSession";
import type { AdminEmployee } from "@/lib/types";

export default function RbacPage() {
  const { ready, user, token } = useSession({ requireAdmin: true });
  const [employees, setEmployees] = useState<AdminEmployee[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ready || !token) return;
    void loadEmployees(token);
  }, [ready, token]);

  async function loadEmployees(authToken: string) {
    try {
      const data = await getEmployees(authToken);
      setEmployees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load employees");
    }
  }

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
      await loadEmployees(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "User creation failed");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) return null;

  return (
    <AppShell user={user}>
      <div className="grid gap-4 sm:gap-5 xl:grid-cols-[1fr_0.95fr] xl:gap-6">
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

        <GlassCard title="Employee list" subtitle="Responsive card view for quick scanning on mobile and desktop.">
          <div className="grid gap-3">
            {employees.length === 0 ? (
              <div className="theme-panel rounded-[20px] px-4 py-3 text-sm text-[#6d6773] sm:rounded-[24px]">
                No employees created yet.
              </div>
            ) : (
              employees.map((employee) => (
                <div key={employee.id} className="theme-panel rounded-[20px] p-4 sm:rounded-[24px] sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-[#171326] break-all">{employee.email}</p>
                      <p className="mt-1 text-sm text-[#6d6773]">Department: {employee.department ?? "Global"}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="theme-chip rounded-full px-3 py-1 text-xs">{employee.role}</span>
                      <span className={employee.isActive ? "rounded-full border border-[#8fd0a0] bg-[#8fd0a0]/18 px-3 py-1 text-xs text-[#124326]" : "rounded-full border border-[#db9aa1] bg-[#db9aa1]/20 px-3 py-1 text-xs text-[#5c1f27]"}>
                        {employee.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
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
