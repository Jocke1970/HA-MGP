/* HA-MGP: on-demand API utility panel in the existing overview card.
 * Renders BELOW the separate timing/startgrid card (not between overview and timing).
 * No automatic API traffic; commands use the authenticated HA WebSocket.
 */
(() => {
'use strict';
const TAG='ha-motogp-next-timing-card', BUILD='api-utility-20261122-02';
const COMMAND='motogp_sensor/api_probe';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&#39;'}[c]));
const CATEGORIES=['MotoGP','Moto2','Moto3'];
const STYLE=`
.mgp-api-utility{margin:12px 0;padding:10px 14px;border:1px solid var(--divider-color,#ccc);border-radius:12px;font-size:12px}
.mgp-api-utility button,.mgp-api-utility select{font:inherit;color:inherit;background:var(--card-background-color,#fff);border:1px solid var(--divider-color,#ccc);border-radius:7px;padding:7px 10px;cursor:pointer}
.mgp-api-utility button:disabled{opacity:.5;cursor:default}
.mgp-api-utility-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:space-between}
.mgp-api-utility-sub{font-size:11px;color:var(--secondary-text-color);margin:6px 0 10px}
.mgp-api-utility-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px}
.mgp-api-utility-grid>div{min-width:0;overflow-wrap:anywhere;background:var(--secondary-background-color,#8881);padding:7px;border-radius:7px}
.mgp-api-utility-grid b{display:block;margin-bottom:4px}
.mgp-api-utility-controls{display:flex;gap:7px;flex-wrap:wrap;margin:10px 0;align-items:center}
.mgp-api-utility-controls select{max-width:100%}
.mgp-api-utility pre{white-space:pre-wrap;overflow-wrap:anywhere;overflow:auto;max-height:340px;border:1px solid var(--divider-color,#ccc);border-radius:7px;padding:12px;font-size:11px;line-height:1.4}
.mgp-api-utility-status{font-size:11px;margin:7px 0}
`;
function stateInfo(card){
 const states=card._hass?.states||{},race=states[card._ids?.race||'sensor.motogp_next_race'];
 const status=states[card._ids?.status||'sensor.motogp_session_status'];
 const attrs=race?.attributes||{},all=Array.isArray(attrs.sessions_all)?attrs.sessions_all:[];
 const category=CATEGORIES.includes(card._mgpUtilityCategory)?card._mgpUtilityCategory:'MotoGP';
 const sessions=all.filter(s=>s&&s.category===category&&s.id&&s.category_id&&s.source!=='broadcast_schedule');
 const selected=sessions.find(s=>String(s.id)===String(card._mgpUtilitySession))||sessions[0]||null;
 return {race,status,attrs,category,sessions,selected};
}
function render(card){
 const {race,status,attrs,category,sessions,selected}=stateInfo(card);
 const spoiler=String(card._hass?.states?.['switch.motogp_no_spoiler']?.state||'off')==='on';
 const expanded=card._mgpUtilityOpen===true;
 const cached=card._mgpUtilityResponse;
 const raw=!spoiler&&cached&&String(cached.context?.event_uuid||'')===String(attrs.event_id||'')?cached:null;
 const context=raw?.context||{};
 const option=(v,label)=>'<option value="'+esc(v)+'"'+(category===v?' selected':'')+'>'+esc(label)+'</option>';
 const sessOptions=sessions.length?sessions.map(s=>
   '<option value="'+esc(s.id)+'"'+(selected&&String(selected.id)===String(s.id)?' selected':'')+'>'+
   esc(s.name||s.type||'Session')+' · '+esc(String(s.id).slice(0,18))+'</option>').join(''):
   '<option value="">Inga verifierade Results-sessioner</option>';
 const id=(name,value)=>'<div><b>'+esc(name)+'</b>'+esc(value||'—')+'</div>';

 const json=raw?JSON.stringify(raw,null,2):'';
 const actionButtons=[
   ['ids','Visa alla ID:n'],['live','Live timing'],
   ['broadcast','Broadcast-schema'],['sessions','Results-sessioner'],
   ['grid','Startgrid'],['classification','Klassificering']
 ].map(([action,label])=>{
   const missing=(action==='classification'&&!selected?.id)||(action==='grid'&&!selected?.category_id);
   return '<button type="button" data-mgp-util-action="'+action+'"'+(spoiler||card._mgpUtilityBusy||missing?' disabled':'')+'>'+label+'</button>';
 }).join('');
 return '<section class="mgp-api-utility" aria-label="API-diagnostik">'+
  '<div class="mgp-api-utility-head"><strong>🔧 API-verktyg</strong>'+
  '<button type="button" data-mgp-util-toggle aria-expanded="'+expanded+'">'+(expanded?'Dölj':'Visa')+'</button></div>'+
  (expanded?'<p class="mgp-api-utility-sub">Endast manuella, läsande anrop via HA. Numeriska live-ID och Results-UUID är olika identifierare.</p>'+
    '<div class="mgp-api-utility-grid">'+
       id('GP · Results UUID',attrs.event_id)+
       id('Live · klass',status?.attributes?.category)+
       id('Live · pass',status?.attributes?.session_shortname)+
       id('Live · status',status?.attributes?.session_status_id)+
       id('Säsong · UUID',context.season_id)+
       id('Results · klass UUID',selected?.category_id||context.results_category_uuid)+
       id('Live · sessions-ID',context.live_session_id)+
       id('Results · sessions-UUID',selected?.id)+
    '</div>'+
    '<div class="mgp-api-utility-controls"><label>Klass <select data-mgp-util-category>'+
      CATEGORIES.map(v=>option(v,v)).join('')+'</select></label>'+
      '<label>Results-session <select data-mgp-util-session>'+sessOptions+'</select></label></div>'+
    '<div class="mgp-api-utility-controls">'+actionButtons+'</div>'+
    '<div class="mgp-api-utility-status" role="status">'+esc(spoiler?'No Spoiler aktivt – API-verktyget är låst.':
      card._mgpUtilityBusy?'Hämtar API-svar …':card._mgpUtilityError||(
      raw?'Svar: '+raw.action+' · '+raw.fetched_at:'Välj anrop för att se API-svaret.'))+'</div>'+
    (raw?'<div class="mgp-api-utility-controls"><button type="button" data-mgp-util-copy>Kopiera JSON</button></div>'+
      '<pre data-mgp-util-json>'+esc(json)+'</pre>':''):'')+'</section>';
}
function install(){
 const Card=customElements.get(TAG);
 if(!Card||Card.prototype._mgpApiUtility)return;
 const oldRender=Card.prototype._render,oldClick=Card.prototype._click;
 Card.prototype._render=function(...args){
   const result=oldRender.apply(this,args);
   if(!this.shadowRoot)return result;
   if(!this.shadowRoot.querySelector?.('[data-mgp-util-style]')){
     const style=document.createElement('style');style.setAttribute('data-mgp-util-style','');
     style.textContent=STYLE;this.shadowRoot.appendChild(style);
   }
   const view=this.shadowRoot.getElementById?.('app');
   if(view?.insertAdjacentHTML)view.insertAdjacentHTML('beforeend',render(this));
   return result;
 };
 Card.prototype._click=function(e){
   const btn=e?.target?.closest?.('[data-mgp-util-toggle],[data-mgp-util-action],[data-mgp-util-copy]');
   if(!btn)return oldClick.call(this,e);
   if(btn.hasAttribute('data-mgp-util-toggle')){
     this._mgpUtilityOpen=!this._mgpUtilityOpen;this._render();return;
   }
   if(btn.hasAttribute('data-mgp-util-copy')){
     const text=this._mgpUtilityResponse?JSON.stringify(this._mgpUtilityResponse,null,2):'';
     if(!text)return;
     const fallback=()=>{
       const field=document.createElement('textarea');
       field.value=text;
       field.setAttribute('readonly','');
       field.style.position='fixed';
       field.style.left='-9999px';
       document.body.appendChild(field);
       try{
         field.focus();field.select();
         return document.execCommand?.('copy')===true;
       }finally{field.remove();}
     };
     const done=ok=>{
       this._mgpUtilityError=ok?'JSON kopierad.':'Kopiering blockerad – markera JSON-texten och kopiera manuellt.';
       this._render();
     };
     if(navigator.clipboard?.writeText){
       Promise.resolve().then(()=>navigator.clipboard.writeText(text))
         .then(()=>done(true)).catch(()=>{try{done(fallback());}catch(_){done(false);}});
     }else{
       try{done(fallback());}catch(_){done(false);}
     }
     return;
   }
   const action=btn.getAttribute('data-mgp-util-action');
   if(!action||this._mgpUtilityBusy)return;
   const context=stateInfo(this);
   this._mgpUtilityBusy=true;this._mgpUtilityError='';this._render();
   const request={type:COMMAND,action,category:context.category};
   if(action==='classification')request.session_uuid=String(context.selected?.id||'');
   Promise.resolve(this._hass?.callWS?.(request)).then(reply=>{
     if(!reply)throw new Error('WebSocket-anslutning saknas');
     this._mgpUtilityResponse=reply;
   }).catch(err=>{
     this._mgpUtilityError=String(err?.message||err).slice(0,220);
   }).finally(()=>{this._mgpUtilityBusy=false;this._render();});
 };
 const priorConnected=Card.prototype.connectedCallback;
 Card.prototype.connectedCallback=function(...args){
   priorConnected?.apply(this,args);
   if(!this._mgpUtilityListener){
     this.shadowRoot?.addEventListener('change',e=>{
       if(e.target?.matches?.('[data-mgp-util-category]')){
         this._mgpUtilityCategory=e.target.value;
         this._mgpUtilitySession='';
         this._mgpUtilityResponse=null;
         this._render();
       }else if(e.target?.matches?.('[data-mgp-util-session]')){
         this._mgpUtilitySession=e.target.value;
         this._mgpUtilityResponse=null;
         this._render();
       }
     });
     this._mgpUtilityListener=true;
   }
 };
 Card.prototype._mgpApiUtility=BUILD;
}
customElements.whenDefined(TAG).then(install);
})();
