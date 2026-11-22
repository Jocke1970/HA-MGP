#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
class Timing {
  constructor(){
    this._ids={race:'sensor.motogp_next_race'};
    this._hass={states:{}};
    this._today='2026-11-08';
    this._snapshot={day:this._today,category:'MotoGP',name:'Qualifying',riders:[{rider:'OLD'}]};
    this._live=null;this._timingManual=null;
    this.shadowRoot={contains:()=>true};
  }
  _spoiler(){return Boolean(this.spoiler)}
  _timing(){return '<section class="nt-card"><span class="nt-label">🏁 Nästa: Moto3 · Race</span><span class="nt-status finished">MELLAN PASSEN</span><span class="nt-clock">x</span><span class="nt-toggle">x</span></section>';}
  _click(){this.oldClick=true}
  _render(){this.lastHtml=this._timing()}
}
const elements={get:tag=>tag==='ha-motogp-next-timing-card'?Timing:null,
 whenDefined:()=>({then:fn=>fn()})};
vm.runInNewContext(fs.readFileSync(process.argv[2]||'frontend/ha-mgp-pre-session.js','utf8'),
  {customElements:elements,Date,console});
const card=new Timing();
function schedule(offset,attrs={}){
  const date=new Date(Date.now()+offset*60000).toISOString().slice(0,10);
  card._hass.states['sensor.motogp_next_race']={attributes:{
    date_start:date,date_end:date,event_id:'gp-current',
    sessions_all:[{category:'Moto3',name:'Race',event_id:'gp-current',date_utc:new Date(Date.now()+offset*60000).toISOString(),status:'Scheduled'}],
    entry_lists:{Moto3:[{number:'9',rider:'Tester Nine',team:'Red'},{number:'2',rider:'Tester Two',team:'Blue'}]},
    start_grids:{Moto3:[{position:2,number:'9',rider:'Tester Nine'},{position:1,number:'2',rider:'Tester Two'}]},
    ...attrs,
  }};
}
schedule(31);
// Regression: an old FP2 near the current time must not override a later GP.
const distant=new Date(Date.now()+5*86400000).toISOString().slice(0,10);
schedule(29,{date_start:distant,date_end:distant,event_id:'gp-portugal',sessions_all:[
 {category:'Moto2',name:'FP2',event_id:'gp-old',date_utc:new Date(Date.now()+5*60000).toISOString(),status:'Scheduled'},
 {category:'Moto3',name:'FP1',event_id:'gp-portugal',date_utc:new Date(Date.now()+5*86400000).toISOString(),status:'Scheduled'}]});
assert.doesNotMatch(card._timing(),/Moto2 · FP2|STARTLISTA/,'stale FP2 must not trigger a false T-30 roster');
// A mismatching event ID within the current event date window is also invalid.
const near=new Date(Date.now()+5*60000).toISOString().slice(0,10);
schedule(29,{date_start:near,date_end:near,event_id:'correct-gp',sessions_all:[
 {category:'Moto2',name:'FP2',event_id:'other-gp',
  date_utc:new Date(Date.now()+5*60000).toISOString(),status:'Scheduled'}]});
assert.doesNotMatch(card._timing(),/Moto2 · FP2|STARTLISTA/,'pre-session rejects wrong explicit event ID');
schedule(31);
assert.match(card._timing(),/Senaste: MotoGP · Qualifying/);
assert.match(card._timing(),/PRELIMINÄRT RESULTAT · EJ LIVE/,'retained timing snapshot is not an official result');
assert.doesNotMatch(card._timing(),/SENASTE RESULTAT · EJ LIVE|SLUTRESULTAT/,'unverified classifications must never be marked final');
schedule(29);
let html=card._timing();
assert.match(html,/STARTLISTA/);
assert.match(html,/Anmälda förare/);
assert.doesNotMatch(html,/Publicerad startgrid/);
assert.match(html,/Tester Two/);
// The two returned rows cannot establish a complete official starting grid.
// Even a numerically consecutive fragment must remain an entry list.
const full=Array.from({length:19},(_,i)=>({position:i+1,number:String(i+1),rider:'Rider '+(i+1)}));
const roster=full.map(r=>({number:r.number,rider:r.rider}));
schedule(29,{entry_lists:{Moto3:roster},start_grids:{Moto3:[{...full[0],time:"1'45.652"},...full.slice(1)]},
  records_by_category:{Moto3:[
    {type:'POLE_LAP',time:"1'44.999"}, // historical pole record is NOT current qualification
    {type:'recordLap',time:"1'43.111",rider:'TEST RECORD HOLDER',year:2025},
    {type:'bestLap',time:"1'44.111",rider:'BEST RACE RIDER',year:2024}
  ]}});
