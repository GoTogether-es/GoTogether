/**
 * Template de email profesional para Magic Link de GoTogether.
 * Diseñado para ser accesible, responsivo y visualmente atractivo.
 */
export const getMagicLinkTemplate = (actionLink: string, userName?: string) => {
  const brandColor = '#2563eb'; // Azul GoTogether
  
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tu acceso a GoTogether</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }
        .header { padding: 40px 40px 20px; text-align: center; }
        .logo { font-size: 28px; font-weight: 800; color: ${brandColor}; letter-spacing: -0.02em; margin: 0; }
        .content { padding: 0 40px 40px; color: #374151; line-height: 1.6; }
        .title { font-size: 24px; font-weight: 700; color: #111827; margin-bottom: 16px; }
        .button-container { margin: 32px 0; text-align: center; }
        .button { background-color: ${brandColor}; color: #ffffff !important; padding: 16px 32px; border-radius: 12px; font-weight: 600; text-decoration: none; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); }
        .footer { padding: 32px 40px; background-color: #f3f4f6; color: #6b7280; font-size: 14px; text-align: center; }
        .link-fallback { font-size: 12px; color: #9ca3af; margin-top: 24px; word-break: break-all; }
        @media (max-width: 480px) { .container { margin: 0; border-radius: 0; } .content { padding: 0 24px 32px; } }
      </style>
    </head>
    <body role="article" aria-roledescription="email" lang="es">
      <div class="container">
        <div class="header">
          <p class="logo">GoTogether</p>
        </div>
        <div class="content">
          <h1 class="title">Tu enlace de acceso</h1>
          <p>Hola${userName ? ` ${userName}` : ''},</p>
          <p>Has solicitado acceder a tu cuenta en GoTogether. Haz clic en el botón de abajo para entrar de forma segura. Este enlace caducará pronto.</p>
          
          <div class="button-container">
            <a href="${actionLink}" class="button">Entrar en GoTogether</a>
          </div>
          
          <p>Si no has solicitado este correo, puedes ignorarlo con total seguridad.</p>
          
          <div class="link-fallback">
            O copia y pega esta URL en tu navegador:<br>
            <a href="${actionLink}" style="color: #9ca3af;">${actionLink}</a>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} GoTogether Technologies S.L.</p>
          <p>Acompañamiento humano y empoderamiento.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
