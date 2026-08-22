import { Heart, Images, Play, Share2, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { formatRelativeDate, propertyRoute } from '../../utils/format'
import { PropertyFactStrip } from './PropertyFacts'
import { getPropertyFacts } from './propertyFactUtils'

const SAVED_PROPERTIES_KEY = 'nexora_saved_properties'

function savedPropertyIds() {
  try { return JSON.parse(localStorage.getItem(SAVED_PROPERTIES_KEY) || '[]').map(String) } catch { return [] }
}

export default function PropertyCard({ property, returnTo }) {
  const location = useLocation()
  const [imageFailed, setImageFailed] = useState(false)
  const [saved, setSaved] = useState(() => savedPropertyIds().includes(String(property.id)))
  const [shareLabel, setShareLabel] = useState('Share property')
  useEffect(() => setImageFailed(false), [property.image])
  useEffect(() => setSaved(savedPropertyIds().includes(String(property.id))), [property.id])
  const facts = getPropertyFacts(property).slice(0, 3)
  const freshness = formatRelativeDate(property.published_at || property.created_at)
  const source = returnTo || `${location.pathname}${location.search}`
  const route = propertyRoute(property)
  const mediaLabel = [
    property.imageCount > 0 ? `${property.imageCount} ${property.imageCount === 1 ? 'photo' : 'photos'}` : '',
    property.videoCount > 0 ? `${property.videoCount} ${property.videoCount === 1 ? 'video' : 'videos'}` : '',
  ].filter(Boolean).join(' and ')

  function toggleSaved() {
    const ids = new Set(savedPropertyIds())
    if (saved) ids.delete(String(property.id)); else ids.add(String(property.id))
    localStorage.setItem(SAVED_PROPERTIES_KEY, JSON.stringify([...ids]))
    setSaved(!saved)
  }

  async function shareProperty() {
    const url = new URL(route, window.location.origin).href
    try {
      if (navigator.share) await navigator.share({ title: property.title, url })
      else { await navigator.clipboard.writeText(url); setShareLabel('Link copied') }
    } catch (error) {
      if (error?.name !== 'AbortError') setShareLabel('Unable to share')
    }
    window.setTimeout(() => setShareLabel('Share property'), 1800)
  }

  return <article className="property-card">
    <div className="property-card-media">
      <Link to={route} state={{ returnTo: source }} className="property-card-image" aria-label={`View ${property.title}`}>
        {property.image && !imageFailed
          ? <img src={property.image} srcSet={property.imageSrcSet || undefined} alt={property.title} width={property.imageWidth || 640} height={property.imageHeight || 400} sizes="(min-width: 1280px) 30vw, (min-width: 760px) 46vw, 100vw" loading="lazy" onError={() => setImageFailed(true)} />
          : <div className="image-fallback">Property image unavailable</div>}
        <div className="card-badges"><span>{property.purposeLabel}</span>{property.featured && <span className="featured-badge">Featured</span>}</div>
        {mediaLabel && <span className="media-count" aria-label={mediaLabel}>
          {property.imageCount > 0 && <span><Images />{property.imageCount}</span>}
          {property.videoCount > 0 && <span><Play fill="currentColor" />{property.videoCount}</span>}
        </span>}
      </Link>
      <div className="property-card-actions">
        <button type="button" className={saved ? 'active' : ''} onClick={toggleSaved} aria-pressed={saved} aria-label={saved ? 'Remove from saved properties' : 'Save property'} data-tooltip={saved ? 'Saved' : 'Save property'}><Heart fill={saved ? 'currentColor' : 'none'} /></button>
        <button type="button" onClick={shareProperty} aria-label={shareLabel} data-tooltip={shareLabel}><Share2 /></button>
      </div>
    </div>
    <Link to={route} state={{ returnTo: source }} className="property-card-link" aria-label={`View details for ${property.title}`}>
      <div className="property-card-body">
        <div className="property-price-row"><p className="property-price">{property.priceLabel}</p>{freshness && <span>{freshness}</span>}</div>
        <h3>{property.title}</h3>
        <p className="property-location">{property.location || 'Location available on request'}</p>
        <PropertyFactStrip facts={facts} />
        <div className="card-footer"><span>{property.propertyTypeLabel}</span>{property.verification.is_fully_verified && <span className="verified" tabIndex="0" data-tooltip="Details and availability reviewed by the agency"><ShieldCheck />Verified</span>}</div>
      </div>
    </Link>
  </article>
}
