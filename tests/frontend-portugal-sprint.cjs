#!/usr/bin/env node
'use strict';
// Regression from the 2026-11-21 Portugal Sprint API capture.
// An API-confirmed session must win over a stale calendar start time.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
process.env.TZ='Europe/Stockholm';
let now=Date.parse('2026-11-21T14:35:00Z');
class Clock extends Date {
  constructor(...args){super(...(args.length?args:[now]));}
  static now(){return now;}
}
const registry=new Map();
class Element {
  attachShadow(){
    this.view={innerHTML:''};
    this.shadowRoot={innerHTML:'',addEventListener(){},contains(){return true;},getElementById:()=>this.view};
    return this.shadowRoot;
  }
}
vm.runInNewContext(fs.readFileSync('frontend/ha-mgp-core.js','utf8'),{
  Date:Clock,window:{customCards:[]},customElements:{get:k=>registry.get(k),define:(k,c)=>registry.set(k,c)},
  HTMLElement:Element,console,setInterval:()=>1,clearInterval:()=>{}
});
const Card=registry.get('ha-motogp-next-card'),card=new Card();
card.setConfig({type:'custom:ha-motogp-next-card'});
const ent=(state,attributes={})=>({state,attributes});
const event='Repsol Grand Prix of Portugal',base={category:'MotoGP',event,session_shortname:'SPR',championship_id:'3'};
const sessions=[{id:'sprint-results-uuid',category:'MotoGP',name:'Sprint',
  date_utc:'2026-11-21T15:30:00Z',status:'NOT-STARTED'},
  {id:'race-results-uuid',category:'MotoGP',name:'Race',
  date_utc:'2026-11-22T13:00:00Z',status:'NOT-STARTED'}];
let states={
  'sensor.motogp_next_race':ent('GRAND PRIX OF PORTUGAL',{
    date_start:'2026-11-20',date_end:'2026-11-22',sessions_all:sessions}),
  'sensor.motogp_current_session':ent('Tissot Sprint',base),
  'sensor.motogp_session_status':ent('Finished',{...base,session_status_id:'C'}),
  'sensor.motogp_rider_positions':ent('22 riders',{...base,tv_delay_ready:true,riders:[
    {position:1,surname:'BEZZECCHI',number:72,num_lap:12,last_lap_time:"1'40.507"},
    {position:2,surname:'FERNANDEZ',number:25,num_lap:12,last_lap_time:"1'45.267"}]}),
  'switch.motogp_no_spoiler':ent('off')
};
function update(changes={}){states={...states,...changes};card.hass={states};}
update();
assert.equal(card._live,null,'C is not LIVE');
assert.equal(card._snapshot?.name,'Sprint','recover finished Sprint without a prior live frame');
assert.equal(card._snapshot?.riders?.[0]?.surname,'BEZZECCHI');
assert.doesNotMatch(card.view.innerHTML,/VÄNTAR PÅ MATCHANDE DATA/);
update({'sensor.motogp_session_status':ent('In Progress',{...base,session_status_id:'S'})});
assert.equal(card._live?.name,'Sprint','active API session wins despite moved calendar time');
assert.match(card.view.innerHTML,/● LIVE/);
update({'sensor.motogp_session_status':ent('Red Flag',{...base,session_status_id:'R'})});
assert.equal(card._live?.name,'Sprint','red flag remains the same active session');
update({'sensor.motogp_rider_positions':ent('bad category',{
  ...base,category:'Moto2',tv_delay_ready:true,riders:[{position:1,surname:'WRONG_CLASS'}]})});
assert.equal(card._live,null,'never merge another class');
assert.equal(card._snapshot,null,'never retain stale live rows on a mismatched active session');
update({'sensor.motogp_rider_positions':ent('TV delay not ready',{
  ...base,tv_delay_seconds:60,tv_delay_ready:false,riders:[{position:1,surname:'SPOILER'}]})});
assert.equal(card._live,null,'TV delay must remain enforced');
assert.equal(card._snapshot,null);
update({'switch.motogp_no_spoiler':ent('on'),
 'sensor.motogp_session_status':ent('Finished',{...base,session_status_id:'C'}),
 'sensor.motogp_rider_positions':ent('riders',{...base,tv_delay_ready:true,
   riders:[{position:1,surname:'BEZZECCHI'}]})});
assert.equal(card._snapshot,null,'no-spoiler mode must hide even finished results');
console.log('PASS: Portugal Sprint C recovery, schedule drift, red flag, class fence, TV delay, no-spoiler');
