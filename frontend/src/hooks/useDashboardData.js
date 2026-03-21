import { useState, useEffect } from 'react'
import { listVisits, getPatients } from '../utils/api'

export function useDashboardData() {
  const [visits,   setVisits]   = useState([])
  const [patients, setPatients] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([listVisits(), getPatients()])
      .then(([v, p]) => { setVisits(v || []); setPatients(p || []) })
      .finally(() => setLoading(false))
  }, [])

  return {
    visits, patients, loading,
    finalized: visits.filter(v => v.status === 'finalized').length,
    drafts:    visits.filter(v => v.status === 'draft').length,
  }
}
