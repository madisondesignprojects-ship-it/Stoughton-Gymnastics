import cal from '../content/calendar.json';
export type CalItem = { type: 'classes' | 'closed'; text: string; flag?: string };
export type CalMonth = { month: string; ym: string; items: CalItem[] };
const months = cal as CalMonth[];
/** Build-time "today" in America/Chicago (YYYY-MM). */
function nowYm() {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
export function splitCalendar() {
  const ym = nowYm();
  return { upcoming: months.filter((m) => m.ym >= ym), past: months.filter((m) => m.ym < ym) };
}
export function nextUpcoming() {
  const { upcoming } = splitCalendar();
  const m = upcoming[0];
  return m ? { month: m.month, text: m.items[0].text } : null;
}
export function upcomingClosed() {
  for (const m of splitCalendar().upcoming) { const c = m.items.find((i) => i.type === 'closed'); if (c) return { month: m.month, text: c.text }; }
  return null;
}
