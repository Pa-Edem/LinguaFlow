<!-- src\components\Auth.vue -->
<template>
  <div class="form-container in-view">
    <div class="form-card">
      <h2 class="title">{{ isLoginMode ? $t('auth.in') : $t('auth.up') }}</h2>

      <p v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </p>

      <form @submit.prevent="handleSubmit">
        <div class="inputs">
          <input type="email" v-model="email" :placeholder="$t('auth.email')" required />
          <input type="password" v-model="password" :placeholder="$t('auth.pass')" required />
        </div>
        <button type="submit" class="btn btn-menu">
          <span class="material-symbols-outlined">{{ isLoginMode ? 'login' : 'account_circle' }}</span>
          {{ isLoginMode ? $t('auth.in') : $t('auth.up') }}
        </button>
      </form>

      <div class="divider">
        <span>{{ $t('auth.or') }}</span>
      </div>
      <button @click="handleGoogleSignIn" class="btn btn-menu">
        <img class="icon" src="../assets/google.svg" alt="Google icon" />
        Google
      </button>

      <p class="toggle-mode">
        {{ isLoginMode ? $t('auth.notAccount') : $t('auth.haveAccount') }}
        <button @click="toggleMode" class="toggle-link">
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
const errorMessage = ref('');

const isLoginMode = computed(() => mode.value === 'login');

const handleSubmit = async () => {
  userStore.isLoading = true;
  errorMessage.value = '';
  try {
    if (isLoginMode.value) {
      await userStore.loginWithEmail(email.value, password.value);
    } else {
      await userStore.registerWithEmail(email.value, password.value);
    }
    router.push({ name: 'all-dialogs' });
  } catch (error) {
    userStore.isLoading = false;
    errorMessage.value = getFriendlyErrorMessage(error.code);
  } finally {
    userStore.isLoading = false;
  }
};
const handleGoogleSignIn = async () => {
  userStore.isLoading = true;
  errorMessage.value = '';
  try {
    await userStore.loginWithGoogle();
    router.push({ name: 'all-dialogs' });
  } catch (error) {
    userStore.isLoading = false;
    errorMessage.value = getFriendlyErrorMessage(error.code);
  } finally {
    userStore.isLoading = false;
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
  padding: var(--md);
  position: relative;
  overflow: hidden;
}
.form-card {
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 2;
  background: var(--bg-card);
  padding: var(--xl);
  border-radius: var(--xxs);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-xl);
}
.title {
  text-align: center;
  margin-bottom: var(--lg);
  font-size: var(--xxxl);
}
.inputs {
  width: 100%;
  margin-bottom: var(--xxxl);
}
input {
  width: 100%;
  padding: var(--xs) var(--md);
  margin: var(--md) 0;
  border: 2px solid var(--border);
  border-radius: var(--xxxs);
  font-family: 'Roboto', sans-serif;
  font-size: var(--md);
  color: var(--text-base);
  background: var(--bg-main);
}
input::placeholder {
  color: var(--text-title);
  opacity: 0.6;
}
input:focus {
  outline: none;
  border-color: var(--bb);
}
input:hover {
  border-color: var(--bb);
}
.error-message {
  color: var(--r3);
  background: var(--r1);
  padding: var(--sm) var(--md);
  margin-bottom: var(--md);
  font-weight: 500;
  text-align: center;
  border-radius: var(--sm);
  border: 1px solid var(--r2);
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--md);
}
.divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: var(--text-title);
  margin: var(--xxs) 0;
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  font-weight: 500;
  background: none;
}
.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--border);
}
.divider span {
  padding: 0 var(--sm);
  border: none;
  text-transform: lowercase;
  font-weight: 400;
}
.toggle-mode {
  margin-top: var(--xl);
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  color: var(--text-base);
  text-align: center;
}
.toggle-link {
  background: none;
  border: none;
  padding: 0;
  margin-left: var(--xs);
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  font-weight: 600;
  color: var(--plan-pro-text);
  cursor: pointer;
  text-decoration: underline;
}
.toggle-link:hover {
  color: var(--plan-pro-border);
  text-decoration: none;
}
</style>
