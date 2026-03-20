import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVisit, updateBillStatus } from '../utils/api';
import toast from 'react-hot-toast';

const catLabel = {chief_complaint:'Chief Complaint',history:'History',examination:'Examination',diagnosis:'Diagnosis',plan:'Plan',observation:'Observation'};
const catStyle = {
  chief_complaint:{bg:'var(--amber-l)',color:'var(--amber)'},
  history:        {bg:'var(--surface2)',color:'var(--ink-muted)'},
  examination:    {bg:'var(--blue-l)', color:'var(--blue)'},
  diagnosis:      {bg:'var(--rose-l)', color:'var(--rose)'},
  plan:           {bg:'var(--teal-l)', color:'var(--teal)'},
  observation:    {bg:'var(--surface2)',color:'var(--ink-muted)'},
};
const fmtDate  = d => new Date(d).toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
const fmtShort = d => new Date(d).toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'});

export default function VisitDetail() {
  const {id} = useParams();
  const navigate = useNavigate();
  const [visit, setVisit]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('overview');
  const [printMode, setPrintMode] = useState(null);

  useEffect(()=>{
    getVisit(id).then(setVisit).catch(()=>toast.error('Visit not found')).finally(()=>setLoading(false));
  },[id]);

  const handlePrint = mode => { setPrintMode(mode); setTimeout(()=>window.print(),200); };
  const markPaid = async () => {
    try{ await updateBillStatus(id,'paid'); setVisit(v=>({...v,bill:{...v.bill,status:'paid'}})); toast.success('Bill marked as paid'); }
    catch{ toast.error('Failed to update'); }
  };

  if(loading) return <div style={{padding:48,display:'flex',justifyContent:'center'}}><span className="spinner" style={{width:32,height:32}}/></div>;
  if(!visit)  return <div style={{padding:48,textAlign:'center',color:'var(--ink-faint)'}}>Visit not found.</div>;

  const b = visit.bill;
  const tabs = ['overview','prescriptions','lab-tests','notes','bill'];

  const PrintDoc = () => (
    <div style={{fontFamily:'Georgia,serif',padding:32,maxWidth:800,margin:'0 auto',color:'#000'}}>
      <div style={{borderBottom:'2px solid #000',paddingBottom:16,marginBottom:20,display:'flex',justifyContent:'space-between'}}>
        <div>
          <div style={{fontSize:'1.4rem',fontWeight:700}}>ABC Health Clinic</div>
          <div style={{fontSize:'0.8rem',color:'#555'}}>123 Medical Street · Tel: +1 555-000-1234</div>
          <div style={{fontSize:'0.8rem',color:'#555'}}>Dr. Sarah Chen, MBBS — General Practice</div>
        </div>
        <div style={{fontWeight:700,fontSize:'1.1rem',color:printMode==='bill'?'#0d7c6b':printMode==='lab'?'#1a56a8':'#0d7c6b',fontSize:printMode==='prescription'?'3rem':'1.1rem',lineHeight:1}}>
          {printMode==='prescription'?'℞':printMode==='lab'?'LAB REQUEST':'INVOICE'}
        </div>
      </div>
      <div style={{background:'#f5f5f5',padding:'10px 14px',borderRadius:6,marginBottom:20,display:'flex',justifyContent:'space-between',fontSize:'0.85rem'}}>
        <div><strong>Patient:</strong> {visit.patient?.name} &nbsp; <strong>Date:</strong> {fmtDate(visit.visit_date)}</div>
        <div><strong>Ref #:</strong> {visit.id?.slice(0,8).toUpperCase()}</div>
      </div>
      {printMode==='prescription'&&<>
        <div style={{fontSize:'0.75rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8}}>Prescriptions</div>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.82rem'}}>
          <thead><tr>{['#','Drug','Dosage','Frequency','Duration','Route','Instructions'].map(h=><th key={h} style={{background:'#f0f0f0',padding:'7px 9px',border:'1px solid #ccc',textAlign:'left'}}>{h}</th>)}</tr></thead>
          <tbody>{(visit.prescriptions||[]).map((rx,i)=><tr key={i}><td style={{padding:'7px 9px',border:'1px solid #ddd'}}>{i+1}</td><td style={{padding:'7px 9px',border:'1px solid #ddd'}}><strong>{rx.drug_name}</strong></td><td style={{padding:'7px 9px',border:'1px solid #ddd'}}>{rx.dosage}</td><td style={{padding:'7px 9px',border:'1px solid #ddd'}}>{rx.frequency}</td><td style={{padding:'7px 9px',border:'1px solid #ddd'}}>{rx.duration}</td><td style={{padding:'7px 9px',border:'1px solid #ddd'}}>{rx.route}</td><td style={{padding:'7px 9px',border:'1px solid #ddd'}}>{rx.notes}</td></tr>)}</tbody>
        </table>
      </>}
      {printMode==='lab'&&<>
        <div style={{fontSize:'0.75rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8}}>Investigations Ordered</div>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.82rem'}}>
          <thead><tr>{['#','Test','Code','Priority','Notes'].map(h=><th key={h} style={{background:'#f0f0f0',padding:'7px 9px',border:'1px solid #ccc',textAlign:'left'}}>{h}</th>)}</tr></thead>
          <tbody>{(visit.lab_tests||[]).map((t,i)=><tr key={i}><td style={{padding:'7px 9px',border:'1px solid #ddd'}}>{i+1}</td><td style={{padding:'7px 9px',border:'1px solid #ddd'}}><strong>{t.test_name}</strong></td><td style={{padding:'7px 9px',border:'1px solid #ddd',fontFamily:'monospace'}}>{t.test_code}</td><td style={{padding:'7px 9px',border:'1px solid #ddd',textTransform:'uppercase',fontWeight:600}}>{t.priority}</td><td style={{padding:'7px 9px',border:'1px solid #ddd'}}>{t.notes}</td></tr>)}</tbody>
        </table>
      </>}
      {printMode==='bill'&&b&&<>
        <div style={{fontSize:'0.75rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8}}>Bill Details · Status: {b.status?.toUpperCase()}</div>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.82rem',marginBottom:16}}>
          <thead><tr>{['Description','Category','Qty','Unit','Total'].map(h=><th key={h} style={{background:'#f0f0f0',padding:'7px 9px',border:'1px solid #ccc',textAlign:'left'}}>{h}</th>)}</tr></thead>
          <tbody>{(b.line_items||[]).map((item,i)=><tr key={i}><td style={{padding:'7px 9px',border:'1px solid #ddd'}}>{item.description}</td><td style={{padding:'7px 9px',border:'1px solid #ddd',textTransform:'capitalize'}}>{item.category}</td><td style={{padding:'7px 9px',border:'1px solid #ddd'}}>{item.quantity}</td><td style={{padding:'7px 9px',border:'1px solid #ddd'}}>${Number(item.unit_price).toFixed(2)}</td><td style={{padding:'7px 9px',border:'1px solid #ddd'}}><strong>${Number(item.total).toFixed(2)}</strong></td></tr>)}</tbody>
        </table>
        <div style={{maxWidth:240,marginLeft:'auto'}}>
          {[['Consultation',b.consultation_fee],['Drugs',b.drug_total],['Lab Tests',b.lab_total],['Tax (5%)',b.tax_amount]].map(([l,v])=>(
            <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom:'1px solid #eee',fontSize:'0.85rem'}}><span>{l}</span><span>${Number(v).toFixed(2)}</span></div>
          ))}
          <div style={{display:'flex',justifyContent:'space-between',padding:'8px 0',fontWeight:700,fontSize:'1rem',borderTop:'2px solid #000'}}><span>TOTAL</span><span>${Number(b.total_amount).toFixed(2)}</span></div>
        </div>
      </>}
      <div style={{display:'flex',justifyContent:'space-between',marginTop:40,fontSize:'0.8rem',color:'#555'}}>
        <div>Patient Signature: _________________________</div>
        <div>Doctor Signature: _________________________</div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:'100vh'}}>
      {printMode && <div className="print-only"><PrintDoc/></div>}

      <div className="no-print">
        {/* Header */}
        <div className="vd-hdr">
          <div style={{display:'flex',alignItems:'flex-start',gap:14}}>
            <button className="btn btn-ghost btn-sm" style={{marginTop:2}} onClick={()=>navigate('/')}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M5 12l7-7M5 12l7 7"/></svg>
            </button>
            <div>
              <h1 style={{fontSize:'1.5rem'}}>{visit.patient?.name}</h1>
              <div className="vd-meta">
                <span className={`badge badge-${visit.status==='finalized'?'success':'draft'}`}>{visit.status}</span>
                <span style={{fontSize:'0.8rem',color:'var(--ink-faint)'}}>{fmtShort(visit.visit_date)}</span>
                <span style={{fontSize:'0.75rem',color:'var(--ink-faint)',fontFamily:'monospace'}}>#{visit.id?.slice(0,8).toUpperCase()}</span>
              </div>
            </div>
          </div>
          <div className="vd-acts">
            {[['Print Rx','prescription'],['Print Lab','lab'],['Print Bill','bill']].map(([l,m])=>(
              <button key={m} className="btn btn-secondary btn-sm" onClick={()=>handlePrint(m)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Summary strip */}
        <div className="sum-strip">
          {[
            {label:'Prescriptions', val:visit.prescriptions?.length||0, color:'var(--violet)'},
            {label:'Lab Tests',     val:visit.lab_tests?.length||0,     color:'var(--blue)'},
            {label:'Notes',         val:visit.clinical_notes?.length||0,color:'var(--amber)'},
            {label:'Total Bill',    val:b?`$${Number(b.total_amount).toFixed(2)}`:'—', color:'var(--teal)'},
            {label:'Bill Status',   val:b?.status||'N/A', color:b?.status==='paid'?'var(--green)':'var(--amber)'},
          ].map(s=>(
            <div key={s.label} className="sum-item">
              <div className="sum-lbl">{s.label}</div>
              <div className="sum-val" style={{color:s.color}}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs">
          {tabs.map(t=>(
            <button key={t} className={`tab${tab===t?' on':''}`} onClick={()=>setTab(t)}>
              {t.replace('-',' ')}
            </button>
          ))}
        </div>

        <div className="tab-body">
          {/* Overview */}
          {tab==='overview' && (
            <div className="two-col fade-up">
              <div className="card">
                <div className="card-header"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><h3 style={{fontSize:'0.95rem'}}>Patient Info</h3></div>
                <div className="card-body info-grid">
                  {[['Name',visit.patient?.name],['Gender',visit.patient?.gender||'—'],['Phone',visit.patient?.phone||'—'],['Email',visit.patient?.email||'—']].map(([l,v])=>(
                    <div key={l}><div className="info-lbl">{l}</div><div className="info-val">{v}</div></div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="card-header"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><h3 style={{fontSize:'0.95rem'}}>Visit Info</h3></div>
                <div className="card-body">
                  <div className="info-lbl">Date</div><div className="info-val" style={{marginBottom:12}}>{fmtDate(visit.visit_date)}</div>
                  <div className="info-lbl">Diagnoses</div>
                  {visit.clinical_notes?.filter(n=>n.category==='diagnosis').map((n,i)=>(
                    <div key={i} style={{fontSize:'0.88rem',color:'var(--rose)',marginTop:3}}>{n.content}</div>
                  ))||<div style={{fontSize:'0.88rem',color:'var(--ink-faint)'}}>—</div>}
                </div>
              </div>
              {visit.raw_input&&(
                <div className="card" style={{gridColumn:'1/-1'}}>
                  <div className="card-header"><h3 style={{fontSize:'0.95rem'}}>Original Notes</h3></div>
                  <div className="card-body"><pre className="raw-notes">{visit.raw_input}</pre></div>
                </div>
              )}
            </div>
          )}

          {/* Prescriptions */}
          {tab==='prescriptions' && (
            <div className="fade-up">
              {!visit.prescriptions?.length?<div style={{padding:'48px',textAlign:'center',color:'var(--ink-faint)'}}>No prescriptions.</div>:(
                <div className="card" style={{overflow:'hidden'}}>
                  <table>
                    <thead><tr><th>#</th><th>Drug</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Route</th><th>Notes</th><th>Price</th></tr></thead>
                    <tbody>{visit.prescriptions.map((rx,i)=>(
                      <tr key={rx.id}><td style={{color:'var(--ink-faint)'}}>{i+1}</td><td style={{fontWeight:500}}>{rx.drug_name}</td><td>{rx.dosage||'—'}</td><td>{rx.frequency||'—'}</td><td>{rx.duration||'—'}</td><td>{rx.route||'—'}</td><td style={{color:'var(--ink-muted)'}}>{rx.notes||'—'}</td><td style={{color:'var(--teal)',fontWeight:600}}>${Number(rx.unit_price).toFixed(2)}</td></tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Lab Tests */}
          {tab==='lab-tests' && (
            <div className="fade-up">
              {!visit.lab_tests?.length?<div style={{padding:'48px',textAlign:'center',color:'var(--ink-faint)'}}>No lab tests.</div>:(
                <div className="card" style={{overflow:'hidden'}}>
                  <table>
                    <thead><tr><th>#</th><th>Test</th><th>Code</th><th>Priority</th><th>Notes</th><th>Price</th></tr></thead>
                    <tbody>{visit.lab_tests.map((t,i)=>(
                      <tr key={t.id}><td style={{color:'var(--ink-faint)'}}>{i+1}</td><td style={{fontWeight:500}}>{t.test_name}</td>
                        <td><code style={{background:'var(--surface2)',padding:'2px 6px',borderRadius:4,fontSize:'0.78rem'}}>{t.test_code||'—'}</code></td>
                        <td><span className={`badge badge-${t.priority==='urgent'||t.priority==='stat'?'urgent':'lab'}`}>{t.priority||'routine'}</span></td>
                        <td style={{color:'var(--ink-muted)'}}>{t.notes||'—'}</td><td style={{color:'var(--teal)',fontWeight:600}}>${Number(t.price).toFixed(2)}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {tab==='notes' && (
            <div className="fade-up" style={{display:'flex',flexDirection:'column',gap:12}}>
              {!visit.clinical_notes?.length?<div style={{padding:'48px',textAlign:'center',color:'var(--ink-faint)'}}>No clinical notes.</div>
              :visit.clinical_notes.map(note=>{
                const cs=catStyle[note.category]||catStyle.observation;
                return(
                  <div key={note.id} className="card" style={{borderLeft:`3px solid ${cs.color}`}}>
                    <div className="card-body" style={{padding:'14px 18px'}}>
                      <span className="badge" style={{background:cs.bg,color:cs.color,marginBottom:8,display:'inline-block'}}>{catLabel[note.category]||note.category}</span>
                      <p style={{fontSize:'0.9rem',lineHeight:1.7}}>{note.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bill */}
          {tab==='bill' && (
            <div className="fade-up">
              {!b?<div style={{padding:'48px',textAlign:'center',color:'var(--ink-faint)'}}>No bill generated yet.</div>:(
                <div className="bill-grid">
                  <div className="card" style={{overflow:'hidden'}}>
                    <div className="card-header" style={{justifyContent:'space-between'}}>
                      <h3 style={{fontSize:'0.95rem'}}>Line Items</h3>
                      <span className={`badge badge-${b.status==='paid'?'success':'pending'}`}>{b.status}</span>
                    </div>
                    <table>
                      <thead><tr><th>Description</th><th>Category</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead>
                      <tbody>{(b.line_items||[]).map((item,i)=>(
                        <tr key={i}><td>{item.description}</td>
                          <td><span className={`badge badge-${item.category==='drug'?'drug':item.category==='lab'?'lab':'note'}`} style={{fontSize:'0.7rem'}}>{item.category}</span></td>
                          <td>{item.quantity}</td><td>${Number(item.unit_price).toFixed(2)}</td>
                          <td style={{fontWeight:600}}>${Number(item.total).toFixed(2)}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:12}}>
                    <div className="card">
                      <div className="card-header"><h3 style={{fontSize:'0.95rem'}}>Summary</h3></div>
                      <div className="card-body">
                        <div className="bill-rows">
                          {[['Consultation',b.consultation_fee],['Drugs',b.drug_total],['Lab Tests',b.lab_total],['Tax (5%)',b.tax_amount]].map(([l,v])=>(
                            <div key={l} className="bill-row"><span>{l}</span><span style={{fontWeight:500}}>${Number(v).toFixed(2)}</span></div>
                          ))}
                          <div className="bill-row bill-total">
                            <span style={{fontWeight:600}}>TOTAL</span>
                            <span>${Number(b.total_amount).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {b.status!=='paid'&&(
                      <button className="btn btn-primary" onClick={markPaid}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                        Mark as Paid
                      </button>
                    )}
                    <button className="btn btn-secondary" onClick={()=>handlePrint('bill')}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                      Print Invoice
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
