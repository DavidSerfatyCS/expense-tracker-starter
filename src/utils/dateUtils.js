export function getPeriodBounds(type, offset) {
  const today = new Date();
  const toYMD = (d) => d.toISOString().split('T')[0];

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
