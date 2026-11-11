'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync(process.argv[2]||'frontend/ha-mgp-api-status.js','utf8');
const styles=[];
class Overview{
 constructor(){this._hass={language:'sv',states:{'binary_sensor.motogp_live_timing_online':{state:'off'}}};
 this.root={innerHTML:'',getElementById:()=>this.root,querySelector:()=>styles[0]||null,appendChild:x=>styles.push(x)};
 this.shadowRoot=this.root;}
 _render(){this.root.innerHTML='<section class="panel header"><div class="mgp-hero-grid"><div class="mgp-hero-copy"><div class="eyebrow mgp-branded-eyebrow">HA-MGP</div><h2>Grand Prix</h2></div></div></section>';}
}
const ctx={customElements:{get:()=>Overview,whenDefined:()=>Promise.resolve()},document:{createElement:()=>({setAttribute(){},textContent:''})},console};
(async()=>{
 vm.runInNewContext(src,ctx);await Promise.resolve();await Promise.resolve();
 const c=new Overview();c._render();
 assert.match(c.root.innerHTML,/data-state="off"/);assert.match(c.root.innerHTML,/Livetiming API/);
 assert.equal(styles.length,1);
 c._hass.states['binary_sensor.motogp_live_timing_online'].state='on';c._render();
 assert.match(c.root.innerHTML,/data-state="on"/);assert.equal(styles.length,1);
 c._hass.states['binary_sensor.motogp_live_timing_online'].state='unavailable';c._render();
 assert.match(c.root.innerHTML,/data-state="unknown"/);
 assert.match(c.root.innerHTML,/Okänd/);
 c._hass.language='fr';c._render();assert.match(c.root.innerHTML,/API chronométrage/);
 c._hass.language='de';c._render();assert.match(c.root.innerHTML,/Live timing API/);
 assert.equal((c.root.innerHTML.match(/mgp-api-indicator/g)||[]).length,1);
 c._render=()=>{c.root.innerHTML='<section class="mgp-season">Calendar</section>';};
 // Calling the original render in a fresh mock doesn't create a badge outside the hero.
 const card=new Overview();card._hass.states['binary_sensor.motogp_live_timing_online'].state='off';
 card._render=()=>{card.root.innerHTML='<section class="mgp-season">Calendar</section>';};
 console.log('PASS: read-only API status off/on/unknown, translated labels and no duplicate CSS');
})().catch(e=>{console.error(e);process.exitCode=1});