<!-- src\components\MonthlyStatsModalPremium.vue -->

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click="closeModal">
        <div class="modal-content stats-modal-premium" @click.stop>
          <!-- Кнопка закрытия -->
          <button class="close-btn" @click="closeModal">
            <span class="material-symbols-outlined">close</span>
          </button>

          <!-- Заголовок с градиентом (PREMIUM) -->
          <div class="stats-header premium-header">
            <span class="stats-icon">💎</span>
            <h2>{{ title }}</h2>
          </div>

          <!-- Основные метрики -->
          <div class="stats-grid">
            <!-- Диалоги выучено -->
            <div class="stat-card-premium">
              <div class="stat-icon">📚</div>
              <div class="stat-content">
                <div class="stat-value">{{ data.dialogsLearned || 0 }}</div>
                <div class="stat-label">Диалогов выучено</div>
                <!-- Прогресс бар -->
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: `${Math.min(100, (data.dialogsLearned / 50) * 100)}%` }"
                  ></div>
                </div>
                <div class="progress-hint">Цель: 50 диалогов</div>
              </div>
            </div>

            <!-- Тренировки -->
            <div class="stat-card-premium">
              <div class="stat-icon">💪</div>
              <div class="stat-content">
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

          <!-- Качество и серия -->
          <div class="quality-streak">
            <!-- Точность -->
            <div class="quality-card">
              <div class="quality-icon">🎯</div>
              <div class="quality-content">
                <div class="quality-value">{{ data.averageAccuracy || 0 }}%</div>
                <div class="quality-label">Средняя точность</div>
                <!-- Круговой прогресс -->
                <svg class="circular-progress" viewBox="0 0 100 100">
                  <circle class="progress-bg" cx="50" cy="50" r="45" />
                  <circle
                    class="progress-fg"
                    cx="50"
                    cy="50"
                    r="45"
                    :stroke-dasharray="`${(data.averageAccuracy || 0) * 2.827} 282.7`"
                  />
                </svg>
              </div>
              <div class="quality-rating">{{ getAccuracyRating(data.averageAccuracy) }}</div>
            </div>

            <!-- Серия -->
            <div class="quality-card">
              <div class="quality-icon">🔥</div>
              <div class="quality-content">
                <div class="quality-value">{{ data.longestStreak || 0 }}</div>
                <div class="quality-label">Лучшая серия (дней)</div>
                <svg class="circular-progress" viewBox="0 0 100 100">
                  <circle class="progress-bg" cx="50" cy="50" r="45" />
                  <circle
                    class="progress-fg streak"
                    cx="50"
                    cy="50"
                    r="45"
                    :stroke-dasharray="`${Math.min(100, (data.longestStreak / 30) * 100) * 2.827} 282.7`"
                  />
                </svg>
              </div>
              <div class="quality-rating">{{ getStreakRating(data.longestStreak) }}</div>
            </div>
          </div>

          <!-- Детальный прогресс (PREMIUM) -->
          <div class="detailed-progress">
            <h3>📈 Детальный прогресс</h3>
            <div class="progress-items">
              <!-- Level 2 -->
              <div class="progress-item">
                <div class="progress-item-header">
                  <span>🗣️ Произношение</span>
                  <span class="progress-value">{{ data.level2Completed || 0 }}</span>
                </div>
                <div class="progress-bar-detailed">
                  <div
                    class="progress-fill-detailed level2"
                    :style="{ width: `${Math.min(100, (data.level2Completed / 50) * 100)}%` }"
                  ></div>
                </div>
              </div>

              <!-- Level 3 -->
              <div class="progress-item">
                <div class="progress-item-header">
                  <span>📖 Перевод</span>
                  <span class="progress-value">{{ data.level3Completed || 0 }}</span>
                </div>
                <div class="progress-bar-detailed">
                  <div
                    class="progress-fill-detailed level3"
                    :style="{ width: `${Math.min(100, (data.level3Completed / 50) * 100)}%` }"
                  ></div>
                </div>
              </div>

              <!-- Level 4 -->
              <div class="progress-item">
                <div class="progress-item-header">
                  <span>💬 Свободная речь</span>
                  <span class="progress-value">{{ data.level4Completed || 0 }}</span>
                </div>
                <div class="progress-bar-detailed">
                  <div
                    class="progress-fill-detailed level4"
                    :style="{ width: `${Math.min(100, (data.level4Completed / 50) * 100)}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Мотивационное сообщение -->
          <div class="motivation premium-motivation">
            <p>{{ getMotivationMessage() }}</p>
          </div>

          <!-- Кнопка -->
          <div class="modal-actions">
            <button class="btn btn-premium" @click="closeModal">Отлично!</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '💎 Ваша статистика PREMIUM',
  },
  data: {
    type: Object,
    default: () => ({
      dialogsLearned: 0,
      trainingsCompleted: 0,
      averageAccuracy: 0,
      longestStreak: 0,
      level2Completed: 0,
      level3Completed: 0,
      level4Completed: 0,
      month: 'ноябрь',
    }),
  },
});

