(() => {
  const CSS_VAR__ANIM_DURATION = '--dialog-animDuration';
  const CSS_VAR__COLOR__BODY = '--dialog--color--body';
  const CSS_VAR__COLOR__BORDER = '--dialog--color--border';
  const CSS_VAR__COLOR__TITLE__BG = '--dialog--color--title--bg';
  const CSS_VAR__COLOR__TITLE__TEXT = '--dialog--color--title--text';
  const EVENT__CLOSED = 'dialogClosed';
  const ROOT_CLASS = 'dialog';
  
  const DEFAULT__ANIM_DURATION = 300;
  const DEFAULT__COLOR__BODY = '#eee';
  const DEFAULT__COLOR__BORDER = '#000';
  const DEFAULT__COLOR__TITLE__BG = '#333';
  const DEFAULT__COLOR__TITLE__TEXT = '#eee';
  const DEFAULT__BODY = '[BODY]';

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
    
    get open() {
      return this.hasAttribute('open');
    }
    set open(value) {
      if (value === '' || value === 'true' || value === true) {
        this.prevFocused = document.activeElement;
        
        this.render();
        
        this.setAttribute('open', '');
        this.els.dialog.setAttribute('open', '');
        
        this.els.wrapper.classList.add('in');
        setTimeout(() => {
          this.els.wrapper.addEventListener('click', this.handleCloseClick);
          window.addEventListener('keydown', this.handleKeyDown);
          this.els.dialog.focus();
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
          
          if (this.prevFocused) this.prevFocused.focus();
          
          this.dispatchEvent(new CustomEvent(EVENT__CLOSED, {
            bubbles: true,
            detail: { modal: this.modal },
          }));
        }, DEFAULT__ANIM_DURATION);
      } 
    }
    
    static get observedAttributes() {
      return ['modal', 'open'];
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
          @keyframes dialogIn {
            0% {
              opacity: 0;
              transform: translateY(-30%);
            }
            100% {
              opacity: 1;
              transform: translateY(0%);
            }
          }
          @keyframes dialogOut {
            0% {
              opacity: 1;
              transform: translateY(0%);
            }
            100% {
              opacity: 0;
              transform: translateY(30%);
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
            inset: 0;
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
          
          .${ROOT_CLASS}-wrapper {
            width: 100vw;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
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
            max-width: calc(100vw - 2em);
            max-height: calc(100vh - 2em);
            overflow: hidden;
            padding: 0;
            border: solid 4px var(${CSS_VAR__COLOR__BORDER});
            border-radius: 0.5em;
            background: var(${CSS_VAR__COLOR__BORDER});
            box-shadow: 0 0.75em 2em 0.25em rgba(0, 0, 0, 0.75);
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
            font-size: 1.25em;
            padding: 0 0.5em;
            border: none;
            border-radius: 0.3em; /* for focus border */
            background: var(${CSS_VAR__COLOR__TITLE__BG});
          }
          .${ROOT_CLASS}__close-btn:focus-visible {
            outline: solid 2px color-mix(in srgb, currentColor 40%, transparent);
            outline-offset: -4px;
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
            animation: maskOut ${DEFAULT__ANIM_DURATION}ms forwards;
          }
          .${ROOT_CLASS}-wrapper.in .${ROOT_CLASS} {
            animation: dialogIn ${DEFAULT__ANIM_DURATION}ms;
          }
          .${ROOT_CLASS}-wrapper.out .${ROOT_CLASS} {
            animation: dialogOut ${DEFAULT__ANIM_DURATION}ms forwards;
          }
        </style>
        
        <div class="${ROOT_CLASS}-wrapper">
          <div class="${ROOT_CLASS}-mask"></div>
          <dialog class="${ROOT_CLASS}" tabindex="0"></dialog>
        </div>
      `;
      
      this.els = {
        dialog: shadowRoot.querySelector(`.${ROOT_CLASS}`),
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
      const hasTitle = this.querySelector('[slot="dialogTitle"]');
      let navMarkup = '';
      
      if (!this.modal || this.modal && hasTitle) {
        let closeBtnMarkup = '';
        
        if (!this.modal) {
          closeBtnMarkup = `
            <button type="button" class="${ROOT_CLASS}__close-btn" title="Close Dialog">
              &#10005;
            </button>
          `;
        }
        
        navMarkup = `
          <nav class="${ROOT_CLASS}__nav">
            <div class="${ROOT_CLASS}__title">
              <slot name="dialogTitle"></slot>
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
