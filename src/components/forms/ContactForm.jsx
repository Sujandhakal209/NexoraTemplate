import { useState } from 'react'
import { Send } from 'lucide-react'
import { contactAgency } from '../../services/inquiryService'
import { FieldError } from '../common/States'
import PhoneInput from './PhoneInput'

const initial = { full_name: '', phone: '', email: '', message: '' }

export default function ContactForm({ agency, compact = false }) {
  const [form, setForm] = useState(initial)
  const [state, setState] = useState({ status: 'idle', error: '' })
  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  async function submit(event) {
    event.preventDefault(); setState({ status: 'submitting', error: '' })
    try {
      await contactAgency(agency, form)
      setForm(initial); setState({ status: 'success', error: '' })
    } catch (error) { setState({ status: 'error', error: error.message }) }
  }
  if (state.status === 'success') return <div className="form-success" role="status"><h3>Thank you for getting in touch.</h3><p>The {agency.name} team has received your message and will contact you soon.</p><button className="text-link" onClick={() => setState({ status: 'idle', error: '' })}>Send another message</button></div>
  return <form className={`form-card ${compact ? 'form-card-compact' : ''}`} onSubmit={submit}>
    <div className="form-grid"><label>Full name<input value={form.full_name} onChange={(e) => set('full_name', e.target.value)} required autoComplete="name" /></label><PhoneInput value={form.phone} onChange={(value) => set('phone', value)} required /></div>
    <label>Email address <span>(optional)</span><input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" /></label>
    <label>How can we help?<textarea rows={compact ? 4 : 6} value={form.message} onChange={(e) => set('message', e.target.value)} placeholder="Tell us what you are looking for." /></label>
    <FieldError error={state.error} />
    <button className="button button-primary" type="submit" disabled={state.status === 'submitting'}><Send size={17} />{state.status === 'submitting' ? 'Sending…' : 'Send message'}</button>
  </form>
}
