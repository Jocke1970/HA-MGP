'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const file=process.argv[2]||'frontend/ha-mgp-header-track.js';
const src=fs.readFileSync(file,'utf8');
assert.match(src,/header-track-weather-20261110-01/);
const docs=[];
class Overview {
  static buildInfo={version:'0.2.0-split.2'};
  constructor(){
    this._ids={race:'sensor.motogp_next_race',weather:'sensor.motogp_track_weather'};
    this._hass={states:{
      'sensor.motogp_next_race':{attributes:{circuit:'Lusail International Circuit',country:'Qatar',event_id:'qatar-gp',date_start:'2026-11-07',
         records_by_category:{
           MotoGP:[
             {type:'LAP_RECORD',time:'01:50.028',rider:'BEZZECCHI',year:2026,speed:176},
             {type:'POLE_LAP',time:'01:50.028',rider:'BEZZECCHI',speed:176},
             {type:'BEST_RACE_LAP',time:'01:52.561',rider:'MARQUEZ',year:2025,speed:172},
             {type:'UNKNOWN_RECORD',time:'00:00.001',rider:'INJECTED'}
           ],
           Moto2:[{type:'LAP_RECORD',time:'01:01.001',rider:'OTHER CLASS'}]
         },
         records_session_by_category:{MotoGP:{type:'SPR'}},
         sessions_all:[{category:'MotoGP',name:'WUP',date_utc:'2099-11-08T11:40:00Z',status:'SCHEDULED'}]}},
      'sensor.motogp_track_weather':{attributes:{
        results_event_uuid:'qatar-gp',category:'Moto2',session:'Q1',air:'31º',ground:'42°',humidity:'51%',track:'Dry',weather:'Clear',
        updated_at:'2026-11-07T14:01:00Z'
      }}
    }};
    this.showButton=true;
    this.root={innerHTML:'',querySelector:q=>q==='[data-mgp-venue-style]'?docs[0]||null:null,
      appendChild:x=>docs.push(x),getElementById:id=>id==='app'?this.root:null};
    this.shadowRoot=this.root;
  }
  _weather(){return '<section class="panel">OLD SEPARATE WEATHER PANEL</section>';}
  _schedule(){return '<section><div class="head"><strong>🗓️ Helgens schema</strong><span class="muted">Status</span></div><div class="cats">Filters</div><div class="day">Days</div><div class="empty">Inga pass i aktuell evenemangsdata för valt filter.</div></section>';}
  _click(){}

