'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const code=fs.readFileSync(process.argv[2]||'frontend/ha-mgp-qual-grid.js','utf8');
let styles=0;
const rider=(position,number,surname,time="1'50.000",team='Verified Racing')=>
  ({position,number,surname,last_lap_time:time,team,color:'#AA1144'});
const tail=(position,number,name)=>({position,number,rider:name,team:'Verified Racing',color:'#0088AA'});
class Timing{
  static buildInfo={version:'0.2.0-split.2'};
  constructor(){
    this._ids={race:'sensor.motogp_next_race'};this._today='2026-11-07';
    this._live={name:'Q2',category:'Moto2'};
    this._snapshot={name:'Q2',day:this._today,category:'Moto2',
      riders:[rider(2,93,'MARQUEZ'),rider(1,72,'BEZZECCHI')]};
    this._hass={states:{'sensor.motogp_next_race':{
      attributes:{start_grids:{},qualifying_q1_eliminated:{Moto2:[
        tail(19,96,'HOLGADO'),tail(20,95,'VEIJER'),tail(21,13,'VIETTI')
      ]}}
    }}};
    this.spoiler=false;
    this.shadowRoot={querySelector:()=>null,appendChild:()=>{styles++}};
  }
  _spoiler(){return this.spoiler;}
  _timing(){return '<section class="nt-card"><div class="nt-scroll"><div class="nt-table">'+
    '<div class="nt-row">RIDER</div></div></div></section>';}
  _render(){}
}
const context={customElements:{get:()=>Timing,whenDefined:()=>Promise.resolve()},console,
  document:{createElement:()=>({setAttribute(){},textContent:''})}};
const render=t=>t._timing(),attrs=t=>t._hass.states['sensor.motogp_next_race'].attributes;
const published=(n,category='Moto2')=>Array.from({length:n},(_,i)=>({
  position:i+1,number:101+i,rider:'RIDER '+(i+1),team:'Team '+category
}));
(async()=>{
  vm.runInNewContext(code,context);
  for(let i=0;i<4;i++)await Promise.resolve();
  const t=new Timing();

  let html=render(t);
  assert.match(html,/Kvalordning · preliminär/);
  assert.match(html,/Q2-ordning \+ Q1-utslagna/);
  assert.match(html,/Q1 · ej vidare · från P19/);
  assert.ok(html.indexOf('P1')<html.indexOf('P2'));
  assert.ok(html.indexOf('P19')<html.indexOf('P20'));
  assert.ok(html.indexOf('P20')<html.indexOf('P21'));
  assert.match(html,/HOLGADO/);
  assert.match(html,/VEIJER/);
  assert.match(html,/nt-qual-slot-1/);
  assert.match(html,/nt-qual-slot-2/);
  assert.match(html,/nt-qual-slot-3/);
  assert.match(html,/nt-qual-wave/);
  assert.match(code,/margin-left:20px/);
  assert.match(code,/margin-left:40px/);
  assert.match(code,/@container \(min-width:940px\)/);
  assert.match(code,/@container \(max-width:315px\)/);
  assert.doesNotMatch(html,/Publicerad startgrid/);
  t._render();assert.equal(styles,1);

  // Partially returned event grid must not hide known Q1 tail.
  attrs(t).start_grids.Moto2=published(18);
  html=render(t);
  assert.match(html,/Kvalordning · preliminär/);
  assert.match(html,/P19/);

  // Even an apparently complete official grid is rejected when its Q1 tail
  // contradicts the verified Q1 classification.
  attrs(t).start_grids.Moto2=published(21);
  html=render(t);
  assert.match(html,/Kvalordning · preliminär/);

  // With all the verified eliminations at their actual positions the
  // event's full official grid is authoritative.
  attrs(t).start_grids.Moto2[18]={position:19,number:96,rider:'Daniel Holgado'};
  attrs(t).start_grids.Moto2[19]={position:20,number:95,rider:'Collin Veijer'};
  attrs(t).start_grids.Moto2[20]={position:21,number:13,rider:'Celestino Vietti'};
  html=render(t);
  assert.match(html,/Publicerad startgrid/);
  assert.match(html,/P19/);
  assert.match(html,/P21/);
  assert.doesNotMatch(html,/Q1 · ej vidare · från P19/);
  assert.doesNotMatch(html,/Kvalordning · preliminär/);

  // Race shows official grid only, never inferred qualifying positions.
  t._live.name='Race';t._snapshot.name='Race';
  assert.match(render(t),/Publicerad startgrid/);
  attrs(t).start_grids.Moto2=[];
  assert.doesNotMatch(render(t),/nt-qual-layout/);
  t._live.name='Sprint';t._snapshot.name='Sprint';
  assert.doesNotMatch(render(t),/nt-qual-layout/);

  // MotoGP's own 12 Q2 + Q1 from P13.
  t._live={name:'Q2',category:'MotoGP'};
  t._snapshot.category='MotoGP';t._snapshot.name='Q2';
  attrs(t).qualifying_q1_eliminated.MotoGP=[tail(13,33,'BINDER'),tail(14,42,'RIDER')];
  html=render(t);
  assert.match(html,/Q1 · ej vidare · från P13/);
  assert.ok(html.indexOf('P13')<html.indexOf('P14'));

  // During Q1 they are Q1 rankings, not silently final grid slots.
  t._live.name='Q1';t._snapshot.name='Q1';
  html=render(t);
  assert.match(html,/Q1-tider · inga startplatser fastställda/);
  assert.doesNotMatch(html,/Q1 · ej vidare/);
  assert.doesNotMatch(html,/P13/);

  // Duplicate riders or compromised backend segment must fail closed.
  t._live.name='Q2';t._snapshot.name='Q2';
  attrs(t).qualifying_q1_eliminated.MotoGP=[tail(13,72,'Duplicate from Q2')];
  html=render(t);
  assert.match(html,/Q1-utslagnas platser inväntar verifierat Q1-resultat/);
  assert.doesNotMatch(html,/Duplicate from Q2/);

  t.spoiler=true;
  assert.doesNotMatch(render(t),/nt-qual-layout|Kvalordning|Startgrid/);
  t.spoiler=false;t._live.category='Moto3';
  assert.doesNotMatch(render(t),/nt-qual-layout/,'wrong-class grid not shown');
  console.log('PASS: staggered 3-3-3 Q1/Q2 grid, Q1 losers P13/P19+, incomplete official guard, no duplicate riders, Q1-only, race, spoiler, responsive');
})().catch(e=>{console.error(e);process.exitCode=1;});
