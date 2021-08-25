(() => {
  const CSS_VAR__COLOR__HOVER = '--color--hover';
  const CSS_VAR__COLOR__TEXT = '--color--text';
  const CSS_VAR__FILE__COLOR__FILL = '--file--color--fill';
  const CSS_VAR__FILE__COLOR__STROKE = '--file--color--stroke';
  const CSS_VAR__FOLDER__COLOR__FILL = '--folder--color--fill';
  const CSS_VAR__FOLDER__COLOR__STROKE = '--folder--color--stroke';
  const DEFAULT__COLOR__HOVER = 'green';
  const DEFAULT__COLOR__TEXT = '#000';
  const DEFAULT__FILE__COLOR__FILL = '#fff';
  const DEFAULT__FILE__COLOR__STROKE = '#000';
  const DEFAULT__FOLDER__COLOR__FILL = 'yellow';
  const DEFAULT__FOLDER__COLOR__STROKE = '#000';
  const EVENT__FILE_CLICK = 'fileClick';
  const ICON_DIAMETER = 20;
  const ICON_STROKE_WIDTH = 1;
  const ROOT_CLASS = 'directory-listing';
  
  const plotPoints = (points) => {
    return points.split(' ').map((coords) => {
      const offset = ICON_STROKE_WIDTH / 2;
      const radius = ICON_DIAMETER / 2;
      const [x, y] = coords.split(',');
      let _x = +x;
      let _y = +y;
      
      if (_x < radius) _x += offset;
      else if (_x > radius) _x -= offset;
      
      if (_y < radius) _y += offset;
      else if (_y > radius) _y -= offset;
      
      return `${_x},${_y}`;
    }).join(' ');
  };
  const POINTS__FILE = plotPoints('2,0 13,0 18,5 18,20 2,20, 2,0');
  const POINTS__FILE_BEND = plotPoints('13,0 18,5 13,5 13,0');
  const POINTS__FOLDER = plotPoints('0,5 1,5 2,2 10,2 12,5 20,5 20,18 0,18 0,5');
  
  class CustomDirectoryListing extends HTMLElement {
    set customStyles(styles) {
      this.els.customStyles.textContent = styles;
    }
    
    get expanded() {
      return this.hasAttribute('expanded');
    }
    set expanded(value) {
      (value === '' || value === 'true' || value === true)
        ? this.setAttribute('expanded', '')
        : this.removeAttribute('expanded');
    }
    
    get listData() {
      let data = this.getAttribute('listData');
      data = (data) ? JSON.parse(data) : [];
      return data;
    }
    set listData(value) {
      const _val = (typeof value === 'string') ? JSON.parse(value) : value;
      this.setAttribute('listData', JSON.stringify(_val));
      this.render();
    }
    
    static get observedAttributes() {
      return [
        'customstyles',
        'expanded',
        'listdata',
      ];
    }
    
    static get events() {
      return {
        fileClick: EVENT__FILE_CLICK,
      };
    }
    
    attributeChangedCallback(attr, oldVal, newVal) {
      const empty = oldVal === '' && (newVal === null || newVal === undefined);
      
      if (!empty && oldVal !== newVal) {
        let _newVal = newVal;
        
        switch (attr) {
          case 'customstyles': { this.customStyles = _newVal; break; }
          case 'listdata': { this.listData = _newVal; break; }
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
            ${CSS_VAR__COLOR__HOVER}: ${DEFAULT__COLOR__HOVER};
            ${CSS_VAR__COLOR__TEXT}: ${DEFAULT__COLOR__TEXT};
            ${CSS_VAR__FILE__COLOR__FILL}: ${DEFAULT__FILE__COLOR__FILL};
            ${CSS_VAR__FILE__COLOR__STROKE}: ${DEFAULT__FILE__COLOR__STROKE};
            ${CSS_VAR__FOLDER__COLOR__FILL}: ${DEFAULT__FOLDER__COLOR__FILL};
            ${CSS_VAR__FOLDER__COLOR__STROKE}: ${DEFAULT__FOLDER__COLOR__STROKE};
            
            font-family: Helvetica, Arial, sans-serif;
          }
          
          :host,
          a, a:visited {
            color: var(${CSS_VAR__COLOR__TEXT});
          }
          
          slot {
            display: none;
          }
          
          ul {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          
          .${ROOT_CLASS} {
            overflow: auto;
            padding: 0.5em 0.5em 0.5em 1.25em;
            flex-shrink: 0;
          }
          
          .folder {
            display: block;
            user-select: none;
            position: relative;
          }
          .folder[open]:not([empty])::after {
            content: '';
            width: 2em;
            color: #b3b3b3;
            border-style: dashed;
            border-width: 1px;
            border-right: none;
            border-top: none;
            position: absolute;
            top: 1.25em;
            bottom: 0;
            left: 0.25em;
            pointer-events: none;
          }
          
          .folder__name {
            display: flex;
            align-items: center;
            position: relative;
          }
          .folder:not([empty]) > .folder__name {
            cursor: pointer;
          }
          
          .folder__name .indicator,
          .folder__name .icon {
            display: inline-block;
          }
          
          .folder__name .indicator {
            width: 1em;
            height: 1em;
            display: flex;
            justify-content: center;
            align-items: center;
            position: absolute;
            top: 50%;
            right: 100%;
            transform: translateY(-50%);
          }
          .folder__name .indicator::before {
            content: '+';
          }
          .folder[open] > .folder__name .indicator::before {
            content: '-';
          }
          
          svg.icon {
            width: 1em;
            height: 1em;
            pointer-events: none;
          }
          
          .folder__name .icon {
            margin-right: 0.25em;
          }
          
          .folder__items {
            margin-left: 1.3em;
            display: none;
            user-select: none;
            position: relative;
          }
          .folder[open] > .folder__items {
            padding-bottom: 0.25em;
            margin-bottom: 0.25em;
            display: block;
          }
          
          .file {
            min-width: 100%;
            user-select: none;
            white-space: nowrap;
            display: flex;
            align-items: center;
            position: relative;
          }
          
          .file .icon {
            margin-right: 0.25em;
            display: inline-block;
          }
          
          .folder[open]:not([empty]):hover::after,
          .folder[open]:not([empty]):hover > .folder__name,
          a.file:hover {
            color: var(${CSS_VAR__COLOR__HOVER});
            text-shadow: 1px 0px 0px var(${CSS_VAR__COLOR__HOVER});
          }
        </style>
        <style id="customStyles"></style>
        
        <slot></slot>
        <svg style="display:none; position:absolute" width="0" height="0">
          <symbol viewBox="0 0 ${ICON_DIAMETER} ${ICON_DIAMETER}" id="folder" xmlns="http://www.w3.org/2000/svg">
            <polyline
              points="${POINTS__FOLDER}"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="${ICON_STROKE_WIDTH}"
              style="
                fill: var(${CSS_VAR__FOLDER__COLOR__FILL});
                stroke: var(${CSS_VAR__FOLDER__COLOR__STROKE});
              "
            />
          </symbol>
          <symbol viewBox="0 0 ${ICON_DIAMETER} ${ICON_DIAMETER}" id="file" xmlns="http://www.w3.org/2000/svg">
            <polyline
              points="${POINTS__FILE}"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="${ICON_STROKE_WIDTH}"
              style="
                fill: var(${CSS_VAR__FILE__COLOR__FILL});
                stroke: var(${CSS_VAR__FILE__COLOR__STROKE});
              "
            />
            <polyline
              points="${POINTS__FILE_BEND}"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="${ICON_STROKE_WIDTH}"
              style="
                fill: #fff;
                stroke: var(${CSS_VAR__FILE__COLOR__STROKE});
              "
            />
          </symbol>
        </svg>
        <div class="${ROOT_CLASS}"></div>
      `;
      
      this.els = {
        customStyles: shadowRoot.getElementById('customStyles'),
        root: shadowRoot.querySelector(`.${ROOT_CLASS}`),
      };
    }
    
    connectedCallback() {
      this.shadowRoot.addEventListener('click', (ev) => {
        const { duplicate, target } = ev;
        
        if (!duplicate) {
          if (target.classList.contains('folder__name')) {
            const folder = target.closest('.folder');
            if (!folder.hasAttribute('empty')) {
              if (folder.hasAttribute('open')) folder.removeAttribute('open');
              else folder.setAttribute('open', '');
            }
          }
          else if (target.classList.contains('file')) {
            ev.preventDefault();
            
            const custEv = new CustomEvent(EVENT__FILE_CLICK, {
              bubbles: true,
              detail: { ...target.dataset },
            });
            let defaultPrevented;
            custEv.preventDefault = () => { defaultPrevented = true; };
            
            this.dispatchEvent(custEv);
            
            if (!defaultPrevented) {
              const origEv = new ev.constructor(ev.type, ev);
              origEv.duplicate = true;
              target.dispatchEvent(origEv);
            }
          }
        }
      });
      
      this.shadowRoot.addEventListener('slotchange', ({ target: slot }) => {
        const data = [];
        
        slot.assignedNodes().map((n) => {
          const txt = n.textContent;
          
          // only try to parse if there's actual data
          if (txt.trim()) {
            const indents = [];
            let rootIndent;
            const parsedLines = txt.split('\n').filter(l => !!l).reduce((arr, line, ndx) => {
              // remove extra leading space (added by DOM) to simplify things
              if (ndx === 0) {
                rootIndent = this.getIndent(line);
                rootIndent = new RegExp(`^${rootIndent}`);
              }
              
              const _line = line.replace(rootIndent, '');
              if (_line.trim()) {
                arr.push(_line);
                
                const lineIndent = this.getIndent(_line).length;
                if (!indents.includes(lineIndent)) indents.push(lineIndent);
              }
              
              return arr;
            }, []);
            const indentSize = indents.reduce((_, currNum, ndx, arr) => {
              const prevNum = arr[ndx - 1];
              return prevNum ? currNum - prevNum : 0;
            }, 0);
            
            const levelRefs = [];
            parsedLines.forEach((line) => {
              const level = this.getIndent(line).length / indentSize || 0;
              const trimmedLine = line.trim();
              
              if (trimmedLine.startsWith('/')) {
                const folderName = trimmedLine.replace('/', '');
                const group = [];
                
                if (level === 0) data.push([folderName, group]);
                else levelRefs[level - 1].push([folderName, group]);
                
                levelRefs[level] = group;
              }
              else if (trimmedLine.startsWith('- ')) {
                const fileName = trimmedLine.replace('- ', '');
                const [, name, link] = (fileName.match(/\[(.*)\]\((.*)\)/) || ['', fileName]);
                const file = { link, name };
                
                if (level === 0) data.push(file);
                else levelRefs[level - 1].push(file);
              }
            });
            
            // console.log(JSON.stringify(data).replace(/"/g, '&quot;'));
          }
        });
        
        if (data.length) this.listData = data;
      });
    }
    
    getIndent(line) {
      return (line.match(/^\s+/) || [])[0] || '';
    }
    
    iterateGroup(group, groupPath = '') {
      return group.map((item) => {
        if (Array.isArray(item)) {
          const [folderName, subGroup] = item;
          const hasItems = !!subGroup.length;
          const open = this.expanded && hasItems ? 'open' : '';
          let indicator = '';
          let items = '';
          let empty = 'empty';
          
          if (hasItems) {
            empty = '';
            indicator = '<span class="indicator"></span>';
            items = `
              <div class="folder__items">
                ${this.iterateGroup(subGroup, `${groupPath}/${folderName}`)}
              </div>
            `;
          }
          
          return `
            <div class="folder" ${open} ${empty}>
              <div class="folder__name">
                ${indicator}
                <svg class="icon">
                  <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#folder"></use>
                </svg>
                ${folderName || '/'}
              </div>
              ${items}
            </div>
          `;
        }
        else {
          const { link, name } = item;
          const nameWithIcon = `
            <svg class="icon">
              <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#file"></use>
            </svg>${name}
          `;
          const [, ext] = name.match(/\.(.*)$/) || ['', ''];
          const dataAttrs = [
            `data-ext="${ext}"`,
            `data-path="${groupPath}/${name}"`,
          ].join(' ');
          let fileMarkup = `<div class="file" ${dataAttrs}>${nameWithIcon}</div>`;
          
          if (link) {
            fileMarkup = `
              <a
                class="file"
                href="${link}"
                ${dataAttrs}
              >${nameWithIcon}</a>
            `;
          }
          
          return fileMarkup;
        }
      }).join('');
    }
    
    render() {
      const data = this.listData;
      this.els.root.innerHTML = this.iterateGroup(data);
    }
  }

  const EL_NAME = 'custom-directory-listing';
  if (window.customElements.get(EL_NAME)) {
    console.warn(`${EL_NAME} already defined`);
  }
  else {
    window.customElements.define(EL_NAME, CustomDirectoryListing);
    window.CustomDirectoryListing = CustomDirectoryListing;
  }
})();