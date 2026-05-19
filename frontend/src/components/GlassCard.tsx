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
    <section className="theme-panel rounded-[30px] p-6 shadow-[0_20px_60px_rgba(26,20,43,0.08)] animate-[rise_0.8s_ease] md:p-7">
      <div className="mb-5">
        <h2 className="text-[1.45rem] font-semibold tracking-tight text-[#151126]">{title}</h2>
        {subtitle ? <p className="mt-2 max-w-2xl text-sm leading-7 text-[#6d6773]">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}
