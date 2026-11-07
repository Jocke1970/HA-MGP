/* MotoGP Next UI preview: bundled after lap-stats. Read-only; no new HA resource. */
(() => {
  'use strict';
  const OVERVIEW='ha-motogp-next-overview-card';
  const TIMING='ha-motogp-next-timing-card';
  const REQUIRED='0.2.0-split.2';
  const BUILD='ui-preview-20261107-03';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const valid=v=>v!==null&&v!==undefined&&!['','unknown','unavailable','none','null','hidden'].includes(String(v).trim().toLowerCase());
  const cat=v=>{const m=/moto\s*(gp|2|3|e)/i.exec(String(v||''));return m?({gp:'MotoGP','2':'Moto2','3':'Moto3',e:'MotoE'})[m[1].toLowerCase()]:String(v||'');};
  const session=v=>({RAC:'Race',SPR:'Sprint'})[String(v||'').toUpperCase()]||String(v||'');
  const number=v=>/^#?\d+$/.test(String(v??'').trim())?String(Number(String(v).replace('#',''))):'';
  // Use only colors explicitly supplied by the provider; neutral fallback.
  const teamColor=v=>{
    const c=String(v??'').trim();
    return /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(c)?
      c:'var(--divider-color,#b4b4b4)';
  };
  const lap=v=>valid(v)&&!/^0+(?:[.:']0+)?$/.test(String(v).trim())?String(v):'—';
  const style=`
    .nt-live-dot{display:inline-block;width:9px;height:9px;border-radius:50%;background:#e10600;margin-right:9px;box-shadow:0 0 0 3px rgba(225,6,0,.13)}
    .nt-table{min-width:1040px!important}
    .nt-row{grid-template-columns:44px minmax(230px,1.7fr) 58px minmax(145px,1fr) 92px 92px minmax(108px,.8fr)!important}
    .nt-heading>span:nth-child(2){text-align:left!important}
    .nt-lap-pair{display:flex;flex-direction:column;align-items:flex-end;gap:3px;min-width:0}
    .nt-lap-pair>small{font-size:10px;color:var(--secondary-text-color);font-weight:650;white-space:nowrap}
    .nt-lap-pair .nt-last-main{font-weight:850;white-space:nowrap}
    .nt-status-pair{display:flex;flex-direction:column;align-items:flex-end;gap:3px;min-width:0}
    .nt-status-pair small{font-size:10px;color:var(--secondary-text-color)}
    .nt-position-up{color:#16803b;font-weight:900}.nt-position-down{color:#dc2626;font-weight:900}
    .nt-position-zero{color:var(--secondary-text-color);font-weight:750}
    .nt-position-empty{color:var(--secondary-text-color)}
    .nt-session-record strong{color:var(--motogp-fastest-lap-color,var(--error-color,#b71c1c))}
    .np-card{background:var(--ha-card-background,var(--card-background-color,#fff));color:var(--primary-text-color);border:1px solid var(--divider-color,#ddd);border-radius:15px;overflow:hidden;min-width:0}
    .np-heading{display:flex;align-items:center;justify-content:space-between;gap:9px;border-bottom:1px solid var(--divider-color,#ddd);padding:11px 13px;font-size:14px;font-weight:900}
    .np-note{font-size:11px;color:var(--secondary-text-color);font-weight:550}
    .np-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;padding:10px}
    .np-slot{border:1px solid var(--divider-color,#ddd);border-radius:9px;padding:9px;min-width:0}
    .np-slot b{font-size:12px}.np-slot small{display:block;font-size:10px;color:var(--secondary-text-color);margin-top:3px;overflow:hidden;text-overflow:ellipsis}
    .np-tabs{display:flex;gap:7px;padding:10px 12px;flex-wrap:wrap}
    .np-tab{border:1px solid var(--divider-color,#ddd);background:transparent;border-radius:15px;padding:6px 12px;color:inherit;font:inherit;font-size:11px;font-weight:800;cursor:pointer}
    .np-tab[aria-selected=true]{border-color:#0099dc;background:rgba(0,153,220,.12)}
    .np-standings{width:100%;border-collapse:collapse;font-size:12px}
    .np-standings th,.np-standings td{padding:8px 13px;border-top:1px solid var(--divider-color,#ddd);text-align:left}
    .np-standings td:last-child,.np-standings th:last-child{text-align:right}
    .np-standing-num{width:64px;white-space:nowrap;text-align:center!important;font-weight:850}
    .np-standing-person{display:flex;align-items:center;gap:10px;min-width:0}
    .np-standing-color{display:inline-block;flex:none;width:4px;height:33px;border-radius:3px;background:var(--divider-color,#b4b4b4)}
    .np-standing-driver{min-width:0;display:flex;flex-direction:column;gap:3px}
    .np-standing-driver strong{font-size:12px;line-height:1.2;overflow-wrap:anywhere}
    .np-standing-driver small{font-size:10px;color:var(--secondary-text-color);line-height:1.3;overflow-wrap:anywhere}
    .np-standing-points{font-variant-numeric:tabular-nums;font-weight:850}
    .np-empty{padding:13px;color:var(--secondary-text-color);font-size:12px}
    .np-top-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}
    .np-hide-row{display:flex;justify-content:flex-end;padding:7px 12px}
    .np-show-button{display:inline-flex;align-items:center;justify-content:center;gap:6px;
      padding:7px 12px;border:1px solid var(--divider-color,#ddd);border-radius:18px;
      font:inherit;font-size:12px;font-weight:800;cursor:pointer;background:transparent;color:inherit}
    .np-show-button[aria-expanded=true]{border-color:var(--primary-color,#039be5);
      background:rgba(0,153,220,.1)}
    .np-grid.note{grid-template-columns:repeat(2,minmax(0,1fr))}
    @media(max-width:600px){.np-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.np-note{font-size:10px}
      .np-standings th,.np-standings td{padding:8px 7px}
      .np-standing-num{width:44px}
      .np-standing-person{gap:6px}
      .np-standing-driver strong{font-size:11px}
      .np-standing-driver small{font-size:9px}}
  `;
  function ensureStyle(card) {
    if(!card.shadowRoot||card.shadowRoot.querySelector('[data-motogp-ui-preview]'))return;
    const s=document.createElement('style');s.setAttribute('data-motogp-ui-preview','');s.textContent=style;
    card.shadowRoot.appendChild(s);
  }
  // One grid entry for one number only. Refuse duplicates rather than attributing a
  // rider's start position to the wrong competitor or another class.
  function startPosition(card,r) {
    const snap=card._snapshot,live=card._live;
    if(!live||!snap||!['Race','Sprint'].includes(session(snap.name)))return null;
    if(snap.category!==live.category||session(snap.name)!==session(live.name))return null;
    const race=card._hass?.states?.[card._ids.race],a=race?.attributes||{};
    const grids=a.start_grids||{};
    const grid=grids[snap.category],num=number(r.number),position=Number(r.position);
    if(!Array.isArray(grid)||!num||!Number.isInteger(position)||position<=0)return null;
    const candidates=grid.filter(x=>number(x?.number)===num);
    if(candidates.length!==1)return null;
    const start=Number(candidates[0].position);
    if(!Number.isInteger(start)||start<=0||grid.filter(x=>Number(x?.position)===start).length!==1)return null;
    return start-position;
  }
  // The old lap cell can include nested PB spans. Find its balanced closing tag
  // instead of matching against a regex that truncates the PB badge.
  function lapCellRange(row,r) {
    const count=Number(r.num_lap),shown=Number.isFinite(count)&&count>0?String(r.num_lap):'—';
    const anchor=`</span></span><span>${esc(shown)}</span>`;
    const offset=row.indexOf(anchor);
    if(offset<0)return null;
    const begin=row.indexOf('<span',offset+anchor.length);
    if(begin<0)return null;
    const tags=/<\/?span\b[^>]*>/g;tags.lastIndex=begin;
    let depth=0,match;
    while((match=tags.exec(row))) {
      depth+=match[0].startsWith('</')?-1:1;
      if(depth===0)return {begin,end:tags.lastIndex};
    }
    return null;
  }
  function install() {
    const Overview=customElements.get(OVERVIEW),Timing=customElements.get(TIMING);
    if(Overview?.buildInfo?.version!==REQUIRED||Timing?.buildInfo?.version!==REQUIRED) {
      console.error(`[MotoGP UI preview] Expected ${REQUIRED}; no changes`);return;
    }
    if(Timing.prototype._motogpUiPreview)return;
    const oldTiming=Timing.prototype._timing;
    Timing.prototype._timing=function() {
      let html=oldTiming.call(this);
      ensureStyle(this);
      if(this._spoiler()||!this._snapshot?.riders?.length||this._snapshot.day!==this._today)return html;
      if(this._live)html=html.replace('<span class="nt-label">🏁 ',
        '<span class="nt-label"><span class="nt-live-dot" aria-label="Live"></span>');
      // In the single-file lap-stats addon the lightning bolt only denotes
      // a session record; personal-best labels remain unchanged.
      html=html.replace(/⚡/g,'⏱');
      html=html.replace('<span>SENASTE</span>','<span>SENASTE VARV</span>')
        .replace('<span>Δ FRAMFÖR</span>','<span>FRAMFÖR</span>')
        .replace('<span>Δ LEDARE</span>','<span>LEDARE</span>');
      let n=0;
      const parts=('\u0000'+html).split(/(?=<div class="nt-row(?: unclassified)?">)/);
      html=parts.map((row,i)=>{
        if(!i||!row.startsWith('<div class="nt-row'))return row;
        const r=this._snapshot.riders[n++];if(!r)return row;
        const range=lapCellRange(row,r);
        if(range) {
          const original=row.slice(range.begin,range.end),best=lap(r.best_lap_time);
          const cell=`<span class="nt-lap-pair"><span class="nt-last-main">${original}</span>`+
            `<small>Snabbaste: ${esc(best)}</small></span>`;
          row=row.slice(0,range.begin)+cell+row.slice(range.end);
        }
        const status=r.on_pit?'PIT':valid(r.status_name)?String(r.status_name):valid(r.status_id)?String(r.status_id):'—';
        const change=startPosition(this,r);
        const text=change===null?'—':change>0?`▲ +${change}`:change<0?`▼ −${Math.abs(change)}`:'= 0';
        const cl=change===null?'nt-position-empty':change>0?'nt-position-up':change<0?'nt-position-down':'nt-position-zero';
        const end=`<span>${esc(status)}</span></div>`;
        if(row.includes(end))row=row.replace(end,`<span class="nt-status-pair"><strong class="${cl}">${text}</strong>`+
          `<small>${esc(status)}</small></span></div>`);
        return row;
      }).join('').slice(1);
      return html;
    };
    const oldClick=Overview.prototype._click;
    Overview.prototype._click=function(e) {
      const target=e.target;
      const standings=target?.closest?.('[data-motogp-standings-toggle]');
      if(standings){this._standingOpen=!this._standingOpen;this._render();return;}
      const schedule=target?.closest?.('[data-motogp-schedule-toggle]');
      if(schedule){this._scheduleOpen=!this._scheduleOpen;this._render();return;}
      const tab=target?.closest?.('[data-motogp-standing]');
      if(tab){this._standingTab=tab.getAttribute('data-motogp-standing');this._render();return;}
      return oldClick.call(this,e);
    };
    const oldSchedule=Overview.prototype._schedule;
    Overview.prototype._schedule=function(race,now) {
      const html=oldSchedule.call(this,race,now);
      if(!this._live||this._spoiler())return html;
      const open=this._scheduleOpen===true;
      const control='<section class="panel" aria-label="Helgens schema">'+
        '<div class="np-heading"><span>🗓️ Helgens schema</span>'+
        '<button type="button" class="np-show-button" data-motogp-schedule-toggle '+
        'aria-expanded="'+open+'">'+(open?'Dölj schema':'Visa schema')+'</button></div></section>';
      if(!open)return control;
      const header='<section class="panel">';
      const close='<div class="np-hide-row"><button type="button" class="np-show-button" '+
        'data-motogp-schedule-toggle aria-expanded="true">Dölj schema</button></div>';
      return html.includes(header)?html.replace(header,header+close):control+html;
    };
    function gridHtml(card,now) {
      if(card._spoiler())return '';
      const race=card._hass?.states?.[card._ids.race],a=race?.attributes||{};
      const schedule=Array.isArray(a.sessions_all)?a.sessions_all:Array.isArray(a.sessions)?a.sessions:[];
      const available=schedule.map(s=>{
        if(!s||!['Race','Sprint'].includes(session(s.name||s.type))||
          ['FINISHED','CANCELLED','CANCELED'].includes(String(s.status||'').toUpperCase()))return null;
        let d=null;
        if(valid(s.date_utc)) {
          const exact=new Date(String(s.date_utc));
          if(!Number.isNaN(exact.getTime()))d=exact;
        }
        if(!d) {
          const m=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(String(s.date||''));
          if(!m)return null;
          d=new Date(+m[1],+m[2]-1,+m[3],+m[4],+m[5]);
          if(Number.isNaN(d.getTime())||d.getFullYear()!==+m[1]||d.getMonth()!==+m[2]-1||d.getDate()!==+m[3]||d.getHours()!==+m[4]||d.getMinutes()!==+m[5])return null;
        }
        const delta=d.getTime()-now.getTime();
        return delta>=0&&delta<=15*60000?{s,d,delta,category:cat(s.category)}:null;
      }).filter(Boolean).sort((x,y)=>x.delta-y.delta)[0];
      if(!available)return '';
      const {s,category}=available,grids=a.start_grids||{},items=grids[category];
      const name=session(s.name||s.type);
      const head=`<section class="np-card" aria-label="Startgrid"><div class="np-heading">`+
        `<span>🏁 Startgrid · ${esc(category)} ${esc(name)}</span><span class="np-note">Från 15 min före start</span></div>`;
      if(!Array.isArray(items)||!items.length)return head+'<div class="np-empty">Startgriden är inte publicerad ännu.</div></section>';
      const rows=items.slice().sort((a,b)=>Number(a.position)-Number(b.position));
      return head+`<div class="np-grid">${rows.map(r=>`<div class="np-slot"><b>P${esc(r.position??'—')} · #${esc(r.number??'—')}</b>`+
        `<small>${esc(r.rider||'Okänd')}</small><small>${esc(r.team||'')}</small></div>`).join('')}</div></section>`;
    }
    function standingsHtml(card) {
      if(card._spoiler())return '';
      const tab=['Moto3','Moto2','MotoGP'].includes(card._standingTab)?card._standingTab:'MotoGP';
      const state=card._hass?.states?.['sensor.motogp_rider_standings'];
      const live=card._live;
      const buttons=['Moto3','Moto2','MotoGP'].map(c=>`<button type="button" class="np-tab"`+
        ` data-motogp-standing="${c}" role="tab" aria-selected="${c===tab}">${c}</button>`).join('');
      const head=`<section class="np-card" aria-label="VM-ställning"><div class="np-heading">`+
        `<span>🏆 VM-ställning</span><span class="np-note">Moto3 · Moto2 · MotoGP</span></div>`+
        `<div class="np-tabs" role="tablist" aria-label="VM-klass">${buttons}</div>`;
      // Use only the matching class from its own API category. The legacy
      // MotoGP key is a fallback for older backend versions, never for Moto2/3.
      const classes=state?.attributes?.standings_by_category;
      const rows=classes&&Object.prototype.hasOwnProperty.call(classes,tab)?
        classes[tab]:tab==='MotoGP'?state?.attributes?.standings:null;
      if(!Array.isArray(rows)||!rows.length)return head+`<div class="np-empty">${esc(tab)}: inväntar verifierad klassvis data från backend.</div></section>`;
      const note='<p class="np-note" style="padding:3px 13px 10px">Senast publicerad VM-ställning – uppdateras separat från livetiming.</p>';
      return head+'<table class="np-standings"><thead><tr><th>Pos</th><th class="np-standing-num">Nr</th>'+
        '<th>Förare / team</th><th>Poäng</th></tr></thead><tbody>'+
        rows.slice(0,10).map(r=>
          `<tr><td>${esc(r.position??'—')}</td><td class="np-standing-num">${r.number===null||r.number===undefined||r.number===''?'—':'#'+esc(r.number)}</td>`+
          `<td><div class="np-standing-person"><span class="np-standing-color" style="background:${teamColor(r.team_color)}"></span>`+
          `<span class="np-standing-driver"><strong>${esc(r.rider||'—')}</strong><small>${esc(r.team||'Team saknas')}</small></span></div></td>`+
          `<td class="np-standing-points">${esc(r.points??'—')}</td></tr>`
        ).join('')+'</tbody></table>'+note+'</section>';
    }
    const oldRender=Overview.prototype._render;
    Overview.prototype._render=function() {
      oldRender.call(this);ensureStyle(this);
      if(!this._hass)return;
      const view=this.shadowRoot?.getElementById('app');if(!view)return;
      const marker='<div class="foot">';
      const content=gridHtml(this,new Date());
      view.innerHTML=view.innerHTML.includes(marker)?view.innerHTML.replace(marker,content+marker):view.innerHTML+content;
      if(this._spoiler())return;
      const open=this._standingOpen===true;
      const button='<div class="np-top-actions"><button type="button" class="np-show-button" '+
        'data-motogp-standings-toggle aria-expanded="'+open+'">'+
        '🏆 '+(open?'Dölj VM-ställning':'Visa VM-ställning')+'</button></div>';
      // The button lives at the event header, before the schedule. The standings
      // are on-demand and no longer push live timing below the fold.
      view.innerHTML=view.innerHTML.replace('</section>',button+'</section>');
      if(open){
        const standings=standingsHtml(this);
        view.innerHTML=view.innerHTML.replace('</section>', '</section>'+standings);
      }
    };
    Timing.prototype._motogpUiPreview=BUILD;
    Overview.prototype._motogpUiPreview=BUILD;
    console.info(`[MotoGP UI preview] ${BUILD} installed in the existing one-file Next resource`);
  }
  Promise.all([customElements.whenDefined(OVERVIEW),customElements.whenDefined(TIMING)]).then(install);
})();
