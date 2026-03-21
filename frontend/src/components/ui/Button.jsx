export default function Button({
  children, variant = 'primary', size = '', icon: Icon,
  onClick, disabled, type = 'button', className = ''
}) {
  const cls = ['btn', `btn-${variant}`, size ? `btn-${size}` : '', className].filter(Boolean).join(' ')
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}
