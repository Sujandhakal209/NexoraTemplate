import { Globe2, WifiOff } from 'lucide-react'

export default function UnavailablePage({ type = 'not-found', message }) {
  const offline = type === 'error'
  return <main className="unavailable-page"><div className="unavailable-mark">{offline ? <WifiOff /> : <Globe2 />}</div><p className="eyebrow">{offline ? 'Temporarily unavailable' : 'Website unavailable'}</p><h1>{offline ? 'We cannot load this website right now.' : 'This agency website is not currently published.'}</h1><p>{message || (offline ? 'Please check your connection or try again in a few minutes.' : 'The domain may be incorrect, or the agency may be updating its website.')}</p><button className="button button-primary" onClick={() => window.location.reload()}>Try again</button></main>
}
