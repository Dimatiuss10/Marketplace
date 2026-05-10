const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendResetCode = async (email, code) => {
  await transporter.sendMail({
    from: `"AgroMarket Urabá" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Código de recuperación — 🌾AgroMarket",
    html: `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    </head>
    <body style="margin:0; padding:0; background:#f0ece4; font-family: Arial, sans-serif;">

      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ece4; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

              <!-- Header -->
              <tr>
                <td style="background:#1a3a15; padding: 32px 40px;">
                  <p style="margin:0; font-size:11px; color:rgba(221,232,213,0.7); letter-spacing:2px; text-transform:uppercase;">Plataforma agrícola</p>
                  <h1 style="margin:8px 0 0; font-size:26px; color:#e8c547; font-family: Georgia, serif; font-weight:700;">AgroMarket Urabá</h1>
                </td>
              </tr>


              <!-- Cuerpo -->
              <tr>
                <td style="padding: 40px 40px 0;">
                  <h2 style="margin:0 0 12px; font-size:20px; color:#1a3a15; font-family: Georgia, serif;">Recuperación de contraseña</h2>
                  <p style="margin:0 0 24px; font-size:15px; color:#5a5a4e; line-height:1.7;">
                    Recibimos una solicitud para restablecer la contraseña de tu cuenta. Usa el siguiente código para continuar con el proceso.
                  </p>
                </td>
              </tr>


              <!-- Codigo -->
              <tr>
                <td style="padding: 0 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background:#1a3a15; border-radius:12px; padding:28px; text-align:center;">
                        <p style="margin:0 0 8px; font-size:11px; color:rgba(221,232,213,0.6); letter-spacing:2px; text-transform:uppercase;">Tu código de verificación</p>
                        <p style="margin:0; font-size:42px; font-weight:700; color:#e8c547; letter-spacing:12px; font-family: Georgia, serif;">${code}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Aviso expiracion -->
              <tr>
                <td style="padding: 24px 40px 0;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background:#f5f0e8; border-radius:10px; padding:16px 20px; border-left: 4px solid #e8c547;">
                        <p style="margin:0; font-size:13px; color:#5a5a4e; line-height:1.6;">
                          Este código es válido por <strong style="color:#1a3a15;">10 minutos</strong>. 
                          Si no solicitaste este cambio, puedes ignorar este mensaje — tu cuenta permanece segura.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Pasos -->
              <tr>
                <td style="padding: 28px 40px 0;">
                  <p style="margin:0 0 14px; font-size:13px; font-weight:600; color:#1a3a15; text-transform:uppercase; letter-spacing:0.5px;">Como continuar</p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding: 8px 0; border-bottom: 1px solid #f0ece4;">
                        <span style="display:inline-block; background:#e8c547; color:#1a3a15; font-size:11px; font-weight:700; width:20px; height:20px; border-radius:50%; text-align:center; line-height:20px; margin-right:10px;">1</span>
                        <span style="font-size:13px; color:#5a5a4e;">Copia el código de 6 dígitos</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; border-bottom: 1px solid #f0ece4;">
                        <span style="display:inline-block; background:#e8c547; color:#1a3a15; font-size:11px; font-weight:700; width:20px; height:20px; border-radius:50%; text-align:center; line-height:20px; margin-right:10px;">2</span>
                        <span style="font-size:13px; color:#5a5a4e;">Ingresalo en la pantalla de verificación</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0;">
                        <span style="display:inline-block; background:#e8c547; color:#1a3a15; font-size:11px; font-weight:700; width:20px; height:20px; border-radius:50%; text-align:center; line-height:20px; margin-right:10px;">3</span>
                        <span style="font-size:13px; color:#5a5a4e;">Crea tu nueva contraseña</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Divider -->
              <tr>
                <td style="padding: 32px 40px 0;">
                  <hr style="border:none; border-top: 1px solid #f0ece4; margin:0;" />
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 24px 40px 32px;">
                  <p style="margin:0 0 6px; font-size:12px; color:#9a9a8e;">Este es un mensaje automatico, por favor no respondas a este correo.</p>
                  <p style="margin:0; font-size:12px; color:#9a9a8e;">
                    AgroMarket Urabá — Conectando el campo con el consumidor.
                  </p>
                </td>
              </tr>

            </table>

            <!-- Sub footer -->
            <table width="520" cellpadding="0" cellspacing="0" style="margin-top:20px;">
              <tr>
                <td align="center">
                  <p style="margin:0; font-size:11px; color:#9a9a8e;">© 2026 AgroMarket Urabá. Todos los derechos reservados.</p>
                </td>
              </tr>
            </table>

          </td>
        </tr>
      </table>

    </body>
    </html>
    `,
  });
};

module.exports = { sendResetCode };