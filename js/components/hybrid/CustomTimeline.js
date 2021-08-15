(() => {
  const CSS_VAR__COLOR__FAILED = '--color--failed';
  const CSS_VAR__COLOR__FAILED_ACCENT = '--color--failed-accent';
  const CSS_VAR__COLOR__FAILED_SECONDARY = '--color--failed-secondary';
  const CSS_VAR__COLOR__PASSED = '--color--passed';
  const CSS_VAR__COLOR__PASSED_ACCENT = '--color--passed-accent';
  const CSS_VAR__COLOR__PASSED_SECONDARY = '--color--passed-secondary';
  const CSS_VAR__COLOR__RUNNING = '--color--running';
  const CSS_VAR__COLOR__RUNNING_ACCENT = '--color--running-accent';
  const CSS_VAR__COLOR__RUNNING_SECONDARY = '--color--running-secondary';
  const CSS_VAR__POINT_RADIUS = '--point-radius';
  const CSS_VAR__STROKE_COLOR = '--stroke-color';
  const CSS_VAR__STROKE_WIDTH = '--stroke-width';
  const DEFAULT__NUM_OF_POINTS = 2;
  const DEFAULT__POINT_RADIUS = 1.5;
  const DEFAULT__STROKE_COLOR = '#dedede';
  const DEFAULT__STROKE_WIDTH = 0.25;
  const STATE__FAILED = 'failed';
  const STATE__RUNNING = 'running';
  const STATE__SUCCESSFUL = 'successful';
  const statesMap = {
    f: STATE__FAILED,
    r: STATE__RUNNING,
    s: STATE__SUCCESSFUL,
  };
  
  class CustomTimeline extends HTMLElement {
    get points() {
      return +this.getAttribute('points') || DEFAULT__NUM_OF_POINTS;
    }
    set points(value) {
      const _val = +value;
      const points = (_val > DEFAULT__NUM_OF_POINTS) ? _val : DEFAULT__NUM_OF_POINTS;
      
      this.setAttribute('points', points);
      this.els.root.innerHTML = Array(this.points).fill('').reduce((str) => {
        return `${str}<div class="${this.ROOT_CLASS}__point"></div>`;
      }, '');
    }
    
    get pointRadius() {
      return this.getAttribute('pointRadius') || DEFAULT__POINT_RADIUS;
    }
    set pointRadius(value) {
      const _val = +value;
      this.setAttribute('pointRadius', _val);
      this.style.setProperty(CSS_VAR__POINT_RADIUS, `${_val}em`);
    }
    
    get pointStates() {
      return this.getAttribute('pointStates');
    }
    set pointStates(states) {
      this.setAttribute('pointStates', states);
      
      if (states) {
        // A race condition for the initial setting of `points` can occur, so
        // wait a tick to ensure there's markup to work with.
        requestAnimationFrame(() => {
          states.split(';').forEach((s) => {
            const [ndx, state] = s.trim().split(',');
            
            if (statesMap[state]) {
              const el = this.els.root.querySelector(`.${this.ROOT_CLASS}__point:nth-of-type(${+ndx})`);
              if (el) {
                el.classList.remove(...Object.values(statesMap));
                el.classList.add(statesMap[state]);
              }
            }
          });
        });
      }
    }
    
    get strokeColor() {
      return this.getAttribute('strokeColor') || DEFAULT__STROKE_COLOR;
    }
    set strokeColor(value) {
      this.setAttribute('strokeColor', value);
      this.style.setProperty(CSS_VAR__STROKE_COLOR, value);
    }
    
    get strokeWidth() {
      return this.getAttribute('strokeWidth') || DEFAULT__STROKE_WIDTH;
    }
    set strokeWidth(value) {
      const _val = +value;
      this.setAttribute('strokeWidth', _val);
      this.style.setProperty(CSS_VAR__STROKE_WIDTH, `${_val}em`);
    }
    
    get vertical() {
      return this.hasAttribute('vertical');
    }
    set vertical(value) {
      (value === '' || value === 'true' || value === true)
        ? this.setAttribute('vertical', '')
        : this.removeAttribute('vertical');
    }
    
    static get observedAttributes() {
      return [
        'points',
        'pointradius',
        'pointstates',
        'strokecolor',
        'strokewidth',
        'vertical',
      ];
    }
    
    attributeChangedCallback(attr, oldVal, newVal) {
      if (oldVal !== newVal) {
        let _newVal = newVal;
    
        switch (attr) {
          case 'pointradius': { this.pointRadius = _newVal; break; }
          case 'pointstates': { this.pointStates = _newVal; break; }
          case 'strokecolor': { this.strokeColor = _newVal; break; }
          case 'strokewidth': { this.strokeWidth = _newVal; break; }
          default: { this[attr] = _newVal; }
        }
      }
    }
    
    constructor() {
      super();
      
      this.attachShadow({ mode: 'open' });
      
      const { shadowRoot } = this;
      this.ROOT_CLASS = 'timeline';
      
      shadowRoot.innerHTML = `
        <style>
          *, *::after, *::before {
            box-sizing: border-box;
          }
          
          :host {
            ${CSS_VAR__COLOR__FAILED}: #77003b;
            ${CSS_VAR__COLOR__FAILED_ACCENT}: #feffc2;
            ${CSS_VAR__COLOR__FAILED_SECONDARY}: #ff94af;
            ${CSS_VAR__COLOR__PASSED}: #006d5b;
            ${CSS_VAR__COLOR__PASSED_ACCENT}: #f7ffc2;
            ${CSS_VAR__COLOR__PASSED_SECONDARY}: #b9f6ca;
            ${CSS_VAR__COLOR__RUNNING}: #0051ae;
            ${CSS_VAR__COLOR__RUNNING_ACCENT}: #b5e9ff;
            ${CSS_VAR__COLOR__RUNNING_SECONDARY}: #60a4f2;
            ${CSS_VAR__POINT_RADIUS}: ${DEFAULT__POINT_RADIUS}em;
            ${CSS_VAR__STROKE_COLOR}: ${DEFAULT__STROKE_COLOR};
            ${CSS_VAR__STROKE_WIDTH}: ${DEFAULT__STROKE_WIDTH}em;
            
            font-family: Helvetica, Arial, sans-serif;
          }
          
          .${this.ROOT_CLASS} {
            display: flex;
          }
          .${this.ROOT_CLASS}__point {
            width: 100%;
            height: var(${CSS_VAR__POINT_RADIUS});
            flex: 1;
            position: relative;
          }
          .${this.ROOT_CLASS}__point:last-of-type {
            flex: 0;
          }
          .${this.ROOT_CLASS}__point:not(:last-of-type)::before {
            content: '';
            height: var(${CSS_VAR__STROKE_WIDTH});
            background: var(${CSS_VAR__STROKE_COLOR});
            display: block;
            position: absolute;
            top: 50%;
            left: calc(var(${CSS_VAR__POINT_RADIUS}) - (var(${CSS_VAR__STROKE_WIDTH}) / 2));
            right: calc((var(${CSS_VAR__STROKE_WIDTH}) / 2) * -1);
            transform: translateY(-50%);
          }
          .${this.ROOT_CLASS}__point::after {
            content: '';
            width: var(${CSS_VAR__POINT_RADIUS});
            height: var(${CSS_VAR__POINT_RADIUS});
            line-height: 1em;
            border: var(${CSS_VAR__STROKE_WIDTH}) solid var(${CSS_VAR__STROKE_COLOR});
            border-radius: 100%;
            display: block;
            position: relative;
          }
          
          :host([vertical]) .${this.ROOT_CLASS} {
            width: var(${CSS_VAR__POINT_RADIUS});
            height: 100%;
            flex-direction: column;
          }
          :host([vertical]) .${this.ROOT_CLASS}__point {
            width: var(${CSS_VAR__POINT_RADIUS});
            height: 100%;
          }
          :host([vertical]) .${this.ROOT_CLASS}__point::before {
            width: var(${CSS_VAR__STROKE_WIDTH});
            height: auto;
            top: calc(var(${CSS_VAR__POINT_RADIUS}) - (var(${CSS_VAR__STROKE_WIDTH}) / 2));
            bottom: calc((var(${CSS_VAR__STROKE_WIDTH}) / 2) * -1);
            left: 50%;
            right: unset;
            transform: translateX(-50%);
          }
          
          @keyframes runningAnim {
            0% {
              border-color: var(${CSS_VAR__COLOR__RUNNING});
              background-color: var(${CSS_VAR__COLOR__RUNNING_SECONDARY});
            }
            50% {
              border-color: var(${CSS_VAR__COLOR__RUNNING_SECONDARY});
              background-color: var(${CSS_VAR__COLOR__RUNNING_ACCENT});
            }
            100% {
              border-color: var(${CSS_VAR__COLOR__RUNNING});
              background-color: var(${CSS_VAR__COLOR__RUNNING_SECONDARY});
            }
          }
          .${this.ROOT_CLASS}__point.${STATE__RUNNING}::after {
            animation: runningAnim 3s infinite;
          }
          
          .${this.ROOT_CLASS}__point.${STATE__SUCCESSFUL}::before {
            background: var(${CSS_VAR__COLOR__PASSED});
          }
          .${this.ROOT_CLASS}__point.${STATE__SUCCESSFUL}::after {
            border-color: var(${CSS_VAR__COLOR__PASSED});
            background: var(${CSS_VAR__COLOR__PASSED_SECONDARY});
          }
          .${this.ROOT_CLASS}__point.${STATE__SUCCESSFUL}:last-of-type::after {
            color: var(${CSS_VAR__COLOR__PASSED});
            background: var(${CSS_VAR__COLOR__PASSED_ACCENT});
          }
          
          .${this.ROOT_CLASS}__point.${STATE__FAILED}::before {
            background: var(${CSS_VAR__COLOR__FAILED});
          }
          .${this.ROOT_CLASS}__point.${STATE__FAILED}::after {
            color: var(${CSS_VAR__COLOR__FAILED});
            border-color: var(${CSS_VAR__COLOR__FAILED});
            background: var(${CSS_VAR__COLOR__FAILED_SECONDARY});
          }
        </style>
        
        <div class="${this.ROOT_CLASS}"></div>
      `;
      
      this.els = {
        root: shadowRoot.querySelector(`.${this.ROOT_CLASS}`),
      };
    }
    
    connectedCallback() {
      // set default if no `points` have been specified
      if (!this.els.root.innerHTML) this.points = this.points; // eslint-disable-line no-self-assign
    }
  }

  const EL_NAME = 'custom-timeline';
  if (window.customElements.get(EL_NAME)) {
    console.warn(`${EL_NAME} already defined`);
  }
  else {
    window.customElements.define(EL_NAME, CustomTimeline);
    window.CustomTimeline = CustomTimeline;
  }
})();