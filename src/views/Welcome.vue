<!-- \\src\views\Welcome.vue -->
<template>
  <div class="page in-view">
    <div class="page-container">
      <div class="page-info">
        <div class="page-image">
          <img class="image" src="../assets/logo.svg" />
        </div>
        <div class="header">
          <h3 class="subtitle">{{ $t('welcome.subtitle') }}</h3>
          <h1 class="title">{{ $t('welcome.title') }}</h1>
        </div>
      </div>
      <div class="text">
        <p class="description">{{ $t('welcome.text1') }}</p>
        <p class="description">{{ $t('welcome.text2') }}</p>
        <p class="description">{{ $t('welcome.text3') }}</p>
      </div>
      <div class="btn-container">
        <select class="btn" :class="isDesktop ? 'w-150' : 'mobile w-125'" name="uiLanguage" v-model="uiLanguage">
          <option v-for="lang in uiLanguages" :key="lang.code" :value="lang.code">
            {{ lang.name }}
          </option>
        </select>
        <router-link to="/auth" class="btn btn-menu" :class="isDesktop ? 'w-150' : 'mobile w-125'">
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
/* MOBILES (767px and down) */
.page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: var(--md);
  position: relative;
  overflow: hidden;
}
.page-container {
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  text-align: center;
  gap: var(--xl);
  position: relative;
  z-index: 2;
  background: var(--bg-card);
  padding: var(--lg);
  border-radius: var(--xxs);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-xl);
}
.page-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--md);
}
.page-image {
  height: 120px;
  width: auto;
  flex-shrink: 0;
}
.image {
  height: 100%;
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
.header {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--md);
}
.subtitle {
  font-size: var(--lg);
  color: var(--text-title);
  text-transform: uppercase;
  text-align: right;
}
.title {
  text-align: left;
  font-size: calc(var(--xxxl) * 1.5);
  color: var(--text-head);
}
.text {
  font-size: var(--lg);
  color: var(--text-base);
  text-align: center;
}
.description {
  margin: var(--md) 0;
}
.btn-container {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--md);
}
select {
  padding: 11px 12px;
  border-radius: var(--xxxs);
  border: 2px solid var(--border);
  background: var(--bg-main);
  color: var(--text-head);
}
select:hover {
  border-color: var(--bb);
}
select:focus {
  border-color: var(--bb);
  outline: none;
}
select option {
  padding: var(--sm);
  background-color: var(--bg-card);
  color: var(--text-base);
}
/* TABLETS (768px and up) */
@media (min-width: 768px) {
  .page-container {
    max-width: 640px;
    gap: var(--xxl);
    padding: var(--xl);
  }
}
/* DESKTOPS (1200px and up) */
@media (min-width: 1200px) {
  .page-container {
    max-width: 960px;
    gap: var(--xxxl);
    padding: var(--xxxl);
  }
  .page-info {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: var(--xxxl);
  }
}
</style>
