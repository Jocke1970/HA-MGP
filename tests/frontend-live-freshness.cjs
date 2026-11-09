#!/usr/bin/env node
'use strict';
// Isolated browser lifecycle regression against the exact HACS-shipped Next JS.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const code=fs.readFileSync(process.argv[2]||
  'custom_components/motogp_sensor/www/ha-mgp.js','utf8');
assert.match(code,/0\.3\.0-dev\.58/);
const anchor='/* MotoGP Next: approved lap records, personal bests, gap trends and feed freshness.';
const start=code.indexOf(anchor);
const end=code.indexOf('\n})();',start);
assert.ok(start>=0&&end>start,'Bundled freshness addon must be found');
const addon=code.slice(start,end+6);
let now=Date.parse('2026-11-07T11:18:00.000Z');
class Clock extends Date {
  constructor(...args){super(...(args.length?args:[now]));}
  static now(){return now;}
}
const timers=new Map();
let nextId=1;
function badgeFrom(html) {
  const match=html.match(/<span class="nt-feed-age([^"]*)" data-motogp-feed-age="([^"]*)" data-motogp-feed-interval="([^"]*)"[^>]*>([^<]*)<\/span>/);
  if(!match)return null;
  const names=new Set(match[1].trim().split(/\s+/).filter(Boolean));
  return {
    attributes:{'data-motogp-feed-age':match[2],'data-motogp-feed-interval':match[3]},
    textContent:match[4],
    names,
    classList:{
      remove(...a){a.forEach(x=>names.delete(x));},
      add(...a){a.forEach(x=>names.add(x));},
    },
    getAttribute(k){return this.attributes[k]??null;}
  };
}
class Timing {
  static buildInfo={version:'0.2.0-split.2'};
  constructor(){
    this._ids={riders:'sensor.motogp_rider_positions'};
    this._today='2026-11-07';this._event='Test';
    this._live={key:'race-01'};this._spoilerFlag=false;
    this._snapshot={day:this._today,category:'MotoGP',name:'FP2',
      riders:[{number:93,position:1,surname:'MARQUEZ',last_lap_time:"1'52.034"}]};
    this.isConnected=false;
    const root={html:'',badge:null,styles:[],querySelector(s){
      if(s==='[data-motogp-gap-trends]')return this.styles.find(x=>x.marker)||null;
      if(s==='[data-motogp-feed-age]')return this.badge;
      return null;
    },appendChild(element){this.styles.push(element);}};
    this.shadowRoot=root;
  }
  _spoiler(){return this._spoilerFlag;}
  _timing(){
    return '<section><div class="nt-scroll"></div>'+
      '<span class="nt-toggle">⌃ Dölj förare</span></section>';
  }
  _render(){
    this.shadowRoot.html=this._timing();
    this.shadowRoot.badge=badgeFrom(this.shadowRoot.html);
  }
  connectedCallback(){}
  disconnectedCallback(){}
}
const ctx={
  Date:Clock,console,
  customElements:{get:()=>Timing,whenDefined:()=>Promise.resolve()},
  document:{createElement:()=>({setAttribute(k){if(k==='data-motogp-gap-trends')this.marker=true;},textContent:''})},
  setInterval:(fn,ms)=>{const id=nextId++;timers.set(id,{fn,ms});return id;},
  clearInterval:(id)=>timers.delete(id),
};
(async()=>{
  vm.runInNewContext(addon,ctx);
  for(let i=0;i<4;i++)await Promise.resolve();
  const card=new Timing();
  const attributes={live_poll_at:new Date(now-3000).toISOString(),live_poll_interval_seconds:5};
  card._hass={states:{'sensor.motogp_rider_positions':{attributes}}};

  // This assertion reproduced the user-visible bug: the previous code
  // rendered a hardcoded "Uppdateringstid okänd" even with valid feed metadata.
  let html=card._timing();
  assert.match(html,/class="nt-feed-age ok"/,'first render is green without a clock tick');
  assert.match(html,/Feed OK · 3 s/,'valid backend timestamp renders immediately');

  // Even when the element was connected before patch installation, rerender
  // should establish its own timer and keep the badge refreshed.
  card.isConnected=true;
  card._render();
  assert.equal(timers.size,1,'connected rerender starts one clock');
  assert.match(card.shadowRoot.html,/Feed OK · 3 s/);
  now+=25000;
  for(const item of timers.values())item.fn();
  assert.match(card.shadowRoot.badge.textContent,/Feed fördröjd · 28 s/);
  assert.ok(card.shadowRoot.badge.names.has('delayed'));

  now+=75000;
  for(const item of timers.values())item.fn();
  assert.match(card.shadowRoot.badge.textContent,/Feed saknas/);
  assert.ok(card.shadowRoot.badge.names.has('missing'));

  attributes.live_poll_at=new Date(now-1000).toISOString();
  card._render();
  assert.match(card.shadowRoot.html,/Feed OK · 1 s/,'new poll corrects status without timer tick');
  assert.equal(timers.size,1,'rerenders never create duplicate timers');

  attributes.live_poll_interval_seconds=30;
  attributes.live_poll_at=new Date(now-70000).toISOString();
  assert.match(card._timing(),/Feed OK · 70 s/,'threshold respects 30-second poll interval');

  attributes.live_poll_interval_seconds=5;
  attributes.live_poll_at='invalid';
  assert.match(card._timing(),/Uppdateringstid okänd/,'unparseable timestamp handled');
  attributes.live_poll_at=new Date(now+9000).toISOString();
  assert.match(card._timing(),/Uppdateringstid okänd/,'future timestamps rejected');
  attributes.live_poll_at=null;
  assert.match(card._timing(),/Uppdateringstid okänd/,'missing metadata handled');

  card._spoilerFlag=true;
  assert.doesNotMatch(card._timing(),/nt-feed-age/,'spoiler hides the badge');
  card._spoilerFlag=false;
  card.disconnectedCallback();
  assert.equal(timers.size,0,'card disconnect clears timers');
  console.log('PASS: fresh, delayed, missing, adaptive interval, invalid, first-render, late-attach, spoiler and timer teardown');
})().catch(err=>{console.error(err);process.exitCode=1;});
