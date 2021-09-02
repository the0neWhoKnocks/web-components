(() => {
  const CSS_VAR__MAX_LIST_HEIGHT = '--max-list-height';
  const EVENT__SELECTED = 'selected';
  const KEY_CODE__DOWN = 40;
  const KEY_CODE__ENTER = 13;
  const KEY_CODE__UP = 38;
  const ROOT_CLASS = 'custom-autocomplete';
  
  const CSS_CLASS__CLEAR_BTN = `${ROOT_CLASS}__clear-btn`;
  const CSS_CLASS__INPUT = `${ROOT_CLASS}__input`;
  const CSS_CLASS__INPUT_OVERLAY = `${ROOT_CLASS}__input-overlay`;
  const CSS_CLASS__INPUT_WRAPPER = `${ROOT_CLASS}__input-wrapper`;
  const CSS_CLASS__LIST = `${ROOT_CLASS}__list`;
  
  const DEFAULT__MAX_LIST_HEIGHT = '75vh';
  
  const formatItemData = (str) => str.toLowerCase().replace(/(\s|_)/g, '-');
  
  class CustomAutoCompleteInput extends HTMLElement {
    get placeholder() {
      return this.els.input.placeholder;
    }
    set placeholder(text) {
      this.setAttribute('placeholder', text);
      this.els.input.placeholder = text;
    }
    
    static get observedAttributes() {
      return [
        'placeholder',
      ];
    }
    
    static get events() {
      return {
        selected: EVENT__SELECTED,
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
      this.visibleListItems = [];
      
      shadowRoot.innerHTML = `
        <style>
          *, *::after, *::before {
            box-sizing: border-box;
          }
          
          :host {
            ${CSS_VAR__MAX_LIST_HEIGHT}: ${DEFAULT__MAX_LIST_HEIGHT};
            
            font: 16px Helvetica, Arial, sans-serif;
            position: relative;
          }
          
          .${ROOT_CLASS} {
            width: 100%;
            display: inline-block;
            position: relative;
          }
          
          .${CSS_CLASS__INPUT_WRAPPER} {
            border: solid 1px;
            position: relative;
          }
          
          .${CSS_CLASS__INPUT},
          .${CSS_CLASS__INPUT_OVERLAY} {
            width: 100%;
            font: 400 1em system-ui;
            padding: 0.5em 1em;
            user-select: none;
          }
          
          .${CSS_CLASS__INPUT} {
            border: none;
          }
          
          .${CSS_CLASS__INPUT_OVERLAY} {
            display: flex;
            align-items: center;
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            pointer-events: none;
          }
          .${CSS_CLASS__INPUT_OVERLAY}:not(:empty) {
            background: #fff;
          }
          
          .${CSS_CLASS__CLEAR_BTN} {
            width: 2em;
            height: 2em;
            padding: 0;
            border: none;
            border-radius: 100%;
            background: transparent;
            cursor: pointer;
            display: none;
            position: absolute;
            top: 50%;
            right: 0.5em;
            transform: translateY(-50%);
          }
          .${CSS_CLASS__INPUT}:not(:placeholder-shown) + .${CSS_CLASS__INPUT_OVERLAY}:empty + .${CSS_CLASS__CLEAR_BTN},
          .${CSS_CLASS__INPUT_OVERLAY}:not(:empty) + .${CSS_CLASS__CLEAR_BTN} {
            display: block;
          }
          
          .${CSS_CLASS__LIST} {
            min-width: 100%;
            max-height: var(${CSS_VAR__MAX_LIST_HEIGHT});
            overflow-y: auto;
            border: solid 1px #ddd;
            background-color: #fff;
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
          }
          
          ::slotted([itemkey]) {
            display: none;
          }
        </style>
        <style id="autocompleteStyles"></style>
        
        <div class="${ROOT_CLASS}">
          <div class="${CSS_CLASS__INPUT_WRAPPER}">
            <input class="${CSS_CLASS__INPUT}" type="text">
            <div class="${CSS_CLASS__INPUT_OVERLAY}"></div>
            <button class="${CSS_CLASS__CLEAR_BTN}" type="button">&#10005;</button>
          </div>
          <div class="${CSS_CLASS__LIST}">
            <slot></slot>
          </div>
        </div>
      `;
      
      this.els = {
        input: shadowRoot.querySelector(`.${CSS_CLASS__INPUT}`),
        inputOverlay: shadowRoot.querySelector(`.${CSS_CLASS__INPUT_OVERLAY}`),
        list: shadowRoot.querySelector(`.${CSS_CLASS__LIST}`),
        listStyles: shadowRoot.querySelector('#autocompleteStyles'),
        slot: shadowRoot.querySelector('slot'),
        wrapper: shadowRoot.querySelector(`.${ROOT_CLASS}`),
      };
      
      this.handleArrowKeysInList = this.handleArrowKeysInList.bind(this);
      this.handleBlur = this.handleBlur.bind(this);
      this.handleClear = this.handleClear.bind(this);
      this.handleClick = this.handleClick.bind(this);
      this.handleInputChange = this.handleInputChange.bind(this);
      this.handleItemSelection = this.handleItemSelection.bind(this);
      this.handleInputKeyDown = this.handleInputKeyDown.bind(this);
      this.handleKeyDown = this.handleKeyDown.bind(this);
    }
    
    connectedCallback() {
      this.addListeners();
      this.initialized = true;
    }
    
    updateListStyles(rules = '') {
      this.els.listStyles.textContent = rules;
    }
    
    handleInputChange(ev) {
      const newInputValue = ev.currentTarget.value;
      let rules = '';
      
      if (ev.type === 'focus') {
        this.els.input.addEventListener('blur', this.handleBlur);
        window.addEventListener('click', this.handleBlur);
      }
      
      if (ev.type !== 'closeList') {
        const query = ev.currentTarget.value;
        const rule = (query !== '')
          ? `
            ::slotted([itemkey*="${formatItemData(query)}"]) {
              display: block;
            }
          `
          : `
            ::slotted([itemkey]) {
              display: block;
            }
          `;
        rules = `
          .${CSS_CLASS__LIST} {
            display:block;
          }
          
          ${rule}
        `;
      }
      
      if (newInputValue !== this.currentInputValue) this.updateListStyles(rules);
      
      if (this.els.list.offsetHeight !== 0) {
        // find the first visible item in the drop down to select
        this.visibleListItems = this.els.slot.assignedNodes().reduce((arr, item) => {
          if (item.offsetHeight && item.offsetHeight !== 0) arr.push(item);
          return arr;
        }, []);
      }
      
      this.currentInputValue = newInputValue;
    }
    
    handleInputKeyDown(ev) {
      if (
        ev.keyCode !== KEY_CODE__DOWN
        & ev.keyCode !== KEY_CODE__ENTER
      ) return;
    
      ev.preventDefault();
      
      switch (ev.keyCode) {
        case KEY_CODE__DOWN:
          if (this.visibleListItems.length) {
            this.itemIndex = 0;
            this.visibleListItems[0].els.btn.focus();
          }
          break;
        
        case KEY_CODE__ENTER:
          this.handleItemSelection(ev);
          break;
      }
    }
    
    handleBlur() {
      window.requestAnimationFrame(() => {
        const internalItemSelected = (
          this.shadowRoot.activeElement
          || document.activeElement.nodeName === 'CUSTOM-AUTO-COMPLETE-INPUT-ITEM'
        );
        
        if (!internalItemSelected) {
          this.els.input.removeEventListener('blur', this.handleBlur);
          window.removeEventListener('click', this.handleBlur);
          this.updateListStyles('');
          this.updateInputOverlayText();
          this.currentInputValue = undefined;
        }
      });
    }
    
    handleArrowKeysInList(ev) {
      if (
        ev.keyCode !== KEY_CODE__DOWN
        && ev.keyCode !== KEY_CODE__UP
      ) return;
    
      ev.preventDefault();
    
      switch (ev.keyCode) {
        case KEY_CODE__DOWN:
          this.itemIndex += 1;
          if (this.itemIndex === this.visibleListItems.length) this.itemIndex = 0;
          break;
    
        case KEY_CODE__UP:
          this.itemIndex--;
          if (this.itemIndex < 0) {
            this.updateInputOverlayText(this.els.input);
            this.els.input.focus();
            return;
          }
          break;
      }
      
      const currItem = this.visibleListItems[this.itemIndex].els.btn;
      
      this.updateInputOverlayText(currItem);
      currItem.focus();
    }
    
    updateInputOverlayText(item = {}) {
      const value = (item.nodeName === 'BUTTON') ? item.innerText : '';
      this.els.inputOverlay.innerText = value;
    }
    
    handleItemSelection(ev) {
      const target = ev.target;
      let query = target.value;
      let results, item;
      
      if (target.nodeName === 'INPUT') {
        results = [...this.visibleListItems];
      }
      else {
        item = target;
        query = item.label;
        results = [item];
        this.els.input.value = item.innerText;
        
        if (this.shadowRoot.activeElement !== this.els.input) {
          this.els.input.focus();
        }
      }
      
      this.updateInputOverlayText();
      this.updateListStyles('');
      
      if (item) item.blur();
      
      setTimeout(() => {
        this.dispatchEvent(new CustomEvent(EVENT__SELECTED, {
          bubbles: true,
          detail: { query, results },
        }));
      }, 10);
    }
    
    handleClear() {
      this.updateInputOverlayText();
      this.updateListStyles('');
      this.els.input.value = '';
      
      if (this.shadowRoot.activeElement !== this.els.input) {
        this.els.input.focus();
      }
    }
    
    handleClick(ev) {
      const el = ev.target;
      
      if (el.nodeName === 'CUSTOM-AUTO-COMPLETE-INPUT-ITEM') this.handleItemSelection(ev);
      else if (el.classList.contains(CSS_CLASS__CLEAR_BTN)) this.handleClear(ev);
    }
    
    handleKeyDown(ev) {
      const item = ev.target;
      
      if (item === this.els.input) {
        this.handleInputKeyDown(ev);
        
        if (ev.keyCode === KEY_CODE__DOWN) {
          this.itemIndex = -1;
          this.handleArrowKeysInList(ev);
        }
      }
      else {
        this.handleArrowKeysInList(ev);
      }
    }
    
    addListeners() {
      this.els.input.addEventListener('focus', this.handleInputChange);
      this.els.input.addEventListener('input', this.handleInputChange);
      this.els.wrapper.addEventListener('click', this.handleClick);
      this.els.wrapper.addEventListener('keydown', this.handleKeyDown);
    }
  }
  
  class CustomAutoCompleteInputItem extends HTMLElement {
    get itemKey() {
      return this.getAttribute('itemKey');
    }
    set itemKey(value) {
      this.setAttribute('itemKey', formatItemData(value));
    }
    
    get label() {
      return this.els.slot.assignedNodes().reduce((str, el) => {
        return `${str}${el.textContent.trim()}`;
      }, '');
    }
    
    get value() {
      return this.getAttribute('value');
    }
    set value(value) {
      this.setAttribute('value', value);
      
      this.itemKey = value;
      this.els.btn.value = value;
    }
    
    static get observedAttributes() {
      return [
        'itemkey',
        'value',
      ];
    }
    
    attributeChangedCallback(attr, oldVal, newVal) {
      const empty = oldVal === '' && (newVal === null || newVal === undefined);
      
      if (!empty && oldVal !== newVal) {
        let _newVal = newVal;
        
        switch (attr) {
          case 'itemkey': { this.itemKey = _newVal; break; }
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
          :host {
            color: #000;
            font-size: inherit;
            width: 100%;
            text-decoration: none;
            text-align: left;
            border: none;
            padding: 0;
            background: transparent;
            display: block;
          }
          
          button {
            width: 100%;
            font-size: 1rem;
            text-align: left;
            padding: 1em;
            border: none;
            background: #fff;
            cursor: pointer;
            appearance: none;
            display: flex;
            align-items: center;
          }
          button:focus,
          button:hover {
            background: #eee;
          }
          
          ::slotted(*) {
            pointer-events: none;
          }
        </style>
        
        <button type="button">
          <slot></slot>
        </button>
      `;
      
      this.els = {
        btn: shadowRoot.querySelector('button'),
        slot: shadowRoot.querySelector('slot'),
      };
    }
    
    connectedCallback() {
      if (!this.value) {
        const label = this.label;
        if (label) this.value = label;
      }
    }
  }
  
  [
    ['custom-auto-complete-input', CustomAutoCompleteInput],
    ['custom-auto-complete-input-item', CustomAutoCompleteInputItem],
  ].forEach(([name, _class]) => {
    if (window.customElements.get(name)) {
      console.warn(`${name} already defined`);
    }
    else {
      window.customElements.define(name, _class);
      window[_class.name] = _class;
    }
  });
})();
