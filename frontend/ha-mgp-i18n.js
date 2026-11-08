/* HA-MGP UI localization. Catalogs embedded into the single versioned HACS JS file. */
(() => {
  'use strict';
  const CATALOGS=__MGP_UI_LOCALES_JSON__;
  const SUPPORTED=['en','sv','es','it','fr'];
  const localeFor=hass=>{
    // No HA language in isolated preview/test harnesses; keep their raw legacy strings.
    const value=String(hass?.language||hass?.locale?.language||'').trim().toLowerCase();
    if(!value)return '';
    const base=value.split(/[-_]/)[0];
    return SUPPORTED.includes(base)?base:'en';
  };
  function translate(html,lang){
    const source=CATALOGS.sv, target=CATALOGS[lang]||CATALOGS.en;
    if(!target||!source||typeof html!=='string')return html;
    // Translate visible text nodes, never data attributes, HTML tags, SVG paths,
    // team/rider names or user-supplied external feed fields.
    return html.replace(/>([^<>]*)</g,(full,raw)=>{
      const trimmed=raw.trim();
      if(!trimmed)return full;
      const translated=Object.hasOwn(target,trimmed)?target[trimmed]:null;
      if(translated!==null)return '>'+raw.replace(trimmed,translated)+'<';
      // Session countdown prefixes contain dynamic data; translate only the prefix.
      const prefix=trimmed.match(/^(Nästa:)(\s.*)$/);
      if(prefix)return '>'+raw.replace(trimmed,(target['Nästa:']||CATALOGS.en['Nästa:'])+prefix[2])+'<';
      return full;
    });
  }
  function install(){
    for(const tag of ['ha-motogp-next-overview-card','ha-motogp-next-timing-card']){
      const Type=customElements.get(tag);
      if(!Type||Type.prototype._mgpI18n)continue;
      const original=Type.prototype._render;
      Type.prototype._render=function(...args){
        const result=original.apply(this,args);
        const language=localeFor(this._hass);
        const view=this.shadowRoot?.getElementById?.('app');
        if(language&&view&&typeof view.innerHTML==='string'){
          const updated=translate(view.innerHTML,language);
          if(updated!==view.innerHTML)view.innerHTML=updated;
        }
        return result;
      };
      Type.prototype._mgpI18n=true;
    }
  }
  customElements.whenDefined('ha-motogp-next-timing-card').then(install);
})();
