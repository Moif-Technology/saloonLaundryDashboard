import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { authAPI } from './lib/auth';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CounterHistory from './pages/CounterHistory';
import CounterCloseDetail from './pages/CounterCloseDetail';
import DailySales from './pages/DailySales';
import StaffPerformance from './pages/StaffPerformance';
import Inventory from './pages/Inventory';
import CustomerLedger from './pages/CustomerLedger';
import Login from './pages/Login';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsAuthenticated(authAPI.isAuthenticated());
    setIsLoading(false);
  }, []);

  /* api.ts fires this when the refresh token is gone or rejected. */
  useEffect(() => {
    const onExpired = () => setIsAuthenticated(false);
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  if (isLoading) {
    return (
      <div className="boot">
        <div className="boot-mark">CL</div>
        <p className="boot-label">Counterline</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <Login setIsAuthenticated={setIsAuthenticated} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          element={
            isAuthenticated ? (
              <Layout setIsAuthenticated={setIsAuthenticated} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/counter-closes" element={<CounterHistory />} />
          <Route path="/counter-closes/:closeId" element={<CounterCloseDetail />} />
          <Route path="/daily-sales" element={<DailySales />} />
          <Route path="/staff-performance" element={<StaffPerformance />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/customer-ledger" element={<CustomerLedger />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
