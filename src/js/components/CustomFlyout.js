(() => {
  const CSS_VAR__ANIM_DURATION = '--anim-duration';
  const DIRECTION__BOTTOM = 'bottom';
  const DIRECTION__LEFT = 'left';
  const DIRECTION__RIGHT = 'right';
  const DIRECTION__TOP = 'top';
  const EVENT__CLOSED = 'flyoutClosed';
  const ROOT_CLASS = 'flyout';
  
  const DEFAULT__ANIM_DURATION = 300;
  const DEFAULT__FROM = DIRECTION__LEFT;
  
  class CustomFlyout extends HTMLElement {
    get from() {
      return this.getAttribute('from') || DEFAULT__FROM;
    }
    set from(value) {
      if (value) this.setAttribute('from', value);
      else this.removeAttribute('from');
    }
    
    get open() {
      return this.hasAttribute('open');
    }
    set open(value) {
      if (value === '' || value === 'true' || value === true) {
        this.setAttribute('open', '');
        
        setTimeout(() => {
          this.shadowRoot.addEventListener('click', this.handleCloseClick);
          window.addEventListener('keydown', this.handleKeyDown);
        }, DEFAULT__ANIM_DURATION);
      }
      else {
        this.shadowRoot.removeEventListener('click', this.handleCloseClick);
        window.removeEventListener('keydown', this.handleKeyDown);
        this.removeAttribute('open');
        
        setTimeout(() => {
          this.dispatchEvent(new CustomEvent(EVENT__CLOSED, {
            bubbles: true,
            detail: {
              from: this.from,
            },
          }));
        }, DEFAULT__ANIM_DURATION);
      } 
    }
    
    static get observedAttributes() {
      return ['from', 'open'];
    }
    
    static get events() {
      return {
        closed: EVENT__CLOSED,
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
            ${CSS_VAR__ANIM_DURATION}: ${DEFAULT__ANIM_DURATION}ms;
            
            font: 16px Helvetica, Arial, sans-serif;
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            z-index: 10;
            pointer-events: none;
          }
          
          :host,
          :host(:not([open])) .${ROOT_CLASS},
          :host(:not([open])) .${ROOT_CLASS}-mask {
            pointer-events: none;
          }
          :host([open]) .${ROOT_CLASS},
          :host([open]) .${ROOT_CLASS}-mask {
            pointer-events: all;
          }
          
          .${ROOT_CLASS}-mask {
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            position: absolute;
            top: 0;
            left: 0;
            opacity: 0;
            transition: opacity var(${CSS_VAR__ANIM_DURATION});
            backdrop-filter: blur(10px);
          }
          :host([open]) .${ROOT_CLASS}-mask {
            opacity: 1;
          }
          
          .${ROOT_CLASS} {
            overflow: hidden;
            padding: 0;
            border: solid 1px;
            margin: 0;
            background: #eee;
            display: flex;
            flex-direction: column;
            position: absolute;
            transition: transform var(${CSS_VAR__ANIM_DURATION});
          }
          :host([open]) .${ROOT_CLASS} {
            box-shadow: 0 0.75em 2em 0.25em rgba(0, 0, 0, 0.75);
          }
          
          :host([from="${DIRECTION__LEFT}"]) .${ROOT_CLASS},
          :host([from="${DIRECTION__RIGHT}"]) .${ROOT_CLASS} {
            top: 0;
            bottom: 0;
          }
          :host([from="${DIRECTION__LEFT}"]) .${ROOT_CLASS} {
            left: 0;
            transform: translateX(-100%);
          }
          :host([from="${DIRECTION__RIGHT}"]) .${ROOT_CLASS} {
            right: 0;
            transform: translateX(100%);
          }
          :host([open][from="${DIRECTION__LEFT}"]) .${ROOT_CLASS},
          :host([open][from="${DIRECTION__RIGHT}"]) .${ROOT_CLASS} {
            transform: translateX(0%);
          }
          
          :host([from="${DIRECTION__TOP}"]) .${ROOT_CLASS},
          :host([from="${DIRECTION__BOTTOM}"]) .${ROOT_CLASS} {
            left: 0;
            right: 0;
          }
          :host([from="${DIRECTION__TOP}"]) .${ROOT_CLASS} {
            top: 0;
            transform: translateY(-100%);
          }
          :host([from="${DIRECTION__BOTTOM}"]) .${ROOT_CLASS} {
            bottom: 0;
            transform: translateY(100%);
          }
          :host([open][from="${DIRECTION__TOP}"]) .${ROOT_CLASS},
          :host([open][from="${DIRECTION__BOTTOM}"]) .${ROOT_CLASS} {
            transform: translateY(0%);
          }
          
          .${ROOT_CLASS}__nav {
            font-size: 1.25em;
            border-bottom: solid 1px;
            display: flex;
          }
          
          .${ROOT_CLASS}__body {
            height: 100%;
            overflow-y: auto;
            margin-bottom: 1px;
          }
          
          .${ROOT_CLASS}__title {
            width: 100%;
            color: #eee;
            padding: 0.5em 0.8em 0.5em;
            padding-right: 1em;
            background: #333;
          }
          
          .${ROOT_CLASS}__close-btn {
            color: #eee;
            padding: 0 0.5em;
            border: none;
            background: #333;
            cursor: pointer;
          }
        </style>
        
        <div class="${ROOT_CLASS}-mask"></div>
        <div
          class="${ROOT_CLASS}"
          tabindex="0"
        >
          <nav class="${ROOT_CLASS}__nav">
            <div class="${ROOT_CLASS}__title">
              <slot name="flyoutTitle"></slot>
            </div>
            <button type="button" class="${ROOT_CLASS}__close-btn" title="Close Flyout">&#10005;</button>
          </nav>
          <div class="${ROOT_CLASS}__body">
            <slot name="flyoutBody"></slot>
          </div>
        </div>
      `;
      
      this.handleCloseClick = this.handleCloseClick.bind(this);
      this.handleKeyDown = this.handleKeyDown.bind(this);
    }
    
    handleCloseClick({ keyClose, target }) {
      if (
        keyClose
        || (
          target
          && (
            target.classList.contains(`${ROOT_CLASS}-mask`)
            || target.classList.contains(`${ROOT_CLASS}__close-btn`)
          )
        )
      ) this.open = false;
    }
    
    handleKeyDown({ key }) {
      switch (key) {
        case 'Escape':
          this.handleCloseClick({ keyClose: true });
          break;
      }
    }
  }

  const EL_NAME = 'custom-flyout';
  if (window.customElements.get(EL_NAME)) {
    console.warn(`${EL_NAME} already defined`);
  }
  else {
    window.customElements.define(EL_NAME, CustomFlyout);
    window.CustomFlyout = CustomFlyout;
  }
})();
