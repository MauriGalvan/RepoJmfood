import { useState, useEffect } from 'react';
import { getVentas, getItemsVenta, deleteVenta } from '../db';

export default function Historial() {
  const [ventas, setVentas] = useState([]);
  const [search, setSearch] = useState('');
  const [detalle, setDetalle] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => { load(); }, []);

  async function load() {
    const v = await getVentas();
    setVentas(v.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
  }

  async function verDetalle(v) {
    const its = await getItemsVenta(v.id);
    setItems(its);
    setDetalle(v);
  }

  async function handleDelete(id) {
    if (confirm('Eliminar esta venta?')) {
      await deleteVenta(id);
      load();
      setDetalle(null);
    }
  }

  function formatFecha(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' }) +
      ' ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  }

  const filtered = ventas.filter(v =>
    v.clienteNombre?.toLowerCase().includes(search.toLowerCase()) ||
    formatFecha(v.fecha).includes(search)
  );

  const totalDelDia = (fecha) => {
    const d = new Date(fecha).toDateString();
    return ventas
      .filter(v => new Date(v.fecha).toDateString() === d)
      .reduce((s, v) => s + v.total, 0);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Historial</h1>
      </div>

      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          placeholder="Buscar por cliente o fecha..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-text">No hay ventas registradas</div>
        </div>
      )}

      {filtered.map(v => (
        <div key={v.id} className="venta-card" onClick={() => verDetalle(v)}>
          <div className="venta-header">
            <span className="venta-fecha">{formatFecha(v.fecha)}</span>
            <span className="venta-total">${v.total.toLocaleString()}</span>
          </div>
          <div className="venta-cliente">
            {v.clienteNombre || 'Cliente general'}
            {v.direccion && ` — 📍 ${v.direccion}`}
          </div>
          <div className="venta-items">
            {v.metodoPago === 'efectivo' ? '💵' : '📱'} {v.metodoPago}
          </div>
        </div>
      ))}

      {detalle && (
        <div className="modal-overlay" onClick={() => setDetalle(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalle de Venta</h2>
              <button className="modal-close" onClick={() => setDetalle(null)}>✕</button>
            </div>

            <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
              📅 {formatFecha(detalle.fecha)}<br />
              👤 {detalle.clienteNombre || 'Cliente general'}<br />
              {detalle.direccion && <>📍 {detalle.direccion}<br /></>}
              💳 {detalle.metodoPago}
            </div>

            <div style={{ borderBottom: '1.5px solid #e5e5e5', marginBottom: 8 }}>
              {items.map(it => (
                <div key={it.id} className="detalle-item">
                  <span>{it.nombre} x{it.cantidad}</span>
                  <span>${it.subtotal.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="sale-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${detalle.subtotal.toLocaleString()}</span>
              </div>
              {detalle.envio > 0 && (
                <div className="summary-row">
                  <span>Envío</span>
                  <span>${detalle.envio.toLocaleString()}</span>
                </div>
              )}
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>${detalle.total.toLocaleString()}</span>
              </div>
            </div>

            <button
              className="btn btn-danger"
              onClick={() => handleDelete(detalle.id)}
            >
              Eliminar Venta
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
