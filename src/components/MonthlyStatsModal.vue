<!-- src\components\MonthlyStatsModal.vue -->
<template>
  <div class="stats-content">
    <!-- Статистика -->
    <div class="stats-grid">
      <!-- Диалоги выучено -->
      <div class="stat-card">
        <div class="stat-icon">📚</div>
        <div class="stat-content">
          <div class="stat-value">{{ data.dialogsLearned || 0 }}</div>
          <div class="stat-label">Диалогов выучено</div>
        </div>
      </div>

      <!-- Тренировки -->
      <div class="stat-card">
        <div class="stat-icon">💪</div>
        <div class="stat-content">
          <div class="stat-value">{{ data.trainingsCompleted || 0 }}</div>
          <div class="stat-label">Тренировок завершено</div>
        </div>
      </div>

      <!-- Дни активности -->
      <div class="stat-card">
        <div class="stat-icon">📅</div>
        <div class="stat-content">
          <div class="stat-value">{{ data.daysActive || 0 }}</div>
          <div class="stat-label">Дней активности</div>
        </div>
      </div>

      <!-- Точность -->
      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-content">
          <div class="stat-value">{{ data.averageAccuracy || 0 }}%</div>
          <div class="stat-label">Средняя точность</div>
        </div>
      </div>

      <!-- Лучшая серия -->
      <div class="stat-card">
        <div class="stat-icon">🔥</div>
        <div class="stat-content">
          <div class="stat-value">{{ data.longestStreak || 0 }}</div>
          <div class="stat-label">Лучшая серия (дней)</div>
        </div>
      </div>
    </div>

    <!-- Мотивационное сообщение -->
    <div class="motivation">
      <p>{{ getMotivationMessage() }}</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      dialogsLearned: 0,
      trainingsCompleted: 0,
      daysActive: 0,
      averageAccuracy: 0,
      currentStreak: 0,
      longestStreak: 0,
    }),
  },
});

// Мотивационное сообщение на основе результатов
const getMotivationMessage = () => {
  const { dialogsLearned, averageAccuracy, longestStreak } = props.data;

  if (dialogsLearned >= 20) {
    return '🏆 Невероятный прогресс! Вы на пути к мастерству!';
  }

  if (averageAccuracy >= 90) {
    return '🎯 Отличная точность! Продолжайте в том же духе!';
  }

  if (longestStreak >= 14) {
    return '🔥 Впечатляющая серия! Ваше постоянство вдохновляет!';
  }

  if (dialogsLearned >= 10) {
    return '💪 Хороший темп! Продолжайте практиковаться!';
  }

  return '🚀 Отличное начало! Каждый день делает вас лучше!';
};
</script>

<style scoped>
.stats-content {
  padding: 0;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--md);
  margin-bottom: var(--md);
}
.stat-card {
  background: var(--bg-card);
  border-radius: var(--xxs);
  padding: var(--md);
  display: flex;
  align-items: center;
  gap: var(--md);
  transition: transform 0.2s;
}
.stat-card:hover {
  transform: translateY(-2px);
}
.stat-icon {
  font-size: var(--lg);
  flex-shrink: 0;
}
.stat-content {
  flex: 1;
}
.stat-value {
  font-size: var(--md);
  font-weight: 700;
  color: var(--text-head);
  line-height: 1;
  margin-bottom: 4px;
}
.stat-label {
  font-size: var(--xs);
  color: var(--text-base);
}
.motivation {
  background: var(--gradient-pro);
  border-radius: var(--xxs);
  padding: var(--md);
  text-align: center;
  margin-bottom: var(--lg);
}
.motivation p {
  font-size: var(--md);
  font-weight: 600;
  color: var(--text-title);
  margin: 0;
}
/* Mobile */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
