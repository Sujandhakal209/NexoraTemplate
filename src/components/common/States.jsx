import { AlertTriangle, Building2, LoaderCircle, RefreshCw } from 'lucide-react'

export function PageLoader({ label = 'Loading the latest information…' }) {
  return <div className="state-panel" role="status"><LoaderCircle className="spin" /><p>{label}</p></div>
}

export function ErrorState({ title = 'Something went wrong', message = 'Please try again shortly.', onRetry }) {
  return <div className="state-panel"><AlertTriangle /><h2>{title}</h2><p>{message}</p>{onRetry && <button className="button button-outline" onClick={onRetry}><RefreshCw size={16} />Try again</button>}</div>
}

export function EmptyState({ title = 'Nothing to show yet', message = 'Please check again soon.' }) {
  return <div className="state-panel"><Building2 /><h2>{title}</h2><p>{message}</p></div>
}

export function FieldError({ error }) {
  if (!error) return null
  return <p className="field-error" role="alert">{error}</p>
}
