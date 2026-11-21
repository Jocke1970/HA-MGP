/* HA-MGP dev.37: read-only transition from previous result to verified entrants/grid. */
(()=>{
'use strict';
const TAG='ha-motogp-next-timing-card',BUILD='pre-session-grid-20261121-02';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const valid=v=>v!==null&&v!==undefined&&String(v).trim()!=='';
const label=v=>({RAC:'Race',SPR:'Sprint',WUP:'Warm Up',PR:'Practice'})[String(v||'').toUpperCase()]||String(v||'');
const GRID_STYLE='<style>'+
 '.mgp-pre-grid-scroll{overflow-x:auto;padding:10px 12px 16px}'+
 '.mgp-pre-start{font-size:10px;font-weight:850;text-align:center;margin:2px 0 12px;letter-spacing:.14em;color:var(--secondary-text-color)}'+
 '.mgp-pre-wave{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;min-width:480px;padding:0 0 9px;margin:0 0 9px;border-bottom:1px dashed var(--divider-color,#8886)}'+
 '.mgp-pre-slot{display:flex;align-items:center;gap:8px;min-width:0;min-height:47px;padding:7px 9px;border:1px solid var(--divider-color,#8886);border-left:4px solid var(--mgp-grid-color,#777);border-radius:9px;background:var(--ha-card-background,var(--card-background-color,#fff))}'+
 '.mgp-pre-slot-2{transform:translateY(4px)}.mgp-pre-slot-3{transform:translateY(8px)}'+
 '.mgp-pre-pole{border-color:#c8a146;box-shadow:inset 0 0 0 1px #c8a14655}'+
 '.mgp-pre-position{display:flex;align-items:center;justify-content:center;min-width:32px;height:31px;border-radius:6px;background:var(--secondary-background-color,#8882);font-size:14px;font-weight:900;flex:none;font-variant-numeric:tabular-nums}'+
 '.mgp-pre-flag{font-size:15px;flex:none}'+
 '.mgp-pre-name{min-width:0;display:flex;flex-direction:column;gap:3px}'+
 '.mgp-pre-name b{font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
 '.mgp-pre-name small{font-size:10px;color:var(--secondary-text-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
 '@container (max-width:530px){.mgp-pre-grid-scroll{padding:8px 5px 14px}.mgp-pre-slot{padding:6px;gap:5px}.mgp-pre-name b{font-size:11px}}'+
 '</style>';
const safeColor=v=>/^#(?:[0-9a-f]{6})$/i.test(String(v||''))?String(v):'#777777';
const riderNumber=v=>{const x=String(v??'').trim().replace(/^#/,'');return /^\d{1,3}$/.test(x)&&Number(x)>0?String(Number(x)):'';};
const nameKey=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/gi,'').toLowerCase();
const teamKey=v=>String(v||'').trim().replace(/\s+/g,' ').toLowerCase();
const nationFlag=v=>{
 const code=String(v||'').toUpperCase();
 const iso3={ITA:'IT',SPA:'ES',FRA:'FR',GBR:'GB',AUS:'AU',JPN:'JP',BRA:'BR',NED:'NL',GER:'DE',POR:'PT',USA:'US',BEL:'BE',CZE:'CZ',COL:'CO',RSA:'ZA',TUR:'TR',SUI:'CH',THA:'TH',MAL:'MY',IDN:'ID',ARG:'AR',IND:'IN'};
 const country=iso3[code]||(/^[A-Z]{2}$/.test(code)?code:'');
 return country?String.fromCodePoint(...[...country].map(c=>127397+c.charCodeAt(0))):'';
};
function gridMarkup(rows){
 let html=GRID_STYLE+'<div class="mgp-pre-grid-scroll"><div class="mgp-pre-start">🏁 START / POLE POSITION</div>';
 for(let i=0;i<rows.length;i+=3){
  html+='<div class="mgp-pre-wave">';
  for(const r of rows.slice(i,i+3)){
   const slot=(r.position-1)%3+1,flag=nationFlag(r.nation);
   html+='<div class="mgp-pre-slot mgp-pre-slot-'+slot+(r.position===1?' mgp-pre-pole':'')+'" style="--mgp-grid-color:'+safeColor(r.color)+'">'+
    '<span class="mgp-pre-position">P'+esc(r.position)+'</span>'+
    (flag?'<span class="mgp-pre-flag">'+flag+'</span>':'')+
    '<span class="mgp-pre-name"><b>'+esc(r.rider)+'</b><small>'+
    (riderNumber(r.number)?'#'+esc(riderNumber(r.number))+' · ':'')+esc(r.team)+'</small></span></div>';
  }
  html+='</div>';
 }
 return html+'</div>';
}
function eventWindow(attrs){
 const start=String(attrs.date_start||'').slice(0,10),end=String(attrs.date_end||'').slice(0,10);
 const valid=d=>/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isFinite(Date.parse(d+'T00:00:00Z'));
 if(!valid(start)||!valid(end)||end<start)return null;
 return {from:Date.parse(start+'T00:00:00Z')-12*3600000,
  to:Date.parse(end+'T00:00:00Z')+2*86400000};
}
function matchesEvent(s,attrs,at,window){
 if(!s||!window||!Number.isFinite(at)||at<window.from||at>=window.to)return false;
 if(s.event_id&&attrs.event_id&&String(s.event_id)!==String(attrs.event_id))return false;
 return true;
}
function upcoming(card){
 const race=card._hass?.states?.[card._ids.race],a=race?.attributes||{};
 const all=Array.isArray(a.sessions_all)?a.sessions_all:[];
 const now=Date.now(),window=eventWindow(a);
 const available=all.map(s=>({s,at:Date.parse(s?.date_utc||s?.date||'')}))
  .filter(x=>matchesEvent(x.s,a,x.at,window)&&
   !['FINISHED','CANCELLED','CANCELED'].includes(String(x.s?.status||'').toUpperCase()));
 const future=available.filter(x=>x.at>now).sort((x,y)=>x.at-y.at);
 // A scheduled start does not establish live timing: retain the entry roster
 // briefly until a matching and TV-delay-approved live snapshot arrives.
 const pending=available.filter(x=>x.at<=now&&now-x.at<=45*60000)
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
   const position=Number(g?.position),rider=String(g?.rider||'').trim();
   const team=String(g?.team||'').trim(),key=nameKey(rider);
   // Published grid positions may have no rider number: resolve only from
   // verified same-class entrant data, never guess a rider's number.
   const candidates=roster.filter(r=>nameKey(r.rider)===key&&(!team||teamKey(r.team)===teamKey(team)));
   const entrant=candidates.length===1?candidates[0]:null;
   const standings=Array.isArray(attrs.standings_by_category?.[category])?attrs.standings_by_category[category]:[];
   const verified=standings.filter(r=>nameKey(r.rider)===key&&(!team||teamKey(r.team)===teamKey(team)));
   const match=verified.length===1?verified[0]:null;
   const number=riderNumber(g?.number)||riderNumber(entrant?.number)||riderNumber(match?.number);
   if(!Number.isInteger(position)||position<1||!key||seen.has(key)||positions.has(position))
     return roster.map(r=>({position:null,number:r.number,rider:r.rider,team:r.team||'',nation:r.nation||''}));
   seen.add(key);positions.add(position);
   out.push({position,number,rider,team:team||entrant?.team||'',nation:g.nation||entrant?.nation||match?.nation||'',color:g.color||entrant?.color||match?.team_color||''});
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
function checkpoint(at){
 const minutes=Math.floor((Date.now()-at)/60000);
 return minutes>=5?'START EJ BEKRÄFTAD · MÖJLIG FÖRSENING':'STARTLISTA · INVÄNTAR LIVE';
}
function countdown(at){
 const s=Math.max(0,Math.ceil((at-Date.now())/1000));
 return at<=Date.now()?'Schemalagd start passerad · inväntar bekräftelse':
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
  const standings=this._hass?.states?.['sensor.motogp_rider_standings']?.attributes?.standings_by_category||{};
  const roster=before(this,next,{...attrs,standings_by_category:standings});
  if(roster){
   const expanded=this._timingManual===null?true:this._timingManual;
   const s=roster.session,type=label(s.name||s.type);
   const title=esc(s.category||'')+' · '+esc(type);
   let html='<section class="nt-card"><button type="button" class="nt-head" data-timing aria-expanded="'+expanded+'">'+
    '<span><span class="nt-label">🏁 '+title+'</span><span class="nt-status finished">'+esc(checkpoint(next.at))+'</span></span>'+
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