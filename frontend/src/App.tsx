import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Ingest from './pages/Ingest';
import DataView from './pages/DataView';
import Settings from './pages/Settings';
import './App.css';

function NavLink({ to, children, icon }: { to: string; children: React.ReactNode; icon: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to} className={`nav-item ${isActive ? 'active' : ''}`}>
      <span className="nav-icon">{icon}</span>
      {children}
    </Link>
  );
}

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app">
      <button
        className="mobile-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-icon">TE</div>
          <h1>Text Extractor</h1>
        </div>

        <div className="nav-links">
          <NavLink to="/" icon="📊">Dashboard</NavLink>
          <NavLink to="/ingest" icon="📥">Ingest Text</NavLink>
          <NavLink to="/data" icon="⚡">Bulk Extraction</NavLink>
          <NavLink to="/settings" icon="⚙️">Settings</NavLink>
        </div>
      </nav>

      <main className="main-content" onClick={() => setSidebarOpen(false)}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ingest" element={<Ingest />} />
          <Route path="/data" element={<DataView />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
