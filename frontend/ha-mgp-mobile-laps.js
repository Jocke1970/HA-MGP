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
