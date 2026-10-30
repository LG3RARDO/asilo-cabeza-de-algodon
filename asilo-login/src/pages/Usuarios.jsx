import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';

const COLOR = '#E879F9';
const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const glass = { background: 'rgba(13,22,42,0.7)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(59,130,246,0.12)', borderRadius: '16px' };
const inp = { background: 'rgba(7,12,24,0.6)', border: '1px solid rgba(59,130,246,0.18)', borderRadius: '10px', color: '#EFF6FF', padding: '10px 14px', fontSize: '13.5px', fontFamily: "'Inter',sans-serif", outline: 'none', width: '100%', boxSizing: 'border-box' };
const btn = (c=COLOR) => ({ background:`${c}18`, border:`1px solid ${c}40`, color:c, padding:'9px 18px', borderRadius:'10px', cursor:'pointer', fontSize:'13px', fontWeight:'600', fontFamily:"'Inter',sans-serif", transition:'background 0.15s' });
const EMPTY = { correo:'', contrasena:'', id_rol:1, estado:true };
const ROLES = [{id:1,nombre:'Administrador'},{id:2,nombre:'Médico'},{id:3,nombre:'Enfermero/a'},{id:4,nombre:'Farmacéutico/a'},{id:5,nombre:'Contador/a'},{id:6,nombre:'Recepcionista'}];
const ROL_COLOR = {1:'#3B82F6',2:'#10B981',3:'#F59E0B',4:'#F43F5E',5:'#22D3EE',6:'#E879F9'};

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

