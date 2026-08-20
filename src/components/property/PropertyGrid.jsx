import { EmptyState, ErrorState, PageLoader } from '../common/States'
import PropertyCard from './PropertyCard'

export default function PropertyGrid({ properties, loading, error, retry, emptyTitle, emptyMessage, className = '', loadingCount = 6, returnTo }) {
  if (loading) return <div className={`property-grid ${className}`} aria-label="Loading properties">{Array.from({ length: loadingCount }, (_, index) => <div className="property-skeleton" key={index} />)}</div>
  if (error) return <ErrorState title="Properties are temporarily unavailable" message={error.message} onRetry={retry} />
  if (!properties?.length) return <EmptyState title={emptyTitle || 'No properties found'} message={emptyMessage || 'Try changing your filters or check back soon.'} />
  return <div className={`property-grid ${className}`}>{properties.map((property) => <PropertyCard key={property.id} property={property} returnTo={returnTo} />)}</div>
}

export { PageLoader }
