# Glide RE Marketing Site

Marketing website for Glide RE, a discount listing brokerage helping Utah sellers keep more equity at closing.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Scripts

- `npm run dev` — start development server (Turbopack)
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run lint` — run ESLint

## Project structure

- `src/app/` — Next.js App Router pages and layouts
- `src/components/` — React components (layout, marketing, UI)
- `src/theme/` — MUI theme and font configuration
- `prototypes/` — HTML mockups and project documentation (design reference)

## Related

Seller account and onboarding routes live in this app under `/account` and `/account/onboarding`.

## Environment variables

Copy `.env.example` to `.env.local` when integrating backend services. No environment variables are required for the marketing site in V1.
