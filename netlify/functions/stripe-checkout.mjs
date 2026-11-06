/* Creates a Stripe Checkout Session for a paid workshop seat and returns its URL.

   Prices are decided HERE, on the server, from the catalog below — never from the
   browser. That also retires the manual "change the Square price at midnight"
   step: the early/regular switch happens automatically at EARLY_ENDS.

   Env (Netlify → Site configuration → Environment variables, mark as secret):
     STRIPE_SECRET_KEY      Restricted key (rk_...) — see docs/STRIPE.md for permissions.
     STRIPE_AUTOMATIC_TAX   "true" only AFTER a Stripe Tax registration is active.
     STRIPE_TAX_CODE        Optional product tax code (txcd_...) chosen from Stripe's
                            official list. Leave unset to use the Dashboard default.
   Netlify sets URL (the site's primary URL) automatically.

   When STRIPE_SECRET_KEY is missing the function answers 503 {configured:false},
   so a page can fall back to its old payment link. */

import Stripe from "stripe";
import { DISCLOSURE, STATEMENT_SUFFIX } from "../lib/billing.mjs";

export const config = {
  path: "/api/checkout",
  rateLimit: { windowLimit: 20, windowSize: 60, aggregateBy: ["ip", "domain"] },
};

// One entry per thing we sell online. Amounts are in cents (USD).
const CATALOG = {
  "hqs-a-nspire": {
    page: "/hqs-a-nspire/",
    name: { es: "De HQS a NSPIRE-V — Adiestramiento en vivo por Zoom (17 nov 2026)", en: "HQS to NSPIRE-V — Live Zoom training (Nov 17, 2026)" },
    tiers: [
      { until: Date.parse("2026-11-07T00:00:00-04:00"), amount: 27500 },
      { until: Infinity, amount: 32500 },
    ],
    closes: Date.parse("2026-11-17T17:00:00-04:00"),
    maxQty: 60,
  },
  "taller-seguridad": {
    page: "/taller-seguridad/",
    name: { es: "Taller NSPIRE: Repaso y Empleados Nuevos (25 nov 2026)", en: "NSPIRE Workshop Refresher and New Employees (Nov 25, 2026)" },
    tiers: [{ until: Infinity, amount: 15000 }],
    closes: Date.parse("2026-11-25T16:00:00-05:00"),
    maxQty: 60,
  },
};

// Tags these sessions in the Dashboard so this flow can be compared with others.
const INTEGRATION_ID = "reacnspire_workshops_qhzvtmwa";

const reply = (status, data) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

const clean = (v, max) => String(v == null ? "" : v).trim().slice(0, max);

export default async (req) => {
  if (req.method !== "POST") return reply(405, { error: "method_not_allowed" });

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return reply(503, { configured: false });

  let body = {};
  try { body = await req.json(); } catch { return reply(400, { error: "bad_json" }); }

  const item = CATALOG[body.product];
  if (!item) return reply(400, { error: "unknown_product" });

  const now = Date.now();
  if (now >= item.closes) return reply(410, { error: "registration_closed" });

  const quantity = parseInt(body.quantity, 10);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > item.maxQty) return reply(400, { error: "bad_quantity" });

  const lang = body.lang === "en" ? "en" : "es";
  const email = clean(body.email, 254);
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const unitAmount = item.tiers.find((t) => now < t.until).amount;

  const site = process.env.URL || "https://reacnspire.com";
  const automaticTax = process.env.STRIPE_AUTOMATIC_TAX === "true";
  const taxCode = process.env.STRIPE_TAX_CODE;

  const stripe = new Stripe(key);
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // No payment_method_types: dynamic payment methods are managed in the Dashboard.
      line_items: [{
        quantity,
        price_data: {
          currency: "usd",
          unit_amount: unitAmount,
          tax_behavior: "exclusive",
          product_data: { name: item.name[lang], ...(taxCode ? { tax_code: taxCode } : {}) },
        },
      }],
      automatic_tax: { enabled: automaticTax },
      customer_creation: "always",
      ...(validEmail ? { customer_email: email } : {}),
      // Receipt-style invoice (PDF) for agencies that need one for their records.
      invoice_creation: { enabled: true },
      locale: lang,
      // Disclose who bills the charge and where funds are deposited, right above the Pay button.
      custom_text: { submit: { message: DISCLOSURE[lang] } },
      // Card statement reads "KENDRA REAC* SOFTWARE" (prefix set in the Dashboard).
      payment_intent_data: { statement_descriptor_suffix: STATEMENT_SUFFIX, description: `${item.name.en} — Software Department` },
      metadata: {
        product: body.product,
        quantity: String(quantity),
        unit_amount: String(unitAmount),
        lang,
        name: clean(body.name, 200),
        organization: clean(body.organization, 200),
        billed_by: "Software Department",
      },
      integration_identifier: INTEGRATION_ID,
      success_url: `${site}${item.page}?pagado=1&session_id={CHECKOUT_SESSION_ID}#registro`,
      cancel_url: `${site}${item.page}#registro`,
    });

    return reply(200, { url: session.url });
  } catch (err) {
    console.error("stripe checkout error", err?.type, err?.code, err?.message);
    return reply(502, { error: "stripe_error" });
  }
};
