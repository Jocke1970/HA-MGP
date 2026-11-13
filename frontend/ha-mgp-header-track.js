/* MotoGP Next circuit layout & track weather in the event header.
 * Track outlines derived/simplified from:
 * GameDev-Toolkit/global-motorsport-circuits-json (Apache License 2.0).
 * https://github.com/GameDev-Toolkit/global-motorsport-circuits-json
 * Diagram only: no official corner/start-finish or rider position asserted.
 */
(() => {
'use strict';
const TAG='ha-motogp-next-overview-card';
const REQUIRED='0.2.0-split.2';
const BUILD='header-track-weather-20261113-05';
const BRAND_SRC='__MGP_APPROVED_BRAND_DATA_URI__';
const TRACKS={"lusail":{"names":["lusail","losail"],"d":"M111.3,49.6 L111.3,39.4 L112,37.1 L113.3,34.9 L134.8,11.3 L136,10.6 L138,10 L140.1,10.2 L141.8,11.1 L148.3,17 L149.3,19.5 L149.2,22.1 L148,24.4 L134.2,39.6 L133.7,41.5 L134.5,43.3 L136.4,44.2 L137.9,44 L164,33.8 L166.1,33.9 L168.5,35.2 L170.1,37.5 L170.4,40 L169.3,42.9 L164.6,47.4 L161.9,51.2 L159.8,56.1 L158.5,61.8 L157.2,64 L155.7,65.2 L154,65.9 L141.3,68.9 L140.1,69.4 L138.8,70.6 L138,72.3 L138,73.5 L138.4,75.2 L141.8,79.1 L146.3,82.6 L150.3,84.7 L155.6,86.6 L160.6,87.3 L165.1,87.4 L186.3,84.9 L189.5,85.5 L191.7,86.7 L194.1,89.5 L198.8,98.2 L199.4,100.5 L199.2,101.9 L198.5,103.8 L190.9,115.7 L188.8,117.4 L186.2,117.9 L162.2,113.1 L160.3,113.2 L158.4,113.9 L156.2,116.2 L139.9,147.7 L138.1,149.3 L136,150 L133.8,149.8 L131.8,148.8 L130.3,147.2 L91.9,77.3 L89.1,72.9 L81.5,58.4 L80.7,56.2 L81,53.2 L82.5,51 L84.8,49.6 L87.3,49.5 L89.4,50.1 L102.7,58.5 L104.8,59.1 L107.1,59 L109,58 L110.5,56.3 L111.2,54 L111.3,49.6 Z"},"mandalika":{"names":["mandalika"],"d":"M123.5,126.4 L186.3,127.8 L189.4,127.6 L191.4,127.1 L193.3,126.1 L194.9,124.6 L195.9,123 L196.7,121 L197,116.7 L193.7,102.9 L192.6,99.5 L190.9,97.2 L188.9,95.8 L186.8,95.2 L182.4,95 L179.7,93.9 L177.7,91.7 L176.7,88.9 L176.9,85.9 L178,82.6 L179.7,80 L184.3,74.6 L185.7,71.9 L186.7,68.7 L187.2,65.2 L187.2,61.3 L186.4,55.6 L185.4,51.2 L182.6,45.1 L178.2,39.4 L171.4,33.5 L168.4,31.6 L165.4,30 L162.1,28.9 L158.4,28.2 L147.9,28.1 L142.3,27.2 L137.8,25.7 L124.6,19.6 L114.3,16 L106.3,13.7 L91.8,10.3 L89.3,10 L87.2,10.3 L85.2,11.4 L83.8,13 L83.1,15.1 L83,17.6 L84.1,22.5 L88.5,35.8 L89.8,38.6 L92.4,41.8 L95.9,44 L99.8,45.2 L106.2,45.5 L109.8,46.3 L113.5,48.1 L116.9,51 L119.3,54.4 L120.9,58.5 L124.4,76.7 L124.4,79.4 L123.9,82.1 L123,84.5 L121.6,86.6 L117.9,90.1 L112.3,93.4 L109.8,95.2 L107,98 L104.5,101.5 L100.1,109.7 L96.2,120.6 L95.2,124.4 L94.7,127.9 L94.7,131.5 L95.2,135 L96.3,139 L97.9,143.1 L99.7,146.3 L101.7,148.8 L103.5,149.9 L105.3,149.9 L106.8,148.8 L107.7,146.7 L107.8,145 L107.3,142.7 L104.1,135.6 L103.5,133.6 L103.7,131.2 L105.2,129 L107.6,127.2 L110.7,126.3 L123.3,126.4 Z"},"goiania":{"names":["goiania","goiânia"],"d":"M155.1,40.4 L40.8,41.1 L30.7,42 L25.6,43.6 L21.5,45.7 L17.4,49 L14.3,52.7 L11.8,57 L10.4,61.4 L10,66.1 L10.6,71.1 L12,75.5 L14.3,80 L21.6,88.7 L28,93.5 L47.5,105 L61.9,112.9 L72.7,117.2 L82.8,119.3 L95.4,119.6 L106.6,118.8 L115.3,117.5 L120.7,116 L125.5,113.5 L129.6,109.7 L132,105 L132.4,100.2 L130.6,95.7 L127.9,92.8 L124.6,90.7 L120.8,89.5 L116.5,89.1 L109.3,90.4 L97.6,95.8 L91.5,97.5 L83.5,97.8 L75.8,96 L58.4,87.5 L50.3,82.7 L46,79.1 L43.5,75.7 L42.5,72 L43.3,68.6 L45.6,65.5 L51,62.4 L57.2,61.5 L63.5,62.2 L76,65.7 L84.3,66.8 L93.8,66.5 L111.8,63.8 L120.6,63.2 L135.3,63.8 L146.5,65.9 L154.4,69.2 L156.8,71.4 L158.6,74.1 L159.2,78.9 L156.5,88.6 L157,91.7 L158.7,94.5 L162.2,97.4 L166.6,99.7 L171.7,101.1 L177,101.4 L186.3,100.4 L198,97.2 L257.1,74.8 L261.9,72.5 L265.6,69.8 L268.3,66.5 L269.8,62.8 L269.9,59.6 L269,56.5 L266.7,52.6 L263.7,49.1 L256.7,44.6 L246.5,41.4 L234.9,40.4 L155.5,40.4 Z"},"brno":{"names":["brno"],"d":"M85,10.9 L30.7,10.3 L21.7,10.9 L16.8,13.2 L13.1,17.4 L11.1,23 L11.3,28.5 L12.6,31.8 L14.5,34.7 L17.2,37.3 L20.2,39.1 L24.6,40.5 L40.2,43 L55.1,47.8 L71.6,55.1 L104.4,70.9 L108.6,73.5 L110.6,75.8 L111.9,78.5 L112.5,81.4 L112.3,84.4 L110,88.7 L102,95 L99.3,98.6 L98.3,104.1 L100.1,109.5 L104.8,114.3 L149,146.7 L153.5,149.2 L159.2,149.9 L161.7,149.1 L163.7,147.6 L166.7,142.5 L169.3,132.9 L168.5,128.7 L166,125.3 L163.1,123.5 L154.5,120.5 L152.3,118.8 L150.7,116.6 L149.7,113.4 L150.1,110 L151.8,106.8 L154.6,104.4 L160.1,102.5 L178.5,100.4 L181.5,100.3 L184.4,101 L187.4,103 L189.5,106 L190.1,109 L190.3,115.6 L192.3,119.9 L194.5,122 L196.9,123.2 L202.5,123.5 L208.8,120.7 L261.4,88.2 L266.2,84.5 L268.5,80.9 L269,76.6 L267.6,72.3 L264.5,69 L260.2,67 L253.4,66.8 L228.8,71 L225.2,70.8 L222.1,69.8 L219.8,67.9 L218.2,65.2 L217.1,56.9 L215.6,53.1 L212.7,50.1 L208.3,48.2 L202.1,47.2 L143.6,44.6 L136.8,43.4 L132.4,40.7 L129.2,36.6 L127.9,32.5 L127.7,25.1 L126.8,21.2 L124.2,16.6 L120.3,13.2 L115.7,11.1 L109.5,10.1 L85.3,10.9 Z"},"buriram":{"names":["buriram","chang international"],"d":"M36.3,87.8 L56.3,123.1 L60.7,129.9 L63.9,133.5 L67,135.8 L70.3,137 L73.8,137.2 L85.8,134.9 L154.4,112.2 L186.8,102.1 L203.7,98.1 L248.9,89.8 L259,87.4 L263.7,85.3 L267.1,82.5 L269.4,79.1 L270,75.4 L268.5,71.3 L265.1,68.4 L260.3,66.9 L254.5,67.2 L200.8,80.8 L114.6,101.1 L102.3,103.2 L93.5,102.9 L86.1,100.9 L78.9,96.9 L49.6,73.2 L46.6,69.2 L45.3,64.6 L45.8,60.2 L48.1,56.5 L53.9,52.6 L60,50.4 L66.4,50.3 L72.3,52 L77.6,55.1 L81.6,58.9 L84.6,63.1 L89,71.4 L92.4,75.6 L97.5,79 L103.4,80.7 L108.2,80.9 L114.7,80.1 L157.2,71.5 L163,69.7 L167.1,67.1 L170.3,63.5 L172.4,58.8 L173.8,50.2 L174.6,36.6 L173.3,30.7 L170.4,26.5 L167.6,24.4 L164.7,23.1 L161.5,22.8 L158.4,23.3 L154.9,25.5 L148.3,32.5 L143.4,36.3 L138.2,38.7 L132.4,39.6 L122.2,38.5 L104.2,32.5 L92.8,31.1 L26,31.9 L18.9,32.4 L14.2,33.5 L11.6,35.2 L10.2,37.5 L10.1,40.2 L11.1,43.9 L36.2,87.6 Z"},"valencia":{"names":["ricardo tormo","cheste"],"d":"M110,29.6 L224.6,29 L235,30 L243.1,33 L247.3,36 L251,40.2 L254,45.4 L256.1,51.4 L269.3,110.2 L270,116.9 L268.8,121.3 L266.5,123.8 L263.4,125.1 L259.6,125.2 L255.9,124 L252,121.3 L247.2,116.7 L238.4,106 L235,98.9 L233.7,91.3 L234,84.2 L236.3,70.5 L235.9,63.8 L234.5,60.2 L232.5,57.4 L229.4,55 L225.8,53.5 L219.9,52.4 L213.2,52 L207.3,52.5 L202.4,53.9 L198.2,56.2 L194.9,59.5 L192.7,63.2 L191.7,67.4 L192.3,72.8 L194.6,77.7 L212.2,98.7 L220.4,111.4 L221.8,115.5 L222,119 L221.1,122.3 L219.1,125.1 L216.7,127 L213.1,128.6 L202.6,130.6 L153,130.8 L140.3,129.7 L129.8,127.3 L116.5,122.2 L102.8,115.6 L96.7,111.3 L93.7,107.3 L92.7,102.4 L94.3,97.2 L96.4,94.4 L99.1,92.1 L105.9,89 L115.7,87.4 L125.7,88 L132.6,89.9 L138.7,92.8 L153.6,104.3 L160,108.2 L167.9,111.1 L174.9,111.9 L178.8,111.3 L182.4,109.8 L185.1,107.6 L187,104.7 L187.8,101.3 L187.4,98.3 L185.9,95.2 L183.5,92.6 L176.7,88.8 L130.1,67.8 L124.1,65.6 L119.1,64.6 L113.6,64.9 L108.3,66.4 L103.8,68.9 L91.6,77.1 L85.7,79.7 L79.2,81.6 L72,83 L65,83.3 L58,82.8 L51,81.4 L44,79 L37.3,75.6 L30.8,71.3 L24.7,66.3 L19.1,60.6 L14.7,54.9 L11.6,49.4 L10.2,44.5 L10.3,39 L12.1,34.8 L15.9,31.4 L21,29.7 L109.6,29.6 Z"},"misano":{"names":["misano","simoncelli"],"d":"M151,97.5 L134.5,61.8 L127.5,49 L124,45.3 L120.1,43.1 L116.3,42.4 L107.6,42.7 L104.8,41.9 L102.4,40.3 L100.9,38.5 L99.7,36.1 L98,27.4 L96.4,22.9 L93.7,18.6 L90.2,15.3 L86.5,13 L82.3,11.4 L77.4,10.3 L72.2,10 L46.1,12.5 L41.9,13.7 L39.4,15.6 L38.4,18.5 L39,21.6 L41.2,24.6 L44.4,26.7 L46.9,27.4 L49.2,27.4 L58.9,23.7 L62.1,23.3 L65.1,23.4 L68.3,24.3 L71.5,26 L79,32.2 L103.4,57.8 L121.6,79.3 L132,93.2 L142,107.8 L144.5,112.5 L145.3,116.6 L144.1,120.7 L141.1,123.6 L136.9,124.7 L131.1,124.1 L124.8,122.1 L117.2,118.5 L93.4,103.7 L85.3,99.5 L80.1,97.9 L74.7,97.1 L69.1,97.3 L65.1,98.3 L62.9,99.7 L61.6,101.6 L61.2,104.1 L61.8,106.5 L63.4,109 L65.9,111.5 L72.9,116 L150.3,146 L161.5,149 L171.5,150 L181.3,149.4 L195.2,147 L207.6,143.6 L217.2,139.9 L225.6,135.2 L234.2,128.7 L238.7,123.5 L241.1,117.9 L241.6,113.2 L241.2,108.3 L239.8,102.1 L237.6,95.6 L236,92.7 L234.2,90.9 L231.8,90 L229.5,90.2 L226.9,91.9 L225.1,95.2 L224.6,98.7 L225,109.4 L224.5,115.1 L222.5,120.4 L219.1,124.7 L213.6,128.4 L206.1,131.6 L182.8,139.2 L178.9,139.8 L175.7,139.5 L173.2,138.6 L170.8,136.9 L166.7,131.4 L163.4,125 L151.1,97.8 Z"},"motegi":{"names":["motegi"],"d":"M65.5,87.4 L50.8,113.5 L47.9,120.2 L47.6,124.1 L48.7,127.7 L51.1,130.5 L54.3,132 L57.5,132.2 L60.9,131.1 L64.4,128.8 L67.6,125.4 L98.1,79.4 L107,66.8 L110.7,62.2 L114.2,60.2 L118.1,60.1 L122,62.2 L125,66 L126.7,70.6 L126.8,75.2 L125.5,79.8 L122.7,84.4 L114.7,93.3 L92.9,115 L78.7,130 L73.3,136.1 L71.3,139.7 L71.1,142 L71.9,144.3 L73.5,146 L76.1,147.3 L80.4,148.2 L100,149.9 L106.1,149.7 L111.9,148.1 L117.1,145.4 L121.9,141.5 L125.2,137.7 L128.4,132.9 L138.7,112.8 L141.6,109.1 L144.6,106.5 L147.7,105.1 L151.4,104.7 L154.3,105 L160.8,106.7 L164.2,106.8 L167.9,105.6 L171.2,103 L173.9,98.3 L174.9,93.2 L174.6,87.5 L172.9,74.6 L172.9,67.2 L174.1,63.3 L176.4,61.3 L178.3,60.9 L180.7,61.2 L185.2,63.6 L208.4,85.5 L224,98.5 L226.9,99.6 L229.5,99.3 L231.5,97.8 L232.4,95.2 L232.2,93.3 L231.4,91.3 L227.7,87.1 L148.8,14.5 L144.6,11.1 L141.5,10 L138,10.8 L134.9,13.4 L132.6,17.5 L128.9,26.5 L126.7,30.7 L123.7,34.6 L119.7,37.9 L115,40.1 L110.4,41.2 L105.8,41.2 L100.1,39 L97.5,38.6 L94.4,39.3 L91.5,41.5 L88.6,45.4 L65.6,87.2 Z"},"aragon":{"names":["aragon","aragón"],"d":"M193.6,72.7 L173.5,88.3 L170.9,89.9 L168.5,90.6 L166.1,90.4 L163.7,89.3 L156,79.6 L152.3,77.1 L148.2,75.6 L144.3,75.2 L139.9,75.9 L129.9,78.8 L125.1,81 L120.2,84.8 L117.5,89.5 L116.4,93.8 L115,107.1 L113.5,112.7 L111.7,116.7 L109.2,120.2 L105.8,123.6 L102.4,126.1 L99.4,127.2 L95.9,126.8 L93.2,124.2 L92,121.1 L91,113.8 L89.9,110 L87.7,105.7 L84.2,101.3 L79.1,96.7 L73.9,93.1 L70.5,92 L67.1,92.5 L64.6,94.5 L63,97.9 L57,130 L57.3,133.2 L58.4,135.6 L59.9,137 L63.4,138.8 L64.6,140.2 L64.9,142.1 L64.2,144.2 L61.5,146.8 L57.5,148.7 L52.7,149.8 L48.1,149.9 L44.1,148.8 L40.6,146.9 L37.6,144 L35.6,140.5 L34.4,135.8 L34.6,129.8 L36.7,117.5 L39.3,108.4 L43,99.5 L48.5,89.2 L53.9,81.3 L57.3,78.1 L60.5,76.9 L63.7,77.1 L66.1,78.2 L71.8,82.1 L76.3,83.6 L80.3,83.8 L84.4,82.8 L89.7,79.9 L99.4,72.6 L101.6,70.5 L102.4,68.8 L102.6,67 L100.5,61.1 L100.4,58.3 L101.6,55.9 L104.3,54 L239.9,10.7 L243,10 L245,10.6 L245.7,12 L245.1,13.5 L239,17.3 L236.3,20.7 L235.2,24.7 L234.8,32.1 L234,36.1 L232.4,40.2 L229.6,44.2 L224.3,49.3 L193.8,72.5 Z"},"phillip":{"names":["phillip island"],"d":"M123.2,47.8 L183.3,72.3 L191,74.4 L198.7,75.1 L204.6,74.6 L210.2,73 L216.1,70.2 L221.3,66.6 L227.8,59.5 L234.9,46.9 L238.7,41.5 L243.3,36.9 L248.3,34.2 L252.5,33.1 L256.5,32.9 L260.2,33.6 L263.4,35 L266.1,37.2 L268.3,40.3 L269.6,43.8 L270,47.5 L269.4,52.4 L267.3,57.6 L264.1,62.4 L259.2,67.9 L233.3,90.2 L225.1,96.2 L218.8,99.6 L209.6,102.4 L199.2,103.1 L184.4,101.1 L161.9,95.8 L156.9,95.7 L153.6,97.4 L152.3,99.5 L152.1,102.1 L153,104.5 L154.9,106.7 L160.7,110.1 L180.7,119.1 L183.9,121.6 L186.1,124.6 L187.1,130.1 L185.2,134.6 L181,137.8 L174.1,139.4 L159.7,139.4 L150.6,138 L141,134.9 L121.6,126 L115.6,124.3 L109.8,123.6 L103.7,123.8 L97.1,125.2 L79.9,132.6 L71.6,134.9 L62.9,135.5 L55.5,133.7 L51.2,131.2 L47.5,127.7 L44.7,123.1 L43,117.9 L42.6,113 L43,107.6 L47,90.2 L46.9,87.6 L46,85.4 L44,83.8 L40.9,83.5 L37.9,84.2 L29.4,88.2 L25.4,88.4 L21.8,87.6 L18.1,85.5 L15.2,82.4 L12.7,77.9 L11.1,72.4 L10,64.1 L10.5,53.9 L12.2,44.9 L14.9,37.6 L18.6,31.9 L23.4,27.2 L29.4,23.5 L36.1,21.2 L41.3,20.5 L46.9,20.6 L59.6,22.7 L122.9,47.7 Z"},"sachsenring":{"names":["sachsenring"],"d":"M78.6,53.1 L159.3,107.4 L178.3,119.5 L195.6,129 L201.3,130.3 L205.7,129.9 L208.6,128.5 L210.8,126.3 L212.1,123.3 L212.2,119.7 L210.6,115.1 L203.7,105.2 L200.6,98.9 L199.2,92.8 L199.8,86.1 L201.9,80.2 L205.6,75.1 L209.7,71.5 L219.8,64.9 L224,60.3 L225.5,56.9 L226,53.7 L225.6,50.5 L224.2,47.6 L221.2,44.8 L217.1,43.4 L212.6,43.5 L208.6,45.4 L204.9,49.7 L200.7,62.3 L195.7,70.4 L192.4,73.6 L188.9,76 L180.7,78.9 L175.7,79.3 L170.8,78.7 L166.4,77.2 L162.6,74.9 L159.6,71.9 L157.3,68 L156,63.7 L155.5,59.1 L156.5,50.4 L159.6,41.3 L164.2,32.8 L170.4,26.1 L177.7,21.2 L186.6,17.8 L195.9,16.5 L204.8,17.1 L214.2,20 L223.3,25.3 L244.7,42.6 L259.5,57.2 L264.9,64.4 L268.5,72.3 L270,80.7 L269.4,88.9 L267.2,96.5 L262.8,105.5 L255.7,116.7 L249.1,124.7 L241.2,131.8 L233.2,137.3 L225.1,141.1 L216.9,143.2 L207.5,143.4 L197.4,141 L189,136.9 L175.6,127.4 L168.4,123.4 L158.5,119.8 L148,117.9 L134.5,117.7 L113.1,118.9 L72.4,126.1 L39.1,130.8 L34.1,130.6 L29.3,129.6 L24.7,127.7 L20.4,124.9 L15.5,119.8 L12.1,113.5 L10.3,106.6 L10.1,98.7 L11.3,89.9 L21,46.2 L22.8,40.2 L25.1,36.3 L29.1,32.8 L33.7,30.9 L39.4,30.4 L44.7,31.3 L54.3,36.2 L78.3,52.9 Z"},"assen":{"names":["assen"],"d":"M86.8,92.2 L51.5,121.8 L49,124.8 L48.4,127.1 L48.8,130.3 L49.8,133.3 L52,137.5 L55.3,141.9 L60.5,145.5 L66.8,148 L73,149.9 L76,149.8 L79.1,148.6 L81.3,146.6 L82.3,143.8 L82,140.1 L80.6,137.3 L78,135.4 L74.8,134.6 L71.6,135 L66.7,136.9 L64.4,136.7 L63,135.6 L62.4,133.9 L62.7,132.3 L63.8,130.9 L66.2,129.5 L69.9,128.2 L84.6,125.5 L100.4,120.3 L112.4,115.1 L145.6,99.2 L149.6,96.4 L153.8,87.8 L156,85.4 L158.7,83.7 L162.7,82.5 L168.2,82.2 L186,85 L188.7,84.4 L191.5,83 L193.8,80.2 L195.3,76.2 L196.6,65.8 L199.8,52.8 L202.9,36.3 L204,33.5 L206.3,31.2 L210.4,29.9 L214.6,29.5 L224.5,29.9 L228.6,28.8 L230.6,26.6 L231.5,23.6 L231.4,20.4 L230,17.1 L228,14.2 L225.1,11.8 L221.9,10.4 L218.4,10 L210.6,11.4 L193.7,18.3 L190.1,20.6 L186.1,24.4 L177.5,35.7 L169.2,48.3 L161.6,64 L156.1,71.6 L152.5,75 L146.7,77.8 L140.6,78.8 L133.6,78.1 L115.3,74.9 L112,74.9 L109.9,76.1 L106,80.3 L95.9,85.6 L87,92.1 Z"},"barcelona":{"names":["barcelona","catalunya","cataluña"],"d":"M182.2,57.5 L128.5,142.7 L126.7,144 L124.4,144.1 L123.1,143.8 L118,140.9 L114.2,140.7 L111.9,141.7 L103.1,148.2 L100.5,149.3 L97.4,150 L94.6,149.9 L91.6,149.2 L89.4,148.2 L86.5,145.7 L84.5,143 L82.7,138.2 L82.4,132.2 L83.6,126.1 L86.1,120.2 L101,96.4 L102.8,94.3 L103.9,93.7 L106.4,93.1 L109,93.6 L111,94.8 L112.8,96.7 L114.2,99.3 L114.7,104.1 L114.1,107.5 L112,111.8 L101,129.2 L100.7,131.3 L101,132.4 L102,134 L102.9,134.6 L105,135.1 L106.2,134.9 L122.5,127.5 L124.5,126.4 L129.9,122 L133,117.7 L137.9,110 L138.9,107.2 L138.3,104.7 L136.9,103.1 L133.5,101 L131.9,99.7 L130,97.2 L121.1,76 L120.6,73 L120.9,70.5 L122.2,67.3 L124.3,64.7 L126,63.5 L166.2,43 L178.3,36.7 L180.1,35.4 L180.9,33.8 L181,32.7 L180.1,30.6 L177.4,28.4 L174.1,27.3 L170.9,27.1 L168.1,27.6 L164.4,29.6 L160.3,32.9 L157.4,33.9 L155.1,33.9 L153.5,33.3 L151.4,31.7 L150.5,30.3 L149.9,28.9 L149.7,26.4 L150.2,24.2 L150.9,23 L165.6,10.6 L166.6,10.2 L168.3,10.1 L169.2,10.6 L179.9,18.7 L181.2,18.5 L184,15.6 L185.1,15.7 L194.2,21.6 L196.2,24 L197.1,25.9 L197.6,28.4 L197.7,30.7 L197,33.9 L182.2,57.5 Z"},"austin":{"names":["circuit of the americas","cota","austin"],"d":"M32.8,98.1 L40.2,103.4 L65.7,124.1 L92.2,144.5 L100.1,149.8 L102.6,149.7 L103.6,148.7 L103.6,147.3 L96.4,125.2 L96.6,120.5 L98.1,116.4 L99.9,113.6 L102.3,111.3 L123.4,98.2 L126.1,95.1 L129.3,87.7 L130.7,85.6 L132.9,83.9 L138.7,81.4 L140.8,79.7 L142.6,76.5 L144.5,67.4 L148,62.8 L153.8,59.1 L159.3,58.2 L174.9,64.8 L176.9,64.9 L183,60.9 L189.6,53.3 L193.4,51.7 L195.9,51.9 L198.4,52.9 L200.3,54.7 L202.1,57.6 L204.3,58.7 L229,53.3 L231,51.7 L255.7,21.9 L261.9,13.5 L262.2,11.1 L261,10 L257,10.6 L220.1,21.8 L183.7,30.2 L154,35.2 L107,40.8 L105.8,41.8 L105.9,43.3 L117.2,58.5 L120.6,64.2 L120.9,66.1 L120,67.7 L118.3,68.5 L109.4,67.7 L107.4,65.8 L104.5,59.2 L99.4,53.5 L96,52.3 L92.7,52.2 L91.1,52.8 L90.6,53.9 L90.8,55.2 L101.9,74.6 L103.2,77.8 L102.8,83.1 L100.5,89 L98.5,91.4 L89.9,95.6 L87,96.4 L81,95.8 L75.2,93.7 L71.4,90.8 L55.6,69.7 L53.8,68.4 L51.8,68.3 L46.7,69.9 L19.5,81.9 L18.2,83 L17.6,84.8 L18.4,86.8 L32.8,98.1 Z"},"redbullring":{"names":["red bull ring","spielberg"],"d":"M193.6,130.8 L123.4,149.9 L121.1,149.6 L115,139.8 L90.6,105.5 L84.7,94.9 L67.9,59.5 L65.4,55.2 L57,43.6 L30,16.1 L29.2,14.6 L29.5,13.2 L31.8,12 L46.1,10.3 L65.7,10.3 L74.9,11.3 L126.2,20.7 L133.8,21.5 L165.7,23 L169,23.8 L170.6,25.9 L170.9,28.2 L170.7,29.8 L168.8,33.4 L165,38.3 L161.9,41.5 L158,44.3 L152.8,47.1 L146.6,49.1 L137.8,50.2 L105.4,45.2 L102,45.3 L99,46.2 L96.3,47.7 L92.3,51.9 L90.3,56.9 L90.6,62.8 L91.7,65.6 L97.9,76.9 L105.4,89.4 L108.3,92.3 L110.3,93.6 L114.9,95 L119.3,94.7 L124.6,92.5 L127.4,89.9 L131.2,84.9 L134.9,81.4 L140.2,78 L148.9,74.7 L156.8,74 L231.6,72.5 L243.8,82.8 L250.6,106.6 L250.5,109.3 L244,114.4 L234.1,118.9 L217,124.5 L193.6,130.8 Z"},"sepang":{"names":["sepang"],"d":"M104.6,85.7 L60.4,89.3 L58.4,89.2 L56.6,88.3 L55.3,86.9 L54.6,85.1 L54.6,83.1 L55.3,81 L57,79.4 L59.3,78.6 L62,79.2 L67.1,81 L68.8,80.7 L70.2,79.3 L70.7,77.6 L70.2,75.3 L65.3,68.8 L63.8,66.2 L62.9,63.2 L62.4,56.7 L63.2,48.1 L64.6,44.1 L66.7,40 L68.8,37.4 L72.1,34.4 L75.5,32.2 L99.3,24.2 L114.5,18.3 L133.4,10 L135,10.1 L136.5,11 L139.8,28.5 L144,46.4 L145.7,50.2 L147.7,52.9 L151.1,55.6 L154.5,57.4 L157.8,58.3 L161.1,58.4 L164.9,57.8 L168.7,56.3 L171.4,54.4 L176.7,48.7 L179.3,47.1 L183.4,45.7 L186.9,45.6 L190.3,46.1 L193.1,47.2 L195.6,49.2 L225.3,83.1 L225.4,84.7 L219.7,97.9 L218.2,99 L216.4,99.4 L189.3,101 L163.8,104 L149.9,106.3 L148.6,107.4 L148.1,109.1 L149.3,111.1 L159.3,116.6 L161.4,118.8 L162.9,122.1 L163.7,125.5 L163.6,130.3 L162,138.3 L159.7,143.3 L156.1,148.5 L154.2,149.7 L152.3,150 L150.2,149.6 L148.5,148.5 L117.4,122.9 L115.3,122.1 L112.5,121.9 L109.4,122.7 L98.1,128.5 L95,129.5 L88.3,129.9 L82.4,128.8 L78.4,127.2 L75.8,125.1 L72.3,120.5 L71.1,117.1 L70.9,115 L72.4,112.7 L75.5,111.4 L198.8,88.7 L200.5,87.1 L201.8,84.1 L201.2,81.7 L198.9,79.3 L195.3,78.8 L104.6,85.7 Z"},"silverstone":{"names":["silverstone"],"d":"M99.4,111.3 L122.2,81.5 L123.9,79.9 L125.7,79.3 L128,79.1 L138.7,80.4 L142.8,79.7 L145.2,78.5 L157.6,68.7 L159,68.2 L160.2,68.5 L160.9,69.2 L163.7,77.6 L165.2,78.5 L166.1,78.3 L166.8,77.7 L168.4,74.1 L169.6,69.9 L170,65.2 L169.3,62.9 L130.6,27.6 L128.7,26.5 L127.1,26.2 L125,26.4 L123.2,27.2 L121.9,29.2 L121.1,35.9 L120.2,37.3 L118.2,38.5 L116.1,38.6 L114.3,37.6 L113.1,36 L112.7,34.1 L113.2,32 L119,20.8 L122.5,17.1 L125,15.3 L127.7,13.9 L130.6,13.1 L134.4,12.6 L162.8,10.1 L166,10.1 L168.8,11.4 L170.7,13.2 L171.8,15.5 L174.1,22.9 L175.3,28.7 L176.1,35.9 L176.9,51.1 L177.7,53.9 L180.2,58.3 L180.6,60.1 L180.2,62.5 L177.9,69 L177.5,73 L178.2,75.2 L181.5,79.8 L181.9,81.5 L181.9,83.3 L181,85.5 L180.1,86.5 L173,91.1 L170.9,93.4 L149.2,133.9 L144.9,140.9 L140.3,147.3 L138.2,149.1 L135.7,149.9 L132.8,149.7 L130,148.3 L128.4,146.3 L125.8,141 L122.5,136 L110.9,122.8 L110.3,122.4 L109.3,122.6 L106.7,124.9 L105.1,125.4 L103.8,125 L101.5,122.6 L99.4,119.3 L98.2,115.7 L98.1,113.2 L99.4,111.3 Z"},"portimao":{"names":["portimao","portimão","algarve"],"d":"M124.8,113 L98.9,22.7 L99.2,21.2 L100,20.3 L111.5,11.8 L108.7,19.2 L107.7,21 L105.8,21.7 L100.8,19.8 L111.5,11.8 L113.7,10.4 L115.4,10 L130.9,13.6 L132,14.1 L132.9,15.2 L133,16.7 L132.1,18 L124.4,22.7 L121.8,24.6 L120.2,27.5 L119.9,29.6 L120.2,31.8 L137.4,91.8 L142,90.7 L144.1,68 L143.2,63.1 L141.4,59 L141.5,57.3 L142,55.6 L142.7,54.6 L144.6,53.3 L146.4,53 L147.8,53.1 L148.9,53.6 L151.1,55.5 L152.5,65.5 L159.8,74.8 L174.3,82.1 L176.7,83.7 L178.5,85.7 L179.5,87.2 L181.1,92.2 L180.6,94.7 L178.7,96.1 L160.3,101.8 L156.5,104.9 L154.6,108.1 L153.5,113.3 L154,114.1 L161.1,120.2 L163.3,120.9 L164.5,120.8 L158.1,128.5 L155.8,129.7 L154,129.5 L152.1,127.6 L151.8,125.8 L153.5,113.3 L164.5,120.8 L169.5,114.8 L171.2,113.9 L174,114 L175.8,115 L178,117.6 L178.9,120 L179.1,122.1 L178.6,125.4 L177.2,128 L168.4,138.9 L163.4,144.6 L160.8,146.7 L157,148.7 L152.4,149.9 L146.4,149.7 L143.2,148.8 L140,147.3 L136,144.1 L133.2,140.4 L131.6,136.8 L124.8,113 Z"},"mugello":{"names":["mugello"],"d":"M139.5,77.8 L146.2,63.2 L157.7,43.1 L161.2,36 L170.1,13.6 L171.5,11.7 L173.5,10.4 L175.7,10 L178.1,10.7 L179.5,11.8 L180.4,13.1 L181.2,16.6 L180.9,19.9 L178.9,29.9 L179,32.3 L180.4,34.5 L186.4,38.2 L188,39.6 L189.2,42.2 L189.4,44.5 L188.3,47.9 L168.3,78.1 L168,79.6 L168.1,81.3 L170.9,87.2 L171.4,88.9 L171.3,91.4 L170.5,93.1 L150.5,117.5 L149.3,118.7 L146.3,119.7 L138.1,119.5 L134.9,119.8 L132.6,120.7 L130.1,122.4 L128.2,124.9 L126.8,128.1 L121.5,143.4 L120,145.7 L117.6,147.9 L113.4,149.8 L111,150 L108.3,149.7 L103,147.8 L94.3,143 L92.5,141.2 L91.4,139.3 L90.7,137.1 L90.5,134.4 L91,130.7 L96.3,103.5 L97.5,101.8 L99.1,100.6 L100.9,100.2 L108.6,99.9 L110.7,98.8 L112.3,97.1 L113.3,94.7 L122.5,62.9 L123.7,60.5 L125.2,58.8 L127.3,57.7 L129.3,57.4 L131.1,57.6 L133,58.7 L134.4,60.2 L135.3,62.2 L135.5,64 L135.2,66.4 L133.1,70.6 L125.8,80.2 L125.3,82.2 L125.3,89.1 L124.6,91.8 L101.1,123.5 L98.4,127.8 L97.5,130.9 L97.6,133.5 L99.1,136.5 L101.2,138.3 L102.6,138.9 L104.9,139.3 L106.6,139.1 L108.8,138.4 L112.2,135.9 L114.7,132.5 L139.5,77.8 Z"},"jerez":{"names":["jerez"],"d":"M140.7,97.5 L127.2,124.9 L122.7,134.6 L121.4,138.5 L121.2,142.4 L122.4,145.6 L125,148 L128.8,149.5 L133.7,150 L149,149.7 L152.3,148.6 L153.5,147.6 L154.3,146.3 L154.7,144 L153.8,141.6 L152.4,139.9 L148.1,136.2 L145.6,132.5 L144.3,128.5 L143.7,123.3 L143.9,116.3 L145.3,110.1 L147.8,104.9 L151.5,100.6 L153.9,98.8 L156.7,97.4 L165,95.1 L172.3,94.2 L183.6,94 L190.2,93.6 L195.6,92.9 L199.7,91.7 L203.6,89.5 L206.5,86.4 L208.2,82.5 L208.6,78.1 L207.9,74.1 L206.3,70.2 L203.9,66.7 L200.7,63.2 L144.6,14.7 L139.3,11 L137.5,10.2 L135.8,10 L133.8,10.6 L132.4,11.9 L131.6,13.9 L131.6,16.1 L133.4,20.8 L139.4,30.3 L141.8,35.4 L143.2,41.7 L143.3,44.8 L142.9,47.7 L141.3,52.7 L138.4,57.3 L128.4,69.5 L126,71.9 L123.3,74 L120.7,75.2 L118.1,76 L115.4,76.4 L112.7,76.3 L110.3,75.8 L108,74.9 L105.7,73.5 L103.7,71.7 L101.1,68.4 L99.2,64 L98.2,59.6 L96.8,50.3 L95.4,46 L92.4,41.3 L90.6,39.7 L88.7,38.5 L85.7,37.8 L82.9,37.9 L80,39 L76.2,41.3 L73.9,43.1 L72.5,45 L71.6,47.5 L71.4,50.2 L72.1,54.1 L73.6,58.3 L81.7,75.8 L83.8,79.2 L85.2,80.3 L86.8,80.9 L91.6,81.1 L93.9,81.8 L95.9,83.1 L99.5,86.7 L102,88.6 L105.5,90.1 L109.5,90.8 L113.1,90.7 L116.6,89.9 L120.1,88.4 L123.3,86.5 L128.2,81.7 L138.4,68.4 L144,61.8 L147.7,57.9 L149.8,56.3 L152,55.4 L154.1,55.3 L155.9,56 L157.2,57.5 L157.8,59.3 L157.7,61.5 L156.9,64 L151.4,76.1 L140.8,97.3 Z"},"hungaroring":{"names":["hungaroring"],"d":"M150.2,148.1 L79.3,92.2 L78.3,91 L77.9,89.4 L78.2,88 L79,87 L81.6,86.4 L89.1,86.7 L95.7,88.2 L99.9,90.1 L102.3,91.6 L123,107.8 L124.9,108.5 L126.4,108.4 L128,107.9 L129.7,106.7 L130.9,104.9 L131.2,101.5 L130.7,99.9 L125.1,90 L124.3,87.6 L124.4,85.8 L142,49.8 L144.7,45.6 L149.9,39.1 L150.1,36.3 L145.5,19.5 L145.1,16.5 L145.8,13.9 L147.2,11.9 L149.4,10.5 L152.1,10 L155.1,10.8 L158.6,12.9 L161.5,15.1 L164.4,17.8 L175.6,29.8 L175.9,30.7 L175.7,32.1 L174,34.3 L173.7,36 L177.9,51.6 L178.9,53.6 L180.1,54.7 L181.4,55.1 L191.2,56.5 L192.7,57.4 L194.4,59.2 L194.8,60.6 L194.9,62.4 L192.7,78.1 L192.9,81.6 L194.3,85.2 L201.3,95.9 L202.1,99.1 L201.5,102.5 L199.6,105.4 L173.3,134.9 L172.1,135.8 L170.5,136 L168.9,135.3 L160.8,126.4 L153.5,120.4 L152,119.9 L150.2,119.9 L148.9,120.3 L147.6,121.2 L146.7,122.8 L146.5,124.1 L146.7,125.9 L147.3,127.3 L161.1,138.3 L162,139.8 L162.6,142 L162.5,144.3 L161.6,146.5 L160,148.4 L158.6,149.3 L156.3,149.9 L154.5,149.9 L152.4,149.4 L150.2,148.1 Z"}};
const STYLE="\n  /* All three areas live in the SAME white event-header panel. */\n  .header{container-type:inline-size}\n  .mgp-hero-grid{display:grid;grid-template-columns:minmax(210px,1fr) minmax(0,1.75fr);\n    align-items:center;column-gap:22px;row-gap:10px}\n  .mgp-hero-copy{min-width:0;align-self:center}\n  .mgp-hero-copy h2{overflow-wrap:anywhere;display:flex;align-items:center;gap:9px;flex-wrap:wrap}\n  .mgp-country-flag{display:inline-flex;flex:none;font-size:23px;line-height:1;vertical-align:middle}\n  .mgp-hero-copy .np-top-actions{margin-top:14px;display:flex;flex-wrap:wrap;align-items:center;gap:7px}\n  .mgp-next-chip{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--divider-color,#ddd);border-radius:24px;padding:7px 10px;font-size:11px;white-space:normal;max-width:100%}\n  .mgp-next-chip .next-countdown{font-variant-numeric:tabular-nums}\n  .mgp-hero-copy .np-top-actions [data-motogp-standings-toggle]{margin-left:auto}\n  .mgp-hero-copy h2{flex-wrap:nowrap;align-items:center}\n  .mgp-hero-copy h2 .mgp-country-flag{flex:none}\n  .mgp-ui-footer{display:inline-block;margin-right:10px}\n  .mgp-ui-footer summary{cursor:pointer;text-decoration:underline;text-underline-offset:2px}\n  .mgp-ui-footer div{padding-top:5px;line-height:1.5}\n  .mgp-branded-eyebrow{display:flex;align-items:center;gap:8px}\n  .mgp-brand-logo{width:27px;height:27px;object-fit:contain;border-radius:5px;flex:none}\n  .mgp-ui-details{margin-top:11px;color:var(--secondary-text-color);font-size:10px;line-height:1.5}\n  .mgp-ui-details summary{cursor:pointer;display:inline-block;text-decoration:underline;text-underline-offset:2px}\n  .mgp-ui-details div{padding-top:4px;overflow-wrap:anywhere}\n    .mgp-venue-strip{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(148px,.85fr);\n    align-items:center;gap:16px;min-width:0;border-left:1px solid var(--divider-color,rgba(127,127,127,.22));\n    padding-left:19px}\n  .mgp-weather-panel,.mgp-circuit-panel{min-width:0;padding:0;margin:0;border:0;background:transparent}\n  .mgp-venue-caption{font-size:10px;font-weight:850;text-transform:uppercase;\n    letter-spacing:.08em;color:var(--secondary-text-color);margin-bottom:9px}\n  .mgp-weather-head{display:flex;align-items:flex-start;gap:7px;flex-direction:column}\n  .mgp-weather-source{font-size:9px;color:var(--secondary-text-color);line-height:1.35}\n  .mgp-weather-metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 14px;margin-top:10px}\n  .mgp-weather-cell{min-width:0;padding:0;background:transparent;border:0;text-align:left}\n  .mgp-weather-cell small{display:block;font-size:10px;color:var(--secondary-text-color);line-height:1.2}\n  .mgp-weather-cell strong{display:block;font-size:16px;margin-top:3px;line-height:1.25;\n    font-variant-numeric:tabular-nums;overflow-wrap:anywhere}\n  .mgp-weather-condition{font-size:11px;font-weight:700;margin-top:9px}\n  .mgp-weather-empty,.mgp-track-empty{font-size:11px;color:var(--secondary-text-color);\n    margin-top:11px;line-height:1.4}\n  .mgp-circuit-panel{justify-self:end;width:100%;max-width:230px}\n  .mgp-circuit-panel .mgp-venue-caption{text-align:right}\n  .mgp-circuit-panel .mgp-venue-caption{text-align:right}\n  .mgp-circuit-facts{display:flex;justify-content:flex-end;flex-wrap:wrap;gap:4px 9px;margin-top:4px;font-size:10px;line-height:1.4;font-variant-numeric:tabular-nums}\n  .mgp-circuit-facts span{white-space:nowrap}\n  .mgp-circuit-links{display:flex;justify-content:flex-end;gap:10px;margin-top:5px;font-size:9px}\n  .mgp-circuit-links a{color:var(--secondary-text-color);text-decoration:underline;text-underline-offset:2px}\n    .mgp-track-svg{display:block;width:100%;height:100px}\n  .mgp-track-shadow{fill:none;stroke:var(--divider-color,rgba(127,127,127,.25));\n    stroke-width:11;stroke-linecap:round;stroke-linejoin:round}\n  .mgp-track-outline{fill:none;stroke:var(--primary-text-color,#20252b);\n    stroke-width:4.8;stroke-linecap:round;stroke-linejoin:round}\n  .mgp-track-layer{position:relative;width:100%;height:100px}\n  .mgp-track-layer .mgp-track-svg{height:100%}\n  .mgp-track-local{display:block;position:absolute;inset:0;width:100%;height:100%;\n    object-fit:contain;visibility:hidden}\n  .mgp-track-local[data-ready=true]{visibility:visible}\n  .mgp-track-local[data-ready=true]+.mgp-track-fallback{display:none}\n  @container (max-width:900px){.mgp-track-layer{height:89px}}\n  @container (max-width:355px){.mgp-track-layer{height:79px}}\n  .mgp-track-note{font-size:9px;color:var(--secondary-text-color);margin-top:5px;text-align:right}\n  .mgp-track-empty{text-align:right}\n  @container (max-width:900px){\n    .mgp-hero-grid{grid-template-columns:minmax(175px,.8fr) minmax(0,1.5fr);column-gap:15px}\n    .mgp-venue-strip{gap:10px;padding-left:13px;grid-template-columns:minmax(0,1fr) minmax(104px,.75fr)}\n    .mgp-weather-cell strong{font-size:14px}\n    .mgp-track-svg{height:89px}\n  }\n  @container (max-width:680px){\n    .mgp-hero-grid{grid-template-columns:1fr;row-gap:15px}\n    .mgp-venue-strip{border-left:0;border-top:1px solid var(--divider-color,rgba(127,127,127,.2));\n      padding-left:0;padding-top:12px;grid-template-columns:minmax(0,1.25fr) minmax(115px,.75fr);gap:12px}\n    .mgp-weather-metrics{gap:9px}\n  }\n  @container (max-width:355px){\n    .mgp-venue-strip{grid-template-columns:minmax(0,1fr) minmax(92px,.55fr);gap:7px}\n    .mgp-weather-metrics{grid-template-columns:1fr 1fr;gap:7px}\n    .mgp-circuit-panel .mgp-venue-caption{font-size:9px}\n    .mgp-track-svg{height:79px}\n    .mgp-track-note{font-size:8px}\n    .mgp-weather-cell strong{font-size:13px}\n  }\n";
// Source: MotoGP official Qatar 2026 circuit page. Keep only verified facts;
// do not infer missing dimensions from the schematic path.
const CIRCUIT_FACTS={
  portimao:{length:'4,59 km',width:'18 m',straight:'970 m',right:'9',left:'6',
    lapRecord:"1'37.226",recordHolder:'Marc Márquez · 2023',
    raceLap:"1'38.685",raceHolder:'Enea Bastianini · 2024',
    source:'https://www.motogp.com/en/calendar/2026/event/portugal/c7f7626b-807f-4a6f-813e-7ad2c68302a3',
    info:'https://www.motogp.com/en/calendar/2024/event/portugal/bccf48d6-3242-4827-95df-54a2048521c3'},
  lusail:{length:'5,38 km',width:'12 m',straight:'1 068 m',right:'10',left:'6',
    source:'https://www.motogp.com/en/calendar/2026/event/qatar/3f3d3f5e-851c-42d2-887a-8ce8b41fa908',
    info:'https://photos.motogp.com/events-admin/b/1/b1cd25b2-1658-4c3b-bd3f-1a7796f7cd27/info/qat-info.svg'}
};
// Imported from circuit_data/<id>/season_2027.json Pulselive snapshots.
// Units: length m, width m, longest straight m, left corners, right corners.
// This is season-scoped PROVISIONAL reference data, not live/verified geometry.
const CIRCUIT_PROVISIONAL_2027=Object.freeze({"buriram":[4554,12,1000,5,7],"goiania":[3835,12,994,5,9],"austin":[5513,15,1200,11,9],"lusail":[5380,12,1068,6,10],"jerez":[4423,11,607,5,8],"lemans":[4185,13,674,5,9],"barcelona":[4657,12,1047,6,8],"mugello":[5245,14,1141,6,9],"brno":[5403,15,636,6,8],"assen":[4542,14,487,6,12],"sachsenring":[3671,12,700,10,3],"silverstone":[5900,15,770,8,10],"aragon":[5077,15,968,10,7],"misano":[4226,12,530,6,10],"redbullring":[4348,12,810,3,8],"motegi":[4801,15,762,6,8],"mandalika":[4301,15,723,6,11],"sepang":[5543,16,920,5,10],"portimao":[4592,18,970,6,9],"valencia":[4005,12,876,9,5],"buenosaires":[4350,null,null,null,null],"adelaide":[3219,10,640,7,9]});
const EXTRA_2027_CIRCUITS=Object.freeze({
  'adelaide street circuit':'adelaide','adelaide':'adelaide',
  'buenos aires':'buenosaires','autodromo oscar y juan galvez':'buenosaires',
  'goiania':'goiania','goiânia':'goiania'
});
function calendarFacts2027(circuit){
  const track=trackFor(circuit);
  const normalized=key(circuit);
  const id=track?.id||EXTRA_2027_CIRCUITS[normalized]||null;
  const data=id&&CIRCUIT_PROVISIONAL_2027[id];
  if(!data)return null;
  const fmt=n=>n==null?null:String(n);
  return {length:(data[0]/1000).toFixed(3).replace('.',',')+' km',
    width:data[1]!=null?fmt(data[1])+' m':null,
    straight:data[2]!=null?fmt(data[2])+' m':null,
    left:fmt(data[3]),right:fmt(data[4]),
    note:'Preliminära banmått · Pulselive 2027 (ej oberoende verifierade)',
    provisional:true};
}
// Transcribed 2026 length values from circuit_data/<id>/facts.json.
// Source: user-supplied Sporting Maps screenshots, PARTIAL/NOT official verification.
const CIRCUIT_2026_PARTIAL=Object.freeze({"buriram":4554,"goiania":3820,"austin":5510,"lusail":5380,"jerez":4420,"lemans":4190,"barcelona":4660,"mugello":5245,"balatonpark":4080,"brno":5400,"assen":4542,"sachsenring":3671,"silverstone":5900,"aragon":5077,"misano":4230,"redbullring":4350,"motegi":4800,"mandalika":4300,"phillip":4450,"sepang":5540,"portimao":4590,"valencia":4010});
function calendarFacts2026(circuit){
  const track=trackFor(circuit);
  const id=track?.id;
  const meters=id&&CIRCUIT_2026_PARTIAL[id];
  if(!Number.isFinite(meters))return null;
  return {length:(meters/1000).toFixed(3).replace('.',',')+' km',
    note:'Banlängd enligt Sporting Maps 2026 · delvis dokumenterad, inte officiellt verifierad',
    provisional:true};
}
const COUNTRY_FLAGS={
  'Thailand':'TH','Brazil':'BR','United States of America':'US',
  'Spain':'ES','France':'FR','Italy':'IT','Hungary':'HU',
  'Czechia':'CZ','Netherlands':'NL','Germany':'DE',
  'United Kingdom of Great Britain and Northern Ireland':'GB',
  'Austria':'AT','Japan':'JP','Indonesia':'ID','Australia':'AU',
  'Malaysia':'MY','Qatar':'QA','Portugal':'PT','San Marino':'SM'
};
function countryFlag(country){
  const iso=COUNTRY_FLAGS[String(country||'').trim()];
  return iso?String.fromCodePoint(...Array.from(iso).map(ch=>127397+ch.charCodeAt(0))):'';
}
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function nextSession(card){
  const state=card._hass?.states?.[card._ids?.race];
  const a=state?.attributes||{};
  const sessions=Array.isArray(a.sessions_all)?a.sessions_all:Array.isArray(a.sessions)?a.sessions:[];
  const now=Date.now();
  // Only render a session that belongs to the next GP's actual date window.
  const start=String(a.date_start||'').slice(0,10);
  const end=String(a.date_end||'').slice(0,10);
  const validDate=value=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&
    Number.isFinite(Date.parse(value+'T00:00:00Z'));
  if(!validDate(start)||!validDate(end)||end<start)return null;
  const startBound=Date.parse(start+'T00:00:00Z')-12*3600000;
  const endBound=Date.parse(end+'T00:00:00Z')+2*86400000;
  return sessions.map(s=>{
    if(!s||['FINISHED','CANCELLED','CANCELED'].includes(String(s.status||'').toUpperCase()))return null;
    // Prefer backend-normalized UTC; the wall-time fallback matches the split-card parser.
    let date=s.date_utc?new Date(String(s.date_utc)):null;
    if(!date||!Number.isFinite(date.getTime())){
      const m=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(String(s.date||''));
      if(!m)return null;
      date=new Date(+m[1],+m[2]-1,+m[3],+m[4],+m[5]);
      if(date.getFullYear()!==+m[1]||date.getMonth()!==+m[2]-1||date.getDate()!==+m[3]||
         date.getHours()!==+m[4]||date.getMinutes()!==+m[5])return null;
    }
    const ms=date.getTime();
    if(ms<startBound||ms>=endBound)return null;
    if(s.event_id&&a.event_id&&String(s.event_id)!==String(a.event_id))return null;
    return ms>now?{time:ms,category:s.category||'MotoGP',
      name:({SPR:'Sprint',RAC:'Race',WUP:'Warm Up',PR:'Practice'})[String(s.name||s.type||'').toUpperCase()]||
        String(s.name||s.type||'Pass')}:null;
  }).filter(Boolean).sort((a,b)=>a.time-b.time)[0]||null;
}

// Only reveal timing near a real scheduled start, or when the existing
// verified live match is active. Never infer that a session is live from time.
function timingWindow(card){
  if(card._live)return true;
  const a=card._hass?.states?.[card._ids?.race]?.attributes||{};
  const items=Array.isArray(a.sessions_all)?a.sessions_all:Array.isArray(a.sessions)?a.sessions:[];
  const now=Date.now();
  return items.some(s=>{
    if(!s||['FINISHED','CANCELLED','CANCELED'].includes(String(s.status||'').toUpperCase()))return false;
    let d=s.date_utc?new Date(String(s.date_utc)):null;
    if(!d||!Number.isFinite(d.getTime())){
      const m=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(String(s.date||''));
      if(!m)return false;
      d=new Date(+m[1],+m[2]-1,+m[3],+m[4],+m[5]);
      if(d.getFullYear()!==+m[1]||d.getMonth()!==+m[2]-1||d.getDate()!==+m[3]||
        d.getHours()!==+m[4]||d.getMinutes()!==+m[5])return false;
    }
    const delta=d.getTime()-now;
    // 30 min lead-in, then a 3h grace period for delayed, not-yet-finished starts.
    return delta<=30*60*1000 && delta>=-3*60*60*1000;
  });
}
function toolbar(card){
  const next=nextSession(card);
  const session=next?esc(next.category)+' · '+esc(next.name):'Nästa pass ej verifierat';
  const chip=next?'<span class="mgp-next-chip" title="Nästa schemalagda pass">⏱ '+session+
    ' · <span class="next-countdown" data-next-start="'+next.time+'">—</span></span>':
    '<span class="mgp-next-chip">'+session+'</span>';
  return '<button type="button" class="np-show-button" data-mgp-schedule-jump aria-expanded="'+
    (card._scheduleOpen===true)+'">🗓️ Helgschema</button>'+chip;
}
const readable=v=>v!==null&&v!==undefined&&!['','unknown','unavailable','none','null','hidden','0'].includes(String(v).trim().toLowerCase());
const key=v=>String(v||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
function trackFor(name){
  const normalized=key(name);
  if(!normalized)return null;
  // The aliases must remain distinctive. Never map a generic "Circuit" term.
  for(const [id,value] of Object.entries(TRACKS)){
    if(value.names.some(alias=>normalized.includes(key(alias))))return {id,d:value.d};
  }
  return null;
}
// Optional, locally installed SVGs. These are NOT bundled in the public HACS JS.
// The IDs are our stable circuit keys, not the uploaded SVGs' internal element IDs.
const LOCAL_CIRCUITS=new Set([
  'lusail','buriram','austin','mandalika','redbullring','motegi',
  'phillip','sepang','valencia','portimao','sachsenring','assen',
  'brno','balatonpark','mugello','barcelona','jerez','goiania','lemans'
]);
const LOCAL_CIRCUIT_PATH='/local/ha-mgp/circuits/';
function localCircuitPath(map,circuit){
  const id=/\b(balaton park|balatonpark)\b/i.test(String(circuit||''))?'balatonpark':
    (map?.id||(/\b(le mans|bugatti)\b/i.test(String(circuit||''))?'lemans':null));
  return id&&LOCAL_CIRCUITS.has(id)?LOCAL_CIRCUIT_PATH+id+'.svg':null;
}
function weatherNumber(value,unit){
  if(value===null||value===undefined)return null;
  const raw=String(value).trim();
  // Provider values can be "24º", "37°", "45%" or bare numbers.
  if(!/^-?\d+(?:[.,]\d+)?\s*(?:°|º|°c|ºc|c|%|celsius)?$/i.test(raw))return null;
  const num=Number(raw.match(/^-?\d+(?:[.,]\d+)?/)[0].replace(',','.'));
  if(!Number.isFinite(num)||num<(-70)||num>130)return null;
  if(unit==='%'&&(num<0||num>100))return null;
  return String(num).replace('.',',')+(unit==='%'?' %':' °C');
}
function condition(v){
  const text=String(v??'').trim();
  return readable(text)&&text.length<=70?text:'';
}
function shortTime(raw){
  if(!raw)return '';
  const timestamp=Date.parse(String(raw));
  if(!Number.isFinite(timestamp)||timestamp>Date.now()+5*60*1000)return '';
  const age=Date.now()-timestamp;
  if(age>=18*60*60*1000)return 'äldre väderrapport';
  const date=new Date(timestamp);
  return 'rapporterat '+date.toLocaleTimeString('sv-SE',{hour:'2-digit',minute:'2-digit'});
}
function venue(card){
  const attrs=card._hass?.states?.[card._ids?.race]?.attributes||{};
  const circuit=String(attrs.circuit||'').trim();
  const map=trackFor(circuit);
  const specs=map&&CIRCUIT_FACTS[map.id]||null;
  const eventYear=Number(String(attrs.date_start||'').slice(0,4));
  const partialLength=eventYear===2026 && !specs && map ?
    CIRCUIT_2026_PARTIAL[map.id] : null;
  const factsHtml=specs?'<div class="mgp-circuit-facts" aria-label="Banans mått">'+
    '<span>'+esc(specs.length)+' / varv</span><span>↔ '+esc(specs.width)+'</span>'+
    '<span>Raka '+esc(specs.straight)+'</span>'+
    '<span>↱ '+esc(specs.right)+' · ↰ '+esc(specs.left)+'</span></div>'+
    '<div class="mgp-circuit-links"><a href="'+esc(specs.source)+'" target="_blank" rel="noopener noreferrer">Banfakta</a>'+
    '<a href="'+esc(specs.info)+'" target="_blank" rel="noopener noreferrer">MotoGP:s SVG</a></div>':
    Number.isFinite(partialLength)?
    '<div class="mgp-circuit-facts"><span>'+esc((partialLength/1000).toFixed(3).replace('.',','))+
    ' km · 2026, preliminärt</span></div>':'';
  const allWeather=card._hass?.states?.[card._ids?.weather]?.attributes||{};
  const eventId=String(attrs.event_id||'');
  const isSameEvent=Boolean(eventId&&String(allWeather.results_event_uuid||'')===eventId);
  const startDate=String(attrs.date_start||'').slice(0,10);
  const reportDate=String(allWeather.last_success_at||allWeather.updated_at||'').slice(0,10);
  const dateMatches=Boolean(startDate&&reportDate&&reportDate>=startDate);
  // No cross-event or pre-event weather masquerading as current circuit conditions.
  const weather=isSameEvent&&dateMatches?allWeather:{};
  const sources=[condition(weather.category),condition(weather.session)].filter(Boolean);
  const time=shortTime(weather.updated_at);
  const provenance=[...sources,time].filter(Boolean).join(' · ');
  const fetchStatus=String(weather.fetch_status||'').toLowerCase();
  const fetchLabel=fetchStatus==='error'?'API-fel · senast kända rapport':
    fetchStatus==='no_data'?'Ingen ny sessionsrapport · tidigare värden':
    fetchStatus==='ok'?'API-kontroll OK':'';
  const checked=shortTime(weather.checked_at);
  const lastSuccess=shortTime(weather.last_success_at);
  const age=Number(weather.data_age_seconds);
  const ageLabel=Number.isFinite(age)&&age>=0?' · Ändrat för '+Math.floor(age/60)+' min sedan':'';
  const diagnostic=[fetchLabel,
    checked?'Kontrollerat '+checked:'',
    lastSuccess?'Senast data '+lastSuccess:'',
    weather.updated_at?'Observerad ändring '+shortTime(weather.updated_at)+ageLabel:'',
    Number.isInteger(weather.poll_count)?'Kontroller '+weather.poll_count:'',
    Number.isInteger(weather.change_count)?'Ändringar '+weather.change_count:''
  ].filter(Boolean).join(' · ');
  const localPath=localCircuitPath(map,circuit);
  const fallback=map?'<svg class="mgp-track-svg" viewBox="0 0 280 160" role="img" aria-label="Schematisk banlayout för '+
    esc(circuit)+'" preserveAspectRatio="xMidYMid meet">'+
    '<path class="mgp-track-shadow" d="'+map.d+'"></path>'+
    '<path class="mgp-track-outline" d="'+map.d+'"></path></svg>':'';
  const mapVisual=(map||localPath)?'<div class="mgp-track-layer">'+
    (localPath?'<img class="mgp-track-local" src="'+esc(localPath)+'" alt="Banlayout med kurvnummer och sektorer för '+esc(circuit)+'" loading="lazy">':'')+
    '<div class="mgp-track-fallback">'+(fallback||'<div class="mgp-track-empty">Lokal SVG saknas</div>')+'</div></div>'+
    '<div class="mgp-track-note">Schematisk banform som fallback · lokal SVG där den finns</div>':
    '<div class="mgp-track-empty">Ingen verifierad banritning tillgänglig</div>';
  const mapHtml=(map||localPath)?'<button type="button" class="mgp-track-trigger" data-mgp-circuit-open aria-label="Visa större banlayout och banfakta för '+esc(circuit)+'">'+
    mapVisual+'<span class="mgp-track-action">⤢ Förstora och visa banfakta</span></button>':mapVisual;
  const circuitFacts=specs?
    '<div class="mgp-circuit-facts-status" data-status="verified"><i aria-hidden="true"></i>Verifierade banfakta</div><div class="mgp-circuit-detail-grid"><span>Banlängd <b>'+esc(specs.length)+'</b></span>'+
    '<span>Bredd <b>'+esc(specs.width)+'</b></span>'+
    '<span>Längsta raka <b>'+esc(specs.straight)+'</b></span>'+
    '<span>Högerkurvor <b>'+esc(specs.right)+'</b></span>'+
    '<span>Vänsterkurvor <b>'+esc(specs.left)+'</b></span>'+
    (specs.lapRecord?'<span>Varvrekord, kval <b>'+esc(specs.lapRecord)+'</b><small>'+esc(specs.recordHolder)+'</small></span>':'')+
    (specs.raceLap?'<span>Snabbaste racevarv <b>'+esc(specs.raceLap)+'</b><small>'+esc(specs.raceHolder)+'</small></span>':'')+
    '</div><a href="'+esc(specs.source)+'" target="_blank" rel="noopener noreferrer">Official MotoGP-page</a>':
    Number.isFinite(partialLength)?
    '<div class="mgp-circuit-facts-status" data-status="preliminary"><i aria-hidden="true"></i>Delvis dokumenterade banfakta</div><div class="mgp-circuit-detail-grid"><span>Banlängd <b>'+
      esc((partialLength/1000).toFixed(3).replace('.',','))+
      ' km</b></span></div><p class="mgp-circuit-unavailable">Källa: Sporting Maps 2026 · delvis dokumenterat, ej officiellt verifierat</p>':
    '<div class="mgp-circuit-unavailable">Banmått och varvrekord har ännu inte verifierats för den här banan.</div>';
  const flag=countryFlag(attrs.country||'');
  // Prefer descriptive event names. The calendar feed sometimes supplies
  // three-letter paddock codes (VAL, POR) as short_name; never show these
  // as the GP title when a human-readable name can be resolved.
  const raceLabels=[attrs.event_name,attrs.sponsored_name,attrs.name,attrs.short_name]
    .map(value=>String(value||'').trim()).filter(Boolean);
  const descriptiveName=raceLabels.find(value=>!(/^[A-Z0-9]{2,5}$/.test(value)));
  const knownGP=map&&({valencia:'Valencia GP',portimao:'Portugal GP'})[map.id];
  const raceName=descriptiveName||knownGP||
    (attrs.country?String(attrs.country)+' GP':'Grand Prix');
  const fmtDate=value=>{
    const match=String(value||'').slice(0,10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if(!match)return '';
    const date=new Date(Number(match[1]),Number(match[2])-1,Number(match[3]),12);
    return date.toLocaleDateString(card._hass?.language||'sv-SE',{day:'numeric',month:'short'});
  };
  const from=fmtDate(attrs.date_start),until=fmtDate(attrs.date_end);
  const dateText=from?(from+(until&&until!==from?' – '+until:'')+
    (attrs.city?' · '+String(attrs.city):'')):'';
  const modalMap=(map||localPath)?
    '<button type="button" class="mgp-circuit-large mgp-dialog-image-close" data-mgp-circuit-dismiss aria-label="Stäng baninformation genom att trycka på banbilden">'+mapVisual+'</button>':
    '<button type="button" class="mgp-dialog-missing-close" data-mgp-circuit-dismiss>Banlayout saknas · tryck för att stänga</button>';
  const circuitDialog='<dialog class="mgp-circuit-dialog" aria-label="Baninformation för '+esc(circuit)+'">'+
    '<div class="mgp-circuit-dialog-head"><span class="mgp-dialog-flag" aria-hidden="true">'+(flag||'')+'</span>'+
    '<div class="mgp-dialog-heading"><strong>'+esc(circuit||'Bana')+'</strong>'+
    '<span class="mgp-dialog-race">'+esc(raceName)+'</span>'+
    (dateText?'<span class="mgp-dialog-dates">'+esc(dateText)+'</span>':'')+'</div></div>'+
    '<div class="mgp-circuit-dialog-body">'+modalMap+circuitFacts+'</div></dialog>';
  const temperature=weatherNumber(weather.air,'°C');
  const ground=weatherNumber(weather.ground,'°C');
  const humidity=weatherNumber(weather.humidity,'%');
  const surface=condition(weather.track);
  const values=[['Luft',temperature],['Bana',ground],['Fuktighet',humidity],['Underlag',surface]];
  const validValues=values.filter(([,v])=>Boolean(v));
  const description=condition(weather.weather);
  const weatherHtml=!isSameEvent?
    '<div class="mgp-weather-empty">Inget banväder från detta GP ännu · tidigare sessionsvärden döljs</div>':
    !dateMatches?
    '<div class="mgp-weather-empty">Inget banväder för den kommande tävlingshelgen ännu</div>':
    validValues.length||description?
    '<div class="mgp-weather-metrics">'+values.map(([label,value])=>
      '<div class="mgp-weather-cell"><small>'+esc(label)+'</small><strong>'+
      esc(value||'—')+'</strong></div>').join('')+'</div>'+
    (description?'<div class="mgp-weather-condition">'+esc(description)+'</div>':''):
    '<div class="mgp-weather-empty">Ingen banväderrapport tillgänglig ännu</div>';
  // Weather precedes the circuit outline, which stays flush-right.
  return '<div class="mgp-venue-strip" data-mgp-venue-header>'+
    '<div class="mgp-weather-panel"><div class="mgp-weather-head">'+
    '<span class="mgp-venue-caption">🌤️ Banväder</span>'+
    '<span class="mgp-weather-source">'+(isSameEvent&&dateMatches?'Senast rapporterat · inte livegaranti':'Rapport för detta GP saknas')+
    (provenance?' · '+esc(provenance):'')+'</span>'+
    (isSameEvent&&dateMatches&&diagnostic?'<span class="mgp-weather-source" data-mgp-weather-diagnostics>'+esc(diagnostic)+'</span>':'')+
    '</div>'+weatherHtml+'</div>'+
    '<div class="mgp-circuit-panel"><div class="mgp-venue-caption">🏁 Banlayout</div>'+mapHtml+factsHtml+'</div></div>'+circuitDialog;
}
const SCHEDULE_DIALOG_STYLE=`
  .mgp-track-trigger{display:block;width:100%;border:0;padding:0;background:transparent;color:inherit;cursor:zoom-in;font:inherit}
  .mgp-track-action{display:block;text-align:center;font-size:10px;margin-top:4px;color:var(--primary-color,#039be5)}
  .mgp-track-trigger:focus-visible{outline:2px solid var(--primary-color,#039be5);outline-offset:4px;border-radius:8px}
  /* Native dialog top-layer positioning can otherwise place a tall circuit
     dialog partly above the viewport, hiding the close control. */
  .mgp-circuit-dialog{box-sizing:border-box;position:fixed;inset:auto;
    top:calc(50% + 12px);left:50%;transform:translate(-50%,-50%);margin:0;
    width:min(760px,calc(100vw - 28px));max-width:calc(100vw - 28px);
    max-height:calc(100dvh - 64px);padding:0;overflow:hidden;
    border:1px solid var(--divider-color,#ddd);border-radius:16px;
    background:var(--ha-card-background,var(--card-background-color,#fff));
    color:var(--primary-text-color);box-shadow:0 20px 60px rgba(0,0,0,.32)}
  .mgp-circuit-dialog[open]{display:flex;flex-direction:column}
  .mgp-circuit-dialog-head{display:flex;flex:0 0 auto;align-items:center;
    gap:13px;padding:13px 18px;border-bottom:1px solid var(--divider-color,#ddd)}
  .mgp-dialog-flag{font-size:30px;line-height:1;flex:0 0 auto}
  .mgp-dialog-flag:empty{display:none}
  .mgp-dialog-heading{display:grid;gap:3px;min-width:0}
  .mgp-dialog-heading strong{font-size:19px;font-weight:800;line-height:1.2;overflow-wrap:anywhere}
  .mgp-dialog-race{font-size:15px;font-weight:650;line-height:1.3}
  .mgp-dialog-dates{font-size:12px;color:var(--secondary-text-color);line-height:1.3}
  .mgp-dialog-image-close{display:flex;align-items:center;justify-content:center;width:100%;height:clamp(255px,43dvh,400px);min-height:clamp(255px,43dvh,400px);padding:0;border:0;background:transparent;color:inherit;font:inherit;cursor:zoom-out}
  .mgp-dialog-image-close:focus-visible,.mgp-dialog-missing-close:focus-visible{outline:2px solid var(--primary-color,#039be5);outline-offset:2px}
  .mgp-dialog-missing-close{display:block;width:100%;padding:30px 0;border:0;background:transparent;color:var(--secondary-text-color);cursor:pointer;font:inherit}
  .mgp-circuit-dialog::backdrop{background:rgba(0,0,0,.55)}
  .mgp-circuit-dialog-body{flex:1 1 auto;min-height:0;overflow-y:auto;
    overscroll-behavior:contain;padding:12px 18px}
  .mgp-circuit-large .mgp-track-layer{height:clamp(255px,43dvh,400px)}
  .mgp-circuit-large .mgp-track-svg{height:100%}
  .mgp-circuit-detail-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:10px 0 15px}
  .mgp-circuit-detail-grid>span{min-width:0;padding:10px 12px;border:1px solid var(--divider-color,#ddd);border-radius:8px;font-size:13px;line-height:1.45}
  .mgp-circuit-detail-grid b,.mgp-circuit-detail-grid small{display:block;margin-top:3px;overflow-wrap:anywhere}
  .mgp-circuit-detail-grid b{font-size:16px;font-weight:750}
  .mgp-circuit-facts-status{display:flex;align-items:center;gap:7px;font-size:13px;font-weight:650;margin:12px 0 8px}
  .mgp-circuit-facts-status i{display:block;width:9px;height:9px;border-radius:50%;background:#d97706}
  .mgp-circuit-facts-status[data-status="verified"] i{background:#16a34a}
  @media(max-width:660px){.mgp-circuit-detail-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
  @media(max-width:390px){.mgp-circuit-detail-grid>span{padding:8px;font-size:12px}.mgp-circuit-detail-grid b{font-size:14px}}
  .mgp-circuit-unavailable{padding:12px;color:var(--secondary-text-color);font-size:12px}

  /* Schedule follows the standings pattern: a normal section below the GP hero. */
  .mgp-weekend-inline{width:100%;box-sizing:border-box;min-width:0;margin:10px 0 0;
    padding:0;border:1px solid var(--divider-color,#ddd);border-radius:15px;
    background:var(--ha-card-background,var(--card-background-color,#fff));color:var(--primary-text-color)}
  .mgp-weekend-inline-head{display:flex;align-items:center;justify-content:space-between;
    gap:12px;padding:12px 15px;border-bottom:1px solid var(--divider-color,#ddd)}
  .mgp-weekend-inline-head strong{font-size:14px}
  .mgp-weekend-inline-head button{border:1px solid var(--divider-color,#ddd);border-radius:9px;
    background:transparent;padding:7px 12px;color:inherit;cursor:pointer;font:inherit}
  .mgp-weekend-inline-body{padding:10px;min-width:0}
  .mgp-weekend-inline-body>.panel{border:0;box-shadow:none}
  @media (max-width:600px){.mgp-weekend-inline-body{padding:7px}}

`;
function install(){
  const Overview=customElements.get(TAG);
  if(Overview?.buildInfo?.version!==REQUIRED){
    console.error('[MotoGP circuit/weather header] Unexpected Overview version');return;
  }
  if(Overview.prototype._mgpTrackWeather)return;
  // Suppress the old separate weather card only for the Overview instance.
  // The sensor and all timing-card paths remain completely unchanged.
  Overview.prototype._weather=function(){return '';};
  const original=Overview.prototype._render;
  Overview.prototype._render=function(){
    original.call(this);
    if(!this._hass||!this.shadowRoot)return;
    if(!this.shadowRoot.querySelector?.('[data-mgp-venue-style]')){
      const style=document.createElement('style');
      style.setAttribute('data-mgp-venue-style','');
      style.textContent=STYLE+SCHEDULE_DIALOG_STYLE;
      this.shadowRoot.appendChild(style);
    }
    const view=this.shadowRoot.getElementById('app');
    if(!view)return;
    // Wrap the existing header text and its optional standings button
    // into the left column. Put weather and circuit to its right, inside
    // the very same <section class="panel header">, not in panels below.
    // This preserves the existing button, spoiler and standings behavior.
    const markup=view.innerHTML;
    const marker='<section class="panel header">';
    const start=markup.indexOf(marker);
    if(start<0)return;
    const innerStart=start+marker.length;
    const end=markup.indexOf('</section>',innerStart);
    if(end<0)return;
    const rawHeader=markup.slice(innerStart,end);
    const country=String(this._hass?.states?.[this._ids?.race]?.attributes?.country||'');
    const flag=countryFlag(country);
    const originalHeader=flag?rawHeader.replace('<h2>',
      '<h2><span class="mgp-country-flag" role="img" aria-label="Flagga: '+esc(country)+'">'+flag+'</span>'):rawHeader;
    // Approved MGP integration artwork is embedded in the single JS bundle; no remote dependency.
    const brandedHeader=originalHeader.replace(/<div class="eyebrow">(?:🏁\s*)?/,
      '<div class="eyebrow mgp-branded-eyebrow"><img class="mgp-brand-logo" src="'+BRAND_SRC+'" alt="MGP" width="27" height="27">');
    if(originalHeader.includes('data-mgp-venue-header'))return;
    // This reflects the active single-JS UI build, not the separately updated backend.
    const uiVersion=(rawHeader.match(/(?:HA-MGP|MOTOGP NEXT)\s*·\s*([^<]+)/i)||[])[1]?.trim()||
      Overview.buildInfo?.version||'okänd';
    const toolbarHtml=toolbar(this);
    // Keep the existing standings control and callback; prepend navigation and countdown.
    const actions=brandedHeader.includes('<div class="np-top-actions">')?
      brandedHeader.replace('<div class="np-top-actions">','<div class="np-top-actions">'+toolbarHtml):
      brandedHeader+'<div class="np-top-actions">'+toolbarHtml+'</div>';
    const body='<div class="mgp-hero-grid" data-mgp-hero-grid>'+
      '<div class="mgp-hero-copy">'+actions+'</div>'+
      venue(this)+'</div>';
    const footer='<details class="mgp-ui-footer"><summary>ⓘ UI-information</summary>'+
      '<div>Frontend: '+esc(uiVersion)+' · Bas-kort: '+esc(Overview.buildInfo?.version||'okänd')+
      '<br>Backendversion hanteras separat.</div></details>';
    const output=markup.slice(0,innerStart)+body+markup.slice(end);
    view.innerHTML=output.includes('<div class="foot">')?
      output.replace('<div class="foot">','<div class="foot">'+footer):output+footer;
    // Attach after every render: native image load/error controls the fallback.
    // No external requests, DOM event attributes or broken-image placeholders.
    for(const localTrack of view.querySelectorAll?.('.mgp-track-local')||[]){
      const markReady=()=>{localTrack.dataset.ready='true';};
      const markUnavailable=()=>{localTrack.dataset.ready='false';};
      localTrack.addEventListener('load',markReady,{once:true});
      localTrack.addEventListener('error',markUnavailable,{once:true});
      if(localTrack.complete){
        if(localTrack.naturalWidth>0)markReady();
        else markUnavailable();
      }
    }
    const circuitDialog=view.querySelector?.('.mgp-circuit-dialog');
    if(circuitDialog&&this._circuitOpen===true&&typeof circuitDialog.showModal==='function'){
      circuitDialog.addEventListener('cancel',event=>{
        event.preventDefault();this._circuitOpen=false;this._render();
      },{once:true});
      circuitDialog.addEventListener('click',event=>{
        // Native dialog backdrop clicks are retargeted to the dialog itself.
        // Some browsers also target the dialog for empty inner space: require
        // pointer coordinates to be OUTSIDE its visible rectangle.
        if(event.target!==circuitDialog)return;
        const rect=circuitDialog.getBoundingClientRect();
        const outside=event.clientX<rect.left||event.clientX>rect.right||
          event.clientY<rect.top||event.clientY>rect.bottom;
        if(!outside)return;
        this._circuitOpen=false;this._render();
      });
      // Bind the actual hitbox directly: no dependency on the card's
      // delegated click handler or SVG hit-testing.
      circuitDialog.querySelector?.('.mgp-dialog-image-close')?.addEventListener('click',event=>{
        event.stopPropagation();this._circuitOpen=false;this._render();
      });
      circuitDialog.querySelector?.('.mgp-dialog-missing-close')?.addEventListener('click',event=>{
        event.stopPropagation();this._circuitOpen=false;this._render();
      });
      if(!circuitDialog.open)circuitDialog.showModal();
    }
    // Schedule is an inline section, not a native dialog or top-layer overlay.
  };
  const originalSchedule=Overview.prototype._schedule;
  Overview.prototype._schedule=function(race,now){
    if(this._scheduleOpen!==true)return '';
    const html=originalSchedule.call(this,race,now);
    // Keep the existing filters/day accordions; only change their container.
    // The schedule now participates in document flow beneath the hero.
    const rawContent=html.replace(/<div class="head"><strong>🗓️ Helgens schema<\/strong><span class="muted">[\s\S]*?<\/span><\/div>/,'');
    const eventAttrs=this._hass?.states?.[this._ids?.race]?.attributes||{};
    const eventCountry=String(eventAttrs.country||'').toLowerCase();
    const scheduleUrl=eventCountry.includes('portugal')?
      'https://www.motogp.com/en/calendar/2026/event/portugal/c7f7626b-807f-4a6f-813e-7ad2c68302a3':
      'https://www.motogp.com/en/calendar';
    const content=rawContent.replace('Inga pass i aktuell evenemangsdata för valt filter.',
      'Detaljerat helgschema är ännu inte tillgängligt i datakällan. '+
      '<a href="'+scheduleUrl+'" target="_blank" rel="noopener noreferrer">Visa MotoGP:s officiella schema</a>.');
    return '<section class="mgp-weekend-inline" aria-label="Helgens schema">'+
      '<div class="mgp-weekend-inline-head"><strong>🗓️ Helgens schema</strong>'+
      '<button type="button" data-mgp-schedule-dismiss>Stäng</button></div>'+
      '<div class="mgp-weekend-inline-body">'+content+'</div></section>';
  };
  const timingCard=customElements.get('ha-motogp-next-timing-card');
  if(timingCard&&!timingCard.prototype._mgpTimingWindow){
    const originalTiming=timingCard.prototype._timing;
    timingCard.prototype._timing=function(){
      if(!timingWindow(this))return '';
      return originalTiming.call(this);
    };
    timingCard.prototype._mgpTimingWindow=BUILD;
  }
  const oldClick=Overview.prototype._click;
  Overview.prototype._click=function(e){
    if(e?.target?.closest?.('[data-mgp-circuit-dismiss]')){
      this._circuitOpen=false;this._render();return;
    }
    if(e?.target?.closest?.('[data-mgp-circuit-open]')){
      this._circuitOpen=true;this._scheduleOpen=false;this._render();return;
    }
    if(e?.target?.closest?.('[data-mgp-schedule-dismiss]')){
      this._scheduleOpen=false;this._render();return;
    }
    if(e?.target?.closest?.('[data-mgp-schedule-jump]')){
      this._scheduleOpen=this._scheduleOpen!==true;
      if(this._scheduleOpen)this._standingOpen=false;
      this._render();
      return;
    }
    return oldClick.call(this,e);
  };
  // Share the existing (schematic) circuit geometry with the season calendar.
  // No duplicated path registry or external API requests.
  Overview.prototype._mgpCalendarTrack=function(circuit){
    const track=trackFor(circuit);
    if(!track)return null;
    return {id:track.id,d:track.d,localPath:localCircuitPath(track,circuit)};
  };
  // The calendar detail modal borrows these facts from the same registry
  // as the active GP header, rather than maintaining a second lookup table.
  Overview.prototype._mgpCalendarFacts=function(circuit,season){
    // The 2027 technical snapshot is not interchangeable with verified
    // historical facts. Keep the selected calendar year explicit.
    if(Number(season)===2027)return calendarFacts2027(circuit);
    const track=trackFor(circuit);
    return track&&CIRCUIT_FACTS[track.id]?CIRCUIT_FACTS[track.id]:
      Number(season)===2026?calendarFacts2026(circuit):null;
  };
  Overview.prototype._mgpTrackWeather=BUILD;
}
customElements.whenDefined(TAG).then(install);
})();
