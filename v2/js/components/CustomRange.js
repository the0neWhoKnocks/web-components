(() => {
  // const CSS_VAR__STROKE_COLOR = '--stroke-color';
  // const CSS_VAR__STROKE_WIDTH = '--stroke-width';
  // const DEFAULT__STROKE_COLOR = '#dedede';
  // const DEFAULT__STROKE_WIDTH = 0.25;
  const EVENT__VALUE = 'value';
  const MODIFIER__SCRUBBING = 'scrubbing';
  const SELECTOR__RANGE = 'range';
  const SELECTOR__TRACK = 'track';
  const SELECTOR__TRACK__VALUE = 'track__value';
  const SELECTOR__HANDLE = 'handle';
  
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
    
    get ticks() { return this.hasAttribute('ticks'); }
    set ticks(value) { this.setNonValueProp('ticks', value); }
    
    get value() { return +this.getAttribute('value'); }
    set value(value) {
      let newValue = +value;
      
      if (newValue < this.min) newValue = this.min;
      else if (newValue > this.max) newValue = this.max;
      
      // TODO
      // - min/max offset not working for value - working for UI though
      // - render ticks
      // - allow for handle focus, and UP/RIGHT increase, DOWN/LEFT decrease
      // if (this.min > 0) newValue += this.min;
      // console.log(newValue);
      
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
    
    get valueRange() { return this.max - this.min; }
    
    get vertical() { return this.hasAttribute('vertical'); }
    set vertical(value) {
      this.setNonValueProp('vertical', value);
      // this.renderFromValue();
      this.render();
    }
    
    static get observedAttributes() {
      return [
        'animate',
        'disabled',
        'min',
        'max',
        'step',
        'ticks',
        'value',
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
            --thickness: 1.75em;
            --thickness--handle: 1em;
            --perc--handle: 0%;
            --perc--track: 0%;
            
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
            width: 100%;
            height: 100%;
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
            background: var(--color--track--bg, gray);
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
            background: var(--color--track--fg, yellow);
          }
          
          .${SELECTOR__HANDLE} {
            padding: 0;
            border: solid 1px;
            background: #ccc;
            position: absolute;
            opacity: 0.5;
          }
          
          :host(:not([vertical])) .${SELECTOR__HANDLE} {
            width: var(--thickness--handle);
            height: 100%;
            left: calc(var(--perc--handle) - (var(--thickness--handle) / 2));
          }
          :host(:not([vertical])) .${SELECTOR__TRACK__VALUE} {
            transform-origin: left;
            transform: scale(calc(var(--perc--track) * 0.01), 1);
          }
          
          :host([vertical]) .${SELECTOR__HANDLE} {
            width: 100%;
            height: var(--thickness--handle);
            bottom: calc(100% - (var(--perc--handle) + (var(--thickness--handle) / 2)));
          }
          :host([vertical]) .${SELECTOR__TRACK__VALUE} {
            transform-origin: bottom;
            transform: scale(1, calc(1 - (var(--perc--track) * 0.01)));
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
      this.handlePointerDown = this.handlePointerDown.bind(this);
      this.handlePointerMove = this.handlePointerMove.bind(this);
      this.handlePointerUp = this.handlePointerUp.bind(this);
      
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
                
                // this.renderFromValue();
              }
              
              break;
            }
          }
        });
      });
      
      // this.renderFromValue();
    }
    
    calcData(pointerX, pointerY) { 
      this.setDims();
      const { containerX, containerY, trackLength } = this.dims;
      
      const valueRange = this.valueRange;
      const x = pointerX - containerX;
      const y = pointerY - containerY;
      const pos = (this.vertical) ? y : x;
      const posPerc = (pos / trackLength) || 0;
      const rawValue = valueRange * posPerc;
      const steppedValue = Math.round(rawValue / this.step) * this.step;
      
      
      this.value = steppedValue;
      
      
      // const fullHandlePerc = (
      //   (this.vertical)
      //     ? this.els.handle.offsetHeight / trackLength
      //     : this.els.handle.offsetWidth / trackLength
      // ) || 0;
      // const halfHandlePerc = fullHandlePerc / 2;
      // const trackPerc = steppedPerc * 100;
      // let handlePerc = (steppedPerc - halfHandlePerc) * 100;
      // const maxHandlePerc = (100 - (100 * fullHandlePerc));
      // 
      // if (handlePerc < 0) handlePerc = 0;
      // else if (handlePerc > maxHandlePerc) handlePerc = maxHandlePerc;
      // 
      // return { handlePerc, steppedValue, trackPerc };
    }
    
    handlePointerDown({ clientX, clientY }) {
      this.els.range.classList.add(MODIFIER__SCRUBBING);
      
      // this.render(this.calcData(clientX, clientY));
      this.calcData(clientX, clientY);
      
      document.addEventListener('pointermove', this.handlePointerMove);
      document.addEventListener('pointerup', this.handlePointerUp);
    }
    
    handlePointerMove({ clientX, clientY }) {
      // this.render(this.calcData(clientX, clientY));
      this.calcData(clientX, clientY);
    }
    
    handlePointerUp({ clientX, clientY }) {
      document.removeEventListener('pointermove', this.handlePointerMove);
      document.removeEventListener('pointerup', this.handlePointerUp);
      // this.render(this.calcData(clientX, clientY));
      this.calcData(clientX, clientY);
      delete this.dims;
    }
    
    // render({
    //   handlePerc,
    //   steppedValue,
    //   trackPerc,
    // }) {
    render() {
      this.setDims();
      const {
        // containerX,
        // containerY,
        trackLength,
      } = this.dims;
      
      const steppedPerc = this.value / this.valueRange;
      // const steppedPerc = (this.value - this.min) / this.valueRange;
      const fullHandlePerc = (
        (this.vertical)
          ? this.els.handle.offsetHeight / trackLength
          : this.els.handle.offsetWidth / trackLength
      ) || 0;
      // const halfHandlePerc = fullHandlePerc / 2;
      const trackPerc = steppedPerc * 100;
      // let handlePerc = (steppedPerc - halfHandlePerc) * 100;
      let handlePerc = trackPerc;
      const maxHandlePerc = (100 - (100 * fullHandlePerc));
      
      if (handlePerc < 0) handlePerc = 0;
      else if (handlePerc > maxHandlePerc) handlePerc = maxHandlePerc;
      
      this.els.range.style.setProperty('--perc--handle', `${handlePerc}%`);
      this.els.range.style.setProperty('--perc--track', trackPerc);
      // if (this.vertical) {
      //   this.els.handle.style.cssText = `bottom: ${100 - trackPerc}%`;
      //   this.els.trackValue.style.cssText = `transform: scale(1, ${1 - (trackPerc * 0.01)})`;
      // }
      // else {
      //   this.els.handle.style.cssText = `left: ${handlePerc}%`;
      //   this.els.trackValue.style.cssText = `transform: scale(${trackPerc * 0.01}, 1)`;
      // }
    }
    
    renderFromValue() {
      this.setDims();
      
      const { trackLength } = this.dims;
      const perc = this.value / this.valueRange;
      let clientX, clientY;
      
      if (this.vertical) {
        clientX = 0;
        clientY = trackLength * perc;
      }
      else {
        clientX = trackLength * perc;
        clientY = 0;
      }
      
      this.handlePointerUp({ clientX, clientY });
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