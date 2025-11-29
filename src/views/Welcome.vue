<!-- \\src\views\Welcome.vue -->
<template>
  <div class="page in-view">
    <div class="page-container">
      <div class="page-info-title">
        <div class="page-image">
          <img class="image" src="../assets/logo.svg" />
        </div>
        <div class="page-info-header">
          <div class="page-info-subtitle subtitle">{{ $t('welcome.subtitle') }}</div>
          <div class="title">{{ $t('welcome.title') }}</div>
        </div>
      </div>
      <div class="page-info-text">
        <p class="info-description">{{ $t('welcome.text1') }}</p>
        <p class="info-description">{{ $t('welcome.text2') }}</p>
        <p class="info-description">{{ $t('welcome.text3') }}</p>
      </div>
      <div class="btn-container">
        <select :class="isDesktop ? 'w-150 py12' : 'mobile w-100'" name="uiLanguage" v-model="uiLanguage">
          <option v-for="lang in uiLanguages" :key="lang.code" :value="lang.code">
            {{ lang.name }}
          </option>
        </select>
        <router-link to="/auth" class="btn btn-menu" :class="isDesktop ? 'w-150' : 'mobile w-100'">
          <span class="material-symbols-outlined">account_circle</span>
          {{ $t('buttons.start') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useSettingsStore } from '../stores/settingsStore';
const settingsStore = useSettingsStore();
import { useBreakpoint } from '../composables/useBreakpoint.js';

const { isDesktop } = useBreakpoint();

const uiLanguages = [
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' },
  { code: 'uk', name: 'Українська' },
];

const uiLanguage = computed({
  get: () => settingsStore.uiLanguage,
  set: (value) => settingsStore.setUiLanguage(value),
});
</script>

<style scoped>
/* ========================================= */
/* PAGE LAYOUT */
/* ========================================= */
.page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: var(--space-xl);
  background: radial-gradient(ellipse at center, var(--radial-15) 15%, var(--radial-65) 65%);
  position: relative;
  overflow: hidden;
}

/* Декоративные градиентные круги */
.page::before,
.page::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.2;
  pointer-events: none;
  animation: float-slow 20s ease-in-out infinite;
}

.page::before {
  width: 400px;
  height: 400px;
  background: var(--gradient-purple);
  top: -100px;
  left: -100px;
}

.page::after {
  width: 350px;
  height: 350px;
  background: var(--gradient-gold);
  bottom: -100px;
  right: -100px;
  animation-delay: -10s;
}

@keyframes float-slow {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(30px, 30px) scale(1.1);
  }
}

/* ========================================= */
/* CONTAINER */
/* ========================================= */
.page-container {
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  text-align: center;
  gap: var(--space-xl);
  position: relative;
  z-index: 2;
  background: var(--bg-card);
  padding: var(--space-2xl);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-xl);
  animation: fadeInUp 0.8s ease-out;
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
/* HEADER SECTION */
/* ========================================= */
.page-info-title {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: var(--space-md);
}

.page-image {
  height: 120px;
  width: auto;
  flex-shrink: 0;
}

.image {
  height: 100%;
  padding-right: var(--space-md);
  filter: drop-shadow(0 4px 8px var(--shadow));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.page-info-header {
  height: 120px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.page-info-subtitle {
  font-size: var(--lg);
  color: var(--plan-pro-text);
  font-weight: 700;
  text-transform: uppercase;
  text-align: right;
  letter-spacing: var(--tracking-wide);
}

.page-info-title .title {
  text-align: left;
  font-size: var(--xxxl);
  line-height: var(--leading-none);
  color: var(--text-head);
  letter-spacing: var(--tracking-tight);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* ========================================= */
/* TEXT SECTION */
/* ========================================= */
.page-info-text {
  font-size: var(--sm);
  line-height: var(--leading-relaxed);
  color: var(--text-base);
  text-align: center;
}

.info-description {
  margin: var(--space-md) 0;
  opacity: 0;
  animation: fadeIn 0.6s ease-out forwards;
}

.info-description:nth-child(1) {
  animation-delay: 0.2s;
}

.info-description:nth-child(2) {
  animation-delay: 0.3s;
}

.info-description:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ========================================= */
/* BUTTON CONTAINER */
/* ========================================= */
.btn-container {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-md);
}

/* ========================================= */
/* SELECT (Language) */
/* ========================================= */
select {
  padding: 11px 12px;
  border-radius: var(--radius-sm);
  border: 2px solid var(--border);
  background: var(--bg-main);
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  color: var(--text-head);
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-xs);
}

select:hover {
  border-color: var(--bb);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

select:focus {
  border-color: var(--plan-pro-border);
  outline: none;
  box-shadow: 0 0 0 3px rgba(103, 58, 183, 0.1);
}

select option {
  padding: var(--space-sm);
  background: var(--bg-card);
  color: var(--text-base);
}

.py12 {
  padding: 11px 12px;
}

/* ========================================= */
/* RESPONSIVE */
/* ========================================= */
@media (min-width: 992px) {
  .page-container {
    max-width: 960px;
    padding: var(--space-2xl);
  }

  .page-info-header {
    height: 180px;
  }

  .page-image {
    height: 180px;
  }

  .image {
    height: 180px;
  }

  .page-info-title .title {
    font-size: 3rem;
  }
}
@media (max-width: 768px) {
  .page {
    padding: var(--space-md);
  }
  .page-container {
    padding: var(--space-xl);
    gap: var(--space-lg);
  }
  .page-info-title {
    flex-direction: column;
    align-items: center;
  }
  .page-info-header {
    height: auto;
    text-align: center;
  }
  .page-info-subtitle {
    text-align: center;
  }
  .page-info-title .title {
    text-align: center;
    font-size: var(--xxl);
  }
  .btn-container {
    gap: var(--space-sm);
  }
  select,
  .btn {
    width: 100% !important;
  }
}
@media (max-width: 480px) {
  .page-container {
    padding: var(--space-lg);
  }
  .page-image {
    height: 80px;
  }
  .image {
    height: 80px;
  }
  .page-info-title .title {
    font-size: var(--xl);
  }
}
</style>
