'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
process.env.TZ='Europe/Stockholm';
let now=Date.parse('2026-09-20T13:46:00+02:00');
class Clock extends Date {constructor(...a){super(...(a.length?a:[now]));} static now(){return now;}}
const registry=new Map();
class Base {
  constructor(){this._today='2026-09-20';this._live={name:'Race',category:'MotoGP'};this._snapshot={day:this._today,name:'Race',category:'MotoGP',riders:[]};this._ids={race:'race'};this._hass={states:{}};this.view={innerHTML:''};this.shadowRoot={querySelector:()=>null,appendChild(){},getElementById:()=>this.view};this.hidden=false;this._filter='Total';}
  _spoiler(){return this.hidden;}
  _click(){this.legacyClicked=true;}
  _schedule(){return '<section class="panel"><div>FULL WEEKEND SCHEDULE</div><div class="cats"><button type="button" class="cat" data-category="Total" selected aria-pressed="true">Total</button><button type="button" class="cat" data-category="MotoGP" aria-pressed="false">MotoGP</button><button type="button" class="cat" data-category="Moto2" aria-pressed="false">Moto2</button><button type="button" class="cat" data-category="Moto3" aria-pressed="false">Moto3</button></div></section>';}
  _render(){this.view.innerHTML='<div class="root">OVERVIEW<div class="foot">old footer</div></div>';}
  _timing(){
    if(this.hidden)return 'HIDDEN';
    let text='<section class="nt-card"><button type="button" class="nt-head"><span class="nt-label">🏁 MotoGP · Race</span></button><div class="nt-session-record"><strong>⚡ fastest</strong></div><div class="nt-scroll"><div class="nt-table">'+
      '<div class="nt-row nt-heading"><span>POS</span><span>FÖRARE / TEAM</span><span>VARV</span><span>SENASTE</span><span>Δ FRAMFÖR</span><span>Δ LEDARE</span><span>STATUS</span></div>';
    for(const r of this._snapshot.riders)text+=`<div class="nt-row"><span>${r.position}</span>`+
      `<span class="nt-person"><span class="nt-color"></span><span class="nt-person-text"><b>${r.surname}</b><small>${r.team}</small></span></span>`+
      `<span>${r.num_lap}</span><span class="nt-fast-lap">⚡ ${r.last_lap_time} <span class="nt-pb-chip">PB</span></span>`+
      `<span>+0.200</span><span>+1.100</span><span>${r.status_name}</span></div>`;
    return text+'</div></div></section>';
  }
}
class Overview extends Base{}class Timing extends Base{}
Overview.buildInfo={version:'0.2.0-split.2'};Timing.buildInfo={version:'0.2.0-split.2'};
registry.set('ha-motogp-next-overview-card',Overview);registry.set('ha-motogp-next-timing-card',Timing);
const ctx={Date:Clock,console,document:{createElement:()=>({setAttribute(){},textContent:''})},
  customElements:{get:name=>registry.get(name),whenDefined:name=>Promise.resolve(registry.get(name))}};
