import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';

const COLOR = '#3B82F6';
const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const glass = { background: 'rgba(13,22,42,0.7)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(59,130,246,0.12)', borderRadius: '16px' };
const inp = { background: 'rgba(7,12,24,0.6)', border: '1px solid rgba(59,130,246,0.18)', borderRadius: '10px', color: '#EFF6FF', padding: '10px 14px', fontSize: '13.5px', fontFamily: "'Inter',sans-serif", outline: 'none', width: '100%', boxSizing: 'border-box' };
const btn = (c=COLOR) => ({ background:`${c}18`, border:`1px solid ${c}40`, color:c, padding:'9px 18px', borderRadius:'10px', cursor:'pointer', fontSize:'13px', fontWeight:'600', fontFamily:"'Inter',sans-serif", transition:'background 0.15s' });

const EMPTY = { codigo:'', nombres:'', fecha_nacimiento:'', fecha_ingreso:'', motivo_reclusion:'', psicopatologia:'', estado:'Activo' };
const ESTADOS = ['Activo', 'Egresado', 'Fallecido'];
const EST_COLOR = { Activo:'#10B981', Egresado:'#F59E0B', Fallecido:'#475569' };
const EST_ICON  = { Activo:'✅', Egresado:'🚪', Fallecido:'🕊️' };

function calcEdad(fecha_nacimiento) {
  if (!fecha_nacimiento) return '—';
  const hoy = new Date();
  const nac = new Date(fecha_nacimiento);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

function StatCard({ label, value, icon, color, sub }) {
  return (
    <div style={{ ...glass, padding:'18px 20px', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'-10px', right:'-10px', fontSize:'52px', opacity:0.06, pointerEvents:'none' }}>{icon}</div>
      <div style={{ color:'#475569', fontSize:'10.5px', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'0.5px', marginBottom:'8px' }}>{label.toUpperCase()}</div>
      <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:'800', fontSize:'30px', color:'#EFF6FF', lineHeight:1 }}>{value}</div>
      {sub && <div style={{ color, fontSize:'11px', fontWeight:'600', marginTop:'6px' }}>{sub}</div>}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'2px', background:`linear-gradient(90deg,${color},${color}44)` }} />
    </div>
  );
}

