import LegalPageLayout from '../components/common/LegalPageLayout'
import { useTenant } from '../context/TenantContext'

const UPDATED = '23 August 2026'

export default function PrivacyPolicyPage() {
  const { agency } = useTenant()
  const name = agency.name
  const sections = [
    {
      id: 'scope',
      title: 'Who this policy applies to',
      content: <>
        <p>This policy explains how {name} handles personal information submitted through this website, including property inquiries, viewing requests, contact forms, and requests to list a property.</p>
        <p>This website is powered by Nexora RealtyOS. {name} is responsible for its agency services and its use of the information it receives. Nexora provides the website and business software used to process those requests.</p>
      </>,
    },
    {
      id: 'information',
      title: 'Information we collect',
      content: <>
        <p>We may collect information you choose to provide, such as your name, email address, phone number, preferred property, budget, message, viewing preferences, and property details supplied for a listing request.</p>
        <p>The website may also process limited technical information needed to operate securely, such as IP address, browser and device information, timestamps, requested pages, and diagnostic or security events.</p>
      </>,
    },
    {
      id: 'use',
      title: 'How information is used',
      content: <ul>
        <li>Respond to inquiries and provide requested property information.</li>
        <li>Arrange viewings, consultations, valuations, and follow-up communication.</li>
        <li>Maintain agency records and improve customer service.</li>
        <li>Protect the website, prevent misuse, and comply with legal obligations.</li>
      </ul>,
    },
    {
      id: 'sharing',
      title: 'How information may be shared',
      content: <>
        <p>Information may be available to authorized staff and agents of {name}, Nexora RealtyOS as the technology provider, and service providers that support hosting, storage, email, messaging, maps, analytics, or security.</p>
        <p>Information may also be disclosed when required by law, to protect legal rights or safety, or as part of a legitimate business transfer.</p>
      </>,
    },
    {
      id: 'retention',
      title: 'Retention and security',
      content: <>
        <p>{name} retains information for as long as reasonably needed to manage your request, provide agency services, maintain appropriate records, resolve disputes, and meet legal obligations.</p>
        <p>Reasonable administrative and technical safeguards are used, but no online system can guarantee absolute security. Please do not submit passwords, payment-card details, or other unnecessary sensitive information through general inquiry forms.</p>
      </>,
    },
    {
      id: 'choices',
      title: 'Your choices',
      content: <>
        <p>You may ask {name} to review, correct, or delete information associated with your inquiry, subject to identity verification and any information the agency must retain for lawful purposes.</p>
        <p>You may opt out of non-essential follow-up communication at any time. Browser controls can be used to manage cookies or similar storage where available.</p>
      </>,
    },
    {
      id: 'third-parties',
      title: 'Third-party services and updates',
      content: <>
        <p>Links, maps, social networks, messaging services, and other third-party tools have their own privacy practices. This policy does not control how those providers process information after you use their services.</p>
        <p>This policy may be updated when the website, agency practices, or legal requirements change. The latest version will be posted on this page with a revised update date.</p>
      </>,
    },
  ]

  return <LegalPageLayout
    eyebrow="Privacy & trust"
    title="Privacy Policy"
    introduction={`How ${name} handles information submitted through this agency website.`}
    updated={UPDATED}
    sections={sections}
    contact={agency.contact}
  />
}
