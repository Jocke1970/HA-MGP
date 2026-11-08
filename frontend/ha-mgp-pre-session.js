/* HA-MGP dev.37: read-only transition from previous result to verified entrants/grid. */
(()=>{
'use strict';
const TAG='ha-motogp-next-timing-card',BUILD='pre-session-roster-20261108-01';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const valid=v=>v!==null&&v!==undefined&&String(v).trim()!=='';
const label=v=>({RAC:'Race',SPR:'Sprint',WUP:'Warm Up',PR:'Practice'})[String(v||'').toUpperCase()]||String(v||'');
const matching=(a,b)=>String(a||'').trim().toLowerCase()===String(b||'').trim().toLowerCase();
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
   if(!Number.isInteger(position)||position<1||!number||seen.has(number)||positions.has(position))return [];
   seen.add(number);positions.add(position);
   const entrant=roster.find(r=>String(r.number)===number);
   const rider=String(g.rider||entrant?.rider||'').trim();
   if(!rider)return [];
   out.push({position,number,rider,team:g.team||entrant?.team||'',nation:entrant?.nation||''});
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
 return {session:s,rows:rowsFor(s,attrs),grid:/^(race|sprint)$/i.test(label(s.name||s.type))&&
  rowsFor(s,attrs).length>0&&rowsFor(s,attrs)[0].position!==null};
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