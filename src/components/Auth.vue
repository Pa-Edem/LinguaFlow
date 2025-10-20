<!-- src\components\Auth.vue -->
<template>
  <div class="form-container">
    <div class="form-card">
      <div class="title">{{ isLoginMode ? $t('auth.in') : $t('auth.up') }}</div>

      <p
        v-if="errorMessage"
        class="error-message"
      >
        {{ errorMessage }}
      </p>

      <form @submit.prevent="handleSubmit">
        <div class="inputs">
          <input
            type="email"
            v-model="email"
            :placeholder="$t('auth.email')"
            required
          />
          <input
            type="password"
            v-model="password"
            :placeholder="$t('auth.pass')"
            required
          />
        </div>
        <button
          type="submit"
          class="btn btn-common"
          :disabled="isLoading"
        >
          <span
            v-if="!isLoading"
            class="material-symbols-outlined"
            >{{ isLoginMode ? 'login' : 'account_circle' }}</span
          >
          {{ isLoginMode ? $t('auth.in') : $t('auth.up') }}
        </button>
      </form>

      <div class="divider">
        <span>{{ $t('auth.or') }}</span>
      </div>
      <button
        @click="handleGoogleSignIn"
        class="btn btn-common"
        :disabled="isLoading"
      >
        <img
          class="icon"
          src="../assets/google.svg"
          alt="Google icon"
        />
        Google
      </button>

      <p class="toggle-mode">
        {{ isLoginMode ? $t('auth.notAccount') : $t('auth.haveAccount') }}
        <button
          @click="toggleMode"
          class="toggle-link"
        >
          {{ isLoginMode ? $t('auth.up') : $t('auth.in') }}
        </button>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useUserStore } from '../stores/userStore';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const mode = ref('login');

const isLoading = ref(false);
const errorMessage = ref('');

const isLoginMode = computed(() => mode.value === 'login');

const handleSubmit = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    if (isLoginMode.value) {
      await userStore.loginWithEmail(email.value, password.value);
    } else {
      await userStore.registerWithEmail(email.value, password.value);
    }
    router.push({ name: 'all-dialogs' });
  } catch (error) {
    errorMessage.value = getFriendlyErrorMessage(error.code);
  } finally {
    isLoading.value = false;
  }
};
const handleGoogleSignIn = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    await userStore.loginWithGoogle();
    router.push({ name: 'all-dialogs' });
  } catch (error) {
    errorMessage.value = getFriendlyErrorMessage(error.code);
  } finally {
    isLoading.value = false;
  }
};
const toggleMode = () => {
  mode.value = isLoginMode.value ? 'signup' : 'login';
  errorMessage.value = '';
};
function getFriendlyErrorMessage(errorCode) {
  switch (errorCode) {
    case 'auth/wrong-password':
      return $t('auth.errPass');
    case 'auth/user-not-found':
      return $t('auth.errUser');
    case 'auth/email-already-in-use':
      return $t('auth.errEmail');
    default:
      return $t('auth.errDefault');
  }
}
</script>

<style scoped>
.form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 16px;
}
.form-card {
  width: 100%;
  max-width: 420px;
  background: var(--bg-card);
  padding: 32px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--shadow);
}
.title {
  text-align: center;
  margin-bottom: 32px;
  font-size: var(--xxl);
}
.form-group {
  margin-bottom: 24px;
}
.inputs {
  width: 100%;
  margin-bottom: 24px;
}
input,
select {
  width: 100%;
  padding: 12px;
  margin: 1rem auto;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: var(--md);
}
input:focus,
select:focus {
  border-color: var(--y5);
}
.submit-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 32px;
}
.error-message {
  color: var(--r3);
  margin-bottom: 16px;
  font-weight: 500;
  text-align: center;
}
.divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: var(--text-title);
  margin: 24px 0;
  font-size: var(--base);
}
.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--border);
}
.divider:not(:empty)::before {
  margin-right: 16px;
}
.divider:not(:empty)::after {
  margin-left: 16px;
}
.toggle-mode {
  margin-top: 32px;
  font-size: var(--base);
  color: var(--text-title);
  text-align: center;
}
.toggle-link {
  background: none;
  border: none;
  padding: 0;
  margin-left: 8px;
  font-size: var(--base);
  font-weight: 500;
  color: var(--head);
  cursor: pointer;
  text-decoration: underline;
}
</style>
