(() => {
  const sharedStyles = `
    :host {
      color: #eee;
      padding: 0.5em;
      border: solid 1px rgba(255, 255, 255, 0.5);
      display: flex;
      align-items: center;
    }
    :host([vertical]) {
      flex-direction: column;
      justify-content: center;
    }
    
    :host label {
      font-weight: bold;
      padding: 0 0.25em;
      flex-shrink: 0;
      user-select: none;
    }
    :host(:not([vertical])) > label {
      margin-right: 0.5em;
    }
    :host([vertical]) > label {
      margin-bottom: 0.5em;
    }
    
    :host input,
    :host button {
      font-size: 1em;
    }
  `;

  (() => {
    const ROOT_CLASS = 'controls';
    
    class CustomControls extends HTMLElement {
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
              color: #eee;
              font-family: Helvetica, Arial, sans-serif;
            }
            
            .${ROOT_CLASS} {
              margin-bottom: 0.5em;
              background: #202427;
              display: flex;
              flex-wrap: wrap;
            }
          </style>
          
          <nav class="${ROOT_CLASS}">
            <slot></slot>
          </nav>
        `;
      }
    }

    const EL_NAME = 'custom-controls';
    if (window.customElements.get(EL_NAME)) {
      console.warn(`${EL_NAME} already defined`);
    }
    else {
      window.customElements.define(EL_NAME, CustomControls);
      window.CustomControls = CustomControls;
    }
  })();

  (() => {
    class CustomControlBtn extends HTMLElement {
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
              font-family: Helvetica, Arial, sans-serif;
            }
            
            ${sharedStyles}
            
            button {
              width: 100%;
              padding: 0.25em 0.5em;
              border: solid 1px #ccc;
              border-radius: 0.25em;
              background: transparent;
              color: currentColor;
              pointer-events: all;
            }
            button:not(:disabled) {
              cursor: pointer;
            }
          </style>
          
          <button><slot></slot></button>
        `;
      }
    }

    const EL_NAME = 'custom-control-btn';
    if (window.customElements.get(EL_NAME)) {
      console.warn(`${EL_NAME} already defined`);
    }
    else {
      window.customElements.define(EL_NAME, CustomControlBtn);
      window.CustomControlBtn = CustomControlBtn;
    }
  })();

  (() => {
    class CustomControlNumber extends HTMLElement {
      get min() {
        return this.getAttribute('min');
      }
      set min(value) {
        this.setAttribute('min', value);
        this.els.input.min = value;
      }
      
      get max() {
        return this.getAttribute('max');
      }
      set max(value) {
        this.setAttribute('max', value);
        this.els.input.max = value;
      }
      
      get step() {
        return this.getAttribute('step');
      }
      set step(value) {
        this.setAttribute('step', value);
        this.els.input.step = value;
      }
      
      get value() {
        return this.getAttribute('value');
      }
      set value(value) {
        this.setAttribute('value', value);
        this.els.input.value = value;
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
          'min',
          'max',
          'step',
          'value',
          'vertical',
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
        
        const { shadowRoot } = this;
        
        shadowRoot.innerHTML = `
          <style>
            *, *::after, *::before {
              box-sizing: border-box;
            }
            
            :host {
              font-family: Helvetica, Arial, sans-serif;
              color: currentColor;
            }
            
            ${sharedStyles}
            
            [type="number"] {
              height: 1.5em;
              color: currentColor;
              font-size: 1em;
              text-align: center;
              border: solid 1px;
              background: transparent;
              pointer-events: all;
            }
            [type="number"]::-webkit-inner-spin-button {
              opacity: 1;
            }
            
            :host([vertical]) [type="number"] {
              min-width: 100%;
              font-size: 1.4em;
              display: block;
            }
          </style>
          
          <label><slot></slot></label>
          <input type="number" />
        `;
        
        this.els = {
          input: shadowRoot.querySelector('input'),
        };
      }
      
      connectedCallback() {
        const handleUpdate = (ev) => {
          ev.preventDefault();
          const { currentTarget: { value } } = ev;
          const clonedEv = new ev.constructor(ev.type, ev);
          this.value = value;
          this.dispatchEvent(clonedEv);
        };
        this.els.input.addEventListener('change', handleUpdate);
        this.els.input.addEventListener('input', handleUpdate);
      }
    }

    const EL_NAME = 'custom-control-number';
    if (window.customElements.get(EL_NAME)) {
      console.warn(`${EL_NAME} already defined`);
    }
    else {
      window.customElements.define(EL_NAME, CustomControlNumber);
      window.CustomControlNumber = CustomControlNumber;
    }
  })();

  (() => {
    class CustomControlCheckbox extends HTMLElement {
      get id() {
        return this.getAttribute('id');
      }
      set id(value) {
        this.setAttribute('id', value);
        this.els.label.setAttribute('for', value);
        this.els.input.id = value;
      }
      
      get checked() {
        return this.els.input.checked;
      }
      set checked(value) {
        const checked = (value === '' || value === 'true' || value === true);
        checked ? this.setAttribute('checked', '') : this.removeAttribute('checked');
        this.els.input.checked = checked;
      }
      
      static get observedAttributes() {
        return [
          'id',
          'checked',
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
        
        const { shadowRoot } = this;
        
        shadowRoot.innerHTML = `
          <style>
            *, *::after, *::before {
              box-sizing: border-box;
            }
            
            :host {
              font-family: Helvetica, Arial, sans-serif;
            }
            
            ${sharedStyles}
          </style>
          
          <label><slot></slot></label>
          <input type="checkbox" />
        `;
        
        this.els = {
          input: shadowRoot.querySelector('input'),
          label: shadowRoot.querySelector('label'),
        };
      }
      
      connectedCallback() {
        this.els.input.addEventListener('change', (ev) => {
          ev.preventDefault();
          
          const { currentTarget: { checked } } = ev;
          const clonedEv = new ev.constructor(ev.type, ev);
          this.checked = checked;
          this.dispatchEvent(clonedEv);
        });
      }
    }

    const EL_NAME = 'custom-control-checkbox';
    if (window.customElements.get(EL_NAME)) {
      console.warn(`${EL_NAME} already defined`);
    }
    else {
      window.customElements.define(EL_NAME, CustomControlCheckbox);
      window.CustomControlCheckbox = CustomControlCheckbox;
    }
  })();

  (() => {
    class CustomControlSelect extends HTMLElement {
      get value() {
        return this.els.select.value;
      }
      set value(value) {
        this.els.select.value = value
      }
      
      static get observedAttributes() {
        return [
          'value',
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
        
        const { shadowRoot } = this;
        
        shadowRoot.innerHTML = `
          <style>
            *, *::after, *::before {
              box-sizing: border-box;
            }
            
            :host {
              font-family: Helvetica, Arial, sans-serif;
            }
            
            ${sharedStyles}
            
            label {
              user-select: none;
            }
            
            select {
              cursor: pointer;
            }
            
            [name="opt"] {
              display: none;
            }
          </style>
          
          <slot name="opt"></slot>
          
          <label><slot></slot></label>
          <select></select>
        `;
        
        this.els = {
          label: shadowRoot.querySelector('label'),
          select: shadowRoot.querySelector('select'),
        };
      }
      
      connectedCallback() {
        this.shadowRoot.addEventListener('slotchange', ({ target: slot }) => {
          switch (slot.name) {
            case 'opt': {
              this.els.select.innerHTML = slot.assignedNodes().map(el => el.outerHTML).join('');
              break;
            }
          }
        });
        
        this.els.select.addEventListener('change', (ev) => {
          ev.preventDefault();
          const clonedEv = new ev.constructor(ev.type, ev);
          this.dispatchEvent(clonedEv);
        });
      }
    }

    const EL_NAME = 'custom-control-select';
    if (window.customElements.get(EL_NAME)) {
      console.warn(`${EL_NAME} already defined`);
    }
    else {
      window.customElements.define(EL_NAME, CustomControlSelect);
      window.CustomControlSelect = CustomControlSelect;
    }
  })();

  (() => {
    class CustomControlColor extends HTMLElement {
      get value() {
        return this.els.input.value;
      }
      set value(value) {
        this.els.input.value = value
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
          'value',
          'vertical',
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
        
        const { shadowRoot } = this;
        
        shadowRoot.innerHTML = `
          <style>
            *, *::after, *::before {
              box-sizing: border-box;
            }
            
            :host {
              font-family: Helvetica, Arial, sans-serif;
            }
            
            ${sharedStyles}
            
            :host(:not([vertical])) [type="color"] {
              min-height: 1.5em;
            }
            :host([vertical]) [type="color"] {
              width: 100%;
              min-height: 2em;
            }
          </style>
          
          <label><slot></slot></label>
          <input type="color" />
        `;
        
        this.els = {
          input: shadowRoot.querySelector('input'),
        };
      }
      
      connectedCallback() {
        this.els.input.addEventListener('change', (ev) => {
          ev.preventDefault();
          const clonedEv = new ev.constructor(ev.type, ev);
          this.dispatchEvent(clonedEv);
        });
      }
    }

    const EL_NAME = 'custom-control-color';
    if (window.customElements.get(EL_NAME)) {
      console.warn(`${EL_NAME} already defined`);
    }
    else {
      window.customElements.define(EL_NAME, CustomControlColor);
      window.CustomControlColor = CustomControlColor;
    }
  })();
  
  (() => {
    class CustomControlRange extends HTMLElement {
      get min() {
        return this.getAttribute('min');
      }
      set min(value) {
        this.setAttribute('min', value);
        this.els.input.min = value;
      }
      
      get max() {
        return this.getAttribute('max');
      }
      set max(value) {
        this.setAttribute('max', value);
        this.els.input.max = value;
      }
      
      get step() {
        return this.getAttribute('step');
      }
      set step(value) {
        this.setAttribute('step', value);
        this.els.input.step = value;
      }
      
      get value() {
        return this.getAttribute('value');
      }
      set value(value) {
        this.setAttribute('value', value);
        this.els.input.value = value;
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
          'min',
          'max',
          'step',
          'value',
          'vertical',
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
        
        const { shadowRoot } = this;
        
        shadowRoot.innerHTML = `
          <style>
            *, *::after, *::before {
              box-sizing: border-box;
            }
            
            :host {
              font-family: Helvetica, Arial, sans-serif;
              color: currentColor;
            }
            
            ${sharedStyles}
            
            :host([vertical]) [type="range"] {
              width: 100%;
            }
            
            [name="val"] {
              padding: 0 0.25em;
              display: inline-block;
            }
            
            :host > label {
              display: flex;
              justify-content: center;
            }
            
            :host > label .vals {
              color: rgba(255, 255, 255, 0.75);
              font-weight: normal;
              font-size: 0.8em;
              padding: 0 0.5em;
              display: inline-block;
              vertical-align: middle;
            }
          </style>
          
          <label>
            <slot></slot>
            <span class="vals">(<slot name="val"></slot>)</span>
          </label>
          <input type="range">
        `;
        
        this.els = {
          input: shadowRoot.querySelector('input'),
        };
      }
      
      connectedCallback() {
        const handleUpdate = (ev) => {
          ev.preventDefault();
          const { currentTarget: { value } } = ev;
          const clonedEv = new ev.constructor(ev.type, ev);
          this.value = value;
          this.dispatchEvent(clonedEv);
        };
        this.els.input.addEventListener('change', handleUpdate);
        this.els.input.addEventListener('input', handleUpdate);
      }
    }

    const EL_NAME = 'custom-control-range';
    if (window.customElements.get(EL_NAME)) {
      console.warn(`${EL_NAME} already defined`);
    }
    else {
      window.customElements.define(EL_NAME, CustomControlRange);
      window.CustomControlRange = CustomControlRange;
    }
  })();
})();
