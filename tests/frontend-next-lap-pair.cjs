'use strict';
/* Regression: the Next mobile rider-lap extension can install BEFORE the
 * UI-preview enhancer. It enriches .nt-row with accessibility attributes.
 * Fastest-lap rendering must work with those exact real-world row tags.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const ui=fs.readFileSync(process.argv[2]||'frontend/ha-motogp-next-ui-preview.js','utf8');
const mobile=fs.readFileSync(process.argv[3]||'frontend/ha-motogp-next-mobile-laps.js','utf8');
let styleCount=0;
const registry=new Map();
class Base{
  static buildInfo={version:'0.2.0-split.2'};
  constructor(){
    this._today='2026-11-07';
    this._live={name:'Sprint',category:'MotoGP'};
    this._snapshot={day:this._today,name:'Sprint',category:'MotoGP',riders:[
      {position:1,rider_id:'8688',number:'72',surname:'BEZZECCHI',team:'Aprilia',
        num_lap:4,last_lap:4,last_lap_time:"1'54.999",
        best_lap_number:2,best_lap_time:"1'54.280",status_name:'CL'},
      {position:2,rider_id:'8146',number:'89',surname:'MARTIN',team:'Aprilia',
        num_lap:4,last_lap:4,last_lap_time:"1'52.426",
        best_lap_number:4,best_lap_time:"1'52.426",status_name:'CL'},
      {position:-1,rider_id:'7777',number:'77',surname:'UNKNOWN',team:'Test',
        num_lap:0,last_lap:0,last_lap_time:'0.000',
        best_lap_number:null,best_lap_time:'',status_name:'NS'}
    ]};
    this._ids={race:'race'};
    this._hass={states:{race:{attributes:{start_grids:{MotoGP:[]}}}}};
    this.shadowRoot={querySelector:()=>null,appendChild:()=>styleCount++,
      addEventListener(){},removeEventListener(){}};
    this._standingTab='MotoGP';
  }
  _spoiler(){return Boolean(this.hidden);}
  _schedule(){return '';}
  _click(){}
  _render(){}
  connectedCallback(){}
  disconnectedCallback(){}
  _timing(){
    if(this.hidden)return 'HIDDEN';
    let html='<section class="nt-card"><div class="nt-scroll"><div class="nt-table">'+
      '<div class="nt-row nt-heading"><span>POS</span><span>FÖRARE / TEAM</span>'+
      '<span>VARV</span><span>SENASTE</span><span>Δ FRAMFÖR</span>'+
      '<span>Δ LEDARE</span><span>STATUS</span></div>';
    for(const r of this._snapshot.riders){
      const p=r.position>0?r.position:'—',unclassified=r.position>0?'':' unclassified';
      const valid=r.num_lap>0;
      const last=valid?r.last_lap_time:'—';
      const encodedLast=String(last).replace(/'/g,'&#39;');
      const chip=r.best_lap_time===r.last_lap_time&&valid?
        '<span class="nt-pb-chip">PB</span>':'';
      const mark=chip?'<span class="nt-personal-best">'+encodedLast+' '+chip+'</span>':
        '<span>'+encodedLast+'</span>';
      html+='<div class="nt-row'+unclassified+'"><span>'+p+'</span>'+
        '<span class="nt-person"><span class="nt-color"></span>'+
        '<span class="nt-person-text"><b>'+r.surname+'</b><small>'+r.team+
        '</small></span></span><span>'+(valid?r.num_lap:'—')+'</span>'+mark+
        '<span>0.100</span><span>0.250</span><span>'+r.status_name+'</span></div>';
    }
    return html+'</div></div></section>';
  }
}
class Overview extends Base {}
class Timing extends Base {}
registry.set('ha-motogp-next-overview-card',Overview);
registry.set('ha-motogp-next-timing-card',Timing);
const context={
  console,
  document:{createElement:()=>({setAttribute(){},textContent:''})},
  customElements:{get:name=>registry.get(name),whenDefined:name=>Promise.resolve(registry.get(name))}
};
(async()=>{
  // Keep actual shipped source order: UI preview occurs before mobile, but
  // mobile's .then() gets a microtask ahead of UI's Promise.all(...).then().
  vm.runInNewContext(ui,context);
  vm.runInNewContext(mobile,context);
  for(let i=0;i<7;i++)await Promise.resolve();
  assert.ok(Timing.prototype._motogpMobileLaps,'mobile popup extension installed');
  assert.ok(Timing.prototype._motogpUiPreview,'UI preview extension installed');
  const card=new Timing();
  let html=card._timing();
  assert.match(html,/data-motogp-rider-id="8688"/,'row is clickable despite enhancements');
  assert.match(html,/data-motogp-rider-id="8146"/);
  assert.match(html,/data-motogp-rider-id="7777"/,'unclassified rider is still clickable');
  assert.match(html,/nt-lap-pair/,'fastest/last duo rendered on enriched rows');
  assert.match(html,/nt-last-main[\s\S]*1&#39;54\.999/);
  assert.match(html,/Snabbaste: 1&#39;54\.280/,'fastest lap independent of last lap');
  assert.match(html,/Snabbaste: 1&#39;52\.426/,'latest PB is also displayed below');
  assert.match(html,/nt-pb-chip[\s\S]*Snabbaste: 1&#39;52\.426/,'green PB styling retained');
  assert.match(html,/Snabbaste: —/,'never invent a best lap for unclassified rider');
  assert.match(html,/nt-status-pair/,'position and CL status enhancement still works');
  assert.equal((html.match(/class="nt-lap-pair"/g)||[]).length,3,'one duo per rider');
  assert.equal((html.match(/data-motogp-rider-id=/g)||[]).length,3,'one popup per rider');
  assert.match(ui,/nt-lap-pair>small/);
  card.hidden=true;
  assert.equal(card._timing(),'HIDDEN','spoiler mode hides all fastest times');
  card.hidden=false;card._snapshot.day='2026-11-06';
  assert.doesNotMatch(card._timing(),/nt-lap-pair|data-motogp-rider-id=/,
    'previous-day snapshot is not enriched');
  assert.ok(styleCount>0,'style injected');
  console.log('PASS: UI vs mobile microtask ordering, clickable Sprint rows, last+fastest, PB, unclassified, spoiler and stale-day guards');
})().catch(err=>{console.error(err);process.exitCode=1;});
