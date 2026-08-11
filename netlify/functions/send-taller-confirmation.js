/* HTTP function: sends the workshop confirmation email via Resend.
   Called directly by the registration page's JS on submit (POST with JSON
   {email, nombre}). HTTP functions always run on request, so this is far more
   reliable than the form event trigger. Best-effort: never throws; the
   registration is recorded separately by Netlify Forms regardless.

   Env vars: RESEND_API_KEY, FROM_EMAIL. */

const TEAMS_LINK = "https://teams.live.com/meet/9346999265279?p=WSyGq0U2C0HJiCjQrw";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }
  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ ok: false, reason: "bad json" }) };
  }

  const email = String(body.email || "").trim();
  const nombre = String(body.nombre || "").trim();
  if (!email) return { statusCode: 200, body: JSON.stringify({ ok: false, reason: "no email" }) };

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL;
  if (!apiKey || !from) {
    console.log("send-taller-confirmation: RESEND_API_KEY/FROM_EMAIL not set");
    return { statusCode: 200, body: JSON.stringify({ ok: false, reason: "not configured" }) };
  }

  const saludo = nombre ? `Hola ${nombre},` : "Hola,";
  const html = `
  <div style="font-family:Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1f2937;">
    <div style="background:#0D1F3C;padding:24px 28px;border-radius:12px 12px 0 0;">
      <h1 style="color:#fff;font-size:20px;margin:0;">¡Registración recibida!</h1>
    </div>
    <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:24px 28px;">
      <p>${saludo}</p>
      <p>Gracias por registrarse para nuestro <strong>Taller de Seguridad GRATIS — «Seguridad en el Lugar de Trabajo»</strong>. Aquí están los detalles:</p>
      <table style="border-collapse:collapse;margin:16px 0;font-size:15px;">
        <tr><td style="padding:6px 14px 6px 0;color:#6b7280;">Fecha</td><td style="font-weight:700;">Martes 18 de agosto de 2026</td></tr>
        <tr><td style="padding:6px 14px 6px 0;color:#6b7280;">Hora</td><td style="font-weight:700;">10:00 AM – 11:30 AM (EST)</td></tr>
        <tr><td style="padding:6px 14px 6px 0;color:#6b7280;">Plataforma</td><td style="font-weight:700;">Microsoft Teams (en línea)</td></tr>
      </table>
      <p style="text-align:center;margin:22px 0 8px;">
        <a href="${TEAMS_LINK}" style="background:#0D1F3C;color:#ffffff;text-decoration:none;font-weight:700;padding:15px 30px;border-radius:8px;display:inline-block;font-size:16px;">Unirse a la reunión de Teams →</a>
      </p>
      <p style="text-align:center;font-size:13px;color:#6b7280;margin-top:0;"><strong>Guarde este correo.</strong> El mismo enlace funcionará el día del evento.</p>
      <p style="font-size:13px;color:#6b7280;margin-top:22px;">Kendra REAC Consultant, Inc.<br>
      ¿Preguntas? Responda a este correo o llame al (407) 516-5393.</p>
    </div>
  </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "Confirmación — Taller de Seguridad GRATIS (18 de agosto, Microsoft Teams)",
        html,
      }),
    });
    const txt = await res.text().catch(() => "");
    console.log("send-taller-confirmation: Resend", res.status, txt.slice(0, 160));
    return { statusCode: 200, headers: { "content-type": "application/json" }, body: JSON.stringify({ ok: res.ok }) };
  } catch (e) {
    console.log("send-taller-confirmation: send failed", e && e.message);
    return { statusCode: 200, body: JSON.stringify({ ok: false, reason: "send failed" }) };
  }
};
