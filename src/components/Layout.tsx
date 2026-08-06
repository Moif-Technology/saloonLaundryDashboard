import { Outlet, useNavigate } from 'react-router-dom';
import { authAPI } from '../lib/auth';
import './Layout.css';

export default function Layout() {
  const navigate = useNavigate();
  const user = authAPI.getCurrentUser();

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>Dashboard</h2>
        </div>
        <ul className="nav-menu">
          <li>
            <a href="/" className="nav-link">
              📊 Overview
            </a>
          </li>
          <li>
            <a href="/counter-close" className="nav-link">
              🔐 Counter Close
            </a>
          </li>
          <li>
            <a href="/daily-sales" className="nav-link">
              📈 Daily Sales
            </a>
          </li>
          <li>
            <a href="/staff-performance" className="nav-link">
              👥 Staff Performance
            </a>
          </li>
          <li>
            <a href="/inventory" className="nav-link">
              📦 Inventory
            </a>
          </li>
          <li>
            <a href="/customer-ledger" className="nav-link">
              💳 Customer Ledger
            </a>
          </li>
        </ul>
        <div className="sidebar-footer">
          <div className="user-info">
            <p className="user-name">{user?.name}</p>
            <p className="user-role">{user?.role}</p>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </nav>

      <div className="main-content">
        <header className="topbar">
          <h1>Salon Laundry Dashboard</h1>
          <div className="topbar-actions">
            <span className="time" id="current-time"></span>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
