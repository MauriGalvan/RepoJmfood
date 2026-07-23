import { useState, useEffect } from 'react';
import {
  getUltimaCaja, abrirCaja, cerrarCaja, getCajas,
  getVentas, getItemsVenta
} from '../db';
import { jsPDF } from 'jspdf';

export default function Caja() {
  const [caja, setCaja] = useState(null);
  const [cajas, setCajas] = useState([]);
  const [montoInicial, setMontoInicial] = useState('');
  const [montoFinal, setMontoFinal] = useState('');
  const [ventasDelDia, setVentasDelDia] = useState([]);
  const [showCerrar, setShowCerrar] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const cj = await getUltimaCaja();
    const todas = await getCajas();
    setCaja(cj);
    setCajas(todas.reverse());

    if (cj && cj.abierta) {
      const ventas = await getVentas();
      const hoy = new Date().toDateString();
      const delDia = ventas.filter(v => new Date(v.fecha).toDateString() === hoy);
      setVentasDelDia(delDia);
    }
  }

  async function handleAbrir() {
    const monto = Number(montoInicial);
    if (isNaN(monto) || monto < 0) return;
    await abrirCaja(monto);
    setMontoInicial('');
    load();
  }

  async function handleCerrar() {
    if (!caja) return;
    const efectivo = ventasDelDia
      .filter(v => v.metodoPago === 'efectivo')
      .reduce((s, v) => s + v.total, 0);
    const transferencia = ventasDelDia
      .filter(v => v.metodoPago === 'transferencia')
      .reduce((s, v) => s + v.total, 0);
    const totalVentas = efectivo + transferencia;
    const montoF = Number(montoFinal);
    const esperado = caja.montoInicial + efectivo;
    const diferencia = montoF - esperado;

    await cerrarCaja(caja.id, {
      montoFinal: montoF,
      totalEfectivo: efectivo,
      totalTransferencia: transferencia,
      ventas: ventasDelDia.map(v => v.id),
      diferencia,
    });
    setShowCerrar(false);
    setMontoFinal('');
    load();
  }

  function totalEfectivo() {
    return ventasDelDia.filter(v => v.metodoPago === 'efectivo').reduce((s, v) => s + v.total, 0);
  }
  function totalTransferencia() {
    return ventasDelDia.filter(v => v.metodoPago === 'transferencia').reduce((s, v) => s + v.total, 0);
  }

  function formatFecha(iso) {
    return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  }

  function generarPDF(cajaData) {
    const doc = new jsPDF();
    const fecha = new Date(cajaData.fecha).toLocaleDateString('es-AR', {
      day: '2-digit', month: 'long', year: 'numeric'
    });

    doc.setFontSize(20);
    doc.text('ARQUEO DE CAJA', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Fecha: ${fecha}`, 20, 35);
    doc.text(`Hora apertura: ${new Date(cajaData.fecha).toLocaleTimeString('es-AR')}`, 20, 42);

    doc.setDrawColor(0);
    doc.line(20, 48, 190, 48);

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('RESUMEN', 20, 58);

    doc.setFont(undefined, 'normal');
    doc.setFontSize(11);
    let y = 68;

    doc.text(`Monto inicial:`, 20, y);
    doc.text(`$${(cajaData.montoInicial || 0).toLocaleString()}`, 130, y);
    y += 10;

    doc.text(`Efectivo vendido:`, 20, y);
    doc.text(`$${(cajaData.totalEfectivo || 0).toLocaleString()}`, 130, y);
    y += 10;

    doc.text(`Transferencia:`, 20, y);
    doc.text(`$${(cajaData.totalTransferencia || 0).toLocaleString()}`, 130, y);
    y += 10;

    const totalVentas = (cajaData.totalEfectivo || 0) + (cajaData.totalTransferencia || 0);
    doc.setFont(undefined, 'bold');
    doc.text(`Total ventas:`, 20, y);
    doc.text(`$${totalVentas.toLocaleString()}`, 130, y);
    y += 10;

    doc.setFont(undefined, 'normal');
    doc.text(`Esperado en caja:`, 20, y);
    doc.text(`$${((cajaData.montoInicial || 0) + (cajaData.totalEfectivo || 0)).toLocaleString()}`, 130, y);
    y += 10;

    doc.text(`Monto final (contado):`, 20, y);
    doc.text(`$${(cajaData.montoFinal || 0).toLocaleString()}`, 130, y);
    y += 12;

    doc.setDrawColor(0);
    doc.line(20, y, 190, y);
    y += 8;

    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    const diff = cajaData.diferencia || 0;
    doc.setTextColor(diff >= 0 ? 0 : 220, diff >= 0 ? 120 : 30, diff >= 0 ? 0 : 30);
    doc.text(`Diferencia: ${diff >= 0 ? '+' : ''}$${diff.toLocaleString()}`, 20, y);

    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    y += 20;
    doc.text('Documento generado por sistema de Rotisería', 105, y, { align: 'center' });

    doc.save(`arqueo-caja-${formatFecha(cajaData.fecha).replace(/\//g, '-')}.pdf`);
  }

  return (
    <div>
      <div className="page-header">
        <h1>Caja</h1>
      </div>

      {caja && caja.abierta ? (
        <>
          <div className="card" style={{ background: '#dcfce7', borderColor: '#16a34a' }}>
            <div style={{ fontWeight: 700, color: '#166534', marginBottom: 4 }}>✅ Caja Abierta</div>
            <div style={{ fontSize: 13, color: '#166534' }}>
              Inicio: ${caja.montoInicial.toLocaleString()} — {formatFecha(caja.fecha)}
            </div>
          </div>

          <div className="card">
            <div className="section-title">Resumen del Día</div>
            <div className="summary-row">
              <span>Monto inicial</span>
              <span>${caja.montoInicial.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>💵 Efectivo</span>
              <span>${totalEfectivo().toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>📱 Transferencia</span>
              <span>${totalTransferencia().toLocaleString()}</span>
            </div>
            <div className="summary-row" style={{ fontWeight: 700, borderTop: '1px solid #e5e5e5', paddingTop: 8, marginTop: 4 }}>
              <span>Total ventas</span>
              <span>${(totalEfectivo() + totalTransferencia()).toLocaleString()}</span>
            </div>
            <div className="summary-row" style={{ color: '#16a34a', fontWeight: 700 }}>
              <span>Esperado en caja</span>
              <span>${(caja.montoInicial + totalEfectivo()).toLocaleString()}</span>
            </div>
          </div>

          {ventasDelDia.length > 0 && (
            <div className="card">
              <div className="section-title">Ventas de Hoy ({ventasDelDia.length})</div>
              {ventasDelDia.map(v => (
                <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13, borderBottom: '1px solid #e5e5e5' }}>
                  <span>
                    {v.clienteNombre || 'General'} — {v.metodoPago === 'efectivo' ? '💵' : '📱'}
                  </span>
                  <span style={{ fontWeight: 600 }}>${v.total.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}

          {!showCerrar ? (
            <button className="btn btn-danger" onClick={() => setShowCerrar(true)}>
              Cerrar Caja
            </button>
          ) : (
            <div className="card">
              <div className="section-title">Arqueo de Caja</div>
              <div className="form-group">
                <label>Conteo de efectivo ($)</label>
                <input
                  type="number"
                  value={montoFinal}
                  onChange={e => setMontoFinal(e.target.value)}
                  placeholder="0"
                />
              </div>
              {montoFinal && (
                <div className="sale-summary">
                  <div className="summary-row">
                    <span>Esperado</span>
                    <span>${(caja.montoInicial + totalEfectivo()).toLocaleString()}</span>
                  </div>
                  <div className="summary-row">
                    <span>Contado</span>
                    <span>${Number(montoFinal).toLocaleString()}</span>
                  </div>
                  <div className="summary-row summary-total" style={{
                    color: (Number(montoFinal) - (caja.montoInicial + totalEfectivo())) >= 0 ? '#16a34a' : '#dc2626'
                  }}>
                    <span>Diferencia</span>
                    <span>
                      {(Number(montoFinal) - (caja.montoInicial + totalEfectivo())) >= 0 ? '+' : ''}
                      ${(Number(montoFinal) - (caja.montoInicial + totalEfectivo())).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
              <div className="action-row">
                <button className="btn btn-outline" onClick={() => setShowCerrar(false)}>Cancelar</button>
                <button className="btn btn-danger" onClick={handleCerrar}>Confirmar Cierre</button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="card" style={{ background: '#fee2e2', borderColor: '#dc2626' }}>
            <div style={{ fontWeight: 700, color: '#991b1b', marginBottom: 4 }}>🔴 Caja Cerrada</div>
            <div style={{ fontSize: 13, color: '#991b1b' }}>
              Abrí una nueva caja para empezar a registrar ventas
            </div>
          </div>

          <div className="card">
            <div className="section-title">Abrir Nueva Caja</div>
            <div className="form-group">
              <label>Monto inicial ($)</label>
              <input
                type="number"
                value={montoInicial}
                onChange={e => setMontoInicial(e.target.value)}
                placeholder="Ej: 10000"
              />
            </div>
            <button className="btn btn-success" onClick={handleAbrir}>
              Abrir Caja
            </button>
          </div>
        </>
      )}

      {cajas.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div className="section-title">Cajas Anteriores</div>
          {cajas.map(c => (
            <div key={c.id} className="card" style={{ opacity: 0.7 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span>{formatFecha(c.fecha)}</span>
                <span className={`badge ${c.abierta ? 'badge-success' : 'badge-danger'}`}>
                  {c.abierta ? 'Abierta' : 'Cerrada'}
                </span>
              </div>
              {!c.abierta && (
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                  Inicio: ${c.montoInicial.toLocaleString()} — Final: ${c.montoFinal?.toLocaleString()} —
                  Diferencia: <span style={{ color: (c.diferencia || 0) >= 0 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                    ${(c.diferencia || 0).toLocaleString()}
                  </span>
                  <button
                    onClick={() => generarPDF(c)}
                    style={{ marginLeft: 8, padding: '2px 8px', fontSize: 11, background: '#ea580c', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                  >
                    📄 PDF
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
