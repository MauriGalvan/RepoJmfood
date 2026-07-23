import { useState, useEffect } from 'react';
import { getUsuarios, addUsuario, deleteUsuario } from '../db';

export default function AdminUsers() {
  const [usuarios, setUsuarios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ usuario: '', password: '', rol: 'usuario' });

  useEffect(() => { load(); }, []);

  async function load() {
    const data = await getUsuarios();
    setUsuarios(data);
  }

  async function handleAdd() {
    if (!form.usuario.trim() || !form.password.trim()) return;
    await addUsuario(form.usuario, form.password, form.rol);
    setForm({ usuario: '', password: '', rol: 'usuario' });
    setShowForm(false);
    load();
  }

  async function handleDelete(id) {
    if (confirm('Eliminar este usuario?')) {
      await deleteUsuario(id);
      load();
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Usuarios</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>+ Nuevo</button>
      </div>

      {usuarios.map(u => (
        <div key={u.id} className="product-item">
          <div className="product-info">
            <div className="product-name">{u.usuario}</div>
            <div className="product-cat">{u.rol}</div>
          </div>
          <button
            className="btn btn-danger btn-sm btn-icon"
            onClick={() => handleDelete(u.id)}
          >
            ✕
          </button>
        </div>
      ))}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nuevo Usuario</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="form-group">
              <label>Usuario</label>
              <input
                value={form.usuario}
                onChange={e => setForm({ ...form, usuario: e.target.value })}
                placeholder="Nombre de usuario"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Contraseña"
              />
            </div>
            <div className="form-group">
              <label>Rol</label>
              <select value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })}>
                <option value="usuario">Usuario</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={handleAdd}>Crear Usuario</button>
          </div>
        </div>
      )}
    </div>
  );
}
