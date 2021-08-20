(() => {
  const ROOT_CLASS = 'accordion-menu';
  
  class CustomAccordionMenu extends HTMLElement {
    get single() {
      return this.hasAttribute('single');
    }
    set single(value) {
      (value === '' || value === 'true' || value === true)
        ? this.setAttribute('single', '')
        : this.removeAttribute('single');
    }
    
    static get observedAttributes() {
      return ['single'];
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
        <div class="${ROOT_CLASS}">
          <slot></slot>
        </div>
      `;
    }
    
    connectedCallback() {
      if (this.single) {
        this.addEventListener(
          window.CustomAccordionMenuGroup.events.toggled,
          ({ detail: { open }, target: updatedGroup }) => {
            if (open) {
              const groups = [...this.children];
              
              for (let i=0; i<groups.length; i++) {
                const currGroup = groups[i];
                
                if (currGroup !== updatedGroup && currGroup.open) {
                  currGroup.open = false;
                  break;
                }
              }
            }
          }
        );
      }
    }
  }

  const EL_NAME = 'custom-accordion-menu';
  if (window.customElements.get(EL_NAME)) {
    console.warn(`${EL_NAME} already defined`);
  }
  else {
    window.customElements.define(EL_NAME, CustomAccordionMenu);
    window.CustomAccordionMenu = CustomAccordionMenu;
  }
})();

(() => {
  const CSS_VAR__ANIM_DURATION = '--anim-duration';
  const CSS_VAR__COLOR__INNER_BORDER = '--color--inner-border';
  const CSS_VAR__COLOR__OUTER_BORDER = '--color--outer-border';
  const CSS_VAR__COLOR__HOVER = '--color--hover';
  const CSS_VAR__INDICATOR_DIAMETER = '--indicator-diameter';
  const CSS_VAR__WIDTH__OUTER_BORDER = '--width--outer-border';
  const EVENT__TOGGLED = 'toggled';
  const ROOT_CLASS = 'accordion-menu-group';
  
  const DEFAULT__ANIM_DURATION = '150ms';
  const DEFAULT__COLOR__INNER_BORDER = '#eee';
  const DEFAULT__COLOR__OUTER_BORDER = '#ddd';
  const DEFAULT__COLOR__HOVER = '#eee';
  const DEFAULT__INDICATOR_DIAMETER = 1;
  const DEFAULT__WIDTH__OUTER_BORDER = 2;
  
  class CustomAccordionMenuGroup extends HTMLElement {
    get open() {
      return this.hasAttribute('open');
    }
    set open(value) {
      const open = value === '' || value === 'true' || value === true;
      const changed = open !== this.open;
      
      const sendEvent = () => {
        this.dispatchEvent(new CustomEvent(EVENT__TOGGLED, {
          bubbles: true,
          detail: { open },
        }));
      };
      
      if (changed) {
        if (open) {
          this.setAttribute('open', '');
          
          // animation should only happen when mounted
          if (this.mounted) {
            this.els.items.classList.add('animating');
            sendEvent();
            
            requestAnimationFrame(() => {
              this.els.items.addEventListener('transitionend', () => {
                this.els.items.classList.remove('animating');
                this.els.items.style.height = '';
              }, { once: true });
              
              this.els.items.style.height = `${this.els.itemsWrapper.offsetHeight}px`;
            });
          }
        }
        else {
          if (this.mounted) {
            this.els.items.style.height = `${this.els.itemsWrapper.offsetHeight}px`;
            
            requestAnimationFrame(() => {
              this.removeAttribute('open');
              sendEvent();
              
              if (this.mounted) {
                this.els.items.addEventListener('transitionend', () => {
                  this.els.items.classList.remove('animating');
                }, { once: true });
            
                this.els.items.style.height = '';
                this.els.items.classList.add('animating');
              }
            });
          }
          else {
            this.removeAttribute('open');
          }
        }
      }
    }
    
    static get observedAttributes() {
      return ['open'];
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
      
      shadowRoot.innerHTML = `
        <style>
          *, *::after, *::before {
            box-sizing: border-box;
          }
          
          :host {
            ${CSS_VAR__ANIM_DURATION}: ${DEFAULT__ANIM_DURATION};
            ${CSS_VAR__COLOR__INNER_BORDER}: ${DEFAULT__COLOR__INNER_BORDER};
            ${CSS_VAR__COLOR__OUTER_BORDER}: ${DEFAULT__COLOR__OUTER_BORDER};
            ${CSS_VAR__COLOR__HOVER}: ${DEFAULT__COLOR__HOVER};
            ${CSS_VAR__INDICATOR_DIAMETER}: ${DEFAULT__INDICATOR_DIAMETER}em;
            ${CSS_VAR__WIDTH__OUTER_BORDER}: ${DEFAULT__WIDTH__OUTER_BORDER}px;
            
            font-family: Helvetica, Arial, sans-serif;
          }
          
          ul, li {
            padding: 0;
            margin: 0;
            list-style: none;
          }
          
          .${ROOT_CLASS} {
            border: solid var(${CSS_VAR__WIDTH__OUTER_BORDER}) var(${CSS_VAR__COLOR__OUTER_BORDER});
            border-bottom: none;
          }
          
          .${ROOT_CLASS}__btn {
            width: 100%;
            font-size: 1em;
            padding: 0;
            border: none;
            border-bottom: solid var(${CSS_VAR__WIDTH__OUTER_BORDER}) var(${CSS_VAR__COLOR__OUTER_BORDER});
            background: transparent;
          }
            
          .${ROOT_CLASS}__btn-label {
            width: 100%;
            text-align: left;
            text-transform: uppercase;
            background: transparent;
            position: relative;
            display: block;
            box-sizing: border-box;
            user-select: none;
          }
          ::slotted([slot="label"]) {
            padding: 1em;
            display: block;
            cursor: pointer;
          }
          
          .${ROOT_CLASS}__plus-minus {
            width: var(${CSS_VAR__INDICATOR_DIAMETER});
            height: var(${CSS_VAR__INDICATOR_DIAMETER});
            position: absolute;
            top: 50%;
            right: 1em;
            transform: translateY(-50%);
            pointer-events: none;
          }
          
          .${ROOT_CLASS}__minus1,
          .${ROOT_CLASS}__minus2 {
            width: var(${CSS_VAR__INDICATOR_DIAMETER});
            height: var(${CSS_VAR__INDICATOR_DIAMETER});
            display: block;
            position: absolute;
            top: 0;
            transition: all var(${CSS_VAR__ANIM_DURATION});
          }
          .${ROOT_CLASS}__minus1::after,
          .${ROOT_CLASS}__minus2::after {
            content: '';
            width: 100%;
            height: 2px;
            background: #000;
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
          }
          .${ROOT_CLASS}__minus1 {
            transform: rotate(0deg);
          }
          .${ROOT_CLASS}__minus2 {
            transform: rotate(90deg);
          }
          :host([open]) .${ROOT_CLASS}__minus1,
          :host([open]) .${ROOT_CLASS}__minus2 {
            transform: rotate(180deg);
          }
          
          .${ROOT_CLASS}__items {
            height: 0px;
            overflow: hidden;
            transition: height var(${CSS_VAR__ANIM_DURATION});
          }
          :host([open]) .${ROOT_CLASS}__items:not(.animating) {
            height: auto;
          }
          
          .${ROOT_CLASS}__items-wrapper {
            visibility: hidden;
            transform: translateY(-100%);
            transition: transform var(${CSS_VAR__ANIM_DURATION});
          }
          :host([open]) .${ROOT_CLASS}__items-wrapper,
          .animating .${ROOT_CLASS}__items-wrapper {
            visibility: visible;
          }
          :host([open]) .${ROOT_CLASS}__items-wrapper {
            transform: translateY(0%);
          }
          
          ::slotted([slot="item"]) {
            width: 100%;
            color: #000;
            font-size: inherit;
            text-align: left;
            text-decoration: none;
            padding: 1em;
            border: none;
            border-left: solid 10px var(${CSS_VAR__COLOR__OUTER_BORDER});
            border-bottom: solid 1px var(${CSS_VAR__COLOR__INNER_BORDER});
            background: transparent;
            display: block;
          }
          ::slotted([slot="item"]:hover) {
            background: var(${CSS_VAR__COLOR__HOVER});
          }
        </style>
        
        <div class="${ROOT_CLASS}">
          <button class="${ROOT_CLASS}__btn" type="button">
            <label class="${ROOT_CLASS}__btn-label" for="itemsGroup">
              <slot name="label"></slot>
              <div class="${ROOT_CLASS}__plus-minus">
                <span class="${ROOT_CLASS}__minus1"></span>
                <span class="${ROOT_CLASS}__minus2"></span>
              </div>
            </label>
          </button>
          <div class="${ROOT_CLASS}__items">
            <div class="${ROOT_CLASS}__items-wrapper">
              <slot name="item"></slot>
            </div>
          </div>
        </div>
      `;
      
      this.els = {
        groupBtn: shadowRoot.querySelector(`.${ROOT_CLASS}__btn`),
        items: shadowRoot.querySelector(`.${ROOT_CLASS}__items`),
        itemsWrapper: shadowRoot.querySelector(`.${ROOT_CLASS}__items-wrapper`),
      };
      
      this.toggleGroup = this.toggleGroup.bind(this);
    }
    
    connectedCallback() {
      this.mounted = true;
      this.els.groupBtn.addEventListener('click', this.toggleGroup);
    }
    
    toggleGroup() {
      this.open = !this.open;
    }
  }

  const EL_NAME = 'custom-accordion-menu-group';
  if (window.customElements.get(EL_NAME)) {
    console.warn(`${EL_NAME} already defined`);
  }
  else {
    window.customElements.define(EL_NAME, CustomAccordionMenuGroup);
    window.CustomAccordionMenuGroup = CustomAccordionMenuGroup;
  }
})();