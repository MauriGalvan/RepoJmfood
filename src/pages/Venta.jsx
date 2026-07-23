import { useState, useEffect } from 'react';
import {
  getProductos, getClientes, getAllDirecciones, addVenta, addCliente, addDireccion,
  getUltimaCaja
} from '../db';

const CATEGORIAS = ['Hamburguesas', 'Sándwich de Milanesa', 'Milanesas al plato', 'Empanadas', 'Pizzas', 'Papas Fritas'];

export default function Venta() {
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [direcciones, setDirecciones] = useState([]);
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('Todos');
  const [carrito, setCarrito] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showPay, setShowPay] = useState(false);
  const [clienteSel, setClienteSel] = useState(null);
  const [dirSel, setDirSel] = useState(null);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [envio, setEnvio] = useState('');
  const [cajaAbierta, setCajaAbierta] = useState(null);

  const [showNewClient, setShowNewClient] = useState(false);
  const [newClient, setNewClient] = useState({ nombre: '', telefono: '' });
  const [newDir, setNewDir] = useState({ calle: '', numero: '', piso: '', notas: '' });

  useEffect(() => { load(); }, []);

  async function load() {
    const [p, c, d, cj] = await Promise.all([getProductos(), getClientes(), getAllDirecciones(), getUltimaCaja()]);
    setProductos(p);
    setClientes(c);
    setDirecciones(d);
    setCajaAbierta(cj);
  }

  const filtered = productos.filter(p => {
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoria === 'Todos' || p.categoria === categoria;
    return matchSearch && matchCat;
  });

  function addToCart(producto) {
    setCarrito(prev => {
      const existing = prev.find(i => i.id === producto.id);
      if (existing) return prev.map(i => i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      return [...prev, { ...producto, cantidad: 1 }];
    });
  }

  function updateQty(id, delta) {
    setCarrito(prev =>
      prev.map(i => i.id === id ? { ...i, cantidad: Math.max(0, i.cantidad + delta) } : i)
        .filter(i => i.cantidad > 0)
    );
  }

  function subtotal() {
    return carrito.reduce((sum, i) => sum + i.precio * i.cantidad, 0);
  }

  function total() {
    return subtotal() + Number(envio || 0);
  }

  async function saveNewClient() {
    if (!newClient.nombre.trim()) return;
    const clienteId = await addCliente(newClient);
    let dirId = null;
    if (newDir.calle.trim()) {
      dirId = await addDireccion({ ...newDir, clienteId });
    }
    await load();
    const cliente = { id: clienteId, ...newClient };
    setClienteSel(cliente);
    if (dirId) {
      const dirs = await getAllDirecciones();
      setDirecciones(dirs);
      const dir = dirs.find(d => d.id === dirId);
      setDirSel(dir || null);
    }
    setShowNewClient(false);
    setNewClient({ nombre: '', telefono: '' });
    setNewDir({ calle: '', numero: '', piso: '', notas: '' });
  }

  async function confirmarVenta() {
    if (carrito.length === 0) return;
    if (!cajaAbierta || !cajaAbierta.abierta) {
      alert('Primero abrí la caja desde la pestaña Caja');
      return;
    }
    const venta = {
      fecha: new Date().toISOString(),
      subtotal: subtotal(),
      envio: Number(envio || 0),
      total: total(),
      metodoPago,
      clienteId: clienteSel?.id || null,
      clienteNombre: clienteSel?.nombre || 'Cliente general',
      direccion: dirSel ? `${dirSel.calle} ${dirSel.numero}${dirSel.piso ? `, Piso ${dirSel.piso}` : ''}` : null,
    };
    const items = carrito.map(i => ({
      productoId: i.id,
      nombre: i.nombre,
      precio: i.precio,
      cantidad: i.cantidad,
      subtotal: i.precio * i.cantidad,
    }));
    await addVenta(venta, items);
    setCarrito([]);
    setEnvio('');
    setShowPay(false);
    setShowCart(false);
    alert('Venta registrada!');
  }

  function dirCliente() {
    if (!clienteSel) return [];
    return direcciones.filter(d => d.clienteId === clienteSel.id);
  }

  function renderProductosAgrupados(items) {
    const CATEGORIAS_CON_PORCION = ['Sándwich de Milanesa', 'Milanesas al plato', 'Papas Fritas'];

    if (!CATEGORIAS_CON_PORCION.includes(categoria)) {
      return items.map(p => (
        <div key={p.id} className="product-item" onClick={() => addToCart(p)}>
          <div className="product-info">
            <div className="product-name">{p.nombre}</div>
            <div className="product-cat">{p.categoria}</div>
          </div>
          <div className="product-price">${p.precio.toLocaleString()}</div>
        </div>
      ));
    }

    const chicas = items.filter(p => /chic[oa]/i.test(p.nombre));
    const grandes = items.filter(p => /grand[eo]/i.test(p.nombre));
    const otros = items.filter(p => !/chic[oa]/i.test(p.nombre) && !/grand[eo]/i.test(p.nombre));

    return (
      <>
        {chicas.length > 0 && (
          <>
            <div className="portion-header portion-chica">Porción Chica</div>
            {chicas.map(p => (
              <div key={p.id} className="product-item" onClick={() => addToCart(p)}>
                <div className="product-info">
                  <div className="product-name">{p.nombre}</div>
                </div>
                <div className="product-price">${p.precio.toLocaleString()}</div>
              </div>
            ))}
          </>
        )}
        {grandes.length > 0 && (
          <>
            <div className="portion-header portion-grande">Porción Grande</div>
            {grandes.map(p => (
              <div key={p.id} className="product-item" onClick={() => addToCart(p)}>
                <div className="product-info">
                  <div className="product-name">{p.nombre}</div>
                </div>
                <div className="product-price">${p.precio.toLocaleString()}</div>
              </div>
            ))}
          </>
        )}
        {otros.map(p => (
          <div key={p.id} className="product-item" onClick={() => addToCart(p)}>
            <div className="product-info">
              <div className="product-name">{p.nombre}</div>
            </div>
            <div className="product-price">${p.precio.toLocaleString()}</div>
          </div>
        ))}
      </>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Nueva Venta</h1>
      </div>

      {!cajaAbierta || !cajaAbierta.abierta ? (
        <div className="card" style={{ textAlign: 'center', background: '#fef3c7', borderColor: '#f59e0b' }}>
          <div style={{ fontSize: 14, color: '#92400e' }}>
            ⚠️ La caja está cerrada. Andá a la pestaña <strong>Caja</strong> para abrirla.
          </div>
        </div>
      ) : null}

      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input placeholder="Buscar producto..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="category-tabs">
        <button className={`category-tab ${categoria === 'Todos' ? 'active' : ''}`} onClick={() => setCategoria('Todos')}>
          Todos
        </button>
        {CATEGORIAS.map(c => (
          <button key={c} className={`category-tab ${categoria === c ? 'active' : ''}`} onClick={() => setCategoria(c)}>
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-text">No hay productos en esta categoría</div>
        </div>
      )}

      {renderProductosAgrupados(filtered)}

      {/* Carrito modal */}
      {showCart && (
        <div className="modal-overlay" onClick={() => setShowCart(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Carrito</h2>
              <button className="modal-close" onClick={() => setShowCart(false)}>✕</button>
            </div>

            {carrito.length === 0 ? (
              <div className="empty-state"><div className="empty-state-text">El carrito está vacío</div></div>
            ) : (
              <>
                {carrito.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.nombre}</div>
                      <div className="cart-item-price">${item.precio.toLocaleString()} c/u</div>
                    </div>
                    <div className="qty-controls">
                      <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
                      <span style={{ fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{item.cantidad}</span>
                      <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
                    </div>
                  </div>
                ))}

                {/* Envío */}
                <div className="form-group" style={{ marginTop: 12, marginBottom: 0 }}>
                  <label>Costo de envío ($)</label>
                  <input
                    type="number"
                    value={envio}
                    onChange={e => setEnvio(e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div className="sale-summary">
                  <div className="summary-row">
                    <span>Subtotal</span><span>${subtotal().toLocaleString()}</span>
                  </div>
                  {Number(envio || 0) > 0 && (
                    <div className="summary-row">
                      <span>Envío</span><span>${Number(envio).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="summary-row summary-total">
                    <span>Total</span><span>${total().toLocaleString()}</span>
                  </div>
                </div>

                {/* Selector de cliente + botón nuevo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                  <div style={{ flex: 1 }}>
                    <select
                      style={{ width: '100%', padding: 10, borderRadius: 8, border: '1.5px solid #e5e5e5', fontSize: 14 }}
                      value={clienteSel?.id || ''}
                      onChange={e => {
                        const c = clientes.find(cl => cl.id === Number(e.target.value));
                        setClienteSel(c || null);
                        setDirSel(null);
                      }}
                    >
                      <option value="">Cliente general</option>
                      {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  </div>
                  <button className="btn btn-outline btn-sm" style={{ whiteSpace: 'nowrap', padding: '8px 12px' }} onClick={() => setShowNewClient(true)}>
                    + Nuevo
                  </button>
                </div>

                {/* Direcciones del cliente */}
                {clienteSel && (
                  <>
                    <div className="section-title">Dirección de entrega</div>
                    {dirCliente().length > 0 ? (
                      <select
                        style={{ width: '100%', padding: 10, borderRadius: 8, border: '1.5px solid #e5e5e5', fontSize: 14 }}
                        value={dirSel?.id || ''}
                        onChange={e => {
                          const d = dirCliente().find(dd => dd.id === Number(e.target.value));
                          setDirSel(d || null);
                        }}
                      >
                        <option value="">Sin entrega</option>
                        {dirCliente().map(d => (
                          <option key={d.id} value={d.id}>
                            {d.calle} {d.numero}{d.piso ? `, Piso ${d.piso}` : ''}{d.notas ? ` (${d.notas})` : ''}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div style={{ fontSize: 13, color: '#999' }}>Este cliente no tiene direcciones guardadas</div>
                    )}
                  </>
                )}

                <button className="btn btn-primary" onClick={() => setShowPay(true)} style={{ marginTop: 12 }}>
                  Continuar al Pago
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal crear cliente nuevo */}
      {showNewClient && (
        <div className="modal-overlay" onClick={() => setShowNewClient(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nuevo Cliente</h2>
              <button className="modal-close" onClick={() => setShowNewClient(false)}>✕</button>
            </div>

            <div className="form-group">
              <label>Nombre *</label>
              <input value={newClient.nombre} onChange={e => setNewClient({ ...newClient, nombre: e.target.value })} placeholder="Ej: Juan Pérez" autoFocus />
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <input value={newClient.telefono} onChange={e => setNewClient({ ...newClient, telefono: e.target.value })} placeholder="Ej: 11-1234-5678" />
            </div>

            <div className="section-title">Dirección de entrega (opcional)</div>
            <div className="form-group" style={{ marginBottom: 8 }}>
              <input placeholder="Calle" value={newDir.calle} onChange={e => setNewDir({ ...newDir, calle: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input placeholder="Número" value={newDir.numero} onChange={e => setNewDir({ ...newDir, numero: e.target.value })} style={{ flex: 1, padding: '10px 12px', border: '1.5px solid #e5e5e5', borderRadius: 8, fontSize: 14 }} />
              <input placeholder="Piso" value={newDir.piso} onChange={e => setNewDir({ ...newDir, piso: e.target.value })} style={{ flex: 1, padding: '10px 12px', border: '1.5px solid #e5e5e5', borderRadius: 8, fontSize: 14 }} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <input placeholder="Notas (timbre, depto, etc.)" value={newDir.notas} onChange={e => setNewDir({ ...newDir, notas: e.target.value })} />
            </div>

            <div className="action-row" style={{ marginTop: 16 }}>
              <button className="btn btn-outline" onClick={() => setShowNewClient(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={saveNewClient}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Pago modal */}
      {showPay && (
        <div className="modal-overlay" onClick={() => setShowPay(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Pago</h2>
              <button className="modal-close" onClick={() => setShowPay(false)}>✕</button>
            </div>

            <div className="sale-summary" style={{ marginBottom: 16 }}>
              <div className="summary-row">
                <span>Subtotal</span><span>${subtotal().toLocaleString()}</span>
              </div>
              {Number(envio || 0) > 0 && (
                <div className="summary-row">
                  <span>Envío</span><span>${Number(envio).toLocaleString()}</span>
                </div>
              )}
              <div className="summary-row summary-total">
                <span>Total a pagar</span><span>${total().toLocaleString()}</span>
              </div>
            </div>

            <div className="section-title">Método de pago</div>
            <div className="payment-options">
              <button className={`payment-btn ${metodoPago === 'efectivo' ? 'selected' : ''}`} onClick={() => setMetodoPago('efectivo')}>
                💵 Efectivo
              </button>
              <button className={`payment-btn ${metodoPago === 'transferencia' ? 'selected' : ''}`} onClick={() => setMetodoPago('transferencia')}>
                📱 Transferencia
              </button>
            </div>

            {clienteSel && (
              <div style={{ fontSize: 13, color: '#666', marginBottom: 6 }}>
                Cliente: <strong>{clienteSel.nombre}</strong>
              </div>
            )}
            {dirSel && (
              <div style={{ fontSize: 13, color: '#666', marginBottom: 10 }}>
                📍 {dirSel.calle} {dirSel.numero}{dirSel.piso ? `, Piso ${dirSel.piso}` : ''}{dirSel.notas ? ` (${dirSel.notas})` : ''}
              </div>
            )}

            <button className="btn btn-success" onClick={confirmarVenta}>Confirmar Venta</button>
          </div>
        </div>
      )}

      {carrito.length > 0 && (
        <button className="cart-float" onClick={() => setShowCart(true)}>
          🛒 {carrito.reduce((s, i) => s + i.cantidad, 0)}
        </button>
      )}
    </div>
  );
}
