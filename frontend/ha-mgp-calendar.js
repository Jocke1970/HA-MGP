/* HA-MGP season calendar: off-weekend alternative for the overview card. */
(() => {
  'use strict';
  const TAG='ha-motogp-next-overview-card';
  const BUILD='calendar-20261109-03';
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const parseDate=raw=>{
    const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(raw||''));
    if(!m)return null;
    const d=new Date(+m[1],+m[2]-1,+m[3],12);
    return d.getFullYear()===+m[1]&&d.getMonth()===+m[2]-1&&d.getDate()===+m[3]?d:null;
  };
  const dateKey=d=>d?''+[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-'):'';
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
    .mgp-season-event{padding:12px;min-width:0;display:flex;flex-direction:column;gap:8px;border:1px solid var(--divider-color,#ddd);border-radius:11px}
    .mgp-season-event.is-next{border-color:#e10600}
    .mgp-season-event.is-past{background:var(--secondary-background-color,rgba(127,127,127,.065));opacity:.65;filter:grayscale(1)}
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
  function calendar(card,now){
    const states=card._hass?.states||{};
    const race=states[card._ids?.race];
    const raw=race?.attributes?.season_calendar;
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
    const season=states['sensor.motogp_current_season']?.state||entries[0].start.getFullYear();
    const year=/^\d{4}$/.test(String(season))?season:entries[0].start.getFullYear();
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
          !/^M[\\d., LZz-]+$/.test(String(track.d||''))){
        return '<div class="mgp-season-track mgp-season-track--'+(large?'next':'tile')+
          '"><span class="mgp-season-track-missing">Banlayout saknas</span></div>';
      }
      const path=esc(track.d);
      // Pre-existing geometry is schematic, not an asserted MotoGP race variant.
      const vector='<svg viewBox="0 0 280 160" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Schematisk banlayout för '+
        esc(circuitName)+'"><path d="'+path+'"></path></svg>';
      const local=track.localPath&&/^\\/local\\/ha-mgp\\/circuits\\/[a-z0-9]+\\.svg$/.test(track.localPath)?
        '<img src="'+esc(track.localPath)+'" alt="" loading="lazy" decoding="async">':'';
      return '<div class="mgp-season-track mgp-season-track--'+(large?'next':'tile')+'">'+
        local+vector+'</div>';
    };
    const cardHtml=(e,isPast=false)=>{
      const i=entries.indexOf(e)+1;
      return '<div class="mgp-season-event'+(isPast?' is-past':'')+'">'+
        '<span class="mgp-round">R'+i+'</span>'+
        '<div class="mgp-season-title"><span>'+flagFor(e.country)+'</span><b>'+eventName(e)+'</b></div>'+
        '<small>'+dates(e)+'</small>'+trackHtml(e)+'<small>'+circuit(e)+'</small><small>'+country(e)+'</small></div>';
    };
    // The highlighted GP is already represented in the hero: never repeat it.
    const upcoming=future.filter(e=>e!==next).map(e=>cardHtml(e,false)).join('');
    const previous=past.map(e=>cardHtml(e,true)).join('');
    const nextHtml=next?'<div class="mgp-season-next"><div class="mgp-season-next-layout"><div class="mgp-season-next-copy"><span class="mgp-season-mark">'+labels[1]+' · R'+(index+1)+'</span>'+
      '<h3>'+flagFor(next.country)+' '+eventName(next)+'</h3><b>'+dates(next)+'</b>'+
      '<small>'+circuit(next)+(next.country?' · '+country(next):'')+'</small>'+ (countdown(next)?'<strong class="mgp-season-mark">'+esc(countdown(next))+'</strong>':'')+
      '</div><div>'+trackHtml(next,true)+'<span class="mgp-season-track-note">Schematisk banlayout</span></div></div></div>':
      '<div class="mgp-season-empty">'+labels[4]+'</div>';
    return '<section class="mgp-season" aria-label="'+labels[0]+'">'+
      '<header class="mgp-season-head"><strong>🗓️ '+labels[0]+' '+esc(year)+'</strong><small>'+entries.length+' GP</small></header>'+
      nextHtml+(upcoming?'<div class="mgp-season-section">'+labels[2]+'</div>'+
      '<div class="mgp-season-list">'+upcoming+'</div>':'')+
      (previous?'<details class="mgp-season-past"><summary>✓ '+labels[3]+' ('+past.length+')</summary>'+
       '<div class="mgp-season-list">'+previous+'</div></details>':'')+'</section>';
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
      const value=calendar(this,new Date());
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
      view.innerHTML='<div class="root">'+value+footer+'</div>';
      // Use locally supplied SVG only after a successful load. Until then
      // the built-in vector outline remains visible, even if the local file 404s.
      for(const img of view.querySelectorAll?.('.mgp-season-track img')||[]){
        img.addEventListener('load',()=>{if(img.naturalWidth>0)img.classList.add('is-ready');},{once:true});
        img.addEventListener('error',()=>{img.classList.remove('is-ready');},{once:true});
        if(img.complete&&img.naturalWidth>0)img.classList.add('is-ready');
      }
      return result;
    };
    Card.prototype._mgpSeasonCalendar=BUILD;
  }
  customElements.whenDefined(TAG).then(install);
})();
