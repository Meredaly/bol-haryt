<template>
  <span class="icon" v-html="path"></span>
</template>

<script>
  import icons from './icons.js'
  export default {
    props: { name: { type: String, default: '' } },
    computed: {
      path() {
        return icons[this.name]
      }
    }
  }
</script>

<style lang="scss">
  .icon {
    display: flex;
  }
</style>
