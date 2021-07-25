(() => {
  let toggleIDNdx = 1;
  
  class Toggle extends HTMLElement {
    get enabled() {
      return this._enabled || false;
    }
    set enabled(enable) {
      this._enabled = (enable === '' || enable === 'true' || enable === true);
      if (this.els.input.checked !== this._enabled) this.els.input.checked = this._enabled;
      if (this._onToggle) this._onToggle(this.enabled);
    }
    
    get id() {
      return this._id;
    }
    set id(val) {
      this._id = val;
      if (this.els) {
        this.els.input.id = this._id;
        this.els.label.setAttribute('for', this._id);
      }
    }
    
    get name() {
      return this._name;
    }
    set name(val) {
      this._name = val; 
    }
    
    set onToggle(fn) {
      this._onToggle = fn;
    }
    
    set styles(styles) {
      this.els.userStyles.textContent = styles;
    }
    
    static get observedAttributes() {
      return ['enabled', 'id', 'name', 'ontoggle'];
    }
    
    attributeChangedCallback(attr, oldVal, newVal) {
      if (oldVal !== newVal) {
        let _attr = attr;
        let _newVal = newVal;
        
        switch (_attr) {
          case 'enabled': {
            if (newVal === '' || newVal === 'true') {
              this.els.input.checked = true;
            }
            break;
          }
          case 'name': {
            this.els.input.name = newVal;
            break;
          }
          case 'ontoggle': {
            _attr = 'onToggle';
            // get function from function name
            if (typeof newVal === 'string') _newVal = eval(newVal);
            // remove old listener if one was set
            if (this._onToggle) this.els.toggle.removeEventListener(this.handleToggleChange);
            // add new listener
            if (typeof _newVal === 'function') this.els.toggle.addEventListener('change', this.handleToggleChange);
            
            break;
          }
        }
        
        this[_attr] = _newVal;
      }
    }
    
    constructor() {
      super();
      
      this.attachShadow({ mode: 'open' });
      
      const { shadowRoot } = this;
      this.ROOT_CLASS = 'custom-toggle';
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
            font-family: Helvetica, Arial, sans-serif;
            position: relative;
          }
          
          .${this.ROOT_CLASS} {
            width: 3em;
            height: 1em;
            position: relative;
          }
          .${this.ROOT_CLASS} input {
            opacity: 0;
          }
          .${this.ROOT_CLASS} label {
            border: solid 1px #d2d2d2;
            border-radius: 1em;
            background: linear-gradient(180deg, #000000c4 4%, #0000006b 30%, #cccccc66 85%, #cccccc66);
            display: block;
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            transition: background-color 300ms;
            cursor: pointer;
          }
          .${this.ROOT_CLASS} label::after {
            content: '';
            width: 50%;
            height: 100%;
            border: solid 1px #797979;
            border-radius: 1em;
            box-shadow: 0 4px 4px 0px #00000080;
            background: linear-gradient(180deg, #fff 5%, #d0d0d0 10%, #eee 39%, #eee 70%, #9e9e9e);
            display: block;
            transition: transform 300ms;
          }
          .${this.ROOT_CLASS} input:checked + label {
            background-color: #00ffaf;
          }
          .${this.ROOT_CLASS} input:checked + label::after {
            transform: translateX(100%);
          }
        </style>
        <style id="userStyles"></style>
        
        <div class="${this.ROOT_CLASS}">
          <input id="${this._id}" type="checkbox" name="${this._name}" />
          <label for="${this._id}"></label>
        </div>
      `;
      
      this.els = {
        toggle: shadowRoot.querySelector(`.${this.ROOT_CLASS}`),
        input: shadowRoot.querySelector(`.${this.ROOT_CLASS} input`),
        label: shadowRoot.querySelector(`.${this.ROOT_CLASS} label`),
        userStyles: shadowRoot.querySelector('#userStyles'),
      };
      
      this.handleToggleChange = this.handleToggleChange.bind(this);
    }
    
    handleToggleChange({ target }) {
      this.enabled = target.checked;
    }
  }

  window.customElements.define('custom-toggle', Toggle);
})();
