import { useNavigate } from 'react-router-dom'
import Badge from '../ui/Badge'
import EmptyState from '../ui/EmptyState'
import Button from '../ui/Button'

function PatientCell({ patient }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-teal-light text-teal text-xs font-bold flex items-center justify-center flex-shrink-0">
        {patient?.name?.charAt(0) || '?'}
      </div>
      <div>
        <div className="font-medium text-sm">{patient?.name || 'Unknown'}</div>
        <div className="text-xs text-ink-faint">{patient?.gender || ''}</div>
      </div>
    </div>
  )
}

export default function VisitsTable({ visits, onNavigate }) {
  if (visits.length === 0) return <EmptyState message="No visits yet." action={<Button onClick={() => onNavigate('/visits/new')}>Create First Visit</Button>} />
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse" style={{ minWidth: 560 }}>
        <thead>
          <tr>
            {['Patient','Date','Status','Drugs','Tests','Bill',''].map(h => (
              <th key={h} className="text-left text-xs font-bold uppercase tracking-wide text-ink-muted px-3 py-2.5 border-b border-bdr bg-surface-2 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visits.map(v => (
            <tr key={v.id} onClick={() => onNavigate('/visits/' + v.id)} className="cursor-pointer hover:bg-surface-2 transition-colors">
              <td className="px-3 py-2.5 border-b border-bdr"><PatientCell patient={v.patient} /></td>
              <td className="px-3 py-2.5 border-b border-bdr text-ink-muted text-sm whitespace-nowrap">{new Date(v.visit_date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</td>
              <td className="px-3 py-2.5 border-b border-bdr"><Badge type={v.status==='finalized'?'success':'draft'}>{v.status}</Badge></td>
              <td className="px-3 py-2.5 border-b border-bdr text-violet font-semibold">{v.prescriptions?.length ?? '—'}</td>
              <td className="px-3 py-2.5 border-b border-bdr text-sky font-semibold">{v.lab_tests?.length ?? '—'}</td>
              <td className="px-3 py-2.5 border-b border-bdr text-teal font-semibold">{v.bill ? `$${Number(v.bill.total_amount).toFixed(2)}` : '—'}</td>
              <td className="px-3 py-2.5 border-b border-bdr text-ink-faint text-sm">View →</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
