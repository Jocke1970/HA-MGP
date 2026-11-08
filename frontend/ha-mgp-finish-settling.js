/* HA-MGP: bounded post-finish result settling, never imply a finished session is live. */
(() => {
'use strict';
const TAG='ha-motogp-next-timing-card';
const BUILD='finish-settling-20261108-01';
const HOLD_MS=120000;
const session=v=>({WUP:'WARMUP',RAC:'RACE',SPR:'SPRINT',PR:'PRACTICE'})[String(v||'').toUpperCase()]||v;
const same=(a,b)=>String(a||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]/g,'')===String(b||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const category=v=>{const m=/moto\s*(gp|2|3|e)/i.exec(String(v||''));return m?({gp:'MotoGP','2':'Moto2','3':'Moto3',e:'MotoE'})[m[1].toLowerCase()]:String(v||'');};
function validFinishingFeed(card,hold){
 const states=card._hass?.states||{};
 const se=states[card._ids.session],st=states[card._ids.status],riders=states[card._ids.riders];
 const sa=se?.attributes||{},ta=st?.attributes||{},pa=riders?.attributes||{};
 const status=String(st?.state||'').toLowerCase(),code=String(ta.session_status_id||'').toUpperCase();
 if(!((status==='finished'||code==='F')&&same(category(sa.category),hold.category)&&
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
    String(st?.attributes?.session_status_id||'').toUpperCase()==='F';
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