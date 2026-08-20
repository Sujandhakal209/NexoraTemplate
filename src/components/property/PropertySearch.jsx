import { Search } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function PropertySearch({ options = {} }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ purpose: 'sale', location: '', property_type: '' })
  const locations = Object.values(options.locations || {}).flat().filter(
    (item, index, all) => all.findIndex((candidate) => candidate.value.toLocaleLowerCase() === item.value.toLocaleLowerCase()) === index,
  )
  function submit(event) {
    event.preventDefault()
    const route = form.purpose === 'sale' ? '/buy' : form.purpose === 'rent' ? '/rent' : '/properties'
    const query = new URLSearchParams(Object.entries(form).filter(([key, value]) => value && key !== 'purpose'))
    navigate(`${route}${query.size ? `?${query}` : ''}`)
  }
  return <form className="hero-search" onSubmit={submit}>
    <fieldset className="purpose-switch"><legend>Looking to</legend><div><button type="button" className={form.purpose === 'sale' ? 'active' : ''} onClick={() => setForm({ ...form, purpose: 'sale' })}>Buy</button><button type="button" className={form.purpose === 'rent' ? 'active' : ''} onClick={() => setForm({ ...form, purpose: 'rent' })}>Rent</button></div></fieldset>
    <label><span>Location</span><select value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })}><option value="">Any location</option>{locations.map((item) => <option key={item.value} value={item.value}>{item.label} ({item.count})</option>)}</select></label>
    <label><span>Property type</span><select value={form.property_type} onChange={(event) => setForm({ ...form, property_type: event.target.value })}><option value="">All types</option>{(options.property_types || []).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
    <button type="submit" className="button button-primary"><Search size={18} />Search properties</button>
  </form>
}
