(() => {
  const ROOT_CLASS = 'accordion-menu';
  
  class CustomAccordionMenu extends HTMLElement {
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
  const CSS_VAR__COLOR__INNER_BORDER = '--color--inner-border';
  const CSS_VAR__COLOR__OUTER_BORDER = '--color--outer-border';
  const CSS_VAR__COLOR__HOVER = '--color--hover';
  const CSS_VAR__INDICATOR_DIAMETER = '--indicator-diameter';
  const CSS_VAR__WIDTH__OUTER_BORDER = '--width--outer-border';
  const ROOT_CLASS = 'accordion-menu-group';
  
  const DEFAULT__COLOR__INNER_BORDER = '#eee';
  const DEFAULT__COLOR__OUTER_BORDER = '#ddd';
  const DEFAULT__COLOR__HOVER = '#eee';
  const DEFAULT__INDICATOR_DIAMETER = 1;
  const DEFAULT__WIDTH__OUTER_BORDER = 2;
  
  class CustomAccordionMenuGroup extends HTMLElement {
    constructor() {
      super();
      
      this.attachShadow({ mode: 'open' });
      
      const { shadowRoot } = this;
      
      // TODO - use animations for open/close so that visibility can be set
      
      shadowRoot.innerHTML = `
        <style>
          *, *::after, *::before {
            box-sizing: border-box;
          }
          
          :host {
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
            transition: all 0.25s;
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
          
          .${ROOT_CLASS}__items {
            overflow: hidden;
            max-height: 0;
            transition: max-height 0.25s cubic-bezier(0, 1, 0, 1) -0.1s;
            visibility: hidden;
          }
          
          .${ROOT_CLASS}__btn {
            border-bottom: solid var(${CSS_VAR__WIDTH__OUTER_BORDER}) var(${CSS_VAR__COLOR__OUTER_BORDER});
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
            
          .${ROOT_CLASS}__checkbox {
            opacity: 0;
            position: absolute;
            top: 0;
            left: 0;
          }
          .${ROOT_CLASS}__checkbox:checked ~ .${ROOT_CLASS}__btn .${ROOT_CLASS}__minus1,
          .${ROOT_CLASS}__checkbox:checked ~ .${ROOT_CLASS}__btn .${ROOT_CLASS}__minus2 {
            transform: rotate(180deg);
          }
          .${ROOT_CLASS}__checkbox:checked ~ .${ROOT_CLASS}__items {
            max-height: 9999px;
            transition: max-height 0.25s cubic-bezier(1, 0, 1, 0) 0s;
            visibility: visible;
          }
          
          .${ROOT_CLASS}__checkbox:focus ~ .${ROOT_CLASS}__btn .${ROOT_CLASS}__btn-label {
            outline: solid 2px blue;
          }
        </style>
        
        
        <li class="${ROOT_CLASS}">
          <input id="itemsGroup" type="checkbox" class="${ROOT_CLASS}__checkbox">
          <div class="${ROOT_CLASS}__btn">
            <label class="${ROOT_CLASS}__btn-label" for="itemsGroup">
              <slot name="label"></slot>
              <div class="${ROOT_CLASS}__plus-minus">
                <span class="${ROOT_CLASS}__minus1"></span>
                <span class="${ROOT_CLASS}__minus2"></span>
              </div>
            </label>
          </div>
          <ul class="${ROOT_CLASS}__items">
            <slot name="item"></slot>
          </ul>
        </li>
      `;
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