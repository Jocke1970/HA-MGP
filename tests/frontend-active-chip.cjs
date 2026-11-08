'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync(process.argv[2]||'frontend/ha-mgp-active-chip.js','utf8');
class Overview{
 constructor(){this._live=null;this._hass={language:'sv'};this.root={innerHTML:'',getElementById:()=>this.root};this.shadowRoot=this.root;}
 _spoiler(){return false;}
 _render(){this.root.innerHTML='<div class="mgp-hero-copy"><span class="mgp-next-chip" title="Nästa"><span>⏱ Moto2 · Race</span> · <span class="next-countdown">12:00</span></span><div>Header</div></div><div id="schedule">SCHEMA</div>';}
}
const ctx={customElements:{get:()=>Overview,whenDefined:()=>Promise.resolve()},console};
(async()=>{
 vm.runInNewContext(src,ctx);await Promise.resolve();await Promise.resolve();
 const card=new Overview();card._render();
 assert.match(card.root.innerHTML,/Moto2 · Race/,'without verified live data remains the next session');
 card._live={category:'MotoGP',name:'Warm Up'};card._render();
 assert.match(card.root.innerHTML,/PÅGÅR · MotoGP · Warm Up/);
 assert.doesNotMatch(card.root.innerHTML,/Moto2 · Race/);
 assert.match(card.root.innerHTML,/SCHEMA/,'does not alter existing schedule content');
 assert.equal((card.root.innerHTML.match(/mgp-next-chip/g)||[]).length,1);
 card._live=null;card._render();assert.match(card.root.innerHTML,/Moto2 · Race/,'returns to next session');
 card._live={category:'Moto3',name:'Race'};card._hass.language='en-US';card._render();
 assert.match(card.root.innerHTML,/LIVE NOW · Moto3 · Race/);
 console.log('PASS: top toolbar prioritizes verified session and preserves next session fallback');
})().catch(e=>{console.error(e);process.exitCode=1;});
