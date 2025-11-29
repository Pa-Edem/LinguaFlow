<!-- src\components\Auth.vue -->
<!-- <template>
  <div class="form-container in-view">
    <div class="form-card">
      <div class="title">{{ isLoginMode ? $t('auth.in') : $t('auth.up') }}</div>

      <p v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </p>

      <form @submit.prevent="handleSubmit">
        <div class="inputs">
          <input type="email" v-model="email" :placeholder="$t('auth.email')" required />
          <input type="password" v-model="password" :placeholder="$t('auth.pass')" required />
        </div>
        <button type="submit" class="btn btn-common oooo oloo">
          <span class="material-symbols-outlined">{{ isLoginMode ? 'login' : 'account_circle' }}</span>
          {{ isLoginMode ? $t('auth.in') : $t('auth.up') }}
        </button>
      </form>

      <div class="divider">
        <span>{{ $t('auth.or') }}</span>
      </div>
      <button @click="handleGoogleSignIn" class="btn btn-common oooo looo">
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
  padding: 16px;
}
.form-card {
  width: 100%;
  max-width: 420px;
  background: var(--bg-side);
  padding: 32px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--shadow);
}
.title {
  text-align: center;
  margin-bottom: 16px;
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
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
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
  margin: 16px 0;
  font-family: 'Roboto Condensed', sans-serif;
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
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  color: var(--text-title);
  text-align: center;
}
.toggle-link {
  background: none;
  border: none;
  padding: 0;
  margin-left: 16px;
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  color: var(--head);
  cursor: pointer;
  text-decoration: underline;
}
</style> -->

<!-- НОВЫЕ СТИЛИ -->
<!-- src\components\Auth.vue -->
<template>
  <div class="form-container in-view">
    <div class="form-card">
      <div class="title">{{ isLoginMode ? $t('auth.in') : $t('auth.up') }}</div>

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
/* ========================================= */
/* FORM CONTAINER */
/* ========================================= */
.form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: var(--space-md);
  background: radial-gradient(ellipse at center, var(--radial-15) 15%, var(--radial-65) 65%);
  position: relative;
  overflow: hidden;
}

/* Декоративные элементы */
.form-container::before {
  content: '';
  position: absolute;
  width: 400px;
  height: 400px;
  background: var(--gradient-purple);
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.15;
  top: -150px;
  right: -150px;
  pointer-events: none;
  animation: float-slow 15s ease-in-out infinite;
}

@keyframes float-slow {
  0%,
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(30px, 30px);
  }
}

/* ========================================= */
/* FORM CARD */
/* ========================================= */
.form-card {
  width: 100%;
  max-width: 420px;
  background: var(--bg-card);
  padding: var(--space-2xl) var(--space-xl);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-xl);
  position: relative;
  z-index: 2;
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ========================================= */
/* TITLE */
/* ========================================= */
.title {
  text-align: center;
  margin-bottom: var(--space-lg);
  font-size: var(--xxl);
  color: var(--text-head);
  font-weight: 700;
  letter-spacing: var(--tracking-tight);
}

/* ========================================= */
/* INPUTS */
/* ========================================= */
.inputs {
  width: 100%;
  margin-bottom: var(--space-lg);
}

input,
select {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  margin: var(--space-md) 0;
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  color: var(--text-base);
  background: var(--bg-main);
  transition: all var(--transition-base);
  box-shadow: var(--shadow-xs);
}

input::placeholder {
  color: var(--text-title);
  opacity: 0.6;
}

input:focus,
select:focus {
  outline: none;
  border-color: var(--plan-pro-border);
  box-shadow: 0 0 0 3px rgba(103, 58, 183, 0.1);
  transform: translateY(-1px);
}

input:hover,
select:hover {
  border-color: var(--bb);
}

/* ========================================= */
/* ERROR MESSAGE */
/* ========================================= */
.error-message {
  color: var(--r3);
  background: var(--r1);
  padding: var(--space-sm) var(--space-md);
  margin-bottom: var(--space-md);
  font-weight: 500;
  text-align: center;
  border-radius: var(--radius-sm);
  border: 1px solid var(--r2);
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  animation: shake 0.4s ease-in-out;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-8px);
  }
  75% {
    transform: translateX(8px);
  }
}

/* ========================================= */
/* DIVIDER */
/* ========================================= */
.divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: var(--text-title);
  margin: var(--space-lg) 0;
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
  padding: 0 var(--space-sm);
  border: none;
  text-transform: lowercase;
  letter-spacing: var(--tracking-wide);
  font-weight: 400;
}

/* ========================================= */
/* TOGGLE MODE */
/* ========================================= */
.toggle-mode {
  margin-top: var(--space-xl);
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  color: var(--text-base);
  text-align: center;
  line-height: var(--leading-relaxed);
}

.toggle-link {
  background: none;
  border: none;
  padding: 0;
  margin-left: var(--space-xs);
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  font-weight: 600;
  color: var(--plan-pro-text);
  cursor: pointer;
  text-decoration: underline;
  transition: all var(--transition-base);
}

.toggle-link:hover {
  color: var(--plan-pro-border);
  text-decoration: none;
}

/* ========================================= */
/* RESPONSIVE */
/* ========================================= */
@media (max-width: 768px) {
  .form-container {
    padding: var(--space-sm);
  }

  .form-card {
    padding: var(--space-xl) var(--space-lg);
  }

  .title {
    font-size: var(--xl);
  }
}

@media (max-width: 480px) {
  .form-card {
    padding: var(--space-lg) var(--space-md);
  }

  input,
  select {
    padding: var(--space-sm);
  }
}
</style>
