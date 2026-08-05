interface FearFreeBadgeProps {
  variant?: "minimal" | "full" | "playful";
  accentColor?: string;
}

export function FearFreeBadge({ variant = "minimal", accentColor }: FearFreeBadgeProps) {
  const color = accentColor ?? "#22c55e";

  if (variant === "playful") {
    return (
      <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium" style={{ backgroundColor: `${color}15`, color }}>
        <span className="text-lg">🐾</span>
        Fear Free Certified
      </div>
    );
  }

  if (variant === "full") {
    return (
      <div className="inline-flex items-center gap-2 rounded-lg border px-4 py-2" style={{ borderColor: color, color }}>
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span className="text-sm font-semibold">Fear Free Certified</span>
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color }}>
      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      Fear Free
    </span>
  );
}
