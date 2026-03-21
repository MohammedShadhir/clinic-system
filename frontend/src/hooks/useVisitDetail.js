import { useState, useEffect } from 'react'
import { getVisit, updateBillStatus } from '../utils/api'
import toast from 'react-hot-toast'

export function useVisitDetail(id) {
  const [visit,   setVisit]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getVisit(id)
      .then(setVisit)
      .catch(() => toast.error('Visit not found'))
      .finally(() => setLoading(false))
  }, [id])

  const markPaid = async () => {
    try {
      await updateBillStatus(id, 'paid')
      setVisit(v => ({ ...v, bill: { ...v.bill, status: 'paid' } }))
      toast.success('Bill marked as paid')
    } catch {
      toast.error('Failed to update')
    }
  }

  return { visit, loading, markPaid }
}