export default function Pacientes() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Activo');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type':'application/json', Authorization:`Bearer ${token}` };

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/pacientes`, { headers });
      const j = await r.json();
      setData(Array.isArray(j) ? j : j.data || []);
    } catch { setData([]); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = (p) => {
    setForm({
      codigo: p.codigo || '',
      nombres: p.nombres || '',
      fecha_nacimiento: p.fecha_nacimiento?.slice(0,10) || '',
      fecha_ingreso: p.fecha_ingreso?.slice(0,10) || '',
      motivo_reclusion: p.motivo_reclusion || '',
      psicopatologia: p.psicopatologia || '',
      estado: p.estado || 'Activo',
    });
    setEditId(p.id_paciente);
    setModal(true);
  };
  const save = async () => {
    await fetch(
      editId ? `${API}/api/pacientes/${editId}` : `${API}/api/pacientes`,
      { method: editId ? 'PUT' : 'POST', headers, body: JSON.stringify(form) }
    );
    setModal(false);
    load();
  };
  const del = async (id) => {
    if (!window.confirm('¿Eliminar paciente permanentemente? Esta acción no se puede deshacer.')) return;
    await fetch(`${API}/api/pacientes/${id}`, { method: 'DELETE', headers });
    load();
  };

  // Filtro por estado + búsqueda por nombre
  const filtrados = data
    .filter(p => filtroEstado === 'Todos' || (p.estado || 'Activo') === filtroEstado)
    .filter(p => (p.nombres || '').toLowerCase().includes(search.toLowerCase()));

  // Stats (siempre sobre todos los datos, no sobre el filtro)
  const activos    = data.filter(p => (p.estado || 'Activo') === 'Activo').length;
  const egresados  = data.filter(p => p.estado === 'Egresado').length;
  const fallecidos = data.filter(p => p.estado === 'Fallecido').length;
  const edades     = data.filter(p => p.fecha_nacimiento).map(p => calcEdad(p.fecha_nacimiento));
  const promedioEdad = edades.length ? Math.round(edades.reduce((a,b) => a+b, 0) / edades.length) : 0;

  const FILTROS = ['Activo','Egresado','Fallecido','Todos'];

  return (
    <Layout modulo="Pacientes" color={COLOR} icono="🧑‍⚕️">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'28px',flexWrap:'wrap',gap:'12px'}}>
        <div>
          <h1 style={{fontFamily:"'Outfit',sans-serif",fontWeight:'800',fontSize:'24px',color:'#EFF6FF',margin:0}}>Pacientes</h1>
          <div style={{color:'#475569',fontSize:'13px',marginTop:'2px'}}>Residentes del asilo Cabeza de Algodón</div>
        </div>
        <button style={{...btn(COLOR),padding:'10px 20px'}} onClick={openNew}>+ Nuevo Paciente</button>
      </div>

      {/* Stat Cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:'14px',marginBottom:'28px'}}>
        <StatCard label="Activos" value={activos} icon="✅" color="#10B981" sub="Residentes actuales" />
        <StatCard label="Promedio edad" value={`${promedioEdad} años`} icon="🎂" color="#F59E0B" />
        <StatCard label="Egresados" value={egresados} icon="🚪" color="#F59E0B" sub="Salieron del asilo" />
        <StatCard label="Fallecidos" value={fallecidos} icon="🕊️" color="#475569" sub="Historial completo" />
      </div>

      {/* Filtro de estado + búsqueda */}
      <div style={{...glass,padding:'16px',marginBottom:'20px',display:'flex',gap:'12px',flexWrap:'wrap',alignItems:'center'}}>
        <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
          {FILTROS.map(f => (
            <button key={f} onClick={() => setFiltroEstado(f)} style={{
              padding:'6px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:'600',
              cursor:'pointer', border:'none', fontFamily:"'Inter',sans-serif",
              background: filtroEstado === f
                ? (EST_COLOR[f] || COLOR)
                : 'rgba(59,130,246,0.08)',
              color: filtroEstado === f ? '#fff' : '#475569',
              transition:'all 0.15s',
            }}>
              {EST_ICON[f] || '📋'} {f}
            </button>
          ))}
        </div>
        <input style={{...inp,flex:1,minWidth:'180px'}} placeholder="🔍  Buscar por nombre…" value={search} onChange={e=>setSearch(e.target.value)} />
      </div>

      {/* Tabla */}
      <div style={{...glass,overflow:'hidden'}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:'700px'}}>
            <thead>
              <tr style={{borderBottom:'1px solid rgba(59,130,246,0.15)'}}>
                {['ID','Código','Nombres','Edad','F. Ingreso','Estado','Acciones'].map(h=>(
                  <th key={h} style={{padding:'14px 16px',textAlign:'left',color:'#475569',fontSize:'11px',fontFamily:"'JetBrains Mono',monospace",letterSpacing:'0.5px'}}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan="7" style={{textAlign:'center',padding:'40px',color:'#475569'}}>Cargando…</td></tr>
                : filtrados.length === 0
                  ? <tr><td colSpan="7" style={{textAlign:'center',padding:'40px',color:'#475569'}}>Sin registros</td></tr>
                  : filtrados.map((p,i) => {
                    const est = p.estado || 'Activo';
                    const ec = EST_COLOR[est] || '#475569';
                    return (
                      <tr key={p.id_paciente} style={{borderBottom:'1px solid rgba(59,130,246,0.07)',background:i%2===0?'transparent':'rgba(59,130,246,0.02)'}}>
                        <td style={{padding:'12px 16px',color:'#475569',fontSize:'12px',fontFamily:"'JetBrains Mono',monospace"}}>#{p.id_paciente}</td>
                        <td style={{padding:'12px 16px',color:'#94A3B8',fontFamily:"'JetBrains Mono',monospace",fontSize:'12px'}}>{p.codigo||'—'}</td>
                        <td style={{padding:'12px 16px',color:'#EFF6FF',fontWeight:'500'}}>{p.nombres}</td>
                        <td style={{padding:'12px 16px',color:'#94A3B8'}}>{calcEdad(p.fecha_nacimiento)} años</td>
                        <td style={{padding:'12px 16px',color:'#94A3B8',fontSize:'12px',fontFamily:"'JetBrains Mono',monospace"}}>{p.fecha_ingreso?.slice(0,10)||'—'}</td>
                        <td style={{padding:'12px 16px'}}>
                          <span style={{background:`${ec}18`,border:`1px solid ${ec}35`,color:ec,padding:'3px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:'600'}}>
                            {EST_ICON[est]} {est}
                          </span>
                        </td>
                        <td style={{padding:'12px 16px'}}>
                          <div style={{display:'flex',gap:'8px'}}>
                            <button style={{...btn('#10B981'),padding:'5px 12px',fontSize:'12px'}} onClick={()=>openEdit(p)}>Editar</button>
                            <button style={{...btn('#F43F5E'),padding:'5px 12px',fontSize:'12px'}} onClick={()=>del(p.id_paciente)}>Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(4px)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
          <div style={{...glass,padding:'32px',width:'100%',maxWidth:'520px',borderTop:`2.5px solid ${COLOR}`,maxHeight:'90vh',overflowY:'auto'}}>
            <h2 style={{fontFamily:"'Outfit',sans-serif",fontWeight:'700',fontSize:'20px',color:'#EFF6FF',margin:'0 0 24px'}}>{editId?'Editar Paciente':'Nuevo Paciente'}</h2>
            <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              <div><label style={{color:'#94A3B8',fontSize:'12px',display:'block',marginBottom:'6px'}}>Código</label><input style={inp} value={form.codigo} onChange={e=>setForm({...form,codigo:e.target.value})} placeholder="Ej: PAC-001" /></div>
              <div><label style={{color:'#94A3B8',fontSize:'12px',display:'block',marginBottom:'6px'}}>Nombres completos</label><input style={inp} value={form.nombres} onChange={e=>setForm({...form,nombres:e.target.value})} /></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div><label style={{color:'#94A3B8',fontSize:'12px',display:'block',marginBottom:'6px'}}>Fecha de nacimiento</label><input style={inp} type="date" value={form.fecha_nacimiento} onChange={e=>setForm({...form,fecha_nacimiento:e.target.value})} /></div>
                <div><label style={{color:'#94A3B8',fontSize:'12px',display:'block',marginBottom:'6px'}}>Fecha de ingreso</label><input style={inp} type="date" value={form.fecha_ingreso} onChange={e=>setForm({...form,fecha_ingreso:e.target.value})} /></div>
              </div>
              <div><label style={{color:'#94A3B8',fontSize:'12px',display:'block',marginBottom:'6px'}}>Motivo de reclusión</label><textarea style={{...inp,resize:'vertical',minHeight:'70px'}} value={form.motivo_reclusion} onChange={e=>setForm({...form,motivo_reclusion:e.target.value})} /></div>
              <div><label style={{color:'#94A3B8',fontSize:'12px',display:'block',marginBottom:'6px'}}>Psicopatología</label><textarea style={{...inp,resize:'vertical',minHeight:'70px'}} value={form.psicopatologia} onChange={e=>setForm({...form,psicopatologia:e.target.value})} /></div>
              <div>
                <label style={{color:'#94A3B8',fontSize:'12px',display:'block',marginBottom:'8px'}}>Estado del paciente</label>
                <div style={{display:'flex',gap:'10px'}}>
                  {ESTADOS.map(s => (
                    <button key={s} type="button" onClick={()=>setForm({...form,estado:s})} style={{
                      flex:1, padding:'10px 8px', borderRadius:'10px', fontSize:'12px', fontWeight:'600',
                      cursor:'pointer', border:`1px solid ${EST_COLOR[s]}40`, fontFamily:"'Inter',sans-serif",
                      background: form.estado===s ? `${EST_COLOR[s]}30` : 'rgba(7,12,24,0.4)',
                      color: form.estado===s ? EST_COLOR[s] : '#475569',
                      outline: form.estado===s ? `2px solid ${EST_COLOR[s]}60` : 'none',
                      transition:'all 0.15s',
                    }}>
                      {EST_ICON[s]}<br/>{s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{display:'flex',gap:'12px',marginTop:'24px',justifyContent:'flex-end'}}>
              <button style={btn('#475569')} onClick={()=>setModal(false)}>Cancelar</button>
              <button style={{...btn(COLOR),background:`${COLOR}30`}} onClick={save}>{editId?'Guardar cambios':'Crear paciente'}</button>
            </div>
          </div>
        </div>
      )}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');*{box-sizing:border-box}`}</style>
    </Layout>
  );
}
