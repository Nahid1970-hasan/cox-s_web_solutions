# Cox's Web Solutions

A modern React + JavaScript landing page for an IT solutions company, built to match the design from your reference image.

## Tech stack

- **React 18** with **Vite**
- **JavaScript** (no TypeScript)
- **CSS** with custom properties for colors and spacing

## Design

- **Colors:** Dark blue (`#1f3e72`), teal (`#00c7b0`), coral accent (`#ff6b5b`), white and grays
- **Sections:** Hero, Services grid, About, Feature + stats, Pricing, Portfolio, Service features, CTA banner, Testimonials, Blog, Contact form, Footer
- **Responsive:** Layouts adapt for desktop, tablet, and mobile

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build for production

```bash
npm run build
npm run preview
```

Build output is in the `dist` folder.

## Connecting to Django backend

The app talks to a Django backend for login and other API calls.

1. Copy the example env file and set your Django API base URL:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and set `VITE_API_BASE_URL` to your Django server (no trailing slash), e.g.:
   ```
   VITE_API_BASE_URL=http://localhost:8000
   ```
3. Restart the dev server after changing `.env`.

Use `apiUrl('/api/...')` from `src/config/env.js` for any API path so it uses this base URL.
