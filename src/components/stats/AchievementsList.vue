<!-- src/components/stats/AchievementsList.vue -->
<template>
  <div class="achievements-list">
    <h2>🏆 {{ $t('stats.achievements') }}</h2>

    <!-- Разблокированные достижения -->
    <div v-if="achievementStore.unlockedAchievements.length > 0" class="achievements-section">
      <h3>{{ $t('stats.unlocked') }} ({{ achievementStore.unlockedCount }})</h3>
      <div class="achievements-grid">
        <AchievementCard
          v-for="achievement in achievementStore.unlockedAchievements"
          :key="achievement.id"
          :achievement="achievement"
          :unlocked="true"
        />
      </div>
    </div>

    <!-- Ближайшие достижения (с прогрессом) -->
    <div v-if="achievementStore.nextAchievements.length > 0" class="achievements-section">
      <h3>{{ $t('stats.nearestAchievements') }}</h3>
      <div class="achievements-grid">
        <AchievementCard
          v-for="achievement in achievementStore.nextAchievements"
          :key="achievement.id"
          :achievement="achievement"
          :unlocked="false"
        />
      </div>
    </div>

    <!-- Пустое состояние -->
    <div v-if="achievementStore.achievements.length === 0" class="empty-state">
      <p>{{ $t('stats.empty') }}</p>
    </div>
  </div>
</template>

<script setup>
import { useAchievementStore } from '../../stores/achievementStore';
import AchievementCard from './AchievementCard.vue';

const achievementStore = useAchievementStore();
</script>

<style scoped>
.achievements-list {
  background-color: var(--card);
  border-radius: 12px;
  padding: 24px;
}

h2 {
  font-size: var(--lg);
  margin: 0 0 20px 0;
}

h3 {
  font-size: var(--md);
  margin: 0 0 16px 0;
}

.achievements-section {
  margin-bottom: 32px;
}

.achievements-section:last-child {
  margin-bottom: 0;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-body);
}

/* Адаптивность */
@media (max-width: 768px) {
  .achievements-list {
    padding: 16px;
  }

  .achievements-grid {
    grid-template-columns: 1fr;
  }

  h2 {
    font-size: var(--md);
  }

  h3 {
    font-size: var(--base);
  }
}
</style>
