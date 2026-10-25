import React from 'react';
import { useNavigate } from 'react-router-dom';

const s = {
  wrap: {
    minHeight: '100vh',
    backgroundColor: '#070C18',
    fontFamily: "'Inter', system-ui, sans-serif",
    position: 'relative',
    overflowX: 'hidden',
  },
  ambient: {
    position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
    background: 'radial-gradient(ellipse 80% 50% at 20% -10%, rgba(59,130,246,0.1) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 110%, rgba(139,92,246,0.07) 0%, transparent 60%)',
  },
  nav: {
    background: 'rgba(7,12,24,0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(59,130,246,0.12)',
    height: '66px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 32px',
    position: 'sticky', top: 0, zIndex: 100,
    boxSizing: 'border-box',
  },
  navLeft: { display: 'flex', alignItems: 'center', gap: '14px' },
  backBtn: {
    background: 'rgba(59,130,246,0.08)',
    border: '1px solid rgba(59,130,246,0.18)',
    color: '#3B82F6',
    padding: '6px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    fontFamily: "'Inter', sans-serif",
    display: 'flex', alignItems: 'center', gap: '6px',
    transition: 'background 0.15s, box-shadow 0.15s',
    whiteSpace: 'nowrap',
  },
  divider: {
    width: '1px', height: '28px',
    background: 'rgba(59,130,246,0.15)',
  },
  modLabel: {
    display: 'flex', alignItems: 'center', gap: '10px',
  },
  modIcon: (color) => ({
    width: '32px', height: '32px',
    borderRadius: '8px',
    background: `linear-gradient(135deg, ${color}33, ${color}18)`,
    border: `1px solid ${color}40`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '15px',
  }),
  modName: (color) => ({
    fontFamily: "'Outfit', sans-serif",
    fontWeight: '700',
    fontSize: '16px',
    color: '#EFF6FF',
  }),
  modSub: {
    color: '#475569',
    fontSize: '10.5px',
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: '0.5px',
  },
  navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  userPill: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'rgba(13,22,42,0.7)',
    border: '1px solid rgba(59,130,246,0.12)',
    borderRadius: '40px',
    padding: '4px 12px 4px 5px',
  },
  avatar: {
    width: '30px', height: '30px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #1D4ED8, #7C3AED)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '13px',
  },
  logoutBtn: {
    background: 'rgba(244,63,94,0.08)',
    border: '1px solid rgba(244,63,94,0.2)',
    color: '#F43F5E',
    padding: '6px 13px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    fontFamily: "'Inter', sans-serif",
    transition: 'background 0.15s',
    whiteSpace: 'nowrap',
  },
  main: {
    position: 'relative', zIndex: 1,
    padding: '40px 32px 56px',
    maxWidth: '1160px',
    margin: '0 auto',
    boxSizing: 'border-box',
  },
};

export default function Layout({ children, modulo, color, icono }) {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/');
  };

  return (
    <div style={s.wrap}>
      <div style={s.ambient} />

      <nav style={s.nav}>
        <div style={s.navLeft}>
          {modulo && (
            <>
              <button
                style={s.backBtn}
                onClick={() => navigate('/dashboard')}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.15)'; e.currentTarget.style.boxShadow = '0 0 12px rgba(59,130,246,0.15)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                ← Dashboard
              </button>
              <div style={s.divider} />
              <div style={s.modLabel}>
                <div style={s.modIcon(color)}>{icono}</div>
                <div>
                  <div style={s.modName(color)}>{modulo}</div>
                  <div style={s.modSub}>asilo cabeza de algodón</div>
                </div>
              </div>
            </>
          )}

          {!modulo && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #1D4ED8, #7C3AED)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '19px', boxShadow: '0 4px 14px rgba(59,130,246,0.3)',
              }}>🏥</div>
              <div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: '700', fontSize: '15px', color: '#EFF6FF' }}>Cabeza de Algodón</div>
                <div style={s.modSub}>sistema de gestión</div>
              </div>
            </div>
          )}
        </div>

        <div style={s.navRight}>
          <div style={s.userPill}>
            <div style={s.avatar}>👤</div>
            <div>
              <div style={{ color: '#94A3B8', fontSize: '12px', fontWeight: '500' }}>{usuario.correo || 'Usuario'}</div>
              <div style={{ color: '#475569', fontSize: '10.5px' }}>{usuario.rol || 'Sin rol'}</div>
            </div>
          </div>
          <button
            style={s.logoutBtn}
            onClick={handleLogout}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.18)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.08)'; }}
          >⏻ Salir</button>
        </div>
      </nav>

      <main style={s.main}>{children}</main>
    </div>
  );
}
