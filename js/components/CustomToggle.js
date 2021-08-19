(() => {
  const CSS_VAR__COLOR__DISABLED = '--color--disabled';
  const CSS_VAR__COLOR__ENABLED = '--color--enabled';
  const CSS_VAR__COLOR__FOCUSED = '--color--focused';
  const CSS_VAR__COLOR__TOGGLE = '--color--toggle';
  const DEFAULT__COLOR__DISABLED = '#ddd';
  const DEFAULT__COLOR__ENABLED = '#00ffaf';
  const DEFAULT__COLOR__FOCUSED = 'blue';
  const DEFAULT__COLOR__TOGGLE = '#eee';
  const EVENT__TOGGLED = 'toggled';
  const ROOT_CLASS = 'custom-toggle';
  let toggleIDNdx = 1;
  
  class CustomToggle extends HTMLElement {
    get circle() {
      return this.hasAttribute('circle');
    }
    set circle(value) {
      if (value === '' || value === 'true' || value === true) {
        this.setAttribute('circle', '');
      }
      else {
        this.removeAttribute('circle');
      }
    }
    
    get enabled() {
      return this.hasAttribute('enabled');
    }
    set enabled(value) {
      const enabled = (value === '' || value === 'true' || value === true);
      const changed = (
        enabled !== this.enabled
        || this.els.input.checked !== enabled
      );
      
      if (changed) {
        if (enabled) this.setAttribute('enabled', '');
        else this.removeAttribute('enabled');
        
        this.els.input.checked = enabled;
        
        this.dispatchEvent(new CustomEvent(EVENT__TOGGLED, {
          bubbles: true,
          detail: { enabled },
        }));
      }
    }
    
    get id() {
      return this.getAttribute('id') || this._id;
    }
    set id(val) {
      this._id = val;
      this.els.input.id = this._id;
      this.els.label.setAttribute('for', this._id);
      this.setAttribute('id', this._id);
    }
    
    get name() {
      return this.getAttribute('name') || this._name;
    }
    set name(val) {
      this._name = val;
      this.els.input.name = this._name;
      this.setAttribute('name', this._name);
    }
    
    static get observedAttributes() {
      return ['circle', 'enabled', 'id', 'name'];
    }
    
    static get events() {
      return {
        toggled: EVENT__TOGGLED,
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
      this.ndx = toggleIDNdx;
      this._id = `toggle_${this.ndx}`;
      this._name = this._id;
      
      toggleIDNdx += 1;
      
      shadowRoot.innerHTML = `
        <style>
          *, *::after, *::before {
            box-sizing: border-box;
          }
          
          :host {
            ${CSS_VAR__COLOR__DISABLED}: ${DEFAULT__COLOR__DISABLED};
            ${CSS_VAR__COLOR__ENABLED}: ${DEFAULT__COLOR__ENABLED};
            ${CSS_VAR__COLOR__FOCUSED}: ${DEFAULT__COLOR__FOCUSED};
            ${CSS_VAR__COLOR__TOGGLE}: ${DEFAULT__COLOR__TOGGLE};
            
            font-family: Helvetica, Arial, sans-serif;
            position: relative;
          }
          
          .${ROOT_CLASS} {
            width: 3em;
            height: 1em;
            position: relative;
          }
          .${ROOT_CLASS} input {
            opacity: 0;
          }
          .${ROOT_CLASS} label {
            border: solid 1px #d2d2d2;
            border-radius: 1em;
            background-color: var(${CSS_VAR__COLOR__DISABLED});
            display: block;
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            transition: background-color 300ms;
            cursor: pointer;
          }
          .${ROOT_CLASS} label::after {
            content: '';
            width: 50%;
            height: 100%;
            border-radius: 1em;
            box-shadow: 0 4px 4px 0px #00000080;
            background-color: var(${CSS_VAR__COLOR__TOGGLE});
            display: block;
            transition: transform 300ms;
          }
          .${ROOT_CLASS} input:checked + label {
            background-color: var(${CSS_VAR__COLOR__ENABLED});
          }
          .${ROOT_CLASS} input:checked + label::after {
            transform: translateX(100%);
          }
          
          /*
            This isn't great, but better than nothing. Still waiting for support
            for something like ':has(> :focus-visible)', so that the focus state
            is only visible when a child has focus via a keyboard.
          */
          :host([solid]) .${ROOT_CLASS}:focus-within:not(:hover) label::after,
          :host(:not([solid])) .${ROOT_CLASS}:focus-within:not(:hover) label::after {
            border: solid 2px var(${CSS_VAR__COLOR__FOCUSED});
          }
          
          :host([solid]) .${ROOT_CLASS} label,
          :host([solid]) .${ROOT_CLASS} label::after {
            border: solid 1px #00000080;
          }
          :host(:not([solid])) .${ROOT_CLASS} label {
            background-image: linear-gradient(180deg, #000000c4 4%, #0000006b 30%, #cccccc66 85%, #cccccc66);
          }
          :host(:not([solid])) .${ROOT_CLASS} label::after {
            border: solid 1px #00000066;
            background-image: linear-gradient(180deg, #fff 5%, #d0d0d0 10%, #eee 39%, #eee 70%, #9e9e9e);
          }
          
          :host([circle]) .${ROOT_CLASS} label::after {
            height: 150%;
            position: absolute;
            top: 50%;
            transform: translate(0%, -50%);
          }
          :host([circle]) .${ROOT_CLASS} input:checked + label::after {
            position: absolute;
            top: 50%;
            transform: translate(100%, -50%);
          }
        </style>
        
        <div class="${ROOT_CLASS}">
          <input id="${this._id}" type="checkbox" name="${this._name}" />
          <label for="${this._id}"></label>
        </div>
      `;
      
      this.els = {
        input: shadowRoot.querySelector(`.${ROOT_CLASS} input`),
        label: shadowRoot.querySelector(`.${ROOT_CLASS} label`),
        toggle: shadowRoot.querySelector(`.${ROOT_CLASS}`),
      };
      
      this.handleToggleChange = this.handleToggleChange.bind(this);
    }
    
    connectedCallback() {
      this.els.toggle.addEventListener('change', this.handleToggleChange);
    }
    
    disconnectedCallback() {
      this.els.toggle.removeEventListener('change', this.handleToggleChange);
    }
    
    handleToggleChange({ target }) {
      this.enabled = target.checked;
    }
  }

  const EL_NAME = 'custom-toggle';
  if (window.customElements.get(EL_NAME)) {
    console.warn(`${EL_NAME} already defined`);
  }
  else {
    window.customElements.define(EL_NAME, CustomToggle);
    window.CustomToggle = CustomToggle;
  }
})();
