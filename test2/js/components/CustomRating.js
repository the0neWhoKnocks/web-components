(() => {
  const CSS_VAR__COLOR__STARS__BG = '--color--stars--bg';
  const CSS_VAR__COLOR__STROKE = '--color--stroke';
  const CSS_VAR__RATING = '--rating';
  const ROOT_CLASS = 'rating';
  const STAR__OUTER_RADIUS = 30;
  
  const DEFAULT__COLOR__STARS__BG = '#cccccc';
  const DEFAULT__COLOR__STARS__FG = '#ffa600';
  const DEFAULT__COLOR__STROKE = '#000';
  const DEFAULT__GRADIENT_ANGLE = 0;
  const DEFAULT__RATING = 0;
  const DEFAULT__STAR__COUNT = 5;
  const DEFAULT__STAR__INNER_RADIUS = 0.42;
  const DEFAULT__STAR__POINTS = 5;
  const DEFAULT__STROKE_WIDTH = 0;
  
  class CustomRating extends HTMLElement {
    static get defaultBGColor() {
      return DEFAULT__COLOR__STARS__BG;
    }
    get bgColor() {
      return this.getAttribute('bgColor') || DEFAULT__COLOR__STARS__BG;
    }
    set bgColor(value) {
      this.setAttribute('bgColor', value);
      this.style.setProperty(CSS_VAR__COLOR__STARS__BG, value);
    }
    
    static get defaultFGColor() {
      return DEFAULT__COLOR__STARS__FG;
    }
    get fgColor() {
      return this.getAttribute('fgColor') || DEFAULT__COLOR__STARS__FG;
    }
    set fgColor(value) {
      this.setAttribute('fgColor', value);
      this.render();
    }
    
    static get defaultGradientAngle() {
      return DEFAULT__GRADIENT_ANGLE;
    }
    get gradientAngle() {
      return +this.getAttribute('gradientAngle') || DEFAULT__GRADIENT_ANGLE;
    }
    set gradientAngle(value) {
      const _val = +value;
      this.setAttribute('gradientAngle', _val);
      this.render();
    }
    
    get rating() {
      return +this.getAttribute('rating');
    }
    set rating(value) {
      const _val = +value;
      this.setAttribute('rating', _val);
      this.style.setProperty(CSS_VAR__RATING, _val / this.starCount);
    }
    
    static get defaultStarCount() {
      return DEFAULT__STAR__COUNT;
    }
    get starCount() {
      return +this.getAttribute('starCount') || DEFAULT__STAR__COUNT;
    }
    set starCount(value) {
      const _val = +value;
      this.setAttribute('starCount', _val);
      this.render();
    }
    
    static get defaultStarInnerRadius() {
      return DEFAULT__STAR__INNER_RADIUS;
    }
    get starInnerRadius() {
      return +(+this.getAttribute('starInnerRadius')).toFixed(2) || DEFAULT__STAR__INNER_RADIUS;
    }
    set starInnerRadius(value) {
      const _val = +(+value).toFixed(2);
      this.setAttribute('starInnerRadius', _val);
      this.render();
    }
    
    static get defaultStarPoints() {
      return DEFAULT__STAR__POINTS;
    }
    get starPoints() {
      return +this.getAttribute('starPoints') || DEFAULT__STAR__POINTS;
    }
    set starPoints(value) {
      const _val = +value;
      this.setAttribute('starPoints', _val);
      this.render();
    }
    
    static get defaultStrokeColor() {
      return DEFAULT__COLOR__STROKE;
    }
    get strokeColor() {
      return this.getAttribute('strokeColor') || DEFAULT__COLOR__STROKE;
    }
    set strokeColor(value) {
      this.setAttribute('strokeColor', value);
      this.style.setProperty(CSS_VAR__COLOR__STROKE, value);
    }
    
    static get defaultStrokeWidth() {
      return DEFAULT__STROKE_WIDTH;
    }
    get strokeWidth() {
      return +this.getAttribute('strokeWidth') || DEFAULT__STROKE_WIDTH;
    }
    set strokeWidth(value) {
      const _val = +value;
      this.setAttribute('strokeWidth', _val);
      this.render();
    }
    
    static get observedAttributes() {
      return [
        'bgcolor',
        'fgcolor',
        'gradientangle',
        'rating',
        'starcount',
        'starinnerradius',
        'starpoints',
        'strokecolor',
        'strokewidth',
      ];
    }
    
    attributeChangedCallback(attr, oldVal, newVal) {
      const empty = oldVal === '' && (newVal === null || newVal === undefined);
      
      if (!empty && oldVal !== newVal) {
        let _newVal = newVal;
        
        switch (attr) {
          case 'bgcolor': { this.bgColor = _newVal; break; }
          case 'fgcolor': { this.fgColor = _newVal; break; }
          case 'gradientangle': { this.gradientAngle = _newVal; break; }
          case 'starcount': { this.starCount = _newVal; break; }
          case 'starinnerradius': { this.starInnerRadius = _newVal; break; }
          case 'starpoints': { this.starPoints = _newVal; break; }
          case 'strokecolor': { this.strokeColor = _newVal; break; }
          case 'strokewidth': { this.strokeWidth = _newVal; break; }
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
            ${CSS_VAR__COLOR__STARS__BG}: ${DEFAULT__COLOR__STARS__BG};
            ${CSS_VAR__COLOR__STROKE}: ${DEFAULT__COLOR__STROKE};
            ${CSS_VAR__RATING}: ${DEFAULT__RATING};
            
            font-family: Helvetica, Arial, sans-serif;
          }
          
          .${ROOT_CLASS} {
            display: inline-block;
          }
          
          svg mask rect {
            transform: scaleX(var(${CSS_VAR__RATING}));
            transition: transform 300ms;
          }
        </style>
        
        <div class="${ROOT_CLASS}"></div>
      `;
      
      this.els = {
        root: shadowRoot.querySelector(`.${ROOT_CLASS}`),
      };
    }
    
    connectedCallback() {
      this.render();
    }
    
    plotStar(xOffset=0) {
      const outerOffset = (STAR__OUTER_RADIUS - this.strokeWidth) / 2;
      const innerOffset = (STAR__OUTER_RADIUS * this.starInnerRadius) / 2;
      const strokeOffset = this.strokeWidth / 2;
      let rot = Math.PI / 2 * 3;
      let x = 0;
      let y = 0;
      let step = Math.PI / this.starPoints;
      let ret = `M ${ outerOffset + xOffset + strokeOffset },${strokeOffset} L`;
  
      for (let i=0; i<this.starPoints; i++) {
        x = (((Math.cos(rot) * outerOffset) + xOffset) + outerOffset) + strokeOffset;
        y = ((Math.sin(rot) * outerOffset) + outerOffset) + strokeOffset;
        ret += ` ${x}, ${y}`;
        rot += step;
  
        x = (((Math.cos(rot) * innerOffset) + xOffset) + outerOffset) + strokeOffset;
        y = ((Math.sin(rot) * innerOffset) + outerOffset) + strokeOffset;
        ret += ` ${x}, ${y}`;
        rot += step;
      }
  
      return `${ ret } z`;
    }
    
    render() {
      const points = Array(this.starCount).fill('').map((_, ndx) => this.plotStar(ndx * STAR__OUTER_RADIUS)).join('');
      const svgWidth = STAR__OUTER_RADIUS * this.starCount;
      const svgHeight = STAR__OUTER_RADIUS;
      const maskBody = `M 0,0 L 0,0 ${svgWidth},0 ${svgWidth},${svgHeight} 0,${svgHeight} z`;
  
      let defs = '';
      let rectFill = this.fgColor;
      if (rectFill.includes('|')) {
        const colors = rectFill.split('|').map((color, ndx, arr) => {
          const perc = !ndx ? 0 : (100 / arr.length) * (ndx + 1);
          return `<stop offset="${perc}%" stop-color="${color}" />`;
        }).join('');
        defs = `
          <defs>
            <linearGradient
              id="ratingGradient"
              gradientTransform="rotate(${this.gradientAngle} 0.5 0.5)"
              x2="0%"
              y1="100%"
              y2="0%"
            >
              ${colors}
            </linearGradient>
          </defs>
        `;
        rectFill = `url(#ratingGradient)`;
      }
      
      let strokes = '';
      if (this.strokeWidth) {
        strokes = `
          <path
            id="strokes"
            d="${points}"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="${this.strokeWidth}"
            style="stroke: var(${CSS_VAR__COLOR__STROKE});"
          ></path>
        `;
      }
      
      this.els.root.innerHTML = `
        <svg
          height="1em"
          viewBox="0 0 ${svgWidth} ${svgHeight}"
          xmlns="http://www.w3.org/2000/svg"
        >
          ${defs}
  
          <mask id="ratingMask">
            <rect width="${svgWidth}" height="${svgHeight}" fill="white" />
            <path 
              fill-rule="evenodd"
              fill="black"
              d="${maskBody} ${points}"
            />
          </mask>
  
          <path
            id="bgColor"
            d="${points}"
            style="fill: var(${CSS_VAR__COLOR__STARS__BG});"
          ></path>
  
          <rect
            width="${svgWidth}"
            height="${svgHeight}"
            fill="${rectFill}"
            mask="url(#ratingMask)"
          />
  
          ${strokes}
        </svg>
      `;
    }
  }

  const EL_NAME = 'custom-rating';
  if (window.customElements.get(EL_NAME)) {
    console.warn(`${EL_NAME} already defined`);
  }
  else {
    window.customElements.define(EL_NAME, CustomRating);
    window.CustomRating = CustomRating;
  }
})();