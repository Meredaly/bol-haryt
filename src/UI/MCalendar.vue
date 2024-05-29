<template>
  <div class="calendar" ref="calendar">
    <div class="calendar__header">
      <div class="calendar__monthyear">
        <span class="calendar__month" :style="{ opacity: calendarMonthOpacity }" @click="activeMonth">
          {{ this.$t(monthName[month]) }} </span
        >,&nbsp;
        <span class="calendar__year" :style="{ opacity: calendarYearOpacity }" @click="activeYear">{{ year }}</span>
      </div>
      <div class="calendar__arrow">
        <div @click="prevMonth">
          <m-icons name="chevronLeft" />
        </div>
        <div @click="nextMonth">
          <m-icons name="chevronRight" />
        </div>
      </div>
    </div>
    <div class="calendar__body">
      <div class="calendar__weekdays">
        <div class="calendar__weekday" v-for="week in 7" :key="week">
          {{ this.$t(weekName[week - 1]) }}
        </div>
      </div>
      <div class="calendar__days">
        <template v-for="day in daysPrevMonth" :key="day + 'other'">
          <div class="calendar__day calendar__day-other" v-if="day >= daysPrevMonth - firstDay + 2">
            {{ day }}
          </div>
        </template>
        <template v-for="day in daysCurrentMonth" :key="day + 'current'">
          <div
            class="calendar__day"
            :class="[
              {
                'calendar__day-active': year === currentYear && month === currentMonth && day === currentDay
              }
            ]"
            @click="setDate(day)"
          >
            <span class="calendar__day-text">{{ day }} </span>
            <div class="calendar__day-box"></div>
          </div>
        </template>
        <div class="calendar__day calendar__day-other" v-for="day in nextMonthDayCount" :key="day + 'day'">
          {{ day }}
        </div>
      </div>
      <div
        class="calendar__picker"
        :style="{
          visibility: calendarPickerStyle.visibility,
          opacity: calendarPickerStyle.opacity
        }"
      >
        <div class="calendar__picker-month" v-show="monthVisible">
          <div
            class="calendar__picker-month-option"
            v-for="(monthNumber, key) in 12"
            :key="key"
            :class="{
              'calendar__picker-month-active': monthNumber - 1 === currentMonth && year === currentYear,
              'calendar__picker-month-selected': monthNumber - 1 === month
            }"
            @click="calendar(year, monthNumber - 1)"
          >
            {{ this.$t(monthName[monthNumber - 1]).slice(0, 3) }}
          </div>
        </div>
        <div class="calendar__picker-year" v-show="yearVisible">
          <div
            class="calendar__picker-year-option"
            v-for="(yearNumber, key) in yearNumbers"
            :key="key"
            :class="{
              'calendar__picker-year-today': yearNumber === currentYear,
              'calendar__picker-year-selected': year === yearNumber
            }"
            @click="calendar(yearNumber, month)"
          >
            {{ yearNumber }}
          </div>
        </div>
      </div>
    </div>
    <div class="ml-20 mr-20">
      <m-button @click="removeDate" small block :title="this.$t('deleteDate')" />
    </div>
  </div>
