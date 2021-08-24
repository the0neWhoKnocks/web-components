(() => {
  const DEFAULT__COLOR = '#000';
  const DEFAULT__SPEED = 500;
  const ROOT_CLASS = 'spinner';
  const TYPE__CSS = 'css';
  const TYPE__SVG = 'svg';
  
  class CustomIndicatorSpinner extends HTMLElement {
    get color() {
      return this.getAttribute('color') || DEFAULT__COLOR;
    }
    set color(value) {
      this.setAttribute('color', value);
      this.renderCSSSpinner();
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
    }
    
    get type() {
      return this.getAttribute('type') || TYPE__CSS;
    }
    set type(value) {
      ([TYPE__CSS, TYPE__SVG].includes(value))
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
        case TYPE__SVG:
          this.renderSVGSpinner();
          break;
        
        case TYPE__CSS:
        default:
          this.renderCSSSpinner();
          break;
      }
    }
    
    renderCSSSpinner() {
      this.shadowRoot.innerHTML = `
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          *, *::before, *::after { box-sizing: border-box; }
          
          .${ROOT_CLASS} {
            width: 1em;
            height: 1em;
            position: relative;
          }
          .${ROOT_CLASS}::before,
          .${ROOT_CLASS}::after {
            content: '';
            width: 100%;
            height: 100%;
            border: solid 0.2em ${this.color};
            border-radius: 100%;
            position: absolute;
            top: 0;
            left: 0;
          }
          .${ROOT_CLASS}::before {
            opacity: 0.15;
          }
          .${ROOT_CLASS}::after {
            border-right-color: transparent;
            border-bottom-color: transparent;
            border-left-color: transparent;
            animation: spin ${this.speed}ms linear infinite paused;
          }
          :host([play]) .${ROOT_CLASS}::after {
            animation-play-state: running;
          }
        </style>
        
        <div class="${ROOT_CLASS}"></div>
      `;
    }
    
    renderSVGSpinner() {
      const DIAMETER = 20;
      const RADIUS = DIAMETER / 2;
      const STROKE_WIDTH = 4;
      const OFFSET = STROKE_WIDTH / 2;
      const CURVE_MULTIPLIER = 0.55;
      
      const coordWithOffset = (c) => {
        let _c = c;
        if (_c < RADIUS) _c += OFFSET;
        else if (_c > RADIUS) _c -= OFFSET;
        return _c;
      };
      
      const points = `0,${RADIUS} ${RADIUS},0`;
      const curve = points.split(' ').map((coords, ndx, arr) => {
        const [x, y] = coords.split(',');
        const _x = coordWithOffset(x);
        const _y = coordWithOffset(y);
        
        let _points = `M${_x},${_y}`;
        
        if (ndx > 0) {
          const [prevX, prevY] = arr[ndx - 1].split(',');
          const _prevX = coordWithOffset(prevX);
          const _prevY = coordWithOffset(prevY);
          
          _points = [
            `C${prevX + OFFSET},${Math.max(_prevY, _y) * CURVE_MULTIPLIER}`,
            `${Math.max(_prevX, _x) * CURVE_MULTIPLIER},${_y}`,
            `${_x},${_y}`,
          ].join(' ');
        }
        
        return _points;
      }).join(' ');
      
      this.shadowRoot.innerHTML = `
        <style>
          @keyframes spin {
            0% { transform: rotate(45deg); }
            100% { transform: rotate(405deg); }
          }
          
          svg {
            width: 1em;
            height: 1em;
          }
          
          circle {
            opacity: 0.15;
            fill: none;
            stroke: ${this.color};
            stroke-width: ${STROKE_WIDTH};
          }
          
          path {
            stroke: ${this.color};
            stroke-width: ${STROKE_WIDTH};
            transform-origin: center;
            animation: spin ${this.speed}ms linear infinite paused;
          }
          :host([play]) path {
            animation-play-state: running;
          }
        </style>
        
        <svg viewBox="0 0 ${DIAMETER} ${DIAMETER}" xmlns="http://www.w3.org/2000/svg">
          <circle cx="${RADIUS}" cy="${RADIUS}" r="${RADIUS - OFFSET}" />
          <path stroke-linecap="round" fill="none" d="${curve}"></path>
        </svg>
      `;
    }
  }

  const EL_NAME = 'custom-indicator-spinner';
  if (window.customElements.get(EL_NAME)) {
    console.warn(`${EL_NAME} already defined`);
  }
  else {
    window.customElements.define(EL_NAME, CustomIndicatorSpinner);
    window.CustomIndicatorSpinner = CustomIndicatorSpinner;
  }
})();