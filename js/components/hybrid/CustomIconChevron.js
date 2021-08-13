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
        this._direction = value;
        this.setAttribute('direction', value);
        this.render();
      }
    }
    
    get fit() {
      return this.hasAttribute('fit');
    }
    set fit(value) {
      (value === '' || value === 'true' || value === true)
        ? this.setAttribute('fit', '')
        : this.removeAttribute('fit');
      this.render();
    }
    
    get length() {
      return this._length;
    }
    set length(value) {
      const val = +value;
      const MIN_VAL = 0.5;
      const MAX_VAL = 1;
      this._length = (val < MIN_VAL)
        ? MIN_VAL
        : (val > MAX_VAL) ? MAX_VAL : val;
      this.setAttribute('length', this._length);
      this.render();
    }
    
    get strokeColor() {
      return this._strokeWidth;
    }
    set strokeColor(value) {
      this._strokeColor = value;
      this.setAttribute('strokeColor', value);
      this.render();
    }
    
    get strokeWidth() {
      return this._strokeWidth;
    }
    set strokeWidth(value) {
      this._strokeWidth = +value;
      this.setAttribute('strokeWidth', this._strokeWidth);
      this.render();
    }
    
    static get observedAttributes() {
      return ['direction', 'fit', 'length', 'scale', 'strokecolor', 'strokewidth'];
    }
    
    attributeChangedCallback(attr, oldVal, newVal) {
      if (oldVal !== newVal) {
        switch (attr) {
          case 'direction': { this.direction = newVal; break; }
          case 'fit': { this.fit = newVal; break; }
          case 'length': { this.length = newVal; break; }
          case 'scale': { this.scale = newVal; break; }
          case 'strokecolor': { this.strokeColor = newVal; break; }
          case 'strokewidth': { this.strokeWidth = newVal; break; }
        }
      }
    }
    
    constructor() {
      super();
      
      this.attachShadow({ mode: 'open' });
      
      const { shadowRoot } = this;
      this.ROOT_CLASS = 'custom-icon';
      this._direction = DIR__DOWN;
      this._length = 0.5;
      this._strokeColor = '#333';
      this._strokeWidth = 2;
      this._animDuration = '300ms';
      
      shadowRoot.innerHTML = `
        <style>
          :host {
            width: 1em;
            height: 1em;
            display: inline-block;
          }
          
          svg {
            width: 100%;
            height: 100%;
          }
        </style>
        
        <svg xmlns="http://www.w3.org/2000/svg">
          <polyline fill="none" stroke-linecap="round" stroke-linejoin="round">
            <animate
              id="animForward"
              attributeName="points"
              dur="${this._animDuration}"
              begin="indefinite"
              fill="freeze"
            />
            <animate
              id="animReverse"
              attributeName="points"
              dur="${this._animDuration}"
              begin="indefinite"
              fill="freeze"
            />
          </polyline>
        </svg>
      `;
      
      this.els = {
        animForward: shadowRoot.getElementById('animForward'),
        animReverse: shadowRoot.getElementById('animReverse'),
        polyline: shadowRoot.querySelector('polyline'),
        svg: shadowRoot.querySelector('svg'),
      };
      
      this.render();
    }
    
    render() {
      const DEFAULT_SIZE = 16;
      const offset = this._strokeWidth / 2;
      const fraction = 6;
      const factor = this.fit ? (fraction * 2) : fraction;
      const lengthPadding = (Math.round(DEFAULT_SIZE / fraction) * (this._strokeWidth / factor)) + this._length;
      
      if (this.fit) this.style.width = `${this._length}em`;
      
      switch (this._direction) {
        case DIR__DOWN:
        case DIR__UP: {
          this._width = DEFAULT_SIZE;
          this._height = (this._width * this._length) + lengthPadding;
          break;
        }
        default: {
          this._height = DEFAULT_SIZE;
          this._width = (this._height * this._length) + lengthPadding;
        }
      }
      
      const pointsMap = {
        down: `${offset},${offset} ${this._width / 2},${this._height - offset} ${this._width - offset},${offset}`,
        left: `${this._width - offset},${offset} ${offset},${this._height / 2} ${this._width - offset},${this._height - offset}`,
        right: `${offset},${offset} ${this._width - offset},${this._height / 2} ${offset},${this._height - offset}`,
        up: `${offset},${this._height - offset} ${this._width / 2},${offset} ${this._width - offset},${this._height - offset}`,
      };
      
      let fromPoints;
      let toPoints;
      switch (this._direction) {
        case DIR__DOWN: {
          fromPoints = pointsMap.down;
          toPoints = pointsMap.up;
          break;
        }
        case DIR__LEFT: {
          fromPoints = pointsMap.left;
          toPoints = pointsMap.right;
          break;
        }
        case DIR__RIGHT: {
          fromPoints = pointsMap.right;
          toPoints = pointsMap.left;
          break;
        }
        case DIR__UP: {
          fromPoints = pointsMap.up;
          toPoints = pointsMap.down;
          break;
        }
      }
      
      this.els.svg.setAttribute('viewBox', `0 0 ${this._width} ${this._height}`);
      this.els.polyline.setAttribute('points', fromPoints);
      this.els.animForward.setAttribute('to', toPoints);
      this.els.animReverse.setAttribute('to', fromPoints);
      this.els.polyline.setAttribute('stroke', this._strokeColor);
      this.els.polyline.setAttribute('stroke-width', this._strokeWidth);
      
      // NOTE: Without this, the last animation state is cached, so if the point
      // values are updated due to dimension changes, and the below isn't run,
      // the User could see a clipped render.
      if (this.animatedForward) this.els.animForward.beginElementAt(300);
      else this.els.animReverse.beginElementAt(300);
    }
    
    toggle() {
      if (this.animatedForward) {
        this.els.animReverse.beginElement();
        this.animatedForward = false;
      }
      else {
        this.els.animForward.beginElement();
        this.animatedForward = true;
      }
    }
  }

  window.customElements.define('custom-icon-chevron', IconChevron);
})();
