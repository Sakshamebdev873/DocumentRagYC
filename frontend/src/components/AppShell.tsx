"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession } from "@/requests";
import type { AuthUser } from "@/lib/types";

const links = [
  { href: "/dashboard", label: "Workspace" },
  { href: "/admin/ingestion", label: "Ingestion" },
  { href: "/admin/rbac", label: "RBAC" },
  { href: "/admin/monitor", label: "Monitor" },
];

export function AppShell({
  user,
  children,
}: {
  user: AuthUser | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_28%),linear-gradient(180deg,#09090b_0%,#111827_55%,#020617_100%)] text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <aside className="hidden w-72 shrink-0 rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-2xl backdrop-blur xl:block animate-[float_8s_ease-in-out_infinite]">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">DocumentRag</p>
            <h2 className="mt-3 text-2xl font-semibold">Enterprise control center</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-300">
              Search company context, manage ingestion, and review human-in-the-loop drafts.
            </p>
          </div>

          <nav className="space-y-2">
            {links.map((link) => {
              const active = pathname === link.href;
              const isAdminOnly = link.href.startsWith("/admin");
              if (isAdminOnly && user?.role !== "ADMIN") return null;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={[
                    "block rounded-2xl px-4 py-3 text-sm font-medium transition duration-300",
                    active
                      ? "bg-cyan-400/20 text-cyan-100 shadow-[0_0_0_1px_rgba(34,211,238,0.35)]"
                      : "text-zinc-300 hover:bg-white/8 hover:text-white",
                  ].join(" ")}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-3xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-zinc-400">Signed in as</p>
            <p className="mt-2 font-medium">{user?.email ?? "Guest"}</p>
            <p className="mt-1 text-sm text-cyan-200">{user?.role ?? "No role"}</p>
            <button
              onClick={() => {
                clearSession();
                router.push("/login");
              }}
              className="mt-4 inline-flex rounded-full border border-white/15 px-4 py-2 text-sm text-zinc-200 transition hover:border-cyan-300/40 hover:bg-cyan-300/10"
            >
              Sign out
            </button>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="mb-6 rounded-[28px] border border-white/10 bg-white/6 p-4 shadow-xl backdrop-blur animate-[slideDown_0.7s_ease]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-zinc-400">Secure document intelligence platform</p>
                <h1 className="text-2xl font-semibold tracking-tight">{pageTitle(pathname)}</h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">
                  Backend online · AES payloads
                </div>
                <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-zinc-200">
                  {user?.department ?? "All departments"}
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

function pageTitle(pathname: string) {
  if (pathname.startsWith("/admin/ingestion")) return "Document ingestion";
  if (pathname.startsWith("/admin/rbac")) return "Role and access management";
  if (pathname.startsWith("/admin/monitor")) return "Workflow monitoring";
  if (pathname.startsWith("/dashboard")) return "Employee workspace";
  return "DocumentRag";
}
