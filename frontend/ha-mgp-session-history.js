/* MotoGP Next: observed historical lap summaries for explicitly FINISHED sessions. */
(() => {
'use strict';
const OVERVIEW='ha-motogp-next-overview-card';
const REQUIRED='0.2.0-split.2',BUILD='history-20261107-01';
const STYLE="\n.nh-history-btn{display:inline-flex;margin-top:9px;border:1px solid var(--divider-color,#ddd);border-radius:15px;background:transparent;color:inherit;font:inherit;font-size:11px;font-weight:800;padding:6px 10px;cursor:pointer}\n.nh-history-btn:hover{border-color:var(--primary-color,#03a9f4)}\n.nh-overlay{position:fixed;inset:0;z-index:10010;display:flex;align-items:center;justify-content:center;padding:13px;background:rgba(0,0,0,.6);box-sizing:border-box}\n.nh-dialog{width:min(800px,100%);max-height:min(780px,calc(100dvh - 26px));overflow:hidden;border-radius:14px;display:flex;flex-direction:column;background:var(--ha-card-background,var(--card-background-color,#fff));color:var(--primary-text-color);box-shadow:0 14px 50px rgba(0,0,0,.35)}\n.nh-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:16px 18px;border-bottom:1px solid var(--divider-color,#ddd)}\n.nh-head strong{font-size:16px}.nh-head small{display:block;font-size:11px;color:var(--secondary-text-color);margin-top:5px}\n.nh-close{flex:none;width:35px;height:35px;border-radius:50%;font-size:24px;cursor:pointer;background:transparent;color:inherit;border:1px solid var(--divider-color,#ddd)}\n.nh-body{overflow-y:auto;padding:14px 18px 20px;overscroll-behavior:contain}\n.nh-caveat{color:var(--secondary-text-color);font-size:11px;line-height:1.5;margin-bottom:14px}\n.nh-note{color:var(--secondary-text-color);font-size:12px;margin-bottom:12px}\n.nh-result{width:100%;border-collapse:collapse;font-size:12px;font-variant-numeric:tabular-nums}\n.nh-result th,.nh-result td{padding:10px 8px;border-bottom:1px solid var(--divider-color,#ddd);text-align:left}\n.nh-result th{font-size:10px;text-transform:uppercase;color:var(--secondary-text-color)}\n.nh-result td:nth-child(n+3),.nh-result th:nth-child(n+3){text-align:right}\n.nh-result small{color:var(--secondary-text-color);display:block;margin-top:3px}\n.nh-best{font-weight:850;color:var(--success-color,#159447)}\n.nh-warning{color:var(--warning-color,#cf7200);font-weight:750}\n.nh-empty{font-size:12px;color:var(--secondary-text-color);padding:14px 4px}\n@media(max-width:540px){.nh-body{padding:9px 10px 14px}.nh-head{padding:12px}.nh-result{font-size:11px}.nh-result th,.nh-result td{padding:8px 4px}.nh-result td:nth-child(3),.nh-result th:nth-child(3){display:none}}\n";
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const allowedId=v=>typeof v==='string'&&/^[A-Za-z0-9-]{8,128}$/.test(v);
const eventKey=card=>{const r=card._hass?.states?.[card._ids?.race];return String(r?.state||'')+'|'+String(r?.attributes?.date_start||'')+'|'+String(r?.attributes?.date_end||'');};
const schedule=card=>{const a=card._hass?.states?.[card._ids?.race]?.attributes||{};return Array.isArray(a.sessions_all)?a.sessions_all:[];};
const finished=card=>schedule(card).filter(s=>s&&allowedId(s.id)&&String(s.status||'').toUpperCase()==='FINISHED'&&['MotoGP','Moto2','Moto3'].includes(String(s.category||'')));
function addStyle(card){
  if(!card.shadowRoot||card.shadowRoot.querySelector?.('[data-motogp-history-style]'))return;
  const node=document.createElement('style');node.setAttribute('data-motogp-history-style','');
  node.textContent=STYLE;card.shadowRoot.appendChild(node);
}
function modal(state){
  let body='';
  if(state.status==='loading')body='<div class="nh-empty">Läser sparade varvtider…</div>';
  else if(state.status==='error')body='<div class="nh-empty">Arkivet kunde inte läsas just nu.</div>';
  else{
    const data=state.data||{},rs=Array.isArray(data.riders)?data.riders:[];
    if(!data.available||!rs.length)body='<div class="nh-empty">Inga observerade varv finns sparade för detta pass.</div>';
    else{
      const rows=rs.map(r=>'<tr><td>#'+esc(r.number||'—')+'</td><td><strong>'+esc(r.name||'Förare')+
        '</strong>'+(r.partial?'<small class="nh-warning">Ofullständiga varv</small>':'')+
        '</td><td>'+esc(r.lap_count)+'</td><td>'+esc(r.last_time||'—')+
        '<small>Varv '+esc(r.last_lap||'—')+'</small></td><td class="nh-best">'+
        esc(r.best_time||'—')+'<small>Varv '+esc(r.best_lap||'—')+'</small></td></tr>').join('');
      body='<div class="nh-note">'+esc(data.observed_laps)+' observerade varv · '+
        rs.length+' förare'+(data.partial?' · ⚠ luckor i arkivet':'')+'</div>'+
        '<table class="nh-result"><thead><tr><th>Nr</th><th>Förare</th><th>Varv</th>'+
        '<th>Senaste</th><th>Snabbaste</th></tr></thead><tbody>'+rows+'</tbody></table>';
    }
  }
  return '<div class="nh-overlay" data-motogp-history-backdrop><section class="nh-dialog" role="dialog" aria-modal="true" aria-labelledby="nh-title">'+
    '<header class="nh-head"><div><strong id="nh-title">🏁 '+esc(state.category)+' · '+esc(state.name)+'</strong>'+
    '<small>Arkiverat pass · endast observerade tider</small></div>'+
    '<button type="button" class="nh-close" data-motogp-history-close aria-label="Stäng historik">×</button></header>'+
    '<div class="nh-body"><div class="nh-caveat">Sorterat efter snabbaste observerade varv, inte officiell målordning. '+
    'Arkivet kan sakna varv; inga tider uppskattas.</div>'+body+'</div></section></div>';
}
function install(){
  const Card=customElements.get(OVERVIEW);
  if(Card?.buildInfo?.version!==REQUIRED){console.error('[MotoGP history] Wrong Overview version');return;}
  if(Card.prototype._motogpSessionHistory)return;
  const priorSchedule=Card.prototype._schedule;
  Card.prototype._schedule=function(race,now){
    let html=priorSchedule.call(this,race,now);
    if(this._spoiler())return html;
    for(const s of finished(this)){
      const label='<div class="name">'+esc(s.category)+' · '+esc(s.name)+'</div>';
      const needle=label+'</div>';
      if(html.split(needle).length!==2)continue;
      const btn='<button type="button" class="nh-history-btn" data-motogp-history-session="'+esc(s.id)+
        '" aria-label="Visa varv för '+esc(s.category)+' '+esc(s.name)+'">Visa varv</button>';
      html=html.replace(needle,label+btn+'</div>');
    }
    return html;
  };
  Card.prototype._motogpHistoryOpen=function(id){
    const sessions=finished(this).filter(s=>s.id===id);
    if(this._spoiler()||sessions.length!==1)return;
    const s=sessions[0],token={id,category:s.category,name:s.name,event:eventKey(this),status:'loading',data:null};
    this._motogpHistory=token;this._render();
    this.shadowRoot?.querySelector?.('[data-motogp-history-close]')?.focus?.();
    if(typeof this._hass?.callWS!=='function'){token.status='error';this._render();return;}
    this._hass.callWS({type:'motogp_sensor/session_history',session_id:id}).then(data=>{
      if(this._motogpHistory!==token||this._spoiler()||token.event!==eventKey(this)||
          finished(this).filter(s=>s.id===id).length!==1)return;
      token.data=data;token.status='ready';this._render();
    }).catch(()=>{
      if(this._motogpHistory!==token||this._spoiler())return;
      token.status='error';this._render();
    });
  };
  Card.prototype._motogpHistoryClose=function(){this._motogpHistory=null;this._render();};
  const priorClick=Card.prototype._click;
  Card.prototype._click=function(e){
    const target=e?.target;
    if(target?.closest?.('[data-motogp-history-close]')){this._motogpHistoryClose();return;}
    const backdrop=target?.closest?.('[data-motogp-history-backdrop]');
    if(backdrop&&backdrop===target){this._motogpHistoryClose();return;}
    const btn=target?.closest?.('[data-motogp-history-session]');
    if(btn){this._motogpHistoryOpen(btn.getAttribute('data-motogp-history-session'));return;}
    return priorClick.call(this,e);
  };
  const priorRender=Card.prototype._render;
  Card.prototype._render=function(){
    priorRender.call(this);addStyle(this);
    const token=this._motogpHistory;
    if(!token)return;
    if(this._spoiler()||token.event!==eventKey(this)||
        finished(this).filter(s=>s.id===token.id&&s.category===token.category).length!==1){
      this._motogpHistory=null;return;
    }
    this.shadowRoot?.getElementById('app')?.insertAdjacentHTML?.('beforeend',modal(token));
  };
  const priorConnected=Card.prototype.connectedCallback;
  Card.prototype.connectedCallback=function(){
    priorConnected.call(this);
    if(this.shadowRoot&&!this._motogpHistoryKeyHandler){
      this._motogpHistoryKeyHandler=e=>{if(e.key==='Escape'&&this._motogpHistory){e.preventDefault();this._motogpHistoryClose();}};
      this.shadowRoot.addEventListener('keydown',this._motogpHistoryKeyHandler);
    }
  };
  const priorDisconnected=Card.prototype.disconnectedCallback;
  Card.prototype.disconnectedCallback=function(){
    if(this._motogpHistoryKeyHandler)this.shadowRoot?.removeEventListener('keydown',this._motogpHistoryKeyHandler);
    this._motogpHistoryKeyHandler=null;this._motogpHistory=null;
    priorDisconnected.call(this);
  };
  Card.prototype._motogpSessionHistory=BUILD;
}
customElements.whenDefined(OVERVIEW).then(install);
})();
