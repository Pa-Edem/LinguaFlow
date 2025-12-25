<!-- src/views/Stats.vue -->
<template>
  <div class="stats-page">
    <div class="stats-container">
      <!-- Заголовок -->
      <div class="stats-header">
        <button class="btn-back btn-menu" @click="router.push('/dialogs')">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <h1>{{ $t('stats.title') }}</h1>
      </div>

      <!-- Загрузка -->
      <div v-if="loading" class="loading">
        <Loader />
      </div>

      <!-- Контент -->
      <div v-else class="stats-content">
        <!-- Общая статистика -->
        <StatsOverview :tier="tier" />

        <!-- График прогресса (только PREMIUM) -->
        <ProgressChart v-if="tier === 'premium'" />

        <!-- Прогресс по уровням (только PREMIUM) -->
        <LevelProgress v-if="tier === 'premium'" />

        <!-- Достижения (PRO + PREMIUM) -->
        <AchievementsList v-if="tier === 'pro' || tier === 'premium'" />

        <!-- История тренировок (только PREMIUM) -->
        <TrainingHistory v-if="tier === 'premium'" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import { useAchievementStore } from '../stores/achievementStore';
import Loader from '../components/Loader.vue';
import StatsOverview from '../components/stats/StatsOverview.vue';
import ProgressChart from '../components/stats/ProgressChart.vue';
import LevelProgress from '../components/stats/LevelProgress.vue';
import AchievementsList from '../components/stats/AchievementsList.vue';
import TrainingHistory from '../components/stats/TrainingHistory.vue';

const router = useRouter();
const userStore = useUserStore();
const achievementStore = useAchievementStore();

const loading = ref(true);

// Определяем тариф пользователя
const tier = computed(() => {
  if (userStore.isPremium) return 'premium';
  if (userStore.isPro) return 'pro';
  return 'free';
});

onMounted(async () => {
  // Проверка доступа
  if (tier.value === 'free') {
    router.push('/dialogs');
    return;
  }

  // Загружаем данные
  await Promise.all([achievementStore.loadAchievements()]);

  loading.value = false;
});
</script>

<style scoped>
.stats-page {
  min-height: 100vh;
  background-color: var(--bg);
  padding: 20px;
}

.stats-container {
  max-width: 1200px;
  margin: 0 auto;
}

.stats-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.btn-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-back .material-symbols-outlined {
  font-size: 24px;
  color: var(--text-body);
}

h1 {
  font-size: var(--xl);
  font-weight: 600;
  color: var(--text-head);
  margin: 0;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Адаптивность */
@media (max-width: 768px) {
  .stats-page {
    padding: 16px;
  }

  .stats-header {
    margin-bottom: 24px;
  }

  h1 {
    font-size: var(--lg);
  }
}
</style>
