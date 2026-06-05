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
    const tzWall = new Date(asIfUtc.toLocaleString('en-US', { timeZone: tz }));
    const utcWall = new Date(asIfUtc.toLocaleString('en-US', { timeZone: 'UTC' }));
    const offsetMs = utcWall.getTime() - tzWall.getTime();
    return asIfUtc.getTime() + offsetMs;
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

export function pad2(n: number): string {
  n = Number(n) || 0;
  return n < 10 ? `0${n}` : String(n);
}
