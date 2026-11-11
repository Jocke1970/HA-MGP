'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync('frontend/ha-mgp-next-weekend-status.js','utf8');
const styles=[];
class Card {
  constructor() {
    this._hass={language:'sv',states:{
      'sensor.motogp_next_race':{attributes:{event_id:'gp-2',next_weekend_api_status:{
        event_id:'gp-2',schedule:{color:'green'},circuit:{color:'yellow'},entry_list:{color:'red'}
      }}}
    }};
    this.root={innerHTML:'',getElementById:()=>this.root,querySelector:()=>styles[0]||null,appendChild:x=>styles.push(x)};
    this.shadowRoot=this.root;
  }
  _render(){this.root.innerHTML='<div id="app"><div class="mgp-hero-copy"><div class="mgp-branded-eyebrow">MGP</div><h2>Next GP</h2></div></div>';}
}
const ctx={customElements:{get:()=>Card,whenDefined:()=>Promise.resolve()},document:{createElement:()=>({setAttribute(){}})},console};
(async()=>{
 vm.runInNewContext(src,ctx);await Promise.resolve();await Promise.resolve();
 const card=new Card();card._render();
 assert.match(card.root.innerHTML,/Schema/);
 assert.match(card.root.innerHTML,/Bana/);
 assert.match(card.root.innerHTML,/Startlista/);
 assert.equal((card.root.innerHTML.match(/mgp-weekend-verification-item"/g)||[]).length,3);
 assert.match(card.root.innerHTML,/data-color="green"/);
 assert.match(card.root.innerHTML,/data-color="yellow"/);
 assert.match(card.root.innerHTML,/data-color="red"/);
 assert.equal(styles.length,1);
 card._render();assert.equal(styles.length,1);
 card._hass.states['sensor.motogp_next_race'].attributes.event_id='different';
 card._render();assert.doesNotMatch(card.root.innerHTML,/mgp-weekend-verification-item/);
 console.log('PASS: GP-specific red/yellow/green dots and no stale cross-event status');
})().catch(e=>{console.error(e);process.exitCode=1;});
