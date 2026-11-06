#!/usr/bin/env node
/* Create and email a Software Department invoice through Stripe (owner-only;
   run from your own computer). Workshops/trainings are NOT invoiced here — Square.

   Usage:
     STRIPE_SECRET_KEY=rk_test_... npm run invoice -- \
       --email billing@agency.org --name "Housing Authority of X" \
       --description "NspirePro Inspections — 12-month license" --qty 3 --unit 588 \
       [--days 15] [--memo "PO 1234"] [--line1 "..." --city "..." --state FL --postal 32801 --country US] \
       [--draft]

   --unit is in dollars. --draft creates it without finalizing/sending so you can
   review it in the Dashboard first.
   With STRIPE_AUTOMATIC_TAX=true, Stripe Tax computes tax from the customer's
   address — so pass the address flags. Tax is only collected where you have an
   active Stripe Tax registration. */

import Stripe from "stripe";
import { parseArgs } from "node:util";
import { INVOICE_FOOTER, INVOICE_STATEMENT } from "../netlify/lib/billing.mjs";

const { values: a } = parseArgs({
  options: {
    email: { type: "string" }, name: { type: "string" }, description: { type: "string" },
    qty: { type: "string", default: "1" }, unit: { type: "string" }, days: { type: "string", default: "15" },
    memo: { type: "string" }, line1: { type: "string" }, city: { type: "string" }, state: { type: "string" },
    postal: { type: "string" }, country: { type: "string", default: "US" }, draft: { type: "boolean", default: false },
  },
});

const die = (m) => { console.error(`Error: ${m}`); process.exit(1); };
if (!process.env.STRIPE_SECRET_KEY) die("set STRIPE_SECRET_KEY (use a test-mode/sandbox key first).");
if (!a.email || !a.name || !a.description || !a.unit) die("--email, --name, --description and --unit are required.");
const qty = parseInt(a.qty, 10);
const unitCents = Math.round(parseFloat(a.unit) * 100);
if (!(qty >= 1) || !(unitCents > 0)) die("--qty must be ≥ 1 and --unit > 0.");
const automaticTax = process.env.STRIPE_AUTOMATIC_TAX === "true";
if (automaticTax && !a.postal) die("STRIPE_AUTOMATIC_TAX=true needs the customer's address (at least --postal and --country).");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const address = a.postal ? { line1: a.line1, city: a.city, state: a.state, postal_code: a.postal, country: a.country } : undefined;
const found = await stripe.customers.list({ email: a.email, limit: 1 });
const customer = found.data[0]
  ? await stripe.customers.update(found.data[0].id, { name: a.name, ...(address ? { address } : {}) })
  : await stripe.customers.create({ email: a.email, name: a.name, ...(address ? { address } : {}) });

const invoice = await stripe.invoices.create({
  customer: customer.id,
  collection_method: "send_invoice",
  days_until_due: parseInt(a.days, 10),
  pending_invoice_items_behavior: "exclude",
  automatic_tax: { enabled: automaticTax },
  footer: INVOICE_FOOTER, // billed by the Software Department; deposited to National Pro Inspections
  statement_descriptor: INVOICE_STATEMENT,
  metadata: { billed_by: "Software Department" },
  ...(a.memo ? { description: a.memo } : {}),
});

await stripe.invoiceItems.create({
  customer: customer.id,
  invoice: invoice.id,
  currency: "usd",
  description: a.description,
  quantity: qty,
  unit_amount_decimal: String(unitCents),
  tax_behavior: "exclusive",
  ...(process.env.STRIPE_TAX_CODE ? { tax_code: process.env.STRIPE_TAX_CODE } : {}),
});

const mode = process.env.STRIPE_SECRET_KEY.includes("_test_") ? "test/" : "";
if (a.draft) {
  console.log(`Draft invoice created: https://dashboard.stripe.com/${mode}invoices/${invoice.id}`);
} else {
  const final = await stripe.invoices.finalizeInvoice(invoice.id);
  await stripe.invoices.sendInvoice(final.id);
  console.log(`Sent ${final.number} for ${(final.amount_due / 100).toFixed(2)} USD to ${a.email}`);
  console.log(`Pay link: ${final.hosted_invoice_url}`);
}
