(() => {
  // const CSS_VAR__COLOR__NAME = '--color--name';
  // const EVENT__TOGGLED = 'toggled';
  // const ROOT_CLASS = 'calendar';
  
  // const DEFAULT__COLOR__NAME = '#cccccc';
  
  
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const LAYOUT__MONTH = 'month';
  const LAYOUT__WEEK = 'week';
  const LAYOUT__DAY = 'day';
  const LAYOUT_NAV_ITEMS = [
    [LAYOUT__MONTH, 'MO'],
    [LAYOUT__WEEK, 'WK'],
    [LAYOUT__DAY, 'DY'],
  ];
  const today = new Date();
  const year = today.getFullYear();
  const yearOpts = [year - 1, year, year + 1];
  
  const pad = (num, token='00') => token.substring(0, token.length-`${num}`.length) + num;
  
  function getDaysInMonth(month, year) {
    const maxDays = 32;
    return maxDays - new Date(year, month, maxDays).getDate();
  }
  
  function getFirstDayOfMonthOffset(month, year, weekStartDay) {
    let offset = (new Date(year, month)).getDay() - DAYS.indexOf(weekStartDay);
    if (offset < 0) offset = DAYS.length + offset;
    return offset;
  }
  
  function formatMonth(month) {
    return pad(month + 1);
  }
  
  function truncateDay(day) {
    return `${day.substring(0, 3)}.`;
  }
  
  function createDays(arg, weekStartDay) {
    let arr;
    
    if (Array.isArray(arg)) {
      const days = [...arg];
      const otherDays = days.splice(0, DAYS.indexOf(weekStartDay));
      arr = [...days, ...otherDays];
    }
    else arr = [arg];
    
    return arr;
  }
  
  class CustomCalendar extends HTMLElement {
    // // prototype getter
    // static get prop1() { return prop; }
    
    // instance props
    get data() {
      return this.getAttribute('data');
    }
    set data(value) {
      let _value = value;
      
      if (typeof _value === 'object') _value = JSON.stringify(_value);
      else if (typeof _value === 'string') this.data = JSON.parse(_value);
      
      this.setAttribute('data', _value);
    }
    
    get dataComponent() {
      return this.getAttribute('dataComponent');
    }
    get layout() {
      return this.getAttribute('layout') || LAYOUT__MONTH;
    }
    get monthYearNav() {
      return this.hasAttribute('monthYearNav');
    }
    get nextPrevNav() {
      return this.hasAttribute('nextPrevNav');
    }
    get onLayoutChange() {
      return this.getAttribute('onLayoutChange');
    }
    get startWeekOn() {
      return this.getAttribute('startWeekOn') || DAYS[0];
    }
    
    // get prop2() {
    //   return this.getAttribute('prop2') || DEFAULT__VAL;
    // }
    // set prop2(value) {
    //   this.setAttribute('prop2', value);
    // }
    
    // set expanded(value) {
    //   (value === '' || value === 'true' || value === true)
    //     ? this.setAttribute('expanded', '')
    //     : this.removeAttribute('expanded');
    // }
    
    // get open() { return this.hasAttribute('open'); }
    // set open(value) {
    //   const open = value === '' || value === 'true' || value === true;
    //   const changed = open !== this.open;
    //   
    //   const sendEvent = () => {
    //     this.dispatchEvent(new CustomEvent(EVENT__TOGGLED, {
    //       bubbles: true,
    //       detail: { open },
    //     }));
    //   };
    //   
    //   if (changed) {
    //     if (open) this.setAttribute('open', '');
    //     else this.removeAttribute('open');
    //   }
    // }
    
    // run logic when these DOM attributes are altered
    static get observedAttributes() {
      return [
        'data',
        'datacomponent',
        'layout',
        'nextprevnav',
        'monthyearnav',
        'onlayoutchange',
        'startweekon',
      ];
    }
    
    // // export custom events for Users
    // static get events() {
    //   return {
    //     toggled: EVENT__TOGGLED,
    //   };
    // }
    
    static get layouts() {
      return {
        day: LAYOUT__DAY,
        month: LAYOUT__MONTH,
        week: LAYOUT__WEEK,
      };
    }
    
    // run logic when DOM attributes are altered
    attributeChangedCallback(attr, oldVal, newVal) {
      const empty = oldVal === '' && (newVal === null || newVal === undefined);
      
      if (!empty && oldVal !== newVal) {
        let _newVal = newVal;
        
        switch (attr) {
          // NOTE: Transform attribute names to camelcase variables since
          // Browsers normalize them to lowercase.
          case 'datacomponent': { this.dataComponent = _newVal; break; }
          case 'nextprevnav': { this.nextPrevNav = _newVal; break; }
          case 'monthyearnav': { this.monthYearNav = _newVal; break; }
          case 'onlayoutchange': { this.onLayoutChange = _newVal; break; }
          case 'startweekon': { this.startWeekOn = _newVal; break; }
          default: { this[attr] = _newVal; }
        }
      }
    }
    
    constructor() {
      super();
      
      this.attachShadow({ mode: 'open' });
      
      const { shadowRoot } = this;
      
      /*
      :host {
        ${CSS_VAR__COLOR__NAME}: ${DEFAULT__COLOR__NAME};
      }
      
      .${ROOT_CLASS} {
        display: inline-block;
      }
      */
      
      /*
      :host([open]) .${ROOT_CLASS} {
        background: green;
      }
      
      ::slotted([slot="item"]) {
        background: orange;
      }
      
      <div class="${ROOT_CLASS}"></div>
      */
      
      shadowRoot.innerHTML = `
        <style>
          *, *::after, *::before {
            box-sizing: border-box;
          }
          
          :host {
            font-family: Helvetica, Arial, sans-serif;
          }
        </style>
        
        <div></div>
      `;
      
      this.els = {
        root: shadowRoot.querySelector('div'),
      };
      
      this.currDayNdx = undefined;
      this.currWeekNdx = undefined;
      this.currentMonth = today.getMonth();
      this.currentYear = year;
      this.monthSelectRef = undefined;
      this.mounted = false;
      this.weekDays = createDays(DAYS, this.startWeekOn);
      this.yearSelectRef = undefined;
      
      this.calData = this.genCalData();
      this.selectedCalData = this.calData;
      this.days = [...this.weekDays];
    }
    
    genCalData() {
      const {
        currentMonth,
        currentYear,
        data,
        startWeekOn,
      } = this;
      
      const firstDay = getFirstDayOfMonthOffset(currentMonth, currentYear, startWeekOn);
      const prevMonth = (currentMonth === 0) ? 11 : currentMonth - 1;
      const prevYear = (currentMonth === 0) ? currentYear - 1 : currentYear;
      const daysInPrevMonth = getDaysInMonth(prevMonth, prevYear);
      const daysInMonth = getDaysInMonth(currentMonth, currentYear);
      const currDay = today.getDate();
      const currMonth = today.getMonth();
      const currYear = today.getFullYear();
      const ret = [];
      let prevMonthDayNum = daysInPrevMonth - (firstDay - 1);
      let nextMonthDayNum = 1;
      let dayNum = 1;
      
      for (let row = 0; row < 6; row++) {
        const rowArr = [];
        
        for (let day = 0; day < DAYS.length; day++) {
          let obj;
          
          if (row === 0 && day < firstDay) {
            obj = { label: prevMonthDayNum, prevMonth: true };
            prevMonthDayNum += 1;
          }
          else if (dayNum > daysInMonth) {
            obj = { label: nextMonthDayNum, nextMonth: true };
            nextMonthDayNum += 1;
          }
          else {
            obj = { dayNdx: day, label: dayNum };
            
            if (
              dayNum === currDay
              && currentMonth === currMonth
              && currentYear === currYear
            ) obj.current = true;
            
            dayNum += 1;
          }
          
          if (data) {
            let month = currentMonth;
            let year = currentYear;
            if (obj.prevMonth) {
              month = month === 0 ? 11 : month - 1;
              if (month === 11) year -= 1;
            }
            else if (obj.nextMonth) {
              month = month === 11 ? 0 : month + 1;
              if (month === 0) year += 1;
            }
            
            const formattedMonth = formatMonth(month);
            const formattedDay = pad(obj.label);
            
            if (data?.[year]?.[formattedMonth]?.[formattedDay]) {
              obj.items = data[year][formattedMonth][formattedDay];
            }
          }
          
          rowArr.push(obj);
        }
        
        ret.push(rowArr);
      }
      
      return ret;
    }
    
    selectCalData() {
      const {
        calData,
        currDayNdx,
        currWeekNdx,
        layout,
      } = this;
      
      switch (layout) {
        case LAYOUT__MONTH: this.selectedCalData = calData; break;
        case LAYOUT__WEEK: {
          if (currWeekNdx === undefined) {
            rowLoop: for (let r=0; r<calData.length; r++) {
              const row = calData[r];
              const currNdx = row.findIndex(({ current }) => current);
              
              if (currNdx >= 0) {
                this.currWeekNdx = r;
                break rowLoop;
              }
            }
            
            // if on a month that doesn't have the current day, default to the
            // first week.
            if (currWeekNdx === undefined) this.currWeekNdx = 0;
          }
          
          this.selectedCalData = [calData[currWeekNdx]];
      
          break;
        }
        case LAYOUT__DAY: {
          if (currDayNdx === undefined) {
            let firstDayNdx;
            
            rowLoop: for (let r=0; r<calData.length; r++) {
              const row = calData[r];
              const currNdx = row.findIndex(({ current }) => current);
              
              if (firstDayNdx === undefined) {
                const dayNdx = row.findIndex(({ prevMonth }) => !prevMonth);
                if (dayNdx >= 0) firstDayNdx = dayNdx;
              } 
              
              if (currNdx >= 0) {
                this.currWeekNdx = r;
                this.currDayNdx = currNdx;
                break rowLoop;
              }
            }
            
            // if on a month that doesn't have the current day, default to the
            // first week and day.
            if (currWeekNdx === undefined) {
              this.currWeekNdx = 0;
              this.currDayNdx = firstDayNdx;
            }
          }
          
          this.selectedCalData = [[calData[currWeekNdx][currDayNdx]]];
          
          break;
        }
      }
    }
    
    updateCalData() {
      this.calData = this.genCalData();
      this.selectCalData();
    }
    
    updateMonth(newMonth) {
      const { currentMonth } = this;
      
      if (newMonth !== currentMonth) {
        this.currentMonth = newMonth;
        this.updateCalData();
      }
    }
    
    updateYear(newYear) {
      const { currentYear } = this;
      
      if (newYear !== currentYear) {
        this.currentYear = newYear;
        this.updateCalData();
      }
    }
    
    updateLayout(newLayout, force) {
      const {
        layout,
        onLayoutChange,
        selectedCalData,
        weekDays,
      } = this;
      
      if (force || newLayout !== layout) {
        this.layout = newLayout;
        this.currWeekNdx = undefined;
        this.currDayNdx = undefined;
        
        this.updateCalData();
        
        switch (layout) {
          case LAYOUT__MONTH:
          case LAYOUT__WEEK: {
            this.days = [...weekDays];
            break;
          }
          case LAYOUT__DAY: {
            this.days = [weekDays[selectedCalData[0][0].dayNdx]];
            break;
          }
        }
        
        if (onLayoutChange) onLayoutChange(layout);
      }
    }
    
    handleNextClick() {
      const {
        calData,
        currDayNdx,
        currWeekNdx,
        currentMonth,
        currentYear,
        layout,
        selectedCalData,
        weekDays,
      } = this;
      
      if (currentMonth === 11 && currentYear + 1 > yearOpts[yearOpts.length - 1]) return;
      
      function nextMonth() {
        this.updateYear( (currentMonth === 11) ? currentYear + 1 : currentYear );
        this.updateMonth( (currentMonth + 1) % 12 );
      }
      
      function nextWeek() {
        const nextWeek = calData[currWeekNdx + 1];
        const noCurrentMonthItems = (nextWeek) ? nextWeek[0].nextMonth : true;
        
        if (noCurrentMonthItems || currWeekNdx === 5) {
          this.currWeekNdx = 0;
          nextMonth();
        }
        else {
          this.currWeekNdx += 1;
          this.selectCalData();
        }
      }
      
      switch (layout) {
        case LAYOUT__MONTH: nextMonth(); break;
        case LAYOUT__WEEK: nextWeek(); break;
        case LAYOUT__DAY: {
          if (currDayNdx === 6) {
            this.currDayNdx = 0;
            nextWeek();
          }
          else {
            this.currDayNdx += 1;
            this.selectCalData();
          }
          
          let dayNdx = selectedCalData[0][0].dayNdx;
          if (dayNdx !== undefined) this.days = [weekDays[dayNdx]];
          else {
            this.currWeekNdx = 0;
            nextMonth();
            this.selectCalData();
            
            dayNdx = selectedCalData[0][0].dayNdx;
            this.days = [weekDays[dayNdx]];
          }
          
          break;
        }
      }
    }
    
    handlePrevClick() {
      const {
        calData,
        currDayNdx,
        currWeekNdx,
        currentMonth,
        currentYear,
        layout,
        selectedCalData,
        weekDays,
      } = this;
      
      if (currentMonth === 0 && currentYear - 1 < yearOpts[0]) return;
      
      function prevMonth() {
        this.updateYear( (currentMonth === 0) ? currentYear - 1 : currentYear );
        this.updateMonth( (currentMonth === 0) ? 11 : currentMonth - 1 );
      }
      
      function prevWeek() {
        const prevWeek = calData[currWeekNdx - 1];
        const noCurrentMonthItems = (prevWeek) ? prevWeek[prevWeek.length - 1].prevMonth : true;
        
        if (noCurrentMonthItems || currWeekNdx === 0) {
          this.currWeekNdx = 4;
          prevMonth();
        }
        else {
          this.currWeekNdx -= 1;
          this.selectCalData();
        }
      }
      
      switch (layout) {
        case LAYOUT__MONTH: prevMonth(); break;
        case LAYOUT__WEEK: prevWeek(); break;
        case LAYOUT__DAY: {
          if (currDayNdx === 0) {
            this.currDayNdx = 6;
            prevWeek();
          }
          else {
            this.currDayNdx -= 1;
            this.selectCalData();
          }
          
          let dayNdx = selectedCalData[0][0].dayNdx;
          if (dayNdx !== undefined) this.days = [weekDays[dayNdx]];
          else {
            prevMonth();
            
            rowLoop: for (let r=0; r<calData.length; r++) {
              const row = calData[r];
              const ndx = row.findIndex(({ nextMonth }) => nextMonth);
              if (ndx >= 0) {
                this.currWeekNdx = r;
                break rowLoop;
              }
            }
            
            this.selectCalData();
            
            dayNdx = selectedCalData[0][0].dayNdx;
            this.days = [weekDays[dayNdx]];
          }
          
          break;
        }
      }
    }
    
    handleMonthSelect() {
      const { monthSelectRef } = this;
      
      this.updateMonth( parseInt(monthSelectRef.value) );
    }
    
    handleYearSelect() {
      const { yearSelectRef } = this;
      
      this.updateYear( parseInt(yearSelectRef.value) );
    }
    
    handleLayoutChange({ target }) {
      if (target.nodeName === 'BUTTON') this.updateLayout(target.value);
    }
    
    // component has been added to the DOM
    connectedCallback() {
      const { layout } = this;
      
      if (layout === LAYOUT__DAY) this.updateLayout(layout, true);
      
      // TODO: 'mounted' may not be needed
      this.mounted = true;
      
      this.render();
      
      // this.shadowRoot.addEventListener('slotchange', ({ target: slot }) => {
      //   slot.assignedNodes().map((node) => {
      //     console.log(node);
      //   });
      // });  
    }
    
    render() {
      const {
        currentMonth,
        currentYear,
        dataComponent,
        days,
        layout,
        monthYearNav,
        nextPrevNav,
        selectedCalData,
      } = this;
      
      const wrapperModifiers = [];
      if (nextPrevNav && layout !== LAYOUT__DAY) wrapperModifiers.push('has--next-prev-nav');
      if (monthYearNav && layout === LAYOUT__MONTH) wrapperModifiers.push('has--month-year-nav');
      
      const calendarModifiers = [];
      switch (layout) {
        case LAYOUT__MONTH: calendarModifiers.push('is--month'); break;
        case LAYOUT__WEEK: calendarModifiers.push('is--week'); break;
        case LAYOUT__DAY: calendarModifiers.push('is--day'); break;
      }
      
      let nextPrevNavMarkup = '';
      if (nextPrevNav) {
        // TODO: wire up handlers
        nextPrevNavMarkup = `
          <nav class="calendar-next-prev-nav">
            <button on:click={handlePrevClick} title="${`Previous ${layout}`}">
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <polygon points="0 50, 100 0, 100 100, 0 50" />
              </svg>
            </button>
            <button on:click={handleNextClick} title="${`Next ${layout}`}">
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <polygon points="0 0, 100 50, 0 100, 0 0" />
              </svg>
            </button>
          </nav>
        `;
      }
      
      let monthYearNavMarkup = '';
      if (monthYearNav && layout === LAYOUT__MONTH) {
        // TODO: wire up handlers
        monthYearNavMarkup = `
          <nav>
            <select
              bind:this={monthSelectRef}
              on:change={handleMonthSelect}
            >
              ${MONTHS.map((monthOpt, monthNdx) => {
                return `<option value="${monthNdx}" selected="${currentMonth === monthNdx}">${monthOpt}</option>`;
              }).join('')}
            </select>
            
            <select
              bind:this={yearSelectRef}
              on:change={handleYearSelect}
            >
              ${yearOpts.map((yearOpt) => {
                return `<option value="${yearOpt}" selected="${currentYear === yearOpt}">${yearOpt}</option>`;
              }).join('')}
            </select>
          </nav>
        `;
      }
      
      // TODO: wire up handlers
      this.els.root.innerHTML = `
        <div class="calendar-wrapper ${wrapperModifiers.join(' ')}">
          <div class="calendar-header">
            <h2 class="calendar-title">${MONTHS[currentMonth]} ${currentYear}</h2>
            <div class="calendar-top-navs">
              ${nextPrevNavMarkup}
              <nav
                class="calendar-layout-nav"
                on:click={handleLayoutChange}
              >
                ${LAYOUT_NAV_ITEMS.map(([val, label]) => {
                  const _class = (layout === val) ? 'class="is--current"' : '';
                  return `<button type="button" ${_class} value="${val}">${label}</button>`;
                }).join('')}
              </nav>
            </div>
          </div>
          
          <div class="calendar-scroller">
            <table class="calendar ${calendarModifiers.join(' ')}">
              <thead class="calendar__days">
                ${days.map((day) => {
                  return `<th class="calendar__day">${truncateDay(day)}</th>`;
                }).join('')}
              </thead>
              <tbody>
                ${selectedCalData.map((rowData) => {
                  return `
                    <tr>
                      ${rowData.map((day) => {
                        const dateModifiers = [];
                        if (day.current) dateModifiers.push('is--current');
                        if (day.prevMonth) dateModifiers.push('is--prev-month');
                        if (day.nextMonth) dateModifiers.push('is--next-month');
                        
                        let labelMarkup = '';
                        if (day.label) labelMarkup = `<div class="calendar__date-label">${day.label}</div>`;
                        
                        let itemsMarkup = '';
                        if (day.items && dataComponent) itemsMarkup = dataComponent(day.items);
                        
                        return `
                          <td class="calendar__date ${dateModifiers.join(' ')}">
                            ${labelMarkup}
                            ${itemsMarkup}
                          </td>
                        `;
                      }).join('')}
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
          
          ${monthYearNavMarkup}
        </div>
      `;
    }
  }

  const EL_NAME = 'custom-calendar';
  if (window.customElements.get(EL_NAME)) {
    console.warn(`${EL_NAME} already defined`);
  }
  else {
    window.customElements.define(EL_NAME, CustomCalendar);
    window.CustomCalendar = CustomCalendar;
  }
})();
