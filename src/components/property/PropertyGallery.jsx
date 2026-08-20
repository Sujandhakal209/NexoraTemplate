import { ChevronLeft, ChevronRight, Images, MapPin, Maximize2, Pause, Play, RotateCcw, Volume2, VolumeX, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

function SafeImage({ src, srcSet, alt, loading, className, width, height, sizes = '(min-width: 900px) 90vw, 100vw' }) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [src])
  if (!src || failed) return <div className={`image-fallback ${className || ''}`}>Property image unavailable</div>
  return <img className={className} src={src} srcSet={srcSet || undefined} alt={alt} width={width || 1280} height={height || 800} sizes={sizes} loading={loading} onError={() => setFailed(true)} />
}

export default function PropertyGallery({ property }) {
  const images = property.images?.length ? property.images : property.image ? [{ url: property.image }] : []
  const videos = property.videos || []
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState(false)
  useEffect(() => { setActive(0); setOpen(false) }, [property.id])
  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const keydown = (event) => {
      if (event.key === 'Escape') setOpen(false)
      if (event.key === 'ArrowLeft') setActive((value) => (value - 1 + images.length) % images.length)
      if (event.key === 'ArrowRight') setActive((value) => (value + 1) % images.length)
    }
    document.addEventListener('keydown', keydown)
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', keydown) }
  }, [open, images.length])
  if (!images.length && !videos.length) return <div className="container detail-image-fallback">No property media available</div>
  const show = (index) => { setActive(index); setOpen(true) }
  return <>
    {images.length > 0 && <section className={`container property-gallery ${images.length === 1 ? 'property-gallery-single' : ''}`} aria-label={`${property.title} photos`}>
      <button className="gallery-primary" onClick={() => show(0)} aria-label="Open property photo 1"><SafeImage src={images[0].url} srcSet={images[0].srcSet} width={images[0].width} height={images[0].height} alt={images[0].alt_text || `${property.title} view 1`} /><span className="gallery-count"><Images />1 / {images.length}</span></button>
      {images.length > 1 && <div className="gallery-secondary">{images.slice(1, 3).map((image, offset) => <button key={image.id || offset} onClick={() => show(offset + 1)} aria-label={`Open property photo ${offset + 2}`}><SafeImage src={image.thumbnailUrl || image.url} srcSet={image.srcSet} width={image.card?.width} height={image.card?.height} sizes="(min-width: 900px) 30vw, 50vw" alt={image.alt_text || `${property.title} view ${offset + 2}`} loading="lazy" />{offset === 1 && images.length > 3 && <span>+{images.length - 3} more</span>}</button>)}</div>}
      <button className="view-all-photos" onClick={() => show(0)}><Maximize2 />View all {images.length} {images.length === 1 ? 'photo' : 'photos'}</button>
    </section>}
    {videos.length > 0 && <PropertyReels property={property} videos={videos} />}
    {open && <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={`${property.title} photo viewer`}>
      <button className="gallery-close" onClick={() => setOpen(false)} aria-label="Close photo viewer"><X /></button>
      {images.length > 1 && <button className="gallery-prev" onClick={() => setActive((value) => (value - 1 + images.length) % images.length)} aria-label="Previous photo"><ChevronLeft /></button>}
      <SafeImage src={images[active]?.originalUrl || images[active]?.url} srcSet={images[active]?.srcSet} width={images[active]?.original?.width || images[active]?.width} height={images[active]?.original?.height || images[active]?.height} alt={images[active]?.alt_text || `${property.title} view ${active + 1}`} />
      {images.length > 1 && <button className="gallery-next" onClick={() => setActive((value) => (value + 1) % images.length)} aria-label="Next photo"><ChevronRight /></button>}
      <p>{active + 1} / {images.length}</p>
      {images.length > 1 && <div className="lightbox-thumbnails">{images.map((image, index) => <button key={image.id || index} className={index === active ? 'active' : ''} onClick={() => setActive(index)} aria-label={`Show photo ${index + 1}`}><SafeImage src={image.thumbnailUrl || image.url} alt="" loading="lazy" /></button>)}</div>}
    </div>}
  </>
}

