import { ArrowUpRight } from 'lucide-react'

export default function LegalPageLayout({ eyebrow, title, introduction, updated, sections, contact }) {
  return <main className="legal-page">
    <section className="page-hero legal-page-hero">
      <div className="container">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{introduction}</p>
        <p className="legal-updated">Last updated: {updated}</p>
      </div>
    </section>
    <section className="section">
      <div className="container legal-layout">
        <aside className="legal-navigation" aria-label={`${title} sections`}>
          <p className="eyebrow">On this page</p>
          <nav>
            {sections.map((section, index) => <a key={section.id} href={`#${section.id}`}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              {section.title}
            </a>)}
          </nav>
        </aside>
        <article className="legal-document">
          {sections.map((section, index) => <section id={section.id} key={section.id}>
            <p className="legal-section-number">{String(index + 1).padStart(2, '0')}</p>
            <h2>{section.title}</h2>
            {section.content}
          </section>)}
          <section id="contact" className="legal-contact-card">
            <p className="legal-section-number">Contact</p>
            <h2>Questions about this document?</h2>
            <p>Contact the agency using the details published on this website.</p>
            <div className="legal-contact-links">
              {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}<ArrowUpRight /></a>}
              {contact.phone && <a href={`tel:${String(contact.phone).replace(/[^+\d]/g, '')}`}>{contact.phone}<ArrowUpRight /></a>}
            </div>
            {contact.address && <p className="legal-address">{contact.address}</p>}
          </section>
        </article>
      </div>
    </section>
  </main>
}
