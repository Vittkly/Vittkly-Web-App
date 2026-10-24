/* Vittkly · Operación: Inventario y equipos · Biblioteca y Academia
   window.VK_OPS_MOUNT(host, O) con O.mod = 'inventario' | 'academia'.
   Guarda los datos de la empresa en meta/inventario y meta/conocimiento (base de la empresa), como { json }.
   Requiere saas/panel.js cargado antes (window.VK_SAAS.CSS_BASE). Universal: nada es exclusivo de un rubro;
   las plantillas por rubro (limpieza, aire acondicionado, ascensores) solo agregan contenido de ejemplo. */
(function(){
'use strict';
const K = () => window.VK_SAAS || {};
const e = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad = n => String(n).padStart(2,'0');
const isoDe = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const HOY = () => isoDe(new Date());
const addD = (iso, n) => { const d = new Date(iso+'T12:00:00'); d.setDate(d.getDate()+n); return isoDe(d); };
const addM = (iso, n) => { const d = new Date(iso+'T12:00:00'); d.setMonth(d.getMonth()+n); return isoDe(d); };
const dias = (a, b) => Math.round((new Date(b+'T12:00:00') - new Date(a+'T12:00:00'))/864e5);
const fF = iso => iso ? `${String(iso).slice(8,10)}/${String(iso).slice(5,7)}/${String(iso).slice(0,4)}` : '—';
const ahora = () => new Date().toISOString();
const S = n => 'S/ ' + (Number(n)||0).toLocaleString('es-PE', { minimumFractionDigits:2, maximumFractionDigits:2 });
const n0 = n => (Number(n)||0).toLocaleString('es-PE', { maximumFractionDigits:2 });
const norm = s => String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
const uid = p => (p||'x') + '_' + Math.random().toString(36).slice(2,9);
const pill = (t, c) => `<span class="pill ${c||''}">${e(t)}</span>`;

const MAP = `:host{display:block;--bg:var(--paper,#F3F8FA);--card:var(--surface,#fff);--sunk:var(--surface-2,#EAF2F6);--line:var(--border-soft,#DDE7EC);--line2:var(--border,#C3D3DB);
  --muted:var(--ink-soft,#52626D);--pri:var(--primary,#157AA8);--pri-h:var(--primary-hover,#0F6A93);--on-pri:var(--on-p,#fff);--pri-ink:var(--primary-ink,#106C97);--pri-soft:var(--primary-soft,#E3F4FB);
  --ok:var(--green,#1E9C78);--ok-ink:var(--green,#146F55);--ok-soft:var(--green-bg,#E2F6EF);--warn:var(--amber,#E39A2A);--warn-ink:var(--amber,#8A5A0B);--warn-soft:var(--amber-bg,#FDF1DC);
  --bad:var(--red,#C0392B);--bad-ink:var(--red,#B3322C);--bad-soft:var(--red-bg,#FDE8E7);--vio-ink:#5B45B0;--vio-soft:var(--slate-bg,#EEEAFB);
  --sh:var(--shadow,0 1px 2px rgba(14,42,59,.06));--sh2:var(--shadow-2,0 18px 50px rgba(14,42,59,.25));--sans:inherit;--mono:"JetBrains Mono",ui-monospace,Menlo,Consolas,monospace;color:var(--ink);font:inherit}`;
const EXTRA = `
.vc{display:flex;flex-direction:column;gap:14px;font-size:.92rem;line-height:1.5;color:var(--ink)}
.ophd{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:flex-start}
.ophd h2{font-size:1.12rem;font-weight:800} .ophd p{color:var(--muted);font-size:.86rem;max-width:720px}
.card .tabs{margin:14px -16px -16px;border-top:1px solid var(--line);border-bottom:0}
.vbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:var(--vio-soft);border-radius:12px;padding:8px 12px;font-size:.84rem}
.vbar b{color:var(--vio-ink)} .vbar select{width:auto;min-width:220px;min-height:32px;padding:4px 8px}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
.ac{border:1px solid var(--line);border-radius:14px;padding:14px;background:var(--card);display:flex;flex-direction:column;gap:8px;cursor:pointer;text-align:left;font:inherit;color:inherit;min-width:0}
.ac:hover{border-color:var(--pri)} .ac h3{font-size:.98rem;font-weight:800;line-height:1.3} .ac p{font-size:.84rem;color:var(--muted)}
.ac .ft{display:flex;gap:8px;flex-wrap:wrap;align-items:center;font-size:.76rem;color:var(--muted);margin-top:auto}
.ac.top{border-top:4px solid var(--c,var(--pri))}
.tb{display:flex;gap:8px;flex-wrap:wrap;align-items:center;justify-content:space-between;margin-bottom:12px}
.tb .grow{flex:1;min-width:200px}
.srch{position:relative} .srch input{padding-left:34px;min-height:42px;font-size:.95rem}
.srch svg{position:absolute;left:10px;top:50%;transform:translateY(-50%);width:18px;height:18px;stroke:var(--muted);fill:none;stroke-width:2}
.mdl{position:fixed;inset:0;background:rgba(10,28,39,.5);display:flex;align-items:flex-start;justify-content:center;padding:4vh 12px;z-index:60;overflow:auto}
.mdl .box{background:var(--card);border-radius:16px;box-shadow:var(--sh2);width:min(720px,100%);display:flex;flex-direction:column;max-height:92vh;color:var(--ink)}
.mdl .box.w{width:min(980px,100%)}
.mdl .bh{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;padding:14px 16px;border-bottom:1px solid var(--line)}
.mdl .bh h3{font-size:1.04rem;font-weight:800} .mdl .bh p{color:var(--muted);font-size:.82rem}
.mdl .bb{padding:16px;overflow:auto;display:flex;flex-direction:column;gap:12px}
.mdl .bf{display:flex;justify-content:flex-end;gap:8px;padding:12px 16px;border-top:1px solid var(--line);flex-wrap:wrap}
.mdl .bf .sp1{flex:1}
.art{max-width:860px;width:100%}
.art-h h2{font-size:1.35rem;font-weight:800;line-height:1.25;letter-spacing:-.01em}
.meta{display:flex;gap:6px 10px;flex-wrap:wrap;align-items:center;color:var(--muted);font-size:.82rem}
.art-b{font-size:.96rem;line-height:1.65}
.art-b h3{font-size:1.02rem;font-weight:800;margin:16px 0 6px} .art-b p{margin:6px 0} .art-b ul,.art-b ol{margin:6px 0;padding-left:24px} .art-b li{margin:5px 0}
.dec{border:1px solid var(--line2);border-radius:12px;padding:10px 12px;background:var(--sunk);margin:8px 0;list-style:none}
.dec b{display:block} .dec .ops{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}
.dec .ans{background:var(--card);border-left:4px solid var(--pri);border-radius:8px;padding:8px 12px}
.note{border-radius:12px;padding:10px 12px;font-size:.86rem;background:var(--pri-soft);color:var(--ink)} .note.wa{background:var(--warn-soft)} .note.ok{background:var(--ok-soft)} .note.r{background:var(--bad-soft)}
.capi{display:flex;gap:10px;align-items:center;border:1px solid var(--line);border-radius:10px;padding:9px 12px;background:var(--card)}
.capi .n{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:var(--sunk);font-weight:800;font-size:.8rem;flex:none}
.capi.ok .n{background:var(--ok-soft);color:var(--ok-ink)} .capi div{flex:1;min-width:0} .capi small{display:block;color:var(--muted);font-size:.78rem}
.qz{display:flex;flex-direction:column;gap:12px} .qz fieldset{border:1px solid var(--line);border-radius:12px;padding:10px 14px;margin:0;min-width:0}
.qz legend{font-weight:800;padding:0 4px} .qz label{display:flex;gap:10px;align-items:flex-start;padding:5px 0;cursor:pointer} .qz input{margin-top:4px;accent-color:var(--pri)}
.qz .bad{color:var(--bad-ink);font-weight:700} .qz .good{color:var(--ok-ink);font-weight:700}
.cert{border:2px solid var(--pri);border-radius:18px;padding:30px 22px;text-align:center;display:flex;flex-direction:column;gap:8px;align-items:center;background:var(--card)}
.cert .k{font-size:.74rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--pri-ink)}
.cert h2{font-size:1.5rem;font-weight:800} .cert h3{font-size:1.1rem;font-weight:800}
.mx th,.mx td{text-align:center} .mx td:first-child{min-width:170px} .mx th:first-child,.mx td:first-child{text-align:left}
.qr{width:156px;height:156px;background:#fff;padding:8px;border-radius:10px;border:1px solid var(--line);display:grid;place-items:center}
.qr img,.qr canvas{width:140px!important;height:140px!important}
.eqh{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:16px;align-items:start}
.kv{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px}
.kv div{background:var(--sunk);border-radius:10px;padding:8px 10px;min-width:0} .kv span{display:block;font-size:.7rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--muted)} .kv b{font-weight:700;word-break:break-word}
.lnk{border:0;background:none;padding:0;color:var(--pri-ink);font-weight:700;cursor:pointer;text-decoration:underline;font:inherit}
.mini{font-size:.78rem;color:var(--muted)}
.ord{display:flex;flex-direction:column;gap:6px}
.ord .it{display:flex;gap:8px;align-items:center;border:1px solid var(--line);border-radius:10px;padding:6px 10px}
.ord .it span{flex:1;min-width:0}
.qed{border:1px solid var(--line);border-radius:12px;padding:10px 12px;display:flex;flex-direction:column;gap:8px}
.qed .op{display:flex;gap:8px;align-items:center} .qed .op input[type=text]{flex:1}
.ckl{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:6px 12px;max-height:260px;overflow:auto;border:1px solid var(--line);border-radius:10px;padding:8px 10px}
.sum{display:flex;gap:12px;flex-wrap:wrap;font-size:.84rem;color:var(--muted)} .sum b{color:var(--ink)}
details.vh summary{cursor:pointer;font-weight:700;color:var(--pri-ink)}
.fb{display:flex;gap:8px;align-items:center;flex-wrap:wrap;border-top:1px solid var(--line);padding-top:12px;margin-top:6px}
.empty{display:flex;flex-direction:column;gap:10px;align-items:flex-start;background:var(--sunk);border:1px dashed var(--line2);border-radius:14px;padding:18px}
.empty h3{font-size:1rem;font-weight:800}
.bigb{min-height:44px;font-size:.92rem}
@media (max-width:760px){ .g2,.g3{grid-template-columns:1fr} .mdl{padding:0} .mdl .box,.mdl .box.w{max-height:100vh;min-height:100vh;border-radius:0} .eqh{grid-template-columns:1fr} .ophd .row{width:100%} .vbar select{min-width:0;width:100%} }
`;
const ICO_SRCH = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';

/* ======================= DATOS DE EJEMPLO Y PLANTILLAS POR RUBRO ======================= */
const TIPOS_ITEM = { insumo:['Insumo','in'], repuesto:['Repuesto','v'], herramienta:['Herramienta','wa'] };
const TIPOS_ALM = { central:'Almacén central', unidad:'Unidad móvil', sede:'Sede del cliente' };
const TIPOS_MOV = { ingreso:['Ingreso','ok'], transferencia:['Transferencia','in'], consumo:['Uso en trabajo','v'], ajuste:['Ajuste','wa'], baja:['Baja o merma','r'] };
const TIPOS_ART = { protocolo:'Protocolo', ficha:'Ficha técnica', manual:'Manual', politica:'Política', video:'Video', faq:'Pregunta frecuente', tip:'Tip de campo' };
const EST_HERR = { disponible:['Disponible','ok'], asignada:['Asignada','in'], mantenimiento:['En mantenimiento','wa'], baja:['De baja',''] };

// Contenido por rubro. Cada plantilla agrega artículos de inventario, equipos de ejemplo y contenido de la Biblioteca y la Academia.
function plantillas(O){
  const emp = (O.emp && O.emp.nombre) || 'tu empresa';
  return {
    limpieza: { nombre:'Limpieza y desinfección', d:'Químicos con hoja de seguridad, EPP, inyectoras y aspiradoras; protocolos por tipo de tela.',
      items:[
        { id:'i_det', sku:'QUI-001', nombre:'Detergente enzimático para tapices', tipo:'insumo', cat:'Químicos', un:'L', costo:18, min:10, lote:true },
        { id:'i_qac', sku:'QUI-002', nombre:'Desinfectante de amonio cuaternario', tipo:'insumo', cat:'Químicos', un:'L', costo:22, min:8, lote:true, doc:'a_hs_qac' },
        { id:'i_qm', sku:'QUI-003', nombre:'Quitamanchas para tejidos', tipo:'insumo', cat:'Químicos', un:'L', costo:30, min:4, lote:true },
        { id:'i_neu', sku:'QUI-004', nombre:'Enjuague neutralizador textil', tipo:'insumo', cat:'Químicos', un:'L', costo:16, min:5 },
        { id:'i_bol', sku:'DES-001', nombre:'Bolsas de basura 140 L (paquete de 10)', tipo:'insumo', cat:'Descartables', un:'paq.', costo:6.5, min:10 },
        { id:'i_gua', sku:'EPP-001', nombre:'Guantes de nitrilo (caja de 100)', tipo:'insumo', cat:'EPP', un:'caja', costo:28, min:3 },
        { id:'i_mas', sku:'EPP-002', nombre:'Mascarillas KN95', tipo:'insumo', cat:'EPP', un:'und.', costo:1.8, min:40 },
        { id:'i_pan', sku:'DES-002', nombre:'Paños de microfibra', tipo:'insumo', cat:'Descartables', un:'und.', costo:3.5, min:30 },
        { id:'i_boq', sku:'REP-001', nombre:'Boquilla de tapicería para inyectora', tipo:'repuesto', cat:'Repuestos de equipos propios', un:'und.', costo:65, min:1 },
        { id:'i_man', sku:'REP-002', nombre:'Manguera de solución de 3 m', tipo:'repuesto', cat:'Repuestos de equipos propios', un:'und.', costo:85, min:1 },
        { id:'h_iny', sku:'EQ-001', nombre:'Inyectora-extractora', tipo:'herramienta', cat:'Equipos', un:'und.', costo:2400, frec:3, doc:'a_iny' },
        { id:'h_asp', sku:'EQ-002', nombre:'Aspiradora de polvo y agua', tipo:'herramienta', cat:'Equipos', un:'und.', costo:780, frec:6 },
        { id:'h_lus', sku:'EQ-003', nombre:'Lustradora industrial', tipo:'herramienta', cat:'Equipos', un:'und.', costo:1650, frec:6 },
        { id:'h_vap', sku:'EQ-004', nombre:'Vaporizador', tipo:'herramienta', cat:'Equipos', un:'und.', costo:900, frec:6 }
      ],
      stockCentral:{ i_det:40, i_qac:30, i_qm:6, i_neu:12, i_bol:5, i_gua:1, i_mas:120, i_pan:60, i_boq:2, i_man:1 },
      stockUnidad:{ i_det:5, i_qac:4, i_qm:1, i_neu:2, i_bol:3, i_gua:1, i_mas:20, i_pan:12 },
      herr:[ ['h_iny','Inyectora-extractora 1','u',20], ['h_iny','Inyectora-extractora 2','c',-5], ['h_asp','Aspiradora 1','u',60], ['h_lus','Lustradora 1','m',-12], ['h_vap','Vaporizador 1','c',75] ],
      equipos:[],
      cats:[['c_prot','Protocolos de servicio'],['c_quim','Químicos y seguridad'],['c_eq','Equipos y herramientas'],['c_at','Atención al cliente'],['c_pol','Políticas']],
      habs:[['h_text','Limpieza de muebles de tela','Puede atender servicios de limpieza y desinfección de muebles tapizados.',['cat_muebles']],['h_quim','Manejo seguro de químicos','Conoce el EPP, las incompatibilidades y los primeros auxilios de los químicos de la empresa.']],
      arts:[
        { id:'a_sofa', tipo:'protocolo', cat:'c_prot', titulo:'Limpieza y desinfección de sofá de tela', tags:['sofá','tela','inyectora','muebles'], resumen:'Paso a paso del servicio, con la decisión según el tipo de tela.', obligatorio:false, version:2, cambio:'Se agregó la decisión por tipo de tela.',
          cuerpo:`## Antes de empezar
- Confirma con el cliente el tipo de tela revisando la etiqueta del mueble.
- Haz una prueba del producto en una zona escondida y espera unos minutos.
- Toma las fotos del estado inicial en el Término.
## Pasos
1. Aspira toda la superficie, incluidas las uniones de los cojines.
2. Trata las manchas puntuales con quitamanchas antes del lavado general.
3. ?? ¿Qué tipo de tela es?
=> Sintética o microfibra: aplica el detergente enzimático diluido según la etiqueta y extrae con la inyectora.
=> Lino o algodón: usa poca humedad, haz pasadas rápidas con la inyectora y prioriza el secado.
=> Cuero o cuerina: no uses la inyectora. Limpia con paño húmedo y producto para cuero, y avisa al supervisor si hay daño previo.
4. Aplica el desinfectante y respeta el tiempo de contacto que indica el fabricante.
5. Extrae la humedad con pasadas lentas y deja ventilado el ambiente.
6. Toma la foto final y pide la firma del cliente en el Término.`,
          v1:`## Pasos
1. Aspira toda la superficie.
2. Trata las manchas con quitamanchas.
3. Lava con la inyectora y el detergente enzimático.
4. Desinfecta y deja secar.` },
        { id:'a_hs_qac', tipo:'ficha', cat:'c_quim', titulo:'Hoja de seguridad: desinfectante de amonio cuaternario', tags:['químico','EPP','amonio','desinfectante','seguridad'], resumen:'EPP, incompatibilidades, primeros auxilios y almacenamiento. La hoja oficial del fabricante siempre prevalece.', obligatorio:true,
          cuerpo:`## Equipo de protección obligatorio
- Guantes de nitrilo.
- Mascarilla y lentes de seguridad al diluir o rociar.
## Nunca
- No lo mezcles con lejía ni con otros químicos.
- No lo traspases a envases de bebidas o sin etiqueta.
## Primeros auxilios
1. Contacto con los ojos: lava con abundante agua durante 15 minutos y busca atención médica.
2. Contacto con la piel: lava con agua y jabón.
3. Si alguien lo ingiere: no provoques el vómito y llama de inmediato a emergencias.
## Almacenamiento
- Envase cerrado, en un lugar fresco y ventilado, lejos de alimentos y del alcance de niños.
Esta ficha resume lo esencial para el equipo. Ante cualquier duda manda la hoja de seguridad oficial del fabricante.` },
        { id:'a_epp', tipo:'politica', cat:'c_pol', titulo:'Uso obligatorio de equipo de protección personal', tags:['EPP','seguridad','política'], resumen:'Qué EPP usar en cada servicio y qué hacer si te falta.', obligatorio:true,
          cuerpo:`Todo el equipo usa EPP en cada servicio, sin excepción.
## En todos los servicios
- Uniforme limpio y fotocheck visible.
- Guantes de nitrilo al manipular químicos.
## Al diluir o rociar químicos
- Mascarilla y lentes de seguridad.
## Si te falta EPP
1. No empieces el servicio.
2. Pídelo desde Inventario › Pedir reposición o avisa a tu supervisor.
3. Registra la ocurrencia si el servicio se retrasa.` },
        { id:'a_iny', tipo:'manual', cat:'c_eq', titulo:'Inyectora-extractora: uso diario y mantenimiento', tags:['inyectora','equipo','mantenimiento'], resumen:'Revisión antes de usarla, limpieza al terminar y mantenimiento periódico.', obligatorio:false,
          cuerpo:`## Antes de usarla
1. Revisa que el cable y el enchufe no estén pelados ni rotos.
2. Revisa que las mangueras estén bien conectadas y sin fugas.
3. Llena el tanque de solución con la dilución indicada.
## Al terminar el día
1. Vacía y enjuaga los dos tanques.
2. Limpia el filtro de recuperación.
3. Guarda la manguera sin dobleces.
## Mantenimiento
- Cada 3 meses pasa por mantenimiento. Inventario te avisa cuándo toca.
- Si notas poca succión o fugas, repórtala como falla desde Mis herramientas.` },
        { id:'a_vino', tipo:'tip', cat:'c_prot', titulo:'Mancha de vino en microfibra: lo que nos funcionó', tags:['mancha','vino','microfibra','tip'], resumen:'Aporte de campo aprobado por el supervisor.', obligatorio:false, aporte:true,
          cuerpo:`Lo que mejor nos funcionó en microfibra:
1. Absorbe primero con paño seco, sin frotar.
2. Aplica quitamanchas y deja actuar el tiempo de la etiqueta.
3. Extrae con la inyectora con poca agua y repite si hace falta.
Si la mancha es antigua, avísale al cliente antes de empezar que puede no salir por completo.` },
        { id:'a_pres', tipo:'protocolo', cat:'c_at', titulo:'Cómo presentarte y cerrar el servicio con el cliente', tags:['cliente','atención','término'], resumen:'Saludo, explicación del servicio, cierre y firma.', obligatorio:false,
          cuerpo:`1. Saluda, preséntate con tu nombre y el de ${emp}, y muestra tu fotocheck.
2. Confirma con el cliente qué se va a hacer y si hay algo que debamos cuidar.
3. Al terminar, muéstrale el resultado y explícale el tiempo de secado.
4. Pide la firma en el Término y agradece.` },
        { id:'a_pelos', tipo:'tip', cat:'c_prot', titulo:'Retirar pelos de mascota antes de inyectar', tags:['mascotas','pelos','tip'], resumen:'Propuesto desde campo, pendiente de revisión.', estado:'propuesto', aporte:true,
          cuerpo:`Antes de aspirar, pasa un guante de goma húmedo sobre la tela: los pelos se juntan y salen más rápido.` }
      ],
      cursos:[
        { id:'k_ind', titulo:`Inducción a ${emp}`, desc:'Lo que todo nuevo integrante debe saber antes de su primer servicio.', caps:['a_epp','a_pres','a_hs_qac'], aud:['g_new','g_tec'], obligatorio:true, min:70, vig:0, hab:'',
          examen:[ { p:'¿Cuándo debes usar guantes de nitrilo?', ops:['Solo si el cliente lo pide','Siempre que manipules químicos','Solo con manchas difíciles'], ok:1 },
                   { p:'¿Se puede mezclar el desinfectante con lejía?', ops:['Sí, mejora el resultado','No, nunca','Solo en baños'], ok:1 },
                   { p:'Al terminar el servicio, ¿qué haces antes de irte?', ops:['Tomo la foto final y pido la firma en el Término','Envío el monto por WhatsApp','Nada más'], ok:0 } ] },
        { id:'k_text', titulo:'Limpieza de muebles de tela', desc:'Protocolo por tipo de tela, uso de la inyectora y casos de campo.', caps:['a_sofa','a_iny','a_vino'], aud:['g_tec'], obligatorio:false, min:80, vig:24, hab:'h_text',
          examen:[ { p:'¿Qué haces antes de aplicar un producto en una tela?', ops:['Pruebo en una zona escondida','Lo aplico directo en la mancha','Mojo todo el mueble'], ok:0 },
                   { p:'Un mueble de lino necesita…', ops:['Mucha humedad para que penetre','Poca humedad y priorizar el secado','Solo vapor'], ok:1 },
                   { p:'¿Qué haces con un sofá de cuero?', ops:['Uso la inyectora','No uso la inyectora y sigo el protocolo de cuero','Uso lejía diluida'], ok:1 } ] },
        { id:'k_quim', titulo:'Manejo seguro de químicos', desc:'EPP, incompatibilidades y primeros auxilios. Se renueva cada año.', caps:['a_hs_qac','a_epp'], aud:'todos', obligatorio:true, min:80, vig:12, hab:'h_quim',
          examen:[ { p:'¿Qué EPP usas al diluir el desinfectante?', ops:['Ninguno','Guantes de nitrilo, mascarilla y lentes','Solo guantes de tela'], ok:1 },
                   { p:'Si cae químico en los ojos…', ops:['Lavas con abundante agua 15 minutos y buscas atención','Esperas a que pase','Te frotas los ojos'], ok:0 },
                   { p:'¿Cómo se almacena?', ops:['Abierto para que ventile','Cerrado, en lugar fresco y lejos de alimentos','En botellas de bebida'], ok:1 } ] }
      ],
      grupos:[['g_tec','Técnicos de campo','Todo el equipo que atiende servicios.','tec'],['g_sup','Supervisores','Quienes validan servicios y revisan la calidad.',''],['g_new','Nuevos ingresos','Personas en su primer mes.','tec1']],
      busquedas:[['alfombra persa',2],['sofá de cuero',3]]
    },
    aire: { nombre:'Aire acondicionado y refrigeración', d:'Repuestos con número de serie, refrigerante por lote, equipos del cliente con preventivo y protocolos por tipo de equipo.',
      items:[
        { id:'r_fil', sku:'AC-R01', nombre:'Filtro de aire para split', tipo:'repuesto', cat:'Repuestos A/C', un:'und.', costo:25, precio:45, min:10 },
        { id:'r_cap', sku:'AC-R02', nombre:'Capacitor de arranque 35 µF', tipo:'repuesto', cat:'Repuestos A/C', un:'und.', costo:28, precio:60, min:4 },
        { id:'r_com', sku:'AC-R03', nombre:'Compresor rotativo 12 000 BTU', tipo:'repuesto', cat:'Repuestos A/C', un:'und.', costo:650, precio:980, min:1, serie:true },
        { id:'r_gas', sku:'AC-I01', nombre:'Refrigerante R410A', tipo:'insumo', cat:'Refrigerantes', un:'kg', costo:55, min:10, lote:true },
        { id:'r_lim', sku:'AC-I02', nombre:'Limpiador de serpentines', tipo:'insumo', cat:'Químicos', un:'L', costo:24, min:4, lote:true },
        { id:'h_mano', sku:'AC-E01', nombre:'Juego de manómetros digitales', tipo:'herramienta', cat:'Herramientas A/C', un:'und.', costo:950, frec:12 },
        { id:'h_vac', sku:'AC-E02', nombre:'Bomba de vacío', tipo:'herramienta', cat:'Herramientas A/C', un:'und.', costo:1200, frec:6 }
      ],
      stockCentral:{ r_fil:30, r_cap:6, r_gas:18, r_lim:6 }, stockUnidad:{ r_fil:6, r_cap:2, r_gas:4, r_lim:1 },
      series:[['r_com','CMP-24-0187','c'],['r_com','CMP-24-0193','c']],
      herr:[ ['h_mano','Manómetros 1','u',90], ['h_vac','Bomba de vacío 1','c',-3] ],
      equipos:[
        { id:'eq_ac1', codigo:'EQ-AC-0001', tipo:'Aire acondicionado split', marca:'LG', modelo:'Inverter 12 000 BTU', serie:'(completar)', cliente:'Oficinas Miraflores (ejemplo)', ubic:'Oficina 304', frec:3, ult:-70, tags:['aire','split'] },
        { id:'eq_ac2', codigo:'EQ-AC-0002', tipo:'Aire acondicionado split', marca:'Samsung', modelo:'18 000 BTU', serie:'(completar)', cliente:'Oficinas Miraflores (ejemplo)', ubic:'Sala de reuniones', frec:3, ult:-100, tags:['aire','split'] },
        { id:'eq_ac3', codigo:'EQ-AC-0003', tipo:'Aire acondicionado de ventana', marca:'Daewoo', modelo:'9 000 BTU', serie:'(completar)', cliente:'Clínica San Isidro (ejemplo)', ubic:'Recepción', frec:6, ult:-30, tags:['aire','ventana'] }
      ],
      cats:[['c_ac','Aire acondicionado']],
      habs:[['h_ac','Mantenimiento de aire acondicionado','Puede hacer el mantenimiento preventivo y correctivo de equipos de aire acondicionado.']],
      arts:[
        { id:'a_ac_prev', tipo:'protocolo', cat:'c_ac', titulo:'Mantenimiento preventivo de aire acondicionado', tags:['aire','split','preventivo','mantenimiento'], resumen:'Pasos del preventivo, con la decisión según el tipo de equipo.', obligatorio:false,
          cuerpo:`## Seguridad primero
1. Corta la energía del equipo y coloca una tarjeta de «No energizar».
2. Usa guantes y lentes; trabaja con escalera en buen estado.
## Pasos
1. Escanea el código del equipo para abrir su historial.
2. ?? ¿Qué tipo de equipo es?
=> Split de pared: retira y lava los filtros, limpia el serpentín de la unidad interior y revisa la bandeja y el drenaje.
=> Ventana: retira el equipo del marco si hace falta, limpia filtro y serpentines, y revisa el sellado del marco.
=> Piso techo o cassette: limpia filtros y rejillas, revisa la bomba de condensado si tiene una.
3. Limpia el serpentín de la unidad exterior con limpiador de serpentines.
4. Revisa conexiones eléctricas y el capacitor; registra si hay que cambiarlo.
5. Solo si tienes la habilidad vigente: mide presiones con los manómetros y anota los valores.
6. Enciende, prueba el funcionamiento y registra el servicio en el equipo.` }
      ],
      cursos:[
        { id:'k_ac', titulo:'Mantenimiento de aire acondicionado', desc:'Protocolo preventivo por tipo de equipo y seguridad eléctrica.', caps:['a_ac_prev'], aud:['g_ac'], obligatorio:false, min:80, vig:12, hab:'h_ac',
          examen:[ { p:'¿Qué haces antes de abrir el equipo?', ops:['Corto la energía y coloco la tarjeta de «No energizar»','Lo dejo encendido para probar','Nada'], ok:0 },
                   { p:'¿Quién puede medir presiones de refrigerante?', ops:['Cualquier técnico','Solo quien tiene la habilidad vigente','El cliente'], ok:1 } ] }
      ],
      grupos:[['g_ac','Técnicos de aire acondicionado','Equipo que atiende equipos de A/C.','']],
      busquedas:[]
    },
    ascensor: { nombre:'Ascensores', d:'Repuestos instalados en cada ascensor, preventivo mensual por equipo y protocolo de bloqueo y etiquetado.',
      items:[
        { id:'r_bot', sku:'AS-R01', nombre:'Botonera de cabina', tipo:'repuesto', cat:'Repuestos de ascensor', un:'und.', costo:420, precio:690, min:1, serie:true },
        { id:'r_con', sku:'AS-R02', nombre:'Contactor 220 V', tipo:'repuesto', cat:'Repuestos de ascensor', un:'und.', costo:110, precio:190, min:3 },
        { id:'r_rod', sku:'AS-R03', nombre:'Rodamiento de polea', tipo:'repuesto', cat:'Repuestos de ascensor', un:'und.', costo:75, precio:140, min:4 },
        { id:'r_ace', sku:'AS-I01', nombre:'Aceite para guías', tipo:'insumo', cat:'Lubricantes', un:'L', costo:38, min:6, lote:true },
        { id:'h_loto', sku:'AS-E01', nombre:'Kit de bloqueo y etiquetado', tipo:'herramienta', cat:'Seguridad', un:'und.', costo:350, frec:12 },
        { id:'h_mult', sku:'AS-E02', nombre:'Multímetro', tipo:'herramienta', cat:'Herramientas eléctricas', un:'und.', costo:280, frec:12 }
      ],
      stockCentral:{ r_con:8, r_rod:10, r_ace:12 }, stockUnidad:{ r_con:2, r_rod:2, r_ace:2 },
      series:[['r_bot','BOT-7781','c'],['r_bot','BOT-7790','u']],
      herr:[ ['h_loto','Kit LOTO 1','u',40], ['h_mult','Multímetro 1','u',150] ],
      equipos:[
        { id:'eq_as1', codigo:'EQ-AS-0001', tipo:'Ascensor de pasajeros', marca:'Otis', modelo:'Tracción, 8 personas', serie:'(completar)', cliente:'Condominio Los Pinos (ejemplo)', ubic:'Torre A · Ascensor 1', frec:1, ult:-35, tags:['ascensor','tracción'] },
        { id:'eq_as2', codigo:'EQ-AS-0002', tipo:'Ascensor de pasajeros', marca:'Otis', modelo:'Tracción, 8 personas', serie:'(completar)', cliente:'Condominio Los Pinos (ejemplo)', ubic:'Torre A · Ascensor 2', frec:1, ult:-12, tags:['ascensor','tracción'] }
      ],
      cats:[['c_as','Ascensores']],
      habs:[['h_as','Mantenimiento de ascensores','Puede hacer el preventivo mensual y cambios de repuestos menores en ascensores.']],
      arts:[
        { id:'a_as_prev', tipo:'protocolo', cat:'c_as', titulo:'Preventivo mensual de ascensor', tags:['ascensor','preventivo','bloqueo','mantenimiento'], resumen:'Seguridad, revisión por partes y registro en el equipo.', obligatorio:false,
          cuerpo:`## Seguridad primero
1. Avisa a la administración y coloca el letrero de «Ascensor en mantenimiento» en cada piso.
2. Aplica bloqueo y etiquetado en el tablero antes de intervenir.
## Revisión
1. ?? ¿El ascensor es de tracción o hidráulico?
=> Tracción: revisa poleas, rodamientos, cables y lubricación de guías.
=> Hidráulico: revisa nivel de aceite, fugas en el pistón y la válvula.
2. Prueba puertas de cabina y de piso, sensores y cierre.
3. Prueba botonera, iluminación, alarma e intercomunicador.
4. Verifica la nivelación en cada parada.
## Cierre
- Retira el bloqueo solo cuando todo el equipo esté fuera del pozo.
- Registra el servicio y los repuestos usados en el equipo.` }
      ],
      cursos:[
        { id:'k_as', titulo:'Seguridad en mantenimiento de ascensores', desc:'Bloqueo y etiquetado, señalización y revisión mensual.', caps:['a_as_prev'], aud:['g_as'], obligatorio:true, min:80, vig:12, hab:'h_as',
          examen:[ { p:'¿Qué haces antes de intervenir el tablero?', ops:['Aplico bloqueo y etiquetado','Aviso por WhatsApp y empiezo','Nada'], ok:0 },
                   { p:'¿Cuándo se retira el bloqueo?', ops:['Cuando termina mi parte','Cuando todo el equipo está fuera del pozo','Nunca'], ok:1 } ] }
      ],
      grupos:[['g_as','Técnicos de ascensores','Equipo de mantenimiento de ascensores.','']],
      busquedas:[]
    }
  };
}

/* ======================= ESTADO, GUARDADO Y AYUDAS ======================= */
let O = {}, I = null, A = null, UI = {}, ROOT = null, MD = null, toast = m => console.log(m), ACCESO = { ok:true };
const UIS = {};
let PEND = null, tI = null, tA = null, sucI = false, sucA = false;
const PATH = { inv:'meta/inventario', con:'meta/conocimiento' };
const lsKey = k => 'vk_ops_' + ((O.emp||{}).id || 'x') + '_' + k;
async function leer(k){
  try{ if(O.db){ const s = await O.db.doc(PATH[k]).get(); if(s.exists){ const d = s.data(); return d && d.json ? JSON.parse(d.json) : null; } return null; } }catch(err){ console.warn(err); }
  try{ const r = sessionStorage.getItem(lsKey(k)); return r ? JSON.parse(r) : null; }catch(_){ return null; }
}
async function escribir(k){
  const json = JSON.stringify(k==='inv' ? I : A);
  if(json.length > 230000) toast('Este módulo está cerca de su límite de almacenamiento en el prototipo. Archiva lo que no uses.');
  try{ if(O.db){ await O.db.doc(PATH[k]).set({ json, actualizado:ahora() }); return; } }catch(err){ console.warn(err); toast('No se pudo guardar. Revisa tu conexión.'); }
  try{ sessionStorage.setItem(lsKey(k), json); }catch(_){}
}
const flush = async () => { clearTimeout(tI); clearTimeout(tA); const p = []; if(sucI){ sucI = false; p.push(escribir('inv')); } if(sucA){ sucA = false; p.push(escribir('con')); } await Promise.all(p); };
function guardar(k){ if(k==='inv'){ sucI = true; clearTimeout(tI); tI = setTimeout(flush, 400); } else { sucA = true; clearTimeout(tA); tA = setTimeout(flush, 400); } PEND = flush; }

const invVacio = () => ({ v:1, rubros:[], items:[], alm:[], stock:{}, series:[], herr:[], equipos:[], movs:[], pedidos:[], nH:0, nE:0 });
const conVacio = () => ({ v:1, rubros:[], cats:[], grupos:[], habs:[], arts:[], cursos:[], prog:{}, busq:[] });

// ¿quién soy y en qué modo veo?
const PF = () => O.perfil || {};
const gestorReal = () => !PF().campo && !!(PF().admin || PF().gestor);
const modoTec = () => !gestorReal() || !!UI.verComo;
const yo = () => UI.verComo || (PF().campo ? (PF().tecnico || O.usuario || 'Técnico') : (O.usuario || 'Administrador'));
const tecDemo = i => (O.tecnicos||[])[i] || (i===0 ? (O.usuario || 'Técnico de ejemplo') : null);
function personas(){
  const s = new Set();
  (O.tecnicos||[]).forEach(x=>x && s.add(x)); (O.personas||[]).forEach(x=>x && s.add(x));
  (A ? A.grupos : []).forEach(g=>(g.miembros||[]).forEach(x=>x && s.add(x)));
  Object.keys((A && A.prog) || {}).forEach(x=>x && s.add(x));
  return [...s].sort((a,b)=>a.localeCompare(b,'es'));
}

// inventario
const item = id => I.items.find(x=>x.id===id);
const almacen = id => I.alm.find(x=>x.id===id);
const almNombre = id => (almacen(id)||{}).nombre || '—';
const almCentral = () => I.alm.find(a=>a.tipo==='central') || I.alm[0];
const almUnidades = () => I.alm.filter(a=>a.tipo==='unidad');
const equipo = id => I.equipos.find(x=>x.id===id);
const stk = (a, i) => ((I.stock[a]||{})[i]) || 0;
function addStock(a, i, q){ I.stock[a] = I.stock[a] || {}; const v = Math.round(((I.stock[a][i]||0) + Number(q))*1000)/1000; if(v) I.stock[a][i] = v; else delete I.stock[a][i]; }
const total = i => I.alm.reduce((s,a)=>s + stk(a.id, i), 0);
const itemsEn = a => I.items.filter(it=>it.tipo!=='herramienta' && stk(a, it.id) > 0);
const bajoMin = it => it.tipo!=='herramienta' && Number(it.min) > 0 && total(it.id) < Number(it.min);
const valorAlm = a => itemsEn(a).reduce((s,it)=>s + stk(a,it.id)*(Number(it.costo)||0), 0) + I.herr.filter(h=>h.alm===a && h.estado!=='baja').reduce((s,h)=>s + (Number((item(h.itemId)||{}).costo)||0), 0);
const valorTotal = () => I.alm.reduce((s,a)=>s + valorAlm(a.id), 0);
const ubicH = h => h.estado==='asignada' ? (h.asignado || almNombre(h.alm)) : almNombre(h.alm);
function sincAlm(){
  if(!I.alm.some(a=>a.tipo==='central')) I.alm.unshift({ id:'alm_central', nombre:'Almacén central', tipo:'central', resp:O.usuario||'Administrador' });
  (O.unidades||[]).forEach(u=>{ if(!u || !u.nombre) return; if(!I.alm.some(a=>a.tipo==='unidad' && a.unidad===u.nombre)) I.alm.push({ id:uid('alm'), nombre:u.nombre, tipo:'unidad', unidad:u.nombre, resp:(u.tecnicos||[]).join(', ') }); });
}
function miUnidad(){
  const p = yo(), us = almUnidades();
  const u = us.find(a=>{ const x = (O.unidades||[]).find(z=>z.nombre===a.unidad); return x && (x.tecnicos||[]).includes(p); });
  if(u) return u;
  return modoTec() && us.length===1 ? us[0] : null;
}
function trabajosPara(tec){
  let L = O.trabajos || [];
  if(tec){ const mu = miUnidad(); const mios = L.filter(t=>t.tecnico===yo() || t.ayudante===yo() || (mu && t.unidad && t.unidad===mu.unidad)); if(mios.length) L = mios; }
  return L.slice(0, 80);
}
const trabTxt = t => `${t.num || 'Sin número'} · ${t.cliente} · ${fF(t.fecha)}`;
function lotesPorVencer(){
  const lim = addD(HOY(), 30), out = [], vistos = new Set();
  I.movs.forEach(m=>{ if(m.tipo==='ingreso' && m.venc && m.venc<=lim && m.lote && !vistos.has(m.itemId+m.lote) && total(m.itemId)>0){ vistos.add(m.itemId+m.lote); out.push(m); } });
  return out;
}
const sigCodigoEq = () => { I.nE = (I.nE||I.equipos.length) + 1; return 'EQ-' + String(I.nE).padStart(4,'0'); };

// Registra un movimiento y actualiza stock, series e historial del equipo. Devuelve un texto de error o null.
function registrarMov(m){
  const it = item(m.itemId); if(!it) return 'Elige un artículo.';
  let q = Number(m.cant);
  const conSerie = it.serie && m.tipo!=='ajuste';
  if(conSerie) q = (m.series||[]).length;
  if(m.tipo==='ajuste'){
    if(!m.de) return 'Elige el almacén donde contaste.';
    const contado = Number(m.contado); if(m.contado==='' || m.contado==null || !(contado>=0)) return 'Ingresa la cantidad que contaste.';
    q = Math.round((contado - stk(m.de, it.id))*1000)/1000; if(!q) return 'Lo que contaste es igual al stock del sistema: no hay nada que ajustar.';
  } else if(!(q>0)) return conSerie ? (m.tipo==='ingreso' ? 'Escribe al menos un número de serie.' : 'Marca al menos una serie.') : 'Ingresa una cantidad mayor que cero.';
  if(['transferencia','consumo','baja'].includes(m.tipo)){
    if(!m.de) return 'Elige de qué almacén sale.';
    if(stk(m.de, it.id) < q - 1e-9) return `No alcanza: en ${almNombre(m.de)} hay ${n0(stk(m.de, it.id))} ${it.un}.`;
  }
  if(m.tipo==='transferencia'){ if(!m.a) return 'Elige a qué almacén llega.'; if(m.a===m.de) return 'El origen y el destino son el mismo almacén.'; }
  if(m.tipo==='ingreso' && !m.a) return 'Elige a qué almacén entra.';
  if(m.tipo==='consumo' && !m.trabajo && !m.equipoId) return 'Elige el trabajo (o el equipo) donde se usó.';
  if(m.tipo==='ingreso' && conSerie){ const rep = (m.series||[]).find(s=>I.series.some(x=>x.serie===s && x.itemId===it.id)); if(rep) return `La serie ${rep} ya está registrada.`; }
  const tr = (O.trabajos||[]).find(t=>t.id===m.trabajo);
  const rec = { id:uid('m'), ts:(m.fecha && m.fecha!==HOY()) ? m.fecha+'T12:00:00.000Z' : ahora(), fecha:m.fecha||HOY(), tipo:m.tipo, itemId:it.id, cant:q, de:m.de||'', a:m.a||'',
    costo:Number(m.costo)||Number(it.costo)||0, trabajo:m.trabajo||'', trabajoTxt:tr ? trabTxt(tr) : '', equipoId:m.equipoId||'', cobrar:!!m.cobrar, precio:Number(it.precio)||0,
    series:conSerie ? (m.series||[]).slice() : [], lote:m.lote||'', venc:m.venc||'', prov:m.prov||'', doc:m.doc||'', nota:m.nota||'', quien:m._quien || yo() };
  if(m.tipo==='ingreso'){
    const c = Number(m.costo), ant = total(it.id);
    if(c>0) it.costo = Math.round(((ant*(Number(it.costo)||0) + q*c)/(ant+q))*100)/100;   // costo promedio
    addStock(m.a, it.id, q);
    rec.series.forEach(s=>I.series.push({ id:uid('s'), itemId:it.id, serie:s, estado:'stock', alm:m.a }));
  } else if(m.tipo==='transferencia'){
    addStock(m.de, it.id, -q); addStock(m.a, it.id, q);
    rec.series.forEach(s=>{ const x = I.series.find(y=>y.serie===s && y.itemId===it.id); if(x) x.alm = m.a; });
  } else if(m.tipo==='consumo'){
    addStock(m.de, it.id, -q);
    rec.series.forEach(s=>{ const x = I.series.find(y=>y.serie===s && y.itemId===it.id); if(x){ x.estado = 'instalado'; x.alm = ''; x.equipoId = m.equipoId||''; x.trabajo = rec.trabajoTxt; x.fecha = rec.fecha; x.garantia = addM(rec.fecha, 12); } });
    if(m.equipoId){ const eq = equipo(m.equipoId); if(eq){ eq.hist = eq.hist || []; eq.hist.unshift({ id:uid('hs'), fecha:rec.fecha, tipo:it.tipo==='repuesto' ? 'Repuesto instalado' : 'Material usado', tecnico:rec.quien, trabajo:rec.trabajoTxt, detalle:`${n0(q)} ${it.un} de ${it.nombre}${rec.series.length ? ' · serie '+rec.series.join(', ') : ''}` }); } }
  } else if(m.tipo==='baja'){
    addStock(m.de, it.id, -q);
    rec.series.forEach(s=>{ const x = I.series.find(y=>y.serie===s && y.itemId===it.id); if(x){ x.estado = 'baja'; x.alm = ''; } });
  } else if(m.tipo==='ajuste'){ addStock(m.de, it.id, q); }
  I.movs.unshift(rec); if(I.movs.length > 700) I.movs.length = 700;
  guardar('inv'); return null;
}

// Plantillas por rubro: agregan contenido sin pisar lo existente (por id).
function aplicarPlantilla(key, parts){
  const T = plantillas(O)[key]; if(!T) return false;
  parts = parts || { inv:!I.rubros.includes(key), con:!A.rubros.includes(key) };
  if(!parts.inv && !parts.con) return false;
  sincAlm();
  if(parts.inv){
  const c = almCentral();
  let u = almUnidades()[0];
  if(!u && (Object.keys(T.stockUnidad||{}).length || (T.herr||[]).some(h=>h[2]==='u'))){ u = { id:uid('alm'), nombre:'Unidad móvil 1', tipo:'unidad', unidad:'', resp:'' }; I.alm.push(u); }
  T.items.forEach(it=>{ if(!item(it.id)) I.items.push({ activo:true, precio:0, min:0, lote:false, serie:false, ...it }); });
  Object.entries(T.stockCentral||{}).forEach(([id,q])=>addStock(c.id, id, q));
  if(u) Object.entries(T.stockUnidad||{}).forEach(([id,q])=>addStock(u.id, id, q));
  (T.series||[]).forEach(([itemId, serie, d])=>{ if(I.series.some(s=>s.serie===serie)) return; const a = d==='u' && u ? u.id : c.id; I.series.push({ id:uid('s'), itemId, serie, estado:'stock', alm:a }); addStock(a, itemId, 1); });
  (T.herr||[]).forEach(([itemId, nombre, d, prox])=>{
    if(I.herr.some(h=>h.nombre===nombre && h.itemId===itemId)) return;
    I.nH = (I.nH||0) + 1; const it = item(itemId) || {}; const frec = it.frec || 6;
    const h = { id:uid('h'), itemId, codigo:'H-'+String(I.nH).padStart(3,'0'), nombre, estado:'disponible', alm:c.id, asignado:'', frec, ult:addM(addD(HOY(), prox), -frec), prox:addD(HOY(), prox), log:[{ fecha:addD(HOY(),-60), t:'Alta en el inventario', quien:O.usuario||'Administrador' }] };
    if(d==='u' && u){ h.estado = 'asignada'; h.alm = u.id; h.asignado = u.unidad || u.nombre; h.log.unshift({ fecha:addD(HOY(),-30), t:`Asignada a ${h.asignado}`, quien:O.usuario||'Administrador' }); }
    if(d==='m'){ h.prev = 'disponible'; h.estado = 'mantenimiento'; h.log.unshift({ fecha:addD(HOY(),-4), t:'Enviada a mantenimiento: ruido en el motor', quien:O.usuario||'Administrador' }); }
    I.herr.push(h);
  });
  (T.equipos||[]).forEach(q=>{
    if(equipo(q.id)) return; const ult = addD(HOY(), q.ult);
    I.equipos.push({ id:q.id, codigo:q.codigo, tipo:q.tipo, marca:q.marca, modelo:q.modelo, serie:q.serie, cliente:q.cliente, ubic:q.ubic, frec:q.frec, ult, prox:addM(ult, q.frec), tags:q.tags||[],
      hist:[{ id:uid('hs'), fecha:ult, tipo:'Preventivo', tecnico:tecDemo(0)||'', trabajo:'', detalle:'Mantenimiento preventivo sin observaciones.' }] });
  });
  if(!I.rubros.includes(key)) I.rubros.push(key);
  }
  // Biblioteca y Academia
  if(parts.con){
  T.cats.forEach(([id,n])=>{ if(!A.cats.some(x=>x.id===id)) A.cats.push({ id, nombre:n }); });
  T.habs.forEach(([id,n,d,sv])=>{ if(!A.habs.some(x=>x.id===id)) A.habs.push({ id, nombre:n, desc:d, servicios:(sv||[]).filter(x=>(O.servicios||[]).some(s=>s.id===x)), manual:[] }); });
  T.grupos.forEach(([id,n,d,m])=>{ if(A.grupos.some(x=>x.id===id)) return; const tecs = O.tecnicos||[]; A.grupos.push({ id, nombre:n, desc:d, miembros: m==='tec' ? tecs.slice() : m==='tec1' ? tecs.slice(-1) : [] }); });
  T.arts.forEach((a, k)=>{
    if(A.arts.some(x=>x.id===a.id)) return; const f = addD(HOY(), -40);
    const art = { id:a.id, tipo:a.tipo, cat:a.cat, titulo:a.titulo, tags:a.tags||[], resumen:a.resumen||'', cuerpo:a.cuerpo, video:'', adjunto:'', aud:'todos', obligatorio:!!a.obligatorio,
      estado:a.estado||'publicado', version:a.version||1, desde:(a.version||1)>1 ? addD(HOY(),-10) : f, cambio:a.cambio||'', aprobo:a.estado==='propuesto' ? '' : (O.usuario||'Administrador'),
      autor:a.aporte ? (tecDemo(1) || tecDemo(0) || 'Técnico') : (O.usuario||'Administrador'), aporte:!!a.aporte, creado:a.estado==='propuesto' ? addD(HOY(),-1) : f, hist:[], lect:{}, vistas:a.estado==='propuesto' ? 0 : 6 + (k*13)%37, util:{ si:a.estado==='propuesto'?0:2+(k*5)%7, no:a.estado==='propuesto'?0:k%2 }, favs:[] };
    if(a.v1) art.hist.push({ version:1, fecha:f, quien:O.usuario||'Administrador', cambio:'Primera versión', titulo:a.titulo, cuerpo:a.v1 });
    A.arts.push(art);
  });
  T.cursos.forEach(cu=>{ if(!A.cursos.some(x=>x.id===cu.id)) A.cursos.push({ ...JSON.parse(JSON.stringify(cu)), estado:'publicado', creado:HOY() }); });
  (T.busquedas||[]).forEach(([q,n])=>{ if(!A.busq.some(b=>b.q===q)) A.busq.push({ q, n, ts:ahora() }); });
  if(!A.rubros.includes(key)) A.rubros.push(key);
  }
  guardar('inv'); guardar('con');
  return true;
}
// Historia de ejemplo para que el prototipo no arranque vacío (solo en la primera carga).
function demoExtras(key){
  const T = plantillas(O)[key]; if(!T) return;
  const c = almCentral(), u = almUnidades()[0], f0 = addD(HOY(), -45), adm = O.usuario || 'Administrador';
  const ini = (alm, mapa) => Object.entries(mapa||{}).forEach(([id,q])=>I.movs.push({ id:uid('m'), ts:f0+'T09:00:00.000Z', fecha:f0, tipo:'ingreso', itemId:id, cant:q, de:'', a:alm.id, costo:(item(id)||{}).costo||0, trabajo:'', trabajoTxt:'', equipoId:'', cobrar:false, precio:0, series:[], lote:'', venc:'', prov:'', doc:'', nota:'Saldo inicial', quien:adm }));
  ini(c, T.stockCentral); if(u) ini(u, T.stockUnidad);
  const first = (T.items.find(i=>i.lote) || T.items.find(i=>i.tipo!=='herramienta')).id;
  registrarMov({ tipo:'ingreso', itemId:first, cant:10, a:c.id, costo:(item(first)||{}).costo, prov:'Proveedor de ejemplo', doc:'F001-000123', lote:'L-2409', venc:addD(HOY(), 25), fecha:addD(HOY(), -20), _quien:adm });
  const t0 = tecDemo(0), t1 = tecDemo(1);
  if(u){
    registrarMov({ tipo:'transferencia', itemId:first, cant:2, de:c.id, a:u.id, fecha:addD(HOY(), -3), _quien:adm });
    const tr = (O.trabajos||[]).find(t=>t.estado==='Realizada' || t.estado==='Pagada') || (O.trabajos||[])[0];
    if(tr) registrarMov({ tipo:'consumo', itemId:first, cant:1, de:u.id, trabajo:tr.id, fecha:addD(HOY(), -1), _quien:t0 });
    const lineas = key==='limpieza' ? [{ itemId:'i_bol', cant:5 }, { itemId:'i_gua', cant:1 }] : [{ itemId:T.items[0].id, cant:2 }];
    I.pedidos.push({ id:uid('p'), ts:ahora(), fecha:addD(HOY(), -1), alm:u.id, quien:t0 || 'Técnico', estado:'pendiente', nota:'Para los servicios de esta semana.', items:lineas });
  }
  I.movs.sort((a,b)=>String(b.ts).localeCompare(String(a.ts)));
  if(key==='limpieza' && t0){
    const all = id => (A.cursos.find(x=>x.id===id)||{ caps:[] }).caps.slice();
    A.prog[t0] = { k_ind:{ vistos:all('k_ind'), intentos:[{ fecha:addM(HOY(),-3), nota:100 }], aprobado:addM(HOY(),-3), nota:100 },
      k_quim:{ vistos:all('k_quim'), intentos:[{ fecha:addD(addM(HOY(),-12),19), nota:67 }, { fecha:addD(addM(HOY(),-12),20), nota:100 }], aprobado:addD(addM(HOY(),-12),20), nota:100 },
      k_text:{ vistos:['a_sofa'], intentos:[] } };
    if(t1 && t1!==t0) A.prog[t1] = { k_ind:{ vistos:['a_epp'], intentos:[] } };
    const epp = A.arts.find(a=>a.id==='a_epp'), qac = A.arts.find(a=>a.id==='a_hs_qac'), sofa = A.arts.find(a=>a.id==='a_sofa');
    if(epp) epp.lect[t0] = { fecha:addM(HOY(),-3), version:epp.version };
    if(qac) qac.lect[t0] = { fecha:addD(addM(HOY(),-12),20), version:qac.version };
    if(sofa) sofa.favs.push(t0);
  }
  guardar('inv'); guardar('con');
}
function rubroDe(){
  if(O.emp && O.emp.esVK) return 'limpieza';
  const r = norm((O.emp||{}).rubro);
  if(/limp|desinf|textil|higiene/.test(r)) return 'limpieza';
  if(/aire|refriger|clima/.test(r)) return 'aire';
  if(/ascens|elevad/.test(r)) return 'ascensor';
  return null;
}
function emptyRubro(mod){
  if(modoTec()) return `<div class="empty"><h3>${mod==='inv'?'Tu empresa aún no carga su inventario':'Tu empresa aún no carga contenido'}</h3><p class="sub">Cuando el administrador lo haga, lo verás aquí.</p></div>`;
  const T = plantillas(O);
  return `<div class="empty"><h3>${mod==='inv'?'Empieza tu inventario':'Empieza tu biblioteca'}</h3><p class="sub">Agrega el contenido de ejemplo de tu rubro y ajústalo a tu empresa, o crea todo desde cero.</p>
    <div class="row">${Object.entries(T).map(([k,t])=>`<button class="btn" data-a="tpl-aplicar" data-id="${k}">${e(t.nombre)}</button>`).join('')}<button class="btn p" data-a="${mod==='inv'?'item-nuevo':'art-nuevo'}">${mod==='inv'?'Nuevo artículo':'Nuevo artículo'}</button></div></div>`;
}

/* ======================= INVENTARIO: VISTAS ======================= */
function vInv(){
  const tec = modoTec(), pend = I.pedidos.filter(p=>p.estado==='pendiente').length;
  const tabs = tec ? [['mi','Mi unidad'],['herr','Mis herramientas'],['eq','Equipos del cliente']]
    : [['res','Resumen'],['art','Artículos'],['alm','Almacenes y unidades'],['mov','Movimientos'],['herr','Herramientas'],['eq','Equipos del cliente'],['ped',`Pedidos${pend?` <span class="bd">${pend}</span>`:''}`]];
  if(!tabs.some(t=>t[0]===UI.invTab)) UI.invTab = tabs[0][0];
  const head = `<div class="card"><div class="ophd"><div><h2>${tec?'Mi inventario':'Inventario y equipos'}</h2><p>${tec ? 'Lo que llevas en tu unidad, tus herramientas y los equipos que atiendes. Registra lo que usas en cada trabajo, aunque no tengas señal.' : 'Insumos, repuestos y herramientas en el almacén y en cada unidad, y los equipos de tus clientes con su historial y su mantenimiento preventivo.'}</p></div>
    <div class="row">${tec ? `<button class="btn p" data-a="mov-nuevo" data-t="consumo">Registrar lo que usé</button><button class="btn" data-a="ped-nuevo">Pedir reposición</button>` : `<button class="btn p" data-a="mov-nuevo">Registrar movimiento</button><button class="btn" data-a="item-nuevo">Nuevo artículo</button><button class="btn g" data-a="plantillas">Plantillas por rubro</button>`}</div></div>
    <div class="tabs" role="tablist">${tabs.map(([k,l])=>`<button class="tab" role="tab" data-a="itab" data-id="${k}" aria-selected="${UI.invTab===k}">${l}</button>`).join('')}</div></div>`;
  return head + ({ res:invRes, art:invArt, alm:invAlm, mov:invMov, herr:invHerr, eq:invEq, ped:invPed, mi:invMi }[UI.invTab])();
}
function invRes(){
  if(!I.items.length) return emptyRubro('inv');
  const bajos = I.items.filter(it=>it.activo!==false && bajoMin(it));
  const hm = I.herr.filter(h=>h.estado!=='baja' && (h.estado==='mantenimiento' || (h.prox && h.prox<=addD(HOY(),15))));
  const eqv = I.equipos.filter(q=>q.prox && q.prox<=addD(HOY(),15));
  const ped = I.pedidos.filter(p=>p.estado==='pendiente');
  const al = [];
  bajos.forEach(it=>al.push({ c:'var(--bad)', t:`${it.nombre}: bajo el mínimo`, s:`Quedan ${n0(total(it.id))} ${it.un} en total; el mínimo es ${n0(it.min)}.`, a:'item-ver', id:it.id, b:'Ver' }));
  lotesPorVencer().forEach(v=>{ const it = item(v.itemId); if(it) al.push({ c:'var(--warn)', t:`Lote ${v.lote} de ${it.nombre} vence el ${fF(v.venc)}`, s:'Úsalo primero o retíralo antes de esa fecha.', a:'item-ver', id:it.id, b:'Ver' }); });
  hm.forEach(h=>al.push({ c:h.estado==='mantenimiento'?'var(--warn)':'var(--bad)', t:h.estado==='mantenimiento' ? `${h.nombre} está en mantenimiento` : `${h.nombre}: mantenimiento ${h.prox<HOY()?'vencido':'próximo'}`, s:h.estado==='mantenimiento' ? 'Márcala como lista cuando vuelva.' : `${h.prox<HOY()?'Tocaba':'Toca'} el ${fF(h.prox)} · ${ubicH(h)}`, a:'itab', id:'herr', b:'Ir' }));
  eqv.forEach(q=>al.push({ c:q.prox<HOY()?'var(--bad)':'var(--warn)', t:`Preventivo ${q.prox<HOY()?'vencido':'próximo'}: ${q.tipo} · ${q.ubic}`, s:`${q.cliente} · ${q.prox<HOY()?'tocaba':'toca'} el ${fF(q.prox)}`, a:'eq-ver', id:q.id, b:'Ver' }));
  ped.forEach(p=>al.push({ c:'var(--pri)', t:`Pedido de reposición de ${p.quien}`, s:`${almNombre(p.alm)} · ${p.items.length} artículo(s) · ${fF(p.fecha)}`, a:'itab', id:'ped', b:'Atender' }));
  const g = {};
  I.movs.filter(m=>m.tipo==='consumo' && m.fecha>=addD(HOY(),-30)).forEach(m=>{
    const k = m.trabajo || ('eq:'+m.equipoId), it = item(m.itemId);
    g[k] = g[k] || { t:m.trabajoTxt || ((equipo(m.equipoId)||{}).codigo) || '—', fecha:m.fecha, items:[], costo:0, cobrar:0 };
    g[k].items.push(`${n0(m.cant)} ${it?it.un:''} ${it?it.nombre:''}`); g[k].costo += m.cant*(m.costo||0); if(m.cobrar) g[k].cobrar += m.cant*(m.precio||0); if(m.fecha>g[k].fecha) g[k].fecha = m.fecha;
  });
  const filas = Object.values(g).sort((a,b)=>b.fecha.localeCompare(a.fecha));
  return `<div class="kps">
    <div class="kp"><span>Valor del inventario</span><b>${S(valorTotal())}</b><small>${I.items.filter(i=>i.activo!==false).length} artículos activos</small></div>
    <div class="kp"><span>Bajo el mínimo</span><b>${bajos.length}</b><small>${bajos.length?'Reponer pronto':'Todo en orden'}</small></div>
    <div class="kp"><span>Herramientas por atender</span><b>${hm.length}</b><small>Mantenimiento vencido, próximo o en curso</small></div>
    <div class="kp"><span>Preventivos</span><b>${eqv.length}</b><small>Vencidos o en los próximos 15 días</small></div>
    <div class="kp"><span>Pedidos pendientes</span><b>${ped.length}</b><small>Reposición pedida por el equipo</small></div></div>
  <div class="grid g2">
    <div class="card"><div class="ch"><div><h2>Para atender</h2><p>Lo que necesita una acción.</p></div></div>${al.length ? `<div class="alerts">${al.slice(0,12).map(x=>`<div class="al" style="--c:${x.c}"><div><b>${e(x.t)}</b><small>${e(x.s)}</small></div><button class="btn s" data-a="${x.a}" data-id="${e(x.id)}">${x.b}</button></div>`).join('')}</div>` : '<p class="vac">Nada pendiente.</p>'}</div>
    <div class="card"><div class="ch"><div><h2>Stock por almacén</h2><p>Valor a costo de lo que hay en cada lugar.</p></div></div><div class="tw"><table><thead><tr><th>Almacén</th><th class="r">Artículos</th><th class="r">Valor</th></tr></thead><tbody>${I.alm.map(a=>`<tr class="clk" data-a="itab" data-id="alm"><td><div class="who2"><div><b>${e(a.nombre)}</b><small>${TIPOS_ALM[a.tipo]||''}</small></div></div></td><td class="r num">${itemsEn(a.id).length}</td><td class="r num">${S(valorAlm(a.id))}</td></tr>`).join('')}</tbody></table></div></div>
  </div>
  <div class="card"><div class="ch"><div><h2>Materiales usados en trabajos</h2><p>Últimos 30 días: cuánto costó lo usado en cada trabajo y qué parte se le cobra al cliente.</p></div></div>
    ${filas.length ? `<div class="tw"><table><thead><tr><th>Fecha</th><th>Trabajo o equipo</th><th>Materiales</th><th class="r">Costo</th><th class="r">Se cobra</th></tr></thead><tbody>${filas.map(f=>`<tr><td class="nw">${fF(f.fecha)}</td><td>${e(f.t)}</td><td>${e(f.items.join(' · '))}</td><td class="r num">${S(f.costo)}</td><td class="r num">${f.cobrar?S(f.cobrar):'—'}</td></tr>`).join('')}</tbody></table></div>` : '<p class="vac">Aún no se registró uso de materiales en trabajos.</p>'}</div>`;
}
function invArt(){
  if(!I.items.length) return emptyRubro('inv');
  return `<div class="card"><div class="tb"><div class="srch grow">${ICO_SRCH}<input type="search" data-in="artq" placeholder="Buscar por nombre, código o categoría" value="${e(UI.artq||'')}" aria-label="Buscar artículos"></div>
    <div class="chips">${[['todos','Todos'],['insumo','Insumos'],['repuesto','Repuestos'],['herramienta','Herramientas']].map(([k,l])=>`<button class="chip" data-a="artf" data-id="${k}" aria-pressed="${(UI.artf||'todos')===k}">${l}</button>`).join('')}</div></div>
    <div id="artRes">${artLista()}</div></div>`;
}
function artLista(){
  const q = norm(UI.artq), f = UI.artf || 'todos';
  const L = I.items.filter(it=>it.activo!==false && (f==='todos' || it.tipo===f) && (!q || norm([it.nombre,it.sku,it.cat].join(' ')).includes(q)));
  if(!L.length) return '<p class="vac">No hay artículos con ese filtro.</p>';
  return `<div class="tw"><table><thead><tr><th>Artículo</th><th>Tipo</th><th class="r">Stock</th><th class="r">Mínimo</th><th class="r">Costo unit.</th><th class="r">Valor</th><th>Estado</th></tr></thead><tbody>${L.map(it=>{
    const h = it.tipo==='herramienta', hs = I.herr.filter(x=>x.itemId===it.id && x.estado!=='baja'), tot = h ? hs.length : total(it.id);
    const est = h ? (hs.some(x=>x.estado==='mantenimiento') ? pill('Alguna en mantenimiento','wa') : pill('Al día','ok')) : bajoMin(it) ? pill('Bajo el mínimo','r') : pill('OK','ok');
    return `<tr class="clk" data-a="item-ver" data-id="${it.id}" tabindex="0"><td><div class="who2"><div><b>${e(it.nombre)}</b><small>${e([it.sku,it.cat].filter(Boolean).join(' · '))}</small></div></div></td><td>${pill(TIPOS_ITEM[it.tipo][0], TIPOS_ITEM[it.tipo][1])}</td><td class="r num">${n0(tot)} ${e(h?'und.':it.un)}</td><td class="r num">${h?'—':n0(it.min)}</td><td class="r num">${S(it.costo)}</td><td class="r num">${S(tot*(Number(it.costo)||0))}</td><td>${est}</td></tr>`; }).join('')}</tbody></table></div>`;
}
function invAlm(){
  return `<div class="row end"><button class="btn" data-a="alm-nuevo">Nuevo almacén</button></div><div class="cards">${I.alm.map(a=>{
    const its = itemsEn(a.id), hs = I.herr.filter(h=>h.alm===a.id && h.estado!=='baja'), open = UI.almOpen===a.id, u = (O.unidades||[]).find(x=>x.nombre===a.unidad);
    const col = a.tipo==='central' ? 'var(--pri)' : a.tipo==='unidad' ? 'var(--ok)' : 'var(--vio-ink)';
    return `<div class="ac top" style="--c:${col};cursor:default"><div class="row" style="justify-content:space-between"><h3>${e(a.nombre)}</h3>${pill(TIPOS_ALM[a.tipo]||a.tipo, a.tipo==='central'?'in':a.tipo==='unidad'?'ok':'v')}</div>
      <p>${a.tipo==='unidad' ? (u && u.tecnicos.length ? 'Técnicos: '+e(u.tecnicos.join(', ')) : 'Sin técnicos asignados en la agenda') : 'Responsable: '+e(a.resp||'—')}</p>
      <div class="sum"><span><b>${its.length}</b> artículos</span><span><b>${hs.length}</b> herramientas</span><span><b>${S(valorAlm(a.id))}</b></span></div>
      <div class="row"><button class="btn s" data-a="alm-ver" data-id="${a.id}">${open?'Ocultar stock':'Ver stock'}</button>${its.length?`<button class="btn s" data-a="mov-nuevo" data-t="transferencia" data-de="${a.id}">Transferir desde aquí</button>`:''}</div>
      ${open ? (its.length || hs.length ? `<div class="tw"><table><thead><tr><th>Artículo</th><th class="r">Cantidad</th></tr></thead><tbody>${its.map(it=>`<tr><td>${e(it.nombre)}${it.serie?`<small class="mini" style="display:block">Series: ${e(I.series.filter(s=>s.itemId===it.id && s.alm===a.id && s.estado==='stock').map(s=>s.serie).join(', '))}</small>`:''}</td><td class="r num">${n0(stk(a.id,it.id))} ${e(it.un)}</td></tr>`).join('')}${hs.map(h=>`<tr><td>${e(h.nombre)} <small class="mini">${e(h.codigo)}</small></td><td class="r">${pill(EST_HERR[h.estado][0], EST_HERR[h.estado][1])}</td></tr>`).join('')}</tbody></table></div>` : '<p class="mini">Este almacén está vacío.</p>') : ''}</div>`; }).join('')}</div>`;
}
function movFiltrados(){ const f = UI.movf || {}; return I.movs.filter(m=>(!f.tipo || m.tipo===f.tipo) && (!f.alm || m.de===f.alm || m.a===f.alm) && (!f.q || norm((item(m.itemId)||{}).nombre).includes(norm(f.q)))); }
function invMov(){
  const f = UI.movf || {};
  return `<div class="card"><div class="tb"><div class="fr grow" style="max-width:780px"><div class="f"><label>Tipo</label><select data-in="movf-tipo"><option value="">Todos</option>${Object.entries(TIPOS_MOV).map(([k,v])=>`<option value="${k}" ${f.tipo===k?'selected':''}>${v[0]}</option>`).join('')}</select></div>
    <div class="f"><label>Almacén</label><select data-in="movf-alm"><option value="">Todos</option>${I.alm.map(a=>`<option value="${a.id}" ${f.alm===a.id?'selected':''}>${e(a.nombre)}</option>`).join('')}</select></div>
    <div class="f"><label>Artículo</label><input type="search" data-in="movf-q" value="${e(f.q||'')}" placeholder="Buscar"></div></div><button class="btn" data-a="mov-csv">Descargar CSV</button></div>
    <div id="movRes">${movTabla(movFiltrados().slice(0,200))}</div></div>`;
}
function movTabla(L){
  if(!L.length) return '<p class="vac">No hay movimientos.</p>';
  return `<div class="tw"><table><thead><tr><th>Fecha</th><th>Tipo</th><th>Artículo</th><th class="r">Cantidad</th><th>Origen → destino</th><th>Trabajo o detalle</th><th>Quién</th></tr></thead><tbody>${L.map(m=>{
    const it = item(m.itemId) || { nombre:'(artículo eliminado)', un:'' };
    const sg = (m.tipo==='ingreso' || (m.tipo==='ajuste' && m.cant>0)) ? '+' : m.tipo==='transferencia' ? '' : '−';
    const dest = m.a ? almNombre(m.a) : m.tipo==='consumo' ? 'Trabajo' : m.tipo==='baja' ? 'Baja' : '—';
    return `<tr><td class="nw">${fF(m.fecha)}</td><td>${pill(TIPOS_MOV[m.tipo][0], TIPOS_MOV[m.tipo][1])}</td><td>${e(it.nombre)}${m.series && m.series.length ? `<small class="mini" style="display:block">Serie ${e(m.series.join(', '))}</small>` : ''}${m.lote ? `<small class="mini" style="display:block">Lote ${e(m.lote)}${m.venc?` · vence ${fF(m.venc)}`:''}</small>` : ''}</td><td class="r num">${sg}${n0(Math.abs(m.cant))} ${e(it.un)}</td><td class="nw">${e(m.de?almNombre(m.de):'—')} → ${e(dest)}</td><td>${e(m.trabajoTxt || (m.equipoId ? ((equipo(m.equipoId)||{}).codigo||'') : '') || [m.prov, m.doc].filter(Boolean).join(' · ') || m.nota || '')}${m.cobrar?' '+pill('Se cobra','v'):''}</td><td>${e(m.quien||'')}</td></tr>`; }).join('')}</tbody></table></div>`;
}
function invHerr(){
  const tec = modoTec(), mu = miUnidad();
  const L = I.herr.filter(h=>h.estado!=='baja' && (!tec || (mu && h.alm===mu.id) || h.asignado===yo()));
  return `<div class="card">${tec ? '' : '<div class="row end" style="margin-bottom:10px"><button class="btn" data-a="herr-nueva">Nueva herramienta o equipo propio</button></div>'}
  ${L.length ? `<div class="tw"><table><thead><tr><th>Código</th><th>Herramienta</th><th>Estado</th><th>Dónde está</th><th>Último mant.</th><th>Próximo mant.</th><th></th></tr></thead><tbody>${L.map(h=>{
    const v = h.prox && h.prox<HOY(), p = h.prox && !v && h.prox<=addD(HOY(),15);
    return `<tr><td class="nw"><code class="cd">${e(h.codigo)}</code></td><td><b>${e(h.nombre)}</b><small class="mini" style="display:block">${e((item(h.itemId)||{}).nombre||'')}</small></td><td>${pill(EST_HERR[h.estado][0], EST_HERR[h.estado][1])}</td><td>${e(ubicH(h))}</td><td class="nw">${fF(h.ult)}</td><td class="nw">${fF(h.prox)} ${v?pill('Vencido','r'):p?pill('Próximo','wa'):''}</td><td class="r"><div class="row end">${herrAcciones(h, tec)}</div></td></tr>`; }).join('')}</tbody></table></div>` : `<p class="vac">${tec?'No tienes herramientas asignadas.':'Aún no hay herramientas registradas.'}</p>`}</div>`;
}
function herrAcciones(h, tec){
  const doc = (item(h.itemId)||{}).doc, ver = doc && artVisible(doc) ? `<button class="btn s g" data-a="art-abrir-otro" data-id="${doc}">Manual</button>` : '';
  if(tec) return (h.estado==='mantenimiento' ? pill('En revisión','wa') : `<button class="btn s" data-a="herr-falla" data-id="${h.id}">Reportar falla</button>`) + ver;
  const b = [];
  if(h.estado==='disponible') b.push(`<button class="btn s" data-a="herr-asignar" data-id="${h.id}">Asignar</button>`);
  if(h.estado==='asignada') b.push(`<button class="btn s" data-a="herr-devolver" data-id="${h.id}">Devolver</button>`);
  if(h.estado==='mantenimiento') b.push(`<button class="btn s p" data-a="herr-lista" data-id="${h.id}">Mantenimiento hecho</button>`); else b.push(`<button class="btn s" data-a="herr-mant" data-id="${h.id}">A mantenimiento</button>`);
  b.push(`<button class="btn s g" data-a="herr-ver" data-id="${h.id}">Historial</button>`);
  return b.join('') + ver;
}
function filtrarEq(){ const q = norm(UI.eqq); return I.equipos.filter(x=>!q || norm([x.codigo,x.tipo,x.marca,x.modelo,x.cliente,x.ubic,x.serie].join(' ')).includes(q)); }
function invEq(){
  if(!I.equipos.length) return `<div class="empty"><h3>Los equipos que atiendes en tus clientes</h3><p class="sub">Un ascensor, un aire acondicionado o una bomba de agua: cada equipo tiene su código QR, su historial de servicios, los repuestos que se le instalaron y la fecha de su próximo preventivo.</p>
    <div class="row">${modoTec() ? '' : `<button class="btn p" data-a="eq-nuevo">Nuevo equipo</button><button class="btn" data-a="tpl-aplicar" data-id="ascensor">Ver ejemplo: ascensores</button><button class="btn" data-a="tpl-aplicar" data-id="aire">Ver ejemplo: aire acondicionado</button>`}</div></div>`;
  return `<div class="card"><div class="tb"><div class="srch grow">${ICO_SRCH}<input type="search" data-in="eqq" placeholder="Escanea o escribe el código del equipo, o busca por cliente" value="${e(UI.eqq||'')}" aria-label="Buscar equipo"></div>${modoTec() ? '' : '<button class="btn" data-a="eq-nuevo">Nuevo equipo</button>'}</div><div id="eqRes">${eqLista(filtrarEq())}</div></div>`;
}
function eqLista(L){
  if(!L.length) return '<p class="vac">Ningún equipo coincide con la búsqueda.</p>';
  return `<div class="tw"><table><thead><tr><th>Código</th><th>Equipo</th><th>Cliente y ubicación</th><th>Último servicio</th><th>Próximo preventivo</th></tr></thead><tbody>${L.map(x=>{
    const v = x.prox && x.prox<HOY(), p = x.prox && !v && x.prox<=addD(HOY(),15);
    return `<tr class="clk" data-a="eq-ver" data-id="${x.id}" tabindex="0"><td class="nw"><code class="cd">${e(x.codigo)}</code></td><td><b>${e(x.tipo)}</b><small class="mini" style="display:block">${e([x.marca,x.modelo].filter(Boolean).join(' · '))}</small></td><td>${e(x.cliente)}<small class="mini" style="display:block">${e(x.ubic||'')}</small></td><td class="nw">${fF(x.ult)}</td><td class="nw">${fF(x.prox)} ${v?pill('Vencido','r'):p?pill('Próximo','wa'):''}</td></tr>`; }).join('')}</tbody></table></div>`;
}
function invPed(){
  const L = I.pedidos.slice().sort((a,b)=>((a.estado==='pendiente'?0:1)-(b.estado==='pendiente'?0:1)) || String(b.ts).localeCompare(String(a.ts)));
  if(!L.length) return '<div class="card"><p class="vac">No hay pedidos de reposición. El equipo los hace desde su app, en Inventario › Pedir reposición.</p></div>';
  return `<div class="cards">${L.map(p=>{
    const col = p.estado==='pendiente' ? 'var(--pri)' : p.estado==='atendido' ? 'var(--ok)' : 'var(--line2)';
    return `<div class="ac top" style="--c:${col};cursor:default"><div class="row" style="justify-content:space-between"><h3>${e(p.quien)}</h3>${pill(p.estado==='pendiente'?'Pendiente':p.estado==='atendido'?'Atendido':'Rechazado', p.estado==='pendiente'?'in':p.estado==='atendido'?'ok':'')}</div><p>Para ${e(almNombre(p.alm))} · ${fF(p.fecha)}</p>
      <ul class="lst">${p.items.map(x=>{ const it = item(x.itemId) || { nombre:'—', un:'' }; return `<li><div>${e(it.nombre)}<small>En el central: ${n0(stk(almCentral().id, x.itemId))} ${e(it.un)}</small></div><b class="num">${n0(x.cant)} ${e(it.un)}</b></li>`; }).join('')}</ul>
      ${p.nota ? `<p class="mini">«${e(p.nota)}»</p>` : ''}
      ${p.estado==='pendiente' && !modoTec() ? `<div class="row"><button class="btn s p" data-a="ped-atender" data-id="${p.id}">Atender: enviar desde el central</button><button class="btn s g" data-a="ped-rechazar" data-id="${p.id}">Rechazar</button></div>` : p.resuelto ? `<p class="mini">${e(p.resuelto)}</p>` : ''}</div>`; }).join('')}</div>`;
}
function invMi(){
  const mu = miUnidad();
  if(!mu) return '<div class="empty"><h3>Aún no tienes una unidad asignada</h3><p class="sub">Pide a tu coordinador que te agregue a una unidad de trabajo en la agenda. Mientras tanto puedes consultar los equipos de los clientes.</p></div>';
  const its = itemsEn(mu.id), mios = I.movs.filter(m=>m.de===mu.id || m.a===mu.id).slice(0,8), peds = I.pedidos.filter(p=>p.alm===mu.id && p.estado==='pendiente');
  return `<div class="card"><div class="ch"><div><h2>${e(mu.nombre)}</h2><p>Lo que llevas hoy en tu unidad.</p></div>${peds.length ? pill(`${peds.length} pedido(s) en camino`,'in') : ''}</div>
    ${its.length ? `<div class="tw"><table><thead><tr><th>Artículo</th><th class="r">Cantidad</th><th></th></tr></thead><tbody>${its.map(it=>`<tr><td><b>${e(it.nombre)}</b>${it.doc && artVisible(it.doc) ? ` <button class="lnk" data-a="art-abrir-otro" data-id="${it.doc}">Ver ficha</button>` : ''}</td><td class="r num">${n0(stk(mu.id,it.id))} ${e(it.un)}</td><td class="r"><button class="btn s" data-a="mov-nuevo" data-t="consumo" data-item="${it.id}">Usé</button></td></tr>`).join('')}</tbody></table></div>` : '<p class="vac">Tu unidad no tiene stock. Pide reposición.</p>'}
    <div class="row" style="margin-top:12px"><button class="btn" data-a="mov-nuevo" data-t="transferencia" data-de="${mu.id}" data-alla="${almCentral().id}">Devolver al almacén</button><button class="btn" data-a="ped-nuevo">Pedir reposición</button></div></div>
  <div class="card"><div class="ch"><div><h2>Mis últimos movimientos</h2></div></div>${movTabla(mios)}</div>`;
}

/* ======================= INVENTARIO: VENTANAS ======================= */
const MDS = {};
const almOpts = (sel, excl) => I.alm.filter(a=>a.id!==excl).map(a=>`<option value="${a.id}" ${sel===a.id?'selected':''}>${e(a.nombre)}</option>`).join('');
MDS.item = d => {
  const nuevo = !d.id, arts = A.arts.filter(a=>a.estado==='publicado');
  let b = `<div class="fr"><div class="f"><label>Nombre</label><input type="text" data-m="nombre" value="${e(d.nombre||'')}"></div><div class="f"><label>Código (SKU)</label><input type="text" data-m="sku" value="${e(d.sku||'')}"></div></div>
  <div class="fr"><div class="f"><label>Tipo</label><select data-m="tipo" data-mr ${!nuevo?'disabled':''}>${Object.entries(TIPOS_ITEM).map(([k,v])=>`<option value="${k}" ${d.tipo===k?'selected':''}>${v[0]}</option>`).join('')}</select><small>${d.tipo==='insumo'?'Se consume: químicos, EPP, descartables.':d.tipo==='repuesto'?'Se instala en un equipo y se puede cobrar al cliente.':'Se asigna, se devuelve y tiene mantenimiento.'}</small></div>
    <div class="f"><label>Categoría</label><input type="text" data-m="cat" list="catsInv" value="${e(d.cat||'')}"><datalist id="catsInv">${[...new Set(I.items.map(x=>x.cat).filter(Boolean))].map(c=>`<option value="${e(c)}">`).join('')}</datalist></div>
    <div class="f"><label>Unidad de medida</label><input type="text" data-m="un" value="${e(d.un||'und.')}" placeholder="L, kg, und., caja"></div></div>
  <div class="fr"><div class="f"><label>Costo unitario (S/)</label><input type="number" min="0" step="any" data-m="costo" value="${e(d.costo??'')}"></div>
    ${d.tipo==='repuesto' ? `<div class="f"><label>Precio al cliente (S/)</label><input type="number" min="0" step="any" data-m="precio" value="${e(d.precio??'')}"></div>` : ''}
    ${d.tipo!=='herramienta' ? `<div class="f"><label>Stock mínimo (total)</label><input type="number" min="0" step="any" data-m="min" value="${e(d.min??'')}"></div>` : `<div class="f"><label>Mantenimiento cada (meses)</label><input type="number" min="0" data-m="frec" value="${e(d.frec??6)}"></div>`}</div>
  ${d.tipo!=='herramienta' ? `<div class="row"><label class="chk"><input type="checkbox" data-m="lote" ${d.lote?'checked':''}> Controlar lote y vencimiento</label>${d.tipo==='repuesto' ? `<label class="chk"><input type="checkbox" data-m="serie" ${d.serie?'checked':''} ${!nuevo && total(d.id)>0?'disabled':''}> Controlar número de serie</label>` : ''}</div>` : ''}
  <div class="f"><label>Ficha, manual u hoja de seguridad (Biblioteca)</label><select data-m="doc"><option value="">Ninguna</option>${arts.map(a=>`<option value="${a.id}" ${d.doc===a.id?'selected':''}>${e(a.titulo)}</option>`).join('')}</select><small>El técnico la abre desde su inventario con un toque.</small></div>`;
  if(!nuevo){
    const it = item(d.id);
    if(it.tipo!=='herramienta'){
      b += `<div><p class="sec">Stock por almacén</p><div class="tw"><table><thead><tr><th>Almacén</th><th class="r">Cantidad</th></tr></thead><tbody>${I.alm.filter(a=>stk(a.id,it.id)>0).map(a=>`<tr><td>${e(a.nombre)}</td><td class="r num">${n0(stk(a.id,it.id))} ${e(it.un)}</td></tr>`).join('') || '<tr><td colspan="2" class="vac">Sin stock.</td></tr>'}</tbody></table></div></div>`;
      if(it.serie){ const ss = I.series.filter(s=>s.itemId===it.id); b += `<div><p class="sec">Números de serie</p>${ss.length ? `<ul class="lst">${ss.map(s=>`<li><div><b>${e(s.serie)}</b><small>${s.estado==='stock' ? 'En '+e(almNombre(s.alm)) : s.estado==='instalado' ? `Instalado ${s.equipoId ? 'en '+e((equipo(s.equipoId)||{}).codigo||'') : ''} · ${fF(s.fecha)} · garantía hasta ${fF(s.garantia)}` : 'De baja'}</small></div>${pill(s.estado==='stock'?'En stock':s.estado==='instalado'?'Instalado':'Baja', s.estado==='stock'?'ok':s.estado==='instalado'?'v':'')}</li>`).join('')}</ul>` : '<p class="mini">Aún no hay series.</p>'}</div>`; }
    } else {
      const hs = I.herr.filter(h=>h.itemId===it.id && h.estado!=='baja');
      b += `<div><p class="sec">Unidades de esta herramienta</p>${hs.length ? `<ul class="lst">${hs.map(h=>`<li><div><b>${e(h.nombre)}</b><small>${e(h.codigo)} · ${e(ubicH(h))}</small></div>${pill(EST_HERR[h.estado][0], EST_HERR[h.estado][1])}</li>`).join('')}</ul>` : '<p class="mini">Aún no hay unidades. Agrégalas en Herramientas.</p>'}</div>`;
    }
    b += `<div><p class="sec">Últimos movimientos</p>${movTabla(I.movs.filter(m=>m.itemId===it.id).slice(0,8))}</div>`;
  }
  const usado = !nuevo && (total(d.id)>0 || I.movs.some(m=>m.itemId===d.id) || I.herr.some(h=>h.itemId===d.id));
  return { t:nuevo ? 'Nuevo artículo' : (item(d.id)||{}).nombre, s:nuevo ? 'Insumo, repuesto o herramienta.' : e([TIPOS_ITEM[d.tipo][0], d.sku].filter(Boolean).join(' · ')), b, w:!nuevo,
    f:`${!nuevo ? `<button class="btn d" data-a="item-borrar">${usado?'Desactivar':'Eliminar'}</button>` : ''}${d.doc && !nuevo ? `<button class="btn" data-a="art-abrir-otro" data-id="${d.doc}">Ver ficha</button>` : ''}<span class="sp1"></span><button class="btn" data-a="md-cerrar">Cancelar</button><button class="btn p" data-a="item-guardar">Guardar</button>` };
};
MDS.mov = d => {
  const tec = modoTec(), mu = miUnidad();
  const tipos = tec ? [['consumo','Uso en un trabajo'],['transferencia','Devolver al almacén']] : Object.entries(TIPOS_MOV).map(([k,v])=>[k,v[0]]);
  if(!d.tipo || !tipos.some(t=>t[0]===d.tipo)) d.tipo = tipos[0][0];
  if(tec && mu){ d.de = mu.id; if(d.tipo==='transferencia') d.a = almCentral().id; }
  const it = item(d.itemId);
  const its = I.items.filter(x=>x.activo!==false && x.tipo!=='herramienta' && (d.tipo==='ingreso' || !d.de || stk(d.de,x.id)>0 || x.id===d.itemId));
  const trabs = trabajosPara(tec);
  let f = `<div class="fr"><div class="f"><label>Qué pasó</label><select data-m="tipo" data-mr>${tipos.map(([k,l])=>`<option value="${k}" ${d.tipo===k?'selected':''}>${l}</option>`).join('')}</select></div><div class="f"><label>Fecha</label><input type="date" data-m="fecha" value="${e(d.fecha||HOY())}"></div></div>`;
  if(['transferencia','consumo','baja','ajuste'].includes(d.tipo)) f += `<div class="f"><label>${d.tipo==='ajuste'?'Almacén donde contaste':'Sale de'}</label><select data-m="de" data-mr ${tec&&mu?'disabled':''}><option value="">Elige…</option>${almOpts(d.de)}</select></div>`;
  if(['ingreso','transferencia'].includes(d.tipo)) f += `<div class="f"><label>${d.tipo==='ingreso'?'Entra a':'Llega a'}</label><select data-m="a" ${tec&&mu?'disabled':''}><option value="">Elige…</option>${almOpts(d.a, d.tipo==='transferencia'?d.de:'')}</select></div>`;
  f += `<div class="f"><label>Artículo</label><select data-m="itemId" data-mr><option value="">Elige…</option>${its.map(x=>`<option value="${x.id}" ${d.itemId===x.id?'selected':''}>${e(x.nombre)}${d.de && d.tipo!=='ingreso' ? ` · hay ${n0(stk(d.de,x.id))} ${e(x.un)}` : ''}</option>`).join('')}</select>${!its.length && d.de ? '<small>No hay stock en ese almacén.</small>' : ''}</div>`;
  if(it){
    if(it.serie && d.tipo!=='ajuste'){
      if(d.tipo==='ingreso') f += `<div class="f"><label>Números de serie (uno por línea)</label><textarea data-m="seriesTxt" placeholder="Ejemplo: CMP-24-0201">${e(d.seriesTxt||'')}</textarea><small>La cantidad es el número de series que escribas.</small></div>`;
      else { const disp = I.series.filter(s=>s.itemId===it.id && s.alm===d.de && s.estado==='stock'); f += `<div class="f"><label>Series</label>${disp.length ? `<div class="ckl">${disp.map(s=>`<label class="chk"><input type="checkbox" data-ms="${e(s.serie)}" ${(d.series||[]).includes(s.serie)?'checked':''}> ${e(s.serie)}</label>`).join('')}</div>` : '<p class="mini">No hay series disponibles en ese almacén.</p>'}</div>`; }
    } else if(d.tipo==='ajuste') f += `<div class="fr"><div class="f"><label>Stock en el sistema</label><input type="text" value="${n0(stk(d.de,it.id))} ${e(it.un)}" disabled></div><div class="f"><label>Cantidad contada (${e(it.un)})</label><input type="number" min="0" step="any" data-m="contado" value="${e(d.contado??'')}"></div></div>`;
    else f += `<div class="f"><label>Cantidad (${e(it.un)})</label><input type="number" min="0" step="any" data-m="cant" value="${e(d.cant??'')}"></div>`;
    if(d.tipo==='ingreso') f += `<div class="fr"><div class="f"><label>Costo unitario (S/)</label><input type="number" min="0" step="any" data-m="costo" value="${e(d.costo ?? it.costo ?? '')}"></div><div class="f"><label>Proveedor</label><input type="text" data-m="prov" value="${e(d.prov||'')}"></div><div class="f"><label>Factura o guía</label><input type="text" data-m="doc" value="${e(d.doc||'')}"></div></div>${it.lote ? `<div class="fr"><div class="f"><label>Lote</label><input type="text" data-m="lote" value="${e(d.lote||'')}"></div><div class="f"><label>Vence</label><input type="date" data-m="venc" value="${e(d.venc||'')}"></div></div>` : ''}`;
    if(d.tipo==='consumo'){
      f += `<div class="f"><label>Trabajo</label><select data-m="trabajo"><option value="">${trabs.length?'Elige el trabajo…':'No hay trabajos programados'}</option>${trabs.map(t=>`<option value="${e(t.id)}" ${d.trabajo===t.id?'selected':''}>${e(trabTxt(t))}</option>`).join('')}</select></div>`;
      if(I.equipos.length) f += `<div class="f"><label>Equipo del cliente (opcional)</label><select data-m="equipoId"><option value="">Ninguno</option>${I.equipos.map(q=>`<option value="${q.id}" ${d.equipoId===q.id?'selected':''}>${e(q.codigo)} · ${e(q.tipo)} · ${e(q.ubic||q.cliente)}</option>`).join('')}</select><small>Si es un repuesto instalado, queda en el historial del equipo.</small></div>`;
      if(it.tipo==='repuesto') f += `<label class="chk"><input type="checkbox" data-m="cobrar" ${d.cobrar?'checked':''} ${tec?'disabled':''}> Se cobra al cliente${it.precio ? ` (${S(it.precio)} c/u)` : ''}</label>`;
    }
    if(['baja','ajuste'].includes(d.tipo)) f += `<div class="f"><label>Motivo</label><input type="text" data-m="nota" value="${e(d.nota||'')}" placeholder="${d.tipo==='baja'?'Vencido, dañado, derramado…':'Conteo físico del mes'}"></div>`;
  }
  return { t:tec ? (d.tipo==='consumo' ? 'Registrar lo que usé' : 'Devolver al almacén') : 'Registrar movimiento', s:tec ? 'En la app se guarda aunque no tengas señal y se envía al recuperarla.' : 'Cada movimiento queda en el kardex con fecha y responsable.', b:f,
    f:'<button class="btn" data-a="md-cerrar">Cancelar</button><button class="btn p" data-a="mov-guardar">Guardar</button>' };
};
MDS.alm = d => ({ t:'Nuevo almacén', s:'El almacén central, una unidad móvil o un almacén en la sede de un cliente.', b:`<div class="fr"><div class="f"><label>Nombre</label><input type="text" data-m="nombre" value="${e(d.nombre||'')}" placeholder="Almacén Sede Central del cliente"></div><div class="f"><label>Tipo</label><select data-m="tipo" data-mr>${Object.entries(TIPOS_ALM).map(([k,v])=>`<option value="${k}" ${d.tipo===k?'selected':''}>${v}</option>`).join('')}</select></div></div>
  ${d.tipo==='unidad' ? `<div class="f"><label>Unidad de la agenda</label><select data-m="unidad"><option value="">Ninguna</option>${(O.unidades||[]).filter(u=>!I.alm.some(a=>a.unidad===u.nombre)).map(u=>`<option value="${e(u.nombre)}" ${d.unidad===u.nombre?'selected':''}>${e(u.nombre)}</option>`).join('')}</select><small>Así sus técnicos ven este stock en su app.</small></div>` : `<div class="f"><label>Responsable</label><input type="text" data-m="resp" value="${e(d.resp||'')}"></div>`}`,
  f:'<button class="btn" data-a="md-cerrar">Cancelar</button><button class="btn p" data-a="alm-guardar">Crear</button>' });
MDS.herrn = d => { const hs = I.items.filter(i=>i.tipo==='herramienta' && i.activo!==false); if(!d.itemId) d.itemId = hs.length ? hs[0].id : 'nuevo';
  return { t:'Nueva herramienta o equipo propio', s:'Cada unidad física tiene su código, su ubicación y su mantenimiento.', b:`<div class="f"><label>Tipo</label><select data-m="itemId" data-mr>${hs.map(i=>`<option value="${i.id}" ${d.itemId===i.id?'selected':''}>${e(i.nombre)}</option>`).join('')}<option value="nuevo" ${d.itemId==='nuevo'?'selected':''}>Otro tipo…</option></select></div>
  ${d.itemId==='nuevo' ? `<div class="fr"><div class="f"><label>Nombre del tipo</label><input type="text" data-m="tipoNombre" value="${e(d.tipoNombre||'')}" placeholder="Hidrolavadora"></div><div class="f"><label>Costo (S/)</label><input type="number" min="0" data-m="costo" value="${e(d.costo||'')}"></div><div class="f"><label>Mantenimiento cada (meses)</label><input type="number" min="0" data-m="frec" value="${e(d.frec??6)}"></div></div>` : ''}
  <div class="fr"><div class="f"><label>Identificador</label><input type="text" data-m="nombre" value="${e(d.nombre||'')}" placeholder="Inyectora 3"></div><div class="f"><label>Dónde queda</label><select data-m="alm">${almOpts(d.alm||almCentral().id)}</select></div></div>`,
  f:'<button class="btn" data-a="md-cerrar">Cancelar</button><button class="btn p" data-a="herrn-guardar">Agregar</button>' }; };
MDS.herra = d => { const h = I.herr.find(x=>x.id===d.id);
  return { t:`Asignar ${h.nombre}`, b:`<div class="f"><label>A quién o a qué unidad</label><select data-m="dest"><option value="">Elige…</option><optgroup label="Unidades">${almUnidades().map(a=>`<option value="alm:${a.id}" ${d.dest==='alm:'+a.id?'selected':''}>${e(a.nombre)}</option>`).join('')}</optgroup><optgroup label="Personas">${personas().map(p=>`<option value="per:${e(p)}" ${d.dest==='per:'+p?'selected':''}>${e(p)}</option>`).join('')}</optgroup></select></div>`,
  f:'<button class="btn" data-a="md-cerrar">Cancelar</button><button class="btn p" data-a="herra-guardar">Asignar</button>' }; };
MDS.herrf = d => { const h = I.herr.find(x=>x.id===d.id);
  return { t:`Reportar falla: ${h.nombre}`, s:'Tu supervisor la verá y la enviará a mantenimiento.', b:`<div class="f"><label>¿Qué le pasa?</label><textarea data-m="txt" placeholder="Poca succión, ruido en el motor, fuga en la manguera…">${e(d.txt||'')}</textarea></div>`,
  f:'<button class="btn" data-a="md-cerrar">Cancelar</button><button class="btn p" data-a="herrf-guardar">Reportar</button>' }; };
MDS.herrl = d => { const h = I.herr.find(x=>x.id===d.id);
  return { t:`${h.nombre} · ${h.codigo}`, s:`${EST_HERR[h.estado][0]} · ${e(ubicH(h))} · mantenimiento cada ${h.frec||'—'} meses`, b:`<ul class="tl">${(h.log||[]).map(l=>`<li><span>${fF(l.fecha)}</span><div>${e(l.t)}<small class="mini" style="display:block">${e(l.quien||'')}</small></div></li>`).join('') || '<li><span></span><div class="mini">Sin registros.</div></li>'}</ul>`,
  f:'<button class="btn" data-a="md-cerrar">Cerrar</button>' }; };
MDS.eq = d => {
  const q = d.id ? equipo(d.id) : null;
  if(!q || d.edit){
    return { t:q ? `Editar ${q.codigo}` : 'Nuevo equipo del cliente', s:'Un ascensor, un aire acondicionado, una bomba, un tablero…', b:`<div class="fr"><div class="f"><label>Código</label><input type="text" data-m="codigo" value="${e(d.codigo||'')}"></div><div class="f"><label>Tipo de equipo</label><input type="text" data-m="tipo" value="${e(d.tipo||'')}" placeholder="Ascensor de pasajeros"></div></div>
      <div class="fr"><div class="f"><label>Marca</label><input type="text" data-m="marca" value="${e(d.marca||'')}"></div><div class="f"><label>Modelo</label><input type="text" data-m="modelo" value="${e(d.modelo||'')}"></div><div class="f"><label>N.° de serie</label><input type="text" data-m="serie" value="${e(d.serie||'')}"></div></div>
      <div class="fr"><div class="f"><label>Cliente</label><input type="text" data-m="cliente" list="cliOps" value="${e(d.cliente||'')}"><datalist id="cliOps">${[...new Set((O.clientes||[]).concat(I.equipos.map(x=>x.cliente)))].slice(0,400).map(c=>`<option value="${e(c)}">`).join('')}</datalist></div><div class="f"><label>Ubicación</label><input type="text" data-m="ubic" value="${e(d.ubic||'')}" placeholder="Torre A · piso 3"></div></div>
      <div class="fr"><div class="f"><label>Preventivo cada (meses)</label><input type="number" min="0" data-m="frec" value="${e(d.frec??6)}"></div><div class="f"><label>Último servicio</label><input type="date" data-m="ult" value="${e(d.ult||'')}"></div><div class="f"><label>Etiquetas</label><input type="text" data-m="tagsTxt" value="${e(d.tagsTxt||'')}" placeholder="ascensor, tracción"><small>Con ellas se le asocian los manuales de la Biblioteca.</small></div></div>`,
      f:`<button class="btn" data-a="${q?'eq-ver':'md-cerrar'}" ${q?`data-id="${q.id}"`:''}>Cancelar</button><button class="btn p" data-a="eq-guardar">Guardar</button>` };
  }
  const v = q.prox && q.prox<HOY(), p = q.prox && !v && q.prox<=addD(HOY(),15);
  const qt = (q.tags||[]).map(norm);
  const docs = A.arts.filter(a=>a.estado==='publicado' && (a.tags||[]).some(t=>qt.includes(norm(t))) && (!modoTec() || artVisible(a.id)));
  const reps = I.series.filter(s=>s.equipoId===q.id);
  const usos = I.movs.filter(m=>m.equipoId===q.id && m.tipo==='consumo' && !(m.series||[]).length);
  const trabs = trabajosPara(modoTec());
  const svc = d.svc ? `<div class="card" style="box-shadow:none;background:var(--sunk)"><div class="ch" style="margin-bottom:8px"><h2>Registrar servicio</h2></div>
    <div class="fr"><div class="f"><label>Fecha</label><input type="date" data-m="s_fecha" value="${e(d.s_fecha||HOY())}"></div><div class="f"><label>Tipo</label><select data-m="s_tipo">${['Preventivo','Correctivo','Instalación','Inspección'].map(t=>`<option ${d.s_tipo===t?'selected':''}>${t}</option>`).join('')}</select></div><div class="f"><label>Técnico</label><select data-m="s_tec">${personas().concat(personas().includes(yo())?[]:[yo()]).map(x=>`<option ${ (d.s_tec||yo())===x?'selected':''}>${e(x)}</option>`).join('')}</select></div></div>
    <div class="f"><label>Trabajo (opcional)</label><select data-m="s_trab"><option value="">Ninguno</option>${trabs.map(t=>`<option value="${e(t.id)}" ${d.s_trab===t.id?'selected':''}>${e(trabTxt(t))}</option>`).join('')}</select></div>
    <div class="f"><label>Qué se hizo</label><textarea data-m="s_det" placeholder="Limpieza de filtros, prueba de puertas, cambio de contactor…">${e(d.s_det||'')}</textarea></div>
    <div class="row end"><button class="btn" data-a="eq-svc">Cancelar</button><button class="btn p" data-a="svc-guardar">Guardar servicio</button></div></div>` : `<div class="row"><button class="btn p" data-a="eq-svc">Registrar servicio</button>${modoTec() ? '' : '<button class="btn" data-a="eq-editar">Editar datos</button>'}<button class="btn" data-a="mov-nuevo" data-t="consumo" data-eq="${q.id}">Registrar repuesto instalado</button></div>`;
  const b = `<div class="eqh"><div class="kv"><div><span>Cliente</span><b>${e(q.cliente)}</b></div><div><span>Ubicación</span><b>${e(q.ubic||'—')}</b></div><div><span>Marca y modelo</span><b>${e([q.marca,q.modelo].filter(Boolean).join(' · ')||'—')}</b></div><div><span>N.° de serie</span><b>${e(q.serie||'—')}</b></div><div><span>Último servicio</span><b>${fF(q.ult)}</b></div><div><span>Próximo preventivo</span><b>${fF(q.prox)} ${v?pill('Vencido','r'):p?pill('Próximo','wa'):''}</b></div></div>
    <div style="text-align:center"><div class="qr" id="qrBox"><span class="mini">QR</span></div><p class="mini" style="margin-top:6px">${e(q.codigo)} · pégalo en el equipo</p></div></div>
    ${svc}
    <div><p class="sec">Manuales y protocolos de este equipo</p>${docs.length ? `<div class="chips">${docs.map(a=>`<button class="chip" data-a="art-abrir-otro" data-id="${a.id}">${e(a.titulo)}</button>`).join('')}</div>` : '<p class="mini">No hay documentos con las etiquetas de este equipo. Agrégalas al artículo en la Biblioteca.</p>'}</div>
    <div><p class="sec">Repuestos instalados</p>${reps.length || usos.length ? `<ul class="lst">${reps.map(s=>`<li><div><b>${e((item(s.itemId)||{}).nombre||'')}</b><small>Serie ${e(s.serie)} · ${fF(s.fecha)}${s.trabajo?' · '+e(s.trabajo):''}</small></div>${pill(s.garantia && s.garantia>=HOY() ? 'Garantía hasta '+fF(s.garantia) : 'Sin garantía', s.garantia && s.garantia>=HOY() ? 'ok' : '')}</li>`).join('')}${usos.map(m=>`<li><div><b>${e((item(m.itemId)||{}).nombre||'')}</b><small>${n0(m.cant)} ${e((item(m.itemId)||{}).un||'')} · ${fF(m.fecha)}${m.trabajoTxt?' · '+e(m.trabajoTxt):''}</small></div>${m.cobrar?pill('Cobrado','v'):''}</li>`).join('')}</ul>` : '<p class="mini">Aún no se le instalaron repuestos.</p>'}</div>
    <div><p class="sec">Historial</p><ul class="tl">${(q.hist||[]).map(h=>`<li><span>${fF(h.fecha)}</span><div><b>${e(h.tipo)}</b> · ${e(h.detalle||'')}<small class="mini" style="display:block">${e([h.tecnico,h.trabajo].filter(Boolean).join(' · '))}</small></div></li>`).join('') || '<li><span></span><div class="mini">Sin servicios registrados.</div></li>'}</ul></div>`;
  return { t:`${q.tipo} · ${q.codigo}`, s:e(`${q.cliente}${q.ubic?' · '+q.ubic:''}`), b, w:true, qr:'VITTKLY:EQUIPO:'+q.codigo, f:'<button class="btn" data-a="md-cerrar">Cerrar</button>' };
};
MDS.ped = d => {
  const tec = modoTec(), mu = miUnidad();
  if(!d.alm) d.alm = (mu || almUnidades()[0] || {}).id || '';
  const its = I.items.filter(i=>i.activo!==false && i.tipo!=='herramienta');
  return { t:'Pedir reposición', s:'El almacén lo recibe y te lo envía a tu unidad.', b:`<div class="f"><label>Para</label><select data-m="alm" data-mr ${tec&&mu?'disabled':''}>${almOpts(d.alm, almCentral().id)}</select></div>
    <div class="tw"><table><thead><tr><th>Artículo</th><th class="r">Tienes</th><th class="r" style="width:120px">Pedir</th></tr></thead><tbody>${its.map(it=>`<tr><td>${e(it.nombre)}<small class="mini" style="display:block">${e(it.un)}</small></td><td class="r num">${n0(stk(d.alm,it.id))}</td><td class="r"><input type="number" min="0" step="any" data-mqty="${it.id}" value="${e((d.q||{})[it.id]||'')}" aria-label="Cantidad de ${e(it.nombre)}"></td></tr>`).join('')}</tbody></table></div>
    <div class="f"><label>Nota (opcional)</label><input type="text" data-m="nota" value="${e(d.nota||'')}"></div>`,
    f:'<button class="btn" data-a="md-cerrar">Cancelar</button><button class="btn p" data-a="ped-guardar">Enviar pedido</button>' };
};
MDS.tpl = () => { const T = plantillas(O);
  return { t:'Plantillas por rubro', s:'Agregan artículos, equipos de ejemplo, protocolos y cursos de ese rubro, sin borrar lo que ya tienes. Después edítalos: son tuyos.', w:true,
    b:`<div class="cards">${Object.entries(T).map(([k,t])=>{ const ya = I.rubros.includes(k) && A.rubros.includes(k); return `<div class="ac" style="cursor:default"><h3>${e(t.nombre)}</h3><p>${e(t.d)}</p><div class="sum"><span>${t.items.length} artículos</span><span>${t.equipos.length} equipos</span><span>${t.arts.length} en biblioteca</span><span>${t.cursos.length} curso(s)</span></div><div class="row">${ya ? pill('Ya agregada','ok') : `<button class="btn s p" data-a="tpl-aplicar" data-id="${k}">Agregar</button>`}</div></div>`; }).join('')}</div>`,
    f:'<button class="btn" data-a="md-cerrar">Cerrar</button>' }; };

/* ======================= BIBLIOTECA Y ACADEMIA: AYUDAS ======================= */
const art = id => A.arts.find(a=>a.id===id);
const curso = id => A.cursos.find(c=>c.id===id);
const catN = id => (A.cats.find(c=>c.id===id)||{}).nombre || 'Sin categoría';
const grupo = id => A.grupos.find(g=>g.id===id);
const gruposDe = p => A.grupos.filter(g=>(g.miembros||[]).includes(p)).map(g=>g.id);
const audOk = (aud, p) => !aud || aud==='todos' || (Array.isArray(aud) && (!aud.length || aud.some(g=>gruposDe(p).includes(g))));
const audTxt = aud => !aud || aud==='todos' || !aud.length ? 'Todo el equipo' : aud.map(g=>(grupo(g)||{}).nombre).filter(Boolean).join(', ') || 'Nadie';
const habNombre = id => (A.habs.find(h=>h.id===id)||{}).nombre || '';
const servNombre = id => ((O.servicios||[]).find(s=>s.id===id)||{}).nombre || id;
const leida = (a, p) => { const l = (a.lect||{})[p]; return !!l && l.version===a.version; };
const safeUrl = u => /^https?:\/\//i.test(String(u||'').trim()) ? String(u).trim() : '#';
const inl = s => e(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
function artVisible(id){ const a = art(id); if(!a) return false; if(!modoTec()) return a.estado!=='rechazado'; return a.estado==='publicado' && audOk(a.aud, yo()); }
const cursosDe = p => A.cursos.filter(c=>c.estado!=='archivado' && audOk(c.aud, p));
const progR = (p, cid) => (A.prog[p]||{})[cid];
const progW = (p, cid) => { A.prog[p] = A.prog[p] || {}; A.prog[p][cid] = A.prog[p][cid] || { vistos:[], intentos:[] }; return A.prog[p][cid]; };
function estCurso(c, p){
  const g = progR(p, c.id);
  if(g && g.aprobado){ const vence = c.vig ? addM(g.aprobado, c.vig) : null;
    if(vence && vence < HOY()) return { k:'vencido', l:'Vencido', c:'r', vence };
    if(vence && dias(HOY(), vence) <= 30) return { k:'porvencer', l:'Por vencer', c:'wa', vence };
    return { k:'ok', l:'Aprobado', c:'ok', vence }; }
  if(g && ((g.vistos||[]).length || (g.intentos||[]).length)) return { k:'curso', l:'En curso', c:'in' };
  return { k:'pend', l:'Pendiente', c:'' };
}
function habilidadesDe(p){
  const out = [];
  A.habs.forEach(h=>{ let best = null;
    A.cursos.filter(c=>c.hab===h.id).forEach(c=>{ const s = estCurso(c, p); if(s.k==='ok' || s.k==='porvencer'){ if(!best || (s.vence||'9999') > (best.vence||'9999')) best = { vence:s.vence||null, porVencer:s.k==='porvencer' }; } });
    if(!best && (h.manual||[]).includes(p)) best = { vence:null, porVencer:false, manual:true };
    if(best) out.push({ id:h.id, nombre:h.nombre, ...best }); });
  return out;
}
function buscarArts(){
  const words = norm(UI.bq).trim().split(/\s+/).filter(Boolean);
  let L = A.arts.filter(a=>modoTec() ? artVisible(a.id) : (a.estado!=='rechazado' && a.estado!=='propuesto'));
  if(UI.bcat) L = L.filter(a=>a.cat===UI.bcat);
  if(UI.btipo) L = L.filter(a=>a.tipo===UI.btipo);
  if(UI.bfav) L = L.filter(a=>(a.favs||[]).includes(yo()));
  if(UI.bpend) L = L.filter(a=>a.obligatorio && a.estado==='publicado' && audOk(a.aud, yo()) && !leida(a, yo()));
  if(words.length){
    L = L.map(a=>{ const t = norm(a.titulo), tg = norm((a.tags||[]).join(' ')), r = norm(a.resumen), c = norm(a.cuerpo); let s = 0;
      for(const w of words){ if(t.includes(w)) s += 5; else if(tg.includes(w)) s += 4; else if(r.includes(w)) s += 2; else if(c.includes(w)) s += 1; else return null; }
      return { a, s }; }).filter(Boolean).sort((x,y)=>y.s-x.s).map(x=>x.a);
  } else L = L.slice().sort((x,y)=>(y.vistas||0)-(x.vistas||0));
  return L;
}
function registrarBusq(q){
  if(!modoTec()) return;
  const b = A.busq.find(x=>norm(x.q)===norm(q));
  if(b){ b.n++; b.ts = ahora(); } else A.busq.unshift({ q, n:1, ts:ahora() });
  A.busq = A.busq.slice(0, 30); guardar('con');
}
// Contenido de un artículo: «## » título, «1. » paso, «- » viñeta, «?? » pregunta con opciones «=> Opción: qué hacer».
function cuerpoHtml(txt, aid){
  const L = String(txt||'').split('\n'); let h = '', list = null, decN = 0;
  const close = () => { if(list){ h += `</${list}>`; list = null; } };
  const open = t => { if(list!==t){ close(); h += `<${t}>`; list = t; } };
  for(let i = 0; i < L.length; i++){
    const t = L[i].trim(); if(!t){ close(); continue; }
    if(t.startsWith('## ')){ close(); h += `<h3>${inl(t.slice(3))}</h3>`; continue; }
    const m = t.match(/^(\d+)\.\s+(.*)$/), isNum = !!m, body = m ? m[2] : t.startsWith('- ') ? t.slice(2) : t;
    if(body.startsWith('?? ')){
      const ops = [];
      while(i+1 < L.length && L[i+1].trim().startsWith('=> ')){ i++; const o = L[i].trim().slice(3), k = o.indexOf(':'); const r = k>0 ? o.slice(k+1).trim() : ''; ops.push([k>0 ? o.slice(0,k).trim() : o, r.charAt(0).toUpperCase()+r.slice(1)]); }
      const id = `${aid}-${decN++}`, sel = (UI.dec||{})[id];
      const blk = `<div class="dec"><b>${inl(body.slice(3))}</b><div class="ops">${ops.map((o,j)=>`<button class="chip" data-a="dec" data-id="${e(id)}" data-j="${j}" aria-pressed="${sel===j}">${inl(o[0])}</button>`).join('')}</div>${sel!=null && ops[sel] ? `<div class="ans">${inl(ops[sel][1])}</div>` : '<p class="mini">Elige una opción para ver qué hacer.</p>'}</div>`;
      if(isNum){ open('ol'); h += `<li value="${m[1]}">${blk}</li>`; } else { close(); h += blk; }
      continue;
    }
    if(isNum){ open('ol'); h += `<li value="${m[1]}">${inl(body)}</li>`; continue; }
    if(t.startsWith('- ')){ open('ul'); h += `<li>${inl(body)}</li>`; continue; }
    close(); h += `<p>${inl(t)}</p>`;
  }
  close(); return h;
}

/* ======================= BIBLIOTECA Y ACADEMIA: VISTAS ======================= */
function vAca(){
  const tec = modoTec(), nProp = A.arts.filter(a=>a.estado==='propuesto').length;
  const tabs = tec ? [['bib','Biblioteca'],['mis','Mis cursos'],['cert','Mis certificados']]
    : [['bib',`Biblioteca${nProp?` <span class="bd">${nProp}</span>`:''}`],['cur','Cursos'],['ava','Avance del equipo'],['hab','Habilidades'],['gru','Grupos']];
  if(!tabs.some(t=>t[0]===UI.acaTab)) UI.acaTab = 'bib';
  const pend = tec ? cursosDe(yo()).filter(c=>{ const k = estCurso(c, yo()).k; return c.obligatorio && ['pend','curso','vencido'].includes(k); }).length : 0;
  const head = `<div class="card"><div class="ophd"><div><h2>Biblioteca y Academia</h2><p>${tec ? 'Todo lo que necesitas para hacer bien tu trabajo: protocolos, fichas, manuales y tus cursos. Lo que guardas en favoritos lo tienes aunque no haya señal.' : 'El conocimiento de tu empresa en un solo lugar: se consulta y se busca cuando hace falta, y se convierte en cursos con examen, certificado y habilidades.'}</p></div>
    <div class="row">${tec ? '<button class="btn" data-a="aporte-nuevo">Compartir lo que aprendí</button>' : '<button class="btn p" data-a="art-nuevo">Nuevo artículo</button><button class="btn" data-a="cur-nuevo">Nuevo curso</button><button class="btn g" data-a="plantillas">Plantillas por rubro</button>'}</div></div>
    ${pend ? `<div class="note wa" style="margin-top:10px">Tienes ${pend} curso(s) obligatorio(s) por completar. <button class="lnk" data-a="atab" data-id="mis">Ir a mis cursos</button></div>` : ''}
    <div class="tabs" role="tablist">${tabs.map(([k,l])=>`<button class="tab" role="tab" data-a="atab" data-id="${k}" aria-selected="${UI.acaTab===k}">${l}</button>`).join('')}</div></div>`;
  if(!A.arts.length && !A.cursos.length) return head + emptyRubro('aca');
  return head + ({ bib:acaBib, cur:acaCur, ava:acaAva, hab:acaHab, gru:acaGru, mis:acaMis, cert:acaCert }[UI.acaTab])();
}
function acaBib(){
  if(UI.art) return lector();
  const tec = modoTec(), prop = A.arts.filter(a=>a.estado==='propuesto');
  const pendL = A.arts.filter(a=>a.obligatorio && a.estado==='publicado' && audOk(a.aud, yo()) && !leida(a, yo()));
  const panel = !tec && (prop.length || A.busq.length) ? `<div class="grid g2">
    ${prop.length ? `<div class="card"><div class="ch"><div><h2>Aportes por revisar</h2><p>Lo que el equipo propuso desde campo.</p></div>${pill(prop.length,'in')}</div><ul class="lst">${prop.map(a=>`<li><div><b>${e(a.titulo)}</b><small>${e(a.autor)} · ${fF(a.creado)}</small></div><button class="btn s" data-a="art-abrir" data-id="${a.id}">Revisar</button></li>`).join('')}</ul></div>` : ''}
    ${A.busq.length ? `<div class="card"><div class="ch"><div><h2>Búsquedas sin resultado</h2><p>Lo que el equipo buscó y no encontró: contenido que falta crear.</p></div></div><ul class="lst">${A.busq.slice(0,6).map(b=>`<li><div><b>«${e(b.q)}»</b><small>${b.n} ${b.n===1?'vez':'veces'}</small></div><div class="row"><button class="btn s" data-a="busq-crear" data-id="${e(b.q)}">Crear artículo</button><button class="btn s g" data-a="busq-quitar" data-id="${e(b.q)}">Quitar</button></div></li>`).join('')}</ul></div>` : ''}</div>` : '';
  return `${panel}${tec && pendL.length ? `<div class="note wa"><b>Tienes ${pendL.length} lectura(s) obligatoria(s) pendiente(s).</b> <button class="lnk" data-a="bpend">Verlas</button></div>` : ''}
  <div class="card"><div class="srch">${ICO_SRCH}<input type="search" data-in="bq" placeholder="Busca un protocolo, una ficha, un equipo, una mancha…" value="${e(UI.bq||'')}" aria-label="Buscar en la biblioteca"></div>
    <div class="row" style="margin-top:10px"><div class="chips"><button class="chip" data-a="bcat" data-id="" aria-pressed="${!UI.bcat}">Todas</button>${A.cats.map(c=>`<button class="chip" data-a="bcat" data-id="${c.id}" aria-pressed="${UI.bcat===c.id}">${e(c.nombre)}</button>`).join('')}</div></div>
    <div class="row" style="margin-top:8px"><select data-in="btipo" style="width:auto" aria-label="Tipo de contenido"><option value="">Todos los tipos</option>${Object.entries(TIPOS_ART).map(([k,v])=>`<option value="${k}" ${UI.btipo===k?'selected':''}>${v}</option>`).join('')}</select><button class="chip" data-a="bfav" aria-pressed="${!!UI.bfav}">Mis favoritos</button><button class="chip" data-a="bpend" aria-pressed="${!!UI.bpend}">Lecturas obligatorias pendientes</button></div></div>
  <div id="bibRes">${bibLista()}</div>`;
}
function bibLista(){
  const L = buscarArts(), tec = modoTec();
  if(!L.length) return `<div class="empty"><h3>No encontramos nada${UI.bq ? ` para «${e(UI.bq)}»` : ''}</h3><p class="sub">${tec ? 'Tu búsqueda queda anotada para que se cree ese contenido. Si tú sabes cómo resolverlo, compártelo.' : 'Crea el artículo o revisa los filtros.'}</p><div class="row"><button class="btn" data-a="${tec?'aporte-nuevo':'art-nuevo'}">${tec?'Compartir lo que sé':'Nuevo artículo'}</button></div></div>`;
  return `<div class="cards">${L.map(artCard).join('')}</div>`;
}
function artCard(a){
  const p = yo(), obl = a.obligatorio && a.estado==='publicado';
  const col = a.tipo==='politica' ? 'var(--warn)' : a.tipo==='tip' ? 'var(--ok)' : 'var(--pri)';
  return `<button class="ac top" style="--c:${col}" data-a="art-abrir" data-id="${a.id}"><div class="row">${pill(TIPOS_ART[a.tipo]||a.tipo, a.tipo==='tip'?'ok':'in')}${obl ? (leida(a,p) ? pill('Leída','ok') : pill('Lectura obligatoria','wa')) : ''}${a.estado==='borrador' ? pill('Borrador','') : ''}${(a.favs||[]).includes(p) ? pill('Favorito','v') : ''}</div><h3>${e(a.titulo)}</h3><p>${e(a.resumen||'')}</p><div class="ft"><span>${e(catN(a.cat))}</span><span>Versión ${a.version}</span><span>${n0(a.vistas||0)} vistas</span>${a.aporte ? '<span>Aporte de campo</span>' : ''}</div></button>`;
}
function lector(){
  const a = art(UI.art); if(!a){ UI.art = null; return acaBib(); }
  const p = yo(), tec = modoTec(), ver = UI.artVer ? (a.hist||[]).find(h=>h.version===UI.artVer) : null;
  const obl = a.obligatorio && a.estado==='publicado', pers = personas().filter(x=>audOk(a.aud, x)), lect = pers.filter(x=>leida(a, x));
  const at = (a.tags||[]).map(norm), its = I.items.filter(i=>i.doc===a.id), eqs = I.equipos.filter(q=>(q.tags||[]).some(t=>at.includes(norm(t))));
  const fav = (a.favs||[]).includes(p), pct = pers.length ? Math.round(lect.length/pers.length*100) : 0;
  return `<div class="card art"><div class="row" style="justify-content:space-between"><button class="btn s g" data-a="art-volver">← Volver a la biblioteca</button><div class="row"><button class="btn s" data-a="art-fav">${fav?'Quitar de favoritos':'Guardar en favoritos'}</button>${!tec ? '<button class="btn s" data-a="art-editar">Editar</button>' : ''}</div></div>
    ${a.estado==='propuesto' ? `<div class="note" style="margin-top:12px"><b>Aporte propuesto por ${e(a.autor)}.</b> Revísalo y, si está bien, apruébalo para que lo vea todo el equipo. Puedes editarlo antes.${!tec ? `<div class="row" style="margin-top:8px"><button class="btn s p" data-a="art-aprobar">Aprobar y publicar</button><button class="btn s d" data-a="art-rechazar">Rechazar</button></div>` : ''}</div>` : ''}
    ${a.estado==='borrador' ? '<div class="note wa" style="margin-top:12px">Borrador: el equipo aún no lo ve.</div>' : ''}
    ${ver ? `<div class="note wa" style="margin-top:12px">Estás viendo la versión ${ver.version}, que ya no está vigente. <button class="lnk" data-a="art-ver" data-id="">Ver la vigente</button></div>` : ''}
    <div class="art-h" style="margin-top:12px"><div class="row">${pill(TIPOS_ART[a.tipo]||a.tipo,'in')}${obl ? pill('Lectura obligatoria','wa') : ''}${a.aporte ? pill('Aporte de campo','ok') : ''}</div>
      <h2 style="margin-top:8px">${e(ver ? ver.titulo : a.titulo)}</h2>
      <div class="meta" style="margin-top:6px"><span>${e(catN(a.cat))}</span><span>Versión ${ver ? ver.version : a.version} · ${ver ? 'desde '+fF(ver.fecha) : 'vigente desde '+fF(a.desde)}</span>${a.aprobo && a.estado==='publicado' && !ver ? `<span>Aprobó: ${e(a.aprobo)}</span>` : ''}${a.autor ? `<span>Autor: ${e(a.autor)}</span>` : ''}</div>
      ${a.resumen && !ver ? `<p class="sub" style="margin-top:8px">${e(a.resumen)}</p>` : ''}</div>
    ${a.cambio && !ver && a.version>1 ? `<div class="note" style="margin-top:10px"><b>Qué cambió en la versión ${a.version}:</b> ${e(a.cambio)}</div>` : ''}
    ${a.archivo && !ver ? (/^video/.test(a.archivo.type) ? `<video controls preload="metadata" src="${e(a.archivo.url)}" style="width:100%;border-radius:12px;margin-top:12px;background:#000"></video>` : `<div class="row" style="margin-top:12px"><a class="btn" href="${e(a.archivo.url)}" target="_blank" rel="noopener">Abrir ${e(a.archivo.name)}</a></div>`) : ''}
    <div class="art-b">${cuerpoHtml(ver ? ver.cuerpo : a.cuerpo, a.id)}</div>
    ${(a.video || a.adjunto) && !ver ? `<div class="row" style="margin-top:10px">${a.video ? `<a class="btn" href="${e(safeUrl(a.video))}" target="_blank" rel="noopener">Ver el video</a>` : ''}${a.adjunto ? `<a class="btn" href="${e(safeUrl(a.adjunto))}" target="_blank" rel="noopener">Abrir el documento</a>` : ''}</div>` : ''}
    ${its.length || eqs.length ? `<div class="fb"><span class="mini">Relacionado:</span>${its.map(i=>pill(i.nombre,'v')).join('')}${eqs.slice(0,6).map(q=>`<button class="chip" data-a="eq-ver" data-id="${q.id}">${e(q.codigo)} · ${e(q.ubic||q.tipo)}</button>`).join('')}</div>` : ''}
    ${a.estado==='publicado' && !ver ? `<div class="fb">${obl && audOk(a.aud, p) ? (leida(a, p) ? pill(`Leíste y entendiste esta versión el ${fF(a.lect[p].fecha)}`,'ok') : '<button class="btn p bigb" data-a="art-leida">Leí y entendí</button>') : ''}<span style="flex:1"></span><span class="mini">¿Te sirvió?</span><button class="btn s" data-a="art-util" data-id="si" ${(UI.util||{})[a.id]?'aria-disabled="true"':''}>Sí</button><button class="btn s" data-a="art-util" data-id="no" ${(UI.util||{})[a.id]?'aria-disabled="true"':''}>No</button></div>` : ''}
  </div>
  ${!tec && obl ? `<div class="card art"><div class="ch"><div><h2>Lectura obligatoria</h2><p>${lect.length} de ${pers.length} personas leyeron la versión vigente.</p></div><div class="hb" style="min-width:160px"><i><u style="width:${pct}%;background:var(--ok)"></u></i><b class="num">${pct}%</b></div></div><div class="chips">${pers.map(x=>pill(x, leida(a,x)?'ok':'wa')).join('') || '<span class="mini">No hay personas en la audiencia.</span>'}</div></div>` : ''}
  ${(a.hist||[]).length && !tec ? `<div class="card art"><details class="vh"><summary>Historial de versiones (${a.hist.length+1})</summary><ul class="tl" style="margin-top:8px"><li><span>v${a.version} · ${fF(a.desde)}</span><div><b>Vigente</b>${a.cambio ? ' · '+e(a.cambio) : ''}</div></li>${a.hist.slice().reverse().map(h=>`<li><span>v${h.version} · ${fF(h.fecha)}</span><div>${e(h.cambio||'')}${h.quien ? ' · '+e(h.quien) : ''} <button class="lnk" data-a="art-ver" data-id="${h.version}">Ver</button></div></li>`).join('')}</ul></details></div>` : ''}
  ${!tec && a.estado==='publicado' ? `<div class="sum"><span><b>${n0(a.vistas||0)}</b> vistas</span><span><b>${(a.util||{}).si||0}</b> dijeron que les sirvió</span><span><b>${(a.util||{}).no||0}</b> que no</span><span><b>${(a.favs||[]).length}</b> lo guardaron</span></div>` : ''}`;
}
function acaCur(){
  if(UI.player) return player();
  const L = A.cursos.filter(c=>c.estado!=='archivado');
  if(!L.length) return '<div class="empty"><h3>Arma tu primer curso</h3><p class="sub">Un curso junta artículos de la Biblioteca como cápsulas, agrega un examen y entrega un certificado. Se asigna por grupo y puede otorgar una habilidad.</p><button class="btn p" data-a="cur-nuevo">Nuevo curso</button></div>';
  return `<div class="cards">${L.map(c=>{
    const ps = personas().filter(p=>audOk(c.aud, p)), ks = ps.map(p=>estCurso(c, p).k), ap = ks.filter(k=>k==='ok'||k==='porvencer').length, cu = ks.filter(k=>k==='curso').length, pc = ps.length ? Math.round(ap/ps.length*100) : 0;
    return `<div class="ac top" style="cursor:default;--c:${c.obligatorio?'var(--warn)':'var(--pri)'}"><div class="row">${c.obligatorio ? pill('Obligatorio','wa') : pill('Opcional','')}${c.hab ? pill('Otorga: '+habNombre(c.hab),'ok') : ''}</div><h3>${e(c.titulo)}</h3><p>${e(c.desc||'')}</p>
      <div class="sum"><span><b>${c.caps.length}</b> cápsulas</span><span><b>${c.examen.length}</b> preguntas</span><span>Mínimo <b>${c.min}%</b></span><span>${c.vig ? `Vence a los <b>${c.vig}</b> meses` : 'No vence'}</span></div>
      <p class="mini">Para: ${e(audTxt(c.aud))}</p>
      <div class="hb"><i><u style="width:${pc}%;background:var(--ok)"></u></i><span class="mini">${ap} de ${ps.length} aprobados${cu ? ` · ${cu} en curso` : ''}</span></div>
      <div class="row"><button class="btn s" data-a="cur-editar" data-id="${c.id}">Editar</button><button class="btn s" data-a="cur-tomar" data-id="${c.id}">Vista previa</button><button class="btn s g" data-a="atab" data-id="ava">Ver avance</button></div></div>`; }).join('')}</div>`;
}
function acaMis(){
  if(UI.player) return player();
  const p = yo(), L = cursosDe(p);
  if(!L.length) return '<div class="card"><p class="vac">No tienes cursos asignados por ahora.</p></div>';
  const ord = { vencido:0, pend:1, curso:2, porvencer:3, ok:4 };
  return `<div class="cards">${L.map(c=>({ c, s:estCurso(c, p) })).sort((x,y)=>(ord[x.s.k]-ord[y.s.k]) || ((y.c.obligatorio?1:0)-(x.c.obligatorio?1:0))).map(({ c, s })=>{
    const g = progR(p, c.id) || { vistos:[] }, pct = Math.round((g.vistos||[]).filter(id=>c.caps.includes(id)).length/(c.caps.length||1)*100), hecho = s.k==='ok' || s.k==='porvencer';
    return `<div class="ac top" style="cursor:default;--c:${s.k==='vencido'?'var(--bad)':hecho?'var(--ok)':'var(--pri)'}"><div class="row">${pill(s.l, s.c)}${c.obligatorio ? pill('Obligatorio','wa') : ''}</div><h3>${e(c.titulo)}</h3><p>${e(c.desc||'')}</p>
      <div class="sum"><span><b>${c.caps.length}</b> cápsulas</span><span>${c.examen.length} preguntas</span>${s.vence ? `<span>Vence ${fF(s.vence)}</span>` : ''}</div>
      ${hecho ? '' : `<div class="hb"><i><u style="width:${pct}%;background:var(--pri)"></u></i><span class="mini">${pct}% visto</span></div>`}
      <div class="row"><button class="btn s ${hecho?'':'p'}" data-a="cur-tomar" data-id="${c.id}">${s.k==='pend'?'Empezar':s.k==='curso'?'Continuar':s.k==='vencido'||s.k==='porvencer'?'Renovar':'Repasar'}</button>${hecho ? `<button class="btn s g" data-a="cert-ver" data-id="${c.id}">Ver certificado</button>` : ''}</div></div>`; }).join('')}</div>`;
}
function player(){
  const c = curso(UI.player.cid); if(!c){ UI.player = null; return ''; }
  const p = yo(), P = UI.player, g = progR(p, c.id) || { vistos:[], intentos:[] };
  const back = '<button class="btn s g" data-a="pl-salir">← Volver a los cursos</button>';
  if(P.paso==='cap'){ const a = art(c.caps[P.i]);
    return `<div class="card art"><div class="row" style="justify-content:space-between">${back}<span class="mini">Cápsula ${P.i+1} de ${c.caps.length}</span></div><div class="art-h" style="margin-top:10px"><p class="mini">${e(c.titulo)}</p><h2>${e(a ? a.titulo : '(artículo eliminado)')}</h2></div><div class="art-b">${a ? cuerpoHtml(a.cuerpo, a.id) : ''}</div>${a && a.archivo && /^video/.test(a.archivo.type) ? `<video controls preload="metadata" src="${e(a.archivo.url)}" style="width:100%;border-radius:12px;background:#000"></video>` : ''}${a && a.video ? `<a class="btn" href="${e(safeUrl(a.video))}" target="_blank" rel="noopener">Ver el video</a>` : ''}
      <div class="fb"><button class="btn" data-a="pl-menu">Índice del curso</button><span style="flex:1"></span><button class="btn p bigb" data-a="pl-visto">${P.i+1<c.caps.length ? 'Listo, siguiente cápsula' : 'Listo, ir al examen'}</button></div></div>`; }
  if(P.paso==='exam') return `<div class="card art"><div class="row" style="justify-content:space-between">${back}<span class="mini">Necesitas ${c.min}% para aprobar</span></div><h2 style="margin:10px 0">Examen: ${e(c.titulo)}</h2>
    <div class="qz">${c.examen.map((q,qi)=>`<fieldset><legend>${qi+1}. ${e(q.p)}</legend>${q.ops.map((o,oi)=>`<label><input type="radio" name="q${qi}" data-a="pl-resp" data-q="${qi}" data-o="${oi}" ${P.resp[qi]===oi?'checked':''}> <span>${e(o)}</span></label>`).join('')}</fieldset>`).join('')}</div>
    <div class="fb"><button class="btn" data-a="pl-menu">Volver a las cápsulas</button><span style="flex:1"></span><button class="btn p bigb" data-a="pl-enviar">Enviar respuestas</button></div></div>`;
  if(P.paso==='res'){ const r = P.res;
    return `<div class="card art">${back}<div class="note ${r.ok?'ok':'r'}" style="margin-top:12px"><b>${r.ok?'¡Aprobaste!':'Aún no apruebas.'}</b> Tu nota: ${r.nota}% (mínimo ${c.min}%).${r.ok ? (c.hab ? ` Ahora tienes la habilidad «${e(habNombre(c.hab))}».` : '') : ' Repasa las cápsulas y vuelve a intentarlo.'}</div>
      <div class="qz" style="margin-top:12px">${c.examen.map((q,qi)=>{ const ok = P.resp[qi]===q.ok; return `<fieldset><legend>${qi+1}. ${e(q.p)}</legend><p class="${ok?'good':'bad'}">${ok?'Correcta':'Incorrecta'}: ${e(q.ops[P.resp[qi]] ?? 'Sin responder')}</p>${ok ? '' : `<p class="mini">La respuesta correcta es: ${e(q.ops[q.ok])}</p>`}</fieldset>`; }).join('')}</div>
      <div class="fb">${r.ok ? `<button class="btn p" data-a="cert-ver" data-id="${c.id}">Ver mi certificado</button>` : '<button class="btn p" data-a="pl-menu">Repasar</button><button class="btn" data-a="pl-exam">Intentar de nuevo</button>'}</div></div>`; }
  const vistos = g.vistos||[], todo = c.caps.every(id=>vistos.includes(id)), s = estCurso(c, p);
  return `<div class="card art"><div class="row" style="justify-content:space-between">${back}${pill(s.l, s.c)}</div><h2 style="margin:10px 0 4px">${e(c.titulo)}</h2><p class="sub">${e(c.desc||'')}</p>
    ${!modoTec() ? '<div class="note" style="margin-top:8px">Vista previa: así lo ve el equipo.</div>' : ''}
    <div class="sum" style="margin:10px 0"><span>${c.caps.length} cápsulas</span><span>${c.examen.length} preguntas</span><span>Mínimo ${c.min}%</span><span>${c.vig ? `Certificado válido ${c.vig} meses` : 'Certificado sin vencimiento'}</span>${c.hab ? `<span>Otorga: <b>${e(habNombre(c.hab))}</b></span>` : ''}</div>
    <div class="ord">${c.caps.map((id,i)=>{ const a = art(id), ok = vistos.includes(id); return `<div class="capi ${ok?'ok':''}"><span class="n">${ok?'✓':i+1}</span><div><b>${e(a ? a.titulo : '(eliminado)')}</b><small>${e(a ? (TIPOS_ART[a.tipo]||'') : '')}</small></div><button class="btn s" data-a="pl-cap" data-i="${i}">${ok?'Repasar':'Ver'}</button></div>`; }).join('')}</div>
    <div class="fb"><span class="mini">${(g.intentos||[]).length ? 'Intentos: '+g.intentos.map(x=>x.nota+'%').join(', ') : ''}</span><span style="flex:1"></span><button class="btn p bigb" data-a="pl-exam" ${todo?'':'aria-disabled="true"'}>${todo ? 'Dar el examen' : 'Mira todas las cápsulas para dar el examen'}</button></div></div>`;
}
function acaCert(){
  const p = yo(), L = A.cursos.map(c=>({ c, s:estCurso(c, p), g:progR(p, c.id) })).filter(x=>x.g && x.g.aprobado), habs = habilidadesDe(p);
  return `<div class="card"><div class="ch"><div><h2>Mis habilidades</h2><p>Lo que estás habilitado para atender. Se obtienen aprobando cursos.</p></div></div>${habs.length ? `<div class="chips">${habs.map(h=>pill(h.nombre + (h.vence ? ` · hasta ${fF(h.vence)}` : ''), h.porVencer?'wa':'ok')).join('')}</div>` : '<p class="vac">Aún no tienes habilidades registradas.</p>'}</div>
  ${L.length ? `<div class="cards">${L.map(({ c, s, g })=>`<button class="ac top" style="--c:${s.k==='vencido'?'var(--bad)':'var(--ok)'}" data-a="cert-ver" data-id="${c.id}"><div class="row">${pill(s.l, s.c)}</div><h3>${e(c.titulo)}</h3><p>Aprobado el ${fF(g.aprobado)} con ${g.nota}%</p><div class="ft"><span>${s.vence ? 'Vence '+fF(s.vence) : 'No vence'}</span></div></button>`).join('')}</div>` : '<div class="card"><p class="vac">Aún no tienes certificados. Empieza por tus cursos obligatorios.</p></div>'}`;
}
function acaAva(){
  const ps = personas(), cs = A.cursos.filter(c=>c.estado!=='archivado'), oblArts = A.arts.filter(a=>a.obligatorio && a.estado==='publicado');
  let asign = 0, ok = 0, lp = 0; const porV = [];
  ps.forEach(p=>{ cs.forEach(c=>{ if(!audOk(c.aud, p)) return; const s = estCurso(c, p); if(c.obligatorio){ asign++; if(s.k==='ok' || s.k==='porvencer') ok++; } if(s.k==='porvencer' || s.k==='vencido') porV.push({ p, c, s }); }); oblArts.forEach(a=>{ if(audOk(a.aud, p) && !leida(a, p)) lp++; }); });
  return `<div class="kps"><div class="kp"><span>Cumplimiento de obligatorios</span><b>${asign ? Math.round(ok/asign*100) : 100}%</b><small>${ok} de ${asign} cursos obligatorios aprobados</small></div><div class="kp"><span>Por renovar</span><b>${porV.length}</b><small>Certificados vencidos o que vencen en 30 días</small></div><div class="kp"><span>Lecturas pendientes</span><b>${lp}</b><small>Lecturas obligatorias sin confirmar</small></div><div class="kp"><span>Aportes por revisar</span><b>${A.arts.filter(a=>a.estado==='propuesto').length}</b><small>Propuestos desde campo</small></div></div>
  <div class="card"><div class="ch"><div><h2>Avance por persona</h2><p>Estado de cada curso. «—» = el curso no está asignado a esa persona.</p></div></div>${ps.length && cs.length ? `<div class="tw"><table class="mx"><thead><tr><th>Persona</th>${cs.map(c=>`<th title="${e(c.titulo)}">${e(c.titulo.length>22 ? c.titulo.slice(0,21)+'…' : c.titulo)}</th>`).join('')}<th>Lecturas pendientes</th></tr></thead><tbody>${ps.map(p=>`<tr><td><b>${e(p)}</b><small class="mini" style="display:block">${e(gruposDe(p).map(g=>(grupo(g)||{}).nombre).join(', ') || 'Sin grupo')}</small></td>${cs.map(c=>{ if(!audOk(c.aud, p)) return '<td class="mini">—</td>'; const s = estCurso(c, p); return `<td>${s.k==='ok'||s.k==='porvencer' ? `<button class="lnk" data-a="cert-ver" data-id="${c.id}" data-p="${e(p)}" aria-label="Ver certificado">${pill(s.l, s.c)}</button>` : pill(s.l, s.c)}</td>`; }).join('')}<td class="num">${oblArts.filter(a=>audOk(a.aud, p) && !leida(a, p)).length}</td></tr>`).join('')}</tbody></table></div>` : '<p class="vac">Agrega personas a tus grupos para ver su avance.</p>'}</div>
  ${porV.length ? `<div class="card"><div class="ch"><div><h2>Por renovar</h2><p>Si el certificado vence, la persona pierde la habilidad hasta que lo renueve.</p></div></div><ul class="lst">${porV.map(x=>`<li><div><b>${e(x.p)}</b><small>${e(x.c.titulo)} · ${x.s.k==='vencido'?'venció':'vence'} el ${fF(x.s.vence)}</small></div>${pill(x.s.l, x.s.c)}</li>`).join('')}</ul></div>` : ''}`;
}
function acaHab(){
  return `<div class="row end"><button class="btn" data-a="hab-nueva">Nueva habilidad</button></div><div class="card">${A.habs.length ? `<div class="tw"><table><thead><tr><th>Habilidad</th><th>Se obtiene con</th><th>Personas habilitadas</th><th>Requerida para</th><th></th></tr></thead><tbody>${A.habs.map(h=>{
    const cs = A.cursos.filter(c=>c.hab===h.id), ps = personas().map(p=>({ p, x:habilidadesDe(p).find(y=>y.id===h.id) })).filter(z=>z.x);
    return `<tr><td><b>${e(h.nombre)}</b><small class="mini" style="display:block">${e(h.desc||'')}</small></td><td>${cs.length ? cs.map(c=>e(c.titulo)).join(', ') : '<span class="mini">Solo se otorga a mano</span>'}</td><td><div class="chips">${ps.length ? ps.map(z=>pill(z.p + (z.x.manual?' (a mano)':''), z.x.porVencer?'wa':'ok')).join('') : '<span class="mini">Nadie aún</span>'}</div></td><td>${(h.servicios||[]).length ? `<div class="chips">${h.servicios.map(s=>pill(servNombre(s),'in')).join('')}</div>` : '<span class="mini">—</span>'}</td><td class="r"><button class="btn s" data-a="hab-editar" data-id="${h.id}">Editar</button></td></tr>`; }).join('')}</tbody></table></div>` : '<p class="vac">Aún no hay habilidades.</p>'}</div>
  <div class="note">Las habilidades dicen qué servicios puede atender cada persona. Siguiente paso: al programar un servicio que requiere una habilidad, la agenda sugerirá solo a quienes la tienen vigente.</div>`;
}
function acaGru(){
  return `<div class="row end"><button class="btn" data-a="gru-nuevo">Nuevo grupo</button></div><div class="cards">${A.grupos.map(g=>{ const cs = A.cursos.filter(c=>Array.isArray(c.aud) && c.aud.includes(g.id)); return `<div class="ac" style="cursor:default"><h3>${e(g.nombre)}</h3><p>${e(g.desc||'')}</p><div class="chips">${(g.miembros||[]).length ? g.miembros.map(m=>pill(m,'')).join('') : '<span class="mini">Sin miembros</span>'}</div><p class="mini">${cs.length ? 'Cursos: '+e(cs.map(c=>c.titulo).join(', ')) : 'Sin cursos asignados'}</p><div class="row"><button class="btn s" data-a="gru-editar" data-id="${g.id}">Editar</button></div></div>`; }).join('') || '<p class="vac">Aún no hay grupos.</p>'}</div>`;
}

/* ======================= BIBLIOTECA Y ACADEMIA: VENTANAS ======================= */
MDS.art = d => {
  const its = I.items.filter(i=>i.activo!==false);
  return { t:d.id ? 'Editar artículo' : 'Nuevo artículo', s:d.id && (art(d.id)||{}).estado==='publicado' ? 'Si cambias el título o el contenido se crea una versión nueva; el equipo verá qué cambió y las lecturas obligatorias se piden de nuevo.' : 'Protocolos, fichas, manuales, políticas, videos o tips.', w:true,
    b:`<div class="fr"><div class="f" style="grid-column:span 2"><label>Título</label><input type="text" data-m="titulo" value="${e(d.titulo||'')}"></div><div class="f"><label>Tipo</label><select data-m="tipo">${Object.entries(TIPOS_ART).map(([k,v])=>`<option value="${k}" ${d.tipo===k?'selected':''}>${v}</option>`).join('')}</select></div></div>
    <div class="fr"><div class="f"><label>Categoría</label><select data-m="cat" data-mr>${A.cats.map(c=>`<option value="${c.id}" ${d.cat===c.id?'selected':''}>${e(c.nombre)}</option>`).join('')}<option value="_nueva" ${d.cat==='_nueva'?'selected':''}>Nueva categoría…</option></select></div>${d.cat==='_nueva' ? `<div class="f"><label>Nombre de la categoría</label><input type="text" data-m="catNueva" value="${e(d.catNueva||'')}"></div>` : ''}<div class="f"><label>Etiquetas (separadas por comas)</label><input type="text" data-m="tagsTxt" value="${e(d.tagsTxt||'')}" placeholder="sofá, tela, inyectora"></div></div>
    <div class="f"><label>Resumen</label><input type="text" data-m="resumen" value="${e(d.resumen||'')}" placeholder="Una línea que diga para qué sirve"></div>
    <div class="f"><label>Contenido</label><textarea data-m="cuerpo" style="min-height:240px;font-family:var(--mono);font-size:.84rem">${e(d.cuerpo||'')}</textarea><small>«## » título · «1. » paso · «- » viñeta · «**texto**» negrita · Pregunta con opciones: «?? ¿Qué tipo de equipo es?» y debajo una línea por opción «=> Split: qué hacer».</small></div>
    ${archivoCampo(d)}<div class="fr"><div class="f"><label>Enlace del video (opcional)</label><input type="text" data-m="video" value="${e(d.video||'')}" placeholder="https://… (YouTube no listado, Vimeo, Drive)"></div><div class="f"><label>Documento adjunto (opcional)</label><input type="text" data-m="adjunto" value="${e(d.adjunto||'')}" placeholder="https://… (PDF del fabricante)"></div></div>
    <div class="fr"><div class="f"><label>Quién lo ve</label><select data-m="audTodos" data-mr><option value="1" ${d.audTodos!=='0'?'selected':''}>Todo el equipo</option><option value="0" ${d.audTodos==='0'?'selected':''}>Solo algunos grupos</option></select></div><div class="f"><label>Estado</label><select data-m="estado"><option value="publicado" ${d.estado!=='borrador'?'selected':''}>Publicado</option><option value="borrador" ${d.estado==='borrador'?'selected':''}>Borrador</option></select></div><div class="f"><label>Artículo de inventario relacionado</label><select data-m="itemDoc"><option value="">Ninguno</option>${its.map(i=>`<option value="${i.id}" ${d.itemDoc===i.id?'selected':''}>${e(i.nombre)}</option>`).join('')}</select></div></div>
    ${d.audTodos==='0' ? `<div class="ckl">${A.grupos.map(g=>`<label class="chk"><input type="checkbox" data-mg="${g.id}" ${(d.aud||[]).includes(g.id)?'checked':''}> ${e(g.nombre)}</label>`).join('') || '<span class="mini">Crea grupos en la pestaña Grupos.</span>'}</div>` : ''}
    <label class="chk"><input type="checkbox" data-m="obligatorio" ${d.obligatorio?'checked':''}> Lectura obligatoria: cada persona confirma «Leí y entendí»</label>
    ${d.id && (art(d.id)||{}).estado==='publicado' ? `<div class="f"><label>Qué cambió (si cambias el contenido)</label><input type="text" data-m="cambio" value="${e(d.cambio||'')}" placeholder="Se agregó el paso de secado"></div>` : ''}`,
    f:`${d.id ? '<button class="btn d" data-a="art-archivar">Archivar</button>' : ''}<span class="sp1"></span><button class="btn" data-a="md-cerrar">Cancelar</button><button class="btn p" data-a="art-guardar">Guardar</button>` };
};
MDS.aporte = d => ({ t:'Compartir lo que aprendí', s:'Un truco, una solución o algo que el equipo debería saber. Tu supervisor lo revisa y lo publica.',
  b:`<div class="f"><label>Título</label><input type="text" data-m="titulo" value="${e(d.titulo||'')}" placeholder="Cómo quitar pelos de mascota antes de inyectar"></div><div class="f"><label>Tema</label><select data-m="cat">${A.cats.map(c=>`<option value="${c.id}" ${d.cat===c.id?'selected':''}>${e(c.nombre)}</option>`).join('')}</select></div><div class="f"><label>Cuéntalo paso a paso</label><textarea data-m="cuerpo" style="min-height:160px">${e(d.cuerpo||'')}</textarea></div>`,
  f:'<button class="btn" data-a="md-cerrar">Cancelar</button><button class="btn p" data-a="aporte-guardar">Enviar</button>' });
MDS.cur = d => {
  const pubs = A.arts.filter(a=>a.estado==='publicado' && !d.caps.includes(a.id));
  return { t:d.id ? 'Editar curso' : 'Nuevo curso', s:'Cápsulas de la Biblioteca, un examen, una nota mínima y, si quieres, una habilidad.', w:true,
    b:`<div class="fr"><div class="f" style="grid-column:span 2"><label>Título</label><input type="text" data-m="titulo" value="${e(d.titulo||'')}"></div><div class="f"><label>Nota mínima (%)</label><input type="number" min="1" max="100" data-m="min" value="${e(d.min??80)}"></div><div class="f"><label>Certificado válido (meses, 0 = no vence)</label><input type="number" min="0" data-m="vig" value="${e(d.vig??12)}"></div></div>
    <div class="f"><label>Descripción</label><input type="text" data-m="desc" value="${e(d.desc||'')}"></div>
    <div class="fr"><div class="f"><label>Para quién</label><select data-m="audTodos" data-mr><option value="1" ${d.audTodos!=='0'?'selected':''}>Todo el equipo</option><option value="0" ${d.audTodos==='0'?'selected':''}>Solo algunos grupos</option></select></div><div class="f"><label>Otorga la habilidad</label><select data-m="hab" data-mr><option value="">Ninguna</option>${A.habs.map(h=>`<option value="${h.id}" ${d.hab===h.id?'selected':''}>${e(h.nombre)}</option>`).join('')}<option value="_nueva" ${d.hab==='_nueva'?'selected':''}>Nueva habilidad…</option></select></div>${d.hab==='_nueva' ? `<div class="f"><label>Nombre de la habilidad</label><input type="text" data-m="habNueva" value="${e(d.habNueva||'')}"></div>` : ''}</div>
    ${d.audTodos==='0' ? `<div class="ckl">${A.grupos.map(g=>`<label class="chk"><input type="checkbox" data-mg="${g.id}" ${(d.aud||[]).includes(g.id)?'checked':''}> ${e(g.nombre)}</label>`).join('') || '<span class="mini">Crea grupos en la pestaña Grupos.</span>'}</div>` : ''}
    <label class="chk"><input type="checkbox" data-m="obligatorio" ${d.obligatorio?'checked':''}> Obligatorio para su audiencia</label>
    <div><p class="sec">Cápsulas (en orden)</p><div class="ord">${d.caps.map((id,i)=>{ const a = art(id); return `<div class="it"><b class="num">${i+1}</b><span>${e(a ? a.titulo : '(eliminado)')}</span><button class="btn s g" data-a="cur-cap" data-op="up" data-i="${i}" aria-label="Subir" ${i===0?'aria-disabled="true"':''}>↑</button><button class="btn s g" data-a="cur-cap" data-op="down" data-i="${i}" aria-label="Bajar" ${i===d.caps.length-1?'aria-disabled="true"':''}>↓</button><button class="btn s g" data-a="cur-cap" data-op="del" data-i="${i}" aria-label="Quitar">✕</button></div>`; }).join('') || '<p class="mini">Agrega al menos una cápsula.</p>'}</div>
      ${pubs.length ? `<div class="f" style="margin-top:8px"><label>Agregar cápsula desde la Biblioteca</label><select data-m="addCap" data-mr><option value="">Elige un artículo…</option>${pubs.map(a=>`<option value="${a.id}">${e(a.titulo)}</option>`).join('')}</select></div>` : ''}</div>
    <div><p class="sec">Examen</p><div class="ord">${d.examen.map((q,i)=>`<div class="qed"><div class="row"><b>${i+1}.</b><input type="text" data-mq="${i}:p" value="${e(q.p)}" placeholder="Pregunta" style="flex:1"><button class="btn s g" data-a="cur-q" data-op="del" data-i="${i}" aria-label="Quitar pregunta">✕</button></div>
      ${q.ops.map((o,j)=>`<div class="op"><input type="radio" name="ok${i}" data-mq="${i}:ok" value="${j}" ${q.ok===j?'checked':''} aria-label="Correcta"><input type="text" data-mq="${i}:o:${j}" value="${e(o)}" placeholder="Opción ${j+1}">${q.ops.length>2 ? `<button class="btn s g" data-a="cur-q" data-op="odel" data-i="${i}" data-j="${j}" aria-label="Quitar opción">✕</button>` : ''}</div>`).join('')}
      <div class="row"><span class="mini">Marca la respuesta correcta.</span>${q.ops.length<4 ? `<button class="btn s g" data-a="cur-q" data-op="oadd" data-i="${i}">Agregar opción</button>` : ''}</div></div>`).join('')}</div>
      <button class="btn s" data-a="cur-q" data-op="add" style="margin-top:8px">Agregar pregunta</button></div>`,
    f:`${d.id ? '<button class="btn d" data-a="cur-archivar">Archivar</button>' : ''}<span class="sp1"></span><button class="btn" data-a="md-cerrar">Cancelar</button><button class="btn p" data-a="cur-guardar">Guardar</button>` };
};
MDS.cert = d => {
  const c = curso(d.cid), p = d.p || yo(), g = progR(p, c.id) || {}, vence = c.vig && g.aprobado ? addM(g.aprobado, c.vig) : null;
  const cod = (c.id + '-' + norm(p).replace(/[^a-z0-9]/g,'').slice(0,6) + '-' + String(g.aprobado||'').replace(/-/g,'')).toUpperCase();
  return { t:'Certificado', b:`<div class="cert"><span class="k">Certificado de aprobación</span><p class="sub">${e((O.emp||{}).nombre||'')} certifica que</p><h2>${e(p)}</h2><p class="sub">aprobó el curso</p><h3>${e(c.titulo)}</h3><p>Nota ${g.nota ?? '—'}% · ${fF(g.aprobado)}${vence ? ` · válido hasta el ${fF(vence)}` : ''}</p>${c.hab ? pill('Habilidad: '+habNombre(c.hab),'ok') : ''}<p class="mini">Código de verificación ${e(cod)}</p></div>`,
    f:'<button class="btn" data-a="md-cerrar">Cerrar</button>' };
};
MDS.hab = d => ({ t:d.id ? 'Editar habilidad' : 'Nueva habilidad', s:'Qué sabe hacer una persona y qué servicios puede atender con ella.', w:true,
  b:`<div class="fr"><div class="f"><label>Nombre</label><input type="text" data-m="nombre" value="${e(d.nombre||'')}"></div><div class="f" style="grid-column:span 2"><label>Descripción</label><input type="text" data-m="desc" value="${e(d.desc||'')}"></div></div>
  <div><p class="sec">Servicios que la requieren</p>${(O.servicios||[]).length ? `<div class="ckl">${O.servicios.map(s=>`<label class="chk"><input type="checkbox" data-msv="${e(s.id)}" ${(d.servicios||[]).includes(s.id)?'checked':''}> ${e(s.nombre)}</label>`).join('')}</div>` : '<p class="mini">Crea tu tarifario para elegir servicios.</p>'}</div>
  <div><p class="sec">Otorgar a mano</p><p class="mini" style="margin-bottom:6px">Para quien ya domina la habilidad sin pasar por el curso. Queda registrado.</p>${personas().length ? `<div class="ckl">${personas().map(p=>`<label class="chk"><input type="checkbox" data-mp="${e(p)}" ${(d.miembros||[]).includes(p)?'checked':''}> ${e(p)}</label>`).join('')}</div>` : '<p class="mini">Aún no hay personas.</p>'}</div>`,
  f:`${d.id ? '<button class="btn d" data-a="hab-borrar">Eliminar</button>' : ''}<span class="sp1"></span><button class="btn" data-a="md-cerrar">Cancelar</button><button class="btn p" data-a="hab-guardar">Guardar</button>` });
MDS.gru = d => ({ t:d.id ? 'Editar grupo' : 'Nuevo grupo', s:'Los grupos definen quién ve cada artículo y a quién se asigna cada curso.',
  b:`<div class="fr"><div class="f"><label>Nombre</label><input type="text" data-m="nombre" value="${e(d.nombre||'')}" placeholder="Técnicos de aire acondicionado"></div><div class="f"><label>Descripción</label><input type="text" data-m="desc" value="${e(d.desc||'')}"></div></div>
  <div><p class="sec">Miembros</p><div class="ckl">${[...new Set(personas().concat(d.miembros||[]))].map(p=>`<label class="chk"><input type="checkbox" data-mp="${e(p)}" ${(d.miembros||[]).includes(p)?'checked':''}> ${e(p)}</label>`).join('') || '<span class="mini">Aún no hay personas.</span>'}</div>
  <div class="row" style="margin-top:8px"><input type="text" data-m="nuevoNombre" value="${e(d.nuevoNombre||'')}" placeholder="Agregar otra persona" style="flex:1;min-width:180px"><button class="btn s" data-a="gru-add">Agregar</button></div></div>`,
  f:`${d.id ? '<button class="btn d" data-a="gru-borrar">Eliminar</button>' : ''}<span class="sp1"></span><button class="btn" data-a="md-cerrar">Cancelar</button><button class="btn p" data-a="gru-guardar">Guardar</button>` });

function usoBytes(){ return A.arts.reduce((s,a)=>s + ((a.archivo && a.archivo.size) || 0), 0); }
const GB = n => (n/1e9).toLocaleString('es-PE', { maximumFractionDigits:2 });
function archivoCampo(d){
  const tope = (ACCESO.videos||0)*1e9, uso = usoBytes();
  if(!tope) return '<p class="mini">Tu plan permite videos por enlace. La subida de videos está incluida desde el plan Crece.</p>';
  return `<div class="f"><label>Video o documento subido (opcional)</label>${d.archivo ? `<div class="row"><span class="pill v">${e(d.archivo.name)} · ${(d.archivo.size/1e6).toLocaleString('es-PE',{maximumFractionDigits:1})} MB</span><button class="btn s g" data-a="arch-quitar">Quitar</button></div>` : `<input type="file" data-up="1" accept="video/mp4,video/webm,application/pdf" aria-label="Subir video o PDF">`}
    <small>${UI.subiendo ? 'Subiendo…' : `Usado ${GB(uso)} de ${GB(tope)} GB de tu plan ${e(ACCESO.plan||'')}. En el prototipo, hasta 15 MB por archivo (MP4, WebM o PDF).`}</small></div>`;
}
/* ======================= VENTANAS: MARCO COMÚN ======================= */
function abrirMd(k, d){ MD = { k, d:d||{}, err:'' }; pintarMd(); }
function cerrarMd(){ MD = null; pintarMd(); }
function pintarMd(){
  let h = ROOT.querySelector('.mdlh'); if(!h){ h = document.createElement('div'); h.className = 'mdlh'; ROOT.appendChild(h); }
  if(!MD){ h.innerHTML = ''; return; }
  let r; try{ r = MDS[MD.k](MD.d); }catch(err){ console.error(err); MD = null; h.innerHTML = ''; return; }
  h.innerHTML = `<div class="mdl" data-a="md-fondo"><div class="box ${r.w?'w':''}" role="dialog" aria-modal="true" aria-label="${e(r.t)}"><div class="bh"><div><h3>${e(r.t)}</h3>${r.s ? `<p>${r.s}</p>` : ''}</div><button class="btn s g" data-a="md-cerrar" aria-label="Cerrar">✕</button></div><div class="bb">${MD.err ? `<div class="note r">${e(MD.err)}</div>` : ''}${r.b}</div>${r.f ? `<div class="bf">${r.f}</div>` : ''}</div></div>`;
  if(MD.err){ const bb = h.querySelector('.bb'); if(bb) bb.scrollTop = 0; }
  if(r.qr){ const pintar = () => { const el = ROOT.querySelector('#qrBox'); if(!el || !window.QRCode) return; el.innerHTML = ''; try{ new window.QRCode(el, { text:r.qr, width:140, height:140 }); }catch(err){ el.textContent = r.qr; } };
    if(window.QRCode) pintar(); else if(O.cargarJs) O.cargarJs('https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js').then(pintar).catch(()=>{}); }
  const f = h.querySelector('.bb input[type=text]:not([disabled]), .bb textarea'); let fino = false; try{ fino = matchMedia('(pointer:fine)').matches; }catch(_){} if(f && fino && !MD._foco){ MD._foco = 1; try{ f.focus({ preventScroll:true }); }catch(_){} }
}
const fallo = msg => { MD.err = msg; pintarMd(); };

/* ======================= MONTAJE Y EVENTOS ======================= */
function render(){ const vc = ROOT.querySelector('.vc'); if(!vc) return; vc.innerHTML = ACCESO.ok ? barraVer() + (O.mod==='academia' ? vAca() : vInv()) : vBloqueo(); }
// El plan de la empresa decide si el módulo está abierto (durante la prueba se abren todos).
async function leerAcceso(){
  const V = K(), mid = O.mod==='academia' ? 'academia' : 'inventario';
  if(!O.raw || !V.semilla || !V.modsCli) return { ok:true };
  let P = null;
  try{ const s = await O.raw.collection('vk_plataforma').doc('demo').get(); if(s.exists){ const d = s.data(); P = d && d.json ? JSON.parse(d.json) : null; } }catch(_){}
  if(!P || P.v!==2) P = V.semilla({ empresas:O.empresas||[] });
  if(V.migrar) V.migrar(P);
  const C = O.emp && O.emp.esVK ? P.clientes.find(c=>c.real) : P.clientes.find(c=>c.empId===(O.emp||{}).id);
  if(!C) return { ok:true, videos:10 };
  const plan = V.planDe(P, C.plan) || {}, q = V.cuotasCli(P, C) || {};
  const desde = P.planes.filter(p=>p.activo && (p.modulos||[]).includes(mid)).sort((a,b)=>a.mensual-b.mensual)[0];
  return { ok:V.modsCli(P, C).has(mid), plan:plan.nombre||'', estado:C.estado, videos:Number(q.videos)||0, desde:desde ? { nombre:desde.nombre, mensual:desde.mensual } : null };
}
function vBloqueo(){
  const nom = O.mod==='academia' ? 'Biblioteca y Academia' : 'Inventario y equipos', d = ACCESO.desde;
  const que = O.mod==='academia' ? 'Protocolos, fichas y manuales con buscador, cursos con examen y certificado, habilidades del equipo y videos.' : 'Insumos, repuestos y herramientas por almacén y por unidad, uso de materiales en cada trabajo y los equipos de tus clientes con QR e historial.';
  return `<div class="card"><div class="lockc"><span aria-hidden="true" style="font-size:1.4rem">🔒</span><div style="flex:1"><b>${e(nom)} está incluido desde el plan ${e(d ? d.nombre : 'Crece')}${d ? ` (${S(d.mensual)} al mes)` : ''}</b><p class="sub" style="margin-top:4px">${e(que)} Tu plan actual es ${e(ACCESO.plan||'—')}.</p><div class="row" style="margin-top:10px">${gestorReal() ? '<button class="btn p" data-a="ir-plan">Ver planes</button>' : '<span class="mini">Pídele al administrador que cambie de plan.</span>'}</div></div></div></div>`;
}
function barraVer(){
  if(!gestorReal()) return '';
  const ps = personas(); if(!ps.length) return '';
  return `<div class="vbar"><b>Vista</b><select data-in="vercomo" aria-label="Ver como"><option value="">Gestión (${e(PF().l||'Administrador')})</option>${ps.map(p=>`<option value="${e(p)}" ${UI.verComo===p?'selected':''}>Como lo ve ${e(p)} en su app</option>`).join('')}</select><span class="mini">Revisa lo que ve cada persona del equipo.</span></div>`;
}
const sub = (sel, html) => { const el = ROOT.querySelector(sel); if(el) el.innerHTML = html; };
function onInput(ev, cambio){
  const t = ev.target;
  if(t.matches('[data-m]')){ if(!MD) return; const k = t.getAttribute('data-m'); MD.d[k] = t.type==='checkbox' ? t.checked : t.value;
    if(cambio && t.hasAttribute('data-mr')){
      if(MD.k==='mov' && k==='tipo') ['itemId','series','cant','contado','seriesTxt'].forEach(x=>delete MD.d[x]);
      if(MD.k==='mov' && (k==='de' || k==='itemId')) delete MD.d.series;
      if(MD.k==='cur' && k==='addCap' && t.value){ MD.d.caps.push(t.value); MD.d.addCap = ''; }
      MD.err = ''; pintarMd(); }
    return; }
  if(!cambio && t.type==='checkbox') return;
  if(t.matches('[data-ms]')){ const s = t.getAttribute('data-ms'); const L = MD.d.series = MD.d.series || []; if(t.checked){ if(!L.includes(s)) L.push(s); } else MD.d.series = L.filter(x=>x!==s); return; }
  if(t.matches('[data-mg]')){ const g = t.getAttribute('data-mg'); const L = Array.isArray(MD.d.aud) ? MD.d.aud : []; MD.d.aud = t.checked ? [...new Set([...L, g])] : L.filter(x=>x!==g); return; }
  if(t.matches('[data-mp]')){ const p = t.getAttribute('data-mp'); const L = MD.d.miembros || []; MD.d.miembros = t.checked ? [...new Set([...L, p])] : L.filter(x=>x!==p); return; }
  if(t.matches('[data-msv]')){ const s = t.getAttribute('data-msv'); const L = MD.d.servicios || []; MD.d.servicios = t.checked ? [...new Set([...L, s])] : L.filter(x=>x!==s); return; }
  if(t.matches('[data-mq]')){ const [i, k, j] = t.getAttribute('data-mq').split(':'); const q = MD.d.examen[+i]; if(!q) return; if(k==='p') q.p = t.value; else if(k==='o') q.ops[+j] = t.value; else if(k==='ok' && cambio) q.ok = +t.value; return; }
  if(t.matches('[data-up]') && cambio){ subirArchivo(t.files && t.files[0]); return; }
  if(t.matches('[data-mqty]')){ MD.d.q = MD.d.q || {}; MD.d.q[t.getAttribute('data-mqty')] = t.value; return; }
  if(!t.matches('[data-in]')) return;
  const k = t.getAttribute('data-in'), v = t.value;
  if(k==='artq'){ UI.artq = v; sub('#artRes', artLista()); }
  else if(k==='eqq'){ UI.eqq = v; sub('#eqRes', eqLista(filtrarEq())); const ex = I.equipos.find(q=>norm(q.codigo)===norm(v).trim()); if(ex && !MD) abrirMd('eq', { id:ex.id }); }
  else if(k.startsWith('movf-')){ UI.movf = UI.movf || {}; UI.movf[k.slice(5)] = v; sub('#movRes', movTabla(movFiltrados().slice(0,200))); }
  else if(k==='bq'){ UI.bq = v; sub('#bibRes', bibLista()); clearTimeout(UI._bt); UI._bt = setTimeout(()=>{ const q = v.trim(); if(q.length>=3 && UI.bq===v && !buscarArts().length) registrarBusq(q); }, 1300); }
  else if(k==='btipo'){ UI.btipo = v; sub('#bibRes', bibLista()); }
  else if(k==='vercomo' && cambio){ UI.verComo = v || null; UI.art = null; UI.player = null; UI.invTab = null; UI.acaTab = null; render(); }
}
function onClick(ev){
  const b = ev.target.closest('[data-a]'); if(!b) return;
  const a = b.getAttribute('data-a'), id = b.getAttribute('data-id');
  if(a==='md-fondo'){ if(ev.target===b) cerrarMd(); return; }
  if(a==='pl-resp'){ UI.player.resp[+b.getAttribute('data-q')] = +b.getAttribute('data-o'); return; }
  if(b.getAttribute('aria-disabled')==='true'){ ev.preventDefault(); if(a==='pl-exam') toast('Primero mira todas las cápsulas.'); return; }
  const H = ACC[a]; if(!H) return;
  try{ H(id, b, ev); }catch(err){ console.error(err); toast('Algo salió mal. Vuelve a intentarlo.'); }
}
const otro = (mod, pl) => { if(O.mod===mod) return false; if(O.abrir){ cerrarMd(); O.abrir(mod, pl); } return true; };
const ACC = {
  'md-cerrar': ()=>cerrarMd(),
  'ir-plan': ()=>{ if(O.irPlan) O.irPlan(); },
  'plantillas': ()=>abrirMd('tpl', {}),
  'tpl-aplicar': id=>{ const T = plantillas(O)[id]; if(aplicarPlantilla(id)){ cerrarMd(); render(); toast(`Se agregó la plantilla de ${T.nombre}.`); } else toast('Esa plantilla ya está agregada.'); },
  'itab': id=>{ UI.invTab = id; render(); },
  'atab': id=>{ UI.acaTab = id; UI.art = null; UI.player = null; UI.artVer = null; render(); },
  // inventario
  'artf': id=>{ UI.artf = id; render(); },
  'alm-ver': id=>{ UI.almOpen = UI.almOpen===id ? null : id; render(); },
  'item-nuevo': ()=>abrirMd('item', { tipo:'insumo', un:'und.', min:0 }),
  'item-ver': id=>{ const it = item(id); if(it) abrirMd('item', JSON.parse(JSON.stringify(it))); },
  'item-guardar': ()=>{ const d = MD.d; if(!String(d.nombre||'').trim()) return fallo('Escribe el nombre del artículo.');
    const num = k => d[k]==='' || d[k]==null ? 0 : Number(d[k]); if(['costo','precio','min','frec'].some(k=>num(k)<0 || isNaN(num(k)))) return fallo('Revisa los números: no pueden ser negativos.');
    const datos = { nombre:d.nombre.trim(), sku:String(d.sku||'').trim(), tipo:d.tipo, cat:String(d.cat||'').trim(), un:String(d.un||'und.').trim()||'und.', costo:num('costo'), precio:d.tipo==='repuesto'?num('precio'):0, min:d.tipo!=='herramienta'?num('min'):0, frec:d.tipo==='herramienta'?num('frec'):undefined, lote:!!d.lote, serie:d.tipo==='repuesto' && !!d.serie, doc:d.doc||'' };
    if(d.id){ Object.assign(item(d.id), datos); } else I.items.push({ id:uid('it'), activo:true, ...datos });
    guardar('inv'); cerrarMd(); render(); toast('Artículo guardado.'); },
  'item-borrar': ()=>{ const it = item(MD.d.id); if(!it) return; const usado = total(it.id)>0 || I.movs.some(m=>m.itemId===it.id) || I.herr.some(h=>h.itemId===it.id);
    if(usado) it.activo = false; else I.items = I.items.filter(x=>x.id!==it.id); guardar('inv'); cerrarMd(); render(); toast(usado ? 'Artículo desactivado: su historial se conserva.' : 'Artículo eliminado.'); },
  'alm-nuevo': ()=>abrirMd('alm', { tipo:'sede' }),
  'alm-guardar': ()=>{ const d = MD.d; const nombre = String(d.nombre||'').trim() || (d.tipo==='unidad' ? d.unidad : ''); if(!nombre) return fallo('Escribe el nombre del almacén.');
    I.alm.push({ id:uid('alm'), nombre, tipo:d.tipo||'sede', unidad:d.tipo==='unidad' ? (d.unidad||'') : '', resp:d.tipo==='unidad' ? '' : String(d.resp||'').trim() }); guardar('inv'); cerrarMd(); render(); toast('Almacén creado.'); },
  'mov-nuevo': (id, b)=>{ const d = { tipo:b.getAttribute('data-t')||'', fecha:HOY() }; const de = b.getAttribute('data-de'), aa = b.getAttribute('data-alla'), it = b.getAttribute('data-item'), eq = b.getAttribute('data-eq');
    if(de) d.de = de; if(aa) d.a = aa; if(it) d.itemId = it; if(eq){ d.equipoId = eq; d.tipo = 'consumo'; } if(!modoTec() && !d.tipo) d.tipo = 'ingreso';
    if(d.itemId){ const x = item(d.itemId); if(x && x.tipo==='repuesto' && x.precio) d.cobrar = true; }
    if(otro('inventario', null)) return; abrirMd('mov', d); },
  'mov-guardar': ()=>{ const d = MD.d, it = item(d.itemId); const m = { ...d };
    if(it && it.serie && d.tipo==='ingreso') m.series = [...new Set(String(d.seriesTxt||'').split(/[\n,;]+/).map(s=>s.trim()).filter(Boolean))];
    if(modoTec() && it && it.tipo==='repuesto' && it.precio && d.cobrar===undefined) m.cobrar = true;
    const err = registrarMov(m); if(err) return fallo(err);
    cerrarMd(); render(); toast(d.tipo==='consumo' ? 'Listo: quedó registrado en el trabajo.' : 'Movimiento registrado.'); },
  'mov-csv': ()=>{ const L = movFiltrados(); const q = s => `"${String(s??'').replace(/"/g,'""')}"`;
    const csv = ['Fecha;Tipo;Artículo;Cantidad;Unidad;Origen;Destino;Trabajo;Costo unitario;Quién'].concat(L.map(m=>{ const it = item(m.itemId)||{}; return [m.fecha, TIPOS_MOV[m.tipo][0], it.nombre, String(m.cant).replace('.',','), it.un, m.de?almNombre(m.de):'', m.a?almNombre(m.a):'', m.trabajoTxt, String(m.costo||0).replace('.',','), m.quien].map(q).join(';'); })).join('\n');
    const blob = new Blob(['﻿'+csv], { type:'text/csv;charset=utf-8' }), nom = `kardex-${HOY()}.csv`;
    if(O.guardar) O.guardar(blob, nom); else { const u = URL.createObjectURL(blob), l = document.createElement('a'); l.href = u; l.download = nom; document.body.appendChild(l); l.click(); l.remove(); setTimeout(()=>URL.revokeObjectURL(u), 2000); } },
  'herr-nueva': ()=>abrirMd('herrn', { alm:almCentral().id, frec:6 }),
  'herrn-guardar': ()=>{ const d = MD.d; let it = item(d.itemId);
    if(d.itemId==='nuevo'){ if(!String(d.tipoNombre||'').trim()) return fallo('Escribe el nombre del tipo de herramienta.'); it = { id:uid('it'), activo:true, sku:'', nombre:d.tipoNombre.trim(), tipo:'herramienta', cat:'Equipos', un:'und.', costo:Number(d.costo)||0, frec:Number(d.frec)||6, precio:0, min:0 }; I.items.push(it); }
    if(!it) return fallo('Elige el tipo.'); const nombre = String(d.nombre||'').trim() || `${it.nombre} ${I.herr.filter(h=>h.itemId===it.id).length+1}`;
    I.nH = (I.nH||0)+1; const frec = Number(it.frec)||6;
    I.herr.push({ id:uid('h'), itemId:it.id, codigo:'H-'+String(I.nH).padStart(3,'0'), nombre, estado:'disponible', alm:d.alm||almCentral().id, asignado:'', frec, ult:HOY(), prox:addM(HOY(), frec), log:[{ fecha:HOY(), t:'Alta en el inventario', quien:O.usuario||'Administrador' }] });
    guardar('inv'); cerrarMd(); render(); toast('Herramienta agregada.'); },
  'herr-asignar': id=>abrirMd('herra', { id }),
  'herra-guardar': ()=>{ const h = I.herr.find(x=>x.id===MD.d.id), dest = MD.d.dest||''; if(!dest) return fallo('Elige a quién se asigna.');
    if(dest.startsWith('alm:')){ const a = almacen(dest.slice(4)); h.alm = a.id; h.asignado = a.unidad || a.nombre; }
    else { const p = dest.slice(4); h.asignado = p; const u = (O.unidades||[]).find(x=>(x.tecnicos||[]).includes(p)); const a = u && I.alm.find(z=>z.unidad===u.nombre); h.alm = a ? a.id : almCentral().id; }
    h.estado = 'asignada'; h.log = h.log||[]; h.log.unshift({ fecha:HOY(), t:`Asignada a ${h.asignado}`, quien:O.usuario||'Administrador' }); guardar('inv'); cerrarMd(); render(); toast(`${h.nombre} asignada a ${h.asignado}.`); },
  'herr-devolver': id=>{ const h = I.herr.find(x=>x.id===id); h.log.unshift({ fecha:HOY(), t:`Devuelta al almacén por ${h.asignado||'—'}`, quien:yo() }); h.estado = 'disponible'; h.asignado = ''; h.alm = almCentral().id; guardar('inv'); render(); toast('Herramienta devuelta al almacén.'); },
  'herr-mant': id=>{ const h = I.herr.find(x=>x.id===id); h.prev = h.estado; h.estado = 'mantenimiento'; h.log.unshift({ fecha:HOY(), t:'Enviada a mantenimiento', quien:yo() }); guardar('inv'); render(); toast('Enviada a mantenimiento.'); },
  'herr-lista': id=>{ const h = I.herr.find(x=>x.id===id); h.estado = h.prev==='asignada' && h.asignado ? 'asignada' : 'disponible'; h.ult = HOY(); h.prox = addM(HOY(), h.frec||6); h.log.unshift({ fecha:HOY(), t:`Mantenimiento hecho; el próximo toca el ${fF(h.prox)}`, quien:yo() }); guardar('inv'); render(); toast('Mantenimiento registrado.'); },
  'herr-falla': id=>abrirMd('herrf', { id }),
  'herrf-guardar': ()=>{ const h = I.herr.find(x=>x.id===MD.d.id), t = String(MD.d.txt||'').trim(); if(!t) return fallo('Cuenta qué le pasa.'); h.prev = h.estado; h.estado = 'mantenimiento'; h.log = h.log||[]; h.log.unshift({ fecha:HOY(), t:`Falla reportada: ${t}`, quien:yo() }); guardar('inv'); cerrarMd(); render(); toast('Falla reportada. Tu supervisor ya la ve.'); },
  'herr-ver': id=>abrirMd('herrl', { id }),
  'eq-nuevo': ()=>abrirMd('eq', { edit:true, codigo:sigCodigoEq(), frec:6, ult:HOY() }),
  'eq-ver': id=>{ if(otro('inventario', { eq:id })) return; abrirMd('eq', { id }); },
  'eq-editar': ()=>{ const q = equipo(MD.d.id); abrirMd('eq', { ...JSON.parse(JSON.stringify(q)), edit:true, tagsTxt:(q.tags||[]).join(', ') }); },
  'eq-guardar': ()=>{ const d = MD.d; if(!String(d.tipo||'').trim()) return fallo('Escribe el tipo de equipo.'); if(!String(d.cliente||'').trim()) return fallo('Escribe el cliente.');
    const frec = Math.max(0, Number(d.frec)||0), ult = d.ult || '';
    const datos = { codigo:String(d.codigo||'').trim() || sigCodigoEq(), tipo:d.tipo.trim(), marca:String(d.marca||'').trim(), modelo:String(d.modelo||'').trim(), serie:String(d.serie||'').trim(), cliente:d.cliente.trim(), ubic:String(d.ubic||'').trim(), frec, ult, prox:ult && frec ? addM(ult, frec) : '', tags:String(d.tagsTxt||'').split(',').map(s=>s.trim()).filter(Boolean) };
    if(I.equipos.some(x=>x.codigo===datos.codigo && x.id!==d.id)) return fallo('Ya existe un equipo con ese código.');
    let id = d.id; if(id) Object.assign(equipo(id), datos); else { id = uid('eq'); I.equipos.push({ id, ...datos, hist:[] }); }
    guardar('inv'); render(); abrirMd('eq', { id }); toast('Equipo guardado.'); },
  'eq-svc': ()=>{ MD.d.svc = !MD.d.svc; MD.err = ''; pintarMd(); },
  'svc-guardar': ()=>{ const q = equipo(MD.d.id), d = MD.d; if(!String(d.s_det||'').trim()) return fallo('Cuenta qué se hizo.');
    const tr = (O.trabajos||[]).find(t=>t.id===d.s_trab), fecha = d.s_fecha||HOY(), tipo = d.s_tipo||'Preventivo';
    q.hist = q.hist||[]; q.hist.unshift({ id:uid('hs'), fecha, tipo, tecnico:d.s_tec||yo(), trabajo:tr ? trabTxt(tr) : '', detalle:d.s_det.trim() });
    if(!q.ult || fecha>=q.ult){ q.ult = fecha; if(tipo==='Preventivo' && q.frec) q.prox = addM(fecha, q.frec); }
    guardar('inv'); MD.d = { id:q.id }; MD.err = ''; pintarMd(); render(); toast('Servicio registrado en el equipo.'); },
  'ped-nuevo': ()=>{ if(otro('inventario', null)) return; abrirMd('ped', {}); },
  'ped-guardar': ()=>{ const d = MD.d, items = Object.entries(d.q||{}).map(([itemId,v])=>({ itemId, cant:Number(v) })).filter(x=>x.cant>0);
    if(!d.alm) return fallo('Elige para qué unidad es.'); if(!items.length) return fallo('Indica cuánto necesitas de al menos un artículo.');
    I.pedidos.unshift({ id:uid('p'), ts:ahora(), fecha:HOY(), alm:d.alm, quien:yo(), estado:'pendiente', nota:String(d.nota||'').trim(), items }); guardar('inv'); cerrarMd(); render(); toast('Pedido enviado al almacén.'); },
  'ped-atender': id=>{ const p = I.pedidos.find(x=>x.id===id), c = almCentral(), falt = [];
    p.items.forEach(x=>{ const it = item(x.itemId); if(!it) return; if(it.serie){ falt.push(`${it.nombre} (elige las series en Movimientos)`); return; }
      const can = Math.min(x.cant, stk(c.id, x.itemId)); if(can>0) registrarMov({ tipo:'transferencia', itemId:x.itemId, cant:can, de:c.id, a:p.alm, nota:`Pedido de ${p.quien}`, _quien:O.usuario||'Administrador' }); if(can<x.cant) falt.push(`${n0(x.cant-can)} ${it.un} de ${it.nombre}`); });
    p.estado = 'atendido'; p.resuelto = `Atendido por ${O.usuario||'Administrador'} el ${fF(HOY())}.${falt.length ? ' Faltó: '+falt.join(', ')+'.' : ''}`; guardar('inv'); render(); toast(falt.length ? 'Pedido atendido en parte: revisa lo que faltó.' : 'Pedido atendido: el stock ya está en la unidad.'); },
  'ped-rechazar': id=>{ const p = I.pedidos.find(x=>x.id===id); p.estado = 'rechazado'; p.resuelto = `Rechazado por ${O.usuario||'Administrador'} el ${fF(HOY())}.`; guardar('inv'); render(); },
  'art-abrir-otro': id=>{ if(otro('academia', { art:id })) return; UI.acaTab = 'bib'; UI.player = null; UI.art = id; UI.artVer = null; cerrarMd(); render(); },
  // biblioteca
  'bcat': id=>{ UI.bcat = id || ''; render(); },
  'bfav': ()=>{ UI.bfav = !UI.bfav; render(); },
  'bpend': ()=>{ UI.bpend = !UI.bpend; UI.acaTab = 'bib'; UI.art = null; render(); },
  'art-abrir': id=>{ const a = art(id); if(!a) return; UI.art = id; UI.artVer = null; UI.vistas = UI.vistas || {}; if(!UI.vistas[id] && a.estado==='publicado'){ UI.vistas[id] = 1; a.vistas = (a.vistas||0)+1; guardar('con'); } render(); try{ ROOT.host.scrollIntoView({ block:'start' }); }catch(_){} },
  'art-volver': ()=>{ UI.art = null; UI.artVer = null; render(); },
  'art-ver': id=>{ UI.artVer = id ? +id : null; render(); },
  'dec': (id, b)=>{ UI.dec = UI.dec || {}; const j = +b.getAttribute('data-j'); UI.dec[id] = UI.dec[id]===j ? null : j; render(); },
  'art-fav': ()=>{ const a = art(UI.art), p = yo(); a.favs = a.favs||[]; const ya = a.favs.includes(p); a.favs = ya ? a.favs.filter(x=>x!==p) : a.favs.concat(p); guardar('con'); render(); toast(ya ? 'Quitado de favoritos.' : 'Guardado: lo tendrás aunque no haya señal.'); },
  'art-leida': ()=>{ const a = art(UI.art); a.lect = a.lect||{}; a.lect[yo()] = { fecha:HOY(), version:a.version }; guardar('con'); render(); toast('Listo: quedó registrado que lo leíste.'); },
  'art-util': id=>{ const a = art(UI.art); UI.util = UI.util || {}; if(UI.util[a.id]) return; UI.util[a.id] = 1; a.util = a.util || { si:0, no:0 }; a.util[id==='si'?'si':'no']++; guardar('con'); render(); toast('Gracias por contarnos.'); },
  'art-nuevo': (id, b)=>abrirMd('art', { tipo:'protocolo', cat:(A.cats[0]||{}).id||'_nueva', estado:'publicado', audTodos:'1', aud:[], cuerpo:'', titulo:b && b.getAttribute('data-q') || '' }),
  'busq-crear': id=>abrirMd('art', { tipo:'protocolo', cat:(A.cats[0]||{}).id||'_nueva', estado:'publicado', audTodos:'1', aud:[], titulo:id.charAt(0).toUpperCase()+id.slice(1), tagsTxt:id, cuerpo:'', fromBusq:id }),
  'busq-quitar': id=>{ A.busq = A.busq.filter(x=>x.q!==id); guardar('con'); render(); },
  'art-editar': ()=>{ const a = art(UI.art); abrirMd('art', { ...JSON.parse(JSON.stringify(a)), tagsTxt:(a.tags||[]).join(', '), audTodos:Array.isArray(a.aud) && a.aud.length ? '0' : '1', aud:Array.isArray(a.aud) ? a.aud.slice() : [], itemDoc:(I.items.find(i=>i.doc===a.id)||{}).id||'', cambio:'' }); },
  'art-guardar': ()=>{ const d = MD.d; if(!String(d.titulo||'').trim()) return fallo('Escribe el título.'); if(!String(d.cuerpo||'').trim()) return fallo('Escribe el contenido.');
    let cat = d.cat; if(cat==='_nueva'){ const n = String(d.catNueva||'').trim(); if(!n) return fallo('Escribe el nombre de la categoría.'); const ex = A.cats.find(c=>norm(c.nombre)===norm(n)); cat = ex ? ex.id : uid('c'); if(!ex) A.cats.push({ id:cat, nombre:n }); }
    const aud = d.audTodos==='0' ? (d.aud||[]) : 'todos'; if(aud!=='todos' && !aud.length) return fallo('Elige al menos un grupo o cambia a «Todo el equipo».');
    const datos = { titulo:d.titulo.trim(), tipo:d.tipo, cat, tags:String(d.tagsTxt||'').split(',').map(s=>s.trim()).filter(Boolean), resumen:String(d.resumen||'').trim(), cuerpo:d.cuerpo, video:String(d.video||'').trim(), adjunto:String(d.adjunto||'').trim(), archivo:d.archivo||null, aud, obligatorio:!!d.obligatorio };
    let id = d.id;
    if(id){ const a = art(id); const cambia = a.cuerpo!==datos.cuerpo || a.titulo!==datos.titulo;
      if(a.estado==='publicado' && cambia){ if(!String(d.cambio||'').trim()) return fallo('Cuenta en una línea qué cambió: el equipo lo verá en el artículo.');
        a.hist = a.hist||[]; a.hist.push({ version:a.version, fecha:a.desde, quien:a.aprobo||a.autor, cambio:a.cambio||'Primera versión', titulo:a.titulo, cuerpo:a.cuerpo }); a.version++; a.desde = HOY(); a.cambio = String(d.cambio).trim(); a.aprobo = O.usuario||'Administrador'; }
      Object.assign(a, datos); if(a.estado!=='propuesto') a.estado = d.estado==='borrador' ? 'borrador' : 'publicado'; }
    else { id = uid('a'); A.arts.push({ id, ...datos, estado:d.estado==='borrador'?'borrador':'publicado', version:1, desde:HOY(), cambio:'', aprobo:O.usuario||'Administrador', autor:O.usuario||'Administrador', aporte:false, creado:HOY(), hist:[], lect:{}, vistas:0, util:{ si:0, no:0 }, favs:[] }); }
    I.items.forEach(i=>{ if(i.doc===id && i.id!==d.itemDoc) i.doc = ''; }); if(d.itemDoc){ const it = item(d.itemDoc); if(it) it.doc = id; } guardar('inv');
    if(d.fromBusq) A.busq = A.busq.filter(b=>b.q!==d.fromBusq);
    guardar('con'); cerrarMd(); UI.acaTab = 'bib'; UI.art = id; UI.artVer = null; render(); toast('Artículo guardado.'); },
  'arch-quitar': ()=>{ MD.d.archivo = null; pintarMd(); },
  'art-archivar': ()=>{ const a = art(MD.d.id); a.estado = 'rechazado'; guardar('con'); cerrarMd(); UI.art = null; render(); toast('Artículo archivado.'); },
  'art-aprobar': ()=>{ const a = art(UI.art); a.estado = 'publicado'; a.aprobo = O.usuario||'Administrador'; a.desde = HOY(); guardar('con'); render(); toast('Aporte publicado: ya lo ve el equipo.'); },
  'art-rechazar': ()=>{ const a = art(UI.art); a.estado = 'rechazado'; guardar('con'); UI.art = null; render(); toast('Aporte rechazado.'); },
  'aporte-nuevo': ()=>abrirMd('aporte', { cat:(A.cats[0]||{}).id||'', titulo:UI.bq||'' }),
  'aporte-guardar': ()=>{ const d = MD.d; if(!String(d.titulo||'').trim() || !String(d.cuerpo||'').trim()) return fallo('Escribe el título y el contenido.');
    A.arts.push({ id:uid('a'), tipo:'tip', cat:d.cat || (A.cats[0]||{}).id || '', titulo:d.titulo.trim(), tags:[], resumen:'Aporte de campo.', cuerpo:d.cuerpo, video:'', adjunto:'', aud:'todos', obligatorio:false, estado:'propuesto', version:1, desde:HOY(), cambio:'', aprobo:'', autor:yo(), aporte:true, creado:HOY(), hist:[], lect:{}, vistas:0, util:{ si:0, no:0 }, favs:[] });
    guardar('con'); cerrarMd(); render(); toast('¡Gracias! Tu supervisor lo revisará y lo publicará.'); },
  // cursos
  'cur-nuevo': ()=>abrirMd('cur', { titulo:'', desc:'', caps:[], examen:[{ p:'', ops:['',''], ok:0 }], audTodos:'1', aud:[], obligatorio:false, min:80, vig:12, hab:'' }),
  'cur-editar': id=>{ const c = curso(id); abrirMd('cur', { ...JSON.parse(JSON.stringify(c)), audTodos:Array.isArray(c.aud) && c.aud.length ? '0' : '1', aud:Array.isArray(c.aud) ? c.aud.slice() : [] }); },
  'cur-cap': (id, b)=>{ const i = +b.getAttribute('data-i'), op = b.getAttribute('data-op'), L = MD.d.caps;
    if(op==='del') L.splice(i,1); else if(op==='up' && i>0) [L[i-1], L[i]] = [L[i], L[i-1]]; else if(op==='down' && i<L.length-1) [L[i+1], L[i]] = [L[i], L[i+1]]; pintarMd(); },
  'cur-q': (id, b)=>{ const op = b.getAttribute('data-op'), i = +b.getAttribute('data-i'), Q = MD.d.examen;
    if(op==='add') Q.push({ p:'', ops:['',''], ok:0 }); else if(op==='del') Q.splice(i,1);
    else if(op==='oadd' && Q[i].ops.length<4) Q[i].ops.push(''); else if(op==='odel'){ const j = +b.getAttribute('data-j'); Q[i].ops.splice(j,1); if(Q[i].ok>=Q[i].ops.length || Q[i].ok===j) Q[i].ok = 0; }
    pintarMd(); },
  'cur-guardar': ()=>{ const d = MD.d; if(!String(d.titulo||'').trim()) return fallo('Escribe el título del curso.'); if(!d.caps.length) return fallo('Agrega al menos una cápsula.');
    const ex = d.examen.map(q=>({ p:String(q.p||'').trim(), ops:q.ops.map(o=>String(o||'').trim()), ok:q.ok })); if(!ex.length) return fallo('Agrega al menos una pregunta.');
    for(const [i,q] of ex.entries()){ if(!q.p) return fallo(`Escribe la pregunta ${i+1}.`); if(q.ops.some(o=>!o)) return fallo(`Completa todas las opciones de la pregunta ${i+1}.`); }
    const min = Number(d.min), vig = Number(d.vig); if(!(min>=1 && min<=100)) return fallo('La nota mínima va de 1 a 100.'); if(!(vig>=0)) return fallo('Revisa los meses de validez.');
    const aud = d.audTodos==='0' ? (d.aud||[]) : 'todos'; if(aud!=='todos' && !aud.length) return fallo('Elige al menos un grupo o cambia a «Todo el equipo».');
    let hab = d.hab; if(hab==='_nueva'){ const n = String(d.habNueva||'').trim(); if(!n) return fallo('Escribe el nombre de la habilidad.'); hab = uid('h'); A.habs.push({ id:hab, nombre:n, desc:'', servicios:[], manual:[] }); }
    const datos = { titulo:d.titulo.trim(), desc:String(d.desc||'').trim(), caps:d.caps.slice(), examen:ex, aud, obligatorio:!!d.obligatorio, min, vig, hab:hab||'' };
    if(d.id) Object.assign(curso(d.id), datos); else A.cursos.push({ id:uid('k'), ...datos, estado:'publicado', creado:HOY() });
    guardar('con'); cerrarMd(); UI.acaTab = 'cur'; render(); toast('Curso guardado.'); },
  'cur-archivar': ()=>{ const c = curso(MD.d.id); c.estado = 'archivado'; guardar('con'); cerrarMd(); render(); toast('Curso archivado.'); },
  'cur-tomar': id=>{ UI.player = { cid:id, paso:'menu', i:0, resp:{} }; if(!modoTec()) UI.acaTab = 'cur'; else UI.acaTab = 'mis'; render(); },
  'pl-salir': ()=>{ UI.player = null; render(); },
  'pl-menu': ()=>{ UI.player.paso = 'menu'; render(); },
  'pl-cap': (id, b)=>{ UI.player.paso = 'cap'; UI.player.i = +b.getAttribute('data-i'); render(); },
  'pl-visto': ()=>{ const P = UI.player, c = curso(P.cid), g = progW(yo(), c.id), cid = c.caps[P.i]; if(cid && !g.vistos.includes(cid)) g.vistos.push(cid); guardar('con');
    if(P.i+1 < c.caps.length){ P.i++; } else { P.paso = c.caps.every(x=>g.vistos.includes(x)) ? 'exam' : 'menu'; P.resp = {}; } render(); },
  'pl-exam': ()=>{ UI.player.paso = 'exam'; UI.player.resp = {}; render(); },
  'pl-enviar': ()=>{ const P = UI.player, c = curso(P.cid); if(c.examen.some((q,i)=>P.resp[i]==null)) return toast('Responde todas las preguntas.');
    const bien = c.examen.filter((q,i)=>P.resp[i]===q.ok).length, nota = Math.round(bien/c.examen.length*100), ok = nota>=c.min, g = progW(yo(), c.id);
    g.intentos = (g.intentos||[]).concat({ fecha:HOY(), nota }); if(ok){ g.aprobado = HOY(); g.nota = nota; }
    P.res = { ok, nota }; P.paso = 'res'; guardar('con'); render(); },
  'cert-ver': (id, b)=>abrirMd('cert', { cid:id, p:b.getAttribute('data-p') || yo() }),
  'hab-nueva': ()=>abrirMd('hab', { servicios:[], miembros:[] }),
  'hab-editar': id=>{ const h = A.habs.find(x=>x.id===id); abrirMd('hab', { ...JSON.parse(JSON.stringify(h)), miembros:(h.manual||[]).slice() }); },
  'hab-guardar': ()=>{ const d = MD.d; if(!String(d.nombre||'').trim()) return fallo('Escribe el nombre de la habilidad.');
    const datos = { nombre:d.nombre.trim(), desc:String(d.desc||'').trim(), servicios:d.servicios||[], manual:d.miembros||[] };
    if(d.id) Object.assign(A.habs.find(x=>x.id===d.id), datos); else A.habs.push({ id:uid('h'), ...datos }); guardar('con'); cerrarMd(); render(); toast('Habilidad guardada.'); },
  'hab-borrar': ()=>{ const id = MD.d.id; A.habs = A.habs.filter(h=>h.id!==id); A.cursos.forEach(c=>{ if(c.hab===id) c.hab = ''; }); guardar('con'); cerrarMd(); render(); toast('Habilidad eliminada.'); },
  'gru-nuevo': ()=>abrirMd('gru', { miembros:[] }),
  'gru-editar': id=>{ const g = grupo(id); abrirMd('gru', JSON.parse(JSON.stringify(g))); },
  'gru-add': ()=>{ const n = String(MD.d.nuevoNombre||'').trim(); if(!n) return; MD.d.miembros = [...new Set((MD.d.miembros||[]).concat(n))]; MD.d.nuevoNombre = ''; pintarMd(); },
  'gru-guardar': ()=>{ const d = MD.d; if(!String(d.nombre||'').trim()) return fallo('Escribe el nombre del grupo.');
    const datos = { nombre:d.nombre.trim(), desc:String(d.desc||'').trim(), miembros:d.miembros||[] };
    if(d.id) Object.assign(grupo(d.id), datos); else A.grupos.push({ id:uid('g'), ...datos }); guardar('con'); cerrarMd(); render(); toast('Grupo guardado.'); },
  'gru-borrar': ()=>{ const id = MD.d.id; A.grupos = A.grupos.filter(g=>g.id!==id); [...A.cursos, ...A.arts].forEach(x=>{ if(Array.isArray(x.aud)){ x.aud = x.aud.filter(g=>g!==id); if(!x.aud.length) x.aud = 'todos'; } }); guardar('con'); cerrarMd(); render(); toast('Grupo eliminado.'); }
};
async function subirArchivo(f){
  if(!f || !MD) return;
  if(!/^(video\/(mp4|webm)|application\/pdf)$/.test(f.type)) return fallo('Sube un video MP4 o WebM, o un PDF.');
  if(f.size > 15e6) return fallo('El archivo pesa más de 15 MB. Para videos largos usa un enlace de YouTube no listado o Drive.');
  if(usoBytes() + f.size > (ACCESO.videos||0)*1e9) return fallo('Superas el espacio de videos de tu plan. Quita archivos o cambia de plan.');
  if(!O.subir) return fallo('La subida de archivos no está disponible aquí.');
  UI.subiendo = true; MD.err = ''; pintarMd();
  try{ const r = await O.subir(f); if(MD) MD.d.archivo = { url:r.url, id:r.id||'', name:f.name, size:f.size, type:f.type }; toast('Archivo subido.'); }
  catch(err){ console.error(err); if(MD) MD.err = 'No se pudo subir el archivo. Revisa tu conexión.'; }
  UI.subiendo = false; pintarMd();
}
function bind(){
  if(ROOT.__ops){ ['click','input','change','keydown'].forEach(t=>ROOT.removeEventListener(t, ROOT.__ops[t])); }
  const H = { click:onClick, input:ev=>onInput(ev, false), change:ev=>onInput(ev, true),
    keydown:ev=>{ if(ev.key==='Escape' && MD){ cerrarMd(); return; } if(ev.key==='Enter' && ev.target.matches && ev.target.matches('tr[data-a]')) ev.target.click(); } };
  Object.entries(H).forEach(([t,f])=>ROOT.addEventListener(t, f)); ROOT.__ops = H;
}
window.VK_OPS_MOUNT = async function(host, opts){
  if(PEND){ try{ await PEND(); }catch(_){} PEND = null; }
  O = opts || {}; toast = O.toast || (m=>console.log(m));
  ROOT = host.shadowRoot || host.attachShadow({ mode:'open' });
  ROOT.innerHTML = `<style>${MAP}${K().CSS_BASE||''}${EXTRA}</style><div class="vc"><p class="sub" style="padding:18px 4px">Cargando…</p></div>`;
  const key = (O.emp||{}).id || 'x'; UI = UIS[key] = UIS[key] || {}; MD = null;
  let i = await leer('inv'), a = await leer('con');
  const nI = !i || i.v!==1, nA = !a || a.v!==1;
  I = nI ? invVacio() : i; A = nA ? conVacio() : a;
  ['rubros','items','alm','series','herr','equipos','movs','pedidos'].forEach(k=>{ if(!Array.isArray(I[k])) I[k] = []; }); I.stock = I.stock || {};
  ['rubros','cats','grupos','habs','arts','cursos','busq'].forEach(k=>{ if(!Array.isArray(A[k])) A[k] = []; }); A.prog = A.prog || {};
  sincAlm();
  try{ ACCESO = await leerAcceso(); }catch(err){ console.warn(err); ACCESO = { ok:true }; }
  A.mig = A.mig || {};
  if(!A.mig.hs1){ A.mig.hs1 = 1; const h = A.habs.find(x=>x.id==='h_text'); if(h && !(h.servicios||[]).length && (O.servicios||[]).some(s=>s.id==='cat_muebles')){ h.servicios = ['cat_muebles']; guardar('con'); } }
  if(nI && nA){ const r = rubroDe(); if(r){ aplicarPlantilla(r); demoExtras(r); } else { guardar('inv'); guardar('con'); } }
  else if(nI || nA){ (nI ? A.rubros : I.rubros).forEach(r=>aplicarPlantilla(r, { inv:nI, con:nA })); }
  const pl = window.__vkOpsAbrir; window.__vkOpsAbrir = null;
  if(pl && pl.art && O.mod==='academia'){ UI.acaTab = 'bib'; UI.art = pl.art; UI.artVer = null; UI.player = null; }
  if(pl && pl.eq && O.mod==='inventario'){ UI.invTab = 'eq'; }
  bind(); render();
  if(pl && pl.eq && O.mod==='inventario' && equipo(pl.eq)) abrirMd('eq', { id:pl.eq });
  return { flush };
};
})();
