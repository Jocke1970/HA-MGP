'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
let today=Date.parse('2026-11-08T12:00:00+01:00');
class Clock extends Date {constructor(...x){super(...(x.length?x:[today]));} static now(){return today;}}
const docs=[];
class Overview{
  constructor(){
    this._ids={race:'sensor.motogp_next_race'};this.root={innerHTML:'',
      getElementById:()=>this.root,
      querySelector:()=>docs[0]||null,
      appendChild:x=>docs.push(x)};
    this.shadowRoot=this.root;
    this._hass={language:'sv-SE',states:{'sensor.motogp_next_race':{attributes:{
      season_calendar:[
        {short_name:'Thai GP',date_start:'2026-03-01',date_end:'2026-03-03',country:'Thailand',circuit:'Buriram'},
        {short_name:'Argentine GP',date_start:'2026-10-31',date_end:'2026-11-02',country:'Argentina',circuit:'Termas'},
        {short_name:'Valencia GP',date_start:'2026-11-13',date_end:'2026-11-15',country:'Spain',circuit:'Ricardo Tormo'},
        {short_name:'Second race',date_start:'2026-11-20',date_end:'2026-11-22',country:'Italy',circuit:'Misano'}
      ]}},'sensor.motogp_current_season':{state:'2026'},
      'binary_sensor.motogp_race_weekend_active':{state:'off'}}};
  }
  _mgpCalendarTrack(circuit){
    if(/buriram|chang/i.test(circuit))return {id:'buriram',d:'M10,20 L130,30 L110,120 Z',localPath:'/local/ha-mgp/circuits/buriram.svg'};
    if(/ricardo tormo/i.test(circuit))return {id:'valencia',d:'M10,20 L130,30 L110,120 Z',localPath:null};
    return null;
  }
  _render(){this.root.innerHTML='<div class="root"><section class="panel header">LIVE OVERVIEW</section><div class="foot">Version</div></div>';}
}
const src=fs.readFileSync(process.argv[2]||'frontend/ha-mgp-calendar.js','utf8');
const ctx={Date:Clock,console,document:{createElement:()=>({setAttribute(){},textContent:''})},
 customElements:{get:()=>Overview,whenDefined:()=>Promise.resolve()}};
(async()=>{
 vm.runInNewContext(src,ctx);
 await Promise.resolve();await Promise.resolve();
 let c=new Overview();c._render();
 assert.match(c.root.innerHTML,/Tävlingskalender 2026/);
 assert.match(c.root.innerHTML,/Valencia GP/);assert.match(c.root.innerHTML,/Argentina/);
 assert.match(c.root.innerHTML,/Kommande tävlingar/);
 assert.match(c.root.innerHTML,/Avverkade tävlingar \(2\)/);
 assert.match(c.root.innerHTML,/dagar kvar/);
 assert.match(c.root.innerHTML,/mgp-season-track--next/,'hero has a circuit picture');
 assert.match(c.root.innerHTML,/mgp-season-track--tile/,'upcoming and past races have circuit pictures');
 assert.match(c.root.innerHTML,/mgp-season-event is-past/,'completed races are visually muted');
 assert.equal((c.root.innerHTML.match(/Valencia GP/g)||[]).length,1,
   'the next event is in hero only, not repeated in upcoming list');
 assert.match(c.root.innerHTML,/Banlayout saknas/,'unknown track does not borrow a wrong circuit outline');

 assert.doesNotMatch(c.root.innerHTML,/LIVE OVERVIEW/);
 assert.ok(c.root.innerHTML.indexOf('Valencia GP')<c.root.innerHTML.indexOf('Second race'));
 c._hass.states['binary_sensor.motogp_race_weekend_active'].state='on';c._render();
 assert.match(c.root.innerHTML,/LIVE OVERVIEW/,'race weekend shows normal UI');
 c._hass.states['binary_sensor.motogp_race_weekend_active'].state='off';
 c._hass.states['sensor.motogp_next_race'].attributes.season_calendar=[];c._render();
 assert.match(c.root.innerHTML,/LIVE OVERVIEW/,'no calendar data retains ordinary overview');
 c._hass.states['sensor.motogp_next_race'].attributes.season_calendar=[
  {short_name:'<script>bad</script>',date_start:'2026-11-13',date_end:'2026-11-15',country:'Spain'}];
 c._render();assert.doesNotMatch(c.root.innerHTML,/<script>bad<\/script>/,'escape untrusted API names');
 c._hass.language='fr-FR';c._render();assert.match(c.root.innerHTML,/Calendrier de la saison/);
 c._hass.language='de-DE';c._render();assert.match(c.root.innerHTML,/Season calendar/,'English fallback');
 c._hass.states['binary_sensor.motogp_race_weekend_active'].state='unknown';today=Date.parse('2026-11-14T12:00:00+01:00');
 c._render();assert.match(c.root.innerHTML,/LIVE OVERVIEW/,'race dates protect layout without active sensor');
 console.log('PASS: off-weekend calendar, next event, countdown, locales, safe content and race-week guard');
})().catch(e=>{console.error(e);process.exitCode=1});
