(() => {
  const CSS_VAR__COLOR = '--color';
  const CSS_VAR__SPEED = '--speed';
  const ROOT_CLASS = 'leapfrog';
  const TYPE__CSS = 'css';
  
  const DEFAULT__COLOR = '#000';
  const DEFAULT__SPEED = 500;
  
  class CustomIndicatorLeapfrog extends HTMLElement {
    get color() {
      return this.getAttribute('color') || DEFAULT__COLOR;
    }
    set color(value) {
      this.setAttribute('color', value);
      this.style.setProperty(CSS_VAR__COLOR, value);
    }
    
    get play() {
      return this.hasAttribute('play');
    }
    set play(value) {
      (value === '' || value === 'true' || value === true)
        ? this.setAttribute('play', '')
        : this.removeAttribute('play');
    }
    
    get speed() {
      return +(this.getAttribute('speed') || DEFAULT__SPEED);
    }
    set speed(value) {
      this.setAttribute('speed', value);
      this.style.setProperty(CSS_VAR__SPEED, `${value}ms`);
    }
    
    get type() {
      return this.getAttribute('type') || TYPE__CSS;
    }
    set type(value) {
      ([TYPE__CSS].includes(value))
        ? this.setAttribute('type', value)
        : this.setAttribute('type', TYPE__CSS);
    }
    
    static get observedAttributes() {
      return [
        'color',
        'play',
        'speed',
        'type',
      ];
    }
    
    attributeChangedCallback(attr, oldVal, newVal) {
      const empty = oldVal === '' && (newVal === null || newVal === undefined);
      
      if (!empty && oldVal !== newVal) {
        let _newVal = newVal;
        
        switch (attr) {
          default: { this[attr] = _newVal; }
        }
      }
    }
    
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
    
    connectedCallback() {
      switch (this.type) {
        case TYPE__CSS:
        default:
          this.renderCSSSpinner();
          break;
      }
    }
    
    renderCSSSpinner() {
      this.shadowRoot.innerHTML = `
        <style>
          @keyframes hop1 {
            0% { transform: translate(-150%, 0%); }
            25% { transform: translate(-75%, -100%); }
            50% { transform: translate(0%, 0%); }
            75% { transform: translate(75%, -100%); }
            100% { transform: translate(150%, 0%); }
          }
          @keyframes hop2 {
            0% { transform: translate(0%, 0%); }
            50%, 100% { transform: translate(-150%, 0%); }
          }
          @keyframes hop3 {
            0%, 50% { transform: translate(150%, 0%); }
            100% { transform: translate(0%, 0%); }
          }
          
          :host {
            ${CSS_VAR__COLOR}: ${DEFAULT__COLOR};
            ${CSS_VAR__SPEED}: ${DEFAULT__SPEED}ms;
          }
          
          *, *::before, *::after { box-sizing: border-box; }
          
          .${ROOT_CLASS}-wrapper {
            padding: 0.5em 1.5em;
            border-radius: 1em;
            pointer-events: none;
          }
          
          .${ ROOT_CLASS } {
            width: 0.5em;
            height: 0.5em;
            position: relative;
          }
          
          .${ ROOT_CLASS }::before,
          .${ ROOT_CLASS }::after {
            content: '';
            display: block;
            position: absolute;
            top: 0;
            left: 0;
          }
          
          .${ ROOT_CLASS }::before,
          .${ ROOT_CLASS }__dot,
          .${ ROOT_CLASS }::after {
            width: 100%;
            height: 100%;
            border-radius: 100%;
            background: var(${CSS_VAR__COLOR});
            animation-duration: var(${CSS_VAR__SPEED});
            animation-iteration-count: infinite;
            animation-play-state: paused;
          }
          
          .${ ROOT_CLASS }::before { animation-name: hop1; }
          .${ ROOT_CLASS }__dot { animation-name: hop2; }
          .${ ROOT_CLASS }::after { animation-name: hop3; }
          
          :host([play]) .${ ROOT_CLASS }__dot,
          :host([play]) .${ ROOT_CLASS }::before,
          :host([play]) .${ ROOT_CLASS }::after {
            animation-play-state: running;
          }
        </style>
        
        <div class="${ROOT_CLASS}-wrapper">
          <div class="${ROOT_CLASS}">
            <div class="${ROOT_CLASS}__dot"></div>
          </div>
        </div>
      `;
    }
  }

  const EL_NAME = 'custom-indicator-leapfrog';
  if (window.customElements.get(EL_NAME)) {
    console.warn(`${EL_NAME} already defined`);
  }
  else {
    window.customElements.define(EL_NAME, CustomIndicatorLeapfrog);
    window.CustomIndicatorLeapfrog = CustomIndicatorLeapfrog;
  }
})();