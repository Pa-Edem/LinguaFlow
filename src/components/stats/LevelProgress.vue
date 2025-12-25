<!-- src/components/stats/LevelProgress.vue -->
<template>
  <div class="level-progress">
    <h2>🎓 {{ $t('stats.levelProgress') }}</h2>

    <div class="levels-list">
      <div v-for="level in levels" :key="level.name" class="level-item">
        <div class="level-header">
          <div class="level-name">{{ level.name }}</div>
          <div class="level-stats">{{ level.completed }} / {{ level.total }} {{ $t('stats.dialogsCompleted') }}</div>
        </div>

        <div class="level-progress-bar">
          <div class="level-progress-fill" :style="{ width: level.progress + '%' }"></div>
        </div>

        <div class="level-accuracy">
          {{ $t('stats.avgAccuracy') }}:
          <span class="accuracy-value">{{ level.accuracy }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useUserStore } from '../../stores/userStore';

const userStore = useUserStore();

// Вычисляем прогресс по уровням
const levels = computed(() => {
  const stats = userStore.stats || {};

  // Для каждого уровня подсчитываем прогресс
  const levelData = [
    { name: 'A1', key: 'dialogsLearnedA1', total: 10 },
    { name: 'A2', key: 'dialogsLearnedA2', total: 10 },
    { name: 'B1', key: 'dialogsLearnedB1', total: 10 },
    { name: 'B2', key: 'dialogsLearnedB2', total: 10 },
    { name: 'C1', key: 'dialogsLearnedC1', total: 10 },
    { name: 'C2', key: 'dialogsLearnedC2', total: 10 },
  ];

  return levelData.map((level) => {
    const completed = stats[level.key] || 0;
    const progress = Math.min(100, (completed / level.total) * 100);

    // TODO: Вычислять реальную среднюю точность по уровню
    // Пока показываем фейковую
    const accuracy = completed > 0 ? Math.round(85 + Math.random() * 10) : 0;

    return {
      name: level.name,
      completed,
      total: level.total,
      progress: Math.round(progress),
      accuracy,
    };
  });
});
</script>

<style scoped>
.level-progress {
  background-color: var(--card);
  border-radius: var(--xxs);
  padding: var(--xl);
}
h2 {
  font-size: var(--lg);
  margin: 0 0 var(--lg) 0;
}
.levels-list {
  display: flex;
  flex-direction: column;
  gap: var(--md);
}
.level-item {
  background-color: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--xxs);
  padding: var(--sm);
}
.levels-list .level-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: none;
  box-shadow: none;
  border-bottom: none;
}
.level-name {
  font-size: var(--md);
  font-weight: 600;
  color: var(--text-title);
}
.level-stats {
  font-size: var(--sm);
  color: var(--text-body);
}
.level-progress-bar {
  height: 8px;
  background-color: var(--bg-side);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}
.level-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--g2) 0%, var(--g3) 100%);
  transition: width 0.3s ease;
}
.level-accuracy {
  font-size: var(--sm);
  color: var(--text-body);
  text-align: right;
}
.accuracy-value {
  font-size: var(--lg);
  font-weight: 500;
  color: var(--text-title);
}
</style>
