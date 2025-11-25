<!-- \\src\views\Settings.vue -->
<template>
  <div class="settings-page in-view">
    <header class="page-header">
      <h1 class="page-title">{{ $t('settings.title') }}</h1>
    </header>

    <main class="settings-content">
      <!-- тема -->
      <div class="settings-group">
        <h2 class="group-title">{{ $t('settings.appearance') }}</h2>
        <div class="setting-item">
          <label>{{ $t('settings.theme') }}</label>
          <div class="theme-switcher">
            <button @click="settingsStore.setTheme('light')" :class="{ active: settingsStore.theme === 'light' }">
              <span class="material-symbols-outlined">light_mode</span>
              <!-- {{ $t('settings.light') }} -->
            </button>
            <button @click="settingsStore.setTheme('dark')" :class="{ active: settingsStore.theme === 'dark' }">
              <span class="material-symbols-outlined">dark_mode</span>
              <!-- {{ $t('settings.dark') }} -->
            </button>
          </div>
        </div>
      </div>
      <!-- язык -->
      <div class="settings-group">
        <h2 class="group-title">{{ $t('settings.language') }}</h2>
        <div class="setting-item">
          <label for="ui-lang-select">{{ $t('settings.appLanguage') }}</label>
          <select id="ui-lang-select" v-model="uiLanguage">
            <option v-for="lang in uiLanguages" :key="lang.code" :value="lang.code">
              {{ lang.name }}
            </option>
          </select>
        </div>
        <div class="setting-item">
          <label for="learning-lang-select">{{ $t('settings.languageToLearn') }}</label>
          <select id="learning-lang-select" v-model="learningLanguage">
            <option v-for="lang in learningLanguages" :key="lang" :value="lang">
              {{ lang }}
            </option>
          </select>
        </div>
      </div>
      <!-- озвучка -->
      <div class="settings-group">
        <h2 class="group-title">
          {{ $t('settings.voiceSettings') }}
          <span class="material-symbols-outlined pro">crown</span>
        </h2>

        <div v-if="userStore.isPro" class="setting-item">
          <label for="browser-tts-check">{{ $t('settings.useBrowserTTS') }}</label>
          <input id="browser-tts-check" type="checkbox" class="toggle-switch" v-model="preferBrowserTTS" />
        </div>

        <div v-if="!preferBrowserTTS" class="setting-item">
          <label for="voice-select">{{ $t('settings.voice') }}</label>
          <div class-="voice-selector-wrapper">
            <Loader v-if="settingsStore.isLoadingVoices" class="mini-loader" />
            <select
              id="voice-select"
              v-model="selectedVoiceConfig"
              :disabled="!userStore.isPro || settingsStore.isLoadingVoices"
            >
              <option :value="DEFAULT_VOICE_CONFIG">{{ $t('settings.defaultVoice') }}</option>
              <option v-for="(voice, index) in settingsStore.availableVoices" :key="index" :value="voice.config">
                {{ formatVoiceName(voice, index) }}
              </option>
            </select>
          </div>
        </div>

        <div class="setting-item slider">
          <div class="slider-info">
            <label for="speed-slider">{{ $t('settings.speechRate') }}</label>
            <span>x{{ parseFloat(speechRate).toFixed(2) }}</span>
          </div>
          <div class="slider-container">
            <input
              id="speed-slider"
              type="range"
              min="0.75"
              max="1.25"
              step="0.05"
              v-model="speechRate"
              :disabled="!userStore.isPro"
            />
          </div>
        </div>

        <div class="setting-item test">
          <label>{{ $t('settings.preListening') }}</label>
          <button
            class="btn btn-common oooo oolo"
            :class="isDesktop ? 'w-250' : 'mobile w-100'"
            @click="togglePlayTest"
          >
            <span class="material-symbols-outlined">play_circle</span>
            {{ $t('settings.test') }}
          </button>
        </div>
      </div>
    </main>

    <footer class="page-footer">
      <router-link
        to="/dialogs"
        name="all-dialogs"
        class="btn btn-action oooo looo"
        :class="isDesktop ? 'w-250' : 'mobile'"
      >
        <span class="material-symbols-outlined">check</span>
        {{ $t('buttons.done') }}
      </router-link>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useSettingsStore, DEFAULT_VOICE_CONFIG } from '../stores/settingsStore';
import { useTrainingStore } from '../stores/trainingStore';
import { useUserStore } from '../stores/userStore';
import { useBreakpoint } from '../composables/useBreakpoint';
import { useI18n } from 'vue-i18n';
import Loader from '../components/Loader.vue';

const settingsStore = useSettingsStore();
const trainingStore = useTrainingStore();
const userStore = useUserStore();
const { t } = useI18n();
const { isDesktop } = useBreakpoint();

const uiLanguages = [
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' },
  { code: 'uk', name: 'Українська' },
];
const learningLanguages = [
  'Suomi',
  'Svenska',
  'Norsk',
  'Dansk',
  'Nederlands',
  'Polski',
  'Deutsch',
  'English',
  'Українська',
  'Русский',
  'Čeština',
  'Slovenčina',
  'Français',
  'Română',
  'Magyar',
  'Hrvatski',
  'Српски',
  'Italiano',
  'Português',
  'Español',
];

