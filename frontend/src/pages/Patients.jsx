import { useState, useEffect } from 'react';
import { getPatients, createPatient } from '../utils/api';
import toast from 'react-hot-toast';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({name:'',date_of_birth:'',gender:'',phone:'',email:''});
  const [saving, setSaving] = useState(false);

  const load = () => getPatients().then(p=>setPatients(p||[])).finally(()=>setLoading(false));
  useEffect(()=>{ load(); },[]);

  const save = async () => {
    if (!form.name.trim()) { toast.error('Name required'); return; }
    setSaving(true);
    try {
      await createPatient(form);
      toast.success('Patient registered!');
      setForm({name:'',date_of_birth:'',gender:'',phone:'',email:''});
      setShowForm(false); load();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  return (
    <div className="page fade-up">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:22}}>
        <div>
          <h1>Patients</h1>
          <p style={{color:'var(--ink-muted)',fontSize:'0.88rem',marginTop:4}}>{patients.length} registered</p>
        </div>
        <button className="btn btn-primary" onClick={()=>setShowForm(s=>!s)}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          {showForm?'Cancel':'Add Patient'}
        </button>
      </div>

      {showForm && (
        <div className="card fade-up" style={{marginBottom:18}}>
          <div className="card-header">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <h3>New Patient</h3>
          </div>
          <div className="card-body">
            <div className="fr">
              <div className="fg"><label>Full Name *</label><input value={form.name} onChange={e=>f('name',e.target.value)} placeholder="John Smith"/></div>
              <div className="fg"><label>Date of Birth</label><input type="date" value={form.date_of_birth} onChange={e=>f('date_of_birth',e.target.value)}/></div>
            </div>
            <div className="fr">
              <div className="fg"><label>Gender</label>
                <select value={form.gender} onChange={e=>f('gender',e.target.value)}>
                  <option value="">Select…</option><option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div className="fg"><label>Phone</label><input value={form.phone} onChange={e=>f('phone',e.target.value)} placeholder="+1 555-000-0000"/></div>
            </div>
            <div className="fg"><label>Email</label><input type="email" value={form.email} onChange={e=>f('email',e.target.value)} placeholder="patient@email.com"/></div>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:6}}>
              <button className="btn btn-secondary" onClick={()=>setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving?<><span className="spinner"/> Saving…</>:'Register Patient'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{overflow:'hidden'}}>
        <div className="card-header">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          <h3>All Patients</h3>
        </div>
        {loading ? <div style={{padding:40,display:'flex',justifyContent:'center'}}><span className="spinner" style={{width:26,height:26}}/></div>
        : patients.length===0 ? <div style={{padding:48,textAlign:'center',color:'var(--ink-faint)',fontSize:'0.875rem'}}>No patients registered yet.</div>
        : (
          <table>
            <thead><tr><th>Name</th><th>Gender</th><th>Date of Birth</th><th>Phone</th><th>Email</th></tr></thead>
            <tbody>
              {patients.map(p=>(
                <tr key={p.id} style={{cursor:'default'}}>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:9}}>
                      <div style={{width:30,height:30,borderRadius:'50%',background:'var(--teal-l)',color:'var(--teal)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.8rem',fontWeight:700}}>{p.name.charAt(0)}</div>
                      <span style={{fontWeight:500}}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{color:'var(--ink-muted)'}}>{p.gender||'—'}</td>
                  <td style={{color:'var(--ink-muted)'}}>{p.date_of_birth?new Date(p.date_of_birth).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}):'—'}</td>
                  <td style={{color:'var(--ink-muted)'}}>{p.phone||'—'}</td>
                  <td style={{color:'var(--ink-muted)'}}>{p.email||'—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
