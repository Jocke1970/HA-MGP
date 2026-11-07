/* MotoGP Next UI preview: bundled after lap-stats. Read-only; no new HA resource. */
(() => {
  'use strict';
  const OVERVIEW='ha-motogp-next-overview-card';
  const TIMING='ha-motogp-next-timing-card';
  const REQUIRED='0.2.0-split.2';
  const BUILD='ui-preview-20261108-02';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const valid=v=>v!==null&&v!==undefined&&!['','unknown','unavailable','none','null','hidden'].includes(String(v).trim().toLowerCase());
  const cat=v=>{const m=/moto\s*(gp|2|3|e)/i.exec(String(v||''));return m?({gp:'MotoGP','2':'Moto2','3':'Moto3',e:'MotoE'})[m[1].toLowerCase()]:String(v||'');};
  // Country codes originate from the feed. Unknown codes are not guessed.
  const countryFlag=value=>{
    const raw=String(value||'').trim().toUpperCase();
    const codes={ITA:'IT',SPA:'ES',ESP:'ES',AUS:'AU',FRA:'FR',GBR:'GB',JPN:'JP',
      NED:'NL',BEL:'BE',CZE:'CZ',COL:'CO',INA:'ID',IDN:'ID',ARG:'AR',BRA:'BR',
      USA:'US',TUR:'TR',THA:'TH',GER:'DE',POR:'PT',RSA:'ZA',ZAF:'ZA',SUI:'CH',
      AUT:'AT',FIN:'FI',DEN:'DK',SWE:'SE',IRL:'IE',UKR:'UA',POL:'PL',CAN:'CA',
      NZL:'NZ',MAL:'MY',MAS:'MY',IND:'IN',CHN:'CN',KOR:'KR',PHI:'PH',PHL:'PH',
      MEX:'MX',HUN:'HU',SVK:'SK',CRO:'HR',HRV:'HR',ROU:'RO',ROM:'RO',
      VEN:'VE',ECU:'EC',CHI:'CL',CHL:'CL',PER:'PE',URU:'UY'};
    const iso=/^[A-Z]{2}$/.test(raw)?raw:codes[raw];
    return iso?String.fromCodePoint(...Array.from(iso,c=>127397+c.charCodeAt(0))):'';
  };
  const riderFlag=value=>{
    const flag=countryFlag(value);
    return flag?'<span class="mgp-rider-flag" role="img" aria-label="Nation: '+esc(String(value).toUpperCase())+'">'+flag+'</span>':'';
  };
  // Local vector marks are an interim graphic until verified original logo assets are located.
  const classMark=value=>{
    const name=String(value||'');
    if(!['MotoGP','Moto2','Moto3'].includes(name))return esc(name);
    return '<svg class="mgp-class-mark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 146 34" role="img" aria-label="'+name+'">'+
      '<text x="8" y="26" fill="currentColor" font-size="28" font-family="Arial,Helvetica,sans-serif" font-style="italic" font-weight="900" letter-spacing="-2.2" transform="skewX(-8)">'+name+'</text></svg>';
  };
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
    .cats{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;align-items:stretch}
    .cats .cat{min-width:0;min-height:52px;display:flex;align-items:center;justify-content:center;gap:6px}
    .mgp-all-mark{font-size:15px;font-weight:900;letter-spacing:.04em}
    @media(max-width:480px){.cats{grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}.cats .cat{min-height:45px}}
    .np-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding:10px 12px}
    .mgp-class-mark{display:block;width:min(100%,146px);height:31px;overflow:visible}
    .mgp-rider-flag{display:inline-block;vertical-align:-.08em;line-height:1;margin-right:6px;font-size:15px;white-space:nowrap}
    .nt-person-text .mgp-rider-flag{font-size:15px}
    @media(max-width:480px){.np-tabs{gap:5px;padding:8px}.mgp-class-mark{height:24px}.mgp-rider-flag{font-size:13px}}
    .np-tab{border:1px solid var(--divider-color,#ddd);background:transparent;border-radius:13px;padding:7px 9px;color:inherit;font:inherit;font-size:11px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;min-height:41px}
    .np-tab[aria-selected=true]{border-color:#0099dc;background:rgba(0,153,220,.12)}
    /* Compact leaderboard rather than a full-width spreadsheet. */
    .np-card{container-type:inline-size}
    .np-standings{width:100%;table-layout:fixed;border-spacing:0;border-collapse:separate;font-size:12px}
    .np-standings th,.np-standings td{padding:11px 13px;border-top:1px solid var(--divider-color,#ddd);text-align:left;vertical-align:middle}
    .np-standings thead th{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.055em;
      color:var(--secondary-text-color)}
    .np-standings tbody tr{transition:background-color .15s ease}
    .np-standings tbody tr:hover{background:var(--secondary-background-color,rgba(127,127,127,.045))}
    .np-standings tbody tr:first-child{background:rgba(197,153,53,.055)}
    .np-standings th:first-child{width:64px}
    .np-standing-num{width:70px;white-space:nowrap;text-align:center!important}
    .np-standing-rank{display:inline-flex;align-items:center;justify-content:center;min-width:30px;height:30px;
      border:1px solid transparent;border-radius:9px;font-size:12px;font-weight:900;
      font-variant-numeric:tabular-nums}
    .np-standing-rank.top-1{background:rgba(192,148,30,.12);border-color:rgba(192,148,30,.25);color:var(--primary-text-color)}
    .np-standing-rank.top-2{background:rgba(125,139,156,.12);border-color:rgba(125,139,156,.22)}
    .np-standing-rank.top-3{background:rgba(170,107,58,.11);border-color:rgba(170,107,58,.20)}
    .np-standing-number{display:inline-block;font-size:12px;font-weight:850;
      padding:5px 7px;border-radius:7px;background:var(--secondary-background-color,rgba(127,127,127,.075))}
    .np-standing-person{display:flex;align-items:center;gap:11px;min-width:0}
    .np-standing-color{display:inline-block;flex:none;width:5px;height:39px;border-radius:4px;
      background:var(--divider-color,#b4b4b4)}
    .np-standing-driver{min-width:0;display:flex;flex-direction:column;gap:5px}
    .np-standing-driver strong{font-size:13px;line-height:1.15;font-weight:850;overflow-wrap:anywhere}
    .np-standing-driver small{font-size:10.5px;color:var(--secondary-text-color);line-height:1.25;overflow-wrap:anywhere}
    .np-standing-visual{width:30%}
    .np-standing-track{height:9px;width:100%;box-sizing:border-box;border-radius:99px;
      border:1px solid var(--divider-color,rgba(127,127,127,.24));
      background:var(--secondary-background-color,rgba(127,127,127,.13));overflow:hidden}
    .np-standing-fill{display:block;height:100%;border-radius:99px;max-width:100%;
      background:var(--divider-color,#b4b4b4)}
    .np-standing-points{width:115px;text-align:right!important;font-variant-numeric:tabular-nums}
    .np-standing-score{display:flex;flex-direction:column;align-items:flex-end;gap:4px}
    .np-standing-score strong{font-size:14px;line-height:1.1;font-weight:900}
    .np-standing-score small{font-size:9px;font-weight:750;color:var(--secondary-text-color);
      letter-spacing:.01em;white-space:nowrap}
    @container (max-width:760px){
      .np-standings .np-standing-visual{display:none}
      .np-standings th:first-child{width:52px}
      .np-standing-num{width:55px}
      .np-standing-points{width:90px}
      .np-standings th,.np-standings td{padding:9px 9px}
      .np-standing-driver strong{font-size:12px}
    }
    @container (max-width:430px){
      .np-standings th:first-child{width:39px}
      .np-standing-num{width:45px}
      .np-standing-points{width:67px}
      .np-standings th,.np-standings td{padding:8px 5px}
      .np-standing-person{gap:6px}
      .np-standing-color{width:4px;height:36px}
      .np-standing-driver strong{font-size:11px}
      .np-standing-driver small{font-size:9px}
      .np-standing-number{font-size:10px;padding:4px 3px}
      .np-standing-rank{min-width:26px;height:27px;font-size:11px}
      .np-standing-score strong{font-size:12px}
      .np-standing-score small{font-size:8px}
    }
    .np-empty{padding:13px;color:var(--secondary-text-color);font-size:12px}
    .np-top-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}
    .np-hide-row{display:flex;justify-content:flex-end;padding:7px 12px}
    .np-show-button{display:inline-flex;align-items:center;justify-content:center;gap:6px;
      padding:7px 12px;border:1px solid var(--divider-color,#ddd);border-radius:18px;
      font:inherit;font-size:12px;font-weight:800;cursor:pointer;background:transparent;color:inherit}
    .np-show-button[aria-expanded=true]{border-color:var(--primary-color,#039be5);
      background:rgba(0,153,220,.1)}
    .np-grid.note{grid-template-columns:repeat(2,minmax(0,1fr))}
    @media(max-width:600px){.np-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.np-note{font-size:10px}}
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
      // The rider-lap popup extension can install before this UI extension.
      // It adds safe data-* / accessibility attributes to <div class="nt-row">.
      // Match both plain and enriched opening tags; never silently skip the
      // entire row (which hides the per-rider fastest-lap and position details).
      const riderStart=/<div class="nt-row(?: unclassified)?"(?:\s[^>]*)?>/;
      const parts=('\u0000'+html).split(/(?=<div class="nt-row(?: unclassified)?"(?:\s[^>]*)?>)/);
      html=parts.map((row,i)=>{
        if(!i||!riderStart.test(row.slice(0,400)))return row;
        const r=this._snapshot.riders[n++];if(!r)return row;
        if(r.nation)row=row.replace('<span class="nt-person-text"><b>',
          '<span class="nt-person-text"><b>'+riderFlag(r.nation));
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
      if(standings){this._standingOpen=!this._standingOpen;if(this._standingOpen)this._scheduleOpen=false;this._render();return;}
      const schedule=target?.closest?.('[data-motogp-schedule-toggle]');
      if(schedule){this._scheduleOpen=!this._scheduleOpen;if(this._scheduleOpen)this._standingOpen=false;this._render();return;}
      const tab=target?.closest?.('[data-motogp-standing]');
      if(tab){this._standingTab=tab.getAttribute('data-motogp-standing');this._render();return;}
      return oldClick.call(this,e);
    };
    const oldSchedule=Overview.prototype._schedule;
    Overview.prototype._schedule=function(race,now) {
      const html=oldSchedule.call(this,race,now);
      // Preserve native filter attributes/click handling; only replace visible marks.
      const formatted=html.replace(/(<button type="button" class="cat" data-category=")(MotoGP|Moto2|Moto3)("[^>]*>)(?:MotoGP|Moto2|Moto3)(<\/button>)/g,
        (_full,start,name,end,close)=>start+name+end+classMark(name)+close)
        .replace(/(<button type="button" class="cat" data-category="Total"[^>]*>)Total(<\/button>)/g,
          '$1<span class="mgp-all-mark">🏁 ALL</span>$2');
      if(!this._live||this._spoiler())return formatted;
      const open=this._scheduleOpen===true;
      const control='<section class="panel" aria-label="Helgens schema">'+
        '<div class="np-heading"><span>🗓️ Helgens schema</span>'+
        '<button type="button" class="np-show-button" data-motogp-schedule-toggle '+
        'aria-expanded="'+open+'">'+(open?'Dölj schema':'Visa schema')+'</button></div></section>';
      if(!open)return control;
      const header='<section class="panel">';
      const close='<div class="np-hide-row"><button type="button" class="np-show-button" '+
        'data-motogp-schedule-toggle aria-expanded="true">Dölj schema</button></div>';
      return formatted.includes(header)?formatted.replace(header,header+close):control+formatted;
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
        ` data-motogp-standing="${c}" role="tab" aria-label="${c}" aria-selected="${c===tab}">${classMark(c)}</button>`).join('');
      const head=`<section class="np-card" aria-label="VM-ställning"><div class="np-heading">`+
        `<span>🏆 VM-ställning</span></div>`+
        `<div class="np-tabs" role="tablist" aria-label="VM-klass">${buttons}</div>`;
      // Use only the matching class from its own API category. The legacy
      // MotoGP key is a fallback for older backend versions, never for Moto2/3.
      const classes=state?.attributes?.standings_by_category;
      const rows=classes&&Object.prototype.hasOwnProperty.call(classes,tab)?
        classes[tab]:tab==='MotoGP'?state?.attributes?.standings:null;
      if(!Array.isArray(rows)||!rows.length)return head+`<div class="np-empty">${esc(tab)}: inväntar verifierad klassvis data från backend.</div></section>`;
      const note='<p class="np-note" style="padding:11px 13px 13px">Senast publicerad VM-ställning · uppdateras separat från livetiming.</p>';
      const shown=rows;
      const numericPoints=v=>valid(v)&&Number.isFinite(Number(v))&&Number(v)>=0?Number(v):null;
      const leader=Math.max(0,...shown.map(r=>numericPoints(r.points)??0));
      const formatted=n=>String(Math.round(n*100)/100).replace('.',',');
      const leaderboard=shown.map(r=>{
        const rank=Number(r.position);
        const podium=Number.isInteger(rank)&&rank>=1&&rank<=3?' top-'+rank:'';
        const accent=teamColor(r.team_color);
        const score=numericPoints(r.points);
        const proportion=leader>0&&score!==null?Math.max(0,Math.min(100,score/leader*100)):0;
        const gap=leader>0&&score!==null?Math.max(0,Math.round((leader-score)*100)/100):null;
        const gapText=gap===null?'':gap===0?'LEDARE':'−'+formatted(gap)+' p';
        const bar=leader>0&&score!==null?
          `<div class="np-standing-track" role="img" aria-label="Poäng relativt ledaren: ${esc(formatted(proportion))} procent">`+
          `<span class="np-standing-fill" style="width:${proportion.toFixed(1)}%;background:${accent}"></span></div>`:'';
        return `<tr><td><span class="np-standing-rank${podium}">${esc(r.position??'—')}</span></td>`+
          `<td class="np-standing-num"><span class="np-standing-number">${r.number===null||r.number===undefined||r.number===''?'—':'#'+esc(r.number)}</span></td>`+
          `<td><div class="np-standing-person"><span class="np-standing-color" style="background:${accent}"></span>`+
          `<span class="np-standing-driver"><strong>${riderFlag(r.nation)}${esc(r.rider||'—')}</strong><small>${esc(r.team||'Team saknas')}</small></span></div></td>`+
          `<td class="np-standing-visual">${bar}</td>`+
          `<td class="np-standing-points"><div class="np-standing-score"><strong>${esc(r.points??'—')}</strong><small>${esc(gapText)}</small></div></td></tr>`;
      }).join('');
      return head+'<table class="np-standings"><thead><tr><th>Pos</th><th class="np-standing-num">Nr</th>'+
        '<th>Förare / team</th><th class="np-standing-visual">Relativ poäng</th><th class="np-standing-points">Poäng</th></tr></thead><tbody>'+
        leaderboard+'</tbody></table>'+note+'</section>';
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
