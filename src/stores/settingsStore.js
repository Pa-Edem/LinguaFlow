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
      dailyGenerations: 2,
      weeklyGenerationsCap: 10,
      dailyGenerationsMax: 4,
      dailyPreview: 2,
      weeklyPreviewCap: 20,
      dailyPreviewMax: 8,
      totalDialogs: 15,
      unlimitedAnalysis: false,
    },
    date: new Date().toDateString(),

    // ✅ НОВЫЕ счётчики с накоплением
    accumulatedGenerations: 0,
    accumulatedPreview: 0,
    dailyUsageToday: 0,
    dailyPreviewToday: 0,
    weekStartDate: null,

    // ✅ Тариф пользователя
    userTier: 'free',
  }),
  getters: {
    // ✅ НОВОЕ: Вычисляем оставшиеся генерации
    remainingGenerations: (state) => {
      return Math.max(0, state.accumulatedGenerations);
    },
    // ✅ НОВОЕ: Вычисляем оставшиеся PRO-функции
    remainingPreview: (state) => {
      return Math.max(0, state.accumulatedPreview);
    },
    // ✅ НОВОЕ: Сколько можно использовать сегодня (генерации)
    canUseToday: (state) => {
      const remaining = state.accumulatedGenerations;
      const usedToday = state.dailyUsageToday;
      const dailyMax = state.limit.dailyGenerationsMax;

      return Math.min(remaining, dailyMax - usedToday);
    },
    // ✅ НОВОЕ: Сколько можно использовать сегодня (PRO-функции)
    canUsePreviewToday: (state) => {
      const remaining = state.accumulatedPreview;
      const usedToday = state.dailyPreviewToday;
      const dailyMax = state.limit.dailyPreviewMax;

      return Math.min(remaining, dailyMax - usedToday);
    },
    // ✅ НОВОЕ: Прогресс в процентах (для progress bar)
    generationsProgress: (state) => {
      const cap = state.limit.weeklyGenerationsCap;
      if (cap === 0) return 0;
      return Math.round((state.accumulatedGenerations / cap) * 100);
    },
    previewProgress: (state) => {
      const cap = state.limit.weeklyPreviewCap;
      if (cap === 0) return 0;
      return Math.round((state.accumulatedPreview / cap) * 100);
    },
  },
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
          this.date = response.data.date;
          // ✅ НОВЫЕ счётчики с накоплением
          this.accumulatedGenerations = response.data.accumulatedGenerations || 0;
          this.accumulatedPreview = response.data.accumulatedPreview || 0;
          this.dailyUsageToday = response.data.dailyUsageToday || 0;
          this.dailyPreviewToday = response.data.dailyPreviewToday || 0;
          this.weekStartDate = response.data.weekStartDate;

          // ✅ Обновляем лимиты из Firestore
          if (response.data.limits) {
            this.limit = {
              dailyGenerations: response.data.limits.dailyGenerations || 2,
              weeklyGenerationsCap: response.data.limits.weeklyGenerationsCap || 10,
              dailyGenerationsMax: response.data.limits.dailyGenerationsMax || 4,
              dailyPreview: response.data.limits.dailyPreview || 2,
              weeklyPreviewCap: response.data.limits.weeklyPreviewCap || 20,
              dailyPreviewMax: response.data.limits.dailyPreviewMax || 8,
              totalDialogs: response.data.limits.totalDialogs || 15,
              unlimitedAnalysis: response.data.limits.unlimitedAnalysis || false,
            };
          }

          // ✅ Сохраняем тариф
          this.userTier = response.data.tier || 'free';
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
