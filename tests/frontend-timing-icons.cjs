'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync(process.argv[2]||'frontend/ha-mgp-timing-icons.js','utf8');
let now=1000000;
class Clock extends Date{static now(){return now;}}
let tick=null,cleared=null;
class Timing{
 constructor(){
  this._hass={};
  this.node={classList:{toggle:(cl,val)=>{this.urgent=val;}},querySelector:()=>({getAttribute:()=>''+(now+290000)})};
  this.shadowRoot={querySelector:()=>null,querySelectorAll:()=>[this.node],appendChild(){}};
 }
 _timing(){return '<span class="nt-clock"><span>12:40</span><small><span class="next-countdown" data-next-start="1290000">04:50 till start</span></small></span>';}
 _render(){return this._timing();}
 connectedCallback(){}
 disconnectedCallback(){}
}
const ctx={Date:Clock,customElements:{get:()=>Timing,whenDefined:()=>Promise.resolve()},
 document:{createElement:()=>({setAttribute(){},textContent:''})},
 setInterval:f=>{tick=f;return 1;},clearInterval:id=>{cleared=id;},console};
(async()=>{
 vm.runInNewContext(src,ctx);await Promise.resolve();await Promise.resolve();
 let t=new Timing();let markup=t._timing();
 assert.match(markup,/🕒 12:40/);assert.match(markup,/⏱ /);
 t.connectedCallback();assert.equal(t.node.urgent,true);assert.ok(tick);
 t.node.querySelector=()=>({getAttribute:()=>''+(now+310000)});tick();assert.equal(t.node.urgent,false);
 t.disconnectedCallback();assert.equal(cleared,1);
 console.log('PASS: session start/time icons and dynamic five-minute red countdown');
})().catch(e=>{console.error(e);process.exitCode=1;});
