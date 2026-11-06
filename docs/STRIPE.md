# Stripe on reacnspire.com — Payments, Invoicing, Tax

Static site + Netlify Functions. Nothing here touches the live pages yet: the
workshop pages still use their Square links until we switch them (step 7).

| Piece | File | What it does |
| --- | --- | --- |
| Checkout | `netlify/functions/stripe-checkout.mjs` → `POST /api/checkout` | Creates a Stripe Checkout Session for a workshop seat. Price is set **server-side** (early/regular switch is automatic). |
| Webhook | `netlify/functions/stripe-webhook.mjs` → `POST /api/stripe-webhook` | Verifies the Stripe signature, confirms paid registrations by email (buyer + owner), alerts on failed payments, paid invoices and disputes. |
| Invoicing | `scripts/stripe-invoice.mjs` (`npm run invoice -- …`) | Owner-only CLI: creates and emails an invoice (group/agency billing, $9,500 on-site training). |
| Tax | `STRIPE_AUTOMATIC_TAX` env flag | Turns on Stripe Tax for Checkout and invoices — only after a registration exists. |

## 1. Use a sandbox first
Dashboard → account menu → **Sandboxes** → create `reacnspire-dev`. Everything
below is done in the sandbox first, then repeated in live mode.

## 2. Create a restricted API key (not the full secret key)
Developers → API keys → **Create restricted key**, name `reacnspire-website`:

- Checkout Sessions: **Write**
- Customers: **Write**
- Invoices: **Write** (covers invoice items)
- Products / Prices: **Write** (Checkout creates the inline product)
- Everything else: None

Keys never go in the repo or in chat.

## 3. Netlify environment variables (mark each as **secret**)
Site configuration → Environment variables:

| Name | Value |
| --- | --- |
| `STRIPE_SECRET_KEY` | the `rk_test_…` key (later `rk_live_…`) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` from step 4 |
| `RESEND_API_KEY` | already set (used by `taller-confirm`) |
| `OWNER_EMAIL` | optional, defaults to kendra@reacnspire.com |
| `STRIPE_AUTOMATIC_TAX` | leave **unset** until step 5 is done |
| `STRIPE_TAX_CODE` | optional `txcd_…`, see step 5 |

## 4. Webhook endpoint
Developers → Webhooks → **Add endpoint** → `https://reacnspire.com/api/stripe-webhook`
(use the deploy-preview URL while testing). Events:
`checkout.session.completed`, `checkout.session.async_payment_succeeded`,
`checkout.session.async_payment_failed`, `invoice.paid`,
`invoice.payment_failed`, `charge.dispute.created`. Copy its signing secret
into `STRIPE_WEBHOOK_SECRET`.

The webhook is required: it is the only place a payment is confirmed. The
thank-you redirect is not reliable (people close the tab).

## 5. Stripe Tax — do this before turning the flag on
1. Tax → Settings: set the **head office address** (status must be `active`).
2. Pick a product tax code for live virtual training from Stripe's official list
   (<https://docs.stripe.com/tax/tax-codes>) and confirm it with your tax advisor.
   Set it as the default in Tax settings or in `STRIPE_TAX_CODE`.
3. Tax → Registrations: add each place you are registered to collect (e.g.
   Florida, Puerto Rico IVU — confirm with your advisor what applies to
   training services).
4. Only then set `STRIPE_AUTOMATIC_TAX=true`.

If the flag is on with no active registration, Stripe silently collects **$0
tax**. Tax → Locations → *Needs attention* shows possible new obligations.

## 6. Test
- Card `4242 4242 4242 4242`, any future date/CVC.
- Test call:

  ```bash
  curl -s -X POST https://<deploy-preview>/api/checkout -H 'content-type: application/json' -d '{"product":"taller-seguridad","quantity":2,"email":"you@example.com","lang":"es"}'
  ```

  Open the returned `url`, pay, and confirm both emails arrive and the event
  shows `200` under Developers → Webhooks.
- Invoice (sandbox key in your shell only):

  ```bash
  STRIPE_SECRET_KEY=rk_test_... npm run invoice -- --email you@example.com --name "Test Agency" --description "HQS to NSPIRE-V — Nov 17, 2026" --qty 3 --unit 275 --draft
  ```

## 7. Switch the workshop pages from Square (follow-up)
`hqs-a-nspire/index.html` and `taller-seguridad/index.html` currently redirect to
`square.link/...`. The switch is: `POST /api/checkout` with
`{product, quantity, email, name, organization, lang}`, redirect to the returned
`url`, fall back to the Square link if the response is not 200, and change the
"Square" wording to "secure card checkout / pago seguro con tarjeta".

## 8. Go live
Repeat steps 2–5 in live mode, swap env vars to live values, redeploy, run one
real low-value purchase and refund it. Checklist:
<https://docs.stripe.com/get-started/checklist/go-live>

## Not covered here
The $49 and $29/month app subscriptions with 7-day trials run on `app.reacnspire.com`,
which is a separate codebase. Use Stripe Billing (Checkout in `subscription`
mode + `trial_period_days`, Customer Portal, and webhooks for
`customer.subscription.*` and `invoice.payment_failed`) there.
