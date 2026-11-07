'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const code=fs.readFileSync(process.argv[2]||'frontend/ha-motogp-next-session-history.js','utf8');
let styleCount=0,latestRequest=null,pending=null;
class Overview{
  static buildInfo={version:'0.2.0-split.2'};
  constructor(){
    this._ids={race:'race'};
    this.hidden=false;
    this._hass={states:{race:{state:'Qatar',attributes:{
      date_start:'2026-11-06',date_end:'2026-11-08',sessions_all:[
        {id:'sprint-2026',name:'Sprint',category:'MotoGP',status:'FINISHED'},
        {id:'moto2q1-26',name:'Q1',category:'Moto2',status:'FINISHED'},
        {id:'moto3race',name:'Race',category:'Moto3',status:'NOT-STARTED'},
        {id:'moto3fp2',name:'FP2',category:'Moto3',status:'CANCELLED'}
      ]
    }}},callWS:args=>{latestRequest=args;return new Promise(resolve=>{pending=resolve;});}};
    this.view={innerHTML:'',insertAdjacentHTML:(_where,html)=>{this.view.innerHTML+=html;}};
    this.styles=[];
    this.shadowRoot={
      querySelector:selector=>selector==='[data-motogp-history-style]'?this.styles[0]||null:null,
      appendChild:node=>{this.styles.push(node);styleCount++;},
      getElementById:id=>id==='app'?this.view:null,
      addEventListener(){},removeEventListener(){}
    };
  }
  _spoiler(){return this.hidden;}
  _schedule(){return '<section class="panel"><div class="tiles">'+
    this._hass.states.race.attributes.sessions_all.map(s=>
      '<div class="tile"><div class="row">17:00 · KLART</div><div class="name">'+
      s.category+' · '+s.name+'</div></div>').join('')+'</div></section>';}
  _click(){this.unhandled=true;}
  _render(){this.view.innerHTML=this._schedule();}
  connectedCallback(){}
  disconnectedCallback(){}
}
const ctx={customElements:{get:()=>Overview,whenDefined:()=>Promise.resolve()},console,
  document:{createElement:()=>({setAttribute(){},textContent:''})}};
const click=(card,id)=>card._click({target:{closest:selector=>selector==='[data-motogp-history-session]'?{getAttribute:()=>id}:null}});
(async()=>{
  vm.runInNewContext(code,ctx);
  for(let i=0;i<4;i++)await Promise.resolve();
  assert.equal(Overview.prototype._motogpSessionHistory,'history-20261107-01');
  const c=new Overview();c._render();
  const visible=c.view.innerHTML;
  assert.equal((visible.match(/data-motogp-history-session=/g)||[]).length,2);
  assert.match(visible,/data-motogp-history-session="sprint-2026"/);
  assert.match(visible,/data-motogp-history-session="moto2q1-26"/);
  assert.doesNotMatch(visible,/data-motogp-history-session="moto3race"/);
  assert.doesNotMatch(visible,/data-motogp-history-session="moto3fp2"/);
  assert.equal(styleCount,1);
  c._render();assert.equal(styleCount,1);
  click(c,'moto3race');assert.equal(latestRequest,null,'never fetch unfinished race');
  click(c,'sprint-2026');
  assert.equal(latestRequest.type,'motogp_sensor/session_history');
  assert.equal(latestRequest.session_id,'sprint-2026');
  assert.match(c.view.innerHTML,/Läser sparade varvtider/);
  pending({available:true,category:'MotoGP',session_id:'sprint-2026',observed_laps:12,partial:true,riders:[
    {number:'72',name:'BEZZECCHI',lap_count:5,last_lap:5,last_time:"1'54.900",
      best_lap:2,best_time:"1'54.280",partial:false},
    {number:'93',name:'<script>x</script>',lap_count:7,last_lap:8,last_time:"1'56.900",
      best_lap:4,best_time:"1'53.520",partial:true}
  ]});
  for(let i=0;i<5;i++)await Promise.resolve();
  assert.match(c.view.innerHTML,/Sorterat efter snabbaste observerade varv/);
  assert.match(c.view.innerHTML,/1&#39;54.280/);
  assert.match(c.view.innerHTML,/12 observerade varv/);
  assert.match(c.view.innerHTML,/Ofullständiga varv/);
  assert.doesNotMatch(c.view.innerHTML,/<script>x/,'archive names escaped');
  c._motogpHistoryClose();
  assert.doesNotMatch(c.view.innerHTML,/nh-overlay/);
  c.hidden=true;c._render();
  assert.doesNotMatch(c.view.innerHTML,/data-motogp-history-session/);
  click(c,'sprint-2026');assert.equal(c._motogpHistory,null);
  c.hidden=false;click(c,'sprint-2026');const previous=pending;
  c._hass.states.race.state='New event';c._render();
  previous({available:true,riders:[]});
  for(let i=0;i<4;i++)await Promise.resolve();
  assert.doesNotMatch(c.view.innerHTML,/nh-overlay/,'stale event response ignored');
  c._hass.states.race.state='Qatar';click(c,'moto2q1-26');
  pending({available:false,riders:[],observed_laps:0,partial:true});
  for(let i=0;i<4;i++)await Promise.resolve();
  assert.match(c.view.innerHTML,/Inga observerade varv finns sparade/);
  c._motogpHistoryClose();
  console.log('PASS: finished schedule history buttons, archive time modal, no fake classification, spoiler, stale session and missing archive');
})().catch(e=>{console.error(e);process.exitCode=1;});
