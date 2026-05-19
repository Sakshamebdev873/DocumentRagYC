"use client";

export function GlassCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/6 p-6 shadow-2xl backdrop-blur animate-[rise_0.8s_ease]">
      <div className="mb-5">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {subtitle ? <p className="mt-2 text-sm leading-7 text-zinc-400">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}
