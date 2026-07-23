import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { initDB } from './db';
import Venta from './pages/Venta';
import Productos from './pages/Productos';
import Clientes from './pages/Clientes';
import Historial from './pages/Historial';
import Caja from './pages/Caja';
import './App.css';

function Nav() {
  const loc = useLocation();
  const tabs = [
    { path: '/', label: 'Nueva Venta', icon: '🛒' },
    { path: '/historial', label: 'Historial', icon: '📋' },
    { path: '/productos', label: 'Productos', icon: '🍔' },
    { path: '/clientes', label: 'Clientes', icon: '👥' },
    { path: '/caja', label: 'Caja', icon: '💰' },
  ];
  return (
    <nav className="bottom-nav">
      {tabs.map(t => (
        <Link key={t.path} to={t.path} className={`nav-item ${loc.pathname === t.path ? 'active' : ''}`}>
          <span className="nav-icon">{t.icon}</span>
          <span className="nav-label">{t.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initDB().then(() => setReady(true));
  }, []);

  if (!ready) return <div className="loading">Cargando...</div>;

  return (
    <HashRouter>
      <div className="app">
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Venta />} />
            <Route path="/historial" element={<Historial />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/caja" element={<Caja />} />
          </Routes>
        </div>
        <Nav />
      </div>
    </HashRouter>
  );
}
