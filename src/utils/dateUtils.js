// Format a Date as YYYY-MM-DD in LOCAL time. toISOString() converts to UTC,
// which rolls the date back a day in positive-offset timezones (e.g. month
// start lands on the previous month's last day), shifting period bounds, chart
// labels, and the date stamped on newly-added transactions.
export function toYMD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getPeriodBounds(type, offset) {
  const today = new Date();

  if (type === 'week') {
    const dow = today.getDay(); // 0 = Sun
    const daysToMon = dow === 0 ? 6 : dow - 1;
    const mon = new Date(today);
    mon.setDate(today.getDate() - daysToMon + offset * 7);
    mon.setHours(0, 0, 0, 0);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    const label =
      mon.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
      ' – ' +
      sun.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return { start: toYMD(mon), end: toYMD(sun), label };
  }

  // month
  const firstDay = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const lastDay  = new Date(today.getFullYear(), today.getMonth() + offset + 1, 0);
  return {
    start: toYMD(firstDay),
    end:   toYMD(lastDay),
    label: firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  };
}
