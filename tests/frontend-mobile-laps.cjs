'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const bundle=fs.readFileSync(process.argv[2]||'custom_components/motogp_sensor/www/ha-mgp.js','utf8');
assert.match(bundle,/0\.3\.0-dev\.73/);
const pos=bundle.lastIndexOf('/* MotoGP Next responsive timing and authenticated lap-history dialog.');
assert.ok(pos>0,'responsive popup addon must be bundled last');
const nextAddon=bundle.indexOf('/* MotoGP Next qualifying',pos);
const addon=bundle.slice(pos,nextAddon>pos?nextAddon:undefined);
const rider={rider_id:'r1',surname:'BINDER',number:33,num_lap:3,last_lap_time:"1'49.111"};
let serverCalls=[],reply={rider_id:'r1',name:'BINDER',number:'33',
  laps:[{lap:1,time:"1'51.321",seconds:111.321},{lap:3,time:"1'49.111",seconds:109.111}],
  best_seconds:109.111,missing_laps:[2],session_id:'s1'};
class Timing {
  static buildInfo={version:'0.2.0-split.2'};
  constructor(){
    this._snapshot={day:'2026-11-07',category:'MotoGP',name:'Q2',riders:[rider]};
    this._activeKey='s1';this._today='2026-11-07';this.spoiler=false;
    this.isConnected=false;
    this._hass={callWS:message=>{serverCalls.push(message);return Promise.resolve(reply);}};
    this.styles=[];this.listeners={};
    this.app={html:'',modal:'',insertAdjacentHTML:(where,html)=>{
      assert.equal(where,'beforeend');this.app.modal+=html;
    }};
    this.shadowRoot={
      querySelector:(q)=>{
        if(q==='[data-motogp-mobile-laps-style]')return this.styles[0]||null;
        if(q==='[data-motogp-laps-scroll]'&&this.app.modal)return {scrollTop:0};
        if(q==='[data-motogp-laps-close]'&&this.app.modal)return {focus:()=>{}};
        return null;
      },
      getElementById:q=>q==='app'?this.app:null,
      appendChild:x=>this.styles.push(x),
      addEventListener:(name,fn)=>this.listeners[name]=fn,
      removeEventListener:(name,fn)=>{if(this.listeners[name]===fn)delete this.listeners[name];}
    };
    this.baseClicks=0;
  }
  _spoiler(){return this.spoiler;}
  _timing(){
    return '<section class="nt-card"><div class="nt-scroll"><div class="nt-table">'+
      '<div class="nt-row nt-heading"><span>POS</span><span>FÖRARE</span><span>VARV</span>'+
      '<span>SENASTE</span><span>FRAMFÖR</span><span>LEDARE</span><span>STATUS</span></div>'+
      '<div class="nt-row"><span>1</span><span>BINDER #33</span><span>3</span>'+
      '<span>1&#39;49.111</span><span>0.000</span><span>0.000</span><span>CL</span></div>'+
      '</div></div></section>';
  }
  _render(){this.app.html=this._timing();this.app.modal='';}
  _click(){this.baseClicks++;}
  connectedCallback(){}
  disconnectedCallback(){}
}
const context={
  console,Promise,customElements:{get:()=>Timing,whenDefined:()=>Promise.resolve()},
  document:{createElement:()=>({setAttribute(){},textContent:''})}
};
const clicked=(id)=>({
  closest:sel=>sel==='[data-motogp-rider-id]'?{getAttribute:()=>id}:null
});
(async()=>{
  vm.runInNewContext(addon,context);
  for(let i=0;i<4;i++)await Promise.resolve();
  const card=new Timing();card.isConnected=true;card.connectedCallback();
  const html=card._timing();
  assert.match(html,/data-motogp-rider-id="r1" role="button" tabindex="0"/);
  assert.match(html,/aria-haspopup="dialog"/);
  assert.equal(card.styles.length,1);
  assert.match(card.styles[0].textContent,/@container \(max-width:620px\)/);
  assert.match(card.styles[0].textContent,/grid-template-columns:27px/);
  assert.match(card.styles[0].textContent,/.nt-card .nt-row>span:nth-child\(n\+5\)\{display:none\}/);
  card._click({target:clicked('r1')});
  assert.match(card.app.modal,/Läser sparade varvtider/);
  assert.equal(serverCalls.length,1);
  assert.deepEqual(JSON.parse(JSON.stringify(serverCalls[0])),
    {type:'motogp_sensor/rider_laps',rider_id:'r1'});
  for(let i=0;i<4;i++)await Promise.resolve();
  assert.match(card.app.modal,/1&#39;49.111/);
  assert.match(card.app.modal,/Saknade varv: 2/);
  assert.match(card.app.modal,/PB/);
  assert.doesNotMatch(card.app.modal,/1&#39;50.000/,'never invent missing lap time');
  assert.equal(card.styles.length,1,'no duplicate stylesheet during re-renders');
  card.spoiler=true;card._render();
  assert.equal(card.app.modal,'','spoiler hides popup immediately');
  assert.equal(card._motogpLapModal,null);
  card._click({target:clicked('r1')});
  assert.equal(serverCalls.length,1,'no spoiler cannot query archived laps');
  card.spoiler=false;
  card._motogpOpenLaps('r1');
  await Promise.resolve();
  card._activeKey='new-session';card._render();
  assert.equal(card.app.modal,'','new session must hide old popup');
  assert.equal(card._motogpLapModal,null);
  card._activeKey='s1';
  card._motogpOpenLaps('r1');
  for(let i=0;i<4;i++)await Promise.resolve();
  card.listeners.keydown({key:'Escape',preventDefault(){},target:{}});
  assert.equal(card.app.modal,'','Escape closes dialog');
  const count=serverCalls.length;
  card._motogpOpenLaps('not-a-rider');
  assert.equal(serverCalls.length,count,'unknown riders cannot be requested');
  card.disconnectedCallback();
  assert.equal(card.listeners.keydown,undefined,'keyboard listeners cleaned on detach');
  console.log('PASS: responsive 4-column grid, click popup, exact archived laps, PB, missing laps, auth WS request, spoiler, session switch, Escape and cleanup');
})().catch(e=>{console.error(e);process.exitCode=1;});
