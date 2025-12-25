// src/stores/achievementStore.js
import { defineStore } from 'pinia';
import { useUserStore } from './userStore';
import { getAllAchievements } from '../services/achievementService';

export const useAchievementStore = defineStore('achievements', {
  state: () => ({
    achievements: [],
    loading: false,
  }),

  getters: {
    //Разблокированные достижения
    unlockedAchievements: (state) => {
      return state.achievements.filter((a) => a.unlocked);
    },
    //Заблокированные достижения
    lockedAchievements: (state) => {
      return state.achievements.filter((a) => !a.unlocked);
    },
    //Ближайшие 3 достижения (с наибольшим прогрессом)
    nextAchievements: (state) => {
      return state.achievements
        .filter((a) => !a.unlocked)
        .sort((a, b) => b.progress - a.progress)
        .slice(0, 3);
    },
    //Количество разблокированных достижений
    unlockedCount: (state) => {
      return state.achievements.filter((a) => a.unlocked).length;
    },
    //Всего достижений
    totalCount: (state) => {
      return state.achievements.length;
    },
  },

  actions: {
    //Загрузить достижения пользователя
    loadAchievements() {
      this.loading = true;

      try {
        const userStore = useUserStore();

        // Используем getAllAchievements из achievementService
        this.achievements = getAllAchievements(userStore.stats, userStore.achievements);

        console.log(`✅ Загружено достижений: ${this.achievements.length}`);
      } catch (error) {
        console.error('❌ Ошибка загрузки достижений:', error);
      } finally {
        this.loading = false;
      }
    },
    //Обновить достижения после получения новых
    refreshAchievements() {
      this.loadAchievements();
    },
  },
});
