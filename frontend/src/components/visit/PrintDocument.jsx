const fmtDate = d => new Date(d).toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})

function PrintHeader({ mode }) {
  return (
    <div style={{borderBottom:'2px solid #000',paddingBottom:14,marginBottom:18,display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
      <div>
        <div style={{fontSize:'1.3rem',fontWeight:700}}>ABC Health Clinic</div>
        <div style={{fontSize:'0.8rem',color:'#555'}}>123 Medical Street · Tel: +1 555-000-1234</div>
        <div style={{fontSize:'0.8rem',color:'#555'}}>Dr. Sarah Chen, MBBS — General Practice</div>
      </div>
      <div style={{fontWeight:700,lineHeight:1,
        fontSize: mode==='prescription' ? '2.5rem' : '1rem',
        color: mode==='bill' ? '#0d7c6b' : mode==='lab' ? '#1a56a8' : '#0d7c6b'}}>
        {mode==='prescription' ? '℞' : mode==='lab' ? 'LAB REQUEST' : 'INVOICE'}
      </div>
    </div>
  )
}

function PrintPatient({ visit }) {
  return (
    <div style={{background:'#f5f5f5',padding:'10px 14px',borderRadius:6,marginBottom:18,display:'flex',justifyContent:'space-between',fontSize:'0.84rem'}}>
      <div><strong>Patient:</strong> {visit.patient?.name} &nbsp; <strong>Date:</strong> {fmtDate(visit.visit_date)}</div>
      <div><strong>Ref #:</strong> {visit.id?.slice(0,8).toUpperCase()}</div>
    </div>
  )
}

function PrintTable({ headers, rows }) {
  return (
    <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.82rem',marginBottom:16}}>
      <thead><tr>{headers.map(h=><th key={h} style={{background:'#f0f0f0',padding:'7px 9px',border:'1px solid #ccc',textAlign:'left'}}>{h}</th>)}</tr></thead>
      <tbody>{rows.map((row,i)=><tr key={i}>{row.map((cell,j)=><td key={j} style={{padding:'7px 9px',border:'1px solid #ddd',verticalAlign:'top'}}>{cell}</td>)}</tr>)}</tbody>
    </table>
  )
}

export default function PrintDocument({ visit, mode }) {
  if (!visit || !mode) return null
  const b = visit.bill
  return (
    <div style={{fontFamily:'Georgia,serif',padding:32,maxWidth:800,margin:'0 auto',color:'#000'}}>
      <PrintHeader mode={mode} />
      <PrintPatient visit={visit} />

      {mode==='prescription' && <>
        <div style={{fontSize:'0.75rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8}}>Prescriptions</div>
        <PrintTable
          headers={['#','Drug','Dosage','Frequency','Duration','Route','Instructions']}
          rows={(visit.prescriptions||[]).map((rx,i)=>[i+1,<strong>{rx.drug_name}</strong>,rx.dosage,rx.frequency,rx.duration,rx.route,rx.notes])}
        />
      </>}

      {mode==='lab' && <>
        <div style={{fontSize:'0.75rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8}}>Investigations Ordered</div>
        <PrintTable
          headers={['#','Test Name','Code','Priority','Notes']}
          rows={(visit.lab_tests||[]).map((t,i)=>[i+1,<strong>{t.test_name}</strong>,<code>{t.test_code}</code>,<span style={{textTransform:'uppercase',fontWeight:600}}>{t.priority}</span>,t.notes])}
        />
      </>}

      {mode==='bill' && b && <>
        <div style={{fontSize:'0.75rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8}}>
          Bill Details · Status: <span style={{color:'#0d7c6b'}}>{b.status?.toUpperCase()}</span>
        </div>
        <PrintTable
          headers={['Description','Category','Qty','Unit Price','Total']}
          rows={(b.line_items||[]).map(item=>[item.description,item.category,item.quantity,`$${Number(item.unit_price).toFixed(2)}`,<strong>{`$${Number(item.total).toFixed(2)}`}</strong>])}
        />
        <div style={{maxWidth:240,marginLeft:'auto'}}>
          {[['Consultation',b.consultation_fee],['Drugs',b.drug_total],['Lab Tests',b.lab_total],['Tax (5%)',b.tax_amount]].map(([l,v])=>(
            <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom:'1px solid #eee',fontSize:'0.84rem'}}><span>{l}</span><span>${Number(v).toFixed(2)}</span></div>
          ))}
          <div style={{display:'flex',justifyContent:'space-between',padding:'8px 0',fontWeight:700,fontSize:'1rem',borderTop:'2px solid #000'}}><span>TOTAL</span><span>${Number(b.total_amount).toFixed(2)}</span></div>
        </div>
      </>}

      <div style={{display:'flex',justifyContent:'space-between',marginTop:36,fontSize:'0.8rem',color:'#666'}}>
        <span>Patient Signature: _________________________</span>
        <span>Doctor Signature: _________________________</span>
      </div>
    </div>
  )
}
