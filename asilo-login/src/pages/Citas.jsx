import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';

const COLOR = '#10B981';
const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const glass = { background: 'rgba(13,22,42,0.7)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(59,130,246,0.12)', borderRadius: '16px' };
const inp = { background: 'rgba(7,12,24,0.6)', border: '1px solid rgba(59,130,246,0.18)', borderRadius: '10px', color: '#EFF6FF', padding: '10px 14px', fontSize: '13.5px', fontFamily: "'Inter',sans-serif", outline: 'none', width: '100%', boxSizing: 'border-box' };
const btn = (c=COLOR) => ({ background:`${c}18`, border:`1px solid ${c}40`, color:c, padding:'9px 18px', borderRadius:'10px', cursor:'pointer', fontSize:'13px', fontWeight:'600', fontFamily:"'Inter',sans-serif", transition:'background 0.15s' });
const EMPTY = { id_paciente:'', fecha_cita:'', motivo:'', medico:'', estado:'Programada' };
const ESTADOS = ['Programada','Confirmada','Completada','Cancelada'];
const ESTADO_COLOR = { Programada:'#3B82F6', Confirmada:'#F59E0B', Completada:'#10B981', Cancelada:'#475569' };

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

export default function Citas() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type':'application/json', Authorization:`Bearer ${token}` };

  const load = async () => { setLoading(true); try { const r=await fetch(`${API}/api/citas`,{headers}); const j=await r.json(); setData(Array.isArray(j)?j:j.data||[]); } catch{setData([]);} finally{setLoading(false);} };
  useEffect(()=>{load();},[]);
  const openNew = ()=>{setForm(EMPTY);setEditId(null);setModal(true);};
  const openEdit = (c)=>{setForm({id_paciente:c.id_paciente||'',fecha_cita:c.fecha_cita?.slice(0,16)||'',motivo:c.motivo||'',medico:c.medico||'',estado:c.estado||'Programada'});setEditId(c.id_cita);setModal(true);};
  const save = async()=>{ await fetch(editId?`${API}/api/citas/${editId}`:`${API}/api/citas`,{method:editId?'PUT':'POST',headers,body:JSON.stringify(form)}); setModal(false);load(); };
  const del = async(id)=>{ if(!window.confirm('¿Eliminar cita?'))return; await fetch(`${API}/api/citas/${id}`,{method:'DELETE',headers}); load(); };
  const filtered = data.filter(c=>(c.motivo||c.medico||'').toLowerCase().includes(search.toLowerCase()));

  // Stats
  const total = data.length;
  const programadas = data.filter(c=>c.estado==='Programada'||c.estado==='Confirmada').length;
  const completadas = data.filter(c=>c.estado==='Completada').length;
  const canceladas = data.filter(c=>c.estado==='Cancelada').length;

  return (
    <Layout modulo="Citas" color={COLOR} icono="📅">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'28px',flexWrap:'wrap',gap:'12px'}}>
        <div>
          <h1 style={{fontFamily:"'Outfit',sans-serif",fontWeight:'800',fontSize:'24px',color:'#EFF6FF',margin:0}}>Citas Médicas</h1>
          <div style={{color:'#475569',fontSize:'13px',marginTop:'2px'}}>Agenda de consultas y revisiones</div>
        </div>
        <button style={{...btn(COLOR),padding:'10px 20px'}} onClick={openNew}>+ Nueva Cita</button>
      </div>

      {/* Stat Cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:'14px',marginBottom:'28px'}}>
        <StatCard label="Total citas" value={total} icon="📅" color={COLOR} />
        <StatCard label="Activas" value={programadas} icon="🗓️" color="#3B82F6" sub="Programadas + Confirmadas" />
        <StatCard label="Completadas" value={completadas} icon="✅" color="#10B981" sub={total?`${Math.round(completadas/total*100)}% completitud`:''} />
        <StatCard label="Canceladas" value={canceladas} icon="🚫" color="#475569" sub={total?`${Math.round(canceladas/total*100)}% cancelación`:''} />
      </div>

      <div style={{...glass,padding:'16px',marginBottom:'20px'}}>
        <input style={inp} placeholder="🔍  Buscar por motivo o médico…" value={search} onChange={e=>setSearch(e.target.value)} />
      </div>

      <div style={{...glass,overflow:'hidden'}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:'620px'}}>
            <thead>
              <tr style={{borderBottom:'1px solid rgba(59,130,246,0.15)'}}>
                {['ID','Paciente','Fecha y Hora','Motivo','Médico','Estado','Acciones'].map(h=>(
                  <th key={h} style={{padding:'14px 16px',textAlign:'left',color:'#475569',fontSize:'11px',fontFamily:"'JetBrains Mono',monospace",letterSpacing:'0.5px'}}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading?<tr><td colSpan="7" style={{textAlign:'center',padding:'40px',color:'#475569'}}>Cargando…</td></tr>
               :filtered.length===0?<tr><td colSpan="7" style={{textAlign:'center',padding:'40px',color:'#475569'}}>Sin citas</td></tr>
               :filtered.map((c,i)=>{
                const ec = ESTADO_COLOR[c.estado]||COLOR;
                return (
                <tr key={c.id_cita} style={{borderBottom:'1px solid rgba(59,130,246,0.07)',background:i%2===0?'transparent':'rgba(59,130,246,0.02)'}}>
                  <td style={{padding:'12px 16px',color:'#475569',fontSize:'12px',fontFamily:"'JetBrains Mono',monospace"}}>#{c.id_cita}</td>
                  <td style={{padding:'12px 16px',color:'#94A3B8'}}>{c.id_paciente?`#${c.id_paciente}`:'—'}</td>
                  <td style={{padding:'12px 16px',color:'#EFF6FF',fontSize:'12px',fontFamily:"'JetBrains Mono',monospace",fontWeight:'500'}}>{c.fecha_cita?.slice(0,16).replace('T',' ')||'—'}</td>
                  <td style={{padding:'12px 16px',color:'#94A3B8',maxWidth:'150px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.motivo||'—'}</td>
                  <td style={{padding:'12px 16px',color:'#EFF6FF',fontWeight:'500'}}>{c.medico||'—'}</td>
                  <td style={{padding:'12px 16px'}}><span style={{background:`${ec}18`,border:`1px solid ${ec}35`,color:ec,padding:'3px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:'600'}}>{c.estado}</span></td>
                  <td style={{padding:'12px 16px'}}>
                    <div style={{display:'flex',gap:'8px'}}>
                      <button style={{...btn('#10B981'),padding:'5px 12px',fontSize:'12px'}} onClick={()=>openEdit(c)}>Editar</button>
                      <button style={{...btn('#F43F5E'),padding:'5px 12px',fontSize:'12px'}} onClick={()=>del(c.id_cita)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              );})}
            </tbody>
          </table>
        </div>
      </div>

      {modal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(4px)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
          <div style={{...glass,padding:'32px',width:'100%',maxWidth:'480px',borderTop:`2.5px solid ${COLOR}`}}>
            <h2 style={{fontFamily:"'Outfit',sans-serif",fontWeight:'700',fontSize:'20px',color:'#EFF6FF',margin:'0 0 24px'}}>{editId?'Editar Cita':'Nueva Cita'}</h2>
            <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              <div><label style={{color:'#94A3B8',fontSize:'12px',display:'block',marginBottom:'6px'}}>ID Paciente</label><input style={inp} type="number" value={form.id_paciente} onChange={e=>setForm({...form,id_paciente:e.target.value})} /></div>
              <div><label style={{color:'#94A3B8',fontSize:'12px',display:'block',marginBottom:'6px'}}>Fecha y hora</label><input style={inp} type="datetime-local" value={form.fecha_cita} onChange={e=>setForm({...form,fecha_cita:e.target.value})} /></div>
              <div><label style={{color:'#94A3B8',fontSize:'12px',display:'block',marginBottom:'6px'}}>Motivo</label><input style={inp} value={form.motivo} onChange={e=>setForm({...form,motivo:e.target.value})} /></div>
              <div><label style={{color:'#94A3B8',fontSize:'12px',display:'block',marginBottom:'6px'}}>Médico</label><input style={inp} value={form.medico} onChange={e=>setForm({...form,medico:e.target.value})} /></div>
              <div><label style={{color:'#94A3B8',fontSize:'12px',display:'block',marginBottom:'6px'}}>Estado</label><select style={inp} value={form.estado} onChange={e=>setForm({...form,estado:e.target.value})}>{ESTADOS.map(s=><option key={s} value={s} style={{background:'#0B1220'}}>{s}</option>)}</select></div>
            </div>
            <div style={{display:'flex',gap:'12px',marginTop:'24px',justifyContent:'flex-end'}}>
              <button style={btn('#475569')} onClick={()=>setModal(false)}>Cancelar</button>
              <button style={{...btn(COLOR),background:`${COLOR}30`}} onClick={save}>{editId?'Guardar':'Crear'}</button>
            </div>
          </div>
        </div>
      )}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');*{box-sizing:border-box}`}</style>
    </Layout>
  );
}