html=card._timing();
assert.match(html,/Pole · aktuellt kval/);
assert.match(html,/1&#39;45\.652/);
assert.match(html,/Absolut varvrekord/);
assert.match(html,/TEST RECORD HOLDER/);
assert.match(html,/2025/,'record year shown when supplied');
assert.match(html,/1&#39;43\.111/);
assert.doesNotMatch(html,/1&#39;44\.999/,'historical pole record must not masquerade as this qualifying lap');
assert.match(html,/Publicerad startgrid/);
assert.match(html,/Bästa racevarv/);
assert.match(html,/BEST RACE RIDER · 2024/);
assert.match(html,/1&#39;44\.111/);
assert.match(html,/class="mgp-pre-qual"[^>]*>⏱ 1&#39;45\.652/,
  'individual pole grid slot includes verified qualifying time');
assert.equal((html.match(/class="mgp-pre-qual"/g)||[]).length,1,
  'only the one supplied qualifying time is shown; remaining 18 are not guessed');
// A better pole lap this weekend becomes a provisional circuit record until
// the classification API publishes an updated recordLap.
schedule(29,{entry_lists:{Moto3:roster},start_grids:{Moto3:[{...full[0],time:"1'42.900"},...full.slice(1)]},
  records_by_category:{Moto3:[{type:'recordLap',time:"1'43.111",rider:'PREVIOUS HOLDER',year:2025}]}});
html=card._timing();
assert.match(html,/Preliminärt banrekord[\s\S]*1&#39;42\.900/);
assert.match(html,/Preliminärt · aktuellt kval/);
assert.doesNotMatch(html,/PREVIOUS HOLDER/,'slower historic record is superseded by a faster qualifying time');
schedule(29,{entry_lists:{Moto3:roster},start_grids:{Moto3:[{...full[0],time:"1'45.652"},...full.slice(1)]},
  records_by_category:{Moto3:[{type:'recordLap',time:"1'43.111",rider:'TEST RECORD HOLDER',year:2025}]}});
html=card._timing();
assert.match(html,/Absolut varvrekord/);
assert.doesNotMatch(html,/Preliminärt banrekord/);
// Crossing T-15 must NOT remove the pole and absolute record panel.
schedule(14,{entry_lists:{Moto3:roster},start_grids:{Moto3:[{...full[0],time:"1'45.652"},...full.slice(1)]},
  records_by_category:{Moto3:[{type:'recordLap',time:"1'43.111",rider:'TEST RECORD HOLDER',year:2025}]}});
html=card._timing();
assert.match(html,/Pole · aktuellt kval[\s\S]*1&#39;45\.652/);
assert.match(html,/Absolut varvrekord[\s\S]*1&#39;43\.111/);
schedule(29,{entry_lists:{Moto3:roster},start_grids:{Moto3:full}});
html=card._timing();
assert.match(html,/Pole · aktuellt kval[\s\S]*—/,'missing qualification time is not guessed');
assert.match(html,/Publicerad startgrid/);
assert.match(html,/mgp-pre-grid-scroll/);
assert.match(html,/mgp-pre-wave/);
assert.match(html,/mgp-pre-slot-1/);
assert.match(html,/mgp-pre-slot-2/);
assert.match(html,/mgp-pre-slot-3/);
assert.match(html,/START \/ POLE POSITION/);
assert.match(html,/mgp-pre-pole/,'pole highlighted');
assert.match(html,/mgp-pre-position/,'prominent position styling');
assert.match(html,/mgp-grid-color/,'team color accent');
const noNumbers=full.map(r=>({...r,number:null}));
schedule(29,{entry_lists:{Moto3:[]},start_grids:{Moto3:noNumbers}});
html=card._timing();
assert.match(html,/Publicerad startgrid/,'grid does not disappear if upstream omits rider numbers');
assert.match(html,/Rider 1/);
assert.doesNotMatch(html,/#–|#—|#null/,'unknown rider numbers are not printed as placeholders');
schedule(29,{entry_lists:{Moto3:roster},start_grids:{Moto3:full}});

assert.ok(html.indexOf('P1')<html.indexOf('P2'));
assert.ok(html.indexOf('Rider 1')<html.indexOf('Rider 19'));
const broken=full.map(r=>({...r}));broken[18].position=21;
schedule(29,{entry_lists:{Moto3:roster},start_grids:{Moto3:broken}});
assert.doesNotMatch(card._timing(),/Publicerad startgrid/);
schedule(29,{entry_lists:{Moto3:roster},start_grids:{Moto3:full.slice(0,18)}});
assert.doesNotMatch(card._timing(),/Publicerad startgrid/);
const duplicated=full.map(r=>({...r}));duplicated[18].number='1';
schedule(29,{entry_lists:{Moto3:roster},start_grids:{Moto3:duplicated}});
assert.doesNotMatch(card._timing(),/Publicerad startgrid/);
schedule(29,{entry_lists:{Moto3:roster},start_grids:{Moto3:full}});
assert.doesNotMatch(html,/OLD/);
assert.doesNotMatch(html,/1:52|1:53|LIVE BASE/);
card._click({target:{closest:()=>({dataset:{timing:''}})}});
assert.equal(card._timingManual,false);
assert.doesNotMatch(card._timing(),/Rider 1|mgp-pre-grid-scroll/);
card._timingManual=null;
schedule(-2);
assert.match(card._timing(),/Schemalagd start passerad · inväntar bekräftelse/);
assert.match(card._timing(),/STARTLISTA · INVÄNTAR LIVE/);
schedule(-8);
assert.match(card._timing(),/START EJ BEKRÄFTAD · MÖJLIG FÖRSENING/);
card._live={key:'verified'};
assert.doesNotMatch(card._timing(),/STARTLISTA/);
card._live=null;card.spoiler=true;
assert.doesNotMatch(card._timing(),/STARTLISTA/);
card.spoiler=false;
schedule(15,{entry_lists:{},start_grids:{}});
assert.match(card._timing(),/Officiell deltagarlista\/startgrid saknas/);
console.log('PASS: last result -> T-30 grid -> post-start wait -> live and spoiler, manual collapse and missing roster');