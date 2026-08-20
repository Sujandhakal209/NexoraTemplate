import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { formatMeasurement, formatRelativeDate, propertyRoute, titleCase } from '../../utils/format'

function propertyFacts(property) {
  const landArea = formatMeasurement(property.landAreaValue, property.landAreaUnit)
  const builtArea = formatMeasurement(property.builtUpAreaValue, property.builtUpAreaUnit)
  if (property.propertyType === 'land') {
    return [
      landArea,
      property.road_access_value ? `${property.road_access_value} ${property.road_access_unit || ''} road` : '',
      titleCase(property.land_use_classification),
    ].filter(Boolean).slice(0, 3)
  }
  if (['commercial', 'office_space'].includes(property.propertyType)) {
    return [
      builtArea || landArea,
      property.parking_spaces ? `${property.parking_spaces} parking` : '',
      property.furnishing_status_display,
    ].filter(Boolean).slice(0, 3)
  }
  return [
    property.beds > 0 ? `${property.beds} bed` : '',
    property.baths > 0 ? `${property.baths} bath` : '',
    builtArea || landArea,
  ].filter(Boolean).slice(0, 3)
}

export default function PropertyCard({ property, returnTo }) {
  const location = useLocation()
  const [imageFailed, setImageFailed] = useState(false)
  useEffect(() => setImageFailed(false), [property.image])
  const facts = propertyFacts(property)
  const freshness = formatRelativeDate(property.published_at || property.created_at)
  const source = returnTo || `${location.pathname}${location.search}`

  return <article className="property-card">
    <Link to={propertyRoute(property)} state={{ returnTo: source }} className="property-card-link" aria-label={`View ${property.title}`}>
      <div className="property-card-image">
        {property.image && !imageFailed
          ? <img src={property.image} srcSet={property.imageSrcSet || undefined} alt={property.title} width={property.imageWidth || 640} height={property.imageHeight || 400} sizes="(min-width: 1280px) 30vw, (min-width: 760px) 46vw, 100vw" loading="lazy" onError={() => setImageFailed(true)} />
          : <div className="image-fallback">Property image unavailable</div>}
        <div className="card-badges"><span>{property.purposeLabel}</span>{property.featured && <span className="featured-badge">Featured</span>}</div>
        {property.images?.length > 1 && <span className="media-count" aria-label={`${property.images.length} photos`}>{property.images.length} photos</span>}
      </div>
      <div className="property-card-body">
        <div className="property-price-row"><p className="property-price">{property.priceLabel}</p>{freshness && <span>{freshness}</span>}</div>
        <h3>{property.title}</h3>
        <p className="property-location">{property.location || 'Location available on request'}</p>
        {facts.length > 0 && <p className="property-facts">{facts.join(' · ')}</p>}
        <div className="card-footer"><span>{property.propertyTypeLabel}</span>{property.verification.is_fully_verified && <span className="verified">Verified</span>}</div>
      </div>
    </Link>
  </article>
}
