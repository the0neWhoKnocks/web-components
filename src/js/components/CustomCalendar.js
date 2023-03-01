(() => {
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
    get layout() {
      return this.getAttribute('layout') || LAYOUT__MONTH;
    }
    set layout(value) {
      this.setAttribute('layout', value);
    }
    
    get monthYearNav() {
      return this.hasAttribute('monthYearNav');
    }
    set monthYearNav(value) {
      (value === '' || value === 'true' || value === true)
        ? this.setAttribute('monthYearNav', '')
        : this.removeAttribute('monthYearNav');
    }
    
    get nextPrevNav() {
      return this.hasAttribute('nextPrevNav');
    }
    set nextPrevNav(value) {
      (value === '' || value === 'true' || value === true)
        ? this.setAttribute('nextPrevNav', '')
        : this.removeAttribute('nextPrevNav');
    }
    
    get startWeekOn() {
      return this.getAttribute('startWeekOn') || DAYS[0];
    }
    set startWeekOn(value) {
      this.setAttribute('startWeekOn', value);
      
      this.weekDays = createDays(DAYS, value);
      this.days = [...this.weekDays];
      this.updateCalData();
    }
    
    // run logic when these DOM attributes are altered
    static get observedAttributes() {
      return [
        'layout',
        'nextprevnav',
        'monthyearnav',
        'startweekon',
      ];
    }
    
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
          case 'nextprevnav': { this.nextPrevNav = _newVal; break; }
          case 'monthyearnav': { this.monthYearNav = _newVal; break; }
          case 'startweekon': { this.startWeekOn = _newVal; break; }
          default: { this[attr] = _newVal; }
        }
      }
      
      if (oldVal !== newVal) this.render();
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
            --color--bg--current: #ffffba;
            --color--bg--primary: #fff;
            --color--bg--secondary: hsl(0deg 0% 96%);
            --color--outline--current: #0068ff;
            --color--text--primary: #000;
            
            font-family: Helvetica, Arial, sans-serif;
            display: flex;
          }
          
          button,
          select {
            color: var(--color--text--primary);
            border: solid 1px var(--color--text--primary);
          }
          
          button {
            background: var(--color--bg--secondary);
          }
          button:not(:disabled) {
            cursor: pointer;
          }
          
          nav {
            display: flex;
          }
          nav button {
            width: 100%;
          }
          nav select {
            text-align: center;
            padding-right: 0.5em;
            padding-left: 0.25em;
            background: var(--color--bg--primary);
          }
          nav select option {
            text-align: left;
          }

          .calendar-wrapper {
            color: var(--color--text--primary);
            height: 100%;
            min-height: 0;
            background: var(--color--bg--primary);
            display: flex;
            flex-direction: column;
          }
          
          .calendar-header {
            margin-bottom: 0.5em;
            display: flex;
            justify-content: space-between;
          }
          
          .calendar-title {
            font-weight: bold;
            padding-right: 1em;
            margin: 0;
          }
          
          .calendar-top-navs {
            display: flex;
            gap: 1em;
          }
          .calendar-top-navs nav button {
            line-height: 0;
            padding: 0.5em 1em;
          }
          
          .calendar-next-prev-nav svg {
            width: 1em;
            overflow: visible;
            fill: transparent;
            stroke: currentColor;
            stroke-linejoin: round;
            stroke-width: 0.4em;
          }
          
          .calendar-layout-nav button {
            padding: 0.25em 0.75em;
          }
          .calendar-layout-nav button.is--current {
            color: #eee;
            background: #333;
          }
          
          .calendar-scroller {
            height: 100%;
            overflow-y: scroll;
            border: solid 2px;
            background: var(--color--text--primary);
          }
          
          .calendar {
            table-layout: fixed;
            border-collapse: collapse;
            width: 100%; /* controls td/th width/heights, makes'em equal size */
            height: 100%;
          }
          .calendar__days {
            position: sticky;
            top: 0;
            z-index: 2;
          }
          
          .calendar__day,
          .calendar__date {
            color: var(--color--text--primary);
            outline: solid 1px;
          }
          
          .calendar__day {
            font-weight: bold;
            background: var(--color--bg--secondary);
          }
          
          .calendar__date {
            --color--cal--date--bg: var(--color--bg--primary);
            
            height: 6em;
            vertical-align: top;
            background-color: var(--color--cal--date--bg);
          }
          .calendar__date.is--prev-month,
          .calendar__date.is--next-month {
            --color--cal--date--bg: var(--color--bg--secondary);
            
            background-color: var(--color--cal--date--bg);
          }
          .calendar__date.is--current {
            --color--cal--date--bg: var(--color--bg--current);
            
            background-color: var(--color--cal--date--bg);
          }
          
          .calendar__date-label {
            line-height: 1em;
            padding: 0.5em;
            background: inherit;
            position: sticky;
            top: 1.68em;
            z-index: 1;
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
      this.weekDays = createDays(DAYS, this.startWeekOn);
      // the below data props are dependant on the above
      this.days = [...this.weekDays];
      this.calData = this.genCalData({
        currentMonth: this.currentMonth,
        currentYear: this.currentYear,
      });
      this.selectedCalData = this.calData;
      
      this.handleLayoutChange = this.handleLayoutChange.bind(this);
      this.handleMonthSelect = this.handleMonthSelect.bind(this);
      this.handleNextClick = this.handleNextClick.bind(this);
      this.handlePrevClick = this.handlePrevClick.bind(this);
      this.handleYearSelect = this.handleYearSelect.bind(this);
    }
    
    genCalData(opts) {
      const firstDay = getFirstDayOfMonthOffset(opts.currentMonth, opts.currentYear, this.startWeekOn);
      const prevMonth = (opts.currentMonth === 0) ? 11 : opts.currentMonth - 1;
      const prevYear = (opts.currentMonth === 0) ? opts.currentYear - 1 : opts.currentYear;
      const daysInPrevMonth = getDaysInMonth(prevMonth, prevYear);
      const daysInMonth = getDaysInMonth(opts.currentMonth, opts.currentYear);
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
              && opts.currentMonth === currMonth
              && opts.currentYear === currYear
            ) obj.current = true;
            
            dayNum += 1;
          }
          
          let month = opts.currentMonth;
          let year = opts.currentYear;
          if (obj.prevMonth) {
            month = month === 0 ? 11 : month - 1;
            if (month === 11) year -= 1;
          }
          else if (obj.nextMonth) {
            month = month === 11 ? 0 : month + 1;
            if (month === 0) year += 1;
          }
          
          const formattedYear = `${year}`;
          const formattedMonth = formatMonth(month);
          const formattedDay = pad(obj.label);
          
          obj.slotName = `${formattedYear}_${formattedMonth}_${formattedDay}`;
          
          rowArr.push(obj);
        }
        
        ret.push(rowArr);
      }
      
      return ret;
    }
    
    selectCalData() {
      switch (this.layout) {
        case LAYOUT__MONTH: this.selectedCalData = this.calData; break;
        case LAYOUT__WEEK: {
          if (this.currWeekNdx === undefined) {
            rowLoop: for (let r=0; r<this.calData.length; r++) {
              const row = this.calData[r];
              const currNdx = row.findIndex(({ current }) => current);
              
              if (currNdx > -1) {
                this.currWeekNdx = r;
                break rowLoop;
              }
            }
            
            // if on a month that doesn't have the current day, default to the
            // first week.
            if (this.currWeekNdx === undefined) this.currWeekNdx = 0;
          }
          
          this.selectedCalData = [this.calData[this.currWeekNdx]];
      
          break;
        }
        case LAYOUT__DAY: {
          if (this.currDayNdx === undefined) {
            let firstDayNdx;
            
            rowLoop: for (let r=0; r<this.calData.length; r++) {
              const row = this.calData[r];
              const currNdx = row.findIndex(({ current }) => current);
              
              if (firstDayNdx === undefined) {
                const dayNdx = row.findIndex(({ prevMonth }) => !prevMonth);
                if (dayNdx >= 0) firstDayNdx = dayNdx;
              } 
              
              if (currNdx > -1) {
                this.currWeekNdx = r;
                this.currDayNdx = currNdx;
                break rowLoop;
              }
            }
            
            // if on a month that doesn't have the current day, default to the
            // first week and day.
            if (this.currWeekNdx === undefined) {
              this.currWeekNdx = 0;
              this.currDayNdx = firstDayNdx;
            }
          }
          
          this.selectedCalData = [[this.calData[this.currWeekNdx][this.currDayNdx]]];
          
          break;
        }
      }
    }
    
    updateCalData() {
      this.calData = this.genCalData({
        currentMonth: this.currentMonth,
        currentYear: this.currentYear,
      });
      this.selectCalData();
    }
    
    updateMonth(newMonth) {
      if (newMonth !== this.currentMonth) {
        this.currentMonth = newMonth;
        this.updateCalData();
      }
    }
    
    updateYear(newYear) {
      if (newYear !== this.currentYear) {
        this.currentYear = newYear;
        this.updateCalData();
      }
    }
    
    updateLayout(newLayout, force) {
      if (force || newLayout !== this.layout) {
        this.layout = newLayout;
        this.currWeekNdx = undefined;
        this.currDayNdx = undefined;
        
        this.updateCalData();
        
        switch (this.layout) {
          case LAYOUT__MONTH:
          case LAYOUT__WEEK: {
            this.days = [...this.weekDays];
            break;
          }
          case LAYOUT__DAY: {
            this.days = [this.weekDays[this.selectedCalData[0][0].dayNdx]];
            break;
          }
        }
        
        if (this.onLayoutChange) this.onLayoutChange(this.layout);
      }
    }
    
    handleNextClick() {
      if (this.currentMonth === 11 && this.currentYear + 1 > yearOpts[yearOpts.length - 1]) return;
      
      const nextMonth = () => {
        this.updateYear( (this.currentMonth === 11) ? this.currentYear + 1 : this.currentYear );
        this.updateMonth( (this.currentMonth + 1) % 12 );
      };
      
      const nextWeek = () => {
        const nextWeek = this.calData[this.currWeekNdx + 1];
        const noCurrentMonthItems = (nextWeek) ? nextWeek[0].nextMonth : true;
        const containsNextMonthItems = (nextWeek)
          ? !!nextWeek.find(({ nextMonth }) => nextMonth)
          : false;
        const currDayInThisMonth = (nextWeek)
          ? !!nextWeek.find(({ current, nextMonth }) => current && !nextMonth)
          : false;
        
        if (noCurrentMonthItems || this.currWeekNdx === 5 || containsNextMonthItems) {
          if (currDayInThisMonth) {
            this.currWeekNdx += 1;
            this.selectCalData();
          }
          else {
            this.currWeekNdx = (this.calData[this.currWeekNdx][6].nextMonth) ? 1 : 0;
            nextMonth();
          }
        }
        else {
          this.currWeekNdx += 1;
          this.selectCalData();
        }
      };
      
      switch (this.layout) {
        case LAYOUT__MONTH: nextMonth(); break;
        case LAYOUT__WEEK: nextWeek(); break;
        case LAYOUT__DAY: {
          if (this.currDayNdx === 6) {
            this.currDayNdx = 0;
            nextWeek();
          }
          else {
            this.currDayNdx += 1;
            this.selectCalData();
          }
          
          let dayNdx = this.selectedCalData[0][0].dayNdx;
          if (dayNdx !== undefined) this.days = [this.weekDays[dayNdx]];
          else {
            this.currWeekNdx = 0;
            nextMonth();
            this.selectCalData();
            
            dayNdx = this.selectedCalData[0][0].dayNdx;
            this.days = [this.weekDays[dayNdx]];
          }
          
          break;
        }
      }
      
      this.render();
    }
    
    handlePrevClick() {
      if (this.currentMonth === 0 && this.currentYear - 1 < yearOpts[0]) return;
      
      const determineYear = () => (this.currentMonth === 0) ? this.currentYear - 1 : this.currentYear;
      const determineMonth = () => (this.currentMonth === 0) ? 11 : this.currentMonth - 1;
      const determineWeekNdx = () => {
        return this.genCalData({
          currentMonth: determineMonth(),
          currentYear: determineYear(),
        }).findIndex((week, ndx) => {
          const currMonthItem = !!week.find(({ nextMonth }) => nextMonth);
          if (currMonthItem) return ndx;
        }) - 1;
      };
      
      const prevMonth = () => {
        this.updateYear( determineYear() );
        this.updateMonth( determineMonth() );
      };
      
      const prevWeek = () => {
        const prevWeek = this.calData[this.currWeekNdx - 1];
        const noCurrentMonthItems = (prevWeek) ? prevWeek[prevWeek.length - 1].prevMonth : true;
        const containsPrevMonthItems = !!this.calData[this.currWeekNdx].find(({ prevMonth }) => prevMonth);
        const currDayInThisMonth = (prevWeek)
          ? !!prevWeek.find(({ current, prevMonth }) => current && !prevMonth)
          : false;
      
        if (containsPrevMonthItems) {
          this.currWeekNdx = determineWeekNdx();
          prevMonth();
        }
        else if (noCurrentMonthItems || this.currWeekNdx === 0) {
          this.currWeekNdx = 4;
          prevMonth();
        }
        else {
          this.currWeekNdx -= 1;
          
          if (!currDayInThisMonth && this.currWeekNdx === 0 && prevWeek[0].prevMonth) {
            prevMonth();
            this.currWeekNdx = determineWeekNdx();
          }
          
          this.selectCalData();
        }
      };
      
      switch (this.layout) {
        case LAYOUT__MONTH: prevMonth(); break;
        case LAYOUT__WEEK: prevWeek(); break;
        case LAYOUT__DAY: {
          if (this.currDayNdx === 0) {
            this.currDayNdx = 6;
            prevWeek();
          }
          else {
            this.currDayNdx -= 1;
            this.selectCalData();
          }
          
          let dayNdx = this.selectedCalData[0][0].dayNdx;
          if (dayNdx !== undefined) this.days = [this.weekDays[dayNdx]];
          else {
            prevMonth();
            
            rowLoop: for (let r=0; r<this.calData.length; r++) {
              const row = this.calData[r];
              const ndx = row.findIndex(({ nextMonth }) => nextMonth);
              if (ndx >= 0) {
                this.currWeekNdx = r;
                break rowLoop;
              }
            }
            
            this.selectCalData();
            
            dayNdx = this.selectedCalData[0][0].dayNdx;
            this.days = [this.weekDays[dayNdx]];
          }
          
          break;
        }
      }
      
      this.render();
    }
    
    handleMonthSelect() {
      this.updateMonth( parseInt(this.els.monthSelect.value) );
      this.render();
    }
    
    handleYearSelect() {
      this.updateYear( parseInt(this.els.yearSelect.value) );
      this.render();
    }
    
    handleLayoutChange({ target }) {
      if (target.nodeName === 'BUTTON') {
        this.updateLayout(target.value);
        this.render();
      }
    }
    
    // component has been added to the DOM
    connectedCallback() {
      if (this.layout === LAYOUT__DAY) this.updateLayout(this.layout, true);
      
      this.render();
    }
    
    render() {
      const {
        currentMonth,
        currentYear,
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
        nextPrevNavMarkup = `
          <nav class="calendar-next-prev-nav">
            <button id="prevBtn" title="${`Previous ${layout}`}">
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <polygon points="0 50, 100 0, 100 100, 0 50" />
              </svg>
            </button>
            <button id="nextBtn" title="${`Next ${layout}`}">
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <polygon points="0 0, 100 50, 0 100, 0 0" />
              </svg>
            </button>
          </nav>
        `;
      }
      
      let monthYearNavMarkup = '';
      if (monthYearNav && layout === LAYOUT__MONTH) {
        monthYearNavMarkup = `
          <nav class="calendar-month-year-nav">
            <select id="monthSelect">
              ${MONTHS.map((monthOpt, monthNdx) => {
                const selected = currentMonth === monthNdx ? 'selected' : '';
                return `<option value="${monthNdx}" ${selected}>${monthOpt}</option>`;
              }).join('')}
            </select>
            <select id="yearSelect">
              ${yearOpts.map((yearOpt) => {
                const selected = currentYear === yearOpt ? 'selected' : '';
                return `<option value="${yearOpt}" ${selected}>${yearOpt}</option>`;
              }).join('')}
            </select>
          </nav>
        `;
      }
      
      this.els.root.innerHTML = `
        <div class="calendar-wrapper ${wrapperModifiers.join(' ')}">
          <div class="calendar-header">
            <h2 class="calendar-title">${MONTHS[currentMonth]} ${currentYear}</h2>
            <div class="calendar-top-navs">
              ${monthYearNavMarkup}
              ${nextPrevNavMarkup}
              <nav class="calendar-layout-nav" id="layoutNav">
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
                        
                        return `
                          <td class="calendar__date ${dateModifiers.join(' ')}">
                            ${labelMarkup}
                            <slot name="${day.slotName}"></slot>
                          </td>
                        `;
                      }).join('')}
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
      
      if (nextPrevNavMarkup) {
        this.shadowRoot
          .getElementById('nextBtn')
          .addEventListener('click', this.handleNextClick);
        this.shadowRoot
          .getElementById('prevBtn')
          .addEventListener('click', this.handlePrevClick);
      }
      
      if (monthYearNavMarkup) {
        this.els.monthSelect = this.shadowRoot.getElementById('monthSelect');
        this.els.monthSelect.addEventListener('change', this.handleMonthSelect);
        
        this.els.yearSelect = this.shadowRoot.getElementById('yearSelect');
        this.els.yearSelect.addEventListener('change', this.handleYearSelect);
      }
      
      this.shadowRoot
        .getElementById('layoutNav')
        .addEventListener('click', this.handleLayoutChange);
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
