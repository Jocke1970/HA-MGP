/* HA-MGP: the event toolbar prioritizes a verified active session. */
(() => {
'use strict';
const TAG='ha-motogp-next-overview-card';
const BUILD='active-chip-20261108-01';
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
function install(){
 const Card=customElements.get(TAG);
 if(!Card||Card.prototype._mgpActiveChip)return;
 const oldRender=Card.prototype._render;
 Card.prototype._render=function(...args){
  const result=oldRender.apply(this,args);
  if(this._spoiler?.()||!this._live||!this.shadowRoot)return result;
  const view=this.shadowRoot.getElementById?.('app');
  if(!view||!view.innerHTML.includes('mgp-next-chip'))return result;
  const {category,name}=this._live;
  if(!category||!name)return result;
  const locale=String(this._hass?.language||'en').split(/[-_]/)[0].toLowerCase();
  const label=WORDS[locale]||WORDS.en;
  const chip='<span class="mgp-next-chip mgp-active-chip" title="'+esc(label)+'">'+
    '<span aria-hidden="true" style="color:#16a34a">●</span> '+esc(label)+' · '+
    esc(category)+' · '+esc(name)+'</span>';
  view.innerHTML=replaceChip(view.innerHTML,chip);
  return result;
 };
 Card.prototype._mgpActiveChip=BUILD;
}
customElements.whenDefined(TAG).then(install);
})();