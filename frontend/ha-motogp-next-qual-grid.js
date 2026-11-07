/* MotoGP Next qualifying start-grid companion, scoped to the timing card. */
(() => {
'use strict';
const TAG='ha-motogp-next-timing-card',REQUIRED='0.2.0-split.2';
const BUILD='qual-grid-20261107-01';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const css="\n  .nt-qual-layout{display:grid;grid-template-columns:minmax(0,1fr);min-width:0}\n  .nt-qual-main{min-width:0}\n  .nt-qual-aside{border-top:1px solid var(--divider-color,#ddd);padding:10px;\n    background:var(--ha-card-background,var(--card-background-color,#fff))}\n  .nt-qual-title{font-size:12px;font-weight:900;margin:0 0 7px}\n  .nt-qual-caption{font-size:10px;color:var(--secondary-text-color);margin:0 0 9px}\n  .nt-qual-rows{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:5px}\n  .nt-qual-item{display:flex;align-items:center;gap:7px;padding:6px 7px;border-radius:7px;\n    border:1px solid var(--divider-color,#ddd);min-width:0;font-size:11px}\n  .nt-qual-item b{flex:none;font-variant-numeric:tabular-nums}\n  .nt-qual-item span{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n  @container (min-width:1050px){\n    .nt-qual-layout{grid-template-columns:minmax(0,1fr) 248px;align-items:start}\n    .nt-qual-aside{border-top:0;border-left:1px solid var(--divider-color,#ddd)}\n    .nt-qual-rows{grid-template-columns:1fr}\n    .nt-qual-main .nt-table{min-width:0!important}\n    .nt-qual-main .nt-row{grid-template-columns:28px minmax(120px,1.4fr) 34px 112px 60px 61px 53px!important;\n      gap:6px!important;padding:8px 7px!important}\n    .nt-qual-main .nt-person-text small{font-size:10px}\n  }";
const validPosition=v=>Number.isInteger(Number(v))&&Number(v)>0;
function companion(card){
  const live=card._live,snapshot=card._snapshot;
  if(card._spoiler()||!live||!snapshot||snapshot.day!==card._today||
      !/^Q[12]$/i.test(String(live.name||''))||
      snapshot.category!==live.category)return '';
  const race=card._hass?.states?.[card._ids.race],grids=race?.attributes?.start_grids||{};
  const official=grids[snapshot.category];
  let entries=[],label='',caption='';
  if(Array.isArray(official)&&official.length){
    const rows=official.filter(r=>r&&validPosition(r.position)&&String(r.number??'').trim());
    const positions=rows.map(r=>Number(r.position));
    const numbers=rows.map(r=>String(r.number));
    if(rows.length>=2&&new Set(positions).size===rows.length&&new Set(numbers).size===rows.length){
      entries=rows.slice().sort((a,b)=>Number(a.position)-Number(b.position))
        .map(r=>({position:r.position,number:r.number,name:r.rider||'—'}));
      label='🏁 Publicerad startgrid';
      caption='Från evenemangets grid-API · inte live-kvalplaceringar';
    }
  }
  if(!entries.length){
    entries=(snapshot.riders||[]).filter(r=>r&&validPosition(r.position)&&
      String(r.last_lap_time||'').trim()&&String(r.last_lap_time)!=='—')
      .slice().sort((a,b)=>Number(a.position)-Number(b.position))
      .map(r=>({position:r.position,number:r.number,name:r.surname||r.shortname||'—'}));
    label='⏱ Kvalordning · preliminär';
    caption='Startgrid fastställs efter kvalet; detta är ännu inte en startgrid';
  }
  if(!entries.length)return '<aside class="nt-qual-aside" aria-label="Startgrid">'+
    '<div class="nt-qual-title">🏁 Startgrid</div>'+
    '<div class="nt-qual-caption">Inväntar publicerade kvalresultat.</div></aside>';
  return '<aside class="nt-qual-aside" aria-label="Kval och startgrid">'+
    '<div class="nt-qual-title">'+esc(label)+'</div><div class="nt-qual-caption">'+
    esc(caption)+'</div><div class="nt-qual-rows">'+entries.slice(0,32).map(r=>
      '<div class="nt-qual-item"><b>P'+esc(r.position)+'</b><span>#'+esc(r.number??'—')+
      ' · '+esc(r.name)+'</span></div>').join('')+'</div></aside>';
}
function install(){
  const Timing=customElements.get(TAG);
  if(Timing?.buildInfo?.version!==REQUIRED){console.error('[MotoGP qualifying grid] Unexpected timing card');return;}
  if(Timing.prototype._motogpQualGrid)return;
  const original=Timing.prototype._timing;
  Timing.prototype._timing=function(){
    let html=original.call(this);
    const aside=companion(this);
    if(!aside)return html;
    const marker='<div class="nt-scroll">';
    const suffix='</div></div></section>';
    if(!html.includes(marker)||!html.endsWith(suffix))return html;
    html=html.replace(marker,'<div class="nt-qual-layout"><div class="nt-qual-main">'+marker);
    return html.slice(0,-suffix.length)+
      '</div></div></div>'+aside+'</div></section>';
  };
  const prior=Timing.prototype._render;
  Timing.prototype._render=function(){
    prior.call(this);
    if(!this.shadowRoot?.querySelector?.('[data-motogp-qual-grid-style]')){
      const style=document.createElement('style');
      style.setAttribute('data-motogp-qual-grid-style','');
      style.textContent=css;
      this.shadowRoot?.appendChild?.(style);
    }
  };
  Timing.prototype._motogpQualGrid=BUILD;
}
customElements.whenDefined(TAG).then(install);
})();
