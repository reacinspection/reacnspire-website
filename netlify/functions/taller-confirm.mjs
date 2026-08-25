/* Cross-origin HTTP function that sends the workshop confirmation email via
   Resend. Lives on the NspirePro site because its RESEND_API_KEY is proven to
   work here. Called by the reacnspire.com registration page (cross-origin, so
   CORS is enabled). Best-effort: never throws.

   Env: RESEND_API_KEY (already set on this site). From address is fixed. */

export const config = { path: "/taller-confirm" };

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST,OPTIONS",
  "access-control-allow-headers": "content-type",
};
const FROM = "Kendra REAC Consultant <kendra@reacnspire.com>";

// Zoom meeting details for the workshop (Sep 9, 2026).
const ZOOM_JOIN = "https://us06web.zoom.us/j/84885138629?pwd=PH5GhPHpjqNTovPk5F0a5DboQhXUg1.1";
const ZOOM_CHAT = "https://us06web.zoom.us/launch/jc/84885138629";
const ZOOM_INSTRUCTIONS = "https://us06web.zoom.us/meetings/84885138629/invitations?signature=ci2lL61qeqxXCuqSaV68MkoV835_OdP1mEloQHpVI98";
const ZOOM_ID = "848 8513 8629";
const ZOOM_PASS = "670028";

const json = (data) =>
  new Response(JSON.stringify(data), { status: 200, headers: { "content-type": "application/json", ...CORS } });
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export default async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: CORS });

  let body = {};
  try { body = await req.json(); } catch { /* empty */ }
  const email = String(body.email || "").trim();
  const nombre = String(body.nombre || "").trim();
  if (!email) return json({ ok: false, reason: "no email" });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return json({ ok: false, reason: "not configured" });

  const saludo = nombre ? `Hola ${esc(nombre)},` : "Hola,";
  const html = `
  <div style="font-family:Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1f2937;">
    <div style="background:#0D1F3C;padding:24px 28px;border-radius:12px 12px 0 0;">
      <h1 style="color:#fff;font-size:20px;margin:0;">¡Registración recibida!</h1>
    </div>
    <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:24px 28px;">
      <p>${saludo}</p>
      <p><strong>Kendra REAC Consultant, Inc.</strong> y la presentadora <strong>Sandra Romero</strong> le están invitando a participar en un taller gratuito. El espacio es limitado para las <strong>primeras 100 personas</strong> que entren en la sala de espera.</p>
      <table style="border-collapse:collapse;margin:16px 0;font-size:15px;">
        <tr><td style="padding:6px 14px 6px 0;color:#6b7280;">Taller</td><td style="font-weight:700;">Seguridad en el Lugar de Trabajo</td></tr>
        <tr><td style="padding:6px 14px 6px 0;color:#6b7280;">Fecha</td><td style="font-weight:700;">9 de septiembre de 2026</td></tr>
        <tr><td style="padding:6px 14px 6px 0;color:#6b7280;">Hora</td><td style="font-weight:700;">10:00 AM – 11:30 AM · Eastern Time (US and Canada)</td></tr>
        <tr><td style="padding:6px 14px 6px 0;color:#6b7280;">Plataforma</td><td style="font-weight:700;">Zoom (en línea)</td></tr>
      </table>
      <p style="text-align:center;margin:22px 0 8px;">
        <a href="${ZOOM_JOIN}" style="background:#0D1F3C;color:#ffffff;text-decoration:none;font-weight:700;padding:15px 30px;border-radius:8px;display:inline-block;font-size:16px;">Únete a una reunión por Zoom →</a>
      </p>
      <p style="text-align:center;font-size:13px;color:#6b7280;margin-top:0;"><strong>Guarde este correo.</strong> El mismo enlace funcionará el día del evento.</p>
      <table style="border-collapse:collapse;margin:16px auto;font-size:15px;">
        <tr><td style="padding:6px 14px 6px 0;color:#6b7280;">ID de la reunión</td><td style="font-weight:700;">${ZOOM_ID}</td></tr>
        <tr><td style="padding:6px 14px 6px 0;color:#6b7280;">Contraseña</td><td style="font-weight:700;">${ZOOM_PASS}</td></tr>
      </table>
      <p style="font-size:14px;margin:14px 0 0;">Enlace al chat de la reunión:<br>
        <a href="${ZOOM_CHAT}" style="color:#0D1F3C;">${ZOOM_CHAT}</a></p>
      <div style="border-top:1px solid #e5e7eb;margin:20px 0 0;padding-top:16px;font-size:13px;color:#4b5563;line-height:1.6;">
        <p style="margin:0 0 6px;"><strong>Marcar desde el móvil (One tap mobile):</strong><br>
          +1 305 224 1968,,84885138629#,,,,*670028# (US)<br>
          +1 309 205 3325,,84885138629#,,,,*670028# (US)</p>
        <p style="margin:10px 0 6px;"><strong>Unirse por SIP:</strong><br>
          84885138629@zoomcrc.com</p>
        <p style="margin:10px 0 0;"><strong>Instrucciones para unirse:</strong><br>
          <a href="${ZOOM_INSTRUCTIONS}" style="color:#0D1F3C;">Abrir instrucciones de Zoom</a></p>
      </div>
      <p style="font-size:13px;color:#6b7280;margin-top:22px;">Kendra REAC Consultant, Inc.<br>
      ¿Preguntas? Responda a este correo o llame al (407) 516-5393.</p>
    </div>
  </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [email],
        subject: "Confirmación — Taller de Seguridad GRATIS «Seguridad en el Lugar de Trabajo» (9 de septiembre, Zoom)",
        html,
      }),
    });
    return json({ ok: res.ok });
  } catch (e) {
    return json({ ok: false, reason: "send failed" });
  }
};
