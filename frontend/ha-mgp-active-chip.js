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
 const st=states[ids.status||'sensor.motogp_session_status'],se=states[ids.session||'sensor.motogp_session_name'];
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