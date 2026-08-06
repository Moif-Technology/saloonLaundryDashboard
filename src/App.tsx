import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { authAPI } from './lib/auth';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CounterClose from './pages/CounterClose';
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

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={!isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" />}
        />
        <Route
          element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/counter-close" element={<CounterClose />} />
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
