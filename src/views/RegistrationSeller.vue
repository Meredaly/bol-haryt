<script setup>
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useCookies } from 'vue3-cookies'
  import { useRouter } from 'vue-router'

  import MTextFiled from '@/UI/MTextFiled.vue'
  import MButton from '@/UI/MButton.vue'
  import HeaderLang from '@/components/header/HeaderLang.vue'
  import MImageUploader from '@/UI/MImageUploader.vue'

  import { REGISTRATION } from '@/api/auth-seller.api'

  const { t } = useI18n()

  const router = useRouter()
  const { cookies } = useCookies()

  const form = ref({
    market_name: '',
    name: '',
    number: '',
    email: '',
    description_tm: '',
    description_ru: '',
    fee: 0,
    address: '',
    logo: '',
    status: 1
  })

  const loading = ref(false)
  const error = ref(false)

  const submitForm = async () => {
    try {
      const { status } = await REGISTRATION({ data: form.value })
      if (status === 'error') {
        error.value = true
        return
      }
      if (status === 'success') {
        router.push('/login')
      }
    } catch (err) {
      console.error(err)
      error.value = true
    }
  }

  const changeImage = (files) => {
    if (files?.length) {
      form.value.logo = files[0]
    }
  }

  const signIn = () => {
    router.push('/login')
  }
  cookies.remove('AuthorizationSeller')
  cookies.remove('AuthorizationAdmin')
</script>

<template>
  <div class="registration">
    <div class="registration__wrapper">
      <div class="registration__header">
        <div class="registration__logo">
          <p><span>Bol</span>-haryt</p>
        </div>
        <div class="registration__lang">
          <header-lang />
        </div>
      </div>
      <div class="registration__box _box">
        <div class="registration__title">
          <h2>{{ t('authorization.welcome') }}</h2>
        </div>
        <form @submit.prevent="submitForm" class="registration__form">
          <div class="registration__item">
            <div class="registration__image">
              <m-image-uploader @change-file="changeImage" :title="t('uploadPhoto')" circle accept="image/*" />
            </div>
          </div>
          <div class="registration__item">
            <m-text-filed
              v-model.trim="form.market_name"
              :error="error"
              :disabled="loading"
              background
              :label="t('marketName')"
            />
          </div>
          <div class="registration__item">
            <m-text-filed v-model.trim="form.name" :error="error" :disabled="loading" background :label="t('name')" />
          </div>
          <div class="registration__item">
            <m-text-filed
              v-model.trim="form.number"
              :error="error"
              :disabled="loading"
              :label="t('phoneNumber')"
              placeholder="+9936XXXXXXX"
              background
            />
          </div>
          <div class="registration__item">
            <m-text-filed v-model.trim="form.email" :error="error" :disabled="loading" background :label="t('email')" />
          </div>
          <div class="registration__item">
            <m-textarea
              v-model.trim="form.address"
              :error="error"
              :disabled="loading"
              background
              :label="t('address')"
            />
          </div>
          <div class="registration__item">
            <m-textarea
              v-model.trim="form.description_ru"
              :error="error"
              :disabled="loading"
              background
              :label="t('descriptionRu')"
            />
          </div>
          <div class="registration__item">
            <m-textarea
              v-model.trim="form.description_tm"
              :error="error"
              :disabled="loading"
              background
              :label="t('descriptionTm')"
            />
          </div>
          <div class="registration__item">
            <m-button :loading="loading" :disabled="loading" block :title="t('registration')" />
          </div>
        </form>
        <div class="registration__other">
          <button @click="signIn">{{ t('signIn') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .registration {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    // .registration__wrapper
    &__wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      &::before {
        content: '';
        position: absolute;
        background-color: var(--white);
        height: 100%;
        width: 200%;
        top: 0;
        left: 0;
        border-radius: 50%;
        transform: translate(-25%, -50%);
      }
    }
    // .registration__header
    &__header {
      position: absolute;
      top: 20px;
      left: 20px;
      right: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    // .registration__logo
    &__logo {
      z-index: 1;
      p {
        font-size: 30px;
        line-height: 1;
        text-align: center;
        font-weight: 600;
      }
      span {
        font-weight: 800;
        color: var(--primary-600);
      }
    }
    // .registration__lang
    &__lang {
    }
    // .registration__box
    &__box {
      width: 400px;
      position: relative;
      z-index: 3;
      box-shadow: 4px 10px 40px rgba(0, 0, 0, 0.1);
    }
    // .registration__title
    &__title {
      margin-bottom: 20px;
    }
    // .registration__form
    &__form {
    }
    // .registration__item
    &__item {
      margin-bottom: 20px;
    }
    // .registration__image
    &__image {
      width: 120px;
      margin: 0 auto;
    }
    // .registration__other
    &__other {
      background-color: transparent;
      margin-top: 10px;
      margin-left: auto;
      width: fit-content;
      button {
        background-color: transparent;
        font-size: 14px;
        font-weight: 500;
        color: var(--gray-500);
      }
    }
  }
</style>
