export default function SectionHeading({ eyebrow, title, description, action, align = 'left' }) {
  return <div className={`section-heading section-heading-${align}`}>
    <div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2>{description && <p>{description}</p>}</div>
    {action}
  </div>
}
