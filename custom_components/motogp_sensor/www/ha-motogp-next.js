/* MotoGP Next SINGLE Lovelace resource | build next-one-20261109-03 | read only. */
/* MotoGP Next: isolated frontend for motogp-test. No HA writes or service calls. */
(() => {
  'use strict';
  const TAG = 'ha-motogp-next-card';
  const VERSION = '0.2.0-dev.4';
  const BUILD = 'next-20260919-04';
  if (customElements.get(TAG)) {
    console.warn(`[${TAG}] Already registered. Reload the browser to load a changed JS resource.`);
    return;
  }
  const IDS = Object.freeze({
    race: 'sensor.motogp_next_race', session: 'sensor.motogp_current_session',
    status: 'sensor.motogp_session_status', riders: 'sensor.motogp_rider_positions',
    laps: 'sensor.motogp_race_lap_count', remaining: 'sensor.motogp_session_time_remaining',
    weather: 'sensor.motogp_track_weather', spoiler: 'switch.motogp_no_spoiler'
  });
  const WD = ['SÖNDAG','MÅNDAG','TISDAG','ONSDAG','TORSDAG','FREDAG','LÖRDAG'];
  const MONTH = ['JAN','FEB','MAR','APR','MAJ','JUN','JUL','AUG','SEP','OKT','NOV','DEC'];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const valid = value => value != null &&
    !['', 'unknown', 'unavailable', 'none', 'hidden', 'null'].includes(String(value).trim().toLowerCase());
  const cat = value => {
    const raw = String(value || '').trim();
    const match = /moto\s*(gp|2|3|e)/i.exec(raw);
    return match ? ({gp:'MotoGP','2':'Moto2','3':'Moto3',e:'MotoE'})[match[1].toLowerCase()] : raw;
  };
  const sess = value => ({RAC:'Race',SPR:'Sprint',PR:'Practice',WUP:'Warm Up'})[String(value || '').toUpperCase()] || String(value || '');
  const keyName = value => String(sess(value)).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const canon = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const pad = n => String(n).padStart(2, '0');
  const dayKey = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  // Prefer the backend-normalized UTC timestamp. Fall back to the legacy
  // circuit wall-clock value if timezone metadata could not be resolved.
  function parseWall(raw, utc) {
    if (valid(utc)) {
      const exact = new Date(String(utc));
      if (!Number.isNaN(exact.getTime())) {
        return {date:exact, day:dayKey(exact), time:`${pad(exact.getHours())}:${pad(exact.getMinutes())}`};
      }
    }
    const m = String(raw || '').match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (!m) return null;
    const date = new Date(+m[1], +m[2]-1, +m[3], +m[4], +m[5]);
    return Number.isNaN(date.getTime()) ? null :
      {date, day: `${m[1]}-${m[2]}-${m[3]}`, time: `${m[4]}:${m[5]}`};
  }
  const dayName = day => {
    const d = new Date(`${day}T12:00:00`);
    return `${WD[d.getDay()]} ${d.getDate()} ${MONTH[d.getMonth()]}`;
  };
  function dateRange(start, end) {
    const a = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(start||''));
    const b = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(end||''));
    if (!a || !b) return [start,end].filter(valid).join(' – ');
    if (a[1] === b[1] && a[2] === b[2]) return `${+a[3]}–${+b[3]} ${MONTH[+a[2]-1].toLowerCase()}`;
    return `${+a[3]} ${MONTH[+a[2]-1].toLowerCase()} – ${+b[3]} ${MONTH[+b[2]-1].toLowerCase()}`;
  }
  function sessionsFor(race) {
    const a = race?.attributes || {};
    const source = Array.isArray(a.sessions_all) ? a.sessions_all : Array.isArray(a.sessions) ? a.sessions : [];
    const start = String(a.date_start || '').slice(0,10), end = String(a.date_end || '').slice(0,10);
    return source.filter(s => s && parseWall(s.date, s.date_utc))
      .map(s => ({...s, _wall:parseWall(s.date, s.date_utc), _cat:cat(s.category || 'MotoGP'), _name:sess(s.name || s.type)}))
      .filter(s => (!start || s._wall.day >= start) && (!end || s._wall.day <= end))
      .sort((a,b) => a._wall.date - b._wall.date);
  }
  function reading(raw, unit) {
    if (!valid(raw)) return '—';
    const n = Number(String(raw).replace(',','.').replace(/\s*(°|º|C|%|celsius)\s*$/i,''));
    return Number.isFinite(n) && n !== 0 ? `${n}${unit}` : '—';
  }
  const active = st => ['I','S'].includes(String(st?.attributes?.session_status_id || '').toUpperCase()) || st?.state === 'In Progress';
  const finished = st => String(st?.attributes?.session_status_id || '').toUpperCase() === 'F' || st?.state === 'Finished';
  const explicitFinish = s => ['FINISHED','CANCELLED','CANCELED'].includes(String(s.status || '').toUpperCase());
  const sortedRiders = entity => Array.isArray(entity?.attributes?.riders) ?
    entity.attributes.riders.filter(r => r && typeof r === 'object').slice().sort((a,b) =>
      (Number(a.position)>0 ? Number(a.position) : 999) - (Number(b.position)>0 ? Number(b.position) : 999)) : [];
  const safeColor = raw => /^#?[0-9a-f]{6}$/i.test(String(raw || '')) ? `#${String(raw).replace('#','')}` : '#94a3b8';
  const nonzero = raw => { const n = Number(raw); return valid(raw) && Number.isFinite(n) && n > 0 ? n : null; };
  const clock = raw => {
    const n = nonzero(raw);
    return n === null ? '' : `${Math.floor(n/60)}:${pad(Math.floor(n%60))}`;
  };
  const lapTime = raw => !valid(raw) || /^0+(?:[.:']0+)?$/.test(String(raw).trim()) ? '—' : String(raw);
  // The calendar uses an unsponsored event name; live API often prepends a title sponsor.
  // Require agreement among live sensors, a substantial calendar-name match, exact class,
  // exact session and exactly one matching session in today's weekend schedule.
  function matchingLive(race, se, st, positions, today) {
    if (!active(st) || !valid(race?.state) || !valid(se?.state)) return null;
    const sa=se.attributes||{}, ta=st.attributes||{}, pa=positions?.attributes||{};
    const category=cat(sa.category), name=keyName(se.state);
    if (!category || !name || ![sa.event,ta.event,pa.event].every(valid) ||
        !valid(ta.category) || !valid(pa.category) ||
        !valid(ta.session_shortname) || !valid(pa.session_shortname)) return null;
    const events=[sa.event,ta.event,pa.event].map(canon), calendar=canon(race.state);
    if (events.some(x => x !== events[0]) || calendar.length < 8 ||
        !(events[0].includes(calendar) || calendar.includes(events[0]))) return null;
    if (cat(ta.category)!==category || cat(pa.category)!==category ||
        keyName(ta.session_shortname)!==name || keyName(pa.session_shortname)!==name ||
        (valid(sa.session_shortname) && keyName(sa.session_shortname)!==name)) return null;
    const ids=[sa.championship_id,ta.championship_id,pa.championship_id].filter(valid).map(String);
    if (new Set(ids).size > 1) return null;
    // Do not expose unbuffered raw live timing while requested TV-delay is not ready.
    const requested=nonzero(pa.tv_delay_seconds);
    if (requested && pa.tv_delay_ready === false) return null;
    const matches=sessionsFor(race).filter(s => s._wall.day===today && s._cat===category && keyName(s._name)===name);
    if (matches.length!==1) return null;
    return {key:`${calendar}|${today}|${category}|${name}|${matches[0].id || matches[0].date}`,
      name:sess(se.state), category};
  }
  function timingInfo(live, states, ids) {
    if (!live) return [];
    const remain=states[ids.remaining], laps=states[ids.laps];
    const now=nonzero(laps?.state), total=nonzero(laps?.attributes?.num_laps);
    const isRace=['RACE','SPRINT'].includes(String(live.name).toUpperCase());
    const out=[];
    if (isRace && total !== null) {
      if (now !== null) out.push(`Varv ${now}/${total}`);
      else out.push(`${total} varv`);
      if (now !== null) out.push(`${Math.max(0,total-now)} varv kvar`);
    } else {
      const countdown=clock(remain?.state);
      if (countdown) out.push(`${countdown} kvar`);
      if (isRace && now !== null) out.push(`Varv ${now}`);
    }
    // Informational only; do not interpolate the sensor value locally (TV spoiler risk).
    const delay=nonzero(states[ids.status]?.attributes?.tv_delay_effective_seconds);
    if (delay !== null) out.push(`TV-delay ${delay} s`);
    return out;
  }
  const CSS = `
    :host{display:block;min-width:0;color:var(--primary-text-color)}*{box-sizing:border-box}
    .root{display:grid;gap:12px;font-family:var(--primary-font-family,inherit)}
    .panel{background:var(--ha-card-background,var(--card-background-color,#fff));border:1px solid var(--divider-color,#ddd);border-radius:15px;overflow:hidden;min-width:0}
    .header{padding:16px;border-top:3px solid #e10600}.eyebrow{font-size:11px;font-weight:800;opacity:.75;letter-spacing:.06em}
    h2{margin:5px 0;font-size:23px;font-weight:900;color:var(--primary-text-color)}
    .sub{color:var(--secondary-text-color);font-size:12px;line-height:1.6}
    .row{display:flex;justify-content:space-between;align-items:center;gap:9px;flex-wrap:wrap}
    .head{display:flex;align-items:center;justify-content:space-between;padding:11px 13px;gap:10px;border-bottom:1px solid var(--divider-color,#ddd)}
    .head strong{font-size:14px}.muted{color:var(--secondary-text-color);font-size:11px}
    .cats{display:flex;gap:6px;flex-wrap:wrap;padding:10px 12px;border-bottom:1px solid var(--divider-color,#ddd)}
    button{font:inherit;color:inherit;cursor:pointer}.cat{border:1px solid var(--divider-color,#ddd);background:transparent;border-radius:20px;padding:7px 11px;font-weight:800;font-size:11px}
    .cat[selected]{background:rgba(0,153,220,.12);border-color:#0099dc;color:var(--primary-text-color)}
    .day{border-bottom:1px solid var(--divider-color,#ddd)}.day:last-child{border-bottom:0}
    .daybtn,.timingbtn{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;text-align:left;background:transparent;border:0;padding:12px;font-weight:800}
    .daybtn[aria-expanded=true]{background:rgba(0,153,220,.07)}.daybtn:hover,.timingbtn:hover{background:rgba(127,127,127,.06)}
    .daybtn.today{border-left:3px solid #e10600;padding-left:9px}.daybtn.today .today-tag{color:#e10600;font-size:10px}
    .daybtn .summary{font-size:11px;font-weight:500;color:var(--secondary-text-color);text-align:right}
    .tiles{padding:0 10px 10px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
    .tile{padding:9px;border:1px solid var(--divider-color,#ddd);border-radius:10px;min-width:0}
    .tile.done{opacity:.48;background:rgba(127,127,127,.065)}.tile.live{border-color:#e10600;background:rgba(225,6,0,.075)}
    .tile .name{font-size:12px;font-weight:800;margin-top:5px}.badge{font-size:10px;font-weight:800;color:#c27600}
    .badge.live{color:#e10600}.tile.done .badge{color:var(--secondary-text-color)}
    .weathergrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;padding:12px}
    .metric{text-align:center;min-width:0;padding:8px 4px;border-radius:9px;background:rgba(127,127,127,.055)}.metric b{display:block;font-size:16px;margin-top:4px}.metric span{font-size:10px;color:var(--secondary-text-color)}
    .empty{padding:14px;color:var(--secondary-text-color);font-size:12px}.riders{overflow-x:auto}
    .rider{display:grid;grid-template-columns:30px 4px minmax(125px,2fr) 45px 65px 65px 65px 60px;gap:9px;padding:8px 11px;align-items:center;min-width:640px;border-top:1px solid var(--divider-color,#ddd);font-size:11px}
    .rider.labels{font-weight:800;color:var(--secondary-text-color);font-size:10px}
    .rider .person{min-width:0}.rider .person b{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.rider .person small{display:block;color:var(--secondary-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .line{height:25px;border-radius:5px}.num{text-align:right;font-variant-numeric:tabular-nums}.status{color:#e10600;font-size:11px;font-weight:900}
    .timingheadinfo{display:flex;flex-direction:column;align-items:flex-end;gap:2px;margin-left:auto;font-size:12px;font-weight:800;font-variant-numeric:tabular-nums}
    .timingheadinfo small{font-size:10px;color:var(--secondary-text-color);font-weight:600}.timingtoggle{font-size:10px;color:var(--secondary-text-color);white-space:nowrap}
    .foot{text-align:right;font-size:10px;color:var(--secondary-text-color);padding:2px 5px}
    @media(max-width:600px){.timingbtn{gap:7px}.timingheadinfo{font-size:11px}.weathergrid{grid-template-columns:repeat(2,minmax(0,1fr))}h2{font-size:18px}}
    @media(max-width:420px){.tiles{grid-template-columns:1fr}}
  `;
  class MotoGPNext extends HTMLElement {
    constructor() {
      super();this.attachShadow({mode:'open'});
      this.shadowRoot.innerHTML=`<style>${CSS}</style><div id="app"></div>`;
      this._ids={...IDS};this._hass=null;this._refs=null;this._timer=null;
      this._filter='Total';this._dayOverrides=new Map();this._autoDays=new Set();
      this._today='';this._event='';this._timingManual=null;this._activeKey='';this._snapshot=null;this._live=null;
      this.shadowRoot.addEventListener('click',e=>this._click(e));
    }
    setConfig(config) {
      if (config?.type!==`custom:${TAG}`) throw new Error(`${TAG}: wrong card type`);
      this._ids={...IDS,...(config.entities||{})};this._refs=null;
      if (this._hass) this._render();
    }
    set hass(hass) {
      this._hass=hass;
      const refs=Object.values(this._ids).map(id=>hass.states[id]);
      if (!this._refs || refs.some((x,i)=>x!==this._refs[i])) {this._refs=refs;this._render();}
    }
    connectedCallback() {if (!this._timer) this._timer=setInterval(()=>this._render(),30000);if (this._hass)this._render();}
    disconnectedCallback() {if (this._timer)clearInterval(this._timer);this._timer=null;}
    _spoiler() {
      const states=this._hass?.states||{};
      return states[this._ids.spoiler]?.state==='on' ||
        [this._ids.session,this._ids.status,this._ids.riders].some(id =>
          states[id]?.state==='Hidden' || states[id]?.attributes?.spoiler_mode===true);
    }
    _expanded(day) {return this._dayOverrides.has(day)?this._dayOverrides.get(day):this._autoDays.has(day);}
    _click(e) {
      const button=e.target.closest('button');
      if (!button || !this.shadowRoot.contains(button))return;
      if (button.dataset.category!==undefined)this._filter=button.dataset.category;
      else if (button.dataset.day!==undefined)this._dayOverrides.set(button.dataset.day,!this._expanded(button.dataset.day));
      else if (button.dataset.timing!==undefined && !this._spoiler()) {
        const open=this._timingManual===null?Boolean(this._snapshot||this._live):this._timingManual;
        this._timingManual=!open;
      }
      this._render(); // All clicks local: never call a Home Assistant service.
    }
    _track(now,race) {
      const today=dayKey(now),event=`${race?.state||''}|${race?.attributes?.date_start||''}|${race?.attributes?.date_end||''}`;
      if (event!==this._event) {this._event=event;this._dayOverrides.clear();this._timingManual=null;this._snapshot=null;this._activeKey='';}
      if (today!==this._today) {
        this._today=today;this._dayOverrides.clear();this._timingManual=null;
        if (!active(this._hass?.states?.[this._ids.status]))this._snapshot=null;
      }
      this._live=null;
      if (this._spoiler()) {this._snapshot=null;this._activeKey='';this._timingManual=false;return;}
      const states=this._hass.states,se=states[this._ids.session],st=states[this._ids.status];
      const positions=states[this._ids.riders],live=matchingLive(race,se,st,positions,today);
      if (active(st)) {
        if (!live) {this._snapshot=null;this._activeKey='';this._timingManual=null;return;}
        if (live.key!==this._activeKey) {this._activeKey=live.key;this._timingManual=null;this._snapshot=null;}
        this._live=live;
        const riders=sortedRiders(positions);
        if (riders.length)this._snapshot={...live,day:today,riders};
      } else if (finished(st)&&this._snapshot) {
        const category=cat(se?.attributes?.category||st?.attributes?.category);
        if (valid(se?.state)&&category &&
          `${category}|${keyName(se.state)}`!==`${this._snapshot.category}|${keyName(this._snapshot.name)}`)this._snapshot=null;
      }
    }
    _schedule(race,now) {
      const all=sessionsFor(race),available=[...new Set(all.map(s=>s._cat))];
      if (this._filter!=='Total'&&!available.includes(this._filter))this._filter='Total';
      const sessions=all.filter(s=>this._filter==='Total'||s._cat===this._filter),st=this._hass.states[this._ids.status];
      const isLive=s=>Boolean(this._live)&&s._cat===this._live.category&&keyName(s._name)===keyName(this._live.name)&&s._wall.day===this._today;
      const past=s=>!isLive(s)&&(explicitFinish(s)|| (s._wall.date<now && (now-s._wall.date>=2*60*60*1000 || all.some(later=>later._wall.date>s._wall.date && later._wall.date<=now))));
      const current=all.filter(s=>s._wall.day===this._today);
      const tomorrow=dayKey(new Date(now.getFullYear(),now.getMonth(),now.getDate()+1));
      const hasTomorrow=all.some(s=>s._wall.day===tomorrow);
      const lastStart=current.length?Math.max(...current.map(s=>s._wall.date.getTime())):Infinity;
      const confirmedDone=current.length>0&&current.every(explicitFinish);
      const presumedDone=current.length>0&&now.getTime()>=lastStart+2*60*60*1000;
      this._autoDays=new Set(current.length?[this._today]:[]);
      if (hasTomorrow&&!active(st)&&(confirmedDone||presumedDone))this._autoDays.add(tomorrow);
      const next=sessions.find(isLive)||sessions.find(s=>s._wall.date>now&&!explicitFinish(s));
      let html=`<section class="panel"><div class="head"><strong>🗓️ Helgens schema</strong><span class="muted">${esc(this._filter)} · ${sessions.length} pass`+
        `${next?` · ${isLive(next)?'Pågår':'Nästa'}: ${esc(next._cat)} ${esc(next._name)} ${next._wall.time}`:''}</span></div>`;
      html+=`<div class="cats">${['Total',...available].map(c=>`<button type="button" class="cat" data-category="${esc(c)}" ${this._filter===c?'selected':''} aria-pressed="${this._filter===c}">${esc(c)}</button>`).join('')}</div>`;
      if (!sessions.length)return html+'<div class="empty">Inga pass i aktuell evenemangsdata för valt filter.</div></section>';
      const groups=new Map();
      for(const s of sessions) {if(!groups.has(s._wall.day))groups.set(s._wall.day,[]);groups.get(s._wall.day).push(s);}
      for(const [day,items] of groups) {
        const open=this._expanded(day),upcoming=items.find(isLive)||items.find(s=>s._wall.date>now&&!explicitFinish(s));
        const summary=upcoming?`${isLive(upcoming)?'Pågår':'Nästa'} ${upcoming._cat} ${upcoming._name} · ${upcoming._wall.time}`:
          items.every(explicitFinish)?'Klart':'Inga kommande starter';
        const todayTag=day===this._today?'<span class="today-tag"> · IDAG</span>':'';
        html+=`<div class="day"><button class="daybtn ${day===this._today?'today':''}" type="button" data-day="${day}" aria-expanded="${open}"><span>${dayName(day)}${todayTag}</span><span class="summary">${items.length} pass · ${esc(summary)} ${open?'⌃':'⌄'}</span></button>`;
        if(open)html+=`<div class="tiles">${items.map(s=>{
          const live=isLive(s),elapsed=past(s),status=String(s.status||'').toUpperCase();
          const label=live?'● LIVE':status==='FINISHED'?'✓ KLART':['CANCELLED','CANCELED'].includes(status)?'INSTÄLLT':elapsed?'TID PASSERAD':s._wall.date<now?'INVÄNTAR STATUS':'KOMMANDE';
          return `<div class="tile ${live?'live':elapsed?'done':''}"><div class="row"><strong>${s._wall.time}</strong><span class="badge ${live?'live':''}">${label}</span></div><div class="name">${esc(s._cat)} · ${esc(s._name)}</div></div>`;
        }).join('')}</div>`;
        html+='</div>';
      }
      return html+'</section>';
    }
    _weather() {
      const a=this._hass.states[this._ids.weather]?.attributes||{};
      const metrics=[['Luft',reading(a.air,'°C')],['Bana',reading(a.ground,'°C')],
        ['Luftfuktighet',reading(a.humidity,'%')],['Underlag',valid(a.track)&&String(a.track)!=='0'?String(a.track):'—']];
      const desc=valid(a.weather)&&String(a.weather)!=='0'?String(a.weather):'';
      const head='<section class="panel"><div class="head"><strong>🌤️ Banväder</strong><span class="muted">Senast rapporterat · inte livegaranti</span></div>';
      if(metrics.every(([,v])=>v==='—')&&!desc)return head+'<div class="empty">Inga banväderdata rapporterade ännu.</div></section>';
      return head+`<div class="weathergrid">${metrics.map(([label,value])=>`<div class="metric"><span>${esc(label)}</span><b>${esc(value)}</b></div>`).join('')}</div>`+
        `${desc?`<div class="sub" style="padding:0 12px 12px">${esc(desc)}</div>`:''}</section>`;
    }
    _timing() {
      if(this._spoiler())return '<section class="panel"><div class="head"><strong>🏁 Live timing</strong><span class="muted">Spoilerläge – dolt</span></div></section>';
      const states=this._hass.states,st=states[this._ids.status],live=this._live,snap=this._snapshot;
      const online=Boolean(live),name=online?live.name:snap?snap.name:'Ingen aktiv session';
      const category=online?live.category:snap?.category||'';
      const status=online?'● LIVE':active(st)?'VÄNTAR PÅ MATCHANDE DATA':snap?'SENASTE PASS':finished(st)?'AVSLUTAD':'VÄNTAR / OFFLINE';
      const open=this._timingManual===null?Boolean(snap||online):this._timingManual;
      const info=timingInfo(live,states,this._ids);
      const timingHead=info.length?`<span class="timingheadinfo"><span>${esc(info[0])}</span>${info.slice(1).map(v=>`<small>${esc(v)}</small>`).join('')}</span>`:'';
      let html=`<section class="panel"><button type="button" class="timingbtn" data-timing aria-expanded="${open}"><span>🏍️ ${esc(category)} ${esc(name)}<br><span class="status">${esc(status)}</span></span>${timingHead}<span class="timingtoggle">${open?'⌃ Dölj':'⌄ Visa'} förare</span></button>`;
      if(!open)return html+'</section>';
      if(!snap?.riders.length||(!online&&snap.day!==this._today))return html+'<div class="empty">Ingen säkerställd förardata för den aktuella sessionen ännu.</div></section>';
      html+='<div class="riders"><div class="rider labels"><span>Pos</span><span></span><span>Förare / team</span><span>Varv</span><span>Senaste</span><span>Ledare</span><span>Före</span><span>Status</span></div>';
      for(const r of snap.riders) {
        const p=Number(r.position),pos=p>0?p:'—',who=r.surname||r.shortname||r.firstname||'Okänd';
        const riderStatus=r.on_pit?'DEPÅ':valid(r.status_name)?r.status_name:valid(r.status_id)?r.status_id:'—';
        const firstGap=p===1?'LEAD':lapTime(r.gap_first);
        html+=`<div class="rider"><b>${esc(pos)}</b><span class="line" style="background:${safeColor(r.color)}"></span><span class="person"><b>${esc(who)} · #${esc(r.number??'—')}</b><small>${esc(r.team||r.bike||'')}</small></span>`+
          `<span class="num">${esc(nonzero(r.num_lap)??'—')}</span><span class="num">${esc(lapTime(r.last_lap_time))}</span><span class="num">${esc(firstGap)}</span>`+
          `<span class="num">${esc(p===1?'—':lapTime(r.gap_prev))}</span><span class="num">${esc(riderStatus)}</span></div>`;
      }
      return html+'</div></section>';
    }
    _render() {
      if(!this._hass)return;
      const now=new Date(),race=this._hass.states[this._ids.race],a=race?.attributes||{};
      this._track(now,race);
      const event=valid(race?.state)?race.state:'Inget evenemang tillgängligt';
      const meta=[a.circuit,a.country,a.date_start&&a.date_end?dateRange(a.date_start,a.date_end):''].filter(valid);
      this.shadowRoot.getElementById('app').innerHTML=`<div class="root"><section class="panel header"><div class="eyebrow">🏁 HA-MGP · 0.3.0-dev.56</div><h2>${esc(event)}</h2><div class="sub">${meta.map(esc).join(' · ')||'Väntar på evenemangsdata'}</div></section>`+
        this._schedule(race,now)+`<div class="root">${this._weather()}${this._timing()}</div>`+
        `<div class="foot">HA-MGP UI · 0.3.0-dev.56 · UI-preview</div></div>`;
    }
    getCardSize(){return 8;}
    getGridOptions(){return {columns:12,rows:'auto',min_columns:6};}
  }
  MotoGPNext.buildInfo=Object.freeze({version:VERSION,buildId:BUILD,tag:TAG});
  customElements.define(TAG,MotoGPNext);
  window.customCards=window.customCards||[];
  window.customCards.push({type:TAG,name:'MotoGP Next – isolerad dev',description:'JS-migrering för motogp-test.'});
  console.info(`[${TAG}] ${VERSION} / ${BUILD}`);
})();

;
/* MotoGP Next: two isolated HA cards; pinned dev.4 backend matching, independent layout.
 * No changes to the original desktop/mobile card, existing Next dev.4 or HA services. */
