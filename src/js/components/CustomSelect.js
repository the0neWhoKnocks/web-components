(() => {
  const CSS_VAR__COLOR__BG = '--color--bg';
  const CSS_VAR__COLOR__FG = '--color--fg';
  const CSS_VAR__COLOR__OPT__HOVER = '--color--opt--hover';
  const CSS_VAR__LABEL_WIDTH = '--label-width';
  const CSS_VAR__OPTS_HEIGHT = '--opts-height';
  const MODIFIER__CLOSED = 'closed';
  
  class CustomSelect extends HTMLElement {
    get bgColor() {
      return this.getAttribute('bgColor');
    }
    set bgColor(value) {
      if (value) {
        this.setAttribute('bgColor', value);
        this.style.setProperty(CSS_VAR__COLOR__BG, value);
      }
      else {
        this.removeAttribute('bgColor');
        this.style.removeProperty(CSS_VAR__COLOR__BG);
      }
    }
    
    get fgColor() {
      return this.getAttribute('fgColor');
    }
    set fgColor(value) {
      if (value) {
        this.setAttribute('fgColor', value);
        this.style.setProperty(CSS_VAR__COLOR__FG, value);
      }
      else {
        this.removeAttribute('fgColor');
        this.style.removeProperty(CSS_VAR__COLOR__FG);
      }
    }
    
    get maxHeight() {
      return this.getAttribute('maxHeight');
    }
    set maxHeight(value) {
      if (value) {
        this.setAttribute('maxHeight', value);
        this.style.setProperty(CSS_VAR__OPTS_HEIGHT, value);
      }
      else {
        this.removeAttribute('maxHeight');
        this.style.removeProperty(CSS_VAR__OPTS_HEIGHT);
      }
    }
    
    get open() {
      return this.hasAttribute('open');
    }
    set open(value) {
      if (value === '' || value === 'true' || value === true) {
        this.setAttribute('open', '');
        this.els.btn.setAttribute('aria-expanded', true);
      }
      else {
        this.removeAttribute('open');
        this.els.btn.setAttribute('aria-expanded', false);
      }
    }
    
    get optHoverColor() {
      return this.getAttribute('optHoverColor');
    }
    set optHoverColor(value) {
      if (value) {
        this.setAttribute('optHoverColor', value);
        this.style.setProperty(CSS_VAR__COLOR__OPT__HOVER, value);
      }
      else {
        this.removeAttribute('optHoverColor');
        this.style.removeProperty(CSS_VAR__COLOR__OPT__HOVER);
      }
    }
    
    get value() {
      return this.els.selectInput.value;
    }
    set value(value) {
      const select = this.els.selectInput;
      select.value = value;
      
      const selectedNdx = select.selectedIndex;
      this.els.label.textContent = select.options[selectedNdx].textContent;
      
      this.els.btn.setAttribute('aria-activedescendant', `opt${selectedNdx}`);
      
      if (this.els.opts.childElementCount) {
        [...this.els.opts.children].forEach((el, ndx) => {
          if (ndx === selectedNdx) el.setAttribute('selected', '');
          else el.removeAttribute('selected');
        });
      }
      
      select.dispatchEvent(new Event('change'));
    }
    
    static get observedAttributes() {
      return [
        'bgcolor',
        'fgcolor',
        'maxheight',
        'open',
        'opthovercolor',
        'value',
      ];
    }
    
    attributeChangedCallback(attr, oldVal, newVal) {
      const empty = oldVal === '' && (newVal === null || newVal === undefined);
    
      if (!empty && oldVal !== newVal) {
        let _newVal = newVal;
    
        switch (attr) {
          case 'bgcolor': { this.bgColor = _newVal; break; }
          case 'fgcolor': { this.fgColor = _newVal; break; }
          case 'maxheight': { this.maxHeight = _newVal; break; }
          case 'opthovercolor': { this.optHoverColor = _newVal; break; }
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
            ${CSS_VAR__COLOR__BG}: #fff;
            ${CSS_VAR__COLOR__FG}: #000;
            ${CSS_VAR__COLOR__OPT__HOVER}: #00000014;
            ${CSS_VAR__LABEL_WIDTH}: 100%;
            ${CSS_VAR__OPTS_HEIGHT}: auto;
            --inner-spacing--horizontal: 0.5em;
            --inner-spacing--vertical: 0.25em;
            
            font-family: Helvetica, Arial, sans-serif;
            display: inline-block;
            position: relative;
          }
          
          slot {
            display: none;
          }
          
          button {
            font-size: 1em;
          }
          button:not(:disabled) {
            cursor: pointer;
          }
          
          .select {
            position: relative;
            z-index: 1;
          }
          
          .select button {
            color: var(${CSS_VAR__COLOR__FG});
            padding: 0;
            border: solid 1px;
            border-radius: 0.25em;
            background: var(${CSS_VAR__COLOR__BG});
            display: flex;
            align-items: center;
            position: relative;
          }
          .select button:focus,
          .select button:focus-visible {
            box-shadow: 0px 0px 1px 1px var(${CSS_VAR__COLOR__FG});
            outline: none;
          }
          :host([open]) .select button {
            border-radius: 0.25em 0.25em 0 0;
          }
          
          .select button > * {
            padding: var(--inner-spacing--vertical) var(--inner-spacing--horizontal);
            pointer-events: none;
          }
          
          .select button label {
            width: var(${CSS_VAR__LABEL_WIDTH});
            text-align: left;
            white-space: nowrap;
          }
          
          .select button > div {
            height: 1.6em;
            border-left: solid 1px var(${CSS_VAR__COLOR__FG});
            display: flex;
          }
          
          .select button .icon {
            width: 0.8em;
            flex-shrink: 0;
            box-sizing: content-box;
          }
          :host([open]) .select button .icon {
            transform: scale(-1);
          }
          
          .options-wrapper {
            min-width: 100%;
            overflow: hidden;
            position: absolute;
            top: calc(100% - var(--inner-spacing--vertical));
            left: 0;
          }
          .options-wrapper.${MODIFIER__CLOSED} {
            visibility: hidden;
          }
          
          .options {
            height: var(${CSS_VAR__OPTS_HEIGHT});
            color: var(${CSS_VAR__COLOR__FG});
            overflow: auto;
            padding-top: var(--inner-spacing--vertical);
            border: solid 1px;
            border-top: none;
            border-radius: 0.25em;
            background: var(${CSS_VAR__COLOR__BG});
            transition: transform 300ms;
            transform: translateY(-100%);
          }
          :host([open]) .options {
            transform: translateY(0%);
          }
          
          .option {
            width: 100%;
            color: var(${CSS_VAR__COLOR__FG});
            font-size: 1em;
            text-align: left;
            white-space: nowrap;
            padding: var(--inner-spacing--vertical) var(--inner-spacing--horizontal);
            border: none;
            background: transparent;
            pointer-events: all;
            cursor: pointer;
            position: relative;
          }
          .option[selected]::after {
            content: '';
            width: 0.25em;
            height: 100%;
            background: var(${CSS_VAR__COLOR__FG});
            position: absolute;
            top: 0;
            left: 0;
          }
          .option:focus,
          .option:focus-visible,
          .option:hover {
            color: var(${CSS_VAR__COLOR__FG});
            outline: none;
            background: var(${CSS_VAR__COLOR__OPT__HOVER});
          }
        </style>
        
        <slot></slot>
        
        <div class="select">
          <button
            aria-owns="opts"
            aria-expanded="false"
            role="combobox"
          >
            <label></label>
            <div>
              <svg class="icon" xmlns="http://www.w3.org/2000/svg">
                <polyline
                  fill="none" stroke-linecap="round" stroke-linejoin="round"
                  stroke="currentColor"
                />
              </svg>
            </div>
          </button>
        </div>
        <div class="options-wrapper ${MODIFIER__CLOSED}">
          <div class="options" id="opts" role="listbox"></div>
        </div>
      `;
      
      this.els = {
        btn: shadowRoot.querySelector('.select button'),
        icon: shadowRoot.querySelector('.icon'),
        label: shadowRoot.querySelector('label'),
        opts: shadowRoot.querySelector('.options'),
        optsWrapper: shadowRoot.querySelector('.options-wrapper'),
        polyline: shadowRoot.querySelector('polyline'),
      };
    }
    
    connectedCallback() {
      this.handleClick = this.handleClick.bind(this);
      this.handleKeyDown = this.handleKeyDown.bind(this);
      
      this.renderIcon();
      
      this.els.btn.addEventListener('click', () => {
        (this.open) ? this.closeOpts() : this.openOpts();
      });
      
      this.els.btn.addEventListener('focus', () => {
        this.addOptBindings();
      });
      this.addEventListener('blur', () => {
        this.removeOptBindings();
        this.closeOpts();
      });
      
      this.shadowRoot.addEventListener('slotchange', ({ target: slot }) => {
        const optEls = [];
        const optsMarkup = [];
        let selectedItem = {};
        
        slot.assignedNodes()
          .filter(el => el.nodeName === 'SELECT')
          .reduce((_, select) => {
            this.els.selectInput = select;
            return [...select.children];
          }, [])
          .forEach((el, ndx) => {
            const selected = el.selected ? 'selected' : '';
            const { textContent: label, value } = el;
            
            if (ndx === 0 || selected) {
              selectedItem.label = label;
              selectedItem.value = value;
            }
            
            optEls.push(el.outerHTML);
            optsMarkup.push(`
              <button
                class="option"
                id="opt${ndx}"
                value="${value}"
                aria-label="Option for ${encodeURIComponent(label)}"
                role="option"
                data-ndx="${ndx}"
                ${selected}
              >${label}</button>
            `);
          });
        
        this.value = selectedItem.value;
        this.els.label.textContent = selectedItem.label;
        this.els.opts.innerHTML = optsMarkup.join('');
        
        requestAnimationFrame(() => {
          this.style.setProperty(CSS_VAR__LABEL_WIDTH, `${ this.els.opts.offsetWidth }px`);
        });
      });
    }
    
    openOpts() {
      this.open = true;
      this.els.optsWrapper.classList.remove(MODIFIER__CLOSED);
    }
    
    closeOpts() {
      if (this.open) {
        this.els.opts.addEventListener('transitionend', () => {
          this.els.optsWrapper.classList.add(MODIFIER__CLOSED);
        }, { once: true });
        
        this.open = false;
        
        this.els.btn.focus();
      }
    }
    
    handleClick() {
      const el = this.shadowRoot.activeElement;
      
      if (el.classList.contains('option')) {
        this.value = el.value;
        this.closeOpts();
      }
    }
    
    handleKeyDown({ key }) {
      const currEl = this.shadowRoot.activeElement;
      const opts = [...this.els.opts.children];
      const selectedNdx = opts.find(el => el.hasAttribute('selected')).dataset.ndx;
      
      switch (key) {
        case 'ArrowDown': {
          if (currEl === this.els.btn) {
            if (!this.open) this.openOpts();
            opts[selectedNdx].focus();
          }
          else {
            let nextNdx = +currEl.dataset.ndx + 1;
            if (nextNdx >= this.els.opts.childElementCount) nextNdx = 0;
            opts[nextNdx].focus();
          }
          break;
        }
        
        case 'ArrowUp': {
          let prevNdx = +currEl.dataset.ndx - 1;
          if (prevNdx < 0) prevNdx = this.els.opts.childElementCount - 1;
          opts[prevNdx].focus();
          break;
        }
        
        case 'Escape': {
          this.closeOpts();
          break;
        }
      }
    }
    
    addOptBindings() {
      if (!this.bindingsAdded) {
        this.els.opts.addEventListener('click', this.handleClick);
        this.shadowRoot.addEventListener('keydown', this.handleKeyDown);
        this.bindingsAdded = true;
      }
    }
    
    removeOptBindings() {
      if (this.bindingsAdded) {
        this.els.opts.removeEventListener('click', this.handleClick);
        this.shadowRoot.removeEventListener('keydown', this.handleKeyDown);
        this.bindingsAdded = false;
      }
    }
    
    renderIcon() {
      const width = 16;
      const height = 10;
      const strokeWidth = 3;
      const points = `0,0 ${width/2},${height} ${width},0`.split(' ').map((coords) => {
        const [x, y] = coords.split(',');
        const halfStroke = strokeWidth / 2;
        let _x = +x;
        let _y = +y;
        
        if (_x - halfStroke < 0) _x = halfStroke;
        else if (_x + halfStroke > width) _x = width - halfStroke;
        if (_y - halfStroke < 0) _y = halfStroke;
        else if (_y + halfStroke > height) _y = height - halfStroke;
        
        return `${_x},${_y}`;
      });
      
      this.els.icon.setAttribute('viewBox', `0 0 ${width} ${height}`);
      this.els.polyline.setAttribute('points', points.join(' '));
      this.els.polyline.setAttribute('stroke-width', strokeWidth);
    }
  }

  const EL_NAME = 'custom-select';
  if (window.customElements.get(EL_NAME)) {
    console.warn(`${EL_NAME} already defined`);
  }
  else {
    window.customElements.define(EL_NAME, CustomSelect);
    window.CustomSelect = CustomSelect;
  }
})();
