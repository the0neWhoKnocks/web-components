(() => {
  class CustomTag extends HTMLElement {
    get count() {
      return this.getAttribute('count') || '';
    }
    set count(value) {
      this.setAttribute('count', value);
    }
    
    get horizontalPadding() {
      return +(this.getAttribute('horizontalPadding') || 10);
    }
    set horizontalPadding(value) {
      this.setAttribute('horizontalPadding', value);
    }
    
    get rounded() {
      return this.hasAttribute('rounded');
    }
    set rounded(value) {
      (value === '' || value === 'true' || value === true)
        ? this.setAttribute('rounded', '')
        : this.removeAttribute('rounded');
    }
    
    get strokeWidth() {
      return +(this.getAttribute('strokeWidth') || 1);
    }
    set strokeWidth(value) {
      this.setAttribute('strokeWidth', value);
    }
    
    get text() {
      return this.getAttribute('text') || '';
    }
    set text(value) {
      this.setAttribute('text', value);
    }
    
    get verticalPadding() {
      return +(this.getAttribute('verticalPadding') || 5);
    }
    set verticalPadding(value) {
      this.setAttribute('verticalPadding', value);
    }
    
    // run logic when these DOM attributes are altered
    static get observedAttributes() {
      return [
        'count',
        'horizontalPadding',
        'rounded',
        'strokeWidth',
        'text',
        'verticalPadding',
      ];
    }
    
    // run logic when DOM attributes are altered
    attributeChangedCallback(attr, oldVal, newVal) {
      const empty = oldVal === '' && (newVal === null || newVal === undefined);
      
      if (!empty && oldVal !== newVal) {
        let _newVal = newVal;
        
        switch (attr) {
          // NOTE: Transform attribute names to camelcase variables since
          // Browsers normalize them to lowercase.
          case 'horizontalpadding': { this.horizontalPadding = _newVal; break; }
          case 'strokewidth': { this.strokeWidth = _newVal; break; }
          case 'verticalPadding': { this.verticalPadding = _newVal; break; }
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
            font-family: Helvetica, Arial, sans-serif;
          }
          
          .tag {
            height: 1.5em;
            font-size: 1.1em;
            display: inline-block;
          }
          .tag > * {
            pointer-events: none;
          }
          
          svg {
            height: 100%;
          }
          
          svg path {
            fill: var(--tag--bg-color, #eee);
            stroke: var(--tag--border-color, currentColor);
          }
          svg text {
            font-family: monospace;
            fill: var(--tag--text-color, currentColor);
          }
        </style>
      `;
    }
    
    // component has been added to the DOM
    connectedCallback() {
      const edgeSpacing = 30;
      const offset = 4; // when the text's Y is set to zero, it's not aligned to the top, so fudging the numbers with this.
      let tagWidth = 60;
      let tagHeight = 30;
      let textHeight = 0;
      let holeRadius;
      let pathPoints = [];
      let roundedPathPoints = [];
      
      const markup = () => `
        <div class="tag">
          <svg viewBox="0 0 ${tagWidth} ${tagHeight}">
            <path
              d="${this.rounded ? roundedPathPoints.join(' ') : pathPoints.join(' ')}"
              fill-rule="evenodd"
              stroke-width="${this.strokeWidth}"
            />
            <text
              x="${this.horizontalPadding}"
              y="${(textHeight + this.verticalPadding) - offset}"
              id="text"
            >${this.count}${this.text}</text>
          </svg>
        </div>
      `;
      
      // base markup has to be added to get text dimensions
      this.shadowRoot.innerHTML += markup();
      
      const { width, height } = this.shadowRoot.getElementById('text').getBBox();
      const strokeOffset = this.strokeWidth / 2;
      tagWidth = width + (this.horizontalPadding * 2) + (edgeSpacing / 1.25);
      tagHeight = height + (this.verticalPadding * 2);
      textHeight = height;
      holeRadius = tagHeight / 5;
      const holeStartX = (tagWidth - edgeSpacing) + holeRadius + (edgeSpacing/3);
      const holeStartY = (tagHeight / 2) - holeRadius;
      const cornerRadius = 5;
      
      // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d
      // ---
      // MoveTo: M, m
      // LineTo: L, l, H, h, V, v
      // Cubic Bézier Curve: C, c, S, s
      // Quadratic Bézier Curve: Q, q, T, t
      // Elliptical Arc Curve: A, a
      // ClosePath: Z, z
      // ---
      // Commands are case-sensitive. An upper-case command specifies absolute 
      // coordinates, while a lower-case command specifies coordinates relative to
      // the current position.
      
      const hole = [
        `M ${holeStartX},${holeStartY}`,
        `A ${holeRadius} ${holeRadius} 0 0 1 ${holeStartX + holeRadius} ${holeStartY + holeRadius}`, // 3
        `A ${holeRadius} ${holeRadius} 0 0 1 ${holeStartX} ${holeStartY + (holeRadius * 2)}`, // 6
        `A ${holeRadius} ${holeRadius} 0 0 1 ${holeStartX - holeRadius} ${holeStartY + holeRadius}`, // 9
        `A ${holeRadius} ${holeRadius} 0 0 1 ${holeStartX} ${holeStartY}`, // 12
        'Z',
      ];
      pathPoints = [
        // body
        `M ${strokeOffset},${strokeOffset}`, // TL
        `L ${tagWidth - (edgeSpacing / 1.5)},${strokeOffset}`, // TR
        `L ${tagWidth - strokeOffset},${tagHeight / 2}`, // CR
        `L ${tagWidth - (edgeSpacing / 1.5)},${tagHeight - strokeOffset}`, // BR
        `L ${strokeOffset},${tagHeight - strokeOffset}`, // BL
        'Z', // close
        ...hole,
      ];
      roundedPathPoints = [
        // body
        `M ${strokeOffset},${strokeOffset + cornerRadius}`, // TL
        `C ${strokeOffset},${strokeOffset} ${strokeOffset + cornerRadius},${strokeOffset} ${strokeOffset + cornerRadius},${strokeOffset}`, // TL
        `L ${(tagWidth - (edgeSpacing / 1.5)) - cornerRadius},${strokeOffset}`, // TR
        `C ${tagWidth - (edgeSpacing / 1.5) + cornerRadius},${strokeOffset} ${tagWidth - strokeOffset},${(tagHeight / 2) - cornerRadius} ${tagWidth - strokeOffset},${tagHeight / 2}`,
        `C ${tagWidth - strokeOffset},${(tagHeight / 2) + cornerRadius} ${(tagWidth - (edgeSpacing / 1.5)) + cornerRadius},${tagHeight - strokeOffset} ${tagWidth - (edgeSpacing / 1.5)},${tagHeight - strokeOffset}`, // BR
        `L ${strokeOffset + cornerRadius},${tagHeight - strokeOffset}`, // BL
        `C ${strokeOffset + cornerRadius},${tagHeight - strokeOffset} ${strokeOffset},${tagHeight - strokeOffset} ${strokeOffset},${(tagHeight - strokeOffset) - cornerRadius}`, // BL
        'Z', // close
        ...hole,
      ];
      
      const svg = this.shadowRoot.querySelector('svg');
      svg.insertAdjacentHTML('beforebegin', markup());
      svg.remove();
    }
  }

  const EL_NAME = 'custom-tag';
  if (window.customElements.get(EL_NAME)) {
    console.warn(`${EL_NAME} already defined`);
  }
  else {
    window.customElements.define(EL_NAME, CustomTag);
    window.CustomTag = CustomTag;
  }
})();
