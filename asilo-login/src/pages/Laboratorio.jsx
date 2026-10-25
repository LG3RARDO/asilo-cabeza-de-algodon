import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';

const COLOR = '#8B5CF6';
const API = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const glass = { background: 'rgba(13,22,42,0.7)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(59,130,246,0.12)', borderRadius: '16px' };
const inp = { background: 'rgba(7,12,24,0.6)', border: '1px solid rgba(59,130,246,0.18)', borderRadius: '10px', color: '#EFF6FF', padding: '10px 14px', fontSize: '13.5px', fontFamily: "'Inter',sans-serif", outline: 'none', width: '100%', boxSizing: 'border-box' };
const btn = (c=COLOR) => ({ background:`${c}18`, border:`1px solid ${c}40`, color:c, padding:'9px 18px', borderRadius:'10px', cursor:'pointer', fontSize:'13px', fontWeight:'600', fontFamily:"'Inter',sans-serif", transition:'background 0.15s' });
const EMPTY = { id_paciente:'', tipo_examen:'', resultado:'Pendiente', fecha_examen:'', observaciones:'' };
const RESULTADOS = ['Pendiente','Normal','Anormal','Crítico'];
const RES_COLOR = { Normal:'#10B981', Anormal:'#F59E0B', Crítico:'#F43F5E', Pendiente:'#3B82F6' };

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

