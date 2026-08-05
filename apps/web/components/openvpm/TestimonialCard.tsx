interface TestimonialCardProps {
  name: string;
  text: string;
  rating?: number;
  avatar?: string;
  source?: "google" | "internal";
  accentColor?: string;
}

export function TestimonialCard({ name, text, rating, avatar, source, accentColor }: TestimonialCardProps) {
  const color = accentColor ?? "#f59e0b";

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      {typeof rating === "number" && (
        <div className="mb-2 flex gap-0.5" style={{ color }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < rating ? "" : "opacity-30"}>★</span>
          ))}
        </div>
      )}
      <p className="text-sm text-muted-foreground">&ldquo;{text}&rdquo;</p>
      <div className="mt-4 flex items-center gap-3">
        {avatar ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={avatar} alt={name} className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: accentColor ?? "#64748b" }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold">{name}</p>
          {source === "google" && (
            <p className="text-xs text-muted-foreground">Google Review</p>
          )}
        </div>
      </div>
    </div>
  );
}
