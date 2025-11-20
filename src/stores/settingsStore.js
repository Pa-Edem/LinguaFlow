// src/stores/settingsStore.js
import { defineStore } from 'pinia';
import i18n from '../i18n';
import { useUserStore } from './userStore';
import { functions, httpsCallable } from '../firebase';
import { getLangCode } from '../utils/languageUtils';

export const DEFAULT_VOICE_CONFIG = { name: 'default', pitch: 0.0 };

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    theme: 'light',
    uiLanguage: 'en',
    learningLanguage: 'Suomi',
    speechRate: 1.0,
    ton: 0,
    selectedVoiceConfig: DEFAULT_VOICE_CONFIG,
    preferBrowserTTS: false,
    availableVoices: [],
    isLoadingVoices: false,
    limit: {
      useProMode: 2,
      dailyGenerations: 2,
      totalDialogs: 10,
    },
    dailyPreviewCount: 0,
    dailyGenerationCount: 0,
    date: new Date().toDateString(),
  }),
  actions: {
    setTheme(newTheme) {
      this.theme = newTheme;
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('app-theme', newTheme);
    },
    setUiLanguage(lang) {
      this.uiLanguage = lang;
      i18n.global.locale.value = lang;
      localStorage.setItem('app-ui-language', lang);
    },
    setLearningLanguage(lang) {
      this.learningLanguage = lang;
      localStorage.setItem('app-learning-language', lang);

      this.setSelectedVoiceConfig(DEFAULT_VOICE_CONFIG);
      // this.fetchAvailableVoices();
      // ✅ ДОБАВЬТЕ ПРОВЕРКУ: Загружаем голоса только если залогинены
      const userStore = useUserStore();
      if (userStore.isLoggedIn) {
        this.fetchAvailableVoices();
      }
    },
    setSpeechRate(rate) {
      this.speechRate = parseFloat(rate);
      localStorage.setItem('app-speech-rate', this.speechRate);
    },
    setTon(ton) {
      this.ton = parseInt(ton);
    },
    setSelectedVoiceConfig(config) {
      this.selectedVoiceConfig = config;
      localStorage.setItem('app-voice-config', JSON.stringify(config));
    },
    setPreferBrowserTTS(value) {
      this.preferBrowserTTS = value;
      localStorage.setItem('app-prefer-browser-tts', JSON.stringify(value));
    },
    async fetchAvailableVoices() {
      this.isLoadingVoices = true;
      this.availableVoices = [];
      try {
        const langCode = getLangCode(this.learningLanguage);

        const getVoices = httpsCallable(functions, 'getAvailableVoices');
        const response = await getVoices({ langCode: langCode });

        if (response.data && response.data.voices) {
          this.availableVoices = response.data.voices;
        }
      } catch (error) {
        const errorMessage = i18n.global.t('store.voicesError');
        console.error(errorMessage, error);
      } finally {
        this.isLoadingVoices = false;
      }
    },
    async loadUsageStats() {
      try {
        const getUsageStats = httpsCallable(functions, 'getUsageStats');
        const response = await getUsageStats();

        if (response.data) {
          // ✅ Обновляем счётчики из Firestore
          this.dailyGenerationCount = response.data.dailyGenerationCount || 0;
          this.dailyPreviewCount = response.data.dailyPreviewCount || 0;
          this.date = response.data.date;

          // ✅ Обновляем лимиты из Firestore
          if (response.data.limits) {
            this.limit.dailyGenerations = response.data.limits.dailyGenerations;
            this.limit.useProMode = response.data.limits.dailyPreview;
            this.limit.totalDialogs = response.data.limits.totalDialogs;
          }

          console.log(
            `📊 Счётчики загружены: gen=${this.dailyGenerationCount}/${this.limit.dailyGenerations}, preview=${this.dailyPreviewCount}/${this.limit.useProMode}`
          );
        }
      } catch (error) {
        console.error('❌ Ошибка загрузки счётчиков:', error);
      }
    },
    initSettings() {
      // ЗАГРУЗКИ ТЕМЫ
      const savedTheme = localStorage.getItem('app-theme');
      this.setTheme(savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'light' : 'dark'));
      // ЗАГРУЗКИ ЯЗЫКОВ
      const savedUiLang = localStorage.getItem('app-ui-language');
      if (savedUiLang) {
        this.setUiLanguage(savedUiLang || 'en');
      }
      const savedLearningLang = localStorage.getItem('app-learning-language');
      this.setLearningLanguage(savedLearningLang || 'Suomi');
      // ЗАГРУЗКА НАСТРОЕК ОЗВУЧКИ
      const savedRate = localStorage.getItem('app-speech-rate');
      if (savedRate) {
        this.speechRate = parseFloat(savedRate);
      }
      const savedVoiceConfig = localStorage.getItem('app-voice-config');
      if (savedVoiceConfig) {
        this.selectedVoiceConfig = JSON.parse(savedVoiceConfig);
      }

      const userStore = useUserStore();
      if (userStore.isLoggedIn) {
        this.fetchAvailableVoices();
      }
      const savedPreferBrowserTTS = localStorage.getItem('app-prefer-browser-tts');
      if (savedPreferBrowserTTS) {
        this.preferBrowserTTS = JSON.parse(savedPreferBrowserTTS);
      }

      // Загружаем счётчики с сервера (если залогинены)
      if (userStore.isLoggedIn) {
        this.loadUsageStats();
      }
    },
  },
});