export default function Usuarios() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type':'application/json', Authorization:`Bearer ${token}` };

  const load = async () => { setLoading(true); try { const r=await fetch(`${API}/api/usuarios`,{headers}); const j=await r.json(); setData(Array.isArray(j)?j:j.data||[]); } catch{setData([]);} finally{setLoading(false);} };
  useEffect(()=>{load();},[]);
  const openNew = ()=>{setForm(EMPTY);setEditId(null);setModal(true);};
  const openEdit = (u)=>{setForm({correo:u.correo||'',contrasena:'',id_rol:u.id_rol||1,estado:u.estado!==false});setEditId(u.id_usuario);setModal(true);};
  const save = async()=>{
    const body={...form};
    if(editId&&!body.contrasena)delete body.contrasena;
    await fetch(editId?`${API}/api/usuarios/${editId}`:`${API}/api/usuarios`,{method:editId?'PUT':'POST',headers,body:JSON.stringify(body)});
    setModal(false);load();
  };
  const del = async(id)=>{ if(!window.confirm('¿Eliminar usuario?'))return; await fetch(`${API}/api/usuarios/${id}`,{method:'DELETE',headers}); load(); };
  const filtered = data.filter(u=>(u.correo||'').toLowerCase().includes(search.toLowerCase()));
  const getRolName = (id) => ROLES.find(r=>r.id===id)?.nombre||`Rol ${id}`;

  // Stats
  const total = data.length;
  const activos = data.filter(u=>u.estado!==false).length;
  const inactivos = data.filter(u=>u.estado===false).length;
  const admins = data.filter(u=>u.id_rol===1).length;

  return (
    <Layout modulo="Usuarios" color={COLOR} icono="👥">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'28px',flexWrap:'wrap',gap:'12px'}}>
        <div>
          <h1 style={{fontFamily:"'Outfit',sans-serif",fontWeight:'800',fontSize:'24px',color:'#EFF6FF',margin:0}}>Usuarios del Sistema</h1>
          <div style={{color:'#475569',fontSize:'13px',marginTop:'2px'}}>Gestión de acceso y roles</div>
        </div>
        <button style={{...btn(COLOR),padding:'10px 20px'}} onClick={openNew}>+ Nuevo Usuario</button>
      </div>

      {/* Stat Cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:'14px',marginBottom:'28px'}}>
        <StatCard label="Total usuarios" value={total} icon="👥" color={COLOR} />
        <StatCard label="Activos" value={activos} icon="✅" color="#10B981" sub={total?`${Math.round(activos/total*100)}% del sistema`:''} />
        <StatCard label="Inactivos" value={inactivos} icon="🔒" color="#475569" sub={inactivos>0?'Acceso suspendido':'Todos activos'} />
        <StatCard label="Administradores" value={admins} icon="🛡️" color="#3B82F6" sub="Acceso total" />
      </div>

      <div style={{...glass,padding:'16px',marginBottom:'20px'}}>
        <input style={inp} placeholder="🔍  Buscar por correo…" value={search} onChange={e=>setSearch(e.target.value)} />
      </div>

      <div style={{...glass,overflow:'hidden'}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:'540px'}}>
            <thead>
              <tr style={{borderBottom:'1px solid rgba(59,130,246,0.15)'}}>
                {['ID','Correo','Rol','Estado','Acciones'].map(h=>(
                  <th key={h} style={{padding:'14px 16px',textAlign:'left',color:'#475569',fontSize:'11px',fontFamily:"'JetBrains Mono',monospace",letterSpacing:'0.5px'}}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading?<tr><td colSpan="5" style={{textAlign:'center',padding:'40px',color:'#475569'}}>Cargando…</td></tr>
               :filtered.length===0?<tr><td colSpan="5" style={{textAlign:'center',padding:'40px',color:'#475569'}}>Sin usuarios</td></tr>
               :filtered.map((u,i)=>{
                const rc = ROL_COLOR[u.id_rol]||COLOR;
                return (
                <tr key={u.id_usuario} style={{borderBottom:'1px solid rgba(59,130,246,0.07)',background:i%2===0?'transparent':'rgba(59,130,246,0.02)'}}>
                  <td style={{padding:'12px 16px',color:'#475569',fontSize:'12px',fontFamily:"'JetBrains Mono',monospace"}}>#{u.id_usuario}</td>
                  <td style={{padding:'12px 16px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                      <div style={{width:'30px',height:'30px',borderRadius:'50%',background:`linear-gradient(135deg,${rc}40,${rc}20)`,border:`1px solid ${rc}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',flexShrink:0}}>
                        {(u.correo||'?')[0].toUpperCase()}
                      </div>
                      <span style={{color:'#EFF6FF',fontWeight:'500'}}>{u.correo}</span>
                    </div>
                  </td>
                  <td style={{padding:'12px 16px'}}><span style={{background:`${rc}18`,border:`1px solid ${rc}35`,color:rc,padding:'3px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:'600'}}>{u.rol||getRolName(u.id_rol)}</span></td>
                  <td style={{padding:'12px 16px'}}>
                    <span style={{background:u.estado!==false?'rgba(16,185,129,0.12)':'rgba(71,85,105,0.12)',border:`1px solid ${u.estado!==false?'rgba(16,185,129,0.3)':'rgba(71,85,105,0.3)'}`,color:u.estado!==false?'#10B981':'#475569',padding:'3px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:'600'}}>
                      {u.estado!==false?'Activo':'Inactivo'}
                    </span>
                  </td>
                  <td style={{padding:'12px 16px'}}>
                    <div style={{display:'flex',gap:'8px'}}>
                      <button style={{...btn('#10B981'),padding:'5px 12px',fontSize:'12px'}} onClick={()=>openEdit(u)}>Editar</button>
                      <button style={{...btn('#F43F5E'),padding:'5px 12px',fontSize:'12px'}} onClick={()=>del(u.id_usuario)}>Eliminar</button>
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
            <h2 style={{fontFamily:"'Outfit',sans-serif",fontWeight:'700',fontSize:'20px',color:'#EFF6FF',margin:'0 0 24px'}}>{editId?'Editar Usuario':'Nuevo Usuario'}</h2>
            <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              <div><label style={{color:'#94A3B8',fontSize:'12px',display:'block',marginBottom:'6px'}}>Correo electrónico</label><input style={inp} type="email" value={form.correo} onChange={e=>setForm({...form,correo:e.target.value})} /></div>
              <div><label style={{color:'#94A3B8',fontSize:'12px',display:'block',marginBottom:'6px'}}>{editId?'Nueva contraseña (vacío = no cambiar)':'Contraseña'}</label><input style={inp} type="password" value={form.contrasena} onChange={e=>setForm({...form,contrasena:e.target.value})} /></div>
              <div><label style={{color:'#94A3B8',fontSize:'12px',display:'block',marginBottom:'6px'}}>Rol</label><select style={inp} value={form.id_rol} onChange={e=>setForm({...form,id_rol:+e.target.value})}>{ROLES.map(r=><option key={r.id} value={r.id} style={{background:'#0B1220'}}>{r.nombre}</option>)}</select></div>
              <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                <input type="checkbox" id="estado" checked={form.estado} onChange={e=>setForm({...form,estado:e.target.checked})} style={{accentColor:COLOR,width:'16px',height:'16px'}} />
                <label htmlFor="estado" style={{color:'#94A3B8',fontSize:'13px',cursor:'pointer'}}>Usuario activo</label>
              </div>
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