const uiLanguage = computed({
  get: () => settingsStore.uiLanguage,
  set: (value) => settingsStore.setUiLanguage(value),
});
const learningLanguage = computed({
  get: () => settingsStore.learningLanguage,
  set: (value) => settingsStore.setLearningLanguage(value),
});
const speechRate = computed({
  get: () => settingsStore.speechRate,
  set: (value) => settingsStore.setSpeechRate(value),
});
const selectedVoiceConfig = computed({
  get: () => settingsStore.selectedVoiceConfig,
  set: (value) => settingsStore.setSelectedVoiceConfig(value),
});
const preferBrowserTTS = computed({
  get: () => settingsStore.preferBrowserTTS,
  set: (value) => settingsStore.setPreferBrowserTTS(value),
});

const formatVoiceName = (voice, index) => {
  if (!voice || !voice.config) return '...';

  // ✅ НОВОЕ: Используем displayName если есть
  if (voice.displayName) {
    const premium = voice.isPremium ? ' 👑' : '';
    return `${voice.displayName}${premium}`;
  }

  // Fallback на старую логику (если displayName нет)
  const genderMap = {
    FEMALE: t('settings.female'),
    MALE: t('settings.male'),
    NEUTRAL: t('settings.neutral'),
  };
  const gender = genderMap[voice.ssmlGender] || '';
  const displayName = `${t('settings.voice')} ${index + 1} ${gender} ${voice.isPremium ? '👑' : ''}`;

  return displayName;
};
const togglePlayTest = () => {
  trainingStore.playProDemoVoice();
};
</script>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 800px;
  margin: 0 auto;
  overflow: hidden;
}
.page-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.page-title {
  margin: 16px 0 0 16px;
  font-size: var(--lg);
  font-family: 'Roboto Condensed', sans-serif;
  color: var(--text-head);
}
.desktop-only {
  display: none;
}
.settings-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0 16px 32px 16px;
}
.settings-group {
  padding: 12px 0;
}
.group-title {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--xs);
  font-weight: 700;
  text-align: center;
  color: var(--text-base);
  text-transform: uppercase;
  padding-bottom: 2px;
  border-bottom: 1px solid var(--border);
}
.group-title .pro {
  font-size: var(--xs);
  color: var(--bg-pro);
  vertical-align: middle;
  margin-left: 8px;
}
.page-footer {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  padding: 16px 0;
  border-top: 1px solid var(--border);
}
.setting-item {
  height: 36px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}
.setting-item label {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  color: var(--text-title);
}
.theme-switcher {
  display: flex;
  border-radius: 8px;
  gap: 16px;
}
.theme-switcher button {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 6px;
  background-color: var(--bg-side);
  color: var(--text-head);
  cursor: pointer;
  box-shadow: 2px 2px 3px var(--shadow);
  transition: all 0.2s ease-in-out;
}
.theme-switcher button.active {
  background-color: var(--y5);
  color: var(--y0);
  box-shadow: inset 2px 2px 3px var(--shadow);
}
.setting-item select {
  max-width: 240px;
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background-color: var(--bg-group);
  font-size: var(--sm);
  color: var(--text-base);
}
.setting-item select option .pro-voice {
  font-size: var(--xs);
  color: var(--bg-pro);
  vertical-align: middle;
  margin-left: 8px;
}
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  appearance: none;
  -webkit-appearance: none;
  background: var(--y0);
  border-radius: 34px;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: background-color 0.2s;
}
.toggle-switch::before {
  content: '';
  position: absolute;
  left: 2px;
  top: 2px;
  width: 18px;
  height: 18px;
  background-color: var(--y10);
  border-radius: 50%;
  transition: transform 0.2s;
}
.toggle-switch:checked {
  background-color: var(--y9);
}
.toggle-switch:checked::before {
  background-color: var(--text-title);
  transform: translateX(20px);
}
.toggle-switch:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.setting-item.slider {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.slider-container {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}
.slider-info {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}
.slider-info label,
.slider-info span {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  color: var(--text-title);
}
.slider-container span {
  font-size: var(--xs);
  color: var(--text-base);
}
.slider-container input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 8px;
  background: var(--bg-group);
  border-radius: 4px;
  border: 1px solid var(--border);
}
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: var(--g3);
  cursor: pointer;
  border-radius: 50%;
}
input[type='range']::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: var(--g3);
  cursor: pointer;
  border-radius: 50%;
}
.setting-item.test {
  margin-top: 16px;
}
.setting-item *:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.setting-item *:disabled::-webkit-slider-thumb {
  background: var(--text-base);
}
.setting-item *:disabled::-moz-range-thumb {
  background: var(--text-base);
}
.voice-selector-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.mini-loader {
  background: none;
  backdrop-filter: none;
  position: static;
}
@media (min-width: 768px) {
  .settings-page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding: 32px 0;
  }
  .mobile-only {
    display: none;
  }
  .desktop-only {
    display: flex;
  }
  .settings-content {
    flex-grow: 1;
    overflow-y: auto;
    padding-right: 8px;
  }
  .setting-item label {
    font-size: var(--sm);
  }
  .page-footer {
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    padding-top: 16px;
    border-top: 1px solid var(--border);
  }
}
</style>
