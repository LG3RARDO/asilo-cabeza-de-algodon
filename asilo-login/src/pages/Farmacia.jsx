import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';

const COLOR = '#F43F5E';
const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const glass = { background: 'rgba(13,22,42,0.7)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(59,130,246,0.12)', borderRadius: '16px' };
const inp = { background: 'rgba(7,12,24,0.6)', border: '1px solid rgba(59,130,246,0.18)', borderRadius: '10px', color: '#EFF6FF', padding: '10px 14px', fontSize: '13.5px', fontFamily: "'Inter',sans-serif", outline: 'none', width: '100%', boxSizing: 'border-box' };
const btn = (c=COLOR) => ({ background:`${c}18`, border:`1px solid ${c}40`, color:c, padding:'9px 18px', borderRadius:'10px', cursor:'pointer', fontSize:'13px', fontWeight:'600', fontFamily:"'Inter',sans-serif", transition:'background 0.15s' });
const EMPTY = { id_paciente:'', medicamento:'', dosis:'', frecuencia:'', fecha_inicio:'', fecha_fin:'' };

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

export default function Farmacia() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type':'application/json', Authorization:`Bearer ${token}` };

  const load = async () => { setLoading(true); try { const r=await fetch(`${API}/api/farmacia`,{headers}); const j=await r.json(); setData(Array.isArray(j)?j:j.data||[]); } catch{setData([]);} finally{setLoading(false);} };
  useEffect(()=>{load();},[]);
  const openNew = ()=>{setForm(EMPTY);setEditId(null);setModal(true);};
  const openEdit = (f)=>{setForm({id_paciente:f.id_paciente||'',medicamento:f.medicamento||'',dosis:f.dosis||'',frecuencia:f.frecuencia||'',fecha_inicio:f.fecha_inicio?.slice(0,10)||'',fecha_fin:f.fecha_fin?.slice(0,10)||''});setEditId(f.id_farmacia);setModal(true);};
  const save = async()=>{ await fetch(editId?`${API}/api/farmacia/${editId}`:`${API}/api/farmacia`,{method:editId?'PUT':'POST',headers,body:JSON.stringify(form)}); setModal(false);load(); };
  const del = async(id)=>{ if(!window.confirm('¿Eliminar prescripción?'))return; await fetch(`${API}/api/farmacia/${id}`,{method:'DELETE',headers}); load(); };
  const filtered = data.filter(f=>(f.medicamento||'').toLowerCase().includes(search.toLowerCase()));

  // Stats — prescripciones activas (fecha_fin >= hoy o sin fecha_fin)
  const today = new Date().toISOString().slice(0,10);
  const total = data.length;
  const activas = data.filter(f=>!f.fecha_fin||f.fecha_fin>=today).length;
  const vencidas = data.filter(f=>f.fecha_fin&&f.fecha_fin<today).length;
  const uniqMeds = new Set(data.map(f=>f.medicamento)).size;

  return (
    <Layout modulo="Farmacia" color={COLOR} icono="💊">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'28px',flexWrap:'wrap',gap:'12px'}}>
        <div>
          <h1 style={{fontFamily:"'Outfit',sans-serif",fontWeight:'800',fontSize:'24px',color:'#EFF6FF',margin:0}}>Farmacia</h1>
          <div style={{color:'#475569',fontSize:'13px',marginTop:'2px'}}>Control de prescripciones y medicamentos</div>
        </div>
        <button style={{...btn(COLOR),padding:'10px 20px'}} onClick={openNew}>+ Nueva Prescripción</button>
      </div>

      {/* Stat Cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:'14px',marginBottom:'28px'}}>
        <StatCard label="Total prescrip." value={total} icon="💊" color={COLOR} />
        <StatCard label="Activas" value={activas} icon="✅" color="#10B981" sub={total?`${Math.round(activas/total*100)}% vigentes`:''} />
        <StatCard label="Vencidas" value={vencidas} icon="⏰" color="#F59E0B" sub={vencidas>0?'Revisar':'Al día'} />
        <StatCard label="Medicamentos únicos" value={uniqMeds} icon="🧪" color="#8B5CF6" sub="Distintos fármacos" />
      </div>

      <div style={{...glass,padding:'16px',marginBottom:'20px'}}>
        <input style={inp} placeholder="🔍  Buscar por medicamento…" value={search} onChange={e=>setSearch(e.target.value)} />
      </div>

      <div style={{...glass,overflow:'hidden'}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:'640px'}}>
            <thead>
              <tr style={{borderBottom:'1px solid rgba(59,130,246,0.15)'}}>
                {['ID','Paciente','Medicamento','Dosis','Frecuencia','Inicio','Fin','Acciones'].map(h=>(
                  <th key={h} style={{padding:'14px 16px',textAlign:'left',color:'#475569',fontSize:'11px',fontFamily:"'JetBrains Mono',monospace",letterSpacing:'0.5px'}}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading?<tr><td colSpan="8" style={{textAlign:'center',padding:'40px',color:'#475569'}}>Cargando…</td></tr>
               :filtered.length===0?<tr><td colSpan="8" style={{textAlign:'center',padding:'40px',color:'#475569'}}>Sin prescripciones</td></tr>
               :filtered.map((f,i)=>{
                const activa = !f.fecha_fin||f.fecha_fin>=today;
                return (
                <tr key={f.id_farmacia} style={{borderBottom:'1px solid rgba(59,130,246,0.07)',background:i%2===0?'transparent':'rgba(59,130,246,0.02)'}}>
                  <td style={{padding:'12px 16px',color:'#475569',fontSize:'12px',fontFamily:"'JetBrains Mono',monospace"}}>#{f.id_farmacia}</td>
                  <td style={{padding:'12px 16px',color:'#94A3B8'}}>{f.id_paciente?`#${f.id_paciente}`:'—'}</td>
                  <td style={{padding:'12px 16px',color:'#EFF6FF',fontWeight:'500'}}>{f.medicamento}</td>
                  <td style={{padding:'12px 16px'}}><span style={{background:`${COLOR}18`,border:`1px solid ${COLOR}35`,color:COLOR,padding:'3px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:'600'}}>{f.dosis||'—'}</span></td>
                  <td style={{padding:'12px 16px',color:'#94A3B8',fontSize:'13px'}}>{f.frecuencia||'—'}</td>
                  <td style={{padding:'12px 16px',color:'#94A3B8',fontSize:'12px',fontFamily:"'JetBrains Mono',monospace"}}>{f.fecha_inicio?.slice(0,10)||'—'}</td>
                  <td style={{padding:'12px 16px',fontSize:'12px',fontFamily:"'JetBrains Mono',monospace',color:activa?'#10B981':'#F59E0B'"}}>{f.fecha_fin?.slice(0,10)||'—'}</td>
                  <td style={{padding:'12px 16px'}}>
                    <div style={{display:'flex',gap:'8px'}}>
                      <button style={{...btn('#10B981'),padding:'5px 12px',fontSize:'12px'}} onClick={()=>openEdit(f)}>Editar</button>
                      <button style={{...btn('#F43F5E'),padding:'5px 12px',fontSize:'12px'}} onClick={()=>del(f.id_farmacia)}>Eliminar</button>
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
            <h2 style={{fontFamily:"'Outfit',sans-serif",fontWeight:'700',fontSize:'20px',color:'#EFF6FF',margin:'0 0 24px'}}>{editId?'Editar Prescripción':'Nueva Prescripción'}</h2>
            <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              {[{k:'id_paciente',l:'ID Paciente',t:'number'},{k:'medicamento',l:'Medicamento',t:'text'},{k:'dosis',l:'Dosis',t:'text'},{k:'frecuencia',l:'Frecuencia',t:'text'},{k:'fecha_inicio',l:'Fecha de inicio',t:'date'},{k:'fecha_fin',l:'Fecha de fin',t:'date'}].map(f=>(
                <div key={f.k}><label style={{color:'#94A3B8',fontSize:'12px',display:'block',marginBottom:'6px'}}>{f.l}</label><input style={inp} type={f.t} value={form[f.k]} onChange={e=>setForm({...form,[f.k]:e.target.value})} /></div>
              ))}
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
