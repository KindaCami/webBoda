const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// ── HELPERS CALENDARIO ──
const formatICSDate = (date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

const googleCalendarLink = (title, start, end, location, description) => {
    const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
    const params = new URLSearchParams({ text: title, dates: `${formatICSDate(start)}/${formatICSDate(end)}`, location, details: description });
    return `${base}&${params.toString()}`;
};

const outlookCalendarLink = (title, start, end, location, description) => {
    const base = 'https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent';
    const params = new URLSearchParams({ subject: title, startdt: start.toISOString(), enddt: end.toISOString(), location, body: description });
    return `${base}&${params.toString()}`;
};

const calendarButtons = (titulo, googleUrl, outlookUrl) => `
    <div style="margin-top:20px; margin-bottom:8px;">
        <p style="font-size:11px; letter-spacing:2px; text-transform:uppercase; color:rgba(255,255,255,0.3); font-family:monospace; margin-bottom:12px;">📅 Añadir a tu calendario</p>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <a href="${googleUrl}" target="_blank" style="display:inline-block; background:rgba(0,136,255,0.15); color:#0088ff; border:1px solid rgba(0,136,255,0.3); border-radius:3px; padding:8px 16px; font-size:12px; font-family:monospace; text-decoration:none; letter-spacing:1px;">📅 Google Calendar</a>
            <a href="${outlookUrl}" target="_blank" style="display:inline-block; background:rgba(0,120,212,0.15); color:#74b9ff; border:1px solid rgba(0,120,212,0.3); border-radius:3px; padding:8px 16px; font-size:12px; font-family:monospace; text-decoration:none; letter-spacing:1px;">📅 Outlook</a>
        </div>
        <p style="font-size:11px; color:rgba(255,255,255,0.2); margin-top:8px; font-style:italic;">Para Apple Calendar, guarda este email y ábrelo desde tu iPhone o Mac.</p>
    </div>`;

const reenvioMsg = `
    <div style="background:rgba(0,136,255,0.07); border:1px solid rgba(0,136,255,0.15); border-left:3px solid #0088ff; border-radius:3px; padding:12px 16px; margin-top:16px; font-size:13px; color:rgba(255,255,255,0.6); line-height:1.6;">
        📨 <strong style="color:#0088ff">Por favor, reenvía este correo</strong> a los demás integrantes de tu grupo que no lo hayan recibido.
    </div>`;

// ── BASE HTML ──
const emailBase = (accentColor, contenido) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; font-family: Arial, sans-serif; color: #fff; }
        .wrapper { max-width: 560px; margin: 0 auto; padding: 32px 16px; }
        .accent-bar { height: 3px; background: ${accentColor}; border-radius: 2px 2px 0 0; }
        .card { background: #0d0d1a; border: 1px solid rgba(255,255,255,0.08); border-top: none; border-radius: 0 0 6px 6px; }
        .card-body { padding: 36px 32px; }
        .brand { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: ${accentColor.includes('ffd700') ? '#ffd700' : '#00ff88'}; margin-bottom: 20px; font-family: monospace; }
        h1 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 8px; line-height: 1.3; font-family: monospace; }
        .subtitle { font-size: 14px; color: rgba(255,255,255,0.4); margin-bottom: 28px; }
        .divider { height: 1px; background: rgba(255,255,255,0.06); margin: 24px 0; }
        .info-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .info-label { font-size: 11px; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 1px; font-family: monospace; }
        .info-value { font-size: 13px; color: #fff; font-weight: 600; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th { font-size: 11px; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 1px; padding: 8px 6px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.06); font-family: monospace; }
        td { font-size: 13px; padding: 10px 6px; border-bottom: 1px solid rgba(255,255,255,0.04); color: rgba(255,255,255,0.8); vertical-align: middle; }
        td:last-child { text-align: right; }
        .badge-si   { display:inline-block; background:rgba(0,255,136,0.12); color:#00ff88; border:1px solid rgba(0,255,136,0.2); font-size:11px; padding:2px 8px; border-radius:3px; font-weight:600; }
        .badge-no   { display:inline-block; background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.25); border:1px solid rgba(255,255,255,0.08); font-size:11px; padding:2px 8px; border-radius:3px; }
        .badge-menu { display:inline-block; background:rgba(0,136,255,0.12); color:#0088ff; border:1px solid rgba(0,136,255,0.2); font-size:11px; padding:2px 8px; border-radius:3px; }
        .footer { padding: 20px 32px; border-top: 1px solid rgba(255,255,255,0.05); text-align: center; }
        .footer p { font-size: 12px; color: rgba(255,255,255,0.2); line-height: 1.6; }
        .hearts { font-size: 14px; color: ${accentColor.includes('ffd700') ? '#ffd700' : '#00ff88'}; margin-bottom: 8px; }
        .note { font-size: 13px; color: rgba(255,255,255,0.45); line-height: 1.7; margin-top: 16px; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="accent-bar"></div>
        <div class="card">
            <div class="card-body">${contenido}</div>
            <div class="footer">
                <div class="hearts">♥ ♥</div>
                <p>Boda Camilo y Víctor · 2026 / 2027<br>Plaza Mayor, Madrid &amp; Aldea Tejera Negra, Guadalajara</p>
            </div>
        </div>
    </div>
</body>
</html>`;

const yn    = (v) => v ? '<span class="badge-si">✓ Sí</span>' : '<span class="badge-no">No</span>';
const noche = (v) => v ? '<span class="badge-si">🛏 Sí</span>' : '<span class="badge-no">—</span>';

const asiste2026 = (members) => members.some(m => m.attending_ceremony_2026);
const asiste2027 = (members) => members.some(m => m.attending_friday_2027 || m.attending_saturday_2027 || m.attending_sunday_2027);

const fecha2026 = { start: new Date('2026-05-22T12:00:00Z'), end: new Date('2026-05-22T22:00:00Z') };
const fecha2027inicio = new Date('2027-05-21T18:00:00Z');
const fecha2027fin    = new Date('2027-05-23T14:00:00Z');

// ══════════════════════════════════════════════════
// 1. EMAIL INVITADO — Confirmación 2026
// ══════════════════════════════════════════════════
const emailConfirmacion2026 = (nombreGrupo, members) => {
    const filas = members.filter(m => m.attending_ceremony_2026).map(g => `
        <tr>
            <td>${g.fullname}</td>
            <td>${yn(g.attending_ceremony_2026)}</td>
            <td><span class="badge-menu">${g.menu_type || 'estándar'}</span></td>
        </tr>`).join('');

    const googleUrl  = googleCalendarLink('Boda Camilo y Víctor · Ceremonia Civil', fecha2026.start, fecha2026.end, 'Plaza Mayor, Madrid', `Ceremonia civil. Grupo: ${nombreGrupo}`);
    const outlookUrl = outlookCalendarLink('Boda Camilo y Víctor · Ceremonia Civil', fecha2026.start, fecha2026.end, 'Plaza Mayor, Madrid', `Ceremonia civil. Grupo: ${nombreGrupo}`);

    return emailBase('linear-gradient(90deg, #ffd700, #ffaa00)', `
        <div class="brand">✦ Boda Camilo y Víctor · Ceremonia 2026</div>
        <h1>¡Nos vemos en<br>Plaza Mayor! 🏛️</h1>
        <p class="subtitle">Hemos recibido tu confirmación para la ceremonia civil del 22 de mayo de 2026.</p>
        <div class="divider"></div>
        <div class="info-row"><span class="info-label">Fecha</span><span class="info-value">22 de Mayo de 2026</span></div>
        <div class="info-row"><span class="info-label">Lugar</span><span class="info-value">Plaza Mayor, Madrid</span></div>
        <div class="info-row"><span class="info-label">Grupo</span><span class="info-value">${nombreGrupo}</span></div>
        <div class="divider"></div>
        <table>
            <thead><tr><th>Invitado</th><th>Asiste</th><th>Menú</th></tr></thead>
            <tbody>${filas}</tbody>
        </table>
        ${reenvioMsg}
        ${calendarButtons('Ceremonia Civil · Plaza Mayor', googleUrl, outlookUrl)}
        <p class="note">Puedes modificar tu confirmación en cualquier momento accediendo con tu código.</p>
    `);
};

// ══════════════════════════════════════════════════
// 2. EMAIL INVITADO — Confirmación 2027
// ══════════════════════════════════════════════════
const emailConfirmacion2027 = (nombreGrupo, members) => {
    const filas = members.map(g => `
        <tr>
            <td>${g.fullname}</td>
            <td>${yn(g.attending_friday_2027)}</td>
            <td>${yn(g.attending_saturday_2027)}</td>
            <td>${yn(g.attending_sunday_2027)}</td>
            <td>${noche(g.accommodation_friday)}${noche(g.accommodation_saturday)}${noche(g.accommodation_sunday)}</td>
        </tr>`).join('');

    const enEspera = members.some(m => m.accommodation_status === 'waiting_list');
    const googleUrl  = googleCalendarLink('Boda Camilo y Víctor · Fin de Semana Tejera Negra', fecha2027inicio, fecha2027fin, 'Aldea Tejera Negra, Campillo de Ranas, Guadalajara', `Fin de semana de boda. Grupo: ${nombreGrupo}`);
    const outlookUrl = outlookCalendarLink('Boda Camilo y Víctor · Fin de Semana Tejera Negra', fecha2027inicio, fecha2027fin, 'Aldea Tejera Negra, Campillo de Ranas, Guadalajara', `Fin de semana de boda. Grupo: ${nombreGrupo}`);

    return emailBase('linear-gradient(90deg, #00ff88, #0088ff, #ff00cc)', `
        <div class="brand">✦ Boda Camilo y Víctor · Fin de semana 2027</div>
        <h1>¡Nos vemos en<br>Tejera Negra! 🌲</h1>
        <p class="subtitle">Hemos recibido tu confirmación para el fin de semana del 21-23 de mayo de 2027.</p>
        <div class="divider"></div>
        <div class="info-row"><span class="info-label">Lugar</span><span class="info-value">Aldea Tejera Negra, Guadalajara</span></div>
        <div class="info-row"><span class="info-label">Grupo</span><span class="info-value">${nombreGrupo}</span></div>
        <div class="divider"></div>
        <table>
            <thead><tr><th>Invitado</th><th>Vie 21</th><th>Sáb 22</th><th>Dom 23</th><th>Noches</th></tr></thead>
            <tbody>${filas}</tbody>
        </table>
        ${enEspera ? `
        <div style="background:rgba(255,165,0,0.08); border:1px solid rgba(255,165,0,0.2); border-left:3px solid #ffa500; border-radius:3px; padding:12px 16px; margin-top:16px;">
            <strong style="color:#ffa500">⏳ Lista de espera</strong><br>
            <span style="font-size:13px; color:rgba(255,255,255,0.5)">Las plazas de alojamiento están completas. Os avisaremos en cuanto se libere una plaza.</span>
        </div>` : ''}
        ${reenvioMsg}
        ${calendarButtons('Fin de Semana Boda · Tejera Negra', googleUrl, outlookUrl)}
        <p class="note">Puedes modificar tu confirmación en cualquier momento accediendo con tu código.</p>
    `);
};

// ══════════════════════════════════════════════════
// 3. EMAIL NOVIOS — Resumen completo
// ══════════════════════════════════════════════════
const emailResumenNovios = (nombreGrupo, members) => {
    const filas = members.map(g => `
        <tr>
            <td><strong>${g.fullname}</strong></td>
            <td>${yn(g.attending_ceremony_2026)}</td>
            <td>${yn(g.attending_friday_2027)}</td>
            <td>${yn(g.attending_saturday_2027)}</td>
            <td>${yn(g.attending_sunday_2027)}</td>
            <td>${noche(g.accommodation_friday)}${noche(g.accommodation_saturday)}${noche(g.accommodation_sunday)}</td>
            <td><span class="badge-menu">${g.menu_type || 'estándar'}</span></td>
            <td style="font-size:11px; color:rgba(255,255,255,0.4)">${g.allergies_specifications || '—'}</td>
        </tr>`).join('');

    const enEspera = members.filter(m => m.accommodation_status === 'waiting_list');

    return emailBase('linear-gradient(90deg, #ff00cc, #0088ff)', `
        <div class="brand">✦ Boda Camilo y Víctor · Actualización</div>
        <h1>El grupo <span style="color:#00ff88">${nombreGrupo}</span><br>ha confirmado asistencia</h1>
        <p class="subtitle">${new Date().toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}</p>
        <div class="divider"></div>
        <table>
            <thead>
                <tr><th>Nombre</th><th>Cer'26</th><th>Vie'27</th><th>Sáb'27</th><th>Dom'27</th><th>Noches</th><th>Menú</th><th>Alergias</th></tr>
            </thead>
            <tbody>${filas}</tbody>
        </table>
        ${enEspera.length > 0 ? `
        <div style="background:rgba(255,165,0,0.08); border:1px solid rgba(255,165,0,0.2); border-left:3px solid #ffa500; border-radius:3px; padding:12px 16px; margin-top:16px;">
            <strong style="color:#ffa500">⚠ En lista de espera:</strong> ${enEspera.map(m => m.fullname).join(', ')}
        </div>` : ''}
    `);
};

// ══════════════════════════════════════════════════
// FUNCIÓN PRINCIPAL
// ══════════════════════════════════════════════════
const enviarEmails = async (grupo, members) => {
    const emailGrupo = members.find(m => m.email)?.email || null;
    const hay2026 = asiste2026(members);
    const hay2027 = asiste2027(members);

    console.log('EMAIL DEBUG:', { emailGrupo, hay2026, hay2027 });

    const envios = [];

    if (emailGrupo && hay2026) {
        envios.push(resend.emails.send({
            from: 'Boda Camilo y Víctor <hola@bodacamiloyvictor.com>',
            to: emailGrupo,
            subject: 'Boda Camilo y Víctor · Confirmación Ceremonia 22 Mayo 2026',
            html: emailConfirmacion2026(grupo.name, members)
        }));
    }

    if (emailGrupo && hay2027) {
        envios.push(resend.emails.send({
            from: 'Boda Camilo y Víctor <hola@bodacamiloyvictor.com>',
            to: emailGrupo,
            subject: 'Boda Camilo y Víctor · Confirmación Fin de Semana Mayo 2027',
            html: emailConfirmacion2027(grupo.name, members)
        }));
    }

    envios.push(resend.emails.send({
        from: 'Boda Camilo y Víctor <hola@bodacamiloyvictor.com>',
        to: process.env.EMAIL_NOVIOS,
        subject: `Boda Camilo y Víctor · ${grupo.name} ha confirmado`,
        html: emailResumenNovios(grupo.name, members)
    }));

    const results = await Promise.allSettled(envios);
    results.forEach((r, i) => {
        if (r.status === 'rejected') console.error(`Error email ${i}:`, r.reason?.message || r.reason);
        else console.log(`✓ Email ${i} enviado:`, r.value?.data?.id || 'ok');
    });
};

module.exports = { enviarEmails };
