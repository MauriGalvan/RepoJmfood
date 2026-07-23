import { useState, useEffect } from 'react';
import {
  getClientes, addCliente, updateCliente, deleteCliente,
  getDirecciones, addDireccion, deleteDireccion, getAllDirecciones
} from '../db';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [direcciones, setDirecciones] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre: '', telefono: '' });
  const [showDirForm, setShowDirForm] = useState(null);
  const [dirForm, setDirForm] = useState({ calle: '', numero: '', piso: '', notas: '' });

  useEffect(() => { load(); }, []);

  async function load() {
    const c = await getClientes();
    const d = await getAllDirecciones();
    setClientes(c);
    setDirecciones(d);
  }

  const filtered = clientes.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.telefono?.includes(search)
  );

  function getDirCliente(clienteId) {
    return direcciones.filter(d => d.clienteId === clienteId);
  }

  function openNew() {
    setForm({ nombre: '', telefono: '' });
    setEditando(null);
    setShowForm(true);
  }

  function openEdit(c) {
    setForm({ nombre: c.nombre, telefono: c.telefono || '' });
    setEditando(c);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.nombre) return;
    if (editando) {
      await updateCliente({ ...form, id: editando.id });
    } else {
      await addCliente(form);
    }
    setShowForm(false);
    load();
  }

  async function handleDelete(id) {
    if (confirm('Eliminar cliente y sus direcciones?')) {
      const dirs = await getDirecciones(id);
      for (const d of dirs) await deleteDireccion(d.id);
      await deleteCliente(id);
      load();
    }
  }

  async function handleAddDir() {
    if (!dirForm.calle) return;
    await addDireccion({ ...dirForm, clienteId: showDirForm });
    setDirForm({ calle: '', numero: '', piso: '', notas: '' });
    load();
  }

  async function handleDeleteDir(id) {
    await deleteDireccion(id);
    load();
  }

  return (
    <div>
      <div className="page-header">
        <h1>Clientes</h1>
        <button className="btn btn-primary btn-sm" onClick={openNew}>+ Nuevo</button>
      </div>

      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          placeholder="Buscar cliente..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <div className="empty-state-text">No hay clientes</div>
        </div>
      )}

      {filtered.map(c => (
        <div key={c.id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{c.nombre}</div>
              {c.telefono && <div style={{ fontSize: 13, color: '#666' }}>📱 {c.telefono}</div>}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}>✏️</button>
              <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(c.id)}>✕</button>
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#666' }}>DIRECCIONES</span>
              <button
                className="btn btn-outline btn-sm"
                style={{ padding: '4px 8px', fontSize: 12 }}
                onClick={() => setShowDirForm(showDirForm === c.id ? null : c.id)}
              >
                {showDirForm === c.id ? 'Cancelar' : '+ Agregar'}
              </button>
            </div>

            {getDirCliente(c.id).map(d => (
              <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13, borderBottom: '1px solid #e5e5e5' }}>
                <span>
                  {d.calle} {d.numero}{d.piso ? `, Piso ${d.piso}` : ''}
                  {d.notas && <span style={{ color: '#999' }}> ({d.notas})</span>}
                </span>
                <button
                  style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 14 }}
                  onClick={() => handleDeleteDir(d.id)}
                >
                  ✕
                </button>
              </div>
            ))}

            {getDirCliente(c.id).length === 0 && (
              <div style={{ fontSize: 12, color: '#999', padding: '4px 0' }}>Sin direcciones</div>
            )}

            {showDirForm === c.id && (
              <div style={{ marginTop: 8, background: '#f9f9f9', padding: 10, borderRadius: 8 }}>
                <div className="form-group" style={{ marginBottom: 8 }}>
                  <input
                    placeholder="Calle *"
                    value={dirForm.calle}
                    onChange={e => setDirForm({ ...dirForm, calle: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    placeholder="Número"
                    value={dirForm.numero}
                    onChange={e => setDirForm({ ...dirForm, numero: e.target.value })}
                    style={{ flex: 1, padding: '8px 10px', border: '1.5px solid #e5e5e5', borderRadius: 8, fontSize: 14 }}
                  />
                  <input
                    placeholder="Piso"
                    value={dirForm.piso}
                    onChange={e => setDirForm({ ...dirForm, piso: e.target.value })}
                    style={{ flex: 1, padding: '8px 10px', border: '1.5px solid #e5e5e5', borderRadius: 8, fontSize: 14 }}
                  />
                </div>
                <input
                  placeholder="Notas (timbre, depto, etc.)"
                  value={dirForm.notas}
                  onChange={e => setDirForm({ ...dirForm, notas: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #e5e5e5', borderRadius: 8, fontSize: 14, marginBottom: 8 }}
                />
                <button className="btn btn-success btn-sm" onClick={handleAddDir}>Guardar Dirección</button>
              </div>
            )}
          </div>
        </div>
      ))}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editando ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="form-group">
              <label>Nombre *</label>
              <input
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej: Juan Pérez"
              />
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <input
                value={form.telefono}
                onChange={e => setForm({ ...form, telefono: e.target.value })}
                placeholder="Ej: 11-1234-5678"
              />
            </div>
            <button className="btn btn-primary" onClick={handleSave}>
              {editando ? 'Guardar Cambios' : 'Agregar Cliente'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
