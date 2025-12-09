<!-- src\components\UpgradePrompt.vue -->

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click="closeModal">
        <div class="modal-content upgrade-prompt" @click.stop>
          <!-- Кнопка закрытия -->
          <button class="close-btn" @click="closeModal">
            <span class="material-symbols-outlined">close</span>
          </button>

          <!-- Иконка -->
          <div class="upgrade-icon">🚀</div>

          <!-- Заголовок -->
          <h2>{{ title }}</h2>

          <!-- Сообщение -->
          <p class="upgrade-message">{{ message }}</p>

          <!-- Преимущества -->
          <div class="benefits">
            <div class="benefit-item">
              <span class="benefit-icon">📊</span>
              <span>Статистика и достижения</span>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon">🏆</span>
              <span>Отслеживание прогресса</span>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon">🔥</span>
              <span>Серии дней практики</span>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon">📈</span>
              <span>Месячные отчёты</span>
            </div>
          </div>

          <!-- Кнопки -->
          <div class="modal-actions">
            <button class="btn btn-primary" @click="goToPricing">Попробовать PRO бесплатно</button>
            <button class="btn btn-secondary" @click="closeModal">Может быть позже</button>
          </div>

          <!-- Напоминание о trial -->
          <p class="trial-hint">🎁 7 дней бесплатного доступа</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '📈 Хотите видеть свой прогресс?',
  },
  message: {
    type: String,
    default:
      'Вы только что завершили отличную тренировку! Купите PRO чтобы отслеживать статистику, получать достижения и видеть свой рост.',
  },
});

const emit = defineEmits(['close']);

const router = useRouter();

/**
 * Закрыть модалку
 */
const closeModal = () => {
  emit('close');

  // Сохранить что промпт был показан сегодня
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem('lastUpgradePrompt', today);
};

/**
 * Перейти на страницу тарифов
 */
const goToPricing = () => {
  closeModal();
  router.push('/pricing');
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
  max-width: 500px;
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

.upgrade-icon {
  font-size: 3rem;
  text-align: center;
  margin-bottom: 16px;
}

.upgrade-prompt h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-title);
  text-align: center;
  margin-bottom: 12px;
}

.upgrade-message {
  font-size: 1rem;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.6;
  margin-bottom: 24px;
}

.benefits {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
  font-size: 0.9375rem;
  color: var(--text-primary);
}

.benefit-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn {
  width: 100%;
  padding: 14px 24px;
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

.btn-secondary {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);
}

.btn-secondary:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.trial-hint {
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-tertiary);
  margin-top: 16px;
  margin-bottom: 0;
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
    max-width: 100%;
  }

  .upgrade-prompt h2 {
    font-size: 1.25rem;
  }

  .upgrade-message {
    font-size: 0.9375rem;
  }

  .benefit-item {
    font-size: 0.875rem;
  }
}
</style>
