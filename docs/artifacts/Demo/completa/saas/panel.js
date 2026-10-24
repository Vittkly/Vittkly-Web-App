/* Vittkly · Panel de la plataforma (dueño y staff de Vittkly)
   window.SAAS_MOUNT(host, opts) → monta el panel en Shadow DOM.
   opts: { db, toast, salir, soporte(nombre), logoL, logoD, empresas:[nombres reales de Vitta Kleanly] }
   Datos de demostración (ficticios salvo Vitta Kleanly). Se guardan en la base: doc vk_plataforma/demo.
   La forma de los datos sigue las tablas previstas para Supabase: planes, modulos, plan_modulos, addons,
   cuentas, suscripciones, descuentos, cupones, campanas, facturas, staff, roles, aprobaciones, auditoria. */
(function(){
const CSS = `
:host{display:block;
  --bg:#F3F8FA;--card:#FFFFFF;--sunk:#EAF2F6;--line:#DDE7EC;--line2:#C3D3DB;
  --ink:#0E2A3B;--muted:#52626D;--pri:#157AA8;--pri-h:#0F6A93;--on-pri:#FFFFFF;--pri-ink:#106C97;--pri-soft:#E3F4FB;
  --ok:#1E9C78;--ok-ink:#146F55;--ok-soft:#E2F6EF;--warn:#E39A2A;--warn-ink:#8A5A0B;--warn-soft:#FDF1DC;
  --bad:#C0392B;--bad-ink:#B3322C;--bad-soft:#FDE8E7;--vio-ink:#5B45B0;--vio-soft:#EEEAFB;
  --sh:0 1px 2px rgba(14,42,59,.06),0 8px 24px rgba(14,42,59,.08);--sh2:0 18px 50px rgba(14,42,59,.25);
  --sans:Manrope,"Segoe UI",Roboto,Arial,sans-serif;--mono:"JetBrains Mono",ui-monospace,Menlo,Consolas,monospace;
  color-scheme:light;}
@media (prefers-color-scheme: dark){:host(:not([data-theme="light"])){
  --bg:#0A1C27;--card:#10283A;--sunk:#0C2130;--line:#1F3B4E;--line2:#2C4B60;--ink:#E7F1F6;--muted:#9DB2BE;
  --pri:#5BC0EA;--pri-h:#7FCFF0;--on-pri:#0A1C27;--pri-ink:#7FCFF0;--pri-soft:#0F3347;
  --ok:#4FD1A9;--ok-ink:#4FD1A9;--ok-soft:#0E3A2E;--warn:#F2B45A;--warn-ink:#F2B45A;--warn-soft:#3D2A0B;
  --bad:#F08A84;--bad-ink:#F08A84;--bad-soft:#3F1614;--vio-ink:#B9AEFF;--vio-soft:#29224F;
  --sh:0 1px 2px rgba(0,0,0,.4),0 8px 24px rgba(0,0,0,.3);--sh2:0 18px 50px rgba(0,0,0,.6);color-scheme:dark}}
:host([data-theme="dark"]){
  --bg:#0A1C27;--card:#10283A;--sunk:#0C2130;--line:#1F3B4E;--line2:#2C4B60;--ink:#E7F1F6;--muted:#9DB2BE;
  --pri:#5BC0EA;--pri-h:#7FCFF0;--on-pri:#0A1C27;--pri-ink:#7FCFF0;--pri-soft:#0F3347;
  --ok:#4FD1A9;--ok-ink:#4FD1A9;--ok-soft:#0E3A2E;--warn:#F2B45A;--warn-ink:#F2B45A;--warn-soft:#3D2A0B;
  --bad:#F08A84;--bad-ink:#F08A84;--bad-soft:#3F1614;--vio-ink:#B9AEFF;--vio-soft:#29224F;
  --sh:0 1px 2px rgba(0,0,0,.4),0 8px 24px rgba(0,0,0,.3);--sh2:0 18px 50px rgba(0,0,0,.6);color-scheme:dark}
*{box-sizing:border-box} [hidden]{display:none!important}
.sp{font:400 14.5px/1.5 var(--sans);color:var(--ink);background:var(--bg);min-height:100vh;-webkit-font-smoothing:antialiased}
.pin{max-width:1240px;margin:0 auto;padding:clamp(14px,2.6vw,28px) 16px 64px;display:flex;flex-direction:column;gap:14px}
h1,h2,h3,h4,p{margin:0} button,input,select,textarea{font:inherit;color:inherit}
.num{font-variant-numeric:tabular-nums}
/* cabecera */
.hd{display:flex;align-items:center;justify-content:space-between;gap:12px 18px;flex-wrap:wrap}
.hl{display:flex;align-items:center;gap:14px;min-width:0}
.hl img{height:30px;display:block} .hl .ld{display:none}
:host([data-theme="dark"]) .hl .ll{display:none} :host([data-theme="dark"]) .hl .ld{display:block}
@media (prefers-color-scheme: dark){:host(:not([data-theme="light"])) .hl .ll{display:none} :host(:not([data-theme="light"])) .hl .ld{display:block}}
.hl h1{font-size:1.28rem;font-weight:800;letter-spacing:-.01em} .hl p{color:var(--muted);font-size:.86rem}
.who{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.who label{display:flex;align-items:center;gap:8px;font-size:.78rem;color:var(--muted);font-weight:700;white-space:nowrap}
.demo{display:flex;gap:10px;align-items:flex-start;background:var(--vio-soft);color:var(--ink);border-radius:12px;padding:9px 14px;font-size:.84rem}
.demo b{color:var(--vio-ink)}
/* pestañas */
.tabs{display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid var(--line);margin:0 -16px;padding:0 16px}
.tabs::-webkit-scrollbar{display:none}
.tab{flex:none;border:0;background:none;padding:10px 12px;font-weight:700;font-size:.9rem;color:var(--muted);border-bottom:3px solid transparent;cursor:pointer;display:flex;gap:6px;align-items:center}
.tab[aria-selected="true"]{color:var(--pri-ink);border-bottom-color:var(--pri)}
.tab:hover{color:var(--ink)} .tab .bd{background:var(--bad);color:#fff;border-radius:99px;font-size:.66rem;padding:1px 6px;font-weight:800}
/* tarjetas */
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px;box-shadow:var(--sh);min-width:0}
.ch{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap;margin-bottom:12px}
.ch h2{font-size:1rem;font-weight:800} .ch p,.sub{color:var(--muted);font-size:.84rem}
.grid{display:grid;gap:12px} .g2{grid-template-columns:repeat(2,minmax(0,1fr))} .g3{grid-template-columns:repeat(3,minmax(0,1fr))}
.kps{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}
.kp{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 14px;box-shadow:var(--sh);display:flex;flex-direction:column;gap:2px;min-width:0}
.kp span{font-size:.7rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.kp b{font-size:1.45rem;font-weight:800;letter-spacing:-.01em;font-variant-numeric:tabular-nums;white-space:nowrap}
.kp small{color:var(--muted);font-size:.78rem} .kp small.up{color:var(--ok-ink);font-weight:700} .kp small.dn{color:var(--bad-ink);font-weight:700}
/* botones y campos */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;border:1px solid var(--line2);background:var(--card);border-radius:10px;padding:7px 13px;font-weight:700;font-size:.86rem;cursor:pointer;white-space:nowrap;min-height:36px}
.btn:hover{border-color:var(--pri);color:var(--pri-ink)}
.btn.p{background:var(--pri);border-color:var(--pri);color:var(--on-pri)} .btn.p:hover{background:var(--pri-h);color:var(--on-pri)}
.btn.d{color:var(--bad-ink);border-color:color-mix(in srgb,var(--bad) 45%,var(--line2))} .btn.d:hover{background:var(--bad-soft)}
.btn.g{border-color:transparent;background:none} .btn.s{min-height:30px;padding:4px 10px;font-size:.8rem;border-radius:8px}
.btn[aria-disabled="true"]{opacity:.45;cursor:not-allowed}
.btn:focus-visible,.tab:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,tr[tabindex]:focus-visible{outline:2px solid var(--pri);outline-offset:2px}
input[type=text],input[type=number],input[type=date],input[type=email],input[type=search],select,textarea{width:100%;border:1px solid var(--line2);background:var(--card);border-radius:9px;padding:7px 10px;min-height:36px;font-size:.88rem}
textarea{min-height:76px;resize:vertical}
.f{display:flex;flex-direction:column;gap:4px;min-width:0} .f>label,.lb{font-size:.72rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--muted)}
.f small{color:var(--muted);font-size:.76rem}
.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center} .row.end{justify-content:flex-end}
.fr{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}
.chk{display:inline-flex;align-items:center;gap:8px;cursor:pointer;font-size:.86rem}
.chk input{width:17px;height:17px;accent-color:var(--pri)}
.chips{display:flex;gap:6px;flex-wrap:wrap}
.chip{border:1.5px solid var(--line2);background:var(--card);border-radius:99px;padding:4px 12px;font-size:.8rem;font-weight:700;cursor:pointer;display:inline-flex;gap:6px;align-items:center}
.chip[aria-pressed="true"]{border-color:var(--pri);background:var(--pri-soft);color:var(--pri-ink)}
.chip i{font-style:normal;font-weight:800;color:var(--muted);font-size:.74rem}
/* etiquetas */
.pill{display:inline-flex;align-items:center;gap:5px;border-radius:99px;padding:2px 9px;font-size:.74rem;font-weight:800;white-space:nowrap;background:var(--sunk);color:var(--muted)}
.pill.ok{background:var(--ok-soft);color:var(--ok-ink)} .pill.in{background:var(--pri-soft);color:var(--pri-ink)}
.pill.wa{background:var(--warn-soft);color:var(--warn-ink)} .pill.r{background:var(--bad-soft);color:var(--bad-ink)} .pill.v{background:var(--vio-soft);color:var(--vio-ink)}
/* tablas */
.tw{overflow-x:auto;margin:0 -16px;padding:0 16px}
table{width:100%;border-collapse:collapse;font-size:.86rem}
th{text-align:left;font-size:.7rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);padding:8px 10px;border-bottom:1px solid var(--line);white-space:nowrap}
td{padding:9px 10px;border-bottom:1px solid var(--line);vertical-align:middle}
tbody tr:last-child td{border-bottom:0}
tr.clk{cursor:pointer} tr.clk:hover,tr.sel{background:var(--pri-soft)}
td.r,th.r{text-align:right;white-space:nowrap} td.nw{white-space:nowrap}
.who2{display:flex;align-items:center;gap:10px;min-width:0} .who2 b{display:block;line-height:1.25} .who2 small{display:block;color:var(--muted);font-size:.78rem}
.av{flex:none;width:32px;height:32px;border-radius:9px;background:var(--pri-soft);color:var(--pri-ink);display:grid;place-items:center;font-weight:800;font-size:.8rem}
.av.real{background:var(--ok-soft);color:var(--ok-ink)}
.hb{display:flex;align-items:center;gap:7px;min-width:90px} .hb i{flex:1;height:7px;border-radius:99px;background:var(--sunk);overflow:hidden;display:block} .hb i u{display:block;height:100%;border-radius:99px}
.vac{color:var(--muted);text-align:center;padding:20px}
/* gráfico */
.bars{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;align-items:end;height:170px;padding-top:8px}
.bar{display:flex;flex-direction:column;align-items:center;gap:6px;height:100%;justify-content:flex-end}
.bar u{display:block;width:100%;max-width:56px;border-radius:8px 8px 3px 3px;background:color-mix(in srgb,var(--pri) 55%,transparent)}
.bar.cur u{background:var(--pri)} .bar b{font-size:.74rem;font-variant-numeric:tabular-nums} .bar small{font-size:.72rem;color:var(--muted);text-transform:capitalize}
.mv{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px}
.mv div{background:var(--sunk);border-radius:10px;padding:8px 10px} .mv span{display:block;font-size:.7rem;color:var(--muted);font-weight:700} .mv b{font-variant-numeric:tabular-nums}
.funnel{display:flex;flex-direction:column;gap:8px}
.funnel div{display:grid;grid-template-columns:110px 1fr 72px;gap:10px;align-items:center;font-size:.84rem}
.funnel i{display:block;height:24px;border-radius:7px;background:var(--pri-soft);overflow:hidden} .funnel i u{display:block;height:100%;background:var(--pri);border-radius:7px}
.funnel b{text-align:right;font-variant-numeric:tabular-nums}
.alerts{display:flex;flex-direction:column;gap:8px}
.al{display:flex;align-items:center;gap:10px;border:1px solid var(--line);border-left:4px solid var(--c,var(--pri));border-radius:10px;padding:8px 10px;background:var(--card)}
.al div{flex:1;min-width:0} .al b{display:block;font-size:.86rem} .al small{color:var(--muted);font-size:.8rem}
/* layout clientes */
.cl{display:grid;grid-template-columns:minmax(0,1fr);gap:12px}
.cl.open{grid-template-columns:minmax(0,1fr) 420px;align-items:start}
.dr{position:sticky;top:12px;max-height:calc(100vh - 24px);overflow:auto;display:flex;flex-direction:column;gap:12px}
.dr .card{box-shadow:none}
.dh{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}
.dh h3{font-size:1.06rem;font-weight:800}
.dl{display:grid;grid-template-columns:1fr 1fr;gap:8px 12px;margin:0}
.dl dt{font-size:.68rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--muted)} .dl dd{margin:2px 0 0;font-weight:700;font-size:.88rem}
.sec{font-size:.74rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin:2px 0 8px}
.calc{display:flex;flex-direction:column;gap:4px;background:var(--sunk);border-radius:10px;padding:10px 12px;font-size:.86rem}
.calc div{display:flex;justify-content:space-between;gap:10px} .calc .t{border-top:1px solid var(--line2);padding-top:6px;margin-top:2px;font-weight:800}
.calc .neg{color:var(--ok-ink)}
.lst{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none}
.lst li{display:flex;gap:8px;align-items:center;justify-content:space-between;border:1px solid var(--line);border-radius:10px;padding:7px 10px;font-size:.84rem}
.lst li div{min-width:0} .lst small{display:block;color:var(--muted);font-size:.76rem}
.tl{display:flex;flex-direction:column;gap:0;margin:0;padding:0;list-style:none;font-size:.82rem}
.tl li{display:grid;grid-template-columns:86px 1fr;gap:8px;padding:5px 0;border-bottom:1px dashed var(--line)} .tl li span{color:var(--muted);font-variant-numeric:tabular-nums}
.mods{display:flex;flex-wrap:wrap;gap:6px}
/* planes */
.plans{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.pc{position:relative;border:1.5px solid var(--line);border-radius:14px;padding:14px;background:var(--card);display:flex;flex-direction:column;gap:10px}
.pc.dest{border-color:var(--pri);box-shadow:0 0 0 3px var(--pri-soft)}
.pc .tag{position:absolute;top:-11px;left:14px;background:var(--pri);color:var(--on-pri);font-size:.68rem;font-weight:800;border-radius:99px;padding:2px 9px;letter-spacing:.04em}
.mx th:not(:first-child),.mx td:not(:first-child){text-align:center}
.pub{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;background:var(--sunk);border-radius:14px;padding:16px}
.pp{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:8px}
.pp.dest{border:2px solid var(--pri)} .pp h4{font-size:1rem} .pp .pr{font-size:1.7rem;font-weight:800} .pp .pr small{font-size:.8rem;color:var(--muted);font-weight:600}
.pp ul{margin:0;padding-left:18px;font-size:.84rem;color:var(--muted)} .pp ul li{margin:2px 0}
/* promociones */
.camps{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:12px}
.cp{border:1px solid var(--line);border-radius:14px;padding:14px;background:var(--card);display:flex;flex-direction:column;gap:8px;border-top:4px solid var(--c,var(--pri))}
.cp h3{font-size:.98rem;font-weight:800} .cp p{font-size:.84rem;color:var(--muted)}
.cps{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;text-align:center}
.cps div{background:var(--sunk);border-radius:9px;padding:6px} .cps b{display:block;font-variant-numeric:tabular-nums} .cps span{font-size:.68rem;color:var(--muted);font-weight:700}
code.cd{font-family:var(--mono);font-size:.8rem;background:var(--sunk);border:1px dashed var(--line2);border-radius:6px;padding:1px 6px;font-weight:700}
/* ciclo de vida */
.life{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}
.lf{border-radius:10px;padding:10px;background:var(--sunk);border-top:4px solid var(--c);font-size:.8rem;display:flex;flex-direction:column;gap:3px}
.lf b{font-size:.84rem} .lf span{color:var(--muted)}
/* modal */
.mb{position:fixed;inset:0;background:rgba(6,20,30,.5);display:grid;place-items:center;z-index:50;padding:16px}
.md{background:var(--card);border-radius:16px;box-shadow:var(--sh2);width:min(560px,100%);max-height:calc(100vh - 32px);overflow:auto;display:flex;flex-direction:column}
.md header{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;padding:16px 18px 8px}
.md header h3{font-size:1.06rem;font-weight:800} .md header p{color:var(--muted);font-size:.84rem;margin-top:2px}
.md .bd{padding:8px 18px 12px;display:flex;flex-direction:column;gap:12px}
.md footer{display:flex;justify-content:flex-end;gap:8px;padding:12px 18px 16px;border-top:1px solid var(--line);flex-wrap:wrap}
.err{background:var(--bad-soft);color:var(--bad-ink);border-radius:9px;padding:8px 10px;font-size:.84rem;font-weight:600}
.note{background:var(--sunk);border-radius:10px;padding:9px 12px;font-size:.84rem;color:var(--muted)} .note b{color:var(--ink)}
.note.wa{background:var(--warn-soft);color:var(--ink)} .note.ok{background:var(--ok-soft);color:var(--ink)}
.opt{display:flex;gap:10px;align-items:flex-start;border:1.5px solid var(--line2);border-radius:12px;padding:10px 12px;cursor:pointer;text-align:left;background:var(--card);width:100%}
.opt:hover{border-color:var(--pri)} .opt b{display:block} .opt small{color:var(--muted)}
.opt input{margin-top:4px;accent-color:var(--pri)}
.ub{display:flex;flex-direction:column;gap:4px} .ub>div{display:flex;justify-content:space-between;gap:8px;font-size:.82rem}
.ub i{height:8px;border-radius:99px;background:var(--sunk);display:block;overflow:hidden} .ub u{display:block;height:100%;border-radius:99px;background:var(--pri)}
.ub.w u{background:var(--warn)} .ub.r u{background:var(--bad)} .ub.w b{color:var(--warn-ink)} .ub.r b{color:var(--bad-ink)}
.dot{display:inline-block;width:9px;height:9px;border-radius:50%;background:var(--ok);margin-right:6px;flex:none} .dot.degradado{background:var(--warn)} .dot.caido{background:var(--bad)} .dot.mantenimiento{background:var(--pri)}
.inc{border:1px solid var(--line);border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:6px} .inc.on{border-left:4px solid var(--warn)}
.inc ul{margin:0;padding-left:16px;font-size:.84rem} .inc li{margin:3px 0} .inc li span{color:var(--muted);font-variant-numeric:tabular-nums;margin-right:6px}
.foot{color:var(--muted);font-size:.8rem;display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center}
.lock{font-size:.76rem;color:var(--muted);display:flex;gap:6px;align-items:center}
@media (max-width:1100px){ .cl.open{grid-template-columns:1fr} .dr{position:static;max-height:none;order:-1} }
@media (max-width:860px){ .g2,.g3,.plans,.pub{grid-template-columns:1fr} .life{grid-template-columns:1fr 1fr} .mv{grid-template-columns:1fr 1fr} }
@media (max-width:720px){
  table.rs thead{display:none} table.rs,table.rs tbody,table.rs tr,table.rs td{display:block;width:100%}
  table.rs tr{border:1px solid var(--line);border-radius:12px;padding:8px 10px;margin-bottom:8px;background:var(--card)}
  table.rs td{border:0;padding:4px 0;display:flex;justify-content:space-between;gap:12px;text-align:right}
  table.rs td::before{content:attr(data-l);font-size:.7rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:var(--muted);text-align:left;flex:none}
  table.rs td.nl::before{display:none} table.rs td.nl{text-align:left}
  .tw{margin:0;padding:0} .hl h1{font-size:1.1rem} .bars{height:140px;gap:6px} .funnel div{grid-template-columns:90px 1fr 60px}
}
`;

/* ---------- utilidades ---------- */
const e = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad = n => String(n).padStart(2,'0');
const isoD = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const HOY = () => isoD(new Date());
const addD = (iso, n) => { const d = new Date(iso+'T12:00:00'); d.setDate(d.getDate()+n); return isoD(d); };
const addM = (iso, n) => { const d = new Date(iso+'T12:00:00'); d.setMonth(d.getMonth()+n); return isoD(d); };
const dias = (a, b) => Math.round((new Date(b+'T12:00:00') - new Date(a+'T12:00:00'))/86400000);
const MES = ['ene','feb','mar','abr','may','jun','jul','ago','set','oct','nov','dic'];
const fF = iso => { if(!iso) return '—'; const [y,m,d] = iso.split('-'); return `${+d} ${MES[+m-1]} ${y}`; };
const fC = iso => { if(!iso) return '—'; const [,m,d] = iso.split('-'); return `${+d} ${MES[+m-1]}`; };
const r2 = n => Math.round(n*100)/100;
const S = n => 'S/ ' + (Number(n)||0).toLocaleString('es-PE', { minimumFractionDigits: Math.abs(n%1)>0.001 ? 2 : 0, maximumFractionDigits: 2 });
const ini = s => String(s||'?').split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase();
const uid = p => p + Math.random().toString(36).slice(2,8);
const ahora = () => new Date().toISOString();
const fTs = ts => { const d = new Date(ts); return `${d.getDate()} ${MES[d.getMonth()]} · ${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const clone = o => JSON.parse(JSON.stringify(o));

/* ---------- catálogos fijos ---------- */
const PERMISOS = [
  ['ver_clientes','Ver clientes y su uso'], ['ver_ingresos','Ver ingresos y montos'], ['cambiar_plan','Cambiar plan y ciclo de un cliente'],
  ['extender_prueba','Extender pruebas'], ['descuentos','Aplicar descuentos a un cliente'], ['campanas','Crear cupones y campañas'],
  ['precios','Editar planes, módulos y precios'], ['suspender','Suspender, reactivar o cancelar cuentas'], ['soporte','Entrar como soporte a una cuenta'],
  ['reglas_cobro','Cambiar reglas de cobro y días de gracia'], ['pagos','Registrar pagos, reintentos y reembolsos'], ['notas','Escribir notas internas'],
  ['sistema','Publicar estado del sistema e incidentes'], ['legal','Publicar documentos legales y cumplimiento'],
  ['auditoria','Ver la auditoría'], ['equipo','Gestionar el equipo y sus permisos'],
  ['tickets','Atender tickets de soporte'], ['comunidad','Publicar en la Comunidad y el Centro de ayuda']
];
const PL = Object.fromEntries(PERMISOS);
const ESTADOS = {
  prueba:['En prueba','in'], activa:['Activa','ok'], morosa:['Pago fallido','wa'], restringida:['Solo lectura','r'],
  suspendida:['Suspendida','r'], pausada:['Pausada','v'], cancelada:['Cancelada','']
};
const TIPO_DESC = { pct:'% de descuento', monto:'S/ menos al mes', meses:'Meses gratis' };
const SEGMENTO = { nuevos:'Clientes nuevos', todos:'Todos los clientes', recuperacion:'Clientes que se fueron', retencion:'Al intentar cancelar', interno:'Uso interno' };
const LEGAL = {
  tos:['1. Vittkly es una plataforma para gestionar negocios de servicios: clientes, cotizaciones, trabajos, cobros y comunicaciones.','2. El cliente puede usar Vittkly gratis durante el periodo de prueba. Luego paga el plan que elija por adelantado, mensual o anual. Los precios incluyen IGV.','3. Si un pago falla, Vittkly reintenta el cobro y da días de gracia. Después la cuenta pasa a solo lectura: el cliente siempre puede ver y exportar sus datos.','4. El cliente es dueño de sus datos. Puede exportarlos en cualquier momento y pedir su eliminación al cancelar.','5. Vittkly busca una disponibilidad del 99.5% mensual y publica sus incidentes en la página de estado.','6. Cualquiera de las partes puede terminar el servicio. Al cancelar, los datos se conservan durante el plazo publicado y luego se eliminan.'],
  priv:['Vittkly trata los datos de sus clientes (titulares y usuarios) para dar el servicio, cobrarlo y darle soporte.','Los datos se guardan en servidores de proveedores con estándares de seguridad reconocidos, que pueden estar fuera del Perú.','No vendemos datos personales. Solo los compartimos con proveedores necesarios para el servicio (base de datos, mensajería, facturación, pasarela de pago).','Puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición escribiendo a privacidad@vittkly.com.'],
  dpa:['Cada empresa cliente es responsable de los datos de sus propios clientes; Vittkly actúa como encargado del tratamiento.','Vittkly solo usa esos datos para prestar el servicio, aplica medidas de seguridad y avisa en caso de incidentes.','Vittkly lista públicamente a sus subencargados y avisa antes de agregar uno nuevo.','Al terminar el contrato, Vittkly devuelve o elimina los datos según lo que indique el cliente.'],
  aup:['No se permite usar Vittkly para enviar mensajes no solicitados masivos, contenido ilegal ni para suplantar a otras personas o empresas.','Las campañas de WhatsApp deben respetar las políticas de Meta: solo a contactos que aceptaron recibir mensajes.']
};
const SITIO = { marca:'Mini sitio con marca Vittkly', dominio:'Sitio con dominio propio', hub:'Dominio propio y portal Hub' };
const CAMP_T = { fundadores:['Clientes fundadores','#157AA8'], temporada:['Temporada','#E39A2A'], recuperacion:['Recuperación','#5B45B0'], anual:['Pásate al anual','#1E9C78'], referidos:['Referidos','#C2417A'] };

/* ---------- datos de ejemplo ---------- */
function semilla(o){
  const T = HOY();
  const modulos = [
    { id:'clientes', l:'Clientes', base:true }, { id:'calendario', l:'Calendario', base:true }, { id:'cotizaciones', l:'Cotizaciones', base:true }, { id:'trabajos', l:'Trabajos', base:true },
    { id:'app', l:'App del técnico' }, { id:'whatsapp', l:'WhatsApp con un clic y automático' }, { id:'sitio', l:'Mini sitio y reservas online' }, { id:'pagos', l:'Cobro online con tu pasarela' },
    { id:'resenas', l:'Pedido de reseñas de Google' }, { id:'api', l:'API' }, { id:'crm', l:'CRM y post venta' }, { id:'finanzas', l:'Cobros y finanzas' },
    { id:'reportes', l:'Reportes avanzados' }, { id:'sunat', l:'Comprobantes SUNAT' }, { id:'dominio', l:'Dominio propio y sin marca Vittkly' }, { id:'webhooks', l:'Webhooks' },
    { id:'marketing', l:'Marketing: campañas, referidos y Meta' }, { id:'caja', l:'Caja y bancos' }, { id:'hub', l:'Portal Hub del cliente' },
    { id:'multi', l:'Multiempresa' }, { id:'roles', l:'Roles personalizados' },
    { id:'inventario', l:'Inventario, repuestos y equipos del cliente' }, { id:'academia', l:'Biblioteca y Academia con videos' }
  ];
  const base = ['clientes','calendario','cotizaciones','trabajos','app','whatsapp','sitio','pagos','resenas','api'];
  const planes = [
    { id:'inicia', nombre:'Inicia', lema:'Para ordenar tu negocio desde el día uno', mensual:89, anual:890, usuarios:3, empresas:1, destacado:false, activo:true, modulos:[...base],
      cuotas:{ wa:300, sunat:0, creditos:0, api:1000, sitio:'marca', soporte:'correo', videos:0 } },
    { id:'crece', nombre:'Crece', lema:'Para equipos que cobran, facturan y hacen seguimiento', mensual:189, anual:1890, usuarios:8, empresas:1, destacado:true, activo:true, modulos:[...base,'crm','finanzas','reportes','sunat','dominio','webhooks','inventario','academia'],
      cuotas:{ wa:1000, sunat:300, creditos:200, api:10000, sitio:'dominio', soporte:'whatsapp', videos:10 } },
    { id:'empresa', nombre:'Empresa', lema:'Para varias sedes, marketing y portal de clientes', mensual:349, anual:3490, usuarios:15, empresas:3, destacado:false, activo:true, modulos:modulos.map(m=>m.id),
      cuotas:{ wa:3000, sunat:500, creditos:600, api:50000, sitio:'hub', soporte:'ejecutivo', videos:50 } }
  ];
  const addons = [
    { id:'usuario', l:'Usuario adicional', precio:19, unidad:'por usuario al mes', auto:true },
    { id:'empresa', l:'Empresa adicional', precio:79, unidad:'por empresa al mes', auto:true },
    { id:'sunat_inicia', l:'Comprobantes SUNAT (300 al mes)', precio:39, unidad:'al mes', planes:['inicia'], modulo:'sunat', cuota:{ sunat:300 } },
    { id:'marketing', l:'Marketing: campañas, referidos y Meta', precio:79, unidad:'al mes', planes:['crece'], modulo:'marketing' },
    { id:'creditos500', l:'Paquete de 500 créditos', precio:25, unidad:'pago único', unico:true, creditos:500 },
    { id:'creditos2000', l:'Paquete de 2,000 créditos', precio:89, unidad:'pago único', unico:true, creditos:2000 }
  ];
  const creditos = { equiv:[
    { id:'wa_util', l:'WhatsApp automático sobre la cuota (aviso o recordatorio)', c:1 },
    { id:'wa_mkt', l:'WhatsApp de campaña (marketing)', c:4 },
    { id:'sunat', l:'Comprobante SUNAT sobre la cuota', c:1 },
    { id:'correo', l:'Correo de campaña (cada 10 correos)', c:1 }
  ], vencen:'Los créditos del plan se renuevan cada mes; los comprados no vencen.' };
  const roles = {
    propietario:{ l:'Propietario', fijo:true, descMax:100, permisos:Object.fromEntries(PERMISOS.map(p=>[p[0],true])) },
    finanzas:{ l:'Finanzas', descMax:30, permisos:{ ver_clientes:1, ver_ingresos:1, cambiar_plan:1, extender_prueba:1, descuentos:1, campanas:1, suspender:1, reglas_cobro:1, pagos:1, notas:1, auditoria:1 } },
    ventas:{ l:'Ventas y éxito del cliente', descMax:20, permisos:{ ver_clientes:1, ver_ingresos:1, cambiar_plan:1, extender_prueba:1, descuentos:1, campanas:1, notas:1, comunidad:1 } },
    soporte:{ l:'Soporte', descMax:10, permisos:{ ver_clientes:1, extender_prueba:1, descuentos:1, soporte:1, notas:1, sistema:1, tickets:1, comunidad:1 } },
    lectura:{ l:'Solo lectura', descMax:0, permisos:{ ver_clientes:1 } }
  };
  const staff = [
    { id:'s1', nombre:'Andree Alegre', correo:'aalegre@vittkly.com', rol:'propietario', estado:'activo', mfa:true, ultimo:'Ahora', real:true },
    { id:'s2', nombre:'Lucía Ramos', correo:'lramos@vittkly.com', rol:'finanzas', estado:'activo', mfa:true, ultimo:'Hoy' },
    { id:'s3', nombre:'Valeria Chávez', correo:'vchavez@vittkly.com', rol:'ventas', estado:'activo', mfa:false, ultimo:'Ayer' },
    { id:'s4', nombre:'Diego Paredes', correo:'dparedes@vittkly.com', rol:'soporte', estado:'activo', mfa:true, ultimo:'Hoy' },
    { id:'s5', nombre:'Kevin Huamán', correo:'khuaman@vittkly.com', rol:'lectura', estado:'invitado', mfa:false, ultimo:'—' }
  ];
  const cupones = [
    { id:'u1', codigo:'FUNDADORES', nombre:'Clientes fundadores: Crece a S/ 99', tipo:'monto', valor:90, duracion:'meses', meses:12, planes:['crece'], ciclo:'mensual', segmento:'nuevos', desde:addD(T,-60), hasta:addD(T,75), max:20, usos:3, activo:true },
    { id:'u2', codigo:'PRIMAVERA26', nombre:'Campaña de primavera', tipo:'pct', valor:20, duracion:'meses', meses:3, planes:[], ciclo:'todos', segmento:'nuevos', desde:addD(T,-30), hasta:addD(T,20), max:50, usos:2, activo:true },
    { id:'u3', codigo:'VERANO27', nombre:'Temporada alta de verano', tipo:'pct', valor:25, duracion:'meses', meses:2, planes:[], ciclo:'todos', segmento:'nuevos', desde:'2026-12-01', hasta:'2027-02-28', max:80, usos:0, activo:true },
    { id:'u4', codigo:'VUELVE40', nombre:'Te extrañamos: 40% por 3 meses', tipo:'pct', valor:40, duracion:'meses', meses:3, planes:[], ciclo:'todos', segmento:'recuperacion', desde:T, hasta:addD(T,45), max:null, usos:0, activo:true },
    { id:'u5', codigo:'QUEDATE30', nombre:'Oferta para no cancelar', tipo:'pct', valor:30, duracion:'meses', meses:3, planes:[], ciclo:'todos', segmento:'retencion', desde:addD(T,-90), hasta:null, max:null, usos:2, activo:true },
    { id:'u6', codigo:'CLIENTECERO', nombre:'Cliente cero (uso interno)', tipo:'pct', valor:100, duracion:'siempre', meses:null, planes:[], ciclo:'todos', segmento:'interno', desde:addD(T,-280), hasta:null, max:1, usos:1, activo:true }
  ];
  const campanas = [
    { id:'k1', tipo:'fundadores', nombre:'Programa de clientes fundadores', cupon:'FUNDADORES', estado:'activa', desde:addD(T,-60), hasta:addD(T,75), audiencia:'Nuevos clientes del plan Crece (cupo de 20)', canal:'Página de precios', enviados:0, convertidos:3, ingreso:297, mensaje:'' },
    { id:'k2', tipo:'temporada', nombre:'Primavera 2026', cupon:'PRIMAVERA26', estado:'activa', desde:addD(T,-30), hasta:addD(T,20), audiencia:'Pruebas activas y visitantes', canal:'Correo y WhatsApp', enviados:64, convertidos:2, ingreso:249, mensaje:'Hola {nombre}, por primavera tienes {descuento} en Vittkly con el código {codigo}.' },
    { id:'k3', tipo:'temporada', nombre:'Verano 2027 (temporada alta de limpieza)', cupon:'VERANO27', estado:'programada', desde:'2026-12-01', hasta:'2027-02-28', audiencia:'Pruebas activas y visitantes', canal:'Correo y WhatsApp', enviados:0, convertidos:0, ingreso:0, mensaje:'Llega la temporada alta, {nombre}: organiza tu equipo con {descuento} usando {codigo}.' },
    { id:'k4', tipo:'recuperacion', nombre:'Vuelve a Vittkly', cupon:'VUELVE40', estado:'borrador', desde:T, hasta:addD(T,45), audiencia:'Cancelaron hace más de 30 días', diasMin:30, canal:'Correo y WhatsApp', enviados:0, convertidos:0, ingreso:0, mensaje:'Hola {nombre}, mejoramos Vittkly y queremos que vuelvas: {descuento} con el código {codigo}. Tus datos siguen guardados.' }
  ];
  const D = (n,c,x) => Object.assign({ id:uid('c'), nombre:n, ciclo:'mensual', usuarios:2, empresas:[n], descuentos:[], modulosExtra:[], notas:[], timeline:[], precioFijo:null, metodo:'tarjeta', servicios:0, ultimo:'Hoy', salud:70, ciudad:'Lima' }, c, x||{});
  const emps = (o && o.empresas && o.empresas.length) ? o.empresas : ['Vitta Kleanly'];
  const clientes = [
    D('Vitta Kleanly', { id:'c1', real:true, titular:'Andree Alegre', correo:'aalegre@vittakleanly.com', cel:'—', rubro:'Limpieza y desinfección textil', plan:'empresa', estado:'activa', alta:addD(T,-280), prox:addM(T,1).slice(0,8)+'01', usuarios:7, empresas:emps, servicios:61, salud:94, metodo:'interno',
      descuentos:[{ id:'d1', cupon:'CLIENTECERO', nombre:'Cliente cero', tipo:'pct', valor:100, hasta:null, por:'Andree Alegre', desde:addD(T,-280) }] }),
    D('Grupo Andina Fumigaciones', { titular:'Jorge Arce', correo:'jorge@andinafum.pe', cel:'987 410 220', rubro:'Fumigación', plan:'empresa', ciclo:'anual', estado:'activa', alta:addD(T,-340), prox:addD(T,25), usuarios:18, empresas:['Andina Lima','Andina Cusco','Andina Piura'], servicios:88, salud:88 }),
    D('Fumigaciones Callao SAC', { titular:'Pilar Núñez', correo:'pilar@fumicallao.pe', cel:'986 300 114', rubro:'Fumigación', plan:'crece', ciclo:'anual', estado:'activa', alta:addD(T,-150), prox:addD(T,215), usuarios:6, servicios:41, salud:79, ciudad:'Callao' }),
    D('Lavandería Express', { titular:'Rosa Lazo', correo:'rosa@lavexpress.pe', cel:'985 771 090', rubro:'Lavandería', plan:'crece', estado:'activa', alta:addD(T,-52), prox:addD(T,8), usuarios:9, servicios:47, salud:81,
      descuentos:[{ id:'d2', cupon:'FUNDADORES', nombre:'Clientes fundadores', tipo:'monto', valor:90, hasta:addM(addD(T,-52),12), por:'Valeria Chávez', desde:addD(T,-52) }] }),
    D('AireMax Perú', { titular:'Óscar Villanueva', correo:'oscar@airemax.pe', cel:'984 225 670', rubro:'Aire acondicionado', plan:'crece', estado:'morosa', alta:addD(T,-120), prox:addD(T,-3), usuarios:5, servicios:29, salud:58, fallo:addD(T,-3), intentos:2 }),
    D('Hogar Brillante', { titular:'Carmen Quispe', correo:'carmen@hogarbrillante.pe', cel:'983 118 402', rubro:'Limpieza de hogares', plan:'inicia', estado:'activa', alta:addD(T,-20), prox:addD(T,10), usuarios:3, servicios:12, salud:66,
      descuentos:[{ id:'d3', cupon:'PRIMAVERA26', nombre:'Campaña de primavera', tipo:'pct', valor:20, hasta:addM(addD(T,-20),3), por:'Sistema (cupón)', desde:addD(T,-20) }] }),
    D('Mudanzas Rápidas', { titular:'Sofía Benites', correo:'sofia@mudanzasrapidas.pe', cel:'982 664 015', rubro:'Mudanzas', plan:'crece', estado:'activa', alta:addD(T,-95), prox:addD(T,14), usuarios:4, servicios:3, ultimo:'Hace 12 días', salud:31 }),
    D('Limpieza Total EIRL', { titular:'Marisol Paredes', correo:'marisol@limpiezatotal.pe', cel:'981 552 870', rubro:'Limpieza de oficinas', plan:'inicia', estado:'activa', alta:addD(T,-210), prox:addD(T,4), usuarios:3, servicios:22, ultimo:'Hace 2 días', salud:64, metodo:'manual' }),
    D('Jardines del Sur', { titular:'Elena Bravo', correo:'elena@jardinesdelsur.pe', cel:'980 431 225', rubro:'Jardinería', plan:'inicia', estado:'restringida', alta:addD(T,-130), prox:addD(T,-12), usuarios:2, servicios:0, ultimo:'Hace 10 días', salud:22, fallo:addD(T,-12), intentos:3, ciudad:'Lurín' }),
    D('Electro Servicios JR', { titular:'Jhon Ríos', correo:'jhon@electrojr.pe', cel:'979 300 551', rubro:'Electricidad', plan:'inicia', estado:'suspendida', alta:addD(T,-160), prox:addD(T,-45), usuarios:2, servicios:0, ultimo:'Hace 41 días', salud:8, fallo:addD(T,-45), intentos:3, motivoEstado:'Pago vencido hace 45 días' }),
    D('Piscinas Azul', { titular:'Fernando Gil', correo:'fernando@piscinasazul.pe', cel:'978 902 336', rubro:'Mantenimiento de piscinas', plan:'crece', estado:'pausada', alta:addD(T,-240), prox:addD(T,40), usuarios:3, servicios:0, ultimo:'Hace 20 días', salud:45, pausaHasta:addD(T,40), motivoEstado:'Temporada baja (aceptó la pausa al intentar cancelar)' }),
    D('Clima Frío SAC', { titular:'Raúl Meza', correo:'raul@climafrio.pe', cel:'977 140 882', rubro:'Aire acondicionado', plan:'empresa', estado:'prueba', alta:addD(T,-28), pruebaFin:addD(T,2), usuarios:3, servicios:14, salud:72, metodo:'sin tarjeta' }),
    D('Mantenimiento Lima Norte', { titular:'Víctor Salas', correo:'victor@mln.pe', cel:'976 509 101', rubro:'Mantenimiento', plan:'empresa', estado:'prueba', alta:addD(T,-29), pruebaFin:addD(T,1), usuarios:1, servicios:0, ultimo:'Hace 9 días', salud:18, metodo:'sin tarjeta', ciudad:'Comas' }),
    D('Clean & Go', { titular:'Diego Rojas', correo:'diego@cleango.pe', cel:'975 883 207', rubro:'Limpieza de hogares', plan:'empresa', estado:'prueba', alta:addD(T,-14), pruebaFin:addD(T,16), usuarios:2, servicios:5, salud:61, metodo:'sin tarjeta' }),
    D('Lavado de Autos Brillo', { titular:'Marco Tello', correo:'marco@autobrillo.pe', cel:'974 128 640', rubro:'Detailing vehicular', plan:'empresa', estado:'prueba', alta:addD(T,-21), pruebaFin:addD(T,9), usuarios:2, servicios:9, salud:57, metodo:'sin tarjeta', ciudad:'Arequipa' }),
    D('Tapicería Fina', { titular:'Julio Cárdenas', correo:'julio@tapiceriafina.pe', cel:'973 660 921', rubro:'Tapicería', plan:'crece', estado:'cancelada', alta:addD(T,-200), cancelada:addD(T,-45), motivoCancel:'Precio', usuarios:4, servicios:0, ultimo:'Hace 45 días', salud:0 }),
    D('Servilimp Arequipa', { titular:'Gabriela Soto', correo:'gabriela@servilimp.pe', cel:'972 455 330', rubro:'Limpieza', plan:'inicia', estado:'cancelada', alta:addD(T,-250), cancelada:addD(T,-95), motivoCancel:'Volvimos a Excel o WhatsApp', usuarios:2, servicios:0, ultimo:'Hace 95 días', salud:0, ciudad:'Arequipa' }),
    D('Control de Plagas Norte', { titular:'Ricardo Linares', correo:'ricardo@plagasnorte.pe', cel:'971 774 058', rubro:'Fumigación', plan:'crece', estado:'cancelada', alta:addD(T,-300), cancelada:addD(T,-130), motivoCancel:'Falta una función', motivoNota:'Pidió control de inventario de insumos', usuarios:5, servicios:0, ultimo:'Hace 130 días', salud:0, ciudad:'Trujillo' })
  ];
  clientes.forEach(c=>{ c.timeline = [{ ts:c.alta+'T10:00:00', t:'Se registró y empezó la prueba de 30 días' }];
    if(c.estado!=='prueba') c.timeline.unshift({ ts:addD(c.alta,30)+'T10:00:00', t: c.real ? 'Cliente cero: plan Empresa sin costo' : `Eligió el plan ${planes.find(p=>p.id===c.plan).nombre} (${c.ciclo})` });
    if(c.fallo) c.timeline.unshift({ ts:c.fallo+'T08:00:00', t:'El cobro con tarjeta fue rechazado' });
    if(c.cancelada) c.timeline.unshift({ ts:c.cancelada+'T16:00:00', t:`Canceló la suscripción · motivo: ${c.motivoCancel}` });
    if(c.pausaHasta) c.timeline.unshift({ ts:addD(T,-20)+'T11:00:00', t:'Intentó cancelar y aceptó pausar la cuenta 2 meses' });
  });
  // consumo, complementos, integraciones y sitio de cada cliente (ficticio)
  const X = {
    'Vitta Kleanly':{ wa:412, sunat:38, api:120, integ:['resenas'], sitio:{ publicado:true, slug:'vittakleanly', dominio:'', visitas:640, solicitudes:31, reservas:12 }, mfa:true, credExtra:0 },
    'Grupo Andina Fumigaciones':{ wa:2710, sunat:462, api:8400, integ:['zapier','sheets','webhooks','calendar'], sitio:{ publicado:true, slug:'andina', dominio:'reservas.andinafum.pe', visitas:2210, solicitudes:96, reservas:41 }, mfa:true, credExtra:500, wh:{ url:'https://hooks.zapier.com/…', ok:true } },
    'Fumigaciones Callao SAC':{ wa:640, sunat:121, api:0, integ:['meta','resenas'], addons:['marketing'], sitio:{ publicado:true, slug:'fumicallao', dominio:'', visitas:880, solicitudes:44, reservas:17 }, mfa:false },
    'Lavandería Express':{ wa:930, sunat:288, api:2300, integ:['sheets','resenas'], sitio:{ publicado:true, slug:'lavexpress', dominio:'citas.lavexpress.pe', visitas:1530, solicitudes:120, reservas:73 }, mfa:true },
    'AireMax Perú':{ wa:510, sunat:64, api:3900, integ:['make','webhooks'], sitio:{ publicado:false, slug:'airemax' }, mfa:false, wh:{ url:'https://hook.make.com/…', ok:false, fallas:14 } },
    'Hogar Brillante':{ wa:150, sunat:0, api:0, integ:[], sitio:{ publicado:true, slug:'hogarbrillante', visitas:210, solicitudes:9, reservas:4 }, mfa:false },
    'Mudanzas Rápidas':{ wa:22, sunat:3, api:0, integ:[], sitio:{ publicado:false, slug:'mudanzasrapidas' }, mfa:false },
    'Limpieza Total EIRL':{ wa:281, sunat:176, api:0, integ:['resenas'], addons:['sunat_inicia'], sitio:{ publicado:true, slug:'limpiezatotal', visitas:390, solicitudes:18, reservas:6 }, mfa:true },
    'Jardines del Sur':{ wa:40, sunat:0, api:0, integ:[], sitio:{ publicado:false, slug:'jardinesdelsur' } },
    'Electro Servicios JR':{ wa:0, sunat:0, api:0, integ:[], sitio:{ publicado:false, slug:'electrojr' } },
    'Piscinas Azul':{ wa:0, sunat:0, api:0, integ:['calendar'], sitio:{ publicado:true, slug:'piscinasazul', visitas:60, solicitudes:2, reservas:0 } },
    'Clima Frío SAC':{ wa:260, sunat:22, api:450, integ:['sheets'], sitio:{ publicado:true, slug:'climafrio', visitas:310, solicitudes:14, reservas:5 } },
    'Mantenimiento Lima Norte':{ wa:0, sunat:0, api:0, integ:[], sitio:{ publicado:false, slug:'mln' } },
    'Clean & Go':{ wa:84, sunat:0, api:0, integ:[], sitio:{ publicado:true, slug:'cleango', visitas:95, solicitudes:4, reservas:1 } },
    'Lavado de Autos Brillo':{ wa:130, sunat:9, api:0, integ:['meta'], sitio:{ publicado:true, slug:'autobrillo', visitas:270, solicitudes:21, reservas:9 } }
  };
  clientes.forEach(c=>{ const x = X[c.nombre] || { wa:0, sunat:0, api:0, integ:[], sitio:{ publicado:false, slug:c.nombre.toLowerCase().replace(/[^a-z0-9]/g,'') } };
    const pc = planes.find(p=>p.id===c.plan).cuotas;
    c.consumo = { wa:x.wa, sunat:x.sunat, apiHoy:x.api, creditosUsados: Math.max(0, x.wa - pc.wa) + Math.max(0, x.sunat - pc.sunat), creditosExtra:x.credExtra||0 };
    c.addons = x.addons || []; c.integraciones = x.integ; c.sitio = x.sitio; c.mfa = !!x.mfa; c.webhook = x.wh || null;
    c.legal = { version:'1.0', aceptado: c.estado!=='cancelada' ? addD(c.alta,0) : null };
  });
  clientes.find(c=>c.nombre==='Mudanzas Rápidas').notas = [{ ts:addD(T,-2)+'T15:20:00', por:'Valeria Chávez', t:'Dice que su equipo no se acostumbra a la app. Ofrecí una capacitación por videollamada.' }];
  const st = { v:2, planes, modulos, addons, creditos, roles, staff, cupones, campanas, clientes, facturas:[], aprobaciones:[], auditoria:[],
    costos:{ sunatRuc:40, waUtil:0.05, waMkt:0.25, infra:3, nota:'Supuestos editables. SUNAT: tarifa de revendedor Nubefact (S/ 40 por RUC al mes, hasta 500 comprobantes). WhatsApp: confirma la tarifa de Meta para Perú en soles.' },
    sistema:{ componentes:[
        { id:'web', l:'Central web', estado:'operativo', uptime:99.98 }, { id:'app', l:'App del técnico', estado:'operativo', uptime:99.95 },
        { id:'wa', l:'Envíos de WhatsApp', estado:'degradado', uptime:99.71 }, { id:'sunat', l:'Envío a SUNAT', estado:'operativo', uptime:99.9 },
        { id:'pagos', l:'Pagos online', estado:'operativo', uptime:99.99 }, { id:'api', l:'API y webhooks', estado:'operativo', uptime:99.97 },
        { id:'sitios', l:'Sitios y reservas', estado:'operativo', uptime:99.99 } ],
      incidentes:[
        { id:'i1', titulo:'Demoras en el envío de WhatsApp automáticos', comps:['wa'], estado:'monitoreando', inicio:addD(T,0)+'T08:10:00', fin:null, updates:[{ ts:addD(T,0)+'T08:10:00', t:'Detectamos demoras de hasta 15 minutos en los mensajes automáticos. Los mensajes con un clic funcionan normal.' },{ ts:addD(T,0)+'T09:40:00', t:'Meta aplicó una corrección; seguimos monitoreando.' }] },
        { id:'i2', titulo:'SUNAT no respondía (servicio de SUNAT)', comps:['sunat'], estado:'resuelto', inicio:addD(T,-6)+'T19:00:00', fin:addD(T,-6)+'T21:30:00', updates:[{ ts:addD(T,-6)+'T19:00:00', t:'El servicio de SUNAT no responde. Los comprobantes quedan en cola y se envían solos al volver.' },{ ts:addD(T,-6)+'T21:30:00', t:'SUNAT volvió a responder. Se enviaron 214 comprobantes en cola.' }] } ],
      respaldos:{ diario:'03:00', ultimo:addD(T,0)+'T03:00:00', puntoEnTiempo:7, retencion:30, prueba:addD(T,-12) } },
    legal:{ docs:[
        { id:'tos', l:'Términos y condiciones del servicio', version:'1.0', fecha:addD(T,-280), obligatorio:true },
        { id:'priv', l:'Política de privacidad', version:'1.0', fecha:addD(T,-280), obligatorio:true },
        { id:'dpa', l:'Acuerdo de tratamiento de datos (encargo)', version:'1.0', fecha:addD(T,-280), obligatorio:true },
        { id:'aup', l:'Política de uso aceptable', version:'1.0', fecha:addD(T,-280), obligatorio:false } ],
      cumplimiento:[
        { id:'anpd', l:'Inscribir el banco de datos de clientes ante la Autoridad Nacional de Protección de Datos Personales', ok:false },
        { id:'priv', l:'Publicar la política de privacidad y pedir aceptación al registrarse', ok:true },
        { id:'dpa', l:'Firmar el acuerdo de tratamiento de datos con cada cliente (aceptación en línea)', ok:true },
        { id:'enc', l:'Listar a los proveedores que tratan datos (Supabase, Meta, Nubefact, pasarela, correo)', ok:false },
        { id:'ruc', l:'RUC propio de Vittkly y facturación electrónica de las suscripciones', ok:false },
        { id:'lr', l:'Libro de reclamaciones virtual (confirmar con abogado si aplica a Vittkly)', ok:false },
        { id:'trans', l:'Transferencia internacional de datos informada (servidores fuera del Perú)', ok:false } ] },
    soporteNiveles:{ correo:{ l:'Correo', canal:'Correo a soporte@vittkly.com', respuesta:'24 horas hábiles', capacitacion:'Videos y manuales' },
      whatsapp:{ l:'WhatsApp', canal:'WhatsApp y correo', respuesta:'4 horas hábiles', capacitacion:'1 sesión de inicio por videollamada' },
      ejecutivo:{ l:'Ejecutivo asignado', canal:'WhatsApp directo con tu ejecutivo', respuesta:'1 hora hábil', capacitacion:'Capacitación del equipo y revisión mensual' } },
    paises:[ { id:'PE', l:'Perú', moneda:'PEN', simbolo:'S/', impuesto:'IGV', tasa:18, fiscal:'SUNAT', activo:true },
      { id:'CL', l:'Chile', moneda:'CLP', simbolo:'$', impuesto:'IVA', tasa:19, fiscal:'SII', activo:false },
      { id:'CO', l:'Colombia', moneda:'COP', simbolo:'$', impuesto:'IVA', tasa:19, fiscal:'DIAN', activo:false },
      { id:'MX', l:'México', moneda:'MXN', simbolo:'$', impuesto:'IVA', tasa:16, fiscal:'SAT', activo:false },
      { id:'EC', l:'Ecuador', moneda:'USD', simbolo:'$', impuesto:'IVA', tasa:15, fiscal:'SRI', activo:false } ],
    referidos:{ premioQuien:'1 mes gratis por cada empresa que pague', premioNuevo:'20% por 3 meses', activos:true,
      partners:[ { id:'p1', nombre:'Estudio Contable Ríos & Asociados', tipo:'Contador', contacto:'Marta Ríos', comision:20, clientes:3, pendiente:96 },
        { id:'p2', nombre:'Consultora PymeFácil', tipo:'Consultor', contacto:'Luis Cano', comision:15, clientes:1, pendiente:28 } ],
      referidos:[ { quien:'Grupo Andina Fumigaciones', nuevo:'Fumigaciones Callao SAC', estado:'pagó', premio:'1 mes gratis aplicado' }, { quien:'Lavandería Express', nuevo:'Clean & Go', estado:'en prueba', premio:'Pendiente' } ] },
    reglas:{ prueba:30, planPrueba:'empresa', reintentos:'1, 3, 5', gracia:7, soloLectura:30, borrado:90, avisoBorrado:15, mesesAnual:10, pasarela:'', manual:true },
    retencion:{ activa:true, pausaMeses:2, cupon:'QUEDATE30', bajarPlan:true, encuesta:true, intentos:5, retenidos:2,
      motivos:['Precio','No lo usamos lo suficiente','Falta una función','Volvimos a Excel o WhatsApp','Cerramos el negocio','Otro'] },
    hist:[], embudo:{ registros:26, activaron:17, pagaron:8 }, movimientos:{ nuevo:396, expansion:38, contraccion:0, perdida:189 } };
  // historial de MRR (meses anteriores, ficticio) — el mes actual se calcula
  [310,520,690,880,1050].forEach((v,i)=>{ const d = new Date(); d.setDate(1); d.setMonth(d.getMonth()-(5-i)); st.hist.push({ mes:isoD(d).slice(0,7), mrr:v }); });
  // facturas de los últimos meses
  let n = 118;
  clientes.forEach(c=>{
    if(['prueba','cancelada'].includes(c.estado) || c.real) return;
    const precio = precioCli(st, c).total; if(precio<=0) return;
    const veces = c.ciclo==='anual' ? 1 : 3;
    for(let k=veces-1;k>=0;k--){
      const f = c.ciclo==='anual' ? addM(c.prox,-12) : addM(c.prox,-(k+ (['morosa','restringida','suspendida'].includes(c.estado)?0:1)));
      if(f > T) continue;
      let estado = 'pagada', intentos = 1;
      if(k===0 && c.estado==='morosa'){ estado = 'fallida'; intentos = c.intentos; }
      if(k===0 && ['restringida','suspendida'].includes(c.estado)){ estado = 'vencida'; intentos = 3; }
      st.facturas.push({ id:uid('f'), numero:(c.correo.includes('sac')||c.nombre.includes('SAC')||c.nombre.includes('EIRL')||c.nombre.includes('Grupo')?'F001-':'B001-')+String(n++).padStart(6,'0'), cliente:c.id, fecha:f, monto:c.ciclo==='anual' ? r2(precio*12) : precio, estado, intentos, metodo:c.metodo==='manual'?'Transferencia':'Tarjeta' });
    }
  });
  st.facturas.sort((a,b)=>b.fecha.localeCompare(a.fecha));
  const mud = clientes.find(c=>c.nombre==='Mudanzas Rápidas');
  st.aprobaciones.push({ id:'a1', cliente:mud.id, pedidoPor:'Valeria Chávez', rol:'ventas', ts:addD(T,-1)+'T17:40:00', estado:'pendiente', desc:{ nombre:'Retención por bajo uso', tipo:'pct', valor:35, meses:6, pct:35 }, motivo:'Cliente en riesgo: casi no usa la app. Con el descuento se compromete a capacitar a su equipo.' });
  st.auditoria = [
    { ts:addD(T,-1)+'T17:40:00', quien:'Valeria Chávez', rol:'ventas', accion:'Pidió aprobación de descuento', cli:mud.id, det:'35% por 6 meses (su límite es 20%)' },
    { ts:addD(T,-2)+'T15:20:00', quien:'Valeria Chávez', rol:'ventas', accion:'Nota interna', cli:mud.id, det:'Ofreció capacitación por videollamada' },
    { ts:addD(T,-3)+'T09:05:00', quien:'Sistema', rol:'', accion:'Cobro rechazado', cli:clientes.find(c=>c.nombre==='AireMax Perú').id, det:'Reintento 2 de 3 programado' },
    { ts:addD(T,-5)+'T11:30:00', quien:'Diego Paredes', rol:'soporte', accion:'Entró como soporte', cli:clientes.find(c=>c.nombre==='Lavandería Express').id, det:'Motivo: configurar plantillas de WhatsApp' },
    { ts:addD(T,-8)+'T10:12:00', quien:'Lucía Ramos', rol:'finanzas', accion:'Registró pago manual', cli:clientes.find(c=>c.nombre==='Limpieza Total EIRL').id, det:'Transferencia BCP · S/ 89' },
    { ts:addD(T,-30)+'T09:00:00', quien:'Andree Alegre', rol:'propietario', accion:'Creó cupón', cli:null, det:'PRIMAVERA26 · 20% por 3 meses' }
  ];
  return st;
}

/* ---------- motor de precios ---------- */
function planDe(st, id){ return st.planes.find(p=>p.id===id) || st.planes[0]; }
function descVigente(d, T){ return !d.hasta || d.hasta >= (T||HOY()); }
function precioCli(st, c){
  const p = planDe(st, c.plan), ad = id => (st.addons.find(a=>a.id===id)||{precio:0}).precio;
  const base = c.precioFijo!=null ? Number(c.precioFijo) : (c.ciclo==='anual' ? p.anual/12 : p.mensual);
  const xu = Math.max(0, (c.usuarios||0) - p.usuarios), xe = Math.max(0, (c.empresas||[]).length - p.empresas);
  const adl = (c.addons||[]).map(id=>st.addons.find(a=>a.id===id)).filter(a=>a && !a.unico);
  const extras = xu*ad('usuario') + xe*ad('empresa') + adl.reduce((t,a)=>t+a.precio,0);
  let sub = base + extras; const lineas = [];
  (c.descuentos||[]).filter(d=>descVigente(d)).forEach(d=>{
    let m = 0;
    if(d.tipo==='pct') m = sub*d.valor/100; else if(d.tipo==='monto') m = Math.min(sub, d.valor); else if(d.tipo==='meses') m = sub;
    m = r2(m); sub = r2(sub - m); lineas.push({ d, m });
  });
  return { base:r2(base), xu, xe, adl, extras:r2(extras), lineas, total:r2(Math.max(0,sub)), lista:r2(base+extras) };
}
function cuotasCli(st, c){
  const p = planDe(st, c.plan), q = { ...(p.cuotas||{}) };
  (c.addons||[]).forEach(id=>{ const a = st.addons.find(x=>x.id===id); if(a && a.cuota) Object.entries(a.cuota).forEach(([k,v])=>{ q[k] = (q[k]||0) + v; }); });
  if(c.estado==='prueba'){ const top = st.planes.find(x=>x.id===(st.reglas||{}).planPrueba) || p; Object.assign(q, top.cuotas||{}); }
  return q;
}
// Agrega a datos guardados antes los módulos y cuotas nuevos (Inventario y Academia desde Crece).
function migrar(st){
  try{ if(st.creditos && Array.isArray(st.creditos.equiv)) st.creditos.equiv = st.creditos.equiv.filter(x=>x.id!=='ia'); }catch(err){}   // Viky va incluida en el plan, no usa créditos
  try{ const r = st.roles||{}; if(r.soporte && r.soporte.permisos && r.soporte.permisos.tickets===undefined){ r.soporte.permisos.tickets = 1; r.soporte.permisos.comunidad = 1; } if(r.ventas && r.ventas.permisos && r.ventas.permisos.comunidad===undefined) r.ventas.permisos.comunidad = 1; }catch(err){}
  if(!st || !Array.isArray(st.modulos) || !Array.isArray(st.planes)) return st;
  st.mig = st.mig || {};
  if(!st.mig.ops1){ st.mig.ops1 = 1;
    [['inventario','Inventario, repuestos y equipos del cliente'],['academia','Biblioteca y Academia con videos']].forEach(([id,l])=>{ if(!st.modulos.some(m=>m.id===id)) st.modulos.push({ id, l }); });
    st.planes.forEach(p=>{ p.cuotas = p.cuotas || {}; if(p.id!=='inicia') ['inventario','academia'].forEach(m=>{ if(!p.modulos.includes(m)) p.modulos.push(m); }); if(p.cuotas.videos==null) p.cuotas.videos = p.id==='inicia' ? 0 : p.id==='crece' ? 10 : 50; });
  }
  return st;
}
function modsCli(st, c){
  const p = c.estado==='prueba' ? (st.planes.find(x=>x.id===(st.reglas||{}).planPrueba) || planDe(st,c.plan)) : planDe(st, c.plan);
  const m = new Set(p.modulos);
  (c.addons||[]).forEach(id=>{ const a = st.addons.find(x=>x.id===id); if(a && a.modulo) m.add(a.modulo); });
  (c.modulosExtra||[]).forEach(x=>{ if(!x.hasta || x.hasta>=HOY()) m.add(x.id); });
  return m;
}
function creditosCli(st, c){ const q = cuotasCli(st,c), con = c.consumo||{}; return { plan:q.creditos||0, extra:con.creditosExtra||0, usados:con.creditosUsados||0, saldo:Math.max(0,(q.creditos||0)+(con.creditosExtra||0)-(con.creditosUsados||0)) }; }
const CUENTA_MRR = ['activa','morosa'];
function mrrCli(st, c){ return CUENTA_MRR.includes(c.estado) ? precioCli(st,c).total : 0; }
function descTxt(d){ return d.tipo==='pct' ? `${d.valor}%` : d.tipo==='monto' ? `${S(d.valor)} menos` : `${d.valor} ${d.valor===1?'mes':'meses'} gratis`; }
function durTxt(c){ return c.duracion==='una' ? 'el primer cobro' : c.duracion==='siempre' ? 'para siempre' : `${c.meses} ${c.meses===1?'mes':'meses'}`; }

window.VK_SAAS = { migrar, CSS_ALL:CSS, CSS_BASE:CSS.slice(CSS.indexOf('*{box-sizing:border-box}')), LEGAL, SITIO, INTEG_L:{ zapier:'Zapier', make:'Make', sheets:'Google Sheets', calendar:'Google Calendar', meta:'Meta (Facebook e Instagram)', resenas:'Reseñas de Google', webhooks:'Webhooks' }, semilla, precioCli, planDe, cuotasCli, modsCli, creditosCli, descTxt, durTxt, S, addD, addM, HOY, fF, fC, fTs, dias, uid, ESTADOS };
/* =================================================================== */
window.SAAS_MOUNT = async function(host, O){
  O = O || {};
  const root = host.shadowRoot || host.attachShadow({ mode:'open' });
  const tema = () => { const t = document.documentElement.getAttribute('data-theme'); if(t) host.setAttribute('data-theme', t); else host.removeAttribute('data-theme'); };
  tema(); new MutationObserver(tema).observe(document.documentElement, { attributes:true, attributeFilter:['data-theme'] });
  root.innerHTML = `<style>${CSS}</style><div class="sp"><div class="pin"><p class="sub">Cargando el panel…</p></div></div>`;
  const toast = O.toast || (m=>console.log(m));
  const DOC = O.db ? O.db.collection('vk_plataforma').doc('demo') : null;

  /* ---- carga y guardado ---- */
  let st = null;
  try{ if(DOC){ const s = await DOC.get(); if(s.exists){ const d = s.data(); st = d && d.json ? JSON.parse(d.json) : null; } } }catch(err){ console.warn('panel: sin base', err); }
  if(!st){ try{ const v = sessionStorage.getItem('vk_plataforma_demo'); if(v) st = JSON.parse(v); }catch(err){} }
  if(!st || st.v!==2) st = semilla(O);
  migrar(st);
  // Vitta Kleanly siempre refleja sus empresas reales
  const vk = st.clientes.find(c=>c.real); if(vk && O.empresas && O.empresas.length) vk.empresas = O.empresas.slice();
  let tGuardar = null;
  const guardarYa = async () => { clearTimeout(tGuardar);
    st.auditoria = st.auditoria.slice(0,250); st.clientes.forEach(c=>{ c.timeline = (c.timeline||[]).slice(0,40); });
    const json = JSON.stringify(st);
    try{ sessionStorage.setItem('vk_plataforma_demo', json); }catch(err){}
    if(DOC){ try{ await DOC.set({ json, actualizado:ahora() }); }catch(err){ console.warn('panel: no se pudo guardar', err); } }
  };
  const guardar = () => { clearTimeout(tGuardar); tGuardar = setTimeout(guardarYa, 500); };

  /* ---- estado de la vista ---- */
  const V = { tab:'inicio', yo:'s1', sel:null, q:'', fe:'todos', fp:'todos', ff:'todas', fa:'todos', aq:'', planDraft:null, preview:false, modal:null };
  const yo = () => st.staff.find(s=>s.id===V.yo) || st.staff[0];
  const rol = () => st.roles[yo().rol] || st.roles.lectura;
  const can = p => !!(rol().fijo || rol().permisos[p]);
  const guard = p => { if(can(p)) return true; toast(`Tu rol (${rol().l}) no permite: ${PL[p].toLowerCase()}.`); return false; };
  const dis = p => can(p) ? '' : `aria-disabled="true" title="Tu rol no permite: ${e(PL[p].toLowerCase())}"`;
  const money = n => can('ver_ingresos') ? S(n) : '<span class="sub" title="Tu rol no ve montos">•••</span>';
  const audit = (accion, cli, det) => { st.auditoria.unshift({ ts:ahora(), quien:yo().nombre, rol:yo().rol, accion, cli:cli||null, det:det||'' }); };
  const tl = (c, t) => { c.timeline = c.timeline || []; c.timeline.unshift({ ts:ahora(), t:`${t} · ${yo().nombre}` }); };
  const cli = id => st.clientes.find(c=>c.id===id);
  const pill = c => { const x = ESTADOS[c.estado]||[c.estado,'']; let s = x[0]; if(c.estado==='prueba' && c.pruebaFin){ const d = dias(HOY(), c.pruebaFin); s += d<=0 ? ' · vence hoy' : ` · ${d} d`; } return `<span class="pill ${x[1]}">${e(s)}</span>`; };
  const salud = n => { const c = n>=70 ? 'var(--ok)' : n>=40 ? 'var(--warn)' : 'var(--bad)'; return `<span class="hb" title="Salud ${n}/100"><i><u style="width:${n}%;background:${c}"></u></i><b class="num">${n}</b></span>`; };
  const INTEG = { zapier:'Zapier', make:'Make', sheets:'Google Sheets', calendar:'Google Calendar', meta:'Meta (Facebook e Instagram)', resenas:'Reseñas de Google', webhooks:'Webhooks' };
  const barra = (l, u, q) => { if(!q) return `<div class="ub"><div><span>${l}</span><b class="num">${(u||0).toLocaleString('es-PE')}</b></div></div>`; const pct = Math.min(100, Math.round((u||0)/q*100)); return `<div class="ub ${pct>=100?'r':pct>=80?'w':''}"><div><span>${l}</span><b class="num">${(u||0).toLocaleString('es-PE')} / ${q.toLocaleString('es-PE')}</b></div><i><u style="width:${pct}%"></u></i></div>`; };
  const legalVer = () => (st.legal.docs.find(d=>d.id==='tos')||{}).version;
  const cerca = c => { const q = cuotasCli(st,c), x = c.consumo||{}; return ['activa','morosa'].includes(c.estado) && ((q.wa && x.wa/q.wa>=.8) || (q.sunat && x.sunat/q.sunat>=.8) || (q.api && x.apiHoy/q.api>=.8)); };
  const costoCli = c => { const C = st.costos, x = c.consumo||{}, m = modsCli(st,c); if(['cancelada','suspendida'].includes(c.estado)) return 0; return r2((m.has('sunat') && x.sunat ? C.sunatRuc : 0) + (x.wa||0)*C.waUtil + C.infra); };

  /* ---- métricas ---- */
  const met = () => {
    const T = HOY(), C = st.clientes;
    const mrr = r2(C.reduce((s,c)=>s+mrrCli(st,c),0));
    const pago = C.filter(c=>CUENTA_MRR.includes(c.estado) && precioCli(st,c).total>0);
    const pruebas = C.filter(c=>c.estado==='prueba');
    const vencen = pruebas.filter(c=>c.pruebaFin && dias(T,c.pruebaFin)<=3);
    const bajas90 = C.filter(c=>c.estado==='cancelada' && c.cancelada && dias(c.cancelada,T)<=90);
    const riesgo = C.filter(c=>['activa','morosa'].includes(c.estado) && c.salud<40 && !c.real);
    const prev = st.hist.length ? st.hist[st.hist.length-1].mrr : mrr;
    return { mrr, arr:r2(mrr*12), pago, pruebas, vencen, bajas90, riesgo, prev, arpa: pago.length ? r2(mrr/pago.length) : 0,
      morosas:C.filter(c=>c.estado==='morosa'), restr:C.filter(c=>['restringida','suspendida'].includes(c.estado)),
      conv: st.embudo.registros ? Math.round(st.embudo.pagaron/st.embudo.registros*100) : 0,
      churn: (pago.length+bajas90.length) ? Math.round(bajas90.length/(pago.length+bajas90.length)*100) : 0,
      aprob: st.aprobaciones.filter(a=>a.estado==='pendiente') };
  };

  /* =================== vistas =================== */
  const kp = (l, v, s, cls) => `<div class="kp"><span>${l}</span><b>${v}</b>${s?`<small class="${cls||''}">${s}</small>`:''}</div>`;

  function vInicio(){
    const m = met(), dlt = m.prev ? Math.round((m.mrr-m.prev)/m.prev*100) : 0;
    const hist = [...st.hist.slice(-5), { mes:HOY().slice(0,7), mrr:m.mrr, cur:true }];
    const mx = Math.max(1, ...hist.map(h=>h.mrr));
    const alerts = [];
    m.aprob.forEach(a=>{ const c = cli(a.cliente); alerts.push(`<div class="al" style="--c:var(--vio-ink)"><div><b>Aprobación pendiente: ${e(descTxt(a.desc))}${a.desc.tipo!=='meses'?` ${a.desc.meses?`por ${a.desc.meses} meses`:'para siempre'}`:''} para ${e(c?c.nombre:'')}</b><small>Pedido por ${e(a.pedidoPor)} · ${e(a.motivo)}</small></div>${rol().fijo ? `<button class="btn s p" data-a="apr-ok" data-id="${a.id}">Aprobar</button><button class="btn s" data-a="apr-no" data-id="${a.id}">Rechazar</button>` : '<span class="pill v">Espera al propietario</span>'}</div>`); });
    m.vencen.forEach(c=>alerts.push(`<div class="al" style="--c:var(--pri)"><div><b>${e(c.nombre)}: la prueba vence ${dias(HOY(),c.pruebaFin)<=0?'hoy':`en ${dias(HOY(),c.pruebaFin)} ${dias(HOY(),c.pruebaFin)===1?'día':'días'}`}</b><small>${c.servicios ? `Ya registró ${c.servicios} servicios: buen momento para ofrecerle un plan.` : 'Casi no lo ha usado: llámalo antes de que venza.'}</small></div><button class="btn s" data-a="ver" data-id="${c.id}">Ver</button></div>`));
    m.morosas.forEach(c=>alerts.push(`<div class="al" style="--c:var(--warn)"><div><b>${e(c.nombre)}: cobro rechazado</b><small>Reintento ${c.intentos||1} de 3 · le quedan ${Math.max(0, st.reglas.gracia - dias(c.fallo||HOY(), HOY()))} días de gracia antes de pasar a solo lectura.</small></div><button class="btn s" data-a="ver" data-id="${c.id}">Ver</button></div>`));
    st.sistema.incidentes.filter(i=>i.estado!=='resuelto').forEach(i=>alerts.push(`<div class="al" style="--c:var(--warn)"><div><b>Incidente activo: ${e(i.titulo)}</b><small>${e(i.updates[i.updates.length-1].t)}</small></div><button class="btn s" data-a="tab" data-id="sistema">Ver</button></div>`));
    st.clientes.filter(cerca).forEach(c=>alerts.push(`<div class="al" style="--c:var(--ok)"><div><b>${e(c.nombre)} está cerca del límite de su plan</b><small>Buena oportunidad para ofrecerle subir de plan o un paquete de créditos.</small></div><button class="btn s" data-a="ver" data-id="${c.id}">Ver</button></div>`));
    st.clientes.filter(c=>c.webhook && !c.webhook.ok && c.estado!=='cancelada').forEach(c=>alerts.push(`<div class="al" style="--c:var(--bad)"><div><b>${e(c.nombre)}: su webhook está fallando</b><small>${c.webhook.fallas} entregas fallidas. Su integración con otro sistema no está recibiendo datos.</small></div><button class="btn s" data-a="tab" data-id="integ">Ver</button></div>`));
    m.riesgo.forEach(c=>alerts.push(`<div class="al" style="--c:var(--bad)"><div><b>${e(c.nombre)} en riesgo de irse</b><small>Salud ${c.salud}/100 · último acceso: ${e(c.ultimo)} · ${c.servicios} servicios este mes.</small></div><button class="btn s" data-a="ver" data-id="${c.id}">Ver</button></div>`));
    const E = st.embudo, fw = n => Math.max(4, Math.round(n/Math.max(1,E.registros)*100));
    const mv = st.movimientos;
    return `<div class="kps">
      ${kp('Ingreso mensual (MRR)', money(m.mrr), can('ver_ingresos') ? `${dlt>=0?'▲':'▼'} ${Math.abs(dlt)}% vs. mes pasado · ${S(r2(m.mrr/1.18))} sin IGV` : 'Tu rol no ve montos', dlt>=0?'up':'dn')}
      ${kp('Ingreso anual (ARR)', money(m.arr), 'MRR × 12')}
      ${kp('Clientes que pagan', m.pago.length, `${st.clientes.filter(c=>c.estado!=='cancelada').length} cuentas vivas`)}
      ${kp('En prueba', m.pruebas.length, m.vencen.length ? `${m.vencen.length} vence${m.vencen.length===1?'':'n'} en 3 días` : 'Ninguna vence pronto')}
      ${kp('Prueba → pago', m.conv+'%', 'Últimos 90 días')}
      ${kp('Bajas (90 días)', m.churn+'%', `${m.bajas90.length} ${m.bajas90.length===1?'cliente':'clientes'}`, m.churn>8?'dn':'')}
      ${kp('Ingreso por cliente', money(m.arpa), 'Promedio mensual')}
    </div>
    <div class="grid g2">
      <div class="card"><div class="ch"><div><h2>Ingreso mensual recurrente</h2><p>Últimos 6 meses · con IGV</p></div><span class="pill v">Meses anteriores de ejemplo</span></div>
        ${can('ver_ingresos') ? `<div class="bars" role="img" aria-label="MRR de los últimos 6 meses">${hist.map(h=>`<div class="bar ${h.cur?'cur':''}"><b>${S(Math.round(h.mrr))}</b><u style="height:${Math.max(4,h.mrr/mx*120)}px"></u><small>${MES[+h.mes.slice(5)-1]}</small></div>`).join('')}</div>
        <div class="mv"><div><span>Nuevos</span><b style="color:var(--ok-ink)">+${S(mv.nuevo)}</b></div><div><span>Suben de plan</span><b style="color:var(--ok-ink)">+${S(mv.expansion)}</b></div><div><span>Bajan de plan</span><b>−${S(mv.contraccion)}</b></div><div><span>Se fueron</span><b style="color:var(--bad-ink)">−${S(mv.perdida)}</b></div></div>` : '<p class="note">Tu rol no ve montos.</p>'}
      </div>
      <div class="card"><div class="ch"><div><h2>Embudo de la prueba gratis</h2><p>Últimos 90 días · ${st.reglas.prueba} días con todo abierto</p></div></div>
        <div class="funnel">
          <div><span>Se registraron</span><i><u style="width:${fw(E.registros)}%"></u></i><b>${E.registros}</b></div>
          <div><span>Activaron</span><i><u style="width:${fw(E.activaron)}%"></u></i><b>${E.activaron} · ${Math.round(E.activaron/E.registros*100)}%</b></div>
          <div><span>Pagaron</span><i><u style="width:${fw(E.pagaron)}%"></u></i><b>${E.pagaron} · ${Math.round(E.pagaron/E.registros*100)}%</b></div>
        </div>
        <p class="note" style="margin-top:12px"><b>Activar</b> = registró su primera cotización y su primer servicio. Quien activa en la primera semana tiene muchas más probabilidades de pagar: ahí conviene enfocar las llamadas del equipo.</p>
      </div>
    </div>
    <div class="card"><div class="ch"><div><h2>Para atender hoy</h2><p>Aprobaciones, pruebas por vencer, cobros fallidos y clientes en riesgo</p></div></div>
      <div class="alerts">${alerts.join('') || '<p class="vac">Todo al día.</p>'}</div></div>`;
  }

  function vClientes(){
    if(!can('ver_clientes')) return `<div class="card"><p class="note">Tu rol no puede ver clientes.</p></div>`;
    const cnt = k => st.clientes.filter(c=>k==='todos' || c.estado===k).length;
    const q = V.q.toLowerCase();
    const vis = st.clientes.filter(c=>(V.fe==='todos' || c.estado===V.fe) && (V.fp==='todos' || c.plan===V.fp) && (!q || [c.nombre,c.titular,c.correo,c.rubro,c.ciudad].join(' ').toLowerCase().includes(q)));
    const sel = cli(V.sel);
    const tabla = `<div class="card"><div class="ch"><div class="row" style="flex:1"><input type="search" data-f="q" value="${e(V.q)}" placeholder="Buscar empresa, titular, correo o rubro" style="max-width:340px" aria-label="Buscar cliente">
        <select data-f="fp" style="width:auto" aria-label="Plan"><option value="todos">Todos los planes</option>${st.planes.map(p=>`<option value="${p.id}" ${V.fp===p.id?'selected':''}>${e(p.nombre)}</option>`).join('')}</select></div>
        <button class="btn" data-a="cli-new" ${dis('cambiar_plan')}>+ Crear cuenta</button></div>
      <div class="chips" style="margin-bottom:10px" role="group" aria-label="Estado">${[['todos','Todos'],...Object.entries(ESTADOS).map(([k,v])=>[k,v[0]])].map(([k,l])=>`<button class="chip" data-a="fe" data-id="${k}" aria-pressed="${V.fe===k}">${l} <i>${cnt(k)}</i></button>`).join('')}</div>
      <div class="tw"><table class="rs"><thead><tr><th>Cliente</th><th>Plan</th><th>Estado</th><th class="r">Mensual</th><th>Usuarios</th><th>Salud</th><th>Próximo cobro</th></tr></thead><tbody>
      ${vis.length ? vis.map(c=>{ const p = planDe(st,c.plan), pr = precioCli(st,c); return `<tr class="clk ${V.sel===c.id?'sel':''}" tabindex="0" data-a="ver" data-id="${c.id}">
        <td class="nl"><div class="who2"><span class="av ${c.real?'real':''}">${e(ini(c.nombre))}</span><div><b>${e(c.nombre)}${c.real?' <span class="pill ok">Real</span>':''}</b><small>${e(c.titular)} · ${e(c.rubro)}</small></div></div></td>
        <td data-l="Plan" class="nw">${e(p.nombre)}${c.estado!=='prueba'?`<br><small class="sub">${c.ciclo}</small>`:''}</td><td data-l="Estado">${pill(c)}</td>
        <td data-l="Mensual" class="r num">${c.estado==='prueba'||c.estado==='cancelada' ? '<span class="sub">—</span>' : money(pr.total)}${pr.lineas.length && c.estado!=='cancelada' ? ' <span class="pill in" title="Tiene descuento">%</span>' : ''}</td>
        <td data-l="Usuarios" class="num">${c.usuarios} / ${p.usuarios}${c.usuarios>p.usuarios?` <span class="pill wa">+${c.usuarios-p.usuarios}</span>`:''}</td>
        <td data-l="Salud">${c.estado==='cancelada' ? '<span class="sub">—</span>' : salud(c.salud)}</td>
        <td data-l="Próximo cobro" class="num">${c.estado==='prueba' ? `Fin de prueba ${fC(c.pruebaFin)}` : c.estado==='cancelada' ? `Canceló ${fC(c.cancelada)}` : c.estado==='pausada' ? `Vuelve ${fC(c.pausaHasta)}` : fC(c.prox)}</td></tr>`; }).join('') : '<tr><td colspan="7" class="vac">Ningún cliente coincide.</td></tr>'}
      </tbody></table></div></div>`;
    return `<div class="cl ${sel?'open':''}"><div>${tabla}</div>${sel ? `<aside class="dr" aria-label="Detalle del cliente">${vDetalle(sel)}</aside>` : ''}</div>`;
  }

  function vDetalle(c){
    const p = planDe(st,c.plan), pr = precioCli(st,c), viva = c.estado!=='cancelada';
    const mc = modsCli(st,c), modsPlan = st.modulos.filter(m=>mc.has(m.id) && !(c.modulosExtra||[]).some(x=>x.id===m.id));
    const extra = (c.modulosExtra||[]).filter(x=>!x.hasta || x.hasta>=HOY());
    const q = cuotasCli(st,c), con = c.consumo||{}, cr = creditosCli(st,c);
    const ads = st.addons.filter(a=>!a.auto && !a.unico);
    const acciones = [];
    if(c.estado==='prueba') acciones.push(`<button class="btn s" data-a="trial" data-id="7" ${dis('extender_prueba')}>Extender prueba 7 días</button>`, `<button class="btn s" data-a="trial" data-id="14" ${dis('extender_prueba')}>+14 días</button>`, `<button class="btn s p" data-a="activar" ${dis('cambiar_plan')}>Activar plan (ya pagó)</button>`);
    if(['morosa','restringida'].includes(c.estado)) acciones.push(`<button class="btn s" data-a="link">Enviar enlace de pago</button>`, `<button class="btn s p" data-a="pago-manual" ${dis('pagos')}>Registrar pago</button>`);
    if(c.estado==='pausada') acciones.push(`<button class="btn s p" data-a="reanudar" ${dis('suspender')}>Reanudar ahora</button>`);
    if(c.estado==='suspendida') acciones.push(`<button class="btn s p" data-a="reactivar" ${dis('suspender')}>Reactivar cuenta</button>`);
    if(c.estado==='cancelada') acciones.push(`<button class="btn s p" data-a="recuperar" ${dis('cambiar_plan')}>Recuperar cliente</button>`);
    if(['activa','morosa','restringida','prueba'].includes(c.estado) && !c.real) acciones.push(`<button class="btn s d" data-a="suspender" ${dis('suspender')}>Suspender</button>`);
    if(['activa','morosa','restringida','pausada'].includes(c.estado) && !c.real) acciones.push(`<button class="btn s d" data-a="cancelar" ${dis('suspender')}>Cancelar suscripción</button>`);
    return `<div class="card">
      <div class="dh"><div><h3>${e(c.nombre)}</h3><p class="sub">${e(c.titular)} · ${e(c.correo)}${c.cel&&c.cel!=='—'?` · ${e(c.cel)}`:''}</p></div><button class="btn g s" data-a="cerrar" aria-label="Cerrar detalle">✕</button></div>
      <div class="row" style="margin:8px 0 12px">${pill(c)}${c.real?'<span class="pill ok">Cliente cero · datos reales</span>':''}${c.motivoEstado?`<span class="sub">${e(c.motivoEstado)}</span>`:''}</div>
      <dl class="dl"><div><dt>Cliente desde</dt><dd>${fF(c.alta)}</dd></div><div><dt>Rubro · ciudad</dt><dd>${e(c.rubro)} · ${e(c.ciudad)}</dd></div>
        <div><dt>Servicios del mes</dt><dd class="num">${c.servicios}</dd></div><div><dt>Último acceso</dt><dd>${e(c.ultimo)}</dd></div>
        <div><dt>Salud</dt><dd>${viva?salud(c.salud):'—'}</dd></div><div><dt>Método de pago</dt><dd>${e(c.metodo)}</dd></div></dl>
      ${acciones.length ? `<div class="row" style="margin-top:12px">${acciones.join('')}</div>` : ''}
      <div class="row" style="margin-top:8px"><button class="btn s" data-a="soporte" ${dis('soporte')}>Entrar como soporte</button></div>
    </div>
    <div class="card"><p class="sec">Suscripción</p>
      <div class="fr"><div class="f"><label for="dPlan">Plan</label><select id="dPlan" data-f="cli-plan" ${can('cambiar_plan')&&viva?'':'disabled'}>${st.planes.map(x=>`<option value="${x.id}" ${x.id===c.plan?'selected':''}>${e(x.nombre)} · ${S(x.mensual)}</option>`).join('')}</select></div>
        <div class="f"><label for="dCiclo">Ciclo</label><select id="dCiclo" data-f="cli-ciclo" ${can('cambiar_plan')&&viva&&c.estado!=='prueba'?'':'disabled'}><option value="mensual" ${c.ciclo==='mensual'?'selected':''}>Mensual</option><option value="anual" ${c.ciclo==='anual'?'selected':''}>Anual (${st.reglas.mesesAnual} meses)</option></select></div></div>
      ${can('ver_ingresos') ? `<div class="calc" style="margin-top:10px">
        <div><span>Plan ${e(p.nombre)}${c.precioFijo!=null?' (precio respetado)':''}${c.ciclo==='anual'?' · anual ÷ 12':''}</span><b class="num">${S(pr.base)}</b></div>
        ${pr.xu ? `<div><span>${pr.xu} ${pr.xu===1?'usuario adicional':'usuarios adicionales'} × ${S((st.addons.find(a=>a.id==='usuario')||{}).precio)}</span><b class="num">${S(pr.xu*(st.addons.find(a=>a.id==='usuario')||{}).precio)}</b></div>` : ''}
        ${pr.xe ? `<div><span>${pr.xe} ${pr.xe===1?'empresa adicional':'empresas adicionales'}</span><b class="num">${S(pr.xe*(st.addons.find(a=>a.id==='empresa')||{}).precio)}</b></div>` : ''}
        ${pr.adl.map(a=>`<div><span>${e(a.l)}</span><b class="num">${S(a.precio)}</b></div>`).join('')}
        ${pr.lineas.map(l=>`<div class="neg"><span>${e(l.d.nombre)} (${descTxt(l.d)})</span><b class="num">−${S(l.m)}</b></div>`).join('')}
        <div class="t"><span>${c.estado==='prueba'?'Pagaría al terminar la prueba':'Paga al mes (con IGV)'}</span><b class="num">${S(pr.total)}</b></div>
        <div class="sub"><span>Sin IGV</span><span class="num">${S(r2(pr.total/1.18))}</span></div></div>` : ''}
      <div class="row" style="margin-top:10px">${c.precioFijo!=null ? `<span class="pill v">Precio respetado: ${S(c.precioFijo)}</span><button class="btn s g" data-a="fijo-quitar" ${dis('precios')}>Usar precio actual</button>` : ''}</div>
    </div>
    ${viva ? `<div class="card"><p class="sec">Consumo del mes</p>
      <div class="grid" style="gap:10px">${barra('WhatsApp automáticos', con.wa||0, q.wa)}${q.sunat ? barra('Comprobantes SUNAT', con.sunat||0, q.sunat) : '<p class="sub">SUNAT no está en su plan (complemento disponible).</p>'}${barra('API · llamadas hoy', con.apiHoy||0, q.api)}</div>
      <div class="calc" style="margin-top:10px"><div><span>Créditos del plan</span><b class="num">${cr.plan}</b></div><div><span>Créditos comprados o regalados</span><b class="num">${cr.extra}</b></div><div><span>Usados este mes</span><b class="num">−${cr.usados}</b></div><div class="t"><span>Saldo de créditos</span><b class="num">${cr.saldo}</b></div></div>
      <div class="row" style="margin-top:8px"><button class="btn s" data-a="cred-regalo" ${dis('descuentos')}>+ Regalar créditos</button></div>
      <p class="sec" style="margin-top:14px">Complementos</p>
      <ul class="lst">${ads.map(a=>{ const inc = planDe(st,c.plan).modulos.includes(a.modulo); const ok = !a.planes || a.planes.includes(c.plan); const on = (c.addons||[]).includes(a.id); return `<li><div><b>${e(a.l)}</b><small>${inc ? 'Incluido en su plan' : ok ? `${S(a.precio)} ${e(a.unidad)}` : `Solo para el plan ${a.planes.map(id=>planDe(st,id).nombre).join(', ')}`}</small></div>${inc ? '<span class="pill ok">Incluido</span>' : ok ? `<button class="btn s ${on?'':'p'}" data-a="addon" data-id="${a.id}" ${dis('cambiar_plan')}>${on?'Quitar':'Activar'}</button>` : '<span class="pill">No aplica</span>'}</li>`; }).join('')}</ul>
      <p class="sec" style="margin-top:14px">Integraciones, sitio y seguridad</p>
      <div class="mods">${(c.integraciones||[]).map(i=>`<span class="pill in">${e(INTEG[i]||i)}</span>`).join('') || '<span class="sub">Sin integraciones</span>'}</div>
      <dl class="dl" style="margin-top:10px"><div><dt>Sitio web</dt><dd>${c.sitio && c.sitio.publicado ? e(c.sitio.dominio || (c.sitio.slug+'.vittkly.com')) : 'Sin publicar'}</dd></div><div><dt>Reservas online (mes)</dt><dd class="num">${(c.sitio&&c.sitio.reservas)||0}</dd></div>
        <div><dt>Webhook</dt><dd>${c.webhook ? (c.webhook.ok ? '<span class="pill ok">OK</span>' : `<span class="pill r">${c.webhook.fallas} fallas</span>`) : '—'}</dd></div><div><dt>Verificación en 2 pasos</dt><dd>${c.mfa ? '<span class="pill ok">Activa</span>' : '<span class="pill wa">No activa</span>'}</dd></div>
        <div><dt>Términos aceptados</dt><dd>${c.legal && c.legal.aceptado && c.legal.version===legalVer() ? `v${e(c.legal.version)}` : '<span class="pill wa">Pendiente</span>'}</dd></div><div><dt>Soporte</dt><dd>${e((st.soporteNiveles[q.soporte]||{}).l||'—')}</dd></div></dl>
    </div>` : ''}
    <div class="card"><div class="dh"><p class="sec">Descuentos</p>${viva?`<button class="btn s" data-a="desc" ${dis('descuentos')}>+ Aplicar descuento</button>`:''}</div>
      ${(c.descuentos||[]).length ? `<ul class="lst">${c.descuentos.map(d=>`<li><div><b>${e(d.nombre)}</b> <span class="pill ${descVigente(d)?'in':''}">${descTxt(d)}</span><small>${d.cupon?`Cupón <code class="cd">${e(d.cupon)}</code> · `:''}${d.hasta ? (descVigente(d)?`Hasta ${fF(d.hasta)}`:`Venció ${fF(d.hasta)}`) : 'Sin vencimiento'} · por ${e(d.por)}</small></div>${can('descuentos')&&!c.real?`<button class="btn s g" data-a="desc-del" data-id="${d.id}" aria-label="Quitar descuento">Quitar</button>`:''}</li>`).join('')}</ul>` : '<p class="sub">Sin descuentos.</p>'}
      ${st.aprobaciones.filter(a=>a.cliente===c.id && a.estado==='pendiente').map(a=>`<p class="note wa" style="margin-top:8px"><b>Pendiente de aprobación:</b> ${e(descTxt(a.desc))}${a.desc.tipo!=='meses'?` ${a.desc.meses?`por ${a.desc.meses} meses`:'para siempre'}`:''}, pedido por ${e(a.pedidoPor)}.</p>`).join('')}
    </div>
    <div class="card"><div class="dh"><p class="sec">Módulos</p>${viva?`<button class="btn s" data-a="modx" ${dis('precios')}>+ Módulo de cortesía</button>`:''}</div>
      <div class="mods">${modsPlan.map(m=>`<span class="pill ${c.estado==='prueba'?'in':'ok'}">${e(m.l)}</span>`).join('')}${extra.map(x=>`<span class="pill v" title="Cortesía hasta ${fF(x.hasta)}">${e((st.modulos.find(m=>m.id===x.id)||{}).l)} · hasta ${fC(x.hasta)}</span>`).join('')}</div>
      ${c.estado==='prueba' ? `<p class="sub" style="margin-top:8px">En prueba tiene todos los módulos abiertos. Al pagar, queda con los de su plan.</p>` : ''}
    </div>
    <div class="card"><p class="sec">Notas internas</p>
      ${(c.notas||[]).length ? `<ul class="lst" style="margin-bottom:8px">${c.notas.map(n=>`<li><div>${e(n.t)}<small>${e(n.por)} · ${fTs(n.ts)}</small></div></li>`).join('')}</ul>` : ''}
      ${can('notas') ? `<div class="row"><input type="text" data-f="nota" placeholder="Solo la ve el equipo de Vittkly" aria-label="Nueva nota" style="flex:1"><button class="btn s" data-a="nota">Guardar</button></div>` : '<p class="sub">Tu rol no escribe notas.</p>'}
    </div>
    <div class="card"><p class="sec">Línea de tiempo</p><ul class="tl">${(c.timeline||[]).slice(0,12).map(x=>`<li><span>${fTs(x.ts)}</span><div>${e(x.t)}</div></li>`).join('')}</ul></div>`;
  }

  function vPlanes(){
    const P = V.planDraft || (V.planDraft = clone({ planes:st.planes, addons:st.addons }));
    const ed = can('precios'), dirty = JSON.stringify(P) !== JSON.stringify({ planes:st.planes, addons:st.addons });
    const inp = (pid, k, t, extra) => `<input type="${t||'number'}" data-f="pl" data-id="${pid}:${k}" value="${e(P.planes.find(x=>x.id===pid)[k])}" ${ed?'':'disabled'} ${extra||''}>`;
    const usan = pid => st.clientes.filter(c=>c.plan===pid && CUENTA_MRR.includes(c.estado)).length;
    return `${ed ? '' : '<p class="note wa">Tu rol puede ver los planes, pero no editarlos.</p>'}
    <div class="card"><div class="ch"><div><h2>Planes</h2><p>Precios con IGV. El anual se cobra por adelantado.</p></div>
      <div class="row"><button class="btn" data-a="preview">${V.preview?'Ocultar':'Ver'} página de precios</button>${dirty&&ed?`<button class="btn" data-a="pl-reset">Descartar</button><button class="btn p" data-a="pl-save">Guardar cambios</button>`:''}</div></div>
      <div class="plans">${P.planes.map(p=>`<div class="pc ${p.destacado?'dest':''}">${p.destacado?'<span class="tag">MÁS ELEGIDO</span>':''}
        <div class="fr"><div class="f"><label>Nombre</label>${inp(p.id,'nombre','text','maxlength="20"')}</div></div>
        <div class="f"><label>Frase</label>${inp(p.id,'lema','text','maxlength="70"')}</div>
        <div class="fr"><div class="f"><label>Mensual S/</label>${inp(p.id,'mensual','number','min="0" step="1"')}</div><div class="f"><label>Anual S/</label>${inp(p.id,'anual','number','min="0" step="1"')}<small>${p.mensual?`= ${(p.anual/p.mensual).toFixed(1)} meses`:''}</small></div></div>
        <div class="fr"><div class="f"><label>Usuarios incl.</label>${inp(p.id,'usuarios','number','min="1"')}</div><div class="f"><label>Empresas incl.</label>${inp(p.id,'empresas','number','min="1"')}</div></div>
        <div class="row"><label class="chk"><input type="checkbox" data-f="pl-dest" data-id="${p.id}" ${p.destacado?'checked':''} ${ed?'':'disabled'}> Destacar</label><label class="chk"><input type="checkbox" data-f="pl-act" data-id="${p.id}" ${p.activo?'checked':''} ${ed?'':'disabled'}> A la venta</label></div>
        <p class="sub">${usan(p.id)} ${usan(p.id)===1?'cliente paga':'clientes pagan'} este plan.</p></div>`).join('')}</div></div>
    ${V.preview ? `<div class="card"><div class="ch"><div><h2>Así se ve la página de precios</h2><p>Lo que verá quien se registra o elige plan al terminar la prueba</p></div></div>
      <div class="pub">${P.planes.filter(p=>p.activo).map(p=>`<div class="pp ${p.destacado?'dest':''}">${p.destacado?'<span class="pill in" style="align-self:flex-start">Más elegido</span>':''}<h4>${e(p.nombre)}</h4><p class="sub">${e(p.lema)}</p>
        <div class="pr">${S(p.mensual)} <small>/ mes</small></div><p class="sub">o ${S(p.anual)} al año (${Math.round(p.anual/p.mensual)} meses)</p>
        <ul><li>${p.usuarios} usuarios · ${p.empresas} ${p.empresas===1?'empresa':'empresas'}</li><li>Clientes, calendario, cotizaciones y trabajos</li><li>WhatsApp con un clic y correos ilimitados</li><li>${(p.cuotas||{}).wa||0} WhatsApp automáticos al mes</li>${(p.cuotas||{}).sunat ? `<li>${p.cuotas.sunat} comprobantes SUNAT al mes</li>` : '<li>SUNAT como complemento</li>'}${(p.cuotas||{}).creditos ? `<li>${p.cuotas.creditos} créditos al mes</li>` : ''}<li>${SITIO[(p.cuotas||{}).sitio]||''}</li>${st.modulos.filter(m=>p.modulos.includes(m.id)&&!m.base&&!['whatsapp','sitio','dominio','api','webhooks'].includes(m.id)).map(m=>`<li>${e(m.l)}</li>`).join('')}<li>API: ${((p.cuotas||{}).api||0).toLocaleString('es-PE')} llamadas al día${p.modulos.includes('webhooks')?' y webhooks':''}</li><li>Soporte: ${e((st.soporteNiveles[(p.cuotas||{}).soporte]||{}).l||'')}</li></ul>
        <span class="btn ${p.destacado?'p':''}" style="margin-top:auto">Empezar ${st.reglas.prueba} días gratis</span></div>`).join('')}</div></div>` : ''}
    <div class="card"><div class="ch"><div><h2>Módulos por plan</h2><p>Los 4 módulos base van en todos los planes. Durante la prueba se abren todos.</p></div></div>
      <div class="tw"><table class="mx"><thead><tr><th>Módulo</th>${P.planes.map(p=>`<th>${e(p.nombre)}</th>`).join('')}</tr></thead><tbody>
      ${st.modulos.map(m=>`<tr><td>${e(m.l)}${m.base?' <span class="pill">Base</span>':''}</td>${P.planes.map(p=>`<td><input type="checkbox" class="chk" style="width:18px;height:18px;accent-color:var(--pri)" data-f="pm" data-id="${m.id}:${p.id}" ${p.modulos.includes(m.id)?'checked':''} ${m.base||!ed?'disabled':''} aria-label="${e(m.l)} en ${e(p.nombre)}"></td>`).join('')}</tr>`).join('')}
      </tbody></table></div></div>
    <div class="card"><div class="ch"><div><h2>Cuotas incluidas por plan</h2><p>Lo que a Vittkly le cuesta por uso va incluido con un tope. Al pasarlo se descuentan créditos; el cliente nunca se queda sin servicio.</p></div></div>
      <div class="tw"><table class="mx"><thead><tr><th>Incluye al mes</th>${P.planes.map(p=>`<th>${e(p.nombre)}</th>`).join('')}</tr></thead><tbody>
      ${[['wa','WhatsApp automáticos','número'],['sunat','Comprobantes SUNAT (0 = complemento)','número'],['creditos','Créditos Vittkly','número'],['api','API: llamadas al día','número'],['videos','Videos y archivos de la Biblioteca (GB)','número'],['sitio','Sitio web','sitio'],['soporte','Soporte','soporte']].map(([k,l,t])=>`<tr><td>${l}</td>${P.planes.map(p=>`<td>${t==='número' ? `<input type="number" min="0" step="1" style="width:100px" data-f="pq" data-id="${p.id}:${k}" value="${(p.cuotas||{})[k]??0}" ${ed?'':'disabled'} aria-label="${e(l)} · ${e(p.nombre)}">` : t==='sitio' ? `<select data-f="pq" data-id="${p.id}:${k}" style="width:auto" ${ed?'':'disabled'}>${Object.entries(SITIO).map(([v,x])=>`<option value="${v}" ${(p.cuotas||{})[k]===v?'selected':''}>${x}</option>`).join('')}</select>` : `<select data-f="pq" data-id="${p.id}:${k}" style="width:auto" ${ed?'':'disabled'}>${Object.entries(st.soporteNiveles).map(([v,x])=>`<option value="${v}" ${(p.cuotas||{})[k]===v?'selected':''}>${e(x.l)}</option>`).join('')}</select>`}</td>`).join('')}</tr>`).join('')}
      <tr><td>WhatsApp con un clic y correos</td>${P.planes.map(()=>'<td><span class="pill ok">Ilimitado</span></td>').join('')}</tr>
      <tr><td>Cobro online con su propia pasarela</td>${P.planes.map(()=>'<td><span class="pill ok">Sin comisión de Vittkly</span></td>').join('')}</tr>
      </tbody></table></div></div>
    <div class="card"><div class="ch"><div><h2>Complementos</h2><p>Se suman a la mensualidad. Usuarios y empresas extra se cobran solos cuando el cliente pasa lo incluido.</p></div></div>
      <div class="tw"><table class="rs"><thead><tr><th>Complemento</th><th>Precio S/</th><th>Unidad</th><th>Para</th><th>Cobro</th></tr></thead><tbody>
      ${P.addons.map(a=>`<tr><td class="nl"><b>${e(a.l)}</b></td><td data-l="Precio S/"><input type="number" step="0.01" min="0" style="max-width:110px" data-f="ad" data-id="${a.id}" value="${a.precio}" ${ed?'':'disabled'}></td><td data-l="Unidad">${e(a.unidad)}</td><td data-l="Para">${a.planes ? a.planes.map(id=>planDe(st,id).nombre).join(', ') : 'Todos'}</td><td data-l="Cobro">${a.auto?'<span class="pill ok">Automático</span>':a.unico?'<span class="pill v">Recarga</span>':'<span class="pill in">Lo activa el cliente</span>'}</td></tr>`).join('')}
      </tbody></table></div></div>
    <div class="card"><div class="ch"><div><h2>Créditos Vittkly</h2><p>Un solo saldo para todo lo que tiene costo por uso. ${e(st.creditos.vencen)}</p></div></div>
      <div class="tw"><table class="rs"><thead><tr><th>Uso</th><th>Créditos</th></tr></thead><tbody>
      ${st.creditos.equiv.map(x=>`<tr><td class="nl">${e(x.l)}</td><td data-l="Créditos"><input type="number" min="0" step="1" style="width:90px" data-f="ceq" data-id="${x.id}" value="${x.c}" ${ed?'':'disabled'}></td></tr>`).join('')}
      </tbody></table></div>
      <p class="note" style="margin-top:10px">Ejemplo: una campaña de WhatsApp a 100 clientes usa ${100*((st.creditos.equiv.find(x=>x.id==='wa_mkt')||{}).c||0)} créditos. Con el plan Empresa (${(planDe(st,'empresa').cuotas||{}).creditos||0} créditos al mes) entra sin pagar nada extra.</p></div>`;
  }

  function vPromos(){
    const ed = can('campanas'), T = HOY();
    const canc = d => st.clientes.filter(c=>c.estado==='cancelada' && c.cancelada && dias(c.cancelada,T) >= (d||30));
    const cuponDe = cod => st.cupones.find(u=>u.codigo===cod);
    const estCamp = { activa:['Activa','ok'], programada:['Programada','in'], borrador:['Borrador',''], pausada:['Pausada','wa'], terminada:['Terminada',''] };
    const R = st.retencion;
    const motivos = {}; st.clientes.filter(c=>c.estado==='cancelada').forEach(c=>{ motivos[c.motivoCancel] = (motivos[c.motivoCancel]||0)+1; });
    return `<div class="card"><div class="ch"><div><h2>Campañas</h2><p>Descuentos por temporada, para clientes fundadores, para recuperar a quienes se fueron o para pasar al plan anual.</p></div>
        <div class="row">${['temporada','recuperacion','anual','referidos'].map(t=>`<button class="btn s" data-a="camp-new" data-id="${t}" ${dis('campanas')}>+ ${CAMP_T[t][0]}</button>`).join('')}</div></div>
      <div class="camps">${st.campanas.map(k=>{ const u = cuponDe(k.cupon), aud = k.tipo==='recuperacion' ? canc(k.diasMin).length : null; return `<div class="cp" style="--c:${CAMP_T[k.tipo][1]}">
        <div class="row" style="justify-content:space-between"><span class="pill">${CAMP_T[k.tipo][0]}</span><span class="pill ${estCamp[k.estado][1]}">${estCamp[k.estado][0]}</span></div>
        <h3>${e(k.nombre)}</h3><p>${u?`<code class="cd">${e(u.codigo)}</code> · ${descTxt(u)} · ${durTxt(u)}`:'Sin cupón'}<br>${fC(k.desde)} → ${k.hasta?fC(k.hasta):'sin fin'} · ${e(k.canal)}</p>
        <p>${e(k.audiencia)}${aud!=null?` · <b>${aud} ${aud===1?'cliente':'clientes'}</b> hoy`:''}</p>
        <div class="cps"><div><b>${k.enviados}</b><span>Enviados</span></div><div><b>${k.convertidos}</b><span>${k.tipo==='recuperacion'?'Volvieron':'Usaron'}</span></div><div><b>${can('ver_ingresos')?S(k.ingreso):'•••'}</b><span>Ingreso/mes</span></div></div>
        <div class="row">${k.estado==='borrador'||k.estado==='pausada' ? `<button class="btn s p" data-a="camp-go" data-id="${k.id}" ${dis('campanas')}>${k.estado==='pausada'?'Reanudar':k.desde>T?'Programar':'Lanzar'}</button>` : ''}${k.estado==='programada'?`<span class="sub">Empieza sola el ${fC(k.desde)}</span>`:''}${k.estado==='activa' ? `<button class="btn s" data-a="camp-pause" data-id="${k.id}" ${dis('campanas')}>Pausar</button>` : ''}${k.estado!=='terminada' ? `<button class="btn s g" data-a="camp-end" data-id="${k.id}" ${dis('campanas')}>Terminar</button>` : ''}</div></div>`; }).join('')}</div></div>
    <div class="card"><div class="ch"><div><h2>Cupones</h2><p>Códigos que el cliente escribe al pagar, o que el equipo aplica desde la ficha del cliente.</p></div><button class="btn p" data-a="cup-new" ${dis('campanas')}>+ Nuevo cupón</button></div>
      <div class="tw"><table class="rs"><thead><tr><th>Código</th><th>Descuento</th><th>Para</th><th>Vigencia</th><th>Usos</th><th></th></tr></thead><tbody>
      ${st.cupones.map(u=>{ const venc = u.hasta && u.hasta < T, prox = u.desde > T; return `<tr><td class="nl"><code class="cd">${e(u.codigo)}</code><br><small class="sub">${e(u.nombre)}</small></td>
        <td data-l="Descuento">${descTxt(u)} · ${durTxt(u)}${u.planes.length?`<br><small class="sub">Solo ${u.planes.map(id=>planDe(st,id).nombre).join(', ')}</small>`:''}</td>
        <td data-l="Para">${e(SEGMENTO[u.segmento])}${u.ciclo!=='todos'?` · ${u.ciclo}`:''}</td>
        <td data-l="Vigencia" class="num">${fC(u.desde)} → ${u.hasta?fC(u.hasta):'sin fin'}</td>
        <td data-l="Usos" class="num">${u.usos}${u.max?` / ${u.max}`:''}</td>
        <td data-l="Estado"><div class="row" style="justify-content:flex-end">${!u.activo?'<span class="pill">Desactivado</span>':venc?'<span class="pill">Vencido</span>':prox?'<span class="pill in">Programado</span>':'<span class="pill ok">Vigente</span>'}
          <button class="btn s g" data-a="cup-edit" data-id="${u.id}" ${dis('campanas')}>Editar</button><button class="btn s g" data-a="cup-tog" data-id="${u.id}" ${dis('campanas')}>${u.activo?'Desactivar':'Activar'}</button></div></td></tr>`; }).join('')}
      </tbody></table></div></div>
    <div class="grid g2">
      <div class="card"><div class="ch"><div><h2>Oferta al intentar cancelar</h2><p>Antes de cancelar, el cliente responde por qué se va y ve estas opciones.</p></div><label class="chk"><input type="checkbox" data-f="ret" data-id="activa" ${R.activa?'checked':''} ${ed?'':'disabled'}> Activa</label></div>
        <div class="fr"><div class="f"><label>Pausa de hasta (meses)</label><input type="number" min="0" max="6" data-f="ret" data-id="pausaMeses" value="${R.pausaMeses}" ${ed?'':'disabled'}><small>0 = sin opción de pausa</small></div>
          <div class="f"><label>Cupón para quedarse</label><select data-f="ret" data-id="cupon" ${ed?'':'disabled'}><option value="">Sin descuento</option>${st.cupones.filter(u=>u.activo).map(u=>`<option value="${e(u.codigo)}" ${R.cupon===u.codigo?'selected':''}>${e(u.codigo)} · ${descTxt(u)}</option>`).join('')}</select></div></div>
        <label class="chk" style="margin-top:10px"><input type="checkbox" data-f="ret" data-id="bajarPlan" ${R.bajarPlan?'checked':''} ${ed?'':'disabled'}> Ofrecer pasar a un plan más barato</label>
        <p class="note ok" style="margin-top:12px"><b>${R.retenidos} de ${R.intentos}</b> clientes que intentaron cancelar este trimestre se quedaron gracias a la oferta.</p></div>
      <div class="card"><div class="ch"><div><h2>¿Por qué se van?</h2><p>Respuestas de la encuesta de cancelación</p></div></div>
        ${Object.keys(motivos).length ? `<ul class="lst">${Object.entries(motivos).sort((a,b)=>b[1]-a[1]).map(([m,n])=>`<li><span>${e(m)}</span><b class="num">${n}</b></li>`).join('')}</ul>` : '<p class="sub">Aún no hay cancelaciones.</p>'}
        <p class="sub" style="margin-top:10px">${canc(30).length} ${canc(30).length===1?'cliente canceló':'clientes cancelaron'} hace más de 30 días: son la audiencia de las campañas de recuperación.</p></div>
    </div>
    ${vReferidos()}`;
  }

  function vCobros(){
    const ed = can('reglas_cobro'), R = st.reglas, T = HOY(), mes = T.slice(0,7);
    const F = st.facturas.filter(f=>V.ff==='todas' || f.estado===V.ff);
    const cobrado = st.facturas.filter(f=>f.estado==='pagada' && f.fecha.slice(0,7)===mes).reduce((s,f)=>s+f.monto,0);
    const pend = st.facturas.filter(f=>['fallida','vencida'].includes(f.estado)).reduce((s,f)=>s+f.monto,0);
    const inp = (k,l,s,extra) => `<div class="f"><label>${l}</label><input type="${k==='reintentos'?'text':'number'}" data-f="rg" data-id="${k}" value="${e(R[k])}" ${ed?'':'disabled'} ${extra||'min="0"'}>${s?`<small>${s}</small>`:''}</div>`;
    const estF = { pagada:['Pagada','ok'], fallida:['Rechazada','wa'], vencida:['Vencida','r'], reembolsada:['Reembolsada','v'], pendiente:['Pendiente','in'] };
    return `<div class="kps">${kp('Cobrado este mes', money(r2(cobrado)))}${kp('Por cobrar (fallidos)', money(r2(pend)), `${st.facturas.filter(f=>['fallida','vencida'].includes(f.estado)).length} cobros`)}${kp('Pasarela', R.pasarela ? e(R.pasarela) : 'Sin conectar', R.manual ? 'Cobro manual activo: transferencia y Yape' : '')}</div>
    <div class="card"><div class="ch"><div><h2>Qué pasa si un cliente no paga</h2><p>Reglas para todos los clientes. Nunca se le quita el acceso a sus datos: siempre puede verlos y exportarlos.</p></div></div>
      <div class="life">
        <div class="lf" style="--c:var(--pri)"><b>Prueba</b><span>${R.prueba} días con todo abierto, sin tarjeta</span></div>
        <div class="lf" style="--c:var(--ok)"><b>Activa</b><span>Pagó: trabaja con los módulos de su plan</span></div>
        <div class="lf" style="--c:var(--warn)"><b>Pago fallido</b><span>Reintentos los días ${e(R.reintentos)} · ${R.gracia} días de gracia con todo funcionando</span></div>
        <div class="lf" style="--c:var(--bad)"><b>Solo lectura</b><span>${R.soloLectura} días: ve y exporta sus datos, no puede crear nada</span></div>
        <div class="lf" style="--c:var(--muted)"><b>Suspendida</b><span>Solo el titular entra a pagar o exportar · datos se borran ${R.borrado} días después de cancelar (aviso ${R.avisoBorrado} días antes)</span></div>
      </div>
      <div class="fr" style="margin-top:14px">${inp('prueba','Días de prueba')}${inp('reintentos','Reintentos de cobro (días)','Separados por comas')}${inp('gracia','Días de gracia')}${inp('soloLectura','Días en solo lectura')}${inp('borrado','Borrar datos tras cancelar (días)')}${inp('avisoBorrado','Aviso antes de borrar (días)')}${inp('mesesAnual','Meses que paga el plan anual','Ej.: 10 = 2 meses gratis','min="1" max="12"')}</div>
      <div class="fr" style="margin-top:10px"><div class="f"><label>Pasarela de pago</label><select data-f="rg" data-id="pasarela" ${ed?'':'disabled'}><option value="">Aún sin elegir</option>${['Culqi','Izipay','Mercado Pago','Niubiz','Openpay'].map(x=>`<option ${R.pasarela===x?'selected':''}>${x}</option>`).join('')}</select><small>Demostración: no se conecta de verdad.</small></div>
        <div class="f"><span class="lb">&nbsp;</span><label class="chk"><input type="checkbox" data-f="rg" data-id="manual" ${R.manual?'checked':''} ${ed?'':'disabled'}> Aceptar pagos manuales (transferencia o Yape)</label></div></div>
      ${ed?'':'<p class="sub" style="margin-top:8px">Tu rol puede ver las reglas, pero no cambiarlas.</p>'}</div>
    <div class="card"><div class="ch"><div><h2>Facturas de Vittkly a sus clientes</h2><p>Lo que Vittkly cobra a cada cliente. Las facturas o boletas SUNAT se emitirían con el RUC de Vittkly.</p></div>
      <div class="chips">${[['todas','Todas'],['pagada','Pagadas'],['fallida','Rechazadas'],['vencida','Vencidas'],['reembolsada','Reembolsadas']].map(([k,l])=>`<button class="chip" data-a="ff" data-id="${k}" aria-pressed="${V.ff===k}">${l}</button>`).join('')}</div></div>
      <div class="tw"><table class="rs"><thead><tr><th>N.°</th><th>Cliente</th><th>Fecha</th><th class="r">Monto</th><th>Método</th><th>Estado</th><th></th></tr></thead><tbody>
      ${F.length ? F.slice(0,40).map(f=>{ const c = cli(f.cliente)||{nombre:'—'}; return `<tr><td data-l="N.°" class="num">${e(f.numero)}</td><td data-l="Cliente">${e(c.nombre)}</td><td data-l="Fecha" class="num">${fC(f.fecha)}</td><td data-l="Monto" class="r num">${money(f.monto)}</td><td data-l="Método">${e(f.metodo)}</td>
        <td data-l="Estado"><span class="pill ${estF[f.estado][1]}">${estF[f.estado][0]}</span>${f.estado==='fallida'?` <small class="sub">intento ${f.intentos}/3</small>`:''}</td>
        <td data-l=""><div class="row" style="justify-content:flex-end">${['fallida','vencida'].includes(f.estado)?`<button class="btn s" data-a="f-retry" data-id="${f.id}" ${dis('pagos')}>Reintentar</button><button class="btn s" data-a="f-pagar" data-id="${f.id}" ${dis('pagos')}>Pago manual</button>`:''}${f.estado==='pagada'?`<button class="btn s g" data-a="f-reemb" data-id="${f.id}" ${dis('pagos')}>Reembolsar</button>`:''}</div></td></tr>`; }).join('') : '<tr><td colspan="7" class="vac">No hay facturas con ese estado.</td></tr>'}
      </tbody></table></div></div>`;
  }

  function vEquipo(){
    const ed = can('equipo');
    const roles = Object.entries(st.roles);
    return `<div class="card"><div class="ch"><div><h2>Equipo de Vittkly</h2><p>Personas que trabajan en la plataforma. Andree es real; el resto del equipo es de ejemplo.</p></div><button class="btn p" data-a="st-inv" ${dis('equipo')}>+ Invitar persona</button></div>
      <div class="tw"><table class="rs"><thead><tr><th>Persona</th><th>Rol</th><th>Verificación en 2 pasos</th><th>Último acceso</th><th></th></tr></thead><tbody>
      ${st.staff.map(s=>`<tr><td class="nl"><div class="who2"><span class="av ${s.real?'real':''}">${e(ini(s.nombre))}</span><div><b>${e(s.nombre)}${s.id===V.yo?' <span class="pill in">Tú</span>':''}</b><small>${e(s.correo)}${s.estado==='invitado'?' · invitación enviada':''}</small></div></div></td>
        <td data-l="Rol">${s.rol==='propietario' ? '<span class="pill v">Propietario</span>' : `<select data-f="st-rol" data-id="${s.id}" style="width:auto" ${ed&&s.estado!=='inactivo'?'':'disabled'} aria-label="Rol de ${e(s.nombre)}">${roles.filter(([k])=>k!=='propietario').map(([k,r])=>`<option value="${k}" ${s.rol===k?'selected':''}>${e(r.l)}</option>`).join('')}</select>`}</td>
        <td data-l="2 pasos">${s.mfa?'<span class="pill ok">Activa</span>':'<span class="pill r">Falta activar</span>'}</td>
        <td data-l="Último acceso">${s.estado==='inactivo'?'<span class="pill">Desactivado</span>':e(s.ultimo)}</td>
        <td data-l=""><div class="row" style="justify-content:flex-end">${s.rol!=='propietario' ? `${!s.mfa&&s.estado==='activo'?`<button class="btn s g" data-a="st-mfa" data-id="${s.id}" ${dis('equipo')}>Exigir 2 pasos</button>`:''}<button class="btn s ${s.estado==='inactivo'?'':'d'}" data-a="st-off" data-id="${s.id}" ${dis('equipo')}>${s.estado==='inactivo'?'Reactivar':'Quitar acceso'}</button>` : '<span class="lock">🔒 Dueño</span>'}</div></td></tr>`).join('')}
      </tbody></table></div>
      <p class="note" style="margin-top:12px"><b>Recomendado:</b> la verificación en 2 pasos debe ser obligatoria para todo el equipo, porque el staff puede ver datos de todos los clientes.</p></div>
    <div class="card"><div class="ch"><div><h2>Roles y permisos</h2><p>Qué puede hacer cada rol. El propietario siempre puede todo.</p></div></div>
      <div class="tw"><table class="mx"><thead><tr><th>Permiso</th>${roles.map(([,r])=>`<th>${e(r.l)}</th>`).join('')}</tr></thead><tbody>
      ${PERMISOS.map(([k,l])=>`<tr><td>${e(l)}</td>${roles.map(([rk,r])=>`<td><input type="checkbox" style="width:18px;height:18px;accent-color:var(--pri)" data-f="perm" data-id="${rk}:${k}" ${r.fijo||r.permisos[k]?'checked':''} ${r.fijo||!ed?'disabled':''} aria-label="${e(l)} · ${e(r.l)}"></td>`).join('')}</tr>`).join('')}
      <tr><td><b>Descuento máximo sin aprobación</b><br><small class="sub">Si pide más, le llega al propietario para aprobar</small></td>${roles.map(([rk,r])=>`<td>${r.fijo?'100%':`<input type="number" min="0" max="100" style="width:72px" data-f="dmax" data-id="${rk}" value="${r.descMax}" ${ed?'':'disabled'} aria-label="Descuento máximo ${e(r.l)}">%`}</td>`).join('')}</tr>
      </tbody></table></div></div>`;
  }

  function vAuditoria(){
    if(!can('auditoria')) return `<div class="card"><p class="note">Tu rol no puede ver la auditoría.</p></div>`;
    const q = V.aq.toLowerCase();
    const L = st.auditoria.filter(a=>(V.fa==='todos' || a.quien===V.fa) && (!q || [a.accion,a.det,(cli(a.cli)||{}).nombre].join(' ').toLowerCase().includes(q)));
    const quienes = [...new Set(st.auditoria.map(a=>a.quien))];
    return `<div class="card"><div class="ch"><div><h2>Auditoría</h2><p>Todo lo que hace el equipo de Vittkly queda registrado y no se puede borrar.</p></div>
      <div class="row"><input type="search" data-f="aq" value="${e(V.aq)}" placeholder="Buscar acción o cliente" style="width:220px" aria-label="Buscar en auditoría"><select data-f="fa" style="width:auto" aria-label="Persona"><option value="todos">Todas las personas</option>${quienes.map(x=>`<option ${V.fa===x?'selected':''}>${e(x)}</option>`).join('')}</select></div></div>
      <div class="tw"><table class="rs"><thead><tr><th>Cuándo</th><th>Quién</th><th>Acción</th><th>Cliente</th><th>Detalle</th></tr></thead><tbody>
      ${L.length ? L.slice(0,120).map(a=>`<tr><td data-l="Cuándo" class="num">${fTs(a.ts)}</td><td data-l="Quién">${e(a.quien)}${a.rol?` <small class="sub">· ${e((st.roles[a.rol]||{}).l||a.rol)}</small>`:''}</td><td data-l="Acción"><b>${e(a.accion)}</b></td><td data-l="Cliente">${a.cli?`<button class="btn s g" data-a="ver" data-id="${a.cli}">${e((cli(a.cli)||{}).nombre||'—')}</button>`:'—'}</td><td data-l="Detalle">${e(a.det)}</td></tr>`).join('') : '<tr><td colspan="5" class="vac">Sin registros.</td></tr>'}
      </tbody></table></div></div>`;
  }

  function vConsumo(){
    if(!can('ver_clientes')) return `<div class="card"><p class="note">Tu rol no puede ver clientes.</p></div>`;
    const C = st.costos, ed = can('precios');
    const vivos = st.clientes.filter(c=>!['cancelada'].includes(c.estado));
    const filas = vivos.map(c=>{ const ing = r2(mrrCli(st,c)/1.18), cost = costoCli(c); return { c, q:cuotasCli(st,c), x:c.consumo||{}, cr:creditosCli(st,c), ing, cost, mg: ing>0 ? Math.round((ing-cost)/ing*100) : null }; });
    const pagan = filas.filter(f=>f.ing>0), tI = r2(pagan.reduce((t,f)=>t+f.ing,0)), tC = r2(pagan.reduce((t,f)=>t+f.cost,0));
    const cPru = r2(filas.filter(f=>f.c.estado==='prueba').reduce((t,f)=>t+f.cost,0)), cCero = r2(filas.filter(f=>f.c.real).reduce((t,f)=>t+f.cost,0));
    const near = vivos.filter(cerca);
    const vend = st.facturas.filter(f=>f.tipo==='creditos' && f.fecha.slice(0,7)===HOY().slice(0,7)).reduce((t,f)=>t+f.monto,0);
    const inp = (k,l,stp) => `<div class="f"><label>${l}</label><input type="number" min="0" step="${stp||'0.01'}" data-f="costo" data-id="${k}" value="${C[k]}" ${ed?'':'disabled'}></div>`;
    return `<div class="kps">${kp('Ingreso del mes sin IGV', money(tI), `${pagan.length} clientes que pagan`)}${kp('Costo variable de quienes pagan', money(tC), 'SUNAT, WhatsApp e infraestructura')}${kp('Margen bruto', tI ? Math.round((tI-tC)/tI*100)+'%' : '—', 'Antes de sueldos y marketing')}${kp('Costo de las pruebas', money(cPru), `Inversión para ganar clientes · cliente cero ${S(cCero)}`)}${kp('Cerca de su límite', near.length, 'Usan 80% o más de una cuota', near.length?'dn':'')}${kp('Créditos vendidos este mes', money(r2(vend)))}</div>
    <div class="card"><div class="ch"><div><h2>Supuestos de costo</h2><p>${e(C.nota)}</p></div></div>
      <div class="fr">${inp('sunatRuc','SUNAT por empresa al mes (S/)')}${inp('waUtil','WhatsApp de aviso, por mensaje (S/)')}${inp('waMkt','WhatsApp de campaña, por mensaje (S/)')}${inp('infra','Servidores y correo por cliente (S/)')}</div></div>
    <div class="card"><div class="ch"><div><h2>Consumo y margen por cliente</h2><p>Mes en curso. Los clientes en prueba consumen con las cuotas del plan ${e(planDe(st,st.reglas.planPrueba).nombre)}.</p></div></div>
      <div class="tw"><table class="rs"><thead><tr><th>Cliente</th><th>WhatsApp</th><th>SUNAT</th><th>Créditos</th><th class="r">Ingreso</th><th class="r">Costo</th><th class="r">Margen</th><th></th></tr></thead><tbody>
      ${filas.sort((a,b)=>(a.ing>0?0:1)-(b.ing>0?0:1) || (a.mg??999)-(b.mg??999)).map(f=>`<tr><td class="nl"><div class="who2"><span class="av ${f.c.real?'real':''}">${e(ini(f.c.nombre))}</span><div><b>${e(f.c.nombre)}</b><small>${e(planDe(st,f.c.plan).nombre)} · ${e((ESTADOS[f.c.estado]||[''])[0])}</small></div></div></td>
        <td data-l="WhatsApp" style="min-width:140px">${barra('', f.x.wa||0, f.q.wa)}</td><td data-l="SUNAT" style="min-width:140px">${f.q.sunat ? barra('', f.x.sunat||0, f.q.sunat) : '<span class="sub">No incluido</span>'}</td>
        <td data-l="Créditos" class="num">${f.cr.saldo} <small class="sub">de ${f.cr.plan+f.cr.extra}</small></td>
        <td data-l="Ingreso" class="r num">${money(f.ing)}</td><td data-l="Costo" class="r num">${money(f.cost)}</td>
        <td data-l="Margen" class="r num">${f.mg==null ? '<span class="sub">—</span>' : `<b style="color:${f.mg<30?'var(--bad-ink)':f.mg<60?'var(--warn-ink)':'var(--ok-ink)'}">${f.mg}%</b>`}</td>
        <td data-l=""><div class="row" style="justify-content:flex-end">${cerca(f.c) ? `<button class="btn s" data-a="upsell" data-id="${f.c.id}" ${dis('cambiar_plan')}>Sugerir subir de plan</button>` : ''}<button class="btn s g" data-a="ver" data-id="${f.c.id}">Ver</button></div></td></tr>`).join('')}
      </tbody></table></div>
      <p class="sub" style="margin-top:8px">Vitta Kleanly aparece con margen negativo porque es cliente cero (no paga).</p></div>`;
  }

  function vInteg(){
    if(!can('ver_clientes')) return `<div class="card"><p class="note">Tu rol no puede ver clientes.</p></div>`;
    const C = st.clientes.filter(c=>c.estado!=='cancelada');
    const api = C.reduce((t,c)=>t+((c.consumo||{}).apiHoy||0),0), conApi = C.filter(c=>(c.consumo||{}).apiHoy>0);
    const whMal = C.filter(c=>c.webhook && !c.webhook.ok), sitios = C.filter(c=>c.sitio && c.sitio.publicado);
    const res = sitios.reduce((t,c)=>t+(c.sitio.reservas||0),0), sol = sitios.reduce((t,c)=>t+(c.sitio.solicitudes||0),0);
    const adop = Object.keys(INTEG).map(k=>[k, C.filter(c=>(c.integraciones||[]).includes(k)).length]).sort((a,b)=>b[1]-a[1]);
    const mx = Math.max(1, ...adop.map(a=>a[1]));
    return `<div class="kps">${kp('Llamadas a la API hoy', api.toLocaleString('es-PE'), `${conApi.length} clientes la usan`)}${kp('Webhooks con fallas', whMal.length, whMal.length?'Revisar hoy':'Todo entregado', whMal.length?'dn':'')}${kp('Sitios publicados', sitios.length, `de ${C.length} cuentas`)}${kp('Solicitudes desde sitios', sol, 'Este mes')}${kp('Reservas online', res, sol ? `${Math.round(res/sol*100)}% de las solicitudes` : '')}</div>
    <div class="grid g2">
      <div class="card"><div class="ch"><div><h2>Integraciones más usadas</h2><p>Cuántas cuentas tienen conectada cada una</p></div></div>
        <div class="funnel">${adop.map(([k,n])=>`<div><span>${e(INTEG[k])}</span><i><u style="width:${Math.max(3,n/mx*100)}%"></u></i><b>${n}</b></div>`).join('')}</div></div>
      <div class="card"><div class="ch"><div><h2>Webhooks con problemas</h2><p>Vittkly reintenta 5 veces en 24 horas; luego avisa al cliente</p></div></div>
        ${whMal.length ? `<ul class="lst">${whMal.map(c=>`<li><div><b>${e(c.nombre)}</b><small>${e(c.webhook.url)} · ${c.webhook.fallas} entregas fallidas</small></div><button class="btn s" data-a="wh-avisar" data-id="${c.id}">Avisar al cliente</button></li>`).join('')}</ul>` : '<p class="sub">Todos los webhooks entregan bien.</p>'}</div>
    </div>
    <div class="card"><div class="ch"><div><h2>Uso de la API por cliente</h2><p>Límite diario según el plan. Al llegar al 100% la API responde «demasiadas solicitudes» hasta el día siguiente.</p></div></div>
      <div class="tw"><table class="rs"><thead><tr><th>Cliente</th><th>Plan</th><th>Llamadas hoy</th><th>Webhooks</th><th>Integraciones</th></tr></thead><tbody>
      ${C.filter(c=>(c.consumo||{}).apiHoy>0 || (c.integraciones||[]).length).map(c=>`<tr><td class="nl"><b>${e(c.nombre)}</b></td><td data-l="Plan">${e(planDe(st,c.plan).nombre)}</td><td data-l="Llamadas hoy" style="min-width:160px">${barra('', (c.consumo||{}).apiHoy||0, cuotasCli(st,c).api)}</td><td data-l="Webhooks">${c.webhook ? (c.webhook.ok?'<span class="pill ok">OK</span>':'<span class="pill r">Fallando</span>') : modsCli(st,c).has('webhooks') ? '<span class="sub">Sin configurar</span>' : '<span class="sub">No incluido</span>'}</td><td data-l="Integraciones">${(c.integraciones||[]).map(i=>`<span class="pill in">${e(INTEG[i])}</span>`).join(' ')||'—'}</td></tr>`).join('')}
      </tbody></table></div></div>
    <div class="card"><div class="ch"><div><h2>Sitios y reservas online</h2><p>Mini sitios de los clientes. El plan Inicia muestra «Hecho con Vittkly», que trae nuevos registros.</p></div></div>
      <div class="tw"><table class="rs"><thead><tr><th>Cliente</th><th>Dirección</th><th>Estado</th><th class="r">Visitas</th><th class="r">Solicitudes</th><th class="r">Reservas</th></tr></thead><tbody>
      ${C.map(c=>`<tr><td class="nl"><b>${e(c.nombre)}</b></td><td data-l="Dirección">${e((c.sitio&&c.sitio.dominio) || ((c.sitio&&c.sitio.slug)||'—')+'.vittkly.com')}</td><td data-l="Estado">${c.sitio&&c.sitio.publicado?'<span class="pill ok">Publicado</span>':'<span class="pill">Sin publicar</span>'}</td><td data-l="Visitas" class="r num">${(c.sitio&&c.sitio.visitas)||0}</td><td data-l="Solicitudes" class="r num">${(c.sitio&&c.sitio.solicitudes)||0}</td><td data-l="Reservas" class="r num">${(c.sitio&&c.sitio.reservas)||0}</td></tr>`).join('')}
      </tbody></table></div></div>`;
  }

  function vSistema(){
    const S2 = st.sistema, edS = can('sistema'), edL = can('legal'), edP = can('precios');
    const EST = { operativo:'Operativo', degradado:'Lento o con demoras', caido:'Caído', mantenimiento:'En mantenimiento' };
    const mal = S2.componentes.filter(x=>x.estado!=='operativo');
    const activos = S2.incidentes.filter(i=>i.estado!=='resuelto'), pasados = S2.incidentes.filter(i=>i.estado==='resuelto');
    const vivos = st.clientes.filter(c=>!['cancelada'].includes(c.estado)), lv = legalVer();
    const acept = vivos.length ? Math.round(vivos.filter(c=>c.legal && c.legal.aceptado && c.legal.version===lv).length/vivos.length*100) : 0;
    const inc = i => `<div class="inc ${i.estado!=='resuelto'?'on':''}"><div class="row" style="justify-content:space-between"><b>${e(i.titulo)}</b><span class="pill ${i.estado==='resuelto'?'ok':'wa'}">${e({investigando:'Investigando',identificado:'Identificado',monitoreando:'Monitoreando',resuelto:'Resuelto'}[i.estado])}</span></div>
      <small class="sub">${i.comps.map(id=>(S2.componentes.find(x=>x.id===id)||{}).l).join(', ')} · desde ${fTs(i.inicio)}${i.fin?` hasta ${fTs(i.fin)}`:''}</small>
      <ul>${i.updates.slice().reverse().map(u=>`<li><span>${fTs(u.ts)}</span>${e(u.t)}</li>`).join('')}</ul>
      ${i.estado!=='resuelto' ? `<div class="row"><button class="btn s" data-a="inc-upd" data-id="${i.id}" ${dis('sistema')}>Publicar actualización</button><button class="btn s p" data-a="inc-fin" data-id="${i.id}" ${dis('sistema')}>Marcar resuelto</button></div>` : ''}</div>`;
    return `<div class="grid g2">
      <div class="card"><div class="ch"><div><h2>Estado del sistema</h2><p>Lo ven tus clientes en Ayuda → Estado y en status.vittkly.com</p></div><span class="pill ${mal.length?'wa':'ok'}">${mal.length?`${mal.length} con incidencias`:'Todo operativo'}</span></div>
        <ul class="lst">${S2.componentes.map(x=>`<li><div style="display:flex;align-items:center"><span class="dot ${x.estado}"></span><div><b>${e(x.l)}</b><small>Disponibilidad 90 días: ${x.uptime}%</small></div></div><select data-f="comp" data-id="${x.id}" style="width:auto" ${edS?'':'disabled'} aria-label="Estado de ${e(x.l)}">${Object.entries(EST).map(([k,l])=>`<option value="${k}" ${x.estado===k?'selected':''}>${l}</option>`).join('')}</select></li>`).join('')}</ul></div>
      <div class="card"><div class="ch"><div><h2>Incidentes</h2><p>Comunicar a tiempo evita reclamos</p></div><button class="btn p" data-a="inc-new" ${dis('sistema')}>+ Publicar incidente</button></div>
        <div class="grid" style="gap:10px">${activos.map(inc).join('') || '<p class="sub">Sin incidentes activos.</p>'}${pasados.length ? `<p class="sec" style="margin-top:6px">Resueltos</p>${pasados.slice(0,3).map(inc).join('')}` : ''}</div></div>
    </div>
    <div class="grid g2">
      <div class="card"><div class="ch"><div><h2>Respaldos</h2><p>Copias automáticas de la base de datos</p></div></div>
        <dl class="dl"><div><dt>Copia diaria</dt><dd>${e(S2.respaldos.diario)} h</dd></div><div><dt>Última copia</dt><dd>${fTs(S2.respaldos.ultimo)}</dd></div>
          <div><dt>Volver a cualquier momento</dt><dd>Últimos ${S2.respaldos.puntoEnTiempo} días</dd></div><div><dt>Se guardan</dt><dd>${S2.respaldos.retencion} días</dd></div>
          <div><dt>Última prueba de restauración</dt><dd>${fF(S2.respaldos.prueba)}</dd></div></dl>
        <div class="row" style="margin-top:10px"><button class="btn s" data-a="resp-prueba" ${dis('sistema')}>Registrar prueba de restauración</button></div>
        <p class="note" style="margin-top:10px">Una copia que nunca se probó no es una copia: prueba restaurar al menos una vez al mes.</p></div>
      <div class="card"><div class="ch"><div><h2>Niveles de soporte</h2><p>Lo que promete cada plan</p></div></div>
        ${Object.entries(st.soporteNiveles).map(([k,n])=>`<div class="fr" style="margin-bottom:10px"><div class="f"><label>${e(n.l)} · canal</label><input type="text" data-f="sop" data-id="${k}:canal" value="${e(n.canal)}" ${edP?'':'disabled'}></div><div class="f"><label>Primera respuesta</label><input type="text" data-f="sop" data-id="${k}:respuesta" value="${e(n.respuesta)}" ${edP?'':'disabled'}></div><div class="f"><label>Capacitación</label><input type="text" data-f="sop" data-id="${k}:capacitacion" value="${e(n.capacitacion)}" ${edP?'':'disabled'}></div></div>`).join('')}</div>
    </div>
    <div class="card"><div class="ch"><div><h2>Documentos legales</h2><p>${acept}% de las cuentas aceptó la versión vigente. Al publicar una nueva versión, cada cliente la acepta en su próximo ingreso.</p></div></div>
      <div class="tw"><table class="rs"><thead><tr><th>Documento</th><th>Versión</th><th>Publicado</th><th>Aceptación</th><th></th></tr></thead><tbody>
      ${st.legal.docs.map(d=>`<tr><td class="nl"><b>${e(d.l)}</b>${d.obligatorio?' <span class="pill">Obligatorio</span>':''}</td><td data-l="Versión">v${e(d.version)}</td><td data-l="Publicado">${fF(d.fecha)}</td><td data-l="Aceptación">${d.obligatorio?`${acept}%`:'Informativo'}</td><td data-l=""><div class="row" style="justify-content:flex-end"><button class="btn s g" data-a="legal-ver" data-id="${d.id}">Ver borrador</button><button class="btn s" data-a="legal-pub" data-id="${d.id}" ${dis('legal')}>Nueva versión</button></div></td></tr>`).join('')}
      </tbody></table></div></div>
    <div class="grid g2">
      <div class="card"><div class="ch"><div><h2>Cumplimiento</h2><p>${st.legal.cumplimiento.filter(x=>x.ok).length} de ${st.legal.cumplimiento.length} listos</p></div></div>
        <div class="grid" style="gap:8px">${st.legal.cumplimiento.map(x=>`<label class="chk"><input type="checkbox" data-f="cumpl" data-id="${x.id}" ${x.ok?'checked':''} ${edL?'':'disabled'}> ${e(x.l)}</label>`).join('')}</div>
        <p class="note wa" style="margin-top:12px">Lista de referencia, no es asesoría legal: confírmala con un abogado antes de lanzar.</p></div>
      <div class="card"><div class="ch"><div><h2>Países</h2><p>Moneda, impuesto y documento fiscal se configuran por país. Perú es el primero.</p></div></div>
        <div class="tw"><table class="rs"><thead><tr><th>País</th><th>Moneda</th><th>Impuesto</th><th>Ente fiscal</th><th>Disponible</th></tr></thead><tbody>
        ${st.paises.map(x=>`<tr><td class="nl"><b>${e(x.l)}</b></td><td data-l="Moneda">${e(x.moneda)} (${e(x.simbolo)})</td><td data-l="Impuesto">${e(x.impuesto)} ${x.tasa}%</td><td data-l="Ente fiscal">${e(x.fiscal)}</td><td data-l="Disponible"><label class="chk"><input type="checkbox" data-f="pais" data-id="${x.id}" ${x.activo?'checked':''} ${edP&&x.id!=='PE'?'':'disabled'}> ${x.activo?'Sí':'Próximamente'}</label></td></tr>`).join('')}
        </tbody></table></div></div>
    </div>`;
  }

  function vReferidos(){
    const R = st.referidos, ed = can('campanas');
    return `<div class="card"><div class="ch"><div><h2>Referidos y partners</h2><p>Clientes que recomiendan Vittkly, y contadores o consultores que traen clientes a cambio de una comisión.</p></div><button class="btn" data-a="partner-new" ${dis('campanas')}>+ Agregar partner</button></div>
      <div class="fr"><div class="f"><label>Premio para quien recomienda</label><input type="text" data-f="ref" data-id="premioQuien" value="${e(R.premioQuien)}" ${ed?'':'disabled'}></div><div class="f"><label>Premio para la empresa nueva</label><input type="text" data-f="ref" data-id="premioNuevo" value="${e(R.premioNuevo)}" ${ed?'':'disabled'}></div></div>
      <div class="grid g2" style="margin-top:12px"><div><p class="sec">Recomendaciones de clientes</p><ul class="lst">${R.referidos.map(r=>`<li><div><b>${e(r.quien)} → ${e(r.nuevo)}</b><small>${e(r.premio)}</small></div><span class="pill ${r.estado==='pagó'?'ok':'in'}">${e(r.estado)}</span></li>`).join('')}</ul></div>
        <div><p class="sec">Partners</p><ul class="lst">${R.partners.map(x=>`<li><div><b>${e(x.nombre)}</b><small>${e(x.tipo)} · ${e(x.contacto)} · ${x.clientes} clientes · comisión ${x.comision}% mensual</small></div>${x.pendiente ? `<button class="btn s" data-a="partner-pagar" data-id="${x.id}" ${dis('pagos')}>Pagar ${money(x.pendiente)}</button>` : '<span class="pill ok">Al día</span>'}</li>`).join('')}</ul></div></div></div>`;
  }

  /* =================== modal =================== */
  function modal(titulo, sub, body, ok, onOk, opts){
    V.modal = { titulo, sub, body, ok, onOk, opts:opts||{} }; pintarModal();
  }
  function pintarModal(err){
    let mb = root.querySelector('.mb'); if(mb) mb.remove();
    if(!V.modal) return;
    const M = V.modal;
    mb = document.createElement('div'); mb.className = 'mb';
    mb.innerHTML = `<div class="md" role="dialog" aria-modal="true" aria-labelledby="mdT"><header><div><h3 id="mdT">${M.titulo}</h3>${M.sub?`<p>${M.sub}</p>`:''}</div><button class="btn g s" data-m="x" aria-label="Cerrar">✕</button></header>
      <div class="bd">${typeof M.body==='function'?M.body():M.body}${err?`<div class="err">${e(err)}</div>`:''}</div>
      <footer>${M.opts.sinCancelar?'':`<button class="btn" data-m="x">${M.ok?'Cancelar':'Cerrar'}</button>`}${M.ok?`<button class="btn ${M.opts.peligro?'d':'p'}" data-m="ok">${M.ok}</button>`:''}</footer></div>`;
    root.querySelector('.sp').appendChild(mb);
    const md = mb.querySelector('.md');
    mb.addEventListener('click', ev=>{ if(ev.target===mb) cerrarModal(); });
    md.addEventListener('keydown', ev=>{ if(ev.key==='Escape') cerrarModal(); });
    mb.querySelectorAll('[data-m="x"]').forEach(b=>b.addEventListener('click', cerrarModal));
    const okb = mb.querySelector('[data-m="ok"]');
    if(okb) okb.addEventListener('click', ()=>{ const f = {}; md.querySelectorAll('[name]').forEach(x=>{ if(x.type==='checkbox'){ if(x.dataset.multi){ f[x.name] = f[x.name]||[]; if(x.checked) f[x.name].push(x.value); } else f[x.name] = x.checked; } else if(x.type==='radio'){ if(x.checked) f[x.name] = x.value; } else f[x.name] = x.value; });
      const r = M.onOk(f, md); if(typeof r==='string'){ pintarModal(r); return; } if(r!==false) cerrarModal(); });
    if(M.opts.bind) M.opts.bind(md);
    const first = md.querySelector('input,select,textarea,button.p'); if(first) setTimeout(()=>first.focus(), 30);
  }
  function cerrarModal(){ V.modal = null; const mb = root.querySelector('.mb'); if(mb) mb.remove(); }

  /* ---- formularios reutilizables ---- */
  const cupForm = u => `<div class="fr"><div class="f"><label>Código</label><input type="text" name="codigo" value="${e(u.codigo||'')}" maxlength="20" placeholder="EJ.: VERANO27" style="text-transform:uppercase"></div><div class="f"><label>Nombre interno</label><input type="text" name="nombre" value="${e(u.nombre||'')}" maxlength="60"></div></div>
    <div class="fr"><div class="f"><label>Tipo</label><select name="tipo">${Object.entries(TIPO_DESC).map(([k,l])=>`<option value="${k}" ${u.tipo===k?'selected':''}>${l}</option>`).join('')}</select></div><div class="f"><label>Valor</label><input type="number" name="valor" min="0" step="0.01" value="${u.valor??''}"></div>
      <div class="f"><label>Duración</label><select name="duracion"><option value="una" ${u.duracion==='una'?'selected':''}>Solo el primer cobro</option><option value="meses" ${u.duracion==='meses'||!u.duracion?'selected':''}>Varios meses</option><option value="siempre" ${u.duracion==='siempre'?'selected':''}>Para siempre</option></select></div><div class="f"><label>Meses</label><input type="number" name="meses" min="1" max="36" value="${u.meses??3}"></div></div>
    <div class="fr"><div class="f"><label>Para quién</label><select name="segmento">${Object.entries(SEGMENTO).map(([k,l])=>`<option value="${k}" ${u.segmento===k?'selected':''}>${l}</option>`).join('')}</select></div><div class="f"><label>Ciclo</label><select name="ciclo"><option value="todos">Mensual y anual</option><option value="mensual" ${u.ciclo==='mensual'?'selected':''}>Solo mensual</option><option value="anual" ${u.ciclo==='anual'?'selected':''}>Solo anual</option></select></div></div>
    <div class="f"><span class="lb">Planes</span><div class="row">${st.planes.map(p=>`<label class="chk"><input type="checkbox" name="planes" data-multi="1" value="${p.id}" ${(u.planes||[]).includes(p.id)?'checked':''}> ${e(p.nombre)}</label>`).join('')}</div><small>Si no marcas ninguno, vale para todos.</small></div>
    <div class="fr"><div class="f"><label>Desde</label><input type="date" name="desde" value="${e(u.desde||HOY())}"></div><div class="f"><label>Hasta</label><input type="date" name="hasta" value="${e(u.hasta||'')}"><small>Vacío = sin fin</small></div><div class="f"><label>Usos máximos</label><input type="number" name="max" min="1" value="${u.max??''}"><small>Vacío = sin límite</small></div></div>`;
  const leerCupon = (f, u) => {
    const codigo = String(f.codigo||'').toUpperCase().replace(/[^A-Z0-9_-]/g,'');
    if(!codigo) return 'Escribe el código del cupón.';
    if(st.cupones.some(x=>x.codigo===codigo && x.id!==u.id)) return `Ya existe un cupón ${codigo}.`;
    const valor = Number(f.valor); if(!(valor>0)) return 'El valor debe ser mayor que 0.';
    if(f.tipo==='pct' && valor>100) return 'Un porcentaje no puede pasar de 100.';
    if(f.hasta && f.hasta < f.desde) return 'La fecha final es anterior a la inicial.';
    return { codigo, nombre:String(f.nombre||'').trim() || codigo, tipo:f.tipo, valor, duracion:f.duracion, meses:f.duracion==='meses' ? Math.max(1, +f.meses||1) : (f.tipo==='meses'?valor:null), segmento:f.segmento, ciclo:f.ciclo, planes:f.planes||[], desde:f.desde||HOY(), hasta:f.hasta||null, max:f.max?+f.max:null };
  };

  /* =================== acciones =================== */
  const A = {
    tab: id => { V.tab = id; },
    ver: id => { V.tab = 'clientes'; V.sel = id; },
    cerrar: () => { V.sel = null; },
    fe: id => { V.fe = id; }, ff: id => { V.ff = id; },
    preview: () => { V.preview = !V.preview; },
    'apr-ok': id => { if(!rol().fijo) return; const a = st.aprobaciones.find(x=>x.id===id), c = cli(a.cliente); a.estado = 'aprobada'; a.por = yo().nombre;
      const ms = a.desc.tipo==='meses' ? a.desc.valor : a.desc.meses;
      c.descuentos.push({ id:uid('d'), cupon:a.desc.cupon||null, nombre:a.desc.nombre, tipo:a.desc.tipo, valor:a.desc.valor, hasta: ms ? addM(HOY(),ms) : null, por:`${a.pedidoPor} (aprobó ${yo().nombre})`, desde:HOY() });
      if(a.desc.cupon){ const u = st.cupones.find(x=>x.codigo===a.desc.cupon); if(u) u.usos++; }
      tl(c, `Descuento ${descTxt(a.desc)} aprobado`); audit('Aprobó descuento', c.id, `${descTxt(a.desc)}${ms?` por ${ms} meses`:''}, pedido por ${a.pedidoPor}`); toast('Descuento aprobado y aplicado.'); },
    'apr-no': id => { if(!rol().fijo) return; const a = st.aprobaciones.find(x=>x.id===id); a.estado = 'rechazada'; a.por = yo().nombre; audit('Rechazó descuento', a.cliente, `${descTxt(a.desc)} pedido por ${a.pedidoPor}`); toast('Pedido rechazado.'); },
    trial: (n, c) => { if(!guard('extender_prueba')) return false; c.pruebaFin = addD(c.pruebaFin||HOY(), +n); tl(c, `Prueba extendida ${n} días (hasta ${fF(c.pruebaFin)})`); audit('Extendió prueba', c.id, `+${n} días · hasta ${fF(c.pruebaFin)}`); toast(`Prueba extendida hasta el ${fF(c.pruebaFin)}.`); },
    activar: (x, c) => { if(!guard('cambiar_plan')) return false;
      modal('Activar plan', `${e(c.nombre)} pasa de prueba a cliente que paga`, `<div class="fr"><div class="f"><label>Plan</label><select name="plan">${st.planes.filter(p=>p.activo).map(p=>`<option value="${p.id}" ${p.id==='crece'?'selected':''}>${e(p.nombre)} · ${S(p.mensual)}</option>`).join('')}</select></div><div class="f"><label>Ciclo</label><select name="ciclo"><option value="mensual">Mensual</option><option value="anual">Anual</option></select></div></div>
        <div class="f"><label>Cupón (opcional)</label><select name="cupon"><option value="">Sin cupón</option>${st.cupones.filter(u=>u.activo && ['nuevos','todos'].includes(u.segmento) && (!u.hasta||u.hasta>=HOY()) && u.desde<=HOY() && (!u.max||u.usos<u.max)).map(u=>`<option value="${e(u.codigo)}">${e(u.codigo)} · ${descTxt(u)} · ${durTxt(u)}</option>`).join('')}</select></div>
        <div class="f"><label>Cómo pagó</label><select name="metodo"><option>tarjeta</option><option value="manual">Transferencia o Yape</option></select></div>`, 'Activar', f=>{
        const u = f.cupon ? st.cupones.find(x=>x.codigo===f.cupon) : null;
        if(u && u.planes.length && !u.planes.includes(f.plan)) return `El cupón ${u.codigo} solo vale para ${u.planes.map(id=>planDe(st,id).nombre).join(', ')}.`;
        if(u && u.ciclo!=='todos' && u.ciclo!==f.ciclo) return `El cupón ${u.codigo} solo vale para el ciclo ${u.ciclo}.`;
        c.plan = f.plan; c.ciclo = f.ciclo; c.estado = 'activa'; c.metodo = f.metodo; c.prox = f.ciclo==='anual' ? addM(HOY(),12) : addM(HOY(),1); delete c.pruebaFin;
        if(u){ aplicarCupon(c, u); }
        const pr = precioCli(st,c);
        st.facturas.unshift({ id:uid('f'), numero:'B001-'+String(200+st.facturas.length).padStart(6,'0'), cliente:c.id, fecha:HOY(), monto:c.ciclo==='anual'?r2(pr.total*12):pr.total, estado:'pagada', intentos:1, metodo:f.metodo==='manual'?'Transferencia':'Tarjeta' });
        st.embudo.pagaron++; st.movimientos.nuevo = r2(st.movimientos.nuevo + pr.total);
        tl(c, `Activó plan ${planDe(st,c.plan).nombre} (${c.ciclo})${u?` con cupón ${u.codigo}`:''}`); audit('Activó plan', c.id, `${planDe(st,c.plan).nombre} ${c.ciclo}${u?` · cupón ${u.codigo}`:''}`); toast(`${c.nombre} ya es cliente de pago.`); persist(); });
      return false; },
    link: (x, c) => { audit('Envió enlace de pago', c.id, c.correo); tl(c, 'Se envió enlace de pago por correo y WhatsApp'); toast(`Demostración: enlace de pago enviado a ${c.correo}.`); },
    'pago-manual': (x, c) => { if(!guard('pagos')) return false; const f = st.facturas.find(f=>f.cliente===c.id && ['fallida','vencida'].includes(f.estado)); pagarFactura(f, c); },
    reanudar: (x, c) => { if(!guard('suspender')) return false; c.estado = 'activa'; delete c.pausaHasta; c.motivoEstado = ''; c.prox = addM(HOY(),1); tl(c,'Pausa terminada: cuenta activa'); audit('Reanudó cuenta', c.id, ''); toast('Cuenta reanudada.'); },
    reactivar: (x, c) => { if(!guard('suspender')) return false; c.estado = 'activa'; c.motivoEstado = ''; tl(c,'Cuenta reactivada'); audit('Reactivó cuenta', c.id, ''); toast('Cuenta reactivada: el equipo del cliente ya puede entrar.'); },
    suspender: (x, c) => { if(!guard('suspender')) return false;
      modal('Suspender cuenta', `${e(c.nombre)}`, `<p class="note wa">Nadie de esa empresa podrá trabajar. Solo el titular podrá entrar a pagar o exportar sus datos.</p><div class="f"><label>Motivo (queda en la auditoría)</label><input type="text" name="motivo" placeholder="Ej.: pago vencido, uso indebido" maxlength="120"></div>`, 'Suspender', f=>{
        if(!String(f.motivo||'').trim()) return 'Escribe el motivo.'; c.estado = 'suspendida'; c.motivoEstado = f.motivo; tl(c, `Cuenta suspendida: ${f.motivo}`); audit('Suspendió cuenta', c.id, f.motivo); toast('Cuenta suspendida.'); persist(); }, { peligro:true });
      return false; },
    cancelar: (x, c) => { if(!guard('suspender')) return false; flujoCancelar(c); return false; },
    recuperar: (x, c) => { if(!guard('cambiar_plan')) return false;
      const u = st.cupones.find(x=>x.segmento==='recuperacion' && x.activo && (!x.hasta||x.hasta>=HOY()));
      modal('Recuperar cliente', `${e(c.nombre)} canceló el ${fF(c.cancelada)} · motivo: ${e(c.motivoCancel)}`, `<div class="fr"><div class="f"><label>Vuelve al plan</label><select name="plan">${st.planes.filter(p=>p.activo).map(p=>`<option value="${p.id}" ${p.id===c.plan?'selected':''}>${e(p.nombre)} · ${S(p.mensual)}</option>`).join('')}</select></div>
        <div class="f"><label>Oferta de regreso</label><select name="cupon"><option value="">Sin descuento</option>${st.cupones.filter(x=>x.activo && ['recuperacion','todos'].includes(x.segmento)).map(x=>`<option value="${e(x.codigo)}" ${u&&u.codigo===x.codigo?'selected':''}>${e(x.codigo)} · ${descTxt(x)} · ${durTxt(x)}</option>`).join('')}</select></div></div>
        <p class="note ok">Sus datos siguen guardados${st.reglas.borrado ? ` (se borrarían ${st.reglas.borrado} días después de cancelar: le quedan ${Math.max(0, st.reglas.borrado - dias(c.cancelada, HOY()))} días)` : ''}. Al volver, encuentra todo como lo dejó.</p>`, 'Reactivar con esta oferta', f=>{
        const cu = f.cupon ? st.cupones.find(x=>x.codigo===f.cupon) : null;
        c.plan = f.plan; c.estado = 'activa'; c.prox = addM(HOY(),1); c.salud = 50; c.ultimo = 'Hoy'; delete c.cancelada;
        if(cu) aplicarCupon(c, cu);
        const camp = st.campanas.find(k=>k.tipo==='recuperacion' && cu && k.cupon===cu.codigo); if(camp){ camp.convertidos++; camp.ingreso = r2(camp.ingreso + precioCli(st,c).total); }
        st.movimientos.nuevo = r2(st.movimientos.nuevo + precioCli(st,c).total);
        tl(c, `Cliente recuperado${cu?` con ${cu.codigo}`:''}`); audit('Recuperó cliente', c.id, cu?`Cupón ${cu.codigo}`:'Sin descuento'); toast(`${c.nombre} volvió a Vittkly.`); persist(); });
      return false; },
    soporte: (x, c) => { if(!guard('soporte')) return false;
      modal('Entrar como soporte', `${e(c.nombre)}`, `<p class="note">Verás la cuenta como la ve su administrador. Todo lo que hagas queda registrado con tu nombre.${c.real?'':' <b>Cliente de ejemplo: no tiene datos reales para abrir.</b>'}</p>
        <div class="f"><label>Motivo del acceso</label><input type="text" name="motivo" maxlength="120" placeholder="Ej.: ayudar a configurar plantillas"></div>
        <label class="chk"><input type="checkbox" name="perm" checked> El cliente autorizó el acceso (ticket, correo o WhatsApp)</label>`, c.real ? 'Entrar' : 'Registrar acceso', f=>{
        if(!String(f.motivo||'').trim()) return 'Escribe el motivo del acceso.'; if(!f.perm) return 'Necesitas la autorización del cliente.';
        audit('Entró como soporte', c.id, `Motivo: ${f.motivo}`); tl(c, `Acceso de soporte: ${f.motivo}`); pintar();
        if(c.real && O.soporte){ guardarYa().then(()=>O.soporte(c.nombre)); } else { guardar(); toast('Acceso registrado en la auditoría (cliente de ejemplo).'); } });
      return false; },
    desc: (x, c) => { if(!guard('descuentos')) return false; formDescuento(c); return false; },
    'desc-del': (id, c) => { if(!guard('descuentos')) return false; const d = c.descuentos.find(d=>d.id===id); c.descuentos = c.descuentos.filter(d=>d.id!==id); tl(c, `Se quitó el descuento ${d.nombre}`); audit('Quitó descuento', c.id, `${d.nombre} (${descTxt(d)})`); toast('Descuento quitado.'); },
    modx: (x, c) => { if(!guard('precios')) return false; const p = planDe(st,c.plan);
      const mc = modsCli(st,c), fuera = st.modulos.filter(m=>!mc.has(m.id));
      if(!fuera.length){ toast('Su plan ya incluye todos los módulos.'); return false; }
      modal('Módulo de cortesía', `Activa un módulo fuera del plan ${e(p.nombre)} por un tiempo, sin cobrar`, `<div class="f"><label>Módulo</label><select name="mod">${fuera.map(m=>`<option value="${m.id}">${e(m.l)}</option>`).join('')}</select></div><div class="f"><label>Hasta</label><input type="date" name="hasta" value="${addM(HOY(),1)}"></div><div class="f"><label>Motivo</label><input type="text" name="motivo" maxlength="100" placeholder="Ej.: prueba de Finanzas antes de subir de plan"></div>`, 'Activar', f=>{
        if(!f.hasta || f.hasta < HOY()) return 'Elige una fecha futura.'; c.modulosExtra = (c.modulosExtra||[]).filter(m=>m.id!==f.mod); c.modulosExtra.push({ id:f.mod, hasta:f.hasta, motivo:f.motivo });
        const ml = st.modulos.find(m=>m.id===f.mod).l; tl(c, `Módulo de cortesía ${ml} hasta ${fF(f.hasta)}`); audit('Activó módulo de cortesía', c.id, `${ml} hasta ${fF(f.hasta)}${f.motivo?` · ${f.motivo}`:''}`); toast(`${ml} activo hasta el ${fF(f.hasta)}.`); persist(); });
      return false; },
    nota: (x, c) => { if(!guard('notas')) return false; const i = root.querySelector('[data-f="nota"]'); const t = String(i&&i.value||'').trim(); if(!t){ toast('Escribe la nota.'); return false; }
      c.notas = c.notas||[]; c.notas.unshift({ ts:ahora(), por:yo().nombre, t }); audit('Nota interna', c.id, t.slice(0,80)); },
    'fijo-quitar': (x, c) => { if(!guard('precios')) return false; c.precioFijo = null; tl(c,'Pasa al precio actual del plan'); audit('Quitó precio respetado', c.id, ''); },
    'cli-new': () => { if(!guard('cambiar_plan')) return false;
      modal('Crear cuenta', 'Normalmente el cliente se registra solo. Úsalo para clientes que te contactan por ventas.', `<div class="fr"><div class="f"><label>Empresa</label><input type="text" name="nombre" maxlength="60"></div><div class="f"><label>Titular</label><input type="text" name="titular" maxlength="60"></div></div>
        <div class="fr"><div class="f"><label>Correo</label><input type="email" name="correo" maxlength="80"></div><div class="f"><label>Rubro</label><input type="text" name="rubro" maxlength="50" placeholder="Ej.: Fumigación"></div></div>
        <p class="note">Empieza con ${st.reglas.prueba} días de prueba y todos los módulos abiertos.</p>`, 'Crear y enviar invitación', f=>{
        if(!String(f.nombre||'').trim() || !String(f.titular||'').trim()) return 'Escribe la empresa y el titular.'; if(!/^\S+@\S+\.\S+$/.test(f.correo||'')) return 'Escribe un correo válido.';
        const c = { id:uid('c'), nombre:f.nombre.trim(), titular:f.titular.trim(), correo:f.correo.trim(), cel:'—', rubro:f.rubro||'Servicios', ciudad:'Lima', plan:st.reglas.planPrueba, ciclo:'mensual', estado:'prueba', alta:HOY(), pruebaFin:addD(HOY(),+st.reglas.prueba), usuarios:1, empresas:[f.nombre.trim()], descuentos:[], modulosExtra:[], notas:[], timeline:[], precioFijo:null, metodo:'sin tarjeta', servicios:0, ultimo:'—', salud:50 };
        st.clientes.unshift(c); st.embudo.registros++; tl(c, 'Cuenta creada por el equipo de Vittkly'); audit('Creó cuenta', c.id, c.correo); V.sel = c.id; toast('Cuenta creada. Se envió la invitación al titular.'); persist(); });
      return false; },
    'pl-reset': () => { V.planDraft = null; },
    'pl-save': () => { if(!guard('precios')) return false; guardarPlanes(); return false; },
    'cup-new': () => { if(!guard('campanas')) return false; modal('Nuevo cupón', '', cupForm({ tipo:'pct', duracion:'meses', meses:3, segmento:'nuevos', ciclo:'todos', planes:[] }), 'Crear cupón', f=>{ const r = leerCupon(f, {}); if(typeof r==='string') return r; st.cupones.unshift({ id:uid('u'), usos:0, activo:true, ...r }); audit('Creó cupón', null, `${r.codigo} · ${descTxt(r)} · ${durTxt(r)}`); toast(`Cupón ${r.codigo} creado.`); persist(); }); return false; },
    'cup-edit': id => { if(!guard('campanas')) return false; const u = st.cupones.find(x=>x.id===id); modal(`Editar cupón ${e(u.codigo)}`, u.usos ? `Ya se usó ${u.usos} ${u.usos===1?'vez':'veces'}: los cambios solo aplican a nuevos usos.` : '', cupForm(u), 'Guardar', f=>{ const r = leerCupon(f, u); if(typeof r==='string') return r; Object.assign(u, r); audit('Editó cupón', null, `${r.codigo} · ${descTxt(r)} · ${durTxt(r)}`); toast('Cupón actualizado.'); persist(); }); return false; },
    'cup-tog': id => { if(!guard('campanas')) return false; const u = st.cupones.find(x=>x.id===id); u.activo = !u.activo; audit(u.activo?'Activó cupón':'Desactivó cupón', null, u.codigo); },
    'camp-new': t => { if(!guard('campanas')) return false; formCampana(t); return false; },
    'camp-go': id => { if(!guard('campanas')) return false; const k = st.campanas.find(x=>x.id===id);
      if(k.tipo==='recuperacion'){ const aud = st.clientes.filter(c=>c.estado==='cancelada' && c.cancelada && dias(c.cancelada,HOY())>=(k.diasMin||30)); const u = st.cupones.find(x=>x.codigo===k.cupon);
        modal(`Lanzar «${e(k.nombre)}»`, `Se enviará a ${aud.length} ${aud.length===1?'cliente':'clientes'} por ${e(k.canal)}`, `<ul class="lst">${aud.map(c=>`<li><div><b>${e(c.nombre)}</b><small>${e(c.titular)} · canceló hace ${dias(c.cancelada,HOY())} días · ${e(c.motivoCancel)}</small></div></li>`).join('')||'<li>No hay clientes en esa audiencia.</li>'}</ul>
          <div class="f"><label>Vista previa del mensaje</label><div class="note">${e((k.mensaje||'').replace('{nombre}', aud[0]?aud[0].titular.split(' ')[0]:'Ana').replace('{codigo}', u?u.codigo:'').replace('{descuento}', u?`${descTxt(u)} por ${durTxt(u)}`:''))}</div></div>
          <p class="sub">Demostración: no se envía nada de verdad.</p>`, 'Enviar ahora', ()=>{ if(!aud.length) return 'No hay a quién enviarla.'; k.estado = 'activa'; k.enviados += aud.length; aud.forEach(c=>tl(c, `Recibió la campaña «${k.nombre}»`)); audit('Lanzó campaña', null, `${k.nombre} · ${aud.length} envíos`); toast(`Campaña enviada a ${aud.length} clientes.`); persist(); });
        return false; }
      k.estado = k.desde > HOY() ? 'programada' : 'activa'; if(k.estado==='activa' && !k.enviados && /Correo/.test(k.canal)) k.enviados = st.clientes.filter(c=>c.estado==='prueba').length + 40;
      audit('Activó campaña', null, k.nombre); toast(k.estado==='programada' ? `Programada: empieza el ${fF(k.desde)}.` : 'Campaña activa.'); },
    'camp-pause': id => { if(!guard('campanas')) return false; const k = st.campanas.find(x=>x.id===id); k.estado = 'pausada'; audit('Pausó campaña', null, k.nombre); },
    'camp-end': id => { if(!guard('campanas')) return false; const k = st.campanas.find(x=>x.id===id); k.estado = 'terminada'; const u = st.cupones.find(x=>x.codigo===k.cupon); if(u && u.segmento!=='retencion' && u.segmento!=='interno') u.activo = false; audit('Terminó campaña', null, `${k.nombre}${u?` · cupón ${u.codigo} desactivado`:''}`); toast('Campaña terminada. Los clientes que ya tienen el descuento lo conservan.'); },
    'f-retry': id => { if(!guard('pagos')) return false; const f = st.facturas.find(x=>x.id===id), c = cli(f.cliente);
      if(Math.random() < .5){ pagarFactura(f, c, 'Reintento con tarjeta'); } else { f.intentos = Math.min(3, f.intentos+1); audit('Reintentó cobro', c.id, `Rechazado otra vez (intento ${f.intentos})`); toast('Demostración: el banco rechazó el cobro otra vez.'); } },
    'f-pagar': id => { if(!guard('pagos')) return false; const f = st.facturas.find(x=>x.id===id); pagarFactura(f, cli(f.cliente)); return false; },
    'f-reemb': id => { if(!guard('pagos')) return false; const f = st.facturas.find(x=>x.id===id), c = cli(f.cliente);
      modal('Reembolsar', `${e(f.numero)} · ${e(c.nombre)} · ${S(f.monto)}`, `<div class="f"><label>Motivo</label><input type="text" name="motivo" maxlength="120"></div><p class="note">Se emite una nota de crédito por el monto y se devuelve por el mismo medio de pago.</p>`, 'Reembolsar', ff=>{ if(!String(ff.motivo||'').trim()) return 'Escribe el motivo.'; f.estado = 'reembolsada'; tl(c, `Reembolso de ${f.numero}: ${ff.motivo}`); audit('Reembolsó', c.id, `${f.numero} · ${S(f.monto)} · ${ff.motivo}`); toast('Reembolso registrado.'); persist(); }, { peligro:true });
      return false; },
    'st-inv': () => { if(!guard('equipo')) return false;
      modal('Invitar persona al equipo', 'Recibirá un correo para crear su acceso con verificación en 2 pasos', `<div class="fr"><div class="f"><label>Nombre</label><input type="text" name="nombre" maxlength="60"></div><div class="f"><label>Correo @vittkly.com</label><input type="email" name="correo" maxlength="80"></div></div>
        <div class="f"><label>Rol</label><select name="rol">${Object.entries(st.roles).filter(([k])=>k!=='propietario').map(([k,r])=>`<option value="${k}">${e(r.l)}</option>`).join('')}</select></div>`, 'Enviar invitación', f=>{
        if(!String(f.nombre||'').trim()) return 'Escribe el nombre.'; if(!/^\S+@\S+\.\S+$/.test(f.correo||'')) return 'Escribe un correo válido.'; if(st.staff.some(s=>s.correo.toLowerCase()===f.correo.toLowerCase())) return 'Esa persona ya está en el equipo.';
        st.staff.push({ id:uid('s'), nombre:f.nombre.trim(), correo:f.correo.trim(), rol:f.rol, estado:'invitado', mfa:false, ultimo:'—' }); audit('Invitó al equipo', null, `${f.nombre} · ${st.roles[f.rol].l}`); toast('Invitación enviada.'); persist(); });
      return false; },
    'st-off': id => { if(!guard('equipo')) return false; const s = st.staff.find(x=>x.id===id); if(s.id===V.yo){ toast('No puedes quitarte el acceso a ti mismo.'); return false; } s.estado = s.estado==='inactivo' ? 'activo' : 'inactivo'; audit(s.estado==='inactivo'?'Quitó acceso':'Reactivó acceso', null, s.nombre); },
    'st-mfa': id => { if(!guard('equipo')) return false; const s = st.staff.find(x=>x.id===id); s.mfa = true; audit('Exigió verificación en 2 pasos', null, s.nombre); toast(`${s.nombre} deberá activar la verificación en 2 pasos al entrar.`); },
    addon: (id, c) => { if(!guard('cambiar_plan')) return false; const a = st.addons.find(x=>x.id===id); c.addons = c.addons||[]; const on = c.addons.includes(id);
      c.addons = on ? c.addons.filter(x=>x!==id) : [...c.addons, id]; tl(c, `${on?'Quitó':'Activó'} el complemento ${a.l}`); audit(on?'Quitó complemento':'Activó complemento', c.id, `${a.l} · ${S(a.precio)} ${a.unidad}`); toast(on ? 'Complemento quitado.' : `${a.l} activo: se suma a su próximo cobro.`); },
    'cred-regalo': (x, c) => { if(!guard('descuentos')) return false;
      modal('Regalar créditos', `${e(c.nombre)} · saldo actual ${creditosCli(st,c).saldo}`, `<div class="fr"><div class="f"><label>Créditos</label><input type="number" name="n" min="1" max="5000" value="200"></div><div class="f"><label>Motivo</label><input type="text" name="motivo" maxlength="100" placeholder="Ej.: compensación por el incidente de WhatsApp"></div></div>`, 'Regalar', f=>{
        const n = Math.round(+f.n); if(!(n>0)) return 'Escribe cuántos créditos.'; if(!String(f.motivo||'').trim()) return 'Escribe el motivo.';
        c.consumo = c.consumo||{}; c.consumo.creditosExtra = (c.consumo.creditosExtra||0) + n; tl(c, `Recibió ${n} créditos de regalo: ${f.motivo}`); audit('Regaló créditos', c.id, `${n} créditos · ${f.motivo}`); toast(`${n} créditos agregados.`); persist(); });
      return false; },
    upsell: id => { if(!guard('cambiar_plan')) return false; const c = cli(id), sig = st.planes.filter(p=>p.activo && p.mensual > planDe(st,c.plan).mensual).sort((a,b)=>a.mensual-b.mensual)[0];
      tl(c, `Se le sugirió ${sig ? `el plan ${sig.nombre}` : 'un paquete de créditos'}`); audit('Sugirió subir de plan', c.id, sig ? sig.nombre : 'Paquete de créditos'); toast(`Demostración: se envió a ${c.titular} la sugerencia de ${sig ? `pasar al plan ${sig.nombre}` : 'comprar créditos'}.`); },
    'wh-avisar': id => { const c = cli(id); tl(c, 'Se le avisó que su webhook está fallando'); audit('Avisó webhook fallido', c.id, c.webhook.url); toast(`Demostración: aviso enviado a ${c.correo}.`); },
    'inc-new': () => { if(!guard('sistema')) return false;
      modal('Publicar incidente', 'Se muestra a todos los clientes en Ayuda → Estado del sistema', `<div class="f"><label>Título</label><input type="text" name="titulo" maxlength="90" placeholder="Ej.: Demoras al enviar comprobantes a SUNAT"></div>
        <div class="f"><span class="lb">Afecta a</span><div class="row">${st.sistema.componentes.map(x=>`<label class="chk"><input type="checkbox" name="comps" data-multi="1" value="${x.id}"> ${e(x.l)}</label>`).join('')}</div></div>
        <div class="fr"><div class="f"><label>Estado</label><select name="estado"><option value="investigando">Investigando</option><option value="identificado">Identificado</option><option value="monitoreando">Monitoreando</option></select></div><div class="f"><label>Componentes quedan</label><select name="ce"><option value="degradado">Lentos o con demoras</option><option value="caido">Caídos</option><option value="mantenimiento">En mantenimiento</option></select></div></div>
        <div class="f"><label>Mensaje para los clientes</label><textarea name="t" maxlength="400" placeholder="Qué pasa, a quién afecta y qué pueden hacer mientras tanto."></textarea></div>`, 'Publicar', f=>{
        if(!String(f.titulo||'').trim()) return 'Escribe el título.'; if(!(f.comps||[]).length) return 'Elige al menos un componente.'; if(!String(f.t||'').trim()) return 'Escribe el mensaje.';
        st.sistema.incidentes.unshift({ id:uid('i'), titulo:f.titulo.trim(), comps:f.comps, estado:f.estado, inicio:ahora(), fin:null, updates:[{ ts:ahora(), t:f.t.trim() }] });
        st.sistema.componentes.forEach(x=>{ if(f.comps.includes(x.id)) x.estado = f.ce; }); audit('Publicó incidente', null, f.titulo); toast('Incidente publicado: tus clientes ya lo ven.'); persist(); });
      return false; },
    'inc-upd': id => { if(!guard('sistema')) return false; const i = st.sistema.incidentes.find(x=>x.id===id);
      modal('Publicar actualización', e(i.titulo), `<div class="f"><label>Estado</label><select name="estado">${['investigando','identificado','monitoreando'].map(k=>`<option ${i.estado===k?'selected':''}>${k}</option>`).join('')}</select></div><div class="f"><label>Mensaje</label><textarea name="t" maxlength="400"></textarea></div>`, 'Publicar', f=>{
        if(!String(f.t||'').trim()) return 'Escribe el mensaje.'; i.estado = f.estado; i.updates.push({ ts:ahora(), t:f.t.trim() }); audit('Actualizó incidente', null, `${i.titulo}: ${f.t.slice(0,60)}`); persist(); });
      return false; },
    'inc-fin': id => { if(!guard('sistema')) return false; const i = st.sistema.incidentes.find(x=>x.id===id);
      modal('Marcar resuelto', e(i.titulo), `<div class="f"><label>Mensaje de cierre</label><textarea name="t" maxlength="400">Todo funciona con normalidad. Gracias por la paciencia.</textarea></div>`, 'Resolver', f=>{
        i.estado = 'resuelto'; i.fin = ahora(); i.updates.push({ ts:ahora(), t:String(f.t||'Resuelto.').trim() });
        st.sistema.componentes.forEach(x=>{ if(i.comps.includes(x.id) && !st.sistema.incidentes.some(o=>o.estado!=='resuelto' && o.comps.includes(x.id))) x.estado = 'operativo'; });
        audit('Resolvió incidente', null, i.titulo); toast('Incidente resuelto.'); persist(); });
      return false; },
    'resp-prueba': () => { if(!guard('sistema')) return false; st.sistema.respaldos.prueba = HOY(); audit('Probó restauración de respaldo', null, 'Restauración de prueba correcta'); toast('Prueba de restauración registrada.'); },
    'legal-ver': id => { const d = st.legal.docs.find(x=>x.id===id); modal(e(d.l), `Versión ${e(d.version)} · ${fF(d.fecha)}`, `<p class="note wa"><b>Borrador de referencia.</b> Debe revisarlo un abogado antes de publicarlo.</p><div style="font-size:.88rem;line-height:1.6">${(LEGAL[id]||[]).map(t=>`<p style="margin:0 0 8px">${e(t)}</p>`).join('')}</div>`, null, null); return false; },
    'legal-pub': id => { if(!guard('legal')) return false; const d = st.legal.docs.find(x=>x.id===id); const sig = (Math.floor(parseFloat(d.version)) + (d.version.includes('.')?1:1)) + '.0';
      modal('Publicar nueva versión', e(d.l), `<div class="fr"><div class="f"><label>Versión</label><input type="text" name="v" value="${sig}" maxlength="8"></div></div><div class="f"><label>Qué cambió (se muestra al cliente)</label><textarea name="t" maxlength="400"></textarea></div>
        ${d.obligatorio ? '<p class="note">Cada cliente deberá aceptarla en su próximo ingreso. Hasta entonces sigue usando Vittkly con normalidad.</p>' : ''}`, 'Publicar', f=>{
        if(!String(f.t||'').trim()) return 'Resume qué cambió.'; d.version = String(f.v).trim()||sig; d.fecha = HOY(); d.cambios = f.t.trim();
        audit('Publicó documento legal', null, `${d.l} v${d.version}`); toast(`${d.l} v${d.version} publicada.`); persist(); });
      return false; },
    'partner-new': () => { if(!guard('campanas')) return false;
      modal('Agregar partner', 'Contadores o consultores que recomiendan Vittkly', `<div class="fr"><div class="f"><label>Nombre</label><input type="text" name="nombre" maxlength="70"></div><div class="f"><label>Tipo</label><select name="tipo"><option>Contador</option><option>Consultor</option><option>Agencia</option><option>Proveedor del rubro</option></select></div></div>
        <div class="fr"><div class="f"><label>Contacto</label><input type="text" name="contacto" maxlength="60"></div><div class="f"><label>Comisión mensual %</label><input type="number" name="com" min="0" max="50" value="20"></div></div>`, 'Agregar', f=>{
        if(!String(f.nombre||'').trim()) return 'Escribe el nombre.'; st.referidos.partners.push({ id:uid('p'), nombre:f.nombre.trim(), tipo:f.tipo, contacto:f.contacto||'—', comision:+f.com||0, clientes:0, pendiente:0 });
        audit('Agregó partner', null, `${f.nombre} · ${f.com}%`); toast('Partner agregado. Recibirá su enlace de referido por correo.'); persist(); });
      return false; },
    'partner-pagar': id => { if(!guard('pagos')) return false; const x = st.referidos.partners.find(p=>p.id===id); audit('Pagó comisión', null, `${x.nombre} · ${S(x.pendiente)}`); toast(`Comisión de ${S(x.pendiente)} registrada como pagada.`); x.pendiente = 0; },
    reset: () => { if(!rol().fijo) return false; modal('Restablecer datos de ejemplo', '', '<p class="note wa">Se borran todos los cambios hechos en el panel y vuelven los datos de ejemplo iniciales.</p>', 'Restablecer', ()=>{ st = semilla(O); V.sel = null; V.planDraft = null; persist(); toast('Datos de ejemplo restablecidos.'); }, { peligro:true }); return false; }
  };

  function aplicarCupon(c, u){
    c.descuentos = c.descuentos || [];
    c.descuentos.push({ id:uid('d'), cupon:u.codigo, nombre:u.nombre, tipo:u.tipo, valor:u.valor, hasta: u.duracion==='siempre' ? null : u.duracion==='una' ? addM(HOY(),1) : addM(HOY(), u.meses||1), por:yo().nombre, desde:HOY() });
    u.usos++;
  }
  function pagarFactura(f, c, como){
    if(!f){ toast('No hay cobros pendientes.'); return; }
    if(como){ f.estado = 'pagada'; finPago(f, c, como); persist(); return; }
    modal('Registrar pago manual', `${e(f.numero)} · ${e(c.nombre)} · ${S(f.monto)}`, `<div class="fr"><div class="f"><label>Medio</label><select name="medio"><option>Transferencia</option><option>Yape</option><option>Plin</option><option>Depósito</option></select></div><div class="f"><label>N.° de operación</label><input type="text" name="op" maxlength="30"></div></div>`, 'Registrar pago', ff=>{
      if(!String(ff.op||'').trim()) return 'Escribe el número de operación.'; f.estado = 'pagada'; f.metodo = ff.medio; finPago(f, c, `${ff.medio} · op. ${ff.op}`); persist(); });
  }
  function finPago(f, c, det){
    if(['morosa','restringida','suspendida'].includes(c.estado)){ c.estado = 'activa'; c.motivoEstado = ''; delete c.fallo; c.intentos = 0; c.prox = c.ciclo==='anual' ? addM(HOY(),12) : addM(HOY(),1); }
    tl(c, `Pago registrado ${S(f.monto)} (${det})`); audit('Registró pago', c.id, `${f.numero} · ${S(f.monto)} · ${det}`); toast('Pago registrado: la cuenta queda activa.');
  }

  function formDescuento(c){
    const mx = rol().fijo ? 100 : rol().descMax;
    const cups = st.cupones.filter(u=>u.activo && u.segmento!=='interno' && (!u.hasta||u.hasta>=HOY()));
    modal('Aplicar descuento', `${e(c.nombre)} · tu límite sin aprobación: ${mx}%`, `<div class="f"><label>Usar un cupón</label><select name="cupon" data-k="cup"><option value="">Descuento a medida</option>${cups.map(u=>`<option value="${e(u.codigo)}">${e(u.codigo)} · ${descTxt(u)} · ${durTxt(u)}</option>`).join('')}</select></div>
      <div data-k="manual" class="grid" style="gap:12px"><div class="f"><label>Nombre</label><input type="text" name="nombre" maxlength="60" placeholder="Ej.: Descuento por temporada baja"></div>
        <div class="fr"><div class="f"><label>Tipo</label><select name="tipo">${Object.entries(TIPO_DESC).map(([k,l])=>`<option value="${k}">${l}</option>`).join('')}</select></div><div class="f"><label>Valor</label><input type="number" name="valor" min="0" step="0.01"></div><div class="f"><label>Meses</label><input type="number" name="meses" min="0" max="36" value="3"><small>0 = para siempre</small></div></div></div>
      <div class="f"><label>Motivo</label><input type="text" name="motivo" maxlength="120" placeholder="Queda en la auditoría"></div>
      ${(c.descuentos||[]).filter(d=>descVigente(d)).length ? `<p class="note wa">Ya tiene ${(c.descuentos||[]).filter(d=>descVigente(d)).map(d=>`${e(d.nombre)} (${descTxt(d)})`).join(', ')}. Los descuentos se suman: revisa el total en la ficha.</p>` : ''}`, 'Aplicar', f=>{
      if(!String(f.motivo||'').trim()) return 'Escribe el motivo.';
      if(f.cupon){ const u = st.cupones.find(x=>x.codigo===f.cupon); if(u.planes.length && !u.planes.includes(c.plan)) return `El cupón ${u.codigo} no vale para el plan ${planDe(st,c.plan).nombre}.`;
        const pctEq = u.tipo==='pct' ? u.valor : u.tipo==='meses' ? 100 : Math.round(u.valor/Math.max(1,precioCli(st,c).lista)*100);
        if(pctEq > mx) return pedirAprob(c, { nombre:u.nombre, tipo:u.tipo, valor:u.valor, meses:u.duracion==='una'?1:(u.meses||0), cupon:u.codigo }, pctEq, f.motivo);
        aplicarCupon(c, u); tl(c, `Cupón ${u.codigo} aplicado`); audit('Aplicó cupón', c.id, `${u.codigo} · ${f.motivo}`); toast(`Cupón ${u.codigo} aplicado.`); persist(); return; }
      const valor = Number(f.valor); if(!(valor>0)) return 'Escribe el valor del descuento.'; if(f.tipo==='pct' && valor>100) return 'Un porcentaje no puede pasar de 100.';
      const meses = Math.max(0, +f.meses||0);
      const pctEq = f.tipo==='pct' ? valor : f.tipo==='meses' ? 100 : Math.round(valor/Math.max(1,precioCli(st,c).lista)*100);
      const d = { nombre:String(f.nombre||'').trim() || 'Descuento especial', tipo:f.tipo, valor, meses: f.tipo==='meses' ? valor : meses };
      if(pctEq > mx) return pedirAprob(c, d, pctEq, f.motivo);
      c.descuentos.push({ id:uid('d'), nombre:d.nombre, tipo:d.tipo, valor:d.valor, hasta: d.meses ? addM(HOY(), d.meses) : null, por:yo().nombre, desde:HOY() });
      tl(c, `Descuento ${descTxt(d)} aplicado`); audit('Aplicó descuento', c.id, `${d.nombre} · ${descTxt(d)}${d.meses?` por ${d.meses} meses`:' para siempre'} · ${f.motivo}`); toast('Descuento aplicado.'); persist();
    }, { bind: md => { const s = md.querySelector('[data-k="cup"]'), m = md.querySelector('[data-k="manual"]'); const u = () => { m.hidden = !!s.value; }; s.addEventListener('change', u); u(); } });
  }
  function pedirAprob(c, d, pct, motivo){
    st.aprobaciones.unshift({ id:uid('a'), cliente:c.id, pedidoPor:yo().nombre, rol:yo().rol, ts:ahora(), estado:'pendiente', desc:{ nombre:d.nombre, tipo:d.tipo, valor:d.valor, meses:d.meses||0, pct, cupon:d.cupon||null }, motivo });
    audit('Pidió aprobación de descuento', c.id, `${pct}% (su límite es ${rol().descMax}%) · ${motivo}`); tl(c, `Pedido de descuento ${pct}% enviado al propietario`);
    toast(`Supera tu límite de ${rol().descMax}%: se envió al propietario para aprobar.`); persist();
  }

  function flujoCancelar(c){
    const R = st.retencion, u = R.cupon ? st.cupones.find(x=>x.codigo===R.cupon) : null, p = planDe(st,c.plan);
    const menor = st.planes.filter(x=>x.activo && x.mensual < p.mensual).sort((a,b)=>b.mensual-a.mensual)[0];
    const ofertas = R.activa ? [
      R.pausaMeses>0 ? ['pausa', `Pausar la cuenta ${R.pausaMeses} ${R.pausaMeses===1?'mes':'meses'}`, 'No paga mientras está pausada; sus datos quedan guardados'] : null,
      u ? ['cupon', `${descTxt(u)} por ${durTxt(u)} para quedarse`, `Cupón ${u.codigo}`] : null,
      R.bajarPlan && menor ? ['bajar', `Pasar al plan ${menor.nombre} (${S(menor.mensual)})`, 'Paga menos y conserva lo esencial'] : null
    ].filter(Boolean) : [];
    modal('Cancelar suscripción', `${e(c.nombre)} · así lo verá el cliente cuando cancele desde su cuenta; aquí lo registras por él`, `<div class="f"><label>¿Por qué se va?</label><select name="motivo">${R.motivos.map(m=>`<option>${e(m)}</option>`).join('')}</select></div>
      ${ofertas.length ? `<div class="f"><span class="lb">Antes de irte, te ofrecemos</span>${ofertas.map((o,i)=>`<label class="opt"><input type="radio" name="op" value="${o[0]}" ${i===0?'checked':''}><span><b>${e(o[1])}</b><small>${e(o[2])}</small></span></label>`).join('')}
        <label class="opt"><input type="radio" name="op" value="cancelar"><span><b>No, cancelar de todas formas</b><small>Pasa a cancelada al final del periodo pagado. Sus datos se borran ${st.reglas.borrado} días después.</small></span></label></div>` : `<input type="hidden" name="op" value="cancelar"><p class="note wa">La oferta de retención está desactivada.</p>`}`, 'Confirmar', f=>{
      R.intentos++;
      if(f.op==='pausa'){ c.estado = 'pausada'; c.pausaHasta = addM(HOY(), R.pausaMeses); c.motivoEstado = `Pausa por retención (${f.motivo})`; R.retenidos++; tl(c, `Aceptó pausar ${R.pausaMeses} meses en vez de cancelar`); audit('Retuvo cliente (pausa)', c.id, f.motivo); toast('El cliente se queda: cuenta pausada.'); }
      else if(f.op==='cupon'){ aplicarCupon(c, u); R.retenidos++; tl(c, `Aceptó ${u.codigo} en vez de cancelar`); audit('Retuvo cliente (descuento)', c.id, `${u.codigo} · ${f.motivo}`); toast(`El cliente se queda con ${u.codigo}.`); }
      else if(f.op==='bajar'){ const antes = precioCli(st,c).total; c.plan = menor.id; st.movimientos.contraccion = r2(st.movimientos.contraccion + antes - precioCli(st,c).total); R.retenidos++; tl(c, `Bajó al plan ${menor.nombre} en vez de cancelar`); audit('Retuvo cliente (bajó de plan)', c.id, `${p.nombre} → ${menor.nombre} · ${f.motivo}`); toast(`Pasa al plan ${menor.nombre}.`); }
      else { const antes = mrrCli(st,c); (c.descuentos||[]).forEach(d=>{ if(descVigente(d)) d.hasta = addD(HOY(),-1); }); c.estado = 'cancelada'; c.cancelada = HOY(); c.motivoCancel = f.motivo; c.salud = 0; st.movimientos.perdida = r2(st.movimientos.perdida + antes); tl(c, `Canceló la suscripción · motivo: ${f.motivo}`); audit('Canceló suscripción', c.id, f.motivo); toast('Suscripción cancelada.'); }
      persist();
    }, { peligro:false });
  }

  function formCampana(t){
    const T = HOY();
    const def = { temporada:{ nombre:'Campaña de temporada', aud:'Pruebas activas y visitantes', seg:'nuevos', msg:'Hola {nombre}, por temporada tienes {descuento} en Vittkly con el código {codigo}.' },
      recuperacion:{ nombre:'Recupera clientes', aud:'Cancelaron hace más de 30 días', seg:'recuperacion', msg:'Hola {nombre}, te extrañamos. Vuelve con {descuento} usando {codigo}. Tus datos siguen guardados.' },
      anual:{ nombre:'Pásate al anual', aud:'Clientes con pago mensual', seg:'todos', msg:'Hola {nombre}, paga el año y llévate {descuento} con el código {codigo}.' },
      referidos:{ nombre:'Recomienda y gana', aud:'Clientes activos que recomienden a otra empresa', seg:'todos', msg:'Hola {nombre}, por cada empresa que recomiendes ganas {descuento}. Tu código: {codigo}.' } }[t];
    const cups = st.cupones.filter(u=>u.activo && u.segmento!=='interno');
    modal(`Nueva campaña · ${CAMP_T[t][0]}`, '', `<div class="f"><label>Nombre</label><input type="text" name="nombre" value="${e(def.nombre)}" maxlength="60"></div>
      <div class="fr"><div class="f"><label>Cupón</label><select name="cupon"><option value="__nuevo">Crear uno nuevo…</option>${cups.map(u=>`<option value="${e(u.codigo)}">${e(u.codigo)} · ${descTxt(u)}</option>`).join('')}</select></div>
        <div class="f" data-k="nv"><label>Descuento %</label><input type="number" name="pct" min="1" max="100" value="${t==='recuperacion'?40:t==='anual'?17:20}"></div><div class="f" data-k="nv"><label>Por (meses)</label><input type="number" name="meses" min="1" max="24" value="${t==='anual'?12:3}"></div></div>
      <div class="fr"><div class="f"><label>Desde</label><input type="date" name="desde" value="${T}"></div><div class="f"><label>Hasta</label><input type="date" name="hasta" value="${addD(T,30)}"></div>${t==='recuperacion'?`<div class="f"><label>Cancelaron hace más de (días)</label><input type="number" name="diasMin" min="0" value="30"></div>`:''}</div>
      <div class="f"><label>Canal</label><select name="canal"><option>Correo y WhatsApp</option><option>Solo correo</option><option>Banner dentro de Vittkly</option><option>Página de precios</option></select></div>
      <div class="f"><label>Mensaje</label><textarea name="mensaje" maxlength="400">${e(def.msg)}</textarea><small>Comodines: {nombre}, {codigo}, {descuento}</small></div>`, 'Crear campaña', f=>{
      if(!String(f.nombre||'').trim()) return 'Escribe el nombre.'; if(f.hasta && f.hasta < f.desde) return 'La fecha final es anterior a la inicial.';
      let cod = f.cupon;
      if(cod==='__nuevo'){ const pct = +f.pct; if(!(pct>0 && pct<=100)) return 'El descuento debe estar entre 1 y 100%.';
        cod = (f.nombre.normalize('NFD').replace(/[^\w]/g,'').toUpperCase().slice(0,10) || 'PROMO') + pct;
        let i = 2; while(st.cupones.some(u=>u.codigo===cod)) cod = cod.replace(/\d*$/,'') + pct + '_' + (i++);
        st.cupones.unshift({ id:uid('u'), codigo:cod, nombre:f.nombre.trim(), tipo:'pct', valor:pct, duracion:'meses', meses:Math.max(1,+f.meses||1), planes:[], ciclo:t==='anual'?'anual':'todos', segmento:def.seg, desde:f.desde, hasta:f.hasta||null, max:null, usos:0, activo:true }); }
      st.campanas.unshift({ id:uid('k'), tipo:t, nombre:f.nombre.trim(), cupon:cod, estado:'borrador', desde:f.desde, hasta:f.hasta||null, audiencia:def.aud.replace('30', f.diasMin||30), diasMin:+f.diasMin||30, canal:f.canal, enviados:0, convertidos:0, ingreso:0, mensaje:f.mensaje });
      audit('Creó campaña', null, `${f.nombre} · cupón ${cod}`); toast('Campaña creada como borrador. Lánzala cuando esté lista.'); persist();
    }, { bind: md => { const s = md.querySelector('[name="cupon"]'); const u = () => md.querySelectorAll('[data-k="nv"]').forEach(x=>x.hidden = s.value!=='__nuevo'); s.addEventListener('change', u); u(); } });
  }

  function guardarPlanes(){
    const P = V.planDraft;
    for(const p of P.planes){ if(!String(p.nombre).trim()) return toast('Cada plan necesita un nombre.'); if(!(p.mensual>0) || !(p.anual>0)) return toast(`Revisa los precios del plan ${p.nombre}.`); if(!(p.usuarios>=1) || !(p.empresas>=1)) return toast(`El plan ${p.nombre} debe incluir al menos 1 usuario y 1 empresa.`); }
    const cambios = P.planes.filter(p=>{ const o = st.planes.find(x=>x.id===p.id); return o && (o.mensual!==p.mensual || o.anual!==p.anual); });
    const afectados = st.clientes.filter(c=>CUENTA_MRR.includes(c.estado) && cambios.some(p=>p.id===c.plan) && c.precioFijo==null);
    const sube = cambios.some(p=>{ const o = st.planes.find(x=>x.id===p.id); return p.mensual > o.mensual; });
    const aplicar = modo => {
      if(modo==='respetar') afectados.forEach(c=>{ const o = st.planes.find(x=>x.id===c.plan); c.precioFijo = c.ciclo==='anual' ? r2(o.anual/12) : o.mensual; tl(c, `Se respetó su precio (${S(c.precioFijo)}) tras el cambio de precios`); });
      const det = P.planes.map(p=>{ const o = st.planes.find(x=>x.id===p.id); return o.mensual!==p.mensual||o.anual!==p.anual ? `${p.nombre}: ${S(o.mensual)} → ${S(p.mensual)}` : null; }).filter(Boolean).join(' · ') || 'Módulos, límites o complementos';
      st.planes = clone(P.planes); st.addons = clone(P.addons); V.planDraft = null;
      audit('Cambió planes y precios', null, `${det}${cambios.length?` · ${modo==='respetar'?'clientes actuales conservan su precio':'aplica a todos desde su próxima renovación'}`:''}`);
      toast('Planes guardados.'); persist();
    };
    if(!cambios.length || !afectados.length){ aplicar('nuevo'); return; }
    modal('¿Cómo aplicar los nuevos precios?', `${afectados.length} ${afectados.length===1?'cliente paga':'clientes pagan'} un plan con precio cambiado`, `<label class="opt"><input type="radio" name="modo" value="respetar" checked><span><b>Respetar el precio a los clientes actuales</b><small>Solo los nuevos pagan el precio nuevo. Es lo que hacen la mayoría de SaaS${sube?' cuando suben precios':''}: evita reclamos y bajas.</small></span></label>
      <label class="opt"><input type="radio" name="modo" value="todos"><span><b>Aplicar a todos desde su próxima renovación</b><small>${sube?'Se les avisa con al menos 30 días de anticipación.':'Todos pagan el precio nuevo desde su próximo cobro.'}</small></span></label>`, 'Guardar precios', f=>{ aplicar(f.modo); });
  }

  /* =================== pintar =================== */
  function persist(){ guardar(); pintar(); }
  function pintar(){
    const m = met(), pend = m.aprob.length;
    const tabs = [['inicio','Inicio'],['clientes','Clientes'],['soporte','Soporte'],['comunidad','Comunidad'],['ayuda','Centro de ayuda'],['planes','Planes y precios'],['consumo','Consumo y margen'],['promos','Promociones'],['cobros','Cobros'],['integ','Integraciones y sitios'],['sistema','Sistema y legal'],['equipo','Equipo Vittkly'],['auditoria','Auditoría']];
    const body = { soporte:()=>'<div class="mesa-h" data-modo="soporte"></div>', comunidad:()=>'<div class="mesa-h" data-modo="comunidad"></div>', ayuda:()=>'<div class="mesa-h" data-modo="ayuda"></div>', inicio:vInicio, clientes:vClientes, planes:vPlanes, consumo:vConsumo, promos:vPromos, cobros:vCobros, integ:vInteg, sistema:vSistema, equipo:vEquipo, auditoria:vAuditoria }[V.tab]();
    const sp = root.querySelector('.sp'), y = sp.querySelector('.pin') ? (host.closest('#saasView')||{}).scrollTop : 0;
    const act = root.activeElement; const foco = act && act.dataset && act.dataset.f ? { f:act.dataset.f, id:act.dataset.id||'', s:act.selectionStart } : null;
    sp.querySelector('.pin') && (sp.querySelector('.pin').outerHTML = '');
    const wrap = document.createElement('div'); wrap.className = 'pin';
    wrap.innerHTML = `<header class="hd"><div class="hl">${O.logoL?`<img class="ll" src="${e(O.logoL)}" alt="Vittkly"><img class="ld" src="${e(O.logoD||O.logoL)}" alt="">`:'<b>vittkly</b>'}<div><h1>Panel de la plataforma</h1><p>Clientes, planes, cobros y equipo de Vittkly</p></div></div>
      <div class="who"><label>Viendo como <select data-f="yo" aria-label="Persona del equipo">${st.staff.filter(s=>s.estado!=='inactivo').map(s=>`<option value="${s.id}" ${s.id===V.yo?'selected':''}>${e(s.nombre)} · ${e(st.roles[s.rol].l)}</option>`).join('')}</select></label><button class="btn" data-a="salir">Cerrar sesión</button></div></header>
      <div class="demo"><span aria-hidden="true">🧪</span><span><b>Demostración.</b> Todos los clientes, montos y el equipo son ficticios, salvo Vitta Kleanly (cliente cero) y tú. Cambia «Viendo como» para probar lo que puede hacer cada rol. Los cambios se guardan en la Central.</span></div>
      <nav class="tabs" role="tablist" aria-label="Secciones">${tabs.map(([k,l])=>`<button class="tab" role="tab" aria-selected="${V.tab===k}" data-a="tab" data-id="${k}">${l}${k==='inicio'&&pend&&rol().fijo?` <span class="bd">${pend}</span>`:''}${k==='soporte'&&V.tkPend?` <span class="bd" title="Tickets sin asignar o nuevos${V.tkVenc?` · ${V.tkVenc} con SLA vencido`:''}">${V.tkPend}</span>`:''}</button>`).join('')}</nav>
      ${body}
      <div class="foot"><span>Estructura lista para Supabase: cuentas, suscripciones, planes, módulos, cupones, campañas, facturas, staff, roles y auditoría.</span>${rol().fijo?'<button class="btn s g" data-a="reset">Restablecer datos de ejemplo</button>':''}</div>`;
    sp.insertBefore(wrap, sp.firstChild);
    montarMesa(wrap);
    if(foco){ const el = root.querySelector(`[data-f="${foco.f}"]${foco.id?`[data-id="${foco.id}"]`:''}`); if(el){ el.focus(); try{ if(foco.s!=null) el.setSelectionRange(foco.s, foco.s); }catch(err){} } }
    const sv = host.closest('#saasView'); if(sv && y!=null) sv.scrollTop = y;
    const nav = wrap.querySelector('.tabs'), ta = wrap.querySelector('.tab[aria-selected="true"]'); if(nav && ta && ta.offsetLeft + ta.offsetWidth > nav.clientWidth) nav.scrollLeft = ta.offsetLeft - 24;
  }

  /* ---- Soporte (tickets) y Comunidad: módulo saas/mesa.js ---- */
  function cargarMesa(){
    if(window.VK_MESA) return Promise.resolve();
    if(O.cargarJs) return O.cargarJs('saas/mesa.js');
    return new Promise((ok, mal)=>{ const s = document.createElement('script'); s.src = 'saas/mesa.js'; s.onload = ok; s.onerror = ()=>mal(new Error('mesa')); document.head.appendChild(s); });
  }
  function montarMesa(w){
    const mh = w.querySelector('.mesa-h'); if(!mh) return;
    mh.innerHTML = '<p class="sub">Cargando…</p>';
    cargarMesa().then(()=>{ if(!mh.isConnected) return; mh.innerHTML = ''; return window.VK_MESA.staff(mh, { modo:mh.dataset.modo, db:O.db, toast, yo:{ id:yo().id, nombre:yo().nombre }, staff:st.staff, can, semilla:true,
      clientes: st.clientes.map(c=>({ id:c.id, nombre:c.nombre, real:!!c.real, plan:planDe(st,c.plan).nombre, soporte:((st.soporteNiveles||{})[cuotasCli(st,c).soporte]||{}).l||'' })) }); })
      .catch(err=>{ console.error(err); mh.innerHTML = '<p class="vac">No se pudo cargar esta sección. Revisa tu conexión.</p>'; });
  }

  /* ---- eventos (delegados) ---- */
  root.addEventListener('click', ev=>{
    const b = ev.target.closest('[data-a]'); if(!b || !root.contains(b) || b.closest('.mb')) return;
    if(b.getAttribute('aria-disabled')==='true'){ const t = b.getAttribute('title'); toast(t ? t.replace('Tu rol no permite:', `Tu rol (${rol().l}) no permite:`)+'.' : 'Tu rol no lo permite.'); return; }
    const a = b.dataset.a, id = b.dataset.id;
    if(a==='salir'){ if(O.salir) O.salir(); return; }
    const fn = A[a]; if(!fn) return;
    const c = cli(V.sel);
    const r = fn(id, c);
    if(a==='tab' || a==='ver'){ const sv = host.closest('#saasView'); if(sv) sv.scrollTop = 0; }
    if(r===false) return;
    if(['tab','ver','cerrar','fe','ff','preview','pl-reset'].includes(a)) pintar(); else persist();
  });
  root.addEventListener('keydown', ev=>{ const tr = ev.target.closest && ev.target.closest('tr[data-a="ver"]'); if(tr && (ev.key==='Enter' || ev.key===' ')){ ev.preventDefault(); tr.click(); } });
  root.addEventListener('input', ev=>{
    const x = ev.target, f = x.dataset && x.dataset.f; if(!f) return;
    if(f==='q'){ V.q = x.value; pintar(); }
    else if(f==='aq'){ V.aq = x.value; pintar(); }
    else if(f==='pl'){ const [pid,k] = x.dataset.id.split(':'); const p = V.planDraft.planes.find(z=>z.id===pid); p[k] = x.type==='number' ? (x.value===''?0:Number(x.value)) : x.value; if(k==='mensual'){ const auto = root.querySelector(`[data-id="${pid}:anual"]`); if(auto && document.activeElement){} } refrescarBotonesPlan(); }
    else if(f==='ad'){ const a = V.planDraft.addons.find(z=>z.id===x.dataset.id); a.precio = Number(x.value)||0; refrescarBotonesPlan(); }
    else if(f==='pq' && x.type==='number'){ const [pid,k] = x.dataset.id.split(':'); const p = V.planDraft.planes.find(z=>z.id===pid); p.cuotas = p.cuotas||{}; p.cuotas[k] = Math.max(0, Number(x.value)||0); refrescarBotonesPlan(); }
  });
  function refrescarBotonesPlan(){ // sin repintar todo (no perder el foco)
    const P = V.planDraft, dirty = JSON.stringify(P) !== JSON.stringify({ planes:st.planes, addons:st.addons });
    const ch = root.querySelector('.card .ch .row'); if(!ch) return;
    const has = !!ch.querySelector('[data-a="pl-save"]');
    if(dirty !== has){ const b = ch.querySelector('[data-a="preview"]'); ch.innerHTML = ''; ch.appendChild(b); if(dirty){ ch.insertAdjacentHTML('beforeend', `<button class="btn" data-a="pl-reset">Descartar</button><button class="btn p" data-a="pl-save">Guardar cambios</button>`); } }
  }
  root.addEventListener('change', ev=>{
    const x = ev.target, f = x.dataset && x.dataset.f; if(!f) return; const c = cli(V.sel);
    if(f==='yo'){ V.yo = x.value; V.planDraft = null; toast(`Ahora ves el panel como ${yo().nombre} (${rol().l}).`); pintar(); return; }
    if(f==='fp'){ V.fp = x.value; pintar(); return; }
    if(f==='fa'){ V.fa = x.value; pintar(); return; }
    if(f==='pl' || f==='ad'){ pintar(); return; }
    if(f==='pl-dest'){ V.planDraft.planes.forEach(p=>{ p.destacado = p.id===x.dataset.id ? x.checked : (x.checked ? false : p.destacado); }); pintar(); return; }
    if(f==='pl-act'){ V.planDraft.planes.find(p=>p.id===x.dataset.id).activo = x.checked; pintar(); return; }
    if(f==='pm'){ const [mid,pid] = x.dataset.id.split(':'); const p = V.planDraft.planes.find(z=>z.id===pid); p.modulos = x.checked ? [...new Set([...p.modulos, mid])] : p.modulos.filter(m=>m!==mid); pintar(); return; }
    if(f==='cli-plan' && c){ if(!guard('cambiar_plan')){ pintar(); return; } const antes = precioCli(st,c).total, pa = planDe(st,c.plan).nombre; c.plan = x.value; c.precioFijo = null; const desp = precioCli(st,c).total;
      if(CUENTA_MRR.includes(c.estado)){ if(desp>antes) st.movimientos.expansion = r2(st.movimientos.expansion + desp - antes); else st.movimientos.contraccion = r2(st.movimientos.contraccion + antes - desp); }
      tl(c, `Cambio de plan: ${pa} → ${planDe(st,c.plan).nombre}`); audit('Cambió plan', c.id, `${pa} → ${planDe(st,c.plan).nombre}`); toast(`Plan cambiado a ${planDe(st,c.plan).nombre}. Se prorratea en el próximo cobro.`); persist(); return; }
    if(f==='cli-ciclo' && c){ if(!guard('cambiar_plan')){ pintar(); return; } c.ciclo = x.value; c.precioFijo = null; tl(c, `Cambio de ciclo a ${c.ciclo}`); audit('Cambió ciclo', c.id, c.ciclo); persist(); return; }
    if(f==='pq'){ const [pid,k] = x.dataset.id.split(':'); const p = V.planDraft.planes.find(z=>z.id===pid); p.cuotas = p.cuotas||{}; p.cuotas[k] = x.type==='number' ? Math.max(0, Number(x.value)||0) : x.value; pintar(); return; }
    if(f==='ceq'){ if(!guard('precios')){ pintar(); return; } const q = st.creditos.equiv.find(z=>z.id===x.dataset.id); q.c = Math.max(0, Number(x.value)||0); audit('Cambió créditos por uso', null, `${q.l}: ${q.c}`); persist(); return; }
    if(f==='costo'){ if(!guard('precios')){ pintar(); return; } st.costos[x.dataset.id] = Math.max(0, Number(x.value)||0); audit('Cambió supuesto de costo', null, `${x.dataset.id}: ${st.costos[x.dataset.id]}`); persist(); return; }
    if(f==='comp'){ if(!guard('sistema')){ pintar(); return; } const k = st.sistema.componentes.find(z=>z.id===x.dataset.id); k.estado = x.value; audit('Cambió estado del sistema', null, `${k.l}: ${x.value}`); persist(); return; }
    if(f==='sop'){ if(!guard('precios')){ pintar(); return; } const [k,campo] = x.dataset.id.split(':'); st.soporteNiveles[k][campo] = x.value; audit('Cambió nivel de soporte', null, `${st.soporteNiveles[k].l}: ${campo}`); persist(); return; }
    if(f==='cumpl'){ if(!guard('legal')){ pintar(); return; } const k = st.legal.cumplimiento.find(z=>z.id===x.dataset.id); k.ok = x.checked; audit('Cumplimiento', null, `${k.l}: ${k.ok?'listo':'pendiente'}`); persist(); return; }
    if(f==='pais'){ if(!guard('precios')){ pintar(); return; } const k = st.paises.find(z=>z.id===x.dataset.id); k.activo = x.checked; audit('Cambió países', null, `${k.l}: ${k.activo?'disponible':'próximamente'}`); persist(); return; }
    if(f==='ref'){ if(!guard('campanas')){ pintar(); return; } st.referidos[x.dataset.id] = x.value; audit('Cambió premio de referidos', null, x.value); persist(); return; }
    if(f==='rg'){ if(!guard('reglas_cobro')){ pintar(); return; } const k = x.dataset.id, old = st.reglas[k]; st.reglas[k] = x.type==='checkbox' ? x.checked : (x.type==='number' ? Math.max(0, Number(x.value)||0) : x.value);
      audit('Cambió regla de cobro', null, `${k}: ${old} → ${st.reglas[k]}`); persist(); return; }
    if(f==='ret'){ if(!guard('campanas')){ pintar(); return; } const k = x.dataset.id; st.retencion[k] = x.type==='checkbox' ? x.checked : (x.type==='number' ? Math.max(0, Number(x.value)||0) : x.value); audit('Cambió oferta de retención', null, `${k}: ${st.retencion[k]}`); persist(); return; }
    if(f==='st-rol'){ if(!guard('equipo')){ pintar(); return; } const s = st.staff.find(z=>z.id===x.dataset.id), old = s.rol; s.rol = x.value; audit('Cambió rol', null, `${s.nombre}: ${st.roles[old].l} → ${st.roles[s.rol].l}`); toast(`${s.nombre} ahora es ${st.roles[s.rol].l}.`); persist(); return; }
    if(f==='perm'){ if(!guard('equipo')){ pintar(); return; } const [rk,pk] = x.dataset.id.split(':'); st.roles[rk].permisos[pk] = x.checked; audit('Cambió permiso', null, `${st.roles[rk].l}: ${PL[pk]} ${x.checked?'sí':'no'}`); persist(); return; }
    if(f==='dmax'){ if(!guard('equipo')){ pintar(); return; } const rk = x.dataset.id; st.roles[rk].descMax = Math.min(100, Math.max(0, Number(x.value)||0)); audit('Cambió descuento máximo', null, `${st.roles[rk].l}: ${st.roles[rk].descMax}%`); persist(); return; }
  });

  pintar();
  // avisos de tickets para el staff (contador en la pestaña Soporte y notificación del navegador)
  cargarMesa().then(()=>{ if(window.VK_MESA && O.db) window.VK_MESA.vigilar(O.db, { toast, vivo:()=>host.isConnected, badge:(n, v)=>{ if(V.tkPend===n && V.tkVenc===v) return; V.tkPend = n; V.tkVenc = v; const b = root.querySelector('.tab[data-id="soporte"]'); if(b){ const x = b.querySelector('.bd'); if(x) x.remove(); if(n) b.insertAdjacentHTML('beforeend', ` <span class="bd" title="Tickets sin asignar o nuevos">${n}</span>`); } } }); }).catch(()=>{});
  return { refresh: pintar, estado: () => st };
};
})();
