(() => {
  // const CSS_VAR__COLOR__NAME = '--color--name';
  // const EVENT__TOGGLED = 'toggled';
  // const ROOT_CLASS = 'CSS_CLASSNAME';
  
  // const DEFAULT__COLOR__NAME = '#cccccc';
  
  class CustomTag extends HTMLElement {
    // // prototype getter
    // static get prop1() { return prop; }
    
    // // instance props
    // get prop2() {
    //   return this.getAttribute('prop2') || DEFAULT__VAL;
    // }
    // set prop2(value) {
    //   this.setAttribute('prop2', value);
    // }
    
    // set expanded(value) {
    //   (value === '' || value === 'true' || value === true)
    //     ? this.setAttribute('expanded', '')
    //     : this.removeAttribute('expanded');
    // }
    
    // get open() { return this.hasAttribute('open'); }
    // set open(value) {
    //   const open = value === '' || value === 'true' || value === true;
    //   const changed = open !== this.open;
    //   
    //   const sendEvent = () => {
    //     this.dispatchEvent(new CustomEvent(EVENT__TOGGLED, {
    //       bubbles: true,
    //       detail: { open },
    //     }));
    //   };
    //   
    //   if (changed) {
    //     if (open) this.setAttribute('open', '');
    //     else this.removeAttribute('open');
    //   }
    // }
    
    // // run logic when these DOM attributes are altered
    // static get observedAttributes() {
    //   return [
    //     'prop2',
    //   ];
    // }
    
    // // export custom events for Users
    // static get events() {
    //   return {
    //     toggled: EVENT__TOGGLED,
    //   };
    // }
    
    // // run logic when DOM attributes are altered
    // attributeChangedCallback(attr, oldVal, newVal) {
    //   const empty = oldVal === '' && (newVal === null || newVal === undefined);
    //   
    //   if (!empty && oldVal !== newVal) {
    //     let _newVal = newVal;
    //     
    //     switch (attr) {
    //       // NOTE: Transform attribute names to camelcase variables since
    //       // Browsers normalize them to lowercase.
    //       case 'bgcolor': { this.bgColor = _newVal; break; }
    //       default: { this[attr] = _newVal; }
    //     }
    //   }
    // }
    
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
            /*
            ${CSS_VAR__COLOR__NAME}: ${DEFAULT__COLOR__NAME};
            */
            
            font-family: Helvetica, Arial, sans-serif;
          }
          
          .${ROOT_CLASS} {
            display: inline-block;
          }
          
          /*
          :host([open]) .${ROOT_CLASS} {
            background: green;
          }
          
          ::slotted([slot="item"]) {
            background: orange;
          }
          */
        </style>
        
        <div class="${ROOT_CLASS}"></div>
      `;
      
      this.els = {
        root: shadowRoot.querySelector(`.${ROOT_CLASS}`),
      };
    }
    
    // // component has been added to the DOM
    // connectedCallback() {
    //   this.render();
    // 
    //   this.shadowRoot.addEventListener('slotchange', ({ target: slot }) => {
    //     slot.assignedNodes().map((node) => {
    //       console.log(node);
    //     });
    //   });  
    // }
    
    // render() {
    //   const markup = '<div>content</div>';
    //   this.els.root.innerHTML = `
    //     <div>${markup}</div>
    //     <slot name="item"></slot>
    //   `;
    // }
  }

  const EL_NAME = 'custom-tag';
  if (window.customElements.get(EL_NAME)) {
    console.warn(`${EL_NAME} already defined`);
  }
  else {
    window.customElements.define(EL_NAME, CustomTag);
    window.CustomTag = CustomTag;
  }
})();
