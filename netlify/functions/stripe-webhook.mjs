/* Stripe webhook: the ONLY place a paid registration is fulfilled.
   (The success page is not reliable — a buyer can pay and close the tab.)

   Stripe Dashboard → Developers → Webhooks → Add endpoint
     URL:    https://reacnspire.com/api/stripe-webhook
     Events: checkout.session.completed
             checkout.session.async_payment_succeeded
             checkout.session.async_payment_failed
             invoice.paid
             invoice.payment_failed
             charge.dispute.created

   Env (mark as secret in Netlify):
     STRIPE_SECRET_KEY       Restricted key (rk_...).
     STRIPE_WEBHOOK_SECRET   Signing secret (whsec_...) of the endpoint above.
     RESEND_API_KEY          Already used by taller-confirm; sends the emails.
     OWNER_EMAIL             Optional; defaults to kendra@reacnspire.com.

   Stripe retries a delivery until it gets a 2xx, so the same event can arrive
   more than once. Emails are sent with an Idempotency-Key derived from the Stripe
   object id, so a retry never emails the buyer twice. */

import Stripe from "stripe";
import { DISCLOSURE } from "../lib/billing.mjs";

export const config = { path: "/api/stripe-webhook" };

const FROM = "Kendra REAC Consultant <kendra@reacnspire.com>";
const PRODUCTS = {
  "hqs-a-nspire": { es: "De HQS a NSPIRE-V — 17 de noviembre de 2026 (Zoom)", en: "HQS to NSPIRE-V — November 17, 2026 (Zoom)" },
  "taller-seguridad": { es: "Taller NSPIRE: Repaso y Empleados Nuevos — 25 de noviembre de 2026 (Zoom)", en: "NSPIRE Workshop Refresher and New Employees — November 25, 2026 (Zoom)" },
};

const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = (cents, cur = "usd") => new Intl.NumberFormat("en-US", { style: "currency", currency: cur.toUpperCase() }).format((cents || 0) / 100);

async function sendEmail({ to, subject, html, idempotencyKey }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !to) { console.warn("email skipped", { to: !!to, configured: !!apiKey }); return; }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json", "idempotency-key": idempotencyKey },
    body: JSON.stringify({ from: FROM, to: [to], reply_to: "kendra@reacnspire.com", subject, html }),
  });
  // Throwing makes us answer 500, so Stripe retries the event later.
  if (!res.ok && res.status !== 409) throw new Error(`resend ${res.status}: ${await res.text()}`);
}

