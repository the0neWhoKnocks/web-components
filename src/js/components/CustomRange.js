(() => {
  const CSS_VAR__COLOR__HANDLE = '--color--handle';
  const CSS_VAR__COLOR__STROKE = '--color--stroke';
  const CSS_VAR__COLOR__TRACK = '--color--track';
  const CSS_VAR__COLOR__VALUE = '--color--value';
  const EVENT__VALUE = 'value';
  const MODIFIER__SCRUBBING = 'scrubbing';
  const SELECTOR__RANGE = 'range';
  const SELECTOR__TRACK = 'track';
  const SELECTOR__TRACK__VALUE = 'track__value';
  const SELECTOR__HANDLE = 'handle';
  
  const DEFAULT__COLOR__HANDLE = '#cccccc';
  const DEFAULT__COLOR__STROKE = '#000000';
  const DEFAULT__COLOR__TRACK = '#808080';
  const DEFAULT__COLOR__VALUE = '#ffff00';
  
  class CustomRange extends HTMLElement {
    setNonValueProp(prop, value) {
      if (value === '' || value === 'true' || value === true) {
        this.setAttribute(prop, '');
      }
      else {
        this.removeAttribute(prop);
      }
    }
    
    get animate() { return this.hasAttribute('animate'); }
    set animate(value) { this.setNonValueProp('animate', value); }
    
    get disabled() { return this.hasAttribute('disabled'); }
    set disabled(value) {
      this.setNonValueProp('disabled', value);
      if (this.els.slottedInput) this.els.slottedInput.disabled = value;
    }
    
    get handleColor() {
      return this.getAttribute('handleColor') || DEFAULT__COLOR__HANDLE;
    }
    set handleColor(value) {
      this.setAttribute('handleColor', value);
      this.style.setProperty(CSS_VAR__COLOR__HANDLE, value);
    }
    
    get min() { return +this.getAttribute('min') || 0; }
    set min(value) {
      this.setAttribute('min', value);
      if (this.els.slottedInput) this.els.slottedInput.min = value;
    }
    
    get max() { return +this.getAttribute('max') || 100; }
    set max(value) {
      this.setAttribute('max', value);
      if (this.els.slottedInput) this.els.slottedInput.max = value;
    }
    
    get sectionsCount() { return this.valueRange / this.step; }
    
    get step() { return +this.getAttribute('step') || 1; }
    set step(value) {
      this.setAttribute('step', value);
      if (this.els.slottedInput) this.els.slottedInput.step = value;
    }
    
    get strokeColor() {
      return this.getAttribute('strokeColor') || DEFAULT__COLOR__STROKE;
    }
    set strokeColor(value) {
      this.setAttribute('strokeColor', value);
      this.style.setProperty(CSS_VAR__COLOR__STROKE, value);
    }
    
    get ticks() { return this.hasAttribute('ticks'); }
    set ticks(value) { this.setNonValueProp('ticks', value); }
    
    get trackColor() {
      return this.getAttribute('trackColor') || DEFAULT__COLOR__TRACK;
    }
    set trackColor(value) {
      this.setAttribute('trackColor', value);
      this.style.setProperty(CSS_VAR__COLOR__TRACK, value);
    }
    
    get value() { return +this.getAttribute('value'); }
    set value(value) {
      let newValue = +value;
      
      if (newValue < this.min) newValue = this.min;
      else if (newValue > this.max) newValue = this.max;
      
      if (this.value !== newValue) {
        this.setAttribute('value', newValue);
        
        this.render();
        
        this.dispatchEvent(new CustomEvent(EVENT__VALUE, {
          bubbles: true,
          detail: { value: newValue },
        }));
        
        if (this.els.slottedInput) {
          this.els.slottedInput.setAttribute('value', newValue);
          this.els.slottedInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        }
      }
    }
    
    get valueColor() {
      return this.getAttribute('valueColor') || DEFAULT__COLOR__VALUE;
    }
    set valueColor(value) {
      this.setAttribute('valueColor', value);
      this.style.setProperty(CSS_VAR__COLOR__VALUE, value);
    }
    
    get valueRange() { return this.max - this.min; }
    
    get vertical() { return this.hasAttribute('vertical'); }
    set vertical(value) {
      this.setNonValueProp('vertical', value);
      this.render();
    }
    
    static get observedAttributes() {
      return [
        'animate',
        'disabled',
        'handlecolor',
        'min',
        'max',
        'step',
        'strokecolor',
        'ticks',
        'trackcolor',
        'value',
        'valuecolor',
        'vertical',
      ];
    }
    
    static get events() {
      return {
        value: EVENT__VALUE,
      };
    }
    
    attributeChangedCallback(attr, oldVal, newVal) {
      const empty = oldVal === '' && (newVal === null || newVal === undefined);
      
      if (!empty && oldVal !== newVal) {
        let _newVal = newVal;
        
        switch (attr) {
          case 'handlecolor': { this.handleColor = _newVal; break; }
          case 'strokecolor': { this.strokeColor = _newVal; break; }
          case 'trackcolor': { this.trackColor = _newVal; break; }
          case 'valuecolor': { this.valueColor = _newVal; break; }
          default: { this[attr] = _newVal; }
        }
      }
    }
    
    constructor() {
      super();
      
      this.attachShadow({ mode: 'open' });
      
      const { shadowRoot } = this;
      
      shadowRoot.innerHTML = `
        <style>
          *, *::after, *::before {
            box-sizing: border-box;
          }
          
          :host {
            ${CSS_VAR__COLOR__HANDLE}: ${DEFAULT__COLOR__HANDLE};
            ${CSS_VAR__COLOR__STROKE}: ${DEFAULT__COLOR__STROKE};
            ${CSS_VAR__COLOR__TRACK}: ${DEFAULT__COLOR__TRACK};
            ${CSS_VAR__COLOR__VALUE}: ${DEFAULT__COLOR__VALUE};
            --thickness: 1.75em;
            --thickness--handle: 1em;
            
            font-family: Helvetica, Arial, sans-serif;
            display: inline-block;
            position: relative;
          }
          :host(:not([vertical])) {
            width: 100%;
            height: var(--thickness);
          }
          :host([vertical]) {
            width: var(--thickness);
            height: 100%;
          }
          :host([disabled]) {
            pointer-events: none;
            opacity: 0.25;
          }
          
          slot {
            display: none;
          }
          
          .${SELECTOR__RANGE} {
            --perc: 0%;
            
            width: 100%;
            height: 100%;
            color: var(${CSS_VAR__COLOR__STROKE});
            display: flex;
            cursor: pointer;
            position: absolute;
          }
          :host(:not([vertical])) .${SELECTOR__RANGE} {
            top: 0;
            align-items: center;
          }
          :host([vertical]) .${SELECTOR__RANGE} {
            justify-content: center;
            bottom: 0;
          }
          
          .${SELECTOR__RANGE} > * {
            pointer-events: none;
          }
          
          .${SELECTOR__TRACK} {
            border: solid 1px;
            background: var(${CSS_VAR__COLOR__TRACK});
            overflow: hidden;
          }
          :host(:not([vertical])) .${SELECTOR__TRACK} {
            width: 100%;
            height: 34%;
          }
          :host([vertical]) .${SELECTOR__TRACK} {
            width: 34%;
            height: 100%;
          }
          
          .${SELECTOR__TRACK__VALUE} {
            width: 100%;
            height: 100%;
            background: var(${CSS_VAR__COLOR__VALUE});
          }
          
          .${SELECTOR__HANDLE} {
            padding: 0;
            border: solid 1px;
            background: var(${CSS_VAR__COLOR__HANDLE});
            position: absolute;
          }
          
          :host(:not([vertical])) .${SELECTOR__HANDLE} {
            width: var(--thickness--handle);
            height: 100%;
            left: clamp(
              0%,
              calc((1% * var(--perc)) - (var(--thickness--handle) / 2)),
              calc(100% - var(--thickness--handle))
            );
          }
          :host(:not([vertical])) .${SELECTOR__TRACK__VALUE} {
            transform-origin: left;
            transform: scale(calc(var(--perc) * 0.01), 1);
          }
          
          :host([vertical]) .${SELECTOR__HANDLE} {
            width: 100%;
            height: var(--thickness--handle);
            bottom: clamp(
              0%,
              calc(100% - ((1% * var(--perc)) + (var(--thickness--handle) / 2))),
              calc(100% - var(--thickness--handle))
            );
          }
          :host([vertical]) .${SELECTOR__TRACK__VALUE} {
            transform-origin: bottom;
            transform: scale(1, calc(1 - (var(--perc) * 0.01)));
          }
          
          :host([animate]) .${SELECTOR__RANGE}:not(.${MODIFIER__SCRUBBING}) .${SELECTOR__TRACK__VALUE} {
            transition: transform 200ms;
          }
          :host([animate]:not([vertical])) .${SELECTOR__RANGE}:not(.${MODIFIER__SCRUBBING}) .${SELECTOR__HANDLE} {
            transition: left 200ms;
          }
          :host([animate][vertical]) .${SELECTOR__RANGE}:not(.${MODIFIER__SCRUBBING}) .${SELECTOR__HANDLE} {
            transition: bottom 200ms;
          }
        </style>
        
        <slot></slot>
        
        <div class="${SELECTOR__RANGE}">
          <div class="${SELECTOR__TRACK}">
            <div class="${SELECTOR__TRACK__VALUE}"></div>
          </div>
          <button class="${SELECTOR__HANDLE}" type="button"></button>
        </div>
      `;
      
      this.els = {
        handle: shadowRoot.querySelector(`.${SELECTOR__HANDLE}`),
        range: shadowRoot.querySelector(`.${SELECTOR__RANGE}`),
        track: shadowRoot.querySelector(`.${SELECTOR__TRACK}`),
        trackValue: shadowRoot.querySelector(`.${SELECTOR__TRACK__VALUE}`),
      };
    }
    
    connectedCallback() {
      this.handleKeyDown = this.handleKeyDown.bind(this);
      this.handlePointerDown = this.handlePointerDown.bind(this);
      this.handlePointerMove = this.handlePointerMove.bind(this);
      this.handlePointerUp = this.handlePointerUp.bind(this);
      
      this.addEventListener('keydown', this.handleKeyDown);
      this.addEventListener('pointerdown', this.handlePointerDown);
      this.addEventListener('pointerup', this.handlePointerUp);
      
      this.shadowRoot.addEventListener('slotchange', ({ target: slot }) => {
        slot.assignedNodes().forEach(el => {
          switch (el.nodeName) {
            case 'INPUT': {
              if (el.type === 'range') {
                this.els.slottedInput = el;
                this.disabled = this.els.slottedInput.disabled;
                this.min = this.els.slottedInput.min;
                this.max = this.els.slottedInput.max;
                this.step = this.els.slottedInput.step;
                this.value = this.els.slottedInput.value;
              }
              
              break;
            }
          }
        });
      });
    }
    
    calcData(pointerX, pointerY) { 
      this.setDims();
      const { containerX, containerY, trackLength } = this.dims;
      
      const valueRange = this.valueRange;
      const x = pointerX - containerX;
      const y = pointerY - containerY;
      const pos = (this.vertical) ? y : x;
      const posPerc = (pos / trackLength) || 0;
      const rawValue = (this.vertical)
        ? (valueRange * posPerc) - this.min
        : (valueRange * posPerc) + this.min;
      let steppedValue = Math.round(rawValue / this.step) * this.step;
      
      if (this.vertical) steppedValue = valueRange - steppedValue;
      
      this.value = steppedValue;
    }
    
    handleKeyDown({ key }) {
      switch (key) {
        case 'ArrowRight':
        case 'ArrowUp': {
          this.value += this.step;
          break;
        }
        
        case 'ArrowDown':
        case 'ArrowLeft': {
          this.value -= this.step;
          break;
        }
      }
    }
    
    handlePointerDown({ clientX, clientY }) {
      this.calcData(clientX, clientY);
      
      document.addEventListener('pointermove', this.handlePointerMove);
      document.addEventListener('pointerup', this.handlePointerUp);
    }
    
    handlePointerMove({ clientX, clientY }) {
      this.els.range.classList.add(MODIFIER__SCRUBBING);
      this.calcData(clientX, clientY);
    }
    
    handlePointerUp({ clientX, clientY }) {
      document.removeEventListener('pointermove', this.handlePointerMove);
      document.removeEventListener('pointerup', this.handlePointerUp);
      
      this.calcData(clientX, clientY);
      
      if (this.els.range.classList.contains(MODIFIER__SCRUBBING)) {
        this.els.range.classList.remove(MODIFIER__SCRUBBING);
      }
    }
    
    render() {
      const steppedPerc = ((this.value - this.min) / this.valueRange) * 100;
      const normalizedPerc = this.vertical ? 100 - steppedPerc : steppedPerc;
      
      this.els.range.style.setProperty('--perc', normalizedPerc);
    }
    
    setDims() {
      const { left, top } = this.getBoundingClientRect();
      const trackLength = (this.vertical)
        ? this.els.track.offsetHeight
        : this.els.track.offsetWidth;
      
      this.dims = {
        containerX: left,
        containerY: top,
        trackLength,
      };
    }
  }

  const EL_NAME = 'custom-range';
  if (window.customElements.get(EL_NAME)) {
    console.warn(`${EL_NAME} already defined`);
  }
  else {
    window.customElements.define(EL_NAME, CustomRange);
    window.CustomRange = CustomRange;
  }
})();