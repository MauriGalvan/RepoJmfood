import { useState } from 'react';
import { login } from '../db';

export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const user = await login(usuario, password);
    setLoading(false);
    if (user) {
      onLogin(user);
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">JM</div>
        <h1 className="login-title">jmfood</h1>
        <p className="login-subtitle">Sistema de Rotisería</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Usuario</label>
            <input
              value={usuario}
              onChange={e => setUsuario(e.target.value)}
              placeholder="Tu usuario"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Tu contraseña"
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
