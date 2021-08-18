(() => {
  const CSS_VAR__ANIM_DURATION = '--dialog-animDuration';
  const CSS_VAR__COLOR__BODY = '--dialog--color--body';
  const CSS_VAR__COLOR__BORDER = '--dialog--color--border';
  const CSS_VAR__COLOR__TITLE__BG = '--dialog--color--title--bg';
  const CSS_VAR__COLOR__TITLE__TEXT = '--dialog--color--title--text';
  const DEFAULT__ANIM_DURATION = 300;
  const DEFAULT__COLOR__BODY = '#eee';
  const DEFAULT__COLOR__BORDER = '#000';
  const DEFAULT__COLOR__TITLE__BG = '#333';
  const DEFAULT__COLOR__TITLE__TEXT = '#eee';
  const DEFAULT__BODY = '[BODY]';
  const ROOT_CLASS = 'dialog';

  class CustomDialog extends HTMLElement {
    get modal() {
      return this.hasAttribute('modal');
    }
    set modal(value) {
      if (value === '' || value === 'true' || value === true) {
        this.setAttribute('modal', '');
      }
      else {
        this.removeAttribute('modal');
      }
      
      this.render();
    }
    
    set onClose(handler) {
      if (!this.onCloseClickHandlers.includes(handler)) {
        this.onCloseClickHandlers.push(handler);
      }
    }
    
    get open() {
      return this.hasAttribute('open');
    }
    set open(value) {
      if (value === '' || value === 'true' || value === true) {
        this.render();
        
        this.setAttribute('open', '');
        this.els.dialog.setAttribute('open', '');
        
        this.els.wrapper.classList.add('in');
        setTimeout(() => {
          this.els.wrapper.addEventListener('click', this.handleCloseClick);
          window.addEventListener('keydown', this.handleKeyDown);
        }, DEFAULT__ANIM_DURATION);
      }
      else {
        this.els.wrapper.removeEventListener('click', this.handleCloseClick);
        window.removeEventListener('keydown', this.handleKeyDown);
        
        this.els.wrapper.classList.add('out');
        setTimeout(() => {
          this.els.wrapper.classList.remove('in', 'out');
          
          this.removeAttribute('open');  
          this.els.dialog.removeAttribute('open');
          
          if (this.onCloseClickHandlers.length) {
            this.onCloseClickHandlers.forEach((handler) => { handler(); });
          }
        }, DEFAULT__ANIM_DURATION);
      } 
    }
    
    get titleText() {
      return this.getAttribute('titleText') || '';
    }
    set titleText(value) {
      this.setAttribute('titleText', value || '');
    }
    
    static get observedAttributes() {
      return ['modal', 'onclose', 'open', 'titletext'];
    }
    
    attributeChangedCallback(attr, oldVal, newVal) {
      const empty = oldVal === '' && (newVal === null || newVal === undefined);
      
      if (!empty && oldVal !== newVal) {
        let _newVal = newVal;
        
        switch (attr) {
          case 'onclose': { this.onClose = _newVal; break; }
          case 'titletext': { this.titleText = _newVal; break; }
          default: { this[attr] = _newVal; }
        }
      }
    }
    
    constructor() {
      super();
      
      this.attachShadow({ mode: 'open' });
      
      const { shadowRoot } = this;
      this.onCloseClickHandlers = [];
      
      shadowRoot.innerHTML = `
        <style>
          @keyframes dialogIn {
            0% {
              opacity: 0;
              transform: translate(-50%, -90%);
            }
            100% {
              opacity: 1;
              transform: translate(-50%, -50%);
            }
          }
          @keyframes dialogOut {
            0% {
              opacity: 1;
              transform: translate(-50%, -50%);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -10%);
            }
          }
          @keyframes maskIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
          @keyframes maskOut {
            0% { opacity: 1; }
            100% { opacity: 0; }
          }
          
          *, *::after, *::before {
            box-sizing: border-box;
          }
          
          :host {
            ${CSS_VAR__ANIM_DURATION}: ${DEFAULT__ANIM_DURATION}ms;
            ${CSS_VAR__COLOR__BODY}: ${DEFAULT__COLOR__BODY};
            ${CSS_VAR__COLOR__BORDER}: ${DEFAULT__COLOR__BORDER};
            ${CSS_VAR__COLOR__TITLE__BG}: ${DEFAULT__COLOR__TITLE__BG};
            ${CSS_VAR__COLOR__TITLE__TEXT}: ${DEFAULT__COLOR__TITLE__TEXT};
            
            font: 16px Helvetica, Arial, sans-serif;
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            z-index: 10;
          }
          :host(:not([open])) {
            display: none;
          }
          
          button,
          input,
          select,
          textarea {
        		fill: orange;
        	}
          button:not(disabled) {
            cursor: pointer;
          }
          
          .${ROOT_CLASS}__body button {
            color: #fff;
            width: 100%;
            padding: 0.75em 1em;
            border: none;
            border-radius: 0.25em;
            background: #000;
            position: relative;
          }
          .${ROOT_CLASS}__body button:focus {
            outline: none;
          }
          .${ROOT_CLASS}__body button:focus::after {
            content: '';
            position: absolute;
            border: solid 2px currentColor;
            border-radius: 0.25em;
            top: 2px;
            left: 2px;
            bottom: 2px;
            right: 2px;
          }
          
          .${ROOT_CLASS} {
            max-height: 100vh;
            overflow: hidden;
            padding: 0;
            border: solid 4px var(${CSS_VAR__COLOR__BORDER});
            border-radius: 0.5em;
            margin: 0;
            background: var(${CSS_VAR__COLOR__BORDER});
            box-shadow: 0 0.75em 2em 0.25em rgba(0, 0, 0, 0.75);
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
          
          .${ROOT_CLASS}__nav {
            min-height: 2em;
            font-size: 1.25em;
            border-bottom: solid 1px;
            background-color: var(${CSS_VAR__COLOR__TITLE__BG});
            display: flex;
          }
          
          .${ROOT_CLASS}__title {
            width: 100%;
            color: var(${CSS_VAR__COLOR__TITLE__TEXT});
            padding: 0.5em;
            padding-right: 1em;
            background: var(${CSS_VAR__COLOR__TITLE__BG});
          }
          
          .${ROOT_CLASS}__body {
            background: var(${CSS_VAR__COLOR__BODY});
          }
          
          .${ROOT_CLASS}__close-btn {
            color: var(${CSS_VAR__COLOR__TITLE__TEXT});
            padding: 0 1em;
            border: none;
            background: var(${CSS_VAR__COLOR__TITLE__BG});
          }
          :host([modal]) .${ROOT_CLASS}__close-btn {
            display: none;
          }
          
          .${ROOT_CLASS}-mask {
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.5);
            position: absolute;
            top: 0;
            left: 0;
            backdrop-filter: blur(10px);
          }
          
          .${ROOT_CLASS}-wrapper.in .${ROOT_CLASS}-mask {
            animation: maskIn ${DEFAULT__ANIM_DURATION}ms;
          }
          .${ROOT_CLASS}-wrapper.out .${ROOT_CLASS}-mask {
            animation: maskOut ${DEFAULT__ANIM_DURATION}ms;
          }
          .${ROOT_CLASS}-wrapper.in .${ROOT_CLASS} {
            animation: dialogIn ${DEFAULT__ANIM_DURATION}ms;
          }
          .${ROOT_CLASS}-wrapper.out .${ROOT_CLASS} {
            animation: dialogOut ${DEFAULT__ANIM_DURATION}ms;
          }
        </style>
        
        <div class="${ROOT_CLASS}-wrapper">
          <div class="${ROOT_CLASS}-mask"></div>
          <dialog class="${ROOT_CLASS}" tabindex="0"></dialog>
        </div>
      `;
      
      this.els = {
        dialog: shadowRoot.querySelector(`.${ROOT_CLASS}`),
        dialogMask: shadowRoot.querySelector(`.${ROOT_CLASS}-mask`),
        wrapper: shadowRoot.querySelector(`.${ROOT_CLASS}-wrapper`),
      };
      
      this.handleCloseClick = this.handleCloseClick.bind(this);
      this.handleKeyDown = this.handleKeyDown.bind(this);
    }
    
    handleCloseClick({ keyClose, target }) {
      if (
        !this.modal
        && (
          keyClose
          || (
            target
            && (
              target.classList.contains(`${ROOT_CLASS}-mask`)
              || target.classList.contains(`${ROOT_CLASS}__close-btn`)
            )
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
    
    render() {
      let navMarkup = '';
      
      if (!this.modal || this.modal && this.titleText) {
        let closeBtnMarkup = '';
        
        if (!this.modal) {
          closeBtnMarkup = `
            <button type="button" class="${ROOT_CLASS}__close-btn">
              &#10005;
            </button>
          `;
        }
        
        navMarkup = `
          <nav class="${ROOT_CLASS}__nav">
            <div class="${ROOT_CLASS}__title">
              <slot name="dialogTitle">${this.titleText}</slot>
            </div>
            ${closeBtnMarkup}
          </nav>
        `;
      }
      
      this.els.dialog.innerHTML = `
        ${navMarkup}
        <div class="${ROOT_CLASS}__body">
          <slot name="dialogBody">${DEFAULT__BODY}</slot>
        </div>
      `;
    }
  }

  const EL_NAME = 'custom-dialog';
  if (window.customElements.get(EL_NAME)) {
    console.warn(`${EL_NAME} already defined`);
  }
  else {
    window.customElements.define(EL_NAME, CustomDialog);
    window.CustomDialog = CustomDialog;
  }
})();
