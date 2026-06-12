const ICONS = {
  overview: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="5" rx="2" />
      <rect x="13" y="10" width="8" height="11" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
    </svg>
  ),
  analytics: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M5 21V13" />
      <path d="M10 21V7" />
      <path d="M15 21V11" />
      <path d="M20 21V4" />
    </svg>
  ),
  transactions: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h13" /><path d="M14 4l3 3-3 3" />
      <path d="M20 17H7" /><path d="M10 14l-3 3 3 3" />
    </svg>
  ),
  budgets: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l4 2.5" />
    </svg>
  ),
};

const NAV_ITEMS = [
  { id: 'overview',     label: 'Overview' },
  { id: 'analytics',    label: 'Analytics' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'budgets',      label: 'Budgets' },
];

function AppNav({ view, onNavigate, theme, onToggleTheme }) {
  return (
    <nav className="app-nav">
      <div className="app-nav-brand">Finance<em>.</em></div>
      <ul className="app-nav-list">
        {NAV_ITEMS.map(item => (
          <li key={item.id}>
            <button
              className={`app-nav-item ${view === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="app-nav-icon">{ICONS[item.id]}</span>
              {item.label}
            </button>
          </li>
        ))}
      </ul>
      <div className="app-nav-footer">
        <button className="theme-toggle" onClick={onToggleTheme} aria-label="Toggle theme">
          <span className="app-nav-icon">
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
              </svg>
            )}
          </span>
          <span className="theme-toggle-label">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
        </button>
      </div>
    </nav>
  );
}

export default AppNav;
