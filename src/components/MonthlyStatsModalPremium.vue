<!-- src\components\MonthlyStatsModalPremium.vue -->
<template>
  <div class="stats-content-premium">
    <!-- Основные метрики -->
    <div class="stats-grid">
      <!-- Диалоги выучено -->
      <div class="stat-card-premium">
        <div class="stat-icon">📚</div>
        <div class="stat-info">
          <div class="stat-value">{{ data.dialogsLearned || 0 }}</div>
          <div class="stat-label">Диалогов выучено</div>
          <!-- Прогресс бар -->
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${Math.min(100, (data.dialogsLearned / 50) * 100)}%` }"></div>
          </div>
          <div class="progress-hint">Цель: 50 диалогов</div>
        </div>
      </div>

      <!-- Тренировки -->
      <div class="stat-card-premium">
        <div class="stat-icon">💪</div>
        <div class="stat-info">
          <div class="stat-value">{{ data.trainingsCompleted || 0 }}</div>
          <div class="stat-label">Тренировок завершено</div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: `${Math.min(100, (data.trainingsCompleted / 100) * 100)}%` }"
            ></div>
          </div>
          <div class="progress-hint">Цель: 100 тренировок</div>
        </div>
      </div>
    </div>

    <!-- Дни активности -->
    <div class="days-active-card">
      <div class="days-icon">📅</div>
      <div class="days-value">{{ data.daysActive || 0 }}</div>
      <div class="days-label">Дней активности в этом месяце</div>
    </div>

    <!-- Качество и серия -->
    <div class="quality-streak">
      <!-- Точность -->
      <div class="quality-card">
        <div class="quality-icon">🎯</div>
        <div class="stat-info">
          <div class="quality-value">{{ data.averageAccuracy || 0 }}%</div>
          <div class="quality-label">Средняя точность</div>
          <div class="quality-rating">{{ getAccuracyRating(data.averageAccuracy) }}</div>
        </div>
      </div>
      <!-- Текущая серия -->
      <div class="quality-card">
        <div class="quality-icon">🔥</div>
        <div class="stat-info">
          <div class="quality-value">{{ data.currentStreak || 0 }}</div>
          <div class="quality-label">Текущая серия (дней)</div>
          <div class="quality-rating">{{ getStreakRating(data.currentStreak) }}</div>
        </div>
      </div>
      <!-- Рекорд серии -->
      <div class="quality-card">
        <div class="quality-icon">🏆</div>
        <div class="stat-info">
          <div class="quality-value">{{ data.longestStreak || 0 }}</div>
          <div class="quality-label">Рекорд серии (дней)</div>
          <div class="quality-rating">{{ getStreakRating(data.longestStreak) }}</div>
        </div>
      </div>
    </div>

    <!-- Мотивационное сообщение -->
    <div class="premium-motivation">
      <p>{{ getMotivationMessage() }}</p>
    </div>

    <!-- Детальный прогресс по диалогам (если есть) -->
    <div v-if="hasDialogProgress" class="dialog-progress">
      <h3>📋 Выученные диалоги</h3>
      <div class="dialog-list">
        <div
          v-for="(dialog, index) in data.dialogProgress"
          :key="index"
          class="dialog-item"
          :class="getAccuracyClass(dialog.overallAccuracy)"
        >
          <div class="topic">
            {{ dialog.topic }}
          </div>
          <div class="dialog-info">
            <div class="level">{{ dialog.languageLevel }}</div>
            <div class="accuracy">{{ dialog.overallAccuracy }}%</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

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
      dialogProgress: [],
    }),
  },
});

const hasDialogProgress = computed(() => {
  return props.data.dialogProgress && props.data.dialogProgress.length > 0;
});

/**
 * Оценка точности
 */
const getAccuracyRating = (accuracy) => {
  if (accuracy >= 95) return 'Отлично! 🌟';
  if (accuracy >= 90) return 'Очень хорошо!';
  if (accuracy >= 85) return 'Хорошо';
  if (accuracy >= 80) return 'Неплохо';
  return 'Есть над чем работать';
};

/**
 * Оценка серии
 */
const getStreakRating = (streak) => {
  if (streak >= 30) return 'Легенда! 🔥';
  if (streak >= 14) return 'Впечатляет!';
  if (streak >= 7) return 'Отличная привычка!';
  if (streak >= 3) return 'Хорошее начало';
  return 'Продолжайте!';
};

/**
 * Класс для точности диалога
 */
const getAccuracyClass = (accuracy) => {
  if (accuracy >= 95) return 'excellent';
  if (accuracy >= 90) return 'good';
  return 'fair';
};

/**
 * Мотивационное сообщение
 */
const getMotivationMessage = () => {
  const { dialogsLearned, averageAccuracy, longestStreak } = props.data;

  if (dialogsLearned >= 50 && averageAccuracy >= 90 && longestStreak >= 30) {
    return '🏆 ВЫ МАСТЕР! Невероятные результаты по всем направлениям!';
  }

  if (dialogsLearned >= 30) {
    return '💎 Потрясающий прогресс! Вы на пути к совершенству!';
  }

  if (averageAccuracy >= 92) {
    return '🎯 Исключительная точность! Ваши навыки впечатляют!';
  }

  if (longestStreak >= 21) {
    return '🔥 Невероятная серия! Ваше постоянство вдохновляет!';
  }

  return '🚀 Отличная работа! Продолжайте практиковаться каждый день!';
};
</script>

<style scoped>
.stats-content-premium {
  padding: 0;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--md);
  margin-bottom: var(--md);
}
.stat-card-premium,
.quality-card,
.days-active-card,
.dialog-progress {
  background: var(--bg-card);
  border-radius: var(--xxs);
  padding: var(--md);
  display: flex;
  align-items: flex-start;
  border: 1px solid rgba(99, 102, 241, 0.2);
  transition: all 0.3s;
}
.stat-card-premium:hover,
.quality-card:hover {
  transform: translateY(-2px);
}
.stat-icon,
.quality-icon,
.days-icon {
  font-size: var(--lg);
  flex-shrink: 0;
}
.stat-info {
  margin: 0 auto;
}
.stat-value,
.quality-value,
.days-value {
  font-size: var(--md);
  font-weight: 700;
  color: var(--text-head);
  line-height: 1;
  text-align: center;
  margin-bottom: 8px;
}
.stat-label,
.quality-label,
.days-label {
  font-size: var(--xs);
  color: var(--text-base);
  margin-bottom: var(--xs);
}
.progress-bar {
  width: 100%;
  height: 6px;
  background: var(--bg-side);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
}
.progress-fill {
  height: 100%;
  background: var(--gradient-gold);
  border-radius: 3px;
  transition: width 0.6s ease;
}
.progress-hint {
  font-size: var(--xs);
  color: var(--text-base);
}
.days-active-card {
  background: linear-gradient(45deg, var(--blue-2) 0%, var(--gold-2) 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 1;
  margin-bottom: var(--md);
}
.days-value,
.days-label {
  font-size: var(--md);
  font-weight: 500;
  margin-bottom: 0;
  line-height: 1;
  margin-left: var(--sm);
}
.quality-streak {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--md);
  margin-bottom: var(--lg);
}
.quality-rating {
  font-size: var(--sm);
  font-weight: 600;
  color: var(--color-title);
}
/* Детальный прогресс */
.dialog-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.dialog-progress h3 {
  font-size: var(--md);
  font-weight: 700;
  color: var(--text-title);
  margin-bottom: var(--md);
}
.dialog-list {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--xxxs);
}
.dialog-item {
  display: flex;
  flex-direction: column;
  border-radius: var(--xxs);
  border: 1px solid var(--border);
  padding: var(--xxxs);
}
.dialog-item .topic {
  font-size: var(--sm);
  font-weight: 500;
  color: var(--text-head);
  text-align: center;
}
.dialog-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
}
.dialog-info .level,
.dialog-info .accuracy {
  color: var(--text-base);
  font-size: var(--xxs);
}
.dialog-info .accuracy {
  color: var(--text-head);
  font-weight: 700;
}
.excellent {
  background: linear-gradient(0deg, var(--gold-1) 0%, var(--gold-3) 100%);
}
.good {
  background: linear-gradient(0deg, var(--bg-side) 0%, var(--gold-2) 100%);
}
.fair {
  background: var(--bg-side);
}
/* Мотивация */
.premium-motivation {
  background: linear-gradient(45deg, var(--blue-2) 0%, var(--gold-2) 100%);
  border-radius: var(--xxs);
  padding: var(--md);
  text-align: center;
  margin-bottom: var(--lg);
  border: 1px solid rgba(99, 102, 241, 0.3);
}
.premium-motivation p {
  font-size: var(--md);
  font-weight: 500;
  margin: 0;
}
/* Mobile */
@media (max-width: 1024px) {
  .stats-grid,
  .quality-streak,
  .dialog-list {
    grid-template-columns: 1fr;
  }
  .stat-value,
  .quality-value,
  .days-value {
    font-size: var(--lg);
  }
  .stat-label,
  .quality-label,
  .days-label {
    font-size: var(--md);
  }
  .progress-hint {
    font-size: var(--sm);
  }
  .days-value,
  .days-label {
    font-size: var(--lg);
  }
  .quality-rating {
    font-size: var(--md);
  }
  .dialog-progress h3 {
    font-size: var(--md);
  }
  .dialog-item .topic {
    font-size: var(--md);
  }
  .dialog-info .level,
  .dialog-info .accuracy {
    font-size: var(--sm);
  }
  .premium-motivation p {
    font-size: var(--md);
  }
}
</style>
