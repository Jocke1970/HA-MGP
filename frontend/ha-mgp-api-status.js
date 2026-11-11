/* HA-MGP: read-only API connectivity indicator in the event hero. */
(() => {
  'use strict';
  const TAG='ha-motogp-next-overview-card';
  const BUILD='api-status-20261108-01';
  const ENTITY='binary_sensor.motogp_live_timing_online';
  const STYLE=`
    .mgp-api-indicator{display:inline-flex;align-items:center;gap:6px;padding:4px 8px;border:1px solid var(--divider-color,#ddd);border-radius:999px;font-size:11px;font-weight:800;color:var(--secondary-text-color);white-space:nowrap;line-height:1.2}
    .mgp-api-dot{display:inline-block;width:8px;height:8px;border-radius:50%;flex:none;background:#9ca3af}
    .mgp-api-indicator[data-state="on"] .mgp-api-dot{background:#16a34a;box-shadow:0 0 0 2px rgba(22,163,74,.12)}
    .mgp-api-indicator[data-state="off"] .mgp-api-dot{background:#9ca3af}
    .mgp-api-indicator[data-state="unknown"] .mgp-api-dot{background:#d97706}
    .mgp-api-indicator[data-state="on"]{border-color:rgba(22,163,74,.24)}
    .mgp-api-indicator[data-state="unknown"]{border-color:rgba(217,119,6,.3)}
  `;
  const TEXT={
    sv:['Livetiming API','Online','Offline','Okänd'],
    en:['Live timing API','Online','Offline','Unknown'],
    es:['API de tiempos en vivo','En línea','Desconectada','Desconocida'],
    it:['API tempi live','Online','Offline','Sconosciuto'],
    fr:['API chronométrage','En ligne','Hors ligne','Inconnu']
  };
  function indicator(card){
    const raw=card._hass?.states?.[ENTITY]?.state;
    const status=raw==='on'?'on':raw==='off'?'off':'unknown';
    const language=String(card._hass?.language||card._hass?.locale?.language||'en').split(/[-_]/)[0].toLowerCase();
    const labels=TEXT[language]||TEXT.en;
    const message=status==='on'?labels[1]:status==='off'?labels[2]:labels[3];
    return '<span class="mgp-api-indicator" data-state="'+status+'" role="status" aria-label="'+
      labels[0]+': '+message+'" title="'+labels[0]+': '+message+'">'+
      '<span class="mgp-api-dot" aria-hidden="true"></span><span>'+labels[0]+'</span></span>';
  }
  function install(){
    const Card=customElements.get(TAG);
    if(!Card||Card.prototype._mgpApiIndicator)return;
    const original=Card.prototype._render;
    Card.prototype._render=function(...args){
      const result=original.apply(this,args);
      if(!this._hass||!this.shadowRoot)return result;
      const view=this.shadowRoot.getElementById?.('app');
      if(!view)return result;
      const html=view.innerHTML;
      const hero=html.indexOf('<div class="mgp-hero-copy">');
      if(hero<0)return result; // Calendar/off-week view has no event hero.
      if(!this.shadowRoot.querySelector?.('[data-mgp-api-status-style]')){
        const style=document.createElement('style');
        style.setAttribute('data-mgp-api-status-style','');
        style.textContent=STYLE;
        this.shadowRoot.appendChild(style);
      }
      const marker='<div class="mgp-branded-eyebrow">';
      // Brand appears in the left hero: append the API indicator as compact badge.
      const brand=html.indexOf('mgp-branded-eyebrow',hero);
      const h2=html.indexOf('<h2>',hero);
      if(brand<0||h2<0||brand>h2)return result;
      const pos=html.lastIndexOf('</div>',h2);
      if(pos<brand)return result;
      view.innerHTML=html.slice(0,pos+6)+indicator(this)+html.slice(pos+6);
      return result;
    };
    Card.prototype._mgpApiIndicator=BUILD;
  }
  customElements.whenDefined(TAG).then(install);
})();