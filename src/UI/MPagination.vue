<template>
  <ul :class="paginationClasses.ul">
    <li v-if="paginationLabels.prev" :class="`${paginationClasses.li} ${hasFirst ? paginationClasses.liDisable : ''}`">
      <button
        @click="prev"
        :disabled="hasFirst"
        :class="`${paginationClasses.button} ${hasFirst ? paginationClasses.buttonDisable : ''} pagination__arrow`"
      >
        <MIcons name="chevronLeft" />
      </button>
    </li>

    <li
      v-for="page in items"
      :key="page.label"
      :class="`${paginationClasses.li} ${page.active ? paginationClasses.liActive : ''} ${page.disable ? paginationClasses.liDisable : ''}`"
    >
      <span v-if="page.disable" :class="`${paginationClasses.button} ${paginationClasses.buttonDisable}`"> ... </span>
      <button v-else @click="goto(page.label)" :class="`${paginationClasses.button} ${page.active ? paginationClasses.buttonActive : ''}`">
        {{ page.label }}
      </button>
    </li>

    <li v-if="paginationLabels.next" :class="`${paginationClasses.li} ${hasLast ? paginationClasses.liDisable : ''}`">
      <button
        @click="next"
        :disabled="hasLast"
        :class="`${paginationClasses.button} ${hasLast ? paginationClasses.buttonDisable : ''} pagination__arrow`"
      >
        <MIcons name="chevronRight" />
      </button>
    </li>
  </ul>
</template>

<script>
  import MIcons from './MIcons.vue'

  const defaultClasses = {
    ul: 'pagination',
    li: 'pagination__item',
    liActive: 'pagination__item--active',
    liDisable: 'pagination__item--disable',
    button: 'pagination__link',
    buttonActive: 'pagination__link--active',
    buttonDisable: 'pagination__link--disable'
  }
  const defaultLabels = {
    first: '&laquo;',
    prev: '&lsaquo;',
    next: '&rsaquo;',
    last: '&raquo;'
  }

  export default {
    props: {
      modelValue: {
        type: Number,
        required: true
      },
      pageCount: {
        type: Number,
        required: true
      },
      classes: {
        type: Object,
        required: false,
        default: () => ({})
      },
      labels: {
        type: Object,
        required: false,
        default: () => ({})
      }
    },
    data() {
      return {
        paginationClasses: {
          ...defaultClasses,
          ...this.classes
        },
        paginationLabels: {
          ...defaultLabels,
          ...this.labels
        }
      }
    },
    mounted() {
      if (this.modelValue > this.pageCount) {
        this.$emit('input', this.pageCount)
      }
    },
    computed: {
      items() {
        let valPrev = this.modelValue > 1 ? this.modelValue - 1 : 1 // for easier navigation - gives one previous page
        let valNext = this.modelValue < this.pageCount ? this.modelValue + 1 : this.pageCount // one next page
        let extraPrev = valPrev === 3 ? 2 : null
        let extraNext = valNext === this.pageCount - 2 ? this.pageCount - 1 : null
        let dotsBefore = valPrev > 3 ? 2 : null
        let dotsAfter = valNext < this.pageCount - 2 ? this.pageCount - 1 : null
        let output = []
        for (let i = 1; i <= this.pageCount; i += 1) {
          if ([1, this.pageCount, this.modelValue, valPrev, valNext, extraPrev, extraNext, dotsBefore, dotsAfter].includes(i)) {
            output.push({
              label: i,
              active: this.modelValue === i,
              disable: [dotsBefore, dotsAfter].includes(i)
            })
          }
        }
        return output
      },
      hasFirst() {
        return this.modelValue === 1
      },
      hasLast() {
        return this.modelValue === this.pageCount
      }
    },
    methods: {
      first() {
        !this.hasFirst && this.$emit('clickPage', 1)
      },
      prev() {
        !this.hasFirst && this.$emit('clickPage', this.modelValue - 1)
      },
      goto(page) {
        this.$emit('clickPage', page)
      },
      next() {
        !this.hasLast && this.$emit('clickPage', this.modelValue + 1)
      },
      last() {
        !this.hasLast && this.$emit('clickPage', this.pageCount)
      }
    },
    components: { MIcons }
  }
</script>

<style lang="scss" scoped>
  .pagination {
    display: flex;
    gap: 10px;
    // .pagination__item
    &__item {
      &--active {
      }
      &--disable {
      }
      span {
      }
    }
    // .pagination__link
    &__link {
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      text-align: center;
      color: var(--gray-700);
      border-radius: 16px;
      min-width: 32px;
      padding: 6px;
      display: block;
      background-color: transparent;
      &:hover {
        background: var(--gray-700);
        color: var(--white);
      }
      &--active {
        color: var(--white);
        background: var(--primary-600);
        &:hover {
          background: var(--primary-700);
        }
      }
      &--disable {
        color: var(--gray-700) !important;
        pointer-events: none;
      }
    }

    // .pagination__arrow
    &__arrow {
      font-size: 20px;
      i {
        display: flex;
      }
    }
  }
</style>
