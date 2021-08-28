(() => {
  const ASPECT_RATIO__LANDSCAPE = 'landscape';
  const ASPECT_RATIO__PORTRAIT = 'portrait';
  const ASPECT_RATIO__SQUARE = 'square';
  const CSS_VAR__COLOR__BTN__BG = '--color--btn--bg'
  const CSS_VAR__COLOR__BTN__FG = '--color--btn--fg'
  const CSS_VAR__ITEM_DIAMETER = '--item-diameter';
  const EVENT__ADVANCED = 'carouselAdvanced';
  const EVENT__REGRESSED = 'carouselRegressed';
  const ROOT_CLASS = 'carousel';
  
  const DEFAULT__COLOR__BTN__BG = '#333';
  const DEFAULT__COLOR__BTN__FG = '#eee';
  const DEFAULT__ITEM_DIAMETER = '8em';
  
  class CustomCarousel extends HTMLElement {
    set customStyles(styles) {
      this.els.customStyles.textContent = styles;
    }
    
    get itemDiameter() {
      return this.getAttribute('itemDiameter') || DEFAULT__ITEM_DIAMETER;
    }
    set itemDiameter(value) {
      this.setAttribute('itemDiameter', value);
      this.style.setProperty(CSS_VAR__ITEM_DIAMETER, value);
    }
    
    static get aspectRatios() {
      return {
        landscape: ASPECT_RATIO__LANDSCAPE,
        portrait: ASPECT_RATIO__PORTRAIT,
        square: ASPECT_RATIO__SQUARE,
      };
    }
    
    static get observedAttributes() {
      return [
        'customstyles',
        'itemdiameter',
      ];
    }
    
    static get events() {
      return {
        advanced: EVENT__ADVANCED,
        regressed: EVENT__REGRESSED,
      };
    }
    
    attributeChangedCallback(attr, oldVal, newVal) {
      const empty = oldVal === '' && (newVal === null || newVal === undefined);
      
      if (!empty && oldVal !== newVal) {
        let _newVal = newVal;
        
        switch (attr) {
          case 'customstyles': { this.customStyles = _newVal; break; }
          case 'itemdiameter': { this.itemDiameter = _newVal; break; }
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
            ${CSS_VAR__COLOR__BTN__BG}: ${DEFAULT__COLOR__BTN__BG};
            ${CSS_VAR__COLOR__BTN__FG}: ${DEFAULT__COLOR__BTN__FG};
            ${CSS_VAR__ITEM_DIAMETER}: ${DEFAULT__ITEM_DIAMETER};
            
            font-family: Helvetica, Arial, sans-serif;
          }
          
          slot {
            display: none;
          }
          
          .${ROOT_CLASS} {
            display: flex;
          }
          
          .${ROOT_CLASS}__items-container {
            width: 100%;
            overflow: hidden;
            white-space: nowrap;
          }
          
          .${ROOT_CLASS}__items {
            display: flex;
            transition: transform 0.4s;
            transform: translateX(0%);
            touch-action: none;
          }
          .${ROOT_CLASS}__items.is--dragging {
            transition: none;
          }
          
          .${ROOT_CLASS}__item {
            flex-shrink: 0;
            background-color: #eee;
            background-size: cover;
          }
          .${ROOT_CLASS}__item > * {
            display: block;
          }
          .${ROOT_CLASS}__item > img {
            pointer-events: none;
          }
          .${ROOT_CLASS}__item[ar="${ASPECT_RATIO__SQUARE}"] {
            width: var(${CSS_VAR__ITEM_DIAMETER});
          }
          .${ROOT_CLASS}__item[ar="${ASPECT_RATIO__SQUARE}"] > * {
            width: 100%;
          }
          .${ROOT_CLASS}__item[ar="${ASPECT_RATIO__LANDSCAPE}"],
          .${ROOT_CLASS}__item[ar="${ASPECT_RATIO__PORTRAIT}"] {
            height: var(${CSS_VAR__ITEM_DIAMETER});
          }
          .${ROOT_CLASS}__item[ar="${ASPECT_RATIO__LANDSCAPE}"] > *,
          .${ROOT_CLASS}__item[ar="${ASPECT_RATIO__PORTRAIT}"] > * {
            height: 100%;
          }
          .${ROOT_CLASS}__item:not(:first-of-type) {
            margin-left: 3px;
          }
          .${ROOT_CLASS}__item > :not(a) {
            pointer-events: none;
          }
          .${ROOT_CLASS}__item > a,
          .${ROOT_CLASS}__item > img {
            user-select: none;
          }
          
          .${ROOT_CLASS}__ui-btn {
            color: var(${CSS_VAR__COLOR__BTN__FG});
            width: 5%;
            padding: 0;
            border: none;
            background: var(${CSS_VAR__COLOR__BTN__BG});
            cursor: pointer;
            pointer-events: all;
            transition: opacity 0.25s;
          }
          .${ROOT_CLASS}__ui-btn:disabled {
            opacity: 0.25;
            cursor: default;
          }
          .${ROOT_CLASS}.has--nav .${ROOT_CLASS}__ui-btn:disabled {
            opacity: 0.25;
          }
          
          .${ROOT_CLASS}-sections-nav {
            text-align: center;
            margin-top: 0.5em;
          }
          .${ROOT_CLASS}-sections-nav button {
            width: 1.25em;
            height: 1.25em;
            border: solid 1px var(${CSS_VAR__COLOR__BTN__BG});
            border-radius: 100%;
            background: var(${CSS_VAR__COLOR__BTN__FG});
            opacity: 0.25;
          }
          .${ROOT_CLASS}-sections-nav button:not(:first-of-type) {
            margin-left: 0.25em;
          }
          .${ROOT_CLASS}-sections-nav button:disabled {
            opacity: 1;
          }
          .${ROOT_CLASS}-sections-nav button:not(:disabled) {
            cursor: pointer;
          }
          
          .${ROOT_CLASS}-wrapper.no-nav .${ROOT_CLASS}__ui-btn,
          .${ROOT_CLASS}-wrapper.no-nav .${ROOT_CLASS}-sections-nav {
            display: none;
          }
        </style>
        <style id="customStyles"></style>
        
        <slot name="item"></slot>
        <div class="${ROOT_CLASS}-wrapper no-nav">
          <div class="${ROOT_CLASS}">
            <button type="button" class="${ROOT_CLASS}__ui-btn is--prev">&lt;</button>
            <div class="${ROOT_CLASS}__items-container">
              <div class="${ROOT_CLASS}__items"></div>
            </div>
            <button type="button" class="${ROOT_CLASS}__ui-btn is--next">&gt;</button>
          </div>
          <nav class="${ROOT_CLASS}-sections-nav"></nav>
        </div>
      `;
      
      this.els = {
        carousel: shadowRoot.querySelector(`.${ROOT_CLASS}`),
        customStyles: shadowRoot.getElementById('customStyles'),
        items: shadowRoot.querySelector(`.${ROOT_CLASS}__items`),
        nextBtn: shadowRoot.querySelector(`.${ROOT_CLASS}__ui-btn.is--next`),
        prevBtn: shadowRoot.querySelector(`.${ROOT_CLASS}__ui-btn.is--prev`),
        sectionsNav: shadowRoot.querySelector(`.${ROOT_CLASS}-sections-nav`),
        wrapper: shadowRoot.querySelector(`.${ROOT_CLASS}-wrapper`),
      };
      this.atStart = true;
      this.viewAreaOffset = 0;
    }
    
    connectedCallback() {
      this.handleNextClick = this.handleNextClick.bind(this);
      this.handlePrevClick = this.handlePrevClick.bind(this);
      this.handlePointerDown = this.handlePointerDown.bind(this);
      this.handlePointerMove = this.handlePointerMove.bind(this);
      this.handlePointerUp = this.handlePointerUp.bind(this);
      this.handleSectionIndicatorClick = this.handleSectionIndicatorClick.bind(this);
      this.handleSlotChange = this.handleSlotChange.bind(this);
      this.renderNav = this.renderNav.bind(this);
      
      window.addEventListener('resize', this.renderNav);
      this.shadowRoot.addEventListener('slotchange', this.handleSlotChange);
      this.els.nextBtn.addEventListener('click', this.handleNextClick);
      this.els.prevBtn.addEventListener('click', this.handlePrevClick);
      this.els.items.addEventListener('pointerdown', this.handlePointerDown);
      this.els.sectionsNav.addEventListener('click', this.handleSectionIndicatorClick);
      
      this.renderNav();
    }
    
    disconnectedCallback() {
      this.els.nextBtn.removeEventListener('click', this.handleNextClick);
      this.els.prevBtn.removeEventListener('click', this.handlePrevClick);
      this.els.items.removeEventListener('pointerdown', this.handlePointerDown);
    }
    
    setViewOffset(direction, multiplier = 1) {
      const viewArea = this.els.items.offsetWidth;
      const sectionOffset = viewArea * multiplier;
      const carouselXPos = this.els.items.getBoundingClientRect().x;
      let newOffset;
      
      this.atEnd = false;
      this.atStart = false;
      
      // an item can be half in view so find the offset of the cropped item
      const items = [...this.shadowRoot.querySelectorAll(`.${ROOT_CLASS}__item`)];
      for (let i=0; i<items.length; i++) {
        const item = items[i];
        const { width, x } = item.getBoundingClientRect();
        const _x = x - carouselXPos;
        
        if (direction === 'next') {
          if ((_x + width) >= (this.viewAreaOffset + sectionOffset)) {
            const overlap = this.viewAreaOffset
              ? (this.viewAreaOffset + viewArea) - _x
              : viewArea - _x;
            
            newOffset = (this.viewAreaOffset + sectionOffset) - overlap;
            
            if ((this.els.items.scrollWidth - newOffset) < sectionOffset) {
              newOffset = this.els.items.scrollWidth - viewArea;
              this.atEnd = true;
            }
            
            break;
          }
        }
        else {
          const prevOffset = this.viewAreaOffset - sectionOffset;
          
          if (prevOffset <= 0) {
            newOffset = 0;
            this.atStart = true;
            break;
          }
          else if (_x >= prevOffset) {
            newOffset = _x;
            if (newOffset < 0) {
              newOffset = 0;
              this.atStart = true;
            }
            break;
          }
        }
      }
      
      if (newOffset !== undefined) this.viewAreaOffset = newOffset;
    }
    
    handleNextClick({ multiplier } = {}) {
      this.setViewOffset('next', multiplier);
      this.scrollItems('next');
      this.renderNav();
    }
    
    handlePointerDown(ev) {
      this.els.items.classList.add('is--dragging');
      const currPos = this.els.items.style.transform.match(/([-.\d]+)px/) || [0, 0];
      this.startX = ev.x;
      this.startPos = +currPos[1];
      window.addEventListener('pointermove', this.handlePointerMove);
      window.addEventListener('pointerup', this.handlePointerUp);
    }
    
    handlePointerMove(ev) {
      const xDiff = ev.x - this.startX;
      this.els.items.style.transform = `translateX(${ this.startPos + xDiff }px)`;
      this.endX = ev.x;
    }
    
    handlePointerUp() {
      window.removeEventListener('pointermove', this.handlePointerMove);
      window.removeEventListener('pointerup', this.handlePointerUp);
      this.els.items.classList.remove('is--dragging');
      
      // based on drag direction, scroll the to next or prev
      if (this.endX < this.startX) this.handleNextClick();
      else this.handlePrevClick();
    }
    
    handlePrevClick({ multiplier } = {}) {
      this.setViewOffset('prev', multiplier);
      this.scrollItems('prev');
      this.renderNav();
    }
    
    handleSectionIndicatorClick({ target }) {
      if (target.nodeName === 'BUTTON') {
        const currNdx = +[...this.els.sectionsNav.childNodes].find(el => el.disabled).dataset.ndx;
        const newNdx = +target.dataset.ndx;
        const multiplier = Math.abs(currNdx - newNdx);
        
        if (newNdx > currNdx) this.handleNextClick({ multiplier });
        else this.handlePrevClick({ multiplier });
      }
    }
    
    handleSlotChange({ target: slot }) {
      switch (slot.name) {
        case 'item': {
          this.els.items.innerHTML = slot.assignedNodes().map(el => {
            const clone = el.cloneNode(true);
            const aspectRatio = clone.getAttribute('ar');
            clone.removeAttribute('ar');
            clone.removeAttribute('slot');
            
            return `
              <div class="${ROOT_CLASS}__item" ar="${aspectRatio}">
                ${clone.outerHTML}
              </div>
            `;
          }).join('');
          
          [...this.els.items.querySelectorAll('a, img')].forEach(el => {
            el.draggable = false;
          });
          
          this.renderNav();
          
          break;
        }
      }
    }
    
    renderNav() {
      clearTimeout(this.navDebounce);
      this.navDebounce = setTimeout(() => {
        const parentWidth = this.parentNode.offsetWidth;
        const itemsWidth = this.els.items.scrollWidth;
        
        if (itemsWidth > parentWidth) {
          this.els.wrapper.classList.remove('no-nav');
        }
        else if (!this.els.wrapper.classList.contains('no-nav')) {
          this.els.wrapper.classList.add('no-nav');
        }
        
        if (!this.els.wrapper.classList.contains('no-nav')) {
          this.els.prevBtn.disabled = this.atStart;
          this.els.nextBtn.disabled = this.atEnd;
          
          const itemsWidth = this.els.items.scrollWidth;
          const viewWidth = this.els.items.offsetWidth;
          this.sectionsCount = Math.ceil(itemsWidth/viewWidth);
          // only render indicators when number of sections have changed
          if (
            !this.els.sectionsNav.childNodes.length
            || (this.els.sectionsNav.childNodes.length !== this.sectionsCount)
          ) {
            this.els.sectionsNav.innerHTML = Array(this.sectionsCount).fill('').map((_, ndx) => {
              return `<button title="Section ${ndx + 1}" data-ndx="${ndx}"></button>`;
            }).join('');
          }
          
          const sectionNdx = Math.ceil(this.viewAreaOffset / viewWidth);
          this.els.sectionsNav.childNodes.forEach((indicator, ndx) => {
            indicator.disabled = ndx === sectionNdx;
          });
        }
      }, 100);
    }
    
    scrollItems(direction) {
      const newTransform = `translateX(${-this.viewAreaOffset}px)`;
      
      if (newTransform !== this.els.items.style.transform) {
        this.els.items.addEventListener('transitionend', () => {
          const ev = direction === 'next' ? EVENT__ADVANCED : EVENT__REGRESSED;
          this.dispatchEvent(new CustomEvent(ev, { bubbles: true }));
        }, { once: true });
        
        this.els.items.style.transform = newTransform;
      }
    }
  }

  const EL_NAME = 'custom-carousel';
  if (window.customElements.get(EL_NAME)) {
    console.warn(`${EL_NAME} already defined`);
  }
  else {
    window.customElements.define(EL_NAME, CustomCarousel);
    window.CustomCarousel = CustomCarousel;
  }
})();