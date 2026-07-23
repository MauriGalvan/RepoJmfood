import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { initDB } from './db';
import Login from './pages/Login';
import Venta from './pages/Venta';
import Productos from './pages/Productos';
import Clientes from './pages/Clientes';
import Historial from './pages/Historial';
import Caja from './pages/Caja';
import AdminUsers from './pages/AdminUsers';
import './App.css';

function Nav({ user, onLogout }) {
  const loc = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const mainTabs = [
    { path: '/', label: 'Venta', icon: '🛒' },
    { path: '/historial', label: 'Historial', icon: '📋' },
    { path: '/caja', label: 'Caja', icon: '💰' },
  ];

  const menuItems = [
    { path: '/productos', label: 'Productos', icon: '🍔' },
    { path: '/clientes', label: 'Clientes', icon: '👥' },
    ...(user.rol === 'admin' ? [{ path: '/usuarios', label: 'Usuarios', icon: '🔑' }] : []),
  ];

  function handleMenuClick(path) {
    setMenuOpen(false);
    navigate(path);
  }

  return (
    <>
      {menuOpen && <div className="menu-overlay" onClick={() => setMenuOpen(false)} />}
      <div className={`side-menu ${menuOpen ? 'open' : ''}`}>
        <div className="side-menu-header">
          <div className="side-menu-logo">JM</div>
          <div>
            <div className="side-menu-user">{user.usuario}</div>
            <div className="side-menu-role">{user.rol}</div>
          </div>
        </div>
        <div className="side-menu-items">
          {menuItems.map(item => (
            <button
              key={item.path}
              className={`side-menu-item ${loc.pathname === item.path ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.path)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
          <div className="side-menu-divider" />
          <button className="side-menu-item logout" onClick={onLogout}>
            <span>🚪</span>
            <span>Salir</span>
          </button>
        </div>
      </div>

      <nav className="bottom-nav">
        {mainTabs.map(t => (
          <Link key={t.path} to={t.path} className={`nav-item ${loc.pathname === t.path ? 'active' : ''}`}>
            <span className="nav-icon">{t.icon}</span>
            <span className="nav-label">{t.label}</span>
          </Link>
        ))}
        <button className={`nav-item ${menuOpen ? 'active' : ''}`} onClick={() => setMenuOpen(!menuOpen)}>
          <span className="nav-icon">☰</span>
          <span className="nav-label">Menú</span>
        </button>
      </nav>
    </>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    initDB().then(() => setReady(true));
  }, []);

  if (!ready) return <div className="loading">Cargando...</div>;

  if (!user) {
    return (
      <div className="app">
        <Login onLogin={setUser} />
      </div>
    );
  }

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
            {user.rol === 'admin' && <Route path="/usuarios" element={<AdminUsers />} />}
          </Routes>
        </div>
        <Nav user={user} onLogout={() => setUser(null)} />
      </div>
    </HashRouter>
  );
}