function PropertyReels({ property, videos }) {
  const videoRef = useRef(null)
  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const current = videos[active]

  useEffect(() => {
    setActive(0)
    setPlaying(false)
    setProgress(0)
  }, [property.id])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.pause()
    video.currentTime = 0
    setPlaying(false)
    setProgress(0)
  }, [active])

  async function togglePlayback() {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      try { await video.play() } catch { setPlaying(false) }
    } else {
      video.pause()
    }
  }

  function restart() {
    const video = videoRef.current
    if (!video) return
    video.currentTime = 0
    setProgress(0)
    video.play().catch(() => setPlaying(false))
  }

  function updateProgress(event) {
    const { currentTime, duration } = event.currentTarget
    setProgress(duration ? (currentTime / duration) * 100 : 0)
  }

  function selectVideo(index) {
    if (index === active) return
    setActive(index)
  }

  const label = current.title || (videos.length > 1 ? `Property tour ${active + 1}` : 'Property tour')

  return <section className="container property-reels" aria-labelledby="property-reels-title">
    <div className="reels-intro">
      <div><p className="eyebrow">Property reel</p><h2 id="property-reels-title">Step inside the property</h2></div>
      <p>Watch the same vertical walkthrough prepared by the agency for social media, presented here without leaving the listing.</p>
    </div>
    <div className="reel-experience">
      <div className="reel-copy">
        <span className="reel-kicker">Now viewing</span>
        <strong>{label}</strong>
        {current.caption && <p>{current.caption}</p>}
        <div className="reel-location"><MapPin /><span>{property.location}</span></div>
        <span className="reel-hint">Tap the video to play or pause</span>
      </div>
      <div className="reel-phone-shell">
        <div className="reel-progress" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
        <video
          key={current.id || current.url}
          ref={videoRef}
          className="property-reel-video"
          src={current.originalUrl || current.url}
          poster={current.posterUrl || property.image || undefined}
          muted={muted}
          playsInline
          preload="metadata"
          onClick={togglePlayback}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onTimeUpdate={updateProgress}
          aria-label={`${property.title}: ${label}`}
        />
        <div className="reel-shade" aria-hidden="true" />
        {!playing && <button className="reel-play" onClick={togglePlayback} aria-label="Play property video"><Play fill="currentColor" /></button>}
        <div className="reel-overlay">
          <span>{property.purposeLabel}</span>
          <strong>{property.title}</strong>
          <small>{property.location}</small>
        </div>
        <div className="reel-actions">
          <button onClick={togglePlayback} aria-label={playing ? 'Pause property video' : 'Play property video'}>{playing ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}</button>
          <button onClick={() => setMuted((value) => !value)} aria-label={muted ? 'Unmute property video' : 'Mute property video'}>{muted ? <VolumeX /> : <Volume2 />}</button>
          <button onClick={restart} aria-label="Restart property video"><RotateCcw /></button>
        </div>
        <span className="reel-counter">{active + 1} / {videos.length}</span>
      </div>
      <div className="reel-selector" aria-label="Choose a property video">
        <span>{videos.length === 1 ? 'Property video' : `${videos.length} property videos`}</span>
        {videos.map((video, index) => <button key={video.id || video.url} className={index === active ? 'active' : ''} onClick={() => selectVideo(index)} aria-label={`Show property video ${index + 1}`} aria-current={index === active ? 'true' : undefined}>
          <span className="reel-selector-poster">{video.posterUrl || property.image ? <SafeImage src={video.posterUrl || property.image} alt="" loading="lazy" /> : <Play />}</span>
          <span><strong>{video.title || `Tour ${String(index + 1).padStart(2, '0')}`}</strong><small>{index === active ? 'Now playing' : 'Watch video'}</small></span>
          <Play />
        </button>)}
      </div>
    </div>
  </section>
}
