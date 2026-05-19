"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { clearSession } from "@/requests";
import type { AuthUser } from "@/lib/types";

const links = [
  { href: "/dashboard", label: "Workspace" },
  { href: "/answers", label: "Approved Answers" },
  { href: "/workflows", label: "History" },
  { href: "/admin/ingestion", label: "Ingestion" },
  { href: "/admin/rbac", label: "RBAC" },
  { href: "/admin/monitor", label: "Monitor" },
  { href: "/admin/answers", label: "Admin Answers" },
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleLinks = links.filter((link) => !(link.href.startsWith("/admin") && user?.role !== "ADMIN"));

  return (
    <div className="theme-shell min-h-screen text-[#151126]">
      <div className="mx-auto flex min-h-screen max-w-[1400px] gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <aside className="theme-panel hidden w-80 shrink-0 rounded-[34px] p-6 xl:block animate-[float_10s_ease-in-out_infinite]">
          <SidebarContent user={user} pathname={pathname} router={router} links={visibleLinks} />
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="theme-panel mb-6 rounded-[32px] p-4 sm:p-5 animate-[slideDown_0.7s_ease]">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3 xl:hidden">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[#7d7684]">DocumentRag</p>
                  <h1 className="text-2xl font-semibold tracking-tight text-[#171326]">{pageTitle(pathname)}</h1>
                </div>
                <button
                  onClick={() => setMobileOpen((current) => !current)}
                  className="theme-button-secondary px-4 py-2 text-sm font-medium"
                >
                  {mobileOpen ? "Close" : "Menu"}
                </button>
              </div>

              {mobileOpen ? (
                <div className="theme-panel rounded-[28px] p-4 xl:hidden">
                  <SidebarContent user={user} pathname={pathname} router={router} links={visibleLinks} mobile onNavigate={() => setMobileOpen(false)} />
                </div>
              ) : null}

              <div className="hidden sm:flex sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="hidden xl:block">
                  <p className="text-sm text-[#7d7684]">Secure internal AI copilot for engineering knowledge</p>
                  <h1 className="text-3xl font-semibold tracking-tight text-[#171326]">{pageTitle(pathname)}</h1>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-full bg-[#171326] px-4 py-2 text-sm text-[#fff8f0] shadow-[0_10px_20px_rgba(23,19,38,0.14)]">
                    Backend online
                  </div>
                  <div className="theme-chip rounded-full px-4 py-2 text-sm">
                    {user?.department ?? "All departments"}
                  </div>
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

function SidebarContent({
  user,
  pathname,
  router,
  links,
  mobile = false,
  onNavigate,
}: {
  user: AuthUser | null;
  pathname: string;
  router: ReturnType<typeof useRouter>;
  links: { href: string; label: string }[];
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="mb-8 overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#f8f5f0_0%,#ebe4da_100%)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
        <p className="text-xs uppercase tracking-[0.35em] text-[#746b8d]">DocumentRag</p>
        <h2 className="mt-3 text-3xl font-semibold text-[#171326]">Engineering knowledge copilot</h2>
        <p className="mt-3 text-sm leading-7 text-[#6d6773]">
          Search internal docs, review AI drafts, and save trusted answers your software teams can reuse.
        </p>
      </div>

      <nav className="space-y-2">
        {links.map((link) => {
          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={[
                "block rounded-[22px] px-4 py-3 text-sm font-medium transition duration-300",
                active
                  ? "bg-[#171326] text-[#fff8f0] shadow-[0_12px_24px_rgba(23,19,38,0.18)]"
                  : "text-[#554f5f] hover:bg-white/55 hover:text-[#171326]",
              ].join(" ")}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className={`theme-dark-card ${mobile ? "mt-6" : "mt-8"} rounded-[28px] p-5`}>
        <p className="text-sm text-white/60">Signed in as</p>
        <p className="mt-2 font-medium text-white break-all">{user?.email ?? "Guest"}</p>
        <p className="mt-1 text-sm text-white/70">{user?.role ?? "No role"}</p>
        <button
          onClick={() => {
            clearSession();
            router.push("/login");
          }}
          className="theme-button-secondary mt-4 inline-flex px-4 py-2 text-sm"
        >
          Sign out
        </button>
      </div>
    </>
  );
}

function pageTitle(pathname: string) {
  if (pathname.startsWith("/admin/ingestion")) return "Document ingestion";
  if (pathname.startsWith("/admin/rbac")) return "Role and access management";
  if (pathname.startsWith("/admin/monitor")) return "Workflow monitoring";
  if (pathname.startsWith("/admin/answers")) return "Admin approved answers";
  if (pathname.startsWith("/answers")) return "Trusted approved answers";
  if (pathname.startsWith("/workflows")) return "Workflow history";
  if (pathname.startsWith("/dashboard")) return "Engineering workspace";
  return "DocumentRag";
}
