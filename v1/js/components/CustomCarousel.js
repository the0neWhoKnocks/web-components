(() => {
  const CSS_VAR__CAROUSEL_ANIM_DURATION = '--carousel-anim-duration';
  const CSS_VAR__CAROUSEL_HEIGHT = '--carousel-height';
  const CSS_VAR__CAROUSEL_WIDTH = '--carousel-width';
  const CSS_VAR__COLOR__BTN__BG = '--color--btn--bg';
  const CSS_VAR__COLOR__BTN__FG = '--color--btn--fg';
  const EVENT__ADVANCED = 'carouselAdvanced';
  const EVENT__REGRESSED = 'carouselRegressed';
  const MODIFIER__NAV1 = 'has--nav1';
  const MODIFIER__NAV2 = 'has--nav2';
  const NAV2_POSITION__AFTER = 'after';
  const NAV2_POSITION__BEFORE = 'before';
  const ROOT_CLASS = 'carousel';
  
  const DEFAULT__CAROUSEL_ANIM_DURATION = '400ms';
  const DEFAULT__CAROUSEL_HEIGHT = '15em';
  const DEFAULT__CAROUSEL_WIDTH = '15em';
  const DEFAULT__COLOR__BTN__BG = '#333';
  const DEFAULT__COLOR__BTN__FG = '#eee';
  const DEFAULT__NAV2_POSITION = NAV2_POSITION__AFTER;
  
  class CustomCarousel extends HTMLElement {
    get height() {
      return this.getAttribute('height') || DEFAULT__CAROUSEL_HEIGHT;
    }
    set height(value) {
      if (!value && value !== 0) {
        this.removeAttribute('height');
        this.style.removeProperty(CSS_VAR__CAROUSEL_HEIGHT);
      }
      else {
        this.setAttribute('height', value);
        this.style.setProperty(CSS_VAR__CAROUSEL_HEIGHT, value);
      }
      
      this.reset();
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
    
    get nav2Position() {
      return this.getAttribute('nav2Position') || DEFAULT__NAV2_POSITION;
    }
    set nav2Position(value) {
      const val = ([NAV2_POSITION__AFTER, NAV2_POSITION__BEFORE].includes(value))
        ? value
        : DEFAULT__NAV2_POSITION;
      
      if (val !== this.nav2Position) {
        this.setAttribute('nav2Position', val);
        
        if (this.mounted) {
          const par = this.shadowRoot.querySelector(`.section-nav-wrapper.${val}`);
          par.appendChild(this.els.sectionsNav);
        }
      }
    }
    
    get vertical() {
      return this.hasAttribute('vertical');
    }
    set vertical(value) {
      (value === '' || value === 'true' || value === true)
        ? this.setAttribute('vertical', '')
        : this.removeAttribute('vertical');
        
      this.reset();
    }
    
    get width() {
      return this.getAttribute('width') || DEFAULT__CAROUSEL_WIDTH;
    }
    set width(value) {
      if (!value && value !== 0) {
        this.removeAttribute('width');
        this.style.removeProperty(CSS_VAR__CAROUSEL_WIDTH);
      }
      else {
        this.setAttribute('width', value);
        this.style.setProperty(CSS_VAR__CAROUSEL_WIDTH, value);
      }
      
      this.reset();
    }
    
    static get observedAttributes() {
      return [
        'height',
        'nav1',
        'nav2',
        'nav2position',
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
          case 'nav2position': { this.nav2Position = _newVal; break; }
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
            ${CSS_VAR__CAROUSEL_ANIM_DURATION}: ${DEFAULT__CAROUSEL_ANIM_DURATION};
            ${CSS_VAR__CAROUSEL_HEIGHT}: ${DEFAULT__CAROUSEL_HEIGHT};
            ${CSS_VAR__CAROUSEL_WIDTH}: ${DEFAULT__CAROUSEL_WIDTH};
            --section-nav-spacing: 0.5em;
            --section-nav-item-diameter: 1.25em;
            
            font-family: Helvetica, Arial, sans-serif;
            display: block;
          }
          
          .svg-icon {
            width: 1em;
            height: 1em;
            fill: currentColor;
          }
          
          :host(:not([vertical])[width]) .${ROOT_CLASS}-wrapper {
            width: var(${CSS_VAR__CAROUSEL_WIDTH});
          }
          :host(:not([vertical])) .${ROOT_CLASS}-wrapper {
            height: var(${CSS_VAR__CAROUSEL_HEIGHT});
          }
          :host(:not([vertical])) .${ROOT_CLASS}-wrapper.${MODIFIER__NAV2} {
            height: calc(var(${CSS_VAR__CAROUSEL_HEIGHT}) + (var(--section-nav-item-diameter) + var(--section-nav-spacing)));
          }
          :host([vertical][height]) .${ROOT_CLASS}-wrapper {
            height: var(${CSS_VAR__CAROUSEL_HEIGHT});
          }
          :host([vertical]) .${ROOT_CLASS}-wrapper {
            width: var(${CSS_VAR__CAROUSEL_WIDTH});
            display: flex;
          }
          :host([vertical]) .${ROOT_CLASS}-wrapper.${MODIFIER__NAV2} {
            width: calc(var(${CSS_VAR__CAROUSEL_WIDTH}) + (var(--section-nav-item-diameter) + var(--section-nav-spacing)));
          }
          
          .${ROOT_CLASS} {
            display: flex;
          }
          :host(:not([vertical])) .${ROOT_CLASS} {
            height: var(${CSS_VAR__CAROUSEL_HEIGHT});
          }
          :host([vertical]) .${ROOT_CLASS} {
            width: var(${CSS_VAR__CAROUSEL_WIDTH});
            flex-direction: column;
          }
          
          .${ROOT_CLASS}__items-container {
            overflow: hidden;
            white-space: nowrap;
          }
          :host(:not([nav1]):not([nav2])) .${ROOT_CLASS}__items-container {
            overflow: auto;
          }
          :host(:not([vertical])) .${ROOT_CLASS}__items-container {
            width: 100%;
          }
          :host([vertical]) .${ROOT_CLASS}__items-container {
            height: 100%;
          }
          
          .${ROOT_CLASS}__items {
            transition: transform var(${CSS_VAR__CAROUSEL_ANIM_DURATION});
            touch-action: none;
          }
          .${ROOT_CLASS}__items.disable-transition {
            transition: none;
          }
          :host(:not([vertical])) .${ROOT_CLASS}__items {
            transform: translateX(0px);
          }
          :host([vertical]) .${ROOT_CLASS}__items {
            transform: translateY(0px);
            display: flex;
            flex-direction: column;
          }
          
          .${ROOT_CLASS}__ui-btn {
            color: var(${CSS_VAR__COLOR__BTN__FG});
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
          :host(:not([vertical])) .${ROOT_CLASS}__ui-btn {
            width: 3em;
          }
          :host(:not([vertical])) .${ROOT_CLASS}__ui-btn.is--prev .svg-icon {
            transform: rotate(270deg);
          }
          :host(:not([vertical])) .${ROOT_CLASS}__ui-btn.is--next .svg-icon {
            transform: rotate(90deg);
          }
          :host([vertical]) .${ROOT_CLASS}__ui-btn {
            height: 3em;
            flex-shrink: 0;
          }
          :host([vertical]) .${ROOT_CLASS}__ui-btn.is--next .svg-icon {
            transform: rotate(180deg);
          }
          
          .section-nav-wrapper {
            display: contents;
          }
          
          .${ROOT_CLASS}-sections-nav {
            display: none;
          }
          :host(:not([vertical])) .${ROOT_CLASS}-wrapper.${MODIFIER__NAV2} .${ROOT_CLASS}-sections-nav {
            text-align: center;
            display: block;
          }
          :host(:not([vertical]):not([nav2position="before"])) .${ROOT_CLASS}-wrapper.${MODIFIER__NAV2} .${ROOT_CLASS}-sections-nav {
            margin-top: var(--section-nav-spacing);
          }
          :host(:not([vertical])[nav2position="before"]) .${ROOT_CLASS}-wrapper.${MODIFIER__NAV2} .${ROOT_CLASS}-sections-nav {
            margin-bottom: var(--section-nav-spacing);
          }
          :host([vertical]) .${ROOT_CLASS}-wrapper.${MODIFIER__NAV2} .${ROOT_CLASS}-sections-nav {
            display: inline-flex;
            flex-direction: column;
            justify-content: center;
          }
          :host([vertical]:not([nav2position="before"])) .${ROOT_CLASS}-wrapper.${MODIFIER__NAV2} .${ROOT_CLASS}-sections-nav {
            margin-left: var(--section-nav-spacing);
          }
          :host([vertical][nav2position="before"]) .${ROOT_CLASS}-wrapper.${MODIFIER__NAV2} .${ROOT_CLASS}-sections-nav {
            margin-right: var(--section-nav-spacing);
          }
          
          .${ROOT_CLASS}-sections-nav button {
            width: var(--section-nav-item-diameter);
            height: var(--section-nav-item-diameter);
            border: solid 1px var(${CSS_VAR__COLOR__BTN__BG});
            border-radius: 100%;
            background: var(${CSS_VAR__COLOR__BTN__FG});
            opacity: 0.25;
          }
          .${ROOT_CLASS}-sections-nav button:disabled {
            opacity: 1;
          }
          .${ROOT_CLASS}-sections-nav button:not(:disabled) {
            cursor: pointer;
          }
          :host(:not([vertical])) .${ROOT_CLASS}-sections-nav button:not(:first-of-type) {
            margin-left: 0.25em;
          }
          :host([vertical]) .${ROOT_CLASS}-sections-nav button:not(:first-of-type) {
            margin-top: 0.25em;
          }
        </style>
        
        <svg style="display:none; position:absolute" width="0" height="0">
          <symbol viewBox="0 0 20 10" id="arrow" xmlns="http://www.w3.org/2000/svg">
            <polygon
              points="10,0 20,10 0,10 10,0"
              fill="currentColor"
              stroke="none"
            />
          </symbol>
        </svg>
        
        <div class="${ROOT_CLASS}-wrapper">
          <div class="section-nav-wrapper ${NAV2_POSITION__BEFORE}"></div>
          <div class="${ROOT_CLASS}">
            <button type="button" class="${ROOT_CLASS}__ui-btn is--prev" disabled>
              <svg class="svg-icon">
                <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#arrow"></use>
              </svg>
            </button>
            <div class="${ROOT_CLASS}__items-container">
              <div class="${ROOT_CLASS}__items">
                <slot name="item"></slot>
              </div>
            </div>
            <button type="button" class="${ROOT_CLASS}__ui-btn is--next" disabled>
              <svg class="svg-icon">
                <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#arrow"></use>
              </svg>
            </button>
          </div>
          <div class="section-nav-wrapper ${NAV2_POSITION__AFTER}">
            <nav class="${ROOT_CLASS}-sections-nav"></nav>
          </div>
        </div>
      `;
      
      this.els = {
        carousel: shadowRoot.querySelector(`.${ROOT_CLASS}`),
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
      this.handleTransitionEnd = this.handleTransitionEnd.bind(this);
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
    
    getSizes() {
      return {
        itemsViewSize: this.vertical
          ? this.els.itemsContainer.offsetHeight
          : this.els.items.offsetWidth,
        itemsFullSize: this.vertical
          ? this.els.itemsContainer.scrollHeight
          : this.els.items.scrollWidth,
      };
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
      const [, currTransform] = this.els.items.style.transform.match(/([-.\d]+)px/) || [0, 0];
      this.startPos = (this.vertical) ? ev.y : ev.x;
      this.startTransform = +currTransform;
      window.addEventListener('pointermove', this.handlePointerMove);
      window.addEventListener('pointerup', this.handlePointerUp);
    }
    
    handlePointerMove(ev) {
      const pos = this.vertical ? ev.y : ev.x;
      const translate = this.vertical ? 'translateY' : 'translateX';
      const diff = pos - this.startPos;
      this.els.items.style.transform = `${translate}(${ this.startTransform + diff }px)`;
      this.endPos = pos;
    }
    
    handlePointerUp() {
      window.removeEventListener('pointermove', this.handlePointerMove);
      window.removeEventListener('pointerup', this.handlePointerUp);
      this.els.items.classList.remove('disable-transition');
      
      const [, currTransform] = this.els.items.style.transform.match(/([-.\d]+)px/) || [0, 0];
      const pos = +currTransform;
      
      if (this.endPos !== undefined && this.endPos !== this.startPos) {
        this.wasDragging = true;
        
        // based on drag direction, scroll to next or prev
        if (this.endPos < this.startPos) {
          const { itemsFullSize, itemsViewSize } = this.getSizes();
          const maxOffset = -(itemsFullSize - itemsViewSize);
          
          if (pos < maxOffset) this.sectionNdx = this.sectionsCount - 2;
          
          this.handleNextClick();
        }
        else {
          if (pos > 0) this.sectionNdx = 1;
          
          this.handlePrevClick();
        }
        
        requestAnimationFrame(() => {
          delete this.endPos;
          delete this.startPos;
          delete this.wasDragging;
        });
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
    
    handleTransitionEnd() {
      const ev = (this.sectionNdx > this.prevSectionNdx)
        ? EVENT__ADVANCED
        : EVENT__REGRESSED;
      this.dispatchEvent(new CustomEvent(ev, {
        bubbles: true,
        detail: {
          sectionNumber: this.sectionNdx + 1,
          totalSections: this.sectionsCount,
        },
      }));
    }
    
    renderNav() {
      clearTimeout(this.navDebounce);
      this.navDebounce = setTimeout(() => {
        const { itemsFullSize, itemsViewSize } = this.getSizes();
        const addNav = (
          (itemsFullSize > itemsViewSize)
          && (this.nav1 || this.nav2)
        );
        let domUpdateRequired = false;
        this.sectionsCount = 1;
        this.sectionOffsets = [0];
        
        if (
          addNav
          && this.nav1
          && !this.els.wrapper.classList.contains(MODIFIER__NAV1)
        ) {
          this.els.wrapper.classList.add(MODIFIER__NAV1);
          domUpdateRequired = true;
        }
        else if (
          !addNav
          || (
            !this.nav1
            && this.els.wrapper.classList.contains(MODIFIER__NAV1)
          )
        ) {
          this.els.wrapper.classList.remove(MODIFIER__NAV1);
          domUpdateRequired = true;
        }
        
        if (
          addNav
          && this.nav2
          && !this.els.wrapper.classList.contains(MODIFIER__NAV2)
        ) {
          this.els.wrapper.classList.add(MODIFIER__NAV2);
          domUpdateRequired = true;
        }
        else if (
          !addNav
          || (
            !this.nav2
            && this.els.wrapper.classList.contains(MODIFIER__NAV2)
          )
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
          let offset = 0;
          let sectionSize = 0;
          this.els.itemSlot.assignedNodes().forEach((item, ndx, items) => {
            const { marginLeft, marginTop } = getComputedStyle(item);
            const currSize = this.vertical
              ? item.offsetHeight + parseFloat(marginTop)
              : item.offsetWidth + parseFloat(marginLeft);
            
            sectionSize += currSize;
            
            if (sectionSize > itemsViewSize) {
              this.sectionsCount += 1;
              this.sectionOffsets.push(offset);
              sectionSize = currSize;
            }
            
            // there's empty space in the last section so trim the last offset
            if (
              ndx === items.length - 1
              && sectionSize < itemsViewSize
            ) {
              const lastNdx = this.sectionsCount - 1;
              const emptySpace = itemsViewSize - sectionSize;
              this.sectionOffsets[lastNdx] = this.sectionOffsets[lastNdx] - emptySpace;
            }
            
            offset += currSize;
          });
          
          if (this.nav1) {
            this.els.prevBtn.disabled = this.sectionNdx === 0;
            this.els.nextBtn.disabled = this.sectionNdx === (this.sectionsCount - 1);
          }
          
          if (this.nav2) {
            // only render indicators when number of sections have changed
            if (
              !this.els.sectionsNav.childElementCount
              || (this.els.sectionsNav.childElementCount !== this.sectionsCount)
            ) {
              this.els.sectionsNav.innerHTML = Array(this.sectionsCount).fill('').map((_, ndx) => {
                return `<button title="Section ${ndx + 1}" data-ndx="${ndx}"></button>`;
              }).join('');
            }
            
            [...this.els.sectionsNav.children].forEach((indicator, ndx) => {
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
      const translate = this.vertical ? 'translateY' : 'translateX';
      const newTransform = `${translate}(${-this.sectionOffsets[this.sectionNdx]}px)`;
      
      if (newTransform !== this.els.items.style.transform) {
        this.els.items.addEventListener('transitionend', this.handleTransitionEnd, { once: true });
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