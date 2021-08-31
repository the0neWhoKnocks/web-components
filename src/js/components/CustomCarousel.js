(() => {
  const CSS_VAR__CAROUSEL_HEIGHT = '--carousel-height';
  const CSS_VAR__COLOR__BTN__BG = '--color--btn--bg';
  const CSS_VAR__COLOR__BTN__FG = '--color--btn--fg';
  const EVENT__ADVANCED = 'carouselAdvanced';
  const EVENT__REGRESSED = 'carouselRegressed';
  const MODIFIER__NAV1 = 'has--nav1';
  const MODIFIER__NAV2 = 'has--nav2';
  const ROOT_CLASS = 'carousel';
  
  const DEFAULT__CAROUSEL_HEIGHT = '15em';
  const DEFAULT__COLOR__BTN__BG = '#333';
  const DEFAULT__COLOR__BTN__FG = '#eee';
  
  class CustomCarousel extends HTMLElement {
    get height() {
      return this.getAttribute('height') || DEFAULT__CAROUSEL_HEIGHT;
    }
    set height(value) {
      this.setAttribute('height', value);
      this.style.setProperty(CSS_VAR__CAROUSEL_HEIGHT, value);
    }
    
    get nav1() {
      return this.hasAttribute('nav1');
    }
    set nav1(value) {
      (value === '' || value === 'true' || value === true)
        ? this.setAttribute('nav1', '')
        : this.removeAttribute('nav1');
        
      this.reset();
      this.setNav1Listeners();
    }
    
    get nav2() {
      return this.hasAttribute('nav2');
    }
    set nav2(value) {
      (value === '' || value === 'true' || value === true)
        ? this.setAttribute('nav2', '')
        : this.removeAttribute('nav2');
      
      this.reset();
      this.setNav2Listeners();
    }
    
    get vertical() {
      return this.hasAttribute('vertical');
    }
    set vertical(value) {
      (value === '' || value === 'true' || value === true)
        ? this.setAttribute('vertical', '')
        : this.removeAttribute('vertical');
    }
    
    static get observedAttributes() {
      return [
        'height',
        'nav1',
        'nav2',
        'vertical',
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
            ${CSS_VAR__CAROUSEL_HEIGHT}: ${DEFAULT__CAROUSEL_HEIGHT};
            --section-nav-spacing: 0.5em;
            --section-nav-item-diameter: 1.25em;
            
            font-family: Helvetica, Arial, sans-serif;
            display: block;
          }
          
          .${ROOT_CLASS}-wrapper {
            height: var(${CSS_VAR__CAROUSEL_HEIGHT});
          }
          .${ROOT_CLASS}-wrapper.${MODIFIER__NAV2} {
            height: calc(var(${CSS_VAR__CAROUSEL_HEIGHT}) + (var(--section-nav-item-diameter) + var(--section-nav-spacing)));
          }
          
          .${ROOT_CLASS} {
            height: var(${CSS_VAR__CAROUSEL_HEIGHT});
            display: flex;
          }
          
          .${ROOT_CLASS}__items-container {
            width: 100%;
            overflow: hidden;
            white-space: nowrap;
          }
          :host(:not([nav1]):not([nav2])) .${ROOT_CLASS}__items-container {
            overflow: auto;
          }
          
          .${ROOT_CLASS}__items {
            transition: transform 0.4s;
            transform: translateX(0px);
            touch-action: none;
          }
          .${ROOT_CLASS}__items.disable-transition {
            transition: none;
          }
          
          .${ROOT_CLASS}__ui-btn {
            color: var(${CSS_VAR__COLOR__BTN__FG});
            width: 3em;
            padding: 0;
            border: none;
            background: var(${CSS_VAR__COLOR__BTN__BG});
            cursor: pointer;
            pointer-events: all;
            display: none;
            transition: opacity 0.25s;
          }
          .${ROOT_CLASS}__ui-btn:disabled {
            opacity: 0.25;
            cursor: default;
          }
          .${ROOT_CLASS}-wrapper.${MODIFIER__NAV1} .${ROOT_CLASS}__ui-btn {
            display: block;
          }
          .${ROOT_CLASS}-wrapper.${MODIFIER__NAV1} .${ROOT_CLASS}__ui-btn:disabled {
            opacity: 0.25;
          }
          
          .${ROOT_CLASS}-sections-nav {
            text-align: center;
            margin-top: var(--section-nav-spacing);
            display: none;
          }
          .${ROOT_CLASS}-wrapper.${MODIFIER__NAV2} .${ROOT_CLASS}-sections-nav {
            display: block;
          }
          .${ROOT_CLASS}-sections-nav button {
            width: var(--section-nav-item-diameter);
            height: var(--section-nav-item-diameter);
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
        </style>
        <style id="customStyles"></style>
        
        <div class="${ROOT_CLASS}-wrapper">
          <div class="${ROOT_CLASS}">
            <button type="button" class="${ROOT_CLASS}__ui-btn is--prev">&lt;</button>
            <div class="${ROOT_CLASS}__items-container">
              <div class="${ROOT_CLASS}__items">
                <slot name="item"></slot>
              </div>
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
        itemsContainer: shadowRoot.querySelector(`.${ROOT_CLASS}__items-container`),
        itemSlot: shadowRoot.querySelector('slot[name="item"]'),
        nextBtn: shadowRoot.querySelector(`.${ROOT_CLASS}__ui-btn.is--next`),
        prevBtn: shadowRoot.querySelector(`.${ROOT_CLASS}__ui-btn.is--prev`),
        sectionsNav: shadowRoot.querySelector(`.${ROOT_CLASS}-sections-nav`),
        wrapper: shadowRoot.querySelector(`.${ROOT_CLASS}-wrapper`),
      };
    }
    
    connectedCallback() {
      this.mounted = true;
      
      this.handleNextClick = this.handleNextClick.bind(this);
      this.handlePrevClick = this.handlePrevClick.bind(this);
      this.handlePointerDown = this.handlePointerDown.bind(this);
      this.handlePointerMove = this.handlePointerMove.bind(this);
      this.handlePointerUp = this.handlePointerUp.bind(this);
      this.handleSectionIndicatorClick = this.handleSectionIndicatorClick.bind(this);
      this.handleSlotChange = this.handleSlotChange.bind(this);
      this.renderNav = this.renderNav.bind(this);
      this.reset = this.reset.bind(this);
      this.update = this.update.bind(this);
      
      window.addEventListener('resize', this.reset);
      this.shadowRoot.addEventListener('slotchange', this.handleSlotChange);
      
      this.renderNav();
      this.setNav1Listeners();
      this.setNav2Listeners();
    }
    
    disconnectedCallback() {
      window.removeEventListener('resize', this.reset);
    }
    
    handleNextClick() {
      let nextNdx = this.sectionNdx + 1;
      
      if (nextNdx <= this.sectionsCount) {
        this.prevSectionNdx = this.sectionNdx;
        this.sectionNdx = nextNdx;
        
        this.update();
      }
    }
    
    handlePointerDown(ev) {
      this.els.items.classList.add('disable-transition');
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
      this.els.items.classList.remove('disable-transition');
      
      const [, currXPos] = this.els.items.style.transform.match(/translateX\(([\d-.]+)px\)/) || [0, 0];
      const xPos = +currXPos;
      
      // based on drag direction, scroll to next or prev
      if (this.endX < this.startX) {
        const maxOffset = -(this.els.items.scrollWidth - this.els.items.offsetWidth);
        if (xPos < maxOffset) this.sectionNdx = this.sectionOffsets.length - 2;
        
        this.handleNextClick();
      }
      else {
        if (xPos > 0) this.sectionNdx = 1;
        
        this.handlePrevClick();
      }
    }
    
    handlePrevClick() {
      let prevNdx = this.sectionNdx - 1;
      
      if (prevNdx >= 0) {
        this.prevSectionNdx = this.sectionNdx;
        this.sectionNdx = prevNdx;
        
        this.update();
      }
    }
    
    handleSectionIndicatorClick({ target }) {
      if (target.nodeName === 'BUTTON') {
        this.prevSectionNdx = this.sectionNdx;
        this.sectionNdx = +target.dataset.ndx;
        
        this.update();
      }
    }
    
    handleSlotChange({ target: slot }) {
      switch (slot.name) {
        case 'item': this.reset(); break;
      }
    }
    
    renderNav() {
      clearTimeout(this.navDebounce);
      this.navDebounce = setTimeout(() => {
        const itemsViewWidth = this.els.items.offsetWidth;
        const itemsFullWidth = this.els.items.scrollWidth;
        const addNav = (
          (itemsFullWidth > itemsViewWidth)
          && (this.nav1 || this.nav2)
        );
        let domUpdateRequired = false;
        this.sectionsCount = 1;
        this.sectionOffsets = [0];
        
        if (
          this.nav1
          && !this.els.wrapper.classList.contains(MODIFIER__NAV1)
        ) {
          this.els.wrapper.classList.add(MODIFIER__NAV1);
          domUpdateRequired = true;
        }
        else if (
          !this.nav1
          && this.els.wrapper.classList.contains(MODIFIER__NAV1)
        ) {
          this.els.wrapper.classList.remove(MODIFIER__NAV1);
          domUpdateRequired = true;
        }
        
        if (
          this.nav2
          && !this.els.wrapper.classList.contains(MODIFIER__NAV2)
        ) {
          this.els.wrapper.classList.add(MODIFIER__NAV2);
          domUpdateRequired = true;
        }
        else if (
          !this.nav2
          && this.els.wrapper.classList.contains(MODIFIER__NAV2)
        ) {
          this.els.wrapper.classList.remove(MODIFIER__NAV2);
          domUpdateRequired = true;
        }
        
        // NOTE: Since adding or removing the nav can cause a shift in dimensions,
        // don't proceed after the update, just wait, and then try to render the
        // nav again, but with the proper dimensions.
        if (domUpdateRequired) {
          requestAnimationFrame(this.renderNav);
          return;
        }
        
        if (addNav) {
          let x = 0;
          let sectionWidth = 0;
          this.els.itemSlot.assignedNodes().forEach((item, ndx, items) => {
            const { marginLeft } = getComputedStyle(item);
            const width = item.offsetWidth + parseFloat(marginLeft);
            
            sectionWidth += width;
            
            if (sectionWidth >= itemsViewWidth) {
              this.sectionsCount += 1;
              this.sectionOffsets.push(x);
              sectionWidth = width;
            }
            
            // there's empty space in the last section so trim the last offset
            if (
              ndx === items.length - 1
              && sectionWidth < itemsViewWidth
            ) {
              const lastNdx = this.sectionOffsets.length - 1;
              const emptySpace = itemsViewWidth - sectionWidth;
              this.sectionOffsets[lastNdx] = this.sectionOffsets[lastNdx] - emptySpace;
            }
            
            x += width;
          });
          
          if (this.nav1) {
            this.els.prevBtn.disabled = this.sectionNdx === 0;
            this.els.nextBtn.disabled = this.sectionNdx === (this.sectionOffsets.length - 1);
          }
          
          if (this.nav2) {
            // only render indicators when number of sections have changed
            if (
              !this.els.sectionsNav.childNodes.length
              || (this.els.sectionsNav.childNodes.length !== this.sectionsCount)
            ) {
              this.els.sectionsNav.innerHTML = Array(this.sectionsCount).fill('').map((_, ndx) => {
                return `<button title="Section ${ndx + 1}" data-ndx="${ndx}"></button>`;
              }).join('');
            }
            
            this.els.sectionsNav.childNodes.forEach((indicator, ndx) => {
              indicator.disabled = ndx === this.sectionNdx;
            });
          }
          
          this.els.itemsContainer.addEventListener('pointerdown', this.handlePointerDown);
        }
        else {
          this.els.itemsContainer.removeEventListener('pointerdown', this.handlePointerDown);
        }
      }, 100);
    }
    
    reset() {
      this.els.items.classList.add('disable-transition');
      
      window.requestAnimationFrame(() => {
        this.prevSectionNdx = 0;
        this.sectionNdx = 0;
        this.sectionsCount = 1;
        this.viewAreaOffset = 0;
        this.els.items.style.transform = 'translateX(0px)';
        
        window.requestAnimationFrame(() => {
          this.els.items.classList.remove('disable-transition');
          
          this.renderNav();
        });
      });
    }
    
    scrollItems() {
      const newTransform = `translateX(${-this.sectionOffsets[this.sectionNdx]}px)`;
      
      if (newTransform !== this.els.items.style.transform) {
        this.els.items.addEventListener('transitionend', () => {
          const ev = (this.sectionNdx > this.prevSectionNdx)
            ? EVENT__ADVANCED
            : EVENT__REGRESSED;
          this.dispatchEvent(new CustomEvent(ev, { bubbles: true }));
        }, { once: true });
        
        this.els.items.style.transform = newTransform;
      }
    }
    
    setNav1Listeners() {
      if (this.mounted) {
        if (this.nav1) {
          this.els.nextBtn.addEventListener('click', this.handleNextClick);
          this.els.prevBtn.addEventListener('click', this.handlePrevClick);
        }
        else {
          this.els.nextBtn.removeEventListener('click', this.handleNextClick);
          this.els.prevBtn.removeEventListener('click', this.handlePrevClick);
        }
      }
    }
    
    setNav2Listeners() {
      if (this.mounted) {
        if (this.nav2) {
          this.els.sectionsNav.addEventListener('click', this.handleSectionIndicatorClick);
        }
        else {
          this.els.sectionsNav.removeEventListener('click', this.handleSectionIndicatorClick);
        }
      }
    }
    
    update() {
      this.scrollItems();
      this.renderNav();
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