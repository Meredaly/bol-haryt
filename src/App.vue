<template>
  <component :is="layout">
    <router-view />
  </component>
  <the-toast />
</template>

<script>
  import Empty from '@/layouts/Empty.vue'
  import Default from '@/layouts/Default.vue'
  import TheToast from '@/components/TheToast.vue'
  export default {
    name: 'App',
    components: {
      Empty,
      Default,
      TheToast
    },
    computed: {
      layout() {
        return this.$route.meta?.layout || 'default'
      }
    }
  }
</script>

<style lang="scss">
  @import '@/assets/styles/fonts.scss';
  @import '@/assets/styles/style.scss';
</style>
