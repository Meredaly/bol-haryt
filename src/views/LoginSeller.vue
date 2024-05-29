<script setup>
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useCookies } from 'vue3-cookies'
  import { useRouter } from 'vue-router'

  import MTextFiled from '@/UI/MTextFiled.vue'
  import MButton from '@/UI/MButton.vue'
  import HeaderLang from '@/components/header/HeaderLang.vue'

  import { AUTH } from '@/api/auth-seller.api'

  const { t } = useI18n()

  const router = useRouter()
  const { cookies } = useCookies()

  const number = ref('')

  const error = ref(false)
  const loading = ref(false)

  const sendMail = async () => {
    try {
      loading.value = true
      const { status } = await AUTH({ number: number.value })
      if (status === 'error') {
        error.value = true
        return
      }
      showCode.value = true
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  const showCode = ref(false)
  const otpCode = ref(0)
  const sendOtpCode = async () => {
    try {
      loading.value = true
      const { token, status } = await AUTH({
        number: number.value,
        otp: otpCode.value
      })
      if (status === 'error') {
        error.value = true
        return
      }
      cookies.set('AuthorizationSeller', token, 100000000)
      router.push('/')
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  }
  const registration = () => {
    router.push('/registration')
  }

  cookies.remove('AuthorizationSeller')
  cookies.remove('AuthorizationAdmin')
</script>

<template>
  <div class="login">
    <div class="login__wrapper">
      <div class="login__header">
        <div class="login__logo">
          <p><span>Bol</span>-haryt</p>
        </div>
        <div class="login__lang">
          <header-lang />
        </div>
      </div>
      <div class="login__box _box">
        <div class="login__title">
          <h2>{{ t('authorization.welcome') }}</h2>
        </div>
        <form v-if="!showCode" @submit.prevent="sendMail" class="login__form">
          <div class="login__input">
            <m-text-filed
              v-model="number"
              :error="error"
              :disabled="loading"
              type="text"
              :label="t('authorization.phoneNumber')"
              background
            />
          </div>
          <div class="login__button">
            <m-button :title="t('authorization.continue')" :disabled="loading" :loading="loading" block type="submit" />
          </div>
        </form>
        <form v-if="showCode" @submit.prevent="sendOtpCode" class="login__form">
          <div class="login__input">
            <m-text-filed
              v-model="otpCode"
              :error="error"
              :disabled="loading"
              type="number"
              :label="t('authorization.smsCode')"
              background
            />
          </div>
          <div class="login__button">
            <m-button :title="t('authorization.login')" :disabled="loading" :loading="loading" block type="submit" />
          </div>
        </form>
        <div class="login__other">
          <button @click="registration">{{ t('registration') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .login {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    // .login__wrapper
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
    // .login__header
    &__header {
      position: absolute;
      top: 20px;
      left: 20px;
      right: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    // .login__logo
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
    // .login__lang
    &__lang {
    }
    // .login__box
    &__box {
      width: 400px;
      position: relative;
      z-index: 3;
      box-shadow: 4px 10px 40px rgba(0, 0, 0, 0.1);
    }
    // .login__title
    &__title {
      margin-bottom: 20px;
    }
    // .login__form
    &__form {
    }
    // .login__input
    &__input {
      margin-bottom: 20px;
    }
    // .login__button
    &__button {
      margin-top: 30px;
    }
    // .login__other
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
