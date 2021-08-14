(() => {
  const ANIM_DURATION = 300;
  const DEFAULT_SIZE = 16;
  const DIR__DOWN = 'down';
  const DIR__LEFT = 'left';
  const DIR__RIGHT = 'right';
  const DIR__UP = 'up';
  const KEY_TIMES = [0, 0.75, 1];
  const LAYOUT__HORIZONTAL = 'horizontal';
  const LAYOUT__VERTICAL = 'vertical';
  
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
      return this._strokeColor;
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
      return ['direction', 'fit', 'length', 'strokecolor', 'strokewidth'];
    }
    
    attributeChangedCallback(attr, oldVal, newVal) {
      if (oldVal !== newVal) {
        switch (attr) {
          case 'direction': { this.direction = newVal; break; }
          case 'fit': { this.fit = newVal; break; }
          case 'length': { this.length = newVal; break; }
          case 'strokecolor': { this.strokeColor = newVal; break; }
          case 'strokewidth': { this.strokeWidth = newVal; break; }
        }
      }
    }
    
    constructor() {
      super();
      
      this.attachShadow({ mode: 'open' });
      
      const { shadowRoot } = this;
      this._direction = DIR__DOWN;
      this._length = 0.5;
      this._strokeColor = '#333';
      this._strokeWidth = 2;
      
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
            ${Array(2).fill('').map((_, ndx) => `
              <animate
                attributeName="points"
                begin="indefinite"
                calcMode="linear"
                dur="${ANIM_DURATION / 2}ms"
                fill="freeze"
                id="animFrame${ndx + 1}"
                keyTimes="${KEY_TIMES.join(' ; ')}"
              />
            `).join('\n')}
          </polyline>
        </svg>
      `;
      
      this.els = {
        animFrame1: shadowRoot.getElementById('animFrame1'),
        animFrame2: shadowRoot.getElementById('animFrame2'),
        polyline: shadowRoot.querySelector('polyline'),
        svg: shadowRoot.querySelector('svg'),
      };
      
      this.render();
    }
    
    render() {
      const offset = this._strokeWidth;
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
        down: [
          [offset, offset],
          [this._width / 2, this._height - offset],
          [this._width - offset, offset],
        ],
        left: [
          [this._width - offset, offset],
          [offset, this._height / 2],
          [this._width - offset, this._height - offset],
        ],
        right: [
          [offset, offset],
          [this._width - offset, this._height / 2],
          [offset, this._height - offset],
        ],
        up: [
          [offset, this._height - offset],
          [this._width / 2, offset],
          [this._width - offset, this._height - offset],
        ],
      };
      
      const genPoints = (points, pointDiffs, padMultiplier) => points
        .map(([x, y], ndx) => {
          let _x = x;
          let _y = y;
          
          if (pointDiffs) {
            const offset = this._strokeWidth / 1.5;
            const xDiff = pointDiffs[ndx][0];
            const yDiff = pointDiffs[ndx][1];
            
            _x += xDiff * padMultiplier;
            _y += yDiff * padMultiplier;
            
            if (!xDiff) { // vertical
              if (ndx === 0) _x -= offset;
              else if (ndx === 2) _x += offset;
            }
            else { // horizontal
              if (ndx === 0) _y -= offset;
              else if (ndx === 2) _y += offset;
            }
          }
          
          return `${_x},${_y}`;
        })
        .join(' ');
      
      const genValues = (a, b) => {
        const frames = [];
        const pointDiffs = a.map(([aX, aY], ndx) => {
          const [bX, bY] = b[ndx];
          return [
            (bX - aX) / (KEY_TIMES.length - 1),
            (bY - aY) / (KEY_TIMES.length - 1),
          ];
        });
        
        for (let i=0; i<KEY_TIMES.length; i++) {
          if (i === 0) frames.push(genPoints(a));
          else if (i === KEY_TIMES.length - 1) frames.push(genPoints(b));
          // extend ends for middle frame
          else frames.push(genPoints(a, pointDiffs, i));
        }
        
        return frames.join(' ; ');
      };
      
      let fromPoints;
      let toPoints;
      let points;
      let forwardValues;
      let reverseValues;
      switch (this._direction) {
        case DIR__DOWN: {
          points = genPoints(pointsMap.down);
          forwardValues = genValues(pointsMap.down, pointsMap.up);
          reverseValues = genValues(pointsMap.up, pointsMap.down);
          break;
        }
        case DIR__LEFT: {
          points = genPoints(pointsMap.left);
          forwardValues = genValues(pointsMap.left, pointsMap.right);
          reverseValues = genValues(pointsMap.right, pointsMap.left);
          break;
        }
        case DIR__RIGHT: {
          points = genPoints(pointsMap.right);
          forwardValues = genValues(pointsMap.right, pointsMap.left);
          reverseValues = genValues(pointsMap.left, pointsMap.right);
          break;
        }
        case DIR__UP: {
          points = genPoints(pointsMap.up);
          forwardValues = genValues(pointsMap.up, pointsMap.down);
          reverseValues = genValues(pointsMap.down, pointsMap.up);
          break;
        }
      }
      
      this.els.svg.setAttribute('viewBox', `0 0 ${this._width} ${this._height}`);
      this.els.polyline.setAttribute('points', points);
      this.els.animFrame1.setAttribute('values', forwardValues);
      this.els.animFrame2.setAttribute('values', reverseValues);
      this.els.polyline.setAttribute('stroke', this._strokeColor);
      this.els.polyline.setAttribute('stroke-width', this._strokeWidth);
      
      // NOTE: Without this, the last animation state is cached, so if the point
      // values are updated due to dimension changes, and the below isn't run,
      // the User could see a clipped render.
      if (this.animatedForward) this.els.animFrame1.beginElementAt(ANIM_DURATION);
      else this.els.animFrame2.beginElementAt(ANIM_DURATION);
    }
    
    toggle() {
      if (this.animatedForward) {
        this.els.animFrame2.beginElement();
        this.animatedForward = false;
      }
      else {
        this.els.animFrame1.beginElement();
        this.animatedForward = true;
      }
    }
  }

  window.customElements.define('custom-icon-chevron', IconChevron);
})();
