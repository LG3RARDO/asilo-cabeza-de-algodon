import React from 'react';

function Navbar({ usuario, onLogout }) {
  return (
    <nav style={{
      backgroundColor: '#0B2A4A',
      padding: '12px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '22px' }}>🏥</span>
        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>
          Sistema Asilo Cabeza de Algodón
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ color: '#A8D8EA', fontSize: '13px' }}>
          {usuario?.correo}
        </span>
        <button
          onClick={onLogout}
          style={{
            backgroundColor: '#F87171',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 14px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 'bold'
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