async function fulfillCheckout(session) {
  // With delayed payment methods (e.g. ACH) "completed" arrives while still unpaid;
  // async_payment_succeeded will follow, and we fulfill then.
  if (session.payment_status === "unpaid") return;

  const md = session.metadata || {};
  const lang = md.lang === "en" ? "en" : "es";
  const product = PRODUCTS[md.product]?.[lang] || md.product || "Registration";
  const email = session.customer_details?.email || session.customer_email;
  const name = session.customer_details?.name || md.name || "";
  const qty = md.quantity || "1";
  const total = money(session.amount_total, session.currency);
  const tax = session.total_details?.amount_tax ? money(session.total_details.amount_tax, session.currency) : null;

  const t = lang === "en"
    ? { subj: `Payment received — ${product}`, hi: name ? `Hello ${esc(name)},` : "Hello,", body: "We received your payment. Your registration is confirmed.", seats: "Seats", paid: "Total paid", taxL: "Tax", zoom: "The Zoom link and materials will be emailed before the training.", q: "Questions? Reply to this email or call (407) 516-5393." }
    : { subj: `Pago recibido — ${product}`, hi: name ? `Hola ${esc(name)},` : "Hola,", body: "Recibimos su pago. Su registro está confirmado.", seats: "Cupos", paid: "Total pagado", taxL: "Impuesto", zoom: "El enlace de Zoom y los materiales se enviarán por correo antes del adiestramiento.", q: "¿Preguntas? Responda a este correo o llame al (407) 516-5393." };

  await sendEmail({
    to: email,
    idempotencyKey: `checkout-${session.id}-buyer`,
    subject: t.subj,
    html: `<div style="font-family:Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1f2937;">
      <div style="background:#0D1F3C;padding:22px 26px;border-radius:12px 12px 0 0;"><h1 style="color:#fff;font-size:19px;margin:0;">${esc(t.subj)}</h1></div>
      <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:22px 26px;">
        <p>${t.hi}</p><p>${t.body}</p>
        <table style="border-collapse:collapse;margin:14px 0;font-size:15px;">
          <tr><td style="padding:5px 14px 5px 0;color:#6b7280;">${t.seats}</td><td style="font-weight:700;">${esc(qty)}</td></tr>
          ${tax ? `<tr><td style="padding:5px 14px 5px 0;color:#6b7280;">${t.taxL}</td><td style="font-weight:700;">${tax}</td></tr>` : ""}
          <tr><td style="padding:5px 14px 5px 0;color:#6b7280;">${t.paid}</td><td style="font-weight:700;">${total}</td></tr>
        </table>
        <p>${t.zoom}</p>
        <p style="font-size:13px;color:#4b5563;margin-top:18px;padding:12px 14px;background:#f3f4f6;border-radius:8px;">${esc(DISCLOSURE[lang])}</p>
        <p style="font-size:13px;color:#6b7280;margin-top:20px;">Kendra REAC Consultant, Inc. — Software Department<br>${t.q}</p>
      </div></div>`,
  });

  await sendEmail({
    to: process.env.OWNER_EMAIL || "kendra@reacnspire.com",
    idempotencyKey: `checkout-${session.id}-owner`,
    subject: `[Stripe] ${qty} × ${PRODUCTS[md.product]?.es || md.product} — ${total}`,
    html: `<p>New paid registration.</p><ul>
      <li>Product: ${esc(md.product)}</li><li>Buyer: ${esc(name)} &lt;${esc(email)}&gt;</li>
      <li>Organization: ${esc(md.organization)}</li><li>Seats: ${esc(qty)}</li>
      <li>Total: ${total}${tax ? ` (tax ${tax})` : ""}</li>
      <li><a href="https://dashboard.stripe.com/${session.livemode ? "" : "test/"}checkout/sessions/${esc(session.id)}">Open in Stripe</a></li></ul>`,
  });
}

async function notifyOwner(subject, lines, key) {
  await sendEmail({
    to: process.env.OWNER_EMAIL || "kendra@reacnspire.com",
    idempotencyKey: key,
    subject: `[Stripe] ${subject}`,
    html: `<ul>${lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>`,
  });
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
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await fulfillCheckout(obj);
        break;
      case "checkout.session.async_payment_failed":
        await notifyOwner("Payment failed after checkout", [`Session ${obj.id}`, `Email ${obj.customer_details?.email || ""}`, `Product ${obj.metadata?.product || ""}`], `${event.id}`);
        break;
      case "invoice.paid":
        // Checkout's receipt invoices (invoice_creation) also fire this; only report real invoices.
        if (obj.collection_method === "send_invoice") {
          await notifyOwner(`Invoice paid — ${money(obj.amount_paid, obj.currency)}`, [`Invoice ${obj.number || obj.id}`, `Customer ${obj.customer_name || ""} <${obj.customer_email || ""}>`], `${event.id}`);
        }
        break;
      case "invoice.payment_failed":
        await notifyOwner("Invoice payment failed", [`Invoice ${obj.number || obj.id}`, `Customer ${obj.customer_email || ""}`], `${event.id}`);
        break;
      case "charge.dispute.created":
        await notifyOwner(`DISPUTE opened — ${money(obj.amount, obj.currency)}`, [`Dispute ${obj.id}`, `Reason ${obj.reason}`, "Respond in the Stripe Dashboard before the due date."], `${event.id}`);
        break;
      default:
        break; // ignore events we didn't subscribe to
    }
  } catch (err) {
    console.error("webhook handler failed", event.type, event.id, err?.message);
    return new Response("Handler error", { status: 500 }); // Stripe will retry
  }

  return new Response(JSON.stringify({ received: true }), { status: 200, headers: { "content-type": "application/json" } });
};
