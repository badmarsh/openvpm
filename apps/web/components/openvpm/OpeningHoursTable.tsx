interface HoursRow {
  day: { sk: string; en: string; hu?: string } | string;
  time: string;
  isEmergency?: boolean;
}

interface OpeningHoursTableProps {
  hours: HoursRow[];
  showEmergency?: boolean;
  emergencyPhone?: string;
  accentColor?: string;
  locale?: string;
}

export function OpeningHoursTable({
  hours,
  showEmergency = false,
  emergencyPhone,
  accentColor,
  locale = "sk",
}: OpeningHoursTableProps) {
  function getDayLabel(day: HoursRow["day"]): string {
    if (typeof day === "string") return day;
    return day[locale as keyof typeof day] ?? day.sk ?? day.en;
  }

  return (
    <div>
      <div className="divide-y rounded-lg border">
        {hours.map((row, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3">
            <span className="font-medium">{getDayLabel(row.day)}</span>
            <span className={`text-sm ${row.isEmergency ? "font-semibold text-red-600" : "text-muted-foreground"}`}>
              {row.time}
            </span>
          </div>
        ))}
      </div>
      {showEmergency && emergencyPhone && (
        <p className="mt-4 text-center text-sm font-medium" style={{ color: accentColor ?? "#dc2626" }}>
          Pohotovosť: {emergencyPhone}
        </p>
      )}
    </div>
  );
}
