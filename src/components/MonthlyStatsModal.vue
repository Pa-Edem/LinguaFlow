<!-- src\components\MonthlyStatsModal.vue -->

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click="closeModal">
        <div class="modal-content stats-modal" @click.stop>
          <!-- Кнопка закрытия -->
          <button class="close-btn" @click="closeModal">
            <span class="material-symbols-outlined">close</span>
          </button>

          <!-- Заголовок -->
          <div class="stats-header">
            <span class="stats-icon">📊</span>
            <h2>{{ title }}</h2>
          </div>

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

          <!-- Кнопка -->
          <div class="modal-actions">
            <button class="btn btn-primary" @click="closeModal">Отлично!</button>
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
    default: '📊 Ваша статистика',
  },
  data: {
    type: Object,
    default: () => ({
      dialogsLearned: 0,
      trainingsCompleted: 0,
      averageAccuracy: 0,
      longestStreak: 0,
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
 * Мотивационное сообщение на основе результатов
 */
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
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.modal-content {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 32px;
  max-width: 600px;
  width: 100%;
  position: relative;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.3);
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.stats-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 32px;
}

.stats-icon {
  font-size: 2.5rem;
}

.stats-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-title);
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-title);
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.motivation {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  margin-bottom: 24px;
}

.motivation p {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.modal-actions {
  display: flex;
  justify-content: center;
}

.btn {
  padding: 14px 32px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-primary), var(--g1));
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(99, 102, 241, 0.3);
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
  transform: scale(0.9);
}

/* Mobile */
@media (max-width: 768px) {
  .modal-content {
    padding: 24px;
  }

  .stats-header h2 {
    font-size: 1.25rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .motivation p {
    font-size: 0.9375rem;
  }
}
</style>
