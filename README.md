# Cebu GraphicStar — public website

Marketing site plus a self-service quotation builder, deployed separately from the ERP.

## What it is

Five marketing pages (Home, About, Products, Portfolio, Contact) and `/quote`, where a customer
picks a common product, adjusts the size and quantity, and watches the price update.

**This site never calculates a price.** It asks the ERP and renders the answer. Pricing lives in
`shared/costing.js` in the ERP repo, which is the same module the in-house estimate wizard imports,
so a customer's quote and a quote raised by the sales team cannot disagree. Copying the formulas
here would have been a third transcription of them, and it would have drifted.

Submitting saves a real estimate in the ERP — under the Marketing division, at **For CSA
Assignment**, with no sales rep. Nobody took the enquiry, so nobody is credited with it until a
Marketing Manager assigns someone; assigning moves it on to Pending Customer Approval.

## Running locally

```bash
npm install
npm run dev          # http://localhost:5200
```

The dev server proxies `/api` to the ERP on `http://localhost:4100`, so no configuration is needed
as long as the ERP is running. Point it elsewhere with `API_TARGET`.

## Deploying

| Variable | Value | Notes |
|---|---|---|
| `VITE_API_BASE` | `https://gsuitev2.graphicstar.ph` | Build-time. Where the ERP's public API lives. |
| `PORT` | set by Railway | `npm start` binds to it. |

```
Build:  npm run build
Start:  npm start
```

Two things must be true on the ERP side before quoting works:

1. **Products are published.** They seed unpublished on purpose — publishing is a decision for
   whoever has checked the prices look right.
2. **CORS allows this domain.** The ERP currently runs `cors()` wide open, which was fine when
   every route needed a token. `/api/public` does not, so lock it to this origin.

## Layout

```
src/
  api.js        the ERP's public API, and peso formatting
  site.js       all company content — branches, hours, values, categories
  Layout.jsx    header, footer, nav
  pages/
    Marketing.jsx   Home, About, Products, Portfolio, Contact
    Quote.jsx       the quotation builder
```

Content mirrors graphicstar.ph. The branch addresses, opening hours and phone numbers in
`site.js` are the real ones.
