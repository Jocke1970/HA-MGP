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
        {id:'thai-id',short_name:'Thai GP',date_start:'2026-03-01',date_end:'2026-03-03',country:'Thailand',circuit:'Buriram'},
        {id:'arg-id',short_name:'Argentine GP',date_start:'2026-10-31',date_end:'2026-11-02',country:'Argentina',circuit:'Termas'},
        {id:'valencia-id',short_name:'Valencia GP',date_start:'2026-11-13',date_end:'2026-11-15',country:'Spain',circuit:'Ricardo Tormo'},
        {id:'second-id',short_name:'Second race',date_start:'2026-11-20',date_end:'2026-11-22',country:'Italy',circuit:'Misano'}
      ]}},'sensor.motogp_current_season':{state:'2026'},
      'binary_sensor.motogp_race_weekend_active':{state:'off'}}};
  }
  _mgpCalendarTrack(circuit){
    if(/buriram|chang/i.test(circuit))return {id:'buriram',d:'M10,20 L130,30 L110,120 Z',localPath:'/local/ha-mgp/circuits/buriram.svg'};
    if(/ricardo tormo/i.test(circuit))return {id:'valencia',d:'M10,20 L130,30 L110,120 Z',localPath:null};
    return null;
  }
  _spoiler(){return false;}
  _click(){}
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
 assert.equal((c.root.innerHTML.match(/mgp-season-event is-past/g)||[]).length,2,
   'both completed races use the muted card style');
 assert.equal((c.root.innerHTML.match(/class="mgp-season-event/g)||[]).length,3,
   'two completed events and one later upcoming event, with next GP in hero only');
 assert.equal((c.root.innerHTML.match(/Valencia GP/g)||[]).length,1,
   'the next event is in hero only, not repeated in upcoming list');
 assert.match(c.root.innerHTML,/Banlayout saknas/,'unknown track does not borrow a wrong circuit outline');
 assert.match(c.root.innerHTML,/data-mgp-season-event="arg-id"/,'past events are clickable');
 assert.match(c.root.innerHTML,/data-mgp-season-event="second-id"/,'future events are clickable');
 assert.doesNotMatch(c.root.innerHTML,/data-mgp-season-event="valencia-id"/,
   'next GP is only in top header, not a duplicate tile');
 let calls=0;
 c._hass.callWS=async payload=>{
   calls++;
   assert.equal(payload.type,'motogp_sensor/event_results');
   assert.equal(payload.event_id,'arg-id');
   return {event_id:'arg-id',source:'pulselive_results',categories:{
     MotoGP:{pole:{rider:'Pole Rider',time:"1:35.010"},
       race:[{position:1,rider:'Winner',time:'39:20.000'}],sprint:[]}}};
 };
 const clickTarget=(attribute,value)=>({
   closest:selector=>selector==='['+attribute+']'?
     {getAttribute:()=>value}:null
 });
 c._click({target:clickTarget('data-mgp-season-event','arg-id')});
 await Promise.resolve();await Promise.resolve();await Promise.resolve();await Promise.resolve();
 assert.equal(calls,1,'historical results fetched only when opened');
 assert.match(c.root.innerHTML,/mgp-season-dialog/);
 assert.match(c.root.innerHTML,/mgp-season-dialog-heading/,'circuit-first detail heading');
 assert.match(src,/event\.clientX<rect\.left/,'calendar backdrop verifies outside coordinates');
 assert.match(src,/min-height:clamp\(240px,43dvh,400px\)/,'full visual map area is a click target');
 assert.match(c.root.innerHTML,/data-mgp-season-close/,'map button dismisses dialog');
 assert.doesNotMatch(c.root.innerHTML,/data-mgp-season-close>Stäng/,'no visible close button');
 assert.match(c.root.innerHTML,/Winner/,'correct event results displayed from Pulselive');
 assert.match(c.root.innerHTML,/Pole Rider/,'verified Q2 pole row displayed');
 c._click({target:clickTarget('data-mgp-season-category','Moto2')});
 assert.match(c.root.innerHTML,/Inget verifierat raceresultat/,'missing category never borrows MotoGP');
 c._click({target:clickTarget('data-mgp-season-close','')});
 c._click({target:clickTarget('data-mgp-season-event','second-id')});
 assert.equal(calls,1,'future GP does not fetch results');
 assert.match(c.root.innerHTML,/Inga framtida värden uppskattas/);
 c._click({target:clickTarget('data-mgp-season-close','')});
 c._click({target:clickTarget('data-mgp-season-year','2027')});
 assert.match(c.root.innerHTML,/Tävlingskalender 2027/,'2027 is selectable');
 assert.match(c.root.innerHTML,/22 GP/,'FIM has 22 official 2027 rounds');
 assert.doesNotMatch(c.root.innerHTML,/mgp-season-next-layout/,
   'future season has no next-GP hero card');
 assert.match(c.root.innerHTML,/data-mgp-season-event="published-2027-01"/,
   'Thailand R1 is an ordinary clickable upcoming race');
 assert.equal((c.root.innerHTML.match(/class="mgp-season-event/g)||[]).length,22,
   'all 22 upcoming 2027 rounds are visible in calendar tiles');

 assert.match(c.root.innerHTML,/Buenos Aires/,'Argentina 2027 location shown');
 assert.match(c.root.innerHTML,/Adelaide Street Circuit/,'Australia 2027 venue shown');
 c._click({target:clickTarget('data-mgp-season-event','published-2027-21')});
 assert.match(c.root.innerHTML,/Houseofsloth/,'Adelaide artwork credited');
 assert.match(c.root.innerHTML,/CC BY 4\.0/,'Adelaide license linked');
 assert.match(c.root.innerHTML,/Adelaide_MotoGP_Proposal\.svg/,'proposal preview separate from verified shape');
 c._click({target:clickTarget('data-mgp-season-close','')});
 c._click({target:clickTarget('data-mgp-season-event','published-2027-04')});
 assert.match(c.root.innerHTML,/Gustavo Girardelli/,'Buenos Aires artwork credited');
 assert.match(c.root.innerHTML,/CC BY-SA 4\.0/,'Buenos Aires license linked');
 assert.match(c.root.innerHTML,/OpenStreetMap-data/,'OSM provenance visible');
 c._click({target:clickTarget('data-mgp-season-close','')});

 assert.match(c.root.innerHTML,/Preliminär FIM-kalender 2027/,'provisional calendar is labeled');
 c._click({target:clickTarget('data-mgp-season-event','published-2027-04')});
 assert.match(c.root.innerHTML,/mgp-season-dialog/,'provisional race has clickable circuit detail');
 assert.equal(calls,1,'provisional IDs never sent to result API');
 c._click({target:clickTarget('data-mgp-season-close','')});
 c._click({target:clickTarget('data-mgp-season-year','2026')});
 assert.match(c.root.innerHTML,/Tävlingskalender 2026/,'switching back restores 2026');
 // Simulate crossing 1 January 2027: default to 2027 while preserving 2026
 // as a selectable historical year, without showing wrong-year API events.
 today=Date.parse('2027-01-02T12:00:00+01:00');
 c._mgpCalendarYear=null;
 c._hass.states['sensor.motogp_current_season'].state='2027';
 c._render();
 assert.match(c.root.innerHTML,/Tävlingskalender 2027/,'new year defaults to 2027');
 assert.match(c.root.innerHTML,/data-mgp-season-year="2026"/,'2026 remains selectable');
 c._click({target:clickTarget('data-mgp-season-year','2026')});
 assert.match(c.root.innerHTML,/Historisk kalender för 2026 är inte tillgänglig/,
   'never relabel 2027 Pulselive data as 2026 history');
 c._click({target:clickTarget('data-mgp-season-year','2027')});
 today=Date.parse('2028-01-02T12:00:00+01:00');
 c._mgpCalendarYear=null;
 c._hass.states['sensor.motogp_current_season'].state='2028';
 c._render();
 assert.match(c.root.innerHTML,/data-mgp-season-year="2028"/,
   'future season selector expands rather than freezing at 2027');
 today=Date.parse('2026-11-08T12:00:00+01:00');
 c._hass.states['sensor.motogp_current_season'].state='2026';
 c._mgpCalendarYear=2026;
 c._render();

 
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
