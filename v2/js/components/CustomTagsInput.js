(() => {
  const DEFAULT__PLACEHOLDER = 'Add Tag...';
  const KEY__ENTER = 13;
  const KEY__ESC = 27;
  const KEY__UP = 38;
  const KEY__DOWN = 40;
  
  class CustomTagsInput extends HTMLElement {
    get autoCompleteItems() {
      let val = this.getAttribute('autoCompleteItems') || [];
      if (typeof val === 'string') val = JSON.parse(val);
      
      return val;
    }
    set autoCompleteItems(value) {
      let val = value;
      if (Array.isArray(val)) val = JSON.stringify(val);
      
      this.setAttribute('autoCompleteItems', val);
    }
    
    get placeholder() {
      return this.getAttribute('placeholder') || DEFAULT__PLACEHOLDER;
    }
    set placeholder(value) {
      this.setAttribute('placeholder', value || DEFAULT__PLACEHOLDER);
    }
    
    get tags() {
      let val = this.getAttribute('tags') || [];
      if (typeof val === 'string') val = JSON.parse(val);
      
      return val;
    }
    set tags(value) {
      let val = value;
      if (Array.isArray(val)) val = JSON.stringify(val);
      
      const changed = JSON.stringify(this.tags) !== val;
      
      this.setAttribute('tags', val);
      
      if (changed && this.onTagChange) {
        // wait for render in case a DOM look-up needs to occur.
        requestAnimationFrame(() => {
          this.onTagChange(this.tags);
        });
      }
    }
    
    // run logic when these DOM attributes are altered
    static get observedAttributes() {
      return [
        'autocompleteitems',
        'placeholder',
        'tags',
      ];
    }
    
    // run logic when DOM attributes are altered
    attributeChangedCallback(attr, oldVal, newVal) {
      const empty = oldVal === '' && (newVal === null || newVal === undefined);
      
      if (!empty && oldVal !== newVal) {
        let _newVal = newVal;
        
        switch (attr) {
          // NOTE: Transform attribute names to camelcase variables since
          // Browsers normalize them to lowercase.
          case 'autocompleteitems': { this.autoCompleteItems = _newVal; break; }
          default: { this[attr] = _newVal; }
        }
      }
      
      this.render();
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
            --color--delete-btn--bg: #808080;
            --color--delete-btn--bg--hover: #B32D0D;
            --color--delete-btn--text: #fff;
            --color--input--bg: #fff;
            --color--input--border: #808080;
            --color--input--placeholder: #757575;
            --color--input--text: #000;
            --color--tag--bg: #eee;
            --color--tag--border: #808080;
            --color--tag--text: #000;
            
            font-family: Helvetica, Arial, sans-serif;
          }
          
          button, input {
            font-size: 1em;
          }
          
          button {
            border: none;
          }
          
          .tags-input__container {
            color: var(--color--input--text);
            font-size: 1rem;
            padding: 0.5em;
            border: solid 1px var(--color--input--border);
            border-radius: 0.5em;
            background: var(--color--input--bg);
            vertical-align: top;
            position: relative;
            cursor: text;
            display: flex;
            flex-wrap: wrap;
            gap: 0.25em;
          }
          
          .tags-input__tag {
            color: var(--color--tag--text);
            line-height: 1.75em;
            overflow: hidden;
            border: 1px solid var(--color--tag--border);
            border-radius: 0.25em;
            background: var(--color--tag--bg);
            display: flex;
            align-items: center;
            cursor: default;
          }
          .tags-input__tag-text {
            padding: 0 0.5em;
          }
          .tags-input__tag-delete-btn {
            width: auto;
            height: 100%;
            color: var(--color--delete-btn--text);
            font-weight: bold;
            text-align: center;
            border: solid 0.15em var(--color--tag--bg);
            border-radius: 0 0.4em 0.4em 0;
            background: var(--color--delete-btn--bg);
            cursor: pointer;
          }
          .tags-input__tag-delete-btn:hover {
            background: var(--color--delete-btn--bg--hover);
            outline: none;
          }
          /*
            The tag input and the measure element need to have the same sizing so that
            accurate measurements can be taken.
          */
          .tags-input__input,
          .tags-input__measure {
            font-size: 1.1em;
            border: none;
            outline: none;
            white-space: pre;
          }
          
          .tags-input__input {
            color: var(--color--input--text);
            padding: 5px 0;
            margin-left: 4px;
            background: var(--color--input--bg);
            display: inline-block;
          }
          .tags-input__input::-webkit-input-placeholder {
            color: var(--color--input--placeholder);
          }
          
          .tags-input__measure {
            position: absolute;
            top: 0;
            left: 0;
            pointer-events: none;
            visibility: hidden;
          }
          
          .tags-input__auto-complete-list {
            max-height: 150px;
            overflow-y: scroll;
            border: solid 1px var(--color--input--border);
            border-top: none;
            margin: 0;
            background: #fff;
            display: none;
            position: absolute;
            top: 100%;
            left: 0.5em;
            right: 0.5em;
            z-index: 10;
          }
          .tags-input__auto-complete-btn {
            width: 100%;
            color: var(--color--input--text);
            font-weight: bold;
            text-align: left;
            padding: 0.5rem;
            border: none;
            border-radius: unset;
            background: var(--color--input--bg);
            display: none;
            cursor: pointer;
          }
          .tags-input__auto-complete-btn:not(:last-of-type) {
            border-bottom: solid 1px var(--color--input--border);
          }
          .tags-input__auto-complete-btn:hover,
          .tags-input__auto-complete-btn:focus {
            color: var(--color--input--bg);
            background: var(--color--input--text);
            outline: none;
          }
        </style>
      `;
      
      this.els = {};
      
      this.handleAutoCompleteSelect = this.handleAutoCompleteSelect.bind(this);
      this.handleKeyDown = this.handleKeyDown.bind(this);
      this.handleKeyUp = this.handleKeyUp.bind(this);
      this.handleTagClick = this.handleTagClick.bind(this);
      this.handleTagInput = this.handleTagInput.bind(this);
    }
    
    updateStyleRule(query) {
      if (!this.autoCompleteItems.length) return;
      
      let rules = '';
      
      if (query !== '') {
        this.autoCompleteItemSelector = `[data-autocomplete-item*="${query.toLowerCase()}"]`;
        rules = `
          .tags-input__auto-complete-list,
          .tags-input__auto-complete-list ${this.autoCompleteItemSelector} {
            display: block !important;
          }
        `;
      }
      else {
        this.autoCompleteItemSelector = undefined;
      }

      this.els.styles.textContent = rules;
      this.els.autoComplete.scrollTop = 0;
    }
    
    handleTagClick(ev) {
      if (ev.target !== this.els.input) this.els.input.focus();
      if (ev.target.matches('.tags-input__tag-delete-btn')) this.deleteTag(ev);
    }
    
    handleTagInput() {
      const val = this.els.input.value || this.placeholder;

      this.els.measure.textContent = val;
      this.els.input.style.cssText = `width: ${this.els.measure.offsetWidth + 1}px`;

      this.updateStyleRule(this.els.input.value);
    }
    
    handleKeyDown(ev) {
      switch (ev.which) {
        case KEY__ENTER:
          ev.preventDefault();
          this.addTag(ev.currentTarget.value);
          break;
      }
    }
    
    handleKeyUp(ev) {
      switch (ev.which) {
        case KEY__DOWN:
          if (this.autoCompleteItemSelector) {
            this.els.autoComplete.querySelector(this.autoCompleteItemSelector).focus();
          }
          break;
      }
    }
    
    triggerAutoCompleteSelection(ev) {
      this.els.input.value = ev.target.innerText;
      this.els.input.focus();
      this.els.input.dispatchEvent(new KeyboardEvent('keydown', {
        keyCode: KEY__ENTER,
        which: KEY__ENTER,
      }));
    }
    
    handleAutoCompleteSelect(ev) {
      if (!ev.target.matches('.tags-input__auto-complete-btn')) return;
      
      const getSiblingsFor = (el) => {
        const getSib = (selector, sibType) => {
          if (this.autoCompleteItems.length === 1) return;
          
          let currEl = el;
          let sibling;
          
          do {
            const _el = currEl[sibType];
            if (_el && _el.matches(selector)) sibling = _el;
            else currEl = _el;
          }
          while (currEl && currEl[sibType] && !sibling);
          
          return sibling;
        };
        
        return {
          next: (selector) => getSib(selector, 'nextElementSibling'),
          prev: (selector) => getSib(selector, 'previousElementSibling'),
        };
      };
      
      switch (ev.type) {
        case 'click':
          this.triggerAutoCompleteSelection(ev);
          break;

        case 'keydown': {
          // stop the element from scroll via the down key
          ev.preventDefault();
          const el = ev.target;

          switch (ev.which) {
            case KEY__DOWN: {
              let nextEl = getSiblingsFor(el).next(this.autoCompleteItemSelector);
              if (!nextEl) nextEl = el.parentNode.querySelector(this.autoCompleteItemSelector);
              nextEl.focus();
              break;
            }

            case KEY__UP: {
              let prevEl = getSiblingsFor(el).prev(this.autoCompleteItemSelector);
              if (!prevEl) prevEl = this.els.input;
              prevEl.focus();
              break;
            }

            case KEY__ENTER:
              this.triggerAutoCompleteSelection(ev);
              break;

            case KEY__ESC:
              this.els.input.focus();
              break;
          }

          break;
        }
      }
    }
    
    focusInput() {
      this.els.input.focus();
    }
    
    addTag(tag) {
      // remove spacing around tag, and punctuation
      tag.trim().replace(/[.,';"]/g, '');

      if (tag !== '') {
        this.els.input.value = '';
        this.els.input.dispatchEvent(new Event('change'));

        // only add new tags
        if (this.tags.includes(tag)) return;
        
        this.tags = [...this.tags, tag];
        
        this.render();
      }
    }
    
    deleteTag({ target: btn }) {
      const { tag } = btn.dataset;
      
      // NOTE: For some reason, 'splice' doesn't work on Array assigned to 'this'.
      const tags = [...this.tags];
      const tagNdx = this.tags.findIndex(t => t === tag);
      
      tags.splice(tagNdx, 1);
      this.tags = [...tags];
      
      this.render();
    }
    
    render() {
      const inputFocused = (
        this.els.input
        && this.shadowRoot.activeElement === this.els.input
      );
      
      let autoCompleteList = '';
      if (this.autoCompleteItems.length) {
        autoCompleteList = `
          <nav
            class="tags-input__auto-complete-list"
            id="autoComplete"
          >
            ${this.autoCompleteItems.map((acItem) => {
              return `
                <button
                  type="button"
                  class="tags-input__auto-complete-btn"
                  data-autocomplete-item="${acItem.toLowerCase()}"
                >${acItem}</button>
              `;
            }).join('')}
          </nav>
        `;
      }
      
      if (!this.els.root) {
        this.shadowRoot.innerHTML += '<div class="tags-input__container"></div>';
        this.els.root = this.shadowRoot.querySelector('.tags-input__container');
      }
      
      this.els.root.innerHTML = `
        <style type="text/css" id="styles"></style>
        
        <input
          type="hidden"
          name="tags"
          value="${this.tags.join(', ')}"
        />
        
        ${this.tags.map((tag) => {
          return `
            <div class="tags-input__tag">
              <span class="tags-input__tag-text">${tag}</span>
              <button
                type="button"
                class="tags-input__tag-delete-btn"
                data-tag="${tag}"
              >✕</button>
            </div>
          `;
        }).join('')}
        <input
          class="tags-input__input"
          id="input"
          type="text"
          placeholder="${this.placeholder}"
        />
        <div
          class="tags-input__measure"
          id="measure"
        >${this.placeholder}</div>
        ${autoCompleteList}
      `;
      
      this.els.autoComplete = this.shadowRoot.getElementById('autoComplete');
      this.els.input = this.shadowRoot.getElementById('input');
      this.els.measure = this.shadowRoot.getElementById('measure');
      this.els.styles = this.shadowRoot.getElementById('styles');
      
      this.els.root.addEventListener('click', this.handleTagClick);
      this.els.input.addEventListener('change', this.handleTagInput);
      this.els.input.addEventListener('input', this.handleTagInput);
      this.els.input.addEventListener('keydown', this.handleKeyDown);
      this.els.input.addEventListener('keyup', this.handleKeyUp);
      
      if (autoCompleteList) {
        this.els.autoComplete.addEventListener('click', this.handleAutoCompleteSelect);
        this.els.autoComplete.addEventListener('keydown', this.handleAutoCompleteSelect);
      }
      
      if (inputFocused) this.focusInput();
    }
    
    // component has been added to the DOM
    connectedCallback() {
      this.render(); 
    }
  }

  const EL_NAME = 'custom-tags-input';
  if (window.customElements.get(EL_NAME)) {
    console.warn(`${EL_NAME} already defined`);
  }
  else {
    window.customElements.define(EL_NAME, CustomTagsInput);
    window.CustomTagsInput = CustomTagsInput;
  }
})();
