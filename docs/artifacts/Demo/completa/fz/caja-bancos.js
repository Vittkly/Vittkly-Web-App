/* Vitta Kleanly · módulo "Caja y bancos" (Finanzas)
   Se monta dentro de Finanzas → Caja y bancos con window.FZ_MOUNT(host, {db}).
   Aislado en Shadow DOM: sus estilos e ids no chocan con la Central.
   Datos: colecciones fz_gastos, fz_banco, fz_movs, fz_caja, fz_links y doc fz_config/main. */
(function(){
const FZ_CSS="/* Tokens: Vittkly UI Kit */\n:host{display:block;\n  --surface:#F3F8FA;--surface-raised:#FFFFFF;--surface-sunken:#EAF2F6;--line:#DDE7EC;--line-strong:#778B97;\n  --ink:#0E2A3B;--ink-muted:#52626D;--vitta:#2AA8DE;--kleanly:#3EC49B;\n  --primary:#157AA8;--primary-hover:#0F6A93;--on-primary:#FFFFFF;--primary-ink:#106C97;--primary-soft:#E3F4FB;\n  --success:#3EC49B;--success-ink:#146F55;--success-soft:#E2F6EF;\n  --warning:#F2A93B;--warning-ink:#8A5A0B;--warning-soft:#FDF1DC;\n  --danger:#B3322C;--on-danger:#FFFFFF;--danger-ink:#B3322C;--danger-soft:#FDE8E7;\n  --focus:#157AA8;--shadow-2:0 8px 24px rgba(14,42,59,.14);\n  --sans:Manrope,\"Segoe UI\",Roboto,Arial,sans-serif;--mono:\"JetBrains Mono\",ui-monospace,Menlo,Consolas,monospace;\n  --r-sm:6px;--r-md:10px;--r-lg:14px;\n  color-scheme:light;\n}\n@media (prefers-color-scheme: dark){:host(:not([data-theme=\"light\"])){\n  --surface:#0A1C27;--surface-raised:#10283A;--surface-sunken:#081620;--line:#1F3B4E;--line-strong:#6A8CA1;\n  --ink:#E7F1F6;--ink-muted:#9DB2BE;--primary:#5BC0EA;--primary-hover:#7FCFF0;--on-primary:#0A1C27;--primary-ink:#5BC0EA;--primary-soft:#0F3347;\n  --success-ink:#4FD1A9;--success-soft:#0E3A2E;--warning-ink:#F2B45A;--warning-soft:#3D2A0B;\n  --danger:#F08A84;--on-danger:#0A1C27;--danger-ink:#F08A84;--danger-soft:#3F1614;--focus:#5BC0EA;--shadow-2:0 8px 24px rgba(0,0,0,.5);color-scheme:dark}}\n:host([data-theme=\"dark\"]){\n  --surface:#0A1C27;--surface-raised:#10283A;--surface-sunken:#081620;--line:#1F3B4E;--line-strong:#6A8CA1;\n  --ink:#E7F1F6;--ink-muted:#9DB2BE;--primary:#5BC0EA;--primary-hover:#7FCFF0;--on-primary:#0A1C27;--primary-ink:#5BC0EA;--primary-soft:#0F3347;\n  --success-ink:#4FD1A9;--success-soft:#0E3A2E;--warning-ink:#F2B45A;--warning-soft:#3D2A0B;\n  --danger:#F08A84;--on-danger:#0A1C27;--danger-ink:#F08A84;--danger-soft:#3F1614;--focus:#5BC0EA;--shadow-2:0 8px 24px rgba(0,0,0,.5);color-scheme:dark}\n*{box-sizing:border-box}\n[hidden]{display:none!important}\n.fzb{margin:0;background:var(--surface);color:var(--ink);font:400 15px/24px var(--sans);-webkit-font-smoothing:antialiased}\nh1,h2,h3{margin:0}\n.mono,.num{font-family:var(--mono);font-variant-numeric:tabular-nums}\nbutton,input,select,textarea{font:inherit;color:inherit}\n:focus-visible{outline:2px solid var(--focus);outline-offset:2px}\n.wrap{max-width:none;margin:0;padding:0}\n\n/* Header */\nheader.top{position:static;background:transparent;border-bottom:0}\n.hrow{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;flex-wrap:wrap}\n.brand{display:flex;align-items:center;gap:14px}\n.brand .plate{background:#fff;border-radius:var(--r-md);padding:6px 10px;display:flex;align-items:center;border:1px solid var(--line)}\n.brand img{height:26px;width:auto;display:block}\n.brand .ttl{font-weight:700;font-size:16px;line-height:20px}.brand .sub{font-size:13px;color:var(--ink-muted);line-height:18px}\n.tools{display:flex;gap:8px;flex-wrap:wrap;align-items:center}\n/* Buttons (radius-md, control-md 40) */\n.btn{display:inline-flex;align-items:center;gap:6px;height:40px;padding:0 14px;border-radius:var(--r-md);border:1px solid var(--line-strong);background:var(--surface-raised);font-weight:700;font-size:14px;cursor:pointer;white-space:nowrap}\n.btn:hover{background:var(--surface-sunken)}\n.btn.primary{background:var(--primary);border-color:var(--primary);color:var(--on-primary)}.btn.primary:hover{background:var(--primary-hover)}\n.btn.sm{height:32px;padding:0 10px;font-size:13px}\n.btn.ghost{border-color:transparent;background:transparent;color:var(--primary-ink)}.btn.ghost:hover{background:var(--primary-soft)}\n.btn.danger{color:var(--danger-ink)}\n.btn.icon{width:40px;padding:0;justify-content:center}\n.btn[disabled]{opacity:.5;cursor:not-allowed}\n.field{display:block}\n.field label,.lb{display:block;font-size:12px;line-height:16px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-muted);margin-bottom:6px}\n.input,select.input,textarea.input{width:100%;height:40px;border:1px solid var(--line-strong);border-radius:var(--r-md);background:var(--surface-raised);padding:0 12px}\ntextarea.input{height:auto;padding:10px 12px;font-family:var(--mono);font-size:13px;line-height:20px}\nselect.mini{height:32px;border:1px solid var(--line-strong);border-radius:var(--r-md);background:var(--surface-raised);padding:0 8px;font-size:13px;max-width:240px}\nmain{padding:4px 0 8px}\n.grid{display:grid;gap:16px}\n.kpis{grid-template-columns:repeat(4,minmax(0,1fr))}\n@media(max-width:1000px){.kpis{grid-template-columns:repeat(2,minmax(0,1fr))}}\n@media(max-width:560px){.kpis{grid-template-columns:1fr}}\n.mstats{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:14px}.mstat{background:var(--surface-raised);border:1px solid var(--line);border-radius:var(--r-md);padding:10px 14px}.mstat .kl{font-size:12px;color:var(--ink-muted);font-weight:600}.mstat .kv{font-size:20px;font-weight:700;line-height:28px}\n.mstats.k4{grid-template-columns:repeat(4,minmax(0,1fr))}@media(max-width:900px){.mstats.k4{grid-template-columns:repeat(2,minmax(0,1fr))}}\n.menu{position:relative}.menu>summary{list-style:none}.menu>summary::-webkit-details-marker{display:none}\n.menu .mpanel{position:absolute;right:0;top:calc(100% + 6px);z-index:40;min-width:290px;background:var(--surface-raised);border:1px solid var(--line);border-radius:var(--r-md);box-shadow:var(--shadow-2);padding:6px;display:grid;gap:2px}\n.menu .mpanel button{display:grid;gap:2px;text-align:left;border:0;background:transparent;padding:10px 12px;border-radius:8px;cursor:pointer;font:inherit;color:inherit}\n.menu .mpanel button:hover,.menu .mpanel button:focus-visible{background:var(--surface-sunken)}\n.menu .mpanel span{font-size:12px;color:var(--ink-muted);line-height:16px}\n.hrow{padding:10px 0}.brand .plate{padding:4px 8px}.brand img{height:22px}\n@media(max-width:700px){.menu .mpanel{right:auto;left:0}.tools{gap:6px}.tools .btn{height:36px;padding:0 9px;font-size:13px}.tools .btn.icon{width:36px}.brand .sd{display:none}.hrow{gap:8px}}\n.ic{flex:none;vertical-align:-3px}.btn .ic{vertical-align:middle}\n.dot{display:inline-block;width:8px;height:8px;border-radius:50%}\n.card{background:var(--surface-raised);border:1px solid var(--line);border-radius:var(--r-lg);padding:16px}\n.card.lg{padding:24px}\n.card h2{font-size:20px;line-height:28px;font-weight:700}\n.card h3{font-size:16px;line-height:24px;font-weight:700}\n.muted{color:var(--ink-muted)}.small{font-size:13px;line-height:20px}\n.label{font-size:12px;line-height:16px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-muted)}\n/* KPI */\n.kpi{min-height:136px;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden}\n.kpi .v{font:500 26px/34px var(--mono);font-variant-numeric:tabular-nums;margin-top:6px;position:relative}\n.kpi .s{font-size:13px;line-height:20px;color:var(--ink-muted);position:relative}\n.kpi .label{position:relative}\n.wave-fill{position:absolute;left:0;right:0;bottom:0;transition:height .6s cubic-bezier(.4,0,.2,1);background:var(--wv)}\n.wave-fill svg{position:absolute;top:-18px;left:0;width:200%;height:20px;animation:waveMove 7s linear infinite}\n.wave-fill svg path{fill:var(--wv)}\n.wave-fill .w2{animation-duration:11s;opacity:.5;top:-14px}\n@keyframes waveMove{to{transform:translateX(-50%)}}\n@media (prefers-reduced-motion:reduce){.wave-fill svg{animation:none}}\n.t-ok{color:var(--success-ink)}.t-bad{color:var(--danger-ink)}.t-warn{color:var(--warning-ink)}.t-info{color:var(--primary-ink)}\n/* Layout */\n.layout{display:grid;grid-template-columns:minmax(0,1fr);gap:24px;align-items:start;margin-top:12px}\n@media(max-width:1100px){.layout{grid-template-columns:1fr}}\n.sticky{position:sticky;top:96px}\n@media(max-width:1100px){.sticky{position:static}}\n.form{display:grid;gap:12px}\n.seg{display:grid;grid-template-columns:1fr 1fr;gap:8px}\n.seg button{height:40px;border-radius:var(--r-md);border:1px solid var(--line-strong);background:var(--surface-raised);font-weight:700;cursor:pointer}\n.seg button[aria-pressed=true]{background:var(--primary);border-color:var(--primary);color:var(--on-primary)}\n.seg button.eg[aria-pressed=true]{background:var(--danger);border-color:var(--danger);color:var(--on-danger)}\n/* Tabs */\n.tabs{display:flex;gap:4px;overflow-x:auto;overflow-y:hidden;scrollbar-width:thin;border-bottom:1px solid var(--line);margin:-4px -4px 20px;padding:0 4px}\n.tabs button{border:0;background:transparent;padding:10px 14px;font-weight:700;font-size:14px;color:var(--ink-muted);cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px;white-space:nowrap}\n.tabs button[aria-selected=true]{color:var(--primary-ink);border-bottom-color:var(--primary)}\n.cnt{display:inline-block;min-width:20px;padding:0 6px;margin-left:6px;border-radius:999px;background:var(--danger-soft);color:var(--danger-ink);font-size:12px;line-height:20px}\n.steps{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin-bottom:12px}\n@media(max-width:1100px){.steps{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:560px){.steps{grid-template-columns:repeat(2,minmax(0,1fr))}}\n.step{display:flex;gap:10px;align-items:flex-start;text-align:left;border:1px solid var(--line);border-radius:var(--r-md);background:var(--surface-raised);padding:10px 12px;cursor:pointer;font:inherit;color:inherit;position:relative}\n.step:hover{background:var(--surface)}\n.step .no{flex:none;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;font-weight:700;font-size:13px;background:var(--warning-soft);color:var(--warning-ink)}\n.step.done .no{background:var(--success-soft);color:var(--success-ink)}\n.step .t{display:block;font-weight:700;font-size:13px;line-height:18px}.step .s{display:block;font-size:12px;line-height:16px;color:var(--ink-muted);margin-top:2px}\n.step.todo .s{color:var(--warning-ink)}\n.step[aria-current=true]{border-color:var(--primary);box-shadow:inset 0 0 0 1px var(--primary);background:var(--primary-soft)}\n.stepinfo{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding:10px 14px;border-left:3px solid var(--primary);background:var(--surface-sunken);border-radius:0 var(--r-md) var(--r-md) 0;margin-bottom:16px;font-size:13px;line-height:19px}\n.stepinfo>div:first-child{flex:1;min-width:260px}\n.subtabs{display:flex;gap:4px;background:var(--surface-sunken);padding:4px;border-radius:var(--r-md);width:max-content;max-width:100%;flex-wrap:wrap;margin-bottom:16px}\n.subtabs button{border:0;background:transparent;height:32px;padding:0 12px;border-radius:8px;font-weight:700;font-size:13px;color:var(--ink-muted);cursor:pointer;white-space:nowrap}\n.subtabs button[aria-pressed=true]{background:var(--surface-raised);color:var(--ink);box-shadow:0 1px 2px rgba(14,42,59,.08)}\n/* Tables */\n.tw{overflow:clip;border:1px solid var(--line);border-radius:var(--r-lg)}\n.tw.scroll{overflow-x:hidden;overflow-y:auto}.tw.x{overflow-x:auto}\n.tw:not(.scroll):not(.x) th{top:var(--hdr,0px)}\ntable{width:100%;border-collapse:collapse;font-size:14px;line-height:20px}\nth{position:sticky;top:0;z-index:1;background:var(--surface-sunken);text-align:left;font-size:12px;line-height:16px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-muted);padding:10px 10px;white-space:normal}\ntd{padding:10px 10px;border-top:1px solid var(--line);vertical-align:middle;overflow-wrap:break-word}\ntd.nw,td.mono{white-space:nowrap}\ntd .row{flex-wrap:wrap}td select.mini,td .input{max-width:100%}td .badge,.row .badge{white-space:normal}\n.pager{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:10px 4px 0;font-size:13px;color:var(--ink-muted)}.pager.top{padding:0 4px 10px}\n.pager .pgb{display:flex;gap:4px;align-items:center;flex-wrap:wrap}.pager .btn{height:32px;min-width:32px;padding:0 10px;font-size:13px}.pager .btn[aria-current=true]{background:var(--primary-soft);border-color:var(--primary);color:var(--primary-ink)}\n@media(max-width:760px){\n header.top{position:static}\n .tw:not(.x) table,.tw:not(.x) tbody,.tw:not(.x) tr,.tw:not(.x) td{display:block;width:100%}\n .tw:not(.x) thead{display:none}\n .tw:not(.x) tr{border-top:1px solid var(--line);padding:6px 0}.tw:not(.x) tr:first-child{border-top:0}\n .tw:not(.x) td{border:0;padding:5px 12px 5px 124px;position:relative;text-align:left;min-height:28px}\n .tw:not(.x) td::before{content:attr(data-l);position:absolute;left:12px;top:7px;width:104px;font-size:11px;line-height:16px;letter-spacing:.04em;text-transform:uppercase;color:var(--ink-muted);font-weight:600}\n .tw:not(.x) td[data-l=\"\"]{padding-left:12px}\n .tw:not(.x) td select.mini,.tw:not(.x) td .input{width:100%;max-width:100%}.tw:not(.x) td>*{min-width:0;max-width:100%}\n .row>.btn.sm,.row>.badge,.row>label{white-space:normal;height:auto;min-height:32px;max-width:100%}.row>.badge{min-height:0}.tw:not(.x) td[data-l=\"\"]::before{display:none}\n}\ntd.n,th.n{text-align:right;white-space:nowrap}\ntd.n{font-family:var(--mono);font-variant-numeric:tabular-nums;font-size:13px}\ntbody tr:hover td{background:var(--surface)}\n.flow td:first-child{position:sticky;left:0;background:var(--surface-raised);white-space:nowrap}\n.flow th:first-child{position:sticky;left:0;z-index:2}\n.flow tr.b td{font-weight:700;border-top:2px solid var(--line)}\n.flow tr.hl td{background:var(--primary-soft)}\n.flow tr.hl td:first-child{background:var(--primary-soft)}\n/* Status badge: palabra + ícono */\n.badge{display:inline-flex;align-items:center;gap:4px;padding:2px 10px;border-radius:999px;font-size:12px;line-height:20px;font-weight:600;white-space:nowrap}\n.badge svg{width:12px;height:12px;flex:none}\n.b-ok{background:var(--success-soft);color:var(--success-ink)}\n.b-warn{background:var(--warning-soft);color:var(--warning-ink)}\n.b-bad{background:var(--danger-soft);color:var(--danger-ink)}\n.b-info{background:var(--primary-soft);color:var(--primary-ink)}\n.b-neutral{background:var(--surface-sunken);color:var(--ink-muted)}\n.alert{display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;padding:12px 16px;border-radius:var(--r-lg);margin-bottom:16px;border:1px solid}\n.alert.warn{background:var(--warning-soft);border-color:var(--warning);color:var(--ink)}\n.alert.ok{background:var(--success-soft);border-color:var(--success);color:var(--ink)}\n.alert.bad{background:var(--danger-soft);border-color:var(--danger);color:var(--ink)}\ntr.pbaja td{background:var(--danger-soft)}\n.row>.subtabs{width:auto}.row>.row{max-width:100%;min-width:0}\n.alert.info{background:var(--primary-soft);border-color:var(--primary);color:var(--ink)}\n.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}\n.between{justify-content:space-between}\n.two{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:16px}\n.ctl td{border-top:1px solid var(--line)}.ctl tr.tot td{font-weight:700;border-top:2px solid var(--line)}\n.ctl td:first-child{padding-left:0}.ctl td:last-child{padding-right:0}\n.empty{text-align:center;color:var(--ink-muted);padding:48px 16px}\n.chart-box{position:relative;height:380px}\ndialog{border:0;border-radius:var(--r-lg);padding:24px;width:min(560px,94vw);background:var(--surface-raised);color:var(--ink);box-shadow:var(--shadow-2)}\ndialog.wide{width:min(1120px,96vw)}\ndialog::backdrop{background:rgba(14,42,59,.45)}\ndialog h2{font-size:20px;line-height:28px;font-weight:700;margin-bottom:4px}\n.fg{display:grid;gap:12px;grid-template-columns:1fr 1fr}.fg .full{grid-column:1/-1}\n@media(max-width:600px){.fg{grid-template-columns:1fr}}\n#toast{position:fixed;right:16px;bottom:16px;z-index:60;display:flex;flex-direction:column;gap:8px;align-items:flex-end}\n#toast div{background:var(--ink);color:var(--surface-raised);padding:10px 16px;border-radius:var(--r-md);font-weight:600;font-size:14px;box-shadow:var(--shadow-2);animation:tin .2s ease}\n#toast div.err{background:var(--danger);color:var(--on-danger)}\n@keyframes tin{from{opacity:0;transform:translateY(8px)}}\nfooter.pb{display:flex;justify-content:center;align-items:center;gap:8px;padding:24px 0 40px;color:var(--ink-muted);font-size:12px;letter-spacing:.06em;text-transform:uppercase;font-weight:600}\nfooter.pb img{height:16px;width:auto}\n.hint{font-size:13px;line-height:20px;color:var(--ink-muted)}\na{color:var(--primary-ink);font-weight:600;text-underline-offset:2px}\n.btn.ing{border-color:var(--success-ink);color:var(--success-ink)}.btn.ing:hover{background:var(--success-soft)}\n.btn.egr{border-color:var(--danger-ink);color:var(--danger-ink)}.btn.egr:hover{background:var(--danger-soft)}\ndialog.mov{width:min(620px,96vw)}\ndialog.mov .form{display:grid;gap:12px}\nfieldset.comp{border:1px solid var(--line);border-radius:var(--r-md);padding:12px;margin:0;display:grid;gap:12px;min-width:0}\nfieldset.comp legend{font-size:12px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-muted);padding:0 6px}\n.sync{font-weight:600}.sync.ok{color:var(--success-ink)}.sync.busy{color:var(--primary-ink)}.sync.off{color:var(--ink-muted)}.sync.err{color:var(--danger-ink)}\n.drop{display:grid;justify-items:center;gap:6px;text-align:center;padding:28px 16px;border:2px dashed var(--line-strong);border-radius:var(--r-lg);background:var(--surface);cursor:pointer;color:var(--ink)}\n.drop svg{color:var(--primary-ink)}\n.drop:hover,.drop.over{border-color:var(--primary);background:var(--primary-soft)}\n.origin{font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--ink-muted)}\n.fzb{background:transparent;border-radius:var(--r-lg)}\n.fz-guide{font-size:13px;line-height:20px;color:var(--ink-muted)}\n/* Saldo disponible: texto a la izquierda y un tanque con ola a la derecha (nivel frente a la caja mínima) */\n.mstat.tank{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;min-height:148px;padding:12px 14px;--wv:var(--success);--wl:var(--success-ink);--tint:var(--success-soft)}\n.mstat.tank.warn{--wv:var(--warning);--wl:var(--warning-ink);--tint:var(--warning-soft)}\n.mstat.tank.bad{--wv:var(--danger);--wl:var(--danger-ink);--tint:var(--danger-soft)}\n.mstat.tank{background:linear-gradient(180deg,var(--surface-raised) 55%,var(--tint))}\n.tk-txt{display:flex;flex-direction:column;gap:4px;min-width:0}\n.tk-txt .kv{white-space:nowrap}\n@media(max-width:900px){.mstats.k4 .mstat.tank{grid-column:1/-1}}\n.tk-st{display:inline-flex;align-items:center;gap:6px;align-self:flex-start;max-width:100%;padding:3px 10px;border-radius:999px;font-size:12px;line-height:16px;font-weight:700;background:var(--surface-raised);color:var(--wl);box-shadow:0 0 0 1px var(--wl) inset;white-space:normal}\n.tk-st i{width:8px;height:8px;border-radius:50%;background:var(--wv);flex:none}\n.tank.bad .tk-st i{animation:tkPulse 1.6s ease-in-out infinite}\n@keyframes tkPulse{50%{opacity:.25}}\n.tk-d{font-size:12px;line-height:17px;color:var(--ink-muted);margin-top:auto}\n.tk-d b{color:var(--ink);font-family:var(--mono);font-weight:600}\n.tk-col{position:relative;flex:1;min-height:90px;width:26px;border-radius:13px;background:var(--surface-sunken);box-shadow:inset 0 0 0 1px var(--line);overflow:hidden;align-self:stretch}\n.tk-col .wave-fill{background:var(--wv);opacity:.8}\n.tk-col .wave-fill svg path{fill:var(--wv)}\n.tk-col .wave-fill svg{top:-7px;height:8px}\n.tk-col .wave-fill .w2{top:-5px}\n.tk-min{position:absolute;left:0;right:0;height:0;border-top:2px dashed var(--ink-muted);z-index:2}\n.tk-col-w{display:flex;flex-direction:column-reverse;align-items:center;gap:4px;align-self:stretch}\n.tk-col-w small{font-size:10px;line-height:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--ink-muted)}\n@media (prefers-reduced-motion:reduce){.tank.bad .tk-st i{animation:none}}\n";
const FZ_HTML="<svg width=\"0\" height=\"0\" style=\"position:absolute\" aria-hidden=\"true\"><defs>\n<symbol id=\"i-check\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 6 9 17l-5-5\"/></symbol><symbol id=\"i-clock\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 6v6l4 2\"/></symbol><symbol id=\"i-alert\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 8v4M12 16h.01\"/></symbol><symbol id=\"i-user\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2\"/><circle cx=\"12\" cy=\"7\" r=\"4\"/></symbol><symbol id=\"i-up\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m5 12 7-7 7 7M12 19V5\"/></symbol><symbol id=\"i-gear\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/></symbol><symbol id=\"i-calendar\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M16 2v4M8 2v4M3 10h18\"/></symbol><symbol id=\"i-info\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 16v-4M12 8h.01\"/></symbol><symbol id=\"i-plus\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12h14M12 5v14\"/></symbol><symbol id=\"i-trash\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6\"/></symbol><symbol id=\"i-chev-up\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m18 15-6-6-6 6\"/></symbol><symbol id=\"i-chev-down\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m6 9 6 6 6-6\"/></symbol><symbol id=\"i-chev-left\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m15 18-6-6 6-6\"/></symbol><symbol id=\"i-chev-right\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m9 18 6-6-6-6\"/></symbol><symbol id=\"i-upload\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/><path d=\"m17 8-5-5-5 5M12 3v12\"/></symbol><symbol id=\"i-download\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/><path d=\"m7 10 5 5 5-5M12 15V3\"/></symbol><symbol id=\"i-arrow-in\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M7 7h10v10M7 17 17 7\"/></symbol><symbol id=\"i-arrow-out\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M17 7 7 17M17 17H7V7\"/></symbol><symbol id=\"i-arrow-left\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m12 19-7-7 7-7M19 12H5\"/></symbol><symbol id=\"i-arrow-right\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12h14M12 5l7 7-7 7\"/></symbol><symbol id=\"i-trend-up\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m22 7-8.5 8.5-5-5L2 17\"/><path d=\"M16 7h6v6\"/></symbol><symbol id=\"i-trend-down\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m22 17-8.5-8.5-5 5L2 7\"/><path d=\"M16 17h6v-6\"/></symbol><symbol id=\"i-triangle\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3\"/><path d=\"M12 9v4M12 17h.01\"/></symbol><symbol id=\"i-undo\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\"/><path d=\"M3 3v5h5\"/></symbol><symbol id=\"i-x\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M18 6 6 18M6 6l12 12\"/></symbol><symbol id=\"i-dot\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"5\" fill=\"currentColor\"/></symbol></defs></svg>\n\n<header class=\"top\"><div class=\"wrap\"><div class=\"hrow\">\n  <div class=\"brand\"><div><div class=\"ttl\">Caja y bancos</div><div class=\"sub\"><span class=\"sd\">Forms, estado de cuenta BCP, caja chica y préstamos de socios · </span><span id=\"sync\" class=\"sync\">Conectando…</span></div></div></div>\n  <div class=\"tools\">\n    <details class=\"menu\" name=\"hmenu\"><summary class=\"btn ing\"><svg class=\"ic\" width=\"20\" height=\"20\" aria-hidden=\"true\"><use href=\"#i-plus\"/></svg>Registrar <svg class=\"ic\" width=\"16\" height=\"16\" aria-hidden=\"true\" style=\"opacity:.8\"><use href=\"#i-chev-down\"/></svg></summary><div class=\"mpanel\">\n      <button data-act=\"nuevo-mov\" data-v=\"ingreso\"><b class=\"t-ok row\" style=\"gap:6px\"><svg class=\"ic\" width=\"20\" height=\"20\" aria-hidden=\"true\"><use href=\"#i-arrow-in\"/></svg>Ingreso</b><span>Cobro, venta o préstamo que no entró por el Forms</span></button>\n      <button data-act=\"nuevo-mov\" data-v=\"egreso\"><b class=\"t-bad row\" style=\"gap:6px\"><svg class=\"ic\" width=\"20\" height=\"20\" aria-hidden=\"true\"><use href=\"#i-arrow-out\"/></svg>Egreso</b><span>Gasto que no se registró en el Forms</span></button></div></details>\n    <details class=\"menu\" name=\"hmenu\"><summary class=\"btn primary\"><svg class=\"ic\" width=\"20\" height=\"20\" aria-hidden=\"true\"><use href=\"#i-upload\"/></svg>Subir <svg class=\"ic\" width=\"16\" height=\"16\" aria-hidden=\"true\" style=\"opacity:.8\"><use href=\"#i-chev-down\"/></svg></summary><div class=\"mpanel\">\n      <button data-act=\"imp-forms\"><b>Excel del Forms</b><span>Respuestas de “Registro de Comprobantes y Facturas”; no duplica lo ya subido</span></button>\n      <button data-act=\"imp-banco\"><b>Estado de cuenta</b><span>Pantallazo o Excel del BCP</span></button></div></details>\n    <details class=\"menu\" name=\"hmenu\"><summary class=\"btn\"><svg class=\"ic\" width=\"20\" height=\"20\" aria-hidden=\"true\"><use href=\"#i-download\"/></svg>Exportar <svg class=\"ic\" width=\"16\" height=\"16\" aria-hidden=\"true\" style=\"opacity:.8\"><use href=\"#i-chev-down\"/></svg></summary><div class=\"mpanel\">\n      <button data-act=\"reporte\"><b>Reporte contable (SUNAT)</b><span>Banco, gastos de socios y caja chica para el contador</span></button>\n      <button data-act=\"export-xlsx\"><b>Excel completo</b><span>Flujo, movimientos, banco y socios</span></button>\n      <button data-act=\"export-csv\"><b>CSV de movimientos</b><span>Para otras herramientas</span></button></div></details>\n    <button class=\"btn icon\" data-act=\"config\" aria-label=\"Configuración y respaldo\" title=\"Configuración y respaldo\"><svg class=\"ic\" width=\"20\" height=\"20\"><use href=\"#i-gear\"/></svg></button>\n  </div>\n</div></div></header>\n\n<main><div class=\"wrap\">\n  <section class=\"grid kpis\" id=\"kpis\" hidden></section>\n  <section class=\"layout\">\n    <section class=\"card lg\" style=\"min-width:0\">\n      <nav class=\"tabs\" id=\"tabs\" role=\"tablist\"></nav>\n      <div id=\"view\"></div>\n    </section>\n  </section>\n</div></main>\n\n\n<dialog id=\"dlgMov\" class=\"mov\"><div class=\"row between\" style=\"margin-bottom:12px\"><h2 id=\"movTitle\">Nuevo egreso</h2><span class=\"hint\">Mismas opciones que el Forms</span></div>\n      <form id=\"formMov\" class=\"form\">\n        <input type=\"hidden\" id=\"editId\">\n        <div class=\"field\"><label for=\"fFecha\">Fecha</label><input class=\"input\" type=\"date\" id=\"fFecha\" required></div>\n        <div class=\"seg\" role=\"group\" aria-label=\"Tipo\"><button type=\"button\" data-tipo=\"ingreso\" aria-pressed=\"false\"><svg class=\"ic\" width=\"16\" height=\"16\" aria-hidden=\"true\"><use href=\"#i-arrow-in\"/></svg> Ingreso</button><button type=\"button\" class=\"eg\" data-tipo=\"egreso\" aria-pressed=\"true\"><svg class=\"ic\" width=\"16\" height=\"16\" aria-hidden=\"true\"><use href=\"#i-arrow-out\"/></svg> Egreso</button></div>\n        <div class=\"field\"><label for=\"fConcepto\" id=\"lConcepto\">¿Qué es?</label><select class=\"input\" id=\"fConcepto\"></select><span class=\"hint\" id=\"hCat\"></span></div>\n        <div class=\"field\"><label for=\"fCuenta\" id=\"lCuenta\">¿Con qué se pagó?</label><select class=\"input\" id=\"fCuenta\"></select></div>\n        <div class=\"field\" id=\"wSocio\" hidden><label for=\"fSocio\">Socio</label><select class=\"input\" id=\"fSocio\"></select></div>\n        <fieldset class=\"comp\" id=\"wComp\"><legend id=\"lComp\">Comprobante</legend>\n          <div class=\"field\"><label for=\"fComp\">Tipo de comprobante</label><select class=\"input\" id=\"fComp\"></select></div>\n          <div class=\"fg\" id=\"wCompDat\">\n            <div class=\"field\"><label for=\"fRuc\" id=\"lRuc\">RUC del proveedor</label><input class=\"input mono\" id=\"fRuc\" inputmode=\"numeric\" maxlength=\"11\" autocomplete=\"off\"></div>\n            <div class=\"field\"><label for=\"fRs\" id=\"lRs\">Razón social</label><input class=\"input\" id=\"fRs\" autocomplete=\"off\"></div>\n            <div class=\"field\"><label for=\"fSerie\">Serie</label><input class=\"input mono\" id=\"fSerie\" maxlength=\"4\" placeholder=\"F001\" autocomplete=\"off\"></div>\n            <div class=\"field\"><label for=\"fNum\">Número</label><input class=\"input mono\" id=\"fNum\" inputmode=\"numeric\" autocomplete=\"off\"></div>\n          </div>\n        </fieldset>\n        <div class=\"field\"><label for=\"fDesc\">Descripción</label><input class=\"input\" id=\"fDesc\" placeholder=\"Ej. Lavado de muebles · Cliente ABC\"></div>\n        <div class=\"field\"><label for=\"fMonto\">Monto total (S/)</label><input class=\"input mono\" type=\"number\" step=\"0.01\" min=\"0\" id=\"fMonto\" placeholder=\"0.00\" required></div>\n        <div class=\"row\" style=\"justify-content:flex-end;margin-top:4px\"><button class=\"btn ghost danger\" type=\"button\" id=\"btnDel\" hidden style=\"margin-right:auto\"><svg class=\"ic\" width=\"16\" height=\"16\" aria-hidden=\"true\"><use href=\"#i-trash\"/></svg> Eliminar</button><button class=\"btn\" type=\"button\" id=\"btnCancel\">Cancelar</button><button class=\"btn\" type=\"submit\" id=\"btnOtro\" data-otro=\"1\">Guardar y registrar otro</button><button class=\"btn primary\" type=\"submit\" id=\"btnSave\">Guardar</button></div>\n      </form>\n</dialog>\n<dialog id=\"dlg\"></dialog>\n<dialog id=\"ask\" style=\"width:min(460px,92vw)\"></dialog>\n<div id=\"toast\" role=\"status\" aria-live=\"polite\"></div>\n<input type=\"file\" id=\"fileForms\" accept=\".xlsx,.xls,.csv\" hidden>\n<input type=\"file\" id=\"fileBanco\" accept=\".xlsx,.xls,.csv\" hidden>\n<input type=\"file\" id=\"fileJson\" accept=\".json\" hidden>\n<input type=\"file\" id=\"fileImg\" accept=\"image/*\" multiple hidden>\n";
function fzLoad(src,test){return new Promise((ok,ko)=>{if(test())return ok();const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>ko(new Error('No se pudo cargar '+src));document.head.appendChild(s);});}
window.FZ_MOUNT=async function(host,FZO){
  if(host.__fzApi)return host.__fzApi;
  await Promise.all([
    fzLoad('https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js',()=>!!window.Chart),
    fzLoad('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',()=>!!window.XLSX)
  ]);
  if(host.__fzApi)return host.__fzApi;
  const FZR=host.shadowRoot||host.attachShadow({mode:'open'});
  FZR.innerHTML='<style>'+FZ_CSS+'</style><div class="fzb">'+FZ_HTML+'</div>';
  const tema=()=>{const t=document.documentElement.getAttribute('data-theme');if(t)host.setAttribute('data-theme',t);else host.removeAttribute('data-theme');};
  tema();new MutationObserver(tema).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  host.__fzApi=fzRun(FZR,host,{},FZO||{});
  return host.__fzApi;
};
function fzRun(FZR,FZH,FZW,FZO){
/* =====================================================================
   VITTA KLEANLY · FLUJO DE CAJA + CRUCE FORMS / ESTADO DE CUENTA
===================================================================== */
const SEED=null; // los datos viven en la base compartida
if(typeof FZO==='undefined')var FZO=null; // en la Central: {db, cobros(), abrir(cobro)}
const LS='vittaKleanly.fz.cajaBancos.v1', LS_OLD='vittaKleanly.flujoCaja.v1';
const $=s=>FZR.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const r2=n=>Math.round((Number(n)||0)*100)/100;
const fmt=n=>{n=r2(n);return (n<0?'-':'')+'S/ '+Math.abs(n).toLocaleString('es-PE',{minimumFractionDigits:2,maximumFractionDigits:2})};
const fdate=s=>s?String(s).split('-').reverse().join('/'):'';
const MES=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const dayN=s=>Date.UTC(+s.slice(0,4),+s.slice(5,7)-1,+s.slice(8,10))/86400000;
const normOp=s=>String(s||'').replace(/\D/g,'').replace(/^0+/,'');
const norm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const uid=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const mesDe=f=>String(f).slice(0,7);
const EMP='Cuenta empresa',CAJA='Caja chica',CF='Solo crédito fiscal';
const isSocio=m=>String(m).startsWith('Socio: '), socioDe=m=>String(m).slice(7);
const ICON={ok:'i-check',warn:'i-clock',bad:'i-alert',info:'i-user',neutral:'i-dot'};
const ic=(n,z=16)=>`<svg class="ic" width="${z}" height="${z}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const badge=(t,k)=>`<span class="badge b-${k}"><svg><use href="#${ICON[k]}"/></svg>${esc(t)}</span>`;
function toast(m,err){const d=document.createElement('div');d.textContent=m;if(err)d.className='err';$('#toast').appendChild(d);setTimeout(()=>d.remove(),3500)}

const SUB={
  operativo:{ingreso:['Venta al Contado','Cobranza Cuentas por Cobrar (crédito)','Otros Ingresos Operativos'],
             egreso:['Insumos y Químicos','Mantenimiento','Gastos sin comprobante','Planilla / Operarios','Movilidad y Combustible','Fletes y Logística','Servicios Básicos','Alquiler','Marketing','Impuestos (IGV/Renta)','Comisiones Bancarias','Otros Egresos Operativos']},
  inversion:{ingreso:['Venta de Maquinaria/Equipo'],egreso:['Compra de Maquinaria','Renovación de Equipos','Vehículos','Herramientas']},
  financiamiento:{ingreso:['Préstamo de Socio','Aporte de Socios','Préstamo Bancario Recibido'],egreso:['Devolución de Préstamo a Socio','Amortización de Deuda','Intereses','Retiro de Utilidades / Dividendos']}
};

/* ---------------- Estado ---------------- */
function autoCls(b){ return ''; } // nada se clasifica solo: el usuario decide cada línea
function fresh(){
  const s={movimientos:[],config:{saldoInicial:0,saldoInicialBanco:0,umbralMinimo:5000,cuentas:['Caja Chica','Banco BCP'],socios:[],contado:{}},gastos:[],banco:[],links:[],caja:[]};
  if(SEED){ s.gastos=SEED.gastos; s.banco=SEED.banco.map(b=>({...b,cls:autoCls(b)})); s.config.saldoInicialBanco=SEED.saldoInicialBanco; s.config.socios=SEED.socios; }
  return s;
}
function load(){
  try{ const r=localStorage.getItem(LS); if(r) return JSON.parse(r); }catch(e){}
  const s=fresh();
  try{ const o=localStorage.getItem(LS_OLD); if(o){ const p=JSON.parse(o); s.movimientos=(p.movimientos||[]); if(p.config){ s.config.saldoInicial=p.config.saldoInicial||0; s.config.umbralMinimo=p.config.umbralMinimo??5000; if(p.config.cuentas?.length) s.config.cuentas=p.config.cuentas; } } }catch(e){}
  return s;
}
let state=load();
['movimientos','gastos','banco','links','caja'].forEach(k=>state[k]=state[k]||[]);
state.config=Object.assign({saldoInicial:0,saldoInicialBanco:0,umbralMinimo:5000,cuentas:['Caja Chica'],socios:[],contado:{}},state.config||{});
function save(){ if(DB){pushDiff();return;} try{ localStorage.setItem(LS,JSON.stringify(state)); }catch(e){} setSync(); }

/* ---------------- Datos compartidos en vivo (base de datos del artefacto) ---------------- */
let DB=null, synced={}, queue=[], running=0, syncFail=null;
const COLS={gastos:'fz_gastos',banco:'fz_banco',movimientos:'fz_movs',caja:'fz_caja',links:'fz_links'};
function fnv(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(36);}
const seg=s=>/^[A-Za-z0-9_\-:@+~]{1,120}$/.test(s)?s:'k'+fnv(s)+fnv('~'+s);
const keyOf=(c,it)=>c===COLS.links?'l'+fnv(it.g+'>'+it.b)+fnv(it.b+'<'+it.g):seg(String(it.id));
function normOrd(){let prev=-Infinity,bad=false;state.banco.forEach(b=>{if(typeof b.ord!=='number'||b.ord<=prev)bad=true;else prev=b.ord;});if(bad)state.banco.forEach((b,i)=>b.ord=i);}
function desired(){const m={};Object.entries(COLS).forEach(([k,c])=>state[k].forEach(it=>{m[c+'/'+keyOf(c,it)]=JSON.stringify(it);}));m['fz_config/main']=JSON.stringify(state.config);return m;}
function pushDiff(){normOrd();const want=desired();
  for(const p in want) if(synced[p]!==want[p]){synced[p]=want[p];const body=JSON.parse(want[p]);enqueue(()=>DB.doc(p).set(body));}
  for(const p in synced) if(!(p in want)){delete synced[p];enqueue(()=>DB.doc(p).delete());}
  setSync();}
function enqueue(fn){queue.push({fn,tries:0});pump();}
function pump(){while(running<4&&queue.length){const j=queue.shift();running++;
  j.fn().then(()=>{syncFail=null;}).catch(e=>{const c=e&&e.code;if((c==='resource_exhausted'||c==='unavailable')&&j.tries<6){j.tries++;setTimeout(()=>{queue.push(j);pump();},400*2**j.tries+Math.random()*300);}else{syncFail=c||'error';if(c==='quota_exceeded')toast('La base compartida está llena. Borra registros antiguos para seguir guardando.',true);else toast('No se pudo guardar un cambio en la base compartida ('+(c||'error')+').',true);}})
  .finally(()=>{running--;pump();setSync();});}
  setSync();}
function setSync(){const e=$('#sync');if(!e)return;
  if(!DB){e.className='sync off';e.textContent='Solo en este navegador';return;}
  if(syncFail){e.className='sync err';e.textContent='Error al guardar';return;}
  if(queue.length||running){e.className='sync busy';e.textContent='Guardando…';return;}
  e.className='sync ok';e.textContent='Compartido · en vivo';}
let renderT=null;
function scheduleRender(){clearTimeout(renderT);renderT=setTimeout(()=>{const a=FZR.activeElement;if(a&&a.matches&&a.matches('input,textarea')&&a.closest('#view, dialog')){a.addEventListener('blur',scheduleRender,{once:true});return;}renderCuentas();render();},120);}
async function initDB(){
  try{DB=FZO&&FZO.db?(typeof FZO.db==='function'?await FZO.db():FZO.db):(window.claude&&window.claude.use?await window.claude.use('db'):null);}catch(e){DB=null;}
  if(!DB){setSync();return;}
  state={movimientos:[],config:state.config,gastos:[],banco:[],links:[],caja:[]};synced={};
  Object.entries(COLS).forEach(([k,c])=>{DB.collection(c).onSnapshot(s=>{
    Object.keys(synced).forEach(p=>{if(p.startsWith(c+'/'))delete synced[p];});
    const arr=s.docs.map(d=>{const raw=JSON.stringify(d.data());synced[c+'/'+d.id]=raw;return JSON.parse(raw);});
    if(k==='banco')arr.sort((a,b)=>(a.ord??0)-(b.ord??0));
    state[k]=arr;scheduleRender();setSync();
  },e=>{syncFail=e&&e.code||'error';setSync();});});
  DB.doc('fz_config/main').onSnapshot(s=>{if(s.exists){const raw=JSON.stringify(s.data());synced['fz_config/main']=raw;state.config=Object.assign({saldoInicial:0,saldoInicialBanco:0,umbralMinimo:5000,cuentas:['Caja Chica','Banco BCP'],socios:[],contado:{}},JSON.parse(raw));scheduleRender();}},()=>{});
  setSync();
}
function ask(msg,ok){return new Promise(res=>{const d=$('#ask');d.innerHTML=`<p style="margin:0 0 20px;line-height:22px;white-space:pre-line">${esc(msg)}</p><div class="row" style="justify-content:flex-end"><button class="btn" type="button" data-r="0">Cancelar</button><button class="btn primary" type="button" data-r="1">${esc(ok||'Continuar')}</button></div>`;
  d.querySelectorAll('[data-r]').forEach(b=>b.addEventListener('click',()=>{d.close();res(b.dataset.r==='1');}));d.addEventListener('cancel',()=>res(false),{once:true});d.showModal();});}

/* ---------------- Vinculación manual Banco ↔ gastos ---------------- */
let LG={},LB={};
function idx(){ LG={};LB={}; state.links.forEach(l=>{if(esCob(l.g)&&!crmById(l.g))return;(LG[l.g]=LG[l.g]||[]).push(l.b);(LB[l.b]=LB[l.b]||[]).push(l.g);}); }
/* ---------------- Cobros de la Central (solo lectura: se registran en Cotizaciones / Finanzas → Cobranzas) ----------------
   Cada cobro llega con {id, qid, fecha, monto, medio, tipo, numero, cliente, comp, nota, a365}.
   Destino: 'banco' (entró a la cuenta BCP → se vincula con su abono), 'caja' (efectivo en una caja chica) o '' (por ubicar).
   Por defecto: Transferencia → banco, Efectivo → caja; Billetera digital / Otro → por ubicar. Se guarda en config.cobros[id]. */
let CRMC=null;
const esCob=id=>/^c[qa]_/.test(String(id||''));
const hayCentral=()=>!!(FZO&&typeof FZO.cobros==='function');
function crm(){if(CRMC)return CRMC;let L=[];try{L=hayCentral()?(FZO.cobros()||[]):[];}catch(e){console.error(e);L=[];}
  CRMC=L.filter(c=>c&&c.id&&c.fecha&&+c.monto>0).map(c=>({...c,fecha:String(c.fecha).slice(0,10),monto:r2(+c.monto)}));CRMC.map_=Object.fromEntries(CRMC.map(c=>[c.id,c]));return CRMC;}
const crmById=id=>esCob(id)?crm().map_[id]||null:null;
const cobCfg=id=>(state.config.cobros||{})[id]||{};
function cobDestDef(c){const m=norm(c.medio);return /transf/.test(m)?'banco':/efectivo/.test(m)?'caja':'';}
function cobDest(c){const x=cobCfg(c.id).d;return x===undefined?cobDestDef(c):x;}
function cobCaja(c){const x=cobCfg(c.id).caja;return x&&cajaById(x)?x:((cajas().find(k=>k.activa!==false)||cajas()[0]||{}).id||'');}
function setCobDest(id,d,caja){const m={...(state.config.cobros||{})},c=crmById(id);m[id]={d};if(d==='caja'&&caja)m[id].caja=caja;
  if(c&&d===cobDestDef(c)&&!(d==='caja'&&caja&&caja!==((cajas().find(k=>k.activa!==false)||cajas()[0]||{}).id)))delete m[id];
  state.config.cobros=m;if(d!=='banco')state.links=state.links.filter(l=>l.g!==id);}
const cobDesc=c=>'Cobro'+(c.numero?' N° '+c.numero:'')+' · '+(c.cliente||'cliente');
const cobSub=c=>c.tipoK==='saldo'||c.a365?'Cobranza Cuentas por Cobrar (crédito)':'Venta al Contado';
const COB_D={banco:'Cuenta de la empresa (BCP)',caja:'Caja chica (efectivo)','':'Por ubicar'};
const cobRem=c=>r2(c.monto-linkedAmt(c.id));
// Cobros que piden una acción: por ubicar, o al banco sin vincular en un mes que ya tiene estado de cuenta.
function cobrosPend(m){const bm=bancoMeses();return crm().filter(c=>(!m||mesDe(c.fecha)===m)&&(cobDest(c)===''||(cobDest(c)==='banco'&&bm.has(mesDe(c.fecha))&&cobRem(c)>0.004)));}
// Una línea de abono puede explicar un cobro aunque ya esté clasificada (p. ej. “Venta al contado”): al vincular, el cobro reemplaza esa clasificación.
const dispB=b=>(LB[b.id]||[]).length?faltante(b):bAmt(b);
const abonoLibre=b=>b.abono>0&&!String(b.cls||'').startsWith('apo:')&&dispB(b)>0.004;
function coincCobros(){const out={},usedB=new Set(),P=[];
  cobrosPend().filter(c=>cobDest(c)==='banco').forEach(c=>{const rem=cobRem(c);state.banco.filter(b=>abonoLibre(b)&&!(LB[b.id]||[]).includes(c.id)).forEach(b=>{const d=Math.abs(dayN(b.fecha)-dayN(c.fecha));
    if(Math.abs(dispB(b)-rem)<0.005&&d<=7)P.push({c:c.id,b:b.id,d,cls:!!b.cls&&!(LB[b.id]||[]).length});});});
  P.sort((x,y)=>(x.cls-y.cls)||x.d-y.d);P.forEach(p=>{if(out[p.c]||usedB.has(p.b))return;out[p.c]=p;usedB.add(p.b);});return out;}
const bById=id=>state.banco.find(b=>b.id===id), gById=id=>state.gastos.find(g=>g.id===id);
const GA=()=>state.gastos.filter(g=>!g.ignorado);
const bancoMeses=()=>new Set(state.banco.map(b=>mesDe(b.fecha)));
const esBanco=c=>/banco/i.test(c||'');
// Todo lo que se puede vincular con una línea del banco: gastos del Forms pagados con la cuenta de la empresa
// y movimientos del registro rápido hechos en una cuenta de banco.
function itemById(id){
  const g=gById(id); if(g) return {id,kind:'forms',fecha:g.fecha,desc:g.desc,monto:g.monto,tipo:'egreso',quien:g.quien};
  const m=state.movimientos.find(x=>x.id===id); if(m) return {id,kind:'manual',fecha:m.fecha,desc:m.descripcion||m.subcategoria,monto:m.monto,tipo:m.tipo,quien:'Registro rápido'};
  const c=crmById(id); if(c) return {id,kind:'crm',fecha:c.fecha,desc:cobDesc(c),monto:c.monto,tipo:'ingreso',quien:'Central · '+(c.medio||'cobro')};
  return null;
}
function items(){ const a=[];
  GA().forEach(g=>{if(g.medio===EMP)a.push(itemById(g.id));});
  state.movimientos.forEach(m=>{if(esBanco(m.cuenta))a.push(itemById(m.id));});
  crm().forEach(c=>{if(cobDest(c)==='banco')a.push(itemById(c.id));});
  return a; }
function linkedAmt(id){ // monto del banco atribuido a este gasto (si una operación paga varios gastos, se reparte)
  const me=itemById(id); if(!me) return 0;
  return r2((LG[id]||[]).reduce((a,bid)=>{const b=bById(bid);if(!b)return a;const its=(LB[bid]||[]).map(itemById).filter(Boolean);const tot=its.reduce((x,i)=>x+i.monto,0)||1;return a+(b.cargo||b.abono)*me.monto/tot;},0));
}
function itemEstado(id){
  const it=itemById(id); if(!it) return ['—','neutral'];
  if(!(LG[id]||[]).length) return bancoMeses().has(mesDe(it.fecha))?['Falta vincular','bad']:['Falta estado de cuenta','warn'];
  const d=r2(it.monto-linkedAmt(id));
  return Math.abs(d)<0.005?['Conciliado','ok']:d>0?['Vinculado en parte · faltan '+fmt(d),'warn']:['Monto distinto','bad'];
}
function gastoEstado(g){
  if(g.medio===EMP) return itemEstado(g.id);
  if(g.medio===CAJA) return ['Caja chica','info'];
  if(isSocio(g.medio)) return ['Préstamo de '+socioDe(g.medio).split(' ')[0],'info'];
  if(g.medio===CF) return ['Solo crédito fiscal','neutral'];
  return ['Revisar medio de pago','bad'];
}
const CLSL={gasto_sc:'Sin comprobante · concepto por definir',comision:'Comisión bancaria',fondo:'Fondo de caja chica',venta:'Venta al contado',cobranza:'Cobranza de crédito',prestamo:'Préstamo bancario',otro:'Otro ingreso'};
function bancoEstado(b){
  if((LB[b.id]||[]).length) return ['Vinculado','ok'];
  const c=b.cls||'';
  if(c.startsWith('dev:')) return ['Devolución a '+c.slice(4).split(' ')[0],'info'];
  if(c.startsWith('apo:')) return ['Préstamo de '+c.slice(4).split(' ')[0],'info'];
  if(c.startsWith('k:')) return [clsLabel(c)+(scB(b)?' · sin comprobante':''),scB(b)?'warn':'neutral'];
  if(CLSL[c]) return [CLSL[c],'neutral'];
  return ['Por explicar','bad'];
}
const bAmt=b=>b.cargo||b.abono;
// Cuánto de una línea del banco ya está explicado por los gastos vinculados (una operación puede pagar varios gastos).
const asignado=b=>r2(Math.min(bAmt(b),(LB[b.id]||[]).map(itemById).filter(Boolean).reduce((a,i)=>a+i.monto,0)));
const faltante=b=>(LB[b.id]||[]).length?r2(bAmt(b)-asignado(b)):b.cls?0:r2(bAmt(b)-asignado(b));
const bancoPend=()=>state.banco.filter(b=>(!b.cls||(LB[b.id]||[]).length)&&faltante(b)>0.004);
function vincular(gid,bid){if(!state.links.some(l=>l.g===gid&&l.b===bid))state.links.push({g:gid,b:bid,en:hoyISO()});const b=bById(bid);if(b&&b.cls){b.cls='';delete b.sc;}}
const hoyISO=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
function socioNames(){const s=new Set(state.config.socios||[]);GA().forEach(g=>isSocio(g.medio)&&s.add(socioDe(g.medio)));return [...s];}
const cajaOrigen=c=>c.origen||(c.socio?'socio':'otro');

/* ---------------- Movimientos del flujo ---------------- */
function subDeGasto(g){
  const t=norm(g.tipo),d=norm(g.desc);
  if(t.includes('movilidad')||/gasolina|gasohol|combustible|peaje|estacionamiento|taxi|g-premium|gas premium/.test(d)) return 'Movilidad y Combustible';
  if(t.includes('personal')) return 'Planilla / Operarios';
  if(t.includes('servicios')) return 'Servicios Básicos';
  if(t.includes('operativos')||/detergente|suavizante|insumo|quimic/.test(d)) return 'Insumos y Químicos';
  if(/banner|roll screen|volante|publicidad|polos/.test(d)) return 'Marketing';
  if(/llanta|freno|plumilla|mantenimiento/.test(d)) return 'Fletes y Logística';
  return 'Otros Egresos Operativos';
}
const ABONO_MAP={venta:['operativo','Venta al Contado'],cobranza:['operativo','Cobranza Cuentas por Cobrar (crédito)'],prestamo:['financiamiento','Préstamo Bancario Recibido'],otro:['operativo','Otros Ingresos Operativos']};
const NOSUMA='Falta vincular con el estado de cuenta';
function allMovs(){
  idx(); const out=[]; const bm=bancoMeses();
  const opsDe=id=>(LG[id]||[]).map(b=>bById(b)?.op).filter(Boolean).join(' + ');
  // 1. Registro rápido
  state.movimientos.forEach(m=>{const o={...m,origen:'manual'};
    if(m.tipo==='egreso'&&m.pagadoPor)out.push({...m,id:'mp:'+m.id,origen:'prestamo',tipo:'ingreso',categoria:'financiamiento',subcategoria:'Préstamo de Socio',descripcion:m.pagadoPor+' pagó: '+(m.descripcion||m.subcategoria)});
    if(esBanco(m.cuenta)){ if((LG[m.id]||[]).length) o.conciliado=opsDe(m.id)||'sí'; else if(bm.has(mesDe(m.fecha))) o.excluido=NOSUMA; }
    out.push(o);});
  // 2. Estado de cuenta: solo las líneas que no están vinculadas a un gasto (las vinculadas ya entran por el gasto)
  state.banco.forEach(b=>{ if((LB[b.id]||[]).length) return;
    const base={id:'b:'+b.id,fecha:b.fecha,cuenta:'Banco BCP',origen:'banco',ref:b.op}, c=b.cls||'';
    if(b.cargo>0){
      if(c.startsWith('k:')){const cc=c.slice(2);out.push({...base,tipo:'egreso',categoria:catDe('egreso',cc),subcategoria:cc,descripcion:(b.nota?b.nota+' · ':'')+b.desc,monto:b.cargo,sinComp:!!b.sc});}
      else if(c==='gasto_sc') out.push({...base,tipo:'egreso',categoria:'operativo',subcategoria:'Gastos sin comprobante',descripcion:(b.nota?b.nota+' · ':'')+b.desc,monto:b.cargo,sinComp:true});
      else if(c==='comision') out.push({...base,tipo:'egreso',categoria:'operativo',subcategoria:'Comisiones Bancarias',descripcion:b.desc,monto:b.cargo});
      else if(c.startsWith('dev:')) out.push({...base,tipo:'egreso',categoria:'financiamiento',subcategoria:'Devolución de Préstamo a Socio',descripcion:'Devolución a '+c.slice(4),monto:b.cargo});
      else if(c==='fondo') out.push({...base,tipo:'egreso',categoria:'operativo',subcategoria:'Traslado a caja chica',descripcion:b.desc+' → caja chica',monto:b.cargo,excluido:'Traslado banco → caja chica: no cambia la caja total'});
      else out.push({...base,tipo:'egreso',categoria:'operativo',subcategoria:'Otros Egresos Operativos',descripcion:b.desc,monto:b.cargo,pendiente:'Por explicar'});
    }
    if(b.abono>0){
      if(c.startsWith('k:')){const cc=c.slice(2);out.push({...base,id:'ba:'+b.id,tipo:'ingreso',categoria:catDe('ingreso',cc),subcategoria:cc,descripcion:(b.nota?b.nota+' · ':'')+b.desc,monto:b.abono});}
      else if(c.startsWith('apo:')) out.push({...base,id:'ba:'+b.id,tipo:'ingreso',categoria:'financiamiento',subcategoria:'Préstamo de Socio',descripcion:'Depósito de '+c.slice(4),monto:b.abono});
      else {const mp=ABONO_MAP[c]||['operativo','Otros Ingresos Operativos'];out.push({...base,id:'ba:'+b.id,tipo:'ingreso',categoria:mp[0],subcategoria:mp[1],descripcion:b.desc,monto:b.abono,pendiente:c?'':'Por explicar'});}
    }
  });
  // 3. Forms: una fila por cada respuesta del Forms
  GA().forEach(g=>{
    const base={id:'g:'+g.id,fecha:g.fecha,origen:'forms',tipo:'egreso',categoria:'operativo',subcategoria:subDeGasto(g),descripcion:g.desc,monto:g.monto,ref:g.quien};
    if(g.medio===EMP){const o={...base,cuenta:'Banco BCP'};
      if((LG[g.id]||[]).length) o.conciliado=opsDe(g.id)||'sí';
      else if(bm.has(mesDe(g.fecha))) o.excluido=NOSUMA; else o.pendiente='Provisional: falta estado de cuenta';
      out.push(o);}
    else if(isSocio(g.medio)){const n=socioDe(g.medio);
      out.push({...base,cuenta:'Pagó '+n.split(' ')[0]});
      out.push({...base,id:'gp:'+g.id,origen:'prestamo',tipo:'ingreso',categoria:'financiamiento',subcategoria:'Préstamo de Socio',descripcion:n+' pagó: '+g.desc,cuenta:'Pagó '+n.split(' ')[0]});}
    else if(g.medio===CAJA) out.push({...base,cuenta:'Caja Chica'});
    else out.push({...base,cuenta:'—',excluido:g.medio===CF?'Solo crédito fiscal: no movió caja':'Revisa el medio de pago'});
  });
  // 4. Entradas de efectivo a caja chica
  CE().forEach(c=>{const o=cajaOrigen(c),base={id:'c:'+c.id,fecha:c.fecha,origen:'caja',tipo:'ingreso',monto:c.monto,cuenta:'Caja Chica'};
    if(o==='socio') out.push({...base,categoria:'financiamiento',subcategoria:'Préstamo de Socio',descripcion:'Efectivo de '+c.socio+' a caja chica'+(c.obs?' · '+c.obs:'')});
    else if(o==='banco') out.push({...base,categoria:'operativo',subcategoria:'Traslado a caja chica',descripcion:'Retiro del banco a caja chica'+(c.obs?' · '+c.obs:''),excluido:'Traslado banco → caja chica: no cambia la caja total'});
    else out.push({...base,categoria:'operativo',subcategoria:'Otros Ingresos Operativos',descripcion:'Ingreso a caja chica'+(c.obs?' · '+c.obs:'')});
  });
  // 5. Cobros de la Central: entran por el banco (vinculados a su abono), por la caja chica, o quedan por ubicar
  crm().forEach(c=>{const d=cobDest(c),base={id:'q:'+c.id,fecha:c.fecha,origen:'central',tipo:'ingreso',categoria:'operativo',subcategoria:cobSub(c),descripcion:cobDesc(c)+(c.tipo?' · '+c.tipo:''),monto:c.monto,ref:c.numero||''};
    if(d==='banco'){const o={...base,cuenta:'Banco BCP'};if((LG[c.id]||[]).length)o.conciliado=opsDe(c.id)||'sí';else if(bm.has(mesDe(c.fecha)))o.excluido=NOSUMA;else o.pendiente='Provisional: falta estado de cuenta';out.push(o);}
    else if(d==='caja') out.push({...base,cuenta:'Caja Chica'});
    else out.push({...base,cuenta:'—',excluido:'Cobro por ubicar: indica si entró al banco o a la caja chica'});
  });
  return out;
}
const vivos=movs=>movs.filter(m=>!m.excluido);
const saldoBase=()=>r2((+state.config.saldoInicial||0)+(+state.config.saldoInicialBanco||0));

/* ---------------- Flujo por período ---------------- */
function periodKey(f,t){ if(t==='mes')return mesDe(f); const d=new Date(f+'T00:00:00'),j=new Date(d.getFullYear(),0,1); return d.getFullYear()+'-S'+String(Math.ceil((((d-j)/86400000)+j.getDay()+1)/7)).padStart(2,'0'); }
const periodLabel=(k,t)=>t==='mes'?MES[+k.slice(5)-1]+' '+k.slice(0,4):k.replace('-S',' · Sem. ');
function computePeriods(t,movs,base){
  const G={}; vivos(movs).sort((a,b)=>a.fecha.localeCompare(b.fecha)).forEach(m=>{const k=periodKey(m.fecha,t);const g=G[k]=G[k]||{ingOp:0,egOp:0,ingInv:0,egInv:0,ingFin:0,egFin:0};
    const s=m.tipo==='ingreso'?'ing':'eg'; const c={operativo:'Op',inversion:'Inv',financiamiento:'Fin'}[m.categoria]; if(c)g[s+c]+=m.monto;});
  let saldo=base??saldoBase();
  return Object.keys(G).sort().map(k=>{const g=G[k];const fco=g.ingOp-g.egOp,fci=g.ingInv-g.egInv,fcf=g.ingFin-g.egFin,net=fco+fci+fcf,ini=saldo;saldo=ini+net;return {k,label:periodLabel(k,t),ini,...g,fco,fci,fcf,net,fin:saldo};});
}

/* ======================= PROYECCIÓN DE CAJA =======================
   Simula día a día desde hoy: cobros agendados de la Central (saldos de cotizaciones), cotizaciones pendientes × probabilidad,
   ventas por la meta de servicios × ticket (solo lo que falta para la meta del mes), costos variables, ingresos y egresos recurrentes,
   y el plan de devolución a socios. Luego agrupa por día, semana, mes, trimestre, semestre o año.
   Configuración en state.config.proy = {param, esc:{pes,base,opt}, rec:[], soc:{modo,cuota,dia,desde}, fotos:{YYYY-MM:{en,m}}, listo}. */
const PROY_ESC={pes:['Pesimista','Menos servicios, cobranza más lenta y algo de morosidad'],base:['Base','Tu ritmo actual con los supuestos de abajo'],opt:['Optimista','Más servicios y clientes que pagan puntual']};
const PROY_ESC_DEF={pes:{dem:70,tick:95,cob:85,atraso:15,cv:3,prob:20},base:{dem:100,tick:100,cob:100,atraso:3,cv:0,prob:40},opt:{dem:130,tick:105,cob:100,atraso:0,cv:-2,prob:60}};
const PROY_ESC_F=[['dem','Servicios (% de la meta)','%'],['tick','Ticket (% del promedio)','%'],['cob','Cobranza efectiva','%'],['atraso','Atraso de los clientes','días'],['cv','Costo variable (+/– puntos)','pts'],['prob','Cotizaciones pendientes que se cierran','%']];
const PROY_H={dia:['Diario',30,'dia','próximos 30 días'],sem13:['13 semanas',13,'sem','próximas 13 semanas'],sem:['Semanal',26,'sem','próximas 26 semanas'],mes:['Mensual',12,'mes','próximos 12 meses'],tri:['Trimestral',8,'tri','próximos 8 trimestres'],seme:['Semestral',4,'seme','próximos 4 semestres'],anio:['Anual',3,'anio','próximos 3 años']};
const PROY_FREC={mensual:'Mensual',quincenal:'Quincenal (15 y fin de mes)',semanal:'Semanal',anual:'Anual',unica:'Una sola vez'};
const PROY_FIJOS=['Planilla / Operarios','Alquiler','Servicios Básicos','Marketing','Comisiones Bancarias','Impuestos (IGV/Renta)','Otros Egresos Operativos','Gastos sin comprobante'];
const PROY_VAR=['Insumos y Químicos','Movilidad y Combustible','Fletes y Logística','Mantenimiento'];
let pH='sem13',pEsc='base',pComp=false,PHC=null,FZW_FOTO=0;
const isoN=n=>new Date(n*86400000).toISOString().slice(0,10);
const finMes=m=>new Date(Date.UTC(+m.slice(0,4),+m.slice(5,7),0)).toISOString().slice(0,10);
const addMes=(m,k)=>new Date(Date.UTC(+m.slice(0,4),+m.slice(5,7)-1+k,1)).toISOString().slice(0,7);
const cartera=()=>{try{return hayCentral()&&typeof FZO.cartera==='function'?(FZO.cartera()||[]):[];}catch(e){console.error(e);return [];}};
function saldoHoy(){const M=allMovs();return r2(saldoBase()+vivos(M).reduce((a,m)=>a+(m.tipo==='ingreso'?m.monto:-m.monto),0));}
// Promedios de los últimos 3 meses completos (sugerencias para los supuestos)
function histProy(){if(PHC)return PHC;
  const hoy=hoyISO(),M=[3,2,1].map(k=>addMes(hoy.slice(0,7),-k)),movs=vivos(allMovs()).filter(m=>M.includes(mesDe(m.fecha)));
  const op=movs.filter(m=>m.tipo==='ingreso'&&m.categoria==='operativo'),ingOp=r2(op.reduce((a,m)=>a+m.monto,0));
  const porSub={};movs.filter(m=>m.tipo==='egreso'&&m.categoria==='operativo').forEach(m=>porSub[m.subcategoria]=r2((porSub[m.subcategoria]||0)+m.monto));
  const conIng=M.filter(k=>op.some(m=>mesDe(m.fecha)===k)).length||1,ingM=r2(ingOp/conIng);
  const C=cartera().filter(q=>!q.a365&&['Realizada','Pagada'].includes(q.status)&&q.total>0);
  const ticket=C.length?Math.round(C.reduce((a,q)=>a+q.total,0)/C.length):180;
  const varT=PROY_VAR.reduce((a,k)=>a+(porSub[k]||0),0);
  PHC={M,ingM,conIng,porSub,ticket,nTicket:C.length,servicios:Math.max(1,Math.round(ingM/ticket))||20,cv:ingOp?Math.min(40,Math.max(5,Math.round(varT/ingOp*100))):15,saldo:saldoHoy()};return PHC;}
function proy(){const p=state.config.proy||{},e=p.esc||{};
  return {param:p.param||{},esc:{pes:{...PROY_ESC_DEF.pes,...(e.pes||{})},base:{...PROY_ESC_DEF.base,...(e.base||{})},opt:{...PROY_ESC_DEF.opt,...(e.opt||{})}},
    rec:p.rec||[],soc:{modo:'no',cuota:{},dia:28,desde:'',...(p.soc||{})},fotos:p.fotos||{},listo:!!p.listo};}
function parP(){const h=histProy(),p=proy().param,v=(k,d)=>p[k]===undefined||p[k]===null||p[k]===''?d:+p[k];
  return {servicios:v('servicios',h.servicios),ticket:v('ticket',h.ticket),crec:v('crec',0),cv:v('cv',h.cv),contado:v('contado',100),credito:v('credito',15),a365:v('a365',45)};}
function setProy(fn,noRender){const p=JSON.parse(JSON.stringify(state.config.proy||{}));fn(p);state.config.proy=p;PHC=null;save();if(!noRender)render();}
const recMensual=r=>{const v=+r.monto||0,F=r.frec||'mensual';return F==='mensual'?v:F==='quincenal'?2*v:F==='semanal'?v*52/12:F==='anual'?v/12:0;};
function fechasRec(r,d0,d1){const out=[],F=r.frec||'mensual';
  if(F==='unica'){if(r.fecha&&dayN(r.fecha)>=d0&&dayN(r.fecha)<=d1)out.push(r.fecha);return out;}
  if(F==='semanal'){let n=dayN(r.fecha||r.desde||isoN(d0));while(n<d0)n+=7;for(;n<=d1;n+=7)out.push(isoN(n));return out;}
  const mEnd=isoN(d1).slice(0,7);
  for(let m=isoN(d0).slice(0,7);m<=mEnd;m=addMes(m,1)){const dim=+finMes(m).slice(8);
    const dias=F==='quincenal'?[15,dim]:F==='anual'?(r.fecha&&r.fecha.slice(5,7)===m.slice(5)?[+r.fecha.slice(8)]:[]):[Math.min(+r.dia||dim,dim)];
    dias.forEach(d=>{const f=m+'-'+String(Math.min(d,dim)).padStart(2,'0'),n=dayN(f);if(n>=d0&&n<=d1)out.push(f);});}
  return out;}
function finHorizonte(H,T){const h=PROY_H[H],t0=dayN(T),u=h[2];
  if(u==='dia')return t0+h[1]-1;
  if(u==='sem'){const dow=(new Date(T+'T00:00:00Z').getUTCDay()+6)%7;return t0-dow+7*h[1]-1;}
  const mm={mes:1,tri:3,seme:6,anio:12}[u],m0=T.slice(0,7),y=m0.slice(0,4),mo=+m0.slice(5);
  const start=u==='tri'?y+'-'+String(Math.floor((mo-1)/3)*3+1).padStart(2,'0'):u==='seme'?y+'-'+(mo<=6?'01':'07'):u==='anio'?y+'-01':m0;
  return dayN(finMes(addMes(start,mm*h[1]-1)));}
// Cobros esperados de la Central (para la tabla “Cobros agendados”)
function cobrosEsperados(ek){const P=parP(),E=proy().esc[ek],T=hoyISO(),t0=dayN(T),out=[];
  cartera().forEach(q=>{const f=String(q.fecha||'').slice(0,10)||T;
    if(['Aceptada','Realizada','Pagada'].includes(q.status)&&q.saldo>0.004){const b=q.a365?dayN(f)+P.a365:dayN(f);out.push({q,f:isoN(Math.max(t0,b)+E.atraso),v:r2(q.saldo*E.cob/100),tipo:'agendado'});}
    else if(q.status==='Pendiente'&&q.total>0){const ff=f>=T?f:T,b=q.a365?dayN(ff)+P.a365:dayN(ff);out.push({q,f:isoN(b+E.atraso),v:r2(q.total*E.prob/100*E.cob/100),tipo:'pendiente'});}});
  return out.sort((a,b)=>a.f.localeCompare(b.f));}
function simular(ek,H){
  const P=parP(),pr=proy(),E=pr.esc[ek],T=hoyISO(),t0=dayN(T),fin=finHorizonte(H,T),N=fin-t0+1;
  const D=Array.from({length:N},(_,i)=>({f:isoN(t0+i),cob:0,ven:0,pipe:0,oi:0,fij:0,vr:0,inv:0,fi:0,soc:0}));
  const at=(f,k,v)=>{let i=dayN(f)-t0;if(i<0)i=0;if(i<N)D[i][k]+=v;};
  const cv=Math.max(0,P.cv+E.cv)/100,cob=E.cob/100,prob=E.prob/100,agFut={};
  // 1. Cartera de la Central: saldos por cobrar y cotizaciones pendientes
  cartera().forEach(q=>{const f=String(q.fecha||'').slice(0,10)||T,fe=f>=T?f:T,mq=fe.slice(0,7),tot=+q.total||0;
    if(['Aceptada','Realizada','Pagada'].includes(q.status)){if(f>=T){agFut[mq]=(agFut[mq]||0)+tot;at(f,'vr',-tot*cv);}
      if(q.saldo>0.004){const b=q.a365?dayN(f)+P.a365:dayN(f);at(isoN(Math.max(t0,b)+E.atraso),'cob',q.saldo*cob);}}
    else if(q.status==='Pendiente'&&tot>0){agFut[mq]=(agFut[mq]||0)+tot*prob;at(fe,'vr',-tot*prob*cv);const b=q.a365?dayN(fe)+P.a365:dayN(fe);at(isoN(b+E.atraso),'pipe',tot*prob*cob);}});
  // 2. Ventas por la meta: solo lo que falta para llegar a la meta del mes (lo agendado ya cuenta)
  const m0=T.slice(0,7),mFin=isoN(fin).slice(0,7);let i=0;
  for(let m=m0;m<=mFin;m=addMes(m,1),i++){const dim=+finMes(m).slice(8),d0=m===m0?+T.slice(8):1,rest=dim-d0+1;
    const meta=P.servicios*E.dem/100*Math.pow(1+P.crec/100,i)*P.ticket*E.tick/100*rest/dim,extra=Math.max(0,meta-(agFut[m]||0));if(extra<=0)continue;const pd=extra/rest;
    for(let d=d0;d<=dim;d++){const f=m+'-'+String(d).padStart(2,'0');at(f,'vr',-pd*cv);at(f,'ven',pd*P.contado/100*cob);if(P.contado<100)at(isoN(dayN(f)+P.credito+E.atraso),'ven',pd*(1-P.contado/100)*cob);}}
  // 3. Ingresos y egresos recurrentes o puntuales
  pr.rec.forEach(r=>{if(r.activo===false)return;const v=+r.monto||0;if(!v)return;const cat=catDe(r.tipo,r.concepto),sg=r.tipo==='ingreso'?1:-1;
    const k=cat==='financiamiento'?'fi':cat==='inversion'?'inv':r.tipo==='ingreso'?'oi':'fij';
    const d0=Math.max(t0,r.desde?dayN(r.desde):t0),d1=Math.min(fin,r.hasta?dayN(r.hasta):fin);if(d1>=d0)fechasRec(r,d0,d1).forEach(f=>at(f,k,sg*v));});
  // 4. Día a día con el plan de devolución a socios
  const u=+state.config.umbralMinimo||0,so=pr.soc,deuda={},pagos=[];socioNames().forEach(n=>deuda[n]=Math.max(0,socioResumen(n).saldo));const deuda0={...deuda};
  let saldo=histProy().saldo;
  D.forEach(x=>{x.ini=saldo;saldo+=x.cob+x.ven+x.pipe+x.oi+x.fij+x.vr+x.inv+x.fi;
    const totD=Object.values(deuda).reduce((a,v)=>a+v,0);
    if(totD>0.004&&so.modo!=='no'&&(!so.desde||x.f.slice(0,7)>=so.desde)){const ult=finMes(x.f.slice(0,7));
      if(so.modo==='fijo'&&x.f===(+so.dia>=+ult.slice(8)?ult:x.f.slice(0,8)+String(+so.dia||28).padStart(2,'0')))Object.keys(deuda).forEach(n=>{const c=r2(Math.min(deuda[n],+((so.cuota||{})[n])||0));if(c>0){deuda[n]=r2(deuda[n]-c);saldo-=c;x.soc-=c;pagos.push({f:x.f,n,v:c});}});
      if(so.modo==='auto'&&x.f===ult){const ex=saldo-u;if(ex>0.5){const pay=Math.min(ex,totD);Object.keys(deuda).forEach(n=>{const c=r2(pay*deuda[n]/totD);if(c>0){deuda[n]=r2(Math.max(0,deuda[n]-c));saldo-=c;x.soc-=c;pagos.push({f:x.f,n,v:c});}});}}}
    x.fin=saldo;});
  return {D,pagos,deuda0,deudaFin:deuda,u,fin,t0,ek};}
function pKey(f,u){if(u==='dia')return f;if(u==='sem'){const dow=(new Date(f+'T00:00:00Z').getUTCDay()+6)%7;return isoN(dayN(f)-dow);}
  if(u==='mes')return f.slice(0,7);const y=f.slice(0,4),m=+f.slice(5,7);return u==='tri'?y+'-T'+Math.ceil(m/3):u==='seme'?y+'-S'+(m<=6?1:2):y;}
function pLabel(k,u){const D=['dom','lun','mar','mié','jue','vie','sáb'];if(u==='dia')return D[new Date(k+'T00:00:00Z').getUTCDay()]+' '+fdate(k).slice(0,5);if(u==='sem')return 'Sem. '+fdate(k).slice(0,5);
  if(u==='mes')return MES[+k.slice(5)-1]+' '+k.slice(0,4);if(u==='tri')return 'Trim. '+k.slice(6)+' · '+k.slice(0,4);if(u==='seme')return (k.slice(6)==='1'?'1er':'2do')+' semestre '+k.slice(0,4);return k;}
function agrupar(S,u){const G=[];let c=null;S.D.forEach(x=>{const k=pKey(x.f,u);if(!c||c.k!==k){c={k,label:pLabel(k,u),ini:x.ini,cob:0,ven:0,pipe:0,oi:0,fij:0,vr:0,inv:0,fi:0,soc:0,fin:0,min:Infinity,minF:''};G.push(c);}
  ['cob','ven','pipe','oi','fij','vr','inv','fi','soc'].forEach(q=>c[q]+=x[q]);c.fin=x.fin;if(x.fin<c.min){c.min=x.fin;c.minF=x.f;}});
  G.forEach(g=>{g.ing=g.cob+g.ven+g.pipe+g.oi;g.eg=-(g.fij+g.vr);});return G;}
const pUnidad=H=>PROY_H[H][2];
function proyAlerta(S){const u=S.u,D=S.D,ini=D[0].ini,below=D.find(x=>x.fin<u-0.004),neg=D.find(x=>x.fin<-0.004),minD=D.reduce((a,x)=>x.fin<a.fin?x:a,D[0]);
  const dias=f=>Math.round(dayN(f)-S.t0),cuando=f=>fdate(f)+(dias(f)?` (en ${dias(f)} día${dias(f)===1?'':'s'})`:' (hoy)');
  const recu=below&&D.find(x=>x.f>below.f&&x.fin>=u),recN=neg&&D.find(x=>x.f>neg.f&&x.fin>=0);
  let tone='ok',t='';
  if(ini<u-0.004){tone=neg?'bad':'warn';t=`Hoy ya estás por debajo de la caja mínima (${fmt(u)}).`+(neg?` La caja quedaría en negativo el ${cuando(neg.f)}`+(recN?` y volvería a positivo el ${fdate(recN.f)}.`:' y no vuelve a positivo en este horizonte.'):'')+(recu?` Recuperas la caja mínima el ${fdate(recu.f)}.`:' No se recupera la caja mínima en este horizonte.');}
  else if(below){tone=neg?'bad':'warn';t=`La caja bajaría de la caja mínima (${fmt(u)}) el ${cuando(below.f)}.`+(neg?` Quedaría en negativo el ${cuando(neg.f)}.`:'')+(recu?` La recuperas el ${fdate(recu.f)}.`:'');}
  else t=`La caja se mantiene sobre la caja mínima (${fmt(u)}) en todo el horizonte.`;
  return {tone,t,below,neg,minD};}
function tomarFoto(auto){const S=simular('base','mes'),G=agrupar(S,'mes'),hoy=hoyISO(),m={};G.forEach(g=>m[g.k]={ing:r2(g.ing),eg:r2(g.eg),fin:r2(g.fin)});
  setProy(p=>{p.fotos=p.fotos||{};p.fotos[hoy.slice(0,7)]={en:hoy,m};const ks=Object.keys(p.fotos).sort();while(ks.length>24)delete p.fotos[ks.shift()];},auto);if(!auto)toast('Foto de la proyección guardada');}
function sugerirRec(){const h=histProy(),L=[];
  PROY_FIJOS.forEach(s=>{let v=Math.round((h.porSub[s]||0)/3),nota='';if(s==='Planilla / Operarios'&&v<3300){v=3300;nota='2 operarios: S/ 1,500 + S/ 1,800';}if(v>0)L.push({id:uid('R'),nombre:s==='Planilla / Operarios'?'Planilla':s,nota,tipo:'egreso',concepto:s==='Gastos sin comprobante'?'Otros Egresos Operativos':s,monto:v,frec:'mensual',dia:s==='Planilla / Operarios'?30:15,activo:true,origen:'historial'});});
  return L;}
function vProy(){
  const pr=proy(),P=parP(),hh=histProy(),u=pUnidad(pH),T=hoyISO();
  if(!pr.listo&&!pr.rec.length)return `<div class="row between" style="margin-bottom:16px"><h3>Proyección de caja</h3></div>
   <div class="card" style="max-width:820px"><h3>Arma tu proyección en un paso</h3>
    <p class="hint" style="margin:6px 0 12px">La proyección parte de tu saldo de hoy (${fmt(hh.saldo)}) y suma lo que ya sabes que viene: los saldos por cobrar de la Central, las cotizaciones pendientes según su probabilidad, la meta de servicios por mes y tus gastos fijos. Puedes cambiar cada supuesto después.</p>
    <div class="small" style="display:grid;gap:4px;margin-bottom:14px"><span>Ingresos operativos promedio de tus últimos meses: <b class="num">${fmt(hh.ingM)}</b> al mes</span><span>Ticket promedio: <b class="num">${fmt(hh.ticket)}</b>${hh.nTicket?` <span class="hint">(${hh.nTicket} servicio(s) de la Central)</span>`:' <span class="hint">(valor de referencia)</span>'}</span><span>Gastos fijos que se repiten (planilla, servicios, alquiler…): <b class="num">${fmt(sugerirRec().reduce((a,r)=>a+r.monto,0))}</b> al mes</span></div>
    <div class="row"><button class="btn primary" data-act="p-sugerir">${ic('check')} Usar mis últimos 3 meses como base</button><button class="btn" data-act="p-listo">Empezar en blanco</button></div></div>`;
  const escs=pComp?['pes','base','opt']:[pEsc],SS={};escs.forEach(k=>SS[k]=simular(k,pH));const S=SS[pEsc]||SS.base,G=agrupar(S,u),A=proyAlerta(S);
  const sum=k=>G.reduce((a,g)=>a+g[k],0),fijosM=r2(pr.rec.filter(r=>r.activo!==false&&r.tipo==='egreso'&&catDe('egreso',r.concepto)==='operativo').reduce((a,r)=>a+recMensual(r),0));
  const cvp=Math.max(0,P.cv+pr.esc[pEsc].cv)/100,eq=P.ticket*(1-cvp)>0?Math.ceil(fijosM/(P.ticket*(1-cvp))):null;
  const dTot=Object.values(S.deuda0).reduce((a,v)=>a+v,0),dFin=Object.values(S.deudaFin).reduce((a,v)=>a+v,0);
  const porCob=cartera().filter(q=>['Aceptada','Realizada','Pagada'].includes(q.status)).reduce((a,q)=>a+(q.saldo||0),0);
  const o=(v,l,c)=>`<option value="${esc(v)}" ${c===v?'selected':''}>${esc(l)}</option>`;
  const head=`<div class="row between" style="margin-bottom:12px"><h3>Proyección de caja</h3><div class="row" style="min-width:0;max-width:100%">
    <div class="subtabs" style="margin:0;width:auto">${Object.entries(PROY_H).map(([k,v])=>`<button aria-pressed="${pH===k}" data-act="p-h" data-v="${k}">${v[0]}</button>`).join('')}</div></div></div>
   <div class="row between" style="margin-bottom:16px"><div class="subtabs" style="margin:0;width:auto">${Object.entries(PROY_ESC).map(([k,v])=>`<button aria-pressed="${pEsc===k}" data-act="p-esc" data-v="${k}" title="${esc(v[1])}">${v[0]}</button>`).join('')}</div>
    <label class="row small" style="gap:6px"><input type="checkbox" data-pcomp="1" ${pComp?'checked':''} style="width:18px;height:18px"> Comparar los 3 escenarios en el gráfico</label></div>`;
  const alerta=`<div class="alert ${A.tone}"><div><b>${A.tone==='ok'?'Sin alertas de caja':A.tone==='bad'?'Alerta de caja':'Atención'}</b> · ${esc(A.t)} <span class="hint">Escenario ${PROY_ESC[pEsc][0].toLowerCase()} · ${PROY_H[pH][3]}.</span></div></div>`;
  const kpis=`<div class="mstats k4" style="margin-bottom:16px">
   <div class="mstat"><div class="kl">Saldo hoy</div><div class="kv num ${hh.saldo<0?'t-bad':''}">${fmt(hh.saldo)}</div><div class="hint">caja + banco</div></div>
   <div class="mstat"><div class="kl">Saldo al ${fdate(isoN(S.fin))}</div><div class="kv num ${G[G.length-1].fin<0?'t-bad':G[G.length-1].fin<S.u?'t-warn':'t-ok'}">${fmt(G[G.length-1].fin)}</div><div class="hint">fin del horizonte</div></div>
   <div class="mstat"><div class="kl">Punto más bajo</div><div class="kv num ${A.minD.fin<0?'t-bad':A.minD.fin<S.u?'t-warn':''}">${fmt(A.minD.fin)}</div><div class="hint">el ${fdate(A.minD.f)}</div></div>
   <div class="mstat"><div class="kl">Punto de equilibrio</div><div class="kv num">${eq===null?'—':eq+' serv.'}</div><div class="hint">al mes para cubrir ${fmt(fijosM)} de gastos fijos · meta ${Math.round(P.servicios*pr.esc[pEsc].dem/100)}</div></div>
   ${hayCentral()?`<div class="mstat"><div class="kl">Por cobrar en la Central</div><div class="kv num">${fmt(porCob)}</div><div class="hint">saldos de servicios aceptados o realizados</div></div>`:''}
   <div class="mstat"><div class="kl">Ingresos del horizonte</div><div class="kv num t-ok">${fmt(sum('ing'))}</div><div class="hint">cobros ${fmt(sum('cob')+sum('pipe'))} · ventas meta ${fmt(sum('ven'))}</div></div>
   <div class="mstat"><div class="kl">Egresos del horizonte</div><div class="kv num t-bad">${fmt(sum('eg'))}</div><div class="hint">fijos ${fmt(-sum('fij'))} · variables ${fmt(-sum('vr'))}</div></div>
   <div class="mstat"><div class="kl">Deuda con socios</div><div class="kv num ${dFin>0?'t-warn':''}">${fmt(dFin)}</div><div class="hint">al final · hoy ${fmt(dTot)}${pr.soc.modo==='no'?' · sin plan de devolución':''}</div></div></div>`;
  const evo=`<div class="card" style="margin-bottom:16px"><div class="row between"><h3>Saldo proyectado</h3><span class="hint small">${pComp?'Líneas: saldo de cada escenario':'Barras: ingresos y egresos · línea: saldo'} · punteada: caja mínima</span></div><div class="chart-box" style="height:320px;margin-top:8px"><canvas id="pchart"></canvas></div></div>`;
  const pg=pageOf('proy_'+pH,G,u==='dia'?31:25);
  const tabla=`<div class="card" style="margin-bottom:16px"><div class="row between"><h3>Flujo proyectado · ${esc(PROY_H[pH][0].toLowerCase())}</h3><button class="btn ghost sm" data-act="p-export">${ic('download')} Exportar a Excel</button></div>
   <p class="hint" style="margin:2px 0 10px">Cobros agendados: saldos de la Central y cotizaciones pendientes (según su probabilidad). Ventas por la meta: lo que falta para la meta de servicios del mes. Las filas en rojo terminan bajo la caja mínima.</p>
   <div class="tw"><table><thead><tr><th>Período</th><th class="n">Saldo inicial</th><th class="n">Ingresos</th><th class="n">Egresos</th><th class="n">Socios</th><th class="n">Saldo final</th></tr></thead><tbody>
   ${pg.rows.map(g=>{const oi=g.oi+g.inv+g.fi;return `<tr class="${g.fin<S.u?'pbaja':''}"><td class="nw"><b>${esc(g.label)}</b>${g.min<0&&g.fin>=0?`<div class="hint">baja a ${fmt(g.min)} el ${fdate(g.minF).slice(0,5)}</div>`:''}</td><td class="n">${fmt(g.ini)}</td>
    <td class="n"><span class="t-ok">${fmt(g.cob+g.pipe+g.ven+oi)}</span><div class="hint" style="white-space:normal">agendado ${fmt(g.cob+g.pipe)}<br>meta ${fmt(g.ven)}${Math.abs(oi)>0.004?'<br>otros '+fmt(oi):''}</div></td>
    <td class="n"><span class="t-bad">${fmt(g.fij+g.vr)}</span><div class="hint" style="white-space:normal">fijos ${fmt(-g.fij)}<br>variables ${fmt(-g.vr)}</div></td><td class="n">${Math.abs(g.soc)>0.004?fmt(g.soc):'<span class="hint">—</span>'}</td><td class="n"><b class="${g.fin<0?'t-bad':''}">${fmt(g.fin)}</b></td></tr>`;}).join('')}</tbody></table></div>${pg.html}</div>`;
  // Supuestos y escenarios
  const inp=(k,l,v,suf,h)=>`<div class="field"><label>${l}</label><div class="row" style="gap:6px;flex-wrap:nowrap"><input class="input mono" type="number" step="any" data-pp="${k}" value="${v}" style="min-width:0">${suf?`<span class="hint small">${suf}</span>`:''}</div>${h?`<span class="hint small">${h}</span>`:''}</div>`;
  const sup=`<details class="card" style="margin-bottom:16px" ${pr.param.servicios===undefined?'':''} data-pdet="sup" open><summary><h3 style="display:inline">Supuestos y escenarios</h3> <span class="hint">· qué pasa si…</span></summary>
   <div class="fg" style="margin-top:12px;grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">
    ${inp('servicios','Meta de servicios por mes',P.servicios,'serv.',`Historial ≈ ${hh.servicios} al mes`)}
    ${inp('ticket','Ticket promedio',P.ticket,'S/',hh.nTicket?`Central: ${fmt(hh.ticket)}`:'Referencia del tarifario')}
    ${inp('crec','Crecimiento mensual',P.crec,'%','Sobre la meta, mes a mes')}
    ${inp('cv','Costo variable por servicio',P.cv,'%',`Insumos y movilidad · historial ${hh.cv}%`)}
    ${inp('contado','Cobrado el mismo día',P.contado,'%','El resto, a crédito')}
    ${inp('credito','Días de crédito',P.credito,'días','Para la parte a crédito')}
    ${hayCentral()?inp('a365','Días hasta el pago de A365',P.a365,'días','Desde el servicio hasta la liquidación pagada'):''}
    <div class="field"><label>Caja mínima</label><div class="row" style="gap:6px;flex-wrap:nowrap"><input class="input mono" type="number" step="any" data-pu="1" value="${+state.config.umbralMinimo||0}" style="min-width:0"><span class="hint small">S/</span></div><span class="hint small">Colchón para 1 mes de gastos fijos: ${fmt(fijosM)}</span></div></div>
   <h3 style="margin:18px 0 6px;font-size:15px">Escenarios</h3><p class="hint" style="margin:0 0 8px">Cada escenario ajusta los supuestos de arriba. Cambia un valor y la proyección se recalcula al instante.</p>
   <div class="tw"><table><thead><tr><th>Supuesto</th>${Object.entries(PROY_ESC).map(([k,v])=>`<th class="n">${v[0]}</th>`).join('')}</tr></thead><tbody>
   ${PROY_ESC_F.map(([f,l,s])=>`<tr><td>${l} <span class="hint">(${s})</span></td>${Object.keys(PROY_ESC).map(k=>`<td class="n"><input class="input mono" type="number" step="any" data-pe="${k}.${f}" value="${pr.esc[k][f]}" style="max-width:110px;height:36px;text-align:right"></td>`).join('')}</tr>`).join('')}</tbody></table></div>
   <div class="row" style="margin-top:10px;justify-content:flex-end"><button class="btn ghost sm" data-act="p-reset">Volver a los valores sugeridos</button></div></details>`;
  // Recurrentes
  const R=pr.rec.slice().sort((a,b)=>(a.tipo===b.tipo?0:a.tipo==='egreso'?-1:1)||(+b.monto||0)-(+a.monto||0));
  const recT=`<details class="card" style="margin-bottom:16px" data-pdet="rec" open><summary><h3 style="display:inline">Ingresos y egresos programados</h3> <span class="hint">· ${R.length} · gastos fijos ${fmt(fijosM)} al mes</span></summary>
   <p class="hint" style="margin:8px 0 10px">Lo que se repite (planilla, alquiler, servicios, cuotas) y los pagos o cobros puntuales con fecha (un equipo, un impuesto, un préstamo). Los costos que dependen de cada servicio van en “Costo variable”.</p>
   <div class="row" style="margin-bottom:10px"><button class="btn sm" data-act="p-rec-nuevo" data-v="mensual">${ic('plus')} Agregar recurrente</button><button class="btn sm" data-act="p-rec-nuevo" data-v="unica">${ic('calendar')} Programar pago o cobro puntual</button><button class="btn ghost sm" data-act="p-sugerir2">Sugerir desde mis últimos 3 meses</button></div>
   ${R.length?`<div class="tw"><table><thead><tr><th>Concepto</th><th>Tipo</th><th>Frecuencia</th><th class="n">Monto</th><th class="n">Al mes</th><th>Vigencia</th><th></th></tr></thead><tbody>
   ${R.map(r=>`<tr style="${r.activo===false?'opacity:.55':''}"><td><b>${esc(r.nombre||r.concepto)}</b><div class="hint">${esc(r.concepto||'')}${r.nota?' · '+esc(r.nota):r.origen==='historial'?' · promedio de tus últimos 3 meses':''}</div></td><td>${r.tipo==='ingreso'?badge('Ingreso','ok'):badge('Egreso','bad')}</td>
    <td class="small">${esc(PROY_FREC[r.frec||'mensual'])}${(r.frec||'mensual')==='mensual'?' · día '+(r.dia||30):r.frec==='unica'||r.frec==='anual'?' · '+fdate(r.fecha):''}</td><td class="n">${fmt(+r.monto||0)}</td><td class="n">${r.frec==='unica'?'—':fmt(recMensual(r))}</td>
    <td class="small nw">${r.desde||r.hasta?[r.desde?'desde '+fdate(r.desde):'',r.hasta?'hasta '+fdate(r.hasta):''].filter(Boolean).join(' '):'<span class="hint">sin fin</span>'}${r.activo===false?`<div>${badge('Pausado','neutral')}</div>`:''}</td>
    <td><div class="row" style="gap:2px"><button class="btn ghost sm" data-act="p-rec-edit" data-v="${r.id}">Editar</button><button class="btn ghost sm" data-act="p-rec-tog" data-v="${r.id}">${r.activo===false?'Activar':'Pausar'}</button><button class="btn ghost sm danger" data-act="p-rec-del" data-v="${r.id}" aria-label="Eliminar">${ic('trash')}</button></div></td></tr>`).join('')}</tbody></table></div>`:'<p class="hint">Aún no hay ingresos ni egresos programados.</p>'}</details>`;
  // Cobros agendados de la Central
  const CE_=hayCentral()?cobrosEsperados(pEsc):[],pgC=pageOf('pcob',CE_,10);
  const cobT=hayCentral()?`<details class="card" style="margin-bottom:16px" data-pdet="cob"><summary><h3 style="display:inline">Cobros agendados de la Central</h3> <span class="hint">· ${CE_.length} · ${fmt(CE_.reduce((a,x)=>a+x.v,0))} esperados</span></summary>
   <p class="hint" style="margin:8px 0 10px">Saldos por cobrar de servicios aceptados o realizados, y cotizaciones pendientes según la probabilidad del escenario. La fecha esperada es la del servicio más el atraso del escenario${P.a365?'; las de A365, cuando se paga la liquidación':''}. Los vencidos se esperan desde hoy.</p>
   ${CE_.length?`<div class="tw"><table><thead><tr><th>Se espera</th><th>Servicio</th><th>Estado</th><th class="n">Saldo / total</th><th class="n">Entra a caja</th></tr></thead><tbody>${pgC.rows.map(x=>`<tr><td class="nw">${fdate(x.f)}</td><td>${esc((x.q.numero?x.q.numero+' · ':'')+(x.q.cliente||''))}<div class="hint">Servicio ${x.q.fecha?fdate(x.q.fecha):'sin fecha'}${x.q.a365?' · A365':''}</div></td><td>${badge(x.tipo==='pendiente'?'Cotización pendiente':x.q.status,x.tipo==='pendiente'?'neutral':'info')}</td><td class="n">${fmt(x.tipo==='pendiente'?x.q.total:x.q.saldo)}</td><td class="n t-ok">${fmt(x.v)}</td></tr>`).join('')}</tbody></table></div>${pgC.html}`:'<p class="hint">No hay saldos por cobrar ni cotizaciones pendientes en la Central.</p>'}</details>`:'';
  // Plan de devolución a socios
  const so=pr.soc,names=socioNames(),saldaEn=n=>{if(S.deuda0[n]<=0.004)return 'sin deuda';if(S.deudaFin[n]>0.004)return 'después del horizonte';let acc=0;const p=S.pagos.filter(x=>x.n===n).find(x=>(acc+=x.v)>=S.deuda0[n]-0.01);return p?fdate(p.f):'—';};
  const socT=names.length?`<details class="card" style="margin-bottom:16px" data-pdet="soc" ${so.modo!=='no'?'open':''}><summary><h3 style="display:inline">Plan de devolución a socios</h3> <span class="hint">· deuda hoy ${fmt(dTot)}</span></summary>
   <p class="hint" style="margin:8px 0 10px">Programa cómo la empresa devuelve lo que los socios pusieron de su bolsillo. Con “automático”, a fin de cada mes se devuelve solo lo que sobra por encima de la caja mínima, repartido según lo que se le debe a cada uno.</p>
   <div class="fg" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))"><div class="field"><label>Modo</label><select class="input" data-ps="modo">${o('no','No programar devoluciones',so.modo)}${o('fijo','Cuota fija mensual',so.modo)}${o('auto','Automático: lo que exceda la caja mínima',so.modo)}</select></div>
    <div class="field"><label>Empezar en</label><input class="input" type="month" data-ps="desde" value="${esc(so.desde||'')}"></div>
    ${so.modo==='fijo'?`<div class="field"><label>Día de pago</label><input class="input mono" type="number" min="1" max="31" data-ps="dia" value="${+so.dia||28}"></div>${names.map(n=>`<div class="field"><label>Cuota para ${esc(n.split(' ')[0])}</label><div class="row" style="gap:6px;flex-wrap:nowrap"><input class="input mono" type="number" step="any" data-ps="cuota:${esc(n)}" value="${+(so.cuota||{})[n]||0}" style="min-width:0"><span class="hint small">S/</span></div></div>`).join('')}`:''}</div>
   <div class="tw" style="margin-top:8px"><table><thead><tr><th>Socio</th><th class="n">Deuda hoy</th><th class="n">Devuelto en el horizonte</th><th class="n">Deuda al final</th><th>Queda saldado</th></tr></thead><tbody>${names.map(n=>`<tr><td>${esc(n)}</td><td class="n">${fmt(S.deuda0[n]||0)}</td><td class="n">${fmt(S.pagos.filter(x=>x.n===n).reduce((a,x)=>a+x.v,0))}</td><td class="n">${fmt(S.deudaFin[n]||0)}</td><td class="small">${esc(saldaEn(n))}</td></tr>`).join('')}</tbody></table></div>
   ${so.modo==='fijo'&&A.below?`<div class="alert warn" style="margin-top:10px"><div>Con cuotas fijas la caja baja de la caja mínima el ${fdate(A.below.f)}. Prueba el modo automático o cuotas menores.</div></div>`:''}${so.modo==='auto'&&!S.pagos.length?`<p class="hint" style="margin-top:8px">En este horizonte la caja no supera la caja mínima a fin de mes, así que aún no hay devoluciones.</p>`:''}</details>`:'';
  // Real vs proyectado
  const fotos=pr.fotos,real=computePeriods('mes',allMovs()),mAct=T.slice(0,7),ks=[...new Set(Object.values(fotos).flatMap(f=>Object.keys(f.m||{})))].filter(k=>k<=mAct).sort().reverse();
  const filas=ks.map(k=>{const prev=fotos[addMes(k,-1)],fo=prev&&prev.m&&prev.m[k]?prev:fotos[k]&&fotos[k].m&&fotos[k].m[k]?fotos[k]:null;if(!fo)return null;const pp=fo.m[k],r=real.find(x=>x.k===k)||{ingOp:0,egOp:0,fin:null};return {k,pp,r,fo,parc:fo===fotos[k]};}).filter(Boolean);
  const dv=(a,b,inv)=>{const d=r2(b-a);if(!a)return `<span class="hint">${fmt(d)}</span>`;const pc=d/Math.abs(a)*100,good=inv?d<=0:d>=0;return `<span class="${Math.abs(pc)<5?'hint':good?'t-ok':'t-bad'}">${d>=0?'+':''}${Math.round(pc)}%</span>`;};
  const rvp=`<details class="card" style="margin-bottom:16px" data-pdet="rvp"><summary><h3 style="display:inline">Real vs. proyectado</h3> <span class="hint">· ${Object.keys(fotos).length} foto(s) guardada(s)</span></summary>
   <p class="hint" style="margin:8px 0 10px">Cada mes se guarda una foto de la proyección (escenario base). Al terminar el mes se compara con lo que realmente pasó, para afinar los supuestos.</p>
   <div class="row" style="margin-bottom:10px"><button class="btn sm" data-act="p-foto">${ic('check')} Guardar foto de hoy</button>${fotos[mAct]?`<span class="hint small">Foto de este mes: ${fdate(fotos[mAct].en)}</span>`:''}</div>
   ${filas.length?`<div class="tw"><table><thead><tr><th>Mes</th><th class="n">Ingresos proy.</th><th class="n">Ingresos reales</th><th class="n">Egresos proy.</th><th class="n">Egresos reales</th><th class="n">Saldo proy.</th><th class="n">Saldo real</th></tr></thead><tbody>
   ${filas.map(x=>`<tr><td class="nw"><b>${MES[+x.k.slice(5)-1]} ${x.k.slice(0,4)}</b><div class="hint">foto del ${fdate(x.fo.en)}${x.parc?' (mes en curso, parcial)':''}${x.k===mAct?' · mes aún abierto':''}</div></td><td class="n">${fmt(x.pp.ing)}</td><td class="n">${fmt(x.r.ingOp)} ${dv(x.pp.ing,x.r.ingOp)}</td><td class="n">${fmt(x.pp.eg)}</td><td class="n">${fmt(x.r.egOp)} ${dv(x.pp.eg,x.r.egOp,true)}</td><td class="n">${fmt(x.pp.fin)}</td><td class="n">${x.r.fin===null?'—':fmt(x.r.fin)}</td></tr>`).join('')}</tbody></table></div>`
   :'<p class="hint">La primera comparación aparece cuando termine el mes de la primera foto.</p>'}</details>`;
  return head+alerta+kpis+evo+tabla+sup+recT+cobT+socT+rvp;
}
let pchart=null;
function drawProy(){const c0=$('#pchart');if(!c0)return;if(typeof Chart==='undefined'){c0.parentElement.innerHTML='<p class="hint">No cargó la librería de gráficos. Revisa tu conexión a internet.</p>';return;}
  const u=pUnidad(pH),cs=getComputedStyle(FZH),c=v=>cs.getPropertyValue(v).trim(),escs=pComp?['pes','base','opt']:[pEsc];
  const GG={};escs.forEach(k=>GG[k]=agrupar(simular(k,pH),u));const G=GG[pEsc]||GG[escs[0]],umb=+state.config.umbralMinimo||0;
  const col={pes:c('--danger'),base:c('--primary'),opt:c('--kleanly')};
  const ds=escs.map(k=>({type:'line',label:'Saldo · '+PROY_ESC[k][0],data:GG[k].map(g=>r2(g.fin)),borderColor:col[k],backgroundColor:col[k],tension:.3,yAxisID:'y',order:1,pointRadius:G.length>40?0:3,borderWidth:k===pEsc?3:2}));
  ds.push({type:'line',label:'Caja mínima',data:G.map(()=>umb),borderColor:c('--warning'),borderDash:[6,4],pointRadius:0,yAxisID:'y',order:0,borderWidth:1.5});
  if(!pComp){ds.push({type:'bar',label:'Ingresos',data:G.map(g=>r2(g.ing)),backgroundColor:c('--kleanly'),yAxisID:'y1',order:2,borderRadius:4},{type:'bar',label:'Egresos',data:G.map(g=>r2(g.eg-g.soc)),backgroundColor:c('--danger'),yAxisID:'y1',order:2,borderRadius:4});}
  if(pchart)pchart.destroy();
  pchart=new Chart(c0,{data:{labels:G.map(g=>g.label),datasets:ds},options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},
    plugins:{legend:{position:'bottom',labels:{color:c('--ink'),font:{family:'Manrope'}}},tooltip:{callbacks:{label:x=>x.dataset.label+': '+fmt(x.raw)}}},
    scales:{x:{ticks:{color:c('--ink-muted'),maxRotation:0,autoSkip:true},grid:{color:c('--line')}},y:{position:'left',ticks:{color:c('--ink-muted'),callback:v=>'S/ '+v.toLocaleString('es-PE')},grid:{color:c('--line')}},
     ...(pComp?{}:{y1:{position:'right',grid:{drawOnChartArea:false},ticks:{color:c('--ink-muted'),callback:v=>'S/ '+v.toLocaleString('es-PE')}}})}}});}
function dlgRec(id,frec){const pr=proy(),r=id?pr.rec.find(x=>x.id===id):{tipo:'egreso',concepto:'Planilla / Operarios',frec:frec||'mensual',dia:30,monto:'',activo:true,fecha:hoyISO()};if(!r)return;const F=r.frec||'mensual';
  const opts=['egreso','ingreso'].map(t=>`<optgroup label="${t==='egreso'?'Egresos':'Ingresos'}">${CONCEPTOS[t].map(c=>`<option value="${t}|${esc(c[0])}" ${r.tipo===t&&r.concepto===c[0]?'selected':''}>${esc(c[1])}</option>`).join('')}</optgroup>`).join('');
  dlg(`<h2>${id?'Editar':F==='unica'?'Programar pago o cobro puntual':'Nuevo ingreso o egreso recurrente'}</h2><form data-form="prec"><input type="hidden" name="id" value="${esc(id||'')}"><div class="fg" style="margin-top:12px">
   <div class="field full"><label>Concepto</label><select class="input" name="tc">${opts}</select></div>
   <div class="field full"><label>Nombre</label><input class="input" name="nombre" value="${esc(r.nombre||'')}" placeholder="Ej. Planilla de operarios, alquiler del depósito, cuota del préstamo"></div>
   <div class="field"><label>Monto (S/)</label><input class="input mono" type="number" step="0.01" min="0" name="monto" value="${esc(r.monto)}" required></div>
   <div class="field"><label>Frecuencia</label><select class="input" name="frec">${Object.entries(PROY_FREC).map(([k,l])=>`<option value="${k}" ${F===k?'selected':''}>${l}</option>`).join('')}</select></div>
   <div class="field"><label>Día del mes (mensual)</label><input class="input mono" type="number" min="1" max="31" name="dia" value="${+r.dia||30}"></div>
   <div class="field"><label>Fecha (una vez, anual o primera semanal)</label><input class="input" type="date" name="fecha" value="${esc(r.fecha||'')}"></div>
   <div class="field"><label>Desde (opcional)</label><input class="input" type="date" name="desde" value="${esc(r.desde||'')}"></div>
   <div class="field"><label>Hasta (opcional)</label><input class="input" type="date" name="hasta" value="${esc(r.hasta||'')}"></div></div>
   <div class="row" style="margin-top:20px;justify-content:flex-end"><button class="btn" type="button" data-act="close">Cancelar</button><button class="btn primary" type="submit">Guardar</button></div></form>`);}
function exportProy(){if(typeof XLSX==='undefined'){toast('No cargó el lector de Excel. Revisa tu conexión a internet.',true);return;}
  const u=pUnidad(pH),wb=XLSX.utils.book_new();Object.keys(PROY_ESC).forEach(k=>{const S=simular(k,pH),G=agrupar(S,u);
   const rows=[['Período','Saldo inicial','Cobros agendados','Ventas por la meta','Otros ingresos','Gastos fijos','Costos variables','Devolución a socios','Saldo final','Saldo más bajo','Día más bajo'],...G.map(g=>[g.label,r2(g.ini),r2(g.cob+g.pipe),r2(g.ven),r2(g.oi+g.inv+g.fi),r2(g.fij),r2(g.vr),r2(g.soc),r2(g.fin),r2(g.min),fdate(g.minF)])];
   const ws=XLSX.utils.aoa_to_sheet(rows);ws['!cols']=rows[0].map((_,i)=>({wch:i?16:22}));XLSX.utils.book_append_sheet(wb,ws,PROY_ESC[k][0]);});
  download(`Vitta_Kleanly_Proyeccion_${pH}_${hoyISO()}.xlsx`,XLSX.write(wb,{bookType:'xlsx',type:'array'}),'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');}

/* ---------------- Render ---------------- */
let tab='resumen', periodo='mes', rango='6', rDesde='', rHasta='', rOpen=false, rDD='', rDH='', subC=null, selSocio=null, chart=null;
let fil={desde:'',hasta:'',tipo:'',cat:'',origen:'',cuenta:'',suma:'',q:''}, filG={medio:'',estado:'',q:''};
const TABS=[['resumen','Panel'],['proyeccion','Proyección'],['movimientos','Movimientos'],['conciliacion','Cruce con el banco'],['caja','Caja chica'],['socios','Préstamos de socios']];
/* Repintar sin perder el scroll: guarda la posición de la página y de cada tabla con scroll, y la repone después. */
const SCR={};
function paint(el,html,key,keepPos=true){
  const pane=[el,...el.querySelectorAll('.tw,.subtabs,[data-scroll]')];
  if(keepPos)pane.forEach((x,i)=>{SCR[key+'|'+i]=[x.scrollTop,x.scrollLeft];});
  const op=keepPos?[...el.querySelectorAll('details')].map(d=>d.open):[];
  const wy=window.scrollY,wx=window.scrollX;
  el.innerHTML=html;
  el.querySelectorAll('details').forEach((d,i)=>{if(op[i])d.open=true;});
  if(!keepPos)Object.keys(SCR).forEach(k=>{if(k.startsWith(key+'|'))delete SCR[k];});
  const apply=()=>{[el,...el.querySelectorAll('.tw,.subtabs,[data-scroll]')].forEach((x,i)=>{const v=SCR[key+'|'+i];if(v){x.scrollTop=v[0];x.scrollLeft=v[1];}});window.scrollTo(wx,wy);};
  el.querySelectorAll('.pager:not(.top)').forEach(pg=>{let anchor=pg.previousElementSibling;if(pg.dataset.k==='dups'){anchor=el.querySelector('[data-dupstart]');}
    if(anchor){const c=pg.cloneNode(true);c.classList.add('top');anchor.before(c);}});
  el.querySelectorAll('.tw:not(.x) table').forEach(t=>{const hs=[...t.querySelectorAll('thead th')].map(h=>h.textContent.trim());t.querySelectorAll('tbody tr').forEach(tr=>{let i=0;[...tr.children].forEach(td=>{td.dataset.l=td.colSpan>1?'':(hs[i]||'');i+=td.colSpan||1;if(/^\d{2}\/\d{2}\/\d{4}$/.test(td.firstChild?.textContent?.trim()||''))td.classList.add('nw');});});});
  apply();requestAnimationFrame(()=>{apply();const k=FZW.__pgGo;if(k){FZW.__pgGo=null;const t=el.querySelector(`.pager.top[data-k="${k}"]`);const hdr=parseFloat(getComputedStyle(FZH).getPropertyValue('--hdr'))||0;if(t){const y=t.getBoundingClientRect().top;if(y<hdr||y>innerHeight)window.scrollBy(0,y-hdr-12);}}});
}
function setHdr(){const h=FZR.querySelector('header.top');if(h)FZH.style.setProperty('--hdr',getComputedStyle(h).position==='sticky'?h.offsetHeight+'px':'0px');}
addEventListener('resize',setHdr);addEventListener('load',setHdr);setTimeout(setHdr,300);
/* Paginación común: 10 / 25 / 50 / 100 líneas por tabla */
const PG={};
function pageOf(key,arr,def=25){const st=PG[key]||(PG[key]={n:def,p:0});const pages=Math.max(1,Math.ceil(arr.length/st.n));if(st.p>=pages)st.p=pages-1;if(st.p<0)st.p=0;
  return {rows:arr.slice(st.p*st.n,(st.p+1)*st.n),html:pagerHTML(key,arr.length,st,pages)};}
function pagerHTML(key,total,st,pages){if(total<=10)return '';const a=st.p*st.n+1,b=Math.min(total,(st.p+1)*st.n);
  const nums=[...new Set([0,st.p-1,st.p,st.p+1,pages-1])].filter(i=>i>=0&&i<pages).sort((x,y)=>x-y);let prev=-1,btns='';
  nums.forEach(i=>{if(i-prev>1)btns+='<span>…</span>';btns+=`<button class="btn sm" data-act="pg" data-k="${key}" data-p="${i}" aria-current="${i===st.p}">${i+1}</button>`;prev=i;});
  return `<div class="pager" data-k="${key}"><div class="row" style="gap:8px"><span>Mostrando <b class="num">${a}–${b}</b> de <b class="num">${total}</b></span>
   <label class="row" style="gap:6px">Líneas por página <select class="mini" data-pgn="${key}" aria-label="Líneas por página">${[10,25,50,100].map(n=>`<option ${n===st.n?'selected':''}>${n}</option>`).join('')}</select></label></div>
   ${pages>1?`<div class="pgb"><button class="btn sm" data-act="pg" data-k="${key}" data-p="${st.p-1}" ${st.p?'':'disabled'} aria-label="Anterior">${ic('chev-left')}</button>${btns}<button class="btn sm" data-act="pg" data-k="${key}" data-p="${st.p+1}" ${st.p<pages-1?'':'disabled'} aria-label="Siguiente">${ic('chev-right')}</button></div>`:''}</div>`;}
const resetPg=()=>Object.values(PG).forEach(x=>x.p=0);
function render(){
  CRMC=null; PHC=null; idx(); const movs=allMovs();
  renderKPIs(movs);
  const pc=bancoPend().length+dupPend().length;
  $('#tabs').innerHTML=TABS.map(([k,l])=>`<button role="tab" aria-selected="${tab===k}" data-act="tab" data-v="${k}">${l}${k==='conciliacion'&&pc?`<span class="cnt">${pc}</span>`:''}</button>`).join('');
  paint($('#view'),({proyeccion:vProy,resumen:vResumen,movimientos:vMovs,grafico:vGrafico,conciliacion:vConc,caja:vCaja,socios:vSocios})[tab](movs),'view:'+tab+(tab==='conciliacion'?':'+subC:''));
  if(tab==='grafico')tab='resumen';
  if(tab==='resumen'&&$('#chart')) drawChart(movs);
  if(tab==='proyeccion'){drawProy();const pr=proy();if((pr.listo||pr.rec.length)&&!pr.fotos[hoyISO().slice(0,7)]&&!FZW_FOTO){FZW_FOTO=1;setTimeout(()=>tomarFoto(true),50);}}
  const dd=$('#dlg');if(dd&&dd.open&&dd.querySelector('[data-pend]')&&FZW.__pendKind)dlgPend(FZW.__pendKind);
}

function renderKPIs(movs){ $('#kpis').innerHTML=''; return; }
function renderKPIsOld(movs){
  const saldo=r2(saldoBase()+vivos(movs).reduce((a,m)=>a+(m.tipo==='ingreso'?m.monto:-m.monto),0));
  const u=+state.config.umbralMinimo||0;
  let tone='ok',txt='Saldo saludable',wv='var(--primary-soft)';
  if(saldo<u){tone='bad';txt='Por debajo de la caja mínima de seguridad';wv='var(--danger-soft)';}
  else if(saldo<u*1.3){tone='warn';txt='Cerca del umbral mínimo';wv='var(--warning-soft)';}
  const pct=u>0?Math.min(100,Math.max(6,saldo/(u*2)*100)):50;
  const P=computePeriods('mes',movs).slice(-3).filter(p=>p.net<0); const burn=P.length?P.reduce((a,p)=>a+p.net,0)/P.length:0;
  const k=new Date().toISOString().slice(0,7); const mm=vivos(movs).filter(m=>mesDe(m.fecha)===k);
  const op=mm.filter(m=>m.categoria==='operativo'), ing=op.filter(m=>m.tipo==='ingreso').reduce((a,m)=>a+m.monto,0), eg=op.filter(m=>m.tipo==='egreso').reduce((a,m)=>a+m.monto,0);
  const deuda=socioNames().reduce((a,n)=>a+movSocio(n).reduce((x,m)=>x+m.v,0),0);
  $('#kpis').innerHTML=`
  <div class="card kpi" style="--wv:${wv}"><div class="wave-fill" style="height:${pct}%"><svg viewBox="0 0 200 20" preserveAspectRatio="none"><path d="M0 10 Q 25 0 50 10 T 100 10 T 150 10 T 200 10 V20 H0 Z"/></svg><svg class="w2" viewBox="0 0 200 20" preserveAspectRatio="none"><path d="M0 10 Q 25 20 50 10 T 100 10 T 150 10 T 200 10 V20 H0 Z"/></svg></div>
    <div class="label">Saldo disponible en caja</div><div><div class="v">${fmt(saldo)}</div><div class="s t-${tone}" style="font-weight:600">${badge(txt,tone)}</div></div></div>
  <div class="card kpi"><div class="label">Tasa de quema mensual</div><div><div class="v ${burn<0?'t-bad':''}">${fmt(Math.abs(burn))}</div><div class="s">${burn<0?'Consumo promedio de caja (meses con déficit, últimos 3)':'Sin quema de caja en los últimos 3 meses'}</div></div></div>
  <div class="card kpi"><div class="label">Operación del mes</div><div><div class="v"><span class="t-ok">${fmt(ing)}</span></div><div class="s">Ingresos operativos · egresos: <b class="num t-bad">${fmt(eg)}</b> · ${MES[+k.slice(5)-1]} ${k.slice(0,4)}</div></div></div>
  <div class="card kpi"><div class="label">Deuda con socios</div><div><div class="v ${deuda>0?'t-warn':''}">${fmt(deuda)}</div><div class="s">Lo que pagaron de su bolsillo menos lo devuelto</div></div></div>`;
}

/* ---------------- Panel: resumen, evolución e indicadores para decidir en una sola vista ----------------
   Inspirado en los tableros de Fathom, Float, Agicap y Xero: primero lo que falta para cerrar, luego los
   indicadores clave con su variación, la evolución del saldo, en qué se va la plata, quién la financia y el estado de flujo. */
const rangoP=P=>rango==='todo'||rango==='fechas'?P:P.slice(-(+rango));
const isoD=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
/* Períodos del Panel según el rango elegido: últimos N, todo, o fechas específicas (con saldo inicial correcto). */
function panelPeriods(movs){
  if(rango!=='fechas'||!rDesde||!rHasta){const ALL=computePeriods(periodo,movs),P=rangoP(ALL),prev=ALL.slice(Math.max(0,ALL.length-P.length*2),ALL.length-P.length);
    const k0=P[0]?.k,k1=P[P.length-1]?.k;return {P,prev,enR:f=>{const k=periodKey(f,periodo);return k>=k0&&k<=k1;},prevTxt:prev.length+' '+(periodo==='mes'?'meses':'semanas')+' anteriores'};}
  const V=vivos(movs),net=A=>A.reduce((a,m)=>a+(m.tipo==='ingreso'?m.monto:-m.monto),0);
  const d0=rDesde<=rHasta?rDesde:rHasta,d1=rDesde<=rHasta?rHasta:rDesde,dias=Math.round(dayN(d1)-dayN(d0))+1;
  const p1=isoD(new Date(new Date(d0+'T00:00:00').getTime()-86400000)),p0=isoD(new Date(new Date(d0+'T00:00:00').getTime()-dias*86400000));
  const P=computePeriods(periodo,V.filter(m=>m.fecha>=d0&&m.fecha<=d1),saldoBase()+net(V.filter(m=>m.fecha<d0)));
  const prev=computePeriods(periodo,V.filter(m=>m.fecha>=p0&&m.fecha<=p1),saldoBase()+net(V.filter(m=>m.fecha<p0)));
  return {P,prev,enR:f=>f>=d0&&f<=d1,prevTxt:'los '+dias+' días anteriores'};}
function vResumen(movs){
  const PP=panelPeriods(movs),P=PP.P,prev=PP.prev;
  const pend=vivos(movs).filter(m=>m.pendiente&&m.origen!=='central'),exc=movs.filter(m=>m.excluido===NOSUMA&&m.origen!=='central'),sc=state.banco.filter(b=>scB(b)&&!String(b.nota||'').trim());
  const unidad=periodo==='mes'?'meses':'semanas';
  const head=`<div class="row between" style="margin-bottom:16px"><h3>Panel de caja</h3><div class="row">
   <div class="subtabs" style="margin:0"><button aria-pressed="${periodo==='semana'}" data-act="periodo" data-v="semana">Semanal</button><button aria-pressed="${periodo==='mes'}" data-act="periodo" data-v="mes">Mensual</button></div>
   <div class="subtabs" style="margin:0">${[['3','3'],['6','6'],['12','12'],['todo','Todo']].map(([v,l])=>`<button aria-pressed="${rango===v&&!rOpen}" data-act="rango" data-v="${v}">${v==='todo'?l:'Últimos '+l}</button>`).join('')}<button aria-pressed="${rango==='fechas'||rOpen}" aria-expanded="${rOpen}" data-act="rango" data-v="fechas" class="row" style="gap:6px">${ic('calendar')}${rango==='fechas'?fdate(rDesde)+' – '+fdate(rHasta):'Fechas'}</button></div></div></div>
  ${rOpen?`<div class="row" style="margin:-6px 0 16px;justify-content:flex-end;padding:10px 12px;background:var(--surface-sunken);border-radius:var(--r-md)">
   <label class="row small" style="gap:6px">Desde <input class="input" type="date" style="width:160px;height:36px" value="${rDD}" data-rdd="desde" aria-label="Desde"></label>
   <label class="row small" style="gap:6px">Hasta <input class="input" type="date" style="width:160px;height:36px" value="${rDH}" data-rdd="hasta" aria-label="Hasta"></label>
   <span class="hint small">Rápido:</span>${[['mes','Este mes'],['mesant','Mes anterior'],['trim','Últimos 90 días'],['anio','Este año']].map(([v,l])=>`<button class="btn ghost sm" data-act="rpre" data-v="${v}">${l}</button>`).join('')}
   <button class="btn sm" data-act="r-cancel">Cancelar</button><button class="btn primary sm" data-act="r-apply">Aplicar</button></div>`:''}`;
  // 1. Para cerrar el mes (lista de tareas)
  const T=[];const PC=pasosCruce();
  if(pend.length)T.push(['bad',`${pend.length} movimiento(s) provisionales o por explicar`,fmt(pend.reduce((a,m)=>a+m.monto,0)),'pend','pend','Corregir']);
  if(exc.length)T.push(['bad',`${exc.length} gasto(s) de la cuenta sin vincular al banco`,fmt(exc.reduce((a,m)=>a+m.monto,0)),'pend','exc','Vincular']);
  if(sc.length)T.push(['warn',`${sc.length} gasto(s) sin comprobante sin nota`,fmt(sc.reduce((a,b)=>a+b.cargo,0)),'pend','sc','Completar']);
  {const pr=proy();if(pr.listo||pr.rec.length){const A=proyAlerta(simular('base','sem13'));if(A.tone!=='ok')T.push([A.tone,'Proyección a 13 semanas: '+(A.neg?'la caja quedaría en negativo el '+fdate(A.neg.f):'la caja estaría bajo la caja mínima desde el '+fdate(A.below.f)),'','tab','proyeccion','Ver proyección']);}}
  {const cu=cobrosPend();if(cu.length)T.push(['warn',`${cu.length} cobro(s) de la Central por vincular o ubicar`,fmt(cu.reduce((a,c)=>a+c.monto,0)),'ir-cruce','pendientes','Revisar']);}
  PC.slice(0,5).forEach((x,i)=>{if(!x.ok&&!(x.k==='pendientes'&&(pend.length||/^\d+ cobro/.test(x.s))))T.push(['warn',`Cruce · Paso ${i+1} ${x.t}: ${x.s}`,'','ir-cruce',x.k,'Ir']);});
  cajas().filter(c=>c.activa!==false).forEach(c=>{const x=cajaInfo(c);if(x.est[1]!=='ok')T.push([x.est[1]==='bad'?'bad':'warn',`${c.nombre}: ${x.est[0].toLowerCase()}${x.pr?' · por rendir '+fmt(x.pr):''}`,'','tab','caja','Ver caja']);});
  const tareas=`<div class="card" style="margin-bottom:16px"><div class="row between"><h3>Para cerrar el mes</h3>${T.length?badge(T.length+' pendiente(s)','warn'):badge('Todo al día','ok')}</div>
   ${T.length?`<div style="margin-top:8px">${T.map(([tone,txt,m,act,v,btn])=>`<div class="row between" style="padding:8px 0;border-top:1px solid var(--line)"><span class="row small" style="gap:8px"><span class="dot" style="background:var(--${tone==='bad'?'danger':'warning'})"></span>${esc(txt)}${m?` <b class="num">· ${m}</b>`:''}</span><button class="btn sm" data-act="${act}" data-v="${v}">${btn}</button></div>`).join('')}</div>`
    :'<p class="hint" style="margin:6px 0 0">Banco cuadrado, todo vinculado y revisado. Puedes generar el reporte contable.</p>'}</div>`;
  if(!P.length) return head+tareas+`<div class="empty">${rango==='fechas'?'No hay movimientos entre estas fechas.':'Sube el Excel del Forms y el estado de cuenta, o registra movimientos.'}</div>`;
  // 2. Indicadores clave del rango, con variación contra el rango anterior
  const agg=A=>A.reduce((o,p)=>{['ingOp','egOp','ingInv','egInv','ingFin','egFin','fco','net'].forEach(k=>o[k]=(o[k]||0)+p[k]);return o;},{});
  const C=agg(P),Q=agg(prev),n=P.length;
  const saldo=P[P.length-1].fin,quema=(()=>{const neg=P.filter(p=>p.fco<0);return neg.length?-neg.reduce((a,p)=>a+p.fco,0)/neg.length:0;})();
  const runway=quema>0?saldo/quema:null;
  const enR=PP.enR;
  const egR=vivos(movs).filter(m=>m.tipo==='egreso'&&m.categoria==='operativo'&&enR(m.fecha));
  const totEg=egR.reduce((a,m)=>a+m.monto,0)||0;
  const socEg=egR.filter(m=>/^Pagó /.test(m.cuenta||'')).reduce((a,m)=>a+m.monto,0);
  const gR=GA().filter(g=>enR(g.fecha)),okC=gR.filter(g=>compInfo(g).ok).reduce((a,g)=>a+(+g.monto||0),0),totG=gR.reduce((a,g)=>a+(+g.monto||0),0)+state.banco.filter(b=>scB(b)&&enR(b.fecha)).reduce((a,b)=>a+b.cargo,0);
  const var_=(a,b,inv)=>{if(!prev.length||!b)return '<span class="hint">sin período anterior</span>';const d=(a-b)/Math.abs(b)*100;const good=inv?d<0:d>0;return `<span class="${Math.abs(d)<0.5?'hint':good?'t-ok':'t-bad'}">${ic(d>0?'trend-up':'trend-down',14)} ${Math.abs(d).toFixed(0)}%</span> <span class="hint">vs. ${PP.prevTxt}</span>`;};
  const pct=(a,b)=>b?Math.round(a/b*100)+'%':'—';
  const saldoAct=r2(saldoBase()+vivos(movs).reduce((a,m)=>a+(m.tipo==='ingreso'?m.monto:-m.monto),0)),u=+state.config.umbralMinimo||0;
  const st=saldoAct<u?['Por debajo de la caja mínima ('+fmt(u)+')','bad']:saldoAct<u*1.3?['Cerca de la caja mínima','warn']:['Saldo saludable','ok'];
  const deuda=r2(socioNames().reduce((a,n)=>a+movSocio(n).reduce((x,m)=>x+m.v,0),0));
  const kpis=`<div class="mstats k4" style="margin-bottom:16px">
   ${(()=>{ const mx=Math.max(u*2,saldoAct*1.15,1),lvl=saldoAct<=0?4:Math.max(6,Math.min(100,saldoAct/mx*100)),mn=u>0?Math.min(96,u/mx*100):null,falta=r2(u-saldoAct);
     const tx=st[1]==='bad'?(saldoAct<0?'Caja en negativo':'Bajo la caja mínima'):st[1]==='warn'?'Cerca de la caja mínima':'Saldo saludable';
     return `<div class="mstat tank ${st[1]}" style="border-color:var(--${st[1]==='bad'?'danger':st[1]==='warn'?'warning':'success'})" title="Caja mínima configurada: ${fmt(u)}">
      <div class="tk-txt"><div class="kl">Saldo disponible hoy</div><div class="kv num ${saldoAct<0?'t-bad':''}">${fmt(saldoAct)}</div>
      <span class="tk-st"><i></i>${tx}</span>
      <div class="tk-d">${u>0?(falta>0?`Faltan <b>${fmt(falta)}</b> para la caja mínima de ${fmt(u)}`:`<b>${fmt(-falta)}</b> sobre la caja mínima de ${fmt(u)}`):'Sin caja mínima configurada'}</div></div>
      <div class="tk-col-w" aria-hidden="true"><div class="tk-col"><div class="wave-fill" style="height:${lvl}%"><svg viewBox="0 0 200 20" preserveAspectRatio="none"><path d="M0 10 Q 25 0 50 10 T 100 10 T 150 10 T 200 10 V20 H0 Z"/></svg><svg class="w2" viewBox="0 0 200 20" preserveAspectRatio="none"><path d="M0 10 Q 25 20 50 10 T 100 10 T 150 10 T 200 10 V20 H0 Z"/></svg></div>${mn!==null?`<div class="tk-min" style="bottom:${mn}%"></div>`:''}</div>${u>0?`<small title="Saldo frente a la caja mínima">${Math.round(saldoAct>0?saldoAct/u*100:0)}% mín.</small>`:''}</div></div>`; })()}
   <div class="mstat" data-act="tab" data-v="socios" style="cursor:pointer"><div class="kl">Deuda con socios</div><div class="kv num ${deuda>0?'t-warn':''}">${fmt(deuda)}</div><div class="hint">por devolver · ver detalle ${ic('chev-right',14)}</div></div>
   <div class="mstat"><div class="kl">Meses de caja (runway)</div><div class="kv num ${runway!==null&&runway<3?'t-bad':''}">${runway===null?'Sin quema':runway<=0?'0':runway.toFixed(1)}</div><div class="hint">${runway===null?'la operación no consume caja':saldo<=0?'la caja ya está en negativo: se sostiene con préstamos de socios':'saldo ÷ consumo promedio por '+(periodo==='mes'?'mes':'semana')}${quema>0?' · consumo '+fmt(quema)+' por '+(periodo==='mes'?'mes':'semana'):''}</div></div>
   <div class="mstat"><div class="kl">Ingresos operativos</div><div class="kv num t-ok">${fmt(C.ingOp)}</div><div class="small">${var_(C.ingOp,Q.ingOp)}</div></div>
   <div class="mstat"><div class="kl">Egresos operativos</div><div class="kv num t-bad">${fmt(C.egOp)}</div><div class="small">${var_(C.egOp,Q.egOp,true)}</div></div>
   <div class="mstat"><div class="kl">Flujo operativo (FCO)</div><div class="kv num ${C.fco<0?'t-bad':'t-ok'}">${fmt(C.fco)}</div><div class="hint">${C.ingOp?'margen '+pct(C.fco,C.ingOp):'sin ingresos operativos en el rango'}</div></div>
   <div class="mstat"><div class="kl">Pagado por socios</div><div class="kv num t-warn">${pct(socEg,totEg)}</div><div class="hint">${fmt(socEg)} de los egresos operativos</div></div>
   <div class="mstat"><div class="kl">Con comprobante válido</div><div class="kv num ${totG&&okC/totG<0.7?'t-warn':''}">${pct(okC,totG)}</div><div class="hint">${fmt(okC)} sustentado ante SUNAT</div></div>
  </div>`;
  // 3. Evolución
  const evo=`<div class="card" style="margin-bottom:16px"><div class="row between"><h3>Evolución del saldo de caja</h3><span class="hint small">Barras: ingresos y egresos operativos · línea: saldo al cierre</span></div><div class="chart-box" style="height:320px;margin-top:8px"><canvas id="chart"></canvas></div></div>`;
  // 4. ¿En qué se va la plata?  y  ¿Quién la financia?
  const grp=(A,f)=>{const o={};A.forEach(m=>{const k=f(m);o[k]=(o[k]||0)+m.monto;});return Object.entries(o).sort((a,b)=>b[1]-a[1]);};
  const bars=(E,tot,tone)=>E.map(([k,v])=>`<div style="margin:8px 0"><div class="row between small"><span>${esc(k)}</span><span class="num"><b>${fmt(v)}</b> <span class="hint">${pct(v,tot)}</span></span></div><div style="height:8px;border-radius:4px;background:var(--surface-sunken);margin-top:4px"><div style="height:8px;border-radius:4px;width:${tot?Math.max(2,v/tot*100):0}%;background:var(--${tone})"></div></div></div>`).join('');
  const porCat=grp(egR,m=>m.subcategoria),top=porCat.slice(0,7),otros=porCat.slice(7).reduce((a,x)=>a+x[1],0);if(otros)top.push(['Otros',otros]);
  const quien=grp(egR,m=>(m.cuenta||'').startsWith('Pagó')?m.cuenta.replace('Pagó','Lo pagó'):m.cuenta==='Caja Chica'?'Caja chica (efectivo)':/banco/i.test(m.cuenta||'')?'Cuenta de la empresa (BCP)':(m.cuenta||'Otro'));
  const provs=grp(gR.filter(g=>g.rs).map(g=>({monto:+g.monto||0,rs:g.rs})),m=>m.rs).slice(0,6);
  const mix=`<div class="two" style="margin-bottom:16px">
   <div class="card"><h3>¿En qué se va la plata?</h3><p class="hint" style="margin:2px 0 4px">Egresos operativos del rango por concepto · ${fmt(totEg)}</p>${top.length?bars(top,totEg,'danger'):'<p class="hint">Sin egresos en el rango.</p>'}</div>
   <div class="card"><h3>¿Quién pagó?</h3><p class="hint" style="margin:2px 0 4px">De dónde salió el dinero de esos egresos. Si los socios pagan la mayor parte, la empresa depende de sus préstamos.</p>${quien.length?bars(quien,totEg,'primary'):'<p class="hint">Sin datos.</p>'}
    ${provs.length?`<h3 style="margin-top:16px;font-size:14px">Principales proveedores</h3>${provs.map(([k,v])=>`<div class="row between small" style="padding:4px 0;border-top:1px solid var(--line)"><span>${esc(k)}</span><b class="num">${fmt(v)}</b></div>`).join('')}`:''}</div></div>`;
  // 5. Estado de flujo de caja
  const F=[['(+) Saldo inicial de caja',p=>p.ini,''],['(+) Total ingresos operativos',p=>p.ingOp,'t-ok'],['(–) Total egresos operativos',p=>-p.egOp,'t-bad'],['(=) Flujo operativo neto (FCO)',p=>p.fco,'',1],['(+/–) Flujo neto de inversión (FCI)',p=>p.fci,''],['(+/–) Flujo neto de financiamiento (FCF)',p=>p.fcf,''],['(=) Flujo neto del período',p=>p.net,'',1],['(=) Saldo final de caja',p=>p.fin,'t-info',1,1]];
  const tabla=`<div class="card"><h3 style="margin-bottom:10px">Estado de flujo de caja</h3><div class="tw x"><table class="flow"><thead><tr><th>Concepto</th>${P.map(p=>`<th class="n">${p.label}</th>`).join('')}<th class="n">Total rango</th></tr></thead><tbody>
  ${F.map(([l,f,c,b,hl],i)=>`<tr class="${b?'b':''} ${hl?'hl':''}"><td>${l}</td>${P.map(p=>`<td class="n ${c}">${fmt(f(p))}</td>`).join('')}<td class="n ${c}"><b>${fmt(i===0?P[0].ini:i===7?P[P.length-1].fin:P.reduce((a,p)=>a+f(p),0))}</b></td></tr>`).join('')}</tbody></table></div>
  <p class="hint" style="margin-top:10px">Los gastos que un socio pagó de su bolsillo entran como egreso operativo y, a la vez, como préstamo del socio en financiamiento: muestran el costo real de operar sin mover la caja de la empresa.</p></div>`;
  return head+tareas+kpis+evo+mix+tabla;
}

const ORIG={manual:'Registro rápido',banco:'Banco',forms:'Forms',prestamo:'Préstamo socio',caja:'Caja chica'};
/* Libro de movimientos: cada hecho económico aparece UNA sola vez.
   Una línea del banco vinculada a su gasto del Forms se muestra como un único movimiento “Banco + Forms”. */
const CATN2={operativo:'Operativo',inversion:'Inversión',financiamiento:'Financiamiento'};
function libro(movs){
  const out=[],seen=new Set();
  // 1. Conciliados: grupos línea(s) del banco + gasto(s)
  state.banco.forEach(b=>{if(!(LB[b.id]||[]).length||seen.has(b.id))return;const gr=wGrupo(b);gr.B.forEach(x=>seen.add(x.id));
    const I=gr.I,f=I[0],m=f&&f.kind==='manual'?state.movimientos.find(x=>x.id===f.id):null,g=f&&f.kind==='forms'?gById(f.id):null,cq=f&&f.kind==='crm'?crmById(f.id):null,bt=r2(gr.B.reduce((a,x)=>a+bAmt(x),0));
    out.push({key:'G'+gr.B.map(x=>x.id).sort().join('+'),fecha:gr.B.map(x=>x.fecha).sort()[0],fuente:'conc',tipo:gr.B[0].cargo>0?'egreso':'ingreso',
      cat:m?m.categoria:'operativo',sub:m?m.subcategoria:g?subDeGasto(g):cq?cobSub(cq):'Otros Egresos Operativos',desc:I.map(i=>i.desc).join(' + '),
      det:gr.B.map(x=>x.desc+(x.op?' · Op '+x.op:'')).join(' + '),quien:[...new Set(I.map(i=>i.quien))].join(', '),cuenta:'Banco BCP',items:I,monto:bt,dif:gr.dif,suma:true,bid:gr.B[0].id});});
  // 2. Solo banco (líneas sin gasto: comisiones, gastos sin comprobante, devoluciones, abonos…)
  movs.filter(x=>x.origen==='banco').forEach(x=>out.push({key:x.id,fecha:x.fecha,fuente:'banco',tipo:x.tipo,cat:x.categoria,sub:x.subcategoria,desc:x.descripcion,det:x.ref?'Op '+x.ref:'',quien:'',cuenta:'Banco BCP',items:[],monto:x.monto,suma:!x.excluido,motivo:x.excluido||x.pendiente||'',sinComp:x.sinComp,bid:x.id.replace(/^ba?:/,'')}));
  // 3. Solo Forms (sin línea del banco) y registros hechos en la app
  movs.filter(x=>(x.origen==='forms'||x.origen==='manual')&&!x.conciliado).forEach(x=>{const id=x.origen==='forms'?x.id.slice(2):x.id,it=fullItem(id);
    out.push({key:x.id,fecha:x.fecha,fuente:x.origen==='forms'?'forms':'app',tipo:x.tipo,cat:x.categoria,sub:x.subcategoria,desc:x.descripcion||x.subcategoria,det:'',quien:x.origen==='forms'?x.ref:'Registro rápido',cuenta:x.cuenta||'—',items:it?[it]:[],monto:x.monto,suma:!x.excluido,motivo:x.excluido||x.pendiente||'',mid:x.origen==='manual'?x.id:null,
      prestamo:x.origen==='forms'?(isSocio(gById(id)?.medio)?socioDe(gById(id).medio):''):(x.pagadoPor||'')});});
  // 4. Entradas de efectivo a caja chica (registradas en la app)
  movs.filter(x=>x.origen==='caja').forEach(x=>out.push({key:x.id,fecha:x.fecha,fuente:'app',tipo:x.tipo,cat:x.categoria,sub:x.subcategoria,desc:x.descripcion,det:'',quien:'Caja chica',cuenta:'Caja Chica',items:[],monto:x.monto,suma:!x.excluido,motivo:x.excluido||''}));
  // 5. Cobros de la Central que no están vinculados a una línea del banco (caja chica, por ubicar o pendientes de vincular)
  movs.filter(x=>x.origen==='central'&&!x.conciliado).forEach(x=>{const c=crmById(x.id.slice(2));out.push({key:x.id,fecha:x.fecha,fuente:'central',tipo:'ingreso',cat:x.categoria,sub:x.subcategoria,desc:x.descripcion,det:c?[c.medio,c.nota].filter(Boolean).join(' · '):'',quien:'Central',cuenta:x.cuenta,items:c?[cobItem(c)]:[],monto:x.monto,suma:!x.excluido,motivo:x.excluido||x.pendiente||''});});
  return out;
}
const FUENTE={conc:['Banco + Forms','ok','Línea del estado de cuenta vinculada a su gasto: se muestra una sola vez'],banco:['Solo banco','info','Línea del estado de cuenta sin gasto en el Forms (comisión, gasto sin comprobante, devolución, abono…)'],forms:['Solo Forms','neutral','Gasto del Forms que no pasa por el banco (lo pagó un socio, caja chica) o que aún falta vincular'],app:['Registro en la app','neutral','Registro rápido o entrada de caja chica hecha en esta app'],central:['Cobro de la Central','info','Cobro registrado en Cotizaciones / Cobranzas que no está vinculado a una línea del banco (efectivo en caja, por ubicar o por vincular)']};
function vMovs(movs){
  const Lb=libro(movs);
  const M=x=>(!fil.desde||x.fecha>=fil.desde)&&(!fil.hasta||x.fecha<=fil.hasta)&&(!fil.tipo||x.tipo===fil.tipo)&&(!fil.cat||x.cat===fil.cat)&&(!fil.cuenta||x.cuenta===fil.cuenta)&&(!fil.suma||(fil.suma==='si'?x.suma:!x.suma))
    &&(!fil.q||norm([x.desc,x.det,x.sub,x.quien,x.cuenta,x.monto.toFixed(2),...x.items.flatMap(i=>[i.desc,i.quien,(+i.monto||0).toFixed(2),i.ruc,i.rs,i.serie,i.num])].join(' ')).includes(norm(fil.q)));
  const base=Lb.filter(M),L=base.filter(x=>!fil.origen||x.fuente===fil.origen).sort((a,b)=>b.fecha.localeCompare(a.fecha)||a.key.localeCompare(b.key));
  FZW.__libroVista=L;FZW.__libroMap=Object.fromEntries(Lb.map(x=>[x.key,x]));
  const pg=pageOf('movs',L),o=(v,l,cur)=>`<option value="${esc(v)}" ${cur===v?'selected':''}>${esc(l)}</option>`;
  const sum=(a,t)=>r2(a.filter(x=>x.suma&&(!t||x.tipo===t)).reduce((s,x)=>s+x.monto,0));
  const chip=(k,l)=>{const A=k?base.filter(x=>x.fuente===k):base;return `<button class="btn sm" data-act="mfil" data-v="${k}" title="${k?esc(FUENTE[k][2]):''}" style="${(fil.origen||'')===k?'background:var(--primary-soft);border-color:var(--primary)':''}">${l} <b class="num">${A.length}</b></button>`;};
  // cuadre de fuentes: dónde quedó cada línea del banco y cada respuesta del Forms
  const nB=state.banco.length,bConc=state.banco.filter(b=>(LB[b.id]||[]).length).length,gA=GA(),gConc=gA.filter(g=>(LG[g.id]||[]).length).length,nGc=Lb.filter(x=>x.fuente==='conc').length;
  const cuentas=[...new Set(Lb.map(x=>x.cuenta))].sort(),fil0=fil.desde||fil.hasta||fil.tipo||fil.cat||fil.cuenta||fil.suma||fil.q||fil.origen;
  return `<div class="mstats">
   <div class="mstat"><div class="kl">Movimientos</div><div class="kv num">${L.length}</div><div class="hint">${fil0?'con los filtros':'sin duplicar'}</div></div>
   <div class="mstat"><div class="kl">Ingresos</div><div class="kv num t-ok">${fmt(sum(L,'ingreso'))}</div><div class="hint">que suman al flujo</div></div>
   <div class="mstat"><div class="kl">Egresos</div><div class="kv num t-bad">${fmt(sum(L,'egreso'))}</div><div class="hint">que suman al flujo</div></div>
   <div class="mstat"><div class="kl">No suman</div><div class="kv num">${L.filter(x=>!x.suma).length}</div><div class="hint">traslados, crédito fiscal, falta vincular</div></div>
  </div>
  <div class="row" style="margin-bottom:10px"><span class="hint small" title="Cada hecho aparece una sola vez: una línea del banco vinculada a su gasto se muestra como “Banco + Forms”. El préstamo de un socio se ve en “Cómo se pagó”.">Fuente ${ic('info',14)}</span>${chip('','Todos')}${chip('conc','Banco + Forms')}${chip('banco','Solo banco')}${chip('forms','Solo Forms')}${chip('app','Registros en la app')}${hayCentral()?chip('central','Cobros de la Central'):''}</div>
  <div class="row" style="margin-bottom:12px">
   <input class="input" style="width:150px" type="date" value="${fil.desde}" data-fil="desde" aria-label="Desde"><input class="input" style="width:150px" type="date" value="${fil.hasta}" data-fil="hasta" aria-label="Hasta">
   <select class="input" style="width:140px" data-fil="tipo" aria-label="Tipo">${o('','Todos los tipos',fil.tipo)}${o('ingreso','Ingresos',fil.tipo)}${o('egreso','Egresos',fil.tipo)}</select>
   <select class="input" style="width:170px" data-fil="cat" aria-label="Categoría">${o('','Todas las categorías',fil.cat)}${o('operativo','Operativo',fil.cat)}${o('inversion','Inversión',fil.cat)}${o('financiamiento','Financiamiento',fil.cat)}</select>
   <select class="input" style="width:170px" data-fil="cuenta" aria-label="Cómo se pagó">${o('','Cómo se pagó: todo',fil.cuenta)}${cuentas.map(c=>o(c,c,fil.cuenta)).join('')}</select>
   <select class="input" style="width:150px" data-fil="suma" aria-label="Suma al flujo">${o('','Suma o no',fil.suma)}${o('si','Suma al flujo',fil.suma)}${o('no','No suma',fil.suma)}</select>
   <input class="input" style="flex:1;min-width:180px" placeholder="Buscar descripción, Op., RUC, monto…" value="${esc(fil.q)}" data-fil="q" aria-label="Buscar">
   <button class="btn" data-act="limpiar">Limpiar</button><button class="btn ghost sm" data-act="m-export">Exportar a Excel</button></div>
  ${L.length?`<div class="tw"><table><thead><tr><th>Fecha</th><th>Fuente</th><th>Descripción</th><th>Categoría</th><th>Cómo se pagó</th><th>Comprobante</th><th class="n">Monto</th><th></th></tr></thead><tbody>
  ${pg.rows.map(x=>{const F=FUENTE[x.fuente],it=x.items.find(i=>i.kind==='forms')||x.items[0],ci=it&&(it.comp||it.ruc||it.serie)?compInfo(it):null,nro=it?[it.serie,it.num].filter(Boolean).join('-'):'';
   return `<tr style="${x.suma?'':'opacity:.6'}"><td>${fdate(x.fecha)}</td><td>${badge(F[0],F[1])}</td>
   <td>${x.fuente==='conc'&&x.items.length>1?x.items.map(i=>`<div>${esc(i.desc)} <span class="num small">· ${fmt(i.monto)}</span></div>`).join(''):esc(x.desc||'—')}<div class="hint">${esc([x.det,x.quien].filter(Boolean).join(' · '))}${x.fuente==='conc'&&x.items.length>1?' · '+x.items.length+' gastos del Forms en este pago':''}</div>${x.suma?'':`<div style="margin-top:2px">${badge('No suma: '+x.motivo,'neutral')}</div>`}${x.suma&&x.motivo?`<div style="margin-top:2px">${badge(x.motivo,'warn')}</div>`:''}${x.dif&&Math.abs(x.dif)>0.004?`<div style="margin-top:2px">${badge('Diferencia banco vs gasto: '+fmt(x.dif),'warn')}</div>`:''}</td>
   <td>${x.tipo==='ingreso'?badge('Ingreso','ok'):badge('Egreso','bad')}<div class="small" style="margin-top:2px">${esc(CATN2[x.cat]||x.cat)} · ${esc(x.sub)}</div></td>
   <td class="small">${esc(x.cuenta)}${x.prestamo?`<div>${badge('Préstamo de '+x.prestamo.split(' ')[0],'info')}</div>`:''}</td>
   <td class="small">${ci?`${badge(ci.tipo,ci.ok?'neutral':'warn')}${nro?`<div class="mono">${esc(nro)}</div>`:''}`:x.sinComp?badge('Sin comprobante','warn'):'<span class="hint">—</span>'}</td>
   <td class="n ${x.tipo==='ingreso'?'t-ok':'t-bad'}">${x.tipo==='ingreso'?'+':'−'} ${fmt(x.monto)}</td>
   <td><div class="row" style="gap:2px"><button class="btn ghost sm" data-act="m-ver" data-v="${esc(x.key)}">Ver / editar</button>${x.mid||x.key.startsWith('c:')||(x.key.startsWith('g:')&&gById(x.key.slice(2))?.manual)?`<button class="btn ghost sm danger" data-act="m-del" data-v="${esc(x.key)}" title="Eliminar" aria-label="Eliminar">${ic('trash')}</button>`:''}</div></td></tr>`;}).join('')}</tbody></table></div>${pg.html}`
  :'<div class="empty">No hay movimientos con estos filtros.</div>'}`;
}


function vGrafico(){ return `<h3 style="margin-bottom:16px">Evolución del saldo de caja</h3><div class="chart-box"><canvas id="chart"></canvas></div>`; }
function drawChart(movs){
  if(typeof Chart==='undefined'){ $('#view').insertAdjacentHTML('beforeend','<p class="hint">No cargó la librería de gráficos. Revisa tu conexión a internet.</p>'); return; }
  const P=panelPeriods(movs).P, cs=getComputedStyle(FZH), c=v=>cs.getPropertyValue(v).trim();
  if(chart) chart.destroy();
  chart=new Chart($('#chart'),{data:{labels:P.map(p=>p.label),datasets:[
    {type:'line',label:'Saldo de caja',data:P.map(p=>r2(p.fin)),borderColor:c('--primary'),backgroundColor:'rgba(42,168,222,.12)',fill:false,tension:.35,yAxisID:'y',order:1,pointRadius:3},
    {type:'bar',label:'Ingresos operativos',data:P.map(p=>r2(p.ingOp)),backgroundColor:c('--kleanly'),yAxisID:'y1',order:2,borderRadius:4},
    {type:'bar',label:'Egresos operativos',data:P.map(p=>r2(p.egOp)),backgroundColor:c('--danger'),yAxisID:'y1',order:2,borderRadius:4}]},
   options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{legend:{position:'bottom',labels:{color:c('--ink'),font:{family:'Manrope'}}}},
    scales:{x:{ticks:{color:c('--ink-muted')},grid:{color:c('--line')}},y:{position:'left',ticks:{color:c('--ink-muted'),callback:v=>'S/ '+v.toLocaleString('es-PE')},grid:{color:c('--line')}},y1:{position:'right',grid:{drawOnChartArea:false},ticks:{color:c('--ink-muted'),callback:v=>'S/ '+v.toLocaleString('es-PE')}}}}});
}

/* ---------------- Cruce con el banco (vinculación manual) ---------------- */
function calcBanco(){
  const L=state.banco; const ab=r2(L.reduce((a,b)=>a+b.abono,0)),ca=r2(L.reduce((a,b)=>a+b.cargo,0)); const fin=r2((+state.config.saldoInicialBanco||0)+ab-ca);
  const cs=L.filter(b=>b.saldo!==null&&b.saldo!==undefined&&b.saldo!==''); const ec=cs.length?cs[cs.length-1].saldo:null;
  const by={conc:0,com:0,dev:0,fondo:0,sin:0,sc:0,k:0}; L.filter(b=>b.cargo>0).forEach(b=>{if((LB[b.id]||[]).length)by.conc+=b.cargo;else if(scB(b))by.sc+=b.cargo;else if((b.cls||'').startsWith('k:'))by.k+=b.cargo;else if(b.cls==='comision')by.com+=b.cargo;else if((b.cls||'').startsWith('dev:'))by.dev+=b.cargo;else if(b.cls==='fondo')by.fondo+=b.cargo;else by.sin+=b.cargo;});
  return {ab,ca,fin,ec,by};
}
/* ---- Cruce con el banco: flujo por etapas de validación ---- */
/* Etapas del cruce para un mes (m='AAAA-MM') o para todo (m=''). */
let mesC=null;
function mesesCruce(){return [...new Set([...state.banco.map(b=>mesDe(b.fecha)),...GA().map(g=>mesDe(g.fecha))])].filter(Boolean).sort();}
const cerrado=m=>m&&(state.config.cerrados||{})[m];
function pasosCruce(m=''){
  const inM=f=>!m||mesDe(f)===m,ML=m?MES[+m.slice(5)-1]+' '+m.slice(0,4):'';
  const B=state.banco.filter(b=>inM(b.fecha)),G=GA().filter(g=>inM(g.fecha)),nb=B.length,ng=G.length;
  let run=+state.config.saldoInicialBanco||0;const mal=new Set();state.banco.forEach(b=>{run=r2(run+b.abono-b.cargo);if(b.saldo!==null&&b.saldo!==undefined&&b.saldo!==''&&Math.abs(run-b.saldo)>=0.005)mal.add(b.id);});
  const malM=B.filter(b=>mal.has(b.id)).length;
  const dup=dupPend().filter(gr=>gr.items.some(i=>inM(i.fecha))).length,rev=G.filter(g=>G_MEDIO(g)==='rev').length,inc=G.filter(g=>!compInfo(g).ok).length;
  const pend=bancoPend().filter(b=>inM(b.fecha)).length,sinV=G.filter(g=>g.medio===EMP&&r2(g.monto-linkedAmt(g.id))>0.004).length,cobP=cobrosPend(m).length;
  const expl=B.filter(b=>(LB[b.id]||[]).length||b.cls),sinRev=expl.filter(b=>!b.revisado).length;
  const P=[
   {k:'banco',t:'Estado de cuenta',ok:nb&&!malM,s:!nb?(m?'Falta el de '+ML:'Súbelo para empezar'):malM?'El saldo no cuadra en '+malM+' línea(s)':'Saldo cuadra · '+nb+' líneas',
    d:'Sube el pantallazo o Excel del banco y verifica que el saldo recalculado coincida línea por línea. Si no cuadra, corrige aquí antes de seguir: todo lo demás se apoya en estas líneas.'},
   {k:'duplicados',t:'Duplicados',ok:!dup,s:!ng&&!dup?'Sin gastos del Forms':dup?dup+' grupo(s) por revisar':'Sin duplicados',
    d:'Limpia los gastos registrados dos veces (Forms diario + carga masiva) antes de vincular, para no relacionar el banco con un registro repetido.'},
   {k:'gastos',t:'Gastos del Forms',ok:!rev,s:!ng?'Sin gastos del Forms':rev?rev+' sin medio de pago válido':(inc?inc+' comprobante(s) incompletos':'Medios de pago OK'),
    d:'Revisa “cómo se pagó” cada gasto: solo lo pagado con la cuenta de la empresa se busca en el banco; lo que pagaron los socios queda como préstamo. Completa aquí los comprobantes faltantes en el Forms.'},
   {k:'pendientes',t:'Vincular',ok:nb&&!pend&&!sinV&&!cobP,s:!nb?'Falta el estado de cuenta':pend||sinV||cobP?[pend?pend+' línea(s) por explicar':'',sinV?sinV+' gasto(s) sin vincular':'',cobP?cobP+' cobro(s) de la Central por vincular o ubicar':''].filter(Boolean).join(' · '):'Todo explicado',
    d:'Relaciona cada línea del banco con su gasto o con su cobro de la Central, o clasifícala (comisión, devolución a socio, gasto sin comprobante…). La app te propone coincidencias, pero nada se vincula sin tu confirmación.'},
   {k:'vinculados',t:'Revisar vinculados',ok:expl.length&&!sinRev,s:!expl.length?'Aún no hay vinculados':sinRev?sinRev+' sin revisar':'Todo revisado',
    d:'Control de calidad: verifica cada relación, completa notas y comprobantes, y marca como revisado lo que ya validó contabilidad.'},
   {k:'control',t:'Resumen y cierre',ok:false,s:'',d:m?'Cuadre final de '+ML+'. Cuando los 5 pasos estén en verde, cierra el mes y genera el reporte para contabilidad.':'Cuadre final: de dónde salió cada gasto y cuánto se debe a cada socio. Cuando todo esté en verde, genera el reporte para contabilidad.'}];
  const prev=P.slice(0,5).every(x=>x.ok),cz=cerrado(m);P[5].ok=m?!!cz&&prev:prev;
  P[5].s=cz?(prev?'Cerrado el '+fdate(cz.en):'Cerrado con cambios: revisar'):prev?(m?'Listo para cerrar':'Listo para contabilidad'):P.slice(0,5).filter(x=>!x.ok).length+' paso(s) pendientes';
  return P;}
function setMesC(m){mesC=m;fV.mes=fW.mes=fB.mes=fG.mes=fD.mes=m;resetPg();}
function vConc(){
  const MS=mesesCruce();
  if(mesC===null){const abiertos=MS.filter(m=>!cerrado(m));setMesC(abiertos[0]||MS[MS.length-1]||'');}
  const P=pasosCruce(mesC),ML=mesC?MES[+mesC.slice(5)-1]+' '+mesC.slice(0,4):'todos los meses';
  if(!P.some(x=>x.k===subC))subC=(P.find(x=>!x.ok)||P[5]).k;
  const i=P.findIndex(x=>x.k===subC),cur=P[i],nx=P[i+1],pv=P[i-1];
  // Escala a muchos meses: navegador ‹ mes › con lista agrupada por año + accesos solo a los meses abiertos.
  const idxM=MS.indexOf(mesC),prevM=idxM>0?MS[idxM-1]:null,nextM=idxM>=0&&idxM<MS.length-1?MS[idxM+1]:null;
  const estM=m=>{const pp=pasosCruce(m),ok=pp.slice(0,5).every(x=>x.ok),cz=cerrado(m);return cz?(ok?'cerrado':'cerrado con cambios'):ok?'listo para cerrar':pp.slice(0,5).filter(x=>!x.ok).length+' paso(s) pendientes';};
  const anios=[...new Set(MS.map(m=>m.slice(0,4)))];
  const abiertos=MS.filter(m=>!cerrado(m)),nCerr=MS.length-abiertos.length;
  const meses=`<div class="row between" style="margin-bottom:12px;gap:10px">
   <div class="row" style="gap:6px"><span class="small"><b>Mes en cierre</b></span>
    <button class="btn icon sm" data-act="mesc" data-v="${prevM||''}" ${prevM?'':'disabled'} aria-label="Mes anterior" style="width:32px;height:32px">${ic('chev-left')}</button>
    <select class="input" style="width:290px;max-width:100%;height:36px" data-mesc="1" aria-label="Mes en cierre">${anios.map(y=>`<optgroup label="${y}">${MS.filter(m=>m.startsWith(y)).map(m=>`<option value="${m}" ${m===mesC?'selected':''}>${MES[+m.slice(5)-1]} ${y} · ${esc(estM(m))}</option>`).join('')}</optgroup>`).join('')}<option value="" ${mesC===''?'selected':''}>Todos los meses</option></select>
    <button class="btn icon sm" data-act="mesc" data-v="${nextM||''}" ${nextM?'':'disabled'} aria-label="Mes siguiente" style="width:32px;height:32px">${ic('chev-right')}</button>
    ${cerrado(mesC)?badge('Cerrado','ok'):''}</div>
   <div class="row" style="gap:6px"><span class="hint small">${nCerr} cerrado(s) · ${abiertos.length} abierto(s)${abiertos.length?':':''}</span>${abiertos.slice(0,4).map(m=>`<button class="btn sm" data-act="mesc" data-v="${m}" style="${mesC===m?'background:var(--primary-soft);border-color:var(--primary)':''}"><span class="dot" style="background:var(--${pasosCruce(m).slice(0,5).every(x=>x.ok)?'primary':'warning'})"></span>${MES[+m.slice(5)-1]} ${m.slice(2,4)}</button>`).join('')}${abiertos.length>4?`<span class="hint small">+${abiertos.length-4} en la lista</span>`:''}</div></div>`;
  const cz=cerrado(mesC),todoOk=P.slice(0,5).every(x=>x.ok);
  const fin=mesC?(cz?`<span class="row" style="gap:6px">${badge(todoOk?'Cerrado el '+fdate(cz.en):'Cerrado, pero hubo cambios',todoOk?'ok':'warn')}<button class="btn ghost sm" data-act="mes-reabrir">Reabrir mes</button><button class="btn sm" data-act="reporte">Generar reporte</button></span>`
      :`<button class="btn primary sm" data-act="mes-cerrar" ${todoOk?'':'disabled title="Completa los 5 pasos primero"'}>${ic('check')} Cerrar ${ML}</button><button class="btn sm" data-act="reporte">Generar reporte</button>`)
    :`<button class="btn primary sm" data-act="reporte">Generar reporte contable</button>`;
  const steps=meses+`<nav class="steps" aria-label="Etapas del cruce">${P.map((x,j)=>`<button class="step ${x.ok?'done':'todo'}" aria-current="${x.k===subC}" data-act="subc" data-v="${x.k}"><span class="no">${x.ok?ic('check',16):j+1}</span><span><span class="t">${x.t}</span><span class="s">${esc(x.s)}</span></span></button>`).join('')}</nav>
  <div class="stepinfo"><div><b>${mesC?esc(ML)+' · ':''}Paso ${i+1} de 6 · ${cur.t}.</b> ${cur.d}${mesC?` <span class="hint">Las tablas de abajo están filtradas a ${esc(ML)}.</span>`:''}</div><div class="row">${pv?`<button class="btn ghost sm" data-act="subc" data-v="${pv.k}">${ic('arrow-left')} ${pv.t}</button>`:''}${nx?`<button class="btn sm" data-act="subc" data-v="${nx.k}">Siguiente: ${nx.t} ${ic('arrow-right')}</button>`:fin}</div></div>`;
  if(!state.gastos.length&&!state.banco.length&&!state.movimientos.length) return steps+`<div class="empty">Sube el Excel de respuestas del Forms y el estado de cuenta del banco con los botones de arriba.</div>`;
  return steps+({pendientes:cVincular,vinculados:cVinculados,duplicados:cDuplicados,control:cControl,gastos:cGastos,banco:cBanco})[subC]();
}
/* ---- Vincular: bandeja de conciliación (filtros, posibles coincidencias que tú confirmas, reglas y acciones en lote) ---- */
/* Clasificación de líneas del banco sin gasto en el Forms: los MISMOS conceptos de “Registrar ingreso / egreso”.
   'k:<concepto>' = concepto del catálogo; 'sc' (b.sc) marca que no tiene comprobante. Se conservan las clases anteriores. */
const K=(t,c)=>['k:'+c,(CONCEPTOS[t].find(x=>x[0]===c)||[,c])[1]];
function clsGroups(esCargo){
  if(esCargo)return [
   ['Operación (FCO)',[K('egreso','Movilidad y Combustible'),K('egreso','Insumos y Químicos'),K('egreso','Planilla / Operarios'),K('egreso','Servicios Básicos'),K('egreso','Alquiler'),K('egreso','Marketing'),K('egreso','Mantenimiento'),K('egreso','Fletes y Logística'),K('egreso','Impuestos (IGV/Renta)'),['comision','Comisiones del banco'],K('egreso','Otros Egresos Operativos')]],
   ['Inversión (FCI)',[K('egreso','Compra de Maquinaria'),K('egreso','Vehículos'),K('egreso','Herramientas')]],
   ['Financiamiento (FCF) · socios y préstamos',[...socioNames().map(n=>['dev:'+n,'Devolución de préstamo a '+n]),K('egreso','Amortización de Deuda'),K('egreso','Intereses'),K('egreso','Retiro de Utilidades / Dividendos')]],
   ['Caja chica y otros',[['fondo','Retiro para el fondo de caja chica'],['gasto_sc','Sin comprobante · concepto por definir']]]];
  return [
   ['Operación (FCO)',[['venta','Venta o servicio a un cliente'],['cobranza','Cobranza de una factura a crédito'],['otro','Otro ingreso de la operación']]],
   ['Inversión (FCI)',[K('ingreso','Venta de Maquinaria/Equipo')]],
   ['Financiamiento (FCF) · socios y préstamos',[...socioNames().map(n=>['apo:'+n,'Préstamo / aporte de '+n]),['prestamo','Préstamo del banco']]]];}
const CLS_C=()=>clsGroups(true).flatMap(g=>g[1]),CLS_A=()=>clsGroups(false).flatMap(g=>g[1]);
const clsEsCargo=v=>CLS_C().some(x=>x[0]===v);
const clsOpts=(esCargo,sel='',pref='',gp='')=>clsGroups(esCargo).map(([g,L])=>`<optgroup label="${esc(gp+g)}">${L.map(([v,l])=>`<option value="${esc(pref+v)}" ${sel===v?'selected':''}>${esc(l)}</option>`).join('')}</optgroup>`).join('');
const clsOptsAmbos=()=>clsOpts(true,'','','Cargos · ')+clsOpts(false,'','','Abonos · ');
const clsLabel=c=>[...CLS_C(),...CLS_A()].find(x=>x[0]===c)?.[1]||(String(c).startsWith('k:')?c.slice(2):c);
const scB=b=>b.cls==='gasto_sc'||(!!b.sc&&String(b.cls||'').startsWith('k:')&&b.cargo>0);
function setCls(b,v){const prev=b.cls;b.cls=v;if(prev==='gasto_sc'&&v.startsWith('k:'))b.sc=true;if(!v.startsWith('k:'))delete b.sc;delete b.revisado;}
function candidatos(b){const tipo=b.cargo>0?'egreso':'ingreso';return items().filter(i=>i.tipo===tipo&&!(LG[i.id]||[]).includes(b.id)&&r2(i.monto-linkedAmt(i.id))>0.004);}
// Posible coincidencia: solo una propuesta para que la confirmes; nada se vincula sin tu clic.
function coincidencias(){
  const out={},used=new Set(),pend=bancoPend().filter(b=>!(LB[b.id]||[]).length);const pares=[];
  pend.forEach(b=>candidatos(b).forEach(i=>{const rem=r2(i.monto-linkedAmt(i.id)),d=Math.abs(dayN(i.fecha)-dayN(b.fecha));const g=gById(i.id);
    const op=g&&normOp(g.op)&&normOp(g.op)===normOp(b.op);
    if(!op&&(Math.abs(rem-bAmt(b))>0.005||d>7))return;
    const conf=op?'alta':d<=2?'media':'baja';pares.push({b:b.id,i:i.id,conf,d,why:op?'Mismo N° de operación que anotaron en el Forms':`Mismo monto, ${d===0?'misma fecha':d+' día(s) de diferencia'}`});}));
  pares.sort((x,y)=>({alta:0,media:1,baja:2}[x.conf]-{alta:0,media:1,baja:2}[y.conf])||x.d-y.d);
  pares.forEach(p=>{if(out[p.b]||used.has(p.i))return;out[p.b]=p;used.add(p.i);});
  return out;
}
function reglaPara(b){const d=norm(b.desc);return (state.config.reglas||[]).find(r=>r.texto&&d.includes(norm(r.texto))&&(clsEsCargo(r.cls)===(b.cargo>0)));}
let fV={tipo:'',mes:'',medio:'',estado:'',q:''}, selV=new Set();
function cVincular(){
  const bp=bancoPend(),co=coincidencias(),bm=bancoMeses();
  const sinV=items().filter(i=>i.kind!=='crm'&&bm.has(mesDe(i.fecha))&&r2(i.monto-linkedAmt(i.id))>0.004).sort((a,b)=>a.fecha.localeCompare(b.fecha));
  const sinEC=items().filter(i=>i.kind!=='crm'&&!bm.has(mesDe(i.fecha))&&!(LG[i.id]||[]).length);
  const est=b=>(LB[b.id]||[]).length?'parcial':co[b.id]?'coincidencia':reglaPara(b)?'regla':'sin';
  const L=bp.filter(b=>(!fV.tipo||(fV.tipo==='cargo'?b.cargo>0:b.abono>0))&&(!fV.mes||mesDe(b.fecha)===fV.mes)&&(!fV.medio||medioBanco(b)===fV.medio)&&(!fV.estado||est(b)===fV.estado)
    &&(!fV.q||norm(b.desc+' '+b.op+' '+bAmt(b).toFixed(2)).includes(norm(fV.q))));
  [...selV].forEach(id=>{if(!L.some(b=>b.id===id))selV.delete(id);});
  const pgV=pageOf('vincular',L),pgS=pageOf('sinv',sinV);
  const n=k=>bp.filter(b=>est(b)===k).length, o=(v,l,c)=>`<option value="${esc(v)}" ${c===v?'selected':''}>${esc(l)}</option>`;
  const meses=[...new Set(bp.map(b=>mesDe(b.fecha)))].sort(),medios=[...new Set(bp.map(medioBanco))];
  const chip=(k,l)=>`<button class="btn sm" data-act="vfil" data-v="${k}" style="${fV.estado===k?'background:var(--primary-soft);border-color:var(--primary)':''}">${l} <b class="num">${k?n(k):bp.length}</b></button>`;
  const selCount=selV.size,conCo=[...selV].filter(id=>co[id]).length,conRe=[...selV].filter(id=>{const b=bById(id);return b&&!(LB[id]||[]).length&&reglaPara(b);}).length;
  return `<h3>1. Movimientos del estado de cuenta por explicar <span class="hint">(${bp.length} · ${fmt(bp.reduce((a,b)=>a+faltante(b),0))})</span></h3>
  <p class="hint" style="margin:2px 0 12px">Funciona como la conciliación de los sistemas contables: la app te propone una <b>posible coincidencia</b> (mismo N° de operación o mismo monto en fechas cercanas) o te avisa si aplica una de tus <b>reglas</b>, pero nada se vincula hasta que tú lo confirmas. Para una operación que pagó varios gastos, usa “Buscar gasto” y marca todos.</p>
  <div class="row" style="margin-bottom:10px">${chip('','Todos')}${chip('coincidencia','Con posible coincidencia')}${chip('regla','Con regla')}${chip('parcial','Vinculados en parte')}${chip('sin','Sin pista')}</div>
  <div class="row" style="margin-bottom:12px">
   <select class="input" style="width:150px" data-vfil="tipo" aria-label="Tipo">${o('','Cargos y abonos',fV.tipo)}${o('cargo','Solo cargos',fV.tipo)}${o('abono','Solo abonos',fV.tipo)}</select>
   <select class="input" style="width:150px" data-vfil="mes" aria-label="Mes">${o('','Todos los meses',fV.mes)}${meses.map(m=>o(m,MES[+m.slice(5)-1]+' '+m.slice(0,4),fV.mes)).join('')}</select>
   <select class="input" style="width:200px" data-vfil="medio" aria-label="Medio">${o('','Todos los medios',fV.medio)}${medios.map(m=>o(m,m,fV.medio)).join('')}</select>
   <input class="input" style="flex:1;min-width:180px" placeholder="Buscar descripción, N° de operación o monto…" value="${esc(fV.q)}" data-vq="1" aria-label="Buscar">
  </div>
  ${L.length?`<div class="row between" style="margin-bottom:12px;padding:8px 12px;background:var(--surface-sunken);border-radius:var(--r-md)">
   <label class="row small" style="gap:6px"><input type="checkbox" data-vselall="1" ${pgV.rows.length&&pgV.rows.every(b=>selV.has(b.id))?'checked':''} style="width:18px;height:18px"> Seleccionar los ${pgV.rows.length} de esta página</label>
   <div class="row"><span class="small">${selCount} seleccionado(s)</span>
    <button class="btn sm" data-act="v-bulk-co" ${conCo?'':'disabled'}>Confirmar coincidencias (${conCo})</button>
    <button class="btn sm" data-act="v-bulk-regla" ${conRe?'':'disabled'}>Aplicar reglas (${conRe})</button>
    <select class="mini" id="vBulkCls" aria-label="Clasificar seleccionados" ${selCount?'':'disabled'}><option value="">Clasificar seleccionados como…</option>${clsOptsAmbos()}</select>
    <button class="btn sm" data-act="v-bulk-cls" ${selCount?'':'disabled'}>Aplicar</button></div></div>
  <div class="tw"><table><thead><tr><th></th><th>Fecha</th><th>Descripción del banco</th><th>N° Op.</th><th class="n">Monto</th><th >Pista</th><th>Acción</th></tr></thead><tbody>
  ${pgV.rows.map(b=>{const c=co[b.id],it=c&&itemById(c.i),rg=!(LB[b.id]||[]).length&&reglaPara(b),parc=(LB[b.id]||[]).length;
   const pista=parc?`${badge('Vinculado en parte','warn')}<div class="small" style="margin-top:4px">Asignado ${fmt(asignado(b))} de ${fmt(bAmt(b))} · falta <b>${fmt(faltante(b))}</b></div>`
    :c?`<div class="small"><b>${esc(it.desc)}</b> · ${fdate(it.fecha)} · ${fmt(it.monto)} · ${esc(it.quien)}</div><div style="margin-top:4px">${badge(CONFL[c.conf][0].replace('Confianza','Coincidencia'),CONFL[c.conf][1]==='bad'?'ok':CONFL[c.conf][1])} <span class="hint">${esc(c.why)}</span></div>`
    :rg?`<div class="small">Regla “${esc(rg.texto)}” → <b>${esc(clsLabel(rg.cls))}</b></div>`
    :'<span class="hint">Sin pista: búscalo o indica qué fue</span>';
   return `<tr><td><input type="checkbox" data-vsel="${b.id}" ${selV.has(b.id)?'checked':''} aria-label="Seleccionar" style="width:18px;height:18px"></td><td>${fdate(b.fecha)}</td><td>${esc(b.desc)}<div class="hint">${esc(medioBanco(b))}</div></td><td class="mono small">${esc(b.op)}</td>
    <td class="n ${b.cargo>0?'t-bad':'t-ok'}">${b.cargo>0?'−':'+'} ${fmt(bAmt(b))}</td><td>${pista}</td>
    <td><div class="row">${c?`<button class="btn primary sm" data-act="v-ok" data-v="${b.id}">Confirmar</button>`:''}${rg?`<button class="btn primary sm" data-act="v-regla" data-v="${b.id}">Aplicar regla</button>`:''}<button class="btn sm" data-act="v-buscar" data-v="${b.id}">Buscar gasto</button>
     <select class="mini" data-chg="rel" data-v="${b.id}" aria-label="Indicar qué fue"><option value="">¿No está en el Forms? Es…</option>${clsOpts(b.cargo>0,'','c:')}</select>
     <button class="btn ghost sm" data-act="v-nueva-regla" data-v="${b.id}" title="Crear una regla con esta descripción">+ Regla</button></div></td></tr>`;}).join('')}</tbody></table></div>${pgV.html}`
  :bp.length?`<div class="alert info"><div>No hay movimientos con estos filtros.</div><button class="btn sm" data-act="v-limpiar">Quitar filtros</button></div>`
  :`<div class="alert ok"><div>${badge('Al día','ok')} Todos los movimientos del estado de cuenta están explicados.</div></div>`}
  <details style="margin-top:16px"><summary class="hint" style="cursor:pointer">Reglas de clasificación (${(state.config.reglas||[]).length})</summary>
   <p class="hint" style="margin:8px 0">Una regla propone una clasificación para los movimientos cuya descripción contiene un texto, por ejemplo “MANT” → Comisión del banco. Solo se aplica cuando tú lo confirmas.</p>
   ${(state.config.reglas||[]).length?`<div class="tw" style="max-height:none"><table><thead><tr><th>Si la descripción contiene</th><th>Proponer</th><th></th></tr></thead><tbody>${state.config.reglas.map((r,i)=>`<tr><td class="mono">${esc(r.texto)}</td><td>${esc(clsLabel(r.cls))}</td><td><button class="btn ghost sm danger" data-act="v-borrar-regla" data-v="${i}">Borrar</button></td></tr>`).join('')}</tbody></table></div>`:''}
   <div class="row" style="margin-top:8px"><button class="btn sm" data-act="v-nueva-regla">+ Nueva regla</button><button class="btn sm" data-act="v-reglas-base">Agregar reglas comunes del BCP</button></div>
  </details>
  <h3 style="margin-top:28px">2. Gastos de la cuenta de la empresa que aún no están vinculados</h3>
  <p class="hint" style="margin:2px 0 12px">Mientras no los vincules a una línea del banco no suman en el flujo, porque el banco ya registra ese dinero (así no se cuenta dos veces). Si en realidad no se pagaron con la cuenta, cambia el medio de pago.</p>
  ${sinV.length?`<div class="tw"><table><thead><tr><th>Fecha</th><th>Registró</th><th>Descripción</th><th class="n">Monto</th><th>Estado</th><th>Acción</th></tr></thead><tbody>
  ${pgS.rows.map(i=>{const e=itemEstado(i.id);return `<tr><td>${fdate(i.fecha)}</td><td>${esc(i.quien)}</td><td>${esc(i.desc)}</td><td class="n">${fmt(i.monto)}</td><td>${badge(e[0],e[1])}</td>
   <td><div class="row"><button class="btn sm" data-act="pb-abrir" data-v="${esc(i.id)}">Buscar en el banco</button>${i.kind==='forms'?`<select class="mini" data-chg="medio" data-v="${esc(i.id)}" aria-label="Cambiar medio de pago"><option value="">¿No fue con la cuenta? Cambiar…</option><option>${CAJA}</option>${socioNames().map(n=>`<option value="Socio: ${esc(n)}">Lo pagó ${esc(n)}</option>`).join('')}</select>`:''}</div></td></tr>`}).join('')}</tbody></table></div>${pgS.html}`
  :`<div class="alert ok"><div>${badge('Al día','ok')} No hay gastos de la cuenta de la empresa sin vincular.</div></div>`}
  ${sinEC.length?`<p class="hint" style="margin-top:8px">${sinEC.length} registro(s) de la cuenta de la empresa son de meses sin estado de cuenta (${fmt(sinEC.reduce((a,i)=>a+i.monto,0))}). Entran al flujo como provisionales hasta que subas ese estado de cuenta y los vincules.</p>`:''}
  ${hayCentral()?vCobrosCruce():''}`;
}
/* ---- Cruce · cobros de la Central: vincular con su abono o indicar a dónde entró el dinero ---- */
let selQ=new Set();
const destSel=c=>`<select class="mini" data-chg="cobdest" data-v="${esc(c.id)}" aria-label="A dónde entró el dinero">${[['banco','Entró al banco'],['caja','Entró a caja chica'],['','Por ubicar']].map(([v,l])=>`<option value="${v}" ${cobDest(c)===v?'selected':''}>${l}</option>`).join('')}</select>`;
function vCobrosCruce(){
  const L=cobrosPend().filter(c=>!fV.mes||mesDe(c.fecha)===fV.mes).sort((a,b)=>a.fecha.localeCompare(b.fecha)),co=coincCobros(),pg=pageOf('cobros',L);
  [...selQ].forEach(id=>{if(!L.some(c=>c.id===id))selQ.delete(id);});const conCo=[...selQ].filter(id=>co[id]).length,nCo=L.filter(c=>co[c.id]).length;
  const sinEC=crm().filter(c=>cobDest(c)==='banco'&&!bancoMeses().has(mesDe(c.fecha))&&!(LG[c.id]||[]).length);
  return `<h3 style="margin-top:28px">3. Cobros de la Central por vincular o ubicar <span class="hint">(${L.length} · ${fmt(L.reduce((a,c)=>a+(cobDest(c)==='banco'?cobRem(c):c.monto),0))})</span></h3>
  <p class="hint" style="margin:2px 0 12px">Son los pagos de clientes registrados en Cotizaciones y Cobranzas. Los que entraron por <b>transferencia</b> se vinculan con su abono del estado de cuenta (así el ingreso queda con su cliente y no se cuenta dos veces); los de <b>efectivo</b> suman a la caja chica. Si un abono ya estaba clasificado como “Venta”, al vincularlo el cobro reemplaza esa clasificación.</p>
  ${L.length?`${nCo?`<div class="row between" style="margin-bottom:12px;padding:8px 12px;background:var(--surface-sunken);border-radius:var(--r-md)">
   <label class="row small" style="gap:6px"><input type="checkbox" data-qselall="1" ${pg.rows.filter(c=>co[c.id]).length&&pg.rows.filter(c=>co[c.id]).every(c=>selQ.has(c.id))?'checked':''} style="width:18px;height:18px"> Seleccionar las coincidencias de esta página</label>
   <div class="row"><span class="small">${selQ.size} seleccionado(s)</span><button class="btn sm" data-act="q-bulk-co" ${conCo?'':'disabled'}>Confirmar coincidencias (${conCo})</button></div></div>`:''}
  <div class="tw"><table><thead><tr><th></th><th>Fecha</th><th>Cobro</th><th>Medio</th><th class="n">Monto</th><th>Pista</th><th>Acción</th></tr></thead><tbody>
  ${pg.rows.map(c=>{const d=cobDest(c),p=co[c.id],b=p&&bById(p.b),rem=cobRem(c);
   const pista=d===''?badge('Por ubicar: ¿entró al banco o a caja chica?','warn')
    :p&&b?`<div class="small"><b>${esc(b.desc)}</b> · ${fdate(b.fecha)} · ${fmt(bAmt(b))}${b.op?` · <span class="mono">Op ${esc(b.op)}</span>`:''}</div><div style="margin-top:4px">${badge(p.d<=2?'Coincidencia media':'Coincidencia baja',p.d<=2?'warn':'neutral')} <span class="hint">Mismo monto, ${p.d===0?'misma fecha':p.d+' día(s) de diferencia'}${p.cls?' · hoy clasificado como “'+esc(bancoEstado(b)[0])+'”':''}</span></div>`
    :(LG[c.id]||[]).length?`${badge('Vinculado en parte','warn')}<div class="small" style="margin-top:4px">falta <b>${fmt(rem)}</b></div>`:'<span class="hint">Sin abono del mismo monto cerca: búscalo</span>';
   return `<tr><td>${p?`<input type="checkbox" data-qsel="${esc(c.id)}" ${selQ.has(c.id)?'checked':''} aria-label="Seleccionar" style="width:18px;height:18px">`:''}</td><td class="nw">${fdate(c.fecha)}</td><td>${esc(cobDesc(c))}<div class="hint">${esc([c.tipo,c.nota].filter(Boolean).join(' · '))}</div></td><td class="small">${esc(c.medio||'—')}</td>
    <td class="n t-ok">+ ${fmt(c.monto)}</td><td>${pista}</td>
    <td><div class="row">${p?`<button class="btn primary sm" data-act="q-ok" data-v="${esc(c.id)}">Confirmar</button>`:''}${d==='banco'?`<button class="btn sm" data-act="pb-abrir" data-v="${esc(c.id)}">Buscar en el banco</button>`:''}${destSel(c)}<button class="btn ghost sm" data-act="ver-cobro" data-v="${esc(c.id)}">Ver</button></div></td></tr>`;}).join('')}</tbody></table></div>${pg.html}`
  :`<div class="alert ok"><div>${badge('Al día','ok')} Todos los cobros de la Central${fV.mes?' de este mes':''} están vinculados o ubicados.</div></div>`}
  ${sinEC.length?`<p class="hint" style="margin-top:8px">${sinEC.length} cobro(s) por transferencia son de meses sin estado de cuenta (${fmt(sinEC.reduce((a,c)=>a+c.monto,0))}). Entran al flujo como provisionales hasta que subas ese estado de cuenta.</p>`:''}`;
}
/* ---- Ver un cobro de la Central ---- */
function dlgCobro(id){const c=crmById(id);if(!c)return;const d=cobDest(c),bs=(LG[c.id]||[]).map(bById).filter(Boolean);
  dlg(`<div class="row between"><h2>Cobro de la Central</h2>${badge(COB_D[d],d?'info':'warn')}</div>
  <div class="fg" style="margin-top:12px">${ro('Fecha',fdate(c.fecha))}${ro('Monto',`<b class="num t-ok">${fmt(c.monto)}</b>`)}
   ${ro(c.a365?'Liquidación':'Cotización',esc(c.numero||'—'))}${ro('Cliente',esc(c.cliente||'—'))}
   ${ro('Tipo de pago',esc(c.tipo||'—'))}${ro('Medio (según la Central)',esc(c.medio||'—'))}
   ${ro('Comprobante emitido',c.comp&&c.comp.tipo?esc(c.comp.tipo+(c.comp.numero?' '+c.comp.numero:'')):'<span class="hint">Sin comprobante registrado</span>')}${c.nota?`<div class="full">${ro('Nota',esc(c.nota))}</div>`:''}</div>
  <form data-form="cobdest"><input type="hidden" name="id" value="${esc(c.id)}">
   <h3 style="margin:16px 0 6px">¿A dónde entró el dinero?</h3>
   <div class="fg"><div class="field"><select class="input" name="d">${[['banco','Cuenta de la empresa (BCP)'],['caja','Caja chica (efectivo)'],['','Por ubicar']].map(([v,l])=>`<option value="${v}" ${d===v?'selected':''}>${l}</option>`).join('')}</select></div>
    ${cajas().length?`<div class="field"><label>Caja (si fue efectivo)</label>${cajaSel(cobCaja(c),'caja')}</div>`:''}</div>
   ${d==='banco'?(bs.length?`<div class="small" style="margin-top:8px">Vinculado con: ${bs.map(b=>`<a href="#" data-act="ver-banco-det" data-v="${b.id}">${fdate(b.fecha)} · ${esc(b.desc)} · ${fmt(bAmt(b))}</a>`).join(', ')}${cobRem(c)>0.004?` · ${badge('Falta '+fmt(cobRem(c)),'warn')}`:''}</div>`
     :`<div class="small" style="margin-top:8px">${badge('Falta vincular con su abono','warn')} <button class="btn sm" type="button" data-act="pb-abrir" data-v="${esc(c.id)}">Buscar en el banco</button></div>`):''}
   <p class="hint small" style="margin-top:10px">El monto, la fecha y el cliente se editan en la Central (Cotizaciones → Pagos), así no hay dos versiones del mismo cobro.</p>
   <div class="row" style="margin-top:16px;justify-content:space-between">${FZO&&FZO.abrir?`<button class="btn ghost sm" type="button" data-act="cob-central" data-v="${esc(c.id)}">${ic('arrow-right')} Abrir en la Central</button>`:'<span></span>'}<div class="row"><button class="btn" type="button" data-act="close">Cerrar</button><button class="btn primary" type="submit">Guardar</button></div></div></form>`);}
/* ---- Buscar gasto: elegir uno o varios gastos para una línea del banco ---- */
let busB=null,busSel=new Set(),busQ='',busDias='15';
function dlgBuscar(bid){busB=bid;busSel=new Set();busQ='';busDias='15';pintaBuscar();}
function pintaBuscar(){
  const b=bById(busB);if(!b)return;const falt=faltante(b);
  const C=candidatos(b).filter(i=>(busDias==='todos'||Math.abs(dayN(i.fecha)-dayN(b.fecha))<=+busDias)&&(!busQ||norm(i.desc+' '+i.quien+' '+i.monto.toFixed(2)).includes(norm(busQ))))
    .sort((x,y)=>Math.abs(r2(x.monto-linkedAmt(x.id))-falt)-Math.abs(r2(y.monto-linkedAmt(y.id))-falt)||Math.abs(dayN(x.fecha)-dayN(b.fecha))-Math.abs(dayN(y.fecha)-dayN(b.fecha)));
  const sum=r2([...busSel].map(itemById).filter(Boolean).reduce((a,i)=>a+r2(i.monto-linkedAmt(i.id)),0)),dif=r2(falt-sum);
  const d=$('#dlg');const wasOpen=d.open;
  d.className='wide';paint(d,`<h2>${b.abono>0?'Buscar el cobro o ingreso de este abono':'Buscar gasto para esta línea del banco'}</h2>
  <div class="card" style="margin:12px 0;background:var(--surface-sunken)"><div class="row between"><div><b>${esc(b.desc)}</b> · ${fdate(b.fecha)} ${b.op?`· <span class="mono">Op ${esc(b.op)}</span>`:''}</div><div class="num"><b>${fmt(bAmt(b))}</b>${asignado(b)?` · falta ${fmt(falt)}`:''}</div></div></div>
  <div class="row" style="margin-bottom:10px"><input class="input" style="flex:1;min-width:200px" placeholder="Buscar descripción, persona o monto…" value="${esc(busQ)}" id="busQ" aria-label="Buscar">
   <select class="input" style="width:200px" id="busDias" aria-label="Rango de fechas">${[['3','± 3 días'],['15','± 15 días'],['45','± 45 días'],['todos','Cualquier fecha']].map(([v,l])=>`<option value="${v}" ${busDias===v?'selected':''}>${l}</option>`).join('')}</select></div>
  <div class="tw scroll" style="max-height:340px">${C.length?`<table><thead><tr><th></th><th>Fecha</th><th>Registró</th><th>Descripción</th><th class="n">Monto</th><th>Pista</th></tr></thead><tbody>${C.map(i=>{const rem=r2(i.monto-linkedAmt(i.id)),dd=Math.abs(dayN(i.fecha)-dayN(b.fecha));
    return `<tr><td><input type="checkbox" data-bsel="${esc(i.id)}" ${busSel.has(i.id)?'checked':''} style="width:18px;height:18px" aria-label="Elegir"></td><td>${fdate(i.fecha)}</td><td class="small">${esc(i.quien)}</td><td>${esc(i.desc)}</td><td class="n">${fmt(rem)}${rem<i.monto?' <span class="hint">(resta)</span>':''}</td>
    <td>${Math.abs(rem-falt)<0.005?badge('Mismo monto','ok'):''} ${dd<=2?badge(dd?dd+' día(s)':'Misma fecha','info'):''}</td></tr>`;}).join('')}</tbody></table>`:'<div class="empty">No hay gastos pendientes con esos filtros. Prueba “Cualquier fecha”.</div>'}</div>
  <div class="row between" style="margin-top:16px"><div class="small">Seleccionado: <b class="num">${fmt(sum)}</b> · ${Math.abs(dif)<0.005&&sum?badge('Cuadra exacto','ok'):sum?badge((dif>0?'Faltan ':'Sobran ')+fmt(Math.abs(dif)),'warn'):'<span class="hint">elige uno o varios gastos</span>'}${dif<-0.004&&busSel.size===1?`<div class="small" style="margin-top:6px">El gasto es mayor que esta línea: ¿se pagó en varias operaciones? <button class="btn sm" data-act="pb-desde-bus" data-v="${esc([...busSel][0])}">Elegir las líneas del banco de este gasto</button></div>`:''}</div>
   <div class="row"><button class="btn" data-act="close">Cancelar</button><button class="btn primary" data-act="bus-ok" ${busSel.size?'':'disabled'}>Vincular ${busSel.size||''}</button></div></div>`,'dlg:buscar',wasOpen);
  if(!wasOpen)d.showModal();
  const q=$('#busQ');if(q&&FZR.activeElement!==q&&busQ){}
}
/* ---- Ya vinculados: revisión de lo conciliado (filtros, segmentos y acciones masivas) ---- */
let fW={estado:'',tipo:'',mes:'',como:'',quien:'',q:'',orden:'fecha',lim:100}, selW=new Set();
function fullItem(id){const g=gById(id);if(g)return dupItem(g,'forms');const m=state.movimientos.find(x=>x.id===id);if(m)return dupItem(m,'manual');const c=crmById(id);return c?cobItem(c):null;}
const cobItem=c=>({id:c.id,kind:'crm',fecha:c.fecha,desc:cobDesc(c),monto:c.monto,quien:'Central · '+(c.medio||'cobro'),comp:c.comp&&c.comp.tipo?c.comp.tipo:'Sin comprobante emitido',ruc:'',rs:c.cliente||'',serie:c.comp&&c.comp.numero?String(c.comp.numero).split('-')[0]:'',num:c.comp&&c.comp.numero?String(c.comp.numero).split('-').slice(1).join('-'):'',medio:c.medio});
function wItems(b){return (LB[b.id]||[]).map(fullItem).filter(Boolean);}
// Diferencia del grupo: si una operación pagó varios gastos o un gasto se pagó en varias operaciones, se compara el grupo completo.
function wGrupo(b){const its=new Set(LB[b.id]||[]),bs=new Set([b.id]);let n=0;while(n!==its.size+bs.size){n=its.size+bs.size;its.forEach(i=>(LG[i]||[]).forEach(x=>bs.add(x)));bs.forEach(x=>(LB[x]||[]).forEach(i=>its.add(i)));}
  const B=[...bs].map(bById).filter(Boolean),I=[...its].map(fullItem).filter(Boolean);return {B,I,dif:r2(B.reduce((a,x)=>a+bAmt(x),0)-I.reduce((a,i)=>a+i.monto,0))};}
function wEst(b){if(!(LB[b.id]||[]).length)return 'cls';const d=wGrupo(b).dif;return Math.abs(d)<0.005?'conc':d>0?'parcial':'dist';}
const W_EST={conc:['Conciliado','ok'],parcial:['Vinculado en parte','warn'],dist:['Monto distinto','bad'],cls:['Clasificado','info']};
function wAlertas(b){const a=[],its=wItems(b);if(scB(b)&&!String(b.nota||'').trim())a.push('nota');if(its.some(i=>!compInfo(i).ok))a.push('comp');if(!b.revisado)a.push('norev');return a;}
function wComo(b){const its=wItems(b);return its.length?[...new Set(its.map(i=>i.kind))]:[b.cls||''];}
function wMatch(b,skip){const its=wItems(b);
  if(skip!=='estado'&&fW.estado&&(W_EST[fW.estado]?wEst(b)!==fW.estado:!wAlertas(b).includes(fW.estado)))return false;
  if(fW.tipo&&(fW.tipo==='cargo'?!(b.cargo>0):!(b.abono>0)))return false;
  if(fW.mes&&mesDe(b.fecha)!==fW.mes)return false;
  if(fW.como&&!wComo(b).includes(fW.como))return false;
  if(fW.quien&&!its.some(i=>i.quien===fW.quien))return false;
  if(fW.q){const t=[b.desc,b.op,bAmt(b).toFixed(2),b.nota,b.cls?clsLabel(b.cls):'',...its.flatMap(i=>[i.desc,i.quien,i.ruc,i.rs,i.serie,i.num,(i.serie||'')+'-'+(i.num||''),i.monto.toFixed(2)])].join(' ');if(!norm(t).includes(norm(fW.q)))return false;}
  return true;}
/* ---- Buscar en el banco: un gasto pagado en una o varias operaciones ---- */
let pbG=null,pbSel=new Set(),pbQ='',pbDias='15';
function dlgBuscarBanco(gid,pre){pbG=gid;pbSel=new Set(pre?[pre]:[]);pbQ='';pbDias='15';pintaBuscarBanco(false);}
function pintaBuscarBanco(keep=true){
  const it=itemById(pbG);if(!it)return;const rem=r2(it.monto-linkedAmt(it.id)),esC=it.tipo!=='ingreso';
  const esQ=it.kind==='crm',disp=b=>esQ?dispB(b):faltante(b);
  const C=state.banco.filter(b=>(esC?b.cargo>0:b.abono>0)&&(esQ?abonoLibre(b):(!b.cls||(LB[b.id]||[]).length)&&faltante(b)>0.004)&&!(LB[b.id]||[]).includes(it.id)
     &&(pbDias==='todos'||Math.abs(dayN(b.fecha)-dayN(it.fecha))<=+pbDias)&&(!pbQ||norm(b.desc+' '+b.op+' '+bAmt(b).toFixed(2)).includes(norm(pbQ))))
    .sort((x,y)=>Math.abs(disp(x)-rem)-Math.abs(disp(y)-rem)||Math.abs(dayN(x.fecha)-dayN(it.fecha))-Math.abs(dayN(y.fecha)-dayN(it.fecha)));
  const sum=r2([...pbSel].map(bById).filter(Boolean).reduce((a,b)=>a+disp(b),0)),dif=r2(rem-sum);
  const d=$('#dlg');const was=d.open&&keep;d.className='wide';
  paint(d,`<h2>Buscar en el estado de cuenta</h2>
  <div class="card" style="margin:12px 0;background:var(--surface-sunken)"><div class="row between"><div><b>${esc(it.desc)}</b> · ${fdate(it.fecha)} · ${esc(it.quien)}</div><div class="num"><b>${fmt(it.monto)}</b>${rem<it.monto?` · falta vincular ${fmt(rem)}`:''}</div></div>
   <div class="hint small" style="margin-top:4px">${esQ?'Marca el abono (o los abonos) con que el cliente pagó este cobro. Si el abono ya estaba clasificado, por ejemplo como “Venta al contado”, el cobro reemplaza esa clasificación.':'Marca todas las líneas del banco con las que se pagó este gasto. Por ejemplo, un gasto de S/ 80 pagado con dos transferencias de S/ 70 y S/ 10.'}</div></div>
  <div class="row" style="margin-bottom:10px"><input class="input" style="flex:1;min-width:200px" placeholder="Buscar descripción, N° de operación o monto…" value="${esc(pbQ)}" id="pbQ" aria-label="Buscar">
   <select class="input" style="width:200px" id="pbDias" aria-label="Rango de fechas">${[['3','± 3 días'],['15','± 15 días'],['45','± 45 días'],['todos','Cualquier fecha']].map(([v,l])=>`<option value="${v}" ${pbDias===v?'selected':''}>${l}</option>`).join('')}</select></div>
  <div class="tw scroll" style="max-height:340px">${C.length?`<table><thead><tr><th></th><th>Fecha</th><th>Descripción del banco</th><th>N° Op.</th><th class="n">Por explicar</th><th>Pista</th></tr></thead><tbody>${C.map(b=>{const f=disp(b),dd=Math.abs(dayN(b.fecha)-dayN(it.fecha));
    return `<tr><td><input type="checkbox" data-pbsel="${b.id}" ${pbSel.has(b.id)?'checked':''} style="width:18px;height:18px" aria-label="Elegir"></td><td>${fdate(b.fecha)}</td><td>${esc(b.desc)}<div class="hint">${esc(medioBanco(b))}${esQ&&b.cls&&!(LB[b.id]||[]).length?' · hoy: '+esc(bancoEstado(b)[0]):''}</div></td><td class="mono small">${esc(b.op)}</td><td class="n">${fmt(f)}${f<bAmt(b)?` <span class="hint">de ${fmt(bAmt(b))}</span>`:''}</td>
    <td>${Math.abs(f-rem)<0.005?badge('Mismo monto','ok'):''} ${dd<=2?badge(dd?dd+' día(s)':'Misma fecha','info'):''}</td></tr>`;}).join('')}</tbody></table>`:'<div class="empty">No hay líneas del banco pendientes con esos filtros. Prueba “Cualquier fecha”.</div>'}</div>
  <div class="row between" style="margin-top:16px"><div class="small">Seleccionado: <b class="num">${fmt(sum)}</b> de ${fmt(rem)} · ${pbSel.size?(Math.abs(dif)<0.005?badge('Cuadra exacto','ok'):badge((dif>0?'Faltan ':'Sobran ')+fmt(Math.abs(dif)),'warn')):'<span class="hint">elige una o varias líneas</span>'}</div>
   <div class="row"><button class="btn" data-act="close">Cancelar</button><button class="btn primary" data-act="pb-ok" ${pbSel.size?'':'disabled'}>Vincular ${pbSel.size||''} línea(s)</button></div></div>`,'dlg:pb',was);
  if(!d.open)d.showModal();
}
function cVinculados(){
  const B=state.banco.filter(b=>(LB[b.id]||[]).length||b.cls);
  if(!B.length) return '<div class="empty">Todavía no vinculaste ningún movimiento del banco. Empieza en “Vincular”.</div>';
  const base=B.filter(b=>wMatch(b,'estado'));
  let L=B.filter(b=>wMatch(b));
  L.sort(fW.orden==='reciente'?(x,y)=>y.fecha.localeCompare(x.fecha)||y.ord-x.ord:fW.orden==='monto'?(x,y)=>bAmt(y)-bAmt(x):(x,y)=>x.fecha.localeCompare(y.fecha)||x.ord-y.ord);
  [...selW].forEach(id=>{if(!L.some(b=>b.id===id))selW.delete(id);});
  const pgW=pageOf('vinculados',L),V=pgW.rows,o=(v,l,c)=>`<option value="${esc(v)}" ${c===v?'selected':''}>${esc(l)}</option>`;
  const cnt=k=>base.filter(b=>W_EST[k]?wEst(b)===k:wAlertas(b).includes(k)).length;
  const chip=(k,l,tone)=>{const n=k?cnt(k):base.length;if(k&&!n&&fW.estado!==k&&!W_EST[k])return '';return `<button class="btn sm" data-act="wfil" data-v="${k}" style="${fW.estado===k?'background:var(--primary-soft);border-color:var(--primary)':''}">${tone?`<span class="dot" style="background:var(--${tone})"></span>`:''}${l} <b class="num">${n}</b></button>`;};
  const meses=[...new Set(B.map(b=>mesDe(b.fecha)))].sort();
  const comos=[...new Set(B.flatMap(wComo))].filter(Boolean);
  const quienes=[...new Set(B.flatMap(b=>wItems(b).map(i=>i.quien)))].filter(Boolean).sort();
  const sumC=L.reduce((a,b)=>a+(b.cargo||0),0),sumA=L.reduce((a,b)=>a+(b.abono||0),0),nConc=L.filter(b=>wEst(b)==='conc'||wEst(b)==='cls').length,nRev=L.filter(b=>b.revisado).length;
  const sel=[...selW].map(bById).filter(Boolean),selCls=sel.filter(b=>!(LB[b.id]||[]).length).length,selRev=sel.filter(b=>b.revisado).length;
  const comoL=c=>c==='forms'?'Gasto del Forms':c==='manual'?'Registro rápido':clsLabel(c);
  const fil=fW.estado||fW.tipo||fW.mes||fW.como||fW.quien||fW.q;
  return `<p class="hint" style="margin:0 0 12px">Todo lo del estado de cuenta que ya está explicado: vinculado a un gasto o clasificado (comisión, devolución a socio, gasto sin comprobante…). Revisa aquí antes de cerrar el mes: corrige lo que esté mal, completa notas y comprobantes, y marca como <b>revisado</b> lo que ya validó contabilidad.</p>
  <div class="mstats">
   <div class="mstat"><div class="kl">Movimientos</div><div class="kv num">${L.length}</div><div class="hint">${fil?'con los filtros':'explicados'}</div></div>
   <div class="mstat"><div class="kl">Cargos</div><div class="kv num t-bad">${fmt(sumC)}</div></div>
   <div class="mstat"><div class="kl">Abonos</div><div class="kv num t-ok">${fmt(sumA)}</div></div>
   <div class="mstat"><div class="kl">Cuadran</div><div class="kv num">${nConc}<span class="hint"> / ${L.length}</span></div><div class="hint">conciliados o clasificados</div></div>
   <div class="mstat"><div class="kl">Revisados</div><div class="kv num">${nRev}<span class="hint"> / ${L.length}</span></div><div class="hint">por contabilidad</div></div>
  </div>
  <div class="row" style="margin-bottom:6px">${chip('','Todos')}${chip('conc','Conciliados','success')}${chip('parcial','Vinculados en parte','warning')}${chip('dist','Monto distinto','danger')}${chip('cls','Clasificados (comisión, socio, sin comprobante…)','primary')}</div>
  <div class="row" style="margin-bottom:10px"><span class="hint small">Para revisar:</span>${chip('norev','Sin revisar')}${chip('nota','Sin comprobante y sin nota','warning')}${chip('comp','Comprobante incompleto','warning')}</div>
  <div class="row" style="margin-bottom:12px">
   <select class="input" style="width:150px" data-wfil="tipo" aria-label="Tipo">${o('','Cargos y abonos',fW.tipo)}${o('cargo','Solo cargos',fW.tipo)}${o('abono','Solo abonos',fW.tipo)}</select>
   <select class="input" style="width:150px" data-wfil="mes" aria-label="Mes">${o('','Todos los meses',fW.mes)}${meses.map(m=>o(m,MES[+m.slice(5)-1]+' '+m.slice(0,4),fW.mes)).join('')}</select>
   <select class="input" style="width:210px" data-wfil="como" aria-label="Explicado con">${o('','Explicado con: todo',fW.como)}${comos.map(c=>o(c,comoL(c),fW.como)).join('')}</select>
   ${quienes.length?`<select class="input" style="width:180px" data-wfil="quien" aria-label="Registró">${o('','Registró: todos',fW.quien)}${quienes.map(q=>o(q,q,fW.quien)).join('')}</select>`:''}
   <select class="input" style="width:190px" data-wfil="orden" aria-label="Orden">${o('fecha','Fecha (antiguos primero)',fW.orden)}${o('reciente','Fecha (recientes primero)',fW.orden)}${o('monto','Monto (mayor primero)',fW.orden)}</select>
   <input class="input" style="flex:1;min-width:200px" placeholder="Buscar banco, N° op., monto, RUC, serie, proveedor, nota…" value="${esc(fW.q)}" data-wq="1" aria-label="Buscar">
   ${fil?'<button class="btn ghost sm" data-act="w-limpiar">Quitar filtros</button>':''}
  </div>
  ${L.length?`<div class="row between" style="margin-bottom:12px;padding:8px 12px;background:var(--surface-sunken);border-radius:var(--r-md)">
   <label class="row small" style="gap:6px"><input type="checkbox" data-wselall="1" ${V.length&&V.every(b=>selW.has(b.id))?'checked':''} style="width:18px;height:18px"> Seleccionar los ${V.length} de esta página</label>
   <div class="row"><span class="small">${selW.size} seleccionado(s)</span>
    <button class="btn sm" data-act="w-bulk-rev" ${selW.size>selRev?'':'disabled'}>Marcar revisado</button>
    <button class="btn sm" data-act="w-bulk-unrev" ${selRev?'':'disabled'}>Quitar revisado</button>
    <select class="mini" id="wBulkCls" aria-label="Reclasificar seleccionados" ${selCls?'':'disabled'}><option value="">Reclasificar como…</option>${clsOptsAmbos()}</select>
    <button class="btn sm" data-act="w-bulk-cls" ${selCls?'':'disabled'}>Aplicar</button>
    <button class="btn sm danger" data-act="w-bulk-desv" ${selW.size?'':'disabled'}>Deshacer (${selW.size})</button>
    <button class="btn ghost sm" data-act="w-export">Exportar ${selW.size?'seleccionados':'vista'} a Excel</button></div></div>
  <div class="tw"><table><thead><tr><th></th><th>Fecha</th><th>Descripción del banco</th><th>N° Op.</th><th class="n">Monto</th><th>Explicado con</th><th class="n">Diferencia</th><th>Estado</th><th></th></tr></thead><tbody>
  ${V.map(b=>{const its=wItems(b),e=wEst(b),al=wAlertas(b),gr=its.length?wGrupo(b):null,dif=gr?gr.dif:0,ln=state.links.filter(l=>l.b===b.id&&l.en).map(l=>l.en).sort().pop();
   const exp=its.length?its.map(i=>{const ci=compInfo(i),nro=[i.serie,i.num].filter(Boolean).join('-');return `<div style="margin-bottom:6px"><b>${esc(i.desc)}</b> <span class="hint">· ${fdate(i.fecha)} · ${fmt(i.monto)} · ${esc(i.quien)}</span>
     <div class="small">${badge(ci.tipo,ci.ok?'neutral':'warn')} ${nro?`<span class="mono">${esc(nro)}</span>`:''} ${i.ruc?`· RUC <span class="mono">${esc(i.ruc)}</span>`:''} ${i.rs?`· ${esc(i.rs)}`:''}</div></div>`;}).join('')+(gr&&gr.B.length>1?`<div class="hint">Pagado en ${gr.B.length} operaciones del banco (${gr.B.map(x=>fmt(bAmt(x))).join(' + ')})</div>`:''):clsEdit(b);
   return `<tr${b.revisado?' style="background:color-mix(in srgb,var(--success-soft) 35%,transparent)"':''}><td><input type="checkbox" data-wsel="${b.id}" ${selW.has(b.id)?'checked':''} aria-label="Seleccionar" style="width:18px;height:18px"></td><td>${fdate(b.fecha)}</td><td>${esc(b.desc)}<div class="hint">${esc(medioBanco(b))}</div></td><td class="mono small">${esc(b.op)}</td>
    <td class="n ${b.cargo>0?'t-bad':'t-ok'}">${b.cargo>0?'−':'+'} ${fmt(bAmt(b))}</td><td>${exp}</td>
    <td class="n">${its.length?(Math.abs(dif)<0.005?'<span class="hint">—</span>':`<span class="${dif>0?'t-warn':'t-bad'}">${dif>0?'falta ':'sobra '}${fmt(Math.abs(dif))}</span>`):'<span class="hint">—</span>'}</td>
    <td>${badge(W_EST[e][0],W_EST[e][1])}${al.includes('nota')?`<div style="margin-top:4px">${badge('Falta nota','warn')}</div>`:''}${b.revisado?`<div style="margin-top:4px">${badge('Revisado','ok')}</div><div class="hint">${fdate(b.revisado)}</div>`:''}${ln?`<div class="hint">vinculado el ${fdate(ln)}</div>`:''}</td>
    <td><div class="row">${e==='parcial'?`<button class="btn sm" data-act="v-buscar" data-v="${b.id}">+ Gasto</button>`:''}<button class="btn sm" data-act="w-rev" data-v="${b.id}" title="${b.revisado?'Quitar revisado':'Marcar revisado'}">${b.revisado?ic('undo'):ic('check')}</button><button class="btn ghost sm" data-act="desv-b" data-v="${b.id}">Deshacer</button></div></td></tr>`}).join('')}</tbody></table></div>
  ${pgW.html}`
  :`<div class="alert info"><div>No hay movimientos con estos filtros.</div><button class="btn sm" data-act="w-limpiar">Quitar filtros</button></div>`}`;
}
function clsEdit(b){
  const v=b.cls||'',k=v.startsWith('k:')&&b.cargo>0;
  return `<div class="row"><select class="mini" data-chg="cls" data-v="${b.id}" aria-label="Cambiar qué fue">${clsOpts(b.cargo>0,v)}</select>
   ${k?`<label class="row small" style="gap:4px"><input type="checkbox" data-sc="${b.id}" ${b.sc?'checked':''} style="width:16px;height:16px"> Sin comprobante</label>`:''}
   ${scB(b)||k?`<input class="input" style="height:32px;max-width:260px;font-size:13px" placeholder="${scB(b)?'¿En qué se gastó? (para el contador)':'Detalle (opcional)'}" value="${esc(b.nota||'')}" data-nota="${b.id}" aria-label="Detalle">`:''}</div>`;
}
function cControl(){
  const b=calcBanco(); const t={emp:0,caja:0,cf:0,rev:0,soc:{},tot:0,enc:0,falta:0,sinEC:0};
  GA().forEach(g=>{t.tot+=g.monto; if(g.medio===EMP){t.emp+=g.monto;const e=itemEstado(g.id)[0];if(e==='Conciliado')t.enc+=g.monto;else if(e==='Falta estado de cuenta')t.sinEC+=g.monto;else t.falta+=g.monto;} else if(g.medio===CAJA)t.caja+=g.monto; else if(g.medio===CF)t.cf+=g.monto; else if(isSocio(g.medio)){const n=socioDe(g.medio);t.soc[n]=(t.soc[n]||0)+g.monto;} else t.rev+=g.monto;});
  const ok=b.ec===null?null:Math.abs(b.fin-b.ec)<0.005; const cnt=k=>GA().filter(k).length;
  return `<div class="two">
  <div class="card"><h3>¿De dónde salió cada gasto del Forms?</h3><p class="hint" style="margin:2px 0 8px">${GA().length} respuestas del Forms${state.gastos.length>GA().length?` (sin contar ${state.gastos.length-GA().length} quitadas por duplicado)`:''}. Solo lo pagado con la cuenta de la empresa debe aparecer en el estado de cuenta.</p>
   <table class="ctl"><tbody><tr><td>Pagado con la cuenta de la empresa (${cnt(g=>g.medio===EMP)})</td><td class="n">${fmt(t.emp)}</td></tr>
   <tr><td style="padding-left:16px" class="small">· Vinculado con el banco</td><td class="n t-ok">${fmt(t.enc)}</td></tr>
   <tr><td style="padding-left:16px" class="small">· Falta vincular</td><td class="n ${t.falta?'t-bad':''}">${fmt(t.falta)}</td></tr>
   <tr><td style="padding-left:16px" class="small">· Mes sin estado de cuenta</td><td class="n">${fmt(t.sinEC)}</td></tr>
   <tr><td>Pagado con caja chica (${cnt(g=>g.medio===CAJA)})</td><td class="n">${fmt(t.caja)}</td></tr>
   ${socioNames().map(n=>`<tr><td>Pagado por ${esc(n)} · préstamo (${cnt(g=>g.medio==='Socio: '+n)})</td><td class="n">${fmt(t.soc[n]||0)}</td></tr>`).join('')}
   <tr><td>Solo crédito fiscal (${cnt(g=>g.medio===CF)})</td><td class="n">${fmt(t.cf)}</td></tr>${t.rev?`<tr><td class="t-bad">Sin clasificar</td><td class="n t-bad">${fmt(t.rev)}</td></tr>`:''}
   <tr class="tot"><td>Total del Forms</td><td class="n">${fmt(t.tot)}</td></tr></tbody></table></div>
  <div class="card"><h3>Estado de cuenta del banco</h3><p class="hint" style="margin:2px 0 8px">${state.banco.length} movimientos cargados.</p>
   <table class="ctl"><tbody><tr><td>Saldo inicial</td><td class="n">${fmt(state.config.saldoInicialBanco)}</td></tr><tr><td>(+) Abonos</td><td class="n">${fmt(b.ab)}</td></tr><tr><td>(–) Cargos</td><td class="n">${fmt(b.ca)}</td></tr>
   <tr class="tot"><td>Saldo final calculado</td><td class="n">${fmt(b.fin)}</td></tr><tr><td>Saldo final según el estado de cuenta</td><td class="n">${b.ec===null?'—':fmt(b.ec)}</td></tr>
   <tr><td>Revisión</td><td class="n">${ok===null?'—':ok?badge('Cuadra','ok'):badge('Diferencia '+fmt(b.fin-b.ec),'bad')}</td></tr>
   ${ok===false?(()=>{const df=bancoDiff();return `<tr><td colspan="2" class="small" style="background:var(--warning-soft);padding:10px 12px;border-radius:8px">${df?`Empieza el <b>${fdate(df.b.fecha)}</b> en “${esc(df.b.desc)}”. ${esc(df.pista)} `:'Revisa el saldo inicial del banco en Configuración. '}<button class="btn sm" data-act="ver-banco" style="margin-top:6px">Ver y corregir en el estado de cuenta</button></td></tr>`;})():''}
   <tr><td colspan="2" class="label" style="padding-top:16px">En qué se fueron los cargos</td></tr>
   <tr><td>Vinculados a un gasto registrado</td><td class="n">${fmt(b.by.conc)}</td></tr><tr><td>Clasificados por concepto (planilla, insumos…)</td><td class="n">${fmt(b.by.k)}</td></tr><tr><td>Gastos sin comprobante</td><td class="n ${b.by.sc?'t-warn':''}">${fmt(b.by.sc)}</td></tr><tr><td>Devoluciones a socios</td><td class="n">${fmt(b.by.dev)}</td></tr><tr><td>Fondo de caja chica (aún sin gastar)</td><td class="n">${fmt(b.by.fondo)}</td></tr><tr><td>Comisiones e intereses</td><td class="n">${fmt(b.by.com)}</td></tr>
   <tr><td class="${b.by.sin?'t-bad':''}">Por explicar</td><td class="n ${b.by.sin?'t-bad':''}">${fmt(b.by.sin)}</td></tr></tbody></table></div></div>`;
}
/* ---- Gastos del Forms: segmentos, filtros, selección masiva ---- */
let fG={medio:'',est:'',mes:'',quien:'',tipo:'',comp:'',q:'',orden:'reciente',lim:100}, selG=new Set();
const G_MEDIO=g=>g.medio===EMP?'emp':g.medio===CAJA?'caja':g.medio===CF?'cf':isSocio(g.medio)?'s:'+socioDe(g.medio):'rev';
function gEstKey(g){if(g.ignorado)return 'quitado';if(g.medio!==EMP)return G_MEDIO(g).startsWith('s:')?'socio':G_MEDIO(g);
  const e=itemEstado(g.id)[0];return e==='Conciliado'?'conc':e.startsWith('Vinculado en parte')?'parcial':e==='Monto distinto'?'dist':e==='Falta vincular'?'falta':'sinEC';}
const G_EST={conc:['Conciliado','success'],parcial:['Vinculado en parte','warning'],dist:['Monto distinto','danger'],falta:['Falta vincular','danger'],sinEC:['Falta estado de cuenta','warning'],socio:['Préstamo de socio','primary'],caja:['Caja chica','primary'],cf:['Solo crédito fiscal',''],rev:['Revisar medio de pago','danger'],quitado:['Quitados por duplicado','']};
const gTipoCorto=t=>String(t||'').split('(')[0].trim()||'Sin tipo';
function gMatch(g,skip){
  if(skip!=='est'&&(fG.est?gEstKey(g)!==fG.est:g.ignorado))return false;
  if(skip!=='medio'&&fG.medio&&G_MEDIO(g)!==fG.medio)return false;
  if(fG.mes&&mesDe(g.fecha)!==fG.mes)return false;
  if(fG.quien&&g.quien!==fG.quien)return false;
  if(fG.tipo&&gTipoCorto(g.tipo)!==fG.tipo)return false;
  if(fG.comp&&compInfo(g).tipo!==fG.comp)return false;
  if(fG.q){const ops=(LG[g.id]||[]).map(i=>bById(i)?.op).join(' ');const t=[g.desc,g.rs,g.ruc,g.quien,g.serie,g.num,(g.serie||'')+'-'+(g.num||''),(+g.monto).toFixed(2),g.op,ops,g.tipo,g.comp].join(' ');if(!norm(t).includes(norm(fG.q)))return false;}
  return true;}
function cGastos(){
  if(!state.gastos.length)return `<div class="empty">Aún no subiste el Excel del Forms. Usa “Subir → Excel del Forms”, o agrega un gasto a mano.<div style="margin-top:10px"><button class="btn" data-act="g-nuevo">${ic('plus')} Agregar gasto</button></div></div>`;
  const medios=[EMP,CAJA,CF,...socioNames().map(n=>'Socio: '+n)];
  const Gs=state.gastos;
  let G=Gs.filter(g=>gMatch(g));
  G.sort(fG.orden==='antiguo'?(x,y)=>x.fecha.localeCompare(y.fecha):fG.orden==='monto'?(x,y)=>y.monto-x.monto:(x,y)=>y.fecha.localeCompare(x.fecha));
  [...selG].forEach(id=>{if(!G.some(g=>g.id===id))selG.delete(id);});
  const pgG=pageOf('gastos',G),V=pgG.rows,o=(v,l,c)=>`<option value="${esc(v)}" ${c===v?'selected':''}>${esc(l)}</option>`;
  const sum=a=>a.reduce((x,g)=>x+(+g.monto||0),0);
  const baseM=Gs.filter(g=>gMatch(g,'medio')),baseE=Gs.filter(g=>gMatch(g,'est'));
  const mChip=(k,l)=>{const L=k?baseM.filter(g=>G_MEDIO(g)===k):baseM;if(k&&!L.length&&fG.medio!==k)return '';return `<button class="btn sm" data-act="gfil" data-k="medio" data-v="${esc(k)}" style="${fG.medio===k?'background:var(--primary-soft);border-color:var(--primary)':''}">${l} <b class="num">${L.length}</b> <span class="hint num">${fmt(sum(L))}</span></button>`;};
  const eChip=k=>{const n=k?baseE.filter(g=>gEstKey(g)===k).length:baseE.filter(g=>!g.ignorado).length;if(k&&!n&&fG.est!==k)return '';const [l,tone]=k?G_EST[k]:['Todos',''];return `<button class="btn sm" data-act="gfil" data-k="est" data-v="${k}" style="${fG.est===k?'background:var(--primary-soft);border-color:var(--primary)':''}">${tone?`<span class="dot" style="background:var(--${tone})"></span>`:''}${esc(l)} <b class="num">${n}</b></button>`;};
  const meses=[...new Set(Gs.map(g=>mesDe(g.fecha)))].sort().reverse(),quienes=[...new Set(Gs.map(g=>g.quien).filter(Boolean))].sort(),tipos=[...new Set(Gs.map(g=>gTipoCorto(g.tipo)))].sort(),comps=[...new Set(Gs.map(g=>compInfo(g).tipo))].sort();
  const fil=fG.medio||fG.est||fG.mes||fG.quien||fG.tipo||fG.comp||fG.q;
  const okC=G.filter(g=>compInfo(g).ok),soc=G.filter(g=>isSocio(g.medio));
  const sel=[...selG].map(gById).filter(Boolean),selIgn=sel.filter(g=>g.ignorado).length;
  return `<div class="row between" style="margin-bottom:10px"><span class="hint small">Gastos que llegan del Forms y los agregados aquí a mano.</span><button class="btn" data-act="g-nuevo">${ic('plus')} Agregar gasto</button></div><details style="margin-bottom:12px"><summary class="hint" style="cursor:pointer"><b>¿Qué significa “cómo se pagó” y cada estado?</b></summary>
   <div class="two" style="margin-top:10px">
    <div class="card"><h3>¿Cómo se pagó? (de dónde salió el dinero)</h3><table class="ctl small"><tbody>
     <tr><td><b>${EMP}</b></td><td>Salió de la cuenta BCP de Vitta Kleanly (transferencia, tarjeta o retiro). Debe aparecer en el estado de cuenta, así que se vincula con su línea del banco.</td></tr>
     <tr><td><b>${CAJA}</b></td><td>Se pagó con el efectivo del fondo de caja chica. No toca el banco: se descuenta del fondo.</td></tr>
     <tr><td><b>Socio: nombre</b></td><td>Lo pagó el socio con su propia plata. Nunca pasó por el banco: la empresa le queda debiendo ese monto (préstamo del socio).</td></tr>
     <tr><td><b>${CF}</b></td><td>Solo se registra para tener la factura (IGV) a nombre de la empresa, pero no salió dinero de la empresa ni se le debe a un socio. No suma en el flujo.</td></tr>
    </tbody></table></div>
    <div class="card"><h3>Estado (qué falta hacer)</h3><table class="ctl small"><tbody>
     <tr><td>${badge('Conciliado','ok')}</td><td>Pagado con la cuenta y ya relacionado con su línea del banco; los montos cuadran.</td></tr>
     <tr><td>${badge('Falta vincular','bad')}</td><td>Pagado con la cuenta, ese mes ya tiene estado de cuenta, pero aún no lo relacionas. No suma al flujo hasta vincularlo (para no contarlo dos veces).</td></tr>
     <tr><td>${badge('Falta estado de cuenta','warn')}</td><td>Pagado con la cuenta, pero aún no subiste el estado de cuenta de ese mes. Suma como provisional.</td></tr>
     <tr><td>${badge('Vinculado en parte','warn')} ${badge('Monto distinto','bad')}</td><td>Lo vinculaste, pero el banco cubre menos o más que el gasto.</td></tr>
     <tr><td>${badge('Préstamo de socio','info')}</td><td>La empresa le debe ese monto al socio. Se acumula en “Socios y caja chica”.</td></tr>
     <tr><td>${badge('Caja chica','info')} ${badge('Solo crédito fiscal','neutral')}</td><td>No requieren banco. “Revisar medio de pago” significa que el Forms trajo un medio que la app no reconoce: cámbialo.</td></tr>
    </tbody></table></div></div></details>
  <div class="mstats">
   <div class="mstat"><div class="kl">Gastos</div><div class="kv num">${G.length}</div><div class="hint">${fil?'con los filtros':'del Forms'}</div></div>
   <div class="mstat"><div class="kl">Total</div><div class="kv num">${fmt(sum(G))}</div></div>
   <div class="mstat"><div class="kl">Con comprobante válido</div><div class="kv num t-ok">${fmt(sum(okC))}</div><div class="hint">${okC.length} gastos</div></div>
   <div class="mstat"><div class="kl">Sin comprobante o incompleto</div><div class="kv num t-warn">${fmt(sum(G)-sum(okC))}</div><div class="hint">${G.length-okC.length} gastos</div></div>
   <div class="mstat"><div class="kl">Pagado por socios</div><div class="kv num">${fmt(sum(soc))}</div><div class="hint">préstamos a la empresa</div></div>
  </div>
  <div class="row" style="margin-bottom:6px"><span class="hint small">Cómo se pagó:</span>${mChip('','Todos')}${mChip('emp',EMP)}${mChip('caja',CAJA)}${socioNames().map(n=>mChip('s:'+n,'Socio: '+n.split(' ')[0])).join('')}${mChip('cf',CF)}${mChip('rev','Revisar medio')}</div>
  <div class="row" style="margin-bottom:10px"><span class="hint small">Estado:</span>${eChip('')}${['conc','falta','sinEC','parcial','dist','socio','caja','cf','rev','quitado'].map(eChip).join('')}</div>
  <div class="row" style="margin-bottom:12px">
   <select class="input" style="width:150px" data-gfil="mes" aria-label="Mes">${o('','Todos los meses',fG.mes)}${meses.map(m=>o(m,MES[+m.slice(5)-1]+' '+m.slice(0,4),fG.mes)).join('')}</select>
   <select class="input" style="width:170px" data-gfil="quien" aria-label="Registró">${o('','Registró: todos',fG.quien)}${quienes.map(q=>o(q,q,fG.quien)).join('')}</select>
   <select class="input" style="width:190px" data-gfil="tipo" aria-label="Tipo de gasto">${o('','Tipo de gasto: todos',fG.tipo)}${tipos.map(q=>o(q,q,fG.tipo)).join('')}</select>
   <select class="input" style="width:200px" data-gfil="comp" aria-label="Comprobante">${o('','Comprobante: todos',fG.comp)}${comps.map(q=>o(q,q,fG.comp)).join('')}</select>
   <select class="input" style="width:180px" data-gfil="orden" aria-label="Orden">${o('reciente','Recientes primero',fG.orden)}${o('antiguo','Antiguos primero',fG.orden)}${o('monto','Monto mayor primero',fG.orden)}</select>
   <input class="input" style="flex:1;min-width:200px" placeholder="Buscar descripción, proveedor, RUC, serie, monto, N° op…" value="${esc(fG.q)}" data-gq="1" aria-label="Buscar">
   ${fil?'<button class="btn ghost sm" data-act="g-limpiar">Quitar filtros</button>':''}
  </div>
  ${G.length?`<div class="row between" style="margin-bottom:12px;padding:8px 12px;background:var(--surface-sunken);border-radius:var(--r-md)">
   <label class="row small" style="gap:6px"><input type="checkbox" data-gselall="1" ${V.length&&V.every(g=>selG.has(g.id))?'checked':''} style="width:18px;height:18px"> Seleccionar los ${V.length} de esta página</label>
   <div class="row"><span class="small">${selG.size} seleccionado(s) · <span class="num">${fmt(sum(sel))}</span></span>
    <select class="mini" id="gBulkMedio" aria-label="Cambiar cómo se pagó" ${selG.size>selIgn?'':'disabled'}><option value="">Cambiar “cómo se pagó” a…</option>${medios.map(m=>`<option value="${esc(m)}">${esc(m)}</option>`).join('')}</select>
    <button class="btn sm" data-act="g-bulk-medio" ${selG.size>selIgn?'':'disabled'}>Aplicar</button>
    ${selIgn?`<button class="btn sm" data-act="g-bulk-restore">Restaurar (${selIgn})</button>`:''}
    <button class="btn sm danger" data-act="g-bulk-quitar" ${selG.size>selIgn?'':'disabled'}>Quitar (${selG.size-selIgn})</button>
    <button class="btn ghost sm" data-act="g-export">Exportar ${selG.size?'seleccionados':'vista'} a Excel</button></div></div>
  <div class="tw"><table><thead><tr><th></th><th>Fecha</th><th>Registró</th><th>¿Cómo se pagó?</th><th>Comprobante</th><th>Proveedor</th><th>Descripción</th><th class="n">Monto</th><th>Op. banco</th><th>Estado</th><th></th></tr></thead><tbody>
  ${V.map(g=>{const ops=(LG[g.id]||[]).map(i=>bById(i)?.op).filter(Boolean).join(' + ');const e=g.ignorado?['Quitado por duplicado','neutral']:gastoEstado(g),ci=compInfo(g),nro=[g.serie,g.num].filter(Boolean).join('-');
   const lnk=(u,l)=>u&&/^https?:/.test(String(u).split(/[,\s]/)[0])?`<a href="${esc(String(u).split(/[,\s]/)[0])}" target="_blank" rel="noopener" class="small">${l}</a>`:'';
   return `<tr style="${g.ignorado?'opacity:.6':''}"><td><input type="checkbox" data-gsel="${esc(g.id)}" ${selG.has(g.id)?'checked':''} aria-label="Seleccionar" style="width:18px;height:18px"></td><td>${fdate(g.fecha)}</td><td class="small">${esc(g.quien)}</td>
   <td><select class="mini" data-chg="medio" data-v="${esc(g.id)}" aria-label="Medio de pago" ${g.ignorado?'disabled':''}>${[...new Set([...medios,g.medio])].map(m=>`<option ${m===g.medio?'selected':''}>${esc(m)}</option>`).join('')}</select></td>
   <td>${badge(ci.tipo,ci.ok?'neutral':'warn')}${nro?`<div class="mono small">${esc(nro)}</div>`:''}${g.ruc?`<div class="hint mono">RUC ${esc(g.ruc)}</div>`:''}</td>
   <td class="small">${esc(g.rs||'')}</td><td>${esc(g.desc)}${g.tipo?`<div class="hint">${esc(gTipoCorto(g.tipo))}</div>`:''}${g.manual?`<div style="margin-top:2px">${badge('Agregado en la app','neutral')}</div>`:''}</td><td class="n">${fmt(g.monto)}</td><td class="mono small">${esc(ops||(g.op?g.op+' (Forms)':''))}</td>
   <td>${badge(e[0],e[1])}${g.ignorado&&g.ignoradoEl?`<div class="hint">el ${fdate(g.ignoradoEl)}</div>`:''}</td>
   <td><div class="row"><button class="btn ghost sm" data-act="ver-gasto" data-v="${esc(g.id)}">Ver / editar</button>${lnk(g.fotoComp,'Comprobante')}${lnk(g.fotoPago,'Pago')}${g.ignorado?`<button class="btn ghost sm" data-act="dup-restore" data-v="${esc(g.id)}">Restaurar</button>`:''}</div></td></tr>`}).join('')}</tbody></table></div>
  ${pgG.html}
  <p class="hint" style="margin-top:8px">“Op. banco” muestra el N° de operación vinculado, o el que se escribió en el Forms. “Quitar” no borra nada del Forms: la app deja de contarlo y puedes restaurarlo.</p>`
  :`<div class="alert info"><div>No hay gastos con estos filtros.</div><button class="btn sm" data-act="g-limpiar">Quitar filtros</button></div>`}`;
}
function bancoDiff(){ // primera línea donde el saldo calculado deja de coincidir con el del estado de cuenta
  let run=+state.config.saldoInicialBanco||0,prevOk=true;
  for(const b of state.banco){run=r2(run+b.abono-b.cargo);const has=b.saldo!==null&&b.saldo!==undefined&&b.saldo!=='';
    if(has&&Math.abs(run-b.saldo)>=0.005){const d=r2(run-b.saldo);
      let pista='Puede faltar una línea antes de esta, o una línea tiene el monto o el tipo (cargo/abono) mal.';
      const half=state.banco.find(x=>Math.abs(x.abono-d/2)<0.005||Math.abs(x.cargo+d/2)<0.005);
      if(state.banco.indexOf(b)===0) pista='Es la primera línea: probablemente el saldo inicial del banco está mal (configúralo en Configuración o edita esta línea).';
      else if(half) pista=`Una línea de ${fmt(Math.abs(d/2))} pudo entrar como ${half.abono?'abono en vez de cargo':'cargo en vez de abono'} (revisa ${fdate(half.fecha)} · ${half.desc}).`;
      else if(d>0) pista=`Parece que falta un cargo de ${fmt(d)} justo antes de esta línea, o el cargo de esta línea es ${fmt(d)} mayor de lo registrado.`;
      else pista=`Parece que falta un abono de ${fmt(-d)} antes de esta línea, o un cargo está registrado de más.`;
      return {b,calc:run,diff:d,pista};}}
  return null;
}
/* ---- Estado de cuenta: saldo línea por línea + qué explica cada movimiento ---- */
let fB={est:'',tipo:'',mes:'',medio:'',q:'',orden:'banco'}, selB=new Set();
function bEstKey(b){if((LB[b.id]||[]).length){const e=wEst(b);return e==='conc'?'conc':'parcial';}return b.cls?'cls':'pend';}
const B_EST={pend:['Por explicar','danger'],conc:['Vinculado y cuadra','success'],parcial:['Vinculado con diferencia','warning'],cls:['Clasificado','primary'],saldo:['Saldo no cuadra','danger']};
function cBanco(){
  let run=+state.config.saldoInicialBanco||0; const calc={}; state.banco.forEach(b=>{run=r2(run+b.abono-b.cargo);calc[b.id]=run;});
  const df=bancoDiff();
  if(!state.banco.length)return `<div class="row between" style="margin-bottom:12px"><span></span><button class="btn" data-act="add-banco">+ Agregar línea</button></div><div class="empty">Sube el estado de cuenta con el botón “Subir estado de cuenta”.</div>`;
  const has=b=>b.saldo!==null&&b.saldo!==undefined&&b.saldo!=='',malSaldo=b=>has(b)&&Math.abs(calc[b.id]-b.saldo)>=0.005;
  const match=(b,skip)=>{
    if(skip!=='est'&&fB.est&&(fB.est==='saldo'?!malSaldo(b):bEstKey(b)!==fB.est))return false;
    if(fB.tipo&&(fB.tipo==='cargo'?!(b.cargo>0):!(b.abono>0)))return false;
    if(fB.mes&&mesDe(b.fecha)!==fB.mes)return false;
    if(fB.medio&&medioBanco(b)!==fB.medio)return false;
    if(fB.q){const its=wItems(b);const t=[b.desc,b.op,bAmt(b).toFixed(2),b.nota,b.cls?clsLabel(b.cls):'',...its.flatMap(i=>[i.desc,i.quien,i.ruc,i.rs,i.serie,i.num,(i.serie||'')+'-'+(i.num||'')])].join(' ');if(!norm(t).includes(norm(fB.q)))return false;}
    return true;};
  const base=state.banco.filter(b=>match(b,'est'));
  let L=state.banco.filter(b=>match(b));
  if(fB.orden==='reciente')L=L.slice().reverse();else if(fB.orden==='monto')L=L.slice().sort((x,y)=>bAmt(y)-bAmt(x));
  [...selB].forEach(id=>{if(!L.some(b=>b.id===id))selB.delete(id);});
  FZW.__bancoVista=L;const pg=pageOf('banco',L),V=pg.rows,o=(v,l,c)=>`<option value="${esc(v)}" ${c===v?'selected':''}>${esc(l)}</option>`;
  const n=k=>k==='saldo'?base.filter(malSaldo).length:base.filter(b=>bEstKey(b)===k).length;
  const chip=k=>{const c=k?n(k):base.length;if(k&&!c&&fB.est!==k)return '';const [l,tone]=k?B_EST[k]:['Todos',''];return `<button class="btn sm" data-act="bfil" data-v="${k}" style="${fB.est===k?'background:var(--primary-soft);border-color:var(--primary)':''}">${tone?`<span class="dot" style="background:var(--${tone})"></span>`:''}${l} <b class="num">${c}</b></button>`;};
  const meses=[...new Set(state.banco.map(b=>mesDe(b.fecha)))].sort(),medios=[...new Set(state.banco.map(medioBanco))];
  const fil=fB.est||fB.tipo||fB.mes||fB.medio||fB.q;
  const ult=state.banco[state.banco.length-1],ultS=[...state.banco].reverse().find(has);
  const sumC=L.reduce((a,b)=>a+(b.cargo||0),0),sumA=L.reduce((a,b)=>a+(b.abono||0),0);
  const sel=[...selB].map(bById).filter(Boolean),selLink=sel.filter(b=>(LB[b.id]||[]).length||b.cls).length,selFree=sel.filter(b=>!(LB[b.id]||[]).length).length;
  return `<div class="row between" style="margin-bottom:12px;align-items:flex-start"><p class="hint" style="margin:0;flex:1;min-width:260px">El saldo recalculado parte del saldo inicial del banco (${fmt(state.config.saldoInicialBanco)}) y debe coincidir línea por línea con el del estado de cuenta. Si una línea está mal, edítala; si falta, agrégala. En “Explicado con” ves el gasto y su comprobante, o cómo la clasificaste.</p><button class="btn" data-act="add-banco">+ Agregar línea</button></div>
  ${df?`<div class="alert warn"><div><b>La diferencia empieza el ${fdate(df.b.fecha)} en “${esc(df.b.desc)}”:</b> el estado de cuenta dice ${fmt(df.b.saldo)} y la app calcula ${fmt(df.calc)} (diferencia ${fmt(df.diff)}). ${esc(df.pista)}</div><div class="row"><button class="btn primary sm" data-act="b-falta" data-v="${df.b.id}">Agregar la línea que falta aquí</button><button class="btn sm" data-act="bfil" data-v="saldo">Ver líneas con saldo distinto</button></div></div>`:''}
  <div class="mstats">
   <div class="mstat"><div class="kl">Líneas</div><div class="kv num">${L.length}</div><div class="hint">${fil?'con los filtros':'del estado de cuenta'}</div></div>
   <div class="mstat"><div class="kl">Cargos</div><div class="kv num t-bad">${fmt(sumC)}</div></div>
   <div class="mstat"><div class="kl">Abonos</div><div class="kv num t-ok">${fmt(sumA)}</div></div>
   <div class="mstat"><div class="kl">Saldo final</div><div class="kv num">${fmt(calc[ult.id])}</div><div class="hint">${ultS?(Math.abs(calc[ultS.id]-ultS.saldo)<0.005?'cuadra con el banco':'banco dice '+fmt(ultS.saldo)):'sin saldo del banco'}</div></div>
   <div class="mstat"><div class="kl">Por explicar</div><div class="kv num ${n('pend')?'t-bad':''}">${state.banco.filter(b=>bEstKey(b)==='pend').length}</div><div class="hint">${fmt(bancoPend().reduce((a,b)=>a+faltante(b),0))}</div></div>
  </div>
  <div class="row" style="margin-bottom:10px">${chip('')}${['pend','conc','parcial','cls','saldo'].map(chip).join('')}</div>
  <div class="row" style="margin-bottom:12px">
   <select class="input" style="width:150px" data-bfil="tipo" aria-label="Tipo">${o('','Cargos y abonos',fB.tipo)}${o('cargo','Solo cargos',fB.tipo)}${o('abono','Solo abonos',fB.tipo)}</select>
   <select class="input" style="width:150px" data-bfil="mes" aria-label="Mes">${o('','Todos los meses',fB.mes)}${meses.map(m=>o(m,MES[+m.slice(5)-1]+' '+m.slice(0,4),fB.mes)).join('')}</select>
   <select class="input" style="width:200px" data-bfil="medio" aria-label="Medio">${o('','Todos los medios',fB.medio)}${medios.map(m=>o(m,m,fB.medio)).join('')}</select>
   <select class="input" style="width:210px" data-bfil="orden" aria-label="Orden">${o('banco','Orden del estado de cuenta',fB.orden)}${o('reciente','Recientes primero',fB.orden)}${o('monto','Monto mayor primero',fB.orden)}</select>
   <input class="input" style="flex:1;min-width:200px" placeholder="Buscar descripción, N° op., monto, gasto, RUC, serie…" value="${esc(fB.q)}" data-bq="1" aria-label="Buscar">
   ${fil?'<button class="btn ghost sm" data-act="b-limpiar">Quitar filtros</button>':''}
  </div>
  ${L.length?`<div class="row between" style="margin-bottom:12px;padding:8px 12px;background:var(--surface-sunken);border-radius:var(--r-md)">
   <label class="row small" style="gap:6px"><input type="checkbox" data-bselall="1" ${V.length&&V.every(b=>selB.has(b.id))?'checked':''} style="width:18px;height:18px"> Seleccionar los ${V.length} de esta página</label>
   <div class="row"><span class="small">${selB.size} seleccionado(s)</span>
    <select class="mini" id="bBulkCls" aria-label="Clasificar seleccionados" ${selFree?'':'disabled'}><option value="">Clasificar como…</option>${clsOptsAmbos()}</select>
    <button class="btn sm" data-act="b-bulk-cls" ${selFree?'':'disabled'}>Aplicar</button>
    <button class="btn sm" data-act="b-bulk-desv" ${selLink?'':'disabled'}>Quitar vinculación (${selLink})</button>
    <button class="btn sm danger" data-act="b-bulk-del" ${selB.size?'':'disabled'}>Borrar (${selB.size})</button>
    <button class="btn ghost sm" data-act="b-export">Exportar ${selB.size?'seleccionados':'vista'} a Excel</button></div></div>
  <div class="tw"><table><thead><tr><th style="width:34px"></th><th>Fecha</th><th>Descripción del banco</th><th>N° Op.</th><th class="n">Monto</th><th class="n">Saldo</th><th>Explicado con</th><th>Estado</th><th></th></tr></thead><tbody>
  ${V.map(b=>{const bad=malSaldo(b),first=df&&df.b.id===b.id,its=wItems(b),k=bEstKey(b),e=bancoEstado(b);
   const exp=its.length?its.map(i=>{const ci=compInfo(i),nro=[i.serie,i.num].filter(Boolean).join('-');return `<div style="margin-bottom:4px"><b>${esc(i.desc)}</b> <span class="hint">· ${fdate(i.fecha)} · ${fmt(i.monto)} · ${esc(i.quien)}</span><div class="small">${badge(ci.tipo,ci.ok?'neutral':'warn')} ${nro?`<span class="mono">${esc(nro)}</span>`:''} ${i.ruc?`· RUC <span class="mono">${esc(i.ruc)}</span>`:''} ${i.rs?`· ${esc(i.rs)}`:''}</div></div>`;}).join('')
     :b.cls?`<div>${esc(clsLabel(b.cls))}</div>${scB(b)?(b.nota?`<div class="hint">${esc(b.nota)}</div>`:`<div>${badge('Falta nota de en qué se gastó','warn')}</div>`):''}`
     :`<span class="hint">Aún no se relaciona</span>`;
   const est=k==='pend'?badge(asignado(b)?'Vinculado en parte':'Por explicar','bad'):k==='parcial'?badge('Vinculado con diferencia','warn'):k==='conc'?badge('Vinculado','ok'):badge(e[0],e[0].startsWith('Devolución')||e[0].startsWith('Préstamo')?'info':'neutral');
   return `<tr style="${first?'background:var(--danger-soft)':''}"><td><input type="checkbox" data-bsel2="${b.id}" ${selB.has(b.id)?'checked':''} aria-label="Seleccionar" style="width:18px;height:18px"></td><td>${fdate(b.fecha)}</td><td>${esc(b.desc)}<div class="hint">${esc(medioBanco(b))}${b.manual?' · agregada a mano':''}</div></td><td class="mono small">${esc(b.op)}</td>
   <td class="n ${b.cargo>0?'t-bad':'t-ok'}">${b.cargo>0?'−':'+'} ${fmt(bAmt(b))}</td>
   <td class="n">${has(b)?fmt(b.saldo):'<span class="hint">—</span>'}${bad?`<div class="t-bad small">app: ${fmt(calc[b.id])} ${ic('triangle',14)}</div>`:''}</td>
   <td>${exp}</td><td>${est}${b.revisado?`<div style="margin-top:4px">${badge('Revisado','ok')}</div>`:''}</td>
   <td><div class="row">${k==='pend'?`<button class="btn primary sm" data-act="v-buscar" data-v="${b.id}">Vincular</button>`:''}<button class="btn ghost sm" data-act="edit-banco" data-v="${b.id}">Editar</button><button class="btn ghost sm danger" data-act="del-banco" data-v="${b.id}">Borrar</button>${fB.orden==='banco'?`<span class="row" style="gap:2px"><button class="btn ghost sm" data-act="b-up" data-v="${b.id}" title="Subir una posición" aria-label="Subir">${ic('chev-up')}</button><button class="btn ghost sm" data-act="b-down" data-v="${b.id}" title="Bajar una posición" aria-label="Bajar">${ic('chev-down')}</button></span>`:''}</div></td></tr>`}).join('')}</tbody></table></div>${pg.html}`
  :`<div class="alert info"><div>No hay líneas con estos filtros.</div><button class="btn sm" data-act="b-limpiar">Quitar filtros</button></div>`}`;
}

/* ---------------- Socios y caja chica ---------------- */
function movSocio(n){
  const m=[];
  GA().filter(g=>g.medio==='Socio: '+n).forEach(g=>m.push({f:g.fecha,t:'Pagó un gasto de la empresa',d:g.desc,v:g.monto,g,src:'Forms'}));
  state.movimientos.filter(x=>x.tipo==='egreso'&&x.pagadoPor===n).forEach(x=>m.push({f:x.fecha,t:'Pagó un gasto de la empresa',d:x.descripcion||x.subcategoria,v:x.monto,g:dupItem(x,'manual'),src:'Registro rápido'}));
  state.movimientos.filter(x=>x.tipo==='ingreso'&&x.subcategoria==='Préstamo de Socio'&&x.socio===n).forEach(x=>m.push({f:x.fecha,t:esBanco(x.cuenta)?'Depositó en la cuenta':'Puso efectivo en caja chica',d:x.descripcion||'Préstamo',v:x.monto}));
  state.movimientos.filter(x=>x.tipo==='egreso'&&x.subcategoria==='Devolución de Préstamo a Socio'&&x.socio===n).forEach(x=>m.push({f:x.fecha,t:'La empresa le devolvió',d:x.descripcion||'Devolución',v:-x.monto}));
  CE().filter(c=>cajaOrigen(c)==='socio'&&c.socio===n).forEach(c=>m.push({f:c.fecha,t:'Puso efectivo en caja chica',d:c.obs||'',v:c.monto,src:'Caja chica'}));
  state.banco.filter(b=>b.abono>0&&b.cls==='apo:'+n).forEach(b=>m.push({f:b.fecha,t:'Depositó en la cuenta',d:b.desc,v:b.abono,op:b.op,src:'Banco'}));
  state.banco.filter(b=>b.cargo>0&&b.cls==='dev:'+n).forEach(b=>m.push({f:b.fecha,t:'La empresa le devolvió',d:b.desc,v:-b.cargo,op:b.op,src:'Banco'}));
  return m.sort((a,b)=>a.f<b.f?-1:a.f>b.f?1:0);
}
/* ---------------- Cajas chicas: varias cajas, cada una con su responsable (fondo fijo / imprest) ----------------
   Registros en state.caja: entrada (sin kind) · {kind:'arqueo'} · {kind:'rendicion'}. Cajas en state.config.cajas. */
const CE=()=>state.caja.filter(c=>!c.kind||c.kind==='entrada');
function cajas(){return state.config.cajas||[];}
function asegurarCajas(){if(!cajas().length&&(state.caja.length||GA().some(g=>g.medio===CAJA)||crm().some(c=>cobDest(c)==='caja'))){state.config.cajas=[{id:'CJ1',nombre:'Caja principal',custodio:'',fondo:0,limite:0,activa:true}];save();}}
const cajaById=id=>cajas().find(c=>c.id===id);
function cajaDeGasto(g){const C=cajas();if(g.cajaId&&cajaById(g.cajaId))return g.cajaId;const m=C.find(c=>c.activa!==false&&c.custodio&&norm(c.custodio)===norm(g.quien));return (m||C[0]||{}).id||'';}
const cajaDeEntrada=c=>c.cajaId&&cajaById(c.cajaId)?c.cajaId:(cajas()[0]||{}).id||'';
function cajaMovs(id){const L=[];
  CE().filter(c=>!id||cajaDeEntrada(c)===id).forEach(c=>L.push({id:c.id,f:c.fecha,tipo:'entrada',caja:cajaDeEntrada(c),d:cajaOrigen(c)==='socio'?'Efectivo de '+c.socio+' (préstamo)':ORIGC[cajaOrigen(c)],obs:c.obs||'',v:+c.monto,c}));
  GA().filter(g=>g.medio===CAJA&&(!id||cajaDeGasto(g)===id)).forEach(g=>L.push({id:g.id,f:g.fecha,tipo:'gasto',caja:cajaDeGasto(g),d:g.desc,obs:g.quien,v:-(+g.monto||0),g}));
  crm().filter(c=>cobDest(c)==='caja'&&(!id||cobCaja(c)===id)).forEach(c=>L.push({id:c.id,f:c.fecha,tipo:'cobro',caja:cobCaja(c),d:cobDesc(c),obs:[c.medio,c.tipo].filter(Boolean).join(' · '),v:+c.monto,q:c}));
  L.sort((a,b)=>a.f.localeCompare(b.f)||(a.tipo==='gasto'?1:-1));let run=0;L.forEach(x=>x.saldo=run=r2(run+x.v));return L;}
function cajaInfo(c){const M=cajaMovs(c.id),saldo=M.length?M[M.length-1].saldo:0,hoy=hoyISO(),mes=hoy.slice(0,7);
  const porRendir=M.filter(x=>x.g&&!x.g.rendido),arqs=state.caja.filter(x=>x.kind==='arqueo'&&x.cajaId===c.id).sort((a,b)=>a.fecha.localeCompare(b.fecha)),ult=arqs[arqs.length-1];
  const rends=state.caja.filter(x=>x.kind==='rendicion'&&x.cajaId===c.id).sort((a,b)=>a.fecha.localeCompare(b.fecha)),ultR=rends[rends.length-1];
  const sinC=M.filter(x=>x.g&&!compInfo(x.g).ok),sobre=M.filter(x=>x.g&&c.limite>0&&-x.v>c.limite);
  const diasArq=ult?Math.round(dayN(hoy)-dayN(ult.fecha)):null;
  let est=['Al día','ok'];
  if(c.activa===false)est=['Cerrada','neutral'];else if(saldo<0)est=['Saldo negativo','bad'];else if(c.fondo>0&&saldo<c.fondo*0.3)est=['Reponer','warn'];else if(M.length&&(diasArq===null||diasArq>31))est=['Arqueo pendiente','warn'];
  return {M,saldo,porRendir,pr:r2(-porRendir.reduce((a,x)=>a+x.v,0)),ult,ultR,arqs,rends,sinC,sobre,est,gastMes:r2(-M.filter(x=>x.v<0&&mesDe(x.f)===mes).reduce((a,x)=>a+x.v,0))};}
function saldoCajaAl(id,fecha){return r2(cajaMovs(id).filter(x=>x.f<=fecha).reduce((a,x)=>a+x.v,0));}
function cajaRows(){
  const ms=[...new Set([...state.caja.map(c=>mesDe(c.fecha)),...GA().filter(g=>g.medio===CAJA).map(g=>mesDe(g.fecha))])].sort();
  let s=0; return ms.map(m=>{const i=r2(state.caja.filter(x=>mesDe(x.fecha)===m).reduce((a,x)=>a+x.monto,0)),g=r2(GA().filter(x=>x.medio===CAJA&&mesDe(x.fecha)===m).reduce((a,x)=>a+x.monto,0)),ini=s;s=r2(ini+i-g);const c=state.config.contado?.[m];return {m,ini,i,g,teo:s,c:(c===undefined||c===null||c==='')?null:+c};});
}
const ORIGC={banco:'Retiro de la cuenta de la empresa',socio:'Efectivo de un socio (préstamo)',otro:'Otra fuente'};
/* ---------------- Ver / editar un movimiento ---------------- */
const COMP_OPTS=['Factura','Boleta','Recibo por honorarios','Ticket / boleto de transporte','Sin comprobante'];
const ro=(l,v)=>`<div class="field"><label>${l}</label><div class="small" style="min-height:40px;display:flex;align-items:center;flex-wrap:wrap;gap:6px">${v||'<span class="hint">—</span>'}</div></div>`;
function dlgGasto(id,pre){const nuevo=!id;const g=nuevo?{id:'',fecha:hoyISO(),quien:'',desc:'',monto:'',medio:EMP,tipo:'',comp:'',ruc:'',rs:'',serie:'',num:'',op:'',...(pre||{})}:gById(id);if(!g)return;
  const quienes=[...new Set([...socioNames(),...state.gastos.map(x=>x.quien).filter(Boolean)])];
  const medios=[...new Set([EMP,CAJA,CF,...socioNames().map(n=>'Socio: '+n),g.medio])].filter(Boolean),comps=[...new Set([...COMP_OPTS,g.comp].filter(Boolean))];
  const tipos=[...new Set(state.gastos.map(x=>x.tipo).filter(Boolean))],e=g.ignorado?['Quitado por duplicado','neutral']:gastoEstado(g);
  const lks=(LG[g.id]||[]).map(bById).filter(Boolean),o=(v,c,l)=>`<option value="${esc(v)}" ${v===c?'selected':''}>${esc(l||v)}</option>`;
  dlg((nuevo?`<h2>Agregar gasto</h2>
  <p class="hint" style="margin:4px 0 14px">Para un gasto que no se registró en el Forms. Queda junto a los demás gastos (marcado “agregado en la app”) y la app avisa si parece repetido.</p>
  ${pre&&pre.dupWarn?`<div class="alert warn"><div><b>Este gasto se parece a ${pre.dupWarn.length} ya registrado(s):</b><br>${pre.dupWarn.map(x=>esc(fdate(x.fecha)+' · '+x.desc+' · '+fmt(x.monto)+' · '+x.quien)).join('<br>')}<br>Si de verdad es otro gasto, pulsa “Agregar gasto” de nuevo.</div></div>`:''}
  <form data-form="gasto"><input type="hidden" name="id" value="">${pre&&pre.dupWarn?'<input type="hidden" name="confirm" value="1">':''}<div class="fg">
   <div class="field full"><label>Registró / pagó</label><input class="input" name="quien" list="dlQuienG" value="${esc(g.quien)}" required placeholder="Persona que hizo el gasto"><datalist id="dlQuienG">${quienes.map(q=>`<option value="${esc(q)}">`).join('')}</datalist></div>`
  :`<div class="row between"><h2>Gasto del Forms${g.manual?' <span class="hint" style="font-size:13px;font-weight:600">· agregado en la app</span>':''}</h2>${badge(e[0],e[1])}</div>
  <p class="hint" style="margin:4px 0 14px">Registrado por <b>${esc(g.quien||'—')}</b>${g.ts?' el '+esc(fechaHora(g.ts)):''}. Los cambios se guardan en la app (no modifican el Google Form) y se respetan aunque vuelvas a subir el Excel del Forms.</p>
  <form data-form="gasto"><input type="hidden" name="id" value="${esc(g.id)}"><div class="fg">`)+`
   <div class="field"><label>Fecha de emisión</label><input class="input" type="date" name="fecha" value="${esc(g.fecha)}" required></div>
   <div class="field"><label>Monto total (S/)</label><input class="input mono" type="number" step="0.01" min="0" name="monto" value="${+g.monto||''}" required></div>
   <div class="field full"><label>Descripción</label><input class="input" name="desc" value="${esc(g.desc)}" required></div>
   <div class="field"><label>¿Cómo se pagó?</label><select class="input" name="medio">${medios.map(m=>o(m,g.medio)).join('')}</select></div>${(g.medio===CAJA||nuevo)&&cajas().length>1?`<div class="field"><label>Caja chica${nuevo?' (si se pagó con caja)':''}</label>${cajaSel(nuevo?(cajas()[0]||{}).id:cajaDeGasto(g))}</div>`:''}
   <div class="field"><label>Tipo de gasto</label><input class="input" name="tipo" list="dlTipos" value="${esc(g.tipo||'')}"><datalist id="dlTipos">${tipos.map(t=>`<option value="${esc(t)}">`).join('')}</datalist></div>
   <div class="field"><label>Tipo de comprobante</label><select class="input" name="comp">${o('',g.comp||'','— Elegir —')}${comps.map(c=>o(c,g.comp||'')).join('')}</select></div>
   <div class="field"><label>RUC del proveedor</label><input class="input mono" name="ruc" inputmode="numeric" maxlength="11" value="${esc(g.ruc||'')}"></div>
   <div class="field full"><label>Razón social</label><input class="input" name="rs" value="${esc(g.rs||'')}"></div>
   <div class="field"><label>Serie</label><input class="input mono" name="serie" value="${esc(g.serie||'')}"></div>
   <div class="field"><label>Número</label><input class="input mono" name="num" value="${esc(g.num||'')}"></div>
   <div class="field"><label>N° de operación (escrito en el Forms)</label><input class="input mono" name="op" value="${esc(g.op||'')}"></div>
   ${nuevo?'':ro('Fotos',[enlace(g.fotoComp,'Comprobante'),enlace(g.fotoPago,'Pago')].filter(Boolean).join(' · '))}
   ${nuevo?'':`<div class="field full"><label>Vinculación con el banco</label>${g.medio===EMP&&!g.ignorado&&r2(g.monto-linkedAmt(g.id))>0.004?`<div class="row" style="margin-bottom:6px"><button class="btn sm" type="button" data-act="pb-abrir" data-v="${esc(g.id)}">Buscar en el estado de cuenta…</button><span class="hint small">falta vincular ${fmt(r2(g.monto-linkedAmt(g.id)))}</span></div>`:''}${lks.length?lks.map(b=>`<div class="row between" style="padding:6px 0;border-top:1px solid var(--line)"><span class="small">${fdate(b.fecha)} · ${esc(b.desc)} ${b.op?`· <span class="mono">Op ${esc(b.op)}</span>`:''} · <b class="num">${fmt(bAmt(b))}</b></span><span class="row"><button class="btn ghost sm" type="button" data-act="ver-banco-det" data-v="${b.id}">Ver línea</button><button class="btn ghost sm danger" type="button" data-act="d-desv" data-g="${esc(g.id)}" data-b="${b.id}">Quitar relación</button></span></div>`).join('')
     :`<div class="hint small">${g.medio===EMP?'Aún no está vinculado a una línea del estado de cuenta.':'No requiere banco: '+esc(g.medio==='Caja chica'?'se pagó con caja chica.':isSocio(g.medio)?'lo pagó el socio (préstamo).':'no movió dinero de la empresa.')}</div>`}</div>`}
  </div>
  <div class="row between" style="margin-top:20px"><div>${nuevo?'':g.manual?`<button class="btn ghost sm danger" type="button" data-act="g-del" data-v="${esc(g.id)}">${ic('trash')} Eliminar gasto</button>`:g.ignorado?`<button class="btn sm" type="button" data-act="d-restore" data-v="${esc(g.id)}">Restaurar</button>`:`<button class="btn ghost sm danger" type="button" data-act="d-quitar" data-v="${esc(g.id)}">Quitar (es duplicado)</button>`}</div>
   <div class="row"><button class="btn" type="button" data-act="close">Cancelar</button><button class="btn primary" type="submit">${nuevo?'Agregar gasto':'Guardar cambios'}</button></div></div></form>`,true);}
function dlgBancoDet(id){const b=bById(id);if(!b)return;
  const its=wItems(b),gr=its.length?wGrupo(b):null,e=bancoEstado(b),opts=b.cargo>0?CLS_C():CLS_A();
  dlg(`<div class="row between"><h2>Línea del estado de cuenta</h2>${badge(e[0],e[1]==='bad'?'bad':e[1])}</div>
  <div class="fg" style="margin-top:12px">${ro('Fecha',fdate(b.fecha))}${ro('N° de operación',b.op?`<span class="mono">${esc(b.op)}</span>`:'')}
   <div class="full">${ro('Descripción del banco',esc(b.desc)+` <span class="hint">· ${esc(medioBanco(b))}</span>`)}</div>
   ${ro(b.cargo>0?'Cargo (salió)':'Abono (entró)',`<b class="num ${b.cargo>0?'t-bad':'t-ok'}">${fmt(bAmt(b))}</b>`)}${ro('Saldo según el banco',b.saldo!=null&&b.saldo!==''?`<span class="num">${fmt(b.saldo)}</span>`:'')}</div>
  <h3 style="margin:16px 0 6px">Explicado con</h3>
  ${its.length?its.map(i=>{const ci=compInfo(i);return `<div class="row between" style="padding:8px 0;border-top:1px solid var(--line)"><div class="small" style="flex:1;min-width:220px"><b>${esc(i.desc)}</b> · ${fdate(i.fecha)} · ${fmt(i.monto)} · ${esc(i.quien)}<div>${badge(ci.tipo,ci.ok?'neutral':'warn')} ${[i.serie,i.num].filter(Boolean).join('-')} ${i.ruc?'· RUC '+esc(i.ruc):''}</div></div>
     <span class="row">${i.kind==='forms'?`<button class="btn sm" type="button" data-act="ver-gasto" data-v="${esc(i.id)}">Ver / editar gasto</button>`:i.kind==='crm'?`<button class="btn sm" type="button" data-act="ver-cobro" data-v="${esc(i.id)}">Ver cobro</button>`:`<button class="btn sm" type="button" data-act="editar" data-v="${esc(i.id)}">Editar registro</button>`}<button class="btn ghost sm danger" type="button" data-act="d-desv" data-g="${esc(i.id)}" data-b="${b.id}">Quitar relación</button></span></div>`;}).join('')
    +(gr&&Math.abs(gr.dif)>0.004?`<div class="alert warn" style="margin-top:8px"><div>El banco y los gastos vinculados no cuadran: diferencia ${fmt(gr.dif)}.</div></div>`:'')
    +(gr&&gr.B.length>1?`<p class="hint small">Este gasto se pagó en ${gr.B.length} operaciones: ${gr.B.filter(x=>x.id!==b.id).map(x=>`<a href="#" data-act="ver-banco-det" data-v="${x.id}">${fdate(x.fecha)} · ${fmt(bAmt(x))}</a>`).join(', ')}.</p>`:'')
   :`<form data-form="bcls"><input type="hidden" name="id" value="${b.id}"><div class="fg"><div class="field"><label>¿Qué fue?</label><select class="input" name="cls"><option value="">Por explicar</option>${clsOpts(b.cargo>0,b.cls||'')}</select></div>${b.cargo>0?`<div class="field"><label>Comprobante</label><label class="row small" style="gap:6px;min-height:40px"><input type="checkbox" name="sc" value="1" ${scB(b)?'checked':''} style="width:18px;height:18px"> No tiene comprobante</label></div>`:''}
     <div class="field full"><label>Detalle para el contador</label><input class="input" name="nota" value="${esc(b.nota||'')}"></div></div>
     <div class="row" style="margin-top:10px;justify-content:space-between"><button class="btn sm" type="button" data-act="v-buscar" data-v="${b.id}">Buscar el gasto en el Forms…</button><button class="btn primary sm" type="submit">Guardar clasificación</button></div></form>`}
  <div class="row between" style="margin-top:20px"><button class="btn ghost sm" type="button" data-act="edit-banco" data-v="${b.id}">Corregir datos de la línea</button><button class="btn" type="button" data-act="close">Cerrar</button></div>`,true);}
function dlgCajaEdit(id){const c=state.caja.find(x=>x.id===id);if(!c)return;const o=cajaOrigen(c);
  dlg(`<h2>Entrega a caja chica</h2><form data-form="cajaedit"><input type="hidden" name="id" value="${c.id}"><div class="fg" style="margin-top:12px">
   <div class="field full"><label>Caja</label>${cajaSel(cajaDeEntrada(c))}</div>
   <div class="field"><label>Fecha</label><input class="input" type="date" name="fecha" value="${esc(c.fecha)}" required></div>
   <div class="field"><label>Monto (S/)</label><input class="input mono" type="number" step="0.01" min="0" name="monto" value="${c.monto}" required></div>
   <div class="field full"><label>De dónde salió el efectivo</label><select class="input" name="origen"><option value="banco" ${o==='banco'?'selected':''}>${ORIGC.banco}</option>${socioNames().map(n=>`<option value="socio:${esc(n)}" ${o==='socio'&&c.socio===n?'selected':''}>Efectivo de ${esc(n)} (préstamo)</option>`).join('')}<option value="otro" ${o==='otro'?'selected':''}>${ORIGC.otro}</option></select></div>
   <div class="field full"><label>Detalle</label><input class="input" name="obs" value="${esc(c.obs||'')}"></div></div>
   <div class="row" style="margin-top:20px;justify-content:space-between"><button class="btn ghost sm danger" type="button" data-act="m-del" data-v="c:${c.id}">${ic('trash')} Eliminar</button><div class="row"><button class="btn" type="button" data-act="close">Cancelar</button><button class="btn primary" type="submit">Guardar cambios</button></div></div></form>`);}
/* ---- Corregir pendientes desde las alertas del Resumen (ventana con acciones directas) ---- */
function pendItems(kind){const movs=allMovs();
  if(kind==='sc')return state.banco.filter(b=>scB(b)).map(b=>({t:'sc',b}));
  const L=kind==='pend'?vivos(movs).filter(m=>m.pendiente):movs.filter(m=>m.excluido===NOSUMA);
  return L.map(m=>{const id=String(m.id);
    if(id.startsWith('b:')||id.startsWith('ba:'))return {t:'banco',b:bById(id.replace(/^ba?:/,'')),m};
    if(id.startsWith('g:'))return {t:'gasto',g:gById(id.slice(2)),m};
    return {t:'manual',x:state.movimientos.find(x=>x.id===id),m};}).filter(x=>x.b||x.g||x.x);}
function dlgPend(kind){FZW.__pendKind=kind;const I=pendItems(kind);
  const T={pend:['Movimientos provisionales o por explicar','Corrige cada uno: explica las líneas del banco y revisa los gastos que todavía no tienen estado de cuenta.'],
    exc:['Gastos de la cuenta de la empresa sin vincular','Estos gastos dicen que se pagaron con la cuenta, pero aún no tienen su línea del banco. Búscala, o cambia “cómo se pagó” si en realidad lo pagó un socio o la caja chica.'],
    sc:['Gastos sin comprobante','Anota en qué se gastó cada uno: el contador lo necesita para sustentarlos.']}[kind];
  const optsB=b=>clsOpts(b.cargo>0,'','c:');
  const medSel=g=>`<select class="mini" data-chg="medio" data-v="${esc(g.id)}" aria-label="Cambiar cómo se pagó"><option value="">¿No fue con la cuenta? Cambiar…</option><option>${CAJA}</option>${socioNames().map(n=>`<option value="Socio: ${esc(n)}">Lo pagó ${esc(n)}</option>`).join('')}<option>${CF}</option></select>`;
  const row=x=>{
    if(x.t==='sc')return `<tr><td>${fdate(x.b.fecha)}</td><td>${esc(x.b.desc)}<div class="hint">${esc(medioBanco(x.b))}${x.b.op?' · Op '+esc(x.b.op):''}</div></td><td class="n">${fmt(bAmt(x.b))}</td>
      <td><input class="input" style="height:34px" placeholder="¿En qué se gastó?" value="${esc(x.b.nota||'')}" data-nota="${x.b.id}" aria-label="En qué se gastó">${x.b.nota?'':`<div style="margin-top:4px">${badge('Falta nota','warn')}</div>`}</td><td><button class="btn ghost sm" data-act="ver-banco-det" data-back="1" data-v="${x.b.id}">Ver</button></td></tr>`;
    if(x.t==='banco')return `<tr><td>${fdate(x.b.fecha)}</td><td>${esc(x.b.desc)}<div class="hint">Línea del banco · ${esc(medioBanco(x.b))}${x.b.op?' · Op '+esc(x.b.op):''}</div><div style="margin-top:2px">${badge('Por explicar','bad')}</div></td><td class="n ${x.b.cargo>0?'t-bad':'t-ok'}">${x.b.cargo>0?'−':'+'} ${fmt(bAmt(x.b))}</td>
      <td><div class="row"><button class="btn sm primary" data-act="v-buscar" data-back="1" data-v="${x.b.id}">Buscar gasto</button><select class="mini" data-chg="rel" data-v="${x.b.id}" aria-label="Indicar qué fue"><option value="">¿No está en el Forms? Es…</option>${optsB(x.b)}</select></div></td><td><button class="btn ghost sm" data-act="ver-banco-det" data-back="1" data-v="${x.b.id}">Ver</button></td></tr>`;
    if(x.t==='gasto'){const g=x.g,sinEC=!bancoMeses().has(mesDe(g.fecha));return `<tr><td>${fdate(g.fecha)}</td><td>${esc(g.desc)}<div class="hint">Gasto del Forms · ${esc(g.quien)}</div><div style="margin-top:2px">${badge(sinEC?'Falta estado de cuenta de '+MES[+g.fecha.slice(5,7)-1]:'Falta vincular',sinEC?'warn':'bad')}</div></td><td class="n t-bad">− ${fmt(g.monto)}</td>
      <td><div class="row">${sinEC?`<button class="btn sm primary" data-act="imp-banco">Subir estado de cuenta</button>`:`<button class="btn sm primary" data-act="pb-abrir" data-back="1" data-v="${esc(g.id)}">Buscar en el banco</button>`}${medSel(g)}</div>${sinEC?'<div class="hint small" style="margin-top:4px">Se confirma al subir el estado de cuenta de ese mes. Si la fecha está mal, corrígela en “Ver”.</div>':''}</td>
      <td><button class="btn ghost sm" data-act="ver-gasto" data-back="1" data-v="${esc(g.id)}">Ver / editar</button></td></tr>`;}
    const m=x.x;return `<tr><td>${fdate(m.fecha)}</td><td>${esc(m.descripcion||m.subcategoria)}<div class="hint">Registro rápido · ${esc(m.cuenta)}</div></td><td class="n">${fmt(m.monto)}</td><td><button class="btn sm" data-act="pb-abrir" data-back="1" data-v="${esc(m.id)}">Buscar en el banco</button></td><td><button class="btn ghost sm" data-act="editar" data-v="${esc(m.id)}">Editar</button></td></tr>`;};
  const tot=I.reduce((a,x)=>a+(x.b?bAmt(x.b):x.g?+x.g.monto:+x.x.monto),0);
  dlg(`<div data-pend="${kind}"><div class="row between"><h2>${T[0]}</h2>${I.length?badge(I.length+' por corregir · '+fmt(tot),'warn'):badge('Todo corregido','ok')}</div>
   <p class="hint" style="margin:6px 0 14px">${T[1]} Cada cambio se guarda al momento y la lista se actualiza.</p>
   ${I.length?`<div class="tw scroll" style="max-height:60vh"><table><thead><tr><th>Fecha</th><th>Movimiento</th><th class="n">Monto</th><th>Corregir</th><th></th></tr></thead><tbody>${I.map(row).join('')}</tbody></table></div>`
     :`<div class="alert ok"><div>${badge('Listo','ok')} No queda nada pendiente en esta lista.</div></div>`}
   <div class="row" style="margin-top:16px;justify-content:space-between"><button class="btn ghost sm" data-act="ir-cruce" data-v="${kind==='sc'?'vinculados':'pendientes'}">Abrir el Cruce con el banco</button><button class="btn" data-act="pend-cerrar">Cerrar</button></div></div>`,true);}
function verMov(key){const x=(FZW.__libroMap||{})[key];if(!x)return;
  if(x.fuente==='conc'||x.fuente==='banco')return dlgBancoDet(x.bid);
  if(x.mid)return editar(x.mid);
  if(key.startsWith('g:'))return dlgGasto(key.slice(2));
  if(key.startsWith('c:'))return dlgCajaEdit(key.slice(2));
  if(key.startsWith('q:'))return dlgCobro(key.slice(2));}
/* ---------------- Préstamos de socios (cuenta por pagar a socios) ---------------- */
let fP={socio:'',mes:'',tipo:'',comp:'',q:''};
const P_TIPOS=['Pagó un gasto de la empresa','Puso efectivo en caja chica','Depositó en la cuenta','La empresa le devolvió'];
function socioResumen(n){const m=movSocio(n),s=t=>r2(m.filter(x=>x.t===t).reduce((a,x)=>a+x.v,0));const ad=s(P_TIPOS[0]),ef=s(P_TIPOS[1]),dp=s(P_TIPOS[2]),dv=-s(P_TIPOS[3]);
  const sinC=r2(m.filter(x=>x.g&&!compInfo(x.g).ok).reduce((a,x)=>a+x.v,0));return {n,m,ad,ef,dp,dv,sinC,saldo:r2(ad+ef+dp-dv)};}
function vSocios(){
  const names=socioNames();if(!names.length)return '<div class="empty">Aún no hay socios. Agrégalos en Configuración o sube el Forms.</div>';
  if(fP.socio&&!names.includes(fP.socio))fP.socio='';
  const R=names.map(socioResumen),tot=r2(R.reduce((a,r)=>a+r.saldo,0));
  // detalle con saldo acumulado por socio
  let D=[];R.forEach(r=>{let run=0;r.m.forEach(x=>{run=r2(run+x.v);D.push({...x,socio:r.n,saldo:run});});});
  const M=x=>(!fP.socio||x.socio===fP.socio)&&(!fP.mes||mesDe(x.f)===fP.mes)&&(!fP.tipo||x.t===fP.tipo)&&(!fP.comp||(x.g?(fP.comp==='ok'?compInfo(x.g).ok:!compInfo(x.g).ok):false))
    &&(!fP.q||norm([x.d,x.op,x.socio,x.t,Math.abs(x.v).toFixed(2),x.g?.ruc,x.g?.rs,x.g?.serie,x.g?.num].join(' ')).includes(norm(fP.q)));
  const L=D.filter(M).sort((a,b)=>b.f.localeCompare(a.f));FZW.__presVista=L;
  const pg=pageOf('socio',L),o=(v,l,c)=>`<option value="${esc(v)}" ${c===v?'selected':''}>${esc(l)}</option>`,meses=[...new Set(D.map(x=>mesDe(x.f)))].sort().reverse();
  const fil0=fP.socio||fP.mes||fP.tipo||fP.comp||fP.q;
  return `<div class="row between" style="margin-bottom:12px;align-items:flex-start"><p class="hint" style="margin:0;flex:1;min-width:260px">Cuenta por pagar a los socios: lo que cada uno pagó con su propia plata o puso en la empresa, menos lo que la empresa ya le devolvió. Esta plata <b>nunca entró a la cuenta de la empresa</b>; por eso se controla aquí y no en el banco. Las devoluciones por transferencia se marcan en el Cruce (cargo → “Devolución a …”).</p>
   <div class="row"><button class="btn ghost sm" data-act="p-export">Exportar a Excel</button></div></div>
  <div class="mstats">
   <div class="mstat"><div class="kl">Deuda total con socios</div><div class="kv num t-warn">${fmt(tot)}</div><div class="hint">por devolver</div></div>
   ${R.map(r=>`<button class="mstat" data-act="p-socio" data-v="${esc(r.n)}" style="text-align:left;cursor:pointer;font:inherit;color:inherit;${fP.socio===r.n?'border-color:var(--primary);box-shadow:inset 0 0 0 1px var(--primary);background:var(--primary-soft)':''}"><div class="kl">${esc(r.n)}</div><div class="kv num">${fmt(r.saldo)}</div><div class="hint">pagó ${fmt(r.ad)} · devuelto ${fmt(r.dv)}</div></button>`).join('')}
  </div>
  <div class="tw" style="margin-bottom:16px"><table><thead><tr><th>Socio</th><th class="n">Pagó gastos</th><th class="n">Efectivo a caja</th><th class="n">Depósitos</th><th class="n">(–) Devuelto</th><th class="n">Saldo por devolver</th><th class="n">Gastos sin comprobante válido</th></tr></thead><tbody>
   ${R.map(r=>`<tr><td><b>${esc(r.n)}</b></td><td class="n">${fmt(r.ad)}</td><td class="n">${fmt(r.ef)}</td><td class="n">${fmt(r.dp)}</td><td class="n">${fmt(r.dv)}</td><td class="n"><b>${fmt(r.saldo)}</b></td><td class="n ${r.sinC?'t-warn':''}">${fmt(r.sinC)}</td></tr>`).join('')}
   <tr><td><b>Total</b></td><td class="n">${fmt(R.reduce((a,r)=>a+r.ad,0))}</td><td class="n">${fmt(R.reduce((a,r)=>a+r.ef,0))}</td><td class="n">${fmt(R.reduce((a,r)=>a+r.dp,0))}</td><td class="n">${fmt(R.reduce((a,r)=>a+r.dv,0))}</td><td class="n"><b>${fmt(tot)}</b></td><td class="n">${fmt(R.reduce((a,r)=>a+r.sinC,0))}</td></tr></tbody></table></div>
  <h3 style="margin-bottom:8px">Detalle de movimientos</h3>
  <div class="row" style="margin-bottom:10px"><span class="hint small">Socio:</span><button class="btn sm" data-act="p-socio" data-v="" style="${!fP.socio?'background:var(--primary-soft);border-color:var(--primary)':''}">Todos</button>${names.map(n=>`<button class="btn sm" data-act="p-socio" data-v="${esc(n)}" style="${fP.socio===n?'background:var(--primary-soft);border-color:var(--primary)':''}">${esc(n)} <b class="num">${D.filter(x=>x.socio===n).length}</b></button>`).join('')}</div>
  <div class="row" style="margin-bottom:12px">
   <select class="input" style="width:150px" data-pfil="mes" aria-label="Mes">${o('','Todos los meses',fP.mes)}${meses.map(m=>o(m,MES[+m.slice(5)-1]+' '+m.slice(0,4),fP.mes)).join('')}</select>
   <select class="input" style="width:230px" data-pfil="tipo" aria-label="Movimiento">${o('','Todos los movimientos',fP.tipo)}${P_TIPOS.map(t=>o(t,t,fP.tipo)).join('')}</select>
   <select class="input" style="width:220px" data-pfil="comp" aria-label="Comprobante">${o('','Comprobante: todos',fP.comp)}${o('ok','Con comprobante válido',fP.comp)}${o('no','Sin comprobante o incompleto',fP.comp)}</select>
   <input class="input" style="flex:1;min-width:180px" placeholder="Buscar detalle, RUC, serie, Op., monto…" value="${esc(fP.q)}" data-pq="1" aria-label="Buscar">
   ${fil0?'<button class="btn ghost sm" data-act="p-limpiar">Quitar filtros</button>':''}</div>
  ${L.length?`<div class="tw"><table><thead><tr><th>Fecha</th><th>Socio</th><th>Movimiento</th><th>Detalle</th><th>Comprobante</th><th class="n">Monto</th><th class="n">Saldo del socio</th></tr></thead><tbody>
  ${pg.rows.map(x=>{const ci=x.g?compInfo(x.g):null,nro=x.g?[x.g.serie,x.g.num].filter(Boolean).join('-'):'';return `<tr><td>${fdate(x.f)}</td><td class="small">${esc(x.socio)}</td><td class="small">${esc(x.t)}<div class="hint">${esc(x.src||'')}</div></td><td>${esc(x.d||'—')}${x.op?`<div class="hint mono">Op ${esc(x.op)}</div>`:''}</td>
   <td class="small">${ci?`${badge(ci.tipo,ci.ok?'neutral':'warn')}${nro?`<div class="mono">${esc(nro)}</div>`:''}${x.g.ruc?`<div class="hint mono">RUC ${esc(x.g.ruc)}</div>`:''}`:'<span class="hint">—</span>'}</td>
   <td class="n ${x.v<0?'t-ok':''}">${x.v<0?'− ':''}${fmt(Math.abs(x.v))}</td><td class="n">${fmt(x.saldo)}</td></tr>`;}).join('')}</tbody></table></div>${pg.html}`
  :'<div class="empty">Sin movimientos con estos filtros.</div>'}`;
}
/* ---------------- Cajas chicas ---------------- */
let fK={mes:'',tipo:'',q:''},selCaja='';
function vCaja(){
  asegurarCajas();const C=cajas(),act=C.filter(c=>c.activa!==false);
  if(selCaja&&!cajaById(selCaja))selCaja='';
  const retBanco=r2(state.banco.filter(b=>b.cls==='fondo').reduce((a,b)=>a+b.cargo,0)), regBanco=r2(CE().filter(c=>cajaOrigen(c)==='banco').reduce((a,c)=>a+c.monto,0));
  const guia=`<div class="card" style="margin:0 0 16px;background:var(--primary-soft);border-color:var(--primary)"><h3>Cómo funciona la caja chica (fondo fijo)</h3>
   <ol class="small" style="margin:8px 0 12px;padding-left:20px;line-height:22px">
    <li><b>Crea una caja por responsable</b> (por ejemplo, la de Andree y la de Gary) con su <b>fondo fijo</b> (S/ 300, S/ 500…) y un <b>límite por gasto</b>.</li>
    <li><b>Entrega el efectivo</b> del fondo: sale de la cuenta de la empresa (lo más ordenado) o lo pone un socio (queda como préstamo).</li>
    <li><b>Cada gasto</b> se registra en el Forms con “Caja chica” y su comprobante. La app lo asigna a la caja de la persona que lo registró.</li>
    <li><b>Rinde</b> cuando el saldo baje (o cada mes): la app junta los gastos con sus comprobantes y repone exactamente lo gastado, para que la caja vuelva a su fondo.</li>
    <li><b>Haz arqueo</b> (contar el efectivo) al menos una vez al mes. Si no cuadra, aparece el faltante o sobrante.</li></ol>
   <button class="btn primary" data-act="caja-nueva">${ic('plus')} Crear la primera caja</button></div>`;
  if(!C.length)return guia;
  const I={};C.forEach(c=>I[c.id]=cajaInfo(c));
  const tot=r2(act.reduce((a,c)=>a+I[c.id].saldo,0)),pr=r2(C.reduce((a,c)=>a+I[c.id].pr,0)),gm=r2(C.reduce((a,c)=>a+I[c.id].gastMes,0)),sc=C.reduce((a,c)=>a+I[c.id].sinC.length,0),alertas=act.filter(c=>I[c.id].est[1]!=='ok').length;
  const card=c=>{const x=I[c.id],pct=c.fondo>0?Math.max(0,Math.min(100,x.saldo/c.fondo*100)):0,sel=selCaja===c.id;
    return `<div class="card" style="cursor:pointer;${sel?'border-color:var(--primary);box-shadow:inset 0 0 0 1px var(--primary)':''}${c.activa===false?';opacity:.65':''}" data-act="caja-sel" data-v="${c.id}">
     <div class="row between"><div><b>${esc(c.nombre)}</b><div class="hint small">${c.custodio?'Responsable: '+esc(c.custodio):'Sin responsable asignado'}</div></div>${badge(x.est[0],x.est[1])}</div>
     <div class="row between" style="margin-top:10px;align-items:flex-end"><div><div class="hint small">Saldo en efectivo</div><div class="num ${x.saldo<0?'t-bad':''}" style="font-size:22px;font-weight:700">${fmt(x.saldo)}</div></div><div class="hint small" style="text-align:right">${c.fondo>0?'de '+fmt(c.fondo)+' de fondo':'sin fondo fijo'}${c.limite>0?'<br>límite por gasto '+fmt(c.limite):''}</div></div>
     ${c.fondo>0?`<div style="height:8px;border-radius:4px;background:var(--surface-sunken);margin-top:8px"><div style="height:8px;border-radius:4px;width:${pct}%;background:var(--${pct<30?'warning':'primary'})"></div></div>`:''}
     <div class="small" style="margin-top:10px;display:grid;gap:3px">
      <span>Por rendir: <b class="num">${fmt(x.pr)}</b> <span class="hint">(${x.porRendir.length} gasto(s)${x.sinC.length?' · '+x.sinC.length+' sin comprobante válido':''})</span></span>
      <span>Último arqueo: ${x.ult?fdate(x.ult.fecha)+' · '+(Math.abs(x.ult.contado-x.ult.teorico)<0.005?'<span class="t-ok">cuadró</span>':`<span class="t-bad">${x.ult.contado<x.ult.teorico?'faltaron':'sobraron'} ${fmt(Math.abs(x.ult.contado-x.ult.teorico))}</span>`):'<span class="hint">nunca</span>'}</span>
      <span>Última rendición: ${x.ultR?fdate(x.ultR.fecha)+' · '+fmt(x.ultR.total):'<span class="hint">nunca</span>'}</span></div>
     <div class="row" style="margin-top:12px">${c.activa!==false?`<button class="btn sm" data-act="caja-entregar" data-v="${c.id}">${ic('arrow-in')} Entregar efectivo</button><button class="btn sm ${x.porRendir.length?'primary':''}" data-act="caja-rendir" data-v="${c.id}" ${x.porRendir.length?'':'disabled'}>Rendir y reponer</button><button class="btn sm" data-act="caja-arqueo" data-v="${c.id}">Arqueo</button>`:''}<button class="btn ghost sm" data-act="caja-edit" data-v="${c.id}">${ic('gear')} Editar</button></div></div>`;};
  // detalle
  const cs=selCaja?cajaById(selCaja):null;
  const K=cs?I[cs.id].M:cajaMovs('');
  const sobreL=x=>{const c=cajaById(x.caja);return x.g&&c&&c.limite>0&&-x.v>c.limite;};
  const M=x=>(!fK.mes||mesDe(x.f)===fK.mes)&&(!fK.tipo||(fK.tipo==='sincomp'?x.g&&!compInfo(x.g).ok:fK.tipo==='rendir'?x.g&&!x.g.rendido:fK.tipo==='limite'?sobreL(x):x.tipo===fK.tipo))
    &&(!fK.q||norm([x.d,x.obs,Math.abs(x.v).toFixed(2),x.g?.ruc,x.g?.rs,x.g?.serie,x.g?.num].join(' ')).includes(norm(fK.q)));
  const L=K.filter(M).slice().reverse();FZW.__cajaVista=L;
  const pg=pageOf('caja',L),o=(v,l,c)=>`<option value="${esc(v)}" ${c===v?'selected':''}>${esc(l)}</option>`,meses=[...new Set(K.map(x=>mesDe(x.f)))].sort().reverse();
  const chip=(k,l,n)=>n||fK.tipo===k||!k?`<button class="btn sm" data-act="k-tipo" data-v="${k}" style="${fK.tipo===k?'background:var(--primary-soft);border-color:var(--primary)':''}">${l} <b class="num">${n}</b></button>`:'';
  const nombre=id=>esc(cajaById(id)?.nombre||'—');
  const R=state.caja.filter(x=>x.kind==='rendicion'&&(!cs||x.cajaId===cs.id)).sort((a,b)=>b.fecha.localeCompare(a.fecha)),A=state.caja.filter(x=>x.kind==='arqueo'&&(!cs||x.cajaId===cs.id)).sort((a,b)=>b.fecha.localeCompare(a.fecha));
  return `<div class="row between" style="margin-bottom:12px;align-items:flex-start"><p class="hint" style="margin:0;flex:1;min-width:260px">Cada caja es un <b>fondo fijo</b> a cargo de una persona. Los gastos llegan del Forms (“Caja chica”) y se asignan a la caja de quien los registró. Al <b>rendir</b>, se repone exactamente lo gastado y la caja vuelve a su fondo.</p>
   <div class="row"><button class="btn" data-act="caja-nueva">${ic('plus')} Nueva caja</button><button class="btn ghost sm" data-act="k-export">${ic('download')} Exportar</button></div></div>
  ${retBanco>regBanco+0.004?`<div class="alert warn"><div><b>Marcaste ${fmt(retBanco)} del banco como “fondo de caja chica”, pero en las cajas solo se registraron ${fmt(regBanco)} entregados desde el banco.</b> Registra la entrega en la caja que corresponda, o si esa plata ya se gastó sin comprobante, cámbiala de clasificación.</div><button class="btn sm" data-act="fondo-a-sc">Pasarlos a “Sin comprobante”</button></div>`:''}
  <div class="mstats">
   <div class="mstat"><div class="kl">Efectivo en cajas</div><div class="kv num ${tot<0?'t-bad':''}">${fmt(tot)}</div><div class="hint">${act.length} caja(s) activa(s)</div></div>
   <div class="mstat"><div class="kl">Gastado este mes</div><div class="kv num t-bad">${fmt(gm)}</div></div>
   <div class="mstat"><div class="kl">Por rendir</div><div class="kv num ${pr?'t-warn':''}">${fmt(pr)}</div><div class="hint">gastos aún no repuestos</div></div>
   <div class="mstat"><div class="kl">Sin comprobante válido</div><div class="kv num ${sc?'t-warn':''}">${sc}</div><div class="hint">gastos de caja</div></div>
   <div class="mstat"><div class="kl">Cajas con alerta</div><div class="kv num ${alertas?'t-warn':''}">${alertas}</div><div class="hint">reponer, arqueo o saldo negativo</div></div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px;margin-bottom:18px">${C.map(card).join('')}</div>
  <div class="row between" style="margin-bottom:10px"><h3>${cs?'Movimientos de '+esc(cs.nombre):'Movimientos de todas las cajas'}</h3>${cs?`<button class="btn ghost sm" data-act="caja-sel" data-v="">Ver todas las cajas</button>`:''}</div>
  <div class="row" style="margin-bottom:10px">${chip('','Todos',K.length)}${chip('entrada','Entregas',K.filter(x=>x.tipo==='entrada').length)}${chip('gasto','Gastos',K.filter(x=>x.tipo==='gasto').length)}${chip('cobro','Cobros en efectivo',K.filter(x=>x.tipo==='cobro').length)}${chip('rendir','Por rendir',K.filter(x=>x.g&&!x.g.rendido).length)}${chip('sincomp','Sin comprobante válido',K.filter(x=>x.g&&!compInfo(x.g).ok).length)}${chip('limite','Sobre el límite',K.filter(sobreL).length)}</div>
  <div class="row" style="margin-bottom:12px"><select class="input" style="width:160px" data-kfil="mes" aria-label="Mes">${o('','Todos los meses',fK.mes)}${meses.map(m=>o(m,MES[+m.slice(5)-1]+' '+m.slice(0,4),fK.mes)).join('')}</select>
   <input class="input" style="flex:1;min-width:180px" placeholder="Buscar detalle, quién, RUC, monto…" value="${esc(fK.q)}" data-kq="1" aria-label="Buscar"></div>
  ${L.length?`<div class="tw"><table><thead><tr><th>Fecha</th>${cs?'':'<th>Caja</th>'}<th>Tipo</th><th>Detalle</th><th>Comprobante</th><th class="n">Monto</th>${cs?'<th class="n">Saldo</th>':''}<th></th></tr></thead><tbody>
  ${pg.rows.map(x=>{const ci=x.g?compInfo(x.g):null,nro=x.g?[x.g.serie,x.g.num].filter(Boolean).join('-'):'';return `<tr><td>${fdate(x.f)}</td>${cs?'':`<td class="small">${nombre(x.caja)}</td>`}<td>${x.tipo==='entrada'?badge('Entrega','ok'):x.tipo==='cobro'?badge('Cobro','ok'):badge('Gasto','bad')}</td>
   <td>${esc(x.d)}<div class="hint">${esc(x.obs)}</div>${x.g&&x.g.rendido?`<div style="margin-top:2px">${badge('Rendido','neutral')}</div>`:''}${sobreL(x)?`<div style="margin-top:2px">${badge('Sobre el límite','warn')}</div>`:''}</td>
   <td class="small">${ci?`${badge(ci.tipo,ci.ok?'neutral':'warn')}${nro?`<div class="mono">${esc(nro)}</div>`:''}`:'<span class="hint">—</span>'}</td>
   <td class="n ${x.v<0?'t-bad':'t-ok'}">${x.v<0?'−':'+'} ${fmt(Math.abs(x.v))}</td>${cs?`<td class="n">${fmt(x.saldo)}</td>`:''}
   <td><div class="row">${x.g?`${C.length>1?`<select class="mini" data-cajag="${esc(x.g.id)}" aria-label="Mover a otra caja">${C.map(c=>`<option value="${c.id}" ${c.id===x.caja?'selected':''}>${esc(c.nombre)}</option>`).join('')}</select>`:''}<button class="btn ghost sm" data-act="ver-gasto" data-v="${esc(x.g.id)}">Ver</button>`
     :x.q?`<button class="btn ghost sm" data-act="ver-cobro" data-v="${esc(x.q.id)}">Ver</button>`
     :`<button class="btn ghost sm" data-act="m-ver-caja" data-v="${x.c.id}">Editar</button><button class="btn ghost sm danger" data-act="del-caja" data-v="${x.c.id}">Borrar</button>`}</div></td></tr>`;}).join('')}</tbody></table></div>${pg.html}`:'<div class="empty">Sin movimientos con estos filtros.</div>'}
  <div class="two" style="margin-top:18px">
   <div class="card"><h3>Rendiciones</h3><p class="hint" style="margin:2px 0 8px">Cada rendición junta los gastos con sus comprobantes y repone lo gastado.</p>${R.length?`<div class="tw"><table><thead><tr><th>Fecha</th>${cs?'':'<th>Caja</th>'}<th class="n">Gastos</th><th class="n">Total</th><th>Repuesto</th><th></th></tr></thead><tbody>${R.map(r=>`<tr><td>${fdate(r.fecha)}</td>${cs?'':`<td class="small">${nombre(r.cajaId)}</td>`}<td class="n">${(r.gastos||[]).length}</td><td class="n">${fmt(r.total)}<div class="hint">${fmt(r.okTotal||0)} con comprobante</div></td><td>${r.repId?badge('Sí','ok'):badge('Pendiente','warn')}</td><td><button class="btn ghost sm danger" data-act="caja-rend-del" data-v="${r.id}">Deshacer</button></td></tr>`).join('')}</tbody></table></div>`:'<p class="hint">Aún no hay rendiciones.</p>'}</div>
   <div class="card"><h3>Arqueos</h3><p class="hint" style="margin:2px 0 8px">Conteo del efectivo contra lo que dicen los registros.</p>${A.length?`<div class="tw"><table><thead><tr><th>Fecha</th>${cs?'':'<th>Caja</th>'}<th class="n">Debería haber</th><th class="n">Contado</th><th>Resultado</th><th></th></tr></thead><tbody>${A.map(r=>{const d=r2(r.contado-r.teorico);return `<tr><td>${fdate(r.fecha)}</td>${cs?'':`<td class="small">${nombre(r.cajaId)}</td>`}<td class="n">${fmt(r.teorico)}</td><td class="n">${fmt(r.contado)}</td><td>${Math.abs(d)<0.005?badge('Cuadra','ok'):badge((d<0?'Faltan ':'Sobran ')+fmt(Math.abs(d)),'bad')}${r.obs?`<div class="hint">${esc(r.obs)}</div>`:''}</td><td><button class="btn ghost sm danger" data-act="caja-arq-del" data-v="${r.id}">Borrar</button></td></tr>`;}).join('')}</tbody></table></div>`:'<p class="hint">Aún no hay arqueos.</p>'}</div></div>`;
}
/* ---- Diálogos de caja chica ---- */
const cajaSel=(sel,name='cajaId')=>`<select class="input" name="${name}">${cajas().filter(c=>c.activa!==false||c.id===sel).map(c=>`<option value="${c.id}" ${c.id===sel?'selected':''}>${esc(c.nombre)}${c.custodio?' · '+esc(c.custodio):''}</option>`).join('')}</select>`;
function dlgCajaCfg(id){const c=id?cajaById(id):null,quienes=[...new Set([...socioNames(),...state.gastos.map(g=>g.quien).filter(Boolean)])];
  dlg(`<h2>${c?'Editar caja':'Nueva caja chica'}</h2><p class="hint" style="margin-bottom:14px">Una caja por persona que maneja efectivo de la empresa. Sus gastos del Forms (“Caja chica”) se asignan solos a su caja.</p><form data-form="cajacfg">${c?`<input type="hidden" name="id" value="${c.id}">`:''}<div class="fg">
   <div class="field"><label>Nombre de la caja</label><input class="input" name="nombre" value="${esc(c?.nombre||'')}" placeholder="Caja de operaciones" required></div>
   <div class="field"><label>Responsable</label><input class="input" name="custodio" list="dlQuien" value="${esc(c?.custodio||'')}" placeholder="Nombre tal como aparece en el Forms"><datalist id="dlQuien">${quienes.map(q=>`<option value="${esc(q)}">`).join('')}</datalist></div>
   <div class="field"><label>Fondo fijo (S/)</label><input class="input mono" type="number" step="0.01" min="0" name="fondo" value="${c?.fondo||''}" placeholder="300.00"></div>
   <div class="field"><label>Límite por gasto (S/)</label><input class="input mono" type="number" step="0.01" min="0" name="limite" value="${c?.limite||''}" placeholder="100.00 (opcional)"></div>
   ${c?`<div class="field full"><label class="row small" style="gap:6px"><input type="checkbox" name="activa" value="1" ${c.activa!==false?'checked':''} style="width:18px;height:18px"> Caja activa (desmarca para cerrarla)</label></div>`:''}
  </div><div class="row" style="margin-top:20px;justify-content:space-between"><div>${c&&!cajaMovs(c.id).length&&!state.caja.some(x=>x.cajaId===c.id)?`<button class="btn ghost sm danger" type="button" data-act="caja-borrar" data-v="${c.id}">Eliminar caja</button>`:''}</div><div class="row"><button class="btn" type="button" data-act="close">Cancelar</button><button class="btn primary" type="submit">${c?'Guardar':'Crear caja'}</button></div></div></form>`);}
function dlgArqueo(id){const c=cajaById(id);if(!c)return;const hoy=hoyISO(),t=saldoCajaAl(id,hoy);
  dlg(`<h2>Arqueo · ${esc(c.nombre)}</h2><p class="hint" style="margin-bottom:14px">Cuenta el efectivo que hay en la caja y anótalo. La app lo compara con lo que dicen los registros a esa fecha.</p><form data-form="arqueo"><input type="hidden" name="cajaId" value="${id}"><div class="fg">
   <div class="field"><label>Fecha del conteo</label><input class="input" type="date" name="fecha" value="${hoy}" required></div>
   <div class="field"><label>Debería haber (según registros)</label><div class="num" style="min-height:40px;display:flex;align-items:center;font-weight:700">${fmt(t)}</div></div>
   <div class="field"><label>Efectivo contado (S/)</label><input class="input mono" type="number" step="0.01" name="contado" required></div>
   <div class="field"><label>Observación</label><input class="input" name="obs" placeholder="Ej.: falta boleta de taxi"></div></div>${btns('Guardar arqueo')}</form>`);}
let rendSel=new Set();
function dlgRendir(id,keep){const c=cajaById(id);if(!c)return;const P=cajaInfo(c).porRendir;if(!keep)rendSel=new Set(P.map(x=>x.g.id));
  const S=P.filter(x=>rendSel.has(x.g.id)),tot=r2(-S.reduce((a,x)=>a+x.v,0)),ok=r2(-S.filter(x=>compInfo(x.g).ok).reduce((a,x)=>a+x.v,0));
  dlg(`<h2>Rendir y reponer · ${esc(c.nombre)}</h2><p class="hint" style="margin:4px 0 12px">Revisa los gastos con sus comprobantes. Al rendir, quedan marcados como rendidos y puedes registrar de una vez la reposición del efectivo.</p>
  <div class="tw scroll" style="max-height:300px"><table><thead><tr><th></th><th>Fecha</th><th>Detalle</th><th>Comprobante</th><th class="n">Monto</th></tr></thead><tbody>${P.map(x=>{const ci=compInfo(x.g);return `<tr><td><input type="checkbox" data-rsel="${esc(x.g.id)}" data-caja="${id}" ${rendSel.has(x.g.id)?'checked':''} style="width:18px;height:18px"></td><td>${fdate(x.f)}</td><td>${esc(x.d)}<div class="hint">${esc(x.obs)}</div></td><td>${badge(ci.tipo,ci.ok?'neutral':'warn')}</td><td class="n">${fmt(-x.v)}</td></tr>`;}).join('')}</tbody></table></div>
  <div class="row between" style="margin:12px 0"><span class="small">Seleccionado: <b class="num">${fmt(tot)}</b> · con comprobante válido ${fmt(ok)}${tot-ok>0.004?` · <span class="t-warn">sin comprobante ${fmt(r2(tot-ok))}</span>`:''}</span></div>
  <form data-form="rendir"><input type="hidden" name="cajaId" value="${id}"><div class="fg">
   <div class="field"><label>Fecha de rendición</label><input class="input" type="date" name="fecha" value="${hoyISO()}" required></div>
   <div class="field"><label class="row small" style="gap:6px"><input type="checkbox" name="reponer" value="1" checked style="width:18px;height:18px"> Registrar la reposición ahora</label></div>
   <div class="field"><label>Monto a reponer (S/)</label><input class="input mono" type="number" step="0.01" min="0" name="monto" value="${tot}"></div>
   <div class="field"><label>¿De dónde sale el efectivo?</label><select class="input" name="origen"><option value="banco">Retiro de la cuenta de la empresa</option>${socioNames().map(n=>`<option value="socio:${esc(n)}">Efectivo de ${esc(n)} (préstamo)</option>`).join('')}<option value="otro">Otra fuente</option></select></div>
  </div>${btns('Rendir '+S.length+' gasto(s)')}</form>`,true);}
/* ---------------- Formulario de registro rápido (igual que antes) ---------------- */
const CONCEPTOS={egreso:[
 ['Movilidad y Combustible','Combustible y movilidad','operativo'],['Insumos y Químicos','Insumos y productos de limpieza','operativo'],
 ['Planilla / Operarios','Pago a personal u operarios','operativo'],['Servicios Básicos','Servicios (luz, agua, internet, celular)','operativo'],
 ['Alquiler','Alquiler','operativo'],['Marketing','Publicidad y marketing','operativo'],['Mantenimiento','Mantenimiento de vehículo o equipos','operativo'],
 ['Fletes y Logística','Fletes y logística','operativo'],['Impuestos (IGV/Renta)','Impuestos (IGV, Renta)','operativo'],['Comisiones Bancarias','Comisiones del banco','operativo'],
 ['Otros Egresos Operativos','Otro gasto de la operación','operativo'],
 ['Compra de Maquinaria','Compra de máquinas o equipos','inversion'],['Vehículos','Compra de vehículo','inversion'],['Herramientas','Herramientas','inversion'],
 ['Devolución de Préstamo a Socio','Devolución de préstamo a un socio','financiamiento'],['Amortización de Deuda','Pago de préstamo bancario','financiamiento'],
 ['Intereses','Intereses de préstamos','financiamiento'],['Retiro de Utilidades / Dividendos','Retiro de utilidades de un socio','financiamiento']],
 ingreso:[
 ['Venta al Contado','Venta o servicio a un cliente','operativo'],['Cobranza Cuentas por Cobrar (crédito)','Cobranza de una factura a crédito','operativo'],
 ['Otros Ingresos Operativos','Otro ingreso de la operación','operativo'],['Venta de Maquinaria/Equipo','Venta de máquina o equipo','inversion'],
 ['Préstamo de Socio','Préstamo de un socio','financiamiento'],['Aporte de Socios','Aporte de capital de un socio','financiamiento'],['Préstamo Bancario Recibido','Préstamo del banco','financiamiento']]};
const CATN={operativo:'Operación del negocio (FCO)',inversion:'Inversión (FCI)',financiamiento:'Financiamiento (FCF)'};
const SOCIO_CONC=['Préstamo de Socio','Aporte de Socios','Devolución de Préstamo a Socio','Retiro de Utilidades / Dividendos'];
const catDe=(tipo,v)=>(CONCEPTOS[tipo].find(c=>c[0]===v)||[,,'operativo'])[2];
let tipoSel='egreso';
function setTipo(t){tipoSel=t;if($('#movTitle'))setTimeout(movTitle,0);FZR.querySelectorAll('.seg button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.tipo===t));
  const groups={};CONCEPTOS[t].forEach(c=>(groups[c[2]]=groups[c[2]]||[]).push(c));
  $('#fConcepto').innerHTML=Object.entries(groups).map(([k,cs])=>`<optgroup label="${esc(CATN[k])}">${cs.map(c=>`<option value="${esc(c[0])}">${esc(c[1])}</option>`).join('')}</optgroup>`).join('');
  $('#lConcepto').textContent=t==='egreso'?'¿En qué se gastó?':'¿De dónde viene el dinero?';
  $('#lCuenta').textContent=t==='egreso'?'¿Con qué se pagó?':'¿A dónde entró el dinero?';
  renderCuentas();formUI();}
function renderCuentas(){const cur=$('#fCuenta').value;
  const base=state.config.cuentas.map(c=>`<option value="${esc(c)}">${esc(c)}${esBanco(c)?' · cuenta de la empresa':''}</option>`).join('');
  const soc=tipoSel==='egreso'?socioNames().map(n=>`<option value="socio:${esc(n)}">Lo pagó ${esc(n)} con su dinero (préstamo)</option>`).join(''):'';
  $('#fCuenta').innerHTML=base+soc; if([...$('#fCuenta').options].some(o=>o.value===cur))$('#fCuenta').value=cur;
  $('#fSocio').innerHTML=socioNames().map(n=>`<option>${esc(n)}</option>`).join('');}
function formUI(){
  const v=$('#fConcepto').value,cat=catDe(tipoSel,v),venta=tipoSel==='ingreso'&&cat!=='financiamiento';
  $('#hCat').textContent='Va al flujo como: '+CATN[cat];
  $('#wSocio').hidden=!SOCIO_CONC.includes(v);
  const sinComp=cat==='financiamiento'||v==='Comisiones Bancarias';
  $('#wComp').hidden=sinComp;
  const opts=tipoSel==='egreso'?['Factura','Boleta','Recibo por honorarios','Ticket o comprobante de taxi','Sin comprobante']:['Factura','Boleta','Sin comprobante'];
  const cur=$('#fComp').value; $('#fComp').innerHTML=opts.map(o=>`<option>${o}</option>`).join(''); if(opts.includes(cur))$('#fComp').value=cur;
  $('#lComp').textContent=venta?'Comprobante emitido':'Comprobante del proveedor';
  $('#lRuc').textContent=venta?'RUC o DNI cliente':'RUC proveedor'; $('#lRs').textContent=venta?'Cliente':'Razón social';
  const c=$('#fComp').value; $('#wCompDat').hidden=!['Factura','Boleta','Recibo por honorarios'].includes(c);
  $('#fRuc').maxLength=venta?11:11;
}
FZR.querySelectorAll('.seg button').forEach(b=>b.addEventListener('click',()=>setTipo(b.dataset.tipo)));
['fConcepto','fComp'].forEach(id=>$('#'+id).addEventListener('change',formUI));
$('#fFecha').value=new Date().toISOString().slice(0,10);
function exitEdit(){$('#editId').value='';$('#btnDel').hidden=true;$('#btnSave').textContent='Guardar';$('#btnOtro').hidden=false;}
function movTitle(){$('#movTitle').textContent=($('#editId').value?'Editar ':'Nuevo ')+(tipoSel==='egreso'?'egreso':'ingreso');}
function openMov(tipo){exitEdit();['fDesc','fMonto','fRuc','fRs','fSerie','fNum'].forEach(k=>$('#'+k).value='');$('#fFecha').value=new Date().toISOString().slice(0,10);setTipo(tipo);movTitle();$('#dlgMov').showModal();setTimeout(()=>$('#fConcepto').focus(),30);}
function leerForm(){
  const monto=parseFloat($('#fMonto').value); if(!monto||monto<=0)return {err:'Ingresa un monto válido.'};
  const v=$('#fConcepto').value,cat=catDe(tipoSel,v),cta=$('#fCuenta').value;
  const d={fecha:$('#fFecha').value,tipo:tipoSel,categoria:cat,subcategoria:v,descripcion:$('#fDesc').value.trim(),monto:r2(monto),cuenta:cta,comp:'',ruc:'',rs:'',serie:'',num:'',socio:'',pagadoPor:''};
  if(cta.startsWith('socio:')){d.pagadoPor=cta.slice(6);d.cuenta='Pagó '+d.pagadoPor.split(' ')[0];}
  if(!$('#wSocio').hidden)d.socio=$('#fSocio').value;
  if(!$('#wComp').hidden){d.comp=$('#fComp').value;
    if(!$('#wCompDat').hidden){d.ruc=$('#fRuc').value.replace(/\D/g,'');d.rs=$('#fRs').value.trim();d.serie=$('#fSerie').value.trim().toUpperCase();d.num=$('#fNum').value.trim();
      if(d.comp==='Factura'&&d.ruc.length!==11)return {err:'El RUC de una factura tiene 11 dígitos.'};
      if(!d.serie||!d.num)return {err:'Completa la serie y el número del comprobante.'};}}
  if(!d.fecha)return {err:'Pon la fecha.'};
  return {d};
}
function posiblesDup(d,selfId){
  const out=[],ck=compKey(d);
  GA().forEach(g=>{if(ck&&compKey(g)===ck)out.push(`${fdate(g.fecha)} · ${g.desc} · ${fmt(g.monto)} (Forms, mismo comprobante)`);
    else if(d.tipo==='egreso'&&Math.abs(g.monto-d.monto)<0.005&&Math.abs(dayN(g.fecha)-dayN(d.fecha))<=1)out.push(`${fdate(g.fecha)} · ${g.desc} · ${fmt(g.monto)} (Forms, ${g.quien})`);});
  state.movimientos.forEach(m=>{if(m.id===selfId)return;if(ck&&compKey(m)===ck)out.push(`${fdate(m.fecha)} · ${m.descripcion||m.subcategoria} · ${fmt(m.monto)} (registro rápido, mismo comprobante)`);
    else if(m.tipo===d.tipo&&Math.abs(m.monto-d.monto)<0.005&&Math.abs(dayN(m.fecha)-dayN(d.fecha))<=1)out.push(`${fdate(m.fecha)} · ${m.descripcion||m.subcategoria} · ${fmt(m.monto)} (registro rápido)`);});
  return out;
}
$('#formMov').addEventListener('submit',async e=>{e.preventDefault();const r=leerForm();if(r.err){toast(r.err,true);return;}const d=r.d,id=$('#editId').value;
  const dups=posiblesDup(d,id);
  if(dups.length&&!await ask(`Esto parece estar registrado ya:\n• ${dups.slice(0,3).join('\n• ')}${dups.length>3?`\n• y ${dups.length-3} más`:''}\n\n¿Guardar de todas formas?`,'Guardar igual'))return;
  const otro=!id&&e.submitter&&e.submitter.dataset.otro;
  if(id){const i=state.movimientos.findIndex(m=>m.id===id);if(i>-1)state.movimientos[i]={id,...d};toast('Movimiento actualizado');exitEdit();} else {state.movimientos.push({id:uid('m_'),...d});toast('Movimiento guardado');}
  save();render();['fDesc','fMonto','fRuc','fRs','fSerie','fNum'].forEach(k=>$('#'+k).value='');
  if(otro)$('#fMonto').focus();else $('#dlgMov').close();});
$('#formMov').addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();$('#formMov').requestSubmit();}});
$('#btnCancel').addEventListener('click',()=>{exitEdit();$('#dlgMov').close();});
$('#btnDel').addEventListener('click',async()=>{const id=$('#btnDel').dataset.v;const m=state.movimientos.find(x=>x.id===id);if(!m)return;
  if(!await ask(`¿Eliminar este ${m.tipo==='ingreso'?'ingreso':'egreso'} de ${fmt(m.monto)} (${fdate(m.fecha)})? No se puede deshacer.`,'Eliminar'))return;
  state.movimientos=state.movimientos.filter(x=>x.id!==id);state.links=state.links.filter(l=>l.g!==id);exitEdit();$('#dlgMov').close();save();render();toast('Movimiento eliminado');});
function editar(id){const m=state.movimientos.find(x=>x.id===id);if(!m)return;openMov(m.tipo);$('#btnDel').hidden=false;$('#btnDel').dataset.v=id;$('#fFecha').value=m.fecha;
  if(![...$('#fConcepto').options].some(o=>o.value===m.subcategoria))$('#fConcepto').insertAdjacentHTML('beforeend',`<option value="${esc(m.subcategoria)}">${esc(m.subcategoria)}</option>`);
  $('#fConcepto').value=m.subcategoria;
  const cta=m.pagadoPor?'socio:'+m.pagadoPor:m.cuenta;if(![...$('#fCuenta').options].some(o=>o.value===cta))$('#fCuenta').insertAdjacentHTML('beforeend',`<option value="${esc(cta)}">${esc(m.cuenta)}</option>`);$('#fCuenta').value=cta;
  formUI(); if(m.socio)$('#fSocio').value=m.socio; if(m.comp){$('#fComp').value=m.comp;formUI();}
  $('#fRuc').value=m.ruc||'';$('#fRs').value=m.rs||'';$('#fSerie').value=m.serie||'';$('#fNum').value=m.num||'';
  $('#fDesc').value=m.descripcion||'';$('#fMonto').value=m.monto;$('#editId').value=id;$('#btnSave').textContent='Guardar cambios';$('#btnOtro').hidden=true;movTitle();}

/* ---------------- Diálogos ---------------- */
const dlg=(h,w)=>{const d=$('#dlg');const was=d.open;d.className=w?'wide':'';paint(d,h,'dlg',was);if(!was)d.showModal();}, closeDlg=()=>{$('#dlg').close();if(FZW.__pendBack&&FZW.__pendKind){FZW.__pendBack=false;setTimeout(()=>dlgPend(FZW.__pendKind),0);}};
const btns=(ok)=>`<div class="row" style="margin-top:20px;justify-content:flex-end"><button class="btn" type="button" data-act="close">Cancelar</button><button class="btn primary" type="submit">${ok}</button></div>`;
function dlgConfig(){ dlg(`<h2>Configuración</h2><p class="hint" style="margin-bottom:16px">Datos que usa el flujo de caja y el cruce con el banco.</p><form data-form="cfg"><div class="fg">
 <div class="field"><label>Saldo inicial del banco</label><input class="input mono" type="number" step="0.01" name="sb" value="${state.config.saldoInicialBanco}"><span class="hint">Antes del primer movimiento del estado de cuenta</span></div>
 <div class="field"><label>Saldo inicial otras cuentas</label><input class="input mono" type="number" step="0.01" name="so" value="${state.config.saldoInicial}"><span class="hint">Caja y cuentas de registro manual</span></div>
 <div class="field full"><label>Caja mínima de seguridad (S/)</label><input class="input mono" type="number" step="0.01" name="um" value="${state.config.umbralMinimo}"></div>
 <div class="field full"><label>Cuentas del registro rápido (separadas por coma)</label><input class="input" name="cu" value="${esc(state.config.cuentas.join(', '))}"></div>
 <div class="field full"><label>Socios (separados por coma)</label><input class="input" name="so2" value="${esc(socioNames().join(', '))}"></div></div>
 <div class="row" style="margin-top:20px"><button class="btn" type="button" data-act="export-json">Descargar respaldo (JSON)</button><button class="btn" type="button" data-act="imp-json">Restaurar respaldo</button><button class="btn danger" type="button" data-act="reset">Borrar todos los datos</button></div>
 <p class="hint">Los datos se guardan solo en este navegador. Descarga un respaldo cada semana.</p>${btns('Guardar')}</form>`); }
function dlgCaja(ap,cid){ asegurarCajas(); dlg(`<h2>${ap?'Abrir caja chica':'Entregar efectivo a una caja'}</h2><p class="hint" style="margin-bottom:16px">${ap?'Registra el fondo con el que empieza la caja. Si sale de la cuenta de la empresa, cuando subas el estado de cuenta marca ese retiro como “Retiro para caja chica”.':'Para reponer el fondo o registrar efectivo que entra a la caja.'}</p><form data-form="caja">${ap?'<input type="hidden" name="apertura" value="1">':''}<div class="fg">
 <div class="field full"><label>Caja</label>${cajaSel(cid||selCaja||(cajas()[0]||{}).id)}</div>
 <div class="field"><label>Fecha</label><input class="input" type="date" name="fecha" value="${new Date().toISOString().slice(0,10)}" required></div>
 <div class="field"><label>Monto (S/)</label><input class="input mono" type="number" step="0.01" min="0.01" name="monto" required></div>
 <div class="field full"><label>¿De dónde sale el efectivo?</label><select class="input" name="origen"><option value="banco">Retiro de la cuenta de la empresa</option>${socioNames().map(n=>`<option value="socio:${esc(n)}">Efectivo de ${esc(n)} · queda como préstamo a la empresa</option>`).join('')}<option value="otro">Otra fuente</option></select></div>
 <div class="field full"><label>Observación</label><input class="input" name="obs" placeholder="${ap?'Apertura de caja chica':'Reposición de octubre'}"></div></div>${btns(ap?'Abrir caja chica':'Guardar')}</form>`); }
function dlgBancoManual(id,pre){ const b=id?bById(id):null; const v=(k,d='')=>b?(b[k]??d):(pre&&pre[k]!==undefined?pre[k]:d);
 const ref=b||(pre&&pre.antesDe?bById(pre.antesDe):null),mes=ref?mesDe(ref.fecha):(state.banco.length?mesDe(state.banco[state.banco.length-1].fecha):'');
 const cerca=state.banco.filter(x=>x!==b&&(!mes||Math.abs(dayN(x.fecha)-dayN((ref||x).fecha))<=20));
 const preAfter=pre&&pre.antesDe?(()=>{const i=state.banco.findIndex(x=>x.id===pre.antesDe);return i>0?state.banco[i-1].id:'__first';})():'';
 dlg(`<h2>${b?'Editar línea del banco':'Agregar línea del banco'}</h2><p class="hint" style="margin-bottom:16px">Copia los datos tal como aparecen en el estado de cuenta, incluido el <b>saldo</b>: con él la app ubica la línea en el lugar exacto.</p><form data-form="banco">${b?`<input type="hidden" name="id" value="${b.id}">`:''}<div class="fg">
 <div class="field"><label>Fecha</label><input class="input" type="date" name="fecha" value="${esc(v('fecha'))}" required></div><div class="field"><label>N° de operación</label><input class="input mono" name="op" value="${esc(v('op'))}"></div>
 <div class="field full"><label>Descripción</label><input class="input" name="desc" value="${esc(v('desc'))}" required></div>
 <div class="field"><label>Cargo (sale)</label><input class="input mono" type="number" step="0.01" min="0" name="cargo" value="${v('cargo')||''}"></div><div class="field"><label>Abono (entra)</label><input class="input mono" type="number" step="0.01" min="0" name="abono" value="${v('abono')||''}"></div>
 <div class="field full"><label>Saldo según el estado de cuenta</label><input class="input mono" type="number" step="0.01" name="saldo" value="${v('saldo')===null||v('saldo')===''?'':v('saldo')}"></div>
 <div class="field full"><label>Ubicación en el estado de cuenta</label><select class="input" name="pos">
  <option value="">${b?'No mover':'Automática (por saldo; si no hay saldo, por fecha)'}</option><option value="__first" ${preAfter==='__first'?'selected':''}>Al inicio de todo</option>
  ${cerca.map(x=>`<option value="${x.id}" ${preAfter===x.id?'selected':''}>Después de: ${fdate(x.fecha)} · ${esc(x.desc.slice(0,28))} · ${x.cargo?'−':'+'}${fmt(bAmt(x))}${x.saldo!=null&&x.saldo!==''?' · saldo '+fmt(x.saldo):''}</option>`).join('')}</select>
  <span class="hint">Tip: el saldo de esta línea debe ser el saldo de la línea anterior ${'−'} cargo + abono.</span></div></div>${btns('Guardar')}</form>`); }
// Ubica una línea: después de 'pos' (id), al inicio ('__first') o automáticamente (saldo encadenado o fecha).
function ubicarBanco(nb,pos){
  const i0=state.banco.indexOf(nb);if(i0>=0)state.banco.splice(i0,1);
  let i;
  if(pos==='__first')i=0;
  else if(pos){i=state.banco.findIndex(x=>x.id===pos)+1;if(i<=0)i=state.banco.length;}
  else{i=-1;
    if(nb.saldo!=null){let run=+state.config.saldoInicialBanco||0;const sal=b=>(b.saldo!=null&&b.saldo!=='')?+b.saldo:null;
      for(let j=0;j<=state.banco.length;j++){const prevS=j===0?run:(sal(state.banco[j-1])??null);if(prevS!=null&&Math.abs(r2(prevS+nb.abono-nb.cargo)-nb.saldo)<0.005&&(j===state.banco.length||Math.abs(dayN(state.banco[Math.min(j,state.banco.length-1)].fecha)-dayN(nb.fecha))<=20)){i=j;break;}}}
    if(i<0){i=state.banco.findIndex(x=>x.fecha>nb.fecha);if(i<0)i=state.banco.length;}}
  const p=state.banco[i-1],q=state.banco[i];nb.ord=p&&q?(p.ord+q.ord)/2:p?p.ord+1:q?q.ord-1:0;state.banco.splice(i,0,nb);}
function moverBanco(id,dir){const i=state.banco.findIndex(x=>x.id===id),j=i+dir;if(i<0||j<0||j>=state.banco.length)return;const a=state.banco[i],b=state.banco[j];[a.ord,b.ord]=[b.ord,a.ord];state.banco[i]=b;state.banco[j]=a;}
function dlgImpBanco(){ dlg(`<h2>Subir estado de cuenta</h2>
 <p class="hint" style="margin:4px 0 12px">Sube el pantallazo de la tabla “ACTIVIDADES” del estado de cuenta. Si son 2 páginas, sube los 2 pantallazos en orden. La app lee la imagen y te muestra una tabla para revisar antes de importar.</p>
 <div id="drop" class="drop" tabindex="0" role="button" data-act="pick-img" aria-label="Elegir pantallazo">
   <svg width="28" height="28" aria-hidden="true"><use href="#i-upload"/></svg>
   <div><b>Arrastra aquí el pantallazo</b>, pégalo con <b>Ctrl + V</b> o haz clic para elegirlo</div>
   <div class="hint">PNG o JPG · Recorta desde la primera fecha hasta el último saldo para mejores resultados</div>
 </div>
 <div class="row" style="margin-top:12px"><label class="lb" for="bcpAnio" style="margin:0">Año del estado de cuenta</label><input class="input mono" id="bcpAnio" type="number" style="width:100px" value="${new Date().getFullYear()}"><span class="hint">Se detecta solo si el pantallazo incluye el período.</span></div>
 <div id="ocrStatus" class="hint" style="margin-top:12px" aria-live="polite"></div>
 <details style="margin-top:16px"><summary class="hint" style="cursor:pointer">Otras formas: pegar texto o subir Excel/CSV</summary>
  <textarea class="input" id="bcpText" rows="5" style="margin-top:8px" placeholder="17-07 ELBEKA POS 111-014 375106 09:45 TBRA30 4302 20.00- 214.86"></textarea>
  <div class="row" style="margin-top:8px"><button class="btn" data-act="parse-bcp">Leer texto</button><button class="btn" data-act="pick-banco">Elegir Excel o CSV…</button></div>
 </details>
 <div class="row" style="margin-top:20px;justify-content:flex-end"><button class="btn" data-act="close">Cerrar</button></div>`,true); }

/* ---------------- Lectura de pantallazos (OCR en el navegador) ---------------- */
const TESS='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/';
const TESS_LOCAL=(()=>{try{return new URL('tess/',location.href).href;}catch(e){return '';}})();
let ocrWorker=null, imgURLs=[];
function loadScript(src){return new Promise((ok,ko)=>{if(window.Tesseract)return ok();const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>ko(new Error('sin conexión'));document.head.appendChild(s);});}
const ocrMsg=h=>{const e=$('#ocrStatus');if(e)e.innerHTML=h;};
async function getWorker(){
  if(ocrWorker) return ocrWorker;
  await loadScript(TESS+'tesseract.min.js');
  ocrWorker=await Tesseract.createWorker('eng',1,{workerPath:TESS_LOCAL+'worker.min.js',workerBlobURL:false,corePath:TESS_LOCAL+'core',langPath:TESS_LOCAL+'lang',cacheMethod:'none',
    logger:m=>{if(m.status==='recognizing text')ocrMsg(`Leyendo el pantallazo… ${Math.round(m.progress*100)}%`);else if(/load/.test(m.status))ocrMsg('Preparando el lector (solo la primera vez tarda un poco)…');}});
  await ocrWorker.setParameters({tessedit_pageseg_mode:'6',preserve_interword_spaces:'1'});
  return ocrWorker;
}
function imgToCanvas(img,scale,th){
  const c=document.createElement('canvas');c.width=Math.round(img.naturalWidth*scale);c.height=Math.round(img.naturalHeight*scale);
  const x=c.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(img,0,0,c.width,c.height);
  const d=x.getImageData(0,0,c.width,c.height),p=d.data;
  for(let i=0;i<p.length;i+=4){let g=0.299*p[i]+0.587*p[i+1]+0.114*p[i+2];if(th)g=g>th?255:0;p[i]=p[i+1]=p[i+2]=g;}
  x.putImageData(d,0,0);return c;
}
const loadImg=blob=>new Promise((ok,ko)=>{const u=URL.createObjectURL(blob);const i=new Image();i.onload=()=>ok({img:i,url:u});i.onerror=ko;i.src=u;});
function amt(s){if(s==null)return null;s=String(s).replace(/\s/g,'');if(/,\d{2}$/.test(s)&&!/\.\d{2}$/.test(s))s=s.replace(/,(\d{2})$/,'.$1');s=s.replace(/,/g,'');const n=parseFloat(s);return isNaN(n)?null:n;}
function parseOCR(text,anio){
  const rows=[];let year=anio,mon=null;const hm=text.match(/(\d{2})\/(\d{2})\/(20\d{2})/);if(hm){year=hm[3];mon=hm[2];}
  text.split(/\r?\n/).forEach(raw=>{
    let l=raw.replace(/[|\[\]¥{}]/g,' ').replace(/~/g,'-').replace(/(\d)\s*([.,])\s+(\d{2})\b/g,'$1$2$3').replace(/(^|\s)([.,])\s+(\d{2})\b/g,'$1$2$3').replace(/\s+/g,' ').trim();
    const m=l.match(/^\W?(\d{2})\s?-\s?(\d{2})\s+(?:\d{2}\s?-\s?\d{2}\s+)?(.*)$/);if(!m)return;
    let rest=m[3],mov=null,sal=null,neg=true;
    const tk=[...rest.matchAll(/(\d[\d,]*[.,]\d{2}|[.,]\d{2})\s*(-?)(?=\s|$)/g)];
    if(tk.length){const L=tk[tk.length-1],end=rest.slice(L.index+L[0].length).trim()==='';
      if(end){sal=amt(L[1])*(L[2]==='-'?-1:1);if(tk.length>1){const M=tk[tk.length-2];mov=amt(M[1]);neg=M[2]==='-';rest=rest.slice(0,M.index);}else rest=rest.slice(0,L.index);}
      else {mov=amt(L[1]);neg=L[2]==='-';rest=rest.slice(0,L.index);}}
    const opm=rest.match(/\b\d{3}-\d{3}\s+(\d{6,7})\b/);
    let desc=rest.split(/\s\d{3}-\d{3}\b/)[0].split(/\s-\s/)[0].replace(/\s+(INT|VEN|POS|BPI|BPT|CAJ|TLC)\b.*$/i,'').trim();
    const mm=(mon&&m[2]!==mon&&+m[2]>12)?mon:m[2];
    rows.push({fecha:`${year}-${mm}-${m[1]}`,desc,op:opm?opm[1].slice(0,6):'',mov,neg,saldo:sal});
  });
  return {rows,year};
}
function chain(rows,prev){
  // decide cargo/abono and fill gaps with the running balance
  return rows.map(r=>{let cargo=0,abono=0,flag='';
    if(r.mov!=null&&r.saldo!=null&&prev!=null){
      if(Math.abs(r2(prev-r.mov)-r.saldo)<0.005)cargo=r.mov; else if(Math.abs(r2(prev+r.mov)-r.saldo)<0.005)abono=r.mov;
      else {flag='revisar'; if(r.neg)cargo=r.mov; else abono=r.mov;}
    } else if(r.mov==null&&r.saldo!=null&&prev!=null){const d=r2(prev-r.saldo);if(d>=0)cargo=d;else abono=-d;flag='corregido';}
    else if(r.mov!=null){if(r.neg)cargo=r.mov;else abono=r.mov;if(prev!=null&&r.saldo==null){r={...r,saldo:r2(prev-cargo+abono)};flag='corregido';}}
    else flag='revisar';
    if(r.saldo!=null)prev=r.saldo;else if(prev!=null)prev=r2(prev-cargo+abono);
    return {fecha:r.fecha,desc:r.desc,op:r.op,cargo:r2(cargo),abono:r2(abono),saldo:r.saldo,flag};});
}
async function ocrImages(files){
  files=[...files].filter(f=>f&&/^image\//.test(f.type));if(!files.length){toast('Sube una imagen PNG o JPG',true);return;}
  try{
    const w=await getWorker();let all=[],anio=$('#bcpAnio')?.value||new Date().getFullYear();imgURLs=[];
    for(let i=0;i<files.length;i++){
      ocrMsg(`Leyendo pantallazo ${i+1} de ${files.length}…`);
      const {img,url}=await loadImg(files[i]);imgURLs.push(url);
      const sc=Math.min(4,Math.max(1,1760/img.naturalWidth));
      const r1=await w.recognize(imgToCanvas(img,sc,0));let p=parseOCR(r1.data.text,anio);anio=p.year;
      let prev=all.length?all[all.length-1].saldo:(state.banco.length?state.banco[state.banco.length-1].saldo:null);
      let c=chain(p.rows,prev);
      if(c.some(x=>x.flag==='revisar')||!c.length){
        ocrMsg(`Revisando de nuevo las filas dudosas del pantallazo ${i+1}…`);
        const r2_=await w.recognize(imgToCanvas(img,sc*1.5,210));const p2=parseOCR(r2_.data.text,anio);
        if(p2.rows.length>p.rows.length&&!p.rows.length)p=p2;
        else p.rows=p.rows.map((row,k)=>{const alt=(row.op&&p2.rows.find(x=>x.op===row.op))||(p2.rows[k]&&p2.rows[k].fecha===row.fecha?p2.rows[k]:null);if(!alt)return row;
          const pv=k===0?prev:null;const test=chain([row],pv!=null?pv:(k?c[k-1].saldo:null))[0],testAlt=chain([alt],pv!=null?pv:(k?c[k-1].saldo:null))[0];
          return test.flag==='revisar'&&testAlt.flag!=='revisar'?alt:row;});
        c=chain(p.rows,prev);
      }
      all=all.concat(c);
    }
    ocrMsg('');
    if(!all.length){toast('No encontré movimientos en la imagen. Prueba recortando solo la tabla.',true);return;}
    preview(all,files.length>1?files.length+' pantallazos':'el pantallazo');
  }catch(e){ocrMsg(`<span class="t-bad">No se pudo leer la imagen (${esc(e.message||e)}). Revisa tu conexión a internet e inténtalo de nuevo.</span>`);}
}

/* ---------------- Importación ---------------- */
function toISO(v){ if(v==null||v==='')return ''; if(typeof v==='number')return new Date(Math.round((v-25569)*86400000)).toISOString().slice(0,10);
  const s=String(v).trim();let m; if(m=s.match(/^(\d{4})-(\d{2})-(\d{2})/))return `${m[1]}-${m[2]}-${m[3]}`; if(m=s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/))return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`; return ''; }
const num=v=>{if(typeof v==='number')return v;const n=parseFloat(String(v||'').replace(/[^\d.,-]/g,'').replace(/,(?=\d{3}\b)/g,'').replace(',','.'));return isNaN(n)?0:n;};
function medioForms(p,q){p=norm(p);if(p.includes('tarjeta'))return EMP;if(p.includes('prestamo'))return 'Socio: '+(q||'?');if(p.includes('caja'))return CAJA;if(p.includes('fiscal'))return CF;return 'Revisar';}
function readFile(file,cb){ if(typeof XLSX==='undefined'){toast('No cargó el lector de Excel. Revisa tu conexión a internet.',true);return;}
  const r=new FileReader();r.onload=e=>{try{const wb=XLSX.read(e.target.result,{type:'array'});cb(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,raw:true,defval:''}));}catch(err){toast('No se pudo leer el archivo: '+err.message,true)}};r.readAsArrayBuffer(file); }
const compKey=g=>{const r=String(g.ruc||'').replace(/\D/g,''),s=String(g.serie||'').trim().toUpperCase(),n=String(g.num||'').replace(/\D/g,'').replace(/^0+/,'');return r&&s&&n?r+'|'+s+'|'+n:'';};
function tsOf(v){ if(v==null||v===''||(typeof v==='number'&&!isFinite(v)))return ''; if(typeof v==='number')return new Date(Math.round((v-25569)*86400)*1000).toISOString().slice(0,19);
  const m=String(v).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/); if(m)return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}T${m[4].padStart(2,'0')}:${m[5]}:${(m[6]||'00')}`; return String(v).trim(); }
let planForms=null;
function importForms(rows){
  const hdr=rows[0]||[],f=re=>hdr.findIndex(h=>re.test(norm(h)));
  const C={ts:f(/marca temporal|timestamp/),quien:f(/persona que realiza/),pago:f(/como fue el pago/),tipo:f(/tipo de gasto/),fecha:f(/fecha de emision/),comp:f(/tipo de comprobante/),ruc:f(/numero de ruc/),rs:f(/razon social/),serie:f(/serie/),num:f(/numero de factura/),monto:f(/monto total/),op:f(/conciliacion/),desc:f(/descripcion/),fotoC:f(/foto.*comprobante/),fotoP:f(/foto.*(pago|abono)/)};
  if(C.fecha<0||C.monto<0){toast('No encuentro las columnas “Fecha de Emisión o Pago” y “Monto Total”. ¿Es la hoja de respuestas del Forms?',true);return;}
  const seen={},plan={nuevos:[],act:[],dups:[]},usados=new Set();
  rows.slice(1).forEach(r=>{const fecha=toISO(r[C.fecha]),monto=r2(num(r[C.monto]));if(!fecha||!monto)return;
    const g=k=>C[k]<0?'':String(r[C[k]]??'').trim(),q=g('quien'),desc=g('desc'),ts=C.ts<0?'':tsOf(r[C.ts]);
    const key=`${fecha}|${q}|${monto.toFixed(2)}|${desc.toLowerCase()}`,n=seen[key]||0;seen[key]=n+1;const id=key+'#'+n;
    const op=C.op<0||r[C.op]===''?'':String(r[C.op]).replace(/\.0$/,'');
    const base={quien:q,pago:g('pago'),tipo:g('tipo'),fecha,comp:g('comp'),ruc:g('ruc').replace(/\.0$/,''),rs:g('rs'),serie:g('serie'),num:g('num').replace(/\.0$/,''),monto,desc,fotoComp:g('fotoC'),fotoPago:g('fotoP')};
    // 1) la misma respuesta del Forms (misma marca temporal y persona) o 2) el mismo registro ya cargado
    const ex=state.gastos.find(x=>!usados.has(x.id)&&ts&&x.ts===ts&&x.quien===q)||state.gastos.find(x=>!usados.has(x.id)&&x.id===id);
    if(ex){usados.add(ex.id);plan.act.push({ex,base,op,ts});return;}
    const nuevo={id:ts?'T'+ts+'|'+q:id,...base,op,ts,medio:medioForms(base.pago,q)};
    const ck=compKey(nuevo),dk=x=>`${x.fecha}|${x.quien}|${(+x.monto).toFixed(2)}|${norm(x.desc)}`; const mismoComp=[...state.gastos,...plan.nuevos].find(x=>!x.ignorado&&(ck?compKey(x)===ck:dk(x)===dk(nuevo)));
    if(mismoComp){nuevo.posibleDup=true;plan.dups.push({nuevo,de:mismoComp});}
    plan.nuevos.push(nuevo);
  });
  planForms=plan;
  dlg(`<h2>Revisa antes de importar el Forms</h2>
   <div class="two" style="margin:12px 0"><div class="card"><div class="label">Nuevos</div><div class="kpi"><div class="v" style="font-size:22px">${plan.nuevos.length}</div></div></div>
   <div class="card"><div class="label">Ya estaban (no se duplican)</div><div class="kpi"><div class="v" style="font-size:22px">${plan.act.length}</div></div></div></div>
   <p class="hint">La app reconoce cada respuesta por su marca temporal y por sus datos, así que puedes subir el Excel completo del Forms cada vez: lo que ya estaba solo se actualiza.</p>
   ${plan.dups.length?`<div class="alert warn"><div><b>${plan.dups.length} registro(s) nuevos se parecen a otros que ya estaban</b> (mismo comprobante, o mismo día, persona, monto y descripción). Se importarán marcados como posible duplicado para que decidas en “Cruce con el banco → Duplicados”.<ul class="small" style="margin:8px 0 0;padding-left:18px">${plan.dups.slice(0,8).map(d=>`<li>${fdate(d.nuevo.fecha)} · ${esc(d.nuevo.rs||d.nuevo.desc)} · ${esc(d.nuevo.serie)}-${esc(d.nuevo.num)} · ${fmt(d.nuevo.monto)} (${esc(d.nuevo.quien)}) — ya registrado por ${esc(d.de.quien)}</li>`).join('')}</ul></div></div>`:''}
   <div class="row" style="margin-top:20px;justify-content:flex-end"><button class="btn" data-act="close">Cancelar</button><button class="btn primary" data-act="forms-ok">Importar ${plan.nuevos.length} nuevos</button></div>`);
}
function aplicarForms(){const p=planForms;if(!p)return;
  p.act.forEach(({ex,base,op,ts})=>{const ed=ex.editado||{},b2={...base};Object.keys(ed).forEach(k=>delete b2[k]);Object.assign(ex,b2);if(op&&!ed.op)ex.op=op;if(ts&&!ex.ts)ex.ts=ts;});
  p.nuevos.forEach(n=>state.gastos.push(n));
  [...p.act.map(a=>a.ex),...p.nuevos].forEach(g=>{if(g.quien&&!state.config.socios.includes(g.quien))state.config.socios.push(g.quien);});
  planForms=null;save();closeDlg();render();toast(`Forms: ${p.nuevos.length} nuevos${p.dups.length?`, ${p.dups.length} por revisar como duplicado`:''}.`);}

/* ---------------- Posibles duplicados ---------------- */
function dupItem(x,kind){return kind==='forms'
  ?{id:x.id,kind,fecha:x.fecha,desc:x.desc,monto:x.monto,quien:x.quien,comp:x.comp,ruc:x.ruc,rs:x.rs,serie:x.serie,num:x.num,medio:x.medio,ts:x.ts,op:x.op,fotoComp:x.fotoComp,fotoPago:x.fotoPago}
  :{id:x.id,kind,fecha:x.fecha,desc:x.descripcion||x.subcategoria,monto:x.monto,quien:'Registro rápido',comp:x.comp,ruc:x.ruc,rs:x.rs,serie:x.serie,num:x.num,medio:x.pagadoPor?'Socio: '+x.pagadoPor:x.cuenta};}
// Detección en capas, de más a menos segura (como el control de facturas duplicadas de los ERP):
// alta = mismo comprobante (RUC + serie + número); media = mismo día, persona, monto y descripción;
// baja = misma persona y monto con 1 día de diferencia, o registro rápido parecido a un gasto del Forms.
function duplicados(incluirResueltos){
  const ok=new Set(state.config.dupOk||[]),G=GA(),grupos=[],usados=new Set();
  const push=(key,tipo,conf,items)=>{const res=ok.has(key);if(res&&!incluirResueltos)return;grupos.push({key,tipo,conf,items,resuelto:res});};
  {const m={};[...G.map(g=>({k:compKey(g),it:dupItem(g,'forms')})),...state.movimientos.map(x=>({k:compKey(x),it:dupItem(x,'manual')}))].forEach(o=>{if(o.k)(m[o.k]=m[o.k]||[]).push(o.it);});
   Object.entries(m).forEach(([k,arr])=>{if(arr.length>1){arr.forEach(i=>usados.add(i.id));push('comp:'+k,'comp','alta',arr);}});}
  {const m={};G.forEach(g=>{if(compKey(g))return;const k=`${g.fecha}|${g.quien}|${g.monto.toFixed(2)}|${norm(g.desc)}`;(m[k]=m[k]||[]).push(dupItem(g,'forms'));});
   Object.entries(m).forEach(([k,arr])=>{if(arr.length>1){arr.forEach(i=>usados.add(i.id));push('igual:'+k,'igual','media',arr);}});}
  {const m={};G.filter(g=>!usados.has(g.id)).forEach(g=>{const k=g.quien+'|'+g.monto.toFixed(2);(m[k]=m[k]||[]).push(g);});
   Object.values(m).forEach(arr=>{arr.sort((a,b)=>a.fecha.localeCompare(b.fecha));let cl=[arr[0]];
     const cerrar=()=>{if(cl.length>1){const k='sim:'+fnv(cl.map(x=>x.id).sort().join('|'));push(k,'similar','baja',cl.map(x=>dupItem(x,'forms')));}};
     for(let i=1;i<arr.length;i++){if(dayN(arr[i].fecha)-dayN(cl[cl.length-1].fecha)<=1)cl.push(arr[i]);else{cerrar();cl=[arr[i]];}}cerrar();});}
  state.movimientos.forEach(m=>{if(m.tipo!=='egreso')return;const ckm=compKey(m);const par=G.filter(g=>!(ckm&&compKey(g)===ckm)).filter(g=>Math.abs(g.monto-m.monto)<0.005&&Math.abs(dayN(g.fecha)-dayN(m.fecha))<=1);
    if(par.length){const conf=par.some(g=>norm(g.desc)===norm(m.descripcion))?'media':'baja';push('manual:'+m.id,'manual',conf,[dupItem(m,'manual'),...par.map(g=>dupItem(g,'forms'))]);}});
  return grupos;
}
const dupPend=()=>duplicados().filter(g=>g.conf!=='baja');
// Cuál conviene conservar: el que tiene más sustento; si empatan, el que se registró primero.
function sugerido(gr){const sc=i=>(compKey(i)?4:0)+(i.fotoComp?2:0)+(i.ruc?1:0)+(i.op?1:0)+(i.kind==='forms'?1:0);
  return gr.items.slice().sort((a,b)=>sc(b)-sc(a)||String(a.ts||a.fecha).localeCompare(String(b.ts||b.fecha)))[0].id;}
function dupVeredicto(gr){
  const ks=gr.items.map(i=>compKey(i));
  if(ks.every(Boolean)) return new Set(ks).size===1?['Mismo comprobante: casi seguro es un duplicado','bad']:['Comprobantes distintos: probablemente no es duplicado','ok'];
  if(gr.items.some(i=>i.fotoComp)) return ['Faltan datos del comprobante en el Forms: compara las fotos','warn'];
  return ['Faltan datos del comprobante: revisa los comprobantes físicos','warn'];
}
const fechaHora=ts=>{if(!ts)return '';const m=String(ts).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);return m?`${m[3]}/${m[2]}/${m[1]} ${m[4]}:${m[5]}`:ts;};
const enlace=(u,l)=>u&&/^https:\/\//.test(u)?`<a href="${esc(u.split(',')[0].trim())}" target="_blank" rel="noopener">${l}</a>`:'';
const DUPT={comp:'Mismo comprobante (RUC, serie y número)',igual:'Mismo día, persona, monto y descripción',similar:'Misma persona y monto en días seguidos',manual:'Registro rápido parecido a un gasto del Forms'};
const CONFL={alta:['Confianza alta','bad'],media:['Confianza media','warn'],baja:['Confianza baja','neutral']};
let fD={estado:'pend',conf:'am',motivo:'',persona:'',mes:'',q:''}, selD=new Set();
function cDuplicados(){
  const all=duplicados(true);
  const cuenta=c=>all.filter(g=>!g.resuelto&&g.conf===c).length;
  const quitados=state.gastos.filter(g=>g.ignorado);
  const L=all.filter(g=>(fD.estado==='todos'||(fD.estado==='pend'?!g.resuelto:g.resuelto))
    &&(fD.conf===''||(fD.conf==='am'?g.conf!=='baja':g.conf===fD.conf))&&(!fD.motivo||g.tipo===fD.motivo)
    &&(!fD.persona||g.items.some(i=>i.quien===fD.persona))&&(!fD.mes||g.items.some(i=>mesDe(i.fecha)===fD.mes))
    &&(!fD.q||g.items.some(i=>norm([i.desc,i.rs,i.ruc,i.serie,i.num,i.quien].join(' ')).includes(norm(fD.q)))))
    .sort((a,b)=>({alta:0,media:1,baja:2}[a.conf]-{alta:0,media:1,baja:2}[b.conf])||a.items[0].fecha.localeCompare(b.items[0].fecha));
  [...selD].forEach(k=>{if(!L.some(g=>g.key===k&&!g.resuelto))selD.delete(k);});
  const pgD=pageOf('dups',L,10),pgQ=pageOf('quitados',quitados);
  const personas=[...new Set(all.flatMap(g=>g.items.map(i=>i.quien)))].sort(),meses=[...new Set(all.flatMap(g=>g.items.map(i=>mesDe(i.fecha))))].sort();
  const o=(v,l,cur)=>`<option value="${esc(v)}" ${cur===v?'selected':''}>${esc(l)}</option>`;
  const dif=(gr,f)=>new Set(gr.items.map(i=>String(i[f]||''))).size>1;
  const chip=(c,l)=>`<button class="btn sm" data-act="dfil" data-k="conf" data-v="${c}" aria-pressed="${fD.conf===c}" style="${fD.conf===c?'background:var(--primary-soft);border-color:var(--primary)':''}">${l} <b class="num">${cuenta(c)}</b></button>`;
  return `<p class="hint" style="margin:0 0 12px">Revisa por nivel de confianza: empieza por <b>alta</b> (mismo comprobante), sigue con <b>media</b> (mismos datos) y deja <b>baja</b> (montos parecidos en días seguidos) para cuando tengas tiempo. En cada grupo la app sugiere cuál conservar: el que tiene más sustento o, si empatan, el que se registró primero.</p>
  <div class="row" style="margin-bottom:10px">${chip('alta','Alta')}${chip('media','Media')}${chip('baja','Baja')}<button class="btn sm" data-act="dfil" data-k="conf" data-v="am" style="${fD.conf==='am'?'background:var(--primary-soft);border-color:var(--primary)':''}">Alta y media</button><button class="btn sm" data-act="dfil" data-k="conf" data-v="" style="${fD.conf===''?'background:var(--primary-soft);border-color:var(--primary)':''}">Todas</button></div>
  <div class="row" style="margin-bottom:12px">
   <select class="input" style="width:170px" data-dfil="estado" aria-label="Estado">${o('pend','Pendientes',fD.estado)}${o('res','Ya resueltos',fD.estado)}${o('todos','Todos',fD.estado)}</select>
   <select class="input" style="width:230px" data-dfil="motivo" aria-label="Motivo">${o('','Todos los motivos',fD.motivo)}${Object.entries(DUPT).map(([k,v])=>o(k,v,fD.motivo)).join('')}</select>
   <select class="input" style="width:170px" data-dfil="persona" aria-label="Persona">${o('','Todas las personas',fD.persona)}${personas.map(p=>o(p,p,fD.persona)).join('')}</select>
   <select class="input" style="width:150px" data-dfil="mes" aria-label="Mes">${o('','Todos los meses',fD.mes)}${meses.map(m=>o(m,MES[+m.slice(5)-1]+' '+m.slice(0,4),fD.mes)).join('')}</select>
   <input class="input" style="flex:1;min-width:160px" placeholder="Buscar RUC, serie, proveedor…" value="${esc(fD.q)}" data-dq="1" aria-label="Buscar">
  </div>
  ${gs_toolbar(pgD.rows)}
  ${gs_alert(all)}
  ${L.length?'<div data-dupstart></div>'+pgD.rows.map(gr=>{const v=dupVeredicto(gr),sug=sugerido(gr),hl=f=>dif(gr,f)?' style="background:var(--warning-soft);font-weight:600"':'';
   return `<div class="card" style="margin-bottom:12px;${gr.resuelto?'opacity:.75':''}"><div class="row between"><div class="row">${gr.resuelto?'':`<input type="checkbox" data-dsel="${esc(gr.key)}" ${selD.has(gr.key)?'checked':''} aria-label="Seleccionar grupo" style="width:18px;height:18px">`}${badge(CONFL[gr.conf][0],CONFL[gr.conf][1])} ${badge(DUPT[gr.tipo],'neutral')} ${badge(v[0],v[1])}</div>
    <div class="row">${gr.resuelto?`${badge('Marcado como no duplicado','ok')}<button class="btn sm" data-act="dup-undo" data-v="${esc(gr.key)}">Deshacer</button>`:`<button class="btn sm" data-act="dup-keep" data-v="${esc(gr.key)}">Conservar el sugerido y quitar los demás</button><button class="btn sm" data-act="dup-ok" data-v="${esc(gr.key)}">No es duplicado</button>`}</div></div>
   <div class="tw" style="margin-top:8px;max-height:none"><table><thead><tr><th>Fecha</th><th>Registró</th><th>Descripción</th><th>Comprobante</th><th>RUC · razón social</th><th>Cómo se pagó</th><th>Registrado el</th><th class="n">Monto</th><th>Fotos</th><th></th></tr></thead><tbody>
   ${gr.items.map(i=>`<tr><td>${fdate(i.fecha)}${i.id===sug&&!gr.resuelto?`<div>${badge('Conservar','ok')}</div>`:''}</td><td>${esc(i.quien)}</td><td>${esc(i.desc)}</td>
    <td${hl('serie')||hl('num')||hl('comp')}><div>${esc(i.comp||'No indicado')}</div><div class="mono small">${i.serie||i.num?esc((i.serie||'—')+'-'+(i.num||'—')):'<span class="hint">sin serie ni número</span>'}</div></td>
    <td class="small"${hl('ruc')}>${i.ruc?`<span class="mono">${esc(i.ruc)}</span>`:'<span class="hint">sin RUC</span>'}${i.rs?'<br>'+esc(i.rs):''}</td>
    <td class="small"${hl('medio')}>${esc(String(i.medio||'').replace('Socio: ','Lo pagó '))}${i.op?`<br><span class="mono">Op ${esc(i.op)}</span>`:''}</td>
    <td class="small mono"${hl('ts')}>${i.ts?esc(fechaHora(i.ts)):'<span class="hint">—</span>'}</td>
    <td class="n">${fmt(i.monto)}</td>
    <td class="small">${[enlace(i.fotoComp,'Comprobante'),enlace(i.fotoPago,'Pago')].filter(Boolean).join('<br>')||'<span class="hint">—</span>'}</td>
    <td>${gr.resuelto?'':`<button class="btn ghost sm danger" data-act="dup-quitar" data-v="${esc(i.id)}" data-k="${i.kind}">Quitar este</button>`}</td></tr>`).join('')}</tbody></table></div></div>`;}).join('')+pgD.html
  :`<div class="alert ok"><div>${badge('Nada por revisar','ok')} No hay grupos con estos filtros.</div></div>`}
  ${fD.estado!=='pend'&&quitados.length?`<h3 style="margin-top:20px">Registros quitados por duplicado (${quitados.length})</h3><div class="tw" style="margin-top:8px"><table><thead><tr><th>Fecha</th><th>Registró</th><th>Descripción</th><th class="n">Monto</th><th>Quitado el</th><th></th></tr></thead><tbody>${pgQ.rows.map(g=>`<tr><td>${fdate(g.fecha)}</td><td>${esc(g.quien)}</td><td>${esc(g.desc)}</td><td class="n">${fmt(g.monto)}</td><td class="small">${g.ignoradoEl?fdate(g.ignoradoEl):'—'}</td><td><button class="btn ghost sm" data-act="dup-restore" data-v="${esc(g.id)}">Restaurar</button></td></tr>`).join('')}</tbody></table></div>${pgQ.html}`:''}`;
}
function gs_toolbar(L){const n=selD.size,pend=L.filter(g=>!g.resuelto);
  if(!pend.length)return '';
  return `<div class="row between" style="margin-bottom:12px;padding:8px 12px;background:var(--surface-sunken);border-radius:var(--r-md)"><label class="row small" style="gap:6px"><input type="checkbox" data-dselall="1" ${n&&n===pend.length?'checked':''} style="width:18px;height:18px"> Seleccionar los ${pend.length} grupos visibles</label>
   <div class="row"><span class="small">${n} seleccionado(s)</span><button class="btn sm" data-act="dup-bulk-keep" ${n?'':'disabled'}>Conservar sugerido en seleccionados</button><button class="btn sm" data-act="dup-bulk-ok" ${n?'':'disabled'}>Marcar como no duplicado</button></div></div>`;}
function gs_alert(all){return all.length&&state.gastos.length&&!state.gastos.some(g=>g.ts)?`<div class="alert info"><div>Para ver la hora de registro y las fotos de cada comprobante, sube otra vez el Excel del Forms: se completan solos, sin duplicar nada.</div><button class="btn sm" data-act="imp-forms">Subir Excel del Forms</button></div>`:'';}
function quitarItems(ids){const hoy=new Date().toISOString().slice(0,10);ids.forEach(({id,kind})=>{if(kind==='manual')state.movimientos=state.movimientos.filter(m=>m.id!==id);else{const g=gById(id);if(g){g.ignorado=true;g.ignoradoEl=hoy;}}state.links=state.links.filter(l=>l.g!==id);});}
function conservarSugerido(gr){const s=sugerido(gr);quitarItems(gr.items.filter(i=>i.id!==s));}

function parseBCP(text,anio){
  const out=[],a='(\\d[\\d,]*\\.\\d{2}|\\.\\d{2})',tail=new RegExp(a+'(-?)\\s+'+a+'(-?)\\s*$');
  text.split(/\r?\n/).forEach(line=>{line=line.trim();const m=line.match(/^(\d{2})-(\d{2})\s+(?:(\d{2})-(\d{2})\s+)?(.*)$/);if(!m)return;let rest=m[5];const t=rest.match(tail);if(!t)return;
    const mov=parseFloat(t[1].replace(/,/g,'')),neg=t[2]==='-',sal=parseFloat(t[3].replace(/,/g,''))*(t[4]==='-'?-1:1);rest=rest.slice(0,t.index).trim();
    const opm=rest.match(/\b\d{3}-\d{3}\s+(\d{6})\b/);let desc=rest.split(/\s+\d{3}-\d{3}\b/)[0].replace(/\s+-\s+.*$/,'').replace(/[¥]/g,'').trim().replace(/\s+(INT|VEN|POS|BPI|CAJ|TLC|BPT)\s*$/,'').trim();
    out.push({fecha:`${anio}-${m[2]}-${m[1]}`,desc,op:opm?opm[1]:'',cargo:neg?mov:0,abono:neg?0:mov,saldo:sal});});
  return out;
}
function parseTabla(rows){const h=(rows[0]||[]).map(norm),f=re=>h.findIndex(x=>re.test(x));
  const C={fecha:f(/fecha/),desc:f(/descrip|concepto|detalle/),op:f(/\bop\b|operacion|n°|nro/),cargo:f(/cargo|retiro|debito/),abono:f(/abono|deposito|credito/),saldo:f(/saldo/)};
  if(C.fecha<0||(C.cargo<0&&C.abono<0))return null;
  return rows.slice(1).map(r=>({fecha:toISO(r[C.fecha]),desc:String(r[C.desc]??'').trim(),op:C.op<0?'':String(r[C.op]??'').replace(/\.0$/,''),cargo:C.cargo<0?0:Math.abs(num(r[C.cargo])),abono:C.abono<0?0:Math.abs(num(r[C.abono])),saldo:C.saldo<0||r[C.saldo]===''?null:num(r[C.saldo])})).filter(x=>x.fecha&&(x.cargo||x.abono));}
let pendB=[];
function chk(){ // recalcula el cuadre de saldos de la vista previa
  let prev=state.banco.length?state.banco[state.banco.length-1].saldo:null,bad=0;
  pendB.forEach((b,i)=>{let ok=true;const has=b.saldo!==null&&b.saldo!==''&&!isNaN(b.saldo);
    if(has&&prev!=null)ok=Math.abs(r2(prev-(+b.cargo||0)+(+b.abono||0))-b.saldo)<0.005;
    if(!b.fecha||!(+b.cargo||+b.abono))ok=false; if(!ok)bad++; if(has)prev=+b.saldo;
    const e=FZR.getElementById('pst'+i);if(e)e.innerHTML=ok?(b.flag==='corregido'?badge('Corregido por saldo','neutral'):badge('OK','ok')):badge('Revisar','bad');
    const tr=FZR.getElementById('ptr'+i);if(tr)tr.style.background=ok?'':'var(--danger-soft)';});
  const s=$('#pSum');if(s)s.innerHTML=bad?`<b class="t-bad">${bad} fila(s) por revisar</b>: compara con la imagen y corrige la celda; el estado se actualiza al escribir.`:'<b class="t-ok">Todos los saldos cuadran.</b> Puedes importar.';
  return bad;
}
function preview(list,src){
  if(!list.length){toast('No reconocí movimientos.',true);return;}
  pendB=list.map(b=>({...b}));
  const MW={fecha:136,desc:170,op:80,cargo:84,abono:84,saldo:90};
  const cell=(i,f,v,cls,type)=>`<input class="input ${cls||''}" style="height:32px;padding:0 8px;font-size:13px;min-width:${MW[f]}px" ${type?`type="${type}" step="0.01"`:''} value="${esc(v??'')}" data-pb="${i}:${f}" aria-label="${f}">`;
  const rows=pendB.map((b,i)=>`<tr id="ptr${i}"><td id="pst${i}"></td><td>${cell(i,'fecha',b.fecha,'',null).replace('class="input','type="date" class="input')}</td><td style="min-width:200px">${cell(i,'desc',b.desc)}</td><td style="width:100px">${cell(i,'op',b.op,'mono')}</td>
   <td style="width:110px">${cell(i,'cargo',b.cargo||'','mono','number')}</td><td style="width:110px">${cell(i,'abono',b.abono||'','mono','number')}</td><td style="width:120px">${cell(i,'saldo',b.saldo??'','mono','number')}</td><td><button class="btn ghost sm danger" data-act="pdel" data-v="${i}" aria-label="Quitar fila">${ic('x')}</button></td></tr>`).join('');
  const first=!state.banco.length&&pendB[0].saldo!=null?r2(pendB[0].saldo+(+pendB[0].cargo||0)-(+pendB[0].abono||0)):null;
  dlg(`<h2>Revisa antes de importar</h2><p class="hint" style="margin-bottom:8px">${pendB.length} movimientos leídos desde ${esc(src)}. La app comprueba que cada saldo sea el anterior menos el cargo (o más el abono). ${first!==null?`El saldo inicial del banco se fijará en <b class="num">${fmt(first)}</b>.`:''}</p>
  <p id="pSum" class="small" style="margin:0 0 12px"></p>
  ${imgURLs.length?`<details style="margin-bottom:12px"><summary class="hint" style="cursor:pointer">Ver el pantallazo para comparar</summary><div data-scroll="1" style="max-height:320px;overflow:auto;border:1px solid var(--line);border-radius:10px;margin-top:8px">${imgURLs.map(u=>`<img src="${u}" alt="Pantallazo del estado de cuenta" style="display:block;max-width:none">`).join('')}</div></details>`:''}
  <div class="tw scroll" style="max-height:380px"><table><thead><tr><th>Cuadre</th><th>Fecha</th><th>Descripción</th><th>N° Op.</th><th>Cargo</th><th>Abono</th><th>Saldo</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
  <div class="row" style="margin-top:20px;justify-content:space-between"><button class="btn" data-act="padd">+ Agregar fila</button><div class="row"><button class="btn" data-act="close">Cancelar</button><button class="btn primary" data-act="confirm-banco">Importar movimientos</button></div></div>`,true);
  chk();
}
FZR.addEventListener('input',e=>{const k=e.target.dataset.pb;if(!k)return;const [i,f]=k.split(':');let v=e.target.value;
  if(['cargo','abono','saldo'].includes(f))v=v===''?(f==='saldo'?null:0):+v; pendB[+i][f]=v; pendB[+i].flag=''; chk();});
async function confirmBanco(){
  const nb=chk(); if(nb&&!await ask(`Hay ${nb} fila(s) que no cuadran. ¿Importar de todas formas?`))return;
  pendB=pendB.filter(b=>b.fecha&&((+b.cargo||0)||(+b.abono||0))).map(b=>({fecha:b.fecha,desc:String(b.desc||'').trim(),op:String(b.op||'').trim(),cargo:r2(b.cargo),abono:r2(b.abono),saldo:b.saldo===''||b.saldo==null?null:r2(b.saldo)}));
  if(!pendB.length){toast('No hay filas válidas para importar',true);return;}
  if(!state.banco.length&&pendB[0].saldo!==null) state.config.saldoInicialBanco=r2(pendB[0].saldo+pendB[0].cargo-pendB[0].abono);
  // Repetida = misma fecha, operación, monto y saldo que una línea YA importada. Dos líneas iguales dentro del mismo
  // estado de cuenta (p. ej. dos transferencias de S/ 200 el mismo día) se importan las dos.
  const k=b=>`${b.fecha}|${normOp(b.op)}|${b.cargo}|${b.abono}|${b.saldo==null?'':r2(b.saldo)}`,ex={};state.banco.forEach(x=>{ex[k(x)]=(ex[k(x)]||0)+1;});
  const nuevas=[],rep=[];pendB.forEach(b=>{if(ex[k(b)]>0){ex[k(b)]--;rep.push(b);}else nuevas.push(b);});
  if(rep.length&&!await ask(`${rep.length} fila(s) ya estaban importadas y se omitirán:\n${rep.slice(0,6).map(b=>'· '+fdate(b.fecha)+' '+b.desc+' '+fmt(b.cargo||b.abono)).join('\n')}${rep.length>6?'\n…':''}\nSe importarán ${nuevas.length} línea(s) nuevas.`,'Importar'))return;
  // El bloque nuevo se ubica por fecha (antes de la primera línea existente con fecha posterior), respetando el orden del banco.
  let n=0,d=rep.length;if(nuevas.length){const f0=nuevas[0].fecha;let i=state.banco.findIndex(x=>x.fecha>f0);if(i<0)i=state.banco.length;
    const p=state.banco[i-1],q=state.banco[i],a0=p?p.ord:(q?q.ord-1:0),a1=q?q.ord:a0+nuevas.length+1,st=(a1-a0)/(nuevas.length+1);
    const NB=nuevas.map((b,j)=>{const nb={id:uid('B'),...b};nb.cls=autoCls(nb);nb.ord=a0+st*(j+1);return nb;});state.banco.splice(i,0,...NB);n=NB.length;}
  pendB=[];save();closeDlg();tab='conciliacion';subC='banco';render();toast(`Estado de cuenta: ${n} movimientos nuevos${d?`, ${d} repetidos omitidos`:''}.`);
}

/* ---------------- Reporte para contabilidad ---------------- */
function compInfo(g){if(g&&g.kind==='crm')return {tipo:g.comp,ok:!/^sin/i.test(g.comp||'')};const c=norm(g.comp),ruc=String(g.ruc||'').replace(/\D/g,''),s=String(g.serie||'').toUpperCase();
  if(c.includes('factura')||(!c&&ruc&&s.startsWith('F')))return ruc?{tipo:'Factura',ok:true}:{tipo:'Factura (falta RUC en el Forms)',ok:false};
  if(c.includes('boleta')&&!c.includes('transporte'))return {tipo:'Boleta',ok:true};
  if(c.includes('honorario'))return {tipo:'Recibo por honorarios',ok:true};
  if(c.includes('taxi')||c.includes('transporte'))return {tipo:'Comprobante de taxi / boleto',ok:false};
  if(c.includes('sin'))return {tipo:'Sin comprobante',ok:false};
  return {tipo:g.comp||'No indicado',ok:false};}
function medioBanco(b){const d=norm(b.desc);if(b.abono>0)return 'Depósito / abono';if(/porte|mant|com\.|comision|interes|envio est|itf/.test(d))return 'Cargo del banco';
  if(/pos|eess|grifo|chifa|elbeka/.test(d))return 'Pago con tarjeta (POS)';if(/tran|transf/.test(d))return 'Transferencia';if(/ret|ventanilla|cajero/.test(d))return 'Retiro en efectivo';return 'Otro';}
const enP=(f,p)=>p==='todos'||mesDe(f)===p;
function datosReporte(p){
  idx();
  let saldo=+state.config.saldoInicialBanco||0,ini=null; const banco=[];
  state.banco.forEach(b=>{const antes=saldo;saldo=r2(saldo+b.abono-b.cargo);if(!enP(b.fecha,p))return;if(ini===null)ini=antes;
    const gs=(LB[b.id]||[]).map(gById).filter(Boolean),ms=(LB[b.id]||[]).map(i=>state.movimientos.find(m=>m.id===i)).filter(Boolean),qs=(LB[b.id]||[]).map(crmById).filter(Boolean).map(cobItem);
    const its=[...gs,...ms,...qs],ci=its.map(compInfo);
    banco.push([fdate(b.fecha),b.op,medioBanco(b),b.desc,
      gs.length?gs.map(g=>g.desc).join(' / '):ms.length?ms.map(m=>m.descripcion||m.subcategoria).join(' / '):qs.length?qs.map(q=>q.desc).join(' / '):bancoEstado(b)[0]+(b.nota?' · '+b.nota:''),
      its.map(g=>g.ruc).filter(Boolean).join(' / '),its.map(g=>g.rs).filter(Boolean).join(' / '),
      its.map(g=>[compInfo(g).tipo,(g.serie||'')+(g.num?'-'+g.num:'')].filter(Boolean).join(' ')).join(' / ')||(b.cls==='comision'?'Estado de cuenta (cargo bancario)':''),
      b.cls==='comision'?'Sí (estado de cuenta)':its.length?(ci.every(c=>c.ok)?'Sí':'No'):scB(b)?'No':'Por revisar',
      b.abono||'',b.cargo||'',saldo]);});
  if(ini===null)ini=saldo;
  const socios=[],sinComp=[];
  GA().filter(g=>isSocio(g.medio)&&enP(g.fecha,p)).sort((a,b)=>a.fecha.localeCompare(b.fecha)).forEach(g=>{const ci=compInfo(g);const base=ci.tipo==='Factura'?r2(g.monto/1.18):'';
    socios.push([socioDe(g.medio),fdate(g.fecha),ci.tipo,g.ruc,g.rs,g.serie,g.num,base,base!==''?r2(g.monto-base):'',g.monto,g.desc,ci.ok?'Sí':'No']);
    if(!ci.ok)sinComp.push([fdate(g.fecha),'Pagado por '+socioDe(g.medio),ci.tipo,g.desc,g.monto]);});
  state.movimientos.filter(m=>m.tipo==='egreso'&&m.pagadoPor&&enP(m.fecha,p)).forEach(m=>{const ci=compInfo(m);const base=ci.tipo==='Factura'?r2(m.monto/1.18):'';socios.push([m.pagadoPor,fdate(m.fecha),ci.tipo,m.ruc,m.rs,m.serie,m.num,base,base!==''?r2(m.monto-base):'',m.monto,m.descripcion||m.subcategoria,ci.ok?'Sí':'No']);if(!ci.ok)sinComp.push([fdate(m.fecha),'Pagado por '+m.pagadoPor+' (registro rápido)',ci.tipo,m.descripcion||m.subcategoria,m.monto]);});
  state.movimientos.filter(m=>m.tipo==='egreso'&&!m.pagadoPor&&m.comp&&enP(m.fecha,p)&&!compInfo(m).ok).forEach(m=>sinComp.push([fdate(m.fecha),m.cuenta+' (registro rápido)',compInfo(m).tipo,m.descripcion||m.subcategoria,m.monto]));
  state.banco.filter(b=>scB(b)&&enP(b.fecha,p)).forEach(b=>sinComp.push([fdate(b.fecha),'Cuenta de la empresa (Op '+(b.op||'s/n')+')','Sin comprobante',b.nota||b.desc,b.cargo]));
  const caja=GA().filter(g=>g.medio===CAJA&&enP(g.fecha,p)).map(g=>{const ci=compInfo(g);if(!ci.ok)sinComp.push([fdate(g.fecha),'Caja chica',ci.tipo,g.desc,g.monto]);return [fdate(g.fecha),g.quien,ci.tipo,g.ruc,g.rs,g.serie,g.num,g.monto,g.desc,ci.ok?'Sí':'No'];});
  const resumenSocios=socioNames().map(n=>{const m=movSocio(n);const s=f=>r2(m.filter(f).reduce((a,x)=>a+x.v,0));
    const antes=s(x=>p!=='todos'&&mesDe(x.f)<p),per=t=>s(x=>x.t===t&&enP(x.f,p));
    const pg=per('Pagó un gasto de la empresa'),ef=per('Puso efectivo en caja chica'),dp=per('Depositó en la cuenta'),dv=-per('La empresa le devolvió');
    return [n,antes,pg,ef,dp,dv,r2(antes+pg+ef+dp-dv)];});
  const ing=r2(banco.reduce((a,r)=>a+(+r[9]||0),0)),sal=r2(banco.reduce((a,r)=>a+(+r[10]||0),0));
  const cobros=crm().filter(c=>enP(c.fecha,p)).sort((a,b)=>a.fecha.localeCompare(b.fecha)).map(c=>{const d=cobDest(c),bs=(LG[c.id]||[]).map(bById).filter(Boolean);
    return [fdate(c.fecha),c.numero||'',c.cliente||'',c.tipo||'',c.medio||'',c.comp&&c.comp.tipo?c.comp.tipo:'Sin comprobante registrado',c.comp&&c.comp.numero?c.comp.numero:'',c.monto,
      d==='banco'?'Cuenta de la empresa (BCP)':d==='caja'?'Caja chica: '+(cajaById(cobCaja(c))?.nombre||''):'Por ubicar',bs.length?bs.map(b=>fdate(b.fecha)+(b.op?' Op '+b.op:'')).join(' / '):d==='banco'?'Falta vincular':''];});
  return {banco,socios,sinComp,caja,cobros,resumenSocios,ini:r2(ini),ing,sal,fin:r2(ini+ing-sal),
    socTot:r2(socios.reduce((a,r)=>a+r[9],0)),socCon:r2(socios.filter(r=>r[11]==='Sí').reduce((a,r)=>a+r[9],0)),scTot:r2(sinComp.reduce((a,r)=>a+r[4],0))};
}
let repP=null;
function dlgReporte(){
  const ms=[...new Set([...state.banco.map(b=>mesDe(b.fecha)),...GA().map(g=>mesDe(g.fecha))])].sort();
  const mb=[...new Set(state.banco.map(b=>mesDe(b.fecha)))].sort();
  if(!repP||(!ms.includes(repP)&&repP!=='todos'))repP=mb[mb.length-1]||ms[ms.length-1]||'todos';
  const d=datosReporte(repP),pend=state.banco.filter(b=>enP(b.fecha,repP)&&bancoEstado(b)[1]==='bad').length;
  dlg(`<h2>Reporte para contabilidad</h2><p class="hint" style="margin-bottom:12px">Lo que suele pedir el contador para la declaración mensual: los movimientos de la cuenta bancaria con su sustento, y aparte los gastos que pagaron los socios con su dinero (que nunca entró a la cuenta de la empresa).</p>
  <div class="row" style="margin-bottom:12px"><label class="lb" for="repP" style="margin:0">Período</label><select class="input" id="repP" style="width:200px" data-chg="repP">${ms.map(m=>`<option value="${m}" ${m===repP?'selected':''}>${MES[+m.slice(5)-1]} ${m.slice(0,4)}</option>`).join('')}<option value="todos" ${repP==='todos'?'selected':''}>Todo el período</option></select></div>
  ${pend?`<div class="alert warn"><div>Hay <b>${pend} movimiento(s) del banco sin explicar</b> en este período. El reporte saldrá con “Por revisar” en esas líneas. Conviene vincularlos antes de enviarlo.</div><button class="btn sm" data-act="rep-ir">Ir a vincular</button></div>`:''}
  <table class="ctl"><tbody>
   <tr><td colspan="2" class="label">Cuenta bancaria de la empresa</td></tr>
   <tr><td>Saldo inicial</td><td class="n">${fmt(d.ini)}</td></tr><tr><td>(+) Ingresos</td><td class="n t-ok">${fmt(d.ing)}</td></tr><tr><td>(–) Salidas</td><td class="n t-bad">${fmt(d.sal)}</td></tr><tr class="tot"><td>Saldo final</td><td class="n">${fmt(d.fin)}</td></tr>
   <tr><td colspan="2" class="label" style="padding-top:16px">Gastos pagados por socios (no pasaron por el banco)</td></tr>
   <tr><td>Con comprobante válido</td><td class="n">${fmt(d.socCon)}</td></tr><tr><td>Sin comprobante válido</td><td class="n t-warn">${fmt(r2(d.socTot-d.socCon))}</td></tr><tr class="tot"><td>Total (${d.socios.length} gastos)</td><td class="n">${fmt(d.socTot)}</td></tr>
   <tr><td colspan="2" class="label" style="padding-top:16px">Para revisar con el contador</td></tr>
   <tr><td>Total sin comprobante (socios, banco y caja chica)</td><td class="n t-warn">${fmt(d.scTot)}</td></tr>
   ${d.resumenSocios.map(r=>`<tr><td>Deuda con ${esc(r[0])} al cierre</td><td class="n">${fmt(r[6])}</td></tr>`).join('')}
  </tbody></table>
  <div class="row" style="margin-top:20px;justify-content:flex-end"><button class="btn" data-act="close">Cerrar</button><button class="btn primary" data-act="rep-xlsx">Descargar Excel para contabilidad</button></div>`,true);
}
function exportReporte(){
  if(typeof XLSX==='undefined'){toast('No cargó el lector de Excel. Revisa tu conexión a internet.',true);return;}
  const p=repP||'todos',d=datosReporte(p),wb=XLSX.utils.book_new(),per=p==='todos'?'Todo el período':MES[+p.slice(5)-1]+' '+p.slice(0,4);
  const add=(n,a)=>{const w=XLSX.utils.aoa_to_sheet(a);w['!cols']=(a.reduce((m,r)=>r.length>m.length?r:m,[])).map((_,i)=>({wch:Math.min(48,Math.max(10,...a.map(r=>String(r[i]??'').length)))}));XLSX.utils.book_append_sheet(wb,w,n);};
  add('Resumen',[['Vitta Kleanly SAC · Reporte para contabilidad'],['Período',per],[],['CUENTA BANCARIA DE LA EMPRESA',''],['Saldo inicial',d.ini],['Ingresos',d.ing],['Salidas',d.sal],['Saldo final',d.fin],[],
    ['GASTOS PAGADOS POR SOCIOS CON SU DINERO (no pasaron por la cuenta de la empresa)',''],['Con comprobante válido',d.socCon],['Sin comprobante válido',r2(d.socTot-d.socCon)],['Total',d.socTot],[],
    ['DEUDA CON SOCIOS','Saldo inicial','Pagó gastos','Efectivo a caja chica','Depósitos a la cuenta','Devoluciones','Saldo al cierre'],...d.resumenSocios,[],['Total gastos sin comprobante (socios, banco y caja chica)',d.scTot]]);
  add('Banco - movimientos',[['Fecha','N° operación','Medio','Descripción del banco','Concepto / gasto vinculado','RUC proveedor','Razón social','Comprobante','¿Tiene comprobante?','Ingreso','Salida','Saldo'],...d.banco]);
  add('Gastos pagados por socios',[['Socio','Fecha','Tipo de comprobante','RUC proveedor','Razón social','Serie','Número','Base imponible (estimada)','IGV (estimado)','Total','Descripción','¿Comprobante válido?'],...d.socios]);
  add('Sin comprobante',[['Fecha','Quién / desde dónde','Tipo','Descripción / en qué se gastó','Monto'],...d.sinComp]);
  if(d.cobros.length)add('Cobros a clientes',[['Fecha','N° cotización / liquidación','Cliente','Tipo de pago','Medio','Comprobante emitido','N° comprobante','Monto','A dónde entró','Línea del banco vinculada'],...d.cobros]);
  if(d.caja.length)add('Caja chica',[['Fecha','Registró','Tipo de comprobante','RUC proveedor','Razón social','Serie','Número','Total','Descripción','¿Comprobante válido?'],...d.caja]);
  add('Notas',[['Notas para el contador'],
    ['1. “Banco - movimientos” lista cada línea del estado de cuenta con el gasto del Forms al que corresponde y su comprobante.'],
    ['2. “Gastos pagados por socios” son gastos de la empresa que un socio pagó con su propio dinero; ese dinero nunca entró a la cuenta de la empresa. La app los registra como deuda de la empresa con el socio.'],
    ['3. Base imponible e IGV están estimados como Total / 1.18 solo para facturas; verificar contra cada comprobante.'],
    ['4. “Sin comprobante” reúne lo que no tiene factura, boleta ni recibo a nombre de la empresa, para que el contador defina su tratamiento.'],
    ['5. “Cobros a clientes” lista todos los pagos registrados en la Central en el período, con el comprobante emitido y a dónde entró el dinero (cuenta de la empresa o caja chica). Los “Por ubicar” aún no tienen destino confirmado.'],
    ['6. Generado desde la Central de Servicios de Vitta Kleanly (Finanzas → Caja y bancos).']]);
  download(`Vitta_Kleanly_Contabilidad_${p}.xlsx`,XLSX.write(wb,{bookType:'xlsx',type:'array'}),'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}

/* ---------------- Exportar ---------------- */
function xlsxDl(name,sheet,rows,w){const wb=XLSX.utils.book_new(),ws=XLSX.utils.aoa_to_sheet(rows);ws['!cols']=w.map(x=>({wch:x}));XLSX.utils.book_append_sheet(wb,ws,sheet.slice(0,31));download(name,XLSX.write(wb,{bookType:'xlsx',type:'array'}),'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');}
async function download(name,content,mime){
  let dl=null;try{dl=window.claude&&window.claude.use?await window.claude.use('downloads'):null;}catch(e){}
  if(dl){try{await dl.save({filename:name,data:content});toast('Archivo listo: '+name);}catch(e){if(!e||e.code!=='declined')toast('No se pudo preparar el archivo ('+((e&&e.code)||'error')+').',true);}return;}
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type:mime||'application/octet-stream'}));a.download=name;document.body.appendChild(a);a.click();a.remove();}
const CAT={operativo:'Operativo',inversion:'Inversión',financiamiento:'Financiamiento'};
function exportCSV(){const M=allMovs().sort((a,b)=>a.fecha.localeCompare(b.fecha));const rows=[['Fecha','Tipo','Categoria','Subcategoria','Descripcion','Monto','Cuenta','Origen','Suma en flujo'],...M.map(m=>[m.fecha,m.tipo,CAT[m.categoria],m.subcategoria,m.descripcion,m.monto,m.cuenta,ORIG[m.origen],m.excluido?'No: '+m.excluido:'Sí'])];
  download('vitta-kleanly-movimientos.csv','﻿'+rows.map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\n'),'text/csv;charset=utf-8;');}
function exportXlsx(){
  if(typeof XLSX==='undefined'){toast('No cargó el lector de Excel. Revisa tu conexión a internet.',true);return;}
  idx();const M=allMovs(),P=computePeriods('mes',M),wb=XLSX.utils.book_new();
  const add=(n,a)=>{const w=XLSX.utils.aoa_to_sheet(a);w['!cols']=(a[0]||[]).map((_,i)=>({wch:Math.min(48,Math.max(12,...a.map(r=>String(r[i]??'').length)))}));XLSX.utils.book_append_sheet(wb,w,n);};
  add('Flujo de caja',[['Concepto',...P.map(p=>p.label)],['(+) Saldo inicial',...P.map(p=>r2(p.ini))],['(+) Ingresos operativos',...P.map(p=>r2(p.ingOp))],['(-) Egresos operativos',...P.map(p=>-r2(p.egOp))],['(=) FCO',...P.map(p=>r2(p.fco))],['(+/-) FCI',...P.map(p=>r2(p.fci))],['(+/-) FCF',...P.map(p=>r2(p.fcf))],['(=) Flujo neto',...P.map(p=>r2(p.net))],['(=) Saldo final',...P.map(p=>r2(p.fin))]]);
  add('Movimientos',[['Fecha','Tipo','Categoría','Subcategoría','Descripción','Monto','Cuenta','Origen','Suma en flujo'],...M.sort((a,b)=>a.fecha.localeCompare(b.fecha)).map(m=>[fdate(m.fecha),m.tipo,CAT[m.categoria],m.subcategoria,m.descripcion,m.monto,m.cuenta,ORIG[m.origen],m.excluido?'No: '+m.excluido:'Sí'])]);
  add('Gastos Forms',[['Fecha','Registró','Cómo se pagó','Tipo de gasto','Comprobante','RUC','Razón social','Serie','Número','Monto','Descripción','N° Op. banco vinculado','Estado'],...GA().slice().sort((a,b)=>a.fecha.localeCompare(b.fecha)).map(g=>[fdate(g.fecha),g.quien,g.medio,g.tipo,g.comp,g.ruc,g.rs,g.serie,g.num,g.monto,g.desc,(LG[g.id]||[]).map(i=>bById(i)?.op).filter(Boolean).join(' + '),gastoEstado(g)[0]])]);
  add('Banco',[['Fecha','Descripción','N° Op.','Cargo','Abono','Saldo','Estado','Nota','Gasto vinculado'],...state.banco.map(b=>[fdate(b.fecha),b.desc,b.op,b.cargo||'',b.abono||'',b.saldo,bancoEstado(b)[0],b.nota||'',(LB[b.id]||[]).map(i=>itemById(i)?.desc).filter(Boolean).join(' / ')])]);
  add('Socios',[['Socio','Fecha','Movimiento','Detalle','Monto'],...socioNames().flatMap(n=>movSocio(n).map(m=>[n,fdate(m.f),m.t,m.d,m.v]))]);
  download('Vitta_Kleanly_Flujo_y_Conciliacion.xlsx',XLSX.write(wb,{bookType:'xlsx',type:'array'}),'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}

/* ---------------- Eventos ---------------- */
const ACT={
  tab:t=>{tab=t.dataset.v;render();},
  'p-h':t=>{pH=t.dataset.v;resetPg();render();}, 'p-esc':t=>{pEsc=t.dataset.v;render();},
  'p-sugerir':()=>{setProy(p=>{p.listo=true;p.rec=[...(p.rec||[]),...sugerirRec()];});toast('Proyección armada con tus últimos 3 meses');},
  'p-sugerir2':async()=>{const have=new Set(proy().rec.map(r=>r.concepto)),N=sugerirRec().filter(r=>!have.has(r.concepto));if(!N.length){toast('Ya tienes todos los gastos fijos de tu historial');return;}
    if(!await ask(`Agregar ${N.length} gasto(s) fijo(s) con el promedio de tus últimos 3 meses:\n`+N.map(r=>'· '+r.nombre+': '+fmt(r.monto)+' al mes').join('\n')))return;setProy(p=>{p.listo=true;p.rec=[...(p.rec||[]),...N];});},
  'p-listo':()=>setProy(p=>{p.listo=true;}),
  'p-rec-nuevo':t=>dlgRec('',t.dataset.v), 'p-rec-edit':t=>dlgRec(t.dataset.v),
  'p-rec-tog':t=>setProy(p=>{const r=(p.rec||[]).find(x=>x.id===t.dataset.v);if(r)r.activo=r.activo===false;}),
  'p-rec-del':async t=>{const r=proy().rec.find(x=>x.id===t.dataset.v);if(!r||!await ask(`¿Eliminar “${r.nombre||r.concepto}” de la proyección?`,'Eliminar'))return;setProy(p=>{p.rec=(p.rec||[]).filter(x=>x.id!==r.id);});},
  'p-foto':()=>tomarFoto(false), 'p-export':()=>exportProy(),
  'p-reset':async()=>{if(!await ask('¿Volver a los supuestos sugeridos por tu historial y a los escenarios por defecto?'))return;setProy(p=>{delete p.param;delete p.esc;});}, periodo:t=>{periodo=t.dataset.v;render();}, rango:t=>{const v=t.dataset.v;if(v==='fechas'){rOpen=!rOpen;if(rOpen){const d=new Date();rDD=rDesde||isoD(new Date(d.getFullYear(),d.getMonth()-2,1));rDH=rHasta||isoD(d);}}else{rango=v;rOpen=false;}render();},
  rpre:t=>{const d=new Date(),v=t.dataset.v;if(v==='mes'){rDD=isoD(new Date(d.getFullYear(),d.getMonth(),1));rDH=isoD(d);}else if(v==='mesant'){rDD=isoD(new Date(d.getFullYear(),d.getMonth()-1,1));rDH=isoD(new Date(d.getFullYear(),d.getMonth(),0));}
    else if(v==='trim'){rDD=isoD(new Date(d.getTime()-89*86400000));rDH=isoD(d);}else{rDD=d.getFullYear()+'-01-01';rDH=isoD(d);}
    const a=$('[data-rdd=desde]'),b=$('[data-rdd=hasta]');if(a)a.value=rDD;if(b)b.value=rDH;},
  'r-apply':()=>{if(!rDD||!rDH){toast('Elige las dos fechas',true);return;}if(rDD>rDH){toast('“Desde” debe ser anterior a “Hasta”',true);return;}rDesde=rDD;rHasta=rDH;rango='fechas';rOpen=false;render();toast('Rango aplicado: '+fdate(rDesde)+' – '+fdate(rHasta));},
  'r-cancel':()=>{rOpen=false;render();}, subc:t=>{subC=t.dataset.v;render();}, close:closeDlg,
  'imp-forms':()=>$('#fileForms').click(), 'imp-banco':dlgImpBanco, 'pick-banco':()=>$('#fileBanco').click(), 'imp-json':()=>$('#fileJson').click(),
  'export-csv':exportCSV, 'export-xlsx':exportXlsx, config:dlgConfig, 'add-caja':t=>dlgCaja(t.dataset.v==='apertura'), 'add-banco':()=>dlgBancoManual(), 'edit-banco':t=>dlgBancoManual(t.dataset.v), 'ver-banco':()=>{subC='banco';render();},
  'export-json':()=>{download('vitta-kleanly-respaldo.json',JSON.stringify(state,null,2),'application/json');},
  'parse-bcp':()=>preview(parseBCP($('#bcpText').value,$('#bcpAnio').value||new Date().getFullYear()),'el texto pegado'), 'confirm-banco':confirmBanco, 'forms-ok':aplicarForms, 'nuevo-mov':t=>openMov(t.dataset.v), reporte:dlgReporte, 'rep-xlsx':exportReporte, 'rep-ir':()=>{closeDlg();tab='conciliacion';subC='pendientes';render();},
  'dup-ok':t=>{state.config.dupOk=[...(state.config.dupOk||[]),t.dataset.v];selD.delete(t.dataset.v);save();render();toast('Marcado como no duplicado');},
  'dup-undo':t=>{state.config.dupOk=(state.config.dupOk||[]).filter(k=>k!==t.dataset.v);save();render();toast('Vuelve a estar pendiente');},
  'dup-keep':async t=>{const gr=duplicados().find(g=>g.key===t.dataset.v);if(!gr)return;const s=gr.items.find(i=>i.id===sugerido(gr));
    if(!await ask(`Se conservará “${s.desc}” (${fdate(s.fecha)}, ${s.quien}) y se quitarán los otros ${gr.items.length-1} registro(s) del grupo. Puedes restaurarlos desde “Ya resueltos”.`,'Conservar y quitar'))return;conservarSugerido(gr);selD.delete(gr.key);save();render();toast('Grupo resuelto');},
  'dup-bulk-keep':async()=>{const gs=duplicados().filter(g=>selD.has(g.key));if(!gs.length)return;const n=gs.reduce((a,g)=>a+g.items.length-1,0);
    if(!await ask(`Se conservará el registro sugerido en ${gs.length} grupo(s) y se quitarán ${n} registro(s). Puedes restaurarlos desde “Ya resueltos”.`,'Conservar y quitar'))return;gs.forEach(conservarSugerido);selD.clear();save();render();toast(`${gs.length} grupo(s) resueltos`);},
  'dup-bulk-ok':async()=>{const ks=[...selD];if(!ks.length)return;if(!await ask(`¿Marcar ${ks.length} grupo(s) como “no es duplicado”?`,'Marcar'))return;state.config.dupOk=[...(state.config.dupOk||[]),...ks];selD.clear();save();render();toast(`${ks.length} grupo(s) marcados`);},
  dfil:t=>{fD[t.dataset.k]=t.dataset.v;render();},
  vfil:t=>{fV.estado=t.dataset.v;render();}, 'v-limpiar':()=>{fV={tipo:'',mes:'',medio:'',estado:'',q:''};render();},
  'v-ok':t=>{const c=coincidencias()[t.dataset.v];if(c){vincular(c.i,c.b);selV.delete(c.b);save();render();toast('Vinculado');}},
  'v-regla':t=>{const b=bById(t.dataset.v),r=b&&reglaPara(b);if(r){b.cls=r.cls;selV.delete(b.id);save();render();toast('Clasificado: '+clsLabel(r.cls));}},
  'v-bulk-co':async()=>{const co=coincidencias(),ids=[...selV].filter(id=>co[id]);if(!ids.length)return;
    if(!await ask(`Se vincularán ${ids.length} movimiento(s) con su posible coincidencia. Revisa que sean correctas; puedes deshacerlo en “Ya vinculados”.`,'Confirmar'))return;ids.forEach(id=>vincular(co[id].i,id));ids.forEach(id=>selV.delete(id));save();render();toast(`${ids.length} vinculados`);},
  'v-bulk-regla':async()=>{const ids=[...selV].filter(id=>{const b=bById(id);return b&&!(LB[id]||[]).length&&reglaPara(b);});if(!ids.length)return;
    if(!await ask(`Se aplicarán las reglas a ${ids.length} movimiento(s).`,'Aplicar'))return;ids.forEach(id=>{const b=bById(id);b.cls=reglaPara(b).cls;selV.delete(id);});save();render();toast(`${ids.length} clasificados`);},
  'v-bulk-cls':async()=>{const v=$('#vBulkCls')&&$('#vBulkCls').value;if(!v){toast('Elige una clasificación',true);return;}const esCargo=clsEsCargo(v);
    const ids=[...selV].filter(id=>{const b=bById(id);return b&&!(LB[id]||[]).length&&(b.cargo>0)===esCargo;});const omit=selV.size-ids.length;
    if(!ids.length){toast(esCargo?'Esa clasificación es para cargos y no hay cargos sin vincular seleccionados.':'Esa clasificación es para abonos y no hay abonos sin vincular seleccionados.',true);return;}
    if(!await ask(`Se clasificarán ${ids.length} movimiento(s) como “${clsLabel(v)}”.${omit?` ${omit} se omiten porque no aplican (cargo/abono distinto o vinculados en parte).`:''}`,'Clasificar'))return;
    ids.forEach(id=>{setCls(bById(id),v);selV.delete(id);});save();render();toast(`${ids.length} clasificados`);},
  'v-buscar':t=>dlgBuscar(t.dataset.v),
  'bus-ok':()=>{const b=bById(busB);if(!b)return;busSel.forEach(i=>vincular(i,b.id));const n=busSel.size;busSel=new Set();save();closeDlg();render();toast(`${n} gasto(s) vinculados`);},
  'v-nueva-regla':t=>{const b=t.dataset.v?bById(t.dataset.v):null;const txt=b?b.desc.replace(/\s*\(.*?\)\s*/g,' ').trim().split(/\s+/).slice(0,2).join(' '):'';
    dlg(`<h2>Nueva regla</h2><p class="hint" style="margin-bottom:16px">Cuando la descripción del banco contenga este texto, la app te propondrá la clasificación. Tú la confirmas.</p><form data-form="regla"><div class="fg">
     <div class="field full"><label>Si la descripción contiene</label><input class="input mono" name="texto" value="${esc(txt)}" required></div>
     <div class="field full"><label>Proponer</label><select class="input" name="cls">${clsOptsAmbos()}</select></div></div>${btns('Crear regla')}</form>`);},
  'v-borrar-regla':t=>{state.config.reglas=(state.config.reglas||[]).filter((_,i)=>i!==+t.dataset.v);save();render();toast('Regla borrada');},
  'v-reglas-base':()=>{const base=[['PORTE','comision'],['MANT','comision'],['COM.','comision'],['ENVIO EST','comision'],['INTERESES','comision'],['ITF','comision']];
    const ex=new Set((state.config.reglas||[]).map(r=>norm(r.texto)));state.config.reglas=[...(state.config.reglas||[]),...base.filter(([x])=>!ex.has(norm(x))).map(([texto,cls])=>({texto,cls}))];save();render();toast('Reglas agregadas');},
  'dup-quitar':async t=>{if(!await ask('¿Quitar este registro? No se borrará del Forms, pero la app lo ignorará en el flujo y en los reportes.','Quitar'))return;const id=t.dataset.v;quitarItems([{id,kind:t.dataset.k}]);save();render();toast('Registro quitado');},
  'dup-restore':t=>{const g=gById(t.dataset.v);if(g){delete g.ignorado;delete g.ignoradoEl;save();render();toast('Registro restaurado');}},
  'pick-img':()=>$('#fileImg').click(), pdel:t=>{pendB.splice(+t.dataset.v,1);preview(pendB,'tu revisión');}, padd:()=>{pendB.push({fecha:'',desc:'',op:'',cargo:0,abono:0,saldo:null,flag:''});preview(pendB,'tu revisión');},
  'fondo-a-sc':async()=>{const L=state.banco.filter(b=>b.cls==='fondo');if(!await ask(`Se cambiarán ${L.length} movimiento(s) del banco de “fondo de caja chica” a “gasto sin comprobante”. Luego puedes anotar en qué se gastó cada uno en Cruce con el banco → Ya vinculados. ¿Continuar?`))return;L.forEach(b=>b.cls='gasto_sc');save();render();toast(L.length+' movimientos pasados a gasto sin comprobante');},
  'del-caja':async t=>{if(!await ask('¿Borrar esta entrada de caja chica?'))return;state.caja=state.caja.filter(c=>c.id!==t.dataset.v);save();render();},
  'desv-g':t=>{state.links=state.links.filter(l=>l.g!==t.dataset.v);save();render();}, 'desv-b':async t=>{const b=bById(t.dataset.v);if(!b)return;if(b.revisado&&!await ask('Este movimiento ya está marcado como revisado. ¿Deshacer igual? Volverá a “Vincular”.','Deshacer'))return;state.links=state.links.filter(l=>l.b!==b.id);b.cls='';delete b.revisado;selW.delete(b.id);save();render();toast('Relación quitada: vuelve a “Vincular”');},
  bfil:t=>{fB.est=t.dataset.v;render();},
  'b-falta':t=>{const df=bancoDiff();if(!df)return;const i=state.banco.indexOf(df.b),p=state.banco[i-1],ps=p&&p.saldo!=null&&p.saldo!==''?+p.saldo:null;
    dlgBancoManual(null,{antesDe:df.b.id,fecha:df.b.fecha,cargo:df.diff>0?df.diff:'',abono:df.diff<0?-df.diff:'',saldo:ps!=null?r2(ps-(df.diff>0?df.diff:0)+(df.diff<0?-df.diff:0)):''});},
  'b-up':t=>{moverBanco(t.dataset.v,-1);save();render();}, 'b-down':t=>{moverBanco(t.dataset.v,1);save();render();}, 'b-limpiar':()=>{fB={...fB,est:'',tipo:'',mes:'',medio:'',q:''};render();},
  'b-bulk-cls':async()=>{const v=$('#bBulkCls')&&$('#bBulkCls').value;if(!v){toast('Elige una clasificación',true);return;}const esCargo=clsEsCargo(v);
    const ids=[...selB].filter(id=>{const b=bById(id);return b&&!(LB[id]||[]).length&&(b.cargo>0)===esCargo;});const omit=selB.size-ids.length;
    if(!ids.length){toast('Ninguno aplica: solo se clasifican '+(esCargo?'cargos':'abonos')+' sin gasto vinculado.',true);return;}
    if(!await ask(`Se clasificarán ${ids.length} línea(s) como “${clsLabel(v)}”.${omit?` ${omit} se omiten (tienen gasto vinculado o son ${esCargo?'abonos':'cargos'}).`:''}`,'Clasificar'))return;
    ids.forEach(id=>setCls(bById(id),v));selB.clear();save();render();toast(ids.length+' clasificada(s)');},
  'b-bulk-desv':async()=>{const ids=[...selB].filter(id=>{const b=bById(id);return b&&((LB[id]||[]).length||b.cls);});if(!ids.length)return;
    if(!await ask(`Se quitará la vinculación o clasificación de ${ids.length} línea(s); volverán a “Vincular”.`,'Quitar'))return;
    const S=new Set(ids);state.links=state.links.filter(l=>!S.has(l.b));ids.forEach(id=>{const b=bById(id);b.cls='';delete b.revisado;});selB.clear();save();render();toast(ids.length+' línea(s) sin vincular');},
  'b-bulk-del':async()=>{const ids=[...selB];if(!ids.length)return;const S=new Set(ids),tot=ids.map(bById).filter(Boolean).reduce((a,b)=>a+bAmt(b),0);
    if(!await ask(`Se borrarán ${ids.length} línea(s) del estado de cuenta (${fmt(tot)}) y sus vinculaciones. El saldo recalculado cambiará. Esto no se puede deshacer.`,'Borrar'))return;
    state.banco=state.banco.filter(b=>!S.has(b.id));state.links=state.links.filter(l=>!S.has(l.b));selB.clear();save();render();toast(ids.length+' línea(s) borradas');},
  'b-export':()=>{let run=+state.config.saldoInicialBanco||0;const calc={};state.banco.forEach(b=>{run=r2(run+b.abono-b.cargo);calc[b.id]=run;});
    const L=selB.size?state.banco.filter(b=>selB.has(b.id)):FZW.__bancoVista||state.banco;
    const rows=[['Fecha','Descripción del banco','Medio','N° operación','Cargo','Abono','Saldo banco','Saldo recalculado','Estado','Explicado con','Registró','Tipo de comprobante','Serie-Número','RUC','Razón social','Nota']];
    L.forEach(b=>{const its=wItems(b),base=[fdate(b.fecha),b.desc,medioBanco(b),b.op||'',b.cargo||'',b.abono||'',b.saldo??'',calc[b.id],bancoEstado(b)[0]];
      if(!its.length)rows.push([...base,b.cls?clsLabel(b.cls):'Por explicar','','','','','',b.nota||'']);
      else its.forEach((i,k)=>rows.push([...(k?base.map(()=>''):base),i.desc,i.quien,compInfo(i).tipo,[i.serie,i.num].filter(Boolean).join('-'),i.ruc||'',i.rs||'',k?'':b.nota||'']));});
    const wb=XLSX.utils.book_new(),ws=XLSX.utils.aoa_to_sheet(rows);ws['!cols']=[10,34,20,12,10,10,12,12,20,34,16,22,16,13,26,26].map(w=>({wch:w}));XLSX.utils.book_append_sheet(wb,ws,'Estado de cuenta');
    download('Vitta_Kleanly_Estado_de_cuenta.xlsx',XLSX.write(wb,{bookType:'xlsx',type:'array'}),'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');},
  gfil:t=>{fG[t.dataset.k]=t.dataset.v;render();}, 'g-limpiar':()=>{fG={...fG,medio:'',est:'',mes:'',quien:'',tipo:'',comp:'',q:''};render();}, 'g-mas':()=>{fG.lim+=100;render();},
  'g-bulk-medio':async()=>{const v=$('#gBulkMedio')&&$('#gBulkMedio').value;if(!v){toast('Elige cómo se pagó',true);return;}
    const L=[...selG].map(gById).filter(g=>g&&!g.ignorado&&g.medio!==v);if(!L.length){toast('Los seleccionados ya tienen ese medio de pago.',true);return;}
    const nl=L.filter(g=>v!==EMP&&(LG[g.id]||[]).length).length;
    if(!await ask(`Se cambiará “cómo se pagó” a “${v}” en ${L.length} gasto(s) (${fmt(L.reduce((a,g)=>a+(+g.monto||0),0))}).${nl?` ${nl} estaban vinculados al banco y se desvincularán.`:''}`,'Cambiar'))return;
    L.forEach(g=>{g.medio=v;g.editado={...(g.editado||{}),medio:1};if(v!==EMP)state.links=state.links.filter(l=>l.g!==g.id);});selG.clear();save();render();toast(L.length+' gasto(s) actualizados');},
  'g-bulk-quitar':async()=>{const L=[...selG].map(gById).filter(g=>g&&!g.ignorado);if(!L.length)return;
    if(!await ask(`Se quitarán ${L.length} gasto(s) (${fmt(L.reduce((a,g)=>a+(+g.monto||0),0))}). No se borran del Forms: la app deja de contarlos y puedes restaurarlos desde el estado “Quitados por duplicado”.`,'Quitar'))return;
    quitarItems(L.map(g=>({id:g.id,kind:'forms'})));selG.clear();save();render();toast(L.length+' gasto(s) quitados');},
  'g-bulk-restore':()=>{let n=0;selG.forEach(id=>{const g=gById(id);if(g&&g.ignorado){delete g.ignorado;delete g.ignoradoEl;n++;}});selG.clear();save();render();toast(n+' gasto(s) restaurados');},
  'g-export':()=>{const L=state.gastos.filter(g=>selG.size?selG.has(g.id):gMatch(g));
    const rows=[['Fecha','Registró','Cómo se pagó','Tipo de gasto','Tipo de comprobante','¿Comprobante válido?','Serie-Número','RUC','Razón social','Descripción','Monto','Op. banco','Estado']];
    L.forEach(g=>{const ci=compInfo(g);rows.push([fdate(g.fecha),g.quien,g.medio,gTipoCorto(g.tipo),ci.tipo,ci.ok?'Sí':'No',[g.serie,g.num].filter(Boolean).join('-'),g.ruc||'',g.rs||'',g.desc,+g.monto||0,(LG[g.id]||[]).map(i=>bById(i)?.op).filter(Boolean).join(' + ')||g.op||'',g.ignorado?'Quitado por duplicado':gastoEstado(g)[0]]);});
    const wb=XLSX.utils.book_new(),ws=XLSX.utils.aoa_to_sheet(rows);ws['!cols']=[10,16,22,22,22,10,16,13,28,36,10,14,24].map(w=>({wch:w}));XLSX.utils.book_append_sheet(wb,ws,'Gastos del Forms');
    download('Vitta_Kleanly_Gastos_Forms.xlsx',XLSX.write(wb,{bookType:'xlsx',type:'array'}),'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');},
  wfil:t=>{fW.estado=t.dataset.v;render();}, 'w-limpiar':()=>{fW={...fW,estado:'',tipo:'',mes:'',como:'',quien:'',q:''};render();}, 'w-mas':()=>{fW.lim+=100;render();},
  'w-rev':t=>{const b=bById(t.dataset.v);if(!b)return;if(b.revisado)delete b.revisado;else b.revisado=hoyISO();save();render();toast(b.revisado?'Marcado como revisado':'Revisado quitado');},
  'w-bulk-rev':()=>{let n=0;selW.forEach(id=>{const b=bById(id);if(b&&!b.revisado){b.revisado=hoyISO();n++;}});selW.clear();save();render();toast(n+' marcado(s) como revisado');},
  'w-bulk-unrev':()=>{let n=0;selW.forEach(id=>{const b=bById(id);if(b&&b.revisado){delete b.revisado;n++;}});selW.clear();save();render();toast('Revisado quitado en '+n);},
  'w-bulk-desv':async()=>{const ids=[...selW];if(!ids.length)return;const nr=ids.filter(id=>bById(id)?.revisado).length;
    if(!await ask(`Se quitará la relación o clasificación de ${ids.length} movimiento(s) y volverán a “Vincular”.${nr?` ${nr} ya estaban marcados como revisados.`:''}`,'Deshacer'))return;
    const S=new Set(ids);state.links=state.links.filter(l=>!S.has(l.b));ids.forEach(id=>{const b=bById(id);if(b){b.cls='';delete b.revisado;}});selW.clear();save();render();toast(ids.length+' movimiento(s) devueltos a “Vincular”');},
  'w-bulk-cls':async()=>{const v=$('#wBulkCls')&&$('#wBulkCls').value;if(!v){toast('Elige una clasificación',true);return;}const esCargo=clsEsCargo(v);
    const ids=[...selW].filter(id=>{const b=bById(id);return b&&!(LB[id]||[]).length&&(b.cargo>0)===esCargo;});const omit=selW.size-ids.length;
    if(!ids.length){toast('Ninguno de los seleccionados aplica: solo se reclasifican los que no tienen gasto vinculado y son '+(esCargo?'cargos':'abonos')+'.',true);return;}
    if(!await ask(`Se reclasificarán ${ids.length} movimiento(s) como “${clsLabel(v)}”.${omit?` ${omit} se omiten (tienen gasto vinculado o son ${esCargo?'abonos':'cargos'}).`:''}`,'Reclasificar'))return;
    ids.forEach(id=>setCls(bById(id),v));selW.clear();save();render();toast(ids.length+' reclasificado(s)');},
  'w-export':()=>{const B=state.banco.filter(b=>((LB[b.id]||[]).length||b.cls)&&(selW.size?selW.has(b.id):wMatch(b)));
    const rows=[['Fecha','Descripción del banco','Medio','N° operación','Cargo','Abono','Estado','Explicado con','Registró','Tipo de comprobante','Serie-Número','RUC','Razón social','Monto gasto','Diferencia','Nota','Revisado']];
    B.forEach(b=>{const its=wItems(b),dif=its.length?wGrupo(b).dif:0,base=[fdate(b.fecha),b.desc,medioBanco(b),b.op||'',b.cargo||'',b.abono||'',W_EST[wEst(b)][0]];
      if(!its.length)rows.push([...base,clsLabel(b.cls),'','','','','','','',b.nota||'',b.revisado?fdate(b.revisado):'']);
      else its.forEach((i,k)=>rows.push([...(k?base.map(()=>''):base),i.desc,i.quien,compInfo(i).tipo,[i.serie,i.num].filter(Boolean).join('-'),i.ruc||'',i.rs||'',i.monto,k?'':dif,k?'':b.nota||'',k?'':b.revisado?fdate(b.revisado):'']));});
    const wb=XLSX.utils.book_new(),ws=XLSX.utils.aoa_to_sheet(rows);ws['!cols']=rows[0].map((h,i)=>({wch:[10,34,18,12,10,10,18,34,16,20,16,13,26,11,11,26,11][i]}));XLSX.utils.book_append_sheet(wb,ws,'Ya vinculados');
    download('Vitta_Kleanly_Ya_vinculados.xlsx',XLSX.write(wb,{bookType:'xlsx',type:'array'}),'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');},
  'del-banco':async t=>{if(!await ask('¿Borrar este movimiento del banco?'))return;state.banco=state.banco.filter(b=>b.id!==t.dataset.v);state.links=state.links.filter(l=>l.b!==t.dataset.v);save();render();},
  editar:t=>editar(t.dataset.v),
  eliminar:async t=>{if(!await ask('¿Eliminar este movimiento? Esta acción no se puede deshacer.'))return;state.movimientos=state.movimientos.filter(m=>m.id!==t.dataset.v);state.links=state.links.filter(l=>l.g!==t.dataset.v);save();render();toast('Movimiento eliminado');},
  limpiar:()=>{fil={desde:'',hasta:'',tipo:'',cat:'',origen:'',cuenta:'',suma:'',q:''};render();},
  mfil:t=>{fil.origen=t.dataset.v;render();}, 'ir-cruce':t=>{tab='conciliacion';subC=t.dataset.v;render();try{FZH.scrollIntoView({block:'start'});}catch(e){}},
  'sel-socio':t=>{selSocio=t.dataset.v;render();},
  'p-socio':t=>{fP.socio=fP.socio===t.dataset.v&&t.dataset.v?'':t.dataset.v;PG.socio&&(PG.socio.p=0);render();}, 'p-limpiar':()=>{fP={socio:'',mes:'',tipo:'',comp:'',q:''};render();},
  mesc:t=>{setMesC(t.dataset.v);subC=null;render();},
  'mes-cerrar':async()=>{if(!mesC)return;const ML=MES[+mesC.slice(5)-1]+' '+mesC.slice(0,4);if(!await ask(`¿Cerrar ${ML}? Queda marcado como revisado y cerrado. Si después cambia algo de ese mes, la app te avisará con “Cerrado con cambios”. Puedes reabrirlo cuando quieras.`,'Cerrar mes'))return;
    state.config.cerrados={...(state.config.cerrados||{}),[mesC]:{en:hoyISO()}};save();const MS=mesesCruce(),sig=MS.find(m=>m>mesC&&!cerrado(m));toast(ML+' cerrado');if(sig){setMesC(sig);subC=null;}render();},
  'mes-reabrir':async()=>{if(!mesC)return;if(!await ask('¿Reabrir este mes? Podrás seguir corrigiéndolo y volver a cerrarlo.','Reabrir'))return;const c={...(state.config.cerrados||{})};delete c[mesC];state.config.cerrados=c;save();render();toast('Mes reabierto');},
  pend:t=>dlgPend(t.dataset.v), 'pend-cerrar':()=>{FZW.__pendKind=null;FZW.__pendBack=false;$('#dlg').close();},
  'g-nuevo':()=>dlgGasto('',mesC&&mesC!==hoyISO().slice(0,7)?{fecha:mesC+'-01'}:null),
  'pb-abrir':t=>dlgBuscarBanco(t.dataset.v), 'pb-desde-bus':t=>dlgBuscarBanco(t.dataset.v,busB),
  'pb-ok':()=>{const ids=[...pbSel];if(!ids.length)return;ids.forEach(b=>vincular(pbG,b));const it=itemById(pbG),rem=it?r2(it.monto-linkedAmt(it.id)):0;pbSel=new Set();save();closeDlg();render();
    toast(`${ids.length} línea(s) vinculadas`+(Math.abs(rem)<0.005?' · el gasto quedó conciliado':rem>0?` · aún faltan ${fmt(rem)}`:''));},
  'm-ver':t=>verMov(t.dataset.v),
  'ver-cobro':t=>dlgCobro(t.dataset.v),
  'cob-central':t=>{const c=crmById(t.dataset.v);if(!c||!FZO||!FZO.abrir)return;if($('#dlg').open)$('#dlg').close();FZO.abrir(c);},
  'q-ok':t=>{const p=coincCobros()[t.dataset.v];if(p){vincular(p.c,p.b);selQ.delete(p.c);save();render();toast('Cobro vinculado con su abono');}},
  'q-bulk-co':async()=>{const co=coincCobros(),ids=[...selQ].filter(id=>co[id]);if(!ids.length)return;if(!await ask(`¿Vincular ${ids.length} cobro(s) con el abono del mismo monto que propone la app?`))return;
    ids.forEach(id=>vincular(co[id].c,co[id].b));selQ=new Set();save();render();toast(`${ids.length} cobro(s) vinculados`);},
  'm-del':async t=>{const k=t.dataset.v;
    if(k.startsWith('c:')){const c=state.caja.find(x=>x.id===k.slice(2));if(!c||!await ask(`¿Eliminar esta entrega de ${fmt(c.monto)} a caja chica?`,'Eliminar'))return;state.caja=state.caja.filter(x=>x.id!==c.id);}
    else if(k.startsWith('g:')){const g=gById(k.slice(2));if(!g||!await ask(`¿Eliminar el gasto “${g.desc}” de ${fmt(g.monto)}? Fue agregado en la app; no se puede deshacer.`,'Eliminar'))return;state.gastos=state.gastos.filter(x=>x.id!==g.id);state.links=state.links.filter(l=>l.g!==g.id);}
    else{const m=state.movimientos.find(x=>x.id===k);if(!m||!await ask(`¿Eliminar este ${m.tipo==='ingreso'?'ingreso':'egreso'} de ${fmt(m.monto)} (${fdate(m.fecha)})? No se puede deshacer.`,'Eliminar'))return;state.movimientos=state.movimientos.filter(x=>x.id!==k);state.links=state.links.filter(l=>l.g!==k);}
    if($('#dlg').open)$('#dlg').close();save();render();toast('Eliminado');},
  'g-del':async t=>{const g=gById(t.dataset.v);if(!g||!await ask(`¿Eliminar el gasto “${g.desc}” de ${fmt(g.monto)}? No se puede deshacer.`,'Eliminar'))return;state.gastos=state.gastos.filter(x=>x.id!==g.id);state.links=state.links.filter(l=>l.g!==g.id);save();closeDlg();render();toast('Gasto eliminado');}, 'ver-gasto':t=>dlgGasto(t.dataset.v), 'ver-banco-det':t=>dlgBancoDet(t.dataset.v),
  'd-desv':t=>{state.links=state.links.filter(l=>!(l.g===t.dataset.g&&l.b===t.dataset.b));const b=bById(t.dataset.b);if(b)delete b.revisado;save();render();toast('Relación quitada');const d=$('#dlg');if(d.open){d.querySelector('[data-form=gasto]')?dlgGasto(t.dataset.g):dlgBancoDet(t.dataset.b);}},
  'd-quitar':async t=>{const id=t.dataset.v;if(!await ask('¿Quitar este gasto? No se borra del Forms: la app deja de contarlo y puedes restaurarlo.','Quitar'))return;quitarItems([{id,kind:'forms'}]);save();closeDlg();render();toast('Gasto quitado');},
  'd-restore':t=>{const g=gById(t.dataset.v);if(g){delete g.ignorado;delete g.ignoradoEl;save();render();dlgGasto(g.id);toast('Gasto restaurado');}},
  'caja-nueva':()=>dlgCajaCfg(), 'caja-edit':t=>dlgCajaCfg(t.dataset.v), 'caja-sel':t=>{if(t.closest('button')&&t.closest('button')!==t)return;selCaja=selCaja===t.dataset.v?'':t.dataset.v;PG.caja&&(PG.caja.p=0);render();},
  'caja-entregar':t=>dlgCaja(false,t.dataset.v), 'caja-arqueo':t=>dlgArqueo(t.dataset.v), 'caja-rendir':t=>dlgRendir(t.dataset.v), 'm-ver-caja':t=>dlgCajaEdit(t.dataset.v),
  'caja-borrar':async t=>{if(!await ask('¿Eliminar esta caja? No tiene movimientos.','Eliminar'))return;state.config.cajas=cajas().filter(c=>c.id!==t.dataset.v);save();closeDlg();render();},
  'caja-arq-del':async t=>{if(!await ask('¿Borrar este arqueo?','Borrar'))return;state.caja=state.caja.filter(c=>c.id!==t.dataset.v);save();render();},
  'caja-rend-del':async t=>{const r=state.caja.find(c=>c.id===t.dataset.v);if(!r)return;if(!await ask(`¿Deshacer esta rendición? Los ${(r.gastos||[]).length} gastos vuelven a “por rendir”${r.repId?' y se borra la reposición registrada':''}.`,'Deshacer'))return;
    (r.gastos||[]).forEach(id=>{const g=gById(id);if(g&&g.rendido===r.id)delete g.rendido;});state.caja=state.caja.filter(c=>c.id!==r.id&&c.id!==r.repId);save();render();toast('Rendición deshecha');},
  'k-tipo':t=>{fK.tipo=t.dataset.v;PG.caja&&(PG.caja.p=0);render();},
  'm-export':()=>{const L=FZW.__libroVista||[];const rows=[['Fecha','Fuente','Tipo','Categoría','Subcategoría','Descripción','Banco / Op.','Registró','Cómo se pagó','Préstamo de socio','Comprobante','Serie-Número','RUC','Razón social','Monto','¿Suma al flujo?']];
    L.forEach(x=>{const it=x.items.find(i=>i.kind==='forms')||x.items[0];rows.push([fdate(x.fecha),FUENTE[x.fuente][0],x.tipo,CATN2[x.cat]||x.cat,x.sub,x.desc,x.det,x.quien,x.cuenta,x.prestamo||'',it?compInfo(it).tipo:(x.sinComp?'Sin comprobante':''),it?[it.serie,it.num].filter(Boolean).join('-'):'',it?.ruc||'',it?.rs||'',x.tipo==='ingreso'?x.monto:-x.monto,x.suma?'Sí':'No: '+x.motivo]);});
    xlsxDl('Vitta_Kleanly_Movimientos.xlsx','Movimientos',rows,[10,16,9,14,24,36,30,16,16,16,22,14,13,26,10,22]);},
  'p-export':()=>{const L=FZW.__presVista||[];const rows=[['Fecha','Socio','Movimiento','Fuente','Detalle','Op.','Tipo de comprobante','Serie-Número','RUC','Razón social','Monto','Saldo del socio']];
    L.slice().reverse().forEach(x=>rows.push([fdate(x.f),x.socio,x.t,x.src||'',x.d,x.op||'',x.g?compInfo(x.g).tipo:'',x.g?[x.g.serie,x.g.num].filter(Boolean).join('-'):'',x.g?.ruc||'',x.g?.rs||'',x.v,x.saldo]));
    xlsxDl('Vitta_Kleanly_Prestamos_socios.xlsx','Préstamos de socios',rows,[10,16,26,14,36,12,22,14,13,26,10,12]);},
  'k-export':()=>{const L=FZW.__cajaVista||[];const rows=[['Fecha','Caja','Responsable','Tipo','Detalle','Registró / nota','Tipo de comprobante','Serie-Número','RUC','Razón social','Monto','Rendido']];
    L.slice().reverse().forEach(x=>{const c=cajaById(x.caja);rows.push([fdate(x.f),c?.nombre||'',c?.custodio||'',x.tipo==='entrada'?'Entrega':x.tipo==='cobro'?'Cobro en efectivo':'Gasto',x.d,x.obs,x.g?compInfo(x.g).tipo:'',x.g?[x.g.serie,x.g.num].filter(Boolean).join('-'):'',x.g?.ruc||'',x.g?.rs||'',x.v,x.g?(x.g.rendido?'Sí':'No'):'']);});
    const A=state.caja.filter(x=>x.kind==='arqueo').map(r=>[fdate(r.fecha),cajaById(r.cajaId)?.nombre||'',r.teorico,r.contado,r2(r.contado-r.teorico),r.obs||'']);
    const wb=XLSX.utils.book_new();const add=(n,r,w)=>{const ws=XLSX.utils.aoa_to_sheet(r);ws['!cols']=w.map(x=>({wch:x}));XLSX.utils.book_append_sheet(wb,ws,n);};
    add('Movimientos',rows,[10,18,16,9,34,18,22,14,13,26,10,8]);add('Arqueos',[['Fecha','Caja','Debería haber','Contado','Diferencia','Observación'],...A],[10,18,14,12,12,30]);
    download('Vitta_Kleanly_Cajas_chicas.xlsx',XLSX.write(wb,{bookType:'xlsx',type:'array'}),'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');},
  reset:async()=>{if(!await ask('Esto borra TODOS los datos (movimientos, Forms y banco). ¿Continuar?'))return;state={movimientos:[],config:{saldoInicial:0,saldoInicialBanco:0,umbralMinimo:5000,cuentas:['Caja Chica','Banco BCP'],socios:[],contado:{}},gastos:[],banco:[],links:[],caja:[]};save();closeDlg();renderCuentas();render();toast('Datos borrados');},
};
ACT.pg=t=>{const st=PG[t.dataset.k];if(!st)return;st.p=+t.dataset.p;FZW.__pgGo=t.dataset.k;render();};
FZR.addEventListener('click',e=>{FZR.querySelectorAll('details.menu[open]').forEach(m=>{if(!m.contains(e.target)||e.target.closest('.mpanel button'))m.open=false;});const t=e.target.closest('[data-act]');if(t&&ACT[t.dataset.act]){e.preventDefault();if(t.dataset.back)FZW.__pendBack=true;if(t.dataset.act==='ir-cruce'||t.dataset.act==='imp-banco'){FZW.__pendKind=null;FZW.__pendBack=false;if($('#dlg').open&&t.dataset.act==='ir-cruce')$('#dlg').close();}if(/fil$|limpiar$/.test(t.dataset.act))resetPg();ACT[t.dataset.act](t);}});
FZR.addEventListener('change',e=>{const t=e.target;
  if(t.dataset.pp){const k=t.dataset.pp;setProy(p=>{p.param=p.param||{};if(t.value==='')delete p.param[k];else p.param[k]=+t.value;});return;}
  if(t.dataset.pe){const [k,f]=t.dataset.pe.split('.');setProy(p=>{p.esc=p.esc||{};p.esc[k]=p.esc[k]||{};p.esc[k][f]=+t.value||0;});return;}
  if(t.dataset.pu){state.config.umbralMinimo=Math.max(0,+t.value||0);save();render();return;}
  if(t.dataset.ps){const k=t.dataset.ps;setProy(p=>{p.soc=p.soc||{};if(k.startsWith('cuota:')){p.soc.cuota=p.soc.cuota||{};p.soc.cuota[k.slice(6)]=Math.max(0,+t.value||0);}else p.soc[k]=k==='dia'?+t.value||28:t.value;});return;}
  if(t.dataset.pcomp){pComp=t.checked;render();return;}
  if(t.dataset.rdd){if(t.dataset.rdd==='desde')rDD=t.value;else rDH=t.value;return;}
  if(t.dataset.pgn){const st=PG[t.dataset.pgn];if(st){const first=st.p*st.n;st.n=+t.value;st.p=Math.floor(first/st.n);}FZW.__pgGo=t.dataset.pgn;render();return;}
  if(Object.keys(t.dataset).some(k=>/fil[a-z]?$/.test(k)))resetPg();
  if(t.id==='fileForms'&&t.files[0]){readFile(t.files[0],importForms);t.value='';return;}
  if(t.id==='fileBanco'&&t.files[0]){const name=t.files[0].name;readFile(t.files[0],rows=>{const l=parseTabla(rows);if(!l){toast('No encuentro las columnas Fecha, Cargo y Abono.',true);return;}preview(l,name);});t.value='';return;}
  if(t.id==='fileImg'&&t.files.length){ocrImages(t.files);t.value='';return;}
  if(t.id==='fileJson'&&t.files[0]){const r=new FileReader();r.onload=async ev=>{try{const p=JSON.parse(ev.target.result);if(!p.movimientos)throw 0;if(!await ask('Esto reemplaza los datos actuales. ¿Continuar?'))return;state=Object.assign({gastos:[],banco:[],links:[],caja:[]},p);save();closeDlg();renderCuentas();render();toast('Respaldo restaurado');}catch(x){toast('El archivo de respaldo no es válido',true)}};r.readAsText(t.files[0]);t.value='';return;}
  const k=t.dataset.chg;
  if(k==='rel'&&t.value){const b=bById(t.dataset.v);if(!b)return;if(t.value.startsWith('i:')){vincular(t.value.slice(2),b.id);toast('Vinculado');}else{setCls(b,t.value.slice(2));toast('Guardado: '+bancoEstado(b)[0]);}save();render();}
  else if(k==='cobdest'){setCobDest(t.dataset.v,t.value);save();render();toast('Destino del cobro: '+COB_D[t.value]);}
  else if(t.dataset.qsel){t.checked?selQ.add(t.dataset.qsel):selQ.delete(t.dataset.qsel);render();}
  else if(t.dataset.qselall){const ks=[...FZR.querySelectorAll('[data-qsel]')].map(x=>x.dataset.qsel);t.checked?ks.forEach(k=>selQ.add(k)):ks.forEach(k=>selQ.delete(k));render();}
  else if(k==='medio'&&t.value){const g=gById(t.dataset.v);if(g){g.medio=t.value;g.editado={...(g.editado||{}),medio:1};if(t.value!==EMP)state.links=state.links.filter(l=>l.g!==g.id);save();render();}}
  else if(t.dataset.vfil){fV[t.dataset.vfil]=t.value;render();}
  else if(t.dataset.mesc){setMesC(t.value);subC=null;render();}
  else if(t.dataset.bfil){fB[t.dataset.bfil]=t.value;render();}
  else if(t.dataset.bsel2){t.checked?selB.add(t.dataset.bsel2):selB.delete(t.dataset.bsel2);render();}
  else if(t.dataset.bselall){const ks=[...FZR.querySelectorAll('[data-bsel2]')].map(x=>x.dataset.bsel2);t.checked?ks.forEach(k=>selB.add(k)):ks.forEach(k=>selB.delete(k));render();}
  else if(t.dataset.pfil){fP[t.dataset.pfil]=t.value;render();}
  else if(t.dataset.cajag){const g=gById(t.dataset.cajag);if(g){g.cajaId=t.value;g.editado={...(g.editado||{}),cajaId:1};save();render();toast('Gasto movido a '+(cajaById(t.value)?.nombre||'la caja'));}}
  else if(t.dataset.rsel){t.checked?rendSel.add(t.dataset.rsel):rendSel.delete(t.dataset.rsel);dlgRendir(t.dataset.caja,true);}
  else if(t.dataset.kfil){fK[t.dataset.kfil]=t.value;render();}
  else if(t.dataset.gfil){fG[t.dataset.gfil]=t.value;render();}
  else if(t.dataset.gsel){t.checked?selG.add(t.dataset.gsel):selG.delete(t.dataset.gsel);render();}
  else if(t.dataset.gselall){const ks=[...FZR.querySelectorAll('[data-gsel]')].map(x=>x.dataset.gsel);t.checked?ks.forEach(k=>selG.add(k)):ks.forEach(k=>selG.delete(k));render();}
  else if(t.dataset.wfil){fW[t.dataset.wfil]=t.value;render();}
  else if(t.dataset.wsel){t.checked?selW.add(t.dataset.wsel):selW.delete(t.dataset.wsel);render();}
  else if(t.dataset.wselall){const ks=[...FZR.querySelectorAll('[data-wsel]')].map(x=>x.dataset.wsel);t.checked?ks.forEach(k=>selW.add(k)):ks.forEach(k=>selW.delete(k));render();}
  else if(t.dataset.vsel){t.checked?selV.add(t.dataset.vsel):selV.delete(t.dataset.vsel);render();}
  else if(t.dataset.vselall){const ks=[...FZR.querySelectorAll('[data-vsel]')].map(x=>x.dataset.vsel);t.checked?ks.forEach(k=>selV.add(k)):ks.forEach(k=>selV.delete(k));render();}
  else if(t.dataset.bsel){t.checked?busSel.add(t.dataset.bsel):busSel.delete(t.dataset.bsel);pintaBuscar();}
  else if(t.id==='busDias'){busDias=t.value;pintaBuscar();}
  else if(t.dataset.pbsel){t.checked?pbSel.add(t.dataset.pbsel):pbSel.delete(t.dataset.pbsel);pintaBuscarBanco();}
  else if(t.id==='pbDias'){pbDias=t.value;pintaBuscarBanco();}
  else if(t.dataset.dfil){fD[t.dataset.dfil]=t.value;render();}
  else if(t.dataset.dsel){t.checked?selD.add(t.dataset.dsel):selD.delete(t.dataset.dsel);render();}
  else if(t.dataset.dselall){const ks=[...FZR.querySelectorAll('[data-dsel]')].map(x=>x.dataset.dsel);t.checked?ks.forEach(k=>selD.add(k)):selD.clear();render();}
  else if(k==='repP'){repP=t.value;dlgReporte();}
  else if(k==='cls'){const b=bById(t.dataset.v);if(b){setCls(b,t.value);save();render();toast('Guardado: '+bancoEstado(b)[0]);}}
  else if(t.dataset.sc){const b=bById(t.dataset.sc);if(b){if(t.checked)b.sc=true;else delete b.sc;delete b.revisado;save();render();toast(t.checked?'Marcado sin comprobante':'Marcado con comprobante');}}
  else if(t.dataset.nota){const b=bById(t.dataset.nota);if(b){b.nota=t.value.trim();save();render();toast('Nota guardada');}}
  else if(t.dataset.fil&&t.tagName==='SELECT'||t.dataset.fil&&t.type==='date'){fil[t.dataset.fil]=t.value;render();}
  else if(t.dataset.filg&&t.tagName==='SELECT'){filG[t.dataset.filg]=t.value;render();}
});
FZR.addEventListener('input',e=>{const t=e.target;
  if(Object.keys(t.dataset).some(k=>/q$/.test(k))||t.dataset.fil==='q'||t.dataset.filg==='q')resetPg();
  const keep=(sel)=>{const p=t.selectionStart;render();const n=FZR.querySelector(sel);if(n){n.focus();n.setSelectionRange(p,p);}};
  if(t.dataset.fil==='q'){fil.q=t.value;keep('[data-fil="q"]');}
  if(t.dataset.filg==='q'){filG.q=t.value;keep('[data-filg="q"]');}
  if(t.dataset.dq){fD.q=t.value;keep('[data-dq]');}
  if(t.dataset.vq){fV.q=t.value;keep('[data-vq]');}
  if(t.dataset.bq){fB.q=t.value;keep('[data-bq]');}
  if(t.dataset.pq){fP.q=t.value;keep('[data-pq]');}
  if(t.dataset.kq){fK.q=t.value;keep('[data-kq]');}
  if(t.dataset.gq){fG.q=t.value;keep('[data-gq]');}
  if(t.dataset.wq){fW.q=t.value;keep('[data-wq]');}
  if(t.id==='pbQ'){pbQ=t.value;const p=t.selectionStart;pintaBuscarBanco();const n=$('#pbQ');if(n){n.focus();n.setSelectionRange(p,p);}}
  if(t.id==='busQ'){busQ=t.value;const p=t.selectionStart;pintaBuscar();const n=$('#busQ');if(n){n.focus();n.setSelectionRange(p,p);}}
  if(t.dataset.contado){state.config.contado=state.config.contado||{};state.config.contado[t.dataset.contado]=t.value===''?null:+t.value;save();clearTimeout(FZW._ct);FZW._ct=setTimeout(render,800);}
});
FZR.addEventListener('submit',e=>{const f=e.target.dataset.form;if(!f)return;e.preventDefault();const d=Object.fromEntries(new FormData(e.target));
  if(f==='cfg'){state.config.saldoInicialBanco=r2(d.sb);state.config.saldoInicial=r2(d.so);state.config.umbralMinimo=r2(d.um);state.config.cuentas=d.cu.split(',').map(s=>s.trim()).filter(Boolean);if(!state.config.cuentas.length)state.config.cuentas=['Caja Chica'];state.config.socios=d.so2.split(',').map(s=>s.trim()).filter(Boolean);renderCuentas();toast('Configuración guardada');}
  if(f==='regla'){state.config.reglas=[...(state.config.reglas||[]),{texto:d.texto.trim(),cls:d.cls}];toast('Regla creada');}
  if(f==='caja'){const o=d.origen||'otro';state.caja.push({id:uid('C'),cajaId:d.cajaId||'',fecha:d.fecha,monto:r2(d.monto),origen:o.startsWith('socio:')?'socio':o,socio:o.startsWith('socio:')?o.slice(6):'',obs:d.obs||''});toast(d.apertura?'Caja chica abierta':'Entrada registrada');}
  if(f==='banco'){const data={fecha:d.fecha,desc:d.desc.trim(),op:d.op||'',cargo:r2(d.cargo),abono:r2(d.abono),saldo:d.saldo===''?null:r2(d.saldo)};if(!data.cargo&&!data.abono){toast('Pon un cargo o un abono',true);return;}
    if(d.id){const b=bById(d.id);Object.assign(b,data);if(d.pos)ubicarBanco(b,d.pos);toast(d.pos?'Línea actualizada y movida':'Línea actualizada');}
    else{const nb={id:uid('B'),manual:true,cls:'',...data};ubicarBanco(nb,d.pos||'');toast('Línea agregada');}}
  if(f==='cajacfg'){const L=[...cajas()],v={nombre:d.nombre.trim(),custodio:(d.custodio||'').trim(),fondo:r2(d.fondo||0),limite:r2(d.limite||0)};
    if(d.id){const c=L.find(x=>x.id===d.id);Object.assign(c,v,{activa:!!d.activa});toast('Caja actualizada');}else{const id=uid('CJ');L.push({id,...v,activa:true});selCaja=id;toast('Caja creada'+(v.fondo?': entrega el efectivo del fondo':''));}
    state.config.cajas=L;}
  if(f==='arqueo'){const t=saldoCajaAl(d.cajaId,d.fecha);state.caja.push({id:uid('A'),kind:'arqueo',cajaId:d.cajaId,fecha:d.fecha,contado:r2(d.contado),teorico:t,obs:d.obs||''});const df=r2(d.contado-t);toast(Math.abs(df)<0.005?'Arqueo: cuadra':'Arqueo: '+(df<0?'faltan ':'sobran ')+fmt(Math.abs(df)));}
  if(f==='rendir'){const c=cajaById(d.cajaId);const P=cajaInfo(c).porRendir.filter(x=>rendSel.has(x.g.id));if(!P.length){toast('Elige al menos un gasto',true);return;}
    const rid=uid('R'),tot=r2(-P.reduce((a,x)=>a+x.v,0)),ok=r2(-P.filter(x=>compInfo(x.g).ok).reduce((a,x)=>a+x.v,0));let repId='';
    if(d.reponer&&+d.monto>0){const o=d.origen||'banco';repId=uid('C');state.caja.push({id:repId,cajaId:d.cajaId,fecha:d.fecha,monto:r2(d.monto),origen:o.startsWith('socio:')?'socio':o,socio:o.startsWith('socio:')?o.slice(6):'',obs:'Reposición por rendición del '+fdate(d.fecha)});}
    state.caja.push({id:rid,kind:'rendicion',cajaId:d.cajaId,fecha:d.fecha,gastos:P.map(x=>x.g.id),total:tot,okTotal:ok,repId});P.forEach(x=>x.g.rendido=rid);
    toast(`Rendidos ${P.length} gasto(s) · ${fmt(tot)}`+(repId?' · reposición registrada':''));}
  if(f==='gasto'&&!d.id){const ng={fecha:d.fecha,quien:(d.quien||'').trim(),desc:d.desc.trim(),monto:r2(d.monto),medio:d.medio,tipo:d.tipo.trim(),comp:d.comp,ruc:d.ruc.replace(/\D/g,''),rs:d.rs.trim(),serie:d.serie.trim().toUpperCase(),num:d.num.trim(),op:d.op.trim()};
    if(!ng.quien||!(ng.monto>0)){toast('Completa quién registró y el monto',true);return;}
    const ck=compKey(ng),dups=GA().filter(x=>(ck&&compKey(x)===ck)||(x.fecha===ng.fecha&&Math.abs((+x.monto)-ng.monto)<0.005&&norm(x.quien)===norm(ng.quien)));
    if(dups.length&&!d.confirm){dlgGasto('',{...ng,dupWarn:dups.map(x=>({fecha:x.fecha,desc:x.desc,monto:+x.monto,quien:x.quien}))});return;}
    const g={id:uid('G'),manual:true,creado:hoyISO(),...ng};if(d.cajaId&&ng.medio===CAJA)g.cajaId=d.cajaId;
    if(g.quien&&!state.config.socios.includes(g.quien)&&isSocio(g.medio))state.config.socios.push(g.quien);
    state.gastos.push(g);toast('Gasto agregado'+(g.medio===EMP?': ahora vincúlalo con su línea del banco':''));}
  else if(f==='gasto'){const g=gById(d.id);if(!g)return;const campos={fecha:d.fecha,desc:d.desc.trim(),monto:r2(d.monto),tipo:d.tipo.trim(),comp:d.comp,ruc:d.ruc.replace(/\D/g,''),rs:d.rs.trim(),serie:d.serie.trim().toUpperCase(),num:d.num.trim(),op:d.op.trim()};
    const ed=g.editado||{};let n=0;Object.entries(campos).forEach(([k,v])=>{if(String(g[k]??'')!==String(v)){g[k]=v;ed[k]=1;n++;}});
    if(d.cajaId&&d.cajaId!==cajaDeGasto(g)){g.cajaId=d.cajaId;ed.cajaId=1;n++;}
    if(d.medio!==g.medio){g.medio=d.medio;ed.medio=1;n++;if(d.medio!==EMP)state.links=state.links.filter(l=>l.g!==g.id);}
    if(n){g.editado=ed;g.editadoEl=hoyISO();toast('Gasto actualizado');}else toast('Sin cambios');}
  if(f==='cobdest'){setCobDest(d.id,d.d,d.d==='caja'?d.caja:'');toast('Cobro actualizado: '+COB_D[d.d]);}
  if(f==='prec'){const [tipo,concepto]=(d.tc||'egreso|Otros Egresos Operativos').split('|');if(!(+d.monto>0)){toast('Pon un monto',true);return;}if((d.frec==='unica'||d.frec==='anual')&&!d.fecha){toast('Indica la fecha',true);return;}
    const v={tipo,concepto,nombre:(d.nombre||'').trim()||concepto,monto:r2(d.monto),frec:d.frec,dia:+d.dia||30,fecha:d.fecha||'',desde:d.desde||'',hasta:d.hasta||''};
    setProy(p=>{p.listo=true;p.rec=p.rec||[];const r=d.id&&p.rec.find(x=>x.id===d.id);if(r){Object.assign(r,v);delete r.origen;delete r.nota;}else p.rec.push({id:uid('R'),activo:true,...v});},true);toast(d.id?'Actualizado':'Agregado a la proyección');}
  if(f==='bcls'){const b=bById(d.id);if(b){setCls(b,d.cls);if(d.cls.startsWith('k:')&&b.cargo>0){if(d.sc)b.sc=true;else delete b.sc;}b.nota=(d.nota||'').trim();toast('Guardado: '+bancoEstado(b)[0]);}}
  if(f==='cajaedit'){const c=state.caja.find(x=>x.id===d.id);if(c){const o=d.origen;Object.assign(c,{cajaId:d.cajaId||c.cajaId||'',fecha:d.fecha,monto:r2(d.monto),origen:o.startsWith('socio:')?'socio':o,socio:o.startsWith('socio:')?o.slice(6):'',obs:d.obs||''});toast('Entrada actualizada');}}
  save();closeDlg();render();});

FZR.addEventListener('paste',e=>{if(!$('#dlg').open||!$('#drop'))return;const f=[...(e.clipboardData?.items||[])].filter(i=>i.type.startsWith('image/')).map(i=>i.getAsFile());if(f.length){e.preventDefault();ocrImages(f);}});
FZR.addEventListener('dragover',e=>{if(e.target.closest&&e.target.closest('#drop')){e.preventDefault();e.target.closest('#drop').classList.add('over');}});
FZR.addEventListener('dragleave',e=>{const d=e.target.closest&&e.target.closest('#drop');if(d)d.classList.remove('over');});
FZR.addEventListener('drop',e=>{const d=e.target.closest&&e.target.closest('#drop');if(!d)return;e.preventDefault();d.classList.remove('over');ocrImages(e.dataTransfer.files);});
FZR.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.id==='drop'){e.preventDefault();$('#fileImg').click();}});
setTipo('egreso'); render(); initDB();
return {refresh(){try{render();}catch(e){console.error(e);}}};
}
})();
