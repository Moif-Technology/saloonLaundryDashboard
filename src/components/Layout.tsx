import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../lib/auth';
import {
  IconGauge,
  IconGrid,
  IconLedger,
  IconSignOut,
  IconStaff,
  IconStock,
  IconTrend,
  IconVault,
} from './Icon';
import './Layout.css';

type NavItem = {
  to: string;
  label: string;
  short: string;
  icon: (props: { size?: number }) => JSX.Element;
};

const NAV: NavItem[] = [
  { to: '/', label: 'Overview', short: 'Overview', icon: IconGauge },
  { to: '/daily-sales', label: 'Daily Sales', short: 'Sales', icon: IconTrend },
  { to: '/counter-closes', label: 'Counter Closes', short: 'Closes', icon: IconVault },
  { to: '/inventory', label: 'Inventory', short: 'Stock', icon: IconStock },
  { to: '/staff-performance', label: 'Staff Performance', short: 'Staff', icon: IconStaff },
  { to: '/customer-ledger', label: 'Customer Ledger', short: 'Ledger', icon: IconLedger },
];

/* Four tabs stay on the thumb bar; the rest live behind "More". */
const PRIMARY = NAV.slice(0, 4);
const SECONDARY = NAV.slice(4);

const initialsOf = (name?: string) =>
  (name || 'Counter')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

interface LayoutProps {
  setIsAuthenticated: (value: boolean) => void;
}

export default function Layout({ setIsAuthenticated }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authAPI.getCurrentUser();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());

  /**
   * Clearing the token is not enough — App gates every route on its
   * isAuthenticated state. Without flipping it, /login bounces straight back
   * to the dashboard, which then fetches with no token and shows an error.
   */
  const handleLogout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
    setSheetOpen(false);
    navigate('/login', { replace: true });
  };

  /* Counter staff read the clock off this bar during settlement. */
  useEffect(() => {
    const tick = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    setSheetOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSheetOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheetOpen]);

  /* Prefix match so a detail route (/counter-closes/42) keeps its section lit. */
  const matches = (to: string, path: string) =>
    to === '/' ? path === '/' : path === to || path.startsWith(`${to}/`);

  const active = NAV.find((item) => matches(item.to, location.pathname));
  const inSecondary = SECONDARY.some((item) => matches(item.to, location.pathname));

  return (
    <div className="shell">
      <aside className="rail">
        <div className="rail-brand">
          <span className="brand-mark">CL</span>
          <span className="brand-text">
            <strong>Counterline</strong>
            <em>Salon &amp; Laundry</em>
          </span>
        </div>

        <nav className="rail-nav" aria-label="Sections">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `rail-link${isActive ? ' is-active' : ''}`}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="rail-foot">
          <div className="identity">
            <span className="avatar">{initialsOf(user?.name)}</span>
            <span className="identity-text">
              <strong className="truncate">{user?.name || 'Signed in'}</strong>
              <em className="truncate">{user?.role || 'Counter'}</em>
            </span>
          </div>
          <button type="button" className="btn btn-quiet btn-sm btn-block" onClick={handleLogout}>
            <IconSignOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      <header className="appbar">
        <div className="appbar-lead">
          <span className="brand-mark is-compact">CL</span>
          <span className="appbar-titles">
            <strong>{active?.label || 'Counterline'}</strong>
            <em>
              {now.toLocaleDateString('en-AE', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
              {' · '}
              {now.toLocaleTimeString('en-AE', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </em>
          </span>
        </div>

        <button
          type="button"
          className="avatar-btn"
          onClick={() => setSheetOpen(true)}
          aria-label="Account and more sections"
        >
          {initialsOf(user?.name)}
        </button>
      </header>

      <main className="canvas">
        <Outlet />
      </main>

      <nav className="tabbar" aria-label="Primary">
        {PRIMARY.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `tab${isActive ? ' is-active' : ''}`}
            >
              <Icon size={21} />
              <span>{item.short}</span>
            </NavLink>
          );
        })}
        <button
          type="button"
          className={`tab${inSecondary ? ' is-active' : ''}`}
          onClick={() => setSheetOpen(true)}
        >
          <IconGrid size={21} />
          <span>More</span>
        </button>
      </nav>

      {sheetOpen && (
        <div className="sheet-layer">
          <button
            type="button"
            className="sheet-scrim"
            aria-label="Close menu"
            onClick={() => setSheetOpen(false)}
          />
          <div className="sheet" role="dialog" aria-modal="true" aria-label="Account and sections">
            <span className="sheet-grip" />

            <div className="sheet-identity">
              <span className="avatar is-lg">{initialsOf(user?.name)}</span>
              <span className="identity-text">
                <strong>{user?.name || 'Signed in'}</strong>
                <em>{user?.email || user?.role || 'Counter access'}</em>
              </span>
            </div>

            <div className="sheet-nav">
              {SECONDARY.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `sheet-link${isActive ? ' is-active' : ''}`}
                  >
                    <Icon size={19} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>

            <button type="button" className="btn btn-quiet btn-block" onClick={handleLogout}>
              <IconSignOut size={18} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
