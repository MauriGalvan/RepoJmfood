import { useState, useEffect } from 'react';
import { getProductos, addProducto, updateProducto, deleteProducto } from '../db';

const CATEGORIAS = ['Hamburguesas', 'Sándwich de Milanesa', 'Milanesas al plato', 'Empanadas', 'Pizzas', 'Papas Fritas'];

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre: '', precio: '', categoria: '' });

  useEffect(() => { load(); }, []);

  async function load() {
    const data = await getProductos();
    setProductos(data);
  }

  const categorias = [...new Set(productos.map(p => p.categoria))].sort();
  const filtered = productos.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.categoria.toLowerCase().includes(search.toLowerCase())
  );

  function openNew() {
    setForm({ nombre: '', precio: '', categoria: '' });
    setEditando(null);
    setShowForm(true);
  }

  function openEdit(p) {
    setForm({ nombre: p.nombre, precio: p.precio, categoria: p.categoria });
    setEditando(p);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.nombre || !form.precio) return;
    const data = { ...form, precio: Number(form.precio) };
    if (editando) {
      await updateProducto({ ...data, id: editando.id });
    } else {
      await addProducto(data);
    }
    setShowForm(false);
    load();
  }

  async function handleDelete(id) {
    if (confirm('Eliminar producto?')) {
      await deleteProducto(id);
      load();
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Productos</h1>
        <button className="btn btn-primary btn-sm" onClick={openNew}>+ Nuevo</button>
      </div>

      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          placeholder="Buscar producto..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🍔</div>
          <div className="empty-state-text">No hay productos</div>
        </div>
      )}

      {filtered.map(p => (
        <div key={p.id} className="product-item" onClick={() => openEdit(p)}>
          <div className="product-info">
            <div className="product-name">{p.nombre}</div>
            <div className="product-cat">{p.categoria}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="product-price">${p.precio.toLocaleString()}</div>
            <button
              className="btn btn-danger btn-sm btn-icon"
              onClick={e => { e.stopPropagation(); handleDelete(p.id); }}
            >
              ✕
            </button>
          </div>
        </div>
      ))}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editando ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="form-group">
              <label>Nombre</label>
              <input
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej: Pizza Muzzarella"
              />
            </div>
            <div className="form-group">
              <label>Precio ($)</label>
              <input
                type="number"
                value={form.precio}
                onChange={e => setForm({ ...form, precio: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Categoría</label>
              <select
                value={form.categoria}
                onChange={e => setForm({ ...form, categoria: e.target.value })}
              >
                <option value="">Seleccionar categoría</option>
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" onClick={handleSave}>
              {editando ? 'Guardar Cambios' : 'Agregar Producto'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
