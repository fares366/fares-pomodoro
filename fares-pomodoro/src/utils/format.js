// Small formatting helpers.

export function formatClock(total) {
  const s = Math.max(0, Math.floor(total));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

// Time tracked on a task: 0s, 45s, 2m 5s, 1h 3m
export function formatTracked(total) {
  const s = Math.max(0, Math.floor(total));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

// Total focus time: 45m, 2h 5m
export function formatMinutes(total) {
  const m = Math.max(0, Math.round(total));
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

// Local-date key (YYYY-MM-DD) used for the daily streak.
export function dateKey(date = new Date()) {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${mo}-${d}`;
}

export function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dateKey(d);
}

export function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
