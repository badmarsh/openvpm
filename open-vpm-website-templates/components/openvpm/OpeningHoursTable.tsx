'use client'

/**
 * OpeningHoursTable
 * Displays clinic opening hours with today's row highlighted.
 * Usage:
 *   import { OpeningHoursTable } from '@/components/openvpm'
 */

export interface HoursRow {
  day: string
  open: string
  close: string
  closed?: boolean
}

export interface OpeningHoursTableProps {
  hours: HoursRow[]
  /** 0 = Sunday … 6 = Saturday — defaults to JS Date.getDay() */
  todayIndex?: number
  accentColor?: string
}

// Slovak day abbreviations → JS day index map
const SK_DAY_MAP: Record<string, number> = {
  nedeľa: 0,
  pondelok: 1,
  utorok: 2,
  streda: 3,
  štvrtok: 4,
  piatok: 5,
  sobota: 6,
}

function guessIndex(day: string, fallback: number): number {
  const key = day.toLowerCase()
  for (const [sk, idx] of Object.entries(SK_DAY_MAP)) {
    if (key.startsWith(sk)) return idx
  }
  return fallback
}

export function OpeningHoursTable({
  hours,
  todayIndex,
  accentColor = '#7BA68C',
}: OpeningHoursTableProps) {
  const today = todayIndex ?? new Date().getDay()

  return (
    <table className="w-full text-sm" aria-label="Ordinačné hodiny">
      <tbody>
        {hours.map((row, i) => {
          const rowIndex = guessIndex(row.day, -1)
          const isToday = rowIndex === today
          return (
            <tr
              key={row.day}
              className={`border-b border-black/5 last:border-0 transition-colors ${
                isToday ? 'rounded-md' : ''
              }`}
              style={isToday ? { backgroundColor: `${accentColor}15` } : undefined}
              aria-current={isToday ? 'date' : undefined}
            >
              <td className="py-2.5 pr-4">
                <span
                  className={`font-medium ${isToday ? 'font-semibold' : ''}`}
                  style={isToday ? { color: accentColor } : undefined}
                >
                  {row.day}
                </span>
                {isToday && (
                  <span
                    className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide"
                    style={{ backgroundColor: accentColor, color: '#fff' }}
                  >
                    Dnes
                  </span>
                )}
              </td>
              <td className="py-2.5 text-right">
                {row.closed ? (
                  <span className="text-black/35 font-medium">Zatvorené</span>
                ) : (
                  <span
                    className="font-semibold"
                    style={isToday ? { color: accentColor } : undefined}
                  >
                    {row.open} – {row.close}
                  </span>
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
