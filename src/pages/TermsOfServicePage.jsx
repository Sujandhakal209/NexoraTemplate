import { Link } from 'react-router-dom'
import LegalPageLayout from '../components/common/LegalPageLayout'
import { useTenant } from '../context/TenantContext'

const UPDATED = '23 August 2026'

export default function TermsOfServicePage() {
  const { agency } = useTenant()
  const name = agency.name
  const sections = [
    {
      id: 'agreement',
      title: 'Using this website',
      content: <>
        <p>These terms apply when you browse this website, submit an inquiry, request a viewing, contact an agent, or ask {name} to consider a property for listing. By using the website, you agree to use it lawfully and consistently with these terms.</p>
        <p>This public website is operated for {name} using technology provided by Nexora RealtyOS. Property agency services are provided by {name}, not by the website software itself.</p>
      </>,
    },
    {
      id: 'listings',
      title: 'Property information',
      content: <>
        <p>Listings, prices, measurements, availability, photographs, maps, features, and descriptions are provided for general information. They may change, contain estimates, or become unavailable without notice.</p>
        <p>You should independently verify information that matters to your decision, including ownership, boundaries, permits, condition, measurements, financing, taxes, and legal documents. Website content is not legal, financial, engineering, valuation, or tax advice.</p>
      </>,
    },
    {
      id: 'inquiries',
      title: 'Inquiries and transactions',
      content: <>
        <p>Submitting a form, requesting a visit, or speaking with an agent does not reserve a property or create a sale, lease, agency appointment, or other binding agreement.</p>
        <p>Any transaction remains subject to availability, verification, negotiation, required documentation, and a separate written agreement signed by the appropriate parties.</p>
      </>,
    },
    {
      id: 'acceptable-use',
      title: 'Acceptable use',
      content: <ul>
        <li>Do not submit false, misleading, unlawful, or impersonated information.</li>
        <li>Do not interfere with the website, attempt unauthorized access, introduce malicious code, scrape protected data, or misuse forms.</li>
        <li>Do not copy or reuse listing content, branding, photographs, or website materials without permission or another lawful basis.</li>
      </ul>,
    },
    {
      id: 'third-parties',
      title: 'Third-party services',
      content: <p>The website may link to maps, social networks, messaging tools, payment providers, or other external services. Those services are controlled by their respective providers and may have separate terms, availability, and privacy practices.</p>,
    },
    {
      id: 'privacy',
      title: 'Privacy',
      content: <p>Information submitted through this website is handled as described in the <Link to="/privacy-policy">Privacy Policy</Link>. Please review it before providing personal information.</p>,
    },
    {
      id: 'responsibility',
      title: 'Availability and responsibility',
      content: <>
        <p>The website is provided on an “as available” basis. {name} may correct content, change features, remove listings, or suspend access when reasonably necessary.</p>
        <p>To the extent permitted by applicable law, {name} and its technology providers are not responsible for indirect or consequential losses caused by reliance on unverified listing information, third-party services, or interruptions outside their reasonable control. Nothing in these terms excludes responsibility that cannot lawfully be excluded.</p>
      </>,
    },
    {
      id: 'changes',
      title: 'Changes to these terms',
      content: <p>These terms may be updated to reflect changes to the website, agency services, or applicable requirements. The current version and update date will remain available on this page. Continued use after an update means the revised terms apply to future use.</p>,
    },
  ]

  return <LegalPageLayout
    eyebrow="Website terms"
    title="Terms of Service"
    introduction={`The conditions that apply when using ${name}'s public property website.`}
    updated={UPDATED}
    sections={sections}
    contact={agency.contact}
  />
}
