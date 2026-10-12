import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function Dashboard() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/');
  };

  const modulos = [
    { nombre: 'Pacientes', icono: '👤', ruta: '/pacientes', descripcion: 'Registro y gestión de internos' },
    { nombre: 'Solicitudes', icono: '📋', ruta: '/solicitudes', descripcion: 'Solicitudes médicas' },
    { nombre: 'Citas', icono: '📅', ruta: '/citas', descripcion: 'Asignación de citas médicas' },
    { nombre: 'Laboratorio', icono: '🔬', ruta: '/laboratorio', descripcion: 'Exámenes y resultados' },
    { nombre: 'Farmacia', icono: '💊', ruta: '/farmacia', descripcion: 'Medicamentos y recetas' },
    { nombre: 'Finanzas', icono: '💳', ruta: '/finanzas', descripcion: 'Cobros, pagos y donaciones' },
    { nombre: 'Reportes', icono: '📊', ruta: '/reportes', descripcion: 'Reportes médicos y financieros' },
    { nombre: 'Usuarios', icono: '👥', ruta: '/usuarios', descripcion: 'Gestión de usuarios y roles' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F0F4F8' }}>
      <Navbar usuario={usuario} onLogout={handleLogout} />

      <div style={{ padding: '32px' }}>
        <h2 style={{ color: '#0B2A4A', marginBottom: '8px' }}>
          Panel de control
        </h2>
        <p style={{ color: '#666', marginBottom: '32px' }}>
          Bienvenido al Sistema Web del Asilo de Ancianos Cabeza de Algodón
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '20px'
        }}>
          {modulos.map((modulo, index) => (
            <div
              key={index}
              onClick={() => navigate(modulo.ruta)}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                borderTop: '4px solid #0B2A4A',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>
                {modulo.icono}
              </div>
              <h3 style={{ color: '#0B2A4A', margin: '0 0 6px 0', fontSize: '16px' }}>
                {modulo.nombre}
              </h3>
              <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>
                {modulo.descripcion}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
