export default function EmptyState({ message, action }) {
  return (
    <div className="py-12 text-center text-ink-faint">
      <p className="text-sm mb-3">{message}</p>
      {action}
    </div>
  )
}
