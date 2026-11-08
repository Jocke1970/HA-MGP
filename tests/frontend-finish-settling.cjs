'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync(process.argv[2]||'frontend/ha-mgp-finish-settling.js','utf8');
let clock=100000;
class DateClock extends Date {static now(){return clock;}}
const race={state:'Qatar GP'};
const events={};
class Timing{
 constructor(){
  this._ids={session:'session',status:'status',riders:'riders'};
  this._live={key:'qatar|2026|MotoGP|Warm Up',category:'MotoGP',name:'Warm Up'};
  this._snapshot={...this._live,day:'2026-11-08',riders:[{position:1,rider_id:'49',best_lap_time:"1'52.558",num_lap:4}]};
  this._hass={states:{session:{state:'Warm Up',attributes:{category:'MotoGP',event:'Qatar GP'}},
    status:{state:'In Progress',attributes:{category:'MotoGP',session_shortname:'WUP',event:'Qatar GP'}},
    riders:{attributes:{category:'MotoGP',session_shortname:'WUP',event:'Qatar GP',tv_delay_ready:true,riders:[{position:1,rider_id:'49',best_lap_time:"1'52.281",num_lap:6}]}}}};
 }
 _spoiler(){return !!this.hidden;}
 _track(){
  if(this._hass.states.status.state==='Finished')this._live=null;
  if(this.hidden){this._live=null;this._snapshot=null;}
 }
 _timing(){return '<section><button><span class="nt-label">🏁 Nästa: Moto3 · Race</span>'+
 '<span class="nt-status finished">SENASTE PASS · EJ LIVE</span>'+
 '<span class="nt-clock"><span>14:00</span><small>1:08 till start</small></span>'+
 '<span class="nt-toggle">Visa</span></button>'+
 '<div class="nt-row">Riders</div></section>';}
}
const ctx={Date:DateClock,customElements:{get:()=>Timing,whenDefined:()=>Promise.resolve()},console};
(async()=>{
 vm.runInNewContext(src,ctx);await Promise.resolve();await Promise.resolve();
 const t=new Timing();t._track(new DateClock(),race);
 assert.match(t._timing(),/Nästa: Moto3/,'before finish remains live/normal');
 t._hass.states.status.state='Finished';t._hass.states.status.attributes.session_status_id='F';
 t._track(new DateClock(),race);
 assert.match(t._timing(),/Avflaggat: MotoGP · Warm Up/);
 assert.match(t._timing(),/INVÄNTAR SLUTVARV/);
 assert.doesNotMatch(t._timing(),/14:00/,'next countdown hidden only in settling window');
 assert.equal(t._snapshot.riders[0].best_lap_time,"1'52.281",'final verified rider snapshot refreshes');
 t._hass.states.riders.attributes.category='Moto2';
 t._hass.states.riders.attributes.riders[0].best_lap_time="1'20.111";
 t._track(new DateClock(),race);
 assert.equal(t._snapshot.riders[0].best_lap_time,"1'52.281",'cross-class data rejected');
 clock+=120001;t._track(new DateClock(),race);
 assert.match(t._timing(),/Nästa: Moto3/,'normal countdown restored after bounded hold');
 const spoiler=new Timing();spoiler.hidden=true;spoiler._track(new DateClock(),race);
 assert.doesNotMatch(spoiler._timing(),/Avflaggat/,'spoiler guard');
 console.log('PASS: 2-minute finish settling, late same-session PB, no cross-class leaks, expiry and spoiler');
})().catch(err=>{console.error(err);process.exitCode=1;});
