/* Vittkly · Mesa de ayuda y Comunidad
   window.VK_MESA = {
     data(db)            → capa de datos compartida (tickets, comunidad, ideas)
     staff(host, O)      → panel del staff Vittkly: O.modo 'soporte' | 'comunidad'
     comunidad(host, O)  → Comunidad que ven los clientes dentro de la Central
   }
   Datos en la base compartida de la plataforma (preparados para Supabase):
     vk_tickets/<id>        un ticket por conversación de soporte
     vk_tickets_idx/<empId> { ids:[…] } tickets de cada empresa (el cliente solo lee los suyos)
     vk_mesa/config         respuestas guardadas y contador de tickets
     vk_com/<id>            publicaciones: preguntas de usuarios, casos de éxito, buenas prácticas y novedades
     vk_ideas/<id>          ideas y votos, con estado del roadmap y respuesta oficial */
(function(){
const e = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ahora = () => new Date().toISOString();
const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
const MES = ['ene','feb','mar','abr','may','jun','jul','ago','set','oct','nov','dic'];
const fTs = ts => { if(!ts) return '—'; const d = new Date(ts); return `${d.getDate()} ${MES[d.getMonth()]} · ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; };
const fF = ts => { if(!ts) return '—'; const d = new Date(ts); return `${d.getDate()} ${MES[d.getMonth()]} ${d.getFullYear()}`; };
const hace = ts => { if(!ts) return ''; const m = Math.round((Date.now() - new Date(ts))/60000); if(m<1) return 'ahora'; if(m<60) return `hace ${m} min`; const h = Math.round(m/60); if(h<24) return `hace ${h} h`; const d = Math.round(h/24); return d<30 ? `hace ${d} ${d===1?'día':'días'}` : fF(ts); };
const durTxt = min => { min = Math.round(Math.abs(min)); if(min<60) return `${min} min`; const h = Math.round(min/60); return h<48 ? `${h} h` : `${Math.round(h/24)} días`; };
const ini = s => String(s||'?').split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase();
const clone = o => JSON.parse(JSON.stringify(o));
/* texto con párrafos, viñetas «- » y **negritas** */
function fmt(t){
  const bloques = String(t||'').replace(/\r/g,'').split(/\n{2,}/);
  return bloques.map(b=>{
    const ls = b.split('\n');
    const neg = s => e(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    if(ls.every(l=>/^\s*[-•]\s+/.test(l))) return `<ul>${ls.map(l=>`<li>${neg(l.replace(/^\s*[-•]\s+/,''))}</li>`).join('')}</ul>`;
    return `<p>${ls.map(neg).join('<br>')}</p>`;
  }).join('');
}
const SVG = {
  up:'<path d="m18 15-6-6-6 6"/>', back:'<path d="m15 18-6-6 6-6"/>', search:'<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  pin:'<path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>',
  check:'<path d="M20 6 9 17l-5-5"/>', lock:'<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  msg:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>', thumb:'<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>',
  thumbd:'<path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z"/>',
  star:'<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>'
};
const ic = (k, s) => `<svg class="mi" ${s?`style="width:${s}px;height:${s}px"`:''} viewBox="0 0 24 24" aria-hidden="true">${SVG[k]||''}</svg>`;

/* ---------- catálogos ---------- */
const PERFILES_L = { admin:'Administrador', supervisor:'Supervisor', ventas:'Ventas', coordinador:'Coordinador de agenda', contabilidad:'Contabilidad', postventa:'Atención al cliente', analista:'Analista / Gerencia', tecnico:'Técnico' };
const MODULOS = ['General','Inicio','Calendario','Clientes','Cotizaciones','Trabajos','Inventario','Tiempo','Post venta','Finanzas','Caja y bancos','Pagos al personal','Biblioteca y Academia','Reportes','Marketing','Sitio web y reservas','App del técnico','Configuraciones','Plan y cuenta'];
const T_ESTADOS = { nuevo:['Nuevo','v'], abierto:['Abierto','r'], pendiente:['Pendiente','in'], espera:['En espera','wa'], resuelto:['Resuelto','ok'], cerrado:['Cerrado',''] };
const T_PRIOR = { baja:['Baja',''], normal:['Normal','in'], alta:['Alta','wa'], urgente:['Urgente','r'] };
const T_TIPOS = { pregunta:'Pregunta', problema:'Problema', incidente:'Incidente', solicitud:'Solicitud', cuenta:'Plan y pagos' };
const SLA_MIN = { urgente:60, alta:240, normal:1440, baja:2880 };   // primera respuesta
const AUTO_CIERRE_H = 96;   // un ticket resuelto se cierra solo a los 4 días sin respuesta
const P_TIPOS = { pregunta:['Pregunta','in'], caso:['Caso de éxito','ok'], practica:['Buena práctica','v'], novedad:['Novedad','wa'] };
const I_ESTADOS = { nueva:['Nueva',''], revision:['En revisión','in'], planificada:['Planificada','v'], desarrollo:['En desarrollo','wa'], publicada:['Publicada','ok'], descartada:['Descartada','r'] };
const I_TIPOS = { mejora:'Mejora o función nueva', uso:'Algo difícil de usar' };
const MACROS_BASE = [
  { id:'m1', n:'Saludo y pedido de captura', t:'Hola {nombre}, gracias por escribirnos. Para revisarlo bien, ¿nos compartes una captura de la pantalla donde ocurre y los pasos que seguiste?', estado:'pendiente' },
  { id:'m2', n:'Ya está solucionado', t:'Hola {nombre}, ya lo dejamos funcionando. ¿Puedes confirmar que todo está bien de tu lado? Si no nos respondes, cerraremos el ticket en 4 días.', estado:'resuelto' },
  { id:'m3', n:'Lo pasamos a desarrollo', t:'Hola {nombre}, reproducimos el caso y lo pasamos al equipo de desarrollo. Te avisamos por aquí apenas esté corregido.', estado:'espera' },
  { id:'m4', n:'Sugerencia para la Comunidad', t:'Hola {nombre}, ¡gracias por la idea! Te invitamos a publicarla en Comunidad › Ideas y votos: así otros negocios pueden votarla y la priorizamos.', estado:'resuelto' }
];

/* =================== capa de datos =================== */
function data(db){
  const col = n => db.collection(n);
  const lista = async n => { if(!db) return []; try{ const s = await col(n).get(); const out = []; const add = d => { const x = typeof d.data==='function' ? d.data() : null; if(x) out.push({ ...x, id:x.id||d.id }); }; if(s.forEach) s.forEach(add); else (s.docs||[]).forEach(add); return out; }catch(err){ console.warn('mesa', n, err); return []; } };
  const leer = async (n, id) => { if(!db) return null; try{ const s = await col(n).doc(id).get(); return s.exists ? { ...s.data(), id } : null; }catch(err){ console.warn('mesa', err); return null; } };
  const escribir = async (n, id, d) => { if(!db) throw new Error('sin base'); const x = clone(d); delete x._v; await col(n).doc(id).set(x); };
  const borrar = async (n, id) => { if(!db) throw new Error('sin base'); await col(n).doc(id).delete(); };
  const D = {
    lista, leer, escribir, borrar,
    async config(){ const c = await leer('vk_mesa','config'); return { macros: (c && c.macros) || clone(MACROS_BASE), n: (c && c.n) || 1000 }; },
    async guardarConfig(c){ await escribir('vk_mesa','config', { macros:c.macros, n:c.n }); },
    /* tickets */
    async tickets(){ const xs = await lista('vk_tickets'); xs.forEach(autoCierre); return xs; },
    async ticketsEmp(empId){ const ix = await leer('vk_tickets_idx', String(empId)); const ids = (ix && ix.ids) || []; const xs = (await Promise.all(ids.map(id=>leer('vk_tickets', id)))).filter(Boolean); xs.forEach(autoCierre); return xs.sort((a,b)=>String(b.actualizado).localeCompare(String(a.actualizado))); },
    ticket: id => leer('vk_tickets', id).then(t=>{ if(t) autoCierre(t); return t; }),
    guardarTicket: t => escribir('vk_tickets', t.id, t),
    async crearTicket(o){
      const c = await D.config(); c.n = (c.n||1000) + 1; try{ await D.guardarConfig(c); }catch(err){}
      const at = ahora();
      const t = { id:uid('t'), num:c.n, empId:String(o.empId), emp:o.emp, solicitante:{ n:o.n, uid:o.uid }, asunto:o.asunto, tipo:o.tipo||'pregunta', prioridad:o.prioridad||'normal', estado:'nuevo', asignado:null, etiquetas:[], pantalla:o.pantalla||'',
        msgs:[{ id:uid('m'), de:'cliente', t:o.t, n:o.n, at }], creado:at, actualizado:at, primeraResp:null, resueltoAt:null, csat:null, visto:{ cliente:at } };
      await escribir('vk_tickets', t.id, t);
      const ix = await leer('vk_tickets_idx', String(o.empId)); const ids = [t.id, ...((ix && ix.ids) || [])];
      await escribir('vk_tickets_idx', String(o.empId), { ids });
      return t;
    },
    escuchar(id, cb){ try{ const r = col('vk_tickets').doc(id); if(r.onSnapshot) return r.onSnapshot(s=>{ if(s && s.exists){ const t = { ...s.data(), id }; autoCierre(t); cb(t); } }); }catch(err){ console.warn(err); } return ()=>{}; },
    /* comunidad */
    posts: () => lista('vk_com'),
    guardarPost: p => escribir('vk_com', p.id, p),
    borrarPost: id => borrar('vk_com', id),
    async ideas(){
      const xs = await lista('vk_ideas');
      // migración: ideas guardadas en la versión anterior (un solo documento)
      try{ const v = await leer('vk_comunidad','ideas'); if(v && (v.lista||[]).length && !v.migrado){ for(const i of v.lista){ if(xs.some(x=>x.id===i.id)) continue; const n = { id:i.id, titulo:i.titulo, detalle:i.detalle||'', tipo:i.tipo==='uso'?'uso':'mejora', modulo:i.pantalla||'General', autor:{ n:i.autor||'Usuario', emp:i.emp||'' }, at:i.at||ahora(), votos:i.votos||[], estado:'nueva', comentarios:[] }; await escribir('vk_ideas', n.id, n); xs.push(n); } await escribir('vk_comunidad','ideas', { ...v, migrado:true }); } }catch(err){}
      return xs;
    },
    guardarIdea: i => escribir('vk_ideas', i.id, i),
    /* centro de ayuda: guías y cápsulas del equipo */
    ayuda: () => lista('vk_ayuda'),
    guardarAyuda: g => escribir('vk_ayuda', g.id, g),
    borrarAyuda: id => borrar('vk_ayuda', id)
  };
  return D;
}
function autoCierre(t){ if(t && t.estado==='resuelto' && t.resueltoAt && (Date.now()-new Date(t.resueltoAt))/3600000 > AUTO_CIERRE_H){ t.estado = 'cerrado'; } }
function slaInfo(t){
  if(t.primeraResp || ['resuelto','cerrado'].includes(t.estado)) return null;
  const lim = SLA_MIN[t.prioridad] || SLA_MIN.normal, pas = (Date.now() - new Date(t.creado))/60000, rest = lim - pas;
  return rest < 0 ? { cls:'r', txt:`1.ª respuesta vencida hace ${durTxt(rest)}`, vencido:true } : { cls: rest < lim*.25 ? 'wa' : 'in', txt:`1.ª respuesta en ${durTxt(rest)}`, vencido:false };
}

/* =================== estilos propios =================== */
const CSS_M = `
.mi{width:16px;height:16px;flex:none;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.wrap{display:flex;flex-direction:column;gap:12px}
.sp.m0{min-height:0;background:transparent}
.mz{display:grid;grid-template-columns:210px minmax(0,1fr);gap:12px;align-items:start}
.vw{display:flex;flex-direction:column;gap:2px;position:sticky;top:8px}
.vw button{display:flex;justify-content:space-between;align-items:center;gap:8px;width:100%;border:0;background:none;border-radius:9px;padding:8px 10px;font-weight:700;font-size:.86rem;color:var(--ink);cursor:pointer;text-align:left}
.vw button:hover{background:var(--sunk)} .vw button[aria-current="true"]{background:var(--pri-soft);color:var(--pri-ink)}
.vw button i{font-style:normal;font-size:.76rem;font-weight:800;color:var(--muted);font-variant-numeric:tabular-nums} .vw .sep{height:1px;background:var(--line);margin:6px 4px}
.srch{position:relative} .srch .mi{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--muted)} .srch input{padding-left:32px !important}
.tk td b{display:block} .tk td small{display:block;color:var(--muted);font-size:.76rem}
.tdet{display:grid;grid-template-columns:280px minmax(0,1fr);gap:12px;align-items:start}
.props{display:flex;flex-direction:column;gap:10px;position:sticky;top:8px}
.thread{display:flex;flex-direction:column;gap:10px}
.ms{border:1px solid var(--line);border-radius:12px;padding:10px 12px;background:var(--card)}
.ms header{display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:.8rem;color:var(--muted)} .ms header b{color:var(--ink);font-size:.86rem}
.ms .av{width:28px;height:28px;font-size:.72rem}
.ms.ag{border-left:4px solid var(--pri)} .ms.nt{background:var(--warn-soft);border-color:color-mix(in srgb,var(--warn) 40%,var(--line))} .ms.sy{background:var(--sunk);font-size:.82rem;color:var(--muted);text-align:center;border-style:dashed}
.ms .tx{font-size:.9rem;line-height:1.55;white-space:pre-wrap;word-break:break-word}
.cmp{border:1px solid var(--line2);border-radius:12px;background:var(--card);overflow:hidden}
.cmp.nt{border-color:var(--warn);background:var(--warn-soft)}
.cmp .ct{display:flex;gap:2px;padding:6px 6px 0;border-bottom:1px solid var(--line)}
.cmp .ct button{border:0;background:none;padding:7px 10px;font-weight:700;font-size:.82rem;color:var(--muted);border-bottom:2px solid transparent;cursor:pointer}
.cmp .ct button[aria-pressed="true"]{color:var(--ink);border-bottom-color:var(--pri)}
.cmp textarea{border:0 !important;border-radius:0 !important;background:transparent !important;min-height:110px}
.cmp .cf{display:flex;gap:8px;flex-wrap:wrap;align-items:center;justify-content:space-between;padding:8px 10px;border-top:1px solid var(--line)}
.split{display:inline-flex} .split .btn:first-child{border-radius:10px 0 0 10px} .split select{width:auto;border-radius:0 10px 10px 0;border-left:0;font-weight:700;font-size:.82rem;background:var(--pri);color:var(--on-pri);border-color:var(--pri)}
.csat{display:flex;gap:8px;align-items:center;font-size:.84rem}
.feed{display:flex;flex-direction:column;gap:10px}
.po{display:flex;gap:12px;align-items:flex-start;border:1px solid var(--line);border-radius:14px;padding:12px 14px;background:var(--card);cursor:pointer;text-align:left;width:100%;color:var(--ink)}
.po:hover{border-color:var(--pri)} .po h3{font-size:.98rem;font-weight:800;line-height:1.3} .po p{color:var(--muted);font-size:.84rem;margin-top:3px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.po .meta{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:6px;font-size:.76rem;color:var(--muted)}
.po .cnt{flex:none;display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:52px;height:56px;border-radius:10px;background:var(--sunk);font-weight:800;font-variant-numeric:tabular-nums}
.po .cnt small{font-size:.66rem;color:var(--muted);font-weight:700}
.vote{flex:none;display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:52px;height:56px;border:1.5px solid var(--line2);border-radius:10px;background:var(--card);font-weight:800;cursor:pointer;color:var(--ink);font-variant-numeric:tabular-nums}
.vote[aria-pressed="true"]{border-color:var(--pri);background:var(--pri-soft);color:var(--pri-ink)}
.art{max-width:780px} .art h2{font-size:1.35rem;font-weight:800;line-height:1.25;letter-spacing:-.01em} .art .body{font-size:.95rem;line-height:1.65} .art .body p{margin:0 0 10px} .art .body ul{margin:0 0 10px;padding-left:20px}
.ans{border:1px solid var(--line);border-radius:12px;padding:10px 12px;background:var(--card)} .ans.of{border-color:var(--pri);box-shadow:0 0 0 3px var(--pri-soft)} .ans.sol{border-color:var(--ok);box-shadow:0 0 0 3px var(--ok-soft)}
.ans header{display:flex;gap:8px;align-items:center;flex-wrap:wrap;font-size:.8rem;color:var(--muted);margin-bottom:6px} .ans header b{color:var(--ink)}
.ans .body{font-size:.9rem;line-height:1.55}
.ans .body p{margin:0 0 6px}
.offr{border-left:4px solid var(--pri);background:var(--pri-soft);border-radius:10px;padding:10px 12px;font-size:.88rem}
.kb{display:grid;grid-template-columns:repeat(6,minmax(210px,1fr));gap:10px;overflow-x:auto;padding-bottom:6px}
.kc{background:var(--sunk);border-radius:12px;padding:8px;display:flex;flex-direction:column;gap:8px;min-height:120px}
.kc h4{font-size:.76rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);display:flex;justify-content:space-between;padding:2px 4px}
.ki{border:1px solid var(--line);border-radius:10px;background:var(--card);padding:9px 10px;cursor:pointer;text-align:left;color:var(--ink);display:flex;flex-direction:column;gap:4px;width:100%}
.ki:hover{border-color:var(--pri)} .ki b{font-size:.86rem;line-height:1.3} .ki small{color:var(--muted);font-size:.74rem}
.hero{background:linear-gradient(0deg,var(--card),var(--card));border:1px solid var(--line);border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:10px}
.hero h2{font-size:1.2rem;font-weight:800}
.cols2{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:12px;align-items:start}
.lnk{border:0;background:none;color:var(--pri-ink);font-weight:700;cursor:pointer;padding:0;font-size:.84rem;display:inline-flex;gap:4px;align-items:center}
.fijo{color:var(--pri-ink)}
@media (max-width:900px){ .mz,.tdet,.cols2{grid-template-columns:1fr} .vw,.props{position:static} .vw{flex-direction:row;overflow-x:auto} .vw button{flex:none;width:auto} .vw .sep{display:none} }
`;
function montarShadow(host){
  const root = host.shadowRoot || host.attachShadow({ mode:'open' });
  const tema = () => { const t = document.documentElement.getAttribute('data-theme'); if(t) host.setAttribute('data-theme', t); else host.removeAttribute('data-theme'); };
  tema(); try{ new MutationObserver(tema).observe(document.documentElement, { attributes:true, attributeFilter:['data-theme'] }); }catch(err){}
  const base = (window.VK_SAAS && (window.VK_SAAS.CSS_ALL || window.VK_SAAS.CSS_BASE)) || '';
  return { root, css: `<style>${base}${CSS_M}</style>` };
}
/* modal propio (dentro del Shadow DOM) */
function modalEn(root, titulo, sub, body, ok, onOk, opts){
  opts = opts || {};
  const mb = document.createElement('div'); mb.className = 'mb';
  mb.innerHTML = `<div class="md" role="dialog" aria-modal="true" aria-label="${e(titulo)}" style="${opts.ancho?`width:min(${opts.ancho}px,100%)`:''}"><header><div><h3>${e(titulo)}</h3>${sub?`<p>${e(sub)}</p>`:''}</div><button class="btn g s" data-mx aria-label="Cerrar">✕</button></header>
    <div class="bd">${body}<div class="err" hidden></div></div>
    <footer><button class="btn" data-mx>${ok?'Cancelar':'Cerrar'}</button>${ok?`<button class="btn ${opts.peligro?'d':'p'}" data-mok>${e(ok)}</button>`:''}</footer></div>`;
  (root.querySelector('.sp') || root).appendChild(mb);
  const cerrar = () => mb.remove();
  mb.addEventListener('click', async ev=>{
    if(ev.target===mb || ev.target.closest('[data-mx]')){ cerrar(); return; }
    if(ev.target.closest('[data-mok]')){ const err = mb.querySelector('.err'); try{ const r = await onOk(mb); if(typeof r==='string'){ err.hidden = false; err.textContent = r; return; } cerrar(); }catch(x){ console.error(x); err.hidden = false; err.textContent = 'No se pudo guardar. Revisa tu conexión e intenta de nuevo.'; } }
  });
  mb.addEventListener('keydown', ev=>{ if(ev.key==='Escape') cerrar(); });
  setTimeout(()=>{ const f = mb.querySelector('input,textarea,select'); if(f) try{ f.focus(); }catch(err){} }, 30);
  return mb;
}
const val = (mb, sel) => { const x = mb.querySelector(sel); return x ? String(x.value||'').trim() : ''; };
const selOpts = (obj, cur) => Object.entries(obj).map(([k,v])=>`<option value="${k}" ${k===cur?'selected':''}>${e(Array.isArray(v)?v[0]:v)}</option>`).join('');
const modOpts = cur => MODULOS.map(m=>`<option ${m===cur?'selected':''}>${e(m)}</option>`).join('');
const pill = (map, k) => { const x = map[k] || [k,'']; return `<span class="pill ${x[1]}">${e(x[0])}</span>`; };

/* =================== PANEL DEL STAFF =================== */
const SV = { vista:'sin', sel:null, q:'', modoNota:false, borrador:{}, cmSub:'preguntas', cmSel:null, cmF:'sin', ideaSel:null };
async function staff(host, O){
  O = O || {};
  const { root, css } = montarShadow(host);
  const D = data(O.db), toast = O.toast || (m=>console.log(m));
  const yo = O.yo || { id:'s1', nombre:'Staff Vittkly' };
  const can = p => (O.can ? O.can(p) : true);
  const nombreStaff = id => ((O.staff||[]).find(s=>s.id===id)||{}).nombre || '—';
  root.innerHTML = `${css}<div class="sp m0"><div class="wrap"><p class="sub">Cargando…</p></div></div>`;
  const wrap = () => root.querySelector('.wrap');
  let T = [], CFG = null, P = [], I = [], G = [];
  const cargar = async () => {
    if(O.modo==='soporte'){ [T, CFG] = await Promise.all([D.tickets(), D.config()]); if(!T.length && O.semilla) T = await semillaTickets(D, O); }
    else if(O.modo==='ayuda'){ G = await D.ayuda(); if(O.semilla && !G.length) G = await semillaAyuda(D); }
    else { [P, I] = await Promise.all([D.posts(), D.ideas()]); if(O.semilla && !P.some(p=>p.tipo!=='pregunta')) P = P.concat(await semillaCom(D)); }
  };
  await cargar();
  if(O.modo==='soporte') pintarSoporte(); else if(O.modo==='ayuda') pintarAyuda(); else pintarComunidad();

  /* ---------------- SOPORTE ---------------- */
  function vistas(){
    const ab = t => !['resuelto','cerrado'].includes(t.estado);
    return [
      ['sin','Sin asignar', T.filter(t=>ab(t) && !t.asignado)],
      ['mios','Mis tickets', T.filter(t=>ab(t) && t.asignado===yo.id)],
      ['abiertos','Todos los abiertos', T.filter(t=>['nuevo','abierto'].includes(t.estado))],
      ['pend','Pendientes del cliente', T.filter(t=>t.estado==='pendiente')],
      ['espera','En espera', T.filter(t=>t.estado==='espera')],
      ['sla','SLA vencido', T.filter(t=>{ const s = slaInfo(t); return s && s.vencido; })],
      ['sep'],
      ['resueltos','Resueltos', T.filter(t=>t.estado==='resuelto')],
      ['cerrados','Cerrados', T.filter(t=>t.estado==='cerrado')],
      ['todos','Todos', T]
    ];
  }
  function metricas(){
    const resp = T.filter(t=>t.primeraResp).map(t=>(new Date(t.primeraResp)-new Date(t.creado))/60000);
    const cs = T.filter(t=>t.csat && t.csat.v); const buenas = cs.filter(t=>t.csat.v==='buena').length;
    return { abiertos:T.filter(t=>!['resuelto','cerrado','pendiente'].includes(t.estado)).length, sin:T.filter(t=>!t.asignado && !['resuelto','cerrado'].includes(t.estado)).length,
      venc:T.filter(t=>{ const s = slaInfo(t); return s && s.vencido; }).length, prom: resp.length ? durTxt(resp.reduce((a,b)=>a+b,0)/resp.length) : '—',
      csat: cs.length ? Math.round(buenas/cs.length*100)+'%' : '—', ncs:cs.length };
  }
  function pintarSoporte(){
    const sel = SV.sel && T.find(t=>t.id===SV.sel);
    const m = metricas();
    const kps = `<div class="kps">
      <div class="kp"><span>Sin asignar</span><b>${m.sin}</b><small>Toma uno desde «Sin asignar»</small></div>
      <div class="kp"><span>Abiertos</span><b>${m.abiertos}</b><small>Nuevos, abiertos y en espera</small></div>
      <div class="kp"><span>SLA vencido</span><b style="${m.venc?'color:var(--bad-ink)':''}">${m.venc}</b><small>Sin primera respuesta a tiempo</small></div>
      <div class="kp"><span>1.ª respuesta</span><b>${m.prom}</b><small>Promedio</small></div>
      <div class="kp"><span>Satisfacción</span><b>${m.csat}</b><small>${m.ncs} ${m.ncs===1?'calificación':'calificaciones'}</small></div></div>`;
    const avis = ('Notification' in window) && Notification.permission!=='granted' && Notification.permission!=='denied' ? `<div class="note" style="display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap"><span><b>Avisos de tickets nuevos.</b> Recibe una notificación en este navegador cuando entre un ticket, aunque estés en otra pestaña.</span><button class="btn s" data-sa="avisos">Activar avisos</button></div>` : '';
    wrap().innerHTML = kps + avis + (sel ? detalleTicket(sel) : listaTickets());
    if(!can('tickets')) wrap().insertAdjacentHTML('afterbegin', `<div class="note wa">Tu rol puede ver los tickets, pero no responderlos ni cambiarlos.</div>`);
  }
  function listaTickets(){
    const vs = vistas(); const v = vs.find(x=>x[0]===SV.vista) || vs[0];
    const q = SV.q.toLowerCase();
    const xs = v[2].filter(t=>!q || `${t.num} ${t.asunto} ${t.emp} ${t.solicitante&&t.solicitante.n} ${(t.etiquetas||[]).join(' ')}`.toLowerCase().includes(q))
      .sort((a,b)=>{ const sa = slaInfo(a), sb = slaInfo(b); if(sa && sa.vencido && !(sb && sb.vencido)) return -1; if(sb && sb.vencido && !(sa && sa.vencido)) return 1; return String(b.actualizado).localeCompare(String(a.actualizado)); });
    return `<div class="mz">
      <nav class="vw card" aria-label="Vistas">${vs.map(x=>x[0]==='sep' ? '<div class="sep"></div>' : `<button data-sa="vista" data-id="${x[0]}" aria-current="${SV.vista===x[0]}">${e(x[1])}<i>${x[2].length}</i></button>`).join('')}
        <div class="sep"></div><button data-sa="macros">Respuestas guardadas<i>${(CFG.macros||[]).length}</i></button></nav>
      <div class="card"><div class="ch"><div><h2>${e(v[1])}</h2><p>Cada conversación del chat de la Central es un ticket. Los vencidos salen primero.</p></div>
        <div class="srch" style="min-width:240px;">${ic('search')}<input type="search" data-sf="q" value="${e(SV.q)}" placeholder="Buscar N.°, asunto, empresa o etiqueta" aria-label="Buscar tickets"></div></div>
        ${xs.length ? `<div class="tw"><table class="tk rs"><thead><tr><th>N.°</th><th>Asunto</th><th>Empresa</th><th>Estado</th><th>Prioridad</th><th>Asignado</th><th>Actualizado</th></tr></thead><tbody>
          ${xs.map(t=>{ const s = slaInfo(t); return `<tr class="clk" tabindex="0" data-sa="ver" data-id="${t.id}"><td data-l="N.°" class="nw"><b class="num">#${t.num}</b></td><td data-l="Asunto"><b>${e(t.asunto)}</b><small>${e(T_TIPOS[t.tipo]||'')}${s?` · <span style="color:var(--${s.vencido?'bad':'warn'}-ink)">${e(s.txt)}</span>`:''}</small></td><td data-l="Empresa"><b>${e(t.emp)}</b><small>${e((t.solicitante||{}).n||'')}</small></td><td data-l="Estado">${pill(T_ESTADOS,t.estado)}</td><td data-l="Prioridad">${pill(T_PRIOR,t.prioridad)}</td><td data-l="Asignado">${t.asignado?e(nombreStaff(t.asignado)):'<span class="sub">Sin asignar</span>'}</td><td data-l="Actualizado" class="nw">${e(hace(t.actualizado))}</td></tr>`; }).join('')}
        </tbody></table></div>` : `<p class="vac">No hay tickets en esta vista.</p>`}
      </div></div>`;
  }
  function detalleTicket(t){
    const s = slaInfo(t), ro = !can('tickets');
    const cli = (O.clientes||[]).find(c=>c.nombre===t.emp);
    const macros = CFG.macros || [];
    const bor = SV.borrador[t.id] || '';
    const msgs = (t.msgs||[]).map(m=>{
      if(m.de==='sistema') return `<div class="ms sy">${e(m.t)} · ${e(fTs(m.at))}</div>`;
      const ag = m.de==='agente';
      return `<article class="ms ${m.interna?'nt':ag?'ag':''}"><header><span class="av ${ag?'':'real'}">${e(ini(m.n))}</span><b>${e(m.n||'')}</b>${m.interna?`<span class="pill wa">${ic('lock',12)} Nota interna</span>`:ag?'<span class="pill in">Equipo Vittkly</span>':''}<span style="margin-left:auto">${e(fTs(m.at))}</span></header><div class="tx">${e(m.t)}</div></article>`;
    }).join('');
    return `<div class="row"><button class="btn s g" data-sa="volver">${ic('back')} Volver a ${e((vistas().find(x=>x[0]===SV.vista)||[0,'la lista'])[1])}</button></div>
    <div class="tdet">
      <aside class="props">
        <div class="card"><div class="dh"><div><h3>#${t.num} · ${e(t.asunto)}</h3><p class="sub">${e(t.emp)} · ${e((t.solicitante||{}).n||'')}</p></div></div>
          ${s?`<p style="margin-top:8px;"><span class="pill ${s.cls}">${e(s.txt)}</span></p>`:''}
          <div class="fr" style="grid-template-columns:1fr;margin-top:10px;">
            <div class="f"><label for="pEst">Estado</label><select id="pEst" data-sf="estado" ${ro?'disabled':''}>${selOpts(T_ESTADOS,t.estado)}</select></div>
            <div class="f"><label for="pPri">Prioridad</label><select id="pPri" data-sf="prioridad" ${ro?'disabled':''}>${selOpts(T_PRIOR,t.prioridad)}</select></div>
            <div class="f"><label for="pTip">Tipo</label><select id="pTip" data-sf="tipo" ${ro?'disabled':''}>${selOpts(T_TIPOS,t.tipo)}</select></div>
            <div class="f"><label for="pAsg">Asignado a</label><select id="pAsg" data-sf="asignado" ${ro?'disabled':''}><option value="">Sin asignar</option>${(O.staff||[]).filter(x=>x.estado!=='inactivo').map(x=>`<option value="${x.id}" ${t.asignado===x.id?'selected':''}>${e(x.nombre)}</option>`).join('')}</select>${!t.asignado && !ro?`<button class="lnk" style="margin-top:4px" data-sa="tomar">Asignármelo</button>`:''}</div>
            <div class="f"><label for="pEtq">Etiquetas</label><input type="text" id="pEtq" data-sf="etiquetas" value="${e((t.etiquetas||[]).join(', '))}" placeholder="facturación, sunat…" ${ro?'disabled':''}><small>Sepáralas con comas.</small></div>
          </div></div>
        <div class="card"><p class="sec">Cliente</p><dl class="dl"><div><dt>Empresa</dt><dd>${e(t.emp)}</dd></div><div><dt>Plan</dt><dd>${e(cli&&cli.plan||'—')}</dd></div><div><dt>Soporte del plan</dt><dd>${e(cli&&cli.soporte||'—')}</dd></div><div><dt>Pantalla</dt><dd>${e(t.pantalla||'—')}</dd></div><div><dt>Creado</dt><dd>${e(fTs(t.creado))}</dd></div><div><dt>Satisfacción</dt><dd>${t.csat&&t.csat.v ? (t.csat.v==='buena'?'Buena':'Mala') + (t.csat.c?` · «${e(t.csat.c)}»`:'') : '—'}</dd></div></dl></div>
      </aside>
      <section class="thread" aria-label="Conversación">
        ${msgs}
        ${ro ? '' : `<div class="cmp ${SV.modoNota?'nt':''}">
          <div class="ct" role="group" aria-label="Tipo de mensaje"><button data-sa="modo" data-id="pub" aria-pressed="${!SV.modoNota}">Respuesta pública</button><button data-sa="modo" data-id="nota" aria-pressed="${SV.modoNota}">${ic('lock',13)} Nota interna</button></div>
          <label for="cTx" class="sr" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Mensaje</label>
          <textarea id="cTx" data-sf="borrador" placeholder="${SV.modoNota?'Solo la ve el equipo de Vittkly':'El cliente la ve en el chat de su Central'}">${e(bor)}</textarea>
          <div class="cf"><select data-sf="macro" aria-label="Usar respuesta guardada" style="width:auto;max-width:260px;"><option value="">Usar respuesta guardada…</option>${macros.map(x=>`<option value="${x.id}">${e(x.n)}</option>`).join('')}</select>
            <div class="split"><button class="btn p" data-sa="enviar">${SV.modoNota?'Guardar nota':'Enviar'}</button><select data-sf="enviarComo" aria-label="Enviar y dejar el ticket como">${['abierto','pendiente','espera','resuelto'].map(k=>`<option value="${k}" ${k===(SV.como||(t.estado==='nuevo'?'pendiente':t.estado==='cerrado'?'abierto':t.estado))?'selected':''}>como ${e(T_ESTADOS[k][0])}</option>`).join('')}</select></div></div>
        </div>`}
      </section>
    </div>`;
  }
  async function guardarT(t, log){ t.actualizado = ahora(); if(log) t.msgs.push({ id:uid('m'), de:'sistema', t:log, at:t.actualizado }); try{ await D.guardarTicket(t); }catch(err){ console.error(err); toast('No se pudo guardar el ticket.'); } }
  async function pintarMacros(){
    const lst = () => (CFG.macros||[]).map(x=>`<li><div><b>${e(x.n)}</b><small>${e(x.t.slice(0,90))}${x.t.length>90?'…':''} · deja el ticket ${e((T_ESTADOS[x.estado]||['Abierto'])[0])}</small></div><button class="btn s d" data-mdel="${x.id}">Quitar</button></li>`).join('');
    const mb = modalEn(root, 'Respuestas guardadas', 'Textos listos para responder rápido. {nombre} se cambia por el nombre del cliente.', `<ul class="lst" id="mcL">${lst()}</ul>
      <p class="sec" style="margin-top:6px">Nueva respuesta</p><div class="f"><label for="mcN">Nombre</label><input type="text" id="mcN" maxlength="60"></div><div class="f"><label for="mcT">Texto</label><textarea id="mcT"></textarea></div><div class="f"><label for="mcE">Deja el ticket</label><select id="mcE">${selOpts({ abierto:T_ESTADOS.abierto, pendiente:T_ESTADOS.pendiente, espera:T_ESTADOS.espera, resuelto:T_ESTADOS.resuelto }, 'pendiente')}</select></div>`,
      'Agregar respuesta', async mb=>{ const n = val(mb,'#mcN'), t = val(mb,'#mcT'); if(!n || !t) return 'Escribe el nombre y el texto.'; CFG.macros.push({ id:uid('m'), n, t, estado:val(mb,'#mcE') }); await D.guardarConfig(CFG); toast('Respuesta guardada.'); });
    mb.addEventListener('click', async ev=>{ const b = ev.target.closest('[data-mdel]'); if(!b) return; CFG.macros = CFG.macros.filter(x=>x.id!==b.dataset.mdel); await D.guardarConfig(CFG); mb.querySelector('#mcL').innerHTML = lst(); });
  }

  /* ---------------- COMUNIDAD (administración) ---------------- */
  function pintarComunidad(){
    const sinResp = P.filter(p=>p.tipo==='pregunta' && p.estado!=='oculto' && !(p.respuestas||[]).some(r=>r.staff && !r.oculta) && !p.solucion);
    const ideasNuevas = I.filter(i=>i.estado==='nueva' && !i.fusionadaEn);
    const subs = [['preguntas','Preguntas', sinResp.length], ['pubs','Casos, prácticas y novedades', 0], ['ideas','Ideas y roadmap', ideasNuevas.length]];
    const ro = !can('comunidad');
    let body = '';
    if(SV.cmSub==='preguntas') body = SV.cmSel ? detPregunta(P.find(p=>p.id===SV.cmSel), ro) : lstPreguntas(sinResp, ro);
    else if(SV.cmSub==='pubs') body = lstPubs(ro);
    else body = tableroIdeas(ro);
    wrap().innerHTML = `<div class="kps">
        <div class="kp"><span>Preguntas sin respuesta</span><b>${sinResp.length}</b><small>Sin respuesta del equipo ni solución</small></div>
        <div class="kp"><span>Ideas nuevas</span><b>${ideasNuevas.length}</b><small>Por revisar</small></div>
        <div class="kp"><span>Publicaciones</span><b>${P.filter(p=>p.tipo!=='pregunta' && p.estado==='publicado').length}</b><small>Casos, prácticas y novedades</small></div>
        <div class="kp"><span>Participación</span><b>${P.filter(p=>p.tipo==='pregunta').length + I.length}</b><small>Preguntas e ideas de usuarios</small></div></div>
      ${ro?'<div class="note wa">Tu rol puede ver la Comunidad, pero no publicar ni moderar.</div>':''}
      <nav class="chips" aria-label="Secciones de la Comunidad">${subs.map(([k,l,n])=>`<button class="chip" data-sa="cmsub" data-id="${k}" aria-pressed="${SV.cmSub===k}">${e(l)}${n?` <i>${n}</i>`:''}</button>`).join('')}</nav>${body}`;
  }
  function lstPreguntas(sinResp, ro){
    const f = SV.cmF;
    const xs = P.filter(p=>p.tipo==='pregunta').filter(p=> f==='sin' ? sinResp.includes(p) : f==='ocultas' ? p.estado==='oculto' : p.estado!=='oculto').sort((a,b)=>String(b.at).localeCompare(String(a.at)));
    return `<div class="card"><div class="ch"><div><h2>Preguntas de los usuarios</h2><p>Responde como equipo Vittkly: tu respuesta sale marcada como oficial. Oculta lo que no corresponda.</p></div>
      <div class="chips">${[['sin','Sin respuesta'],['todas','Todas'],['ocultas','Ocultas']].map(([k,l])=>`<button class="chip" data-sa="cmf" data-id="${k}" aria-pressed="${f===k}">${l}</button>`).join('')}</div></div>
      <div class="feed">${xs.length ? xs.map(p=>`<button class="po" data-sa="cmver" data-id="${p.id}"><span class="cnt">${(p.respuestas||[]).filter(r=>!r.oculta).length}<small>resp.</small></span><span style="min-width:0;flex:1"><h3>${e(p.titulo)}</h3><p>${e(p.cuerpo)}</p><span class="meta"><span class="pill">${e(p.modulo||'General')}</span>${p.solucion?'<span class="pill ok">Resuelta</span>':''}${p.estado==='oculto'?'<span class="pill r">Oculta</span>':''}<span>${e((p.autor||{}).n||'')} · ${e((p.autor||{}).emp||'')} · ${e(hace(p.at))}</span></span></span></button>`).join('') : '<p class="vac">No hay preguntas aquí.</p>'}</div></div>`;
  }
  function detPregunta(p, ro){
    if(!p) { SV.cmSel = null; return ''; }
    const rs = (p.respuestas||[]);
    return `<div class="row"><button class="btn s g" data-sa="cmvolver">${ic('back')} Volver a preguntas</button></div>
      <div class="card art" style="max-width:none"><div class="dh"><div><p class="sub">${e(p.modulo||'General')} · ${e((p.autor||{}).n||'')} (${e((p.autor||{}).emp||'')}) · ${e(fTs(p.at))}</p><h2 style="margin-top:4px">${e(p.titulo)}</h2></div>
        ${ro?'':`<div class="row"><button class="btn s" data-sa="pfijar" data-id="${p.id}">${p.fijado?'Quitar de destacados':'Destacar'}</button><button class="btn s ${p.estado==='oculto'?'':'d'}" data-sa="pocultar" data-id="${p.id}">${p.estado==='oculto'?'Volver a mostrar':'Ocultar pregunta'}</button></div>`}</div>
        <div class="body" style="margin-top:8px">${fmt(p.cuerpo)}</div></div>
      <div class="thread">${rs.map(r=>`<div class="ans ${r.staff?'of':''} ${p.solucion===r.id?'sol':''}" style="${r.oculta?'opacity:.5':''}"><header><b>${e(r.n)}</b><span>${e(r.emp||'')}</span>${r.staff?'<span class="pill in">Equipo Vittkly</span>':''}${p.solucion===r.id?'<span class="pill ok">Solución</span>':''}${r.oculta?'<span class="pill r">Oculta</span>':''}<span>· ${e(hace(r.at))} · ${(r.util||[]).length} útil</span></header><div class="body">${fmt(r.t)}</div>
        ${ro?'':`<div class="row" style="margin-top:6px"><button class="lnk" data-sa="psol" data-id="${r.id}">${p.solucion===r.id?'Quitar solución':'Marcar como solución'}</button><button class="lnk" data-sa="rocultar" data-id="${r.id}">${r.oculta?'Mostrar':'Ocultar'}</button></div>`}</div>`).join('') || '<p class="sub">Todavía nadie respondió.</p>'}
      ${ro?'':`<div class="cmp"><div class="ct"><button aria-pressed="true">Responder como Equipo Vittkly</button></div><textarea id="pRsp" placeholder="Tu respuesta es pública y sale marcada como oficial."></textarea><div class="cf"><span class="sub">Admite párrafos, viñetas con «- » y **negritas**.</span><button class="btn p" data-sa="presp" data-id="${p.id}">Publicar respuesta</button></div></div>`}</div>`;
  }
  function lstPubs(ro){
    const xs = P.filter(p=>p.tipo!=='pregunta').sort((a,b)=>(b.fijado?1:0)-(a.fijado?1:0) || String(b.at).localeCompare(String(a.at)));
    return `<div class="card"><div class="ch"><div><h2>Casos de éxito, buenas prácticas y novedades</h2><p>Lo publica el equipo de Vittkly. Las novedades cuentan las mejoras de cada módulo en cada versión.</p></div>${ro?'':'<button class="btn p" data-sa="pnueva">Nueva publicación</button>'}</div>
      <div class="tw"><table class="rs"><thead><tr><th>Título</th><th>Tipo</th><th>Módulo</th><th>Estado</th><th>Fecha</th><th></th></tr></thead><tbody>${xs.map(p=>`<tr><td data-l="Título"><b>${p.fijado?`<span class="fijo" title="Destacado">${ic('pin',13)}</span> `:''}${e(p.titulo)}</b>${p.version?`<small class="sub"> · Versión ${e(p.version)}</small>`:''}</td><td data-l="Tipo">${pill(P_TIPOS,p.tipo)}</td><td data-l="Módulo">${e(p.modulo||'General')}</td><td data-l="Estado"><span class="pill ${p.estado==='publicado'?'ok':p.estado==='oculto'?'r':''}">${p.estado==='publicado'?'Publicado':p.estado==='oculto'?'Oculto':'Borrador'}</span></td><td data-l="Fecha" class="nw">${e(fF(p.at))}</td><td class="r nl">${ro?'':`<button class="btn s" data-sa="peditar" data-id="${p.id}">Editar</button> <button class="btn s d" data-sa="pborrar" data-id="${p.id}">Eliminar</button>`}</td></tr>`).join('') || '<tr><td colspan="6" class="vac">Todavía no hay publicaciones.</td></tr>'}</tbody></table></div></div>`;
  }
  function tableroIdeas(ro){
    const vivas = I.filter(i=>!i.fusionadaEn);
    return `<div class="card"><div class="ch"><div><h2>Ideas y roadmap</h2><p>Mueve cada idea por su estado y deja una respuesta oficial: los usuarios la ven en Ideas y votos. Las más votadas van primero.</p></div></div>
      <div class="kb">${Object.entries(I_ESTADOS).map(([k,[l]])=>{ const xs = vivas.filter(i=>(i.estado||'nueva')===k).sort((a,b)=>(b.votos||[]).length-(a.votos||[]).length); return `<section class="kc" aria-label="${e(l)}"><h4>${e(l)}<span>${xs.length}</span></h4>${xs.map(i=>`<button class="ki" data-sa="iver" data-id="${i.id}"><b>${e(i.titulo)}</b><small>${(i.votos||[]).length} votos · ${e(i.modulo||'General')}</small><small>${e((i.autor||{}).emp||'')}${i.respuesta?' · con respuesta oficial':''}</small></button>`).join('')}</section>`; }).join('')}</div></div>`;
  }
  function editarPost(p){
    const n = !p; p = p || { id:uid('p'), tipo:'caso', titulo:'', cuerpo:'', modulo:'General', estado:'publicado', fijado:false, at:ahora(), autor:{ n:yo.nombre, emp:'Vittkly', staff:true } };
    modalEn(root, n ? 'Nueva publicación' : 'Editar publicación', 'Se muestra en la Comunidad de todas las empresas.', `
      <div class="fr"><div class="f"><label for="ptT">Tipo</label><select id="ptT">${selOpts({ caso:P_TIPOS.caso, practica:P_TIPOS.practica, novedad:P_TIPOS.novedad }, p.tipo)}</select></div>
      <div class="f"><label for="ptM">Módulo</label><select id="ptM">${modOpts(p.modulo)}</select></div>
      <div class="f"><label for="ptV">Versión (novedades)</label><input type="text" id="ptV" value="${e(p.version||'')}" placeholder="Ej.: v164"></div></div>
      <div class="f"><label for="ptTi">Título</label><input type="text" id="ptTi" maxlength="120" value="${e(p.titulo)}"></div>
      <div class="f"><label for="ptR">Resumen</label><input type="text" id="ptR" maxlength="200" value="${e(p.resumen||'')}" placeholder="Una línea que se ve en la lista"></div>
      <div class="f"><label for="ptC">Contenido</label><textarea id="ptC" style="min-height:180px">${e(p.cuerpo)}</textarea><small>Párrafos separados por una línea en blanco, viñetas con «- » y **negritas**.</small></div>
      <div class="row"><label class="chk"><input type="checkbox" id="ptF" ${p.fijado?'checked':''}> Destacar en el inicio de la Comunidad</label>
      <label class="chk"><input type="checkbox" id="ptB" ${p.estado==='borrador'?'checked':''}> Guardar como borrador</label></div>`, n ? 'Publicar' : 'Guardar', async mb=>{
        const t = val(mb,'#ptTi'), c = val(mb,'#ptC'); if(!t || !c) return 'Escribe el título y el contenido.';
        Object.assign(p, { tipo:val(mb,'#ptT'), modulo:val(mb,'#ptM'), version:val(mb,'#ptV'), titulo:t, resumen:val(mb,'#ptR'), cuerpo:c, fijado:mb.querySelector('#ptF').checked, estado:mb.querySelector('#ptB').checked ? 'borrador' : (p.estado==='oculto'?'oculto':'publicado'), editado:ahora() });
        await D.guardarPost(p); if(n) P.push(p); toast(n ? 'Publicado en la Comunidad.' : 'Cambios guardados.'); pintarComunidad();
      }, { ancho:680 });
  }
  function verIdea(i){
    const vivas = I.filter(x=>!x.fusionadaEn && x.id!==i.id);
    modalEn(root, i.titulo, `${(i.votos||[]).length} votos · ${(i.autor||{}).n||''} (${(i.autor||{}).emp||''}) · ${fF(i.at)}`, `
      <div class="note"><b>${e(I_TIPOS[i.tipo]||'Idea')} · ${e(i.modulo||'General')}</b><br>${e(i.detalle||'Sin detalle.')}</div>
      ${(i.comentarios||[]).length ? `<p class="sec">Comentarios</p><ul class="lst">${i.comentarios.map(c=>`<li><div><b>${e(c.n)}</b> <small>${e(c.emp||'')} · ${e(hace(c.at))}</small><small style="color:var(--ink)">${e(c.t)}</small></div></li>`).join('')}</ul>` : ''}
      <div class="f"><label for="iE">Estado</label><select id="iE" ${can('comunidad')?'':'disabled'}>${selOpts(I_ESTADOS, i.estado||'nueva')}</select></div>
      <div class="f"><label for="iR">Respuesta oficial</label><textarea id="iR" ${can('comunidad')?'':'disabled'} placeholder="Qué haremos con esta idea y cuándo, o por qué no.">${e((i.respuesta||{}).t||'')}</textarea></div>
      <div class="f"><label for="iF">Fusionar con otra idea (duplicada)</label><select id="iF" ${can('comunidad')?'':'disabled'}><option value="">No fusionar</option>${vivas.map(x=>`<option value="${x.id}">${e(x.titulo)} (${(x.votos||[]).length})</option>`).join('')}</select><small>Los votos pasan a la idea elegida y esta deja de verse.</small></div>`,
      can('comunidad') ? 'Guardar' : '', async mb=>{
        const est = val(mb,'#iE'), r = val(mb,'#iR'), f = val(mb,'#iF');
        if(f){ const d = I.find(x=>x.id===f); d.votos = [...new Set([...(d.votos||[]), ...(i.votos||[])])]; d.comentarios = [...(d.comentarios||[]), { n:'Equipo Vittkly', emp:'Vittkly', t:`Se unió la idea «${i.titulo}».`, at:ahora() }]; i.fusionadaEn = f; await D.guardarIdea(d); }
        i.estado = est; if(r && r !== (i.respuesta||{}).t) i.respuesta = { t:r, n:yo.nombre, at:ahora() }; if(!r) i.respuesta = null;
        await D.guardarIdea(i); toast('Idea actualizada.'); pintarComunidad();
      }, { ancho:620 });
  }

  /* ---------------- CENTRO DE AYUDA (guías y cápsulas) ---------------- */
  function pintarAyuda(){
    const ro = !can('comunidad');
    const xs = [...G].sort((a,b)=>String(a.modulo||'').localeCompare(String(b.modulo||'')) || (a.orden||0)-(b.orden||0));
    wrap().innerHTML = `<div class="kps"><div class="kp"><span>Publicadas</span><b>${G.filter(g=>g.estado==='publicado').length}</b><small>Guías y cápsulas visibles</small></div><div class="kp"><span>Borradores</span><b>${G.filter(g=>g.estado!=='publicado').length}</b><small>Aún no se ven</small></div><div class="kp"><span>Cápsulas de video</span><b>${G.filter(g=>g.tipo==='capsula').length}</b><small>Con video</small></div></div>
      ${ro?'<div class="note wa">Tu rol puede ver el Centro de ayuda, pero no editarlo.</div>':''}
      <div class="card"><div class="ch"><div><h2>Guías y cápsulas del Centro de ayuda</h2><p>Lo que publiques aquí aparece en el Centro de ayuda de todas las empresas, junto a los manuales. Si eliges perfiles, solo lo ven esas personas. La guía del módulo donde está el usuario sale primero.</p></div>${ro?'':'<button class="btn p" data-sa="gnueva">Nueva guía o cápsula</button>'}</div>
      <div class="tw"><table class="rs"><thead><tr><th>Título</th><th>Tipo</th><th>Módulo</th><th>Para</th><th>Estado</th><th></th></tr></thead><tbody>${xs.map(g=>`<tr><td data-l="Título"><b>${e(g.titulo)}</b>${g.resumen?`<small class="sub" style="display:block">${e(g.resumen)}</small>`:''}</td><td data-l="Tipo">${g.tipo==='capsula'?'<span class="pill v">Cápsula de video</span>':'<span class="pill in">Guía</span>'}</td><td data-l="Módulo">${e(g.modulo||'General')}</td><td data-l="Para">${(g.perfiles||[]).length ? e(g.perfiles.map(k=>(PERFILES_L[k]||k)).join(', ')) : 'Todos'}</td><td data-l="Estado"><span class="pill ${g.estado==='publicado'?'ok':''}">${g.estado==='publicado'?'Publicada':'Borrador'}</span></td><td class="r nl">${ro?'':`<button class="btn s" data-sa="gestado" data-id="${g.id}">${g.estado==='publicado'?'Pasar a borrador':'Publicar'}</button> <button class="btn s" data-sa="geditar" data-id="${g.id}">Editar</button> <button class="btn s d" data-sa="gborrar" data-id="${g.id}">Eliminar</button>`}</td></tr>`).join('') || '<tr><td colspan="6" class="vac">Todavía no hay guías.</td></tr>'}</tbody></table></div></div>`;
  }
  function editarGuia(g){
    const n = !g; g = g || { id:uid('g'), tipo:'guia', titulo:'', resumen:'', modulo:'General', cuerpo:'', video:'', perfiles:[], estado:'publicado', orden:0, at:ahora() };
    modalEn(root, n ? 'Nueva guía o cápsula' : 'Editar guía', 'Aparece en el Centro de ayuda de la Central.', `
      <div class="fr"><div class="f"><label for="gT">Tipo</label><select id="gT"><option value="guia" ${g.tipo!=='capsula'?'selected':''}>Guía escrita</option><option value="capsula" ${g.tipo==='capsula'?'selected':''}>Cápsula de video</option></select></div>
        <div class="f"><label for="gM">Módulo</label><select id="gM">${modOpts(g.modulo)}</select></div>
        <div class="f"><label for="gO">Orden</label><input type="number" id="gO" value="${e(g.orden||0)}" min="0" max="99"></div></div>
      <div class="f"><label for="gTi">Título</label><input type="text" id="gTi" maxlength="120" value="${e(g.titulo)}" placeholder="Ej.: Cómo emitir una nota de crédito"></div>
      <div class="f"><label for="gR">Resumen</label><input type="text" id="gR" maxlength="200" value="${e(g.resumen||'')}" placeholder="Una línea que se ve en la lista"></div>
      <div class="f"><label for="gV">Video (enlace)</label><input type="text" id="gV" value="${e(g.video||'')}" placeholder="Enlace de YouTube, Vimeo o un archivo MP4"><small>En las cápsulas, el video va arriba del texto.</small></div>
      <div class="f"><label for="gC">Contenido</label><textarea id="gC" style="min-height:170px">${e(g.cuerpo)}</textarea><small>Párrafos separados por una línea en blanco, pasos con «1. », viñetas con «- » y **negritas**.</small></div>
      <div class="f"><span class="lb">Para quién (vacío = todos los perfiles)</span><div class="chips">${Object.entries(PERFILES_L).map(([k,l])=>`<label class="chk"><input type="checkbox" data-gp="${k}" ${(g.perfiles||[]).includes(k)?'checked':''}> ${e(l)}</label>`).join('')}</div></div>
      <label class="chk"><input type="checkbox" id="gB" ${g.estado!=='publicado'?'checked':''}> Guardar como borrador</label>`, n ? 'Publicar' : 'Guardar', async mb=>{
        const t = val(mb,'#gTi'), c = val(mb,'#gC'), v = val(mb,'#gV'), tipo = val(mb,'#gT');
        if(!t) return 'Escribe el título.'; if(tipo==='capsula' && !v) return 'Una cápsula necesita el enlace del video.'; if(tipo!=='capsula' && !c) return 'Escribe el contenido de la guía.';
        Object.assign(g, { tipo, modulo:val(mb,'#gM'), orden:Number(val(mb,'#gO'))||0, titulo:t, resumen:val(mb,'#gR'), video:v, cuerpo:c, perfiles:[...mb.querySelectorAll('[data-gp]:checked')].map(x=>x.dataset.gp), estado:mb.querySelector('#gB').checked?'borrador':'publicado', editado:ahora(), autor:yo.nombre });
        await D.guardarAyuda(g); if(n) G.push(g); toast(n ? 'Publicada en el Centro de ayuda.' : 'Cambios guardados.'); pintarAyuda();
      }, { ancho:700 });
  }

  /* ---------------- eventos ---------------- */
  root.addEventListener('click', async ev=>{
    const b = ev.target.closest('[data-sa]'); if(!b || b.closest('.mb')) return;
    const a = b.dataset.sa, id = b.dataset.id;
    const t = SV.sel && T.find(x=>x.id===SV.sel);
    if(a==='vista'){ SV.vista = id; SV.sel = null; return pintarSoporte(); }
    if(a==='ver'){ SV.sel = id; SV.como = null; return pintarSoporte(); }
    if(a==='volver'){ SV.sel = null; T = await D.tickets(); return pintarSoporte(); }
    if(a==='macros') return pintarMacros();
    if(a==='avisos'){ try{ const r = await Notification.requestPermission(); toast(r==='granted' ? 'Listo: te avisaremos cuando entre un ticket.' : 'No se activaron los avisos del navegador.'); }catch(err){} return pintarSoporte(); }
    if(a==='gnueva') return editarGuia(null);
    if(a==='geditar') return editarGuia(G.find(x=>x.id===id));
    if(a==='gborrar'){ const g = G.find(x=>x.id===id); modalEn(root, '¿Eliminar la guía?', g.titulo, '<p class="sub">Desaparece del Centro de ayuda de todas las empresas.</p>', 'Eliminar', async ()=>{ await D.borrarAyuda(id); G = G.filter(x=>x.id!==id); pintarAyuda(); }, { peligro:true }); return; }
    if(a==='gestado'){ const g = G.find(x=>x.id===id); g.estado = g.estado==='publicado' ? 'borrador' : 'publicado'; await D.guardarAyuda(g); return pintarAyuda(); }
    if(a==='modo'){ SV.modoNota = id==='nota'; return pintarSoporte(); }
    if(a==='tomar' && t){ t.asignado = yo.id; if(t.estado==='nuevo') t.estado = 'abierto'; await guardarT(t, `${yo.nombre} tomó el ticket`); return pintarSoporte(); }
    if(a==='enviar' && t){
      const tx = String(SV.borrador[t.id]||'').trim(); if(!tx){ toast('Escribe un mensaje.'); return; }
      const como = root.querySelector('[data-sf="enviarComo"]').value;
      const fresco = await D.ticket(t.id) || t; Object.assign(t, fresco, { estado:t.estado, prioridad:t.prioridad, tipo:t.tipo, asignado:t.asignado, etiquetas:t.etiquetas });
      t.msgs.push({ id:uid('m'), de:'agente', interna:!!SV.modoNota, t:tx, n:yo.nombre, uid:yo.id, at:ahora() });
      if(!SV.modoNota){ if(!t.primeraResp) t.primeraResp = ahora(); if(!t.asignado) t.asignado = yo.id; const antes = t.estado; t.estado = como; if(como==='resuelto' && antes!=='resuelto') t.resueltoAt = ahora(); if(como!=='resuelto') t.resueltoAt = null; }
      SV.borrador[t.id] = ''; SV.como = null; await guardarT(t); toast(SV.modoNota ? 'Nota interna guardada.' : `Respuesta enviada. Ticket ${T_ESTADOS[t.estado][0].toLowerCase()}.`); return pintarSoporte();
    }
    if(a==='cmsub'){ SV.cmSub = id; SV.cmSel = null; return pintarComunidad(); }
    if(a==='cmf'){ SV.cmF = id; return pintarComunidad(); }
    if(a==='cmver'){ SV.cmSel = id; return pintarComunidad(); }
    if(a==='cmvolver'){ SV.cmSel = null; P = await D.posts(); return pintarComunidad(); }
    const p = SV.cmSel && P.find(x=>x.id===SV.cmSel);
    if(a==='pfijar' || a==='pocultar'){ const q = P.find(x=>x.id===id); if(a==='pfijar') q.fijado = !q.fijado; else q.estado = q.estado==='oculto' ? 'publicado' : 'oculto'; await D.guardarPost(q); return pintarComunidad(); }
    if(a==='psol' && p){ p.solucion = p.solucion===id ? null : id; await D.guardarPost(p); return pintarComunidad(); }
    if(a==='rocultar' && p){ const r = p.respuestas.find(x=>x.id===id); r.oculta = !r.oculta; await D.guardarPost(p); return pintarComunidad(); }
    if(a==='presp' && p){ const tx = (root.querySelector('#pRsp')||{}).value||''; if(!tx.trim()){ toast('Escribe la respuesta.'); return; } p.respuestas = p.respuestas||[]; p.respuestas.push({ id:uid('r'), t:tx.trim(), n:yo.nombre, emp:'Vittkly', staff:true, at:ahora(), util:[] }); await D.guardarPost(p); toast('Respuesta publicada.'); return pintarComunidad(); }
    if(a==='pnueva') return editarPost(null);
    if(a==='peditar') return editarPost(P.find(x=>x.id===id));
    if(a==='pborrar'){ const q = P.find(x=>x.id===id); modalEn(root, '¿Eliminar la publicación?', q.titulo, '<p class="sub">Desaparece de la Comunidad de todas las empresas. No se puede deshacer.</p>', 'Eliminar', async ()=>{ await D.borrarPost(id); P = P.filter(x=>x.id!==id); pintarComunidad(); }, { peligro:true }); return; }
    if(a==='iver') return verIdea(I.find(x=>x.id===id));
  });
  root.addEventListener('keydown', ev=>{ const tr = ev.target.closest && ev.target.closest('tr[data-sa]'); if(tr && (ev.key==='Enter' || ev.key===' ')){ ev.preventDefault(); tr.click(); } });
  root.addEventListener('input', ev=>{ const x = ev.target, f = x.dataset && x.dataset.sf; if(!f) return;
    if(f==='q'){ SV.q = x.value; const pos = x.selectionStart; pintarSoporte(); const n = root.querySelector('[data-sf="q"]'); if(n){ n.focus(); try{ n.setSelectionRange(pos,pos); }catch(err){} } }
    if(f==='borrador' && SV.sel) SV.borrador[SV.sel] = x.value; });
  root.addEventListener('change', async ev=>{ const x = ev.target, f = x.dataset && x.dataset.sf; if(!f) return;
    const t = SV.sel && T.find(z=>z.id===SV.sel); if(!t) return;
    if(f==='enviarComo'){ SV.como = x.value; return; }
    if(f==='macro'){ const m = (CFG.macros||[]).find(z=>z.id===x.value); if(!m) return; const nom = String((t.solicitante||{}).n||'').split(/\s+/)[0]; SV.borrador[t.id] = m.t.replace(/\{nombre\}/g, nom); SV.modoNota = false; SV.como = m.estado; pintarSoporte(); return; }
    if(f==='estado'){ const antes = t.estado; t.estado = x.value; if(x.value==='resuelto') t.resueltoAt = ahora(); await guardarT(t, `${yo.nombre} cambió el estado: ${T_ESTADOS[antes][0]} → ${T_ESTADOS[t.estado][0]}`); }
    if(f==='prioridad'){ t.prioridad = x.value; await guardarT(t, `${yo.nombre} cambió la prioridad a ${T_PRIOR[t.prioridad][0]}`); }
    if(f==='tipo'){ t.tipo = x.value; await guardarT(t); }
    if(f==='asignado'){ t.asignado = x.value || null; if(t.asignado && t.estado==='nuevo') t.estado = 'abierto'; await guardarT(t, t.asignado ? `Asignado a ${nombreStaff(t.asignado)}` : 'Quedó sin asignar'); }
    if(f==='etiquetas'){ t.etiquetas = x.value.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean); await guardarT(t); }
    pintarSoporte();
  });
  return { refrescar: async ()=>{ await cargar(); O.modo==='soporte' ? pintarSoporte() : O.modo==='ayuda' ? pintarAyuda() : pintarComunidad(); } };
}

/* datos de ejemplo para la demostración del panel (solo si no hay nada) */
async function semillaTickets(D, O){
  const cs = (O.clientes||[]).filter(c=>!c.real).slice(0,3);
  if(!cs.length) return [];
  const h = n => new Date(Date.now() - n*3600000).toISOString();
  const xs = [
    { c:cs[0], asunto:'No me llega el WhatsApp de confirmación', tipo:'problema', prioridad:'alta', n:'Rosa Medina', t:'Desde ayer mis clientes no reciben el WhatsApp cuando programo un servicio. ¿Qué pasó?', at:h(6), pant:'Calendario' },
    { c:cs[1], asunto:'¿Cómo emito una nota de crédito?', tipo:'pregunta', prioridad:'normal', n:'Jorge Salas', t:'Un cliente me pidió anular una boleta. ¿Cómo hago la nota de crédito?', at:h(30), pant:'Comprobantes' },
    { c:cs[2] || cs[0], asunto:'Quiero pasarme al plan anual', tipo:'cuenta', prioridad:'baja', n:'Mónica Ríos', t:'Hola, ¿si me paso al plan anual me descuentan lo que ya pagué este mes?', at:h(2), pant:'Plan y cuenta' }
  ];
  const out = [];
  for(const x of xs){
    const t = await D.crearTicket({ empId:'demo_'+x.c.id, emp:x.c.nombre, n:x.n, uid:'demo', asunto:x.asunto, tipo:x.tipo, prioridad:x.prioridad, t:x.t, pantalla:x.pant });
    t.creado = t.actualizado = t.msgs[0].at = x.at; t.demo = true; await D.guardarTicket(t); out.push(t);
  }
  return out;
}
async function semillaAyuda(D){
  const g = { id:uid('g'), tipo:'guia', titulo:'Cómo emitir una nota de crédito', resumen:'Para anular o corregir una boleta o factura ya emitida.', modulo:'Finanzas', cuerpo:'Usa una nota de crédito cuando necesitas anular o corregir un comprobante que ya enviaste a SUNAT.\n\n1. Entra a Finanzas › Comprobantes.\n2. Busca el comprobante y elige **Emitir nota de crédito**.\n3. Indica el motivo y el monto, y confirma.\n\n- La nota usa la serie que definiste en Configuraciones › Cotizaciones y cobros.\n- El saldo del cliente se actualiza solo.', video:'', perfiles:['admin','contabilidad'], estado:'publicado', orden:0, at:ahora(), autor:'Equipo Vittkly' };
  await D.guardarAyuda(g); return [g];
}
async function semillaCom(D){
  const at = ahora();
  const xs = [
    { id:uid('p'), tipo:'novedad', version:'v164', modulo:'General', titulo:'Menú nuevo, Comunidad y chat con soporte', resumen:'Grupos plegables, menú contraído, botón Crear y chat con el equipo de Vittkly.', cuerpo:'Ordenamos el menú por grupos: Ventas, Operación, Finanzas, Equipo y Crecimiento. Cada grupo se pliega y puedes contraer el menú a solo íconos.\n\n- El botón **Crear** te deja empezar una cotización o un cliente desde cualquier pantalla.\n- Marketing y Sitio web y reservas ahora están en el menú.\n- La burbuja de abajo a la derecha abre el chat con soporte.', estado:'publicado', fijado:true, at, autor:{ n:'Equipo Vittkly', emp:'Vittkly', staff:true } },
    { id:uid('p'), tipo:'practica', modulo:'Post venta', titulo:'Cómo pedir reseñas sin incomodar al cliente', resumen:'El mejor momento es dentro de las 24 horas después del servicio.', cuerpo:'Pide la reseña cuando el cliente todavía tiene fresco el resultado: idealmente el mismo día o al día siguiente.\n\n- Activa la etapa de agradecimiento en Post venta.\n- Personaliza el mensaje con el nombre del técnico.\n- Agradece cada reseña, buena o mala.', estado:'publicado', fijado:false, at, autor:{ n:'Equipo Vittkly', emp:'Vittkly', staff:true } }
  ];
  for(const p of xs) await D.guardarPost(p);
  return xs;
}

/* =================== COMUNIDAD PARA LOS CLIENTES =================== */
const CV = { tab:'inicio', sel:null, q:'', mod:'', f:'', orden:'votos' };
const C_TABS = [['inicio','Inicio'],['preguntas','Preguntas'],['casos','Casos de éxito'],['practicas','Buenas prácticas'],['ideas','Ideas y votos'],['novedades','Novedades']];
async function comunidad(host, O){
  O = O || {};
  const { root, css } = montarShadow(host);
  const D = data(O.db), toast = O.toast || (m=>console.log(m));
  const yo = O.yo || { uid:'anon', n:'Usuario' }, emp = O.emp || { id:'', nombre:'' };
  root.innerHTML = `${css}<div class="sp m0"><div class="wrap"><p class="sub">Cargando la Comunidad…</p></div></div>`;
  const wrap = () => root.querySelector('.wrap');
  let P = [], I = [];
  const cargar = async () => { [P, I] = await Promise.all([D.posts(), D.ideas()]); P = P.filter(p=>p.estado==='publicado' || (p.tipo==='pregunta' && p.estado!=='oculto' && p.estado!=='borrador')); I = I.filter(i=>!i.fusionadaEn); };
  await cargar();
  const it = window.__vkComIntent; window.__vkComIntent = null;
  if(it && it.tab) CV.tab = it.tab;
  pintar();
  if(it && it.nuevaIdea) nuevaIdea(it.modulo, it.titulo);

  function busca(x){ const q = CV.q.toLowerCase(); return !q || `${x.titulo} ${x.cuerpo||''} ${x.detalle||''} ${x.modulo||''}`.toLowerCase().includes(q); }
  function autorTxt(a){ return `${e((a||{}).n||'')}${(a||{}).emp?` · ${e(a.emp)}`:''}`; }
  function filaPost(p){
    const nr = (p.respuestas||[]).filter(r=>!r.oculta).length;
    return `<button class="po" data-ca="ver" data-id="${p.id}">${p.tipo==='pregunta'?`<span class="cnt">${nr}<small>${nr===1?'respuesta':'respuestas'}</small></span>`:''}<span style="min-width:0;flex:1"><h3>${p.fijado?`<span class="fijo">${ic('pin',13)}</span> `:''}${e(p.titulo)}</h3><p>${e(p.resumen || p.cuerpo)}</p><span class="meta">${pill(P_TIPOS,p.tipo)}<span class="pill">${e(p.modulo||'General')}</span>${p.solucion?'<span class="pill ok">Resuelta</span>':''}${(p.respuestas||[]).some(r=>r.staff&&!r.oculta)?'<span class="pill in">Respondió Vittkly</span>':''}<span>${p.version?`Versión ${e(p.version)} · `:''}${autorTxt(p.autor)} · ${e(hace(p.at))}</span></span></span></button>`;
  }
  function filaIdea(i){
    const v = (i.votos||[]).includes(yo.uid);
    return `<div class="po" style="cursor:default"><button class="vote" data-ca="votar" data-id="${i.id}" aria-pressed="${v}" aria-label="${v?'Quitar voto':'Votar'}: ${e(i.titulo)}">${ic('up')}<span>${(i.votos||[]).length}</span></button><button class="lnk" data-ca="idea" data-id="${i.id}" style="flex:1;min-width:0;text-align:left;color:var(--ink);display:block"><h3>${e(i.titulo)}</h3><p>${e(i.detalle||'')}</p><span class="meta">${pill(I_ESTADOS,i.estado||'nueva')}<span class="pill">${e(i.modulo||'General')}</span>${i.respuesta?'<span class="pill in">Respuesta del equipo</span>':''}<span>${autorTxt(i.autor)} · ${e(hace(i.at))}</span></span></button></div>`;
  }
  function filtros(conMod){
    return `<div class="row" style="justify-content:space-between"><div class="srch" style="flex:1 1 260px;max-width:420px">${ic('search')}<input type="search" data-cf="q" value="${e(CV.q)}" placeholder="Buscar en la Comunidad" aria-label="Buscar en la Comunidad"></div>
      ${conMod?`<select data-cf="mod" aria-label="Módulo" style="width:auto"><option value="">Todos los módulos</option>${MODULOS.map(m=>`<option ${m===CV.mod?'selected':''}>${e(m)}</option>`).join('')}</select>`:''}</div>`;
  }
  function vista(){
    const pub = t => P.filter(p=>p.tipo===t && busca(p) && (!CV.mod || p.modulo===CV.mod)).sort((a,b)=>(b.fijado?1:0)-(a.fijado?1:0) || String(b.at).localeCompare(String(a.at)));
    if(CV.sel){ const p = P.find(x=>x.id===CV.sel); if(p) return detalle(p); CV.sel = null; }
    if(CV.tab==='inicio'){
      const fij = P.filter(p=>p.fijado && p.tipo!=='pregunta').slice(0,3), nov = pub('novedad').slice(0,3), pre = pub('pregunta').slice(0,5), top = [...I].filter(i=>!['publicada','descartada'].includes(i.estado)).sort((a,b)=>(b.votos||[]).length-(a.votos||[]).length).slice(0,4);
      const hay = CV.q && [...P, ...I].filter(busca);
      return `<div class="hero"><h2>Comunidad Vittkly</h2><p class="sub">Pregunta a otros negocios de servicios, aprende de sus casos y vota las mejoras que quieres ver. El equipo de Vittkly modera y responde.</p>
        ${filtros(false)}<div class="row"><button class="btn p" data-ca="preguntar">Hacer una pregunta</button><button class="btn" data-ca="nuevaIdea">Sugerir una mejora</button></div></div>
        ${hay ? `<div class="card"><div class="ch"><h2>Resultados para «${e(CV.q)}»</h2></div><div class="feed">${hay.map(x=>x.votos?filaIdea(x):filaPost(x)).join('') || '<p class="vac">Sin resultados. Prueba con otras palabras o haz una pregunta.</p>'}</div></div>` : `
        ${fij.length?`<div class="feed">${fij.map(filaPost).join('')}</div>`:''}
        <div class="cols2"><div class="card"><div class="ch"><h2>Preguntas recientes</h2><button class="lnk" data-ca="tab" data-id="preguntas">Ver todas</button></div><div class="feed">${pre.map(filaPost).join('') || '<p class="vac">Todavía no hay preguntas. ¡Haz la primera!</p>'}</div></div>
          <div class="wrap"><div class="card"><div class="ch"><h2>Novedades</h2><button class="lnk" data-ca="tab" data-id="novedades">Ver todas</button></div><div class="feed">${nov.map(filaPost).join('') || '<p class="vac">Pronto.</p>'}</div></div>
          <div class="card"><div class="ch"><h2>Ideas más votadas</h2><button class="lnk" data-ca="tab" data-id="ideas">Ver todas</button></div><div class="feed">${top.map(filaIdea).join('') || '<p class="vac">Todavía no hay ideas.</p>'}</div></div></div></div>`}`;
    }
    if(CV.tab==='ideas'){
      const xs = I.filter(i=>busca(i) && (!CV.mod || i.modulo===CV.mod) && (!CV.f || (i.estado||'nueva')===CV.f)).sort((a,b)=> CV.orden==='votos' ? (b.votos||[]).length-(a.votos||[]).length : String(b.at).localeCompare(String(a.at)));
      return `<div class="card"><div class="ch"><div><h2>Ideas y votos</h2><p>Propón mejoras o cuéntanos qué te cuesta usar. Vota las que también te servirían: las más votadas se construyen primero.</p></div><button class="btn p" data-ca="nuevaIdea">Sugerir una mejora</button></div>
        ${filtros(true)}<div class="chips" style="margin:10px 0">${[['', 'Todas'], ...Object.entries(I_ESTADOS).filter(([k])=>k!=='descartada').map(([k,v])=>[k,v[0]])].map(([k,l])=>`<button class="chip" data-ca="if" data-id="${k}" aria-pressed="${CV.f===k}">${e(l)}</button>`).join('')}
          <span style="flex:1"></span><button class="chip" data-ca="orden" data-id="votos" aria-pressed="${CV.orden==='votos'}">Más votadas</button><button class="chip" data-ca="orden" data-id="nuevas" aria-pressed="${CV.orden!=='votos'}">Más nuevas</button></div>
        <div class="feed">${xs.map(filaIdea).join('') || '<p class="vac">No hay ideas con estos filtros.</p>'}</div></div>`;
    }
    const conf = { preguntas:['pregunta','Preguntas','Pregunta lo que necesites sobre el uso de Vittkly o la gestión de tu negocio. Otros usuarios y el equipo de Vittkly te responden.', 'Hacer una pregunta'], casos:['caso','Casos de éxito','Cómo otros negocios de servicios resolvieron su operación con Vittkly.'], practicas:['practica','Buenas prácticas','Consejos del equipo de Vittkly para llevar mejor tu operación, ventas y cobros.'], novedades:['novedad','Novedades','Las mejoras que llegan a cada módulo, versión por versión.'] }[CV.tab];
    const xs = pub(conf[0]);
    return `<div class="card"><div class="ch"><div><h2>${e(conf[1])}</h2><p>${e(conf[2])}</p></div>${conf[3]?`<button class="btn p" data-ca="preguntar">${e(conf[3])}</button>`:''}</div>${filtros(true)}<div class="feed" style="margin-top:10px">${xs.map(filaPost).join('') || '<p class="vac">Todavía no hay publicaciones aquí.</p>'}</div></div>`;
  }
  function detalle(p){
    const rs = (p.respuestas||[]).filter(r=>!r.oculta).sort((a,b)=>(p.solucion===b.id?1:0)-(p.solucion===a.id?1:0) || (b.staff?1:0)-(a.staff?1:0) || (b.util||[]).length-(a.util||[]).length);
    const mio = p.autor && p.autor.uid===yo.uid;
    return `<div class="row"><button class="btn s g" data-ca="volver">${ic('back')} Volver</button></div>
      <article class="card art"><p class="sub">${pill(P_TIPOS,p.tipo)} <span class="pill">${e(p.modulo||'General')}</span> ${p.version?`· Versión ${e(p.version)} `:''}· ${autorTxt(p.autor)} · ${e(fF(p.at))}</p><h2 style="margin-top:8px">${e(p.titulo)}</h2><div class="body" style="margin-top:10px">${fmt(p.cuerpo)}</div></article>
      ${p.tipo==='pregunta' ? `<div class="thread art"><p class="sec">${rs.length} ${rs.length===1?'respuesta':'respuestas'}</p>
        ${rs.map(r=>`<div class="ans ${r.staff?'of':''} ${p.solucion===r.id?'sol':''}"><header><b>${e(r.n)}</b><span>${e(r.emp||'')}</span>${r.staff?'<span class="pill in">Equipo Vittkly</span>':''}${p.solucion===r.id?`<span class="pill ok">${ic('check',12)} Solución</span>`:''}<span>· ${e(hace(r.at))}</span></header><div class="body">${fmt(r.t)}</div>
          <div class="row" style="margin-top:6px"><button class="lnk" data-ca="util" data-id="${r.id}" aria-pressed="${(r.util||[]).includes(yo.uid)}">${ic('thumb',14)} Útil (${(r.util||[]).length})</button>${mio?`<button class="lnk" data-ca="sol" data-id="${r.id}">${p.solucion===r.id?'Quitar como solución':'Marcar como solución'}</button>`:''}</div></div>`).join('')}
        <div class="cmp"><div class="ct"><button aria-pressed="true">Tu respuesta</button></div><label for="cRsp" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Tu respuesta</label><textarea id="cRsp" placeholder="Comparte cómo lo haces en tu negocio."></textarea><div class="cf"><span class="sub">Se publica con tu nombre y tu empresa.</span><button class="btn p" data-ca="responder" data-id="${p.id}">Responder</button></div></div></div>` : ''}`;
  }
  function pintar(){
    wrap().innerHTML = `<nav class="tabs" role="tablist" aria-label="Secciones de la Comunidad" style="margin:0">${C_TABS.map(([k,l])=>`<button class="tab" role="tab" aria-selected="${CV.tab===k && !CV.sel}" data-ca="tab" data-id="${k}">${e(l)}</button>`).join('')}</nav>${vista()}`;
  }
  function preguntar(){
    modalEn(root, 'Hacer una pregunta', 'La ven todos los usuarios de Vittkly. Para un problema con tu cuenta, usa mejor el chat con soporte.', `
      <div class="f"><label for="qT">Tu pregunta</label><input type="text" id="qT" maxlength="140" placeholder="Ej.: ¿Cómo organizan la ruta de los técnicos en días con muchos servicios?"></div>
      <div class="f"><label for="qM">Módulo</label><select id="qM">${modOpts('General')}</select></div>
      <div class="f"><label for="qC">Detalle</label><textarea id="qC" placeholder="Cuéntanos tu caso para que te puedan ayudar mejor."></textarea></div>`, 'Publicar pregunta', async mb=>{
      const t = val(mb,'#qT'); if(t.length<8) return 'Escribe tu pregunta (al menos 8 letras).';
      const p = { id:uid('p'), tipo:'pregunta', titulo:t, modulo:val(mb,'#qM'), cuerpo:val(mb,'#qC') || t, estado:'publicado', at:ahora(), autor:{ n:yo.n, uid:yo.uid, emp:emp.nombre }, respuestas:[] };
      await D.guardarPost(p); P.push(p); CV.tab = 'preguntas'; CV.sel = p.id; toast('Pregunta publicada.'); pintar();
    });
  }
  function nuevaIdea(modulo, titulo){
    modalEn(root, 'Sugerir una mejora', 'El equipo de Vittkly la revisa y los demás usuarios pueden votarla.', `
      <div class="f"><label for="iT2">Tipo</label><select id="iT2">${selOpts(I_TIPOS,'mejora')}</select></div>
      <div class="f"><label for="iTi">Título</label><input type="text" id="iTi" maxlength="120" value="${e(titulo||'')}" placeholder="Ej.: Duplicar un trabajo de la semana pasada"></div>
      <div class="f"><label for="iM">Módulo</label><select id="iM">${modOpts(modulo && MODULOS.includes(modulo) ? modulo : 'General')}</select></div>
      <div class="f"><label for="iD">Cuéntanos más</label><textarea id="iD" placeholder="Qué necesitas, para qué y cómo lo haces hoy."></textarea></div>`, 'Enviar idea', async mb=>{
      const t = val(mb,'#iTi'); if(t.length<5) return 'Escribe un título corto para tu idea.';
      const i = { id:uid('i'), tipo:val(mb,'#iT2'), titulo:t, modulo:val(mb,'#iM'), detalle:val(mb,'#iD'), autor:{ n:yo.n, uid:yo.uid, emp:emp.nombre }, at:ahora(), votos:[yo.uid], estado:'nueva', comentarios:[] };
      await D.guardarIdea(i); I.push(i); CV.tab = 'ideas'; CV.sel = null; toast('Gracias. Tu idea ya está en la Comunidad.'); pintar();
    });
  }
  function verIdea(i){
    const mb = modalEn(root, i.titulo, `${(i.votos||[]).length} votos · ${(i.autor||{}).n||''}${(i.autor||{}).emp?` (${i.autor.emp})`:''} · ${fF(i.at)}`, `
      <p>${pill(I_ESTADOS,i.estado||'nueva')} <span class="pill">${e(i.modulo||'General')}</span> <span class="pill">${e(I_TIPOS[i.tipo]||'')}</span></p>
      ${i.detalle?`<div>${fmt(i.detalle)}</div>`:''}
      ${i.respuesta?`<div class="offr"><b>Respuesta del equipo Vittkly</b> · ${e(fF(i.respuesta.at))}<div style="margin-top:4px">${fmt(i.respuesta.t)}</div></div>`:''}
      <p class="sec">Comentarios</p><ul class="lst">${(i.comentarios||[]).map(c=>`<li><div><b>${e(c.n)}</b> <small>${e(c.emp||'')} · ${e(hace(c.at))}</small><small style="color:var(--ink)">${e(c.t)}</small></div></li>`).join('') || '<li><div><small>Sé el primero en comentar cómo te serviría.</small></div></li>'}</ul>
      <div class="f"><label for="icC">Tu comentario</label><textarea id="icC" placeholder="¿Cómo lo usarías en tu negocio?"></textarea></div>`, 'Comentar', async mb=>{
      const t = val(mb,'#icC'); if(!t) return 'Escribe tu comentario.';
      const f = (await D.leer('vk_ideas', i.id)) || i; f.comentarios = [...(f.comentarios||[]), { n:yo.n, emp:emp.nombre, t, at:ahora() }]; await D.guardarIdea(f); Object.assign(i, f); toast('Comentario publicado.'); pintar();
    }, { ancho:600 });
    return mb;
  }

  root.addEventListener('click', async ev=>{
    const b = ev.target.closest('[data-ca]'); if(!b || b.closest('.mb')) return;
    const a = b.dataset.ca, id = b.dataset.id;
    if(a==='tab'){ CV.tab = id; CV.sel = null; CV.f = ''; pintar(); try{ host.scrollIntoView({ block:'start' }); }catch(err){} return; }
    if(a==='ver'){ CV.sel = id; pintar(); return; }
    if(a==='volver'){ CV.sel = null; await cargar(); pintar(); return; }
    if(a==='preguntar') return preguntar();
    if(a==='nuevaIdea') return nuevaIdea();
    if(a==='if'){ CV.f = id; pintar(); return; }
    if(a==='orden'){ CV.orden = id; pintar(); return; }
    if(a==='idea') return verIdea(I.find(x=>x.id===id));
    if(a==='votar'){ const i = I.find(x=>x.id===id); const f = (await D.leer('vk_ideas', id)) || i; f.votos = f.votos||[]; const k = f.votos.indexOf(yo.uid); if(k>=0) f.votos.splice(k,1); else f.votos.push(yo.uid); try{ await D.guardarIdea(f); Object.assign(i, f); }catch(err){ toast('No se pudo registrar tu voto.'); } pintar(); return; }
    const p = CV.sel && P.find(x=>x.id===CV.sel); if(!p) return;
    const fresco = async () => { const f = await D.leer('vk_com', p.id); if(f) Object.assign(p, f); return p; };
    if(a==='responder'){ const tx = (root.querySelector('#cRsp')||{}).value||''; if(!tx.trim()){ toast('Escribe tu respuesta.'); return; } await fresco(); p.respuestas = p.respuestas||[]; p.respuestas.push({ id:uid('r'), t:tx.trim(), n:yo.n, uid:yo.uid, emp:emp.nombre, at:ahora(), util:[] }); await D.guardarPost(p); toast('Respuesta publicada.'); pintar(); return; }
    if(a==='util'){ await fresco(); const r = (p.respuestas||[]).find(x=>x.id===id); if(!r) return; r.util = r.util||[]; const k = r.util.indexOf(yo.uid); if(k>=0) r.util.splice(k,1); else r.util.push(yo.uid); await D.guardarPost(p); pintar(); return; }
    if(a==='sol'){ await fresco(); p.solucion = p.solucion===id ? null : id; await D.guardarPost(p); pintar(); return; }
  });
  root.addEventListener('input', ev=>{ const x = ev.target; if(x.dataset && x.dataset.cf==='q'){ CV.q = x.value; const pos = x.selectionStart; pintar(); const n = root.querySelector('[data-cf="q"]'); if(n){ n.focus(); try{ n.setSelectionRange(pos,pos); }catch(err){} } } });
  root.addEventListener('change', ev=>{ const x = ev.target; if(x.dataset && x.dataset.cf==='mod'){ CV.mod = x.value; pintar(); } });
  return { nuevaIdea, ir:(tab)=>{ CV.tab = tab; CV.sel = null; pintar(); } };
}

/* aviso al staff: revisa los tickets cada minuto y avisa los nuevos (toast y notificación del navegador) */
function vigilar(db, O){
  const D = data(db); let vistos = null, timer = null;
  const pend = xs => xs.filter(t=>!['resuelto','cerrado'].includes(t.estado) && (!t.asignado || t.estado==='nuevo'));
  const revisar = async () => {
    if(O.vivo && !O.vivo()){ clearInterval(timer); return; }
    const xs = await D.tickets(); const p = pend(xs); const venc = xs.filter(t=>{ const s = slaInfo(t); return s && s.vencido; }).length;
    if(O.badge) O.badge(p.length, venc);
    const nuevos = vistos ? xs.filter(t=>!vistos.has(t.id) && t.estado==='nuevo') : [];
    const conResp = vistos ? xs.filter(t=>vistos.has(t.id) && vistos.get(t.id) < t.actualizado && (t.msgs||[]).slice(-1)[0] && t.msgs.slice(-1)[0].de==='cliente') : [];
    vistos = new Map(xs.map(t=>[t.id, t.actualizado]));
    [...nuevos.map(t=>[`Nuevo ticket #${t.num}`, `${t.emp}: ${t.asunto}`]), ...conResp.map(t=>[`El cliente respondió en #${t.num}`, `${t.emp}: ${t.asunto}`])].slice(0,3).forEach(([ti, cu])=>{
      if(O.toast) O.toast(`${ti} · ${cu}`);
      try{ if('Notification' in window && Notification.permission==='granted' && document.hidden) new Notification(ti, { body:cu, tag:'vk-ticket' }); }catch(err){}
    });
  };
  revisar(); timer = setInterval(revisar, 60000);
  return () => clearInterval(timer);
}

window.VK_MESA = { data, staff, comunidad, vigilar, slaInfo, T_ESTADOS, MODULOS };
})();