  _render(){
    this.root.innerHTML='<div class="root"><section class="panel header">'+
      '<div class="eyebrow">MOTOGP NEXT</div><h2>GRAND PRIX OF QATAR</h2>'+
      '<div class="sub">Lusail International Circuit</div>'+
      (this.showButton?'<div class="np-top-actions"><button>Visa VM</button></div>':'')+
      '</section>'+this._weather()+this._schedule()+'<div class="foot">Version footer</div></div>';
  }
}
class Timing {
  constructor(){
    this._live=null;
    this._ids={race:'sensor.motogp_next_race'};
    this._hass={states:{'sensor.motogp_next_race':{attributes:{sessions_all:[]}}}};
  }
  _timing(){return 'TIMING';}
}
const context={customElements:{
  get:name=>name==='ha-motogp-next-overview-card'?Overview:name==='ha-motogp-next-timing-card'?Timing:null,
  whenDefined:()=>Promise.resolve()
},document:{createElement:()=>({setAttribute(){},textContent:''})},console};
(async()=>{
  vm.runInNewContext(src,context);
  await Promise.resolve();await Promise.resolve();
  const card=new Overview();
  card._render();
  assert.match(card.root.innerHTML,/mgp-venue-strip/);
  assert.match(card.root.innerHTML,/data-mgp-hero-grid/,'header contains the unified hero');
  assert.match(card.root.innerHTML,/mgp-track-svg/,'Lusail verified layout rendered');
  assert.match(card.root.innerHTML,/\/local\/ha-mgp\/circuits\/lusail\.svg/,'local SVG is preferred when installed');
  assert.match(card.root.innerHTML,/mgp-track-fallback/,'fallback remains while SVG is unavailable');
  assert.match(card.root.innerHTML,/data-mgp-circuit-open/,'circuit map clickable');
  assert.match(card.root.innerHTML,/mgp-circuit-dialog/,'detail modal exists');
  assert.match(card.root.innerHTML,/data-mgp-circuit-dismiss/,'detail dialog has close control');
  assert.match(card.root.innerHTML,/mgp-circuit-dialog-head/,'circuit dialog has its own styled header');
  assert.match(src,/\.mgp-circuit-dialog-head\{display:flex/,'header aligns title and close button');
  assert.match(src,/\.mgp-circuit-dialog-head button\{flex:0 0 auto/,'close button keeps native themed styling');

  assert.match(src,/mgp-circuit-detail-grid/,'responsive circuit facts present');
  assert.match(src,/top:50%;left:50%;transform:translate\(-50%,-50%\)/,
    'circuit popup centers within viewport rather than clipping above it');
  assert.match(src,/\.mgp-circuit-dialog\[open\]\{display:flex;flex-direction:column\}/,
    'circuit popup keeps close button fixed while body scrolls');

  assert.match(src,/addEventListener\('load'/,'verified local image can replace fallback');
  assert.match(src,/addEventListener\('error'/,'missing local image safely keeps fallback');
  assert.match(card.root.innerHTML,/5,38 km/,'verified lap length shown in header');
  assert.match(card.root.innerHTML,/1 068 m/,'longest straight shown in header');
  assert.match(card.root.innerHTML,/10 · ↰ 6/,'right and left turns shown');
  assert.match(card.root.innerHTML,/qat-info\.svg/,'official SVG is linked, not loaded as an unverified replacement');
  const eventHeader=card.root.innerHTML.match(/<section class="panel header">([\s\S]*?)<\/section>/);
  assert.ok(eventHeader,'single event header exists');
  assert.match(eventHeader[1],/GRAND PRIX OF QATAR/);
  assert.match(eventHeader[1],/mgp-brand-logo/,'approved MGP logo in header');
  assert.match(eventHeader[1],/alt="MGP"/);
  assert.doesNotMatch(eventHeader[1],/<div class="eyebrow">🏁 /,'emoji replaced by logo');
  assert.match(eventHeader[1],/mgp-country-flag/,'host country flag beside event name');
  assert.match(eventHeader[1],/🇶🇦/,'Qatar must use country flag, not guessed SVG');
  assert.match(eventHeader[1],/aria-label="Flagga: Qatar"/);
  assert.doesNotMatch(eventHeader[1],/UI-information/,'diagnostics moved out of hero');
  assert.match(card.root.innerHTML,/ⓘ UI-information/,'diagnostics in footer');
  assert.match(card.root.innerHTML,/Backendversion hanteras separat/);
  assert.match(eventHeader[1],/mgp-weather-panel/);
  assert.match(eventHeader[1],/mgp-circuit-panel/);
  assert.doesNotMatch(eventHeader[1],/mgp-records|mgp-record-chip/,'records moved to timing card');
  assert.ok(eventHeader[1].indexOf('mgp-hero-copy')<eventHeader[1].indexOf('mgp-weather-panel'),
    'event info left, weather center');
  assert.ok(eventHeader[1].indexOf('mgp-weather-panel')<eventHeader[1].indexOf('mgp-circuit-panel'),
    'weather must be to the left of rightmost circuit map');
  assert.doesNotMatch(card.root.innerHTML.slice(card.root.innerHTML.indexOf('</section>')+10),
    /mgp-venue-strip/,'venue is not duplicated below the event header');
  assert.match(eventHeader[1],/np-top-actions/,'existing standings toggle remains in left column');
  assert.match(eventHeader[1],/data-mgp-schedule-jump/,'schedule toggle in hero');
  assert.match(eventHeader[1],/aria-expanded="false"/,'schedule initially collapsed');
  assert.match(eventHeader[1],/mgp-next-chip/,'next session chip in hero');
  assert.match(eventHeader[1],/MotoGP · Warm Up/,'next session type is displayed');
  assert.match(eventHeader[1],/data-next-start=/,'chip uses existing countdown refresh selector');
  assert.match(card.root.innerHTML,/<div class="foot"><details class="mgp-ui-footer">/,'UI details live in footer');
  assert.equal((card.root.innerHTML.match(/ⓘ UI-information/g)||[]).length,1,'only one diagnostics expander');
  assert.ok(card.root.innerHTML.indexOf('mgp-hero-grid')<card.root.innerHTML.indexOf('Version footer'),
    'venue lives before the footer when the schedule is collapsed');
  assert.match(card.root.innerHTML,/Schematisk banform/);
  assert.match(card.root.innerHTML,/31 °C/);
  assert.match(card.root.innerHTML,/42 °C/);
  assert.match(card.root.innerHTML,/51 %/);
  assert.match(card.root.innerHTML,/>Dry</);
  assert.match(card.root.innerHTML,/Clear/);
  assert.match(card.root.innerHTML,/Moto2 · Q1/);
  assert.match(card.root.innerHTML,/Senast rapporterat · inte livegaranti/);
  const raceAttrs=card._hass.states['sensor.motogp_next_race'].attributes;
  raceAttrs.event_id='different-event';
  card._render();
  assert.match(card.root.innerHTML,/tidigare sessionsvärden döljs/,'weather must match displayed GP');
  assert.doesNotMatch(card.root.innerHTML,/31 °C/,'previous GP temperature cannot show');
  raceAttrs.event_id='qatar-gp';
  card._render();
  const report=card._hass.states['sensor.motogp_track_weather'];
  report.attributes={...report.attributes,fetch_status:'ok',poll_count:4,change_count:2,
    checked_at:'2026-11-08T14:05:00Z',last_success_at:'2026-11-08T14:05:00Z',
    data_age_seconds:600};
  card._render();
  assert.match(card.root.innerHTML,/Kontroller 4/);
  assert.match(card.root.innerHTML,/Ändringar 2/);
  assert.match(card.root.innerHTML,/Ändrat för 10 min sedan/);
  report.attributes.fetch_status='error';
  card._render();
  assert.match(card.root.innerHTML,/API-fel · senast kända rapport/);
  report.attributes.fetch_status='no_data';
  card._render();
  assert.match(card.root.innerHTML,/Ingen ny sessionsrapport/);
  delete report.attributes.fetch_status;
  card._render();
  assert.doesNotMatch(card.root.innerHTML,/OLD SEPARATE WEATHER PANEL/);
  assert.ok(eventHeader[1].indexOf('np-top-actions')<eventHeader[1].indexOf('mgp-weather-panel'),
    'VM toggle remains beside event title, before the weather and circuit');
  assert.doesNotMatch(card.root.innerHTML,/<section>Schedule<\/section>/,'schedule hidden until opened');
  assert.equal(card._schedule(),'', 'schedule collapsed on initial load');
  card._scheduleOpen=true;
  assert.match(card._schedule(),/Filters/,'schedule filters remain');
  assert.match(card._schedule(),/Days/,'schedule day list remains');
  assert.match(card._schedule(),/<section class="mgp-weekend-inline"/,'open schedule uses an inline section');
  assert.doesNotMatch(card._schedule(),/<dialog/,'inline schedule never opens a top-layer dialog');
  assert.match(card._schedule(),/data-mgp-schedule-dismiss/,'inline schedule has a close button');
  assert.match(card._schedule(),/Helgens schema/,'inline schedule has accessible schedule title');
  assert.match(card._schedule(),/Detaljerat helgschema är ännu inte tillgängligt/);
  assert.match(card._schedule(),/Visa MotoGP:s officiella schema/);
  card._scheduleOpen=false;
  const first=card.root.innerHTML;
  card._render();assert.equal(card.root.innerHTML,first,'no duplicate panels');
  assert.equal(docs.length,1,'single style');
  const timeCard=new Timing();
  const times=timeCard._hass.states['sensor.motogp_next_race'].attributes;
  times.sessions_all=[{date_utc:new Date(Date.now()+35*60*1000).toISOString(),status:'SCHEDULED'}];
  assert.equal(timeCard._timing(),'','timing stays hidden more than 30 min before next pass');
  times.sessions_all=[{date_utc:new Date(Date.now()+25*60*1000).toISOString(),status:'SCHEDULED'}];
  assert.equal(timeCard._timing(),'TIMING','timing appears within 30 min');
  times.sessions_all=[{date_utc:new Date(Date.now()-15*60*1000).toISOString(),status:'SCHEDULED'}];
  assert.equal(timeCard._timing(),'TIMING','timing remains around delayed scheduled start');
  times.sessions_all=[{date_utc:new Date(Date.now()-15*60*1000).toISOString(),status:'FINISHED'}];
  assert.equal(timeCard._timing(),'','finished session cannot open timing by schedule alone');
  timeCard._live={name:'Race',category:'MotoGP'};
  assert.equal(timeCard._timing(),'TIMING','verified live status always shows timing');
  timeCard._live=null;
  times.sessions_all=[{date_utc:new Date(Date.now()+31*60*1000).toISOString(),status:'SCHEDULED'}];
  assert.equal(timeCard._timing(),'','31-minute boundary must remain hidden');

  assert.match(docs[0].textContent,/@container \(max-width:900px\)/);
  assert.match(docs[0].textContent,/@container \(max-width:680px\)/);
  assert.match(docs[0].textContent,/@container \(max-width:355px\)/);
  assert.match(docs[0].textContent,/mgp-hero-grid\{display:grid/);
  assert.match(docs[0].textContent,/mgp-circuit-panel\{justify-self:end/);
  assert.match(docs[0].textContent,/mgp-weather-panel,.mgp-circuit-panel\{min-width:0;padding:0;margin:0;border:0;background:transparent\}/,
    'no gray weather/track cards inside the white header');
  assert.match(docs[0].textContent,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  const other=card._hass.states['sensor.motogp_next_race'];
  other.attributes.country='Unknown Country';
  card._render();
  assert.doesNotMatch(card.root.innerHTML,/mgp-country-flag/,'unknown country cannot invent a flag');
  other.attributes.country='Qatar';
  other.attributes.circuit='Unknown Track Name';
  card._render();
  assert.match(card.root.innerHTML,/Ingen verifierad banritning tillgänglig/);
  assert.doesNotMatch(card.root.innerHTML,/mgp-track-svg/,'no fabricated outline');
  other.attributes.circuit='Balaton Park Circuit';
  card._render();
  assert.match(card.root.innerHTML,/\/local\/ha-mgp\/circuits\/balatonpark\.svg/,'Hungarian MotoGP track uses Balaton Park');
  other.attributes.circuit='Le Mans Bugatti Circuit';
  card._render();
  assert.match(card.root.innerHTML,/\/local\/ha-mgp\/circuits\/lemans\.svg/,'Le Mans local-only asset mapped');
  assert.match(card.root.innerHTML,/Lokal SVG saknas/,'Le Mans without SVG uses an explicit neutral placeholder');
  other.attributes.circuit='Autódromo Internacional do Algarve';
  card._render();
  assert.match(card.root.innerHTML,/data-mgp-circuit-open/,'Portimao track is clickable');
  assert.match(card.root.innerHTML,/4,59 km/,'Portimao track length verified');
  assert.match(card.root.innerHTML,/970 m/,'Portimao longest straight verified');
  assert.match(card.root.innerHTML,/1&#39;37\.226/,'Portimao record shown safely in detail');
  other.attributes.circuit='Misano World Circuit';
  card._render();
  assert.match(card.root.innerHTML,/mgp-track-svg/,'other track mapped too');
  other.attributes.circuit='Track <img src=x onerror=alert(1)>';
  card._render();
  assert.doesNotMatch(card.root.innerHTML,/<img src=x/,'untrusted names escaped');
  other.attributes.circuit='Lusail International Circuit';
  const weather=card._hass.states['sensor.motogp_track_weather'];
  weather.attributes={results_event_uuid:'qatar-gp',updated_at:'2026-11-08T13:00:00Z',
    air:'bad-script',ground:'0°C',humidity:'500%',track:'<script>alert(1)</script>',
    weather:'<img onerror=alert(1)>'};
  card._render();
  assert.doesNotMatch(card.root.innerHTML,/<script>|<img onerror=/);
  assert.match(card.root.innerHTML,/>0 °C</,'zero Celsius is valid');
  assert.match(card.root.innerHTML,/>—</,'invalid numerical data shows unavailable');
  weather.attributes={};
  card.showButton=false;
  card._render();
  assert.match(card.root.innerHTML,/tidigare sessionsvärden döljs/);
  assert.match(card.root.innerHTML,/mgp-venue-strip/,'render works without standings button');
  assert.match(card.root.innerHTML,/<section class="panel header"><div class="mgp-hero-grid"/);
  assert.ok(card.root.innerHTML.indexOf('mgp-weather-panel')<card.root.innerHTML.indexOf('mgp-circuit-panel'),
    'mobile and spoiler-mode fallback preserve weather/map order');
  assert.doesNotMatch(card.root.innerHTML,/OLD SEPARATE WEATHER PANEL/);
  console.log('PASS: one white three-part event hero, weather left of far-right track, toggle preserved, 21 tracks, real weather, responsive and missing-data safety');
})().catch(e=>{console.error(e);process.exitCode=1;});