export default function Laboratorio() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type':'application/json', Authorization:`Bearer ${token}` };

  const load = async () => { setLoading(true); try { const r=await fetch(`${API}/api/laboratorio`,{headers}); const j=await r.json(); setData(Array.isArray(j)?j:j.data||[]); } catch{setData([]);} finally{setLoading(false);} };
  useEffect(()=>{load();},[]);
  const openNew = ()=>{setForm(EMPTY);setEditId(null);setModal(true);};
  const openEdit = (l)=>{setForm({id_paciente:l.id_paciente||'',tipo_examen:l.tipo_examen||'',resultado:l.resultado||'Pendiente',fecha_examen:l.fecha_examen?.slice(0,10)||'',observaciones:l.observaciones||''});setEditId(l.id_laboratorio);setModal(true);};
  const save = async()=>{ await fetch(editId?`${API}/api/laboratorio/${editId}`:`${API}/api/laboratorio`,{method:editId?'PUT':'POST',headers,body:JSON.stringify(form)}); setModal(false);load(); };
  const del = async(id)=>{ if(!window.confirm('¿Eliminar examen?'))return; await fetch(`${API}/api/laboratorio/${id}`,{method:'DELETE',headers}); load(); };
  const filtered = data.filter(l=>(l.tipo_examen||'').toLowerCase().includes(search.toLowerCase()));

  // Stats
  const total = data.length;
  const normales = data.filter(l=>l.resultado==='Normal').length;
  const anormales = data.filter(l=>l.resultado==='Anormal').length;
  const criticos = data.filter(l=>l.resultado==='Crítico').length;

  return (
    <Layout modulo="Laboratorio" color={COLOR} icono="🔬">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'28px',flexWrap:'wrap',gap:'12px'}}>
        <div>
          <h1 style={{fontFamily:"'Outfit',sans-serif",fontWeight:'800',fontSize:'24px',color:'#EFF6FF',margin:0}}>Laboratorio</h1>
          <div style={{color:'#475569',fontSize:'13px',marginTop:'2px'}}>Exámenes clínicos y resultados</div>
        </div>
        <button style={{...btn(COLOR),padding:'10px 20px'}} onClick={openNew}>+ Nuevo Examen</button>
      </div>

      {/* Stat Cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:'14px',marginBottom:'28px'}}>
        <StatCard label="Total exámenes" value={total} icon="🔬" color={COLOR} />
        <StatCard label="Normales" value={normales} icon="✅" color="#10B981" sub={total?`${Math.round(normales/total*100)}% del total`:''} />
        <StatCard label="Anormales" value={anormales} icon="⚠️" color="#F59E0B" sub={total?`${Math.round(anormales/total*100)}% requieren atención`:''} />
        <StatCard label="Críticos" value={criticos} icon="🚨" color="#F43F5E" sub={criticos>0?'Atención inmediata':''} />
      </div>

      <div style={{...glass,padding:'16px',marginBottom:'20px'}}>
        <input style={inp} placeholder="🔍  Buscar por tipo de examen…" value={search} onChange={e=>setSearch(e.target.value)} />
      </div>

      <div style={{...glass,overflow:'hidden'}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:'620px'}}>
            <thead>
              <tr style={{borderBottom:'1px solid rgba(59,130,246,0.15)'}}>
                {['ID','Paciente','Tipo de Examen','Resultado','Fecha','Observaciones','Acciones'].map(h=>(
                  <th key={h} style={{padding:'14px 16px',textAlign:'left',color:'#475569',fontSize:'11px',fontFamily:"'JetBrains Mono',monospace",letterSpacing:'0.5px'}}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading?<tr><td colSpan="7" style={{textAlign:'center',padding:'40px',color:'#475569'}}>Cargando…</td></tr>
               :filtered.length===0?<tr><td colSpan="7" style={{textAlign:'center',padding:'40px',color:'#475569'}}>Sin exámenes</td></tr>
               :filtered.map((l,i)=>{
                const rc = RES_COLOR[l.resultado]||COLOR;
                return (
                <tr key={l.id_laboratorio} style={{borderBottom:'1px solid rgba(59,130,246,0.07)',background:i%2===0?'transparent':'rgba(59,130,246,0.02)'}}>
                  <td style={{padding:'12px 16px',color:'#475569',fontSize:'12px',fontFamily:"'JetBrains Mono',monospace"}}>#{l.id_laboratorio}</td>
                  <td style={{padding:'12px 16px',color:'#94A3B8'}}>{l.id_paciente?`#${l.id_paciente}`:'—'}</td>
                  <td style={{padding:'12px 16px',color:'#EFF6FF',fontWeight:'500'}}>{l.tipo_examen}</td>
                  <td style={{padding:'12px 16px'}}><span style={{background:`${rc}18`,border:`1px solid ${rc}35`,color:rc,padding:'3px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:'600'}}>{l.resultado}</span></td>
                  <td style={{padding:'12px 16px',color:'#94A3B8',fontSize:'12px',fontFamily:"'JetBrains Mono',monospace"}}>{l.fecha_examen?.slice(0,10)||'—'}</td>
                  <td style={{padding:'12px 16px',color:'#94A3B8',maxWidth:'160px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.observaciones||'—'}</td>
                  <td style={{padding:'12px 16px'}}>
                    <div style={{display:'flex',gap:'8px'}}>
                      <button style={{...btn('#10B981'),padding:'5px 12px',fontSize:'12px'}} onClick={()=>openEdit(l)}>Editar</button>
                      <button style={{...btn('#F43F5E'),padding:'5px 12px',fontSize:'12px'}} onClick={()=>del(l.id_laboratorio)}>Eliminar</button>
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
            <h2 style={{fontFamily:"'Outfit',sans-serif",fontWeight:'700',fontSize:'20px',color:'#EFF6FF',margin:'0 0 24px'}}>{editId?'Editar Examen':'Nuevo Examen'}</h2>
            <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              <div><label style={{color:'#94A3B8',fontSize:'12px',display:'block',marginBottom:'6px'}}>ID Paciente</label><input style={inp} type="number" value={form.id_paciente} onChange={e=>setForm({...form,id_paciente:e.target.value})} /></div>
              <div><label style={{color:'#94A3B8',fontSize:'12px',display:'block',marginBottom:'6px'}}>Tipo de examen</label><input style={inp} value={form.tipo_examen} onChange={e=>setForm({...form,tipo_examen:e.target.value})} /></div>
              <div><label style={{color:'#94A3B8',fontSize:'12px',display:'block',marginBottom:'6px'}}>Resultado</label><select style={inp} value={form.resultado} onChange={e=>setForm({...form,resultado:e.target.value})}>{RESULTADOS.map(r=><option key={r} value={r} style={{background:'#0B1220'}}>{r}</option>)}</select></div>
              <div><label style={{color:'#94A3B8',fontSize:'12px',display:'block',marginBottom:'6px'}}>Fecha del examen</label><input style={inp} type="date" value={form.fecha_examen} onChange={e=>setForm({...form,fecha_examen:e.target.value})} /></div>
              <div><label style={{color:'#94A3B8',fontSize:'12px',display:'block',marginBottom:'6px'}}>Observaciones</label><textarea style={{...inp,height:'70px',resize:'vertical'}} value={form.observaciones} onChange={e=>setForm({...form,observaciones:e.target.value})} /></div>
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
