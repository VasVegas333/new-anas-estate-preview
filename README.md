# Ana's Estate

Anas Estate primary marketing and eComm site built with [Astro](https://astro.build).

## Development

Copy `.env.example` to `.env` and fill in the credentials.

```bash
npm install
npm dev
```

Open [http://localhost:4321](http://localhost:4321) to preview the site locally.

## Build

```bash
npm build
```

The Node adapter produces a standalone SSR server in `dist/`. Preview the production build with:

```bash
npm preview
```

## Project structure

```
src/
  assets/images/    Source images (optimized at build time via astro:assets)
  assets/images.ts  Central image imports
  components/
    layout/         Topbar, Header, Footer
    sections/       Homepage sections
  config/site.ts    Site constants and forms
  data/             JSON-LD schema
  layouts/          Page shell (BaseLayout)
  lib/              Stripe catalog, Stallion, shipping, and API helpers
  pages/
    api/            Shipping quotes and checkout session endpoints
    cart.astro      Shopping cart
    checkout/       On-site checkout flow
    products.astro  Shop
  scripts/          Client scripts (cart, checkout, reveal, smooth-scroll)
  styles/           Global CSS
public/
  favicon/          Favicons and web manifest
  fonts/            Custom web fonts
  files/            Downloadable PDFs
  textures/         CSS background images
```

## Checkout and payments

Shopping uses a browser-persisted cart (`localStorage`) and an on-site checkout flow:

1. Customer adds products from `/products` (quantity can be adjusted on the shop or `/cart`)
2. Cart page reviews items, quantities, and subtotal, then continues to `/checkout`
3. Customer enters a Canadian shipping address
4. The server requests live parcel rates from Stallion for the full cart (with configurable markup)
5. Customer selects a shipping method
6. The server creates a Stripe Checkout Session with one line item per cart SKU and redirects to Stripe for payment
7. On successful payment, the cart is cleared

### Stripe Dashboard setup

Create active Stripe Products in CAD with a one-time default price. The site loads every active product from your Stripe account at request time — no per-product env variables needed.

Use a [restricted API key](https://docs.stripe.com/keys/restricted-api-keys) with Checkout Sessions write access plus Products and Prices read access for `STRIPE_SECRET_KEY`.

A product appears in the shop when it is:

- Active in Stripe
- Has an active CAD one-time default price
- Includes the required metadata below

The shop, cart, checkout, and homepage schema use Stripe for product name, description, image, and price.

Each Stripe Product also needs metadata for checkout and shipping:

| Metadata key | Required | Example | Purpose |
| --- | --- | --- | --- |
| `sku` | Yes | `bottle` | Stable product identifier used by the cart and checkout APIs |
| `format` | No | `Estate 750ml Bottle` | Shop subtitle and shipping package description |
| `image_alt` | No | `Ana's Estate 750ml bottle` | Image alt text (defaults to product name) |
| `schema_id` | No | `750ml-bottle` | JSON-LD `@id` suffix (defaults to `sku`) |
| `schema_size` | No | `750 ml` | JSON-LD product size |
| `sort_order` | No | `1` | Shop page ordering |
| `package_weight_lb` | Yes | `3.5` | Shipping parcel weight |
| `package_length_in` | Yes | `12` | Shipping parcel length |
| `package_width_in` | Yes | `4` | Shipping parcel width |
| `package_height_in` | Yes | `4` | Shipping parcel height |
| `package_quantity` | Yes | `1` | Number of packages when shipping |

Upload product images in the Stripe Dashboard; those URLs are used on the shop page and in structured data.

### Environment variables

Copy `.env.example` to `.env` and configure:

- `STRIPE_SECRET_KEY`
- `STALLION_API_TOKEN`, `STALLION_API_BASE`
- `SHIPPING_MARKUP_PERCENT`
- Ship-from address fields (`SHIP_FROM_*`)
- `SITE_URL` (production: `https://anasestate.com`)

Create a Stallion API token with the `rates:read` scope at [docs.stallion.ca](https://docs.stallion.ca/). Use the sandbox base URL (`https://sandbox.stallion.ca/api/v5`) for testing.

## Deployment

This site runs as a **Node SSR server**, not static files alone.

1. Build: `npm build`
2. Deploy `dist/` to a Node >= 22.12 host
3. Start: `node ./dist/server/entry.mjs`
4. Set all required environment variables on the host
5. Serve over HTTPS (required for Stripe redirects)

Ensure API routes (`/api/shipping/quotes`, `/api/checkout/session`) and cart/checkout pages are reachable from the public URL configured in `SITE_URL`.
