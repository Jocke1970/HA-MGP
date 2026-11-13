/* HA-MGP season calendar: off-weekend alternative for the overview card. */
(() => {
  'use strict';
  const TAG='ha-motogp-next-overview-card';
  const BUILD='calendar-20261113-02';
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
  // Image credits are displayed with any preview; an artwork licence does
  // not establish that a historical/proposed geometry matches MotoGP 2027.
  const REFERENCE_ARTWORK=Object.freeze({
    'Adelaide Street Circuit':{
      author:'Houseofsloth',
      license:'CC BY 4.0',
      licenseUrl:'https://creativecommons.org/licenses/by/4.0/',
      source:'https://commons.wikimedia.org/w/index.php?curid=198168198',
      preview:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Adelaide_MotoGP_Proposal.svg',
      label:'Föreslagen MotoGP-sträckning · ej verifierad för 2027'
    },
    'Buenos Aires':{
      author:'Gustavo Girardelli',
      license:'CC BY-SA 4.0',
      licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',
      source:'https://commons.wikimedia.org/w/index.php?curid=38920822',
      preview:null,
      label:'Historisk banreferens · 2027 års MotoGP-variant ej verifierad',
      dataCredit:'Innehåller OpenStreetMap-data (ODbL)'
    }
  });
  const referenceArtwork=circuit=>REFERENCE_ARTWORK[String(circuit||'').trim()]||null;
  const artworkCredit=ref=>ref?
    '<div class="mgp-season-art-credit">'+
    '<span>'+esc(ref.label)+'</span>'+
    '<span>Bild: <a href="'+esc(ref.source)+'" target="_blank" rel="noopener noreferrer">'+esc(ref.author)+'</a>'+
    ' · <a href="'+esc(ref.licenseUrl)+'" target="_blank" rel="noopener noreferrer">'+esc(ref.license)+'</a>'+
    (ref.dataCredit?' · '+esc(ref.dataCredit):'')+'</span></div>':'';
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
    .mgp-season-track--detail{height:clamp(240px,43dvh,400px);margin:6px 0 12px}
    .mgp-season-detail-map .mgp-season-track--next{height:clamp(240px,43dvh,400px);margin:6px 0 12px}
    .mgp-season-detail-map svg{width:100%;height:100%;max-width:660px}
    .mgp-season-track--detail svg{max-width:660px;width:100%;height:100%}
    .mgp-season-track--tile{height:106px;margin:2px 0}
    .mgp-season-track-note{display:block;font-size:10px;color:var(--secondary-text-color);text-align:center}
    .mgp-season-art-credit{display:grid;gap:3px;margin-top:5px;font-size:10px;color:var(--secondary-text-color)}
    .mgp-season-art-credit a{color:var(--primary-color,#039be5)}
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
    .mgp-season-dialog{box-sizing:border-box;position:fixed;inset:auto;top:calc(50% + 12px);left:50%;transform:translate(-50%,-50%);margin:0;width:min(820px,calc(100vw - 28px));max-width:calc(100vw - 28px);max-height:calc(100dvh - 64px);padding:0;border-radius:15px;border:1px solid var(--divider-color,#ddd);color:var(--primary-text-color);background:var(--ha-card-background,var(--card-background-color,#fff));box-shadow:0 20px 60px rgba(0,0,0,.3);overflow:hidden}
    .mgp-season-dialog[open]{display:flex;flex-direction:column}
    .mgp-season-dialog::backdrop{background:rgba(0,0,0,.55)}
    .mgp-season-dialog-head{display:flex;flex:0 0 auto;align-items:center;gap:13px;padding:13px 18px;border-bottom:1px solid var(--divider-color,#ddd)}
    .mgp-season-dialog-flag{font-size:30px;line-height:1;flex:0 0 auto}
    .mgp-season-dialog-flag:empty{display:none}
    .mgp-season-dialog-heading{display:grid;gap:3px;min-width:0}
    .mgp-season-dialog-heading strong{font-size:19px;font-weight:800;line-height:1.2;overflow-wrap:anywhere}
    .mgp-season-dialog-race{font-size:15px;font-weight:650;line-height:1.3}
    .mgp-season-dialog-dates{font-size:12px;color:var(--secondary-text-color)}
    .mgp-season-detail-close{display:flex;align-items:center;justify-content:center;width:100%;height:clamp(240px,43dvh,400px);min-height:clamp(240px,43dvh,400px);padding:0;border:0;background:transparent;color:inherit;cursor:zoom-out;font:inherit}
    .mgp-season-detail-close:focus-visible{outline:2px solid var(--primary-color,#039be5);outline-offset:2px}
    .mgp-season-dialog-body{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:14px}
    .mgp-season-detail-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
    .mgp-season-detail-grid>span{min-width:0;border:1px solid var(--divider-color,#ddd);padding:10px 12px;border-radius:8px;font-size:13px;line-height:1.45}
    .mgp-season-detail-grid b{display:block;margin-top:4px;font-size:16px;font-weight:750;overflow-wrap:anywhere}
    .mgp-season-facts-status{display:flex;align-items:center;gap:7px;margin:12px 0 9px;font-size:13px;font-weight:650;color:var(--primary-text-color)}
    .mgp-season-facts-dot{display:inline-block;width:9px;height:9px;flex:0 0 9px;border-radius:50%;background:#d97706}
    .mgp-season-facts-status[data-status="verified"] .mgp-season-facts-dot{background:#16a34a}
    @media(max-width:660px){.mgp-season-detail-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:390px){.mgp-season-detail-grid>span{padding:8px;font-size:12px}.mgp-season-detail-grid b{font-size:14px}}
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
  // The UI exposes only seasons we can identify; new Pulselive seasons
  // appear automatically rather than freezing the buttons at 2026/2027.
  // Historical calendars remain unavailable unless a real source provides them.
  const yearsFor=(now,backendYear)=>{
    const latest=Math.max(2027,now.getFullYear(),Number.isInteger(backendYear)?backendYear:2026);
    return Array.from({length:latest-2026+1},(_,i)=>2026+i);
  };
  const selectedSeason=(card,now,backendYear)=>{
    const years=yearsFor(now,backendYear);
    const desired=Number(card._mgpCalendarYear);
    return Number.isInteger(desired)&&years.includes(desired)?
      desired:Math.min(Math.max(2026,now.getFullYear()),years[years.length-1]);
  };
  const yearButtons=(years,selectedYear)=>years.map(y=>
    '<button type="button" data-mgp-season-year="'+y+
    '" role="tab" aria-selected="'+(y===selectedYear)+'">'+y+'</button>').join('');
  function calendar(card,now,useStandardHeader=false){
    const states=card._hass?.states||{};
    const race=states[card._ids?.race];
    const liveCalendar=race?.attributes?.season_calendar;
    const backendYear=Number(states['sensor.motogp_current_season']?.state);
    const selectedYear=selectedSeason(card,now,backendYear);
    const years=yearsFor(now,backendYear);
    // Prefer real Pulselive events for the current backend season only.
    // The provisional 2027 list is used only before Pulselive reaches 2027.
    const raw=selectedYear===2027&&backendYear!==2027?
      PUBLISHED_2027:selectedYear===backendYear&&Array.isArray(liveCalendar)?
        liveCalendar:[];
    if(!Array.isArray(raw)||!raw.length){
      if(selectedYear!==backendYear){
        return '<section class="mgp-season"><header class="mgp-season-head"><strong>🗓️ Säsong '+selectedYear+'</strong>'+
          '<div class="mgp-season-years" role="tablist" aria-label="Säsong">'+
          yearButtons(years,selectedYear)+'</div></header>'+
          '<p class="mgp-season-empty">Historisk kalender för '+selectedYear+
          ' är inte tillgänglig från Pulselive just nu. Inga lopp från en annan säsong visas.</p></section>';
      }
      return null;
    }
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
    // A future-season preview is a calendar, not the currently active GP.
    // Show every round including R1 as an ordinary clickable tile.
    const futurePreview=selectedYear>now.getFullYear()||selectedYear>backendYear;
    const upcoming=future.filter(e=>futurePreview||e!==next).map(e=>cardHtml(e,false)).join('');
    const previous=past.map(e=>cardHtml(e,true)).join('');
    const nextHtml=next?'<div class="mgp-season-next"><div class="mgp-season-next-layout"><div class="mgp-season-next-copy"><span class="mgp-season-mark">'+labels[1]+' · R'+(index+1)+'</span>'+
      '<h3>'+flagFor(next.country)+' '+eventName(next)+'</h3><b>'+dates(next)+'</b>'+
      '<small>'+circuit(next)+(next.country?' · '+country(next):'')+'</small>'+ (countdown(next)?'<strong class="mgp-season-mark">'+esc(countdown(next))+'</strong>':'')+
      '</div><div>'+trackHtml(next,true)+'<span class="mgp-season-track-note">Schematisk banlayout</span></div></div></div>':
      '<div class="mgp-season-empty">'+labels[4]+'</div>';

    const selected=entries.find(e=>String(e.id||'')&&String(e.id)===String(card._mgpSelectedEventId||''));
    const detail=selected?(()=>{
      const isPast=dateKey(selected.end)<today;
      const facts=typeof card._mgpCalendarFacts==='function'?card._mgpCalendarFacts(selected.circuit,selectedYear):null;
      const dimensions=facts?[
        ['Banlängd',facts.length],['Bredd',facts.width],
        ['Längsta raka',facts.straight],['Högerkurvor',facts.right],
        ['Vänsterkurvor',facts.left]
      ].filter(([_,value])=>value).map(([label,value])=>
        '<span>'+esc(label)+'<b>'+esc(value)+'</b></span>').join(''):'';
      const ref=selected.provisional?referenceArtwork(selected.circuit):null;
      const proposed=ref?.preview?
        '<div class="mgp-season-track mgp-season-track--next"><img src="'+esc(ref.preview)+
        '" alt="Föreslagen banprofil, ej verifierad" loading="lazy" style="opacity:1;position:relative;max-height:170px"></div>':'';
      const referenceHtml=ref?'<h3>Banreferens (ej verifierad MotoGP-layout)</h3>'+
        proposed+artworkCredit(ref):'';
      const factsStatus=facts?.provisional?'preliminary':'verified';
      const factsCaption=facts?.provisional?'Preliminära banfakta':'Verifierade banfakta';
      const factsHtml=dimensions?'<div class="mgp-season-facts-status" data-status="'+factsStatus+'"><span class="mgp-season-facts-dot" aria-hidden="true"></span>'+factsCaption+'</div>'+
        '<p class="mgp-season-detail-note">'+esc(facts.note||'Banmått från angiven källa')+'</p><div class="mgp-season-detail-grid">'+dimensions+'</div>'+
        (String(facts.source||'').startsWith('https://')?
          '<p><a href="'+esc(facts.source)+'" target="_blank" rel="noopener noreferrer">Källa för banfakta</a></p>':''):
        '<p class="mgp-season-detail-note">🟡 Banmått saknas i säsongens tillgängliga underlag.</p>';
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
        '<div class="mgp-season-dialog-head"><span class="mgp-season-dialog-flag" aria-hidden="true">'+
        (flagFor(selected.country)==='🏁'?'':flagFor(selected.country))+'</span>'+
        '<div class="mgp-season-dialog-heading"><strong>'+circuit(selected)+'</strong>'+
        '<span class="mgp-season-dialog-race">'+eventName(selected)+'</span>'+
        '<span class="mgp-season-dialog-dates">'+dates(selected)+
        (selected.country?' · '+country(selected):'')+'</span></div></div>'+
        '<div class="mgp-season-dialog-body">'+
        '<div class="mgp-season-detail-map"><button type="button" class="mgp-season-detail-close" data-mgp-season-close aria-label="Stäng popup genom att trycka på banbilden">'+
        trackHtml(selected,true)+'</button></div>'+referenceHtml+factsHtml+
        '<p class="mgp-season-detail-note">Rekord visas bara när banvariant och officiell rekordkälla är verifierade.</p>'+
        resultsHtml+'</div></dialog>';
    })():'';
    return '<section class="mgp-season" aria-label="'+labels[0]+'">'+
      '<header class="mgp-season-head"><strong>🗓️ '+labels[0]+' '+esc(year)+'</strong>'+
      '<div class="mgp-season-years" role="tablist" aria-label="Säsong">'+
      yearButtons(years,selectedYear)+
      '<small>'+entries.length+' GP</small></div></header>'+
      (isProvisional?'<div class="mgp-season-provisional">Preliminär FIM-kalender 2027, publicerad 25 september 2026. Tider och datum kan ändras.</div>':'')+
      (useStandardHeader||futurePreview?'':nextHtml)+(upcoming?'<div class="mgp-season-section">'+labels[2]+'</div>'+
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
      const selectedYear=selectedSeason(this,new Date(),backendYear);
      const useStandardHeader=Boolean(
        originalHeader?.outerHTML?.includes('data-mgp-hero-grid')&&selectedYear===backendYear
      );
      const headerHtml=useStandardHeader?originalHeader.outerHTML:'';
      const standingsHtml=useStandardHeader&&this._standingOpen===true?
        (view.querySelector?.('.np-card[aria-label="VM-ställning"]')?.outerHTML||''):'';
      // The real GP's existing modal owns the UI while its schedule, circuit
      // facts or championship panel is open. Do not replace it with calendar HTML.
      if(this._scheduleOpen===true||this._circuitOpen===true||this._standingOpen===true)return result;
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
      view.innerHTML='<div class="root">'+headerHtml+standingsHtml+value+footer+'</div>';
      // Only the calendar detail popup participates here; native circuit
      // dialogs remain owned by the GP header.
      for(const [selector,active] of [
        ['.mgp-season-dialog',Boolean(this._mgpSelectedEventId)],
        ['.mgp-circuit-dialog',this._circuitOpen===true&&useStandardHeader]
      ]){
        const dialog=view.querySelector?.(selector);
        if(dialog&&active&&typeof dialog.showModal==='function'&&!dialog.open){
          dialog.addEventListener('click',event=>{
            // Close on the true backdrop only. Empty interior padding must
            // not behave like backdrop (important on mobile).
            if(event.target!==dialog)return;
            const rect=dialog.getBoundingClientRect();
            const outside=event.clientX<rect.left||event.clientX>rect.right||
              event.clientY<rect.top||event.clientY>rect.bottom;
            if(!outside)return;
            if(selector==='.mgp-season-dialog')this._mgpSelectedEventId=null;
            if(selector==='.mgp-circuit-dialog')this._circuitOpen=false;
            this._render();
          });
          // Direct listener on the map's full rectangular container; blank
          // portions of the image must close just like the vector itself.
          dialog.querySelector?.('.mgp-season-detail-map')?.addEventListener('click',event=>{
            event.stopPropagation();
            this._mgpSelectedEventId=null;this._render();
          });
          dialog.addEventListener('cancel',event=>{
            event.preventDefault();
            if(selector==='.mgp-season-dialog')this._mgpSelectedEventId=null;
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
        const backendYear=Number(this._hass?.states?.['sensor.motogp_current_season']?.state);
        if(yearsFor(new Date(),backendYear).includes(value)){
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
