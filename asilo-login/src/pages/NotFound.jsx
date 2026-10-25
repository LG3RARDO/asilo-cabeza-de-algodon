import React from 'react';
import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0B2A4A',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Arial, sans-serif',
      color: 'white'
    }}>
      <div style={{ fontSize: '80px' }}>🏥</div>
      <h1 style={{ fontSize: '72px', margin: '0', color: '#60A5FA' }}>404</h1>
      <h2 style={{ fontSize: '24px', margin: '8px 0' }}>Página no encontrada</h2>
      <p style={{ color: '#94A3B8', marginBottom: '32px' }}>
        La página que buscas no existe o fue movida.
      </p>
      <button
        onClick={() => navigate('/dashboard')}
        style={{
          padding: '12px 28px',
          backgroundColor: '#2563EB',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '15px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        ← Volver al Dashboard
      </button>
    </div>
  );
}

export default NotFound;