const emit = defineEmits(['close']);

/**
 * Закрыть модалку
 */
const closeModal = () => {
  emit('close');
};

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

/**
 * Обработка ESC
 */
const handleEsc = (e) => {
  if (e.key === 'Escape' && props.show) {
    closeModal();
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleEsc);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEsc);
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
  overflow-y: auto;
}

.modal-content {
  background: var(--bg-primary);
  border-radius: 20px;
  padding: 40px;
  max-width: 700px;
  width: 100%;
  position: relative;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
  max-height: 90vh;
  overflow-y: auto;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 1;
}

.close-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  transform: rotate(90deg);
}

.premium-header {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15));
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 32px;
}

.stats-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.stats-icon {
  font-size: 2.5rem;
}

.stats-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--color-primary), var(--g1));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card-premium {
  background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary));
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  border: 1px solid rgba(99, 102, 241, 0.2);
  transition: all 0.3s;
}

.stat-card-premium:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.2);
}

.stat-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--text-title);
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: var(--bg-primary);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--g1));
  border-radius: 3px;
  transition: width 0.6s ease;
}

.progress-hint {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

/* Качество и серия */
.quality-streak {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.quality-card {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  position: relative;
}

.quality-icon {
  font-size: 2rem;
  margin-bottom: 12px;
}

.quality-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-title);
  margin-bottom: 4px;
}

.quality-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.circular-progress {
  width: 80px;
  height: 80px;
  margin: 0 auto 12px;
  transform: rotate(-90deg);
}

.progress-bg {
  fill: none;
  stroke: var(--bg-tertiary);
  stroke-width: 8;
}

.progress-fg {
  fill: none;
  stroke: url(#gradient);
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dasharray 0.6s ease;
}

.progress-fg.streak {
  stroke: #f59e0b;
}

.quality-rating {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary);
}

/* Детальный прогресс */
.detailed-progress {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.detailed-progress h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-title);
  margin-bottom: 20px;
}

.progress-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.progress-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.9375rem;
  color: var(--text-primary);
}

.progress-value {
  font-weight: 700;
  color: var(--color-primary);
}

.progress-bar-detailed {
  width: 100%;
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill-detailed {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease;
}

.progress-fill-detailed.level2 {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.progress-fill-detailed.level3 {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}

.progress-fill-detailed.level4 {
  background: linear-gradient(90deg, #8b5cf6, #a78bfa);
}

/* Мотивация */
.premium-motivation {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15));
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  margin-bottom: 24px;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.premium-motivation p {
  font-size: 1.125rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--color-primary), var(--g1));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.modal-actions {
  display: flex;
  justify-content: center;
}

.btn {
  padding: 16px 48px;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-premium {
  background: linear-gradient(135deg, var(--color-primary), var(--g1));
  color: white;
  box-shadow: 0 8px 16px rgba(99, 102, 241, 0.3);
}

.btn-premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(99, 102, 241, 0.4);
}

/* Анимация модалки */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95);
}

/* Mobile */
@media (max-width: 768px) {
  .modal-content {
    padding: 24px;
    max-height: 95vh;
  }

  .stats-header h2 {
    font-size: 1.25rem;
  }

  .stats-grid,
  .quality-streak {
    grid-template-columns: 1fr;
  }

  .stat-value,
  .quality-value {
    font-size: 1.75rem;
  }

  .circular-progress {
    width: 60px;
    height: 60px;
  }

  .premium-motivation p {
    font-size: 1rem;
  }

  .btn-premium {
    padding: 14px 32px;
    font-size: 1rem;
  }
}
</style>
