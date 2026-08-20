import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NotFoundPage({ title = 'Page not found', message = 'The page may have moved, or it is not enabled for this agency website.' }) {
  return <main className="not-found-page"><p className="error-number">404</p><p className="eyebrow">Nothing here</p><h1>{title}</h1><p>{message}</p><Link className="button button-primary" to="/"><ArrowLeft />Return home</Link></main>
}
