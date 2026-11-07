'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync(process.argv[2]||'frontend/ha-motogp-next-qual-grid.js','utf8');
let styles=0;
class Timing {
  static buildInfo={version:'0.2.0-split.2'};
  constructor(){
    this._ids={race:'sensor.motogp_next_race'};
    this._today='2026-11-07';
    this._live={name:'Q2',category:'MotoGP'};
    this._snapshot={name:'Q2',day:this._today,category:'MotoGP',
      riders:[
        {position:2,number:93,surname:'MARQUEZ',last_lap_time:"1'51.111"},
        {position:1,number:72,surname:'BEZZECCHI',last_lap_time:"1'50.999"},
      ]};
    this._hass={states:{'sensor.motogp_next_race':{attributes:{start_grids:{}}}}};
    this.spoiler=false;
    this.shadowRoot={querySelector:()=>null,appendChild:()=>{styles++}};
  }
  _spoiler(){return this.spoiler;}
  _timing(){return '<section class="nt-card"><div class="nt-scroll"><div class="nt-table">'+
    '<div class="nt-row">RIDER</div></div></div></section>';}
  _render(){}
}
const registry={get:()=>Timing,whenDefined:()=>Promise.resolve()};
const context={customElements:registry,console,
  document:{createElement:()=>({setAttribute(){},textContent:''})}};
(async()=>{
  vm.runInNewContext(src,context);
  for(let i=0;i<4;i++)await Promise.resolve();
  const t=new Timing();
  let h=t._timing();
  assert.match(h,/nt-qual-layout/);
  assert.match(h,/Kvalordning · preliminär/);
  assert.match(h,/inte en startgrid/);
  assert.ok(h.indexOf('#72')<h.indexOf('#93'),'provisional order sorted by live position');
  assert.doesNotMatch(h,/Publicerad startgrid/);
  t._render();assert.equal(styles,1);
  assert.match(src,/min-width:940px/,'qual panel fits standard desktop widths');
  t._hass.states['sensor.motogp_next_race'].attributes.start_grids.MotoGP=[
    {position:1,number:93,rider:'Marc Marquez'},
    {position:2,number:72,rider:'Marco Bezzecchi'},
  ];
  h=t._timing();
  assert.match(h,/Publicerad startgrid/);
  assert.ok(h.indexOf('#93')<h.indexOf('#72'),'published grid overrides provisional order');
  assert.doesNotMatch(h,/Kvalordning · preliminär/);
  t._hass.states['sensor.motogp_next_race'].attributes.start_grids.MotoGP.push(
    {position:2,number:33,rider:'Duplicate position'}
  );
  h=t._timing();
  assert.match(h,/Kvalordning · preliminär/,'ambiguous official grid never shown as authoritative');
  t.spoiler=true;
  assert.doesNotMatch(t._timing(),/nt-qual-layout|Kvalordning/);
  t.spoiler=false;t._live.name='Race';
  assert.doesNotMatch(t._timing(),/nt-qual-layout/,'race keeps existing table');
  t._live.name='Q1';t._snapshot.name='Q1';t._snapshot.category='Moto2';
  assert.doesNotMatch(t._timing(),/nt-qual-layout/,'mismatched class must not show wrong grid');
  console.log('PASS: qualifying sidecar official vs provisional grid, sorted, no ambiguous official positions, spoiler, live/session guards');
})().catch(e=>{console.error(e);process.exitCode=1;});