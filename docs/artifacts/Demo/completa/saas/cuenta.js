/* Vittkly · Cuenta del cliente (Configuraciones → Cuenta Vittkly)
   window.VK_CUENTA_MOUNT(host, O) → secciones: vkplan, vksitio, vkmkt, vkapi, vkdatos, vkseg, vkayuda.
   Lee el catálogo y la suscripción desde el doc compartido vk_plataforma/demo (el mismo del Panel de la plataforma)
   y guarda la configuración propia de la empresa en meta/vittkly (base de la empresa).
   Requiere saas/panel.js cargado antes (window.VK_SAAS). */
(function(){
const K = () => window.VK_SAAS;
const e = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad = n => String(n).padStart(2,'0');
const ahora = () => new Date().toISOString();
const rnd = (n, abc) => { abc = abc || 'abcdefghijkmnpqrstuvwxyz23456789'; let s = ''; const a = new Uint32Array(n); (window.crypto||{}).getRandomValues ? crypto.getRandomValues(a) : a.forEach((_,i)=>a[i]=Math.random()*1e9); a.forEach(x=>{ s += abc[x % abc.length]; }); return s; };
const n0 = n => (Number(n)||0).toLocaleString('es-PE');

const MAP = `:host{display:block;--bg:var(--paper,#F3F8FA);--card:var(--surface,#fff);--sunk:var(--surface-2,#EAF2F6);--line:var(--border-soft,#DDE7EC);--line2:var(--border,#C3D3DB);
  --muted:var(--ink-soft,#52626D);--pri:var(--primary,#157AA8);--pri-h:var(--primary-hover,#0F6A93);--on-pri:var(--on-p,#fff);--pri-ink:var(--primary-ink,#106C97);--pri-soft:var(--primary-soft,#E3F4FB);
  --ok:var(--green,#1E9C78);--ok-ink:var(--green,#146F55);--ok-soft:var(--green-bg,#E2F6EF);--warn:var(--amber,#E39A2A);--warn-ink:var(--amber,#8A5A0B);--warn-soft:var(--amber-bg,#FDF1DC);
  --bad:var(--red,#C0392B);--bad-ink:var(--red,#B3322C);--bad-soft:var(--red-bg,#FDE8E7);--vio-ink:#5B45B0;--vio-soft:var(--slate-bg,#EEEAFB);
  --sh:var(--shadow,0 1px 2px rgba(14,42,59,.06));--sh2:var(--shadow-2,0 18px 50px rgba(14,42,59,.25));--sans:inherit;--mono:"JetBrains Mono",ui-monospace,Menlo,Consolas,monospace;color:var(--ink);font:inherit}`;
const EXTRA = `
.vc{display:flex;flex-direction:column;gap:14px;font-size:.92rem;line-height:1.5;color:var(--ink)}
.vc .card{box-shadow:var(--sh)}
.hero{display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;align-items:flex-start}
.hero h2{font-size:1.15rem;font-weight:800} .big{font-size:1.6rem;font-weight:800;font-variant-numeric:tabular-nums}
.prog{height:10px;border-radius:99px;background:var(--sunk);overflow:hidden} .prog u{display:block;height:100%;background:var(--ok);border-radius:99px}
.chk2{display:flex;gap:10px;align-items:center;border:1px solid var(--line);border-radius:10px;padding:8px 10px}
.chk2 .ic{flex:none;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-size:.72rem;font-weight:800;background:var(--sunk);color:var(--muted)}
.chk2.ok .ic{background:var(--ok-soft);color:var(--ok-ink)} .chk2 span{flex:1} .chk2.ok span{color:var(--muted);text-decoration:line-through}
.lockc{display:flex;gap:12px;align-items:flex-start;background:var(--sunk);border:1px dashed var(--line2);border-radius:12px;padding:12px 14px}
.lockc b{display:block}
.keybox{font-family:var(--mono);font-size:.82rem;background:var(--sunk);border:1px dashed var(--line2);border-radius:10px;padding:10px 12px;word-break:break-all}
pre.code{font-family:var(--mono);font-size:.78rem;background:#0E2A3B;color:#E7F1F6;border-radius:10px;padding:12px;overflow-x:auto;margin:0;white-space:pre}
.ep{display:grid;grid-template-columns:60px 1fr;gap:6px 10px;font-size:.84rem;align-items:baseline} .ep code{font-family:var(--mono);font-size:.8rem}
.mt{display:inline-block;font-family:var(--mono);font-size:.7rem;font-weight:800;border-radius:6px;padding:1px 6px;background:var(--ok-soft);color:var(--ok-ink)} .mt.post{background:var(--pri-soft);color:var(--pri-ink)} .mt.patch{background:var(--warn-soft);color:var(--warn-ink)}
.apps{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px}
.app{border:1px solid var(--line);border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:6px;background:var(--card)}
.app .lg{width:34px;height:34px;border-radius:9px;display:grid;place-items:center;font-weight:800;color:#fff;font-size:.8rem}
.site{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:14px;align-items:start}
.ph{position:sticky;top:12px;width:300px;margin:0 auto;border:10px solid #10283A;border-radius:34px;overflow:hidden;background:#fff;color:#0E2A3B;box-shadow:var(--sh2);font-size:13px;line-height:1.45}
.ph .bar{height:18px;background:#10283A}
.ph .hdr{padding:18px 14px 14px;color:#fff;background:var(--pri)} .ph .hdr b{font-size:16px;display:block} .ph .hdr small{opacity:.9}
.ph .sv{padding:10px 14px;border-bottom:1px solid #E5EDF1;display:flex;justify-content:space-between;gap:8px} .ph .sv span{color:#52626D}
.ph .cta{display:flex;flex-direction:column;gap:8px;padding:12px 14px}
.ph .cta i{font-style:normal;text-align:center;border-radius:10px;padding:9px;font-weight:800;background:var(--pri);color:#fff} .ph .cta i.wa{background:#1FA855}
.ph .ft{padding:8px 14px 14px;color:#7A8A94;font-size:11px;text-align:center}
.ph .rv{padding:8px 14px;color:#8A5A0B;font-size:12px}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px} .stats div{background:var(--sunk);border-radius:10px;padding:8px 10px} .stats b{display:block;font-size:1.1rem;font-variant-numeric:tabular-nums} .stats span{font-size:.72rem;color:var(--muted);font-weight:700}
.stepn{display:flex;gap:8px;align-items:center;font-weight:800} .stepn i{font-style:normal;width:24px;height:24px;border-radius:50%;background:var(--pri);color:var(--on-pri);display:grid;place-items:center;font-size:.8rem}
.drop{border:2px dashed var(--line2);border-radius:12px;padding:18px;text-align:center;color:var(--muted);cursor:pointer;display:block} .drop:hover{border-color:var(--pri);color:var(--pri-ink)}
@media (max-width:1000px){ .site{grid-template-columns:1fr} .ph{position:static} }
@media (max-width:720px){ .stats{grid-template-columns:1fr 1fr} }
`;
const SECS = {
  vkplan:['Mi plan y consumo','Tu suscripción, lo que usas este mes, créditos y el asistente de inicio'],
  vksitio:['Sitio web y reservas','Tu página pública: servicios, pedidos de cotización, reservas y pagos online'],
  vkmkt:['Marketing','Reseñas de Google, campañas, referidos y clientes potenciales de Meta'],
  vkapi:['API e integraciones','Claves de API, webhooks y conexiones con otras herramientas'],
  vkdatos:['Importar y exportar','Trae tus datos desde Excel y llévate una copia completa cuando quieras'],
  vkseg:['Seguridad','Verificación en 2 pasos, sesiones y acceso del soporte de Vittkly'],
  vkayuda:['Ayuda, estado y legal','Tu nivel de soporte, el estado del sistema y los documentos legales']
};
const PASARELAS = ['Culqi','Mercado Pago','Izipay','Niubiz','Openpay'];
const EVENTOS = [['cotizacion.creada','Cotización creada'],['cotizacion.aceptada','Cotización aceptada'],['trabajo.programado','Trabajo programado'],['trabajo.realizado','Trabajo realizado'],['pago.registrado','Pago registrado'],['cliente.creado','Cliente creado'],['reserva.recibida','Reserva desde el sitio']];
const RECURSOS = [
  ['clientes','Clientes',[['GET','/clientes'],['POST','/clientes'],['PATCH','/clientes/{id}']]],
  ['cotizaciones','Cotizaciones',[['GET','/cotizaciones'],['POST','/cotizaciones'],['GET','/cotizaciones/{id}/pdf']]],
  ['trabajos','Trabajos y calendario',[['GET','/trabajos?desde=&hasta='],['PATCH','/trabajos/{id}']]],
  ['finanzas','Pagos',[['GET','/pagos'],['POST','/cotizaciones/{id}/pagos']]],
  ['sunat','Comprobantes',[['GET','/comprobantes'],['POST','/comprobantes']]],
  ['crm','Seguimientos',[['GET','/clientes/{id}/seguimientos'],['POST','/clientes/{id}/seguimientos']]]
];
const APPS = [
  ['zapier','Zapier','#FF4F00','Conecta Vittkly con más de 6,000 aplicaciones sin programar.'],
  ['make','Make','#6D00CC','Automatizaciones visuales: «cuando se acepta una cotización, crea una fila…».'],
  ['sheets','Google Sheets','#0F9D58','Envía clientes, trabajos y pagos a una hoja que se actualiza sola.'],
  ['calendar','Google Calendar','#4285F4','Cada trabajo programado aparece en el calendario del técnico.'],
  ['meta','Meta (Facebook e Instagram)','#1877F2','Los formularios de tus anuncios entran solos al CRM.'],
  ['resenas','Reseñas de Google','#FBBC04','Pide la reseña al terminar cada servicio y mide tu calificación.']
];
function tDef(O){
  const slug = String((O.emp||{}).slug || 'miempresa');
  return { v:1,
    sitio:{ publicado:false, slug, dominio:'', marca:true, titulo:(O.emp||{}).nombre||'Mi empresa', descripcion:(O.emp||{}).rubro ? `${O.emp.rubro} en ${O.emp.ciudad||'Lima'}. Cotiza en minutos y reserva tu fecha.` : 'Cotiza en minutos y reserva tu fecha.',
      whatsapp:true, horario:'Lun a sáb · 8:00 a 18:00', zonas:(O.emp||{}).ciudad || 'Lima Metropolitana', servicios:(O.servicios||[]).slice(0,6).map(s=>s.id),
      reservas:{ activa:true, modo:'cotizacion', anticipacion:2, adelanto:0 }, resenas:true, pasarela:{ prov:'', estado:'desconectada', llave:'' },
      stats:{ visitas:0, solicitudes:0, reservas:0 }, solicitudes:[] },
    mkt:{ resenas:{ auto:true, dias:1, pedidas:0, nuevas:0, promedio:0 }, campanas:[], referidos:{ activo:false, premio:'10% de descuento en tu próximo servicio', codigo:'AMIGO'+rnd(4,'ABCDEFGHJKLMNPQRSTUVWXYZ23456789') }, meta:{ conectado:false, pagina:'', pixel:false, leads:[] } },
    api:{ claves:[], webhooks:[], integraciones:{ resenas:true }, usoHoy:0 },
    datos:{ historial:[] },
    seg:{ mfa:false, mfaEquipo:false, codigos:[], sesiones:null, soporte:{ permitido:false, hasta:null } },
    refVittkly:{ codigo:'VK-'+rnd(6,'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'), invitados:[] }
  };
}
// datos de ejemplo para que la empresa cero se vea en uso
function tDemo(T, O){
  const hoy = K().HOY(), d = n => K().addD(hoy, n);
  T.sitio.publicado = true; T.sitio.stats = { visitas:640, solicitudes:31, reservas:12 };
  T.sitio.solicitudes = [
    { ts:d(0)+'T10:12:00', nombre:'Mariela Torres', tel:'987 222 410', distrito:'Surco', servicio:'Sofá de 3 cuerpos', tipo:'cotizacion' },
    { ts:d(-1)+'T18:40:00', nombre:'Jorge Salinas', tel:'986 115 302', distrito:'Miraflores', servicio:'Colchón 2 plazas', tipo:'reserva', fecha:d(3) },
    { ts:d(-2)+'T09:05:00', nombre:'Paola Quispe', tel:'985 400 771', distrito:'La Molina', servicio:'Alfombra 2×3 m', tipo:'cotizacion' }];
  T.mkt.resenas = { auto:true, dias:1, pedidas:46, nuevas:19, promedio:4.8 };
  T.mkt.campanas = [{ id:'m1', nombre:'Recuerda tu limpieza de 6 meses', seg:'recurrente', canal:'whatsapp', enviados:38, respuestas:9, ventas:4, fecha:d(-12), estado:'enviada', mensaje:'Hola {nombre}, ya pasaron 6 meses desde tu última limpieza…' }];
  T.mkt.referidos.activo = true;
  T.api.claves = [{ id:'k1', nombre:'Hoja de reportes (Google Sheets)', prefijo:'vk_live_8f2k', permisos:['clientes','cotizaciones','trabajos'], escritura:false, creada:d(-40), ultimo:d(0), activa:true }];
  T.api.integraciones = { resenas:true, sheets:true }; T.api.usoHoy = 120;
  T.seg.mfa = true;
  return T;
}

let PEND = null;   // guardado pendiente de la vista anterior: se completa antes de leer de nuevo
window.VK_CUENTA_MOUNT = async function(host, O){
  O = O || {};
  if(PEND){ try{ await PEND(); }catch(err){} PEND = null; }
  const root = host.shadowRoot || host.attachShadow({ mode:'open' });
  root.innerHTML = `<style>${MAP}${K().CSS_BASE}${EXTRA}</style><div class="vc"><p class="sub">Cargando…</p></div>`;
  const toast = O.toast || (m=>console.log(m)), V = K();
  const PDOC = O.raw ? O.raw.collection('vk_plataforma').doc('demo') : null;
  const TDOC = O.db ? O.db.doc('meta/vittkly') : null;
  let P = null, T = null;
  try{ if(PDOC){ const s = await PDOC.get(); if(s.exists){ const d = s.data(); P = d && d.json ? JSON.parse(d.json) : null; } } }catch(err){}
  if(!P || P.v!==2) P = V.semilla({ empresas:O.empresas||[] });
  if(V.migrar) V.migrar(P);
  try{ if(TDOC){ const s = await TDOC.get(); if(s.exists){ const d = s.data(); T = d && d.json ? JSON.parse(d.json) : null; } } }catch(err){}
  if(!T){ T = tDef(O); if(O.emp && O.emp.esVK) tDemo(T, O); }
  // la empresa en el catálogo de la plataforma
  let C = O.emp && O.emp.esVK ? P.clientes.find(c=>c.real) : P.clientes.find(c=>c.empId===(O.emp||{}).id);
  if(!C){ const hoy = V.HOY(); C = { id:'e_'+((O.emp||{}).id||rnd(6)), empId:(O.emp||{}).id, real:true, nombre:(O.emp||{}).nombre||'Mi empresa', titular:O.titular||'Administrador', correo:O.correo||'—', cel:'—', rubro:(O.emp||{}).rubro||'Servicios', ciudad:(O.emp||{}).ciudad||'Lima', plan:(P.reglas||{}).planPrueba||'empresa', ciclo:'mensual', estado:'prueba', alta:hoy, pruebaFin:V.addD(hoy, (P.reglas||{}).prueba||30), usuarios:1, empresas:[(O.emp||{}).nombre||'Mi empresa'], descuentos:[], modulosExtra:[], notas:[], timeline:[{ ts:ahora(), t:'Se registró y empezó la prueba' }], precioFijo:null, metodo:'sin tarjeta', servicios:0, ultimo:'Hoy', salud:60, consumo:{ wa:0, sunat:0, apiHoy:0, creditosUsados:0, creditosExtra:0 }, addons:[], integraciones:[], sitio:{ publicado:false, slug:T.sitio.slug }, mfa:false, legal:{ version:null, aceptado:null } }; P.clientes.unshift(C); }
  // consumo real de la empresa
  const M = O.metricas || {};
  C.consumo = C.consumo || {};
  if(M.comprobantesMes!=null) C.consumo.sunat = M.comprobantesMes;
  if(M.usuarios) C.usuarios = M.usuarios;
  if(M.serviciosMes!=null) C.servicios = M.serviciosMes;
  C.sitio = { ...(C.sitio||{}), publicado:T.sitio.publicado, slug:T.sitio.slug, dominio:T.sitio.dominio, ...T.sitio.stats };
  C.integraciones = Object.keys(T.api.integraciones).filter(k=>T.api.integraciones[k]).concat(T.api.webhooks.length?['webhooks']:[]);
  C.mfa = !!T.seg.mfa; C.consumo.apiHoy = T.api.usoHoy;

  let tP = null, tT = null, sucioP = false, sucioT = false;
  const escP = async () => { clearTimeout(tP); if(!sucioP) return; sucioP = false; if(PDOC) try{ await PDOC.set({ json:JSON.stringify(P), actualizado:ahora() }); }catch(err){ console.warn(err); } };
  const escT = async () => { clearTimeout(tT); if(!sucioT) return; sucioT = false; if(TDOC) try{ await TDOC.set({ json:JSON.stringify(T), actualizado:ahora() }); }catch(err){ console.warn(err); toast('No se pudo guardar. Revisa tu conexión.'); } };
  const flush = () => Promise.all([escP(), escT()]);
  const guardarP = () => { sucioP = true; PEND = flush; clearTimeout(tP); tP = setTimeout(escP, 400); };
  const guardarT = () => { sucioT = true; PEND = flush; clearTimeout(tT); tT = setTimeout(escT, 400); };
  const syncC = () => { C.sitio = { ...(C.sitio||{}), publicado:T.sitio.publicado, slug:T.sitio.slug, dominio:T.sitio.dominio, ...T.sitio.stats }; C.integraciones = Object.keys(T.api.integraciones).filter(k=>T.api.integraciones[k]).concat(T.api.webhooks.length?['webhooks']:[]); C.mfa = !!T.seg.mfa; C.consumo.apiHoy = T.api.usoHoy; };
  const tlP = (t, accion) => { C.timeline = C.timeline||[]; C.timeline.unshift({ ts:ahora(), t:`${t} · ${O.usuario||'Administrador'}` }); P.auditoria.unshift({ ts:ahora(), quien:`${O.usuario||'Administrador'} (cliente)`, rol:'', accion:accion||t, cli:C.id, det:t }); };

  let SEC = O.sec || 'vkplan', modalSt = null;
  const plan = () => V.planDe(P, C.plan), mods = () => V.modsCli(P, C), cuo = () => V.cuotasCli(P, C), cred = () => V.creditosCli(P, C);
  const tiene = m => mods().has(m);
  const bar = (l, u, q, sub) => { if(!q) return `<div class="ub"><div><span>${l}</span><b class="num">${n0(u)}</b></div>${sub?`<small class="sub">${sub}</small>`:''}</div>`; const pct = Math.min(100, Math.round((u||0)/q*100)); return `<div class="ub ${pct>=100?'r':pct>=80?'w':''}"><div><span>${l}</span><b class="num">${n0(u)} / ${n0(q)}</b></div><i><u style="width:${pct}%"></u></i>${sub?`<small class="sub">${sub}</small>`:''}</div>`; };
  const pill = (t, c) => `<span class="pill ${c||''}">${e(t)}</span>`;
  const head = () => `<div class="card"><div class="ch" style="margin:0"><div><h2>${e(SECS[SEC][0])}</h2><p>${e(SECS[SEC][1])}</p></div>${C.estado==='prueba' ? pill(`Prueba gratis · ${Math.max(0,V.dias(V.HOY(),C.pruebaFin))} días`, 'in') : pill(`Plan ${plan().nombre}`, 'ok')}</div></div>`;
  const lock = (mod, txt) => { const a = P.addons.find(x=>x.modulo===mod && (!x.planes || x.planes.includes(C.plan))); const up = P.planes.filter(p=>p.activo && p.modulos.includes(mod)).sort((x,y)=>x.mensual-y.mensual)[0];
    return `<div class="lockc"><span aria-hidden="true">🔒</span><div style="flex:1"><b>${e(txt)}</b><span class="sub">${a ? `Actívalo como complemento por ${V.S(a.precio)} ${e(a.unidad)}.` : up ? `Está incluido desde el plan ${e(up.nombre)} (${V.S(up.mensual)} al mes).` : ''}</span></div>${a ? `<button class="btn s p" data-a="addon" data-id="${a.id}">Activar</button>` : up ? `<button class="btn s p" data-a="plan-cambiar">Ver planes</button>` : ''}</div>`; };

  /* ---------------- Mi plan y consumo ---------------- */
  function sPlan(){
    const p = plan(), pr = V.precioCli(P, C), q = cuo(), cr = cred(), x = C.consumo||{};
    const checks = (O.checks||[]).concat([{ id:'sitio', l:'Publica tu sitio web y recibe pedidos', ok:T.sitio.publicado, sec:'vksitio' }]);
    const okN = checks.filter(c=>c.ok).length;
    const legalPend = P.legal.docs.filter(d=>d.obligatorio).some(d=>!C.legal || C.legal.version!==d.version);
    const fac = P.facturas.filter(f=>f.cliente===C.id).slice(0,6);
    const ads = P.addons.filter(a=>!a.auto && !a.unico);
    const prox = C.estado==='prueba' ? `La prueba termina el ${V.fF(C.pruebaFin)}` : C.prox ? `Próximo cobro: ${V.fF(C.prox)}` : '';
    return `${legalPend ? `<div class="note wa"><b>Actualizamos nuestros términos.</b> Revísalos y acéptalos en <button class="btn s g" data-a="go" data-id="vkayuda">Ayuda, estado y legal</button>.</div>` : ''}
    <div class="card"><div class="hero"><div><p class="sec">Tu plan</p><h2>${e(p.nombre)} ${C.estado!=='activa'?pill((V.ESTADOS[C.estado]||[C.estado])[0], (V.ESTADOS[C.estado]||['',''])[1]):''}</h2><p class="sub">${e(p.lema)}</p><p class="sub" style="margin-top:4px">${e(prox)}${C.ciclo==='anual'?' · pago anual':''}</p></div>
      <div style="text-align:right"><div class="big">${V.S(pr.total)}</div><p class="sub">al mes con IGV${pr.lineas.length?` · antes ${V.S(pr.lista)}`:''}</p>${pr.lineas.map(l=>`<p class="sub">${e(l.d.nombre)}: −${V.S(l.m)}</p>`).join('')}</div></div>
      <div class="row" style="margin-top:12px"><button class="btn p" data-a="plan-cambiar">${C.estado==='prueba'?'Elegir mi plan':'Cambiar de plan'}</button>${C.estado!=='prueba' && C.ciclo!=='anual' ? `<button class="btn" data-a="plan-anual">Pasar a pago anual (paga ${P.reglas.mesesAnual} meses)</button>` : ''}<button class="btn g" data-a="plan-pausa">Pausar o cancelar</button></div></div>
    <div class="card"><div class="ch"><div><h2>Tu empresa lista en 10 minutos</h2><p>${okN} de ${checks.length} pasos · las empresas que completan estos pasos en la primera semana sacan mucho más provecho de Vittkly</p></div></div>
      <div class="prog" style="margin-bottom:12px"><u style="width:${Math.round(okN/checks.length*100)}%"></u></div>
      <div class="grid g2" style="gap:8px">${checks.map((c,i)=>`<div class="chk2 ${c.ok?'ok':''}"><span class="ic">${c.ok?'✓':i+1}</span><span>${e(c.l)}</span>${c.ok?'':`<button class="btn s" data-a="${c.sec?'go':'ir'}" data-id="${e(c.sec||c.ir)}">Ir</button>`}</div>`).join('')}</div></div>
    <div class="grid g2">
      <div class="card"><div class="ch"><div><h2>Consumo de este mes</h2><p>Si pasas un tope no se corta nada: se descuentan créditos.</p></div></div>
        <div class="grid" style="gap:12px">${bar('Usuarios', C.usuarios||1, p.usuarios, (C.usuarios||1)>p.usuarios ? `${(C.usuarios||1)-p.usuarios} adicional(es) a ${V.S((P.addons.find(a=>a.id==='usuario')||{}).precio)} c/u` : '')}
        ${bar('WhatsApp automáticos', x.wa||0, q.wa, 'Los mensajes con un clic y los correos son ilimitados')}
        ${q.sunat ? bar('Comprobantes SUNAT', x.sunat||0, q.sunat) : `<div class="ub"><div><span>Comprobantes SUNAT</span><b>No incluido</b></div><small class="sub">Actívalo abajo como complemento.</small></div>`}
        ${bar('API · llamadas hoy', x.apiHoy||0, q.api)}</div></div>
      <div class="card"><div class="ch"><div><h2>Créditos Vittkly</h2><p>Un solo saldo para campañas, WhatsApp y comprobantes extra. ${e(P.creditos.vencen)}</p></div></div>
        <div class="big">${n0(cr.saldo)} <small class="sub" style="font-size:.9rem">créditos</small></div>
        <div class="calc" style="margin-top:8px"><div><span>Incluidos en tu plan este mes</span><b>${n0(cr.plan)}</b></div><div><span>Comprados o regalados</span><b>${n0(cr.extra)}</b></div><div><span>Usados</span><b>−${n0(cr.usados)}</b></div></div>
        <p class="sec" style="margin-top:12px">Cuánto usa cada cosa</p><ul class="lst">${P.creditos.equiv.map(z=>`<li><span>${e(z.l)}</span><b class="num">${z.c}</b></li>`).join('')}</ul>
        <div class="row" style="margin-top:10px">${P.addons.filter(a=>a.unico).map(a=>`<button class="btn s" data-a="cred-comprar" data-id="${a.id}">+ ${n0(a.creditos)} por ${V.S(a.precio)}</button>`).join('')}</div></div>
    </div>
    <div class="grid g2">
      <div class="card"><div class="ch"><div><h2>Qué incluye tu plan</h2><p>${C.estado==='prueba'?'Durante la prueba tienes todo abierto.':'Módulos activos en tu cuenta'}</p></div></div>
        <div class="mods">${P.modulos.filter(m=>mods().has(m.id)).map(m=>pill(m.l,'ok')).join('')}</div>
        ${P.modulos.some(m=>!mods().has(m.id)) ? `<p class="sec" style="margin-top:12px">No incluidos</p><div class="mods">${P.modulos.filter(m=>!mods().has(m.id)).map(m=>pill(m.l)).join('')}</div>` : ''}</div>
      <div class="card"><div class="ch"><div><h2>Complementos</h2><p>Se suman a tu mensualidad; puedes quitarlos cuando quieras.</p></div></div>
        <ul class="lst">${ads.map(a=>{ const inc = p.modulos.includes(a.modulo), ok = !a.planes || a.planes.includes(C.plan), on = (C.addons||[]).includes(a.id);
          return `<li><div><b>${e(a.l)}</b><small>${inc ? 'Ya está incluido en tu plan' : ok ? `${V.S(a.precio)} ${e(a.unidad)}` : `Para el plan ${a.planes.map(id=>V.planDe(P,id).nombre).join(', ')}`}</small></div>${inc ? pill('Incluido','ok') : ok ? `<button class="btn s ${on?'':'p'}" data-a="addon" data-id="${a.id}">${on?'Quitar':'Activar'}</button>` : pill('No aplica')}</li>`; }).join('')}</ul></div>
    </div>
    <div class="grid g2">
      <div class="card"><div class="ch"><div><h2>Facturas de Vittkly</h2><p>Lo que pagas por tu suscripción</p></div></div>
        ${fac.length ? `<ul class="lst">${fac.map(f=>`<li><div><b>${e(f.numero)}</b><small>${V.fF(f.fecha)} · ${e(f.metodo)}</small></div><span class="num">${V.S(f.monto)}</span>${pill({pagada:'Pagada',fallida:'Rechazada',vencida:'Vencida',reembolsada:'Reembolsada'}[f.estado]||f.estado, f.estado==='pagada'?'ok':'wa')}</li>`).join('')}</ul>` : `<p class="sub">${pr.total===0 && C.estado!=='prueba' ? 'Tu cuenta no tiene cobros (cortesía).' : 'Todavía no hay facturas.'}</p>`}
        <p class="sub" style="margin-top:8px">Método de pago: <b>${e(C.metodo)}</b> · <button class="btn s g" data-a="metodo">Cambiar</button></p></div>
      <div class="card"><div class="ch"><div><h2>Recomienda Vittkly</h2><p>${e(P.referidos.premioQuien)}. La empresa que invitas recibe ${e(P.referidos.premioNuevo)}.</p></div></div>
        <div class="keybox">https://vittkly.com/r/${e(T.refVittkly.codigo)}</div>
        <div class="row" style="margin-top:8px"><button class="btn s p" data-a="copiar" data-id="https://vittkly.com/r/${e(T.refVittkly.codigo)}">Copiar enlace</button><button class="btn s" data-a="ref-invitar">Invitar por WhatsApp</button></div>
        ${T.refVittkly.invitados.length ? `<ul class="lst" style="margin-top:10px">${T.refVittkly.invitados.map(i=>`<li><span>${e(i.nombre)}</span>${pill(i.estado,'in')}</li>`).join('')}</ul>` : '<p class="sub" style="margin-top:8px">Aún no invitaste a nadie.</p>'}</div>
    </div>`;
  }

  /* ---------------- Sitio web y reservas ---------------- */
  function sSitio(){
    const S = T.sitio, q = cuo(), dom = q.sitio!=='marca', serv = (O.servicios||[]);
    const url = S.dominio && dom ? S.dominio : `${S.slug}.vittkly.com`;
    const elegidos = serv.filter(x=>S.servicios.includes(x.id));
    const inp = (k,l,ph,max) => `<div class="f"><label>${l}</label><input type="text" data-f="s" data-id="${k}" value="${e(S[k]||'')}" placeholder="${e(ph||'')}" maxlength="${max||80}"></div>`;
    return `<div class="card"><div class="hero"><div><p class="sec">Tu sitio</p><h2>${e(url)} ${S.publicado?pill('Publicado','ok'):pill('Sin publicar')}</h2><p class="sub">Así te encuentran, piden cotización o reservan una fecha. Todo entra solo a tu Central.</p></div>
      <div class="row"><button class="btn" data-a="sitio-ver">Ver mi sitio</button><button class="btn ${S.publicado?'':'p'}" data-a="sitio-pub">${S.publicado?'Despublicar':'Publicar sitio'}</button></div></div>
      <div class="stats" style="margin-top:12px"><div><b>${n0(S.stats.visitas)}</b><span>Visitas del mes</span></div><div><b>${n0(S.stats.solicitudes)}</b><span>Solicitudes</span></div><div><b>${n0(S.stats.reservas)}</b><span>Reservas</span></div><div><b>${S.stats.solicitudes?Math.round(S.stats.reservas/S.stats.solicitudes*100):0}%</b><span>Conversión</span></div></div></div>
    <div class="site"><div class="grid" style="gap:14px">
      <div class="card"><p class="sec">Dirección</p>
        <div class="fr"><div class="f"><label>Subdominio gratis</label><div class="row" style="flex-wrap:nowrap"><input type="text" data-f="s" data-id="slug" value="${e(S.slug)}" maxlength="30" aria-label="Subdominio"><span class="sub">.vittkly.com</span></div></div>
          <div class="f"><label>Dominio propio</label><input type="text" data-f="s" data-id="dominio" value="${e(S.dominio)}" placeholder="reservas.tuempresa.pe" ${dom?'':'disabled'}>${dom ? `<small>Crea un registro CNAME que apunte a <code class="cd">sitios.vittkly.com</code>.</small>` : ''}</div></div>
        ${dom ? `<label class="chk" style="margin-top:10px"><input type="checkbox" data-f="s" data-id="marca" ${S.marca?'checked':''}> Mostrar «Hecho con Vittkly» al pie</label>` : `<div style="margin-top:10px">${lock('dominio','Dominio propio y sitio sin la marca Vittkly')}</div>`}</div>
      <div class="card"><p class="sec">Contenido</p>
        <div class="fr">${inp('titulo','Nombre que se muestra','',60)}${inp('horario','Horario de atención','Lun a sáb · 8:00 a 18:00',60)}</div>
        <div class="f" style="margin-top:10px"><label>Descripción</label><textarea data-f="s" data-id="descripcion" maxlength="240">${e(S.descripcion)}</textarea></div>
        <div class="fr" style="margin-top:10px">${inp('zonas','Zonas de atención','Lima Metropolitana',80)}</div>
        <div class="row" style="margin-top:10px"><label class="chk"><input type="checkbox" data-f="s" data-id="whatsapp" ${S.whatsapp?'checked':''}> Botón de WhatsApp</label><label class="chk"><input type="checkbox" data-f="s" data-id="resenas" ${S.resenas?'checked':''}> Mostrar mis reseñas de Google</label></div></div>
      <div class="card"><p class="sec">Servicios que se muestran (${elegidos.length})</p>
        ${serv.length ? `<div class="grid" style="gap:6px;max-height:280px;overflow:auto">${serv.map(x=>`<label class="chk"><input type="checkbox" data-f="sv" data-id="${e(x.id)}" ${S.servicios.includes(x.id)?'checked':''}> ${e(x.nombre)}${x.desde?` <span class="sub">· desde ${V.S(x.desde)}</span>`:''}</label>`).join('')}</div>` : '<p class="sub">Primero crea tu lista de servicios en Mis tarifarios.</p>'}</div>
      <div class="card"><p class="sec">Pedidos y reservas online</p>
        <label class="chk"><input type="checkbox" data-f="r" data-id="activa" ${S.reservas.activa?'checked':''}> Recibir pedidos desde el sitio</label>
        <div class="fr" style="margin-top:10px"><div class="f"><label>Qué puede hacer el cliente</label><select data-f="r" data-id="modo"><option value="cotizacion" ${S.reservas.modo==='cotizacion'?'selected':''}>Pedir cotización</option><option value="reserva" ${S.reservas.modo==='reserva'?'selected':''}>Pedir cotización o reservar fecha</option></select></div>
          <div class="f"><label>Anticipación mínima (días)</label><input type="number" min="0" max="30" data-f="r" data-id="anticipacion" value="${S.reservas.anticipacion}"></div>
          <div class="f"><label>Adelanto al reservar %</label><input type="number" min="0" max="100" data-f="r" data-id="adelanto" value="${S.reservas.adelanto}" ${S.pasarela.estado==='conectada'?'':'disabled'}><small>${S.pasarela.estado==='conectada'?'Se cobra con tu pasarela':'Conecta tu pasarela para cobrar adelantos'}</small></div></div>
        <p class="note" style="margin-top:10px">Cada pedido entra a tu Central como cotización pendiente con origen «Sitio web», y te llega un aviso.</p></div>
      <div class="card"><p class="sec">Cobro online con tu pasarela</p>
        <p class="sub" style="margin-bottom:10px">Conecta tu propia cuenta: el dinero va directo a ti. Vittkly no cobra comisión.</p>
        <div class="fr"><div class="f"><label>Pasarela</label><select data-f="pg" data-id="prov"><option value="">Elegir…</option>${PASARELAS.map(x=>`<option ${S.pasarela.prov===x?'selected':''}>${x}</option>`).join('')}</select></div><div class="f"><label>Llave pública</label><input type="text" data-f="pg" data-id="llave" value="${e(S.pasarela.llave)}" placeholder="pk_live_…" maxlength="80"></div></div>
        <div class="row" style="margin-top:10px">${S.pasarela.estado==='conectada' ? `${pill(`${S.pasarela.prov} conectada`,'ok')}<button class="btn s g" data-a="pg-off">Desconectar</button>` : `<button class="btn s p" data-a="pg-on">Conectar</button>`}<span class="sub">También sirve para el link de pago de cada cotización.</span></div></div>
      <div class="card"><p class="sec">Últimas solicitudes desde tu sitio</p>
        ${S.solicitudes.length ? `<ul class="lst">${S.solicitudes.map((r,i)=>`<li><div><b>${e(r.nombre)} · ${e(r.servicio)}</b><small>${V.fTs(r.ts)} · ${e(r.distrito)} · ${r.tipo==='reserva'?`reservó para el ${V.fF(r.fecha)}`:'pidió cotización'}</small></div><button class="btn s" data-a="sol-cotizar" data-id="${i}">Cotizar</button></li>`).join('')}</ul>` : '<p class="sub">Todavía no hay solicitudes. Comparte tu enlace en tus redes y en tu WhatsApp.</p>'}</div>
    </div>
    <div>${telefono()}</div></div>`;
  }
  function telefono(){
    const S = T.sitio, serv = (O.servicios||[]).filter(x=>S.servicios.includes(x.id)).slice(0,6);
    return `<div class="ph" aria-label="Vista previa del sitio"><div class="bar"></div><div class="hdr">${O.emp&&O.emp.logo?`<img src="${e(O.emp.logo)}" alt="" style="height:30px;background:#fff;border-radius:6px;padding:3px;margin-bottom:8px">`:''}<b>${e(S.titulo)}</b><small>${e(S.descripcion)}</small></div>
      ${S.resenas ? `<div class="rv">★★★★★ ${T.mkt.resenas.promedio||'4.9'} · ${T.mkt.resenas.nuevas||'Nuevas'} reseñas en Google</div>` : ''}
      ${serv.map(x=>`<div class="sv"><b>${e(x.nombre)}</b><span>${x.desde?`desde ${V.S(x.desde)}`:''}</span></div>`).join('') || '<div class="sv"><span>Elige los servicios que se muestran</span></div>'}
      <div class="cta">${S.reservas.activa ? `<i>${S.reservas.modo==='reserva'?'Reservar fecha':'Pedir cotización'}</i>` : ''}${S.whatsapp ? '<i class="wa">Escríbenos por WhatsApp</i>' : ''}</div>
      <div class="ft">${e(S.horario)} · ${e(S.zonas)}${S.marca || cuo().sitio==='marca' ? '<br>Hecho con Vittkly' : ''}</div></div>`;
  }

  /* ---------------- Marketing ---------------- */
  function sMkt(){
    const R = T.mkt, mk = tiene('marketing'), segs = O.segmentos || [];
    return `<div class="card"><div class="ch"><div><h2>Reseñas de Google</h2><p>Incluido en todos los planes. Se pide la reseña al terminar cada servicio, junto con la encuesta de post venta.</p></div>${O.resenaUrl ? pill('Enlace configurado','ok') : pill('Falta el enlace','wa')}</div>
      <div class="stats"><div><b>${n0(R.resenas.pedidas)}</b><span>Pedidas este mes</span></div><div><b>${n0(R.resenas.nuevas)}</b><span>Reseñas nuevas</span></div><div><b>${R.resenas.pedidas?Math.round(R.resenas.nuevas/R.resenas.pedidas*100):0}%</b><span>Respondieron</span></div><div><b>${R.resenas.promedio||'—'}</b><span>Calificación</span></div></div>
      <div class="row" style="margin-top:10px"><label class="chk"><input type="checkbox" data-f="mr" data-id="auto" ${R.resenas.auto?'checked':''}> Pedirla automáticamente</label><span class="sub">${O.resenaUrl?e(String(O.resenaUrl).replace(/^https?:\/\//,'')):''}</span><button class="btn s" data-a="ir" data-id="cfg:postventa">Configurar enlace y mensaje</button></div></div>
    ${mk ? '' : lock('marketing','Campañas, referidos y conexión con Meta')}
    <div class="card" ${mk?'':'style="opacity:.6"'}><div class="ch"><div><h2>Campañas</h2><p>Mensajes a un grupo de tus clientes. Cada WhatsApp de campaña usa ${(P.creditos.equiv.find(z=>z.id==='wa_mkt')||{}).c} créditos. Tienes ${n0(cred().saldo)}.</p></div><button class="btn p" data-a="camp-new" ${mk?'':'disabled'}>+ Nueva campaña</button></div>
      ${R.campanas.length ? `<div class="tw"><table class="rs"><thead><tr><th>Campaña</th><th>Para</th><th class="r">Enviados</th><th class="r">Respuestas</th><th class="r">Ventas</th><th>Estado</th></tr></thead><tbody>${R.campanas.map(k=>`<tr><td class="nl"><b>${e(k.nombre)}</b><br><small class="sub">${V.fF(k.fecha)} · ${k.canal==='whatsapp'?'WhatsApp':'Correo'}</small></td><td data-l="Para">${e((segs.find(s=>s.id===k.seg)||{}).l||k.seg)}</td><td data-l="Enviados" class="r num">${k.enviados}</td><td data-l="Respuestas" class="r num">${k.respuestas}</td><td data-l="Ventas" class="r num">${k.ventas}</td><td data-l="Estado">${pill(k.estado==='enviada'?'Enviada':'Programada', k.estado==='enviada'?'ok':'in')}</td></tr>`).join('')}</tbody></table></div>` : '<p class="sub">Aún no hay campañas. Una buena primera: recordar la limpieza a quienes compraron hace 6 meses.</p>'}</div>
    <div class="grid g2">
      <div class="card" ${mk?'':'style="opacity:.6"'}><div class="ch"><div><h2>Referidos de tus clientes</h2><p>Tus clientes comparten su enlace; quien llega y contrata obtiene el premio.</p></div><label class="chk"><input type="checkbox" data-f="mf" data-id="activo" ${R.referidos.activo?'checked':''} ${mk?'':'disabled'}> Activo</label></div>
        <div class="f"><label>Premio</label><input type="text" data-f="mf" data-id="premio" value="${e(R.referidos.premio)}" maxlength="80" ${mk?'':'disabled'}></div>
        <p class="sub" style="margin-top:8px">Código de ejemplo: <code class="cd">${e(R.referidos.codigo)}</code> · se agrega solo al mensaje de agradecimiento de post venta.</p></div>
      <div class="card" ${mk?'':'style="opacity:.6"'}><div class="ch"><div><h2>Meta: Facebook e Instagram</h2><p>Los formularios de tus anuncios entran solos a tu CRM con origen «Meta».</p></div>${R.meta.conectado?pill('Conectado','ok'):pill('Sin conectar')}</div>
        ${R.meta.conectado ? `<p class="sub">Página: <b>${e(R.meta.pagina)}</b></p><label class="chk" style="margin-top:8px"><input type="checkbox" data-f="mm" data-id="pixel" ${R.meta.pixel?'checked':''}> Enviar ventas a Meta para medir tus anuncios (API de conversiones)</label>
          ${R.meta.leads.length ? `<ul class="lst" style="margin-top:10px">${R.meta.leads.map(l=>`<li><div><b>${e(l.nombre)}</b><small>${V.fTs(l.ts)} · ${e(l.form)}</small></div>${pill('En el CRM','in')}</li>`).join('')}</ul>` : ''}
          <div class="row" style="margin-top:10px"><button class="btn s g" data-a="meta-off">Desconectar</button></div>` : `<button class="btn p" data-a="meta-on" ${mk?'':'disabled'}>Conectar con Facebook</button>`}</div>
    </div>`;
  }

  /* ---------------- API e integraciones ---------------- */
  function sApi(){
    const A = T.api, q = cuo(), wh = tiene('webhooks');
    return `<div class="card"><div class="hero"><div><h2>Tu acceso a la API</h2><p class="sub">Incluida en todos los planes. Cada clave solo ve los módulos de tu plan.</p></div><div style="min-width:240px">${bar('Llamadas hoy', A.usoHoy, q.api, 'Se reinicia cada día a medianoche')}</div></div></div>
    <div class="card"><div class="ch"><div><h2>Claves de API</h2><p>Úsalas en tus sistemas o con un programador. Guárdalas como una contraseña.</p></div><button class="btn p" data-a="key-new">+ Crear clave</button></div>
      ${A.claves.length ? `<div class="tw"><table class="rs"><thead><tr><th>Nombre</th><th>Clave</th><th>Permisos</th><th>Último uso</th><th></th></tr></thead><tbody>${A.claves.map(k=>`<tr><td class="nl"><b>${e(k.nombre)}</b><br><small class="sub">Creada ${V.fF(k.creada)}</small></td><td data-l="Clave"><code class="cd">${e(k.prefijo)}…</code></td><td data-l="Permisos">${k.permisos.map(m=>pill((P.modulos.find(x=>x.id===m)||{l:m}).l,'in')).join(' ')} ${pill(k.escritura?'Lectura y escritura':'Solo lectura')}</td><td data-l="Último uso">${k.ultimo?V.fF(k.ultimo):'Nunca'}</td><td data-l="">${k.activa?`<button class="btn s d" data-a="key-off" data-id="${k.id}">Revocar</button>`:pill('Revocada','r')}</td></tr>`).join('')}</tbody></table></div>` : '<p class="sub">No tienes claves todavía.</p>'}</div>
    <div class="card"><div class="ch"><div><h2>Webhooks</h2><p>Vittkly avisa a tu sistema al instante cuando algo pasa. Reintenta 5 veces si tu sistema no responde.</p></div>${wh?'<button class="btn p" data-a="wh-new">+ Agregar webhook</button>':''}</div>
      ${wh ? (A.webhooks.length ? `<ul class="lst">${A.webhooks.map(w=>`<li><div><b>${e(w.url)}</b><small>${w.eventos.map(x=>(EVENTOS.find(z=>z[0]===x)||[,x])[1]).join(' · ')}</small>${(w.log||[]).slice(0,2).map(l=>`<small>${V.fTs(l.ts)} · ${e(l.evento)} · <b style="color:${l.ok?'var(--ok-ink)':'var(--bad-ink)'}">${l.ok?'200 OK':'Error'}</b></small>`).join('')}</div><div class="row"><button class="btn s" data-a="wh-test" data-id="${w.id}">Enviar prueba</button><button class="btn s g" data-a="wh-del" data-id="${w.id}">Quitar</button></div></li>`).join('')}</ul>` : '<p class="sub">No tienes webhooks.</p>') : lock('webhooks','Webhooks')}</div>
    <div class="card"><div class="ch"><div><h2>Integraciones listas</h2><p>Conéctalas sin programar</p></div></div>
      <div class="apps">${APPS.map(([id,l,col,d])=>{ const on = !!A.integraciones[id], blk = id==='meta' && !tiene('marketing'); return `<div class="app"><div class="row"><span class="lg" style="background:${col}">${e(l.slice(0,2))}</span><b style="flex:1">${e(l)}</b>${on?pill('Conectada','ok'):''}</div><p class="sub">${e(d)}</p><div>${blk ? '<span class="sub">Requiere Marketing</span>' : `<button class="btn s ${on?'g':'p'}" data-a="app" data-id="${id}">${on?'Desconectar':'Conectar'}</button>`}</div></div>`; }).join('')}</div></div>
    <div class="card"><div class="ch"><div><h2>Documentación</h2><p>Para tu programador</p></div></div>
      <pre class="code">curl https://api.vittkly.com/v1/clientes \\
  -H "Authorization: Bearer vk_live_TU_CLAVE"</pre>
      <p class="sub" style="margin:10px 0 6px">Respuestas en JSON, paginadas de 100 en 100. Si pasas tu límite diario recibes el error 429 hasta el día siguiente.</p>
      <div class="grid g2" style="gap:12px">${RECURSOS.map(([m,l,eps])=>{ const ok = tiene(m); return `<div style="${ok?'':'opacity:.5'}"><p class="sec">${e(l)} ${ok?'':'· no incluido en tu plan'}</p><div class="ep">${eps.map(([mt,pth])=>`<span class="mt ${mt.toLowerCase()}">${mt}</span><code>${e(pth)}</code>`).join('')}</div></div>`; }).join('')}</div></div>`;
  }

  /* ---------------- Importar y exportar ---------------- */
  let IMP = null;
  function sDatos(){
    const H = T.datos.historial;
    return `<div class="card"><div class="ch"><div><h2>Importar clientes desde Excel</h2><p>Trae tu lista de clientes en minutos. Los que ya existen (mismo celular o DNI/RUC) no se duplican: solo se completan los datos vacíos.</p></div></div>
      <div class="grid" style="gap:14px">
        <div><p class="stepn"><i>1</i> Descarga la plantilla y llénala</p><div class="row" style="margin-top:6px"><button class="btn s" data-a="plantilla">Descargar plantilla Excel</button><span class="sub">Columnas: Nombre, Celular, Correo, DNI/RUC, Dirección, Distrito, Origen. También sirve tu propio Excel con esos títulos.</span></div></div>
        <div><p class="stepn"><i>2</i> Sube tu archivo</p><label class="drop" style="margin-top:6px"><input type="file" accept=".xlsx,.xls,.csv" data-f="file" hidden>${IMP&&IMP.archivo?`📄 ${e(IMP.archivo)} · ${IMP.filas.length} filas — toca para cambiar`:'Toca para elegir un archivo .xlsx o .csv'}</label></div>
        ${IMP && IMP.filas ? impPreview() : ''}
      </div></div>
    <div class="grid g2">
      <div class="card"><div class="ch"><div><h2>Otros datos</h2><p>Lo hacemos por ti, incluido en tu plan</p></div></div>
        <ul class="lst"><li><div><b>Tarifario o lista de precios</b><small>Desde tu Excel o PDF actual</small></div><button class="btn s" data-a="ayuda-imp" data-id="tarifario">Enviar archivo</button></li><li><div><b>Historial de trabajos y cobros</b><small>Para no perder tus números de años anteriores</small></div><button class="btn s" data-a="ayuda-imp" data-id="historial">Enviar archivo</button></li></ul></div>
      <div class="card"><div class="ch"><div><h2>Exportar todo</h2><p>Tus datos son tuyos. Descarga una copia completa cuando quieras, aunque canceles.</p></div></div>
        <p class="sub">Un Excel con tus clientes, cotizaciones y trabajos, y pagos.</p>
        <div class="row" style="margin-top:10px"><button class="btn p" data-a="exportar">Descargar copia completa</button></div></div>
    </div>
    <div class="card"><div class="ch"><div><h2>Historial</h2><p>Importaciones y exportaciones de tu empresa</p></div></div>
      ${H.length ? `<ul class="tl">${H.slice(0,15).map(h=>`<li><span>${V.fTs(h.ts)}</span><div>${e(h.detalle)}</div></li>`).join('')}</ul>` : '<p class="sub">Sin movimientos.</p>'}</div>`;
  }
  function impPreview(){
    const F = IMP.filas, nuevos = F.filter(r=>r._st==='nuevo').length, ex = F.filter(r=>r._st==='existe').length, er = F.filter(r=>r._st==='error').length;
    return `<div><p class="stepn"><i>3</i> Revisa e importa</p>
      <div class="row" style="margin:8px 0">${pill(`${nuevos} nuevos`,'ok')}${pill(`${ex} ya existen (se completan)`,'in')}${er?pill(`${er} sin nombre (se omiten)`,'r'):''}</div>
      <div class="tw"><table class="rs"><thead><tr><th>Nombre</th><th>Celular</th><th>Correo</th><th>Distrito</th><th>Resultado</th></tr></thead><tbody>
      ${F.slice(0,15).map(r=>`<tr><td class="nl"><b>${e(r.nombre||'—')}</b></td><td data-l="Celular">${e(r.telefono)}</td><td data-l="Correo">${e(r.correo)}</td><td data-l="Distrito">${e(r.distrito)}</td><td data-l="Resultado">${r._st==='nuevo'?pill('Nuevo','ok'):r._st==='existe'?pill('Ya existe','in'):pill('Sin nombre','r')}</td></tr>`).join('')}
      </tbody></table></div>${F.length>15?`<p class="sub">…y ${F.length-15} filas más.</p>`:''}
      <div class="row" style="margin-top:10px"><button class="btn p" data-a="importar" ${IMP.busy||!(nuevos+ex)?'disabled':''}>${IMP.busy?`Importando… ${IMP.prog||0}/${nuevos+ex}`:`Importar ${nuevos+ex} clientes`}</button><button class="btn g" data-a="imp-cancel">Cancelar</button></div></div>`;
  }

  /* ---------------- Seguridad ---------------- */
  function sSeg(){
    const G = T.seg;
    if(!G.sesiones){ const ua = navigator.userAgent; const nav = /Edg\//.test(ua)?'Edge':/Chrome\//.test(ua)?'Chrome':/Firefox\//.test(ua)?'Firefox':/Safari\//.test(ua)?'Safari':'Navegador'; const so = /Windows/.test(ua)?'Windows':/Mac OS/.test(ua)?'Mac':/Android/.test(ua)?'Android':/iPhone|iPad/.test(ua)?'iPhone':'Linux';
      G.sesiones = [{ id:'s0', d:`${nav} en ${so}`, lugar:'Lima, Perú', ultimo:'Ahora', actual:true }, { id:'s1', d:'App del técnico en Android', lugar:'Lima, Perú', ultimo:'Hace 2 horas' }, { id:'s2', d:'Chrome en Windows', lugar:'Lima, Perú', ultimo:'Hace 3 días' }]; }
    const accesos = P.auditoria.filter(a=>a.cli===C.id && /soporte/i.test(a.accion)).slice(0,6);
    const R = P.sistema.respaldos;
    const permitido = G.soporte.permitido && (!G.soporte.hasta || G.soporte.hasta > ahora());
    return `<div class="grid g2">
      <div class="card"><div class="ch"><div><h2>Verificación en 2 pasos</h2><p>Además de tu contraseña, se pide un código de tu celular. Protege tu cuenta aunque alguien sepa tu clave.</p></div>${G.mfa?pill('Activa','ok'):pill('No activa','wa')}</div>
        ${G.mfa ? `<p class="sub">Usas una app de códigos (Google Authenticator o Microsoft Authenticator).</p><div class="row" style="margin-top:10px"><button class="btn s" data-a="mfa-codigos">Ver códigos de respaldo</button><button class="btn s d" data-a="mfa-off">Desactivar</button></div>` : `<button class="btn p" data-a="mfa-on">Activar verificación en 2 pasos</button>`}
        <label class="chk" style="margin-top:14px"><input type="checkbox" data-f="g" data-id="mfaEquipo" ${G.mfaEquipo?'checked':''}> Exigirla a todo mi equipo</label></div>
      <div class="card"><div class="ch"><div><h2>Acceso del soporte de Vittkly</h2><p>El equipo de Vittkly solo entra a tu cuenta si tú lo permites. Cada acceso queda registrado.</p></div>${permitido?pill('Permitido','ok'):pill('No permitido')}</div>
        ${permitido ? `<p class="sub">Permitido hasta ${V.fTs(G.soporte.hasta)}.</p><button class="btn s" data-a="sop-off" style="margin-top:8px">Quitar permiso ahora</button>` : `<div class="row"><button class="btn s p" data-a="sop-on" data-id="1">Permitir 24 horas</button><button class="btn s" data-a="sop-on" data-id="7">Permitir 7 días</button></div>`}
        <p class="sec" style="margin-top:12px">Últimos accesos</p>${accesos.length ? `<ul class="tl">${accesos.map(a=>`<li><span>${V.fTs(a.ts)}</span><div>${e(a.quien)} · ${e(a.det)}</div></li>`).join('')}</ul>` : '<p class="sub">Nadie de Vittkly entró a tu cuenta.</p>'}</div>
    </div>
    <div class="card"><div class="ch"><div><h2>Sesiones abiertas</h2><p>Dónde está abierta tu cuenta</p></div><button class="btn s" data-a="ses-todas">Cerrar las demás</button></div>
      <ul class="lst">${G.sesiones.map(x=>`<li><div><b>${e(x.d)}</b><small>${e(x.lugar)} · ${e(x.ultimo)}</small></div>${x.actual?pill('Esta sesión','in'):`<button class="btn s g" data-a="ses-cerrar" data-id="${x.id}">Cerrar</button>`}</li>`).join('')}</ul></div>
    <div class="card"><div class="ch"><div><h2>Tus datos</h2><p>Cómo cuidamos la información de tu empresa y de tus clientes</p></div></div>
      <dl class="dl"><div><dt>Copia de seguridad</dt><dd>Diaria a las ${e(R.diario)} h</dd></div><div><dt>Recuperación</dt><dd>A cualquier momento de los últimos ${R.puntoEnTiempo} días</dd></div><div><dt>Cifrado</dt><dd>En tránsito y en reposo</dd></div><div><dt>Separación</dt><dd>Tus datos no se mezclan con los de otras empresas</dd></div></dl>
      <div class="row" style="margin-top:12px"><button class="btn s" data-a="go" data-id="vkdatos">Exportar mis datos</button><button class="btn s g" data-a="eliminar-cuenta">Solicitar eliminación de la cuenta</button></div></div>`;
  }

  /* ---------------- Ayuda, estado y legal ---------------- */
  function sAyuda(){
    const q = cuo(), N = P.soporteNiveles[q.soporte] || {}, SY = P.sistema;
    const mal = SY.componentes.filter(x=>x.estado!=='operativo');
    const inc = SY.incidentes.filter(i=>i.estado!=='resuelto'), res = SY.incidentes.filter(i=>i.estado==='resuelto').slice(0,2);
    const EST = { operativo:'Operativo', degradado:'Con demoras', caido:'Caído', mantenimiento:'Mantenimiento' };
    return `<div class="grid g2">
      <div class="card"><div class="ch"><div><h2>Tu soporte: ${e(N.l||'')}</h2><p>Según tu plan ${e(plan().nombre)}</p></div></div>
        <dl class="dl"><div><dt>Canal</dt><dd>${e(N.canal)}</dd></div><div><dt>Primera respuesta</dt><dd>${e(N.respuesta)}</dd></div><div><dt>Capacitación</dt><dd>${e(N.capacitacion)}</dd></div></dl>
        <div class="row" style="margin-top:12px"><button class="btn p" data-a="soporte-chat">Escribir a soporte</button><a class="btn" href="mailto:soporte@vittkly.com">soporte@vittkly.com</a>${q.soporte!=='correo'?'<button class="btn" data-a="capacitacion">Agendar capacitación</button>':''}</div>
        <p class="note" style="margin-top:12px">También tienes manuales y recorridos guiados en el botón <b>Ayuda (?)</b> de la parte de arriba.</p></div>
      <div class="card"><div class="ch"><div><h2>Estado del sistema</h2><p>status.vittkly.com</p></div>${mal.length?pill('Hay incidencias','wa'):pill('Todo operativo','ok')}</div>
        <ul class="lst">${SY.componentes.map(x=>`<li><div style="display:flex;align-items:center"><span class="dot ${x.estado}"></span><span>${e(x.l)}</span></div><span class="sub">${EST[x.estado]}</span></li>`).join('')}</ul></div>
    </div>
    ${inc.length || res.length ? `<div class="card"><div class="ch"><div><h2>Incidentes</h2><p>Lo que pasó y qué hicimos</p></div></div><div class="grid" style="gap:10px">${inc.concat(res).map(i=>`<div class="inc ${i.estado!=='resuelto'?'on':''}"><div class="row" style="justify-content:space-between"><b>${e(i.titulo)}</b>${pill(i.estado==='resuelto'?'Resuelto':'En curso', i.estado==='resuelto'?'ok':'wa')}</div><ul>${i.updates.slice().reverse().map(u=>`<li><span>${V.fTs(u.ts)}</span>${e(u.t)}</li>`).join('')}</ul></div>`).join('')}</div></div>` : ''}
    <div class="card"><div class="ch"><div><h2>Documentos legales</h2><p>Lo que acordamos contigo y cómo tratamos los datos</p></div></div>
      <ul class="lst">${P.legal.docs.map(d=>{ const ok = !d.obligatorio || (C.legal && C.legal.version===d.version && C.legal.aceptado); return `<li><div><b>${e(d.l)}</b><small>Versión ${e(d.version)} · ${V.fF(d.fecha)}${d.cambios?` · ${e(d.cambios)}`:''}</small></div><div class="row"><button class="btn s g" data-a="legal-ver" data-id="${d.id}">Leer</button>${ok ? (d.obligatorio?pill('Aceptado','ok'):'') : `<button class="btn s p" data-a="legal-ok">Aceptar</button>`}</div></li>`; }).join('')}</ul>
      <p class="sub" style="margin-top:8px">Privacidad y derechos sobre tus datos: privacidad@vittkly.com</p></div>`;
  }

  /* ---------------- modal ---------------- */
  function modal(t, sub, body, ok, onOk, opts){ modalSt = { t, sub, body, ok, onOk, opts:opts||{} }; pintarM(); }
  function pintarM(err){
    let mb = root.querySelector('.mb'); if(mb) mb.remove(); if(!modalSt) return; const Mo = modalSt;
    mb = document.createElement('div'); mb.className = 'mb';
    mb.innerHTML = `<div class="md" role="dialog" aria-modal="true" aria-labelledby="vcT"><header><div><h3 id="vcT">${Mo.t}</h3>${Mo.sub?`<p>${Mo.sub}</p>`:''}</div><button class="btn g s" data-m="x" aria-label="Cerrar">✕</button></header><div class="bd">${Mo.body}${err?`<div class="err">${e(err)}</div>`:''}</div><footer><button class="btn" data-m="x">${Mo.ok?'Cancelar':'Cerrar'}</button>${Mo.ok?`<button class="btn ${Mo.opts.peligro?'d':'p'}" data-m="ok">${Mo.ok}</button>`:''}</footer></div>`;
    root.querySelector('.vc').appendChild(mb);
    const md = mb.querySelector('.md'); mb.addEventListener('click', ev=>{ if(ev.target===mb) cerrarM(); }); md.addEventListener('keydown', ev=>{ if(ev.key==='Escape') cerrarM(); });
    mb.querySelectorAll('[data-m="x"]').forEach(b=>b.addEventListener('click', cerrarM));
    const okb = mb.querySelector('[data-m="ok"]'); if(okb) okb.addEventListener('click', ()=>{ const f = {}; md.querySelectorAll('[name]').forEach(x=>{ if(x.type==='checkbox'){ if(x.dataset.multi){ f[x.name] = f[x.name]||[]; if(x.checked) f[x.name].push(x.value); } else f[x.name] = x.checked; } else if(x.type==='radio'){ if(x.checked) f[x.name] = x.value; } else f[x.name] = x.value; }); const r = Mo.onOk(f, md); if(typeof r==='string'){ pintarM(r); return; } if(r!==false) cerrarM(); });
    if(Mo.opts.bind) Mo.opts.bind(md);
    const first = md.querySelector('input,select,textarea,button.p'); if(first) setTimeout(()=>first.focus(), 30);
  }
  function cerrarM(){ modalSt = null; const mb = root.querySelector('.mb'); if(mb) mb.remove(); }

  /* ---------------- acciones ---------------- */
  const listo = (msg) => { syncC(); guardarT(); guardarP(); pintar(); if(msg) toast(msg); };
  const A = {
    go: id => { SEC = id; if(O.nav) O.nav(id); pintar(); },
    ir: id => { if(O.ir) O.ir(id); },
    copiar: v => { try{ navigator.clipboard.writeText(v).then(()=>toast('Enlace copiado.'), ()=>toast(v)); }catch(err){ toast(v); } },
    'ref-invitar': () => { modal('Invitar a una empresa', 'Recibirá tu enlace con su descuento', `<div class="fr"><div class="f"><label>Empresa</label><input type="text" name="nombre" maxlength="60"></div><div class="f"><label>Celular</label><input type="text" name="cel" maxlength="15"></div></div>`, 'Abrir WhatsApp', f=>{
        if(!String(f.nombre||'').trim()) return 'Escribe el nombre de la empresa.'; T.refVittkly.invitados.unshift({ nombre:f.nombre.trim(), estado:'Invitada' });
        const msg = encodeURIComponent(`Hola, uso Vittkly para gestionar mi negocio y te lo recomiendo. Con mi enlace tienes ${P.referidos.premioNuevo}: https://vittkly.com/r/${T.refVittkly.codigo}`);
        const tel = String(f.cel||'').replace(/\D/g,''); try{ window.open(`https://wa.me/${tel?(tel.length===9?'51'+tel:tel):''}?text=${msg}`, '_blank'); }catch(err){}
        listo(); }); },
    'plan-cambiar': () => { const pl = P.planes.filter(p=>p.activo);
      modal('Elige tu plan', 'Precios con IGV. Puedes cambiar cuando quieras; la diferencia se prorratea.', `<div class="grid" style="gap:10px">${pl.map(p=>`<label class="opt"><input type="radio" name="plan" value="${p.id}" ${p.id===C.plan?'checked':''}><span><b>${e(p.nombre)} · ${V.S(p.mensual)} al mes</b><small>${e(p.lema)} · ${p.usuarios} usuarios · ${n0((p.cuotas||{}).wa)} WhatsApp automáticos${(p.cuotas||{}).sunat?` · ${n0(p.cuotas.sunat)} comprobantes SUNAT`:''}${(p.cuotas||{}).creditos?` · ${n0(p.cuotas.creditos)} créditos`:''}</small></span></label>`).join('')}</div>
        <div class="fr"><div class="f"><label>Pago</label><select name="ciclo"><option value="mensual" ${C.ciclo!=='anual'?'selected':''}>Mensual</option><option value="anual" ${C.ciclo==='anual'?'selected':''}>Anual (paga ${P.reglas.mesesAnual} meses)</option></select></div><div class="f"><label>Cupón</label><input type="text" name="cupon" maxlength="20" placeholder="Opcional" style="text-transform:uppercase"></div></div>`, 'Confirmar', f=>{
        const cod = String(f.cupon||'').toUpperCase().trim(); let u = null;
        if(cod){ u = P.cupones.find(x=>x.codigo===cod && x.activo && x.segmento!=='interno' && (!x.hasta||x.hasta>=V.HOY()) && x.desde<=V.HOY() && (!x.max||x.usos<x.max)); if(!u) return 'Ese cupón no existe o ya venció.'; if(u.planes.length && !u.planes.includes(f.plan)) return `El cupón ${cod} no vale para ese plan.`; if(u.ciclo!=='todos' && u.ciclo!==f.ciclo) return `El cupón ${cod} solo vale para el pago ${u.ciclo}.`; }
        const antes = V.planDe(P, C.plan).nombre; C.plan = f.plan; C.ciclo = f.ciclo; C.precioFijo = null;
        if(C.estado==='prueba'){ C.estado = 'activa'; C.prox = f.ciclo==='anual' ? V.addM(V.HOY(),12) : V.addM(V.HOY(),1); delete C.pruebaFin; C.metodo = 'tarjeta'; }
        if(u){ C.descuentos = C.descuentos||[]; C.descuentos.push({ id:V.uid('d'), cupon:u.codigo, nombre:u.nombre, tipo:u.tipo, valor:u.valor, hasta: u.duracion==='siempre'?null:V.addM(V.HOY(), u.duracion==='una'?1:(u.meses||1)), por:'Cliente (cupón)', desde:V.HOY() }); u.usos++; }
        tlP(`Cambió su plan: ${antes} → ${V.planDe(P,C.plan).nombre} (${C.ciclo})${u?` con cupón ${u.codigo}`:''}`, 'Cambio de plan (autogestión)'); listo(`Listo: plan ${V.planDe(P,C.plan).nombre}.`); }); },
    'plan-anual': () => { const p = plan(); modal('Pasar a pago anual', `Plan ${e(p.nombre)}`, `<p>Pagas <b>${V.S(p.anual)}</b> una vez al año en lugar de ${V.S(p.mensual*12)}: ahorras <b>${V.S(p.mensual*12-p.anual)}</b>.</p>`, 'Pasar a anual', ()=>{ C.ciclo = 'anual'; C.prox = V.addM(V.HOY(),12); tlP('Pasó a pago anual','Cambio de ciclo (autogestión)'); listo('Ahora pagas anual.'); }); },
    'plan-pausa': () => { const R = P.retencion, u = R.cupon ? P.cupones.find(x=>x.codigo===R.cupon) : null, menor = P.planes.filter(x=>x.activo && x.mensual < plan().mensual).sort((a,b)=>b.mensual-a.mensual)[0];
      const ops = [R.pausaMeses>0 ? ['pausa', `Pausar ${R.pausaMeses} meses sin pagar`, 'Tus datos quedan guardados y vuelves cuando quieras'] : null, u ? ['cupon', `${V.descTxt(u)} por ${V.durTxt(u)}`, 'Para que sigas con nosotros'] : null, R.bajarPlan && menor ? ['bajar', `Pasar al plan ${menor.nombre} (${V.S(menor.mensual)})`, 'Pagas menos y conservas lo esencial'] : null].filter(Boolean);
      modal('Pausar o cancelar', C.real && O.emp && O.emp.esVK ? 'Vista previa: así lo ve un cliente. En la empresa cero no se aplica.' : '', `<div class="f"><label>¿Por qué quieres irte?</label><select name="motivo">${R.motivos.map(m=>`<option>${e(m)}</option>`).join('')}</select></div>
        ${R.activa && ops.length ? `<div class="f"><span class="lb">Antes de irte</span>${ops.map((o,i)=>`<label class="opt"><input type="radio" name="op" value="${o[0]}" ${i===0?'checked':''}><span><b>${e(o[1])}</b><small>${e(o[2])}</small></span></label>`).join('')}<label class="opt"><input type="radio" name="op" value="cancelar"><span><b>Cancelar de todas formas</b><small>Sigues usando Vittkly hasta el final del periodo pagado. Puedes exportar tus datos.</small></span></label></div>` : '<input type="hidden" name="op" value="cancelar">'}`, 'Confirmar', f=>{
        if(O.emp && O.emp.esVK){ toast(`Vista previa: el cliente habría elegido «${f.op}». No se cambió nada.`); return; }
        P.retencion.intentos++;
        if(f.op==='pausa'){ C.estado = 'pausada'; C.pausaHasta = V.addM(V.HOY(), R.pausaMeses); P.retencion.retenidos++; tlP(`Pausó la cuenta (${f.motivo})`, 'Pausa (autogestión)'); }
        else if(f.op==='cupon'){ C.descuentos.push({ id:V.uid('d'), cupon:u.codigo, nombre:u.nombre, tipo:u.tipo, valor:u.valor, hasta:V.addM(V.HOY(),u.meses||1), por:'Oferta de retención', desde:V.HOY() }); u.usos++; P.retencion.retenidos++; tlP(`Aceptó ${u.codigo} en vez de cancelar`, 'Retención (autogestión)'); }
        else if(f.op==='bajar'){ C.plan = menor.id; P.retencion.retenidos++; tlP(`Bajó al plan ${menor.nombre}`, 'Retención (autogestión)'); }
        else { C.estado = 'cancelada'; C.cancelada = V.HOY(); C.motivoCancel = f.motivo; tlP(`Canceló: ${f.motivo}`, 'Cancelación (autogestión)'); }
        listo('Listo.'); }); },
    addon: id => { const a = P.addons.find(x=>x.id===id), on = (C.addons||[]).includes(id); C.addons = on ? C.addons.filter(x=>x!==id) : [...(C.addons||[]), id]; tlP(`${on?'Quitó':'Activó'} ${a.l}`, on?'Quitó complemento (autogestión)':'Activó complemento (autogestión)'); listo(on ? 'Complemento quitado.' : `${a.l} activo. Se suma a tu próximo cobro.`); },
    'cred-comprar': id => { const a = P.addons.find(x=>x.id===id); modal('Comprar créditos', `${n0(a.creditos)} créditos por ${V.S(a.precio)}`, `<p class="sub">Se cobra con tu método de pago (${e(C.metodo)}). Los créditos comprados no vencen.</p>`, 'Comprar', ()=>{
        C.consumo.creditosExtra = (C.consumo.creditosExtra||0) + a.creditos; P.facturas.unshift({ id:V.uid('f'), numero:'B001-'+String(500+P.facturas.length).padStart(6,'0'), cliente:C.id, fecha:V.HOY(), monto:a.precio, estado:'pagada', intentos:1, metodo:'Tarjeta', tipo:'creditos' });
        tlP(`Compró ${n0(a.creditos)} créditos`, 'Compró créditos'); listo(`${n0(a.creditos)} créditos agregados.`); }); },
    metodo: () => modal('Método de pago', '', `<label class="opt"><input type="radio" name="m" value="tarjeta" ${C.metodo==='tarjeta'?'checked':''}><span><b>Tarjeta de crédito o débito</b><small>Cobro automático cada periodo</small></span></label><label class="opt"><input type="radio" name="m" value="manual" ${C.metodo==='manual'?'checked':''}><span><b>Transferencia o Yape</b><small>Te enviamos la orden de pago y la confirmas con el N.° de operación</small></span></label><p class="sub">Demostración: no se pide ningún dato de tarjeta.</p>`, 'Guardar', f=>{ C.metodo = f.m||C.metodo; tlP(`Cambió método de pago a ${C.metodo}`, 'Cambió método de pago'); listo('Método de pago actualizado.'); }),
    'sitio-ver': () => modal(e(T.sitio.titulo), e(T.sitio.dominio && cuo().sitio!=='marca' ? T.sitio.dominio : T.sitio.slug+'.vittkly.com'), `<div style="display:flex;justify-content:center">${telefono()}</div>`, null, null),
    'sitio-pub': () => { if(!T.sitio.publicado && !(T.sitio.servicios||[]).length) { toast('Elige al menos un servicio para mostrar.'); return; } T.sitio.publicado = !T.sitio.publicado; C.sitio.publicado = T.sitio.publicado; tlP(T.sitio.publicado?'Publicó su sitio':'Despublicó su sitio'); listo(T.sitio.publicado ? 'Tu sitio está publicado.' : 'Tu sitio ya no está visible.'); },
    'pg-on': () => { const g = T.sitio.pasarela; if(!g.prov) return toast('Elige tu pasarela.'); if(!/^pk_|^pub|^[A-Za-z0-9_-]{12,}$/.test(g.llave||'')) return toast('Pega la llave pública que te da tu pasarela.'); g.estado = 'conectada'; tlP(`Conectó su pasarela ${g.prov}`); listo(`${g.prov} conectada.`); },
    'pg-off': () => { T.sitio.pasarela.estado = 'desconectada'; T.sitio.reservas.adelanto = 0; listo('Pasarela desconectada.'); },
    'sol-cotizar': i => { const r = T.sitio.solicitudes[+i]; if(O.cotizar) O.cotizar({ nombre:r.nombre, telefono:r.tel, distrito:r.distrito, nota:`Pedido desde el sitio: ${r.servicio}` }); else toast('Abre Nueva cotización para atender este pedido.'); },
    'camp-new': () => { if(!tiene('marketing')) return; const segs = O.segmentos||[], eq = (P.creditos.equiv.find(z=>z.id==='wa_mkt')||{}).c||4;
      modal('Nueva campaña', 'Llega por WhatsApp o correo a un grupo de tus clientes', `<div class="f"><label>Nombre</label><input type="text" name="nombre" maxlength="60" placeholder="Ej.: Limpieza de verano"></div>
        <div class="fr"><div class="f"><label>Para</label><select name="seg">${segs.map(s=>`<option value="${e(s.id)}">${e(s.l)} (${s.n})</option>`).join('')}</select></div><div class="f"><label>Canal</label><select name="canal"><option value="whatsapp">WhatsApp (${eq} créditos c/u)</option><option value="correo">Correo (1 crédito cada 10)</option></select></div><div class="f"><label>Enviar</label><input type="date" name="fecha" value="${V.HOY()}"></div></div>
        <div class="f"><label>Mensaje</label><textarea name="msg" maxlength="500">Hola {nombre}, este mes tenemos 15% en la limpieza de muebles y colchones. ¿Te agendamos?</textarea><small>Comodín: {nombre}. Solo se envía a clientes que aceptaron recibir mensajes.</small></div>
        <p class="note" data-k="costo"></p>`, 'Programar campaña', f=>{
        const s = segs.find(x=>x.id===f.seg); const n = s ? s.n : 0; if(!String(f.nombre||'').trim()) return 'Escribe el nombre.'; if(!n) return 'Ese grupo no tiene clientes.';
        const costo = f.canal==='whatsapp' ? n*eq : Math.ceil(n/10); if(costo > cred().saldo) return `Necesitas ${n0(costo)} créditos y tienes ${n0(cred().saldo)}. Compra un paquete en Mi plan y consumo.`;
        C.consumo.creditosUsados = (C.consumo.creditosUsados||0) + costo; const hoy = f.fecha<=V.HOY();
        T.mkt.campanas.unshift({ id:V.uid('m'), nombre:f.nombre.trim(), seg:f.seg, canal:f.canal, enviados:hoy?n:0, respuestas:0, ventas:0, fecha:f.fecha||V.HOY(), estado:hoy?'enviada':'programada', mensaje:f.msg });
        tlP(`Campaña «${f.nombre}» a ${n} clientes (${n0(costo)} créditos)`, 'Campaña de marketing'); listo(hoy ? `Campaña enviada a ${n} clientes. Se usaron ${n0(costo)} créditos.` : 'Campaña programada.'); },
        { bind: md => { const sel = md.querySelector('[name="seg"]'), can = md.querySelector('[name="canal"]'), out = md.querySelector('[data-k="costo"]'); const u = () => { const s = segs.find(x=>x.id===sel.value), n = s?s.n:0, c = can.value==='whatsapp' ? n*eq : Math.ceil(n/10); out.innerHTML = `Usará <b>${n0(c)} créditos</b> (${n} clientes). Tienes ${n0(cred().saldo)}.`; }; sel.addEventListener('change', u); can.addEventListener('change', u); u(); } }); },
    'meta-on': () => modal('Conectar con Facebook', 'Demostración: en producción se abre la ventana de inicio de sesión de Meta', `<div class="f"><label>Página de Facebook</label><input type="text" name="pagina" value="${e((O.emp||{}).nombre||'')}" maxlength="60"></div><label class="chk"><input type="checkbox" name="forms" checked> Traer los formularios de clientes potenciales</label>`, 'Conectar', f=>{
        const M2 = T.mkt.meta; M2.conectado = true; M2.pagina = f.pagina||'Mi página'; M2.leads = [{ ts:ahora(), nombre:'Rocío Benavides', form:'Formulario «Cotiza tu limpieza»' }]; T.api.integraciones.meta = true; tlP('Conectó Meta (Facebook e Instagram)'); listo('Meta conectado. Los nuevos formularios entrarán al CRM.'); }),
    'meta-off': () => { T.mkt.meta.conectado = false; T.api.integraciones.meta = false; listo('Meta desconectado.'); },
    'key-new': () => { const ms = RECURSOS.map(r=>r[0]);
      modal('Crear clave de API', 'Elige qué puede ver o hacer', `<div class="f"><label>Nombre</label><input type="text" name="nombre" maxlength="50" placeholder="Ej.: Integración con mi contabilidad"></div>
        <div class="f"><span class="lb">Módulos</span><div class="grid" style="gap:6px">${RECURSOS.map(([m,l])=>`<label class="chk"><input type="checkbox" name="perm" data-multi="1" value="${m}" ${tiene(m)?'checked':'disabled'}> ${e(l)}${tiene(m)?'':' <span class="sub">· no incluido en tu plan</span>'}</label>`).join('')}</div></div>
        <label class="chk"><input type="checkbox" name="esc"> Permitir crear y modificar (no solo leer)</label>`, 'Crear clave', f=>{
        if(!String(f.nombre||'').trim()) return 'Escribe un nombre para reconocerla.'; if(!(f.perm||[]).length) return 'Elige al menos un módulo.';
        const k = 'vk_live_' + rnd(32, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
        T.api.claves.unshift({ id:V.uid('k'), nombre:f.nombre.trim(), prefijo:k.slice(0,12), permisos:f.perm, escritura:!!f.esc, creada:V.HOY(), ultimo:null, activa:true });
        tlP(`Creó la clave de API «${f.nombre}»`); guardarT(); guardarP(); pintar();
        setTimeout(()=>modal('Tu nueva clave', 'Cópiala ahora: por seguridad no se vuelve a mostrar completa', `<div class="keybox">${k}</div>`, 'Copiar y cerrar', ()=>{ try{ navigator.clipboard.writeText(k); toast('Clave copiada.'); }catch(err){} }), 50);
        return; }); },
    'key-off': id => modal('Revocar clave', '', '<p>Los sistemas que la usan dejarán de funcionar de inmediato.</p>', 'Revocar', ()=>{ const k = T.api.claves.find(x=>x.id===id); k.activa = false; tlP(`Revocó la clave «${k.nombre}»`); listo('Clave revocada.'); }, { peligro:true }),
    'wh-new': () => modal('Agregar webhook', 'Vittkly enviará un POST con los datos en JSON', `<div class="f"><label>URL de destino</label><input type="text" name="url" placeholder="https://…" maxlength="200"></div>
        <div class="f"><span class="lb">Eventos</span><div class="grid" style="gap:6px">${EVENTOS.map(([k,l],i)=>`<label class="chk"><input type="checkbox" name="ev" data-multi="1" value="${k}" ${i<2?'checked':''}> ${l} <code class="cd">${k}</code></label>`).join('')}</div></div>`, 'Agregar', f=>{
        if(!/^https:\/\/[^\s]+\.[^\s]+/.test(f.url||'')) return 'La URL debe empezar con https://'; if(!(f.ev||[]).length) return 'Elige al menos un evento.';
        T.api.webhooks.push({ id:V.uid('w'), url:f.url.trim(), eventos:f.ev, activo:true, secreto:'whsec_'+rnd(24), log:[] }); tlP('Agregó un webhook'); listo('Webhook agregado. Prueba el envío.'); }),
    'wh-test': id => { const w = T.api.webhooks.find(x=>x.id===id); w.log = w.log||[]; w.log.unshift({ ts:ahora(), evento:w.eventos[0], ok:true }); listo('Demostración: prueba enviada (200 OK).'); },
    'wh-del': id => { T.api.webhooks = T.api.webhooks.filter(x=>x.id!==id); listo('Webhook quitado.'); },
    app: id => { const on = !!T.api.integraciones[id]; T.api.integraciones[id] = !on; tlP(`${on?'Desconectó':'Conectó'} ${(APPS.find(a=>a[0]===id)||[])[1]}`); listo(on ? 'Desconectada.' : 'Conectada (demostración).'); },
    plantilla: () => { if(O.plantilla) O.plantilla(); },
    exportar: async () => { if(!O.exportar) return; try{ const r = await O.exportar(); if(r!==false){ T.datos.historial.unshift({ ts:ahora(), tipo:'exportacion', detalle:`Copia completa descargada${r&&r.detalle?` · ${r.detalle}`:''}` }); listo(); } }catch(err){ console.error(err); toast('No se pudo generar la copia.'); } },
    importar: async () => { if(!IMP || IMP.busy || !O.importar) return; IMP.busy = true; IMP.prog = 0; pintar();
      try{ const filas = IMP.filas.filter(r=>r._st!=='error'); const r = await O.importar(filas, n=>{ IMP.prog = n; const b = root.querySelector('[data-a="importar"]'); if(b) b.textContent = `Importando… ${n}/${filas.length}`; });
        T.datos.historial.unshift({ ts:ahora(), tipo:'importacion', detalle:`Importó ${IMP.archivo}: ${r.nuevos} nuevos, ${r.actualizados} completados${r.errores?`, ${r.errores} con error`:''}` }); IMP = null; listo(`Listo: ${r.nuevos} clientes nuevos y ${r.actualizados} completados.`);
      }catch(err){ console.error(err); IMP.busy = false; pintar(); toast('Se detuvo la importación. Revisa tu conexión y vuelve a intentar.'); } },
    'imp-cancel': () => { IMP = null; pintar(); },
    'ayuda-imp': id => { modal('Te ayudamos a cargarlo', '', `<p>Envía tu archivo a <b>soporte@vittkly.com</b> con el asunto «Importar ${id==='tarifario'?'tarifario':'historial'}». Lo cargamos en 2 días hábiles y te avisamos.</p>`, null, null); },
    'mfa-on': () => { const sec = rnd(16,'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567');
      modal('Activar verificación en 2 pasos', '1. Abre Google Authenticator o Microsoft Authenticator · 2. Agrega una cuenta con esta clave · 3. Escribe el código de 6 dígitos', `<div class="keybox">${sec.replace(/(.{4})/g,'$1 ')}</div><div class="f"><label>Código de 6 dígitos</label><input type="text" name="cod" inputmode="numeric" maxlength="6" autocomplete="one-time-code"></div><p class="sub">Demostración: acepta cualquier código de 6 dígitos.</p>`, 'Activar', f=>{
        if(!/^\d{6}$/.test(f.cod||'')) return 'Escribe los 6 dígitos que muestra la app.'; T.seg.mfa = true; T.seg.codigos = Array.from({length:8}, ()=>rnd(4,'0123456789')+'-'+rnd(4,'0123456789')); C.mfa = true; tlP('Activó la verificación en 2 pasos'); listo(); setTimeout(()=>A['mfa-codigos'](), 50); }); },
    'mfa-codigos': () => modal('Códigos de respaldo', 'Úsalos si pierdes tu celular. Cada uno sirve una vez. Guárdalos en un lugar seguro.', `<div class="keybox" style="columns:2">${(T.seg.codigos.length?T.seg.codigos:['—']).map(c=>`<div>${e(c)}</div>`).join('')}</div>`, null, null),
    'mfa-off': () => modal('Desactivar verificación en 2 pasos', '', '<p>Tu cuenta quedará protegida solo con la contraseña.</p>', 'Desactivar', ()=>{ T.seg.mfa = false; C.mfa = false; tlP('Desactivó la verificación en 2 pasos'); listo(); }, { peligro:true }),
    'sop-on': d => { T.seg.soporte = { permitido:true, hasta:new Date(Date.now()+ (+d)*86400000).toISOString() }; tlP(`Permitió el acceso de soporte por ${d==='1'?'24 horas':'7 días'}`, 'Autorizó acceso de soporte'); listo('Acceso de soporte permitido.'); },
    'sop-off': () => { T.seg.soporte = { permitido:false, hasta:null }; tlP('Quitó el acceso de soporte', 'Quitó acceso de soporte'); listo('Acceso de soporte retirado.'); },
    'ses-cerrar': id => { T.seg.sesiones = T.seg.sesiones.filter(x=>x.id!==id); listo('Sesión cerrada.'); },
    'ses-todas': () => { T.seg.sesiones = T.seg.sesiones.filter(x=>x.actual); listo('Se cerraron las demás sesiones.'); },
    'eliminar-cuenta': () => modal('Eliminar la cuenta', '', `<p>Primero descarga tu copia completa. Luego escríbenos a <b>privacidad@vittkly.com</b> desde el correo del titular: eliminamos la cuenta y todos sus datos en un plazo de ${P.reglas.borrado} días y te enviamos la confirmación.</p>`, null, null),
    'soporte-chat': () => (window.vkChatSoporte ? window.vkChatSoporte() : toast('Escríbenos a soporte@vittkly.com.')),
    capacitacion: () => modal('Agendar capacitación', 'Por videollamada, 45 minutos', `<div class="fr"><div class="f"><label>Fecha</label><input type="date" name="f" value="${V.addD(V.HOY(),2)}"></div><div class="f"><label>Hora</label><select name="h"><option>09:00</option><option>11:00</option><option>15:00</option><option>17:00</option></select></div></div><div class="f"><label>¿Qué quieres aprender?</label><input type="text" name="t" maxlength="100" placeholder="Ej.: programar trabajos y cobrar"></div>`, 'Agendar', f=>{ tlP(`Pidió capacitación para el ${V.fF(f.f)} ${f.h}`, 'Pidió capacitación'); listo('Listo: te enviaremos el enlace de la videollamada.'); }),
    'legal-ver': id => { const d = P.legal.docs.find(x=>x.id===id); modal(e(d.l), `Versión ${e(d.version)}`, `<div style="font-size:.9rem;line-height:1.6">${((V.LEGAL||{})[id]||[]).map(t=>`<p style="margin:0 0 8px">${e(t)}</p>`).join('')}</div>`, null, null); },
    'legal-ok': () => { C.legal = { version:(P.legal.docs.find(d=>d.id==='tos')||{}).version, aceptado:V.HOY() }; tlP(`Aceptó los términos v${C.legal.version}`, 'Aceptó documentos legales'); listo('Gracias, quedó registrado.'); }
  };

  /* ---------------- pintar y eventos ---------------- */
  function pintar(){
    const body = { vkplan:sPlan, vksitio:sSitio, vkmkt:sMkt, vkapi:sApi, vkdatos:sDatos, vkseg:sSeg, vkayuda:sAyuda }[SEC] || sPlan;
    const vc = root.querySelector('.vc'); const mb = root.querySelector('.mb');
    vc.innerHTML = head() + body(); if(mb) vc.appendChild(mb);
  }
  root.addEventListener('click', ev=>{ const b = ev.target.closest('[data-a]'); if(!b || b.closest('.mb') || b.disabled) return; const fn = A[b.dataset.a]; if(fn) fn(b.dataset.id); });
  root.addEventListener('change', async ev=>{
    const x = ev.target, f = x.dataset && x.dataset.f; if(!f) return; const id = x.dataset.id, val = x.type==='checkbox' ? x.checked : x.type==='number' ? Math.max(0, Number(x.value)||0) : x.value;
    if(f==='s'){ let v = val; if(id==='slug'){ v = String(val).toLowerCase().normalize('NFD').replace(/[^a-z0-9-]/g,'').slice(0,30) || T.sitio.slug; } if(id==='dominio') v = String(val).trim().toLowerCase().replace(/^https?:\/\//,''); T.sitio[id] = v; C.sitio = { ...(C.sitio||{}), slug:T.sitio.slug, dominio:T.sitio.dominio }; listo(); return; }
    if(f==='sv'){ const s = new Set(T.sitio.servicios); if(x.checked) s.add(id); else s.delete(id); T.sitio.servicios = [...s]; listo(); return; }
    if(f==='r'){ T.sitio.reservas[id] = id==='adelanto' ? Math.min(100, val) : val; listo(); return; }
    if(f==='pg'){ T.sitio.pasarela[id] = String(val).trim(); if(id==='prov') T.sitio.pasarela.estado = 'desconectada'; guardarT(); pintar(); return; }
    if(f==='mr'){ T.mkt.resenas[id] = val; listo(); return; }
    if(f==='mf'){ T.mkt.referidos[id] = val; listo(); return; }
    if(f==='mm'){ T.mkt.meta[id] = val; listo(); return; }
    if(f==='g'){ T.seg[id] = val; listo(val ? 'Todo tu equipo deberá activar la verificación en 2 pasos al entrar.' : ''); return; }
    if(f==='file'){ const file = x.files && x.files[0]; if(!file || !O.leerArchivo) return;
      try{ const rows = await O.leerArchivo(file); const filas = rows.map(normFila); filas.forEach(r=>{ r._st = !r.nombre ? 'error' : (O.existe && O.existe(r)) ? 'existe' : 'nuevo'; });
        // duplicados dentro del mismo archivo
        const vistos = new Set(); filas.forEach(r=>{ const k = (r.telefono||'').replace(/\D/g,'').slice(-9) || (r.doc||'') || r.nombre.toLowerCase(); if(r._st==='nuevo' && k){ if(vistos.has(k)) r._st = 'existe'; vistos.add(k); } });
        if(!filas.length){ toast('El archivo no tiene filas.'); return; } IMP = { archivo:file.name, filas }; pintar();
      }catch(err){ console.error(err); toast('No se pudo leer el archivo. Usa la plantilla en Excel o un CSV.'); } }
  });
  function normFila(o){ const g = (...ks) => { for(const k of Object.keys(o)){ const n = k.toLowerCase().normalize('NFD').replace(/[^a-z]/g,''); if(ks.some(x=>n.startsWith(x))) return String(o[k]??'').trim(); } return ''; };
    return { nombre:g('nombre','cliente','razon'), telefono:g('celular','telefono','movil','whatsapp'), correo:g('correo','email','mail'), doc:g('dni','ruc','documento','doc'), direccion:g('direccion'), distrito:g('distrito'), origen:g('origen','fuente') }; }

  const api = { ir:sec => { SEC = sec; IMP = null; pintar(); }, refresh:pintar, flush };
  // si ya hay un cambio de estado guardado por primera vez, persistir los datos iniciales de la empresa
  guardarT(); guardarP();
  pintar();
  return api;
};
})();
