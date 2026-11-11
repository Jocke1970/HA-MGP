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