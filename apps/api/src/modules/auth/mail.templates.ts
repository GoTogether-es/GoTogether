const brandColor = '#2563eb';

const headerLogo = `<div style="padding:40px 40px 20px;text-align:center"><p style="font-size:28px;font-weight:800;color:${brandColor};margin:0">GoTogether</p></div>`;
const footer = `<div style="padding:32px 40px;background:#f3f4f6;color:#6b7280;font-size:14px;text-align:center"><p>&copy; ${new Date().getFullYear()} GoTogether</p></div>`;

function wrap(title: string, body: string): string {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${title}</title></head><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;margin:0;padding:0"><div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,.05)">${headerLogo}${body}${footer}</div></body></html>`;
}

export const getMagicLinkTemplate = (actionLink: string, userName?: string) => {
  return wrap('Tu acceso a GoTogether', `
    <div style="padding:0 40px 40px;color:#374151;line-height:1.6">
      <h1 style="font-size:24px;font-weight:700;color:#111827;margin-bottom:16px">Tu enlace de acceso</h1>
      <p>Hola${userName ? ` ${userName}` : ''},</p>
      <p>Haz clic abajo para acceder de forma segura.</p>
      <div style="margin:32px 0;text-align:center"><a href="${actionLink}" style="background:${brandColor};color:#fff;padding:16px 32px;border-radius:12px;font-weight:600;text-decoration:none;display:inline-block;font-size:16px;box-shadow:0 4px 6px -1px rgba(37,99,235,.2)">Entrar en GoTogether</a></div>
      <p>Si no has solicitado este correo, ignóralo.</p>
    </div>`);
};

export function getSupervisionInviteTemplate(params: {
  supervisorName: string;
  clientName: string;
  acceptUrl: string;
}) {
  return wrap('Invitación de supervisión - GoTogether', `
    <div style="padding:0 40px 40px;color:#374151;line-height:1.6">
      <h1 style="font-size:24px;font-weight:700;color:#111827;margin-bottom:16px">Invitación de supervisión</h1>
      <p>Hola ${params.clientName},</p>
      <p><strong>${params.supervisorName}</strong> te ha invitado a conectar en GoTogether como tu supervisor. Esto le permitirá ayudarte a gestionar tus reservas y acompañamientos.</p>
      <div style="background:#f8fafc;border-radius:12px;padding:24px;margin:24px 0;border:1px solid #e2e8f0"><p style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#64748b;margin:0 0 4px">Supervisor</p><p style="font-size:18px;font-weight:600;color:#0f172a;margin:0">${params.supervisorName}</p></div>
      <p>Haz clic en el botón de abajo para aceptar la invitación y comenzar.</p>
      <div style="margin:32px 0;text-align:center"><a href="${params.acceptUrl}" style="background:${brandColor};color:#fff;padding:16px 32px;border-radius:12px;font-weight:600;text-decoration:none;display:inline-block;font-size:16px;box-shadow:0 4px 6px -1px rgba(37,99,235,.2)">Aceptar invitación</a></div>
      <p style="font-size:14px;color:#6b7280">Si no conoces a esta persona o no deseas conectar, simplemente ignora este mensaje.</p>
    </div>`);
}

export function getBookingAcceptedTemplate(params: {
  userName: string;
  companionName: string;
  serviceType: string;
  scheduledAt: string;
  appUrl: string;
}) {
  return wrap('Reserva aceptada - GoTogether', `
    <div style="padding:0 40px 40px;color:#374151;line-height:1.6">
      <h1 style="font-size:24px;font-weight:700;color:#111827;margin-bottom:16px">¡Reserva aceptada!</h1>
      <p>Hola ${params.userName},</p>
      <p><strong>${params.companionName}</strong> ha aceptado tu solicitud de servicio.</p>
      <div style="background:#f0fdf4;border-radius:12px;padding:20px;margin:24px 0;border:1px solid #bbf7d0">
        <p style="margin:0 0 8px"><strong>Servicio:</strong> ${params.serviceType}</p>
        <p style="margin:0"><strong>Fecha:</strong> ${params.scheduledAt}</p>
      </div>
      <div style="margin:32px 0;text-align:center"><a href="${params.appUrl}/reservas" style="background:${brandColor};color:#fff;padding:16px 32px;border-radius:12px;font-weight:600;text-decoration:none;display:inline-block;font-size:16px;box-shadow:0 4px 6px -1px rgba(37,99,235,.2)">Ir a la reserva</a></div>
    </div>`);
}

export function getBookingDeclinedTemplate(params: {
  userName: string;
  companionName: string;
  serviceType: string;
  appUrl: string;
}) {
  return wrap('Reserva rechazada - GoTogether', `
    <div style="padding:0 40px 40px;color:#374151;line-height:1.6">
      <h1 style="font-size:24px;font-weight:700;color:#111827;margin-bottom:16px">Reserva rechazada</h1>
      <p>Hola ${params.userName},</p>
      <p><strong>${params.companionName}</strong> ha rechazado tu solicitud para el servicio de <strong>${params.serviceType}</strong>.</p>
      <p>No te preocupes, puedes buscar otros acompañantes disponibles.</p>
      <div style="margin:32px 0;text-align:center"><a href="${params.appUrl}/explorar" style="background:${brandColor};color:#fff;padding:16px 32px;border-radius:12px;font-weight:600;text-decoration:none;display:inline-block;font-size:16px;box-shadow:0 4px 6px -1px rgba(37,99,235,.2)">Buscar acompañantes</a></div>
    </div>`);
}

export function getBookingCompletedTemplate(params: {
  userName: string;
  companionName: string;
  serviceType: string;
  appUrl: string;
}) {
  return wrap('Servicio completado - GoTogether', `
    <div style="padding:0 40px 40px;color:#374151;line-height:1.6">
      <h1 style="font-size:24px;font-weight:700;color:#111827;margin-bottom:16px">¡Servicio completado!</h1>
      <p>Hola ${params.userName},</p>
      <p>El servicio de <strong>${params.serviceType}</strong> con <strong>${params.companionName}</strong> ha sido marcado como completado.</p>
      <p>¿Qué tal fue tu experiencia? Valora el servicio para ayudar a otros usuarios.</p>
      <div style="margin:32px 0;text-align:center"><a href="${params.appUrl}/reservas" style="background:${brandColor};color:#fff;padding:16px 32px;border-radius:12px;font-weight:600;text-decoration:none;display:inline-block;font-size:16px;box-shadow:0 4px 6px -1px rgba(37,99,235,.2)">Valorar servicio</a></div>
    </div>`);
}

export function getBookingCancelledTemplate(params: {
  userName: string;
  cancelledBy: string;
  serviceType: string;
  appUrl: string;
}) {
  return wrap('Reserva cancelada - GoTogether', `
    <div style="padding:0 40px 40px;color:#374151;line-height:1.6">
      <h1 style="font-size:24px;font-weight:700;color:#111827;margin-bottom:16px">Reserva cancelada</h1>
      <p>Hola ${params.userName},</p>
      <p>La reserva para <strong>${params.serviceType}</strong> ha sido cancelada por ${params.cancelledBy}.</p>
      <p>Puedes crear una nueva reserva cuando lo necesites.</p>
      <div style="margin:32px 0;text-align:center"><a href="${params.appUrl}/solicitud" style="background:${brandColor};color:#fff;padding:16px 32px;border-radius:12px;font-weight:600;text-decoration:none;display:inline-block;font-size:16px;box-shadow:0 4px 6px -1px rgba(37,99,235,.2)">Nueva reserva</a></div>
    </div>`);
}

export function getVerificationApprovedTemplate(params: {
  userName: string;
  appUrl: string;
}) {
  return wrap('Verificación aprobada - GoTogether', `
    <div style="padding:0 40px 40px;color:#374151;line-height:1.6">
      <h1 style="font-size:24px;font-weight:700;color:#111827;margin-bottom:16px">¡Verificación aprobada!</h1>
      <p>Hola ${params.userName},</p>
      <p>Tu documentación ha sido verificada correctamente. Ya formas parte de la comunidad verificada de GoTogether.</p>
      <div style="margin:32px 0;text-align:center"><a href="${params.appUrl}" style="background:${brandColor};color:#fff;padding:16px 32px;border-radius:12px;font-weight:600;text-decoration:none;display:inline-block;font-size:16px;box-shadow:0 4px 6px -1px rgba(37,99,235,.2)">Ir a GoTogether</a></div>
    </div>`);
}

export function getVerificationRejectedTemplate(params: {
  userName: string;
  appUrl: string;
}) {
  return wrap('Verificación rechazada - GoTogether', `
    <div style="padding:0 40px 40px;color:#374151;line-height:1.6">
      <h1 style="font-size:24px;font-weight:700;color:#111827;margin-bottom:16px">Verificación rechazada</h1>
      <p>Hola ${params.userName},</p>
      <p>Tras revisar tu documentación, no hemos podido verificar tu perfil en este momento. Por favor, revisa que los documentos estén correctos y actualiza tu información.</p>
      <div style="margin:32px 0;text-align:center"><a href="${params.appUrl}/perfil" style="background:${brandColor};color:#fff;padding:16px 32px;border-radius:12px;font-weight:600;text-decoration:none;display:inline-block;font-size:16px;box-shadow:0 4px 6px -1px rgba(37,99,235,.2)">Actualizar perfil</a></div>
    </div>`);
}
