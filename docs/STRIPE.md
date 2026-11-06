# Stripe — Software Department only

Stripe is used **only by the Software Department** of Kendra REAC Consultant, Inc.
It covers the NspirePro apps, software subscriptions, and software licenses and
invoices.

**Workshops, trainings, consulting and inspections stay on Square.** They are
billed by Kendra REAC Consultant, Inc. and must never be routed through Stripe.
The workshop pages (`/hqs-a-nspire/`, `/taller-seguridad/`) keep their Square
links.

| Piece | Where | What it does |
| --- | --- | --- |
| Invoicing | `scripts/stripe-invoice.mjs` (`npm run invoice -- …`) | Owner-only CLI: creates and emails a software invoice (agency licenses, annual plans). |
| Webhook | `netlify/functions/stripe-webhook.mjs` → `POST /api/stripe-webhook` | Verifies the Stripe signature; emails the owner when an invoice is paid or fails, and when a dispute opens. |
| Disclosure | `netlify/lib/billing.mjs` + `/terms/` | The one source of the billing-disclosure wording. |
| Tax | `STRIPE_AUTOMATIC_TAX` env flag | Turns on Stripe Tax for invoices, but only after a registration exists. |
| Subscriptions | **app.reacnspire.com** (separate codebase) | The $49/mo Inspections and from-$29/mo Maintenance plans with 7-day trials. See the bottom of this page. |

## Billing disclosure (required)
The Stripe account is **Kendra REAC Consultant, Inc.**; charges are billed by its
**Software Department** and paid out to the bank account of **National Pro
Inspections**. Customers see this:

- in every invoice footer (English + Spanish), from `netlify/lib/billing.mjs`
- on `/terms/` → "Payments and billing disclosure" (which also says that trainings
  and workshops are billed separately through Square)
- in the app's checkout, which must show the same `DISCLOSURE` text (to be added in
  the app codebase)

Statement descriptor: in the Dashboard set **Settings → Business → Public details →
Shortened descriptor** to `KENDRA REAC`. App card payments should pass the suffix
`SOFTWARE`, which shows as `KENDRA REAC* SOFTWARE`. Invoices use
`KENDRA REAC SOFTWARE`. If you change any of these, update `billing.mjs` and
`/terms/` together.

**Payout account: confirm with Stripe before going live.** Stripe requires the
payout bank account to belong to the business on the Stripe account. If National
Pro Inspections is a DBA / trade name of Kendra REAC Consultant, Inc. (same EIN),
that is normally fine. Stripe may ask for proof, such as a bank letter or DBA
filing. If National Pro Inspections is a separate company with its own EIN, open
the Stripe account under that company instead, or have the bank account titled to
Kendra REAC Consultant, Inc. A mismatch can get payouts paused or the account
under review.

## 1. Use a sandbox first
Dashboard → account menu → **Sandboxes** → create `software-dev`. Do everything
below in the sandbox, then repeat it in live mode.

## 2. Restricted API key (not the full secret key)
Developers → API keys → **Create restricted key** `reacnspire-website`:
Customers **Write**, Invoices **Write**, everything else None. Keys never go in
the repo or in chat.

## 3. Netlify environment variables (mark each as **secret**)
| Name | Value |
| --- | --- |
| `STRIPE_SECRET_KEY` | the `rk_test_…` key (later `rk_live_…`) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` from step 4 |
| `RESEND_API_KEY` | already set (used by `taller-confirm`) |
| `OWNER_EMAIL` | optional, defaults to kendra@reacnspire.com |

## 4. Webhook endpoint
Developers → Webhooks → **Add endpoint** → `https://reacnspire.com/api/stripe-webhook`.
Events: `invoice.paid`, `invoice.payment_failed`, `charge.dispute.created`.
Copy the endpoint's signing secret into `STRIPE_WEBHOOK_SECRET`.

## 5. Stripe Tax (before setting `STRIPE_AUTOMATIC_TAX=true`)
1. Tax → Settings: set the **head office address**. Its status must be `active`.
2. Pick the product tax code for your software (SaaS) from Stripe's official
   list (<https://docs.stripe.com/tax/tax-codes>) and confirm it with your tax
   advisor. Set it as the Tax default, or put it in `STRIPE_TAX_CODE` in the shell
   that runs the invoice script.
3. Tax → Registrations: add each place you are registered to collect.
4. Only then set `STRIPE_AUTOMATIC_TAX=true`. With no active registration, Stripe
   silently collects **$0 tax**.

## 6. Send a test invoice
Run this in your own terminal, with a sandbox key:

```bash
STRIPE_SECRET_KEY=rk_test_... npm run invoice -- --email you@example.com --name "Test Agency" --description "NspirePro Inspections — 12-month license" --qty 1 --unit 588 --draft
```

Remove `--draft` to finalize and email it. Pay it with card `4242 4242 4242 4242`,
then confirm the owner email arrives and the webhook shows `200`.

## 7. Go live
Repeat steps 2–5 in live mode, switch the env vars to the live values, and
redeploy. Checklist: <https://docs.stripe.com/get-started/checklist/go-live>

## App subscriptions (app.reacnspire.com)
These belong in the app's codebase, not this site:
- Checkout Sessions in `subscription` mode with `subscription_data.trial_period_days: 7`.
- `payment_intent_data` doesn't apply to subscriptions. Set the statement
  descriptor suffix `SOFTWARE` on the account or the subscription, as Stripe
  allows.
- `custom_text.submit.message` = the `DISCLOSURE` wording from `netlify/lib/billing.mjs`.
- Customer Portal for plan changes and cancellations.
- Webhooks: `checkout.session.completed`, `customer.subscription.created/updated/deleted`,
  `invoice.paid`, `invoice.payment_failed`, `customer.subscription.trial_will_end`.
- Do not set `payment_method_types`. Use a restricted key.
