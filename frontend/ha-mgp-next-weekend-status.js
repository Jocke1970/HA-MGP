/* HA-MGP: event-scoped verification dots for next weekend API results. */
(() => {
  'use strict';
  const TAG = 'ha-motogp-next-overview-card';
  const CSS = `
    .mgp-weekend-verification{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px;align-items:center}
    .mgp-weekend-verification-item{display:inline-flex;align-items:center;gap:5px;font-size:11px;
      color:var(--secondary-text-color);border:1px solid var(--divider-color,#ccc);
      border-radius:999px;padding:3px 7px;line-height:1.2;white-space:nowrap}
    .mgp-weekend-verification-dot{width:8px;height:8px;border-radius:50%;display:inline-block;
      flex-shrink:0;background:#d97706}
    .mgp-weekend-verification-item[data-color="green"] .mgp-weekend-verification-dot{background:#16a34a}
    .mgp-weekend-verification-item[data-color="yellow"] .mgp-weekend-verification-dot{background:#d97706}
    .mgp-weekend-verification-item[data-color="red"] .mgp-weekend-verification-dot{background:#dc2626}
  `;
  const LABELS = {
    sv: ['Schema','Bana','Startlista','Verifierad','Preliminär','Fel','Ej tillgänglig'],
    en: ['Schedule','Circuit','Entry list','Verified','Preliminary','Error','Unavailable'],
    es: ['Horario','Circuito','Inscritos','Verificado','Preliminar','Error','No disponible'],
    it: ['Programma','Circuito','Iscritti','Verificato','Provvisorio','Errore','Non disponibile'],
    fr: ['Programme','Circuit','Engagés','Vérifié','Provisoire','Erreur','Indisponible']
  };
  const SOURCES = [['schedule',0],['circuit',1],['entry_list',2]];
  function findStatus(card){
    const states = card._hass?.states;
    if(!states) return null;
    // Never reuse a previous event's status when the next-event sensor changes.
    for (const key of Object.keys(states)) {
      if(!key.startsWith('sensor.')) continue;
      const attrs = states[key]?.attributes || {};
      const status = attrs.next_weekend_api_status;
      if(!status || typeof status!=='object' || !status.event_id) continue;
      if(String(attrs.event_id||'') !== String(status.event_id)) continue;
      return status;
    }
    return null;
  }
  function render(card){
    const status = findStatus(card);
    if(!status) return '';
    const lang = String(card._hass?.language || card._hass?.locale?.language || 'en').split(/[-_]/)[0].toLowerCase();
    const t = LABELS[lang] || LABELS.en;
    return '<div class="mgp-weekend-verification" role="group" aria-label="API verification">'+
      SOURCES.map(([key,index]) => {
        const item=status[key];
        const color = ['green','yellow','red'].includes(item?.color) ? item.color : 'yellow';
        const label = color==='green' ? t[3] : color==='red' ? t[5] :
          item?.status==='unavailable' ? t[6] : t[4];
        const title = t[index]+': '+label;
        return '<span class="mgp-weekend-verification-item" data-color="'+color+'" title="'+title+
          '" aria-label="'+title+'"><span class="mgp-weekend-verification-dot" aria-hidden="true"></span>'+
          t[index]+'</span>';
      }).join('')+'</div>';
  }
  function install(){
    const Card=customElements.get(TAG);
    if(!Card || Card.prototype._mgpWeekendVerification) return;
    const original=Card.prototype._render;
    Card.prototype._render=function(...args){
      const result=original.apply(this,args);
      const root=this.shadowRoot, view=root?.getElementById?.('app');
      if(!view) return result;
      const indicator=render(this);
      if(!indicator) return result;
      const html=view.innerHTML;
      const hero=html.indexOf('<div class="mgp-hero-copy">');
      const heading=html.indexOf('<h2>',hero);
      if(hero<0 || heading<0 || heading-hero>2000) return result;
      const pos=html.lastIndexOf('</div>',heading);
      if(pos<hero) return result;
      if(!root.querySelector?.('[data-mgp-weekend-verification-style]')){
        const style=document.createElement('style');
        style.setAttribute('data-mgp-weekend-verification-style','');
        style.textContent=CSS;
        root.appendChild(style);
      }
      view.innerHTML=html.slice(0,pos+6)+indicator+html.slice(pos+6);
      return result;
    };
    Card.prototype._mgpWeekendVerification=true;
  }
  customElements.whenDefined(TAG).then(install);
})();
