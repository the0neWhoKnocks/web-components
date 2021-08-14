(() => {
  const lineLength = 25;
  const CSS_VAR__STROKE_COLOR = '--stroke-color';
  const CSS_VAR__STROKE_WIDTH = '--stroke-width';
  const DEFAULT__ANIM_DURATION = '300ms';
  const DEFAULT__STROKE_COLOR = '#333';
  const DEFAULT__STROKE_WIDTH = 2;
  const SVG_WIDTH = 16;
  const SVG_HEIGHT = 16;
  
  class IconCheck extends HTMLElement {
    get animate() {
      return this.hasAttribute('animate');
    }
    set animate(value) {
      (value === '' || value === 'true' || value === true)
        ? this.setAttribute('animate', '')
        : this.removeAttribute('animate');
    }
    
    get on() {
      return this.hasAttribute('on');
    }
    set on(value) {
      (value === '' || value === 'true' || value === true)
        ? this.setAttribute('on', '')
        : this.removeAttribute('on');
    }
    
    get strokeColor() {
      return getComputedStyle(this).getPropertyValue(CSS_VAR__STROKE_COLOR);
    }
    set strokeColor(value) {
      this.style.setProperty(CSS_VAR__STROKE_COLOR, value);
    }
    
    get strokeWidth() {
      return +getComputedStyle(this).getPropertyValue(CSS_VAR__STROKE_WIDTH);
    }
    set strokeWidth(value) {
      this.style.setProperty(CSS_VAR__STROKE_WIDTH, value);
      this.render();
    }
    
    static get observedAttributes() {
      return ['animate', 'on', 'strokecolor', 'strokewidth'];
    }
    
    attributeChangedCallback(attr, oldVal, newVal) {
      if (oldVal !== newVal) {
        switch (attr) {
          case 'animate': { this.animate = newVal; break; }
          case 'on': { this.on = newVal; break; }
          case 'strokecolor': { this.strokeColor = newVal; break; }
          case 'strokewidth': { this.strokeWidth = newVal; break; }
        }
      }
    }
    
    constructor() {
      super();
      
      this.attachShadow({ mode: 'open' });
      
      const { shadowRoot } = this;
      const animPause = Math.round(lineLength - (lineLength / 4));
      
      shadowRoot.innerHTML = `
        <style>
          @keyframes on {
            0% { stroke-dashoffset: ${lineLength}; }
            25% { stroke-dashoffset: ${animPause}; }
            70% { stroke-dashoffset: ${animPause}; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes off {
            0% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: -${lineLength}; }
          }
          
          :host {
            ${CSS_VAR__STROKE_COLOR}: ${DEFAULT__STROKE_COLOR};
            ${CSS_VAR__STROKE_WIDTH}: ${DEFAULT__STROKE_WIDTH};
            
            width: 1em;
            height: 1em;
            display: inline-block;
          }
          :host([animate][on]) polyline {
            animation: on ${DEFAULT__ANIM_DURATION};
          }
          :host([animate]) polyline {
            animation: off ${DEFAULT__ANIM_DURATION};
          }
          :host([on]) polyline {
            stroke-dashoffset: 0;
          }
          
          svg {
            width: 100%;
            height: 100%;
          }
          
          polyline {
            stroke: var(${CSS_VAR__STROKE_COLOR});
            stroke-dasharray: ${lineLength};
            stroke-dashoffset: ${lineLength};
            stroke-width: var(${CSS_VAR__STROKE_WIDTH});
          }
        </style>
        
        <svg viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
          <polyline fill="none" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      `;
      
      this.els = {
        polyline: shadowRoot.querySelector('polyline'),
      };
      
    }
    
    connectedCallback(){
      this.render();
    };
    
    render() {
      const offset = this.strokeWidth / 2;
      this.els.polyline.setAttribute('points', `${offset},${SVG_HEIGHT - (SVG_HEIGHT / 2.5)} ${SVG_WIDTH / 3},${SVG_HEIGHT - offset} ${SVG_WIDTH - offset},${offset}`);
    }
  }

  window.customElements.define('custom-icon-check', IconCheck);
})();
