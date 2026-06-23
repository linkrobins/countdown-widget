/**
 * Interprets a naive `YYYY-MM-DDTHH:mm` string as wall-clock time in the given
 * IANA timezone and returns the corresponding UTC epoch milliseconds.
 */
export function naiveToUTC(isoLocal: string | null | undefined, tz: string): number | null {
  if (!isoLocal) return null;

  let normalized = String(isoLocal).trim();
  normalized = normalized.replace(/[Zz]$|[+-]\d\d:?\d\d$/, '');

  const asIfUtc = new Date(`${normalized}Z`);
  if (isNaN(asIfUtc.getTime())) return null;

  if (!tz) tz = 'UTC';

  try {
    // Derive the zone's offset by formatting the instant in `tz` (via
    // Intl.formatToParts, which is DST-aware for the given date) and reading
    // those wall-clock parts back as if they were UTC. The gap between the
    // formatted parts and asIfUtc is the offset; subtracting it maps the
    // intended wall-clock time to the correct UTC epoch. This replaces a
    // toLocaleString() + new Date() round-trip that reparsed in the browser's
    // local zone and could land an hour off near a DST transition.
    //
    // Caveat: the offset is read at asIfUtc, so a target set inside the one
    // ambiguous/skipped hour of a DST change can still be off by an hour --
    // acceptable for a countdown target, which is never set on that boundary.
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const parts: Record<string, number> = {};
    for (const p of dtf.formatToParts(asIfUtc)) {
      if (p.type !== 'literal') parts[p.type] = parseInt(p.value, 10);
    }
    const hour = parts.hour === 24 ? 0 : parts.hour; // Intl can emit "24" for midnight
    const asTzWall = Date.UTC(parts.year, parts.month - 1, parts.day, hour, parts.minute, parts.second);
    const offsetMs = asTzWall - asIfUtc.getTime();
    return asIfUtc.getTime() - offsetMs;
  } catch (e) {
    return asIfUtc.getTime();
  }
}

export interface TimeParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function breakDown(ms: number): TimeParts {
  if (ms < 0) ms = 0;
  const totalSec = Math.floor(ms / 1000);
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
  };
}

export function twoDigits(n: number): string {
  n = Number(n) || 0;
  return n < 10 ? `0${n}` : String(n);
}
