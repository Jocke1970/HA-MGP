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
  card._hass.states['sensor.motogp_next_race']={attributes:{
    sessions_all:[{category:'Moto3',name:'Race',date_utc:new Date(Date.now()+offset*60000).toISOString(),status:'Scheduled'}],
    entry_lists:{Moto3:[{number:'9',rider:'Tester Nine',team:'Red'},{number:'2',rider:'Tester Two',team:'Blue'}]},
    start_grids:{Moto3:[{position:2,number:'9',rider:'Tester Nine'},{position:1,number:'2',rider:'Tester Two'}]},
    ...attrs,
  }};
}
schedule(31);
assert.match(card._timing(),/Senaste: MotoGP · Qualifying/);
schedule(29);
let html=card._timing();
assert.match(html,/STARTLISTA/);
assert.match(html,/Publicerad startgrid/);
assert.match(html,/Tester Two/);
assert.ok(html.indexOf('Tester Two')<html.indexOf('Tester Nine'));
assert.doesNotMatch(html,/OLD/);
assert.doesNotMatch(html,/1:52|1:53|LIVE BASE/);
card._click({target:{closest:()=>({dataset:{timing:''}})}});
assert.equal(card._timingManual,false);
assert.doesNotMatch(card._timing(),/Tester Two/);
card._timingManual=null;
schedule(-2);
assert.match(card._timing(),/Starttid passerad · inväntar data/);
card._live={key:'verified'};
assert.doesNotMatch(card._timing(),/STARTLISTA/);
card._live=null;card.spoiler=true;
assert.doesNotMatch(card._timing(),/STARTLISTA/);
card.spoiler=false;
schedule(15,{entry_lists:{},start_grids:{}});
assert.match(card._timing(),/Officiell deltagarlista\/startgrid saknas/);
console.log('PASS: last result -> T-30 grid -> post-start wait -> live and spoiler, manual collapse and missing roster');