export function LoadingCard({ lines = 3, dark = false }: { lines?: number; dark?: boolean }) {
  return (
    <div
      className={[
        "rounded-[28px] p-5",
        dark ? "border border-white/8 bg-white/6" : "theme-panel",
      ].join(" ")}
    >
      <div className="theme-skeleton h-4 w-28 rounded-full" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className="theme-skeleton h-3 rounded-full"
            style={{ width: `${92 - index * 12}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function LoadingGrid({ count = 3, dark = false }: { count?: number; dark?: boolean }) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <LoadingCard key={index} lines={4} dark={dark} />
      ))}
    </div>
  );
}
