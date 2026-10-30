import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Pacientes from './pages/Pacientes';
import Usuarios from './pages/Usuarios';
import Solicitudes from './pages/Solicitudes';
import Citas from './pages/Citas';
import Laboratorio from './pages/Laboratorio';
import Farmacia from './pages/Farmacia';
import Finanzas from './pages/Finanzas';
import Reportes from './pages/Reportes';
import NotFound from './pages/NotFound';

// Componente para rutas protegidas con control de roles
function RutaProtegida({ children, rolesPermitidos }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/" />;
  if (rolesPermitidos) {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const rol = usuario.rol || '';
    if (!rolesPermitidos.includes(rol)) return <Navigate to="/dashboard" />;
  }
  return children;
}

// ─── LOGIN (rediseño dark glassmorphism) ──────────────────────────────────────
function Login() {
  const [usuario, setUsuario]       = useState('');
  const [password, setPassword]     = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError]           = useState('');
  const [cargando, setCargando]     = useState(false);

  const handleLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!usuario || !password) { setError('Por favor ingrese su correo y contraseña.'); return; }
    try {
      setCargando(true);
      setError('');
      const respuesta = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/api/auth/login`, {
        correo: usuario,
        contrasena: password,
      });
      localStorage.setItem('token', respuesta.data.token);
      localStorage.setItem('usuario', JSON.stringify(respuesta.data.usuario));
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response ? err.response.data.mensaje : 'Error de conexión con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  const inp = {
    width: '100%', padding: '12px 16px', borderRadius: '10px', fontSize: '14px',
    fontFamily: "'Inter',sans-serif", outline: 'none', boxSizing: 'border-box',
    background: 'rgba(7,12,24,0.6)', border: '1px solid rgba(59,130,246,0.2)', color: '#EFF6FF',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#070C18',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', position: 'relative', overflow: 'hidden',
      fontFamily: "'Inter',sans-serif",
    }}>
      {/* Ambient gradients */}
      <div style={{ position:'fixed', top:'-15%', left:'-10%', width:'55%', height:'55%', background:'radial-gradient(ellipse,rgba(59,130,246,0.13) 0%,transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'fixed', bottom:'-15%', right:'-10%', width:'55%', height:'55%', background:'radial-gradient(ellipse,rgba(139,92,246,0.10) 0%,transparent 70%)', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:'420px', position:'relative', zIndex:1 }}>
        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:'28px' }}>
          <div style={{
            width:'72px', height:'72px', borderRadius:'20px', margin:'0 auto 14px',
            background:'linear-gradient(135deg,rgba(59,130,246,0.25),rgba(139,92,246,0.15))',
            border:'1px solid rgba(59,130,246,0.3)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:'34px',
            boxShadow:'0 8px 32px rgba(59,130,246,0.15)',
          }}>🏥</div>
          <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:'800', fontSize:'21px', color:'#EFF6FF', margin:'0 0 5px' }}>
            Asilo Cabeza de Algodón
          </h1>
          <p style={{ color:'#475569', fontSize:'13px', margin:0 }}>Sistema de Gestión Integral</p>
        </div>

        {/* Card */}
        <form onSubmit={handleLogin} style={{
          background:'rgba(13,22,42,0.75)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
          border:'1px solid rgba(59,130,246,0.18)', borderTop:'2.5px solid rgba(59,130,246,0.4)',
          borderRadius:'20px', padding:'36px 32px',
          boxShadow:'0 24px 64px rgba(0,0,0,0.4)',
        }}>
          <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:'700', fontSize:'17px', color:'#EFF6FF', margin:'0 0 24px', textAlign:'center' }}>
            Iniciar sesión
          </h2>

          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div>
              <label style={{ color:'#94A3B8', fontSize:'11.5px', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'0.4px', display:'block', marginBottom:'7px' }}>
                CORREO ELECTRÓNICO
              </label>
              <input style={inp} type="email" placeholder="usuario@asilo.com"
                value={usuario} onChange={e => { setUsuario(e.target.value); setError(''); }}
                autoComplete="email" required />
            </div>

            <div>
              <label style={{ color:'#94A3B8', fontSize:'11.5px', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'0.4px', display:'block', marginBottom:'7px' }}>
                CONTRASEÑA
              </label>
              <div style={{ position:'relative' }}>
                <input style={{ ...inp, paddingRight:'44px' }} type={verPassword ? 'text' : 'password'}
                  placeholder="••••••••" value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  autoComplete="current-password" required />
                <span onClick={() => setVerPassword(v => !v)}
                  style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', cursor:'pointer', fontSize:'16px', userSelect:'none' }}>
                  {verPassword ? '🙈' : '👁️'}
                </span>
              </div>
            </div>

            {error && (
              <div style={{ background:'rgba(244,63,94,0.1)', border:'1px solid rgba(244,63,94,0.3)', borderRadius:'10px', padding:'10px 14px', color:'#F43F5E', fontSize:'13px', textAlign:'center' }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={cargando} style={{
              padding:'13px', borderRadius:'12px', border:'none', marginTop:'4px',
              background: cargando ? 'rgba(59,130,246,0.3)' : 'linear-gradient(135deg,#3B82F6,#6366F1)',
              color:'#fff', fontSize:'14.5px', fontWeight:'700', fontFamily:"'Outfit',sans-serif",
              cursor: cargando ? 'not-allowed' : 'pointer', letterSpacing:'0.3px',
              boxShadow: cargando ? 'none' : '0 4px 20px rgba(59,130,246,0.35)',
              transition:'opacity 0.2s',
            }}>
              {cargando ? 'Verificando…' : 'Iniciar sesión'}
            </button>
          </div>
        </form>

        <p style={{ textAlign:'center', color:'#334155', fontSize:'12px', marginTop:'18px' }}>
          Sistema privado · Solo personal autorizado
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: #334155; }
        input:focus { border-color: rgba(99,102,241,0.5) !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.08); }
      `}</style>
    </div>
  );
}

// ─── TOKEN GUARD ──────────────────────────────────────────────────────────────
function useTokenGuard() {
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.exp * 1000 < Date.now()) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = '/';
          }
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
          window.location.href = '/';
        }
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);
}

// ─── ROUTES ───────────────────────────────────────────────────────────────────
function AppRoutes() {
  useTokenGuard();
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<RutaProtegida><Dashboard /></RutaProtegida>} />
      <Route path="/pacientes" element={<RutaProtegida><Pacientes /></RutaProtegida>} />
      <Route path="/solicitudes" element={<RutaProtegida rolesPermitidos={['administrador','medico_general','medico_especialista']}><Solicitudes /></RutaProtegida>} />
      <Route path="/citas" element={<RutaProtegida rolesPermitidos={['administrador','medico_general','medico_especialista']}><Citas /></RutaProtegida>} />
      <Route path="/laboratorio" element={<RutaProtegida rolesPermitidos={['administrador','medico_general','medico_especialista','laboratorio']}><Laboratorio /></RutaProtegida>} />
      <Route path="/farmacia" element={<RutaProtegida rolesPermitidos={['administrador','medico_general','medico_especialista','farmacia']}><Farmacia /></RutaProtegida>} />
      <Route path="/finanzas" element={<RutaProtegida rolesPermitidos={['administrador','fundacion']}><Finanzas /></RutaProtegida>} />
      <Route path="/reportes" element={<RutaProtegida rolesPermitidos={['administrador','fundacion']}><Reportes /></RutaProtegida>} />
      <Route path="/usuarios" element={<RutaProtegida rolesPermitidos={['administrador']}><Usuarios /></RutaProtegida>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