(async()=>{
  vm.runInNewContext(fs.readFileSync(process.argv[2]||'/mnt/data/ha-mgp-ui.js','utf8'),ctx);
  for(let i=0;i<4;i++)await Promise.resolve();
  const r={position:3,number:93,surname:'TEST',team:'TEAM',nation:'ITA',num_lap:12,
    last_lap_time:"1'30.450",best_lap_time:"1'29.980",status_name:'RUNNING'};
  const race={state:'GP',attributes:{
     records_by_category:{
       MotoGP:[{type:'LAP_RECORD',time:'01:50.028',rider:'BEZZECCHI',year:2026,speed:176},
         {type:'POLE_LAP',time:'01:50.028',rider:'BEZZECCHI'},
         {type:'BEST_RACE_LAP',time:'01:52.561',rider:'MARQUEZ',year:2025,speed:172},
         {type:'FAKE',time:'00:00.001'}],
       Moto2:[{type:'LAP_RECORD',time:'01:43.111',rider:'MOTO2 RIDER'}],
       Moto3:[{type:'POLE_LAP',time:'01:55.222',rider:'MOTO3 RIDER'}]
     },
     start_grids:{MotoGP:[{position:8,number:93,rider:'TEST',team:'TEAM'},
    {position:1,number:1,rider:'A',team:'B'}]},sessions_all:[{category:'MotoGP',name:'Race',type:'RAC',
    date:'2026-09-20T14:00:00+00:00',status:'NOT-STARTED'}]}};
  const standing={attributes:{
    standings:[{position:1,number:93,rider:'STANDINGS',nation:'SPA',team:'Ducati Lenovo',team_color:'#CC0000',points:250}],
    standings_by_category:{
      MotoGP:[{position:1,number:93,rider:'STANDINGS',nation:'SPA',team:'Ducati Lenovo',team_color:'#CC0000',points:250}],
      Moto2:[{position:1,number:18,rider:'MOTO2 CHAMPION',nation:'ESP',team:'Speed Up Moto2',team_color:'#123ABC',points:205},
        {position:2,number:99,rider:'RUNNER UP',team:'Other Moto2 Team',team_color:'#002244',points:202.5}],
      Moto3:[{position:1,number:28,rider:'MOTO3 CHAMPION',nation:'ITA',team:'Ajo Moto3',team_color:'#012',points:190}]
    }
  }};
  const timing=new Timing();timing._snapshot.riders=[r];timing._hass.states={race};
  let h=timing._timing();
  assert.match(h,/SENASTE VARV/);assert.match(h,/FRAMFÖR/);assert.match(h,/LEDARE/);
  assert.match(h,/⏱ fastest/);assert.doesNotMatch(h,/⚡/);
  assert.match(h,/nt-last-main[\s\S]*nt-pb-chip[\s\S]*Snabbaste: 1&#39;29\.980/);
  assert.match(h,/class="nt-rider-best"[^>]*>Snabbaste: 1&#39;29\.980/,'rider fastest lap highlighted in red');
  assert.match(source,/\.nt-lap-pair>small\.nt-rider-best\{color:var\(--motogp-fastest-lap-color,var\(--error-color,#b71c1c\)\)/,'rider fastest style is red');
  assert.match(h,/▲ \+5/);assert.match(h,/RUNNING/);
  assert.match(h,/Nation: ITA[^>]*>🇮🇹/,'live timing uses supplied nationality');
  assert.match(h,/mgp-timing-records/,'records belong inside timing header');
  assert.equal((h.match(/class="mgp-timing-record-chip"/g)||[]).length,3);
  assert.match(h,/01:50\.028/);assert.match(h,/01:52\.561/);
  assert.doesNotMatch(h,/MOTO2 RIDER|MOTO3 RIDER|00:00\.001/);
  assert.ok(h.indexOf('mgp-timing-records')<h.indexOf('nt-scroll'),'chips above rider table');
  timing._snapshot.riders=[];
  assert.match(timing._timing(),/mgp-timing-records/,'chips remain when rider rows are collapsed or absent');
  timing._snapshot.riders=[r];
  timing._live.category='Moto2';timing._snapshot.category='Moto2';
  h=timing._timing();assert.match(h,/01:43\.111/);
  assert.doesNotMatch(h,/01:50\.028|01:55\.222/,'Moto2 never inherits MotoGP records');
  timing._live.category='Moto3';timing._snapshot.category='Moto3';
  h=timing._timing();assert.match(h,/01:55\.222/);
  assert.doesNotMatch(h,/01:43\.111|01:50\.028/,'Moto3 class isolation');
  timing._live.category='MotoGP';timing._snapshot.category='MotoGP';
  race.attributes.records_by_category.MotoGP=[{type:'LAP_RECORD',time:'<script>x</script>',rider:'FAKE'}];
  assert.doesNotMatch(timing._timing(),/mgp-timing-records|FAKE/,'unsafe records are hidden');
  race.attributes.records_by_category.MotoGP=[];
  assert.doesNotMatch(timing._timing(),/mgp-timing-records/,'no empty record strips');

  timing._snapshot.name='Q1';timing._live.name='Q1';
  assert.match(timing._timing(),/nt-position-empty/,'no progression in qualifying');
  timing._snapshot.name='Race';timing._live.name='Race';
  race.attributes.start_grids.MotoGP.push({position:9,number:93});
  assert.match(timing._timing(),/nt-position-empty/,'duplicate start number is ambiguous');
  race.attributes.start_grids.MotoGP.pop();
  timing.hidden=true;assert.equal(timing._timing(),'HIDDEN');timing.hidden=false;
  const overview=new Overview();overview._hass.states={race,'sensor.motogp_rider_standings':standing};overview._live=null;
  overview._render();h=overview.view.innerHTML;
  assert.match(h,/Startgrid · MotoGP Race/);assert.match(h,/P8 · #93/);
  assert.match(h,/Visa VM-ställning/);
  assert.doesNotMatch(h,/STANDINGS/,'standings must be collapsed by default');
  overview._scheduleOpen=true;
  overview._click({target:{closest:sel=>sel==='[data-motogp-standings-toggle]'?{}:null}});
  assert.equal(overview._scheduleOpen,false,'opening standings closes schedule');
  assert.doesNotMatch(overview.view.innerHTML,/Moto3 · Moto2 · MotoGP/);
  assert.match(overview.view.innerHTML,/STANDINGS/);
  assert.match(overview.view.innerHTML,/<th class="np-standing-num">Nr<\/th>/);
  assert.match(overview.view.innerHTML,/Förare \/ team/);
  assert.match(overview.view.innerHTML,/#93/);
  assert.match(overview.view.innerHTML,/Ducati Lenovo/);
  assert.match(overview.view.innerHTML,/Nation: SPA[^>]*>🇪🇸/,'VM standings country flag');
  assert.match(overview.view.innerHTML,/mgp-class-mark/,'graphical class buttons');
  const classTabs=['Moto3','Moto2','MotoGP'];
  const classTabsHtml=overview.view.innerHTML;
  for(const label of classTabs) {
    assert.match(classTabsHtml,new RegExp('data-motogp-standing="'+label+'"[^>]*role="tab"[^>]*aria-label="'+label+'"'),
      label+' has a functioning class tab');
  }
  assert.ok(classTabsHtml.indexOf('data-motogp-standing="Moto3"')<
    classTabsHtml.indexOf('data-motogp-standing="Moto2"')&&
    classTabsHtml.indexOf('data-motogp-standing="Moto2"')<
    classTabsHtml.indexOf('data-motogp-standing="MotoGP"'),
    'class tabs retain Moto3, Moto2, MotoGP order');
  assert.match(overview.view.innerHTML,/background:#CC0000/);
  assert.match(overview.view.innerHTML,/np-standing-rank top-1/);
  assert.match(overview.view.innerHTML,/np-standing-track/);
  assert.match(overview.view.innerHTML,/width:100\.0%;background:#CC0000/);
  assert.match(overview.view.innerHTML,/LEDARE/);
  assert.match(overview.view.innerHTML,/Relativ poäng/);
  assert.match(overview.view.innerHTML,/np-standing-number/);
  assert.match(overview.view.innerHTML,/np-standing-score/);
  standing.attributes.standings_by_category.MotoGP.push(...Array.from({length:11},(_,i)=>({position:i+2,number:i+40,rider:'RIDER-'+(i+2),team:'Team',points:200-i})));
  overview._render();
  assert.match(overview.view.innerHTML,/RIDER-12/,'standings show riders beyond top ten');
  assert.doesNotMatch(overview.view.innerHTML,/Moto3 · Moto2 · MotoGP/,'no duplicate category legend above class tabs');
  overview._click({target:{closest:sel=>sel==='[data-motogp-standing]'?{getAttribute:()=> 'Moto2'}:null}});
  assert.match(overview.view.innerHTML,/MOTO2 CHAMPION/);
  assert.match(overview.view.innerHTML,/Nation: ESP[^>]*>🇪🇸/);
  assert.match(overview.view.innerHTML,/#18/);
  assert.match(overview.view.innerHTML,/Speed Up Moto2/);
  assert.match(overview.view.innerHTML,/background:#123ABC/);
  assert.match(overview.view.innerHTML,/RUNNER UP/);
  assert.equal((overview.view.innerHTML.match(/class="mgp-rider-flag"/g)||[]).length,1,'never invent flag for rider with missing nation');
  assert.match(overview.view.innerHTML,/−2,5 p/);
  assert.match(overview.view.innerHTML,/width:98\.8%;background:#002244/);
  assert.match(overview.view.innerHTML,/np-standing-rank top-2/);
  assert.doesNotMatch(overview.view.innerHTML,/STANDINGS/,'never relabel MotoGP as Moto2');
  overview._click({target:{closest:sel=>sel==='[data-motogp-standing]'?{getAttribute:()=> 'Moto3'}:null}});
  assert.match(overview.view.innerHTML,/MOTO3 CHAMPION/);
  assert.match(overview.view.innerHTML,/Nation: ITA[^>]*>🇮🇹/);
  assert.match(overview.view.innerHTML,/#28/);
  assert.match(overview.view.innerHTML,/Ajo Moto3/);
  assert.match(overview.view.innerHTML,/background:#012/);
  assert.doesNotMatch(overview.view.innerHTML,/MOTO2 CHAMPION/,'class switch must not bleed scores');
  // Invalid colors must not become executable HTML/style fragments.
  standing.attributes.standings_by_category.Moto3[0].team_color='red;position:fixed';
  overview._render();
  assert.doesNotMatch(overview.view.innerHTML,/position:fixed/);
  assert.match(overview.view.innerHTML,/background:var\(--divider-color,#b4b4b4\)/);
  // A narrow card hides the visual comparison while keeping data visible.
  const source=fs.readFileSync(process.argv[2]||'/mnt/data/ha-mgp-ui.js','utf8');
  assert.match(source,/@container \(max-width:760px\)/);
  assert.match(source,/@container \(max-width:430px\)/);
  assert.match(source,/np-standing-visual\{display:none\}/);
  assert.match(source,/np-standing-track\{height:9px;width:100%;box-sizing:border-box/);
  assert.match(source,/border:1px solid var\(--divider-color,rgba\(127,127,127,\.24\)\)/);
  assert.match(source,/overflow:hidden\}/,'thin outlined bar clips team fill');
  assert.match(source,/table-layout:fixed/);
  overview._standingOpen=false;
  overview._live={category:'MotoGP',name:'Q2'};
  assert.match(overview._schedule(race,new Clock()),/Visa schema/);
  assert.doesNotMatch(overview._schedule(race,new Clock()),/FULL WEEKEND SCHEDULE/);
  overview._standingOpen=true;
  overview._click({target:{closest:sel=>sel==='[data-motogp-schedule-toggle]'?{}:null}});
  assert.equal(overview._standingOpen,false,'opening schedule closes standings');
  assert.match(overview._schedule(race,new Clock()),/Dölj schema[\s\S]*FULL WEEKEND SCHEDULE/);
  overview._scheduleOpen=false;
  overview._live=null;
  assert.match(overview._schedule(race,new Clock()),/FULL WEEKEND SCHEDULE/);
  assert.match(overview._schedule(race,new Clock()),/mgp-class-mark/,'schedule filter buttons contain graphics');
  assert.match(overview._schedule(race,new Clock()),/🏁 ALL/,'schedule has graphic all-classes button');
  assert.match(overview._schedule(race,new Clock()),/data-category="Moto2"/,'original category action remains');
  now=Date.parse('2026-09-20T13:43:00+02:00');overview._render();
  assert.doesNotMatch(overview.view.innerHTML,/Startgrid · MotoGP Race/,'17 min before start');
  now=Date.parse('2026-09-20T13:46:00+02:00');overview.hidden=true;overview._render();
  assert.doesNotMatch(overview.view.innerHTML,/Startgrid|VM-ställning/,'no spoiler bypass');
  console.log('PASS: premium leaderboard ranks, category-specific team colors, points comparison, numeric gap, compact layout, live schedule and spoiler');
})().catch(e=>{console.error(e);process.exitCode=1;});
