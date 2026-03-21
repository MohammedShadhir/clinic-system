import Button from '../ui/Button'

const STEPS = ['Input Notes', 'Review & Edit', 'Done']

export default function WizardHeader({ step, onBack }) {
  return (
    <div className="bg-white border-b border-bdr px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-card no-print flex-wrap gap-2">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M5 12l7-7M5 12l7 7"/></svg>
        Back
      </Button>
      <div className="flex items-center gap-4 flex-wrap">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border-2 transition-all
              ${step > i+1 ? 'bg-emerald-light text-emerald border-emerald'
              : step === i+1 ? 'bg-teal text-white border-teal'
              : 'bg-surface-2 text-ink-faint border-bdr-strong'}`}>
              {step > i+1 ? '✓' : i+1}
            </div>
            <span className={`text-sm hidden sm:block ${step===i+1?'text-teal font-medium':'text-ink-faint'}`}>{s}</span>
          </div>
        ))}
      </div>
      <div className="w-16 hidden sm:block" />
    </div>
  )
}
