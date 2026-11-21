'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('frontend/ha-mgp-api-utility.js','utf8');
const calls=[];
const doc={createElement:()=>({setAttribute(){},textContent:''})};
class Overview {
  constructor(){
    this._ids={race:'sensor.motogp_next_race',status:'sensor.motogp_session_status'};
    this._hass={states:{
      'sensor.motogp_next_race':{attributes:{
        event_id:'portugal-results-uuid',sessions_all:[
          {id:'q2-results-uuid',category:'Moto2',name:'Q2',category_id:'moto2-results-uuid'},
          {id:'',category:'MotoGP',name:'Race',source:'broadcast_schedule'},
        ]}},
      'sensor.motogp_session_status':{attributes:{category:'Moto2',session_shortname:'Q2',session_status_id:'S'}},
      'switch.motogp_no_spoiler':{state:'off'},
    },callWS:async request=>{
      calls.push(request);
      return {action:request.action,context:{season_id:'season-uuid',live_session_id:'5'},
              fetched_at:'2026-11-21T13:00:00Z',data:{head:{session_id:'5'}}};
    }};
    this.root={innerHTML:'',listeners:{},
      getElementById:key=>key==='app'?this.root:null,
      querySelector:()=>null,
      appendChild(){},
      addEventListener:(name,fn)=>{this.root.listeners[name]=fn},
      insertAdjacentHTML:(position,markup)=>{this.root.innerHTML+=markup}};
    this.shadowRoot=this.root;
  }
  _render(){this.root.innerHTML='<section>Existing GP header</section>';}
  _click(){this.legacy=true;}
}
const ctx={customElements:{get:()=>Overview,whenDefined:()=>Promise.resolve()},document:doc,console,
  navigator:{clipboard:{writeText:async()=>{}}}};
const button=(type,action)=>({
  hasAttribute:key=>key===type,
  getAttribute:key=>key==='data-mgp-util-action'?action:null
});
const event=(obj)=>({target:{closest:()=>obj}});
(async()=>{
 vm.runInNewContext(source,ctx);await Promise.resolve();await Promise.resolve();
 const card=new Overview();card.connectedCallback();
 card._render();
 assert.match(card.root.innerHTML,/API-verktyg/);
 assert.doesNotMatch(card.root.innerHTML,/Results-sessioner/,'collapsed by default');
 card._click(event(button('data-mgp-util-toggle')));
 assert.match(card.root.innerHTML,/portugal-results-uuid/);
 assert.match(card.root.innerHTML,/q2-results-uuid/);
 assert.match(card.root.innerHTML,/Live · sessions-ID/);
 assert.match(card.root.innerHTML,/Results-sessioner/);
 card.root.listeners.change({target:{matches:sel=>sel==='[data-mgp-util-category]',value:'Moto2'}});
 card._click(event(button('data-mgp-util-action','classification')));
 await new Promise(resolve=>setTimeout(resolve,0));
 assert.equal(calls.length,1);
 assert.equal(calls[0].type,'motogp_sensor/api_probe');
 assert.equal(calls[0].category,'Moto2');
 assert.equal(calls[0].session_uuid,'q2-results-uuid');
 assert.match(card.root.innerHTML,/season-uuid/);
 assert.match(card.root.innerHTML,/head/);
 card._hass.states['switch.motogp_no_spoiler'].state='on';
 card._render();
 assert.match(card.root.innerHTML,/API-verktyget är låst/);
 assert.match(card.root.innerHTML,/disabled/);
 console.log('PASS: utility menu IDs, scoped manual calls, JSON, No Spoiler');
})().catch(err=>{console.error(err);process.exitCode=1;});
