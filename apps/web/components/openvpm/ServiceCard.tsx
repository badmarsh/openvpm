interface ServiceCardProps {
  icon?: string;
  title: string;
  description?: string;
  price?: string;
  link?: string;
  accentColor?: string;
}

const iconMap: Record<string, string> = {
  stethoscope: "M4.8 2.3A.3.3 0 105.1 2a6.5 6.5 0 00-3 3.5.3.3 0 10.6-.2 5.9 5.9 0 012.7-3.2.3.3 0 00.2-.3zM12 4a1 1 0 011 1v6a1 1 0 11-2 0V5a1 1 0 011-1z",
  "heart-pulse": "M3 12h2l3-9 4 18 3-9h2",
  pill: "M4.5 12.5l7-7a2.12 2.12 0 013 3l-7 7a2.12 2.12 0 01-3-3z",
  microscope: "M6 18h8M9 18v-6M7 12h6M12 12V8a4 4 0 00-8 0v4",
  syringe: "M18 2l-4 4M6 14l-4 4M14 6l-8 8M9 2v4M2 9h4",
  scissors: "M6 6L18 18M6 18L18 6",
  paw: "M12 18c-2 0-4-1-4-3s2-4 4-4 4 2 4 4-2 3-4 3z",
};

export function ServiceCard({ icon, title, description, price, link, accentColor }: ServiceCardProps) {
  const color = accentColor ?? "#2563eb";
  const content = (
    <div className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      {icon && (
        <div
          className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}15`, color: color }}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={iconMap[icon] ?? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"} />
          </svg>
        </div>
      )}
      <h3 className="font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      )}
      {price && (
        <p className="mt-3 text-sm font-medium" style={{ color }}>{price}</p>
      )}
    </div>
  );

  if (link) {
    return <a href={link} className="block">{content}</a>;
  }
  return content;
}
