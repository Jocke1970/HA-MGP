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