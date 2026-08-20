# Nexora public website template

`NexoraTemplate` is the shared React/Vite storefront for Nexora Realty OS agencies. One compiled application serves every published agency. At startup it resolves the tenant from the hostname, loads the agency's published website configuration from Django, applies its brand system, and renders only that agency's public properties and agents.

The CRM is not part of this repository. Agencies manage their website draft, media, navigation, sections, SEO, and publishing state in `NexoraFE`; this application only consumes the resulting public snapshot.

## Requirements

- Node.js 20 or newer
- A running `NexoraRealtyOsBE` instance
- At least one active, paid, unexpired agency with a published website

## Install and run

```bash
npm install
copy .env.example .env
npm run dev
```

The example configuration expects Django at `http://localhost:8000` and starts the template at `http://localhost:5174` so it can run beside the CRM on port 5173.

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_PLATFORM_DOMAIN=nexorarealtyos.com
VITE_DEV_TENANT=nepal-bhoomi-nr-123
```

## CRM visual editor preview

The same public components can run in editor preview mode at
`http://localhost:5174/?preview=1`. The preview waits for a validated
`NEXORA_PREVIEW_CONFIG` message from the CRM and never loads CRM credentials.
Set `VITE_PREVIEW_ALLOWED_ORIGINS` to the exact comma-separated CRM origins
that are allowed to control it. Production should include
`https://crm.nexorarealtyos.com`; local defaults include ports on `localhost`
and `127.0.0.1`.

`VITE_API_BASE_URL` includes the Django `/api` prefix. The application adds `/public` and the verified public resource path centrally.

## Local tenant testing

On localhost, the query string has priority over the environment value:

```text
http://localhost:5174/?tenant=alpha-realty-qa
http://localhost:5174/?tenant=beta-homes-qa
```

This uses real published agency slugs; it does not create a development-only tenant model. Removing `tenant` falls back to `VITE_DEV_TENANT`. If neither is configured, the application displays a setup-safe unavailable screen rather than another agency's content.

## Hostname and domain resolution

Tenant resolution lives in `src/services/tenantService.js`.

- `agency-slug.nexorarealtyos.com` calls the public agency-by-slug endpoint.
- A non-platform hostname such as `agencyexample.com` calls the public agency-by-domain endpoint.
- Reserved platform hosts (`www`, `api`, `crm`, `template`, and `app`) are never interpreted as agency slugs.
- The public API enforces publication, agency status, payment/subscription validity, and tenant isolation.

DNS, wildcard/custom-domain TLS, and the SPA history fallback are deployment responsibilities. Every production hostname should serve the same `dist` directory and rewrite unknown document paths to `index.html` without rewriting asset or API requests.

## Application architecture

```text
src/
  api/          HTTP client, timeouts, normalized API errors
  adapters/     Django agency, property, and agent response normalization
  components/   Shared layout, cards, forms, states, filters, and pagination
  config/       Isolated generic copy used only when optional content is absent
  context/      Tenant loading gate and globally available published agency
  hooks/        Small request lifecycle hook
  pages/        Public route implementations
  services/     Tenant, property, agent, contact, and submission APIs
  styles/       Responsive global theme and component styles
  utils/        SEO, branding, price/media/phone/attribution helpers
```

Raw Django response details stay in the service/adapter layer. Page components receive normalized models and never contain API base URLs or tenant IDs.

## Public APIs used

All endpoints are unauthenticated public storefront endpoints under `/api/public`:

- `GET /agencies/by-slug/{slug}/`
- `GET /agencies/by-domain/?domain={hostname}`
- `GET /agencies/{license_number}/properties/`
- `GET /agencies/{license_number}/properties/filter-options/`
- `GET /agencies/{license_number}/properties/{id}/`
- `GET /agencies/by-slug/{slug}/listings/{share_slug}/`
- `GET /agencies/{license_number}/properties/{id}/similar/`
- `POST /agencies/{license_number}/properties/{id}/inquire/`
- `POST /agencies/{license_number}/properties/{id}/request-site-visit/`
- `POST /agencies/{license_number}/properties/{id}/events/`
- `GET /agencies/{license_number}/agents/`
- `GET /agencies/{license_number}/agents/{id}/`
- `POST /agencies/{slug}/agents/{id}/reviews/`
- `POST /agencies/{license_number}/contact/`
- `POST /agencies/{slug}/submissions/`

Only supported backend filters are forwarded. Distribution UTM values and `nexora_link` attribution are preserved for property inquiries, viewing requests, and events.

The property list API currently returns an unpaginated array, so result pagination is client-side. Location/category summaries are derived from the tenant's own public property results and filter options; no cross-tenant aggregation occurs.

## Published website configuration

The template consumes the complete public snapshot, including:

- primary, secondary, and accent colors
- heading/body fonts
- primary/light/dark logos, favicon, hero/about/placeholder/social images, and partner logos
- hero copy and CTA links
- about, mission, vision, story, year, specialties, areas served, and services
- statistics, testimonials, FAQs, newsletter, and contact CTA
- featured listing mode, limit, and manual listing order
- enabled pages, navigation, footer navigation, homepage section visibility, and section order
- public address, service area, phone, email, WhatsApp, Viber, hours, map coordinates, and social links
- title, description, OpenGraph values, legal/copyright content, language, and publication version

Brand values are applied as CSS custom properties before the tenant site renders, preventing a flash of another tenant's identity.

## Routes

- `/`
- `/properties`
- `/properties/:id-slug` (also accepts a backend share slug)
- `/buy`
- `/rent`
- `/agents`
- `/agents/:id-slug`
- `/about`
- `/contact`
- `/list-your-property`

Routes and navigation respect the CRM's published `enabled_pages` values. “List your property” uses the existing public `valuation` submission kind; it creates a reviewed agency submission/lead and does not directly publish a listing.

## Theme and media

Agency colors and fonts are applied to CSS variables in `src/utils/theme.js`. Relative Django media paths are resolved once in `src/utils/format.js`; components use normalized absolute URLs and lazy-load non-critical images. Missing optional content is hidden, while generic fallback copy is isolated in `src/config/fallbackContent.js`. API failures never display fake agency or listing data.

## SEO

The tenant snapshot updates the document title, description, canonical URL, theme color, favicon, and OpenGraph metadata. Property and agent pages replace the title, description, and social image with route-specific public data. For search-engine-grade per-route HTML before JavaScript executes, production can add static pre-rendering later without changing the API or tenant architecture.

## Build and quality checks

```bash
npm run lint
npm run build
npm run preview
```

The build output is `dist/`. Configure the production host with an SPA fallback to `index.html` for routes such as `/properties/12-example-home`.