</template>
<script>
  import MIcons from '@/UI/MIcons.vue'
  import MButton from '@/UI/MButton.vue'
  export default {
    components: {
      MIcons,
      MButton
    },
    data() {
      return {
        lang: 'ru',
        day: 0,
        month: 0,
        year: 0,
        currentDay: 0,
        currentMonth: 0,
        currentYear: 0,
        daysPrevMonth: 0,
        daysCurrentMonth: 0,
        nextMonthDayCount: 0,
        firstDay: 0,
        yearIndex: 0,
        //
        monthVisible: false,
        yearVisible: false,
        calendarMonthOpacity: 1,
        calendarYearOpacity: 1,
        calendarPickerStyle: {
          opacity: 0,
          visibility: 'hidden'
        },
        monthName: [
          'january',
          'february',
          'march',
          'april',
          'may',
          'june',
          'july',
          'august',
          'september',
          'october',
          'november',
          'december'
        ],
        weekName: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
      }
    },
    props: {
      date: { type: Date, default: null },
      minDate: { type: Date, default: null },
      maxDate: { type: Date, default: null }
    },
    computed: {
      yearNumbers() {
        let arr = []
        for (let i = 1900; i <= 2100; i++) {
          arr.push(i)
        }
        return arr
      }
    },
    created() {
      this.updateDate(this.date || new Date())
      this.calendar(this.currentYear, this.currentMonth)
    },
    watch: {
      date(newDate) {
        this.updateDate(newDate || new Date())
      }
    },
    methods: {
      removeDate() {
        this.$emit('setCalendarDay', null)
      },
      updateDate(nDate) {
        const date = new Date(nDate)
        this.currentDay = this.day = date.getDate()
        this.currentMonth = this.month = date.getMonth()
        this.currentYear = this.year = date.getFullYear()
      },
      calendar(year, month) {
        //
        let thisMonth = new Date(year, month)
        this.year = year
        this.month = month
        this.firstDay = thisMonth.getDay() === 0 ? 7 : thisMonth.getDay()
        // gecen ayyn ayyny new yylyny hasaplamak hasaplaman ucin
        let prevYear = year
        let prevMonth = month - 1
        if (prevMonth < 0) {
          prevMonth = 0
          prevYear = year - 1
        }
        // gecen ayyn gunlerinin sany
        this.daysPrevMonth = 32 - new Date(prevYear, prevMonth, 32).getDate()
        // saylanan ayyn gunlerinin sany
        this.daysCurrentMonth = 32 - new Date(year, month, 32).getDate()
        // indi aydan galan dunlerin sany
        this.nextMonthDayCount = 42 - this.firstDay - this.daysCurrentMonth + 1
        this.hiddenOther()
      },
      prevMonth() {
        this.month = this.month - 1
        if (this.month < 0) {
          this.month = 11
          this.year = this.year - 1
        }
        this.calendar(this.year, this.month)
      },
      nextMonth() {
        this.month = this.month + 1
        if (this.month > 11) {
          this.month = 0
          this.year = this.year + 1
        }
        this.calendar(this.year, this.month)
      },
      activeMonth() {
        this.monthVisible = !this.monthVisible
        this.yearVisible = false
        if (this.monthVisible) {
          this.calendarMonthOpacity = 1
          this.calendarYearOpacity = 0.5
          this.calendarPickerStyle.visibility = 'visible'
          this.calendarPickerStyle.opacity = 1
        } else {
          this.calendarMonthOpacity = 1
          this.calendarYearOpacity = 1
          this.calendarPickerStyle.visibility = 'hidden'
          this.calendarPickerStyle.opacity = 0
        }
      },
      activeYear() {
        this.yearVisible = !this.yearVisible
        this.monthVisible = false

        if (this.yearVisible) {
          let scrollDiv = document.querySelector('.calendar__picker-year')
          let selectedYear = document.querySelector('.calendar__picker-year-selected')
          setTimeout(() => {
            scrollDiv.scrollBy(0, selectedYear.offsetTop - 100)
          }, 0)

          this.calendarMonthOpacity = 0.5
          this.calendarYearOpacity = 1
          this.calendarPickerStyle.visibility = 'visible'
          this.calendarPickerStyle.opacity = 1
        } else {
          this.calendarMonthOpacity = 1
          this.calendarYearOpacity = 1
          this.calendarPickerStyle.visibility = 'hidden'
          this.calendarPickerStyle.opacity = 0
        }
      },
      getYearNumbers(arrow = 0) {
        arrow === 0 ? (this.yearIndex = 0) : (this.yearIndex = this.yearIndex + arrow)
        let startYear = (Math.ceil(this.year / 12) + this.yearIndex) * 12 - 11
        if (startYear > 0) {
          this.yearNumbers = []
          for (let i = startYear; i < startYear + 12; i++) {
            this.yearNumbers.push(i)
          }
        } else {
          this.yearIndex = this.yearIndex - arrow
        }
      },
      hiddenOther() {
        this.monthVisible = false
        this.yearVisible = false
        this.calendarMonthOpacity = 1
        this.calendarYearOpacity = 1
        this.calendarPickerStyle.visibility = 'hidden'
        this.calendarPickerStyle.opacity = 0
      },
      setDate(day) {
        this.currentYear = this.year
        this.currentMonth = this.month
        this.currentDay = day
        this.$emit(
          'setCalendarDay',
          new Date(
            `${this.year}.${this.month + 1 < 10 ? `0${this.month + 1}` : this.month + 1}.${day < 10 ? `0${day}` : day}`
          )
        )
      }
    }
  }
