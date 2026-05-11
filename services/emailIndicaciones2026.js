const emailIndicaciones2026 = () => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; font-family: Arial, sans-serif; color: #fff; }
        .wrapper { max-width: 560px; margin: 0 auto; padding: 32px 16px; }
        .accent-bar { height: 3px; background: linear-gradient(90deg, #ffd700, #ffaa00); border-radius: 2px 2px 0 0; }
        .card { background: #0d0d1a; border: 1px solid rgba(255,255,255,0.08); border-top: none; border-radius: 0 0 6px 6px; }
        .card-body { padding: 36px 32px; }
        .brand { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #ffd700; margin-bottom: 20px; font-family: monospace; }
        h1 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 8px; line-height: 1.3; font-family: monospace; }
        .subtitle { font-size: 14px; color: rgba(255,255,255,0.4); margin-bottom: 28px; line-height: 1.6; }
        .divider { height: 1px; background: rgba(255,255,255,0.06); margin: 24px 0; }
        .block { margin-bottom: 20px; }
        .block-title { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #ffd700; font-family: monospace; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
        .block-body { font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.8; }
        .block-body a { color: #ffd700; text-decoration: none; }
        .timeline { border-left: 2px solid rgba(255,215,0,0.3); padding-left: 20px; margin: 16px 0; }
        .timeline-item { position: relative; margin-bottom: 16px; }
        .timeline-item::before { content: ''; position: absolute; left: -25px; top: 6px; width: 8px; height: 8px; border-radius: 50%; background: #ffd700; }
        .timeline-time { font-family: monospace; font-size: 11px; letter-spacing: 1px; color: #ffd700; margin-bottom: 2px; }
        .timeline-text { font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.6; }
        .info-box { background: rgba(255,215,0,0.06); border: 1px solid rgba(255,215,0,0.15); border-left: 3px solid #ffd700; border-radius: 3px; padding: 14px 16px; margin: 12px 0; font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.7; }
        .transport-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 12px; }
        .transport-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 3px; padding: 12px; }
        .transport-icon { font-size: 18px; margin-bottom: 6px; }
        .transport-label { font-size: 11px; letter-spacing: 1px; color: rgba(255,255,255,0.4); text-transform: uppercase; font-family: monospace; margin-bottom: 4px; }
        .transport-text { font-size: 12px; color: rgba(255,255,255,0.6); line-height: 1.5; }
        .transport-text a { color: #ffd700; text-decoration: none; }
        .badge { display: inline-block; font-family: monospace; font-size: 10px; letter-spacing: 1px; padding: 2px 8px; border-radius: 2px; margin-top: 4px; }
        .badge-green { background: rgba(0,200,100,0.12); color: #00cc66; border: 1px solid rgba(0,200,100,0.2); }
        .badge-orange { background: rgba(255,165,0,0.12); color: #ffa500; border: 1px solid rgba(255,165,0,0.2); }
        .badge-red { background: rgba(255,60,60,0.12); color: #ff6666; border: 1px solid rgba(255,60,60,0.2); }
        .footer { padding: 20px 32px; border-top: 1px solid rgba(255,255,255,0.05); text-align: center; }
        .footer p { font-size: 12px; color: rgba(255,255,255,0.2); line-height: 1.6; }
        .hearts { font-size: 14px; color: #ffd700; margin-bottom: 8px; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="accent-bar"></div>
    <div class="card">
        <div class="card-body">
            <div class="brand">✦ Boda Camilo y Víctor · 22 Mayo 2026</div>
            <h1>¡Ya queda poco! 🏛️</h1>
            <p class="subtitle">
                Antes que nada, gracias de corazón por acompañarnos el <strong style="color:#fff">22 de mayo en la Plaza Mayor</strong>. 
                Que estéis ahí significa muchísimo para nosotros. Aquí van todas las indicaciones para que el día salga perfecto.
            </p>

            <div class="divider"></div>

            <!-- PROGRAMA -->
            <div class="block">
                <div class="block-title">📋 Programa del día</div>
                <div class="timeline">
                    <div class="timeline-item">
                        <div class="timeline-time">11:30 · PUNTO DE ENCUENTRO</div>
                        <div class="timeline-text">
                            Nos encontramos en la 
                            <a href="https://maps.google.com/?q=Plaza+de+la+Villa+Madrid" target="_blank">Plaza de la Villa</a> 
                            — a 5 minutos caminando de la Plaza Mayor. Desde allí iremos juntos a la 
                            <a href="https://maps.google.com/?q=Casa+de+la+Panadería+Plaza+Mayor+Madrid" target="_blank">Casa de la Panadería</a>.
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-time">12:00 · FIRMA</div>
                        <div class="timeline-text">Ceremonia civil en la Plaza Mayor. Duración aproximada: 20 minutos.</div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-time">12:20 · CERVEZAS EN LA PLAZA</div>
                        <div class="timeline-text">Brindamos juntos en la Plaza Mayor. ¡El primer trago es nuestro!</div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-time">14:30 · COMIDA</div>
                        <div class="timeline-text">
                            Picoteo en 
                            <a href="https://maps.app.goo.gl/msGwEZpD3MimZKv46" target="_blank">La Manduca</a>, 
                            en el barrio El Carmen de Madrid.
                        </div>
                    </div>
                </div>
            </div>

            <div class="divider"></div>

            <!-- IMPORTANTE -->
            <div class="block">
                <div class="block-title">⚠️ Importante · Protocolo del Ayuntamiento</div>
                <div class="info-box">
                    Por protocolo del Ayuntamiento de Madrid es necesario llegar con tiempo. 
                    Os pedimos que estéis en la <strong style="color:#ffd700">Plaza de la Villa a las 11:30</strong> como máximo 
                    para poder ir caminando juntos y sin prisas hasta la Casa de la Panadería.
                </div>
            </div>

            <div class="divider"></div>

            <!-- DRESS CODE -->
            <div class="block">
                <div class="block-title">👔 Dress code</div>
                <div class="info-box">
                    El dress code es <strong style="color:#ffd700">elegante no formal</strong> — venid guapos pero cómodos. 
                    Nada de trajes de etiqueta ni corbatas obligatorias. Una camisa, un vestido, algo con estilo... 
                    lo que os haga sentir bien. Eso sí, tened en cuenta que caminaremos por adoquines 😄
                </div>
            </div>

            <div class="divider"></div>

            <!-- TRANSPORTE -->
            <div class="block">
                <div class="block-title">🚗 Cómo llegar</div>
                <div class="transport-grid">
                    <div class="transport-item">
                        <div class="transport-icon">🚇</div>
                        <div class="transport-label">Metro</div>
                        <div class="transport-text">
                            Paradas más cercanas:<br>
                            <a href="https://www.metromadrid.es" target="_blank">Sol · Ópera · La Latina</a>
                        </div>
                    </div>
                    <div class="transport-item">
                        <div class="transport-icon">🚕</div>
                        <div class="transport-label">Taxi / VTC</div>
                        <div class="transport-text">
                            <a href="https://www.uber.com" target="_blank">Uber</a> o cualquier taxi — 
                            la mejor opción si venís de lejos
                        </div>
                    </div>
                    <div class="transport-item">
                        <div class="transport-icon">🅿️</div>
                        <div class="transport-label">Parking recomendado</div>
                        <div class="transport-text">
                            <a href="https://maps.google.com/?q=Parking+Plaza+de+Oriente+Madrid" target="_blank">Parking Plaza de Oriente</a> — 
                            aunque podéis elegir el que más os convenga
                        </div>
                    </div>
                    <div class="transport-item">
                        <div class="transport-icon">🚙</div>
                        <div class="transport-label">Etiqueta DGT</div>
                        <div class="transport-text">
                            Comprueba tu etiqueta antes de venir al centro
                        </div>
                    </div>
                </div>

                <div style="margin-top: 16px; font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.8;">
                    <div style="margin-bottom: 8px; font-family: monospace; font-size: 11px; letter-spacing: 1px; color: rgba(255,255,255,0.3); text-transform: uppercase;">Restricciones zona de bajas emisiones</div>
                    <div>🔴 <strong style="color:rgba(255,255,255,0.7)">Sin etiqueta</strong> — no puedes circular por el centro <span class="badge badge-red">Prohibido</span></div>
                    <div>🟠 <strong style="color:rgba(255,255,255,0.7)">Etiqueta B o C</strong> — solo puedes aparcar en parking, no en la calle <span class="badge badge-orange">Solo parking</span></div>
                    <div>🟢 <strong style="color:rgba(255,255,255,0.7)">ECO</strong> — puedes aparcar en la calle con 75% de descuento <span class="badge badge-green">Descuento 75%</span></div>
                    <div>⚡ <strong style="color:rgba(255,255,255,0.7)">Eléctrico</strong> — circulación y aparcamiento gratuito <span class="badge badge-green">Gratis</span></div>
                </div>
            </div>

            <div class="divider"></div>

            <div style="background:rgba(0,136,255,0.07); border:1px solid rgba(0,136,255,0.15); border-left:3px solid #0088ff; border-radius:3px; padding:14px 16px; margin-bottom:16px; font-size:13px; color:rgba(255,255,255,0.7); line-height:1.7;">
            📨 <strong style="color:#0088ff">Por favor, reenvía este email a todos los integrantes de tu grupo</strong> puesto que si estas leyendo esto tú eres su mensajero. Y si ves a alguien del grupo antes del día, recuérdaselo en persona también.
            </div>
        <div style="font-size: 13px; color: rgba(255,255,255,0.4); line-height: 1.8; font-style: italic; text-align: center;">
                ¿Dudas? Escríbenos directamente.
        </div>
        </div>

        <div class="footer">
            <div class="hearts">♥ ♥</div>
            <p>Boda Camilo y Víctor · 22 Mayo 2026<br>Plaza Mayor, Madrid</p>
        </div>
    </div>
</div>
</body>
</html>
`;

module.exports = { emailIndicaciones2026 };
