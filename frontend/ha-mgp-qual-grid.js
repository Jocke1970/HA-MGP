/* MotoGP Next qualifying grid: echelon 3-3-3 positions, Q1 tail included.
 * 2026 FIM grid: Q2=12, Q1 losers P13+ (MotoGP); Q2=18,
 * Q1 losers P19+ (Moto2/Moto3). Never label provisional data official.
 */
(() => {
'use strict';
const TAG='ha-motogp-next-timing-card',REQUIRED='0.2.0-split.2';
const BUILD='qual-grid-20261107-02';
const CSS="\n  .nt-qual-layout{display:grid;grid-template-columns:minmax(0,1fr);min-width:0}\n  .nt-qual-main{min-width:0}\n  .nt-qual-aside{min-width:0;border-top:1px solid var(--divider-color,#ddd);padding:11px;\n    background:var(--ha-card-background,var(--card-background-color,#fff))}\n  .nt-qual-title{font-size:12px;font-weight:900;margin:0 0 5px}\n  .nt-qual-caption{font-size:10px;color:var(--secondary-text-color);line-height:1.4;margin:0 0 10px}\n  .nt-qual-start{font-size:9px;text-transform:uppercase;letter-spacing:.12em;font-weight:850;\n    text-align:center;color:var(--secondary-text-color);padding:5px 0 8px;\n    border-bottom:2px solid var(--divider-color,#ddd);margin-bottom:10px}\n  .nt-qual-wave{display:flex;flex-direction:column;gap:5px;padding:0 0 10px;margin-bottom:10px;\n    border-bottom:1px dashed var(--divider-color,rgba(127,127,127,.35))}\n  .nt-qual-item{display:flex;align-items:center;gap:7px;min-width:0;min-height:36px;\n    padding:7px 9px;border-radius:8px;border:1px solid var(--divider-color,#ddd);\n    background:var(--ha-card-background,var(--card-background-color,#fff))}\n  .nt-qual-slot-1{margin-right:40px}\n  .nt-qual-slot-2{margin-left:20px;margin-right:20px}\n  .nt-qual-slot-3{margin-left:40px}\n  .nt-qual-p{flex:none;display:grid;place-items:center;width:25px;height:25px;border-radius:6px;\n    background:var(--secondary-background-color,rgba(127,127,127,.1));font-size:10px;\n    font-weight:900;font-variant-numeric:tabular-nums}\n  .nt-qual-color{width:3px;min-height:27px;align-self:stretch;flex:none;border-radius:3px;\n    background:var(--divider-color,#aaa)}\n  .nt-qual-person{min-width:0;display:flex;flex-direction:column;gap:2px}\n  .nt-qual-person strong{min-width:0;font-size:11px;font-weight:850;white-space:nowrap;\n    overflow:hidden;text-overflow:ellipsis}\n  .nt-qual-person small{font-size:9px;color:var(--secondary-text-color);white-space:nowrap;\n    overflow:hidden;text-overflow:ellipsis}\n  .nt-qual-group{margin:13px 0 9px;font-size:10px;font-weight:850;color:var(--secondary-text-color)}\n  .nt-qual-empty{padding:10px 6px;font-size:11px;color:var(--secondary-text-color)}\n  @container (min-width:940px){\n    .nt-qual-layout{grid-template-columns:minmax(0,1fr) 260px;align-items:start}\n    .nt-qual-aside{border-top:0;border-left:1px solid var(--divider-color,#ddd)}\n    .nt-qual-main .nt-table{min-width:0!important}\n    .nt-qual-main .nt-row{grid-template-columns:28px minmax(120px,1.4fr) 34px 112px 60px 61px 53px!important;\n      gap:6px!important;padding:8px 7px!important}\n    .nt-qual-main .nt-person-text small{font-size:10px}\n  }\n  @container (max-width:315px){\n    .nt-qual-slot-1{margin-right:20px}\n    .nt-qual-slot-2{margin-left:10px;margin-right:10px}\n    .nt-qual-slot-3{margin-left:20px}\n    .nt-qual-item{padding:6px}\n  }\n";
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const limits={MotoGP:12,Moto2:18,Moto3:18};
const number=v=>{
  const text=String(v??'').trim().replace(/^#/,'');
  return /^\d{1,3}$/.test(text)&&Number(text)>0?String(Number(text)):'';
};
const position=v=>{
  const n=Number(v);
  return v!==null&&v!==undefined&&String(v).trim()!==''&&Number.isInteger(n)&&n>=1&&n<=60?n:null;
};
const color=v=>{
  const c=String(v??'').trim();
  return /^#?[0-9a-f]{6}$/i.test(c)?'#'+c.replace(/^#/,''):'var(--divider-color,#aaa)';
};
function nameOf(r){
  return String(r?.surname||r?.shortname||r?.rider||r?.firstname||'').trim();
}
function validOfficial(rows,category,knownTail=[]){
  const min=limits[category];
  if(!min||!Array.isArray(rows)||rows.length<=min)return []; // Q1 tail must be present
  const seenPos=new Set(),seenNumbers=new Set(),output=[];
  for(const r of rows){
    const p=position(r?.position),num=number(r?.number);
    if(!p||!num||!nameOf(r)||seenPos.has(p)||seenNumbers.has(num))return [];
    seenPos.add(p);seenNumbers.add(num);
    output.push({position:p,number:num,name:nameOf(r),team:r.team||'',color:r.color||''});
  }
  if(output.length!==Math.max(...seenPos)||Math.min(...seenPos)!==1)return [];
  if(knownTail.some(r=>!output.some(o=>o.position===r.position&&o.number===r.number)))
    return []; // incomplete or mismatched official grid must remain provisional
  return output.sort((a,b)=>a.position-b.position);
}
function currentRows(snapshot){
  const seenPos=new Set(),seenNumbers=new Set(),out=[];
  for(const r of snapshot?.riders||[]){
    const p=position(r?.position),num=number(r?.number);
    const time=String(r?.last_lap_time||'').trim();
    if(!p||!num||!nameOf(r)||!time||time==='—'||seenPos.has(p)||seenNumbers.has(num))continue;
    seenPos.add(p);seenNumbers.add(num);
    out.push({position:p,number:num,name:nameOf(r),team:r.team||'',color:r.color||''});
  }
  return out.sort((a,b)=>a.position-b.position);
}
function q1Tail(race,category,leading){
  const rows=race?.attributes?.qualifying_q1_eliminated?.[category];
  if(!Array.isArray(rows)||!rows.length)return [];
  const min=limits[category],out=[],seenP=new Set(),seenN=new Set();
  const leadingNumbers=new Set(leading.map(r=>r.number));
  for(const r of rows){
    const p=position(r?.position),num=number(r?.number);
    if(!p||p<=min||!num||!nameOf(r)||seenP.has(p)||seenN.has(num)||
        leadingNumbers.has(num))return []; // no duplicates or cross-class aliases
    out.push({position:p,number:num,name:nameOf(r),team:r.team||'',
      color:r.color||'',q1:true});
    seenP.add(p);seenN.add(num);
  }
  return out.sort((a,b)=>a.position-b.position);
}
function waves(rows){
  const sections=new Map();
  for(const r of rows){
    const idx=Math.floor((r.position-1)/3);
    if(!sections.has(idx))sections.set(idx,[]);
    sections.get(idx).push(r);
  }
  return Array.from(sections.entries()).sort((a,b)=>a[0]-b[0]).map(([,wave])=>
    '<div class="nt-qual-wave">'+wave.map(r=>{
      const slot=((r.position-1)%3)+1;
      return '<div class="nt-qual-item nt-qual-slot-'+slot+'">'+
        '<span class="nt-qual-p">'+esc('P'+r.position)+'</span>'+
        '<span class="nt-qual-color" style="background:'+color(r.color)+'"></span>'+
        '<span class="nt-qual-person"><strong>#'+esc(r.number)+' · '+esc(r.name)+'</strong>'+
        (r.team?'<small>'+esc(r.team)+'</small>':'')+'</span></div>';
    }).join('')+'</div>').join('');
}
function companion(card){
  const snap=card._snapshot,live=card._live;
  if(card._spoiler()||!snap||snap.day!==card._today||
      !limits[snap.category]||live&&snap.category!==live.category)return '';
  const session=String(live?.name||snap.name||'').toUpperCase().trim();
  const isQ1=session==='Q1',isQ2=session==='Q2';
  const isRace=/^(RACE|SPRINT)$/i.test(session);
  if(!isQ1&&!isQ2&&!isRace)return '';
  const race=card._hass?.states?.[card._ids.race];
  const q1Known=q1Tail(race,snap.category,[]);
  const official=validOfficial(
    race?.attributes?.start_grids?.[snap.category],snap.category,q1Known
  );
  let top=[],tail=[],label='',caption='';
  if(official.length){
    top=official;label='🏁 Publicerad startgrid';
    caption='Evenemangets publicerade grid · ordningen kan ändras före start';
  }else if(isQ1||isQ2){
    top=currentRows(snap);
    if(isQ2)tail=q1Tail(race,snap.category,top);
    label='⏱ Kvalordning · preliminär';
    caption=isQ1?'Q1-tider · inga startplatser fastställda':
      'Q2-ordning + Q1-utslagna · ännu inte officiell startgrid';
  }else{return '';} // never invent a race grid
  if(!top.length&&!tail.length)return '<aside class="nt-qual-aside" aria-label="Startgrid">'+
    '<div class="nt-qual-title">🏁 Startgrid</div>'+
    '<div class="nt-qual-empty">Inväntar verifierade kvalresultat.</div></aside>';
  let content='<div class="nt-qual-start">Start / poleposition</div>'+waves(top);
  if(tail.length){
    const label= snap.category==='MotoGP'?'Q1 · ej vidare · från P13':
      'Q1 · ej vidare · från P19';
    content+='<div class="nt-qual-group">'+esc(label)+'</div>'+waves(tail);
  }else if(isQ2&&!official.length){
    content+='<div class="nt-qual-empty">Q1-utslagnas platser inväntar verifierat Q1-resultat.</div>';
  }
  return '<aside class="nt-qual-aside" aria-label="Kval och startgrid">'+
    '<div class="nt-qual-title">'+esc(label)+'</div>'+
    '<div class="nt-qual-caption">'+esc(caption)+'</div>'+
    '<div class="nt-qual-rows">'+content+'</div></aside>';
}
function install(){
  const Timing=customElements.get(TAG);
  if(Timing?.buildInfo?.version!==REQUIRED){console.error('[MotoGP qualifying grid] Unexpected timing card');return;}
  if(Timing.prototype._motogpQualGrid)return;
  const original=Timing.prototype._timing;
  Timing.prototype._timing=function(){
    const html=original.call(this);
    const aside=companion(this);
    if(!aside)return html;
    const marker='<div class="nt-scroll">',suffix='</div></div></section>';
    if(!html.includes(marker)||!html.endsWith(suffix))return html;
    const middle=html.replace(marker,'<div class="nt-qual-layout"><div class="nt-qual-main">'+marker);
    return middle.slice(0,-suffix.length)+'</div></div></div>'+aside+'</div></section>';
  };
  const previous=Timing.prototype._render;
  Timing.prototype._render=function(){
    previous.call(this);
    if(!this.shadowRoot?.querySelector?.('[data-motogp-qual-grid-style]')){
      const style=document.createElement('style');
      style.setAttribute('data-motogp-qual-grid-style','');
      style.textContent=CSS;
      this.shadowRoot?.appendChild?.(style);
    }
  };
  Timing.prototype._motogpQualGrid=BUILD;
}
customElements.whenDefined(TAG).then(install);
})();
