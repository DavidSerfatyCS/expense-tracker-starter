import { useState } from 'react';

const NAV_ITEMS = [
  { id: 'overview',     label: 'Overview',     icon: '◧' },
  { id: 'analytics',    label: 'Analytics',    icon: '◔' },
  { id: 'transactions', label: 'Transactions', icon: '≡' },
  { id: 'fixed',        label: 'Fixed Items',  icon: '⤬' },
];

function AppNav() {
  const [active, setActive] = useState('overview');

  const goTo = (id) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className="app-nav">
      <div className="app-nav-brand">Finance</div>
      <ul className="app-nav-list">
        {NAV_ITEMS.map(item => (
          <li key={item.id}>
            <button
              className={`app-nav-item ${active === item.id ? 'active' : ''}`}
              onClick={() => goTo(item.id)}
            >
              <span className="app-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default AppNav;