</script>
<style lang="scss" scoped>
  .calendar {
    width: 256px;
    height: 340px;
    background-color: var(--white);
    box-shadow: var(--hover-shadow);
    border-radius: var(--box-radius);
    // .calendar__header
    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px 12px 24px;
    }
    // .calendar__arrow
    &__arrow {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--gray-600);
      font-size: 24px;
      icon {
        display: flex;
        cursor: pointer;
      }
    }
    // .calendar__arrow-prev
    &__arrow-prev {
      cursor: pointer;
      display: block;
      cursor: pointer;
    }
    // .calendar__arrow-next
    &__arrow-next {
      cursor: pointer;
    }
    // .calendar__monthyear
    &__monthyear {
      display: flex;
      font-weight: 500;
      font-size: 14px;
      line-height: 24px;
      letter-spacing: 0.1px;
      color: var(--gray-600);
      padding-left: 4px;
    }
    // .calendar__month
    &__month {
      cursor: pointer;
    }
    // .calendar__year
    &__year {
      cursor: pointer;
    }

    //.calendar__menu-down

    &__menu-down {
      display: block;
      padding-left: 9px;
    }

    // .calendar__body
    &__body {
      position: relative;
      padding: 0px 16px 8px 16px;
      // padding-top: 18px;
    }
    // .calendar__weekdays
    &__weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      // grid-gap: 8px;
      // padding-bottom: 20px;
    }
    // .calendar__weekday
    &__weekday {
      width: 32px;
      height: 32px;
      font-style: normal;
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      text-transform: uppercase;
      color: var(--gray-500);
      letter-spacing: 0.4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    // .calendar__days
    &__days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
    }
    // .calendar__day
    &__day {
      width: 32px;
      height: 32px;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.25px;
      color: var(--gray-700);
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: 50%;
      overflow: hidden;
      &:hover {
        color: var(--white);
        background: var(--primary);
        border-radius: 50%;
        .calendar__day-box {
          border-radius: 50%;
          background: var(--primary-600);
        }
      }
    }
    // .calendar__day-other
    &__day-other {
      opacity: 0.2;
      color: var(--gray-700) !important;
      cursor: auto;
    }
    // .calendar__day-active
    &__day-active {
      color: var(--white);
      .calendar__day-box {
        background: var(--primary-600);
        border-radius: 50%;
      }
    }
    // .calendar__day-no-event
    &__day-no-event {
    }
    // .calendar__day-text
    &__day-text {
      cursor: pointer;
      z-index: 2;
    }
    // .calendar__day-bullet
    &__day-bullet {
    }
    // .calendar__day-box
    &__day-box {
      position: absolute;
      z-index: 0;
      border-radius: 50%;
      cursor: pointer;
      width: 30px;
      height: 30px;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
    // .calendar__day-today
    &__day-today {
      color: var(--gray-700);
      .calendar__day-box {
        background-color: var(--white);
        border-color: var(--gray-700);
        border: 1px solid var(--gray-700);
        opacity: 1;
      }
    }
    &__day-selected {
      color: var(--white);
      .calendar__day-box {
        background-color: var(--primary-600);
        opacity: 1;
      }
    }
    // .calendar__day-selected
    &__day-selected {
    }
    // .calendar__picker
    &__picker {
      position: absolute;
      z-index: 201;
      width: 100%;
      top: 0;
      left: 0;
      bottom: 0;
      background-color: var(--white);
      display: flex;
      align-items: center;
      justify-content: center;
      visibility: hidden;
      opacity: 0;
    }
    // .calendar__picker-month
    &__picker-month {
      width: 100%;
      height: 100%;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      grid-template-rows: repeat(4, minmax(0, 1fr));
      grid-gap: 5px;
      padding: 20px;
    }
    // .calendar__picker-month-option
    &__picker-month-option {
      position: relative;
      border-radius: 30px;
      text-align: center;
      padding: 7px 0px;
      color: var(--gray-700);
      align-self: center;
      cursor: pointer;
      border: 1px solid transparent;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.25px;
      &::after {
        content: '';
        width: 100%;
        height: 100%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border-radius: 30px;
        z-index: -1;
      }
      &:hover {
        color: var(--white);
        &::after {
          background-color: var(--primary-600);
        }
      }
    }
    // .calendar__picker-month-today
    &__picker-month-today {
      border-color: var(--gray-700);
      color: var(--white);
    }
    // .calendar__picker-month-selected
    &__picker-month-selected {
      background-color: var(--primary-600);
      border-color: var(--primary-600);
      color: var(--white);
    }
    // .calendar__picker-year
    &__picker-year {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      grid-template-rows: auto;
      grid-gap: 5px;
      padding: 20px;
      overflow: auto;
      height: 100%;
      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.38);
        border-radius: 30px;
      }
    }
    // .calendar__picker-year-option
    &__picker-year-option {
      position: relative;
      text-align: center;
      color: var(--gray-700);
      border-radius: 30px;
      align-self: center;
      cursor: pointer;
      border: 1px solid transparent;
      padding: 10px 0;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.25px;
      &::after {
        content: '';
        width: 100%;
        height: 100%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border-radius: 30px;
        z-index: -1;
      }
      &:hover {
        color: var(--white);
        &::after {
          background-color: var(--primary-600);
          border-color: var(--primary-600);
        }
      }
    }
    // .calendar__picker-year-today
    &__picker-year-today {
      background-color: transparent;
      border-color: var(--gray-700);
      color: var(--gray-700);
    }
    // .calendar__picker-year-selected
    &__picker-year-selected {
      border-color: var(--primary-600);
      color: var(--white);
      background-color: var(--primary-600);
    }
  }
</style>
