import Button from '../ui/Button'
import Spinner from '../ui/Spinner'

export default function NotesInput({ raw, setRaw, listen, onStartListen, onStopListen, onLoadSample, onClassify, busy, disabled }) {
  return (
    <div className="card overflow-hidden">
      <div className="card-header justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0d7c6b" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          <h3 className="text-base">Clinical Notes</h3>
        </div>
        <div className="flex gap-2">
          <Button variant={listen ? 'danger' : 'secondary'} size="sm" onClick={listen ? onStopListen : onStartListen}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/></svg>
            {listen ? 'Stop' : 'Dictate'}
          </Button>
          <Button variant="secondary" size="sm" onClick={onLoadSample}>Load Sample</Button>
        </div>
      </div>

      {listen && (
        <div className="mx-4 mt-2 inline-flex items-center gap-2 bg-rose-light border border-rose text-rose text-xs px-3 py-1.5 rounded-btn">
          <span className="w-2 h-2 bg-rose rounded-full" style={{animation:'blink 1s infinite'}} />
          Listening…
        </div>
      )}

      <textarea
        value={raw}
        onChange={e => setRaw(e.target.value)}
        rows={14}
        placeholder="Enter complete clinical notes — medications, lab tests, observations, diagnoses, and plans all together..."
        className="w-full border-0 p-5 font-mono text-sm leading-relaxed resize-y bg-canvas outline-none min-h-[220px]"
      />

      <div className="flex items-center justify-between px-4 py-3 bg-surface-2 border-t border-bdr flex-wrap gap-2">
        <span className="text-xs text-ink-faint">{raw.length} characters</span>
        <Button variant="primary" size="lg" onClick={onClassify} disabled={busy || disabled}>
          {busy ? <><Spinner /> Classifying…</> : <>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            Classify with AI
          </>}
        </Button>
      </div>
    </div>
  )
}
