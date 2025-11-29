<!-- src/components/TrialModal.vue -->
<template>
  <Teleport to="body">
    <div v-if="isVisible" class="modal-overlay" @click="handleOverlayClick">
      <div class="modal-container" @click.stop>
        <!-- Кнопка закрытия -->
        <button class="modal-close" @click="decline">
          <span class="material-symbols-outlined">close</span>
        </button>

        <!-- Контент модалки -->
        <div class="modal-content">
          <!-- Иконка -->
          <div class="modal-icon">🎁</div>

          <!-- Заголовок -->
          <h2 class="modal-title">Хотите попробовать все PRO функции бесплатно?</h2>

          <!-- Преимущества trial -->
          <div class="modal-features">
            <div class="feature-item">
              <span class="feature-icon">✓</span>
              <span class="feature-text">7 дней полного доступа</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">✓</span>
              <span class="feature-text">10 генераций диалогов в день</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">✓</span>
              <span class="feature-text">Все уровни сложности (A1-C2)</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">✓</span>
              <span class="feature-text">Безлимитный анализ диалогов</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">✓</span>
              <span class="feature-text">Полная статистика</span>
            </div>
          </div>

          <!-- Кнопки -->
          <div class="modal-actions">
            <button class="btn btn-primary" @click="activateTrial" :disabled="isLoading">
              <span v-if="!isLoading">🚀 Активировать trial</span>
              <span v-else>Активация...</span>
            </button>
            <button class="btn btn-menu" @click="decline">Может быть позже</button>
          </div>

          <!-- Подсказка -->
          <p class="modal-hint">Без автоматического продления.<br />Можете активировать в любой момент!</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useUserStore } from '../stores/userStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useUiStore } from '../stores/uiStore';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'activated', 'declined']);

const userStore = useUserStore();
const settingsStore = useSettingsStore();
const uiStore = useUiStore();

const isVisible = ref(props.modelValue);
const isLoading = ref(false);

// ✅ Синхронизируем isVisible с modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    isVisible.value = newValue;
  }
);

// Активировать trial
const activateTrial = async () => {
  isLoading.value = true;

  const success = await userStore.startTrial();

  if (success) {
    // Показываем успешный тост
    uiStore.showToast('🎉 Trial активирован! У вас 7 дней PRO доступа', 'success');

    // Перезагружаем лимиты (теперь они PRO)
    await settingsStore.loadUsageStats();

    // Закрываем модалку
    closeModal();
    emit('activated');
  } else {
    // Показываем ошибку
    uiStore.showToast('❌ Не удалось активировать trial', 'error');
  }

  isLoading.value = false;
};

// Отказаться от trial
const decline = () => {
  closeModal();
  emit('declined');

  // Показываем подсказку
  uiStore.showToast('💡 Вы можете активировать trial в любой момент!', 'info');
};

// Закрыть модалку
const closeModal = () => {
  console.log('🚪 Closing Trial Modal');
  isVisible.value = false;
  emit('update:modelValue', false);
};

// Клик по overlay (закрыть модалку)
const handleOverlayClick = () => {
  decline();
};
</script>

<style scoped>
/* Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999;
  padding: 16px;
}

/* Контейнер модалки */
.modal-container {
  position: relative;
  background: var(--bg-side);
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* Кнопка закрытия */
.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  background: var(--bg-main);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 1;
}

.modal-close:hover {
  background: var(--border);
  transform: rotate(90deg);
}

.modal-close .material-symbols-outlined {
  font-size: 1.25rem;
  color: var(--text-base);
}

/* Контент */
.modal-content {
  padding: 40px 32px 32px;
  text-align: center;
}

/* Иконка */
.modal-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* Заголовок */
.modal-title {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--lg);
  font-weight: 700;
  color: var(--text-head);
  margin-bottom: 12px;
}

/* Список преимуществ */
.modal-features {
  text-align: left;
  margin-bottom: 24px;
  background: var(--bg-main);
  padding: 20px;
  border-radius: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.feature-item:last-child {
  margin-bottom: 0;
}

.feature-icon {
  font-size: 1.25rem;
  color: #48bb78;
  font-weight: 700;
  flex-shrink: 0;
}

.feature-text {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  color: var(--text-base);
  line-height: 1.4;
}

/* Кнопки */
.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

/* Подсказка */
.modal-hint {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--xs);
  color: var(--text-title);
  margin: 0;
}

/* Анимация появления */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}

/* Адаптив */
@media (max-width: 768px) {
  .modal-content {
    padding: 32px 20px 20px;
  }

  .modal-title {
    font-size: var(--lg);
  }

  .modal-icon {
    font-size: 3rem;
  }
}
</style>
