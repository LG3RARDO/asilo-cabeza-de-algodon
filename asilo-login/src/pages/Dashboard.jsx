import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const MODULOS = [
  { nombre: 'Pacientes', icono: '🧑‍⚕️', ruta: '/pacientes', descripcion: 'Registro y seguimiento de residentes', color: '#3B82F6', badge: 'Residentes activos' },
  { nombre: 'Solicitudes', icono: '📋', ruta: '/solicitudes', descripcion: 'Gestión de solicitudes de ingreso', color: '#F59E0B', badge: 'Pendientes' },
  { nombre: 'Citas', icono: '📅', ruta: '/citas', descripcion: 'Agenda médica y consultas', color: '#10B981', badge: 'Hoy' },
  { nombre: 'Laboratorio', icono: '🔬', ruta: '/laboratorio', descripcion: 'Resultados y análisis clínicos', color: '#8B5CF6', badge: 'Resultados' },
  { nombre: 'Farmacia', icono: '💊', ruta: '/farmacia', descripcion: 'Control de medicamentos y stock', color: '#F43F5E', badge: 'En stock' },
  { nombre: 'Finanzas', icono: '💰', ruta: '/finanzas', descripcion: 'Pagos, facturas y contabilidad', color: '#22D3EE', badge: 'Este mes' },
  { nombre: 'Reportes', icono: '📊', ruta: '/reportes', descripcion: 'Estadísticas e informes del sistema', color: '#FB923C', badge: 'Disponibles' },
  { nombre: 'Usuarios', icono: '👥', ruta: '/usuarios', descripcion: 'Administración de accesos y roles', color: '#E879F9', badge: 'Activos' },
];

const token = {
  bg: '#070C18', bg2: '#0B1220', glass: 'rgba(13,22,42,0.7)',
  border: 'rgba(59,130,246,0.12)', text: '#EFF6FF', text2: '#94A3B8', text3: '#475569',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const fecha = new Date().toLocaleDateString('es-GT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Layout>
      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #1D4ED8, #7C3AED)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px', boxShadow: '0 4px 14px rgba(59,130,246,0.3)',
              }}>🏥</div>
              <div>
                <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: '800', fontSize: '26px', color: token.text, margin: 0, letterSpacing: '-0.5px' }}>
                  Bienvenido, {usuario.correo?.split('@')[0] || 'Usuario'}
                </h1>
                <div style={{ color: token.text3, fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.5px', textTransform: 'capitalize' }}>
                  {fecha}
                </div>
              </div>
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: '40px', padding: '6px 14px',
          }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981', animation: 'pulse 2s infinite' }} />
            <span style={{ color: '#10B981', fontSize: '12px', fontWeight: '600' }}>Sistema activo</span>
          </div>
        </div>
      </div>

      {/* Stat Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        {[
          { label: 'Residentes', value: '—', icon: '🧑‍⚕️', color: '#3B82F6' },
          { label: 'Citas hoy', value: '—', icon: '📅', color: '#10B981' },
          { label: 'Medicamentos', value: '—', icon: '💊', color: '#F43F5E' },
          { label: 'Solicitudes', value: '—', icon: '📋', color: '#F59E0B' },
        ].map((s, i) => (
          <div key={i} style={{
            background: token.glass, backdropFilter: 'blur(12px)',
            border: `1px solid ${token.border}`, borderRadius: '16px',
            padding: '20px', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ color: token.text3, fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.5px', marginBottom: '8px' }}>{s.label.toUpperCase()}</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: '800', fontSize: '28px', color: token.text }}>{s.value}</div>
              </div>
              <div style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: `linear-gradient(135deg, ${s.color}33, ${s.color}18)`,
                border: `1px solid ${s.color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px',
              }}>{s.icon}</div>
            </div>
            <div style={{ marginTop: '14px', height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
              <div style={{ width: '0%', height: '100%', background: `linear-gradient(90deg, ${s.color}, ${s.color}aa)`, borderRadius: '4px' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Module Grid */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: '700', fontSize: '18px', color: token.text, margin: 0 }}>Módulos del Sistema</h2>
          <div style={{ flex: 1, height: '1px', background: token.border }} />
          <span style={{ color: token.text3, fontSize: '11px', fontFamily: "'JetBrains Mono', monospace" }}>{MODULOS.length} módulos</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '18px' }}>
          {MODULOS.map((m, i) => (
            <div
              key={i}
              onClick={() => navigate(m.ruta)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: token.glass,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: `1px solid ${hovered === i ? m.color + '55' : token.border}`,
                borderTop: `2.5px solid ${m.color}`,
                borderRadius: '16px',
                padding: '22px',
                cursor: 'pointer',
                transition: 'all 0.22s ease',
                transform: hovered === i ? 'translateY(-7px) scale(1.01)' : 'none',
                boxShadow: hovered === i ? `0 16px 40px ${m.color}22, 0 4px 12px rgba(0,0,0,0.3)` : '0 2px 8px rgba(0,0,0,0.2)',
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px',
              }}>
                <div style={{
                  width: '46px', height: '46px', borderRadius: '12px',
                  background: `linear-gradient(135deg, ${m.color}30, ${m.color}15)`,
                  border: `1px solid ${m.color}45`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                }}>{m.icono}</div>
                <div style={{
                  background: `${m.color}18`, border: `1px solid ${m.color}35`,
                  color: m.color, padding: '3px 9px', borderRadius: '20px',
                  fontSize: '10.5px', fontWeight: '600', fontFamily: "'JetBrains Mono', monospace",
                }}>{m.badge}</div>
              </div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: '700', fontSize: '17px', color: token.text, marginBottom: '5px' }}>{m.nombre}</div>
              <div style={{ color: token.text3, fontSize: '12.5px', lineHeight: '1.5', marginBottom: '18px' }}>{m.descripcion}</div>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderTop: `1px solid ${token.border}`, paddingTop: '14px',
              }}>
                <span style={{ color: m.color, fontSize: '12px', fontWeight: '600' }}>Abrir módulo</span>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: `${m.color}15`, border: `1px solid ${m.color}35`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: m.color, fontSize: '13px',
                  transform: hovered === i ? 'rotate(45deg)' : 'none',
                  transition: 'transform 0.2s ease',
                }}>↗</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '56px', borderTop: `1px solid ${token.border}`, paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ color: token.text3, fontSize: '12px', fontFamily: "'JetBrains Mono', monospace" }}>
          © 2025 Universidad Mariano Gálvez · Sistemas de Información
        </div>
        <div style={{
          background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.18)',
          color: '#3B82F6', padding: '4px 12px', borderRadius: '20px',
          fontSize: '11px', fontFamily: "'JetBrains Mono', monospace",
        }}>v1.0.0 · asilo-cabeza-de-algodon</div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes pulse { 0%,100%{opacity:1;box-shadow:0 0 8px #10B981} 50%{opacity:0.6;box-shadow:0 0 14px #10B981} }
        * { box-sizing: border-box; }
      `}</style>
    </Layout>
  );
}
