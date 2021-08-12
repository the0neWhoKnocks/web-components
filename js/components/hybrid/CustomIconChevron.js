(() => {
  const LAYOUT__HORIZONTAL = 'horizontal';
  const LAYOUT__VERTICAL = 'vertical';
  const DIR__DOWN = 'down';
  const DIR__LEFT = 'left';
  const DIR__RIGHT = 'right';
  const DIR__UP = 'up';
  
  class IconChevron extends HTMLElement {
    get direction() {
      return this._direction;
    }
    set direction(value) {
      if ([DIR__DOWN, DIR__LEFT, DIR__RIGHT, DIR__UP].includes(value)) {
        this.els.root.classList.remove(this._direction);
        this._direction = value;
        this.setAttribute('direction', value);
        this.els.root.classList.add(this._direction);
      }
    }
    
    get strokeColor() {
      return this._strokeWidth;
    }
    set strokeColor(value) {
      this.style.setProperty(this._styleProps.strokeColor, value);
      this._strokeColor = value;
    }
    
    get strokeWidth() {
      return this._strokeWidth;
    }
    set strokeWidth(value) {
      this.style.setProperty(this._styleProps.strokeWidth, value);
      this._strokeWidth = value;
    }
    
    static get observedAttributes() {
      return ['direction', 'strokecolor', 'strokewidth'];
    }
    
    attributeChangedCallback(attr, oldVal, newVal) {
      if (oldVal !== newVal) {
        switch (attr) {
          case 'direction': {
            this.direction = newVal;
            break;
          }
    
          case 'strokecolor': {
            this.strokeColor = newVal;
            break;
          }
    
          case 'strokewidth': {
            this.strokeWidth = newVal;
            break;
          }
        }
      }
    }
    
    constructor() {
      super();
      
      this.attachShadow({ mode: 'open' });
      
      const { shadowRoot } = this;
      this.ROOT_CLASS = 'custom-icon';
      this._direction = DIR__DOWN;
      this._strokeColor = '#333';
      this._strokeWidth = 0.2;
      this._styleProps = {
        strokeColor: '--stroke-color',
        strokeWidth: '--stroke-width',
      };
      
      shadowRoot.innerHTML = `
        <style>
          *, *::after, *::before {
            box-sizing: border-box;
          }
          
          :host {
            ${this._styleProps.strokeColor}: ${this._strokeColor};
            ${this._styleProps.strokeWidth}: ${this._strokeWidth};
            
            font-family: Helvetica, Arial, sans-serif;
          }
          
          .${this.ROOT_CLASS} {
            width: 1em;
            height: 1em;
            display: inline-block;
            vertical-align: top;
            position: relative;
          }
          
          .chevron::after,
          .chevron::before {
            content: '';
            border-radius: calc((var(${this._styleProps.strokeWidth}) * 1em) / 2);
            background: var(${this._styleProps.strokeColor});
            display: block;
            position: absolute;
            transition: transform 200ms;
          }
          
          .chevron.${DIR__DOWN}::before,
          .chevron.${DIR__DOWN}::after,
          .chevron.${DIR__UP}::before,
          .chevron.${DIR__UP}::after {
            width: calc(55% + (var(${this._styleProps.strokeWidth}) * 0.5em));
            height: calc(var(${this._styleProps.strokeWidth}) * 1em);
            top: 50%;
          }
          .chevron.${DIR__DOWN}::before,
          .chevron.${DIR__UP}::before {
            left: 0;
          }
          .chevron.${DIR__DOWN}::after,
          .chevron.${DIR__UP}::after {
            right: 0;
          }
          .chevron.${DIR__DOWN}::before {
            transform: translateY(-50%) rotate(45deg);
          }
          .chevron.${DIR__DOWN}::after {
            transform: translateY(-50%) rotate(-45deg);
          }
          .chevron.${DIR__UP}::before {
            transform: translateY(-50%) rotate(-45deg);
          }
          .chevron.${DIR__UP}::after {
            transform: translateY(-50%) rotate(45deg);
          }
          
          .chevron.${DIR__LEFT}::before,
          .chevron.${DIR__LEFT}::after,
          .chevron.${DIR__RIGHT}::before,
          .chevron.${DIR__RIGHT}::after {
            width: calc(var(${this._styleProps.strokeWidth}) * 1em);
            height: calc(55% + (var(${this._styleProps.strokeWidth}) * 0.5em));
            left: 50%;
          }
          .chevron.${DIR__LEFT}::before,
          .chevron.${DIR__RIGHT}::before {
            top: 0;
          }
          .chevron.${DIR__LEFT}::after,
          .chevron.${DIR__RIGHT}::after {
            bottom: 0;
          }
          .chevron.${DIR__LEFT}::before {
            transform: translateX(-50%) rotate(45deg);
          }
          .chevron.${DIR__LEFT}::after {
            transform: translateX(-50%) rotate(-45deg);
          }
          .chevron.${DIR__RIGHT}::before {
            transform: translateX(-50%) rotate(-45deg);
          }
          .chevron.${DIR__RIGHT}::after {
            transform: translateX(-50%) rotate(45deg);
          }
        </style>
        
        <div class="${this.ROOT_CLASS} chevron ${this._direction}"></div>
      `;
      
      this.els = {
        root: shadowRoot.querySelector(`.${this.ROOT_CLASS}`),
      };
    }
  }

  window.customElements.define('custom-icon-chevron', IconChevron);
})();
