<script setup>
  import { useI18n } from 'vue-i18n'
  import MPopUpBody from '@/UI/MPopUpBody.vue'
  import MButton from '@/UI/MButton.vue'

  const { t } = useI18n()

  const emit = defineEmits(['no', 'yes'])

  const props = defineProps({
    title: { type: String, default: 'CONFIRM' }
  })

  const no = () => {
    emit('no')
  }

  const yes = () => {
    emit('yes')
  }
</script>

<template>
  <m-pop-up-body width="400" @close="no">
    <div class="h3">{{ title }}</div>
    <template v-slot:bot>
      <div class="flex flex-x-end gap-10">
        <m-button @click="no" :title="t('no')" styles="secondary" block />
        <m-button @click="yes" :title="t('yes')" styles="danger" block />
      </div>
    </template>
  </m-pop-up-body>
</template>

<style lang="scss" scoped></style>
