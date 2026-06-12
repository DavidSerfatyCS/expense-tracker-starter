// Reads the active theme's CSS custom properties so recharts (which needs
// concrete color values, not var() references) stays in sync with light/dark
// mode. Called during render: the theme toggle flips data-theme on <html>
// *before* setState, so by the time charts re-render the values are current.
export function getChartColors() {
  const styles = getComputedStyle(document.documentElement);
  const v = (name) => styles.getPropertyValue(name).trim();
  return {
    income:  v('--income')  || '#2d6a4f',
    expense: v('--expense') || '#b84030',
    accent:  v('--accent')  || '#b8512f',
    muted:   v('--muted')   || '#8d7f6e',
    border:  v('--border')  || '#e6dccb',
    text:    v('--text')    || '#1b1611',
  };
}

// Categorical palette derived from the theme for multi-series charts.
export function getCategoryPalette() {
  const { income, expense, accent, muted } = getChartColors();
  return [accent, income, '#7a89b8', '#c08c2e', expense, '#8c6e9e', muted];
}
