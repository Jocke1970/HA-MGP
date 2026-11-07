/* MotoGP Next SINGLE Lovelace resource | build next-one-20261107-15 | read only. */
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
      this.shadowRoot.getElementById('app').innerHTML=`<div class="root"><section class="panel header"><div class="eyebrow">🏁 MOTOGP NEXT · 0.3.0-dev.21</div><h2>${esc(event)}</h2><div class="sub">${meta.map(esc).join(' · ')||'Väntar på evenemangsdata'}</div></section>`+
        this._schedule(race,now)+`<div class="root">${this._weather()}${this._timing()}</div>`+
        `<div class="foot">ha-motogp-next.js · 0.3.0-dev.21 · UI-preview</div></div>`;
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
  const BUILD='ui-preview-20261107-06';
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
      const note='<p class="np-note" style="padding:11px 13px 13px">Senast publicerad VM-ställning · uppdateras separat från livetiming.</p>';
      const shown=rows.slice(0,10);
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
          `<span class="np-standing-driver"><strong>${esc(r.rider||'—')}</strong><small>${esc(r.team||'Team saknas')}</small></span></div></td>`+
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
const BUILD='header-track-weather-20261107-06';
const BRAND_SRC='data:image/webp;base64,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';
const TRACKS={"lusail":{"names":["lusail","losail"],"d":"M111.3,49.6 L111.3,39.4 L112,37.1 L113.3,34.9 L134.8,11.3 L136,10.6 L138,10 L140.1,10.2 L141.8,11.1 L148.3,17 L149.3,19.5 L149.2,22.1 L148,24.4 L134.2,39.6 L133.7,41.5 L134.5,43.3 L136.4,44.2 L137.9,44 L164,33.8 L166.1,33.9 L168.5,35.2 L170.1,37.5 L170.4,40 L169.3,42.9 L164.6,47.4 L161.9,51.2 L159.8,56.1 L158.5,61.8 L157.2,64 L155.7,65.2 L154,65.9 L141.3,68.9 L140.1,69.4 L138.8,70.6 L138,72.3 L138,73.5 L138.4,75.2 L141.8,79.1 L146.3,82.6 L150.3,84.7 L155.6,86.6 L160.6,87.3 L165.1,87.4 L186.3,84.9 L189.5,85.5 L191.7,86.7 L194.1,89.5 L198.8,98.2 L199.4,100.5 L199.2,101.9 L198.5,103.8 L190.9,115.7 L188.8,117.4 L186.2,117.9 L162.2,113.1 L160.3,113.2 L158.4,113.9 L156.2,116.2 L139.9,147.7 L138.1,149.3 L136,150 L133.8,149.8 L131.8,148.8 L130.3,147.2 L91.9,77.3 L89.1,72.9 L81.5,58.4 L80.7,56.2 L81,53.2 L82.5,51 L84.8,49.6 L87.3,49.5 L89.4,50.1 L102.7,58.5 L104.8,59.1 L107.1,59 L109,58 L110.5,56.3 L111.2,54 L111.3,49.6 Z"},"mandalika":{"names":["mandalika"],"d":"M123.5,126.4 L186.3,127.8 L189.4,127.6 L191.4,127.1 L193.3,126.1 L194.9,124.6 L195.9,123 L196.7,121 L197,116.7 L193.7,102.9 L192.6,99.5 L190.9,97.2 L188.9,95.8 L186.8,95.2 L182.4,95 L179.7,93.9 L177.7,91.7 L176.7,88.9 L176.9,85.9 L178,82.6 L179.7,80 L184.3,74.6 L185.7,71.9 L186.7,68.7 L187.2,65.2 L187.2,61.3 L186.4,55.6 L185.4,51.2 L182.6,45.1 L178.2,39.4 L171.4,33.5 L168.4,31.6 L165.4,30 L162.1,28.9 L158.4,28.2 L147.9,28.1 L142.3,27.2 L137.8,25.7 L124.6,19.6 L114.3,16 L106.3,13.7 L91.8,10.3 L89.3,10 L87.2,10.3 L85.2,11.4 L83.8,13 L83.1,15.1 L83,17.6 L84.1,22.5 L88.5,35.8 L89.8,38.6 L92.4,41.8 L95.9,44 L99.8,45.2 L106.2,45.5 L109.8,46.3 L113.5,48.1 L116.9,51 L119.3,54.4 L120.9,58.5 L124.4,76.7 L124.4,79.4 L123.9,82.1 L123,84.5 L121.6,86.6 L117.9,90.1 L112.3,93.4 L109.8,95.2 L107,98 L104.5,101.5 L100.1,109.7 L96.2,120.6 L95.2,124.4 L94.7,127.9 L94.7,131.5 L95.2,135 L96.3,139 L97.9,143.1 L99.7,146.3 L101.7,148.8 L103.5,149.9 L105.3,149.9 L106.8,148.8 L107.7,146.7 L107.8,145 L107.3,142.7 L104.1,135.6 L103.5,133.6 L103.7,131.2 L105.2,129 L107.6,127.2 L110.7,126.3 L123.3,126.4 Z"},"goiania":{"names":["goiania","goiânia"],"d":"M155.1,40.4 L40.8,41.1 L30.7,42 L25.6,43.6 L21.5,45.7 L17.4,49 L14.3,52.7 L11.8,57 L10.4,61.4 L10,66.1 L10.6,71.1 L12,75.5 L14.3,80 L21.6,88.7 L28,93.5 L47.5,105 L61.9,112.9 L72.7,117.2 L82.8,119.3 L95.4,119.6 L106.6,118.8 L115.3,117.5 L120.7,116 L125.5,113.5 L129.6,109.7 L132,105 L132.4,100.2 L130.6,95.7 L127.9,92.8 L124.6,90.7 L120.8,89.5 L116.5,89.1 L109.3,90.4 L97.6,95.8 L91.5,97.5 L83.5,97.8 L75.8,96 L58.4,87.5 L50.3,82.7 L46,79.1 L43.5,75.7 L42.5,72 L43.3,68.6 L45.6,65.5 L51,62.4 L57.2,61.5 L63.5,62.2 L76,65.7 L84.3,66.8 L93.8,66.5 L111.8,63.8 L120.6,63.2 L135.3,63.8 L146.5,65.9 L154.4,69.2 L156.8,71.4 L158.6,74.1 L159.2,78.9 L156.5,88.6 L157,91.7 L158.7,94.5 L162.2,97.4 L166.6,99.7 L171.7,101.1 L177,101.4 L186.3,100.4 L198,97.2 L257.1,74.8 L261.9,72.5 L265.6,69.8 L268.3,66.5 L269.8,62.8 L269.9,59.6 L269,56.5 L266.7,52.6 L263.7,49.1 L256.7,44.6 L246.5,41.4 L234.9,40.4 L155.5,40.4 Z"},"brno":{"names":["brno"],"d":"M85,10.9 L30.7,10.3 L21.7,10.9 L16.8,13.2 L13.1,17.4 L11.1,23 L11.3,28.5 L12.6,31.8 L14.5,34.7 L17.2,37.3 L20.2,39.1 L24.6,40.5 L40.2,43 L55.1,47.8 L71.6,55.1 L104.4,70.9 L108.6,73.5 L110.6,75.8 L111.9,78.5 L112.5,81.4 L112.3,84.4 L110,88.7 L102,95 L99.3,98.6 L98.3,104.1 L100.1,109.5 L104.8,114.3 L149,146.7 L153.5,149.2 L159.2,149.9 L161.7,149.1 L163.7,147.6 L166.7,142.5 L169.3,132.9 L168.5,128.7 L166,125.3 L163.1,123.5 L154.5,120.5 L152.3,118.8 L150.7,116.6 L149.7,113.4 L150.1,110 L151.8,106.8 L154.6,104.4 L160.1,102.5 L178.5,100.4 L181.5,100.3 L184.4,101 L187.4,103 L189.5,106 L190.1,109 L190.3,115.6 L192.3,119.9 L194.5,122 L196.9,123.2 L202.5,123.5 L208.8,120.7 L261.4,88.2 L266.2,84.5 L268.5,80.9 L269,76.6 L267.6,72.3 L264.5,69 L260.2,67 L253.4,66.8 L228.8,71 L225.2,70.8 L222.1,69.8 L219.8,67.9 L218.2,65.2 L217.1,56.9 L215.6,53.1 L212.7,50.1 L208.3,48.2 L202.1,47.2 L143.6,44.6 L136.8,43.4 L132.4,40.7 L129.2,36.6 L127.9,32.5 L127.7,25.1 L126.8,21.2 L124.2,16.6 L120.3,13.2 L115.7,11.1 L109.5,10.1 L85.3,10.9 Z"},"buriram":{"names":["buriram","chang international"],"d":"M36.3,87.8 L56.3,123.1 L60.7,129.9 L63.9,133.5 L67,135.8 L70.3,137 L73.8,137.2 L85.8,134.9 L154.4,112.2 L186.8,102.1 L203.7,98.1 L248.9,89.8 L259,87.4 L263.7,85.3 L267.1,82.5 L269.4,79.1 L270,75.4 L268.5,71.3 L265.1,68.4 L260.3,66.9 L254.5,67.2 L200.8,80.8 L114.6,101.1 L102.3,103.2 L93.5,102.9 L86.1,100.9 L78.9,96.9 L49.6,73.2 L46.6,69.2 L45.3,64.6 L45.8,60.2 L48.1,56.5 L53.9,52.6 L60,50.4 L66.4,50.3 L72.3,52 L77.6,55.1 L81.6,58.9 L84.6,63.1 L89,71.4 L92.4,75.6 L97.5,79 L103.4,80.7 L108.2,80.9 L114.7,80.1 L157.2,71.5 L163,69.7 L167.1,67.1 L170.3,63.5 L172.4,58.8 L173.8,50.2 L174.6,36.6 L173.3,30.7 L170.4,26.5 L167.6,24.4 L164.7,23.1 L161.5,22.8 L158.4,23.3 L154.9,25.5 L148.3,32.5 L143.4,36.3 L138.2,38.7 L132.4,39.6 L122.2,38.5 L104.2,32.5 L92.8,31.1 L26,31.9 L18.9,32.4 L14.2,33.5 L11.6,35.2 L10.2,37.5 L10.1,40.2 L11.1,43.9 L36.2,87.6 Z"},"valencia":{"names":["ricardo tormo","cheste"],"d":"M110,29.6 L224.6,29 L235,30 L243.1,33 L247.3,36 L251,40.2 L254,45.4 L256.1,51.4 L269.3,110.2 L270,116.9 L268.8,121.3 L266.5,123.8 L263.4,125.1 L259.6,125.2 L255.9,124 L252,121.3 L247.2,116.7 L238.4,106 L235,98.9 L233.7,91.3 L234,84.2 L236.3,70.5 L235.9,63.8 L234.5,60.2 L232.5,57.4 L229.4,55 L225.8,53.5 L219.9,52.4 L213.2,52 L207.3,52.5 L202.4,53.9 L198.2,56.2 L194.9,59.5 L192.7,63.2 L191.7,67.4 L192.3,72.8 L194.6,77.7 L212.2,98.7 L220.4,111.4 L221.8,115.5 L222,119 L221.1,122.3 L219.1,125.1 L216.7,127 L213.1,128.6 L202.6,130.6 L153,130.8 L140.3,129.7 L129.8,127.3 L116.5,122.2 L102.8,115.6 L96.7,111.3 L93.7,107.3 L92.7,102.4 L94.3,97.2 L96.4,94.4 L99.1,92.1 L105.9,89 L115.7,87.4 L125.7,88 L132.6,89.9 L138.7,92.8 L153.6,104.3 L160,108.2 L167.9,111.1 L174.9,111.9 L178.8,111.3 L182.4,109.8 L185.1,107.6 L187,104.7 L187.8,101.3 L187.4,98.3 L185.9,95.2 L183.5,92.6 L176.7,88.8 L130.1,67.8 L124.1,65.6 L119.1,64.6 L113.6,64.9 L108.3,66.4 L103.8,68.9 L91.6,77.1 L85.7,79.7 L79.2,81.6 L72,83 L65,83.3 L58,82.8 L51,81.4 L44,79 L37.3,75.6 L30.8,71.3 L24.7,66.3 L19.1,60.6 L14.7,54.9 L11.6,49.4 L10.2,44.5 L10.3,39 L12.1,34.8 L15.9,31.4 L21,29.7 L109.6,29.6 Z"},"misano":{"names":["misano","simoncelli"],"d":"M151,97.5 L134.5,61.8 L127.5,49 L124,45.3 L120.1,43.1 L116.3,42.4 L107.6,42.7 L104.8,41.9 L102.4,40.3 L100.9,38.5 L99.7,36.1 L98,27.4 L96.4,22.9 L93.7,18.6 L90.2,15.3 L86.5,13 L82.3,11.4 L77.4,10.3 L72.2,10 L46.1,12.5 L41.9,13.7 L39.4,15.6 L38.4,18.5 L39,21.6 L41.2,24.6 L44.4,26.7 L46.9,27.4 L49.2,27.4 L58.9,23.7 L62.1,23.3 L65.1,23.4 L68.3,24.3 L71.5,26 L79,32.2 L103.4,57.8 L121.6,79.3 L132,93.2 L142,107.8 L144.5,112.5 L145.3,116.6 L144.1,120.7 L141.1,123.6 L136.9,124.7 L131.1,124.1 L124.8,122.1 L117.2,118.5 L93.4,103.7 L85.3,99.5 L80.1,97.9 L74.7,97.1 L69.1,97.3 L65.1,98.3 L62.9,99.7 L61.6,101.6 L61.2,104.1 L61.8,106.5 L63.4,109 L65.9,111.5 L72.9,116 L150.3,146 L161.5,149 L171.5,150 L181.3,149.4 L195.2,147 L207.6,143.6 L217.2,139.9 L225.6,135.2 L234.2,128.7 L238.7,123.5 L241.1,117.9 L241.6,113.2 L241.2,108.3 L239.8,102.1 L237.6,95.6 L236,92.7 L234.2,90.9 L231.8,90 L229.5,90.2 L226.9,91.9 L225.1,95.2 L224.6,98.7 L225,109.4 L224.5,115.1 L222.5,120.4 L219.1,124.7 L213.6,128.4 L206.1,131.6 L182.8,139.2 L178.9,139.8 L175.7,139.5 L173.2,138.6 L170.8,136.9 L166.7,131.4 L163.4,125 L151.1,97.8 Z"},"motegi":{"names":["motegi"],"d":"M65.5,87.4 L50.8,113.5 L47.9,120.2 L47.6,124.1 L48.7,127.7 L51.1,130.5 L54.3,132 L57.5,132.2 L60.9,131.1 L64.4,128.8 L67.6,125.4 L98.1,79.4 L107,66.8 L110.7,62.2 L114.2,60.2 L118.1,60.1 L122,62.2 L125,66 L126.7,70.6 L126.8,75.2 L125.5,79.8 L122.7,84.4 L114.7,93.3 L92.9,115 L78.7,130 L73.3,136.1 L71.3,139.7 L71.1,142 L71.9,144.3 L73.5,146 L76.1,147.3 L80.4,148.2 L100,149.9 L106.1,149.7 L111.9,148.1 L117.1,145.4 L121.9,141.5 L125.2,137.7 L128.4,132.9 L138.7,112.8 L141.6,109.1 L144.6,106.5 L147.7,105.1 L151.4,104.7 L154.3,105 L160.8,106.7 L164.2,106.8 L167.9,105.6 L171.2,103 L173.9,98.3 L174.9,93.2 L174.6,87.5 L172.9,74.6 L172.9,67.2 L174.1,63.3 L176.4,61.3 L178.3,60.9 L180.7,61.2 L185.2,63.6 L208.4,85.5 L224,98.5 L226.9,99.6 L229.5,99.3 L231.5,97.8 L232.4,95.2 L232.2,93.3 L231.4,91.3 L227.7,87.1 L148.8,14.5 L144.6,11.1 L141.5,10 L138,10.8 L134.9,13.4 L132.6,17.5 L128.9,26.5 L126.7,30.7 L123.7,34.6 L119.7,37.9 L115,40.1 L110.4,41.2 L105.8,41.2 L100.1,39 L97.5,38.6 L94.4,39.3 L91.5,41.5 L88.6,45.4 L65.6,87.2 Z"},"aragon":{"names":["aragon","aragón"],"d":"M193.6,72.7 L173.5,88.3 L170.9,89.9 L168.5,90.6 L166.1,90.4 L163.7,89.3 L156,79.6 L152.3,77.1 L148.2,75.6 L144.3,75.2 L139.9,75.9 L129.9,78.8 L125.1,81 L120.2,84.8 L117.5,89.5 L116.4,93.8 L115,107.1 L113.5,112.7 L111.7,116.7 L109.2,120.2 L105.8,123.6 L102.4,126.1 L99.4,127.2 L95.9,126.8 L93.2,124.2 L92,121.1 L91,113.8 L89.9,110 L87.7,105.7 L84.2,101.3 L79.1,96.7 L73.9,93.1 L70.5,92 L67.1,92.5 L64.6,94.5 L63,97.9 L57,130 L57.3,133.2 L58.4,135.6 L59.9,137 L63.4,138.8 L64.6,140.2 L64.9,142.1 L64.2,144.2 L61.5,146.8 L57.5,148.7 L52.7,149.8 L48.1,149.9 L44.1,148.8 L40.6,146.9 L37.6,144 L35.6,140.5 L34.4,135.8 L34.6,129.8 L36.7,117.5 L39.3,108.4 L43,99.5 L48.5,89.2 L53.9,81.3 L57.3,78.1 L60.5,76.9 L63.7,77.1 L66.1,78.2 L71.8,82.1 L76.3,83.6 L80.3,83.8 L84.4,82.8 L89.7,79.9 L99.4,72.6 L101.6,70.5 L102.4,68.8 L102.6,67 L100.5,61.1 L100.4,58.3 L101.6,55.9 L104.3,54 L239.9,10.7 L243,10 L245,10.6 L245.7,12 L245.1,13.5 L239,17.3 L236.3,20.7 L235.2,24.7 L234.8,32.1 L234,36.1 L232.4,40.2 L229.6,44.2 L224.3,49.3 L193.8,72.5 Z"},"phillip":{"names":["phillip island"],"d":"M123.2,47.8 L183.3,72.3 L191,74.4 L198.7,75.1 L204.6,74.6 L210.2,73 L216.1,70.2 L221.3,66.6 L227.8,59.5 L234.9,46.9 L238.7,41.5 L243.3,36.9 L248.3,34.2 L252.5,33.1 L256.5,32.9 L260.2,33.6 L263.4,35 L266.1,37.2 L268.3,40.3 L269.6,43.8 L270,47.5 L269.4,52.4 L267.3,57.6 L264.1,62.4 L259.2,67.9 L233.3,90.2 L225.1,96.2 L218.8,99.6 L209.6,102.4 L199.2,103.1 L184.4,101.1 L161.9,95.8 L156.9,95.7 L153.6,97.4 L152.3,99.5 L152.1,102.1 L153,104.5 L154.9,106.7 L160.7,110.1 L180.7,119.1 L183.9,121.6 L186.1,124.6 L187.1,130.1 L185.2,134.6 L181,137.8 L174.1,139.4 L159.7,139.4 L150.6,138 L141,134.9 L121.6,126 L115.6,124.3 L109.8,123.6 L103.7,123.8 L97.1,125.2 L79.9,132.6 L71.6,134.9 L62.9,135.5 L55.5,133.7 L51.2,131.2 L47.5,127.7 L44.7,123.1 L43,117.9 L42.6,113 L43,107.6 L47,90.2 L46.9,87.6 L46,85.4 L44,83.8 L40.9,83.5 L37.9,84.2 L29.4,88.2 L25.4,88.4 L21.8,87.6 L18.1,85.5 L15.2,82.4 L12.7,77.9 L11.1,72.4 L10,64.1 L10.5,53.9 L12.2,44.9 L14.9,37.6 L18.6,31.9 L23.4,27.2 L29.4,23.5 L36.1,21.2 L41.3,20.5 L46.9,20.6 L59.6,22.7 L122.9,47.7 Z"},"sachsenring":{"names":["sachsenring"],"d":"M78.6,53.1 L159.3,107.4 L178.3,119.5 L195.6,129 L201.3,130.3 L205.7,129.9 L208.6,128.5 L210.8,126.3 L212.1,123.3 L212.2,119.7 L210.6,115.1 L203.7,105.2 L200.6,98.9 L199.2,92.8 L199.8,86.1 L201.9,80.2 L205.6,75.1 L209.7,71.5 L219.8,64.9 L224,60.3 L225.5,56.9 L226,53.7 L225.6,50.5 L224.2,47.6 L221.2,44.8 L217.1,43.4 L212.6,43.5 L208.6,45.4 L204.9,49.7 L200.7,62.3 L195.7,70.4 L192.4,73.6 L188.9,76 L180.7,78.9 L175.7,79.3 L170.8,78.7 L166.4,77.2 L162.6,74.9 L159.6,71.9 L157.3,68 L156,63.7 L155.5,59.1 L156.5,50.4 L159.6,41.3 L164.2,32.8 L170.4,26.1 L177.7,21.2 L186.6,17.8 L195.9,16.5 L204.8,17.1 L214.2,20 L223.3,25.3 L244.7,42.6 L259.5,57.2 L264.9,64.4 L268.5,72.3 L270,80.7 L269.4,88.9 L267.2,96.5 L262.8,105.5 L255.7,116.7 L249.1,124.7 L241.2,131.8 L233.2,137.3 L225.1,141.1 L216.9,143.2 L207.5,143.4 L197.4,141 L189,136.9 L175.6,127.4 L168.4,123.4 L158.5,119.8 L148,117.9 L134.5,117.7 L113.1,118.9 L72.4,126.1 L39.1,130.8 L34.1,130.6 L29.3,129.6 L24.7,127.7 L20.4,124.9 L15.5,119.8 L12.1,113.5 L10.3,106.6 L10.1,98.7 L11.3,89.9 L21,46.2 L22.8,40.2 L25.1,36.3 L29.1,32.8 L33.7,30.9 L39.4,30.4 L44.7,31.3 L54.3,36.2 L78.3,52.9 Z"},"assen":{"names":["assen"],"d":"M86.8,92.2 L51.5,121.8 L49,124.8 L48.4,127.1 L48.8,130.3 L49.8,133.3 L52,137.5 L55.3,141.9 L60.5,145.5 L66.8,148 L73,149.9 L76,149.8 L79.1,148.6 L81.3,146.6 L82.3,143.8 L82,140.1 L80.6,137.3 L78,135.4 L74.8,134.6 L71.6,135 L66.7,136.9 L64.4,136.7 L63,135.6 L62.4,133.9 L62.7,132.3 L63.8,130.9 L66.2,129.5 L69.9,128.2 L84.6,125.5 L100.4,120.3 L112.4,115.1 L145.6,99.2 L149.6,96.4 L153.8,87.8 L156,85.4 L158.7,83.7 L162.7,82.5 L168.2,82.2 L186,85 L188.7,84.4 L191.5,83 L193.8,80.2 L195.3,76.2 L196.6,65.8 L199.8,52.8 L202.9,36.3 L204,33.5 L206.3,31.2 L210.4,29.9 L214.6,29.5 L224.5,29.9 L228.6,28.8 L230.6,26.6 L231.5,23.6 L231.4,20.4 L230,17.1 L228,14.2 L225.1,11.8 L221.9,10.4 L218.4,10 L210.6,11.4 L193.7,18.3 L190.1,20.6 L186.1,24.4 L177.5,35.7 L169.2,48.3 L161.6,64 L156.1,71.6 L152.5,75 L146.7,77.8 L140.6,78.8 L133.6,78.1 L115.3,74.9 L112,74.9 L109.9,76.1 L106,80.3 L95.9,85.6 L87,92.1 Z"},"barcelona":{"names":["barcelona","catalunya","cataluña"],"d":"M182.2,57.5 L128.5,142.7 L126.7,144 L124.4,144.1 L123.1,143.8 L118,140.9 L114.2,140.7 L111.9,141.7 L103.1,148.2 L100.5,149.3 L97.4,150 L94.6,149.9 L91.6,149.2 L89.4,148.2 L86.5,145.7 L84.5,143 L82.7,138.2 L82.4,132.2 L83.6,126.1 L86.1,120.2 L101,96.4 L102.8,94.3 L103.9,93.7 L106.4,93.1 L109,93.6 L111,94.8 L112.8,96.7 L114.2,99.3 L114.7,104.1 L114.1,107.5 L112,111.8 L101,129.2 L100.7,131.3 L101,132.4 L102,134 L102.9,134.6 L105,135.1 L106.2,134.9 L122.5,127.5 L124.5,126.4 L129.9,122 L133,117.7 L137.9,110 L138.9,107.2 L138.3,104.7 L136.9,103.1 L133.5,101 L131.9,99.7 L130,97.2 L121.1,76 L120.6,73 L120.9,70.5 L122.2,67.3 L124.3,64.7 L126,63.5 L166.2,43 L178.3,36.7 L180.1,35.4 L180.9,33.8 L181,32.7 L180.1,30.6 L177.4,28.4 L174.1,27.3 L170.9,27.1 L168.1,27.6 L164.4,29.6 L160.3,32.9 L157.4,33.9 L155.1,33.9 L153.5,33.3 L151.4,31.7 L150.5,30.3 L149.9,28.9 L149.7,26.4 L150.2,24.2 L150.9,23 L165.6,10.6 L166.6,10.2 L168.3,10.1 L169.2,10.6 L179.9,18.7 L181.2,18.5 L184,15.6 L185.1,15.7 L194.2,21.6 L196.2,24 L197.1,25.9 L197.6,28.4 L197.7,30.7 L197,33.9 L182.2,57.5 Z"},"austin":{"names":["circuit of the americas","cota","austin"],"d":"M32.8,98.1 L40.2,103.4 L65.7,124.1 L92.2,144.5 L100.1,149.8 L102.6,149.7 L103.6,148.7 L103.6,147.3 L96.4,125.2 L96.6,120.5 L98.1,116.4 L99.9,113.6 L102.3,111.3 L123.4,98.2 L126.1,95.1 L129.3,87.7 L130.7,85.6 L132.9,83.9 L138.7,81.4 L140.8,79.7 L142.6,76.5 L144.5,67.4 L148,62.8 L153.8,59.1 L159.3,58.2 L174.9,64.8 L176.9,64.9 L183,60.9 L189.6,53.3 L193.4,51.7 L195.9,51.9 L198.4,52.9 L200.3,54.7 L202.1,57.6 L204.3,58.7 L229,53.3 L231,51.7 L255.7,21.9 L261.9,13.5 L262.2,11.1 L261,10 L257,10.6 L220.1,21.8 L183.7,30.2 L154,35.2 L107,40.8 L105.8,41.8 L105.9,43.3 L117.2,58.5 L120.6,64.2 L120.9,66.1 L120,67.7 L118.3,68.5 L109.4,67.7 L107.4,65.8 L104.5,59.2 L99.4,53.5 L96,52.3 L92.7,52.2 L91.1,52.8 L90.6,53.9 L90.8,55.2 L101.9,74.6 L103.2,77.8 L102.8,83.1 L100.5,89 L98.5,91.4 L89.9,95.6 L87,96.4 L81,95.8 L75.2,93.7 L71.4,90.8 L55.6,69.7 L53.8,68.4 L51.8,68.3 L46.7,69.9 L19.5,81.9 L18.2,83 L17.6,84.8 L18.4,86.8 L32.8,98.1 Z"},"redbullring":{"names":["red bull ring","spielberg"],"d":"M193.6,130.8 L123.4,149.9 L121.1,149.6 L115,139.8 L90.6,105.5 L84.7,94.9 L67.9,59.5 L65.4,55.2 L57,43.6 L30,16.1 L29.2,14.6 L29.5,13.2 L31.8,12 L46.1,10.3 L65.7,10.3 L74.9,11.3 L126.2,20.7 L133.8,21.5 L165.7,23 L169,23.8 L170.6,25.9 L170.9,28.2 L170.7,29.8 L168.8,33.4 L165,38.3 L161.9,41.5 L158,44.3 L152.8,47.1 L146.6,49.1 L137.8,50.2 L105.4,45.2 L102,45.3 L99,46.2 L96.3,47.7 L92.3,51.9 L90.3,56.9 L90.6,62.8 L91.7,65.6 L97.9,76.9 L105.4,89.4 L108.3,92.3 L110.3,93.6 L114.9,95 L119.3,94.7 L124.6,92.5 L127.4,89.9 L131.2,84.9 L134.9,81.4 L140.2,78 L148.9,74.7 L156.8,74 L231.6,72.5 L243.8,82.8 L250.6,106.6 L250.5,109.3 L244,114.4 L234.1,118.9 L217,124.5 L193.6,130.8 Z"},"sepang":{"names":["sepang"],"d":"M104.6,85.7 L60.4,89.3 L58.4,89.2 L56.6,88.3 L55.3,86.9 L54.6,85.1 L54.6,83.1 L55.3,81 L57,79.4 L59.3,78.6 L62,79.2 L67.1,81 L68.8,80.7 L70.2,79.3 L70.7,77.6 L70.2,75.3 L65.3,68.8 L63.8,66.2 L62.9,63.2 L62.4,56.7 L63.2,48.1 L64.6,44.1 L66.7,40 L68.8,37.4 L72.1,34.4 L75.5,32.2 L99.3,24.2 L114.5,18.3 L133.4,10 L135,10.1 L136.5,11 L139.8,28.5 L144,46.4 L145.7,50.2 L147.7,52.9 L151.1,55.6 L154.5,57.4 L157.8,58.3 L161.1,58.4 L164.9,57.8 L168.7,56.3 L171.4,54.4 L176.7,48.7 L179.3,47.1 L183.4,45.7 L186.9,45.6 L190.3,46.1 L193.1,47.2 L195.6,49.2 L225.3,83.1 L225.4,84.7 L219.7,97.9 L218.2,99 L216.4,99.4 L189.3,101 L163.8,104 L149.9,106.3 L148.6,107.4 L148.1,109.1 L149.3,111.1 L159.3,116.6 L161.4,118.8 L162.9,122.1 L163.7,125.5 L163.6,130.3 L162,138.3 L159.7,143.3 L156.1,148.5 L154.2,149.7 L152.3,150 L150.2,149.6 L148.5,148.5 L117.4,122.9 L115.3,122.1 L112.5,121.9 L109.4,122.7 L98.1,128.5 L95,129.5 L88.3,129.9 L82.4,128.8 L78.4,127.2 L75.8,125.1 L72.3,120.5 L71.1,117.1 L70.9,115 L72.4,112.7 L75.5,111.4 L198.8,88.7 L200.5,87.1 L201.8,84.1 L201.2,81.7 L198.9,79.3 L195.3,78.8 L104.6,85.7 Z"},"silverstone":{"names":["silverstone"],"d":"M99.4,111.3 L122.2,81.5 L123.9,79.9 L125.7,79.3 L128,79.1 L138.7,80.4 L142.8,79.7 L145.2,78.5 L157.6,68.7 L159,68.2 L160.2,68.5 L160.9,69.2 L163.7,77.6 L165.2,78.5 L166.1,78.3 L166.8,77.7 L168.4,74.1 L169.6,69.9 L170,65.2 L169.3,62.9 L130.6,27.6 L128.7,26.5 L127.1,26.2 L125,26.4 L123.2,27.2 L121.9,29.2 L121.1,35.9 L120.2,37.3 L118.2,38.5 L116.1,38.6 L114.3,37.6 L113.1,36 L112.7,34.1 L113.2,32 L119,20.8 L122.5,17.1 L125,15.3 L127.7,13.9 L130.6,13.1 L134.4,12.6 L162.8,10.1 L166,10.1 L168.8,11.4 L170.7,13.2 L171.8,15.5 L174.1,22.9 L175.3,28.7 L176.1,35.9 L176.9,51.1 L177.7,53.9 L180.2,58.3 L180.6,60.1 L180.2,62.5 L177.9,69 L177.5,73 L178.2,75.2 L181.5,79.8 L181.9,81.5 L181.9,83.3 L181,85.5 L180.1,86.5 L173,91.1 L170.9,93.4 L149.2,133.9 L144.9,140.9 L140.3,147.3 L138.2,149.1 L135.7,149.9 L132.8,149.7 L130,148.3 L128.4,146.3 L125.8,141 L122.5,136 L110.9,122.8 L110.3,122.4 L109.3,122.6 L106.7,124.9 L105.1,125.4 L103.8,125 L101.5,122.6 L99.4,119.3 L98.2,115.7 L98.1,113.2 L99.4,111.3 Z"},"portimao":{"names":["portimao","portimão","algarve"],"d":"M124.8,113 L98.9,22.7 L99.2,21.2 L100,20.3 L111.5,11.8 L108.7,19.2 L107.7,21 L105.8,21.7 L100.8,19.8 L111.5,11.8 L113.7,10.4 L115.4,10 L130.9,13.6 L132,14.1 L132.9,15.2 L133,16.7 L132.1,18 L124.4,22.7 L121.8,24.6 L120.2,27.5 L119.9,29.6 L120.2,31.8 L137.4,91.8 L142,90.7 L144.1,68 L143.2,63.1 L141.4,59 L141.5,57.3 L142,55.6 L142.7,54.6 L144.6,53.3 L146.4,53 L147.8,53.1 L148.9,53.6 L151.1,55.5 L152.5,65.5 L159.8,74.8 L174.3,82.1 L176.7,83.7 L178.5,85.7 L179.5,87.2 L181.1,92.2 L180.6,94.7 L178.7,96.1 L160.3,101.8 L156.5,104.9 L154.6,108.1 L153.5,113.3 L154,114.1 L161.1,120.2 L163.3,120.9 L164.5,120.8 L158.1,128.5 L155.8,129.7 L154,129.5 L152.1,127.6 L151.8,125.8 L153.5,113.3 L164.5,120.8 L169.5,114.8 L171.2,113.9 L174,114 L175.8,115 L178,117.6 L178.9,120 L179.1,122.1 L178.6,125.4 L177.2,128 L168.4,138.9 L163.4,144.6 L160.8,146.7 L157,148.7 L152.4,149.9 L146.4,149.7 L143.2,148.8 L140,147.3 L136,144.1 L133.2,140.4 L131.6,136.8 L124.8,113 Z"},"mugello":{"names":["mugello"],"d":"M139.5,77.8 L146.2,63.2 L157.7,43.1 L161.2,36 L170.1,13.6 L171.5,11.7 L173.5,10.4 L175.7,10 L178.1,10.7 L179.5,11.8 L180.4,13.1 L181.2,16.6 L180.9,19.9 L178.9,29.9 L179,32.3 L180.4,34.5 L186.4,38.2 L188,39.6 L189.2,42.2 L189.4,44.5 L188.3,47.9 L168.3,78.1 L168,79.6 L168.1,81.3 L170.9,87.2 L171.4,88.9 L171.3,91.4 L170.5,93.1 L150.5,117.5 L149.3,118.7 L146.3,119.7 L138.1,119.5 L134.9,119.8 L132.6,120.7 L130.1,122.4 L128.2,124.9 L126.8,128.1 L121.5,143.4 L120,145.7 L117.6,147.9 L113.4,149.8 L111,150 L108.3,149.7 L103,147.8 L94.3,143 L92.5,141.2 L91.4,139.3 L90.7,137.1 L90.5,134.4 L91,130.7 L96.3,103.5 L97.5,101.8 L99.1,100.6 L100.9,100.2 L108.6,99.9 L110.7,98.8 L112.3,97.1 L113.3,94.7 L122.5,62.9 L123.7,60.5 L125.2,58.8 L127.3,57.7 L129.3,57.4 L131.1,57.6 L133,58.7 L134.4,60.2 L135.3,62.2 L135.5,64 L135.2,66.4 L133.1,70.6 L125.8,80.2 L125.3,82.2 L125.3,89.1 L124.6,91.8 L101.1,123.5 L98.4,127.8 L97.5,130.9 L97.6,133.5 L99.1,136.5 L101.2,138.3 L102.6,138.9 L104.9,139.3 L106.6,139.1 L108.8,138.4 L112.2,135.9 L114.7,132.5 L139.5,77.8 Z"},"jerez":{"names":["jerez"],"d":"M140.7,97.5 L127.2,124.9 L122.7,134.6 L121.4,138.5 L121.2,142.4 L122.4,145.6 L125,148 L128.8,149.5 L133.7,150 L149,149.7 L152.3,148.6 L153.5,147.6 L154.3,146.3 L154.7,144 L153.8,141.6 L152.4,139.9 L148.1,136.2 L145.6,132.5 L144.3,128.5 L143.7,123.3 L143.9,116.3 L145.3,110.1 L147.8,104.9 L151.5,100.6 L153.9,98.8 L156.7,97.4 L165,95.1 L172.3,94.2 L183.6,94 L190.2,93.6 L195.6,92.9 L199.7,91.7 L203.6,89.5 L206.5,86.4 L208.2,82.5 L208.6,78.1 L207.9,74.1 L206.3,70.2 L203.9,66.7 L200.7,63.2 L144.6,14.7 L139.3,11 L137.5,10.2 L135.8,10 L133.8,10.6 L132.4,11.9 L131.6,13.9 L131.6,16.1 L133.4,20.8 L139.4,30.3 L141.8,35.4 L143.2,41.7 L143.3,44.8 L142.9,47.7 L141.3,52.7 L138.4,57.3 L128.4,69.5 L126,71.9 L123.3,74 L120.7,75.2 L118.1,76 L115.4,76.4 L112.7,76.3 L110.3,75.8 L108,74.9 L105.7,73.5 L103.7,71.7 L101.1,68.4 L99.2,64 L98.2,59.6 L96.8,50.3 L95.4,46 L92.4,41.3 L90.6,39.7 L88.7,38.5 L85.7,37.8 L82.9,37.9 L80,39 L76.2,41.3 L73.9,43.1 L72.5,45 L71.6,47.5 L71.4,50.2 L72.1,54.1 L73.6,58.3 L81.7,75.8 L83.8,79.2 L85.2,80.3 L86.8,80.9 L91.6,81.1 L93.9,81.8 L95.9,83.1 L99.5,86.7 L102,88.6 L105.5,90.1 L109.5,90.8 L113.1,90.7 L116.6,89.9 L120.1,88.4 L123.3,86.5 L128.2,81.7 L138.4,68.4 L144,61.8 L147.7,57.9 L149.8,56.3 L152,55.4 L154.1,55.3 L155.9,56 L157.2,57.5 L157.8,59.3 L157.7,61.5 L156.9,64 L151.4,76.1 L140.8,97.3 Z"},"hungaroring":{"names":["hungaroring"],"d":"M150.2,148.1 L79.3,92.2 L78.3,91 L77.9,89.4 L78.2,88 L79,87 L81.6,86.4 L89.1,86.7 L95.7,88.2 L99.9,90.1 L102.3,91.6 L123,107.8 L124.9,108.5 L126.4,108.4 L128,107.9 L129.7,106.7 L130.9,104.9 L131.2,101.5 L130.7,99.9 L125.1,90 L124.3,87.6 L124.4,85.8 L142,49.8 L144.7,45.6 L149.9,39.1 L150.1,36.3 L145.5,19.5 L145.1,16.5 L145.8,13.9 L147.2,11.9 L149.4,10.5 L152.1,10 L155.1,10.8 L158.6,12.9 L161.5,15.1 L164.4,17.8 L175.6,29.8 L175.9,30.7 L175.7,32.1 L174,34.3 L173.7,36 L177.9,51.6 L178.9,53.6 L180.1,54.7 L181.4,55.1 L191.2,56.5 L192.7,57.4 L194.4,59.2 L194.8,60.6 L194.9,62.4 L192.7,78.1 L192.9,81.6 L194.3,85.2 L201.3,95.9 L202.1,99.1 L201.5,102.5 L199.6,105.4 L173.3,134.9 L172.1,135.8 L170.5,136 L168.9,135.3 L160.8,126.4 L153.5,120.4 L152,119.9 L150.2,119.9 L148.9,120.3 L147.6,121.2 L146.7,122.8 L146.5,124.1 L146.7,125.9 L147.3,127.3 L161.1,138.3 L162,139.8 L162.6,142 L162.5,144.3 L161.6,146.5 L160,148.4 L158.6,149.3 L156.3,149.9 L154.5,149.9 L152.4,149.4 L150.2,148.1 Z"}};
const STYLE="\n  /* All three areas live in the SAME white event-header panel. */\n  .header{container-type:inline-size}\n  .mgp-hero-grid{display:grid;grid-template-columns:minmax(210px,1fr) minmax(0,1.75fr);\n    align-items:center;column-gap:22px;row-gap:10px}\n  .mgp-hero-copy{min-width:0;align-self:center}\n  .mgp-hero-copy h2{overflow-wrap:anywhere;display:flex;align-items:center;gap:9px;flex-wrap:wrap}\n  .mgp-country-flag{display:inline-flex;flex:none;font-size:23px;line-height:1;vertical-align:middle}\n  .mgp-hero-copy .np-top-actions{margin-top:14px}\n  .mgp-branded-eyebrow{display:flex;align-items:center;gap:8px}\n  .mgp-brand-logo{width:27px;height:27px;object-fit:contain;border-radius:5px;flex:none}\n  .mgp-ui-details{margin-top:11px;color:var(--secondary-text-color);font-size:10px;line-height:1.5}\n  .mgp-ui-details summary{cursor:pointer;display:inline-block;text-decoration:underline;text-underline-offset:2px}\n  .mgp-ui-details div{padding-top:4px;overflow-wrap:anywhere}\n    .mgp-venue-strip{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(148px,.85fr);\n    align-items:center;gap:16px;min-width:0;border-left:1px solid var(--divider-color,rgba(127,127,127,.22));\n    padding-left:19px}\n  .mgp-weather-panel,.mgp-circuit-panel{min-width:0;padding:0;margin:0;border:0;background:transparent}\n  .mgp-venue-caption{font-size:10px;font-weight:850;text-transform:uppercase;\n    letter-spacing:.08em;color:var(--secondary-text-color);margin-bottom:9px}\n  .mgp-weather-head{display:flex;align-items:flex-start;gap:7px;flex-direction:column}\n  .mgp-weather-source{font-size:9px;color:var(--secondary-text-color);line-height:1.35}\n  .mgp-weather-metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 14px;margin-top:10px}\n  .mgp-weather-cell{min-width:0;padding:0;background:transparent;border:0;text-align:left}\n  .mgp-weather-cell small{display:block;font-size:10px;color:var(--secondary-text-color);line-height:1.2}\n  .mgp-weather-cell strong{display:block;font-size:16px;margin-top:3px;line-height:1.25;\n    font-variant-numeric:tabular-nums;overflow-wrap:anywhere}\n  .mgp-weather-condition{font-size:11px;font-weight:700;margin-top:9px}\n  .mgp-weather-empty,.mgp-track-empty{font-size:11px;color:var(--secondary-text-color);\n    margin-top:11px;line-height:1.4}\n  .mgp-circuit-panel{justify-self:end;width:100%;max-width:230px}\n  .mgp-circuit-panel .mgp-venue-caption{text-align:right}\n  .mgp-track-svg{display:block;width:100%;height:100px}\n  .mgp-track-shadow{fill:none;stroke:var(--divider-color,rgba(127,127,127,.25));\n    stroke-width:11;stroke-linecap:round;stroke-linejoin:round}\n  .mgp-track-outline{fill:none;stroke:var(--primary-text-color,#20252b);\n    stroke-width:4.8;stroke-linecap:round;stroke-linejoin:round}\n  .mgp-track-note{font-size:9px;color:var(--secondary-text-color);margin-top:5px;text-align:right}\n  .mgp-track-empty{text-align:right}\n  @container (max-width:900px){\n    .mgp-hero-grid{grid-template-columns:minmax(175px,.8fr) minmax(0,1.5fr);column-gap:15px}\n    .mgp-venue-strip{gap:10px;padding-left:13px;grid-template-columns:minmax(0,1fr) minmax(104px,.75fr)}\n    .mgp-weather-cell strong{font-size:14px}\n    .mgp-track-svg{height:89px}\n  }\n  @container (max-width:680px){\n    .mgp-hero-grid{grid-template-columns:1fr;row-gap:15px}\n    .mgp-venue-strip{border-left:0;border-top:1px solid var(--divider-color,rgba(127,127,127,.2));\n      padding-left:0;padding-top:12px;grid-template-columns:minmax(0,1.25fr) minmax(115px,.75fr);gap:12px}\n    .mgp-weather-metrics{gap:9px}\n  }\n  @container (max-width:355px){\n    .mgp-venue-strip{grid-template-columns:minmax(0,1fr) minmax(92px,.55fr);gap:7px}\n    .mgp-weather-metrics{grid-template-columns:1fr 1fr;gap:7px}\n    .mgp-circuit-panel .mgp-venue-caption{font-size:9px}\n    .mgp-track-svg{height:79px}\n    .mgp-track-note{font-size:8px}\n    .mgp-weather-cell strong{font-size:13px}\n  }\n";
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
  const weather=card._hass?.states?.[card._ids?.weather]?.attributes||{};
  const sources=[condition(weather.category),condition(weather.session)].filter(Boolean);
  const time=shortTime(weather.updated_at);
  const provenance=[...sources,time].filter(Boolean).join(' · ');
  const mapHtml=map?'<svg class="mgp-track-svg" viewBox="0 0 280 160" role="img" aria-label="Schematisk banlayout för '+
    esc(circuit)+'" preserveAspectRatio="xMidYMid meet">'+
    '<path class="mgp-track-shadow" d="'+map.d+'"></path>'+
    '<path class="mgp-track-outline" d="'+map.d+'"></path></svg>'+
    '<div class="mgp-track-note">Schematisk banform · ej skalenlig</div>':
    '<div class="mgp-track-empty">Ingen verifierad banritning tillgänglig</div>';
  const temperature=weatherNumber(weather.air,'°C');
  const ground=weatherNumber(weather.ground,'°C');
  const humidity=weatherNumber(weather.humidity,'%');
  const surface=condition(weather.track);
  const values=[['Luft',temperature],['Bana',ground],['Fuktighet',humidity],['Underlag',surface]];
  const validValues=values.filter(([,v])=>Boolean(v));
  const description=condition(weather.weather);
  const weatherHtml=validValues.length||description?
    '<div class="mgp-weather-metrics">'+values.map(([label,value])=>
      '<div class="mgp-weather-cell"><small>'+esc(label)+'</small><strong>'+
      esc(value||'—')+'</strong></div>').join('')+'</div>'+
    (description?'<div class="mgp-weather-condition">'+esc(description)+'</div>':''):
    '<div class="mgp-weather-empty">Ingen banväderrapport tillgänglig ännu</div>';
  // Weather precedes the circuit outline, which stays flush-right.
  return '<div class="mgp-venue-strip" data-mgp-venue-header>'+
    '<div class="mgp-weather-panel"><div class="mgp-weather-head">'+
    '<span class="mgp-venue-caption">🌤️ Banväder</span>'+
    '<span class="mgp-weather-source">Senast rapporterat · inte livegaranti'+
    (provenance?' · '+esc(provenance):'')+'</span></div>'+weatherHtml+'</div>'+
    '<div class="mgp-circuit-panel"><div class="mgp-venue-caption">🏁 Banlayout</div>'+mapHtml+'</div></div>';
}
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
    original.call(this);
    if(!this._hass||!this.shadowRoot)return;
    if(!this.shadowRoot.querySelector?.('[data-mgp-venue-style]')){
      const style=document.createElement('style');
      style.setAttribute('data-mgp-venue-style','');
      style.textContent=STYLE;
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
    const uiVersion=(rawHeader.match(/MOTOGP NEXT\s*·\s*([^<]+)/i)||[])[1]?.trim()||
      Overview.buildInfo?.version||'okänd';
    const uiDetails='<details class="mgp-ui-details"><summary>UI-information</summary>'+
      '<div>Frontend: '+esc(uiVersion)+' · Bas-kort: '+esc(Overview.buildInfo?.version||'okänd')+
      '<br>Backendversion hanteras separat.</div></details>';
    const body='<div class="mgp-hero-grid" data-mgp-hero-grid>'+
      '<div class="mgp-hero-copy">'+brandedHeader+uiDetails+'</div>'+
      venue(this)+'</div>';
    view.innerHTML=markup.slice(0,innerStart)+body+markup.slice(end);
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
