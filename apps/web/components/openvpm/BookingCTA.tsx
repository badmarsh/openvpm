import Link from "next/link";

interface BookingCTAProps {
  href?: string;
  label?: string;
  accentColor?: string;
  size?: "sm" | "md" | "lg";
}

export function BookingCTA({
  href = "/portal/booking",
  label = "Rezervovať termín",
  accentColor,
  size = "md",
}: BookingCTAProps) {
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-lg font-medium text-white transition-colors hover:opacity-90"
      style={{
        backgroundColor: accentColor ?? "#2563eb",
      }}
    >
      <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span className={sizeClasses[size]}>{label}</span>
    </Link>
  );
}
