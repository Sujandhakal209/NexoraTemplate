export function PropertyFactStrip({ facts, variant = 'card', className = '' }) {
  if (!facts.length) return null
  return <div className={`property-fact-strip property-fact-strip-${variant} ${className}`.trim()} aria-label="Key property facts">
    {facts.map(({ icon: Icon, label, value }) => <span key={label} className="property-fact" tabIndex="0" aria-label={`${label}: ${value}`} data-tooltip={label}>
      <Icon aria-hidden="true" />
      <strong>{value}</strong>
    </span>)}
  </div>
}
