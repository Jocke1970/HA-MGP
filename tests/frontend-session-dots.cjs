'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync(process.argv[2]||'frontend/ha-mgp-session-dots.js','utf8');
const docs=[];
class Base{
 constructor(){
  this._ids={status:'sensor.motogp_session_status'};
  this._hass={states:{'sensor.motogp_session_status':{
   state:'Not Started',attributes:{category:'MotoGP',session_name:'Warm Up',session_status_id:'N'}}}};
  this.shadowRoot={querySelector:()=>docs[0]||null,appendChild:x=>docs.push(x)};
 }
 _render(){}
}
class Overview extends Base{
 _schedule(){return '<section><div class="tile"><div class="name">MotoGP · Warm Up</div></div>'+
  '<div class="tile"><div class="name">Moto2 · Warm Up</div></div>'+
  '<div class="tile"><div class="name">MotoGP · Race</div></div></section>';}
}
class Timing extends Base{
 _timing(){return '<section><button class="nt-head"><span class="nt-label">🏁 Nästa: MotoGP · Warm Up</span></button></section>';}
}
const context={customElements:{get:t=>t.includes('overview')?Overview:Timing,whenDefined:()=>Promise.resolve()},
 document:{createElement:()=>({setAttribute(){},textContent:''})},console};
(async()=>{
 vm.runInNewContext(src,context);await Promise.resolve();await Promise.resolve();
 const o=new Overview(),t=new Timing();
 let s=o._schedule(),h=t._timing();
 console.log('SESSION-DOTS-DEBUG',s,h,o._mgpSessionDots,t._mgpSessionDots);
 assert.equal((s.match(/mgp-session-dot/g)||[]).length,1,'no dot on unrelated Moto2 or MotoGP race');
 assert.match(s,/data-status="not-started"/);assert.match(h,/data-status="not-started"/);
 t._hass.states['sensor.motogp_session_status'].state='In Progress';t._hass.states['sensor.motogp_session_status'].attributes.session_status_id='I';
 assert.match(t._timing(),/data-status="started"/);
 t._hass.states['sensor.motogp_session_status'].state='Finished';t._hass.states['sensor.motogp_session_status'].attributes.session_status_id='F';
 assert.match(t._timing(),/data-status="finished"/);
 t._hass.states['sensor.motogp_session_status'].state='unknown';t._hass.states['sensor.motogp_session_status'].attributes.session_status_id=null;
 assert.match(t._timing(),/data-status="unknown"/);
 t._hass.states['sensor.motogp_session_status'].attributes.category='Moto2';
 assert.doesNotMatch(t._timing(),/mgp-session-dot/,'unmatched category never inherits status');
 o._hass.states['sensor.motogp_session_status'].attributes.category='MotoGP';
 o._hass.states['sensor.motogp_session_status'].attributes.session_name='Race';
 const r=o._schedule();
 assert.match(r,/MotoGP · Race/);assert.equal((r.match(/mgp-session-dot/g)||[]).length,1);
 console.log('PASS: matching session and class, four statuses and schedule isolation');
})().catch(e=>{console.error(e);process.exitCode=1;});
