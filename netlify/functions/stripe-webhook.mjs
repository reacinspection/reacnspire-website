/* Stripe webhook for the Software Department's invoices (scripts/stripe-invoice.mjs).
   Workshops and trainings are NOT sold through Stripe — they stay on Square.
   App subscriptions (NspirePro) are handled by app.reacnspire.com, not here.

   Stripe Dashboard → Developers → Webhooks → Add endpoint
     URL:    https://reacnspire.com/api/stripe-webhook
     Events: invoice.paid
             invoice.payment_failed
             charge.dispute.created

   Env (mark as secret in Netlify):
     STRIPE_SECRET_KEY       Restricted key (rk_...).
     STRIPE_WEBHOOK_SECRET   Signing secret (whsec_...) of the endpoint above.
     RESEND_API_KEY          Already used by taller-confirm; sends the emails.
     OWNER_EMAIL             Optional; defaults to kendra@reacnspire.com.

   Stripe retries a delivery until it gets a 2xx, so the same event can arrive
   more than once. Emails carry an Idempotency-Key derived from the event id, so a
   retry never sends a duplicate. */

import Stripe from "stripe";

export const config = { path: "/api/stripe-webhook" };

const FROM = "Kendra REAC Consultant — Software Department <kendra@reacnspire.com>";

const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = (cents, cur = "usd") => new Intl.NumberFormat("en-US", { style: "currency", currency: cur.toUpperCase() }).format((cents || 0) / 100);

async function notifyOwner(subject, lines, idempotencyKey) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) { console.warn("email skipped: RESEND_API_KEY not set"); return; }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json", "idempotency-key": idempotencyKey },
    body: JSON.stringify({
      from: FROM,
      to: [process.env.OWNER_EMAIL || "kendra@reacnspire.com"],
      subject: `[Stripe · Software Dept] ${subject}`,
      html: `<ul>${lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>`,
    }),
  });
  // Throwing makes us answer 500, so Stripe retries the event later.
  if (!res.ok && res.status !== 409) throw new Error(`resend ${res.status}: ${await res.text()}`);
}

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const key = process.env.STRIPE_SECRET_KEY;
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key || !secret) return new Response("Not configured", { status: 503 });

  const stripe = new Stripe(key);
  const payload = await req.text(); // raw body is required for signature verification
  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(payload, req.headers.get("stripe-signature"), secret);
  } catch (err) {
    console.warn("bad stripe signature", err?.message);
    return new Response("Bad signature", { status: 400 });
  }

  try {
    const obj = event.data.object;
    const dash = `https://dashboard.stripe.com/${event.livemode ? "" : "test/"}`;
    switch (event.type) {
      case "invoice.paid":
        // Only invoices we send by email; subscription renewals are the app's business.
        if (obj.collection_method === "send_invoice") {
          await notifyOwner(`Invoice paid — ${money(obj.amount_paid, obj.currency)}`,
            [`Invoice ${obj.number || obj.id}`, `Customer ${obj.customer_name || ""} <${obj.customer_email || ""}>`, `${dash}invoices/${obj.id}`], event.id);
        }
        break;
      case "invoice.payment_failed":
        if (obj.collection_method === "send_invoice") {
          await notifyOwner("Invoice payment failed",
            [`Invoice ${obj.number || obj.id}`, `Customer ${obj.customer_email || ""}`, `${dash}invoices/${obj.id}`], event.id);
        }
        break;
      case "charge.dispute.created":
        await notifyOwner(`DISPUTE opened — ${money(obj.amount, obj.currency)}`,
          [`Dispute ${obj.id}`, `Reason ${obj.reason}`, "Respond in the Stripe Dashboard before the due date.", `${dash}disputes/${obj.id}`], event.id);
        break;
      default:
        break; // ignore events we didn't subscribe to
    }
  } catch (err) {
    console.error("webhook handler failed", event.type, event.id, err?.message);
    return new Response("Handler error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), { status: 200, headers: { "content-type": "application/json" } });
};
