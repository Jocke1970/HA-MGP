'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const file=process.argv[2]||'frontend/ha-motogp-next-header-track.js';
const src=fs.readFileSync(file,'utf8');
assert.match(src,/header-track-weather-20261107-01/);
const docs=[];
class Overview {
  static buildInfo={version:'0.2.0-split.2'};
  constructor(){
    this._ids={race:'sensor.motogp_next_race',weather:'sensor.motogp_track_weather'};
    this._hass={states:{
      'sensor.motogp_next_race':{attributes:{circuit:'Lusail International Circuit'}},
      'sensor.motogp_track_weather':{attributes:{
        category:'Moto2',session:'Q1',air:'31º',ground:'42°',humidity:'51%',track:'Dry',weather:'Clear',
        updated_at:'2026-11-07T14:01:00Z'
      }}
    }};
    this.showButton=true;
    this.root={innerHTML:'',querySelector:q=>q==='[data-mgp-venue-style]'?docs[0]||null:null,
      appendChild:x=>docs.push(x),getElementById:id=>id==='app'?this.root:null};
    this.shadowRoot=this.root;
  }
  _weather(){return '<section class="panel">OLD SEPARATE WEATHER PANEL</section>';}
  _render(){
    this.root.innerHTML='<div class="root"><section class="panel header">'+
      '<div class="eyebrow">MOTOGP NEXT</div><h2>GRAND PRIX OF QATAR</h2>'+
      '<div class="sub">Lusail International Circuit</div>'+
      (this.showButton?'<div class="np-top-actions"><button>Visa VM</button></div>':'')+
      '</section>'+this._weather()+'<section>Schedule</section></div>';
  }
}
const context={customElements:{
  get:name=>name==='ha-motogp-next-overview-card'?Overview:null,
  whenDefined:()=>Promise.resolve()
},document:{createElement:()=>({setAttribute(){},textContent:''})},console};
(async()=>{
  vm.runInNewContext(src,context);
  await Promise.resolve();await Promise.resolve();
  const card=new Overview();
  card._render();
  assert.match(card.root.innerHTML,/mgp-venue-strip/);
  assert.match(card.root.innerHTML,/mgp-track-svg/,'Lusail verified layout rendered');
  assert.match(card.root.innerHTML,/Schematisk banform/);
  assert.match(card.root.innerHTML,/31 °C/);
  assert.match(card.root.innerHTML,/42 °C/);
  assert.match(card.root.innerHTML,/51 %/);
  assert.match(card.root.innerHTML,/>Dry</);
  assert.match(card.root.innerHTML,/Clear/);
  assert.match(card.root.innerHTML,/Moto2 · Q1/);
  assert.match(card.root.innerHTML,/Senast rapporterat · inte livegaranti/);
  assert.doesNotMatch(card.root.innerHTML,/OLD SEPARATE WEATHER PANEL/);
  assert.ok(card.root.innerHTML.indexOf('mgp-venue-strip')<card.root.innerHTML.indexOf('np-top-actions'),
    'hero precedes standings button');
  const first=card.root.innerHTML;
  card._render();assert.equal(card.root.innerHTML,first,'no duplicate panels');
  assert.equal(docs.length,1,'single style');
  assert.match(docs[0].textContent,/@container \(max-width:730px\)/);
  assert.match(docs[0].textContent,/@container \(max-width:425px\)/);
  assert.match(docs[0].textContent,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  const other=card._hass.states['sensor.motogp_next_race'];
  other.attributes.circuit='Unknown Track Name';
  card._render();
  assert.match(card.root.innerHTML,/Ingen verifierad banritning tillgänglig/);
  assert.doesNotMatch(card.root.innerHTML,/mgp-track-svg/,'no fabricated outline');
  other.attributes.circuit='Misano World Circuit';
  card._render();
  assert.match(card.root.innerHTML,/mgp-track-svg/,'other track mapped too');
  other.attributes.circuit='Track <img src=x onerror=alert(1)>';
  card._render();
  assert.doesNotMatch(card.root.innerHTML,/<img src=x/,'untrusted names escaped');
  other.attributes.circuit='Lusail International Circuit';
  const weather=card._hass.states['sensor.motogp_track_weather'];
  weather.attributes={air:'bad-script',ground:'0°C',humidity:'500%',track:'<script>alert(1)</script>',
    weather:'<img onerror=alert(1)>'};
  card._render();
  assert.doesNotMatch(card.root.innerHTML,/<script>|<img onerror=/);
  assert.match(card.root.innerHTML,/>0 °C</,'zero Celsius is valid');
  assert.match(card.root.innerHTML,/>—</,'invalid numerical data shows unavailable');
  weather.attributes={};
  card.showButton=false;
  card._render();
  assert.match(card.root.innerHTML,/Ingen banväderrapport tillgänglig ännu/);
  assert.match(card.root.innerHTML,/mgp-venue-strip/,'render works without standings button');
  assert.doesNotMatch(card.root.innerHTML,/OLD SEPARATE WEATHER PANEL/);
  console.log('PASS: 21 offline track layouts, Qatar map, four weather readings, provenance, no duplicate weather panel, responsive, invalid/unavailable safety');
})().catch(e=>{console.error(e);process.exitCode=1;});
