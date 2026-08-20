import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Pagination from '../components/property/Pagination'
import PropertyGrid from '../components/property/PropertyGrid'
import { useTenant } from '../context/TenantContext'
import { useAsync } from '../hooks/useAsync'
import { getProperties, getPropertyOptions } from '../services/propertyService'
import { setAgencySeo } from '../utils/seo'

const filterNames = [
  'search', 'purpose', 'property_type', 'location', 'price_min', 'price_max', 'bedrooms', 'bathrooms',
  'land_use_classification', 'road_type', 'has_water_supply', 'has_electricity', 'has_drainage',
  'has_sewage', 'ordering',
]
const advancedNames = ['price_min', 'price_max', 'bedrooms', 'bathrooms', 'land_use_classification', 'road_type', 'has_water_supply', 'has_electricity', 'has_drainage', 'has_sewage']
const pageSize = 24

export default function PropertiesPage({ forcedPurpose = '' }) {
  const { agency } = useTenant()
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const filters = useMemo(() => {
    const result = Object.fromEntries(filterNames.map((name) => [name, params.get(name) || '']))
    if (forcedPurpose) result.purpose = forcedPurpose
    if (!result.ordering) result.ordering = 'newest'
    return result
  }, [params, forcedPurpose])
  const [keyword, setKeyword] = useState(filters.search)
  const page = Math.max(1, Number(params.get('page')) || 1)
  const requestFilters = useMemo(() => ({ ...filters, page, page_size: pageSize }), [filters, page])
  const queryKey = JSON.stringify(requestFilters)
  const data = useAsync(() => getProperties(agency, requestFilters), [agency.id, queryKey])
  const options = useAsync(() => getPropertyOptions(agency), [agency.id])
  const properties = data.data?.results || []
  const total = data.data?.count || 0
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(page, pages)
  const title = forcedPurpose === 'sale' ? 'Properties for sale' : forcedPurpose === 'rent' ? 'Properties for rent' : 'Properties'

  useEffect(() => setAgencySeo(agency, { title: `${title} | ${agency.name}`, description: `Browse current ${title.toLowerCase()} from ${agency.name}.` }), [agency, title])
  useEffect(() => setKeyword(filters.search), [filters.search])
  useEffect(() => {
    if (keyword === filters.search) return undefined
    const timer = window.setTimeout(() => {
      setParams((current) => {
        const next = new URLSearchParams(current)
        keyword ? next.set('search', keyword) : next.delete('search')
        next.delete('page')
        return next
      }, { replace: true })
    }, 400)
    return () => window.clearTimeout(timer)
  }, [keyword, filters.search, setParams])

  function updateFilter(name, value) {
    setParams((current) => {
      const next = new URLSearchParams(current)
      value ? next.set(name, value) : next.delete(name)
      next.delete('page')
      return next
    }, { replace: true })
  }
  function updatePage(value) {
    setParams((current) => {
      const next = new URLSearchParams(current)
      value > 1 ? next.set('page', String(value)) : next.delete('page')
      return next
    })
  }
  function reset() {
    setParams((current) => {
      const next = new URLSearchParams(current)
      filterNames.forEach((name) => next.delete(name))
      next.delete('page')
      return next
    }, { replace: true })
    setKeyword('')
  }
  function applyAdvanced(values) {
    setParams((current) => {
      const next = new URLSearchParams(current)
      advancedNames.forEach((name) => values[name] ? next.set(name, values[name]) : next.delete(name))
      next.delete('page')
      return next
    }, { replace: true })
    setFiltersOpen(false)
  }

  const activeFilters = filterNames.filter((name) => filters[name] && name !== 'ordering' && !(name === 'purpose' && forcedPurpose))
  const groupedLocations = groupLocations(options.data?.locations || {})
  return <main>
    <section className="listing-header"><div className="container"><div><p className="eyebrow">Current listings</p><h1>{title}</h1></div><p>{data.loading ? 'Loading current inventory…' : <><strong>{total}</strong> {total === 1 ? 'property' : 'properties'} found</>}</p></div></section>
    <section className="listing-market container">
      <div className="quick-filters">
        <label className="keyword-filter"><Search /><span className="sr-only">Search properties</span><input type="search" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Search title, landmark or area" /></label>
        {!forcedPurpose && <label><span className="sr-only">Listing type</span><select value={filters.purpose} onChange={(event) => updateFilter('purpose', event.target.value)}><option value="">Buy or rent</option>{(options.data?.purposes || []).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>}
        <label><span className="sr-only">Location</span><select value={filters.location} onChange={(event) => updateFilter('location', event.target.value)}><option value="">Any location</option>{Object.entries(groupedLocations).map(([group, items]) => <optgroup key={group} label={group}>{items.map((item) => <option key={`${item.type}-${item.value}`} value={item.value}>{item.label}</option>)}</optgroup>)}</select></label>
        <label><span className="sr-only">Property type</span><select value={filters.property_type} onChange={(event) => updateFilter('property_type', event.target.value)}><option value="">All property types</option>{(options.data?.property_types || []).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <button className="button button-outline more-filters" onClick={() => setFiltersOpen(true)}><SlidersHorizontal size={17} />More filters{advancedNames.some((name) => filters[name]) && <span>{advancedNames.filter((name) => filters[name]).length}</span>}</button>
      </div>
      <div className="listing-toolbar">
        <div className="active-filters" aria-label="Active filters">{activeFilters.map((name) => <button key={name} onClick={() => name === 'search' ? setKeyword('') : updateFilter(name, '')}>{filterLabel(name, filters[name], options.data)}<X /></button>)}{activeFilters.length > 1 && <button className="clear-filters" onClick={reset}>Clear all</button>}</div>
        <label className="sort-control"><span>Sort</span><select value={filters.ordering} onChange={(event) => updateFilter('ordering', event.target.value)}><option value="newest">Newest first</option><option value="price">Price: low to high</option><option value="-price">Price: high to low</option><option value="oldest">Oldest first</option></select></label>
      </div>
      {data.loading || data.error || properties.length > 0
        ? <PropertyGrid className="listing-grid" properties={properties} loading={data.loading} error={data.error} retry={data.retry} loadingCount={6} />
        : <ListingEmpty forcedPurpose={forcedPurpose} hasFilters={activeFilters.length > 0} onReset={reset} />}
      <Pagination page={currentPage} pages={pages} onChange={(value) => { updatePage(value); window.scrollTo({ top: 180, behavior: 'smooth' }) }} />
    </section>
    {filtersOpen && <AdvancedFilters filters={filters} options={options.data || {}} onApply={applyAdvanced} onClear={reset} onClose={() => setFiltersOpen(false)} />}
  </main>
}

function groupLocations(locations) {
  const labels = { cities: 'Cities', municipalities: 'Municipalities', neighbourhoods: 'Neighbourhoods', toles: 'Local areas', districts: 'Districts', provinces: 'Provinces' }
  return Object.fromEntries(Object.entries(labels).map(([key, label]) => [label, locations[key] || []]).filter(([, items]) => items.length))
}

function filterLabel(name, value, options = {}) {
  if (name === 'search') return `“${value}”`
  const source = options || {}
  const locationOptions = Object.values(source.locations || {}).flat()
  const optionLists = { purpose: source.purposes, property_type: source.property_types, location: locationOptions, land_use_classification: source.land_use_classifications, road_type: source.road_types }
  const match = (optionLists[name] || []).find((item) => item.value === value)
  const labels = { price_min: `From ${Number(value).toLocaleString()}`, price_max: `Up to ${Number(value).toLocaleString()}`, bedrooms: `${value}+ beds`, bathrooms: `${value}+ baths`, has_water_supply: 'Water', has_electricity: 'Electricity', has_drainage: 'Drainage', has_sewage: 'Sewage' }
  return match?.label || labels[name] || value
}

function AdvancedFilters({ filters, options, onApply, onClear, onClose }) {
  const [draft, setDraft] = useState(() => Object.fromEntries(advancedNames.map((name) => [name, filters[name] || ''])))
  const closeRef = useRef(null)
  useEffect(() => {
    const previous = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const escape = (event) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', escape)
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', escape); previous?.focus?.() }
  }, [onClose])
  const set = (name, value) => setDraft((current) => ({ ...current, [name]: value }))
  const utilities = [['has_water_supply', 'Water supply'], ['has_electricity', 'Electricity'], ['has_drainage', 'Drainage'], ['has_sewage', 'Sewage']]
  return <div className="filter-modal"><button className="filter-backdrop" aria-label="Close filters" onClick={onClose} /><aside className="advanced-filters" role="dialog" aria-modal="true" aria-labelledby="advanced-filter-title">
    <div className="filter-heading"><div><p className="eyebrow">Refine results</p><h2 id="advanced-filter-title">More filters</h2></div><button ref={closeRef} onClick={onClose} aria-label="Close filters"><X /></button></div>
    <div className="form-grid"><label>Minimum price<input type="number" min="0" value={draft.price_min} onChange={(event) => set('price_min', event.target.value)} placeholder="No minimum" /></label><label>Maximum price<input type="number" min="0" value={draft.price_max} onChange={(event) => set('price_max', event.target.value)} placeholder="No maximum" /></label></div>
    <div className="form-grid"><label>Bedrooms<select value={draft.bedrooms} onChange={(event) => set('bedrooms', event.target.value)}><option value="">Any</option>{[1,2,3,4,5].map((value) => <option key={value} value={value}>{value}+</option>)}</select></label><label>Bathrooms<select value={draft.bathrooms} onChange={(event) => set('bathrooms', event.target.value)}><option value="">Any</option>{[1,2,3,4].map((value) => <option key={value} value={value}>{value}+</option>)}</select></label></div>
    <label>Land classification<select value={draft.land_use_classification} onChange={(event) => set('land_use_classification', event.target.value)}><option value="">Any classification</option>{(options.land_use_classifications || []).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
    <label>Road type<select value={draft.road_type} onChange={(event) => set('road_type', event.target.value)}><option value="">Any road type</option>{(options.road_types || []).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
    <fieldset className="utility-filters"><legend>Utilities</legend>{utilities.map(([name, label]) => <label key={name}><input type="checkbox" checked={draft[name] === 'true'} onChange={(event) => set(name, event.target.checked ? 'true' : '')} />{label}</label>)}</fieldset>
    <div className="filter-actions"><button className="button button-plain" onClick={() => { onClear(); onClose() }}>Clear all</button><button className="button button-primary" onClick={() => onApply(draft)}>Apply filters</button></div>
  </aside></div>
}

function ListingEmpty({ forcedPurpose, hasFilters, onReset }) {
  const rental = forcedPurpose === 'rent'
  const sale = forcedPurpose === 'sale'
  const title = rental ? 'No rentals are currently available' : sale ? 'No properties for sale are currently available' : 'No properties match these filters'
  const message = hasFilters ? 'Try clearing the current filters or browse the agency’s full inventory.' : 'New listings will appear here as soon as the agency publishes them.'
  return <div className="listing-empty"><h2>{title}</h2><p>{message}</p><div>{hasFilters && <button className="button button-primary" onClick={onReset}>Clear filters</button>}<Link className="button button-outline" to="/properties">Browse all properties</Link><Link className="text-link" to="/contact">Contact the agency</Link></div></div>
}
