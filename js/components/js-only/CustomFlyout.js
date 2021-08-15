(() => {
  class CustomFlyout extends HTMLElement {
    set content(content) {
      this.els.flyoutBody.innerHTML = content;
    }
    
    set onClose(fn) {
      this._onClose = fn;
    }
    
    get openFrom() {
      return this.getAttribute('open-from');
    }
    
    set openFrom(direction) {
      this.setAttribute('open-from', direction);
    }
    
    set styles(styles) {
      this.els.userStyles.textContent = styles;
    }
    
    set title(title) {
      if (title === '') this.els.flyoutNav.classList.add(this.MODIFIER__HIDDEN);
      else this.els.flyoutNav.classList.remove(this.MODIFIER__HIDDEN);
      this.els.flyoutTitle.innerHTML = title;
    }
    
    static get observedAttributes() {
      return ['open-from'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      switch (name) {
        case 'open-from': {
          const newModifier = `MODIFIER__OPEN_FROM_${newValue.toUpperCase()}`;
          if (this[newModifier]) {
            this.els.flyout.classList.remove(
              this.MODIFIER__OPEN_FROM_BOTTOM,
              this.MODIFIER__OPEN_FROM_LEFT,
              this.MODIFIER__OPEN_FROM_RIGHT,
              this.MODIFIER__OPEN_FROM_TOP
            );
            this.els.flyout.classList.add(this[newModifier]);
          }
          break;
        }
      }
    }
    
    constructor() {
      super();
      
      this.attachShadow({ mode: 'open' });
      
      const { shadowRoot } = this;
      this.ANIM_DURATION = 300;
      this.DIRECTION__BOTTOM = 'bottom';
      this.DIRECTION__LEFT = 'left';
      this.DIRECTION__RIGHT = 'right';
      this.DIRECTION__TOP = 'top';
      this.MODIFIER__HIDDEN = 'is--hidden';
      this.MODIFIER__OPEN = 'is--open';
      this.MODIFIER__OPEN_FROM_BOTTOM = 'open-from--bottom';
      this.MODIFIER__OPEN_FROM_LEFT = 'open-from--left';
      this.MODIFIER__OPEN_FROM_RIGHT = 'open-from--right';
      this.MODIFIER__OPEN_FROM_TOP = 'open-from--top';
      this['open-from'] = this.DIRECTION__LEFT;
      
      shadowRoot.innerHTML = `
        <style>
          *, *::after, *::before {
            box-sizing: border-box;
          }
          
          :host {
            font: 16px Helvetica, Arial, sans-serif;
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            z-index: 10;
          }
          
          :host button,
          :host input,
          :host select,
          :host textarea {
            font-size: 1em;
          }
          
          :host button {
            cursor: pointer;
          }
          
          .flyout-mask {
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            position: absolute;
            top: 0;
            left: 0;
            opacity: 0;
            transition: opacity ${this.ANIM_DURATION}ms;
          }
          .flyout-mask.${this.MODIFIER__OPEN} {
            opacity: 1;
          }
          
          .flyout {
            overflow: hidden;
            padding: 0;
            border: solid 1px;
            margin: 0;
            background: #eee;
            display: flex;
            flex-direction: column;
            position: absolute;
            transition: transform ${this.ANIM_DURATION}ms;
          }
          .flyout.${this.MODIFIER__OPEN} {
            box-shadow: 0 0.75em 2em 0.25em rgba(0, 0, 0, 0.75);
          }
          
          .flyout.${this.MODIFIER__OPEN_FROM_LEFT},
          .flyout.${this.MODIFIER__OPEN_FROM_RIGHT} {
            top: 0;
            bottom: 0;
          }
          .flyout.${this.MODIFIER__OPEN_FROM_LEFT} {
            left: 0;
            transform: translateX(-100%);
          }
          .flyout.${this.MODIFIER__OPEN_FROM_RIGHT} {
            right: 0;
            transform: translateX(100%);
          }
          .flyout.${this.MODIFIER__OPEN_FROM_LEFT}.${this.MODIFIER__OPEN},
          .flyout.${this.MODIFIER__OPEN_FROM_RIGHT}.${this.MODIFIER__OPEN} {
            transform: translateX(0%);
          }
          
          .flyout.${this.MODIFIER__OPEN_FROM_TOP},
          .flyout.${this.MODIFIER__OPEN_FROM_BOTTOM} {
            left: 0;
            right: 0;
          }
          .flyout.${this.MODIFIER__OPEN_FROM_TOP} {
            top: 0;
            transform: translateY(-100%);
          }
          .flyout.${this.MODIFIER__OPEN_FROM_BOTTOM} {
            bottom: 0;
            transform: translateY(100%);
          }
          .flyout.${this.MODIFIER__OPEN_FROM_TOP}.${this.MODIFIER__OPEN},
          .flyout.${this.MODIFIER__OPEN_FROM_BOTTOM}.${this.MODIFIER__OPEN} {
            transform: translateY(0%);
          }
          
          .flyout__nav {
            font-size: 1.25em;
            border-bottom: solid 1px;
            display: flex;
          }
          .flyout__nav.${this.MODIFIER__HIDDEN} {
            display: none;
          }
          
          .flyout__body {
            height: 100%;
            overflow-y: auto;
            margin-bottom: 1px;
          }
          
          .flyout__title {
            width: 100%;
            color: #eee;
            padding: 0.5em 0.8em 0.5em;
            padding-right: 1em;
            background: #333;
          }
          
          .flyout__close-btn {
            color: #eee;
            padding: 0 0.5em;
            border: none;
            background: #333;
          }
        </style>
        <style id="userStyles"></style>
        
        <div class="flyout-mask"></div>
        <div
          class="flyout ${this.MODIFIER__OPEN_FROM_LEFT}"
          tabindex="0"
        >
          <nav class="flyout__nav is--hidden">
            <div class="flyout__title"></div>
            <button type="button" class="flyout__close-btn">&#10005;</button>
          </nav>
          <div class="flyout__body"></div>
        </div>
      `;
      
      this.KEY_CODE__ESC = 27;
      
      this.els = {
        closeBtn: shadowRoot.querySelector('.flyout__close-btn'),
        flyout: shadowRoot.querySelector('.flyout'),
        flyoutBGMask: shadowRoot.querySelector('.flyout-mask'),
        flyoutBody: shadowRoot.querySelector('.flyout__body'),
        flyoutTitle: shadowRoot.querySelector('.flyout__title'),
        flyoutNav: shadowRoot.querySelector('.flyout__nav'),
        userStyles: shadowRoot.querySelector('#userStyles'),
      };
      
      this.handleCloseClick = this.handleCloseClick.bind(this);
      this.handleKeyDown = this.handleKeyDown.bind(this);
      this.handleMaskClick = this.handleMaskClick.bind(this);
    }
    
    handleCloseClick() { this.close(); }
    handleMaskClick() { this.close(); }
    
    handleKeyDown(ev) {
      if (ev.keyCode === this.KEY_CODE__ESC) {
        window.removeEventListener('keydown', this.handleKeyDown);
        this.close();
      }
    }
    
    show() {
      document.body.appendChild(this);
      this.els.closeBtn.addEventListener('click', this.handleCloseClick);
      this.els.flyoutBGMask.addEventListener('click', this.handleMaskClick);
      window.customFlyout = this;
      
      setTimeout(() => {
        this.els.flyoutBGMask.classList.add(this.MODIFIER__OPEN);
        this.els.flyout.classList.add(this.MODIFIER__OPEN);
        this.els.flyout.focus();
        window.addEventListener('keydown', this.handleKeyDown);
      }, 100);
    }
    
    close() {
      this.els.closeBtn.removeEventListener('click', this.handleCloseClick);
      this.els.flyoutBGMask.removeEventListener('click', this.handleMaskClick);
      this.els.flyoutBGMask.classList.remove(this.MODIFIER__OPEN);
      this.els.flyout.classList.remove(this.MODIFIER__OPEN);
      
      setTimeout(() => {
        this._onClose();
        delete window.customFlyout;
        this.remove();
      }, this.ANIM_DURATION);
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
