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
        <router-link to="/auth" class="btn btn-menu oooo oolo" :class="isDesktop ? 'w-150' : 'mobile w-100'">
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
.page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 32px;
  background-color: var(--bg-card);
}
.page-container {
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  text-align: center;
  gap: 32px;
}
.page-info-header {
  height: 120px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.page-info-title {
  display: flex;
  justify-content: center;
  align-items: end;
}
.page-info-title .title {
  text-align: left;
  font-size: var(--xxxl);
  line-height: 1;
  color: var(--text-head);
  letter-spacing: 2px;
}
.page-image {
  height: 120px;
  width: auto;
  margin: 0 auto;
}
.image {
  height: 100%;
  padding-right: 16px;
}
.page-info-subtitle {
  font-size: var(--lg);
  color: var(--text-title);
  font-weight: 700;
  text-transform: uppercase;
  text-align: right;
}
.page-info-text {
  font-size: var(--sm);
  line-height: 1.6;
  color: var(--text-title);
  text-align: center;
}
.info-description {
  margin: 16px 0;
}
.btn-container {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
select {
  padding: 9px 4px;
  border-radius: 4px;
  border: 1px solid var(--bb);
  background-color: var(--y0);
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--xs);
  text-transform: uppercase;
  color: var(--text-head);
}
.py12 {
  padding: 11px 4px;
}

@media (min-width: 992px) {
  .page-container {
    max-width: 640px;
  }
  .page-info-header {
    height: 180px;
  }
  .page-image {
    height: 180px;
    width: auto;
    margin: 0 auto;
  }
  .image {
    height: 180px;
  }
}
</style>
