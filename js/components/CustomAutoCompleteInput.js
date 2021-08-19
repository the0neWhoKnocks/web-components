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
  const CSS_CLASS__LIST_ITEM = `${ROOT_CLASS}__list-item`;
  const CSS_CLASS__LIST_ITEM_BTN = `${ROOT_CLASS}__list-item-btn`;
  
  const DEFAULT__MAX_LIST_HEIGHT = '75vh';
  
  class CustomAutoCompleteInput extends HTMLElement {
    get customStyles() {
      return this.els.customStyles.textContent;
    }
    set customStyles(styles) {
      this.els.customStyles.textContent = styles;
    }
    
    get items() {
      return this.data.items;
    }
    set items(items) {
      this.data.items = Array.isArray(items) ? items : [];
      if (this.initialized) this.renderListItems();
    }
    
    get placeholder() {
      return this.els.input.placeholder;
    }
    set placeholder(text) {
      this.setAttribute('placeholder', text);
      this.els.input.placeholder = text;
    }
    
    static get observedAttributes() {
      return ['customstyles', 'items', 'placeholder'];
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
          case 'customstyles': { this.customStyles = _newVal; break; }
          case 'items': {
            if (typeof _newVal === 'string' && _newVal.startsWith('[')) {
              _newVal = JSON.parse(_newVal);
            }
            
            this[attr] = _newVal;
            break;
          }
          default: { this[attr] = _newVal; }
        }
      }
    }
    
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      
      const { shadowRoot } = this;
      this.data = {};
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
            font: 400 1em system-ui;
            width: 100%;
            padding: 0.5em 1em;
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
            background: #ddd;
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
          .${CSS_CLASS__LIST} [data-autocomplete-item] {
            display: none;
          }
          .${CSS_CLASS__LIST_ITEM} {
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
          .${CSS_CLASS__LIST_ITEM_BTN} {
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
          .${CSS_CLASS__LIST_ITEM_BTN}:focus,
          .${CSS_CLASS__LIST_ITEM_BTN}:hover {
            background: #eee;
          }
        </style>
        <style id="customStyles"></style>
        <style id="autocompleteStyles"></style>
        
        <div class="${ROOT_CLASS}">
          <div class="${CSS_CLASS__INPUT_WRAPPER}">
            <input class="${CSS_CLASS__INPUT}" type="text">
            <div class="${CSS_CLASS__INPUT_OVERLAY}"></div>
            <button class="${CSS_CLASS__CLEAR_BTN}" type="button">&#10005;</button>
          </div>
          <ul class="${CSS_CLASS__LIST}"></ul>
        </div>
      `;
      
      this.els = {
        customStyles: shadowRoot.querySelector('#customStyles'),
        input: shadowRoot.querySelector(`.${CSS_CLASS__INPUT}`),
        inputOverlay: shadowRoot.querySelector(`.${CSS_CLASS__INPUT_OVERLAY}`),
        list: shadowRoot.querySelector(`.${CSS_CLASS__LIST}`),
        listStyles: shadowRoot.querySelector('#autocompleteStyles'),
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
      this.renderListItems();
      this.addListeners();
      this.initialized = true;
    }
    
    formatItemData(str) {
      return str.toLowerCase().replace(/(\s|_)/g, '-');
    }
    
    renderListItems() {
      if (this.data.items && Array.isArray(this.data.items)) {
        this.els.list.innerHTML = this.data.items.map(({ attributes = {}, label = '', value = '' }) => {
          const atts = Object.keys(attributes).map(att => `${att}="${attributes[att]}"`).join(' ');
          let _label = label;
          let _value = value;
          
          if (!_label && _value) _label = _value;
          if (!_value && _label) _value = _label;
          
          return `
            <li
              class="${CSS_CLASS__LIST_ITEM}"
              data-autocomplete-item="${this.formatItemData(_value)}"
            >
              <button 
                class="${CSS_CLASS__LIST_ITEM_BTN}"
                type="button"
                value="${_value}"
                tabindex="-1"
                ${atts}
              >${_label}</button>
            </li>
          `;
        }).join('');
      }
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
            .${CSS_CLASS__LIST} [data-autocomplete-item*="${this.formatItemData(query)}"] {
              display: block;
            }
          `
          : `
            .${CSS_CLASS__LIST} [data-autocomplete-item] {
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
        const items = [...this.els.list.querySelectorAll(`.${CSS_CLASS__LIST_ITEM_BTN}`)];
        this.visibleListItems = items.reduce((arr, item) => {
          if (item.offsetHeight !== 0) arr.push(item);
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
            this.visibleListItems[0].focus();
          }
          break;
        
        case KEY_CODE__ENTER:
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
        this.dispatchEvent(new CustomEvent(EVENT__SELECTED, {
          bubbles: true,
          detail: { elements, value },
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
      
      if (el.classList.contains(CSS_CLASS__LIST_ITEM_BTN)) this.handleItemSelection(ev);
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
  
  const EL_NAME = 'custom-auto-complete-input';
  if (window.customElements.get(EL_NAME)) {
    console.warn(`${EL_NAME} already defined`);
  }
  else {
    window.customElements.define(EL_NAME, CustomAutoCompleteInput);
    window.CustomAutoCompleteInput = CustomAutoCompleteInput;
  }
})();
