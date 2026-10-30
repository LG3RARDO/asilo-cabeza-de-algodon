import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';

const COLOR = '#FB923C';
const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const glass = { background: 'rgba(13,22,42,0.7)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(59,130,246,0.12)', borderRadius: '16px' };
const btn = (c = COLOR) => ({ background: `${c}18`, border: `1px solid ${c}40`, color: c, padding: '9px 18px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: "'Inter', sans-serif", transition: 'background 0.15s' });

const REPORTES = [
  { titulo: 'Pacientes activos', desc: 'Lista completa de residentes activos en el asilo', endpoint: '/api/pacientes', icon: '🧑‍⚕️', color: '#3B82F6' },
  { titulo: 'Citas del mes', desc: 'Todas las citas médicas del mes en curso', endpoint: '/api/citas', icon: '📅', color: '#10B981' },
  { titulo: 'Prescripciones vigentes', desc: 'Medicamentos actualmente prescritos a residentes', endpoint: '/api/farmacia', icon: '💊', color: '#F43F5E' },
  { titulo: 'Movimientos financieros', desc: 'Ingresos y egresos registrados en el sistema', endpoint: '/api/finanzas', icon: '💰', color: '#22D3EE' },
  { titulo: 'Resultados de laboratorio', desc: 'Exámenes y análisis clínicos realizados', endpoint: '/api/laboratorio', icon: '🔬', color: '#8B5CF6' },
  { titulo: 'Solicitudes de ingreso', desc: 'Solicitudes recibidas y su estado actual', endpoint: '/api/solicitudes', icon: '📋', color: '#F59E0B' },
];

export default function Reportes() {
  const [activo, setActivo] = useState(null);
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(null);
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const cargar = async (r) => {
    setActivo(r);
    setLoading(true);
    setDatos([]);
    try {
      const res = await fetch(`${API}${r.endpoint}`, { headers });
      const j = await res.json();
      setDatos(Array.isArray(j) ? j : j.data || []);
    } catch { setDatos([]); } finally { setLoading(false); }
  };

  const exportCSV = () => {
    if (!datos.length) return;
    const keys = Object.keys(datos[0]);
    const csv = [keys.join(','), ...datos.map(row => keys.map(k => `"${row[k] ?? ''}"`).join(','))].join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = `${activo.titulo.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <Layout modulo="Reportes" color={COLOR} icono="📊">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: '800', fontSize: '24px', color: '#EFF6FF', margin: 0 }}>Reportes</h1>
          <div style={{ color: '#475569', fontSize: '13px', marginTop: '2px' }}>Selecciona un reporte para generarlo</div>
        </div>
        {activo && datos.length > 0 && (
          <button style={{ ...btn('#10B981'), padding: '10px 20px' }} onClick={exportCSV}>⬇ Exportar CSV</button>
        )}
      </div>

      {/* Reporte Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {REPORTES.map((r, i) => {
          const isActivo = activo?.titulo === r.titulo;
          return (
            <div
              key={i}
              onClick={() => cargar(r)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                ...glass,
                padding: '20px',
                cursor: 'pointer',
                borderTop: `2.5px solid ${isActivo ? r.color : 'transparent'}`,
                border: `1px solid ${isActivo ? r.color + '55' : 'rgba(59,130,246,0.12)'}`,
                transform: hovered === i ? 'translateY(-4px)' : 'none',
                boxShadow: isActivo ? `0 8px 24px ${r.color}20` : hovered === i ? '0 8px 20px rgba(0,0,0,0.3)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `${r.color}20`, border: `1px solid ${r.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{r.icon}</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: '700', fontSize: '15px', color: isActivo ? r.color : '#EFF6FF' }}>{r.titulo}</div>
              </div>
              <div style={{ color: '#475569', fontSize: '12.5px', lineHeight: '1.5' }}>{r.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Results */}
      {activo && (
        <div style={{ ...glass, overflow: 'hidden', borderTop: `2.5px solid ${activo.color}` }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(59,130,246,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: '700', fontSize: '16px', color: '#EFF6FF' }}>{activo.titulo}</div>
              {!loading && <div style={{ color: '#475569', fontSize: '12px', marginTop: '2px', fontFamily: "'JetBrains Mono', monospace" }}>{datos.length} registros</div>}
            </div>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#475569' }}>Generando reporte…</div>
          ) : datos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#475569' }}>Sin datos disponibles</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(59,130,246,0.15)' }}>
                    {Object.keys(datos[0]).map(k => (
                      <th key={k} style={{ padding: '12px 16px', textAlign: 'left', color: '#475569', fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.5px' }}>{k.toUpperCase().replace(/_/g, ' ')}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {datos.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(59,130,246,0.07)', background: i % 2 === 0 ? 'transparent' : 'rgba(59,130,246,0.02)' }}>
                      {Object.values(row).map((v, j) => (
                        <td key={j} style={{ padding: '11px 16px', color: j === 0 ? '#475569' : '#94A3B8', fontSize: '13px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: j === 0 ? "'JetBrains Mono', monospace" : 'inherit', fontWeight: j === 1 ? '500' : '400', color: j === 1 ? '#EFF6FF' : '#94A3B8' }}>
                          {v === null || v === undefined ? '—' : String(v)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!activo && (
        <div style={{ ...glass, padding: '48px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>📊</div>
          <div style={{ color: '#94A3B8', fontSize: '15px', marginBottom: '8px' }}>Selecciona un reporte arriba</div>
          <div style={{ color: '#475569', fontSize: '13px' }}>Los datos se cargarán desde el servidor</div>
        </div>
      )}

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');*{box-sizing:border-box}`}</style>
    </Layout>
  );
}
