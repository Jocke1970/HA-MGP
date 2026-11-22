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

// A red-flag restart comes from timing-gateway as RAC2 with a new live
// session ID (7), while Results/calendar still contain only a single Race.
now=Date.parse('2026-11-22T11:58:00Z');
const moto2Event='Repsol Grand Prix of Portugal';
const raced={category:'Moto2',event:moto2Event,session_shortname:'RAC2',
  session_id:'7',championship_id:'2'};
const moto2Race={date_start:'2026-11-20',date_end:'2026-11-22',
  sessions_all:[{id:'original-results-race-uuid',category:'Moto2',name:'Race',
    date_utc:'2026-11-22T11:15:00Z',status:'NOT-STARTED'}]};
update({
 'switch.motogp_no_spoiler':ent('off'),
 'sensor.motogp_next_race':ent('GRAND PRIX OF PORTUGAL',moto2Race),
 'sensor.motogp_current_session':ent('RAC2',raced),
 'sensor.motogp_session_status':ent('In Progress',{...raced,session_status_id:'S'}),
 'sensor.motogp_rider_positions':ent('28 riders',{...raced,session_status_id:'S',
   tv_delay_ready:true,riders:[{position:1,surname:'MUÑOZ',number:'17',num_lap:4,last_lap_time:"1'41.592"}]}),
 'sensor.motogp_race_lap_count':ent('4',{...raced,num_laps:7})
});
assert.equal(card._live?.name,'Race','RAC2 is the same scheduled Race');
assert.equal(card._live?.part,2,'restart part is surfaced');
assert.equal(card._live?.session_id,'7','raw restart live session id is retained');
assert.equal(card._snapshot?.riders?.[0]?.surname,'MUÑOZ','restart timing is visible');
assert.match(card.view.innerHTML,/LIVE/);
const restartKey=card._live.key;
update({'sensor.motogp_rider_positions':ent('mismatched part',{
 ...raced,session_id:'6',tv_delay_ready:true,riders:[{position:1,surname:'OLD SEGMENT'}]})});
assert.equal(card._live,null,'mixed session IDs must fail closed');
assert.equal(card._snapshot,null,'old segment riders must be cleared');
update({'sensor.motogp_rider_positions':ent('new part',{
 ...raced,session_id:'7',tv_delay_ready:true,
 riders:[{position:1,surname:'MUÑOZ',number:'17',num_lap:4,last_lap_time:"1'41.592"}]})});
assert.equal(card._live?.key,restartKey,'same restart session is recovered');
update({'sensor.motogp_current_session':ent('RAC',{...raced,session_shortname:'RAC',session_id:'6'}),
 'sensor.motogp_session_status':ent('In Progress',{...raced,session_shortname:'RAC',session_id:'6',session_status_id:'I'}),
 'sensor.motogp_rider_positions':ent('original',{...raced,session_shortname:'RAC',session_id:'6',
   tv_delay_ready:true,riders:[{position:1,surname:'ORIGINAL'}]})});
assert.notEqual(card._live?.key,restartKey,'original and restarted parts must not share snapshot keys');
assert.equal(card._snapshot?.riders?.[0]?.surname,'ORIGINAL');

console.log('PASS: Portugal Sprint C recovery, schedule drift, red flag, class fence, TV delay, no-spoiler, RAC2 restart/segment isolation');
