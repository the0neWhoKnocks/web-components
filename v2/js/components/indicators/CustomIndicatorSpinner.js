(() => {
  const CSS_VAR__COLOR = '--color';
  const CSS_VAR__SPEED = '--speed';
  const ROOT_CLASS = 'spinner';
  const TYPE__FLAT = 'flat';
  const TYPE__ROUNDED = 'rounded';
  const TYPE__TRAIL = 'trail';
  
  const DEFAULT__COLOR = '#000';
  const DEFAULT__SPEED = 500;
  
  class CustomIndicatorSpinner extends HTMLElement {
    get color() {
      return this.getAttribute('color') || DEFAULT__COLOR;
    }
    set color(value) {
      this.setAttribute('color', value);
      this.style.setProperty(CSS_VAR__COLOR, value);
      if (this.type === TYPE__TRAIL) this.renderTrailSpinner();
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
      return this.getAttribute('type') || TYPE__FLAT;
    }
    set type(value) {
      ([
        TYPE__FLAT,
        TYPE__ROUNDED,
        TYPE__TRAIL,
      ].includes(value))
        ? this.setAttribute('type', value)
        : this.setAttribute('type', TYPE__FLAT);
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
        case TYPE__ROUNDED:
          this.renderRoundedSpinner();
          break;
        
        case TYPE__TRAIL:
          this.renderTrailSpinner();
          break;
        
        case TYPE__FLAT:
        default:
          this.renderFlatSpinner();
          break;
      }
    }
    
    renderFlatSpinner() {
      this.shadowRoot.innerHTML = `
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          :host {
            ${CSS_VAR__COLOR}: ${DEFAULT__COLOR};
            ${CSS_VAR__SPEED}: ${DEFAULT__SPEED}ms;
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
            border: solid 0.2em var(${CSS_VAR__COLOR});
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
            animation: spin var(${CSS_VAR__SPEED}) linear infinite paused;
          }
          :host([play]) .${ROOT_CLASS}::after {
            animation-play-state: running;
          }
        </style>
        
        <div class="${ROOT_CLASS}"></div>
      `;
    }
    
    renderRoundedSpinner() {
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
          
          :host {
            ${CSS_VAR__COLOR}: ${DEFAULT__COLOR};
            ${CSS_VAR__SPEED}: ${DEFAULT__SPEED}ms;
          }
          
          svg {
            width: 1em;
            height: 1em;
          }
          
          circle {
            opacity: 0.15;
            fill: none;
            stroke: var(${CSS_VAR__COLOR});
            stroke-width: ${STROKE_WIDTH};
          }
          
          path {
            stroke: var(${CSS_VAR__COLOR});
            stroke-width: ${STROKE_WIDTH};
            transform-origin: center;
            animation: spin var(${CSS_VAR__SPEED}) linear infinite paused;
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
    
    renderTrailSpinner() {
      const EM = parseFloat(getComputedStyle(this).fontSize);
      const DIAMETER = EM * 2;
      const STROKE_WIDTH = DIAMETER * 0.2;
      
      this.shadowRoot.innerHTML = `
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          :host {
            ${CSS_VAR__COLOR}: ${DEFAULT__COLOR};
            ${CSS_VAR__SPEED}: ${DEFAULT__SPEED}ms;
          }
          
          *, *::before, *::after { box-sizing: border-box; }
          
          .${ROOT_CLASS} {
            width: 1em;
            height: 1em;
            position: relative;
          }
          
          .${ROOT_CLASS}::before {
            content: '';
            width: 100%;
            height: 100%;
            border: solid 0.2em var(${CSS_VAR__COLOR});
            border-radius: 100%;
            position: absolute;
            top: 0;
            left: 0;
          }
          .${ROOT_CLASS}::before {
            opacity: 0.15;
          }
          
          canvas {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            animation: spin var(${CSS_VAR__SPEED}) linear infinite paused;
          }
          :host([play]) canvas {
            animation-play-state: running;
          }
        </style>
        
        <div class="${ROOT_CLASS}">
          <canvas width="${DIAMETER}" height="${DIAMETER}"></canvas>
        </div>
      `;
      
      const ctx = this.shadowRoot.querySelector('canvas').getContext('2d');
      ctx.lineJoin = ctx.lineCap = 'round';
      ctx.strokeStyle = this.color;
      
      const drawPoint = (x, y, strokeWidth, alpha) => {
        ctx.globalAlpha = alpha;
        ctx.lineWidth = strokeWidth;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      
      const render = (pointCount) => {
        const step = Math.PI / pointCount;
        const strokeInc = STROKE_WIDTH / pointCount;
        let rot = Math.PI / 2 * 3;
    
        for (let i=0; i<pointCount; i++) {
          const strokeWidth = i * strokeInc;
          const strokeOffset = strokeWidth / 2;
          const pointOffset = (DIAMETER - strokeWidth) / 2;
          const x = ((Math.cos(rot) * pointOffset) + pointOffset) + strokeOffset;
          const y = ((Math.sin(rot) * pointOffset) + pointOffset) + strokeOffset;
          rot += step * 2;
          
          drawPoint(x, y, strokeWidth, i / pointCount);
        }
      };
      
      render(60);
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