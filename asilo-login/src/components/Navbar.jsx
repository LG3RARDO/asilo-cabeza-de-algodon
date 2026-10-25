import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener datos del usuario del localStorage
  const nombre = localStorage.getItem('nombre') || 'Usuario';
  const rol = localStorage.getItem('rol') || '';

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nombre');
    localStorage.removeItem('rol');
    navigate('/');
  };

  // Menú por rol
  const todosLosItems = [
    { path: '/dashboard',   label: '🏠 Inicio',      roles: ['administrador', 'medico_general', 'fundacion', 'medico_especialista', 'laboratorio', 'farmacia'] },
    { path: '/pacientes',   label: '👥 Pacientes',    roles: ['administrador', 'medico_general', 'medico_especialista'] },
    { path: '/solicitudes', label: '📋 Solicitudes',  roles: ['administrador', 'medico_general', 'medico_especialista'] },
    { path: '/citas',       label: '📅 Citas',        roles: ['administrador', 'medico_general', 'medico_especialista'] },
    { path: '/laboratorio', label: '🔬 Laboratorio',  roles: ['administrador', 'medico_general', 'medico_especialista', 'laboratorio'] },
    { path: '/farmacia',    label: '💊 Farmacia',     roles: ['administrador', 'medico_general', 'medico_especialista', 'farmacia'] },
    { path: '/finanzas',    label: '💰 Finanzas',     roles: ['administrador', 'fundacion'] },
    { path: '/reportes',    label: '📊 Reportes',     roles: ['administrador', 'fundacion'] },
    { path: '/usuarios',    label: '⚙️ Usuarios',     roles: ['administrador'] },
  ];

  const itemsVisibles = todosLosItems.filter(item => item.roles.includes(rol));

  const estiloLink = (path) => ({
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: location.pathname === path ? '700' : '500',
    color: location.pathname === path ? '#FFFFFF' : '#CBD5E1',
    backgroundColor: location.pathname === path ? 'rgba(255,255,255,0.15)' : 'transparent',
    border: 'none',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  });

  const etiquetaRol = {
    administrador: { label: 'Administrador', bg: '#1E40AF', text: '#BFDBFE' },
    medico_general: { label: 'Médico General', bg: '#065F46', text: '#A7F3D0' },
    fundacion: { label: 'Fundación', bg: '#6B21A8', text: '#E9D5FF' },
    medico_especialista: { label: 'Médico Especialista', bg: '#92400E', text: '#FDE68A' },
    laboratorio: { label: 'Laboratorio', bg: '#1E3A5F', text: '#BAE6FD' },
    farmacia: { label: 'Farmacia', bg: '#831843', text: '#FBCFE8' },
  }[rol] || { label: rol, bg: '#374151', text: '#E5E7EB' };

  return (
    <nav style={{
      backgroundColor: '#0B2A4A',
      padding: '0 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '56px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <span style={{ fontSize: '22px' }}>🏡</span>
        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>Cabeza de Algodón</span>
      </div>

      {/* Links de navegación */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', overflowX: 'auto', padding: '0 16px', flex: 1, justifyContent: 'center' }}>
        {itemsVisibles.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={estiloLink(item.path)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Usuario */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, color: 'white', fontSize: '13px', fontWeight: '600' }}>{nombre}</p>
          <span style={{ backgroundColor: etiquetaRol.bg, color: etiquetaRol.text, fontSize: '10px', padding: '1px 7px', borderRadius: '8px', fontWeight: '600' }}>
            {etiquetaRol.label}
          </span>
        </div>
        <button
          onClick={cerrarSesion}
          style={{ padding: '6px 12px', backgroundColor: '#DC2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap' }}
        >
          Salir
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