(() => {
  'use strict';
  const BASE_TAG = 'ha-motogp-next-card';
  const OVERVIEW_TAG = 'ha-motogp-next-overview-card';
  const TIMING_TAG = 'ha-motogp-next-timing-card';
  const BASE_VERSION = '0.2.0-dev.4';
  const VERSION = '0.2.0-split.2';
  const BUILD = 'split-20260919-02';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const pad = number => String(number).padStart(2, '0');
  const valid = value => value !== null && value !== undefined &&
    !['', 'unknown', 'unavailable', 'none', 'hidden', 'null'].includes(String(value).trim().toLowerCase());
  const positive = value => valid(value) && Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : null;
  const category = value => {
    const m = /moto\s*(gp|2|3|e)/i.exec(String(value || ''));
    return m ? ({gp:'MotoGP','2':'Moto2','3':'Moto3',e:'MotoE'})[m[1].toLowerCase()] : String(value || '');
  };
  const sessionName = value => ({SPR:'Sprint',RAC:'Race',PR:'Practice',WUP:'Warm Up'})[String(value || '').toUpperCase()] || String(value || '');
  const safeColor = value => /^#?[0-9a-f]{6}$/i.test(String(value || '')) ? `#${String(value).replace('#', '')}` : '#94a3b8';
  const numberText = value => positive(value) === null ? '—' : String(value);
  const lapText = value => !valid(value) || /^0+(?:[.:']0+)?$/.test(String(value).trim()) ? '—' : String(value);
  // Prefer backend-normalized UTC. Keep the legacy circuit-wall-time parser
  // only as a fallback when the backend could not resolve an event timezone.
  function parseStart(raw, utc) {
    if (valid(utc)) {
      const exact = new Date(String(utc));
      if (!Number.isNaN(exact.getTime())) return exact;
    }
    const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(String(raw || ''));
    if (!m) return null;
    const date = new Date(+m[1], +m[2]-1, +m[3], +m[4], +m[5]);
    if (Number.isNaN(date.getTime()) || date.getFullYear() !== +m[1] ||
        date.getMonth() !== +m[2]-1 || date.getDate() !== +m[3] ||
        date.getHours() !== +m[4] || date.getMinutes() !== +m[5]) return null;
    return date;
  }
  function nextPass(race, now, filter = 'Total') {
    const a = race?.attributes || {};
    const source = Array.isArray(a.sessions_all) ? a.sessions_all : Array.isArray(a.sessions) ? a.sessions : [];
    const start = String(a.date_start || '').slice(0, 10), end = String(a.date_end || '').slice(0, 10);
    return source.map(pass => {
      const date = parseStart(pass?.date, pass?.date_utc);
      return date && pass ? {date, pass, category:category(pass.category || 'MotoGP'),
        name:sessionName(pass.name || pass.type || ''),
        day:`${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`,
        time:`${pad(date.getHours())}:${pad(date.getMinutes())}`} : null;
    }).filter(item => item && (!start || item.day >= start) && (!end || item.day <= end) &&
      (filter === 'Total' || item.category === filter) && item.date.getTime() > now.getTime() &&
      !['FINISHED','CANCELLED','CANCELED'].includes(String(item.pass.status || '').toUpperCase()))
      .sort((a,b) => a.date-b.date)[0] || null;
  }
  function countdown(timestamp, now = Date.now()) {
    if (!Number.isFinite(timestamp)) return '—';
    const seconds = Math.ceil((timestamp-now)/1000);
    if (seconds < 0) return 'Starttid passerad · inväntar status';
    if (seconds === 0) return 'Startar nu';
    const h = Math.floor(seconds/3600), m = Math.floor(seconds%3600/60), s = seconds%60;
    return `${h ? `${h}:${pad(m)}` : String(m)}:${pad(s)} till start`;
  }
  const countdownHtml = item => item ?
    `<span class="next-countdown" data-next-start="${item.date.getTime()}">${esc(countdown(item.date.getTime()))}</span>` : '';
  function refreshCountdowns(root) {
    if (typeof root?.querySelectorAll !== 'function') return;
    for (const node of root.querySelectorAll('[data-next-start]')) {
      const timestamp = Number(node.getAttribute('data-next-start'));
      node.textContent = countdown(timestamp);
    }
  }
  const countdownStyles = `
    .next-countdown{font-variant-numeric:tabular-nums;font-weight:900;color:var(--primary-text-color)}
    .schedule-clock{display:inline-block;margin-left:8px;white-space:nowrap;color:#d97706}
  `;
  const timingStyles = `
    ${countdownStyles}
    .nt-card{background:var(--ha-card-background,var(--card-background-color,#fff));color:var(--primary-text-color);
      border:1px solid var(--divider-color,#ddd);border-radius:16px;overflow:hidden;min-width:0}
    .nt-head{display:flex;gap:18px;align-items:center;justify-content:space-between;width:100%;padding:14px 16px;
      border:0;background:transparent;text-align:left;color:inherit;font:inherit;cursor:pointer}
    .nt-head:hover{background:rgba(127,127,127,.06)}
    .nt-label{display:block;font-size:17px;font-weight:900;line-height:1.4}
    .nt-status{display:block;margin-top:4px;font-size:11px;font-weight:900;color:#e10600}
    .nt-status.finished{color:var(--secondary-text-color)}
    .nt-clock{display:flex;flex-direction:column;align-items:flex-end;gap:3px;font-size:13px;
      white-space:nowrap;font-weight:900;font-variant-numeric:tabular-nums}
    .nt-clock small{font-size:11px;font-weight:600;color:var(--secondary-text-color)}
    .nt-toggle{font-size:11px;color:var(--secondary-text-color);white-space:nowrap}
    .nt-scroll{overflow-x:auto;width:100%}.nt-table{min-width:920px;width:100%}
    .nt-row{display:grid;grid-template-columns:44px minmax(235px,1fr) 58px 94px 91px 91px 96px;
      gap:12px;min-height:52px;align-items:center;padding:9px 14px;border-top:1px solid var(--divider-color,#ddd);
      font-size:12px;font-variant-numeric:tabular-nums}
    .nt-heading{min-height:34px;font-size:10px;letter-spacing:.025em;font-weight:900;color:var(--secondary-text-color)}
    .nt-heading>span:nth-child(2){text-align:center}.nt-row>span:not(.nt-person){text-align:right}.nt-row>span:first-child{text-align:center}
    .nt-person{display:flex;min-width:0;align-items:center;gap:10px}.nt-color{height:31px;width:4px;flex:none;border-radius:3px}
    .nt-person-text{min-width:0}.nt-person-text b{display:block;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .nt-person-text small{display:block;color:var(--secondary-text-color);font-size:11px;
      white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .nt-pit{font-size:9px;color:#c27600;background:rgba(245,158,11,.12);border-radius:4px;padding:2px 4px}
    .nt-row.unclassified{opacity:.6}.nt-results{font-size:11px;font-weight:800;color:var(--secondary-text-color);padding:9px 14px}
    .nt-empty{padding:15px;color:var(--secondary-text-color);font-size:12px}
    .nt-q2{display:inline-block;margin-left:7px;color:#15803d;font-size:10px;font-weight:900;white-space:nowrap}
    .nt-q2-cut{padding:7px 14px;border-top:2px dashed #15803d;color:#15803d;font-size:11px;font-weight:900;letter-spacing:.02em}
    @media(max-width:680px){.nt-head{gap:8px;flex-wrap:wrap}.nt-label{font-size:14px}.nt-clock{font-size:12px}}
  `;
  function register() {
    const Base = customElements.get(BASE_TAG);
    if (!Base || Base.buildInfo?.version !== BASE_VERSION) {
      console.error(`[MotoGP Next Split] Requires ${BASE_TAG} ${BASE_VERSION}; no cards registered.`);
      return;
    }
    function refreshLiveClock(card) {
      if (!card._live || card._spoiler() || !card.shadowRoot?.querySelector) {card._clockSample=null;return;}
      const node=card.shadowRoot.querySelector('[data-live-remaining]');
      const state=card._hass?.states?.[card._ids.remaining];
      const delay=card._hass?.states?.[card._ids.riders]?.attributes;
      if (!node || !state || delay?.tv_delay_ready===false) {card._clockSample=null;return;}
      const seconds=positive(state.state);
      if (seconds===null) {card._clockSample=null;node.textContent='—';return;}
      const identity=[card._live.key,state.state,state.last_updated||state.last_changed||''].join('|');
      if (card._clockSample?.identity!==identity) card._clockSample={identity,seconds,at:Date.now()};
      const elapsed=Date.now()-card._clockSample.at;
      if (elapsed>90000) {node.textContent='— · inväntar data';return;}
      const left=Math.max(0,Math.ceil(card._clockSample.seconds-elapsed/1000));
      node.textContent=`${Math.floor(left/60)}:${pad(left%60)} kvar`;
    }
    class CountdownCard extends Base {
      constructor() {super();this._countTimer=null;}
      connectedCallback() {
        super.connectedCallback();
        if (!this._countTimer) this._countTimer=setInterval(()=>{refreshCountdowns(this.shadowRoot);refreshLiveClock(this);},1000);
      }
      disconnectedCallback() {
        super.disconnectedCallback();
        if (this._countTimer) clearInterval(this._countTimer);
        this._countTimer=null;
      }
    }
    class OverviewCard extends CountdownCard {
      constructor() {
        super();this.shadowRoot.innerHTML=this.shadowRoot.innerHTML.replace('</style>',`${countdownStyles}</style>`);
      }
      setConfig(config) {
        if (config?.type !== `custom:${OVERVIEW_TAG}`) throw new Error('Incorrect MotoGP overview card type');
        super.setConfig({...config,type:`custom:${BASE_TAG}`});
      }
      _timing() {return '';}
      _schedule(race,now) {
        const original=super._schedule(race,now);
        const next=nextPass(race,now,this._filter);
        if (!next) return original;
        const marker='<div class="head"><strong>🗓️ Helgens schema</strong><span class="muted">';
        if (!original.includes(marker)) return original;
        return original.replace(marker,marker+`<span class="schedule-clock">${countdownHtml(next)}</span> · `);
      }
      getGridOptions() {return {columns:12,rows:'auto',min_columns:6};}
    }
    class TimingCard extends CountdownCard {
      constructor() {
        super();this.shadowRoot.innerHTML=this.shadowRoot.innerHTML.replace('</style>',`${timingStyles}</style>`);
      }
      setConfig(config) {
        if (config?.type !== `custom:${TIMING_TAG}`) throw new Error('Incorrect MotoGP timing card type');
        super.setConfig({...config,type:`custom:${BASE_TAG}`});
      }
      _timing() {
        const states=this._hass.states;
        const race=states[this._ids.race];
        const now=new Date(), upcoming=nextPass(race,now);
        const live=this._live, status=states[this._ids.status]; let snap=this._snapshot;
        const spoiler=this._spoiler();
        // A passed start time does not establish a live or finished status.
        // Never inspect unapproved rider data to infer session state.
        const schedule=race?.attributes||{};
        const entries=Array.isArray(schedule.sessions_all)?schedule.sessions_all:
          Array.isArray(schedule.sessions)?schedule.sessions:[];
        const pending=entries.map(s=>({pass:s,date:parseStart(s?.date,s?.date_utc)}))
          .filter(x=>x.date && x.date<=now && x.date.toDateString()===now.toDateString() &&
            now-x.date<2*60*60*1000 &&
            !['FINISHED','CANCELLED','CANCELED'].includes(String(x.pass.status||'').toUpperCase()) &&
            !((status?.state==='Finished'||String(status?.attributes?.session_status_id||'').toUpperCase()==='F') &&
              category(status?.attributes?.category)===category(x.pass.category||'MotoGP') &&
              sessionName(status?.attributes?.session_shortname)===sessionName(x.pass.name||x.pass.type||'')))
          .sort((a,b)=>b.date-a.date)[0]||null;
        const started=pending && now-pending.date<15*60*1000?pending:null;
        const imminent=!live && upcoming && upcoming.date>now && upcoming.date.getTime()-now.getTime()<=15*60*1000;
        if (imminent && snap) {this._snapshot=null;this._activeKey='';snap=null;}
        const hasRiders=!spoiler && snap?.riders?.length && snap.day===this._today;
        const expanded=!spoiler && (this._timingManual===null ? Boolean(hasRiders || live) : this._timingManual);
        let title, statusText, clockHtml='';
        if (live && !spoiler) {
          title=`${live.category} · ${live.name}`;
          statusText='● LIVE';
          const lap=positive(states[this._ids.laps]?.state);
          const total=positive(states[this._ids.laps]?.attributes?.num_laps);
          const remaining=positive(states[this._ids.remaining]?.state);
          const isRace=/^(sprint|race)$/i.test(live.name);
          let major='';
          if (isRace && total) major=lap?`Varv ${lap}/${total} · ${Math.max(0,total-lap)} kvar`:`${total} varv`;
          else if (remaining) major=`${Math.floor(remaining/60)}:${pad(Math.floor(remaining%60))} kvar`;
          else if (lap) major=`Varv ${lap}`;
          const delay=positive(status?.attributes?.tv_delay_effective_seconds);
          clockHtml=`<span class="nt-clock">${major?`<span${!isRace&&remaining?' data-live-remaining':''}>${esc(major)}</span>`:''}`+
            `${delay?`<small>TV-delay ${delay} s</small>`:''}</span>`;
        } else if (started && !spoiler) {
          title=`Schemalagd: ${category(started.pass.category||'MotoGP')} · ${sessionName(started.pass.name||started.pass.type||'')}`;
          statusText='STARTTID PASSERAD · INVÄNTAR MATCHANDE DATA';
          clockHtml=`<span class="nt-clock"><span>${esc(pad(started.date.getHours())+':'+pad(started.date.getMinutes()))}</span>`+
            `${upcoming?`<small>Nästa: ${esc(upcoming.category)} ${esc(upcoming.name)} ${esc(upcoming.time)}</small>`:''}</span>`;
        } else if (upcoming) {
          title=`Nästa: ${upcoming.category} · ${upcoming.name}`;
          statusText=spoiler?'SPOILERLÄGE':hasRiders?'SENASTE PASS · EJ LIVE':'MELLAN PASSEN';
          clockHtml=`<span class="nt-clock"><span>${esc(upcoming.time)}</span>`+
            `<small>${countdownHtml(upcoming)}</small></span>`;
        } else {
          title=hasRiders?`${snap.category} · ${snap.name}`:'Ingen aktiv session';
          statusText=spoiler?'SPOILERLÄGE':hasRiders?'SENASTE PASS':'VÄNTAR / OFFLINE';
        }
        const textClass=live&&!spoiler?'':' finished';
        let html=`<section class="nt-card"><button type="button" class="nt-head" data-timing aria-expanded="${expanded}">`+
          `<span><span class="nt-label">🏁 ${esc(title)}</span><span class="nt-status${textClass}">${esc(statusText)}</span></span>`+
          `${clockHtml}<span class="nt-toggle">${expanded?'⌃ Dölj':'⌄ Visa'} förare</span></button>`;
        if (!expanded) return html+'</section>';
        if (!hasRiders) return html+'<div class="nt-empty">Ingen säkerställd förardata från det aktuella eller föregående passet.</div></section>';
        if (!live) html+=`<div class="nt-results">Senaste passets förardata: ${esc(snap.category)} · ${esc(snap.name)} (ej live)</div>`;
        html+='<div class="nt-scroll"><div class="nt-table"><div class="nt-row nt-heading"><span>POS</span><span>FÖRARE / TEAM</span><span>VARV</span><span>SENASTE</span><span>Δ FRAMFÖR</span><span>Δ LEDARE</span><span>STATUS</span></div>';
        const qCut=/^Q1$/i.test(String(snap.name||'')) ? (snap.category==='MotoGP'?2:['Moto2','Moto3'].includes(snap.category)?4:0):0;
        const qPositions=qCut?snap.riders.filter(r=>Number.isInteger(Number(r.position)) && Number(r.position)>0 && positive(r.num_lap)!==null && lapText(r.last_lap_time)!=='—').map(r=>Number(r.position)):[];
        const qReady=qCut>0 && qPositions.length>=qCut && Array.from({length:qCut},(_,i)=>i+1).every(p=>qPositions.filter(x=>x===p).length===1);
        for (const rider of snap.riders) {
          const p=positive(rider.position),who=rider.surname||rider.shortname||rider.firstname||'Okänd';
          const pit=Boolean(rider.on_pit);
          const riderStatus=pit?'PIT':valid(rider.status_name)?rider.status_name:valid(rider.status_id)?rider.status_id:'—';
          const prev=p===1?'—':lapText(rider.gap_prev);
          const first=p===1?'LEDARE':lapText(rider.gap_first);
          html+=`<div class="nt-row${p?'':' unclassified'}"><span>${esc(p??'—')}</span>`+
            `<span class="nt-person"><span class="nt-color" style="background:${safeColor(rider.color)}"></span>`+
            `<span class="nt-person-text"><b>${esc(who)} · #${esc(rider.number??'—')}`+
            `${pit?' <span class="nt-pit">PIT</span>':''}${qReady&&p&&p<=qCut?' <span class="nt-q2" title="Preliminärt vidare till Q2">Q2 ↑</span>':''}</b><small>${esc(rider.team||rider.bike||'')}</small></span></span>`+
            `<span>${esc(numberText(rider.num_lap))}</span><span>${esc(lapText(rider.last_lap_time))}</span>`+
            `<span>${esc(prev)}</span><span>${esc(first)}</span><span>${esc(riderStatus)}</span></div>`;
          if (qReady && p===qCut) html+='<div class="nt-q2-cut" role="note">Q2-GRÄNS · preliminärt</div>';
        }
        return html+'</div></div></section>';
      }
      _render() {
        if (!this._hass) return;
        const race=this._hass.states[this._ids.race];
        this._track(new Date(),race);
        this.shadowRoot.getElementById('app').innerHTML=`<div class="root">${this._timing()}</div>`;
      }
      getCardSize() {return 10;}
      getGridOptions() {return {columns:12,rows:'auto',min_columns:12};}
    }
    OverviewCard.buildInfo=Object.freeze({version:VERSION,buildId:BUILD,tag:OVERVIEW_TAG});
    TimingCard.buildInfo=Object.freeze({version:VERSION,buildId:BUILD,tag:TIMING_TAG});
    if (!customElements.get(OVERVIEW_TAG)) customElements.define(OVERVIEW_TAG,OverviewCard);
    if (!customElements.get(TIMING_TAG)) customElements.define(TIMING_TAG,TimingCard);
    window.customCards=window.customCards||[];
    for (const [tag,name] of [[OVERVIEW_TAG,'MotoGP Next – schema och väder'],[TIMING_TAG,'MotoGP Next – separat live timing']]) {
      if (!window.customCards.some(card=>card.type===tag))
        window.customCards.push({type:tag,name,description:`MotoGP Next split · ${VERSION}`});
    }
    console.info(`[MotoGP Next Split] ${VERSION} / ${BUILD}; dev.4 untouched`);
  }
  if (customElements.get(BASE_TAG)) register();
  else customElements.whenDefined(BASE_TAG).then(register);
})();

;
/* MotoGP Next split.2 additive, reversible test-only visual enhancements.
 * Requires dev.4 base and split.2; never changes the original/mobile cards. */
(() => {
  'use strict';
  const OVERVIEW = 'ha-motogp-next-overview-card';
  const TIMING = 'ha-motogp-next-timing-card';
  const REQUIRED = '0.2.0-split.2';
  const BUILD = 'split-enhancements-20260919-01';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pad = n => String(n).padStart(2, '0');
  const cat = raw => {
    const m = /moto\s*(gp|2|3|e)/i.exec(String(raw || ''));
    return m ? ({gp:'MotoGP','2':'Moto2','3':'Moto3',e:'MotoE'})[m[1].toLowerCase()] : String(raw || '');
  };
  const sess = raw => ({SPR:'Sprint',RAC:'Race',PR:'Practice',WUP:'Warm Up'})[String(raw || '').toUpperCase()] || String(raw || '');
  function wall(raw) {
    const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(String(raw || ''));
    if (!m) return null;
    const d = new Date(+m[1],+m[2]-1,+m[3],+m[4],+m[5]);
    return Number.isNaN(d.getTime()) || d.getFullYear()!==+m[1] ||
      d.getMonth()!==+m[2]-1 || d.getDate()!==+m[3] ||
      d.getHours()!==+m[4] || d.getMinutes()!==+m[5] ? null : d;
  }
  const day = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  function nextPass(race, now, filter) {
    const a = race?.attributes || {};
    const source = Array.isArray(a.sessions_all) ? a.sessions_all : Array.isArray(a.sessions) ? a.sessions : [];
    return source.map(s => ({s,d:wall(s?.date)})).filter(({s,d}) => s && d &&
      (!a.date_start || day(d)>=String(a.date_start).slice(0,10)) &&
      (!a.date_end || day(d)<=String(a.date_end).slice(0,10)) &&
      (filter==='Total' || cat(s.category||'MotoGP')===filter) && d>now &&
      !['FINISHED','CANCELLED','CANCELED'].includes(String(s.status||'').toUpperCase()))
      .sort((a,b)=>a.d-b.d)[0] || null;
  }
  function remaining(ms) {
    const sec=Math.max(0,Math.ceil(ms/1000));
    const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;
    return `${h?`${h}:${pad(m)}`:m}:${pad(s)} till start`;
  }
  // Parse only valid positive lap times; never treat 0.000 or unknown as a record.
  function lapSeconds(raw) {
    const m=/^(?:(\d+)[:'])?(\d{1,3})\.(\d{3})$/.exec(String(raw??'').trim());
    if (!m || (m[1] && +m[2]>=60)) return null;
    const seconds=(m[1]?60*Number(m[1]):0)+Number(m[2])+Number(m[3])/1000;
    return seconds>0&&Number.isFinite(seconds)?seconds:null;
  }
  function fastLap(r, attr, live) {
    if (r?.is_session_fastest !== true) return false;
    const last=lapSeconds(r.last_lap_time),best=lapSeconds(r.best_lap_time);
    if (last===null || best===null || Math.abs(last-best)>0.0001) return false;
    if (Number(r.best_lap_number)>0 && Number(r.last_lap)>0 &&
        Number(r.best_lap_number)!==Number(r.last_lap)) return false;
    if (live) {
      const sessionBest=lapSeconds(attr?.session_fastest_lap);
      if (sessionBest===null || Math.abs(last-sessionBest)>0.0001) return false;
    }
    return true;
  }
  const CSS = `
    .nt-heading{color:var(--primary-text-color)!important;opacity:1;font-weight:900}
    .nt-row.unclassified{opacity:1!important;background:rgba(127,127,127,.065)}
    .nt-person-text small,.nt-clock small,.nt-toggle,.nt-results,.nt-empty{
      color:var(--primary-text-color)!important;opacity:.84}
    .nt-row.unclassified .nt-person-text b{color:var(--primary-text-color)}
    .nt-fast-lap{color:var(--motogp-fastest-lap-color,var(--error-color,#b71c1c));font-weight:900}
    .next-tile-clock{margin-top:6px;font-size:12px;font-weight:900;
      color:var(--primary-text-color);font-variant-numeric:tabular-nums}
  `;
  function styleOnce(card) {
    if (!card.shadowRoot || card.shadowRoot.querySelector('[data-motogp-split-enhancements]')) return;
    const style=document.createElement('style');
    style.setAttribute('data-motogp-split-enhancements','');
    style.textContent=CSS;
    card.shadowRoot.appendChild(style);
  }
  function install() {
    const Overview=customElements.get(OVERVIEW),Timing=customElements.get(TIMING);
    if (Overview?.buildInfo?.version!==REQUIRED || Timing?.buildInfo?.version!==REQUIRED) {
      console.error(`[MotoGP enhancements] Requires exact ${REQUIRED}; no patch applied.`);
      return;
    }
    if (Overview.prototype._motogpEnhancements || Timing.prototype._motogpEnhancements) return;
    const oldSchedule=Overview.prototype._schedule;
    Overview.prototype._schedule=function(race,now) {
      const html=oldSchedule.call(this,race,now);
      styleOnce(this);
      const next=nextPass(race,now,this._filter);
      if (!next) return html;
      const s=next.s,d=next.d;
      // Scope the lookup to the exact day so matching session names on other days stay untouched.
      const token=`data-day="${esc(day(d))}"`;
      const begin=html.indexOf(token);
      if (begin<0) return html; // Closed days do not get hidden markup.
      const end=html.indexOf('<div class="day"><button',begin+token.length);
      const boundary=end<0?html.length:end;
      const section=html.slice(begin,boundary);
      const tile=`<div class="tile "><div class="row"><strong>${pad(d.getHours())}:${pad(d.getMinutes())}</strong>`+
        `<span class="badge ">KOMMANDE</span></div><div class="name">${esc(cat(s.category||'MotoGP'))} · ${esc(sess(s.name||s.type||''))}</div></div>`;
      if (!section.includes(tile)) return html;
      const stamp=d.getTime();
      const expanded=tile.slice(0,-6)+`<div class="next-tile-clock" data-next-start="${stamp}">`+
        `${esc(remaining(stamp-Date.now()))}</div></div>`;
      return html.slice(0,begin)+section.replace(tile,expanded)+html.slice(boundary);
    };
    const oldTiming=Timing.prototype._timing;
    Timing.prototype._timing=function() {
      const html=oldTiming.call(this);
      styleOnce(this);
      const snap=this._snapshot;
      if (this._spoiler() || !snap?.riders?.length || snap.day!==this._today) return html;
      const attrs=this._hass?.states?.[this._ids.riders]?.attributes || {};
      let index=0;
      return html.replace(/<div class="nt-row(?: unclassified)?">[\s\S]*?<\/div>/g, row => {
        const r=snap.riders[index++];
        if (!r || !fastLap(r,attrs,Boolean(this._live))) return row;
        const last=String(r.last_lap_time).trim();
        const target=`<span>${esc(last)}</span>`;
        if (!row.includes(target)) return row;
        const partial=this._live && attrs.lap_history_partial===true;
        return row.replace(target,`<span class="nt-fast-lap" title="${partial?'Snabbaste observerade varv, partiell historik':'Snabbaste verifierade varv'}">⚡ ${esc(last)}</span>`);
      });
    };
    Overview.prototype._motogpEnhancements=BUILD;
    Timing.prototype._motogpEnhancements=BUILD;
    console.info(`[MotoGP enhancements] ${BUILD} installed on isolated split cards only`);
  }
  Promise.all([customElements.whenDefined(OVERVIEW),customElements.whenDefined(TIMING)]).then(install);
})();

;
/* MotoGP Next: approved lap records, personal bests, gap trends and feed freshness.
 * Bundled into the one Next resource. Read-only; no independent HA resource. */
(() => {
  'use strict';
  const TAG='ha-motogp-next-timing-card', REQUIRED='0.2.0-split.2';
  const BUILD='lap-stats-20261107-01';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function gap(raw) {
    const s=String(raw??'').trim().replace(',','.');
    if (!/^(?:\+)?\d+(?:\.\d+)?$/.test(s)) return null;
    const n=Number(s);
    return Number.isFinite(n)&&n>0?n:null;
  }
  function lap(raw) {
    const s=String(raw??'').trim().replace("'",':').replace('"','');
    if (!/^(?:\d+:)?\d{1,3}\.\d{3}$/.test(s)) return null;
    const p=s.split(':');
    if (p.length===2&&Number(p[1])>=60) return null;
    const n=p.length===2?Number(p[0])*60+Number(p[1]):Number(p[0]);
    return n>0&&Number.isFinite(n)?n:null;
  }
  const riderKey=r=>String(r.rider_id||r.number||r.surname||r.shortname||'');
  const sameLap=(a,b)=>a!==null&&b!==null&&Math.abs(a-b)<0.0001;
  const styleText=`
    .nt-gap-trend{display:inline-flex;align-items:center;justify-content:flex-end;gap:5px;white-space:nowrap;font-weight:850}
    .nt-gap-trend.up{color:#dc2626!important}.nt-gap-trend.down{color:#16a34a!important}
    .nt-gap-arrow{font-size:11px;line-height:1}
    .nt-fast-lap{color:#e10600!important;font-weight:950!important}
    .nt-personal-best{color:#128349!important;font-weight:900!important}
    .nt-pb-chip{display:inline-block;margin-left:5px;border:1px solid currentColor;border-radius:4px;padding:0 3px;font-size:9px;vertical-align:middle}
    .nt-session-record{padding:9px 14px;border-top:1px solid var(--divider-color,#ddd);font-size:12px;font-weight:900;color:var(--primary-text-color);background:rgba(127,127,127,.045)}
    .nt-session-record strong{color:#e10600}.nt-session-record small{display:block;font-size:10px;color:var(--secondary-text-color);font-weight:600;margin-top:3px}
    .nt-feed-age{display:inline-block;border:1px solid var(--divider-color,#ddd);border-radius:12px;padding:2px 7px;font-size:10px;color:var(--primary-text-color);font-weight:800;background:rgba(127,127,127,.07);white-space:nowrap}
    .nt-feed-age.ok{color:#16803b;border-color:#16a34a;background:rgba(22,163,74,.10)}
    .nt-feed-age.delayed{color:#9a5400;border-color:#d97706;background:rgba(217,119,6,.12)}
    .nt-feed-age.missing{color:#b91c1c;border-color:#dc2626;background:rgba(220,38,38,.10)}
  `;
  // Calculate status during *render*, not only in the one-second callback.
  // Home Assistant can replace the badge on every state push, and the timing
  // card can already be connected when this bundled extension is installed.
  function feedHealth(stamp,expected,now=Date.now()) {
    if (!Number.isFinite(stamp)||stamp<=0||stamp>now+5000) {
      return {name:'',text:'Uppdateringstid okänd'};
    }
    const age=Math.max(0,Math.floor((now-stamp)/1000));
    const poll=Number.isFinite(expected)&&expected>0?expected:5;
    if(age<Math.max(20,Math.ceil(poll*3)))
      return {name:'ok',text:`● Feed OK · ${age} s`};
    if(age<Math.max(60,Math.ceil(poll*12)))
      return {name:'delayed',text:`⚠ Feed fördröjd · ${age} s`};
    return {name:'missing',text:`⛔ Feed saknas · ${Math.floor(age/60)} min ${age%60} s`};
  }
  function refreshAge(card) {
    const badge=card.shadowRoot?.querySelector('[data-motogp-feed-age]');
    if (!badge) return;
    const status=card._live&&!card._spoiler()
      ? feedHealth(
          Number(badge.getAttribute('data-motogp-feed-age')),
          Number(badge.getAttribute('data-motogp-feed-interval')))
      : {name:'',text:'Tid okänd'};
    badge.classList.remove('ok','delayed','missing');
    if(status.name)badge.classList.add(status.name);
    badge.textContent=status.text;
  }
  function ensureAgeTimer(card) {
    if(!card._motogpAgeTimer)card._motogpAgeTimer=setInterval(()=>refreshAge(card),1000);
  }
  function install() {
    const Timing=customElements.get(TAG);
    if (Timing?.buildInfo?.version!==REQUIRED) {
      console.error(`[MotoGP lap stats] Requires ${REQUIRED}; no patch applied.`);return;
    }
    if (Timing.prototype._motogpGapTrends) return;
    const original=Timing.prototype._timing;
    Timing.prototype._timing=function() {
      const html=original.call(this);
      if (this._spoiler()||!this._hass||!this._live||!this._snapshot?.riders?.length||
          this._snapshot.day!==this._today) return html;
      const snap=this._snapshot,live=this._live;
      const positions=this._hass.states[this._ids.riders];
      const attrs=positions?.attributes||{};
      const event=String(this._event||attrs.event||'');
      const sessionKey=[event,snap.day,snap.category,snap.name,live.key].join('|');
      if (this._gapTrendSession!==sessionKey) {
        this._gapTrendSession=sessionKey;this._gapTrendValues=new Map();
      }
      const values=this._gapTrendValues;
      const sessionLap=lap(attrs.session_fastest_lap);
      const sessionRider=String(attrs.session_fastest_rider||'').trim();
      const fastestNumber=String(attrs.session_fastest_rider_number||'').trim();
      const fastestLapNo=Number(attrs.session_fastest_lap_number);
      const partial=attrs.lap_history_partial===true;
      let index=0;
      // Split at row starts: each row contains nested spans. A shallow div regex is unsafe.
      const parts=('\u0000'+html).split(/(?=<div class="nt-row(?: unclassified)?">)/);
      let out=parts.map((part,i)=>{
        if(i===0||!part.startsWith('<div class="nt-row'))return part;
        const r=snap.riders[index++];if(!r)return part;
        const p=Number(r.position),key=riderKey(r);
        const prev=p>1?gap(r.gap_prev):null;
        const rawPrev=p===1?'—':String(r.gap_prev??'—');
        const safePrev=(!rawPrev.trim()||rawPrev==='0.000')?'—':rawPrev;
        const rawFirst=p===1?'LEDARE':String(r.gap_first??'—');
        const safeFirst=(!rawFirst.trim()||rawFirst==='0.000')?'—':rawFirst;
        const needle=`<span>${esc(safePrev)}</span><span>${esc(safeFirst)}</span>`;
        if(prev!==null&&key&&part.includes(needle)) {
          const old=values.get(key);
          let trend=old?.position===p?old.trend:'';
          if(old?.position!==p)trend='';
          else if(Math.abs(prev-old.value)>=0.0005)trend=prev>old.value?'up':'down';
          values.set(key,{value:prev,position:p,trend});
          const arrow=trend==='up'?'▼':trend==='down'?'▲':'';
          part=part.replace(needle,`<span><span class="nt-gap-trend${trend?` ${trend}`:''}">`+
            `${arrow?`<span class="nt-gap-arrow">${arrow}</span>`:''}<span>${esc(safePrev)}</span>`+
            `</span></span><span>${esc(safeFirst)}</span>`);
        }
        const last=lap(r.last_lap_time),best=lap(r.best_lap_time);
        const lastNo=Number(r.last_lap),bestNo=Number(r.best_lap_number);
        // Never call an equal but historical fastest lap a NEW personal best.
        const pb=sameLap(last,best)&&Number.isInteger(lastNo)&&lastNo>0&&
          Number.isInteger(bestNo)&&bestNo===lastNo;
        const record=pb&&r.is_session_fastest===true&&sameLap(last,sessionLap);
        const lastSpan=`<span>${esc(String(r.last_lap_time??''))}</span>`;
        if(part.includes(lastSpan)&&record)part=part.replace(lastSpan,
          `<span class="nt-fast-lap" title="Sessionens snabbaste varv och nytt personbästa">`+
          `⚡ ${esc(r.last_lap_time)} <span class="nt-pb-chip">PB</span></span>`);
        else if(part.includes(lastSpan)&&pb)part=part.replace(lastSpan,
          `<span class="nt-personal-best" title="Nytt personbästa">${esc(r.last_lap_time)}`+
          ` <span class="nt-pb-chip">PB</span></span>`);
        return part;
      }).join('').slice(1);
      if(sessionLap!==null&&sessionRider&&
          snap.riders.some(r=>String(r.number??'')===fastestNumber||
            String(r.surname||r.shortname||'').trim()===sessionRider)) {
        const no=fastestNumber?` #${esc(fastestNumber)}`:'';
        const which=Number.isInteger(fastestLapNo)&&fastestLapNo>0?` · varv ${fastestLapNo}`:'';
        const label=partial?'Snabbaste observerade varv':'Sessionens snabbaste varv';
        const summary=`<div class="nt-session-record" role="status">${label}: `+
          `<strong>⚡ ${esc(sessionRider)}${no} · ${esc(attrs.session_fastest_lap)}${which}</strong>`+
          `${partial?'<small>Historiken är ofullständig – inte ett bekräftat sessionsrekord.</small>':''}</div>`;
        const table='<div class="nt-scroll">';
        if(out.includes(table))out=out.replace(table,summary+table);
      }
      const timestamp=Date.parse(attrs.live_poll_at||'');
      const age=Number.isFinite(timestamp)&&timestamp>0?timestamp:0;
      const interval=Number(attrs.live_poll_interval_seconds);
      const expected=Number.isFinite(interval)&&interval>0?interval:5;
      const health=feedHealth(age,expected);
      const clockEnd='<span class="nt-toggle">';
      if(out.includes(clockEnd))out=out.replace(clockEnd,
        `<span class="nt-feed-age${health.name?' '+health.name:''}" data-motogp-feed-age="${age}" data-motogp-feed-interval="${expected}" title="Tid sedan senaste lyckade livetiming-poll">`+
        `${health.text}</span>`+clockEnd);
      if(!this.shadowRoot?.querySelector('[data-motogp-gap-trends]')) {
        const style=document.createElement('style');
        style.setAttribute('data-motogp-gap-trends','');style.textContent=styleText;
        this.shadowRoot?.appendChild(style);
      }
      return out;
    };
    // If the card was already connected before the async extension installed,
    // start the clock on its next render as well.
    const render=Timing.prototype._render;
    Timing.prototype._render=function() {
      render.call(this);
      if(this.isConnected)ensureAgeTimer(this);
      refreshAge(this);
    };
    const on=Timing.prototype.connectedCallback,off=Timing.prototype.disconnectedCallback;
    Timing.prototype.connectedCallback=function() {
      on.call(this);
      ensureAgeTimer(this);
      refreshAge(this);
    };
    Timing.prototype.disconnectedCallback=function() {
      if(this._motogpAgeTimer)clearInterval(this._motogpAgeTimer);
      this._motogpAgeTimer=null;off.call(this);
    };
    Timing.prototype._motogpGapTrends=BUILD;
    console.info(`[MotoGP lap stats] ${BUILD} installed in the single Next timing card`);
  }
  customElements.whenDefined(TAG).then(install);
})();


;
/* MotoGP Next UI preview: bundled after lap-stats. Read-only; no new HA resource. */
(() => {
  'use strict';
  const OVERVIEW='ha-motogp-next-overview-card';
  const TIMING='ha-motogp-next-timing-card';
  const REQUIRED='0.2.0-split.2';
  const BUILD='ui-preview-20261108-06';
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
  // Genuine 2024 class SVGs, not skewed-font imitations. Wikimedia Commons
  // identifies these as PD-textlogo (trademark caveat applies). External
  // images are optional; accessible plain text survives failed image loads.
  // https://commons.wikimedia.org/wiki/Category:MotoGP_logos
  const CLASS_LOGOS=Object.freeze({
    MotoGP:'https://upload.wikimedia.org/wikipedia/commons/f/f9/MotoGP_logo_%282024%29.svg',
    Moto2:'https://upload.wikimedia.org/wikipedia/commons/4/46/Moto2_logo_%282024%29.svg',
    Moto3:'https://upload.wikimedia.org/wikipedia/commons/d/d7/Moto3_logo_%282024%29.svg'
  });
  const classMark=value=>{
    const name=String(value||'');
    if(!Object.prototype.hasOwnProperty.call(CLASS_LOGOS,name))return esc(name);
    return '<span class="mgp-class-logo-wrap"><img class="mgp-class-mark" src="'+
      CLASS_LOGOS[name]+'" alt="" loading="lazy" decoding="async" data-ready="false">'+
      '<span class="mgp-class-logo-fallback">'+esc(name)+'</span></span>';
  };
  const readyClassMarks=view=>{
    for(const img of view.querySelectorAll?.('img.mgp-class-mark')||[]){
      const ready=()=>{img.dataset.ready='true';};
      const failed=()=>{img.dataset.ready='false';};
      img.addEventListener('load',ready,{once:true});
      img.addEventListener('error',failed,{once:true});
      if(img.complete){if(img.naturalWidth>0)ready();else failed();}
    }
  };
  // Current GP records are supplied by sensor.motogp_next_race, separately per class.
  // No new API calls and no fallback to records belonging to another class.
  const recordKind=value=>{
    const key=String(value||'').trim().toUpperCase().replace(/[^A-Z0-9]/g,'');
    const types={LAPRECORD:'lap',LAP:'lap',ALLTIMELAPRECORD:'lap',ALLTIMERECORD:'lap',
      CIRCUITRECORD:'lap',ALLTIME:'lap',POLELAP:'pole',POLE:'pole',POLERECORD:'pole',
      POLEPOSITION:'pole',BESTRACELAP:'race',BESTRACE:'race',
      RACELAPRECORD:'race',BESTRACERECORD:'race'};
    return types[key]||'';
  };
  const recordChips=(card,category)=>{
    if(!['MotoGP','Moto2','Moto3'].includes(category))return '';
    const attrs=card._hass?.states?.[card._ids?.race]?.attributes||{};
    const rows=attrs.records_by_category?.[category];
    if(!Array.isArray(rows)||!rows.length)return '';
    const found=new Map(),names={lap:'Lap record',pole:'Pole lap',race:'Race lap'};
    for(const record of rows){
      if(!record||typeof record!=='object')continue;
      const type=recordKind(record.type);
      if(!type||found.has(type))continue;
      const time=String(record.time??'').trim();
      if(!/^(?:\d{1,2}[:'])?\d{1,2}\.\d{3}$/.test(time))continue;
      const rider=String(record.rider||'').trim();
      const year=Number(record.year);
      const speed=Number(record.speed);
      const detail=[rider,
        Number.isInteger(year)&&year>=1949&&year<=new Date().getFullYear()+1?String(year):'',
        Number.isFinite(speed)&&speed>0&&speed<500?String(Math.round(speed*10)/10)+' km/h':''
      ].filter(Boolean).join(' · ');
      found.set(type,'<span class="mgp-timing-record-chip" title="'+esc(detail)+'" aria-label="'+esc(names[type]+': '+time+(detail?', '+detail:''))+'">'+
        '<small>'+names[type]+'</small><strong>'+esc(time)+'</strong></span>');
    }
    if(!found.size)return '';
    return '<div class="mgp-timing-records" role="group" aria-label="'+esc(category)+' circuit records">'+
      ['lap','pole','race'].map(k=>found.get(k)||'').join('')+'</div>';
  };
  // An ended session must keep its fastest observed lap with its own frozen
  // same-session roster, never with the incoming race's live attributes.
  const lapSeconds=raw=>{
    const match=/^(?:(\d+)[:'])?(\d{1,2})\.(\d{3})$/.exec(lap(raw));
    if(!match)return null;
    const seconds=Number(match[1]||0)*60+Number(match[2])+Number(match[3])/1000;
    return Number.isFinite(seconds)&&seconds>0?seconds:null;
  };
  const fastestSnapshotLap=card=>{
    const snap=card._snapshot;
    if(!snap||snap.day!==card._today||!Array.isArray(snap.riders))return null;
    const times=snap.riders.map(r=>lapSeconds(r.best_lap_time)).filter(v=>v!==null);
    return times.length?Math.min(...times):null;
  };
  const sessionFastest=card=>{
    const snap=card._snapshot;
    if(!snap||snap.day!==card._today||!Array.isArray(snap.riders)||!snap.riders.length)return '';
    const candidates=snap.riders.map(r=>{
      const raw=lap(r.best_lap_time);
      const match=/^(?:(\d+)[:'])?(\d{1,2})\.(\d{3})$/.exec(raw);
      if(!match)return null;
      const seconds=Number(match[1]||0)*60+Number(match[2])+Number(match[3])/1000;
      if(!Number.isFinite(seconds)||seconds<=0)return null;
      return {seconds,time:raw,rider:String(r.surname||r.shortname||r.firstname||'').trim()};
    }).filter(Boolean).sort((a,b)=>a.seconds-b.seconds);
    if(!candidates.length)return '';
    const best=candidates[0];
    return '<div class="nt-session-observed-best" role="status">⏱ Sessionens snabbaste observerade: '+
      '<strong>'+esc(best.time)+'</strong>'+(best.rider?' · '+esc(best.rider):'')+'</div>';
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
    .nt-lap-pair>small.nt-session-best{color:var(--motogp-fastest-lap-color,var(--error-color,#b71c1c));font-weight:850}
    .nt-lap-pair .nt-last-main{font-weight:850;white-space:nowrap}
    .nt-status-pair{display:flex;flex-direction:column;align-items:flex-end;gap:3px;min-width:0}
    .nt-status-pair small{font-size:10px;color:var(--secondary-text-color)}
    .nt-position-up{color:#16803b;font-weight:900}.nt-position-down{color:#dc2626;font-weight:900}
    .nt-position-zero{color:var(--secondary-text-color);font-weight:750}
    .nt-position-empty{color:var(--secondary-text-color)}
    .nt-session-record strong{color:var(--motogp-fastest-lap-color,var(--error-color,#b71c1c))}
    /* Records and observed fastest lap are part of the timing HEADER, not table rows. */
    .mgp-timing-header{border-bottom:1px solid var(--divider-color,#ddd)}
    .mgp-timing-header>.nt-head{width:100%}
    .nt-session-observed-best{padding:2px 16px 7px;font-size:11px;font-weight:650;color:var(--primary-text-color)}
    .nt-session-observed-best strong{font-size:12px;color:var(--motogp-fastest-lap-color,var(--error-color,#b71c1c))}
    .mgp-timing-records{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;padding:5px 16px 10px}
    .mgp-timing-record-chip{display:flex;align-items:center;justify-content:space-between;gap:4px 8px;min-width:0;border:1px solid var(--divider-color,#ddd);border-radius:9px;padding:6px 8px;background:var(--secondary-background-color,rgba(127,127,127,.045))}
    .mgp-timing-record-chip small{font-size:9px;font-weight:700;color:var(--secondary-text-color);white-space:nowrap}
    .mgp-timing-record-chip strong{font-size:12px;font-weight:850;font-variant-numeric:tabular-nums;white-space:nowrap}
    @media(max-width:560px){.mgp-timing-records{gap:4px;padding:6px}.mgp-timing-record-chip{display:flex;flex-direction:column;gap:2px;padding:6px 3px}.mgp-timing-record-chip small{font-size:8px}.mgp-timing-record-chip strong{font-size:11px}}
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
    .mgp-class-logo-wrap{display:flex;align-items:center;justify-content:center;width:100%;height:31px}
    .mgp-class-mark{display:none;max-width:min(100%,146px);max-height:29px;width:auto;height:auto;object-fit:contain}
    .mgp-class-mark[data-ready="true"]{display:block}
    .mgp-class-logo-fallback{font-size:16px;font-weight:900;font-style:normal}
    .mgp-class-mark[data-ready="true"]+.mgp-class-logo-fallback{display:none}
    .mgp-rider-flag{display:inline-block;vertical-align:-.08em;line-height:1;margin-right:6px;font-size:15px;white-space:nowrap}
    .nt-person-text .mgp-rider-flag{font-size:15px}
    @media(max-width:480px){.np-tabs{gap:5px;padding:8px}.mgp-class-logo-wrap{height:24px}.mgp-class-mark{max-height:22px}.mgp-rider-flag{font-size:13px}}
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
      if(this._spoiler())return html;
      // The API lap counter denotes the current lap, not completed laps.
      // The legacy base computes total-current ("after this lap"); show
      // remaining including the lap in progress. Never relabel a finished
      // session or fabricate a current lap before verified live timing.
      const lapState=this._hass?.states?.[this._ids?.laps];
      const current=Number(lapState?.state);
      const total=Number(lapState?.attributes?.num_laps);
      if(this._live&&/^(race|sprint)$/i.test(String(this._live.name||''))&&
          Number.isInteger(current)&&Number.isInteger(total)&&
          current>0&&total>0&&current<=total){
        const previous='Varv '+current+'/'+total+' · '+(total-current)+' kvar';
        const next='Varv '+current+'/'+total+' · '+
          (current===total?'Sista varvet':(total-current+1)+' kvar');
        html=html.replace(previous,next);
      }
      const category=this._live?.category||this._snapshot?.category;
      // Extend the existing timing header: title/lap/feed toggle stays a button,
      // while official circuit records and observed session best stay in the same
      // visual header region, outside the button. Keep the rider table separate.
      if(html.includes('<button type="button" class="nt-head"')&&html.includes('</button>')){
        const headerDetails=sessionFastest(this)+recordChips(this,category);
        if(headerDetails){
          html=html.replace('<button type="button" class="nt-head"',
            '<div class="mgp-timing-header"><button type="button" class="nt-head"');
          html=html.replace('</button>','</button>'+headerDetails+'</div>');
        }
      }
      if(!this._snapshot?.riders?.length||this._snapshot.day!==this._today)return html;
      if(this._live)html=html.replace('<span class="nt-label">🏁 ',
        '<span class="nt-label"><span class="nt-live-dot" aria-label="Live"></span>');
      // In the single-file lap-stats addon the lightning bolt only denotes
      // a session record; personal-best labels remain unchanged.
      html=html.replace(/⚡/g,'⏱');
      html=html.replace('<span>SENASTE</span>','<span>SENASTE VARV</span>')
        .replace('<span>Δ FRAMFÖR</span>','<span>FRAMFÖR</span>')
        .replace('<span>Δ LEDARE</span>','<span>LEDARE</span>');
      const fastest=fastestSnapshotLap(this);
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
          const seconds=lapSeconds(r.best_lap_time);
          const overall=fastest!==null&&seconds!==null&&Math.abs(seconds-fastest)<0.0005;
          const cell=`<span class="nt-lap-pair"><span class="nt-last-main">${original}</span>`+
            `<small${overall?' class="nt-session-best"':''}>Snabbaste: ${esc(best)}</small></span>`;
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
      // Weekend schedule visibility is owned solely by the event-header modal.
      // Never insert a second panel above the separately rendered timing card.
      return formatted;
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
      readyClassMarks(view);
    };
    Timing.prototype._motogpUiPreview=BUILD;
    Overview.prototype._motogpUiPreview=BUILD;
    console.info(`[MotoGP UI preview] ${BUILD} installed in the existing one-file Next resource`);
  }
  Promise.all([customElements.whenDefined(OVERVIEW),customElements.whenDefined(TIMING)]).then(install);
})();

;
/* MotoGP Next responsive timing and authenticated lap-history dialog. */
(() => {
'use strict';
const TAG='ha-motogp-next-timing-card', REQUIRED='0.2.0-split.2';
const BUILD='mobile-laps-20261107-01';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const css=`
  .nt-card{container-type:inline-size}
  .nt-row[data-motogp-rider-id]{cursor:pointer;touch-action:manipulation}
  .nt-row[data-motogp-rider-id]:hover{background:rgba(127,127,127,.07)}
  .nt-row[data-motogp-rider-id]:focus-visible{outline:2px solid var(--primary-color,#03a9f4);outline-offset:-2px}
  .nt-laps-overlay{position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.62);display:flex;
    align-items:center;justify-content:center;padding:12px;box-sizing:border-box}
  .nt-laps-dialog{width:min(580px,100%);max-height:min(720px,calc(100dvh - 24px));display:flex;
    flex-direction:column;border-radius:15px;overflow:hidden;
    background:var(--ha-card-background,var(--card-background-color,#fff));color:var(--primary-text-color);
    box-shadow:0 16px 60px rgba(0,0,0,.38)}
  .nt-laps-head{display:flex;gap:14px;align-items:flex-start;justify-content:space-between;
    padding:15px;border-bottom:1px solid var(--divider-color,#ddd)}
  .nt-laps-head strong{font-size:16px}.nt-laps-head small{display:block;margin-top:4px;
    color:var(--secondary-text-color);font-size:11px}
  .nt-laps-close{border:1px solid var(--divider-color,#ddd);border-radius:50%;background:transparent;
    color:inherit;font-size:24px;line-height:1;cursor:pointer;width:36px;height:36px;flex:none}
  .nt-laps-scroll{overflow-y:auto;overscroll-behavior:contain;padding:0 14px 16px;min-height:0}
  .nt-laps-message{padding:20px 0;font-size:13px;color:var(--secondary-text-color)}
  .nt-laps-table{width:100%;border-collapse:collapse;font-size:13px;font-variant-numeric:tabular-nums}
  .nt-laps-table th,.nt-laps-table td{padding:9px 8px;border-bottom:1px solid var(--divider-color,#ddd)}
  .nt-laps-table th{text-align:left;color:var(--secondary-text-color);font-size:11px}
  .nt-laps-table th:nth-child(n+2),.nt-laps-table td:nth-child(n+2){text-align:right}
  .nt-laps-best{color:#159447;font-weight:900}
  .nt-laps-note{font-size:12px;margin:12px 0 0;color:var(--secondary-text-color)}
  @container (max-width:620px){
    .nt-card .nt-scroll{overflow-x:visible;width:100%}
    .nt-card .nt-table{min-width:0!important;width:100%!important}
    .nt-card .nt-row{grid-template-columns:27px minmax(0,1fr) 36px minmax(83px,1.02fr)!important;
      gap:6px!important;min-height:53px;padding:9px 10px;font-size:11px}
    .nt-card .nt-row>span:nth-child(n+5){display:none}
    .nt-card .nt-person{gap:6px}.nt-card .nt-person-text b{font-size:11px}
    .nt-card .nt-person-text small{display:none}.nt-card .nt-color{height:28px}
    .nt-card .nt-heading{min-height:30px;font-size:9px;letter-spacing:0}
    .nt-card .nt-lap-pair>small{font-size:9px;white-space:normal}
    .nt-card .nt-head{gap:7px;padding:11px 10px;flex-wrap:wrap}
    .nt-card .nt-label{font-size:14px}.nt-card .nt-clock{font-size:11px}
    .nt-card .nt-session-record{padding:8px 10px;font-size:11px}
    .nt-card .nt-feed-age{font-size:10px}
  }
`;
function addStyle(card){
  const root=card.shadowRoot;
  if(!root||root.querySelector('[data-motogp-mobile-laps-style]'))return;
  const element=document.createElement('style');
  element.setAttribute('data-motogp-mobile-laps-style','');
  element.textContent=css;root.appendChild(element);
}
const key=card=>String(card._activeKey||card._snapshot?.key||'');
function renderModal(card){
  const m=card._motogpLapModal;
  if(!m)return '';
  const rider=m.rider;
  const title='<div><strong id="motogp-laps-title">'+esc(rider.surname||rider.shortname||'Förare')+
    ' · #'+esc(rider.number??'—')+'</strong><small>Observerade varvtider · '+
    esc(card._snapshot?.category||'')+' '+esc(card._snapshot?.name||'')+'</small></div>';
  let content='';
  if(m.state==='loading')content='<div class="nt-laps-message">Läser sparade varvtider…</div>';
  else if(m.state==='error')content='<div class="nt-laps-message">Varvhistoriken är inte tillgänglig just nu. Försök igen senare.</div>';
  else{
    const data=m.data||{},laps=Array.isArray(data.laps)?data.laps:[];
    const best=Number(data.best_seconds);
    content=laps.length?'<table class="nt-laps-table"><thead><tr><th>Varv</th><th>Tid</th><th>Mot bästa</th></tr></thead><tbody>'+
      laps.map(l=>{
        const seconds=Number(l.seconds),isBest=Number.isFinite(best)&&best>0&&Math.abs(seconds-best)<0.0005;
        const diff=Number.isFinite(seconds)&&Number.isFinite(best)&&best>0?
          (isBest?'PB':'+ '+Math.max(0,seconds-best).toFixed(3)+' s'):'—';
        return '<tr><td>'+esc(l.lap)+'</td><td class="'+(isBest?'nt-laps-best':'')+'">'+esc(l.time)+
          '</td><td class="'+(isBest?'nt-laps-best':'')+'">'+esc(diff)+'</td></tr>';
      }).join('')+'</tbody></table>':
      '<div class="nt-laps-message">Inga registrerade varvtider ännu.</div>';
    const holes=Array.isArray(data.missing_laps)?data.missing_laps:[];
    if(holes.length)content+='<p class="nt-laps-note">⚠ Saknade varv: '+holes.map(esc).join(', ')+'. Inga tider uppskattade.</p>';
    content+='<p class="nt-laps-note">Endast observerade, TV-fördröjda varv från sessionsarkivet.</p>';
  }
  return '<div class="nt-laps-overlay" data-motogp-laps-backdrop>'+
    '<section class="nt-laps-dialog" role="dialog" aria-modal="true" aria-labelledby="motogp-laps-title">'+
    '<header class="nt-laps-head">'+title+
    '<button type="button" class="nt-laps-close" data-motogp-laps-close aria-label="Stäng varvtider">×</button></header>'+
    '<div class="nt-laps-scroll" data-motogp-laps-scroll>'+content+'</div></section></div>';
}
function install(){
  const Timing=customElements.get(TAG);
  if(Timing?.buildInfo?.version!==REQUIRED){console.error('[MotoGP mobile laps] Wrong card version');return;}
  if(Timing.prototype._motogpMobileLaps)return;
  const baseTiming=Timing.prototype._timing;
  Timing.prototype._timing=function(){
    const html=baseTiming.call(this);
    addStyle(this);
    if(this._spoiler()||!this._snapshot?.riders?.length||this._snapshot.day!==this._today)return html;
    let index=0;
    const parts=('\u0000'+html).split(/(?=<div class="nt-row(?: unclassified)?">)/);
    return parts.map((part,i)=>{
      if(!i||!part.startsWith('<div class="nt-row'))return part;
      const r=this._snapshot.riders[index++];
      const id=String(r?.rider_id||'').trim();
      if(!id)return part;
      const name=r?.surname||r?.shortname||'förare';
      return part.replace(/^(<div class="nt-row(?: unclassified)?")/,
        '$1 data-motogp-rider-id="'+esc(id)+'" role="button" tabindex="0" aria-haspopup="dialog" '+
        'aria-label="Visa varvtider för '+esc(name)+'"');
    }).join('').slice(1);
  };
  const baseRender=Timing.prototype._render;
  Timing.prototype._render=function(){
    const savedTop=this.shadowRoot?.querySelector('[data-motogp-laps-scroll]')?.scrollTop||0;
    baseRender.call(this);
    const m=this._motogpLapModal;
    if(!m)return;
    if(this._spoiler()||m.day!==this._today||m.sessionKey!==key(this)||
        !this._snapshot?.riders?.some(r=>String(r.rider_id||'')===m.riderId)){
      this._motogpLapModal=null;return;
    }
    this.shadowRoot?.getElementById('app')?.insertAdjacentHTML('beforeend',renderModal(this));
    const list=this.shadowRoot?.querySelector('[data-motogp-laps-scroll]');
    if(list)list.scrollTop=savedTop;
  };
  Timing.prototype._motogpOpenLaps=function(id){
    if(this._spoiler()||!this._hass||!this._snapshot)return;
    const rider=this._snapshot.riders?.find(r=>String(r.rider_id||'')===id);
    if(!rider)return;
    const sessionKey=key(this);
    const m={riderId:id,rider,day:this._today,sessionKey,state:'loading',data:null};
    this._motogpLapModal=m;this._render();
    this.shadowRoot?.querySelector('[data-motogp-laps-close]')?.focus?.();
    if(typeof this._hass.callWS!=='function'){m.state='error';this._render();return;}
    this._hass.callWS({type:'motogp_sensor/rider_laps',rider_id:id})
      .then(data=>{
        if(this._motogpLapModal!==m||this._spoiler()||key(this)!==sessionKey)return;
        m.state='ready';m.data=data;this._render();
      }).catch(()=>{
        if(this._motogpLapModal!==m||this._spoiler())return;
        m.state='error';this._render();
      });
  };
  Timing.prototype._motogpCloseLaps=function(){this._motogpLapModal=null;this._render();};
  const previousClick=Timing.prototype._click;
  Timing.prototype._click=function(e){
    const target=e.target;
    if(target?.closest?.('[data-motogp-laps-close]')){this._motogpCloseLaps();return;}
    const overlay=target?.closest?.('[data-motogp-laps-backdrop]');
    if(overlay&&target===overlay){this._motogpCloseLaps();return;}
    const row=target?.closest?.('[data-motogp-rider-id]');
    if(row&&!this._spoiler()){
      this._motogpOpenLaps(row.getAttribute('data-motogp-rider-id'));return;
    }
    return previousClick.call(this,e);
  };
  function handleKey(e){
    if(e.key==='Escape'&&this._motogpLapModal){e.preventDefault();this._motogpCloseLaps();return;}
    const row=e.target?.closest?.('[data-motogp-rider-id]');
    if(row&&(e.key==='Enter'||e.key===' ')&&!this._spoiler()){
      e.preventDefault();this._motogpOpenLaps(row.getAttribute('data-motogp-rider-id'));
    }
  }
  function attach(card){
    if(card._motogpMobileKeys||!card.shadowRoot)return;
    card._motogpMobileKeys=handleKey.bind(card);
    card.shadowRoot.addEventListener('keydown',card._motogpMobileKeys);
  }
  const oldConnected=Timing.prototype.connectedCallback;
  Timing.prototype.connectedCallback=function(){oldConnected.call(this);attach(this);};
  const oldDisconnected=Timing.prototype.disconnectedCallback;
  Timing.prototype.disconnectedCallback=function(){
    if(this._motogpMobileKeys)this.shadowRoot?.removeEventListener('keydown',this._motogpMobileKeys);
    this._motogpMobileKeys=null;this._motogpLapModal=null;
    oldDisconnected.call(this);
  };
  const withRender=Timing.prototype._render;
  Timing.prototype._render=function(){withRender.call(this);if(this.isConnected)attach(this);};
  Timing.prototype._motogpMobileLaps=BUILD;
}
customElements.whenDefined(TAG).then(install);
})();

;
/* MotoGP Next qualifying grid: echelon 3-3-3 positions, Q1 tail included.
 * 2026 FIM grid: Q2=12, Q1 losers P13+ (MotoGP); Q2=18,
 * Q1 losers P19+ (Moto2/Moto3). Never label provisional data official.
 */
(() => {
'use strict';
const TAG='ha-motogp-next-timing-card',REQUIRED='0.2.0-split.2';
const BUILD='qual-grid-20261107-02';
const CSS="\n  .nt-qual-layout{display:grid;grid-template-columns:minmax(0,1fr);min-width:0}\n  .nt-qual-main{min-width:0}\n  .nt-qual-aside{min-width:0;border-top:1px solid var(--divider-color,#ddd);padding:11px;\n    background:var(--ha-card-background,var(--card-background-color,#fff))}\n  .nt-qual-title{font-size:12px;font-weight:900;margin:0 0 5px}\n  .nt-qual-caption{font-size:10px;color:var(--secondary-text-color);line-height:1.4;margin:0 0 10px}\n  .nt-qual-start{font-size:9px;text-transform:uppercase;letter-spacing:.12em;font-weight:850;\n    text-align:center;color:var(--secondary-text-color);padding:5px 0 8px;\n    border-bottom:2px solid var(--divider-color,#ddd);margin-bottom:10px}\n  .nt-qual-wave{display:flex;flex-direction:column;gap:5px;padding:0 0 10px;margin-bottom:10px;\n    border-bottom:1px dashed var(--divider-color,rgba(127,127,127,.35))}\n  .nt-qual-item{display:flex;align-items:center;gap:7px;min-width:0;min-height:36px;\n    padding:7px 9px;border-radius:8px;border:1px solid var(--divider-color,#ddd);\n    background:var(--ha-card-background,var(--card-background-color,#fff))}\n  .nt-qual-slot-1{margin-right:40px}\n  .nt-qual-slot-2{margin-left:20px;margin-right:20px}\n  .nt-qual-slot-3{margin-left:40px}\n  .nt-qual-p{flex:none;display:grid;place-items:center;width:25px;height:25px;border-radius:6px;\n    background:var(--secondary-background-color,rgba(127,127,127,.1));font-size:10px;\n    font-weight:900;font-variant-numeric:tabular-nums}\n  .nt-qual-color{width:3px;min-height:27px;align-self:stretch;flex:none;border-radius:3px;\n    background:var(--divider-color,#aaa)}\n  .nt-qual-person{min-width:0;display:flex;flex-direction:column;gap:2px}\n  .nt-qual-person strong{min-width:0;font-size:11px;font-weight:850;white-space:nowrap;\n    overflow:hidden;text-overflow:ellipsis}\n  .nt-qual-person small{font-size:9px;color:var(--secondary-text-color);white-space:nowrap;\n    overflow:hidden;text-overflow:ellipsis}\n  .nt-qual-group{margin:13px 0 9px;font-size:10px;font-weight:850;color:var(--secondary-text-color)}\n  .nt-qual-empty{padding:10px 6px;font-size:11px;color:var(--secondary-text-color)}\n  @container (min-width:940px){\n    .nt-qual-layout{grid-template-columns:minmax(0,1fr) 260px;align-items:start}\n    .nt-qual-aside{border-top:0;border-left:1px solid var(--divider-color,#ddd)}\n    .nt-qual-main .nt-table{min-width:0!important}\n    .nt-qual-main .nt-row{grid-template-columns:28px minmax(120px,1.4fr) 34px 112px 60px 61px 53px!important;\n      gap:6px!important;padding:8px 7px!important}\n    .nt-qual-main .nt-person-text small{font-size:10px}\n  }\n  @container (max-width:315px){\n    .nt-qual-slot-1{margin-right:20px}\n    .nt-qual-slot-2{margin-left:10px;margin-right:10px}\n    .nt-qual-slot-3{margin-left:20px}\n    .nt-qual-item{padding:6px}\n  }\n";
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const limits={MotoGP:12,Moto2:18,Moto3:18};
const number=v=>{
  const text=String(v??'').trim().replace(/^#/,'');
  return /^\d{1,3}$/.test(text)&&Number(text)>0?String(Number(text)):'';
};
const position=v=>{
  const n=Number(v);
  return v!==null&&v!==undefined&&String(v).trim()!==''&&Number.isInteger(n)&&n>=1&&n<=60?n:null;
};
const color=v=>{
  const c=String(v??'').trim();
  return /^#?[0-9a-f]{6}$/i.test(c)?'#'+c.replace(/^#/,''):'var(--divider-color,#aaa)';
};
function nameOf(r){
  return String(r?.surname||r?.shortname||r?.rider||r?.firstname||'').trim();
}
function validOfficial(rows,category,knownTail=[]){
  const min=limits[category];
  if(!min||!Array.isArray(rows)||rows.length<=min)return []; // Q1 tail must be present
  const seenPos=new Set(),seenNumbers=new Set(),output=[];
  for(const r of rows){
    const p=position(r?.position),num=number(r?.number);
    if(!p||!num||!nameOf(r)||seenPos.has(p)||seenNumbers.has(num))return [];
    seenPos.add(p);seenNumbers.add(num);
    output.push({position:p,number:num,name:nameOf(r),team:r.team||'',color:r.color||''});
  }
  if(output.length!==Math.max(...seenPos)||Math.min(...seenPos)!==1)return [];
  if(knownTail.some(r=>!output.some(o=>o.position===r.position&&o.number===r.number)))
    return []; // incomplete or mismatched official grid must remain provisional
  return output.sort((a,b)=>a.position-b.position);
}
function currentRows(snapshot){
  const seenPos=new Set(),seenNumbers=new Set(),out=[];
  for(const r of snapshot?.riders||[]){
    const p=position(r?.position),num=number(r?.number);
    const time=String(r?.last_lap_time||'').trim();
    if(!p||!num||!nameOf(r)||!time||time==='—'||seenPos.has(p)||seenNumbers.has(num))continue;
    seenPos.add(p);seenNumbers.add(num);
    out.push({position:p,number:num,name:nameOf(r),team:r.team||'',color:r.color||''});
  }
  return out.sort((a,b)=>a.position-b.position);
}
function q1Tail(race,category,leading){
  const rows=race?.attributes?.qualifying_q1_eliminated?.[category];
  if(!Array.isArray(rows)||!rows.length)return [];
  const min=limits[category],out=[],seenP=new Set(),seenN=new Set();
  const leadingNumbers=new Set(leading.map(r=>r.number));
  for(const r of rows){
    const p=position(r?.position),num=number(r?.number);
    if(!p||p<=min||!num||!nameOf(r)||seenP.has(p)||seenN.has(num)||
        leadingNumbers.has(num))return []; // no duplicates or cross-class aliases
    out.push({position:p,number:num,name:nameOf(r),team:r.team||'',
      color:r.color||'',q1:true});
    seenP.add(p);seenN.add(num);
  }
  return out.sort((a,b)=>a.position-b.position);
}
function waves(rows){
  const sections=new Map();
  for(const r of rows){
    const idx=Math.floor((r.position-1)/3);
    if(!sections.has(idx))sections.set(idx,[]);
    sections.get(idx).push(r);
  }
  return Array.from(sections.entries()).sort((a,b)=>a[0]-b[0]).map(([,wave])=>
    '<div class="nt-qual-wave">'+wave.map(r=>{
      const slot=((r.position-1)%3)+1;
      return '<div class="nt-qual-item nt-qual-slot-'+slot+'">'+
        '<span class="nt-qual-p">'+esc('P'+r.position)+'</span>'+
        '<span class="nt-qual-color" style="background:'+color(r.color)+'"></span>'+
        '<span class="nt-qual-person"><strong>#'+esc(r.number)+' · '+esc(r.name)+'</strong>'+
        (r.team?'<small>'+esc(r.team)+'</small>':'')+'</span></div>';
    }).join('')+'</div>').join('');
}
function companion(card){
  const snap=card._snapshot,live=card._live;
  if(card._spoiler()||!snap||snap.day!==card._today||
      !limits[snap.category]||live&&snap.category!==live.category)return '';
  const session=String(live?.name||snap.name||'').toUpperCase().trim();
  const isQ1=session==='Q1',isQ2=session==='Q2';
  const isRace=/^(RACE|SPRINT)$/i.test(session);
  if(!isQ1&&!isQ2&&!isRace)return '';
  const race=card._hass?.states?.[card._ids.race];
  const q1Known=q1Tail(race,snap.category,[]);
  const official=validOfficial(
    race?.attributes?.start_grids?.[snap.category],snap.category,q1Known
  );
  let top=[],tail=[],label='',caption='';
  if(official.length){
    top=official;label='🏁 Publicerad startgrid';
    caption='Evenemangets publicerade grid · ordningen kan ändras före start';
  }else if(isQ1||isQ2){
    top=currentRows(snap);
    if(isQ2)tail=q1Tail(race,snap.category,top);
    label='⏱ Kvalordning · preliminär';
    caption=isQ1?'Q1-tider · inga startplatser fastställda':
      'Q2-ordning + Q1-utslagna · ännu inte officiell startgrid';
  }else{return '';} // never invent a race grid
  if(!top.length&&!tail.length)return '<aside class="nt-qual-aside" aria-label="Startgrid">'+
    '<div class="nt-qual-title">🏁 Startgrid</div>'+
    '<div class="nt-qual-empty">Inväntar verifierade kvalresultat.</div></aside>';
  let content='<div class="nt-qual-start">Start / poleposition</div>'+waves(top);
  if(tail.length){
    const label= snap.category==='MotoGP'?'Q1 · ej vidare · från P13':
      'Q1 · ej vidare · från P19';
    content+='<div class="nt-qual-group">'+esc(label)+'</div>'+waves(tail);
  }else if(isQ2&&!official.length){
    content+='<div class="nt-qual-empty">Q1-utslagnas platser inväntar verifierat Q1-resultat.</div>';
  }
  return '<aside class="nt-qual-aside" aria-label="Kval och startgrid">'+
    '<div class="nt-qual-title">'+esc(label)+'</div>'+
    '<div class="nt-qual-caption">'+esc(caption)+'</div>'+
    '<div class="nt-qual-rows">'+content+'</div></aside>';
}
function install(){
  const Timing=customElements.get(TAG);
  if(Timing?.buildInfo?.version!==REQUIRED){console.error('[MotoGP qualifying grid] Unexpected timing card');return;}
  if(Timing.prototype._motogpQualGrid)return;
  const original=Timing.prototype._timing;
  Timing.prototype._timing=function(){
    const html=original.call(this);
    const aside=companion(this);
    if(!aside)return html;
    const marker='<div class="nt-scroll">',suffix='</div></div></section>';
    if(!html.includes(marker)||!html.endsWith(suffix))return html;
    const middle=html.replace(marker,'<div class="nt-qual-layout"><div class="nt-qual-main">'+marker);
    return middle.slice(0,-suffix.length)+'</div></div></div>'+aside+'</div></section>';
  };
  const previous=Timing.prototype._render;
  Timing.prototype._render=function(){
    previous.call(this);
    if(!this.shadowRoot?.querySelector?.('[data-motogp-qual-grid-style]')){
      const style=document.createElement('style');
      style.setAttribute('data-motogp-qual-grid-style','');
      style.textContent=CSS;
      this.shadowRoot?.appendChild?.(style);
    }
  };
  Timing.prototype._motogpQualGrid=BUILD;
}
customElements.whenDefined(TAG).then(install);
})();

;
/* MotoGP Next circuit layout & track weather in the event header.
 * Track outlines derived/simplified from:
 * GameDev-Toolkit/global-motorsport-circuits-json (Apache License 2.0).
 * https://github.com/GameDev-Toolkit/global-motorsport-circuits-json
 * Diagram only: no official corner/start-finish or rider position asserted.
 */
(() => {
'use strict';
const TAG='ha-motogp-next-overview-card';
const REQUIRED='0.2.0-split.2';
const BUILD='header-track-weather-20261109-02';
const BRAND_SRC='data:image/webp;base64,UklGRi4SAABXRUJQVlA4ICISAADQZwCdASoAAQABPlEmkEWjoiGlpFRKgLAKCWcIkYwBtFPojiS18leS9cDPU9UzN63Hqa/OP+v9Q/+wfkz27f496Cf4d/Ov9R/cvf39HP//9QD/q9QBz5fsxftj/vf9L7NX/YzX3rM/lF0YntV+5XGN2wf5b8s/yH5+/lZ/d+oF+O/yP/JfkX+TvOa7L5h3sZ9R/6fqUzHfwn2S87nyd/DRoAfo//mepz/qf6n+7/uL7xfzb/Qf9n/IfAZ/KP67/zf7r+9Pxd+yL9nfZL/Uf//ki9J15Ucw4lbJ/WafiMjTYkaqV6O3ElhXaw9+530W5tdUv5PXPSskaEA7BAgMfIHozD8oOta9/hHqOkc/ayphf2ZznKbktQP/VilRJ8FG2IIrW7GEbF4gMLpsOSOm+FyXN/nA2jz/3M4ER0fHG0SeTTtH2UXu+tNijP/Q0+2fDEC/G2QuNNlRO/xItQnHNiQeGUyIDL00aRdQCn12iGvcmJY8kXXq1haHIszDQbfP69rjGBpABlLxoncxnwxHg1fDpXM2GozK4g6m2nsG+VTfcosdo1tzUgb+g6Ad4rICuEvOZYrtCQcsFJbiI/21U08M8pcV6Ve5cyJG0j6C0ufFYIPlxfI+pYJ1ySRUJZ89uwMvumXUUlzfLpUsSoXeD5Gr0P2a1x9pDNtSQ/XCJAbYIgAibHQT1hVs0aqQdp0l+XOEkbqxlnyEuMYFv46fSxT0GVE44+WgGF46luIj3GmqVlOvjfBp/Pl/T9Dw2fxQqlvTWT7Ywiz26aJqXZH309JlKX5x1JQOzIj7ETZ8bcOY7Tky6wBv2wfKQafHdY99fvBhCk0PO7XroM/VL3Jqo4p/6TM2iYsrVDY9+Sg//176jRLetWW5sUVd2B/3LbPtQhlfkr4En/9Xb0uv719GDlul8WDN4zFtDwd7SLHHduX1xMjl9hASFGyiejtybc+bzIie53XWmUhUTwn7yrflLJXQNyXwaVXa1qOQTdzLItHxRXlVe9128CAKRV7UMV5MKWa6GMVrZnaayn7bsk7wHX3NkNiQN9wVRwnm1Tvi0+A/3p/xkk/LRAyWOWhv4o+4mKV0qDXFmxpXKISKOaHJUqKJdtVPznkxAAD+eFhe7cwzj103sb7Rz12f3UWG4pi2THsVDmDPkgGMiPKRLzanWqZOw8K40foPehWW0So6J/e5oj9CsFNdsCx1pZD5zsUar0thA1uUBt+uKx2HD3qwAnFGpH2b7cAngffiZxbYrmVHYt6GcQuMpXnXIQfPWTrb7vY5aD9AXlYxrwEZgdhAMpo87cGpC09Z3DpRRutgerCOh99UDDWYPxnArLKnaSG4iwERjEveuEOImDVq7z2OGvOGEv9ZtZYLmFjvo2CV1w1XZUWmmZRkUFDQWY6S92L3RQaxTSgSCyY5JL8j3wEQMGMJtHkSWphtjV58OG13PQLhjOiXfQZRZq4KbgTwjBmX42LPiJj/XMuqmTcXEKCoGlfAcGUo2Yejf8Zoc/qJOadirflqdTLtKykbjTActiltTSxDxE0+2chbrlWCLw2flIFG4S7Cug1FqkYFQvXz7J+SSbcSXAWGeMVzqigUJjeu2Es+BfnLPYFvKaRU9zg1ezUt4BQ8NbAvtgiZLKljjJUSYD5yTBgj2oskZfkf3jvPPUrpAHVsUCejnNI41G03HptDSWtBPi8uQycST6P4jGhsfcQaKH9t0zCb1bjbUkB0VLn+frHjgs4e1/cqjSIahtkbJEMB2gQPDSkukErIoTCjqooFOzbi5IkVTktvNnB1TM3aT11xa19yLCCyON6SwFt1mL1V3hUf8p4Ps2BMY4WbJqYkyp5Woe6iJ5HuyfqTrvXHprI09faD/dwHVJEPzSg6g7iw1AhVBoQGknLmpMsrmpI5mdfqw8+G9iBIyRQdRBXvZ6bEkKfTyhNtU8+y5hi97hS3676v0bi7r8RfsaAcBqkshDDW7sla1EOaXDeKtDMFffNxVia2pp4RNhPZFQKzD6cTciOAcEqZ9yt9ZpZBakgIWR+ZfD0o9aB8P13RpdYQlGf8plZszDvpkPZtNTReedpqSdoydsiW7wsMUnZA4JTlAEHzMpSz7cy5P9N38ltgjZrtwzAOTwojYtslVncaWN/yL0qAK6HRP/VFx76guUufo/I0Ka9JcTUYZ6DWkXzV6omgHboaWgGDh2/T7hL/3Y/I3Ti3UfSvsMHcuIhnPa32pVxbdtiliSBr1zoa25aU6Yi63Zw78/b1/8uqrDRvjm2i1aanELZJvgbva1XlrtoS+pzqkpURdT1+H26AnizyLBb6XxrIRpNwGfJjusATT5KB4yD4JaX2lXi525cQ8z3nb9p9Khp9zWb1HtzN7Sqka4UoHlyrJv/ynZj9NPDn8F+uJ1VsXBEsTYlLFmDRR7XiPDiH4htd9r9L8Py0X73+J/GMfvIhLXdwBwb+GoYreyjD/MxcbSFB5ZVo2rBaAAL2TT1UcX2WiNkxUhZ6gypEnI/3VL7FMkqfp4nVR0LoLVw8hxIeXjmCrL9f2Wcra8uGLyYXHcS6ae7yFcY42TtZO6h+SK9vYakZGAeUgKpcvDUFaG/41r5//AFAYiXyqhjYVjoYZXdaj6R8QiiV/8DSjB0JBY/GaZRO+60X/Vq3qRWm+9BItzfWkooXZzu/jao0cvyFslsV16pih1I7TB/a/ICULgNYEg5Fxz38sj8Q7wJFvHTx5c616+BE08JyGdJ528LTy2xbtlL2z1wY12U19MAABT5SgMwAbt9mb+Q2bQagbzD8hcUBffa/szjo4I1zfwDnvEtTVvq+GoQJsrK6eV1HTv7/trwxDnyvfkZRenTXsobqs1fHLzmitdmVGNz4mArb3kstc/bWAxywWPmqg9FsQ6yEGAvPYejhtCyk9Oq4zn9tKK+L/iVX4EwfjA0qdcvgpVfwL4Dc0qDjxdb2mOaYNzyVIGpvjK36hKPVyUmHtYyHOS2+EdLv++cl4g/yJm7V9GEDuKTKv4vxKCdKkuLrtXtFtRQ7qsYC2oRS+iIL2YsxlyiZ9ng/xowMHzq90DgcEFNw5QnZTRlzq7T+W+hjp3PSe6yfDYn+H5JwrrXRsXfKJiN/kQFq3reLskrK2NJ8k+8JQmFvLYZO/qV9Gmb/OW4i1t/ylqJvvKZ17yj1HiJ6+YjPb/kBsgve398k2cjwIqc5v59IPKGd8OrhtwhEucdWhhS6af0yCOYad/qvc/IBkScxlQpjmGeEo2I5mt5VGDVOMq+5tVcCJ//2tGh2A9y7ImpfJQScI/TZVnYIV+Yj/6agc7FXfJ3tmFuAquBWmLP3e6/z+SJMclYEf/9edljUgjZ7xVkVnwENzeSIaDOnFKXNEbo9MJv3atrEYHtA6EKmeBOlEfFCs8Ufn+tnagguG9ZGYpPzXtJDwZ91rHAZ9FLAb5oEVr+W0rZnH+K6Sxw/k1FjCOHOy7tQY2ggmQIOCOYsbjm6WNU2xRO4QTrc2QrdihB3TdwrLO571nIxuVsc9n84DIqd9beHRvjSygYnUmnbI7YX4b8bS1kNfa4cytOKjW/uChSk+wcAP6LwD/mRlP8Qi8TIUhaeTWrfm2LkjSuuKrU77Cau7itUmCsmUU+O8R6qlRHPXlO26B2apu7/zvMo3du4b3dd3Dhhbom+KziZuehJUhh/xY/JyvYe7Ziv0zYbc2xBdU+uhd3dbdjln0/jah2pg+w8vzYfvs55Xl707UKRyvNfwWilXNq5npBN2p1kD4W4HkibzmTewH4OZJtPxuL5mcB0FucvWddCRD2KRatbrp7YZno+S0w2xrHrIzMphIoE629e8CUT7lntqn1zIhuM9nfrCSXj6JKKmtRoXfAtKYcDY1QC2QD8SefX8yCi6NgbFVURcn/9GuWNFTQjqffz4p5c5qeegi0Ly/7EiO/wKpkWZyiKf/2kR1emIwHaNGxymXrlNg/BFzfQtNBKCsO6uerKf3iWGY2xLlIH1sgwtR/OyXEuqNauBZqQbRthQf4euP1iH5SsHcFo7JnRrvPZjYlA+ne9VlpcPvabmMrSvMOlgNDpOnPM38HYgo3d7HjO/ZpZwEU55EzyM2L09RuRfzqL2l/Nhul5WTMyeEkW2jhWjsaBKu5XL4b1YrUuslVU2Xd4IxJxfEmaXlzmR6290NKivGhtXJt+ztRjlkHgkPCVZLEfcb/nf1qCr+K+XxhERj/x//GSw8Okk8TKb8M1lz+hTw86mFtewyG6rAQ6tM03Cdp1XkwGKLfIds1TeQF6ntmFHwOSgZo95rjnGKWTZtNoV0YWRfUHvG1toPZfoNEztlsz0kT7Ql/2jypBrXYi8UDnpVaOn/XgqFPZVNrmsvHnyHQMJmBnVlmZqCDxr3qPnya3RXDPzOP/iN89SWXs/GffSUlwQTMnl6Ynlaph1KJBuzZuqMXNgYc7JcR6jbduTjnfP9zAlztTYw/T1IjOlxas5bOHl3Jx971asagCSsB9ZVLlvoeczs9T+epFGZRRGXnpMVx7EqjjCzGCPI0euQDraC3XRA9d8RrsYnrhIDZrYDBCRmYx8nihYaJlHdFvnMknmifewUEwK9T1329mTkFDJM4ZshJYfJyOTzSBpGyBRhAtnovyhN0pEoobpHKL7vt6KIP4drL7aK5DPwhNB4RJEQzvh9LZQ0tXZyVF3NvlPpoYe6Io04PAAmMTbKRAqfblELKaV05wJ5ppjpw8ypTB0g+T7v37G85pwqgnqpP8EKscrJ6hj+sOhSBnUDlKJ5xUE1ZnicI80j4tFGcO2nI8FM+vryD1H+B/tVj1QdDamxUFBUgTthw7YTBtWyou/tYVimeDkq3FATPvsgpN7G971RFOvZRbjuybzUcYFp3OnVaKooQ/ULdTEztDnuv/T5l2pIqeIEbZH4dT4edwg+Ly+S/h6U95K0yde+9T3WaPDIoOAfY3XiVuWvoL1KAnb1tLxj43arynIcq3UGMSJ51adM5dXMT21lTy+dK45SUv5dr80REf+UvSLhOlsZ4wlmZHRHvD3IWwnbqZ9rPRzMxOLevYD3rbOIYAEJhuhSU7t6cTLG0cTLGC+ushx0kJOZeE5CaX2+wM19++uKHwHDE7JDiE8/Rc2BPAr1HdOveOqdRAPHBQmy5caPRy9Hz0tOM3ShmCJwEYpypHc4pCaaK5W89utT6RXB46sY7KVhi37FWWfh49gd3tLjWckHYevJibFAD3IOH0wd8XbYBxNjvZIpEfrbUYG45/rOMLzA6hvUkEiE8w9dNnhhFwR3jr9O7bPlIqWXrzupUBpLFvO3+2PKkd+4yG2NM0FaJ0WvAkArTX8WgZf30/gLlo7fCRFXICB9xN2Peb7jAnap/GFqMb3loLWYC5m6V+NbZLcQY8jbzHg3Wq5CSwooEwzZGvuU8CFRFrI5ZeOeEs9VHLMlrRUpI5Ulgo4ZHpgggPiQDEUk6vO7gXR33QtlAjJfsOZXDrlT8p59kquUPlJDG2RezP8DdI0doUPjHGBpiMjbodVo61tCkf9OY5yYXiUL9NamqcKWgN2EiWSsLIwsojT6RZNph3QuIDik2SJ5oidJ4Dv94nwbBk0R5opPYYKjzo+3cVjvAMIZicz6/R9r4qkPrOGmNUNFKpVCtjgd6FjuKP2lnzh/w6+gwDmGd0wj9u23ZC7fvtXbab2TsWiJFxWImbqNdBdJcglDoo7BUoWKXTDSAoy3yHNrIyVeS3LWjLE/JOms0VjE8JNlg18XpUKuI3XqhGWFGCVUBdhbZKYpwDjpfUZ4VafNGAV/0sxz7pb8wxSXolGVZSPmG33pNe7m5LLS8pOtH5gPaTtyz2xbXmT0taLJR0ZFgCf13/OzQA7ZavyngCcO0TkUKAMXZQFPC3V+DVltr9qp1saSgoFy0TRIYPTxAVswepwAcpP5i0brQnkpc+IRpB1us4VWv4JpRGQliSGs0n0It5B5jT5WY4axZgV8/df2YwlwCzk+m1N150EVgOVMbZI+9y7AcAo4XUr9YnxMmN/mwNn6e2yA91y+KESTvMXgdu+lru7HhGXQwf7WoXBQMWPGwTcsUhV8lJ0Rb2mbyiZlm8tgq/pcPobcgOlRtf3dZJ+a8dsYYHrPSFY9k5Nd1EOQHOO2NY5e0hP9nHI18AvtXNuvOoId0GS2yCsyfUw+2+7pU1bVivyIm7VV9smf7SD2Pu0lP0PIAA';
const TRACKS={"lusail":{"names":["lusail","losail"],"d":"M111.3,49.6 L111.3,39.4 L112,37.1 L113.3,34.9 L134.8,11.3 L136,10.6 L138,10 L140.1,10.2 L141.8,11.1 L148.3,17 L149.3,19.5 L149.2,22.1 L148,24.4 L134.2,39.6 L133.7,41.5 L134.5,43.3 L136.4,44.2 L137.9,44 L164,33.8 L166.1,33.9 L168.5,35.2 L170.1,37.5 L170.4,40 L169.3,42.9 L164.6,47.4 L161.9,51.2 L159.8,56.1 L158.5,61.8 L157.2,64 L155.7,65.2 L154,65.9 L141.3,68.9 L140.1,69.4 L138.8,70.6 L138,72.3 L138,73.5 L138.4,75.2 L141.8,79.1 L146.3,82.6 L150.3,84.7 L155.6,86.6 L160.6,87.3 L165.1,87.4 L186.3,84.9 L189.5,85.5 L191.7,86.7 L194.1,89.5 L198.8,98.2 L199.4,100.5 L199.2,101.9 L198.5,103.8 L190.9,115.7 L188.8,117.4 L186.2,117.9 L162.2,113.1 L160.3,113.2 L158.4,113.9 L156.2,116.2 L139.9,147.7 L138.1,149.3 L136,150 L133.8,149.8 L131.8,148.8 L130.3,147.2 L91.9,77.3 L89.1,72.9 L81.5,58.4 L80.7,56.2 L81,53.2 L82.5,51 L84.8,49.6 L87.3,49.5 L89.4,50.1 L102.7,58.5 L104.8,59.1 L107.1,59 L109,58 L110.5,56.3 L111.2,54 L111.3,49.6 Z"},"mandalika":{"names":["mandalika"],"d":"M123.5,126.4 L186.3,127.8 L189.4,127.6 L191.4,127.1 L193.3,126.1 L194.9,124.6 L195.9,123 L196.7,121 L197,116.7 L193.7,102.9 L192.6,99.5 L190.9,97.2 L188.9,95.8 L186.8,95.2 L182.4,95 L179.7,93.9 L177.7,91.7 L176.7,88.9 L176.9,85.9 L178,82.6 L179.7,80 L184.3,74.6 L185.7,71.9 L186.7,68.7 L187.2,65.2 L187.2,61.3 L186.4,55.6 L185.4,51.2 L182.6,45.1 L178.2,39.4 L171.4,33.5 L168.4,31.6 L165.4,30 L162.1,28.9 L158.4,28.2 L147.9,28.1 L142.3,27.2 L137.8,25.7 L124.6,19.6 L114.3,16 L106.3,13.7 L91.8,10.3 L89.3,10 L87.2,10.3 L85.2,11.4 L83.8,13 L83.1,15.1 L83,17.6 L84.1,22.5 L88.5,35.8 L89.8,38.6 L92.4,41.8 L95.9,44 L99.8,45.2 L106.2,45.5 L109.8,46.3 L113.5,48.1 L116.9,51 L119.3,54.4 L120.9,58.5 L124.4,76.7 L124.4,79.4 L123.9,82.1 L123,84.5 L121.6,86.6 L117.9,90.1 L112.3,93.4 L109.8,95.2 L107,98 L104.5,101.5 L100.1,109.7 L96.2,120.6 L95.2,124.4 L94.7,127.9 L94.7,131.5 L95.2,135 L96.3,139 L97.9,143.1 L99.7,146.3 L101.7,148.8 L103.5,149.9 L105.3,149.9 L106.8,148.8 L107.7,146.7 L107.8,145 L107.3,142.7 L104.1,135.6 L103.5,133.6 L103.7,131.2 L105.2,129 L107.6,127.2 L110.7,126.3 L123.3,126.4 Z"},"goiania":{"names":["goiania","goiânia"],"d":"M155.1,40.4 L40.8,41.1 L30.7,42 L25.6,43.6 L21.5,45.7 L17.4,49 L14.3,52.7 L11.8,57 L10.4,61.4 L10,66.1 L10.6,71.1 L12,75.5 L14.3,80 L21.6,88.7 L28,93.5 L47.5,105 L61.9,112.9 L72.7,117.2 L82.8,119.3 L95.4,119.6 L106.6,118.8 L115.3,117.5 L120.7,116 L125.5,113.5 L129.6,109.7 L132,105 L132.4,100.2 L130.6,95.7 L127.9,92.8 L124.6,90.7 L120.8,89.5 L116.5,89.1 L109.3,90.4 L97.6,95.8 L91.5,97.5 L83.5,97.8 L75.8,96 L58.4,87.5 L50.3,82.7 L46,79.1 L43.5,75.7 L42.5,72 L43.3,68.6 L45.6,65.5 L51,62.4 L57.2,61.5 L63.5,62.2 L76,65.7 L84.3,66.8 L93.8,66.5 L111.8,63.8 L120.6,63.2 L135.3,63.8 L146.5,65.9 L154.4,69.2 L156.8,71.4 L158.6,74.1 L159.2,78.9 L156.5,88.6 L157,91.7 L158.7,94.5 L162.2,97.4 L166.6,99.7 L171.7,101.1 L177,101.4 L186.3,100.4 L198,97.2 L257.1,74.8 L261.9,72.5 L265.6,69.8 L268.3,66.5 L269.8,62.8 L269.9,59.6 L269,56.5 L266.7,52.6 L263.7,49.1 L256.7,44.6 L246.5,41.4 L234.9,40.4 L155.5,40.4 Z"},"brno":{"names":["brno"],"d":"M85,10.9 L30.7,10.3 L21.7,10.9 L16.8,13.2 L13.1,17.4 L11.1,23 L11.3,28.5 L12.6,31.8 L14.5,34.7 L17.2,37.3 L20.2,39.1 L24.6,40.5 L40.2,43 L55.1,47.8 L71.6,55.1 L104.4,70.9 L108.6,73.5 L110.6,75.8 L111.9,78.5 L112.5,81.4 L112.3,84.4 L110,88.7 L102,95 L99.3,98.6 L98.3,104.1 L100.1,109.5 L104.8,114.3 L149,146.7 L153.5,149.2 L159.2,149.9 L161.7,149.1 L163.7,147.6 L166.7,142.5 L169.3,132.9 L168.5,128.7 L166,125.3 L163.1,123.5 L154.5,120.5 L152.3,118.8 L150.7,116.6 L149.7,113.4 L150.1,110 L151.8,106.8 L154.6,104.4 L160.1,102.5 L178.5,100.4 L181.5,100.3 L184.4,101 L187.4,103 L189.5,106 L190.1,109 L190.3,115.6 L192.3,119.9 L194.5,122 L196.9,123.2 L202.5,123.5 L208.8,120.7 L261.4,88.2 L266.2,84.5 L268.5,80.9 L269,76.6 L267.6,72.3 L264.5,69 L260.2,67 L253.4,66.8 L228.8,71 L225.2,70.8 L222.1,69.8 L219.8,67.9 L218.2,65.2 L217.1,56.9 L215.6,53.1 L212.7,50.1 L208.3,48.2 L202.1,47.2 L143.6,44.6 L136.8,43.4 L132.4,40.7 L129.2,36.6 L127.9,32.5 L127.7,25.1 L126.8,21.2 L124.2,16.6 L120.3,13.2 L115.7,11.1 L109.5,10.1 L85.3,10.9 Z"},"buriram":{"names":["buriram","chang international"],"d":"M36.3,87.8 L56.3,123.1 L60.7,129.9 L63.9,133.5 L67,135.8 L70.3,137 L73.8,137.2 L85.8,134.9 L154.4,112.2 L186.8,102.1 L203.7,98.1 L248.9,89.8 L259,87.4 L263.7,85.3 L267.1,82.5 L269.4,79.1 L270,75.4 L268.5,71.3 L265.1,68.4 L260.3,66.9 L254.5,67.2 L200.8,80.8 L114.6,101.1 L102.3,103.2 L93.5,102.9 L86.1,100.9 L78.9,96.9 L49.6,73.2 L46.6,69.2 L45.3,64.6 L45.8,60.2 L48.1,56.5 L53.9,52.6 L60,50.4 L66.4,50.3 L72.3,52 L77.6,55.1 L81.6,58.9 L84.6,63.1 L89,71.4 L92.4,75.6 L97.5,79 L103.4,80.7 L108.2,80.9 L114.7,80.1 L157.2,71.5 L163,69.7 L167.1,67.1 L170.3,63.5 L172.4,58.8 L173.8,50.2 L174.6,36.6 L173.3,30.7 L170.4,26.5 L167.6,24.4 L164.7,23.1 L161.5,22.8 L158.4,23.3 L154.9,25.5 L148.3,32.5 L143.4,36.3 L138.2,38.7 L132.4,39.6 L122.2,38.5 L104.2,32.5 L92.8,31.1 L26,31.9 L18.9,32.4 L14.2,33.5 L11.6,35.2 L10.2,37.5 L10.1,40.2 L11.1,43.9 L36.2,87.6 Z"},"valencia":{"names":["ricardo tormo","cheste"],"d":"M110,29.6 L224.6,29 L235,30 L243.1,33 L247.3,36 L251,40.2 L254,45.4 L256.1,51.4 L269.3,110.2 L270,116.9 L268.8,121.3 L266.5,123.8 L263.4,125.1 L259.6,125.2 L255.9,124 L252,121.3 L247.2,116.7 L238.4,106 L235,98.9 L233.7,91.3 L234,84.2 L236.3,70.5 L235.9,63.8 L234.5,60.2 L232.5,57.4 L229.4,55 L225.8,53.5 L219.9,52.4 L213.2,52 L207.3,52.5 L202.4,53.9 L198.2,56.2 L194.9,59.5 L192.7,63.2 L191.7,67.4 L192.3,72.8 L194.6,77.7 L212.2,98.7 L220.4,111.4 L221.8,115.5 L222,119 L221.1,122.3 L219.1,125.1 L216.7,127 L213.1,128.6 L202.6,130.6 L153,130.8 L140.3,129.7 L129.8,127.3 L116.5,122.2 L102.8,115.6 L96.7,111.3 L93.7,107.3 L92.7,102.4 L94.3,97.2 L96.4,94.4 L99.1,92.1 L105.9,89 L115.7,87.4 L125.7,88 L132.6,89.9 L138.7,92.8 L153.6,104.3 L160,108.2 L167.9,111.1 L174.9,111.9 L178.8,111.3 L182.4,109.8 L185.1,107.6 L187,104.7 L187.8,101.3 L187.4,98.3 L185.9,95.2 L183.5,92.6 L176.7,88.8 L130.1,67.8 L124.1,65.6 L119.1,64.6 L113.6,64.9 L108.3,66.4 L103.8,68.9 L91.6,77.1 L85.7,79.7 L79.2,81.6 L72,83 L65,83.3 L58,82.8 L51,81.4 L44,79 L37.3,75.6 L30.8,71.3 L24.7,66.3 L19.1,60.6 L14.7,54.9 L11.6,49.4 L10.2,44.5 L10.3,39 L12.1,34.8 L15.9,31.4 L21,29.7 L109.6,29.6 Z"},"misano":{"names":["misano","simoncelli"],"d":"M151,97.5 L134.5,61.8 L127.5,49 L124,45.3 L120.1,43.1 L116.3,42.4 L107.6,42.7 L104.8,41.9 L102.4,40.3 L100.9,38.5 L99.7,36.1 L98,27.4 L96.4,22.9 L93.7,18.6 L90.2,15.3 L86.5,13 L82.3,11.4 L77.4,10.3 L72.2,10 L46.1,12.5 L41.9,13.7 L39.4,15.6 L38.4,18.5 L39,21.6 L41.2,24.6 L44.4,26.7 L46.9,27.4 L49.2,27.4 L58.9,23.7 L62.1,23.3 L65.1,23.4 L68.3,24.3 L71.5,26 L79,32.2 L103.4,57.8 L121.6,79.3 L132,93.2 L142,107.8 L144.5,112.5 L145.3,116.6 L144.1,120.7 L141.1,123.6 L136.9,124.7 L131.1,124.1 L124.8,122.1 L117.2,118.5 L93.4,103.7 L85.3,99.5 L80.1,97.9 L74.7,97.1 L69.1,97.3 L65.1,98.3 L62.9,99.7 L61.6,101.6 L61.2,104.1 L61.8,106.5 L63.4,109 L65.9,111.5 L72.9,116 L150.3,146 L161.5,149 L171.5,150 L181.3,149.4 L195.2,147 L207.6,143.6 L217.2,139.9 L225.6,135.2 L234.2,128.7 L238.7,123.5 L241.1,117.9 L241.6,113.2 L241.2,108.3 L239.8,102.1 L237.6,95.6 L236,92.7 L234.2,90.9 L231.8,90 L229.5,90.2 L226.9,91.9 L225.1,95.2 L224.6,98.7 L225,109.4 L224.5,115.1 L222.5,120.4 L219.1,124.7 L213.6,128.4 L206.1,131.6 L182.8,139.2 L178.9,139.8 L175.7,139.5 L173.2,138.6 L170.8,136.9 L166.7,131.4 L163.4,125 L151.1,97.8 Z"},"motegi":{"names":["motegi"],"d":"M65.5,87.4 L50.8,113.5 L47.9,120.2 L47.6,124.1 L48.7,127.7 L51.1,130.5 L54.3,132 L57.5,132.2 L60.9,131.1 L64.4,128.8 L67.6,125.4 L98.1,79.4 L107,66.8 L110.7,62.2 L114.2,60.2 L118.1,60.1 L122,62.2 L125,66 L126.7,70.6 L126.8,75.2 L125.5,79.8 L122.7,84.4 L114.7,93.3 L92.9,115 L78.7,130 L73.3,136.1 L71.3,139.7 L71.1,142 L71.9,144.3 L73.5,146 L76.1,147.3 L80.4,148.2 L100,149.9 L106.1,149.7 L111.9,148.1 L117.1,145.4 L121.9,141.5 L125.2,137.7 L128.4,132.9 L138.7,112.8 L141.6,109.1 L144.6,106.5 L147.7,105.1 L151.4,104.7 L154.3,105 L160.8,106.7 L164.2,106.8 L167.9,105.6 L171.2,103 L173.9,98.3 L174.9,93.2 L174.6,87.5 L172.9,74.6 L172.9,67.2 L174.1,63.3 L176.4,61.3 L178.3,60.9 L180.7,61.2 L185.2,63.6 L208.4,85.5 L224,98.5 L226.9,99.6 L229.5,99.3 L231.5,97.8 L232.4,95.2 L232.2,93.3 L231.4,91.3 L227.7,87.1 L148.8,14.5 L144.6,11.1 L141.5,10 L138,10.8 L134.9,13.4 L132.6,17.5 L128.9,26.5 L126.7,30.7 L123.7,34.6 L119.7,37.9 L115,40.1 L110.4,41.2 L105.8,41.2 L100.1,39 L97.5,38.6 L94.4,39.3 L91.5,41.5 L88.6,45.4 L65.6,87.2 Z"},"aragon":{"names":["aragon","aragón"],"d":"M193.6,72.7 L173.5,88.3 L170.9,89.9 L168.5,90.6 L166.1,90.4 L163.7,89.3 L156,79.6 L152.3,77.1 L148.2,75.6 L144.3,75.2 L139.9,75.9 L129.9,78.8 L125.1,81 L120.2,84.8 L117.5,89.5 L116.4,93.8 L115,107.1 L113.5,112.7 L111.7,116.7 L109.2,120.2 L105.8,123.6 L102.4,126.1 L99.4,127.2 L95.9,126.8 L93.2,124.2 L92,121.1 L91,113.8 L89.9,110 L87.7,105.7 L84.2,101.3 L79.1,96.7 L73.9,93.1 L70.5,92 L67.1,92.5 L64.6,94.5 L63,97.9 L57,130 L57.3,133.2 L58.4,135.6 L59.9,137 L63.4,138.8 L64.6,140.2 L64.9,142.1 L64.2,144.2 L61.5,146.8 L57.5,148.7 L52.7,149.8 L48.1,149.9 L44.1,148.8 L40.6,146.9 L37.6,144 L35.6,140.5 L34.4,135.8 L34.6,129.8 L36.7,117.5 L39.3,108.4 L43,99.5 L48.5,89.2 L53.9,81.3 L57.3,78.1 L60.5,76.9 L63.7,77.1 L66.1,78.2 L71.8,82.1 L76.3,83.6 L80.3,83.8 L84.4,82.8 L89.7,79.9 L99.4,72.6 L101.6,70.5 L102.4,68.8 L102.6,67 L100.5,61.1 L100.4,58.3 L101.6,55.9 L104.3,54 L239.9,10.7 L243,10 L245,10.6 L245.7,12 L245.1,13.5 L239,17.3 L236.3,20.7 L235.2,24.7 L234.8,32.1 L234,36.1 L232.4,40.2 L229.6,44.2 L224.3,49.3 L193.8,72.5 Z"},"phillip":{"names":["phillip island"],"d":"M123.2,47.8 L183.3,72.3 L191,74.4 L198.7,75.1 L204.6,74.6 L210.2,73 L216.1,70.2 L221.3,66.6 L227.8,59.5 L234.9,46.9 L238.7,41.5 L243.3,36.9 L248.3,34.2 L252.5,33.1 L256.5,32.9 L260.2,33.6 L263.4,35 L266.1,37.2 L268.3,40.3 L269.6,43.8 L270,47.5 L269.4,52.4 L267.3,57.6 L264.1,62.4 L259.2,67.9 L233.3,90.2 L225.1,96.2 L218.8,99.6 L209.6,102.4 L199.2,103.1 L184.4,101.1 L161.9,95.8 L156.9,95.7 L153.6,97.4 L152.3,99.5 L152.1,102.1 L153,104.5 L154.9,106.7 L160.7,110.1 L180.7,119.1 L183.9,121.6 L186.1,124.6 L187.1,130.1 L185.2,134.6 L181,137.8 L174.1,139.4 L159.7,139.4 L150.6,138 L141,134.9 L121.6,126 L115.6,124.3 L109.8,123.6 L103.7,123.8 L97.1,125.2 L79.9,132.6 L71.6,134.9 L62.9,135.5 L55.5,133.7 L51.2,131.2 L47.5,127.7 L44.7,123.1 L43,117.9 L42.6,113 L43,107.6 L47,90.2 L46.9,87.6 L46,85.4 L44,83.8 L40.9,83.5 L37.9,84.2 L29.4,88.2 L25.4,88.4 L21.8,87.6 L18.1,85.5 L15.2,82.4 L12.7,77.9 L11.1,72.4 L10,64.1 L10.5,53.9 L12.2,44.9 L14.9,37.6 L18.6,31.9 L23.4,27.2 L29.4,23.5 L36.1,21.2 L41.3,20.5 L46.9,20.6 L59.6,22.7 L122.9,47.7 Z"},"sachsenring":{"names":["sachsenring"],"d":"M78.6,53.1 L159.3,107.4 L178.3,119.5 L195.6,129 L201.3,130.3 L205.7,129.9 L208.6,128.5 L210.8,126.3 L212.1,123.3 L212.2,119.7 L210.6,115.1 L203.7,105.2 L200.6,98.9 L199.2,92.8 L199.8,86.1 L201.9,80.2 L205.6,75.1 L209.7,71.5 L219.8,64.9 L224,60.3 L225.5,56.9 L226,53.7 L225.6,50.5 L224.2,47.6 L221.2,44.8 L217.1,43.4 L212.6,43.5 L208.6,45.4 L204.9,49.7 L200.7,62.3 L195.7,70.4 L192.4,73.6 L188.9,76 L180.7,78.9 L175.7,79.3 L170.8,78.7 L166.4,77.2 L162.6,74.9 L159.6,71.9 L157.3,68 L156,63.7 L155.5,59.1 L156.5,50.4 L159.6,41.3 L164.2,32.8 L170.4,26.1 L177.7,21.2 L186.6,17.8 L195.9,16.5 L204.8,17.1 L214.2,20 L223.3,25.3 L244.7,42.6 L259.5,57.2 L264.9,64.4 L268.5,72.3 L270,80.7 L269.4,88.9 L267.2,96.5 L262.8,105.5 L255.7,116.7 L249.1,124.7 L241.2,131.8 L233.2,137.3 L225.1,141.1 L216.9,143.2 L207.5,143.4 L197.4,141 L189,136.9 L175.6,127.4 L168.4,123.4 L158.5,119.8 L148,117.9 L134.5,117.7 L113.1,118.9 L72.4,126.1 L39.1,130.8 L34.1,130.6 L29.3,129.6 L24.7,127.7 L20.4,124.9 L15.5,119.8 L12.1,113.5 L10.3,106.6 L10.1,98.7 L11.3,89.9 L21,46.2 L22.8,40.2 L25.1,36.3 L29.1,32.8 L33.7,30.9 L39.4,30.4 L44.7,31.3 L54.3,36.2 L78.3,52.9 Z"},"assen":{"names":["assen"],"d":"M86.8,92.2 L51.5,121.8 L49,124.8 L48.4,127.1 L48.8,130.3 L49.8,133.3 L52,137.5 L55.3,141.9 L60.5,145.5 L66.8,148 L73,149.9 L76,149.8 L79.1,148.6 L81.3,146.6 L82.3,143.8 L82,140.1 L80.6,137.3 L78,135.4 L74.8,134.6 L71.6,135 L66.7,136.9 L64.4,136.7 L63,135.6 L62.4,133.9 L62.7,132.3 L63.8,130.9 L66.2,129.5 L69.9,128.2 L84.6,125.5 L100.4,120.3 L112.4,115.1 L145.6,99.2 L149.6,96.4 L153.8,87.8 L156,85.4 L158.7,83.7 L162.7,82.5 L168.2,82.2 L186,85 L188.7,84.4 L191.5,83 L193.8,80.2 L195.3,76.2 L196.6,65.8 L199.8,52.8 L202.9,36.3 L204,33.5 L206.3,31.2 L210.4,29.9 L214.6,29.5 L224.5,29.9 L228.6,28.8 L230.6,26.6 L231.5,23.6 L231.4,20.4 L230,17.1 L228,14.2 L225.1,11.8 L221.9,10.4 L218.4,10 L210.6,11.4 L193.7,18.3 L190.1,20.6 L186.1,24.4 L177.5,35.7 L169.2,48.3 L161.6,64 L156.1,71.6 L152.5,75 L146.7,77.8 L140.6,78.8 L133.6,78.1 L115.3,74.9 L112,74.9 L109.9,76.1 L106,80.3 L95.9,85.6 L87,92.1 Z"},"barcelona":{"names":["barcelona","catalunya","cataluña"],"d":"M182.2,57.5 L128.5,142.7 L126.7,144 L124.4,144.1 L123.1,143.8 L118,140.9 L114.2,140.7 L111.9,141.7 L103.1,148.2 L100.5,149.3 L97.4,150 L94.6,149.9 L91.6,149.2 L89.4,148.2 L86.5,145.7 L84.5,143 L82.7,138.2 L82.4,132.2 L83.6,126.1 L86.1,120.2 L101,96.4 L102.8,94.3 L103.9,93.7 L106.4,93.1 L109,93.6 L111,94.8 L112.8,96.7 L114.2,99.3 L114.7,104.1 L114.1,107.5 L112,111.8 L101,129.2 L100.7,131.3 L101,132.4 L102,134 L102.9,134.6 L105,135.1 L106.2,134.9 L122.5,127.5 L124.5,126.4 L129.9,122 L133,117.7 L137.9,110 L138.9,107.2 L138.3,104.7 L136.9,103.1 L133.5,101 L131.9,99.7 L130,97.2 L121.1,76 L120.6,73 L120.9,70.5 L122.2,67.3 L124.3,64.7 L126,63.5 L166.2,43 L178.3,36.7 L180.1,35.4 L180.9,33.8 L181,32.7 L180.1,30.6 L177.4,28.4 L174.1,27.3 L170.9,27.1 L168.1,27.6 L164.4,29.6 L160.3,32.9 L157.4,33.9 L155.1,33.9 L153.5,33.3 L151.4,31.7 L150.5,30.3 L149.9,28.9 L149.7,26.4 L150.2,24.2 L150.9,23 L165.6,10.6 L166.6,10.2 L168.3,10.1 L169.2,10.6 L179.9,18.7 L181.2,18.5 L184,15.6 L185.1,15.7 L194.2,21.6 L196.2,24 L197.1,25.9 L197.6,28.4 L197.7,30.7 L197,33.9 L182.2,57.5 Z"},"austin":{"names":["circuit of the americas","cota","austin"],"d":"M32.8,98.1 L40.2,103.4 L65.7,124.1 L92.2,144.5 L100.1,149.8 L102.6,149.7 L103.6,148.7 L103.6,147.3 L96.4,125.2 L96.6,120.5 L98.1,116.4 L99.9,113.6 L102.3,111.3 L123.4,98.2 L126.1,95.1 L129.3,87.7 L130.7,85.6 L132.9,83.9 L138.7,81.4 L140.8,79.7 L142.6,76.5 L144.5,67.4 L148,62.8 L153.8,59.1 L159.3,58.2 L174.9,64.8 L176.9,64.9 L183,60.9 L189.6,53.3 L193.4,51.7 L195.9,51.9 L198.4,52.9 L200.3,54.7 L202.1,57.6 L204.3,58.7 L229,53.3 L231,51.7 L255.7,21.9 L261.9,13.5 L262.2,11.1 L261,10 L257,10.6 L220.1,21.8 L183.7,30.2 L154,35.2 L107,40.8 L105.8,41.8 L105.9,43.3 L117.2,58.5 L120.6,64.2 L120.9,66.1 L120,67.7 L118.3,68.5 L109.4,67.7 L107.4,65.8 L104.5,59.2 L99.4,53.5 L96,52.3 L92.7,52.2 L91.1,52.8 L90.6,53.9 L90.8,55.2 L101.9,74.6 L103.2,77.8 L102.8,83.1 L100.5,89 L98.5,91.4 L89.9,95.6 L87,96.4 L81,95.8 L75.2,93.7 L71.4,90.8 L55.6,69.7 L53.8,68.4 L51.8,68.3 L46.7,69.9 L19.5,81.9 L18.2,83 L17.6,84.8 L18.4,86.8 L32.8,98.1 Z"},"redbullring":{"names":["red bull ring","spielberg"],"d":"M193.6,130.8 L123.4,149.9 L121.1,149.6 L115,139.8 L90.6,105.5 L84.7,94.9 L67.9,59.5 L65.4,55.2 L57,43.6 L30,16.1 L29.2,14.6 L29.5,13.2 L31.8,12 L46.1,10.3 L65.7,10.3 L74.9,11.3 L126.2,20.7 L133.8,21.5 L165.7,23 L169,23.8 L170.6,25.9 L170.9,28.2 L170.7,29.8 L168.8,33.4 L165,38.3 L161.9,41.5 L158,44.3 L152.8,47.1 L146.6,49.1 L137.8,50.2 L105.4,45.2 L102,45.3 L99,46.2 L96.3,47.7 L92.3,51.9 L90.3,56.9 L90.6,62.8 L91.7,65.6 L97.9,76.9 L105.4,89.4 L108.3,92.3 L110.3,93.6 L114.9,95 L119.3,94.7 L124.6,92.5 L127.4,89.9 L131.2,84.9 L134.9,81.4 L140.2,78 L148.9,74.7 L156.8,74 L231.6,72.5 L243.8,82.8 L250.6,106.6 L250.5,109.3 L244,114.4 L234.1,118.9 L217,124.5 L193.6,130.8 Z"},"sepang":{"names":["sepang"],"d":"M104.6,85.7 L60.4,89.3 L58.4,89.2 L56.6,88.3 L55.3,86.9 L54.6,85.1 L54.6,83.1 L55.3,81 L57,79.4 L59.3,78.6 L62,79.2 L67.1,81 L68.8,80.7 L70.2,79.3 L70.7,77.6 L70.2,75.3 L65.3,68.8 L63.8,66.2 L62.9,63.2 L62.4,56.7 L63.2,48.1 L64.6,44.1 L66.7,40 L68.8,37.4 L72.1,34.4 L75.5,32.2 L99.3,24.2 L114.5,18.3 L133.4,10 L135,10.1 L136.5,11 L139.8,28.5 L144,46.4 L145.7,50.2 L147.7,52.9 L151.1,55.6 L154.5,57.4 L157.8,58.3 L161.1,58.4 L164.9,57.8 L168.7,56.3 L171.4,54.4 L176.7,48.7 L179.3,47.1 L183.4,45.7 L186.9,45.6 L190.3,46.1 L193.1,47.2 L195.6,49.2 L225.3,83.1 L225.4,84.7 L219.7,97.9 L218.2,99 L216.4,99.4 L189.3,101 L163.8,104 L149.9,106.3 L148.6,107.4 L148.1,109.1 L149.3,111.1 L159.3,116.6 L161.4,118.8 L162.9,122.1 L163.7,125.5 L163.6,130.3 L162,138.3 L159.7,143.3 L156.1,148.5 L154.2,149.7 L152.3,150 L150.2,149.6 L148.5,148.5 L117.4,122.9 L115.3,122.1 L112.5,121.9 L109.4,122.7 L98.1,128.5 L95,129.5 L88.3,129.9 L82.4,128.8 L78.4,127.2 L75.8,125.1 L72.3,120.5 L71.1,117.1 L70.9,115 L72.4,112.7 L75.5,111.4 L198.8,88.7 L200.5,87.1 L201.8,84.1 L201.2,81.7 L198.9,79.3 L195.3,78.8 L104.6,85.7 Z"},"silverstone":{"names":["silverstone"],"d":"M99.4,111.3 L122.2,81.5 L123.9,79.9 L125.7,79.3 L128,79.1 L138.7,80.4 L142.8,79.7 L145.2,78.5 L157.6,68.7 L159,68.2 L160.2,68.5 L160.9,69.2 L163.7,77.6 L165.2,78.5 L166.1,78.3 L166.8,77.7 L168.4,74.1 L169.6,69.9 L170,65.2 L169.3,62.9 L130.6,27.6 L128.7,26.5 L127.1,26.2 L125,26.4 L123.2,27.2 L121.9,29.2 L121.1,35.9 L120.2,37.3 L118.2,38.5 L116.1,38.6 L114.3,37.6 L113.1,36 L112.7,34.1 L113.2,32 L119,20.8 L122.5,17.1 L125,15.3 L127.7,13.9 L130.6,13.1 L134.4,12.6 L162.8,10.1 L166,10.1 L168.8,11.4 L170.7,13.2 L171.8,15.5 L174.1,22.9 L175.3,28.7 L176.1,35.9 L176.9,51.1 L177.7,53.9 L180.2,58.3 L180.6,60.1 L180.2,62.5 L177.9,69 L177.5,73 L178.2,75.2 L181.5,79.8 L181.9,81.5 L181.9,83.3 L181,85.5 L180.1,86.5 L173,91.1 L170.9,93.4 L149.2,133.9 L144.9,140.9 L140.3,147.3 L138.2,149.1 L135.7,149.9 L132.8,149.7 L130,148.3 L128.4,146.3 L125.8,141 L122.5,136 L110.9,122.8 L110.3,122.4 L109.3,122.6 L106.7,124.9 L105.1,125.4 L103.8,125 L101.5,122.6 L99.4,119.3 L98.2,115.7 L98.1,113.2 L99.4,111.3 Z"},"portimao":{"names":["portimao","portimão","algarve"],"d":"M124.8,113 L98.9,22.7 L99.2,21.2 L100,20.3 L111.5,11.8 L108.7,19.2 L107.7,21 L105.8,21.7 L100.8,19.8 L111.5,11.8 L113.7,10.4 L115.4,10 L130.9,13.6 L132,14.1 L132.9,15.2 L133,16.7 L132.1,18 L124.4,22.7 L121.8,24.6 L120.2,27.5 L119.9,29.6 L120.2,31.8 L137.4,91.8 L142,90.7 L144.1,68 L143.2,63.1 L141.4,59 L141.5,57.3 L142,55.6 L142.7,54.6 L144.6,53.3 L146.4,53 L147.8,53.1 L148.9,53.6 L151.1,55.5 L152.5,65.5 L159.8,74.8 L174.3,82.1 L176.7,83.7 L178.5,85.7 L179.5,87.2 L181.1,92.2 L180.6,94.7 L178.7,96.1 L160.3,101.8 L156.5,104.9 L154.6,108.1 L153.5,113.3 L154,114.1 L161.1,120.2 L163.3,120.9 L164.5,120.8 L158.1,128.5 L155.8,129.7 L154,129.5 L152.1,127.6 L151.8,125.8 L153.5,113.3 L164.5,120.8 L169.5,114.8 L171.2,113.9 L174,114 L175.8,115 L178,117.6 L178.9,120 L179.1,122.1 L178.6,125.4 L177.2,128 L168.4,138.9 L163.4,144.6 L160.8,146.7 L157,148.7 L152.4,149.9 L146.4,149.7 L143.2,148.8 L140,147.3 L136,144.1 L133.2,140.4 L131.6,136.8 L124.8,113 Z"},"mugello":{"names":["mugello"],"d":"M139.5,77.8 L146.2,63.2 L157.7,43.1 L161.2,36 L170.1,13.6 L171.5,11.7 L173.5,10.4 L175.7,10 L178.1,10.7 L179.5,11.8 L180.4,13.1 L181.2,16.6 L180.9,19.9 L178.9,29.9 L179,32.3 L180.4,34.5 L186.4,38.2 L188,39.6 L189.2,42.2 L189.4,44.5 L188.3,47.9 L168.3,78.1 L168,79.6 L168.1,81.3 L170.9,87.2 L171.4,88.9 L171.3,91.4 L170.5,93.1 L150.5,117.5 L149.3,118.7 L146.3,119.7 L138.1,119.5 L134.9,119.8 L132.6,120.7 L130.1,122.4 L128.2,124.9 L126.8,128.1 L121.5,143.4 L120,145.7 L117.6,147.9 L113.4,149.8 L111,150 L108.3,149.7 L103,147.8 L94.3,143 L92.5,141.2 L91.4,139.3 L90.7,137.1 L90.5,134.4 L91,130.7 L96.3,103.5 L97.5,101.8 L99.1,100.6 L100.9,100.2 L108.6,99.9 L110.7,98.8 L112.3,97.1 L113.3,94.7 L122.5,62.9 L123.7,60.5 L125.2,58.8 L127.3,57.7 L129.3,57.4 L131.1,57.6 L133,58.7 L134.4,60.2 L135.3,62.2 L135.5,64 L135.2,66.4 L133.1,70.6 L125.8,80.2 L125.3,82.2 L125.3,89.1 L124.6,91.8 L101.1,123.5 L98.4,127.8 L97.5,130.9 L97.6,133.5 L99.1,136.5 L101.2,138.3 L102.6,138.9 L104.9,139.3 L106.6,139.1 L108.8,138.4 L112.2,135.9 L114.7,132.5 L139.5,77.8 Z"},"jerez":{"names":["jerez"],"d":"M140.7,97.5 L127.2,124.9 L122.7,134.6 L121.4,138.5 L121.2,142.4 L122.4,145.6 L125,148 L128.8,149.5 L133.7,150 L149,149.7 L152.3,148.6 L153.5,147.6 L154.3,146.3 L154.7,144 L153.8,141.6 L152.4,139.9 L148.1,136.2 L145.6,132.5 L144.3,128.5 L143.7,123.3 L143.9,116.3 L145.3,110.1 L147.8,104.9 L151.5,100.6 L153.9,98.8 L156.7,97.4 L165,95.1 L172.3,94.2 L183.6,94 L190.2,93.6 L195.6,92.9 L199.7,91.7 L203.6,89.5 L206.5,86.4 L208.2,82.5 L208.6,78.1 L207.9,74.1 L206.3,70.2 L203.9,66.7 L200.7,63.2 L144.6,14.7 L139.3,11 L137.5,10.2 L135.8,10 L133.8,10.6 L132.4,11.9 L131.6,13.9 L131.6,16.1 L133.4,20.8 L139.4,30.3 L141.8,35.4 L143.2,41.7 L143.3,44.8 L142.9,47.7 L141.3,52.7 L138.4,57.3 L128.4,69.5 L126,71.9 L123.3,74 L120.7,75.2 L118.1,76 L115.4,76.4 L112.7,76.3 L110.3,75.8 L108,74.9 L105.7,73.5 L103.7,71.7 L101.1,68.4 L99.2,64 L98.2,59.6 L96.8,50.3 L95.4,46 L92.4,41.3 L90.6,39.7 L88.7,38.5 L85.7,37.8 L82.9,37.9 L80,39 L76.2,41.3 L73.9,43.1 L72.5,45 L71.6,47.5 L71.4,50.2 L72.1,54.1 L73.6,58.3 L81.7,75.8 L83.8,79.2 L85.2,80.3 L86.8,80.9 L91.6,81.1 L93.9,81.8 L95.9,83.1 L99.5,86.7 L102,88.6 L105.5,90.1 L109.5,90.8 L113.1,90.7 L116.6,89.9 L120.1,88.4 L123.3,86.5 L128.2,81.7 L138.4,68.4 L144,61.8 L147.7,57.9 L149.8,56.3 L152,55.4 L154.1,55.3 L155.9,56 L157.2,57.5 L157.8,59.3 L157.7,61.5 L156.9,64 L151.4,76.1 L140.8,97.3 Z"},"hungaroring":{"names":["hungaroring"],"d":"M150.2,148.1 L79.3,92.2 L78.3,91 L77.9,89.4 L78.2,88 L79,87 L81.6,86.4 L89.1,86.7 L95.7,88.2 L99.9,90.1 L102.3,91.6 L123,107.8 L124.9,108.5 L126.4,108.4 L128,107.9 L129.7,106.7 L130.9,104.9 L131.2,101.5 L130.7,99.9 L125.1,90 L124.3,87.6 L124.4,85.8 L142,49.8 L144.7,45.6 L149.9,39.1 L150.1,36.3 L145.5,19.5 L145.1,16.5 L145.8,13.9 L147.2,11.9 L149.4,10.5 L152.1,10 L155.1,10.8 L158.6,12.9 L161.5,15.1 L164.4,17.8 L175.6,29.8 L175.9,30.7 L175.7,32.1 L174,34.3 L173.7,36 L177.9,51.6 L178.9,53.6 L180.1,54.7 L181.4,55.1 L191.2,56.5 L192.7,57.4 L194.4,59.2 L194.8,60.6 L194.9,62.4 L192.7,78.1 L192.9,81.6 L194.3,85.2 L201.3,95.9 L202.1,99.1 L201.5,102.5 L199.6,105.4 L173.3,134.9 L172.1,135.8 L170.5,136 L168.9,135.3 L160.8,126.4 L153.5,120.4 L152,119.9 L150.2,119.9 L148.9,120.3 L147.6,121.2 L146.7,122.8 L146.5,124.1 L146.7,125.9 L147.3,127.3 L161.1,138.3 L162,139.8 L162.6,142 L162.5,144.3 L161.6,146.5 L160,148.4 L158.6,149.3 L156.3,149.9 L154.5,149.9 L152.4,149.4 L150.2,148.1 Z"}};
const STYLE="\n  /* All three areas live in the SAME white event-header panel. */\n  .header{container-type:inline-size}\n  .mgp-hero-grid{display:grid;grid-template-columns:minmax(210px,1fr) minmax(0,1.75fr);\n    align-items:center;column-gap:22px;row-gap:10px}\n  .mgp-hero-copy{min-width:0;align-self:center}\n  .mgp-hero-copy h2{overflow-wrap:anywhere;display:flex;align-items:center;gap:9px;flex-wrap:wrap}\n  .mgp-country-flag{display:inline-flex;flex:none;font-size:23px;line-height:1;vertical-align:middle}\n  .mgp-hero-copy .np-top-actions{margin-top:14px;display:flex;flex-wrap:wrap;align-items:center;gap:7px}\n  .mgp-next-chip{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--divider-color,#ddd);border-radius:24px;padding:7px 10px;font-size:11px;white-space:normal;max-width:100%}\n  .mgp-next-chip .next-countdown{font-variant-numeric:tabular-nums}\n  .mgp-hero-copy .np-top-actions [data-motogp-standings-toggle]{margin-left:auto}\n  .mgp-hero-copy h2{flex-wrap:nowrap;align-items:center}\n  .mgp-hero-copy h2 .mgp-country-flag{flex:none}\n  .mgp-ui-footer{display:inline-block;margin-right:10px}\n  .mgp-ui-footer summary{cursor:pointer;text-decoration:underline;text-underline-offset:2px}\n  .mgp-ui-footer div{padding-top:5px;line-height:1.5}\n  .mgp-branded-eyebrow{display:flex;align-items:center;gap:8px}\n  .mgp-brand-logo{width:27px;height:27px;object-fit:contain;border-radius:5px;flex:none}\n  .mgp-ui-details{margin-top:11px;color:var(--secondary-text-color);font-size:10px;line-height:1.5}\n  .mgp-ui-details summary{cursor:pointer;display:inline-block;text-decoration:underline;text-underline-offset:2px}\n  .mgp-ui-details div{padding-top:4px;overflow-wrap:anywhere}\n    .mgp-venue-strip{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(148px,.85fr);\n    align-items:center;gap:16px;min-width:0;border-left:1px solid var(--divider-color,rgba(127,127,127,.22));\n    padding-left:19px}\n  .mgp-weather-panel,.mgp-circuit-panel{min-width:0;padding:0;margin:0;border:0;background:transparent}\n  .mgp-venue-caption{font-size:10px;font-weight:850;text-transform:uppercase;\n    letter-spacing:.08em;color:var(--secondary-text-color);margin-bottom:9px}\n  .mgp-weather-head{display:flex;align-items:flex-start;gap:7px;flex-direction:column}\n  .mgp-weather-source{font-size:9px;color:var(--secondary-text-color);line-height:1.35}\n  .mgp-weather-metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 14px;margin-top:10px}\n  .mgp-weather-cell{min-width:0;padding:0;background:transparent;border:0;text-align:left}\n  .mgp-weather-cell small{display:block;font-size:10px;color:var(--secondary-text-color);line-height:1.2}\n  .mgp-weather-cell strong{display:block;font-size:16px;margin-top:3px;line-height:1.25;\n    font-variant-numeric:tabular-nums;overflow-wrap:anywhere}\n  .mgp-weather-condition{font-size:11px;font-weight:700;margin-top:9px}\n  .mgp-weather-empty,.mgp-track-empty{font-size:11px;color:var(--secondary-text-color);\n    margin-top:11px;line-height:1.4}\n  .mgp-circuit-panel{justify-self:end;width:100%;max-width:230px}\n  .mgp-circuit-panel .mgp-venue-caption{text-align:right}\n  .mgp-circuit-panel .mgp-venue-caption{text-align:right}\n  .mgp-circuit-facts{display:flex;justify-content:flex-end;flex-wrap:wrap;gap:4px 9px;margin-top:4px;font-size:10px;line-height:1.4;font-variant-numeric:tabular-nums}\n  .mgp-circuit-facts span{white-space:nowrap}\n  .mgp-circuit-links{display:flex;justify-content:flex-end;gap:10px;margin-top:5px;font-size:9px}\n  .mgp-circuit-links a{color:var(--secondary-text-color);text-decoration:underline;text-underline-offset:2px}\n    .mgp-track-svg{display:block;width:100%;height:100px}\n  .mgp-track-shadow{fill:none;stroke:var(--divider-color,rgba(127,127,127,.25));\n    stroke-width:11;stroke-linecap:round;stroke-linejoin:round}\n  .mgp-track-outline{fill:none;stroke:var(--primary-text-color,#20252b);\n    stroke-width:4.8;stroke-linecap:round;stroke-linejoin:round}\n  .mgp-track-layer{position:relative;width:100%;height:100px}\n  .mgp-track-layer .mgp-track-svg{height:100%}\n  .mgp-track-local{display:block;position:absolute;inset:0;width:100%;height:100%;\n    object-fit:contain;visibility:hidden}\n  .mgp-track-local[data-ready=true]{visibility:visible}\n  .mgp-track-local[data-ready=true]+.mgp-track-fallback{display:none}\n  @container (max-width:900px){.mgp-track-layer{height:89px}}\n  @container (max-width:355px){.mgp-track-layer{height:79px}}\n  .mgp-track-note{font-size:9px;color:var(--secondary-text-color);margin-top:5px;text-align:right}\n  .mgp-track-empty{text-align:right}\n  @container (max-width:900px){\n    .mgp-hero-grid{grid-template-columns:minmax(175px,.8fr) minmax(0,1.5fr);column-gap:15px}\n    .mgp-venue-strip{gap:10px;padding-left:13px;grid-template-columns:minmax(0,1fr) minmax(104px,.75fr)}\n    .mgp-weather-cell strong{font-size:14px}\n    .mgp-track-svg{height:89px}\n  }\n  @container (max-width:680px){\n    .mgp-hero-grid{grid-template-columns:1fr;row-gap:15px}\n    .mgp-venue-strip{border-left:0;border-top:1px solid var(--divider-color,rgba(127,127,127,.2));\n      padding-left:0;padding-top:12px;grid-template-columns:minmax(0,1.25fr) minmax(115px,.75fr);gap:12px}\n    .mgp-weather-metrics{gap:9px}\n  }\n  @container (max-width:355px){\n    .mgp-venue-strip{grid-template-columns:minmax(0,1fr) minmax(92px,.55fr);gap:7px}\n    .mgp-weather-metrics{grid-template-columns:1fr 1fr;gap:7px}\n    .mgp-circuit-panel .mgp-venue-caption{font-size:9px}\n    .mgp-track-svg{height:79px}\n    .mgp-track-note{font-size:8px}\n    .mgp-weather-cell strong{font-size:13px}\n  }\n";
// Source: MotoGP official Qatar 2026 circuit page. Keep only verified facts;
// do not infer missing dimensions from the schematic path.
const CIRCUIT_FACTS={
  portimao:{length:'4,59 km',width:'18 m',straight:'970 m',right:'9',left:'6',
    lapRecord:"1'37.226",recordHolder:'Marc Márquez · 2023',
    raceLap:"1'38.685",raceHolder:'Enea Bastianini · 2024',
    source:'https://www.motogp.com/en/calendar/2026/event/portugal/c7f7626b-807f-4a6f-813e-7ad2c68302a3',
    info:'https://www.motogp.com/en/calendar/2024/event/portugal/bccf48d6-3242-4827-95df-54a2048521c3'},
  lusail:{length:'5,38 km',width:'12 m',straight:'1 068 m',right:'10',left:'6',
    source:'https://www.motogp.com/en/calendar/2026/event/qatar/3f3d3f5e-851c-42d2-887a-8ce8b41fa908',
    info:'https://photos.motogp.com/events-admin/b/1/b1cd25b2-1658-4c3b-bd3f-1a7796f7cd27/info/qat-info.svg'}
};
const COUNTRY_FLAGS={
  'Thailand':'TH','Brazil':'BR','United States of America':'US',
  'Spain':'ES','France':'FR','Italy':'IT','Hungary':'HU',
  'Czechia':'CZ','Netherlands':'NL','Germany':'DE',
  'United Kingdom of Great Britain and Northern Ireland':'GB',
  'Austria':'AT','Japan':'JP','Indonesia':'ID','Australia':'AU',
  'Malaysia':'MY','Qatar':'QA','Portugal':'PT','San Marino':'SM'
};
function countryFlag(country){
  const iso=COUNTRY_FLAGS[String(country||'').trim()];
  return iso?String.fromCodePoint(...Array.from(iso).map(ch=>127397+ch.charCodeAt(0))):'';
}
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function nextSession(card){
  const state=card._hass?.states?.[card._ids?.race];
  const a=state?.attributes||{};
  const sessions=Array.isArray(a.sessions_all)?a.sessions_all:Array.isArray(a.sessions)?a.sessions:[];
  const now=Date.now();
  return sessions.map(s=>{
    if(!s||['FINISHED','CANCELLED','CANCELED'].includes(String(s.status||'').toUpperCase()))return null;
    // Prefer backend-normalized UTC; the wall-time fallback matches the split-card parser.
    let date=s.date_utc?new Date(String(s.date_utc)):null;
    if(!date||!Number.isFinite(date.getTime())){
      const m=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(String(s.date||''));
      if(!m)return null;
      date=new Date(+m[1],+m[2]-1,+m[3],+m[4],+m[5]);
      if(date.getFullYear()!==+m[1]||date.getMonth()!==+m[2]-1||date.getDate()!==+m[3]||
         date.getHours()!==+m[4]||date.getMinutes()!==+m[5])return null;
    }
    return date.getTime()>now?{time:date.getTime(),category:s.category||'MotoGP',
      name:({SPR:'Sprint',RAC:'Race',WUP:'Warm Up',PR:'Practice'})[String(s.name||s.type||'').toUpperCase()]||
        String(s.name||s.type||'Pass')}:null;
  }).filter(Boolean).sort((a,b)=>a.time-b.time)[0]||null;
}

// Only reveal timing near a real scheduled start, or when the existing
// verified live match is active. Never infer that a session is live from time.
function timingWindow(card){
  if(card._live)return true;
  const a=card._hass?.states?.[card._ids?.race]?.attributes||{};
  const items=Array.isArray(a.sessions_all)?a.sessions_all:Array.isArray(a.sessions)?a.sessions:[];
  const now=Date.now();
  return items.some(s=>{
    if(!s||['FINISHED','CANCELLED','CANCELED'].includes(String(s.status||'').toUpperCase()))return false;
    let d=s.date_utc?new Date(String(s.date_utc)):null;
    if(!d||!Number.isFinite(d.getTime())){
      const m=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(String(s.date||''));
      if(!m)return false;
      d=new Date(+m[1],+m[2]-1,+m[3],+m[4],+m[5]);
      if(d.getFullYear()!==+m[1]||d.getMonth()!==+m[2]-1||d.getDate()!==+m[3]||
        d.getHours()!==+m[4]||d.getMinutes()!==+m[5])return false;
    }
    const delta=d.getTime()-now;
    // 30 min lead-in, then a 3h grace period for delayed, not-yet-finished starts.
    return delta<=30*60*1000 && delta>=-3*60*60*1000;
  });
}
function toolbar(card){
  const next=nextSession(card);
  const session=next?esc(next.category)+' · '+esc(next.name):'Helgschema inväntar publicerade pass';
  const chip=next?'<span class="mgp-next-chip" title="Nästa schemalagda pass">⏱ '+session+
    ' · <span class="next-countdown" data-next-start="'+next.time+'">—</span></span>':
    '<span class="mgp-next-chip">'+session+'</span>';
  return '<button type="button" class="np-show-button" data-mgp-schedule-jump aria-expanded="'+
    (card._scheduleOpen===true)+'">🗓️ Helgschema</button>'+chip;
}
const readable=v=>v!==null&&v!==undefined&&!['','unknown','unavailable','none','null','hidden','0'].includes(String(v).trim().toLowerCase());
const key=v=>String(v||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
function trackFor(name){
  const normalized=key(name);
  if(!normalized)return null;
  // The aliases must remain distinctive. Never map a generic "Circuit" term.
  for(const [id,value] of Object.entries(TRACKS)){
    if(value.names.some(alias=>normalized.includes(key(alias))))return {id,d:value.d};
  }
  return null;
}
// Optional, locally installed SVGs. These are NOT bundled in the public HACS JS.
// The IDs are our stable circuit keys, not the uploaded SVGs' internal element IDs.
const LOCAL_CIRCUITS=new Set([
  'lusail','buriram','austin','mandalika','redbullring','motegi',
  'phillip','sepang','valencia','portimao','sachsenring','assen',
  'brno','balatonpark','mugello','barcelona','jerez','goiania','lemans'
]);
const LOCAL_CIRCUIT_PATH='/local/ha-mgp/circuits/';
function localCircuitPath(map,circuit){
  const id=/\b(balaton park|balatonpark)\b/i.test(String(circuit||''))?'balatonpark':
    (map?.id||(/\b(le mans|bugatti)\b/i.test(String(circuit||''))?'lemans':null));
  return id&&LOCAL_CIRCUITS.has(id)?LOCAL_CIRCUIT_PATH+id+'.svg':null;
}
function weatherNumber(value,unit){
  if(value===null||value===undefined)return null;
  const raw=String(value).trim();
  // Provider values can be "24º", "37°", "45%" or bare numbers.
  if(!/^-?\d+(?:[.,]\d+)?\s*(?:°|º|°c|ºc|c|%|celsius)?$/i.test(raw))return null;
  const num=Number(raw.match(/^-?\d+(?:[.,]\d+)?/)[0].replace(',','.'));
  if(!Number.isFinite(num)||num<(-70)||num>130)return null;
  if(unit==='%'&&(num<0||num>100))return null;
  return String(num).replace('.',',')+(unit==='%'?' %':' °C');
}
function condition(v){
  const text=String(v??'').trim();
  return readable(text)&&text.length<=70?text:'';
}
function shortTime(raw){
  if(!raw)return '';
  const timestamp=Date.parse(String(raw));
  if(!Number.isFinite(timestamp)||timestamp>Date.now()+5*60*1000)return '';
  const age=Date.now()-timestamp;
  if(age>=18*60*60*1000)return 'äldre väderrapport';
  const date=new Date(timestamp);
  return 'rapporterat '+date.toLocaleTimeString('sv-SE',{hour:'2-digit',minute:'2-digit'});
}
function venue(card){
  const attrs=card._hass?.states?.[card._ids?.race]?.attributes||{};
  const circuit=String(attrs.circuit||'').trim();
  const map=trackFor(circuit);
  const specs=map&&CIRCUIT_FACTS[map.id]||null;
  const factsHtml=specs?'<div class="mgp-circuit-facts" aria-label="Banans mått">'+
    '<span>'+esc(specs.length)+' / varv</span><span>↔ '+esc(specs.width)+'</span>'+
    '<span>Raka '+esc(specs.straight)+'</span>'+
    '<span>↱ '+esc(specs.right)+' · ↰ '+esc(specs.left)+'</span></div>'+
    '<div class="mgp-circuit-links"><a href="'+esc(specs.source)+'" target="_blank" rel="noopener noreferrer">Banfakta</a>'+
    '<a href="'+esc(specs.info)+'" target="_blank" rel="noopener noreferrer">MotoGP:s SVG</a></div>':'';
  const allWeather=card._hass?.states?.[card._ids?.weather]?.attributes||{};
  const eventId=String(attrs.event_id||'');
  const isSameEvent=Boolean(eventId&&String(allWeather.results_event_uuid||'')===eventId);
  const startDate=String(attrs.date_start||'').slice(0,10);
  const reportDate=String(allWeather.last_success_at||allWeather.updated_at||'').slice(0,10);
  const dateMatches=Boolean(startDate&&reportDate&&reportDate>=startDate);
  // No cross-event or pre-event weather masquerading as current circuit conditions.
  const weather=isSameEvent&&dateMatches?allWeather:{};
  const sources=[condition(weather.category),condition(weather.session)].filter(Boolean);
  const time=shortTime(weather.updated_at);
  const provenance=[...sources,time].filter(Boolean).join(' · ');
  const fetchStatus=String(weather.fetch_status||'').toLowerCase();
  const fetchLabel=fetchStatus==='error'?'API-fel · senast kända rapport':
    fetchStatus==='no_data'?'Ingen ny sessionsrapport · tidigare värden':
    fetchStatus==='ok'?'API-kontroll OK':'';
  const checked=shortTime(weather.checked_at);
  const lastSuccess=shortTime(weather.last_success_at);
  const age=Number(weather.data_age_seconds);
  const ageLabel=Number.isFinite(age)&&age>=0?' · Ändrat för '+Math.floor(age/60)+' min sedan':'';
  const diagnostic=[fetchLabel,
    checked?'Kontrollerat '+checked:'',
    lastSuccess?'Senast data '+lastSuccess:'',
    weather.updated_at?'Observerad ändring '+shortTime(weather.updated_at)+ageLabel:'',
    Number.isInteger(weather.poll_count)?'Kontroller '+weather.poll_count:'',
    Number.isInteger(weather.change_count)?'Ändringar '+weather.change_count:''
  ].filter(Boolean).join(' · ');
  const localPath=localCircuitPath(map,circuit);
  const fallback=map?'<svg class="mgp-track-svg" viewBox="0 0 280 160" role="img" aria-label="Schematisk banlayout för '+
    esc(circuit)+'" preserveAspectRatio="xMidYMid meet">'+
    '<path class="mgp-track-shadow" d="'+map.d+'"></path>'+
    '<path class="mgp-track-outline" d="'+map.d+'"></path></svg>':'';
  const mapVisual=(map||localPath)?'<div class="mgp-track-layer">'+
    (localPath?'<img class="mgp-track-local" src="'+esc(localPath)+'" alt="Banlayout med kurvnummer och sektorer för '+esc(circuit)+'" loading="lazy">':'')+
    '<div class="mgp-track-fallback">'+(fallback||'<div class="mgp-track-empty">Lokal SVG saknas</div>')+'</div></div>'+
    '<div class="mgp-track-note">Schematisk banform som fallback · lokal SVG där den finns</div>':
    '<div class="mgp-track-empty">Ingen verifierad banritning tillgänglig</div>';
  const mapHtml=(map||localPath)?'<button type="button" class="mgp-track-trigger" data-mgp-circuit-open aria-label="Visa större banlayout och banfakta för '+esc(circuit)+'">'+
    mapVisual+'<span class="mgp-track-action">⤢ Förstora och visa banfakta</span></button>':mapVisual;
  const circuitFacts=specs?
    '<div class="mgp-circuit-detail-grid"><span>Banlängd <b>'+esc(specs.length)+'</b></span>'+
    '<span>Bredd <b>'+esc(specs.width)+'</b></span>'+
    '<span>Längsta raka <b>'+esc(specs.straight)+'</b></span>'+
    '<span>Högerkurvor <b>'+esc(specs.right)+'</b></span>'+
    '<span>Vänsterkurvor <b>'+esc(specs.left)+'</b></span>'+
    (specs.lapRecord?'<span>Varvrekord, kval <b>'+esc(specs.lapRecord)+'</b><small>'+esc(specs.recordHolder)+'</small></span>':'')+
    (specs.raceLap?'<span>Snabbaste racevarv <b>'+esc(specs.raceLap)+'</b><small>'+esc(specs.raceHolder)+'</small></span>':'')+
    '</div><a href="'+esc(specs.source)+'" target="_blank" rel="noopener noreferrer">MotoGP:s baninformation</a>':
    '<div class="mgp-circuit-unavailable">Banmått och varvrekord har ännu inte verifierats för den här banan.</div>';
  const circuitDialog='<dialog class="mgp-circuit-dialog" aria-label="Baninformation för '+esc(circuit)+'">'+
    '<div class="mgp-weekend-dialog-head"><strong>🏁 '+esc(circuit)+'</strong>'+
    '<button type="button" data-mgp-circuit-dismiss>Stäng</button></div>'+
    '<div class="mgp-circuit-dialog-body">'+(map||localPath?
      '<div class="mgp-circuit-large">'+mapVisual+'</div>':'')+circuitFacts+'</div></dialog>';
  const temperature=weatherNumber(weather.air,'°C');
  const ground=weatherNumber(weather.ground,'°C');
  const humidity=weatherNumber(weather.humidity,'%');
  const surface=condition(weather.track);
  const values=[['Luft',temperature],['Bana',ground],['Fuktighet',humidity],['Underlag',surface]];
  const validValues=values.filter(([,v])=>Boolean(v));
  const description=condition(weather.weather);
  const weatherHtml=!isSameEvent?
    '<div class="mgp-weather-empty">Inget banväder från detta GP ännu · tidigare sessionsvärden döljs</div>':
    !dateMatches?
    '<div class="mgp-weather-empty">Inget banväder för den kommande tävlingshelgen ännu</div>':
    validValues.length||description?
    '<div class="mgp-weather-metrics">'+values.map(([label,value])=>
      '<div class="mgp-weather-cell"><small>'+esc(label)+'</small><strong>'+
      esc(value||'—')+'</strong></div>').join('')+'</div>'+
    (description?'<div class="mgp-weather-condition">'+esc(description)+'</div>':''):
    '<div class="mgp-weather-empty">Ingen banväderrapport tillgänglig ännu</div>';
  // Weather precedes the circuit outline, which stays flush-right.
  return '<div class="mgp-venue-strip" data-mgp-venue-header>'+
    '<div class="mgp-weather-panel"><div class="mgp-weather-head">'+
    '<span class="mgp-venue-caption">🌤️ Banväder</span>'+
    '<span class="mgp-weather-source">'+(isSameEvent&&dateMatches?'Senast rapporterat · inte livegaranti':'Rapport för detta GP saknas')+
    (provenance?' · '+esc(provenance):'')+'</span>'+
    (isSameEvent&&dateMatches&&diagnostic?'<span class="mgp-weather-source" data-mgp-weather-diagnostics>'+esc(diagnostic)+'</span>':'')+
    '</div>'+weatherHtml+'</div>'+
    '<div class="mgp-circuit-panel"><div class="mgp-venue-caption">🏁 Banlayout</div>'+mapHtml+factsHtml+'</div></div>'+circuitDialog;
}
const SCHEDULE_DIALOG_STYLE=`
  .mgp-track-trigger{display:block;width:100%;border:0;padding:0;background:transparent;color:inherit;cursor:zoom-in;font:inherit}
  .mgp-track-action{display:block;text-align:center;font-size:10px;margin-top:4px;color:var(--primary-color,#039be5)}
  .mgp-track-trigger:focus-visible{outline:2px solid var(--primary-color,#039be5);outline-offset:4px;border-radius:8px}
  .mgp-circuit-dialog{width:min(760px,calc(100vw - 28px));max-height:calc(100dvh - 26px);
    padding:0;border:1px solid var(--divider-color,#ddd);border-radius:16px;
    background:var(--ha-card-background,var(--card-background-color,#fff));
    color:var(--primary-text-color);box-shadow:0 20px 60px rgba(0,0,0,.32)}
  .mgp-circuit-dialog::backdrop{background:rgba(0,0,0,.55)}
  .mgp-circuit-dialog-body{overflow:auto;max-height:calc(100dvh - 110px);padding:12px 18px}
  .mgp-circuit-large .mgp-track-layer{height:clamp(210px,40vh,400px)}
  .mgp-circuit-large .mgp-track-svg{height:100%}
  .mgp-circuit-detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:15px 0}
  .mgp-circuit-detail-grid>span{padding:9px;border:1px solid var(--divider-color,#ddd);border-radius:8px;font-size:12px}
  .mgp-circuit-detail-grid b,.mgp-circuit-detail-grid small{display:block;margin-top:3px}
  .mgp-circuit-unavailable{padding:12px;color:var(--secondary-text-color);font-size:12px}

  .mgp-weekend-dialog{width:min(900px,calc(100vw - 28px));max-height:calc(100dvh - 32px);
    padding:0;border:1px solid var(--divider-color,#ddd);border-radius:16px;
    background:var(--ha-card-background,var(--card-background-color,#fff));
    color:var(--primary-text-color);box-shadow:0 20px 60px rgba(0,0,0,.32)}
  .mgp-weekend-dialog::backdrop{background:rgba(0,0,0,.55)}
  .mgp-weekend-dialog-head{display:flex;align-items:center;justify-content:space-between;
    gap:12px;padding:12px 15px;border-bottom:1px solid var(--divider-color,#ddd)}
  .mgp-weekend-dialog-head strong{font-size:14px}
  .mgp-weekend-dialog-head button{border:1px solid var(--divider-color,#ddd);border-radius:9px;
    background:transparent;padding:7px 12px;color:inherit;cursor:pointer;font:inherit}
  .mgp-weekend-dialog-body{overflow:auto;max-height:calc(100dvh - 105px);padding:10px}
  .mgp-weekend-dialog-body>.panel{border:0;box-shadow:none}
`;
function install(){
  const Overview=customElements.get(TAG);
  if(Overview?.buildInfo?.version!==REQUIRED){
    console.error('[MotoGP circuit/weather header] Unexpected Overview version');return;
  }
  if(Overview.prototype._mgpTrackWeather)return;
  // Suppress the old separate weather card only for the Overview instance.
  // The sensor and all timing-card paths remain completely unchanged.
  Overview.prototype._weather=function(){return '';};
  const original=Overview.prototype._render;
  Overview.prototype._render=function(){
    const previousScroll=this.shadowRoot?.querySelector?.('.mgp-weekend-dialog-body')?.scrollTop||0;
    original.call(this);
    if(!this._hass||!this.shadowRoot)return;
    if(!this.shadowRoot.querySelector?.('[data-mgp-venue-style]')){
      const style=document.createElement('style');
      style.setAttribute('data-mgp-venue-style','');
      style.textContent=STYLE+SCHEDULE_DIALOG_STYLE;
      this.shadowRoot.appendChild(style);
    }
    const view=this.shadowRoot.getElementById('app');
    if(!view)return;
    // Wrap the existing header text and its optional standings button
    // into the left column. Put weather and circuit to its right, inside
    // the very same <section class="panel header">, not in panels below.
    // This preserves the existing button, spoiler and standings behavior.
    const markup=view.innerHTML;
    const marker='<section class="panel header">';
    const start=markup.indexOf(marker);
    if(start<0)return;
    const innerStart=start+marker.length;
    const end=markup.indexOf('</section>',innerStart);
    if(end<0)return;
    const rawHeader=markup.slice(innerStart,end);
    const country=String(this._hass?.states?.[this._ids?.race]?.attributes?.country||'');
    const flag=countryFlag(country);
    const originalHeader=flag?rawHeader.replace('<h2>',
      '<h2><span class="mgp-country-flag" role="img" aria-label="Flagga: '+esc(country)+'">'+flag+'</span>'):rawHeader;
    // Approved MGP integration artwork is embedded in the single JS bundle; no remote dependency.
    const brandedHeader=originalHeader.replace(/<div class="eyebrow">(?:🏁\s*)?/,
      '<div class="eyebrow mgp-branded-eyebrow"><img class="mgp-brand-logo" src="'+BRAND_SRC+'" alt="MGP" width="27" height="27">');
    if(originalHeader.includes('data-mgp-venue-header'))return;
    // This reflects the active single-JS UI build, not the separately updated backend.
    const uiVersion=(rawHeader.match(/(?:HA-MGP|MOTOGP NEXT)\s*·\s*([^<]+)/i)||[])[1]?.trim()||
      Overview.buildInfo?.version||'okänd';
    const toolbarHtml=toolbar(this);
    // Keep the existing standings control and callback; prepend navigation and countdown.
    const actions=brandedHeader.includes('<div class="np-top-actions">')?
      brandedHeader.replace('<div class="np-top-actions">','<div class="np-top-actions">'+toolbarHtml):
      brandedHeader+'<div class="np-top-actions">'+toolbarHtml+'</div>';
    const body='<div class="mgp-hero-grid" data-mgp-hero-grid>'+
      '<div class="mgp-hero-copy">'+actions+'</div>'+
      venue(this)+'</div>';
    const footer='<details class="mgp-ui-footer"><summary>ⓘ UI-information</summary>'+
      '<div>Frontend: '+esc(uiVersion)+' · Bas-kort: '+esc(Overview.buildInfo?.version||'okänd')+
      '<br>Backendversion hanteras separat.</div></details>';
    const output=markup.slice(0,innerStart)+body+markup.slice(end);
    view.innerHTML=output.includes('<div class="foot">')?
      output.replace('<div class="foot">','<div class="foot">'+footer):output+footer;
    // Attach after every render: native image load/error controls the fallback.
    // No external requests, DOM event attributes or broken-image placeholders.
    for(const localTrack of view.querySelectorAll?.('.mgp-track-local')||[]){
      const markReady=()=>{localTrack.dataset.ready='true';};
      const markUnavailable=()=>{localTrack.dataset.ready='false';};
      localTrack.addEventListener('load',markReady,{once:true});
      localTrack.addEventListener('error',markUnavailable,{once:true});
      if(localTrack.complete){
        if(localTrack.naturalWidth>0)markReady();
        else markUnavailable();
      }
    }
    const circuitDialog=view.querySelector?.('.mgp-circuit-dialog');
    if(circuitDialog&&this._circuitOpen===true&&typeof circuitDialog.showModal==='function'){
      circuitDialog.addEventListener('cancel',event=>{
        event.preventDefault();this._circuitOpen=false;this._render();
      },{once:true});
      if(!circuitDialog.open)circuitDialog.showModal();
    }
    const dialog=view.querySelector?.('.mgp-weekend-dialog');
    if(dialog&&this._scheduleOpen===true&&dialog.isConnected&&typeof dialog.showModal==='function'){
      const scroller=dialog.querySelector('.mgp-weekend-dialog-body');
      if(scroller)scroller.scrollTop=previousScroll;
      dialog.addEventListener('cancel',event=>{
        event.preventDefault();
        this._scheduleOpen=false;
        this._render();
      },{once:true});
      if(!dialog.open)dialog.showModal();
    }
  };
  const originalSchedule=Overview.prototype._schedule;
  Overview.prototype._schedule=function(race,now){
    if(this._scheduleOpen!==true)return '';
    const html=originalSchedule.call(this,race,now);
    // Modal is outside normal page layout, so the separate timing card
    // remains directly below the event overview (no layout/YAML migration).
    const rawContent=html.replace(/<div class="head"><strong>🗓️ Helgens schema<\/strong><span class="muted">[\s\S]*?<\/span><\/div>/,'');
    const eventAttrs=this._hass?.states?.[this._ids?.race]?.attributes||{};
    const eventCountry=String(eventAttrs.country||'').toLowerCase();
    const scheduleUrl=eventCountry.includes('portugal')?
      'https://www.motogp.com/en/calendar/2026/event/portugal/c7f7626b-807f-4a6f-813e-7ad2c68302a3':
      'https://www.motogp.com/en/calendar';
    const content=rawContent.replace('Inga pass i aktuell evenemangsdata för valt filter.',
      'Detaljerat helgschema är ännu inte tillgängligt i datakällan. '+
      '<a href="'+scheduleUrl+'" target="_blank" rel="noopener noreferrer">Visa MotoGP:s officiella schema</a>.');
    return '<dialog class="mgp-weekend-dialog" aria-label="Helgens schema">'+
      '<div class="mgp-weekend-dialog-head"><strong>🗓️ Helgens schema</strong>'+
      '<button type="button" autofocus data-mgp-schedule-dismiss>Stäng</button></div>'+
      '<div class="mgp-weekend-dialog-body">'+content+'</div></dialog>';
  };
  const timingCard=customElements.get('ha-motogp-next-timing-card');
  if(timingCard&&!timingCard.prototype._mgpTimingWindow){
    const originalTiming=timingCard.prototype._timing;
    timingCard.prototype._timing=function(){
      if(!timingWindow(this))return '';
      return originalTiming.call(this);
    };
    timingCard.prototype._mgpTimingWindow=BUILD;
  }
  const oldClick=Overview.prototype._click;
  Overview.prototype._click=function(e){
    if(e?.target?.closest?.('[data-mgp-circuit-dismiss]')){
      this._circuitOpen=false;this._render();return;
    }
    if(e?.target?.closest?.('[data-mgp-circuit-open]')){
      this._circuitOpen=true;this._scheduleOpen=false;this._render();return;
    }
    if(e?.target?.closest?.('[data-mgp-schedule-dismiss]')){
      this._scheduleOpen=false;this._render();return;
    }
    if(e?.target?.closest?.('[data-mgp-schedule-jump]')){
      this._scheduleOpen=this._scheduleOpen!==true;
      if(this._scheduleOpen)this._standingOpen=false;
      this._render();
      return;
    }
    return oldClick.call(this,e);
  };
  // Share the existing (schematic) circuit geometry with the season calendar.
  // No duplicated path registry or external API requests.
  Overview.prototype._mgpCalendarTrack=function(circuit){
    const track=trackFor(circuit);
    if(!track)return null;
    return {id:track.id,d:track.d,localPath:localCircuitPath(track,circuit)};
  };
  // The calendar detail modal borrows these facts from the same registry
  // as the active GP header, rather than maintaining a second lookup table.
  Overview.prototype._mgpCalendarFacts=function(circuit){
    const track=trackFor(circuit);
    return track&&CIRCUIT_FACTS[track.id]?CIRCUIT_FACTS[track.id]:null;
  };
  Overview.prototype._mgpTrackWeather=BUILD;
}
customElements.whenDefined(TAG).then(install);
})();

;
/* MotoGP Next: observed historical lap summaries for explicitly FINISHED sessions. */
(() => {
'use strict';
const OVERVIEW='ha-motogp-next-overview-card';
const REQUIRED='0.2.0-split.2',BUILD='history-20261107-01';
const STYLE="\n.nh-history-btn{display:inline-flex;margin-top:9px;border:1px solid var(--divider-color,#ddd);border-radius:15px;background:transparent;color:inherit;font:inherit;font-size:11px;font-weight:800;padding:6px 10px;cursor:pointer}\n.nh-history-btn:hover{border-color:var(--primary-color,#03a9f4)}\n.nh-overlay{position:fixed;inset:0;z-index:10010;display:flex;align-items:center;justify-content:center;padding:13px;background:rgba(0,0,0,.6);box-sizing:border-box}\n.nh-dialog{width:min(800px,100%);max-height:min(780px,calc(100dvh - 26px));overflow:hidden;border-radius:14px;display:flex;flex-direction:column;background:var(--ha-card-background,var(--card-background-color,#fff));color:var(--primary-text-color);box-shadow:0 14px 50px rgba(0,0,0,.35)}\n.nh-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:16px 18px;border-bottom:1px solid var(--divider-color,#ddd)}\n.nh-head strong{font-size:16px}.nh-head small{display:block;font-size:11px;color:var(--secondary-text-color);margin-top:5px}\n.nh-close{flex:none;width:35px;height:35px;border-radius:50%;font-size:24px;cursor:pointer;background:transparent;color:inherit;border:1px solid var(--divider-color,#ddd)}\n.nh-body{overflow-y:auto;padding:14px 18px 20px;overscroll-behavior:contain}\n.nh-caveat{color:var(--secondary-text-color);font-size:11px;line-height:1.5;margin-bottom:14px}\n.nh-note{color:var(--secondary-text-color);font-size:12px;margin-bottom:12px}\n.nh-result{width:100%;border-collapse:collapse;font-size:12px;font-variant-numeric:tabular-nums}\n.nh-result th,.nh-result td{padding:10px 8px;border-bottom:1px solid var(--divider-color,#ddd);text-align:left}\n.nh-result th{font-size:10px;text-transform:uppercase;color:var(--secondary-text-color)}\n.nh-result td:nth-child(n+3),.nh-result th:nth-child(n+3){text-align:right}\n.nh-result small{color:var(--secondary-text-color);display:block;margin-top:3px}\n.nh-best{font-weight:850;color:var(--success-color,#159447)}\n.nh-warning{color:var(--warning-color,#cf7200);font-weight:750}\n.nh-empty{font-size:12px;color:var(--secondary-text-color);padding:14px 4px}\n@media(max-width:540px){.nh-body{padding:9px 10px 14px}.nh-head{padding:12px}.nh-result{font-size:11px}.nh-result th,.nh-result td{padding:8px 4px}.nh-result td:nth-child(3),.nh-result th:nth-child(3){display:none}}\n";
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const allowedId=v=>typeof v==='string'&&/^[A-Za-z0-9-]{8,128}$/.test(v);
const eventKey=card=>{const r=card._hass?.states?.[card._ids?.race];return String(r?.state||'')+'|'+String(r?.attributes?.date_start||'')+'|'+String(r?.attributes?.date_end||'');};
const schedule=card=>{const a=card._hass?.states?.[card._ids?.race]?.attributes||{};return Array.isArray(a.sessions_all)?a.sessions_all:[];};
const finished=card=>schedule(card).filter(s=>s&&allowedId(s.id)&&String(s.status||'').toUpperCase()==='FINISHED'&&['MotoGP','Moto2','Moto3'].includes(String(s.category||'')));
function addStyle(card){
  if(!card.shadowRoot||card.shadowRoot.querySelector?.('[data-motogp-history-style]'))return;
  const node=document.createElement('style');node.setAttribute('data-motogp-history-style','');
  node.textContent=STYLE;card.shadowRoot.appendChild(node);
}
function modal(state){
  let body='';
  if(state.status==='loading')body='<div class="nh-empty">Läser sparade varvtider…</div>';
  else if(state.status==='error')body='<div class="nh-empty">Arkivet kunde inte läsas just nu.</div>';
  else{
    const data=state.data||{},rs=Array.isArray(data.riders)?data.riders:[];
    if(!data.available||!rs.length)body='<div class="nh-empty">Inga observerade varv finns sparade för detta pass.</div>';
    else{
      const rows=rs.map(r=>'<tr><td>#'+esc(r.number||'—')+'</td><td><strong>'+esc(r.name||'Förare')+
        '</strong>'+(r.partial?'<small class="nh-warning">Ofullständiga varv</small>':'')+
        '</td><td>'+esc(r.lap_count)+'</td><td>'+esc(r.last_time||'—')+
        '<small>Varv '+esc(r.last_lap||'—')+'</small></td><td class="nh-best">'+
        esc(r.best_time||'—')+'<small>Varv '+esc(r.best_lap||'—')+'</small></td></tr>').join('');
      body='<div class="nh-note">'+esc(data.observed_laps)+' observerade varv · '+
        rs.length+' förare'+(data.partial?' · ⚠ luckor i arkivet':'')+'</div>'+
        '<table class="nh-result"><thead><tr><th>Nr</th><th>Förare</th><th>Varv</th>'+
        '<th>Senaste</th><th>Snabbaste</th></tr></thead><tbody>'+rows+'</tbody></table>';
    }
  }
  return '<div class="nh-overlay" data-motogp-history-backdrop><section class="nh-dialog" role="dialog" aria-modal="true" aria-labelledby="nh-title">'+
    '<header class="nh-head"><div><strong id="nh-title">🏁 '+esc(state.category)+' · '+esc(state.name)+'</strong>'+
    '<small>Arkiverat pass · endast observerade tider</small></div>'+
    '<button type="button" class="nh-close" data-motogp-history-close aria-label="Stäng historik">×</button></header>'+
    '<div class="nh-body"><div class="nh-caveat">Sorterat efter snabbaste observerade varv, inte officiell målordning. '+
    'Arkivet kan sakna varv; inga tider uppskattas.</div>'+body+'</div></section></div>';
}
function install(){
  const Card=customElements.get(OVERVIEW);
  if(Card?.buildInfo?.version!==REQUIRED){console.error('[MotoGP history] Wrong Overview version');return;}
  if(Card.prototype._motogpSessionHistory)return;
  const priorSchedule=Card.prototype._schedule;
  Card.prototype._schedule=function(race,now){
    let html=priorSchedule.call(this,race,now);
    if(this._spoiler())return html;
    for(const s of finished(this)){
      const label='<div class="name">'+esc(s.category)+' · '+esc(s.name)+'</div>';
      const needle=label+'</div>';
      if(html.split(needle).length!==2)continue;
      const btn='<button type="button" class="nh-history-btn" data-motogp-history-session="'+esc(s.id)+
        '" aria-label="Visa varv för '+esc(s.category)+' '+esc(s.name)+'">Visa varv</button>';
      html=html.replace(needle,label+btn+'</div>');
    }
    return html;
  };
  Card.prototype._motogpHistoryOpen=function(id){
    const sessions=finished(this).filter(s=>s.id===id);
    if(this._spoiler()||sessions.length!==1)return;
    const s=sessions[0],token={id,category:s.category,name:s.name,event:eventKey(this),status:'loading',data:null};
    this._motogpHistory=token;this._render();
    this.shadowRoot?.querySelector?.('[data-motogp-history-close]')?.focus?.();
    if(typeof this._hass?.callWS!=='function'){token.status='error';this._render();return;}
    this._hass.callWS({type:'motogp_sensor/session_history',session_id:id}).then(data=>{
      if(this._motogpHistory!==token||this._spoiler()||token.event!==eventKey(this)||
          finished(this).filter(s=>s.id===id).length!==1)return;
      token.data=data;token.status='ready';this._render();
    }).catch(()=>{
      if(this._motogpHistory!==token||this._spoiler())return;
      token.status='error';this._render();
    });
  };
  Card.prototype._motogpHistoryClose=function(){this._motogpHistory=null;this._render();};
  const priorClick=Card.prototype._click;
  Card.prototype._click=function(e){
    const target=e?.target;
    if(target?.closest?.('[data-motogp-history-close]')){this._motogpHistoryClose();return;}
    const backdrop=target?.closest?.('[data-motogp-history-backdrop]');
    if(backdrop&&backdrop===target){this._motogpHistoryClose();return;}
    const btn=target?.closest?.('[data-motogp-history-session]');
    if(btn){this._motogpHistoryOpen(btn.getAttribute('data-motogp-history-session'));return;}
    return priorClick.call(this,e);
  };
  const priorRender=Card.prototype._render;
  Card.prototype._render=function(){
    priorRender.call(this);addStyle(this);
    const token=this._motogpHistory;
    if(!token)return;
    if(this._spoiler()||token.event!==eventKey(this)||
        finished(this).filter(s=>s.id===token.id&&s.category===token.category).length!==1){
      this._motogpHistory=null;return;
    }
    this.shadowRoot?.getElementById('app')?.insertAdjacentHTML?.('beforeend',modal(token));
  };
  const priorConnected=Card.prototype.connectedCallback;
  Card.prototype.connectedCallback=function(){
    priorConnected.call(this);
    if(this.shadowRoot&&!this._motogpHistoryKeyHandler){
      this._motogpHistoryKeyHandler=e=>{if(e.key==='Escape'&&this._motogpHistory){e.preventDefault();this._motogpHistoryClose();}};
      this.shadowRoot.addEventListener('keydown',this._motogpHistoryKeyHandler);
    }
  };
  const priorDisconnected=Card.prototype.disconnectedCallback;
  Card.prototype.disconnectedCallback=function(){
    if(this._motogpHistoryKeyHandler)this.shadowRoot?.removeEventListener('keydown',this._motogpHistoryKeyHandler);
    this._motogpHistoryKeyHandler=null;this._motogpHistory=null;
    priorDisconnected.call(this);
  };
  Card.prototype._motogpSessionHistory=BUILD;
}
customElements.whenDefined(OVERVIEW).then(install);
})();

;
/* HA-MGP UI localization. Catalogs embedded into the single versioned HACS JS file. */
(() => {
  'use strict';
  const CATALOGS={"en":{"\ud83c\udfc6 VM-st\u00e4llning":"\ud83c\udfc6 Championship standings","Visa VM-st\u00e4llning":"Show standings","D\u00f6lj VM-st\u00e4llning":"Hide standings","\ud83d\uddd3\ufe0f Helgschema":"\ud83d\uddd3\ufe0f Weekend schedule","\ud83c\udf24\ufe0f Banv\u00e4der":"\ud83c\udf24\ufe0f Track weather","\ud83c\udfc1 Banlayout":"\ud83c\udfc1 Circuit layout","\u24d8 UI-information":"\u24d8 UI information","F\u00f6rare / team":"Rider / team","F\u00d6RARE / TEAM":"RIDER / TEAM","Relativ po\u00e4ng":"Relative points","Po\u00e4ng":"Points","LEDARE":"LEADER","POS":"POS","NR":"NO.","VARV":"LAPS","SENASTE VARV":"LAST LAP","FRAMF\u00d6R":"AHEAD","STATUS":"STATUS","Lap record":"Lap record","Pole lap":"Pole lap","Race lap":"Race lap","Senast publicerad VM-st\u00e4llning \u00b7 uppdateras separat fr\u00e5n livetiming.":"Latest published standings \u00b7 updated separately from live timing.","Ingen banv\u00e4derrapport tillg\u00e4nglig \u00e4nnu":"No track weather report available yet","Ingen verifierad banritning tillg\u00e4nglig":"No verified circuit diagram available","Backendversion hanteras separat.":"Backend version is handled separately.","Ingen s\u00e4kerst\u00e4lld f\u00f6rardata fr\u00e5n det aktuella eller f\u00f6reg\u00e5ende passet.":"No verified rider data for this or the previous session.","SPOILERL\u00c4GE":"SPOILER MODE","MELLAN PASSEN":"BETWEEN SESSIONS","SENASTE PASS AVSLUTAT":"LAST SESSION FINISHED","SENASTE PASS":"LAST SESSION","V\u00c4NTAR / OFFLINE":"WAITING / OFFLINE","D\u00f6lj f\u00f6rare":"Hide riders","Visa f\u00f6rare":"Show riders","KOMMANDE":"UPCOMING","AVSLUTAT":"FINISHED","IDAG":"TODAY","LIVETIMING":"LIVE TIMING","Ingen aktiv session":"No active session","F\u00f6rare":"Rider","Ledare":"Leader","Senaste":"Latest","Snabbaste":"Fastest","\u00d6ppna":"Open","St\u00e4ng":"Close","Banv\u00e4der":"Track weather","Banlayout":"Circuit layout","Helgens schema":"Weekend schedule","VM-st\u00e4llning":"Standings","Varv":"Lap","varv":"laps","kvar":"remaining","varv kvar":"laps remaining","N\u00e4sta:":"Next:","Totalt":"Total","Ingen data":"No data"},"sv":{"\ud83c\udfc6 VM-st\u00e4llning":"\ud83c\udfc6 VM-st\u00e4llning","Visa VM-st\u00e4llning":"Visa VM-st\u00e4llning","D\u00f6lj VM-st\u00e4llning":"D\u00f6lj VM-st\u00e4llning","\ud83d\uddd3\ufe0f Helgschema":"\ud83d\uddd3\ufe0f Helgschema","\ud83c\udf24\ufe0f Banv\u00e4der":"\ud83c\udf24\ufe0f Banv\u00e4der","\ud83c\udfc1 Banlayout":"\ud83c\udfc1 Banlayout","\u24d8 UI-information":"\u24d8 UI-information","F\u00f6rare / team":"F\u00f6rare / team","F\u00d6RARE / TEAM":"F\u00d6RARE / TEAM","Relativ po\u00e4ng":"Relativ po\u00e4ng","Po\u00e4ng":"Po\u00e4ng","LEDARE":"LEDARE","POS":"POS","NR":"NR","VARV":"VARV","SENASTE VARV":"SENASTE VARV","FRAMF\u00d6R":"FRAMF\u00d6R","STATUS":"STATUS","Lap record":"Lap record","Pole lap":"Pole lap","Race lap":"Race lap","Senast publicerad VM-st\u00e4llning \u00b7 uppdateras separat fr\u00e5n livetiming.":"Senast publicerad VM-st\u00e4llning \u00b7 uppdateras separat fr\u00e5n livetiming.","Ingen banv\u00e4derrapport tillg\u00e4nglig \u00e4nnu":"Ingen banv\u00e4derrapport tillg\u00e4nglig \u00e4nnu","Ingen verifierad banritning tillg\u00e4nglig":"Ingen verifierad banritning tillg\u00e4nglig","Backendversion hanteras separat.":"Backendversion hanteras separat.","Ingen s\u00e4kerst\u00e4lld f\u00f6rardata fr\u00e5n det aktuella eller f\u00f6reg\u00e5ende passet.":"Ingen s\u00e4kerst\u00e4lld f\u00f6rardata fr\u00e5n det aktuella eller f\u00f6reg\u00e5ende passet.","SPOILERL\u00c4GE":"SPOILERL\u00c4GE","MELLAN PASSEN":"MELLAN PASSEN","SENASTE PASS AVSLUTAT":"SENASTE PASS AVSLUTAT","SENASTE PASS":"SENASTE PASS","V\u00c4NTAR / OFFLINE":"V\u00c4NTAR / OFFLINE","D\u00f6lj f\u00f6rare":"D\u00f6lj f\u00f6rare","Visa f\u00f6rare":"Visa f\u00f6rare","KOMMANDE":"KOMMANDE","AVSLUTAT":"AVSLUTAT","IDAG":"IDAG","LIVETIMING":"LIVETIMING","Ingen aktiv session":"Ingen aktiv session","F\u00f6rare":"F\u00f6rare","Ledare":"Ledare","Senaste":"Senaste","Snabbaste":"Snabbaste","\u00d6ppna":"\u00d6ppna","St\u00e4ng":"St\u00e4ng","Banv\u00e4der":"Banv\u00e4der","Banlayout":"Banlayout","Helgens schema":"Helgens schema","VM-st\u00e4llning":"VM-st\u00e4llning","Varv":"Varv","varv":"varv","kvar":"kvar","varv kvar":"varv kvar","N\u00e4sta:":"N\u00e4sta:","Totalt":"Totalt","Ingen data":"Ingen data"},"es":{"\ud83c\udfc6 VM-st\u00e4llning":"\ud83c\udfc6 Clasificaci\u00f3n del campeonato","Visa VM-st\u00e4llning":"Mostrar clasificaci\u00f3n","D\u00f6lj VM-st\u00e4llning":"Ocultar clasificaci\u00f3n","\ud83d\uddd3\ufe0f Helgschema":"\ud83d\uddd3\ufe0f Programa del fin de semana","\ud83c\udf24\ufe0f Banv\u00e4der":"\ud83c\udf24\ufe0f Tiempo en pista","\ud83c\udfc1 Banlayout":"\ud83c\udfc1 Plano del circuito","\u24d8 UI-information":"\u24d8 Informaci\u00f3n de la interfaz","F\u00f6rare / team":"Piloto / equipo","F\u00d6RARE / TEAM":"PILOTO / EQUIPO","Relativ po\u00e4ng":"Puntos relativos","Po\u00e4ng":"Puntos","LEDARE":"L\u00cdDER","POS":"POS","NR":"N.\u00ba","VARV":"VUELTAS","SENASTE VARV":"\u00daLTIMA VUELTA","FRAMF\u00d6R":"DELANTE","STATUS":"ESTADO","Lap record":"R\u00e9cord de vuelta","Pole lap":"Vuelta de pole","Race lap":"Mejor vuelta de carrera","Senast publicerad VM-st\u00e4llning \u00b7 uppdateras separat fr\u00e5n livetiming.":"\u00daltima clasificaci\u00f3n publicada \u00b7 se actualiza por separado del directo.","Ingen banv\u00e4derrapport tillg\u00e4nglig \u00e4nnu":"A\u00fan no hay informe meteorol\u00f3gico de pista","Ingen verifierad banritning tillg\u00e4nglig":"No hay plano de circuito verificado","Backendversion hanteras separat.":"La versi\u00f3n del backend se gestiona por separado.","Ingen s\u00e4kerst\u00e4lld f\u00f6rardata fr\u00e5n det aktuella eller f\u00f6reg\u00e5ende passet.":"A\u00fan no hay datos de pilotos verificados para esta sesi\u00f3n o la anterior.","SPOILERL\u00c4GE":"MODO SIN SPOILERS","MELLAN PASSEN":"ENTRE SESIONES","SENASTE PASS AVSLUTAT":"\u00daLTIMA SESI\u00d3N TERMINADA","SENASTE PASS":"\u00daLTIMA SESI\u00d3N","V\u00c4NTAR / OFFLINE":"ESPERANDO / SIN CONEXI\u00d3N","D\u00f6lj f\u00f6rare":"Ocultar pilotos","Visa f\u00f6rare":"Mostrar pilotos","KOMMANDE":"PR\u00d3XIMAMENTE","AVSLUTAT":"FINALIZADO","IDAG":"HOY","LIVETIMING":"TIEMPOS EN DIRECTO","Ingen aktiv session":"No hay sesi\u00f3n activa","F\u00f6rare":"Piloto","Ledare":"L\u00edder","Senaste":"\u00daltima","Snabbaste":"M\u00e1s r\u00e1pida","\u00d6ppna":"Abrir","St\u00e4ng":"Cerrar","Banv\u00e4der":"Tiempo en pista","Banlayout":"Plano del circuito","Helgens schema":"Programa del fin de semana","VM-st\u00e4llning":"Clasificaci\u00f3n","Varv":"Vuelta","varv":"vueltas","kvar":"restantes","varv kvar":"vueltas restantes","N\u00e4sta:":"Siguiente:","Totalt":"Total","Ingen data":"Sin datos"},"it":{"\ud83c\udfc6 VM-st\u00e4llning":"\ud83c\udfc6 Classifica mondiale","Visa VM-st\u00e4llning":"Mostra classifica","D\u00f6lj VM-st\u00e4llning":"Nascondi classifica","\ud83d\uddd3\ufe0f Helgschema":"\ud83d\uddd3\ufe0f Programma del weekend","\ud83c\udf24\ufe0f Banv\u00e4der":"\ud83c\udf24\ufe0f Meteo pista","\ud83c\udfc1 Banlayout":"\ud83c\udfc1 Tracciato","\u24d8 UI-information":"\u24d8 Informazioni interfaccia","F\u00f6rare / team":"Pilota / team","F\u00d6RARE / TEAM":"PILOTA / TEAM","Relativ po\u00e4ng":"Punti relativi","Po\u00e4ng":"Punti","LEDARE":"LEADER","POS":"POS","NR":"N.","VARV":"GIRI","SENASTE VARV":"ULTIMO GIRO","FRAMF\u00d6R":"DAVANTI","STATUS":"STATO","Lap record":"Record sul giro","Pole lap":"Giro di pole","Race lap":"Miglior giro in gara","Senast publicerad VM-st\u00e4llning \u00b7 uppdateras separat fr\u00e5n livetiming.":"Ultima classifica pubblicata \u00b7 aggiornata separatamente dal live timing.","Ingen banv\u00e4derrapport tillg\u00e4nglig \u00e4nnu":"Dati meteo pista non ancora disponibili","Ingen verifierad banritning tillg\u00e4nglig":"Tracciato verificato non disponibile","Backendversion hanteras separat.":"La versione del backend \u00e8 gestita separatamente.","Ingen s\u00e4kerst\u00e4lld f\u00f6rardata fr\u00e5n det aktuella eller f\u00f6reg\u00e5ende passet.":"Nessun dato pilota verificato per questa sessione o la precedente.","SPOILERL\u00c4GE":"MODALIT\u00c0 ANTI-SPOILER","MELLAN PASSEN":"TRA LE SESSIONI","SENASTE PASS AVSLUTAT":"ULTIMA SESSIONE TERMINATA","SENASTE PASS":"ULTIMA SESSIONE","V\u00c4NTAR / OFFLINE":"IN ATTESA / OFFLINE","D\u00f6lj f\u00f6rare":"Nascondi piloti","Visa f\u00f6rare":"Mostra piloti","KOMMANDE":"IN ARRIVO","AVSLUTAT":"TERMINATO","IDAG":"OGGI","LIVETIMING":"CRONOMETRAGGIO LIVE","Ingen aktiv session":"Nessuna sessione attiva","F\u00f6rare":"Pilota","Ledare":"Leader","Senaste":"Ultimo","Snabbaste":"Pi\u00f9 veloce","\u00d6ppna":"Apri","St\u00e4ng":"Chiudi","Banv\u00e4der":"Meteo pista","Banlayout":"Tracciato","Helgens schema":"Programma del weekend","VM-st\u00e4llning":"Classifica","Varv":"Giro","varv":"giri","kvar":"rimanenti","varv kvar":"giri rimanenti","N\u00e4sta:":"Prossimo:","Totalt":"Totale","Ingen data":"Nessun dato"},"fr":{"\ud83c\udfc6 VM-st\u00e4llning":"\ud83c\udfc6 Classement du championnat","Visa VM-st\u00e4llning":"Afficher le classement","D\u00f6lj VM-st\u00e4llning":"Masquer le classement","\ud83d\uddd3\ufe0f Helgschema":"\ud83d\uddd3\ufe0f Programme du week-end","\ud83c\udf24\ufe0f Banv\u00e4der":"\ud83c\udf24\ufe0f M\u00e9t\u00e9o de piste","\ud83c\udfc1 Banlayout":"\ud83c\udfc1 Trac\u00e9 du circuit","\u24d8 UI-information":"\u24d8 Informations interface","F\u00f6rare / team":"Pilote / \u00e9quipe","F\u00d6RARE / TEAM":"PILOTE / \u00c9QUIPE","Relativ po\u00e4ng":"Points relatifs","Po\u00e4ng":"Points","LEDARE":"LEADER","POS":"POS","NR":"N\u00b0","VARV":"TOURS","SENASTE VARV":"DERNIER TOUR","FRAMF\u00d6R":"DEVANT","STATUS":"STATUT","Lap record":"Record du tour","Pole lap":"Tour de pole","Race lap":"Meilleur tour en course","Senast publicerad VM-st\u00e4llning \u00b7 uppdateras separat fr\u00e5n livetiming.":"Dernier classement publi\u00e9 \u00b7 mis \u00e0 jour s\u00e9par\u00e9ment du direct.","Ingen banv\u00e4derrapport tillg\u00e4nglig \u00e4nnu":"Aucune m\u00e9t\u00e9o de piste disponible pour l'instant","Ingen verifierad banritning tillg\u00e4nglig":"Aucun trac\u00e9 de circuit v\u00e9rifi\u00e9 disponible","Backendversion hanteras separat.":"Version du backend g\u00e9r\u00e9e s\u00e9par\u00e9ment.","Ingen s\u00e4kerst\u00e4lld f\u00f6rardata fr\u00e5n det aktuella eller f\u00f6reg\u00e5ende passet.":"Aucune donn\u00e9e pilote v\u00e9rifi\u00e9e pour cette s\u00e9ance ou la pr\u00e9c\u00e9dente.","SPOILERL\u00c4GE":"MODE ANTI-SPOILER","MELLAN PASSEN":"ENTRE LES S\u00c9ANCES","SENASTE PASS AVSLUTAT":"DERNI\u00c8RE S\u00c9ANCE TERMIN\u00c9E","SENASTE PASS":"DERNI\u00c8RE S\u00c9ANCE","V\u00c4NTAR / OFFLINE":"EN ATTENTE / HORS LIGNE","D\u00f6lj f\u00f6rare":"Masquer les pilotes","Visa f\u00f6rare":"Afficher les pilotes","KOMMANDE":"\u00c0 VENIR","AVSLUTAT":"TERMIN\u00c9","IDAG":"AUJOURD'HUI","LIVETIMING":"CHRONOM\u00c9TRAGE EN DIRECT","Ingen aktiv session":"Aucune s\u00e9ance active","F\u00f6rare":"Pilote","Ledare":"Leader","Senaste":"Dernier","Snabbaste":"Plus rapide","\u00d6ppna":"Ouvrir","St\u00e4ng":"Fermer","Banv\u00e4der":"M\u00e9t\u00e9o de piste","Banlayout":"Trac\u00e9 du circuit","Helgens schema":"Programme du week-end","VM-st\u00e4llning":"Classement","Varv":"Tour","varv":"tours","kvar":"restants","varv kvar":"tours restants","N\u00e4sta:":"Suivant :","Totalt":"Total","Ingen data":"Aucune donn\u00e9e"}};
  const SUPPORTED=['en','sv','es','it','fr'];
  const localeFor=hass=>{
    // No HA language in isolated preview/test harnesses; keep their raw legacy strings.
    const value=String(hass?.language||hass?.locale?.language||'').trim().toLowerCase();
    if(!value)return '';
    const base=value.split(/[-_]/)[0];
    return SUPPORTED.includes(base)?base:'en';
  };
  function translate(html,lang){
    const source=CATALOGS.sv, target=CATALOGS[lang]||CATALOGS.en;
    if(!target||!source||typeof html!=='string')return html;
    // Translate visible text nodes, never data attributes, HTML tags, SVG paths,
    // team/rider names or user-supplied external feed fields.
    return html.replace(/>([^<>]*)</g,(full,raw)=>{
      const trimmed=raw.trim();
      if(!trimmed)return full;
      const translated=Object.hasOwn(target,trimmed)?target[trimmed]:null;
      if(translated!==null)return '>'+raw.replace(trimmed,translated)+'<';
      // Session countdown prefixes contain dynamic data; translate only the prefix.
      const prefix=trimmed.match(/^(Nästa:)(\s.*)$/);
      if(prefix)return '>'+raw.replace(trimmed,(target['Nästa:']||CATALOGS.en['Nästa:'])+prefix[2])+'<';
      return full;
    });
  }
  function install(){
    for(const tag of ['ha-motogp-next-overview-card','ha-motogp-next-timing-card']){
      const Type=customElements.get(tag);
      if(!Type||Type.prototype._mgpI18n)continue;
      const original=Type.prototype._render;
      Type.prototype._render=function(...args){
        const result=original.apply(this,args);
        const language=localeFor(this._hass);
        const view=this.shadowRoot?.getElementById?.('app');
        if(language&&view&&typeof view.innerHTML==='string'){
          const updated=translate(view.innerHTML,language);
          if(updated!==view.innerHTML)view.innerHTML=updated;
        }
        return result;
      };
      Type.prototype._mgpI18n=true;
    }
  }
  customElements.whenDefined('ha-motogp-next-timing-card').then(install);
})();

;
/* HA-MGP season calendar: off-weekend alternative for the overview card. */
(() => {
  'use strict';
  const TAG='ha-motogp-next-overview-card';
  const BUILD='calendar-20261109-05';
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const parseDate=raw=>{
    const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(raw||''));
    if(!m)return null;
    const d=new Date(+m[1],+m[2]-1,+m[3],12);
    return d.getFullYear()===+m[1]&&d.getMonth()===+m[2]-1&&d.getDate()===+m[3]?d:null;
  };
  const dateKey=d=>d?''+[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-'):'';
  // FIM/MotoGP's provisional 2027 season, published 25 September 2026.
  // Explicitly an offline calendar snapshot, NOT a Pulselive event UUID.
  // Do not request historical classifications for a published-only ID.
  // https://www.fim-moto.com/en/news/news-detail/article/2027-provisional-fim-motogptm-world-championship-calendar
  const PUBLISHED_2027=Object.freeze([["2027-03-05","2027-03-07","Thailand","Thailand","Buriram"],["2027-03-12","2027-03-14","Qatar","Qatar","Lusail"],["2027-04-02","2027-04-04","Brazil","Brazil","Goiania"],["2027-04-09","2027-04-11","Argentina","Argentina","Buenos Aires"],["2027-04-23","2027-04-25","USA","USA","Austin"],["2027-05-07","2027-05-09","Spain","Spain","Jerez"],["2027-05-14","2027-05-16","France","France","Le Mans"],["2027-05-28","2027-05-30","Italy","Italy","Mugello"],["2027-06-11","2027-06-13","Catalonia","Spain","Barcelona"],["2027-06-25","2027-06-27","Netherlands","Netherlands","Assen"],["2027-07-09","2027-07-11","Germany","Germany","Sachsenring"],["2027-07-16","2027-07-18","Czechia","Czechia","Brno"],["2027-08-13","2027-08-15","Great Britain","Great Britain","Silverstone"],["2027-08-27","2027-08-29","Austria","Austria","Red Bull Ring"],["2027-09-10","2027-09-12","San Marino","San Marino","Misano"],["2027-09-17","2027-09-19","Aragon","Spain","MotorLand Aragón"],["2027-10-01","2027-10-03","Portugal","Portugal","Portimao"],["2027-10-15","2027-10-17","Japan","Japan","Motegi"],["2027-10-22","2027-10-24","Malaysia","Malaysia","Sepang"],["2027-10-29","2027-10-31","Indonesia","Indonesia","Mandalika"],["2027-11-12","2027-11-14","Australia","Australia","Adelaide Street Circuit"],["2027-11-26","2027-11-28","Valencia","Spain","Ricardo Tormo"]].map(
    ([date_start,date_end,short_name,country,circuit],i)=>({
      id:'published-2027-'+String(i+1).padStart(2,'0'),
      date_start,date_end,short_name:short_name+' GP',country,circuit,provisional:true
    })
  ));
  const flagCountry={
    thailand:'🇹🇭',argentina:'🇦🇷',brazil:'🇧🇷',brasil:'🇧🇷',usa:'🇺🇸',qatar:'🇶🇦',
    spain:'🇪🇸',france:'🇫🇷',italy:'🇮🇹',netherlands:'🇳🇱',germany:'🇩🇪',
    hungary:'🇭🇺',austria:'🇦🇹',sanmarino:'🇸🇲','san marino':'🇸🇲',japan:'🇯🇵',
    indonesia:'🇮🇩',australia:'🇦🇺',malaysia:'🇲🇾',portugal:'🇵🇹',valencia:'🇪🇸',
    'united kingdom':'🇬🇧','great britain':'🇬🇧','czech republic':'🇨🇿',czechia:'🇨🇿',
    kazakhstan:'🇰🇿',india:'🇮🇳',finland:'🇫🇮',turkey:'🇹🇷',
  };
  const flagFor=c=>flagCountry[String(c||'').trim().toLowerCase()]||'🏁';
  const dateRange=(start,end,locale)=>{
    const opts={day:'numeric',month:'short'};
    const lang=['en','sv','es','it','fr'].includes(locale)?locale:'en';
    const fmt=d=>d.toLocaleDateString(lang,opts);
    if(!start||!end)return '—';
    return dateKey(start)===dateKey(end)?fmt(start):fmt(start)+' – '+fmt(end);
  };
  const raceWeekend=(card,now,events)=>{
    const states=card._hass?.states||{};
    const binary=states['binary_sensor.motogp_race_weekend_active']||
      states['binary_sensor.motogp_race_week'];
    const state=String(binary?.state||'').toLowerCase();
    if(state==='on')return true;
    if(state==='off')return false;
    // Fallback when race-week binary is missing. Use the event's actual
    // inclusive date span instead of inferring that a completed session ends the GP.
    const today=dateKey(now);
    return events.some(e=>today>=dateKey(e.start)&&today<=dateKey(e.end));
  };
  const STYLES=`
    .mgp-season{container-type:inline-size;min-width:0;border:1px solid var(--divider-color,#ddd);border-radius:15px;overflow:hidden;background:var(--ha-card-background,var(--card-background-color,#fff))}
    .mgp-season-head{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;padding:13px 16px;border-bottom:1px solid var(--divider-color,#ddd)}
    .mgp-season-head strong{font-size:20px;font-weight:900}
    .mgp-season-head small{font-size:11px;color:var(--secondary-text-color)}
    .mgp-season-years{display:flex;align-items:center;gap:6px}
    .mgp-season-years button{cursor:pointer;font:inherit;border:1px solid var(--divider-color,#ddd);border-radius:8px;padding:5px 10px;background:transparent;color:inherit;font-size:12px;font-weight:800}
    .mgp-season-years button[aria-selected=true]{border-color:var(--primary-color,#039be5);background:rgba(0,153,220,.12)}
    .mgp-season-provisional{padding:2px 14px 10px;color:var(--secondary-text-color);font-size:11px}
    .mgp-season-next{margin:13px;border:1px solid rgba(225,6,0,.4);border-left:4px solid #e10600;border-radius:12px;padding:15px;display:grid;gap:5px;background:rgba(225,6,0,.045)}
    .mgp-season-next-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(140px,34%);align-items:center;gap:15px}
    .mgp-season-next-copy{display:grid;align-content:center;gap:5px;min-width:0}
    .mgp-season-track{position:relative;display:flex;align-items:center;justify-content:center;min-width:0;overflow:hidden}
    .mgp-season-track svg{display:block;width:100%;height:100%;max-height:100%;fill:none;overflow:visible}
    .mgp-season-track path{stroke:var(--primary-text-color,#222);stroke-width:4;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}
    .mgp-season-track img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;opacity:0}
    .mgp-season-track img.is-ready{opacity:1}
    .mgp-season-track img.is-ready+svg{opacity:0}
    .mgp-season-track--next{height:155px}
    .mgp-season-track--tile{height:73px;margin:2px 0}
    .mgp-season-track-note{display:block;font-size:10px;color:var(--secondary-text-color);text-align:center}
    .mgp-season-track-missing{font-size:11px;color:var(--secondary-text-color);text-align:center}
    .mgp-season-next h3{font-size:20px;line-height:1.2;margin:2px 0;font-weight:900}
    .mgp-season-next small{color:var(--secondary-text-color)}
    .mgp-season-mark{font-size:11px;font-weight:800;color:#e10600}
    .mgp-season-title{display:flex;align-items:center;gap:8px;min-width:0}
    .mgp-season-list{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;padding:11px}
    .mgp-season-event{padding:12px;min-width:0;display:flex;flex-direction:column;gap:8px;border:1px solid var(--divider-color,#ddd);border-radius:11px;color:inherit;text-align:left;background:transparent;font:inherit}
    button.mgp-season-event{cursor:pointer;width:100%}
    button.mgp-season-event:hover{border-color:var(--primary-color,#039be5)}
    button.mgp-season-event:focus-visible{outline:2px solid var(--primary-color,#039be5);outline-offset:2px}
    .mgp-season-event .mgp-open-label{font-size:10px;color:var(--primary-color,#039be5);margin-top:auto}
    .mgp-season-dialog{box-sizing:border-box;position:fixed;inset:0;margin:auto;width:min(820px,calc(100vw - 28px));max-width:calc(100vw - 28px);max-height:calc(100dvh - 28px);padding:0;border-radius:15px;border:1px solid var(--divider-color,#ddd);color:var(--primary-text-color);background:var(--ha-card-background,var(--card-background-color,#fff));box-shadow:0 20px 60px rgba(0,0,0,.3);overflow:hidden}
    .mgp-season-dialog[open]{display:flex;flex-direction:column}
    .mgp-season-dialog::backdrop{background:rgba(0,0,0,.55)}
    .mgp-season-dialog-head{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--divider-color,#ddd)}
    .mgp-season-dialog-head strong{font-size:14px}
    .mgp-season-dialog-head button{font:inherit;color:inherit;cursor:pointer;border-radius:8px;border:1px solid var(--divider-color,#ddd);background:transparent;padding:7px 13px}
    .mgp-season-dialog-body{min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:14px}
    .mgp-season-detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
    .mgp-season-detail-grid>span{border:1px solid var(--divider-color,#ddd);padding:9px;border-radius:8px;font-size:12px}
    .mgp-season-detail-grid b{display:block;margin-top:4px}
    .mgp-season-results-tabs{display:flex;gap:6px;margin:12px 0;flex-wrap:wrap}
    .mgp-season-results-tabs button{border:1px solid var(--divider-color,#ddd);border-radius:9px;background:transparent;color:inherit;padding:8px 12px;cursor:pointer;font:inherit}
    .mgp-season-results-tabs button[aria-selected=true]{border-color:var(--primary-color,#039be5);background:rgba(0,153,220,.12)}
    .mgp-season-results{width:100%;border-collapse:collapse;font-size:12px}
    .mgp-season-results td,.mgp-season-results th{padding:7px 5px;text-align:left;border-bottom:1px solid var(--divider-color,#ddd)}
    .mgp-season-detail-note{font-size:12px;color:var(--secondary-text-color);margin:12px 0}
    .mgp-season-event.is-next{border-color:#e10600}
    .mgp-season-event.is-past{background:var(--secondary-background-color,rgba(127,127,127,.065));opacity:.65;filter:grayscale(1)}
    .mgp-season-dialog .mgp-season-track{opacity:1;filter:none}
    .mgp-season-event.is-past .mgp-round::before{content:'✓ ';font-weight:900}
    .mgp-season-event.is-past:hover{opacity:.85}
    .mgp-season-event b{font-size:13px;overflow-wrap:anywhere}
    .mgp-season-event small{color:var(--secondary-text-color);font-size:11px}
    .mgp-season-event .mgp-round{font-weight:900;color:var(--secondary-text-color);font-size:11px}
    .mgp-season-section{padding:12px 13px 0;font-size:13px;font-weight:850}
    .mgp-season-past{margin:0 13px 13px;padding:8px 0;border-top:1px solid var(--divider-color,#ddd)}
    .mgp-season-past>summary{cursor:pointer;font-size:12px;font-weight:800;padding:8px 3px}
    .mgp-season-empty{padding:18px;color:var(--secondary-text-color)}
    @container (max-width:850px){.mgp-season-list{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @container (max-width:470px){.mgp-season-list{grid-template-columns:1fr}.mgp-season-head strong{font-size:17px}.mgp-season-next-layout{grid-template-columns:minmax(0,1fr)}.mgp-season-track--next{height:130px}}
  `;
  function calendar(card,now,useStandardHeader=false){
    const states=card._hass?.states||{};
    const race=states[card._ids?.race];
    const liveCalendar=race?.attributes?.season_calendar;
    const todayYear=now.getFullYear();
    const selectedYear=['2026','2027'].includes(String(card._mgpCalendarYear))?
      Number(card._mgpCalendarYear):(todayYear>=2027?2027:2026);
    // Prefer live official API events when the backend season matches.
    // Until then, offer the FIM-published 2027 provisional calendar offline.
    const backendYear=Number(states['sensor.motogp_current_season']?.state);
    const raw=selectedYear===2027&&backendYear!==2027?
      PUBLISHED_2027:Array.isArray(liveCalendar)?liveCalendar:[];
    if(!Array.isArray(raw)||!raw.length)return null;
    const entries=raw.map((e,i)=>{
      if(!e||typeof e!=='object')return null;
      const start=parseDate(e.date_start),end=parseDate(e.date_end);
      if(!start||!end||end<start)return null;
      return {...e,start,end,originalOrder:i};
    }).filter(Boolean).sort((a,b)=>a.start-b.start);
    if(!entries.length)return null;
    if(raceWeekend(card,now,entries))return null;
    const lang=String(card._hass?.language||'en').split(/[-_]/)[0].toLowerCase();
    const locale=['en','sv','es','it','fr'].includes(lang)?lang:'en';
    const year=selectedYear;
    const isProvisional=selectedYear===2027&&backendYear!==2027;
    const today=dateKey(now);
    const next=entries.find(e=>dateKey(e.end)>=today);
    const index=next?entries.indexOf(next):-1;
    const future=index>=0?entries.slice(index):[];
    const past=index>=0?entries.slice(0,index):entries;
    const labels={
      en:['Season calendar','Next Grand Prix','Upcoming races','Completed races','Season complete','No race data available'],
      sv:['Tävlingskalender','Nästa Grand Prix','Kommande tävlingar','Avverkade tävlingar','Säsongen avslutad','Ingen kalenderdata'],
      es:['Calendario de la temporada','Próximo Gran Premio','Próximas carreras','Carreras disputadas','Temporada terminada','Sin datos del calendario'],
      it:['Calendario stagionale','Prossimo Gran Premio','Prossime gare','Gare concluse','Stagione conclusa','Dati calendario non disponibili'],
      fr:['Calendrier de la saison','Prochain Grand Prix','Prochaines courses','Courses terminées','Saison terminée','Pas de données de calendrier']
    }[locale];
    const eventName=e=>esc(e.short_name||e.name||e.sponsored_name||'Grand Prix');
    const country=e=>esc(e.country||'');
    const circuit=e=>esc(e.circuit||'');
    const dates=e=>esc(dateRange(e.start,e.end,locale));
    const countdown=e=>{
      if(!e||dateKey(e.start)<=today)return '';
      const days=Math.max(0,Math.ceil((e.start.getTime()-now.getTime())/86400000));
      const unit=({sv:'dagar kvar',en:'days to go',es:'días restantes',it:'giorni mancanti',fr:'jours restants'})[locale];
      return days+' '+unit;
    };
    // Only draw shapes from the central MotoGP circuit registry. A missing or
    // unverified layout is never substituted with a different circuit's path.
    const trackHtml=(e,large=false)=>{
      const circuitName=String(e.circuit||'').trim();
      const track=typeof card._mgpCalendarTrack==='function'?card._mgpCalendarTrack(circuitName):null;
      if(!track||!/^[a-z][a-z0-9]*$/.test(String(track.id||''))||
          !/^M[\d., LZz-]+$/.test(String(track.d||''))){
        return '<div class="mgp-season-track mgp-season-track--'+(large?'next':'tile')+
          '"><span class="mgp-season-track-missing">Banlayout saknas</span></div>';
      }
      const path=esc(track.d);
      // Pre-existing geometry is schematic, not an asserted MotoGP race variant.
      const vector='<svg viewBox="0 0 280 160" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Schematisk banlayout för '+
        esc(circuitName)+'"><path d="'+path+'"></path></svg>';
      const local=track.localPath&&/^\/local\/ha-mgp\/circuits\/[a-z0-9]+\.svg$/.test(track.localPath)?
        '<img src="'+esc(track.localPath)+'" alt="" loading="lazy" decoding="async">':'';
      return '<div class="mgp-season-track mgp-season-track--'+(large?'next':'tile')+'">'+
        local+vector+'</div>';
    };
    const cardHtml=(e,isPast=false)=>{
      const i=entries.indexOf(e)+1;
      const clickable=String(e.id||'').length>0&&String(e.id||'').length<=128;
      return (clickable?'<button type="button" data-mgp-season-event="'+esc(e.id)+'"':'<div')+
        ' class="mgp-season-event'+(isPast?' is-past':'')+'">'+
        '<span class="mgp-round">R'+i+'</span>'+
        '<div class="mgp-season-title"><span>'+flagFor(e.country)+'</span><b>'+eventName(e)+'</b></div>'+
        '<small>'+dates(e)+'</small>'+trackHtml(e)+'<small>'+circuit(e)+'</small><small>'+country(e)+'</small>'+
        (clickable?'<span class="mgp-open-label">Visa baninformation ⤢</span>':'')+
        (clickable?'</button>':'</div>');
    };
    // The highlighted GP is already represented in the hero: never repeat it.
    const upcoming=future.filter(e=>e!==next).map(e=>cardHtml(e,false)).join('');
    const previous=past.map(e=>cardHtml(e,true)).join('');
    const nextHtml=next?'<div class="mgp-season-next"><div class="mgp-season-next-layout"><div class="mgp-season-next-copy"><span class="mgp-season-mark">'+labels[1]+' · R'+(index+1)+'</span>'+
      '<h3>'+flagFor(next.country)+' '+eventName(next)+'</h3><b>'+dates(next)+'</b>'+
      '<small>'+circuit(next)+(next.country?' · '+country(next):'')+'</small>'+ (countdown(next)?'<strong class="mgp-season-mark">'+esc(countdown(next))+'</strong>':'')+
      '</div><div>'+trackHtml(next,true)+'<span class="mgp-season-track-note">Schematisk banlayout</span></div></div></div>':
      '<div class="mgp-season-empty">'+labels[4]+'</div>';

    const selected=entries.find(e=>String(e.id||'')&&String(e.id)===String(card._mgpSelectedEventId||''));
    const detail=selected?(()=>{
      const isPast=dateKey(selected.end)<today;
      const facts=typeof card._mgpCalendarFacts==='function'?card._mgpCalendarFacts(selected.circuit):null;
      const dimensions=facts?[
        ['Banlängd',facts.length],['Bredd',facts.width],
        ['Längsta raka',facts.straight],['Högerkurvor',facts.right],
        ['Vänsterkurvor',facts.left]
      ].filter(([_,value])=>value).map(([label,value])=>
        '<span>'+esc(label)+'<b>'+esc(value)+'</b></span>').join(''):'';
      const factsHtml=dimensions?'<div class="mgp-season-detail-grid">'+dimensions+'</div>'+
        (String(facts.source||'').startsWith('https://')?
          '<p><a href="'+esc(facts.source)+'" target="_blank" rel="noopener noreferrer">Källa för banfakta</a></p>':''):
        '<p class="mgp-season-detail-note">Verifierade banmått saknas.</p>';
      const selectedId=String(selected.id||'');
      const server=card._mgpEventResultsCache?.[selectedId];
      const pending=card._mgpEventResultsPending===selectedId;
      const error=card._mgpEventResultsError?.[selectedId];
      const selectedClass=['MotoGP','Moto2','Moto3'].includes(card._mgpEventResultsClass)?card._mgpEventResultsClass:'MotoGP';
      const classes=server?.categories||{};
      const source=server?.event_id===selectedId&&server?.source==='pulselive_results';
      const group=source?classes[selectedClass]:null;
      const pole=group?.pole;
      const results=Array.isArray(group?.race)?group.race:[];
      const sprint=Array.isArray(group?.sprint)?group.sprint:[];
      const raceRows=results.slice(0,40).map(r=>
        '<tr><td>'+esc(r.position??'—')+'</td><td>'+esc(r.rider||'—')+'</td><td>'+esc(r.time||r.gap||r.status||'—')+'</td></tr>').join('');
      const resultsHtml=!isPast?
        '<p class="mgp-season-detail-note">Pole-tider och raceresultat visas efter att tävlingen avgjorts. Inga framtida värden uppskattas.</p>':
        (typeof card._spoiler==='function'&&card._spoiler())?
        '<p class="mgp-season-detail-note">Resultat är dolda när spoilerläget är aktivt.</p>':
        '<h3>Officiella sessionsresultat</h3>'+
        '<div class="mgp-season-results-tabs" role="tablist" aria-label="Tävlingsklass">'+
          ['MotoGP','Moto2','Moto3'].map(c=>'<button type="button" data-mgp-season-category="'+c+
            '" role="tab" aria-selected="'+(c===selectedClass)+'">'+c+'</button>').join('')+'</div>'+
        (pending?'<p class="mgp-season-detail-note">Hämtar Pulselive-resultat …</p>':
        error?'<p class="mgp-season-detail-note">Resultat kunde inte hämtas från Pulselive.</p>':
        !source?'<p class="mgp-season-detail-note">Välj ett avslutat GP för att hämta resultaten.</p>':
        '<div class="mgp-season-detail-grid"><span>Pole (Q2)<b>'+
          (pole?esc((pole.rider||'')+' · '+(pole.time||'')):'Ej tillgängligt')+'</b></span>'+
          '<span>Sprint<b>'+ (sprint.length?esc(sprint[0].rider||'—'):'Ej tillgängligt')+'</b></span></div>'+
        (raceRows?'<h4>Raceresultat · '+selectedClass+'</h4><table class="mgp-season-results"><thead><tr><th>Plac.</th><th>Förare</th><th>Tid / status</th></tr></thead><tbody>'+
          raceRows+'</tbody></table>':
          '<p class="mgp-season-detail-note">Inget verifierat raceresultat för denna klass.</p>')+
        '<p class="mgp-season-detail-note">Källa: MotoGP Pulselive Results API · ingen egen varvtidsdatabas.</p>');
      return '<dialog class="mgp-season-dialog" aria-label="GP-detaljer för '+eventName(selected)+'">'+
        '<div class="mgp-season-dialog-head"><strong>🏁 '+eventName(selected)+'</strong>'+
        '<button type="button" data-mgp-season-close>Stäng</button></div>'+
        '<div class="mgp-season-dialog-body"><p>'+dates(selected)+' · '+circuit(selected)+'</p>'+
        trackHtml(selected,true)+factsHtml+
        '<p class="mgp-season-detail-note">Rekord kopplas till verifierad banvariant och officiell källa. Saknas uppgift visas inget påhittat värde.</p>'+
        resultsHtml+'</div></dialog>';
    })():'';
    return '<section class="mgp-season" aria-label="'+labels[0]+'">'+
      '<header class="mgp-season-head"><strong>🗓️ '+labels[0]+' '+esc(year)+'</strong>'+
      '<div class="mgp-season-years" role="tablist" aria-label="Säsong">'+
      [2026,2027].map(y=>'<button type="button" data-mgp-season-year="'+y+
        '" role="tab" aria-selected="'+(y===selectedYear)+'">'+y+'</button>').join('')+
      '<small>'+entries.length+' GP</small></div></header>'+
      (isProvisional?'<div class="mgp-season-provisional">Preliminär FIM-kalender 2027, publicerad 25 september 2026. Tider och datum kan ändras.</div>':'')+
      (useStandardHeader?'':nextHtml)+(upcoming?'<div class="mgp-season-section">'+labels[2]+'</div>'+
      '<div class="mgp-season-list">'+upcoming+'</div>':'')+
      (previous?'<details class="mgp-season-past"><summary>✓ '+labels[3]+' ('+past.length+')</summary>'+
       '<div class="mgp-season-list">'+previous+'</div></details>':'')+'</section>'+detail;
  }
  function install(){
    const Card=customElements.get(TAG);
    if(!Card||Card.prototype._mgpSeasonCalendar)return;
    const original=Card.prototype._render;
    Card.prototype._render=function(...args){
      const result=original.apply(this,args);
      if(!this._hass||!this.shadowRoot)return result;
      const view=this.shadowRoot.getElementById?.('app');
      if(!view)return result;
      // Preserve the genuine event header with its existing schedule,
      // championship tabs, circuit panel, records and interaction handlers.
      const originalHeader=view.querySelector?.('section.panel.header');
      const backendYear=Number(this._hass?.states?.['sensor.motogp_current_season']?.state);
      const selectedYear=['2026','2027'].includes(String(this._mgpCalendarYear))?
        Number(this._mgpCalendarYear):(new Date().getFullYear()>=2027?2027:2026);
      const useStandardHeader=Boolean(
        originalHeader?.outerHTML?.includes('data-mgp-hero-grid')&&selectedYear===backendYear
      );
      const headerHtml=useStandardHeader?originalHeader.outerHTML:'';
      const scheduleHtml=useStandardHeader&&this._scheduleOpen===true?
        (view.querySelector?.('.mgp-weekend-dialog')?.outerHTML||''):'';
      const standingsHtml=useStandardHeader&&this._standingOpen===true?
        (view.querySelector?.('.np-card[aria-label="VM-ställning"]')?.outerHTML||''):'';
      const value=calendar(this,new Date(),useStandardHeader);
      if(!value)return result;
      if(!this.shadowRoot.querySelector?.('[data-mgp-calendar-style]')){
        const style=document.createElement('style');
        style.setAttribute('data-mgp-calendar-style','');
        style.textContent=STYLES;
        this.shadowRoot.appendChild(style);
      }
      // During non-race weeks the calendar replaces the live overview content.
      // Live timing stays in its separate card, unchanged and spoiler-protected.
      const footer=(view.innerHTML.match(/<div class="foot">[\s\S]*?<\/div>/)||[])[0]||'';
      view.innerHTML='<div class="root">'+headerHtml+scheduleHtml+standingsHtml+value+footer+'</div>';
      // Any modal opened by the header renderer must survive the calendar
      // replacement; restore it in the top layer (with its own scroll).
      for(const [selector,active] of [
        ['.mgp-season-dialog',Boolean(this._mgpSelectedEventId)],
        ['.mgp-weekend-dialog',this._scheduleOpen===true&&useStandardHeader],
        ['.mgp-circuit-dialog',this._circuitOpen===true&&useStandardHeader]
      ]){
        const dialog=view.querySelector?.(selector);
        if(dialog&&active&&typeof dialog.showModal==='function'&&!dialog.open){
          dialog.addEventListener('cancel',event=>{
            event.preventDefault();
            if(selector==='.mgp-season-dialog')this._mgpSelectedEventId=null;
            if(selector==='.mgp-weekend-dialog')this._scheduleOpen=false;
            if(selector==='.mgp-circuit-dialog')this._circuitOpen=false;
            this._render();
          },{once:true});
          dialog.showModal();
        }
      }
      // Use locally supplied SVG only after a successful load. Until then
      // the built-in vector outline remains visible, even if the local file 404s.
      for(const img of view.querySelectorAll?.('.mgp-season-track img')||[]){
        img.addEventListener('load',()=>{if(img.naturalWidth>0)img.classList.add('is-ready');},{once:true});
        img.addEventListener('error',()=>{img.classList.remove('is-ready');},{once:true});
        if(img.complete&&img.naturalWidth>0)img.classList.add('is-ready');
      }
      return result;
    };

    const previousClick=Card.prototype._click;
    Card.prototype._click=function(e){
      const target=e?.target;
      const year=target?.closest?.('[data-mgp-season-year]');
      if(year){
        const value=Number(year.getAttribute('data-mgp-season-year'));
        if(value===2026||value===2027){
          this._mgpCalendarYear=value;
          this._mgpSelectedEventId=null;
          this._mgpEventResultsPending=null;
          this._scheduleOpen=false;
          this._circuitOpen=false;
          this._render();
        }
        return;
      }
      if(target?.closest?.('[data-mgp-season-close]')){
        this._mgpSelectedEventId=null;this._render();return;
      }
      const category=target?.closest?.('[data-mgp-season-category]');
      if(category){
        this._mgpEventResultsClass=category.getAttribute('data-mgp-season-category');
        this._render();return;
      }
      const event=target?.closest?.('[data-mgp-season-event]');
      if(event){
        const id=String(event.getAttribute('data-mgp-season-event')||'');
        const backendYear=Number(this._hass?.states?.['sensor.motogp_current_season']?.state);
        const selectedYear=Number(this._mgpCalendarYear||2026);
        const entries=selectedYear===2027&&backendYear!==2027?
          PUBLISHED_2027:this._hass?.states?.[this._ids?.race]?.attributes?.season_calendar;
        const record=Array.isArray(entries)?entries.find(x=>String(x.id||'')===id):null;
        if(!record||!id)return;
        this._mgpSelectedEventId=id;
        this._mgpEventResultsClass='MotoGP';
        this._scheduleOpen=false;
        this._circuitOpen=false;
        this._render();
        const end=parseDate(record.date_end);
        const past=end&&dateKey(end)<dateKey(new Date());
        if(!past||record.provisional||id.startsWith('published-')||
          typeof this._spoiler==='function'&&this._spoiler())return;
        if(this._mgpEventResultsCache?.[id]||this._mgpEventResultsPending===id)return;
        if(typeof this._hass?.callWS!=='function')return;
        this._mgpEventResultsPending=id;
        this._render();
        this._hass.callWS({type:'motogp_sensor/event_results',event_id:id}).then(data=>{
          if(!data||String(data.event_id)!==id||data.source!=='pulselive_results')throw Error('Unexpected Pulselive event identity');
          this._mgpEventResultsCache={...(this._mgpEventResultsCache||{}),[id]:data};
          this._mgpEventResultsError={...(this._mgpEventResultsError||{}),[id]:false};
        }).catch(()=>{
          this._mgpEventResultsError={...(this._mgpEventResultsError||{}),[id]:true};
        }).finally(()=>{
          if(this._mgpEventResultsPending===id)this._mgpEventResultsPending=null;
          if(this._mgpSelectedEventId===id)this._render();
        });
        return;
      }
      return previousClick.call(this,e);
    };
    Card.prototype._mgpSeasonCalendar=BUILD;
  }
  customElements.whenDefined(TAG).then(install);
})();

;
/* HA-MGP: read-only API connectivity indicator in the event hero. */
(() => {
  'use strict';
  const TAG='ha-motogp-next-overview-card';
  const BUILD='api-status-20261108-01';
  const ENTITY='binary_sensor.motogp_live_timing_online';
  const STYLE=`
    .mgp-api-indicator{display:inline-flex;align-items:center;gap:6px;padding:4px 8px;border:1px solid var(--divider-color,#ddd);border-radius:999px;font-size:11px;font-weight:800;color:var(--secondary-text-color);white-space:nowrap;line-height:1.2}
    .mgp-api-dot{display:inline-block;width:8px;height:8px;border-radius:50%;flex:none;background:#9ca3af}
    .mgp-api-indicator[data-state="on"] .mgp-api-dot{background:#16a34a;box-shadow:0 0 0 2px rgba(22,163,74,.12)}
    .mgp-api-indicator[data-state="off"] .mgp-api-dot{background:#9ca3af}
    .mgp-api-indicator[data-state="unknown"] .mgp-api-dot{background:#d97706}
    .mgp-api-indicator[data-state="on"]{border-color:rgba(22,163,74,.24)}
    .mgp-api-indicator[data-state="unknown"]{border-color:rgba(217,119,6,.3)}
  `;
  const TEXT={
    sv:['Livetiming API','Online','Offline','Okänd'],
    en:['Live timing API','Online','Offline','Unknown'],
    es:['API de tiempos en vivo','En línea','Desconectada','Desconocida'],
    it:['API tempi live','Online','Offline','Sconosciuto'],
    fr:['API chronométrage','En ligne','Hors ligne','Inconnu']
  };
  function indicator(card){
    const raw=card._hass?.states?.[ENTITY]?.state;
    const status=raw==='on'?'on':raw==='off'?'off':'unknown';
    const language=String(card._hass?.language||card._hass?.locale?.language||'en').split(/[-_]/)[0].toLowerCase();
    const labels=TEXT[language]||TEXT.en;
    const message=status==='on'?labels[1]:status==='off'?labels[2]:labels[3];
    return '<span class="mgp-api-indicator" data-state="'+status+'" role="status" aria-label="'+
      labels[0]+': '+message+'" title="'+labels[0]+': '+message+'">'+
      '<span class="mgp-api-dot" aria-hidden="true"></span><span>'+labels[0]+'</span></span>';
  }
  function install(){
    const Card=customElements.get(TAG);
    if(!Card||Card.prototype._mgpApiIndicator)return;
    const original=Card.prototype._render;
    Card.prototype._render=function(...args){
      const result=original.apply(this,args);
      if(!this._hass||!this.shadowRoot)return result;
      const view=this.shadowRoot.getElementById?.('app');
      if(!view)return result;
      const html=view.innerHTML;
      const hero=html.indexOf('<div class="mgp-hero-copy">');
      if(hero<0)return result; // Calendar/off-week view has no event hero.
      if(!this.shadowRoot.querySelector?.('[data-mgp-api-status-style]')){
        const style=document.createElement('style');
        style.setAttribute('data-mgp-api-status-style','');
        style.textContent=STYLE;
        this.shadowRoot.appendChild(style);
      }
      const marker='<div class="mgp-branded-eyebrow">';
      // Brand appears in the left hero: append the API indicator as compact badge.
      const brand=html.indexOf('mgp-branded-eyebrow',hero);
      const h2=html.indexOf('<h2>',hero);
      if(brand<0||h2<0||brand>h2)return result;
      const pos=html.lastIndexOf('</div>',h2);
      if(pos<brand)return result;
      view.innerHTML=html.slice(0,pos+6)+indicator(this)+html.slice(pos+6);
      return result;
    };
    Card.prototype._mgpApiIndicator=BUILD;
  }
  customElements.whenDefined(TAG).then(install);
})();
;
/* HA-MGP: session-status dots, scoped to matching sessions. */
(() => {
'use strict';
const TAG_OVERVIEW='ha-motogp-next-overview-card';
const TAG_TIMING='ha-motogp-next-timing-card';
const BUILD='session-dots-20261108-01';
const SENSOR='sensor.motogp_session_status';
const STYLES=`
.mgp-session-dot{display:inline-block;flex:none;width:8px;height:8px;border-radius:50%;vertical-align:middle;margin-right:5px;background:#94a3b8}
.mgp-session-dot[data-status="started"]{background:#16a34a;box-shadow:0 0 0 2px rgba(22,163,74,.15)}
.mgp-session-dot[data-status="not-started"]{background:#eab308}
.mgp-session-dot[data-status="finished"]{background:#6b7280}
.mgp-session-dot[data-status="unknown"]{background:#d97706}
`;
const norm=value=>String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const cls=value=>{
 const m=/moto\s*(gp|2|3|e)/i.exec(String(value||''));
 return m?({gp:'MotoGP','2':'Moto2','3':'Moto3',e:'MotoE'})[m[1].toLowerCase()]:String(value||'');
};
const sess=value=>{
 const s=String(value||'').toUpperCase();
 return ({RAC:'Race',SPR:'Sprint',PR:'Practice',WUP:'Warm Up'})[s]||String(value||'');
};
function parsed(card){
 const state=card._hass?.states?.[SENSOR];
 const a=state?.attributes||{};
 const raw=String(state?.state||'').toLowerCase();
 const id=String(a.session_status_id||'').toUpperCase();
 const status=(raw==='in progress'||id==='I'||id==='S')?'started':
  (raw==='not started'||id==='N')?'not-started':
  (raw==='finished'||id==='F')?'finished':'unknown';
 const name=a.session_name||a.session_shortname;
 return {status,category:cls(a.category),name:sess(name),valid:!!(a.category&&name)};
}
function dot(status){
 const text={started:'In Progress','not-started':'Not Started',finished:'Finished',unknown:'Unknown'}[status];
 return '<span class="mgp-session-dot" data-status="'+status+'" role="img" title="'+text+'" aria-label="Session: '+text+'"></span>';
}
function match(source,category,name){
 return source.valid&&norm(source.category)===norm(category)&&norm(source.name)===norm(name);
}
function decorateTiming(html,source){
 // The timing header names a live or next session. The dot is not a generic
 // "API online" indicator and MUST NOT be put on a different session.
 return html.replace(/(<span class="nt-label">🏁 )(?:Nästa: |Schemalagd: )?([^<]*?)(<\/span>)/,(whole,prefix,title,end)=>{
  const clean=title.replace(/^Nästa:\s*|^Schemalagd:\s*/,'');
  const m=/^\s*(MotoGP|Moto2|Moto3|MotoE)\s*·\s*(.*?)\s*$/.exec(clean);
  if(!m||!match(source,m[1],m[2]))return whole;
  return prefix+dot(source.status)+title+end;
 });
}
function decorateSchedule(html,source){
 // Each race card already has its own API schedule status. Only supplement
 // exactly the current matching session with the dynamic status sensor.
 return html.replace(/(<div class="name">)(MotoGP|Moto2|Moto3|MotoE)\s*·\s*([^<]+)(<\/div>)/g,(whole,open,category,name,close)=>{
  if(!match(source,category,name))return whole;
  return open+dot(source.status)+category+' · '+name+close;
 });
}
function install(tag){
 const Card=customElements.get(tag);
 if(!Card||Card.prototype._mgpSessionDots)return;
 if(tag===TAG_TIMING){
  const old=Card.prototype._timing;
  Card.prototype._timing=function(...args){
   const html=old.apply(this,args);
   return typeof html==='string'?decorateTiming(html,parsed(this)):html;
  };
 } else {
  const old=Card.prototype._schedule;
  Card.prototype._schedule=function(...args){
   const html=old.apply(this,args);
   return typeof html==='string'?decorateSchedule(html,parsed(this)):html;
  };
 }
 const render=Card.prototype._render;
 Card.prototype._render=function(...args){
  if(this.shadowRoot&&!this.shadowRoot.querySelector?.('[data-mgp-session-dot-style]')){
   const style=document.createElement('style');
   style.setAttribute('data-mgp-session-dot-style','');
   style.textContent=STYLES;
   this.shadowRoot.appendChild(style);
  }
  return render.apply(this,args);
 };
 Card.prototype._mgpSessionDots=BUILD;
}
Promise.all([customElements.whenDefined(TAG_OVERVIEW),customElements.whenDefined(TAG_TIMING)]).then(()=>{
 install(TAG_OVERVIEW);
 install(TAG_TIMING);
});
})();
;
/* HA-MGP: clock/start icon, timer/countdown icon and T-minus-five urgency. */
(() => {
'use strict';
const TAG='ha-motogp-next-timing-card';
const BUILD='timing-icons-20261108-01';
const STYLE=`
.mgp-timer-line{display:inline-flex;align-items:center;gap:4px}
.mgp-start-time{display:inline-flex;align-items:center;gap:5px}
.mgp-timer-line.mgp-urgent,.mgp-timer-line.mgp-urgent .next-countdown{color:#e10600!important;font-weight:900}
`;
function updateUrgency(root){
 if(!root||typeof root.querySelectorAll!=='function')return;
 for(const line of root.querySelectorAll('.mgp-timer-line')){
  const clock=line.querySelector?.('[data-next-start]');
  const stamp=Number(clock?.getAttribute?.('data-next-start'));
  if(!Number.isFinite(stamp)||stamp<=0)continue;
  const remaining=stamp-Date.now();
  line.classList?.toggle('mgp-urgent',remaining>0&&remaining<300000);
 }
}
function decorate(html){
 if(typeof html!=='string'||!html.includes('next-countdown'))return html;
 return html.replace(/(<span class="nt-clock">)<span>(\d{1,2}:\d{2})<\/span><small>(<span class="next-countdown"[^>]*>[\s\S]*?<\/span>)<\/small>/,
  (_all,start,time,count)=>start+'<span class="mgp-start-time">🕒 '+time+'</span>'+
   '<small class="mgp-timer-line">⏱ '+count+'</small>');
}
function install(){
 const Card=customElements.get(TAG);
 if(!Card||Card.prototype._mgpTimingIcons)return;
 const oldTiming=Card.prototype._timing;
 Card.prototype._timing=function(...args){return decorate(oldTiming.apply(this,args));};
 const oldRender=Card.prototype._render;
 Card.prototype._render=function(...args){
  if(this.shadowRoot&&!this.shadowRoot.querySelector?.('[data-mgp-timing-icon-style]')){
   const style=document.createElement('style');
   style.setAttribute('data-mgp-timing-icon-style','');
   style.textContent=STYLE;
   this.shadowRoot.appendChild(style);
  }
  const result=oldRender.apply(this,args);
  updateUrgency(this.shadowRoot);
  return result;
 };
 const oldConnected=Card.prototype.connectedCallback;
 const oldDisconnected=Card.prototype.disconnectedCallback;
 Card.prototype.connectedCallback=function(...args){
  const result=oldConnected?.apply(this,args);
  if(!this._mgpUrgencyTimer)this._mgpUrgencyTimer=setInterval(()=>updateUrgency(this.shadowRoot),1000);
  updateUrgency(this.shadowRoot);
  return result;
 };
 Card.prototype.disconnectedCallback=function(...args){
  if(this._mgpUrgencyTimer){clearInterval(this._mgpUrgencyTimer);this._mgpUrgencyTimer=null;}
  return oldDisconnected?.apply(this,args);
 };
 Card.prototype._mgpTimingIcons=BUILD;
}
customElements.whenDefined(TAG).then(install);
})();
;
/* HA-MGP: the event toolbar prioritizes a verified active session. */
(() => {
'use strict';
const TAG='ha-motogp-next-overview-card';
const BUILD='active-chip-20261108-02';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const WORDS={sv:'PÅGÅR',en:'LIVE NOW',es:'EN CURSO',it:'IN CORSO',fr:'EN COURS'};
function replaceChip(html,replacement){
 const start=html.indexOf('<span class="mgp-next-chip"');
 if(start<0)return html;
 const tags=/<\/?span\b[^>]*>/g;tags.lastIndex=start;
 let depth=0,match;
 while((match=tags.exec(html))){
  if(match[0].startsWith('</'))depth--;else depth++;
  if(depth===0)return html.slice(0,start)+replacement+html.slice(tags.lastIndex);
 }
 return html;
}
const canonical=v=>String(v||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const category=v=>{const m=/moto\s*(gp|2|3|e)/i.exec(String(v||''));return m?({gp:'MotoGP','2':'Moto2','3':'Moto3',e:'MotoE'})[m[1].toLowerCase()]:String(v||'')};
const session=v=>({RAC:'Race',SPR:'Sprint',WUP:'Warm Up',PR:'Practice'})[String(v||'').toUpperCase()]||String(v||'');
function pendingCurrent(card){
 const states=card._hass?.states||{},ids=card._ids||{};
 const st=states[ids.status||'sensor.motogp_session_status'],se=states[ids.session||'sensor.motogp_current_session'];
 const status=String(st?.attributes?.session_status_id||'').toUpperCase();
 if(!['S','I'].includes(status) && String(st?.state||'').toLowerCase()!=='in progress')return null;
 const attrs=st?.attributes||{},sa=se?.attributes||{},race=states[ids.race||'sensor.motogp_next_race'];
 const cat=category(attrs.category),name=session(attrs.session_name||attrs.session_shortname||se?.state);
 if(!['MotoGP','Moto2','Moto3','MotoE'].includes(cat)||!name||!sa.category)return null;
 if(category(sa.category)!==cat||canonical(session(se?.state))!==canonical(name))return null;
 const event=canonical(attrs.event),sessionEvent=canonical(sa.event),raceEvent=canonical(race?.state);
 if(!event||!sessionEvent||!raceEvent||event!==sessionEvent||raceEvent.length<8||
   !(event.includes(raceEvent)||raceEvent.includes(event)))return null;
 return {category:cat,name};
}
function install(){
 const Card=customElements.get(TAG);
 if(!Card||Card.prototype._mgpActiveChip)return;
 const oldRender=Card.prototype._render;
 Card.prototype._render=function(...args){
  const result=oldRender.apply(this,args);
  if(this._spoiler?.()||!this.shadowRoot)return result;
  const current=this._live||pendingCurrent(this);
  if(!current)return result;
  const view=this.shadowRoot.getElementById?.('app');
  if(!view||!view.innerHTML.includes('mgp-next-chip'))return result;
  const {category,name}=current;
  if(!category||!name)return result;
  const locale=String(this._hass?.language||'en').split(/[-_]/)[0].toLowerCase();
  const matched=Boolean(this._live);
  const label=matched?(WORDS[locale]||WORDS.en):'AKTUELLT PASS · INVÄNTAR MATCHAD TIMING';
  const chip='<span class="mgp-next-chip mgp-active-chip" title="'+esc(label)+'">'+
    '<span aria-hidden="true" style="color:'+(matched?'#16a34a':'#eab308')+'">●</span> '+
    esc(label)+' · '+esc(category)+' · '+esc(name)+'</span>';
  view.innerHTML=replaceChip(view.innerHTML,chip);
  return result;
 };
 Card.prototype._mgpActiveChip=BUILD;
}
customElements.whenDefined(TAG).then(install);
})();
;
/* HA-MGP: bounded post-finish result settling, never imply a finished session is live. */
(() => {
'use strict';
const TAG='ha-motogp-next-timing-card';
const BUILD='finish-settling-20261108-01';
const HOLD_MS=240000;
const session=v=>({WUP:'WARMUP',RAC:'RACE',SPR:'SPRINT',PR:'PRACTICE'})[String(v||'').toUpperCase()]||v;
const same=(a,b)=>String(a||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]/g,'')===String(b||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const category=v=>{const m=/moto\s*(gp|2|3|e)/i.exec(String(v||''));return m?({gp:'MotoGP','2':'Moto2','3':'Moto3',e:'MotoE'})[m[1].toLowerCase()]:String(v||'');};
function validFinishingFeed(card,hold){
 const states=card._hass?.states||{};
 const se=states[card._ids.session],st=states[card._ids.status],riders=states[card._ids.riders];
 const sa=se?.attributes||{},ta=st?.attributes||{},pa=riders?.attributes||{};
 const status=String(st?.state||'').toLowerCase(),code=String(ta.session_status_id||'').toUpperCase();
 if(!((status==='finished'||code==='F'||code==='C')&&same(category(sa.category),hold.category)&&
      same(category(ta.category),hold.category)&&same(category(pa.category),hold.category)&&
      same(se?.state,hold.name)&&same(session(ta.session_shortname),hold.name)&&same(session(pa.session_shortname),hold.name)))return false;
 const event=String(sa.event||''),statusEvent=String(ta.event||''),riderEvent=String(pa.event||'');
 if(!event||!same(event,statusEvent)||!same(event,riderEvent))return false;
 if(pa.tv_delay_ready===false)return false;
 return Array.isArray(pa.riders)&&pa.riders.length>0;
}
function resultRows(card){
 const items=card._hass?.states?.[card._ids.riders]?.attributes?.riders;
 return items.filter(r=>r&&typeof r==='object').map(r=>({...r})).sort((a,b)=>{
  const p=v=>Number(v)>0?Number(v):999;return p(a.position)-p(b.position);
 });
}
function install(){
 const Card=customElements.get(TAG);
 if(!Card||Card.prototype._mgpFinishSettling)return;
 const oldTrack=Card.prototype._track;
 Card.prototype._track=function(now,race){
  const previous=this._live,oldSnapshot=this._snapshot;
  oldTrack.call(this,now,race);
  if(this._spoiler?.()||this._live||!this._snapshot||!this._hass){
   this._mgpFinishHold=null;return;
  }
  const st=this._hass.states?.[this._ids.status];
  const isFinished=String(st?.state||'').toLowerCase()==='finished'||
    ['F','C'].includes(String(st?.attributes?.session_status_id||'').toUpperCase());
  if(!isFinished){this._mgpFinishHold=null;return;}
  if(previous&&oldSnapshot&&same(previous.key,oldSnapshot.key)&&same(this._snapshot.key,previous.key)){
   this._mgpFinishHold={key:previous.key,category:previous.category,name:previous.name,started:Date.now()};
  }
  const hold=this._mgpFinishHold;
  if(!hold||hold.key!==this._snapshot.key||Date.now()-hold.started>=HOLD_MS){
   this._mgpFinishHold=null;return;
  }
  if(validFinishingFeed(this,hold)){
   const rows=resultRows(this);
   // Only the same TV-delayed session can replace the last in-progress snapshot.
   // This admits late final-lap/PB updates but never merges classes or sessions.
   this._snapshot={...this._snapshot,riders:rows};
  }
 };
 const oldTiming=Card.prototype._timing;
 Card.prototype._timing=function(...args){
  let html=oldTiming.apply(this,args);
  const hold=this._mgpFinishHold;
  if(!hold||this._spoiler?.()||this._live||Date.now()-hold.started>=HOLD_MS||typeof html!=='string')return html;
  const name=esc(hold.category)+' · '+esc(hold.name);
  // Only modify the temporary frozen-results header. Other render fields,
  // history modal, scroll behavior and next session schedule stay unchanged.
  html=html.replace(/(<span class="nt-label">)🏁 [^<]*(<\/span>)/,
    '$1🏁 Avflaggat: '+name+'$2');
  html=html.replace(/(<span class="nt-status(?: finished)?">)[^<]*(<\/span>)/,
    '$1AVSLUTAT · INVÄNTAR SLUTVARV$2');
  html=html.replace(/<span class="nt-clock">[\s\S]*?<\/span>(?=<span class="nt-toggle">)/,
    '<span class="nt-clock"><small>Resultat uppdateras</small></span>');
  return html;
 };
 Card.prototype._mgpFinishSettling=BUILD;
}
customElements.whenDefined(TAG).then(install);
})();
;
/* HA-MGP dev.37: read-only transition from previous result to verified entrants/grid. */
(()=>{
'use strict';
const TAG='ha-motogp-next-timing-card',BUILD='pre-session-grid-20261108-02';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const valid=v=>v!==null&&v!==undefined&&String(v).trim()!=='';
const label=v=>({RAC:'Race',SPR:'Sprint',WUP:'Warm Up',PR:'Practice'})[String(v||'').toUpperCase()]||String(v||'');
const GRID_STYLE='<style>'+
 '.mgp-pre-grid-scroll{overflow-x:auto;padding:10px 10px 28px}'+
 '.mgp-pre-start{font-size:11px;font-weight:800;text-align:center;margin:2px 0 12px;letter-spacing:.09em}'+
 '.mgp-pre-wave{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;min-width:480px;'+
 'padding:0 0 22px;margin-bottom:12px;border-bottom:1px dashed var(--divider-color,#8886)}'+
 '.mgp-pre-slot{display:flex;align-items:center;gap:8px;min-width:0;min-height:50px;padding:7px;'+
 'border:1px solid var(--divider-color,#8886);border-radius:9px;'+
 'background:var(--ha-card-background,var(--card-background-color,#fff))}'+
 '.mgp-pre-slot-2{transform:translateY(12px)}.mgp-pre-slot-3{transform:translateY(24px)}'+
 '.mgp-pre-position{font-size:11px;font-weight:900;flex:none;font-variant-numeric:tabular-nums}'+
 '.mgp-pre-number{flex:none;display:grid;place-items:center;min-width:32px;height:30px;'+
 'padding:0 4px;border-radius:6px;font-weight:900;color:#fff;background:#555}'+
 '.mgp-pre-name{min-width:0;display:flex;flex-direction:column;gap:2px}'+
 '.mgp-pre-name b{font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
 '.mgp-pre-name small{font-size:10px;color:var(--secondary-text-color);'+
 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
 '@container (max-width:530px){.mgp-pre-grid-scroll{padding:8px 5px 25px}}'+
 '</style>';
const safeColor=v=>/^#(?:[0-9a-f]{6})$/i.test(String(v||''))?String(v):'#555';
function gridMarkup(rows){
 let html=GRID_STYLE+'<div class="mgp-pre-grid-scroll"><div class="mgp-pre-start">START / POLE POSITION</div>';
 for(let i=0;i<rows.length;i+=3){
  html+='<div class="mgp-pre-wave">';
  for(const r of rows.slice(i,i+3)){
   const slot=(r.position-1)%3+1;
   html+='<div class="mgp-pre-slot mgp-pre-slot-'+slot+'">'+
    '<span class="mgp-pre-position">P'+esc(r.position)+'</span>'+
    '<span class="mgp-pre-number" style="background:'+safeColor(r.color)+'">#'+esc(r.number)+'</span>'+
    '<span class="mgp-pre-name"><b>'+esc(r.rider)+'</b><small>'+esc(r.team)+'</small></span></div>';
  }
  html+='</div>';
 }
 return html+'</div>';
}
function upcoming(card){
 const race=card._hass?.states?.[card._ids.race],a=race?.attributes||{};
 const all=Array.isArray(a.sessions_all)?a.sessions_all:[];
 const now=Date.now();
 const available=all.map(s=>({s,at:Date.parse(s?.date_utc||s?.date||'')}))
  .filter(x=>Number.isFinite(x.at)&&!['FINISHED','CANCELLED','CANCELED'].includes(String(x.s?.status||'').toUpperCase()));
 const future=available.filter(x=>x.at>now).sort((x,y)=>x.at-y.at);
 // A scheduled start does not establish live timing: retain the entry roster
 // briefly until a matching and TV-delay-approved live snapshot arrives.
 const pending=available.filter(x=>x.at<=now&&now-x.at<=15*60000)
  .sort((x,y)=>y.at-x.at);
 return {next:pending[0]||future[0]||null,attrs:a};
}
function rowsFor(session,attrs){
 const category=String(session.category||'');
 const entrants=attrs.entry_lists?.[category];
 const grid=attrs.start_grids?.[category];
 const roster=Array.isArray(entrants)?entrants.filter(x=>x&&valid(x.number)&&valid(x.rider)):[];
 const race=/^(race|sprint)$/i.test(label(session.name||session.type));
 // Never call a partial list an official start grid. A race grid must have
 // consecutive slots and cover the known entrants, with a safe class floor.
 const floor=category==='MotoGP'?13:['Moto2','Moto3'].includes(category)?19:Infinity;
 const complete=Array.isArray(grid)&&grid.length>=floor&&
  (!roster.length||grid.length===roster.length);
 if(race&&complete){
  const seen=new Set(),positions=new Set(),out=[];
  for(const g of grid){
   const position=Number(g?.position),number=String(g?.number??'').trim();
   if(!Number.isInteger(position)||position<1||!number||seen.has(number)||positions.has(position))return roster.map(r=>({position:null,number:r.number,rider:r.rider,team:r.team||'',nation:r.nation||''}));
   seen.add(number);positions.add(position);
   const entrant=roster.find(r=>String(r.number)===number);
   const rider=String(g.rider||entrant?.rider||'').trim();
   if(!rider)return roster.map(r=>({position:null,number:r.number,rider:r.rider,team:r.team||'',nation:r.nation||''}));
   out.push({position,number,rider,team:g.team||entrant?.team||'',nation:entrant?.nation||'',color:g.color||entrant?.color||''});
  }
  if(out.length&&new Set(out.map(x=>x.position)).size===out.length&&
     Math.min(...out.map(x=>x.position))===1&&
     Math.max(...out.map(x=>x.position))===out.length)
   return out.sort((x,y)=>x.position-y.position);
 }
 return roster.map(r=>({position:null,number:r.number,rider:r.rider,team:r.team||'',nation:r.nation||''}));
}
function before(card,next,attrs){
 const s=next?.s;
 if(!s||card._live||card._spoiler?.()||next.at-Date.now()>30*60000)return null;
 const rows=rowsFor(s,attrs);
 return {session:s,rows,grid:/^(race|sprint)$/i.test(label(s.name||s.type))&&
  rows.length>0&&rows[0].position!==null};
}
function countdown(at){
 const s=Math.max(0,Math.ceil((at-Date.now())/1000));
 return at<=Date.now()?'Starttid passerad · inväntar data':
  Math.floor(s/60)+':'+String(s%60).padStart(2,'0')+' till start';
}
function install(){
 const Card=customElements.get(TAG);
 if(!Card||Card.prototype._mgpPreSessionRoster)return;
 const oldTiming=Card.prototype._timing,oldClick=Card.prototype._click;
 Card.prototype._timing=function(...args){
  const original=oldTiming.apply(this,args);
  if(this._spoiler?.()||this._live)return original;
  const {next,attrs}=upcoming(this);
  const roster=before(this,next,attrs);
  if(roster){
   const expanded=this._timingManual===null?true:this._timingManual;
   const s=roster.session,type=label(s.name||s.type);
   const title=esc(s.category||'')+' · '+esc(type);
   let html='<section class="nt-card"><button type="button" class="nt-head" data-timing aria-expanded="'+expanded+'">'+
    '<span><span class="nt-label">🏁 '+title+'</span><span class="nt-status finished">STARTLISTA · INVÄNTAR LIVE</span></span>'+
    '<span class="nt-clock"><small>'+esc(countdown(next.at))+'</small></span>'+
    '<span class="nt-toggle">'+(expanded?'⌃ Dölj':'⌄ Visa')+' förare</span></button>';
   if(!expanded)return html+'</section>';
   if(!roster.rows.length)return html+'<div class="nt-empty">Officiell deltagarlista/startgrid saknas ännu. Inga tider eller placeringar antas.</div></section>';
   html+='<div class="nt-results">'+(roster.grid?'Publicerad startgrid':'Anmälda förare · sorterade efter startnummer')+
    ' · tider visas först när matchande live-data finns</div>';
   if(roster.grid)return html+gridMarkup(roster.rows)+'</section>';
   html+='<div class="nt-scroll"><div class="nt-table"><div class="nt-row nt-heading"><span>'+(roster.grid?'GRID':'NR')+'</span>'+
    '<span>FÖRARE / TEAM</span><span>VARV</span><span>SENASTE</span><span>Δ FRAMFÖR</span><span>Δ LEDARE</span><span>STATUS</span></div>';
   for(const r of roster.rows){
    const position=roster.grid?r.position:r.number;
    html+='<div class="nt-row"><span>'+esc(position)+'</span>'+
     '<span class="nt-person"><span class="nt-color"></span><span class="nt-person-text"><b>'+esc(r.rider)+' · #'+esc(r.number)+'</b>'+
     '<small>'+esc(r.team)+'</small></span></span>'+
     '<span>—</span><span>—</span><span>—</span><span>—</span><span>INVÄNTAR</span></div>';
   }
   return html+'</div></div></section>';
  }
  const hold=this._mgpFinishHold;
  if(hold&&Date.now()-hold.started<120000)return original;
  const snap=this._snapshot;
  if(!snap?.riders?.length||snap.day!==this._today)return original;
  // The previous verified session stays the primary subject between passes.
  let html=original.replace(/(<span class="nt-label">)🏁 [^<]*(<\/span>)/,
   '$1🏁 Senaste: '+esc(snap.category)+' · '+esc(snap.name)+'$2');
  html=html.replace(/(<span class="nt-status(?: finished)?">)[^<]*(<\/span>)/,
   '$1SENASTE RESULTAT · EJ LIVE$2');
  if(next)html=html.replace(/<span class="nt-clock">[\s\S]*?<\/span>(?=<span class="nt-toggle">)/,
   '<span class="nt-clock"><small>Nästa: '+esc(next.s.category)+' '+esc(label(next.s.name||next.s.type))+
   ' · '+esc(countdown(next.at))+'</small></span>');
  return html;
 };
 Card.prototype._click=function(e){
  const button=e.target?.closest?.('button[data-timing]');
  if(button&&this.shadowRoot?.contains(button)&&!this._spoiler?.()){
   const {next,attrs}=upcoming(this);
   if(before(this,next,attrs)){
    this._timingManual=this._timingManual===null?false:!this._timingManual;
    this._render();
    return;
   }
  }
  return oldClick.call(this,e);
 };
 Card.prototype._mgpPreSessionRoster=BUILD;
}
customElements.whenDefined(TAG).then(install);
})();