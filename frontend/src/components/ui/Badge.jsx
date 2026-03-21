export default function Badge({ type = 'draft', children }) {
  return <span className={`badge badge-${type}`}>{children}</span>
}
