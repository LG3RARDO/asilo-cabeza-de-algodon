import axios from 'axios';
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Pacientes from './pages/Pacientes';

function Login() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError] = useState('');
  const [rol, setRol] = useState('administrador');
  const [cargando, setCargando] = useState(false);

  const handleLogin = async () => {
    if (!usuario || !password) {
      setError('Por favor ingrese su correo y contraseña.');
      return;
    }
    try {
      setCargando(true);
      setError('');
      const respuesta = await axios.post('http://localhost:4000/api/auth/login', {
        correo: usuario,
        contrasena: password
      });
      localStorage.setItem('token', respuesta.data.token);
      localStorage.setItem('usuario', JSON.stringify(respuesta.data.usuario));
      window.location.href = '/dashboard';
    } catch (err) {
      if (err.response) {
        setError(err.response.data.mensaje);
      } else {
        setError('Error de conexión con el servidor.');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0B2A4A',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '40px',
        width: '380px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            backgroundColor: '#0B2A4A',
            borderRadius: '50%',
            width: '64px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto'
          }}>
            <span style={{ fontSize: '28px' }}>🏥</span>
          </div>
          <h2 style={{ color: '#0B2A4A', margin: '0', fontSize: '20px' }}>
            Sistema Asilo Cabeza de Algodón
          </h2>
          <p style={{ color: '#666', fontSize: '13px', margin: '4px 0 0 0' }}>
            Inicie sesión para continuar
          </p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', color: '#444', fontWeight: 'bold' }}>
            Rol de acceso
          </label>
          <select value={rol} onChange={(e) => setRol(e.target.value)}
            style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', backgroundColor: '#f9f9f9', boxSizing: 'border-box' }}>
            <option value="administrador">Administrador</option>
            <option value="medico_general">Médico General</option>
            <option value="fundacion">Fundación</option>
            <option value="especialista">Médico Especialista</option>
            <option value="laboratorio">Laboratorio</option>
            <option value="farmacia">Farmacia</option>
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', color: '#444', fontWeight: 'bold' }}>
            Correo electrónico
          </label>
          <input type="email" placeholder="usuario@asilo.com" value={usuario}
            onChange={(e) => { setUsuario(e.target.value); setError(''); }}
            style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '8px', border: error && !usuario ? '1px solid red' : '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label style={{ fontSize: '13px', color: '#444', fontWeight: 'bold' }}>
            Contraseña
          </label>
          <div style={{ position: 'relative', marginTop: '6px' }}>
            <input type={verPassword ? 'text' : 'password'} placeholder="Ingrese su contraseña" value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              style={{ width: '100%', padding: '10px', paddingRight: '40px', borderRadius: '8px', border: error && !password ? '1px solid red' : '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box' }} />
            <span onClick={() => setVerPassword(!verPassword)}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '16px' }}>
              {verPassword ? '🙈' : '👁️'}
            </span>
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #F87171', borderRadius: '8px', padding: '10px', marginBottom: '16px', fontSize: '13px', color: '#B91C1C' }}>
            ⚠️ {error}
          </div>
        )}

        <button onClick={handleLogin} disabled={cargando}
          style={{ width: '100%', padding: '12px', backgroundColor: cargando ? '#666' : '#0B2A4A', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: cargando ? 'not-allowed' : 'pointer', marginTop: '8px' }}
          onMouseOver={(e) => !cargando && (e.target.style.backgroundColor = '#0F5C8A')}
          onMouseOut={(e) => !cargando && (e.target.style.backgroundColor = '#0B2A4A')}>
          {cargando ? 'Verificando acceso...' : 'Iniciar sesión'}
        </button>

      </div>
    </div>
  );
}

function App() {
  const token = localStorage.getItem('token');
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/pacientes" element={token ? <Pacientes /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
