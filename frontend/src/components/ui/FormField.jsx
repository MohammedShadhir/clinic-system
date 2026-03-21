export function FormGroup({ children }) {
  return <div className="form-group">{children}</div>
}
export function FormLabel({ children, required }) {
  return <label className="form-label">{children}{required && ' *'}</label>
}
export function FormRow({ children }) {
  return <div className="form-row">{children}</div>
}
export function Input({ ...props }) {
  return <input className="input-field" {...props} />
}
export function Select({ children, ...props }) {
  return <select className="input-field" {...props}>{children}</select>
}
export function Textarea({ ...props }) {
  return <textarea className="input-field" {...props} />
}
