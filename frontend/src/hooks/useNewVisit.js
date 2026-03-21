import { useState, useEffect, useRef } from 'react'
import { getPatients, getDoctors, createVisit, finalizeVisit } from '../utils/api'
import toast from 'react-hot-toast'

export function useNewVisit() {
  const [step,      setStep]      = useState(1)
  const [patients,  setPatients]  = useState([])
  const [doctors,   setDoctors]   = useState([])
  const [patientId, setPatientId] = useState('')
  const [doctorId,  setDoctorId]  = useState('')
  const [raw,       setRaw]       = useState('')
  const [busy,      setBusy]      = useState(false)
  const [visitId,   setVisitId]   = useState('')
  const [rxList,    setRxList]    = useState([])
  const [labList,   setLabList]   = useState([])
  const [noteList,  setNoteList]  = useState([])
  const [conf,      setConf]      = useState(null)
  const [listen,    setListen]    = useState(false)
  const recRef = useRef(null)

  useEffect(() => {
    Promise.all([getPatients(), getDoctors()]).then(([p, d]) => {
      setPatients(p || [])
      setDoctors(d || [])
      if (d?.length) setDoctorId(d[0].id)
    })
  }, [])

  const startListen = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { toast.error('Speech not supported'); return }
    const r = new SR()
    r.continuous = true; r.interimResults = true; r.lang = 'en-US'
    let final = raw
    r.onresult = e => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += ' ' + e.results[i][0].transcript
        else interim = e.results[i][0].transcript
      }
      setRaw(final + (interim ? ' ' + interim : ''))
    }
    r.onerror = r.onend = () => setListen(false)
    r.start(); recRef.current = r; setListen(true)
  }

  const stopListen = () => { recRef.current?.stop(); setListen(false) }

  const classify = async () => {
    if (!patientId) { toast.error('Select a patient'); return }
    if (!raw.trim()) { toast.error('Enter notes first'); return }
    setBusy(true)
    try {
      const res = await createVisit({ patient_id: patientId, doctor_id: doctorId, raw_input: raw })
      setVisitId(res.visit.id)
      setRxList(res.ai_result.prescriptions || [])
      setLabList(res.ai_result.lab_tests || [])
      setNoteList(res.ai_result.clinical_notes || [])
      setConf(res.ai_result.confidence)
      setStep(2)
      toast.success('AI classification complete!')
    } catch (e) { toast.error(e.response?.data?.error || 'Classification failed') }
    finally { setBusy(false) }
  }

  const finalize = async () => {
    setBusy(true)
    try {
      await finalizeVisit({ visit_id: visitId, prescriptions: rxList, lab_tests: labList, clinical_notes: noteList })
      setStep(3)
      toast.success('Visit finalized!')
    } catch (e) { toast.error(e.response?.data?.error || 'Failed') }
    finally { setBusy(false) }
  }

  return {
    step, setStep, patients, doctors,
    patientId, setPatientId, doctorId, setDoctorId,
    raw, setRaw, busy, visitId, conf,
    rxList, setRxList, labList, setLabList, noteList, setNoteList,
    listen, startListen, stopListen, classify, finalize,
  }
}
