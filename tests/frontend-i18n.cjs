'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const locales=Object.fromEntries(['en','sv','es','it','fr'].map(lang=>[
  lang,JSON.parse(fs.readFileSync('frontend/locales/'+lang+'.json','utf8'))]));
const expected=Object.keys(locales.en);
assert.ok(expected.length>=40);
for(const [lang,strings] of Object.entries(locales)){
 assert.deepEqual(Object.keys(strings).sort(),expected.slice().sort(),'missing '+lang+' UI keys');
 assert.ok(strings['🏆 VM-ställning']);
}
class Demo{
 constructor(language){this._hass={language};this.shadowRoot={getElementById:()=>this.view};this.view={innerHTML:''};}
 _render(){
  this.view.innerHTML='<section><span>🏆 VM-ställning</span><small>Lap record</small>'+
   '<b>LEDARE</b><span>🗓️ Helgschema</span><div>Förare / team</div>'+
   '<p>BEZZECCHI</p><button data-timing="1" title="KEEP-ATTRIBUTE">Visa förare</button></section>';
 }
}
const registry=new Map([['ha-motogp-next-overview-card',Demo],['ha-motogp-next-timing-card',class Timing extends Demo{}]]);
const source=fs.readFileSync('frontend/ha-mgp-i18n.js','utf8').replace('__MGP_UI_LOCALES_JSON__',JSON.stringify(locales));
const sandbox={console,customElements:{get:x=>registry.get(x),whenDefined:()=>Promise.resolve()}};
(async()=>{
 vm.runInNewContext(source,sandbox);
 for(let i=0;i<5;i++)await Promise.resolve();
 const titles={en:'Championship standings',sv:'VM-ställning',es:'Clasificación del campeonato',it:'Classifica mondiale',fr:'Classement du championnat'};
 for(const lang of Object.keys(locales)){
  const x=new Demo(lang+'-'+lang.toUpperCase());x._render();
  assert.match(x.view.innerHTML,new RegExp(titles[lang]),lang);
  assert.match(x.view.innerHTML,/BEZZECCHI/,'rider name must remain unchanged');
  assert.match(x.view.innerHTML,/data-timing="1" title="KEEP-ATTRIBUTE"/,'attributes unchanged');
  assert.match(x.view.innerHTML,new RegExp(locales[lang]['Lap record']),'record label translated');
 }
 const fallback=new Demo('de-DE');fallback._render();
 assert.match(fallback.view.innerHTML,/Championship standings/,'unsupported languages fall back to English');
 const missing=new Demo('');missing._render();
 assert.match(missing.view.innerHTML,/VM-ställning/,'legacy harness without HA language remains unchanged');
 const realTiming=new (registry.get('ha-motogp-next-timing-card'))('fr-FR');realTiming._render();
 assert.match(realTiming.view.innerHTML,/Classement du championnat/,'timing and overview both localize');
 console.log('PASS: HA-MGP five locales, regional settings, English fallback, timing, untouched rider names/attributes');
})().catch(e=>{console.error(e);process.exitCode=1;});
