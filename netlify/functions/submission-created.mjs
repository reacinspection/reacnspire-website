/* Auto-confirmation email for the "Taller de Seguridad" registration form.

   Netlify triggers this function automatically whenever ANY form on the site
   is submitted (the special name "submission-created"). We only act on the
   workshop form, and send the registrant a Spanish confirmation via Resend.

   Sending is best-effort: if Resend isn't configured yet, or the send fails,
   we still return 200 so the registration itself is never affected (it is
   already saved by Netlify and emailed to proposals@reacnspire.com).

   Env vars (set in the Netlify site, not committed):
     RESEND_API_KEY  - Resend API key
     FROM_EMAIL      - e.g. "Kendra REAC Consultant <noreply@reacnspire.com>" (verified in Resend) */

export const handler = async (event) => {
  let payload;
  try {
    payload = JSON.parse(event.body).payload;
  } catch {
    return { statusCode: 200, body: "no payload" };
  }
  if (!payload || payload.form_name !== "taller-registro") {
    return { statusCode: 200, body: "ignored" };
  }

  const data = payload.data || {};
  const email = (data.email || "").trim();
  const nombre = (data.nombre || "").trim();
  if (!email) return { statusCode: 200, body: "no email" };

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL;
  if (!apiKey || !from) {
    console.log("submission-created: RESEND_API_KEY/FROM_EMAIL not set - skipping confirmation email");
    return { statusCode: 200, body: "not configured" };
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
        <a href="https://teams.live.com/meet/9346999265279?p=WSyGq0U2C0HJiCjQrw" style="background:#0D1F3C;color:#ffffff;text-decoration:none;font-weight:700;padding:15px 30px;border-radius:8px;display:inline-block;font-size:16px;">Unirse a la reunión de Teams →</a>
      </p>
      <p style="text-align:center;font-size:13px;color:#6b7280;margin-top:0;"><strong>Guarde este correo.</strong> El mismo enlace funcionará el día del evento (martes 18 de agosto, 10:00 AM EST).</p>
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
        subject: "Confirmación — Taller de Seguridad GRATIS (18 de agosto)",
        html,
      }),
    });
    if (!res.ok) console.log("submission-created: Resend error", res.status, await res.text().catch(() => ""));
  } catch (e) {
    console.log("submission-created: send failed", e && e.message);
  }
  return { statusCode: 200, body: "ok" };
};
