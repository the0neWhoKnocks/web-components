(() => {
  class CustomAutoCompleteInput extends HTMLElement {
    get items() {
      return this.data.items;
    }
    set items(items) {
      this.data.items = items;
      if (this.initialized) {
        this.setupListItems();
      }
    }
    
    set onSelect(fn) {
      this._onSelect = fn;
    }
    
    set placeholder(text) {
      this.els.input.placeholder = text;
    }
    
    set styles(styles) {
      this.els.userStyles.textContent = styles;
    }
    
    static get observedAttributes() {
      return ['items', 'onselect', 'placeholder', 'styles'];
    }
    
    attributeChangedCallback(attr, oldVal, newVal) {
      if (oldVal !== newVal) {
        let _attr = attr;
        let _newVal = newVal;
        
        switch (_attr) {
          case 'items': {
            if (typeof newVal === 'string') {
              // JSON
              if (newVal.startsWith('[')) _newVal = JSON.parse(newVal);
              // Function name
              else _newVal = eval(newVal);
            }
            break;
          }
          case 'onselect': {
            _attr = 'onSelect';
            // Function name
            if (typeof newVal === 'string') _newVal = eval(newVal);
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
      this.ROOT_CLASS = 'custom-autocomplete';
      this.data = {};
      this.visibleListItems = [];
      
      this.classes = {
        CLEAR_BTN: `${this.ROOT_CLASS}__clear-btn`,
        LIST: `${this.ROOT_CLASS}__list`,
        LIST_ITEM: `${this.ROOT_CLASS}__list-item`,
        LIST_ITEM_BTN: `${this.ROOT_CLASS}__list-item-btn`,
      };
      
      shadowRoot.innerHTML = `
        <style>
          *, *::after, *::before {
            box-sizing: border-box;
          }
          
          :host {
            font: 16px Helvetica, Arial, sans-serif;
            position: relative;
          }
          
          .${this.ROOT_CLASS} {
            width: 100%;
            display: inline-block;
            position: relative;
          }
          
          .${this.ROOT_CLASS}__input-wrapper {
            border: solid 1px;
            position: relative;
          }
          
          .${this.ROOT_CLASS}__input,
          .${this.ROOT_CLASS}__input-overlay {
            font: 400 1em system-ui;
            width: 100%;
            padding: 0.5em 1em;
          }
          
          .${this.ROOT_CLASS}__input {
            border: none;
          }
          
          .${this.ROOT_CLASS}__input-overlay {
            display: flex;
            align-items: center;
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            pointer-events: none;
          }
          .${this.ROOT_CLASS}__input-overlay:not(:empty) {
            background: #fff;
          }
          
          .${this.ROOT_CLASS}__clear-btn {
            width: 2em;
            height: 2em;
            padding: 0;
            border: none;
            border-radius: 100%;
            background: #ddd;
            position: absolute;
            top: 0.5em;
            right: 1em;
            cursor: pointer;
            display: none;
          }
          .${this.ROOT_CLASS}__input:not(:placeholder-shown) + .${this.ROOT_CLASS}__input-overlay:empty + .${this.ROOT_CLASS}__clear-btn,
          .${this.ROOT_CLASS}__input-overlay:not(:empty) + .${this.ROOT_CLASS}__clear-btn {
            display: block;
          }
          
          .${this.classes.LIST} {
            min-width: 100%;
            max-height: var(--custom-autocomplete-max-list-height, 75vh);
            overflow-y: auto;
            list-style: none;
            padding: 0;
            border: solid 1px #ddd;
            margin: 0;
            background-color: #fff;
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
          }
          .${this.classes.LIST} [data-autocomplete-item] {
            display: none;
          }
          .${this.classes.LIST_ITEM} {
            color: #000;
            font-size: inherit;
            width: 100%;
            text-decoration: none;
            text-align: left;
            border: none;
            padding: 0;
            background: transparent;
            cursor: pointer;
          }
          .${this.classes.LIST_ITEM_BTN} {
            width: 100%;
            font-size: 1rem;
            text-align: left;
            padding: 1em;
            border: none;
            background: #fff;
            display: block;
            cursor: pointer;
            appearance: none;
            -webkit-appearance: none;
          }
          .${this.classes.LIST_ITEM_BTN}:focus,
          .${this.classes.LIST_ITEM_BTN}:hover {
            background: #eee;
          }
        </style>
        <style id="userStyles"></style>
        <style id="autocompleteStyles"></style>
        
        <div class="${this.ROOT_CLASS}">
          <div class="${this.ROOT_CLASS}__input-wrapper">
            <input class="${this.ROOT_CLASS}__input" type="text">
            <div class="${this.ROOT_CLASS}__input-overlay"></div>
            <button class="${this.classes.CLEAR_BTN}" type="button">&#10005;</button>
          </div>
          <ul class="${this.classes.LIST}"></ul>
        </div>
      `;
      
      this.els = {
        input: shadowRoot.querySelector(`.${this.ROOT_CLASS}__input`),
        inputOverlay: shadowRoot.querySelector(`.${this.ROOT_CLASS}__input-overlay`),
        list: shadowRoot.querySelector(`.${this.classes.LIST}`),
        listStyles: shadowRoot.querySelector('#autocompleteStyles'),
        userStyles: shadowRoot.querySelector('#userStyles'),
        wrapper: shadowRoot.querySelector(`.${this.ROOT_CLASS}`),
      };
      
      this.KEY_CODE__DOWN = 40;
      this.KEY_CODE__ENTER = 13;
      this.KEY_CODE__UP = 38;
      
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
      if (this.data.items && Array.isArray(this.data.items)) {
        this.setupListItems();
      }
      
      this.addListeners();
      this.initialized = true;
    }
    
    formatItemData(str) {
      return str.toLowerCase().replace(/(\s|_)/g, '-');
    }
    
    setupListItems() {
      this.els.list.innerHTML = this.data.items.map(({ attributes = {}, label = '', value = '' }) => {
        const atts = Object.keys(attributes).map(att => `${att}="${attributes[att]}"`).join(' ');
        let _label = label;
        let _value = value;
        
        if (!_label && _value) _label = _value;
        if (!_value && _label) _value = _label;
        
        return `
          <li
            class="${this.classes.LIST_ITEM}"
            data-autocomplete-item="${this.formatItemData(_value)}"
          >
            <button 
              class="${this.classes.LIST_ITEM_BTN}"
              type="button"
              value="${_value}"
              tabindex="-1"
              ${atts}
            >${_label}</button>
          </li>
        `;
      }).join('');
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
            .${this.classes.LIST} [data-autocomplete-item*="${this.formatItemData(query)}"] {
              display: block;
            }
          `
          : `
            .${this.classes.LIST} [data-autocomplete-item] {
              display: block;
            }
          `;
        rules = `
          .${this.classes.LIST} {
            display:block;
          }
          
          ${rule}
        `;
      }
      
      if (newInputValue !== this.currentInputValue) this.updateListStyles(rules);
      
      if (this.els.list.offsetHeight !== 0) {
        // find the first visible item in the drop down to select
        const items = [...this.els.list.querySelectorAll(`.${this.classes.LIST_ITEM_BTN}`)];
        this.visibleListItems = items.reduce((arr, item) => {
          if (item.offsetHeight !== 0) arr.push(item);
          return arr;
        }, []);
      }
      
      this.currentInputValue = newInputValue;
    }
    
    handleInputKeyDown(ev) {
      if (
        ev.keyCode !== this.KEY_CODE__DOWN
        & ev.keyCode !== this.KEY_CODE__ENTER
      ) return;
    
      ev.preventDefault();
      
      switch (ev.keyCode) {
        case this.KEY_CODE__DOWN:
          if (this.visibleListItems.length) {
            this.itemIndex = 0;
            this.visibleListItems[0].focus();
          }
          break;
        
        case this.KEY_CODE__ENTER:
          this.handleItemSelection(ev);
          break;
      }
    }
    
    handleBlur() {
      window.requestAnimationFrame(() => {
        if (!this.shadowRoot.activeElement) {
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
        ev.keyCode !== this.KEY_CODE__DOWN
        && ev.keyCode !== this.KEY_CODE__UP
      ) return;
    
      ev.preventDefault();
    
      switch (ev.keyCode) {
        case this.KEY_CODE__DOWN:
          this.itemIndex += 1;
          if (this.itemIndex === this.visibleListItems.length) this.itemIndex = 0;
          break;
    
        case this.KEY_CODE__UP:
          this.itemIndex--;
          if (this.itemIndex < 0) {
            this.updateInputOverlayText(this.els.input);
            this.els.input.focus();
            return;
          }
          break;
      }
      
      const currItem = this.visibleListItems[this.itemIndex];
      
      this.updateInputOverlayText(currItem);
      currItem.focus();
    }
    
    updateInputOverlayText(item = {}) {
      const value = (item.nodeName === 'BUTTON') ? item.innerText : '';
      this.els.inputOverlay.innerText = value;
    }
    
    handleItemSelection(ev) {
      const target = ev.target;
      const value = target.value;
      let elements, item;
      
      if (target.nodeName === 'INPUT') {
        elements = [...this.visibleListItems];
      }
      else {
        item = target;
        elements = [item];
        this.els.input.value = item.innerText;
        
        if (this.shadowRoot.activeElement !== this.els.input) {
          this.els.input.focus();
        }
      }
      
      this.updateInputOverlayText();
      this.updateListStyles('');
      
      if (item) item.blur();
      
      setTimeout(() => {
        if (this._onSelect) this._onSelect({ elements, value });
      }, 0);
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
      
      if (el.classList.contains(this.classes.LIST_ITEM_BTN)) this.handleItemSelection(ev);
      else if (el.classList.contains(this.classes.CLEAR_BTN)) this.handleClear(ev);
    }
    
    handleKeyDown(ev) {
      const item = ev.target;
      
      if (item === this.els.input) {
        this.handleInputKeyDown(ev);
        
        if (ev.keyCode === this.KEY_CODE__DOWN) {
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
  
  const EL_NAME = 'custom-auto-complete-input';
  if (window.customElements.get(EL_NAME)) {
    console.warn(`${EL_NAME} already defined`);
  }
  else {
    window.customElements.define(EL_NAME, CustomAutoCompleteInput);
    window.CustomAutoCompleteInput = CustomAutoCompleteInput;
  }
})();
