// src/stores/settingsStore.js
import { defineStore } from 'pinia';
import i18n from '../i18n';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import { getLangCode } from '../utils/languageUtils';

export const DEFAULT_VOICE_CONFIG = { name: 'default', pitch: 0.0 };

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    theme: 'light',
    uiLanguage: 'en',
    learningLanguage: 'Suomi',
    speechRate: 1.0,
    selectedVoiceConfig: DEFAULT_VOICE_CONFIG,
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
      this.fetchAvailableVoices();
    },
    setSpeechRate(rate) {
      this.speechRate = parseFloat(rate);
      localStorage.setItem('app-speech-rate', this.speechRate);
    },
    setSelectedVoiceConfig(config) {
      this.selectedVoiceConfig = config;
      localStorage.setItem('app-voice-config', JSON.stringify(config));
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
        console.error('Ошибка при загрузке списка голосов:', error);
      } finally {
        this.isLoadingVoices = false;
      }
    },
    incrementCount(type) {
      const usageJSON = localStorage.getItem('usage');
      let usage;

      if (usageJSON) {
        usage = JSON.parse(usageJSON);
      } else {
        usage = {
          countView: 0,
          countNew: 0,
          date: null,
        };
      }

      usage.date = new Date().toDateString();
      if (type === 'view') {
        this.dailyPreviewCount++;
        usage.countView = this.dailyPreviewCount;
      }
      if (type === 'new') {
        this.dailyGenerationCount++;
        usage.countNew = this.dailyGenerationCount;
      }
      if (type === 'total') {
        this.dailyGenerationCount = this.limit.dailyGenerations + 1;
        usage.countNew = this.dailyGenerationCount;
      }
      const updatedUsageJSON = JSON.stringify(usage);

      localStorage.setItem('usage', updatedUsageJSON);
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
      this.fetchAvailableVoices();
      // ЛОГИКА ЗАГРУЗКИ СЧЁТЧИКОВ
      const savedUsage = JSON.parse(localStorage.getItem('usage'));
      if (savedUsage && savedUsage.date === new Date().toDateString()) {
        // Если есть запись за сегодня, загружаем счётчики
        this.dailyPreviewCount = savedUsage.countView;
        this.dailyGenerationCount = savedUsage.countNew;
      } else {
        // Если новый день или нет записи, счётчик равен 0
        this.dailyPreviewCount = 0;
        this.dailyGenerationCount = 0;
        this.date = new Date().toDateString();
        localStorage.removeItem('usage');
      }
    },
  },
});
