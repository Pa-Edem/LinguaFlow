<!-- src\views\NewDialog.vue -->
<template>
  <div class="layout in-view">
    <h2 class="title">{{ $t('new.createNew') }}</h2>
    <form @submit.prevent="saveDialog" class="dialog-form">
      <div class="form-group">
        <label for="topic">{{ $t('new.topic') }}</label>
        <input id="topic" v-model="form.topic" type="text" required />
      </div>

      <div class="form-group">
        <label for="words">{{ $t('new.reqWords') }}</label>
        <textarea id="words" v-model="form.words" rows="3" :placeholder="$t('new.wordsPlaceholder')"></textarea>
      </div>

      <div class="form-group">
        <label for="level">{{ $t('new.level') }}</label>
        <select id="level" v-model="form.level" required>
          <option v-for="level in availableLevels" :key="level" :value="level">
            {{ level }}
          </option>
          <!-- ✅ Показываем заблокированные уровни (только для FREE) -->
          <option v-for="level in lockedLevels" :key="level" :value="level" disabled>{{ level }} 🔒 PRO</option>
        </select>
        <!-- ✅ Подсказка для FREE пользователей -->
        <small v-if="lockedLevels.length > 0" class="upgrade-hint"> 💡 Уровни B2.1 - C2 доступны в PRO/PREMIUM </small>
      </div>

      <div class="form-group">
        <div class="ton-info">
          <label for="ton-slider">{{ $t('new.tone') }}</label>
          <label for="ton-slider">{{ $t('new.neutral') }}</label>
          <span class="ton-value">{{ ton }}</span>
        </div>
        <div class="slider-container">
          <input id="ton-slider" type="range" min="-5" max="5" step="1" v-model="ton" />
        </div>
        <div class="ton-info">
          <span for="ton-slider">{{ $t('new.casual') }}</span>
          <span for="ton-slider">{{ $t('new.formal') }}</span>
        </div>
      </div>

      <div class="form-group">
        <label for="replicas">{{ $t('new.lines') }}</label>
        <input id="replicas" v-model.number="form.replicas" type="number" min="6" max="20" required />
      </div>
      <div class="submit-wrap">
        <router-link to="/dialogs" class="btn btn-menu" :class="isDesktop ? 'w-250' : 'w-125 mobile'">
          <span class="material-symbols-outlined icon">close</span>
          {{ $t('buttons.cancel') }}
        </router-link>
        <button
          class="btn btn-action"
          :class="isDesktop ? 'w-250' : 'w-125 mobile'"
          type="submit"
          :disabled="!isFormValid || trainingStore.isLoading"
        >
          <span class="material-symbols-outlined icon">save</span>
          {{ $t('buttons.save') }}
        </button>
      </div>
    </form>

    <p v-if="errorMessage" class="error">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTrainingStore } from '../stores/trainingStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useUiStore } from '../stores/uiStore';
import { useBreakpoint } from '../composables/useBreakpoint';
import { usePermissions } from '../composables/usePermissions';

const { t } = useI18n();
const router = useRouter();
const settingsStore = useSettingsStore();
const trainingStore = useTrainingStore();
const uiStore = useUiStore();
const { canNew, canTotal, canGenerate, getAvailableLevels } = usePermissions();
const { isDesktop } = useBreakpoint();

const form = ref({
  topic: '',
  words: '',
  level: 'B1.1',
  replicas: 10,
});
const errorMessage = ref('');

// ✅ Все уровни
const allLevels = ['A1', 'A2.1', 'A2.2', 'B1.1', 'B1.2', 'B2.1', 'B2.2', 'C1.1', 'C1.2', 'C2'];

// ✅ Доступные уровни для текущего тарифа
const availableLevels = computed(() => {
  return getAvailableLevels();
});

// ✅ Заблокированные уровни (для FREE)
const lockedLevels = computed(() => {
  const available = availableLevels.value;
  return allLevels.filter((level) => !available.includes(level));
});

const isFormValid = computed(() => form.value.topic.trim() !== '');
const ton = computed({
  get: () => settingsStore.ton,
  set: (value) => settingsStore.setTon(value),
});

const saveDialog = async () => {
  // 1. Проверяем, можем ли мы ВООБЩЕ генерировать
  if (canGenerate()) {
    // 2. Если да, запускаем процесс в trainingStore
    const newDialogId = await trainingStore.generateAndCreateDialog(form.value);

    if (newDialogId) {
      router.push({ name: 'view-dialog', params: { id: newDialogId } });
    } else {
      errorMessage.value = t('new.error');
    }
  } else {
    // 3. Если "тихая" проверка не прошла, выясняем причину и "громко" сообщаем
    if (!canNew()) {
      // Показываем ошибку о дневном лимите
      uiStore.showToast(`${t('toast.dailyLimit')} (${settingsStore.limit.dailyGenerations}).`, 'warning');
    } else if (!canTotal()) {
      // Показываем ошибку об общем лимите
      uiStore.showToast(`${t('toast.totalLimit')} (${settingsStore.limit.totalDialogs}).`, 'warning');
    }
  }
};
</script>

<style scoped>
/* ========================================= */
/* LAYOUT */
/* ========================================= */
.layout {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: var(--md);
  position: relative;
  overflow: hidden;
}
.title {
  text-align: center;
  margin-bottom: var(--md);
  font-size: var(--xxxl);
}
.dialog-form {
  width: 100%;
  max-width: 640px;
  position: relative;
  z-index: 2;
  background: var(--bg-card);
  padding: var(--xl);
  border-radius: var(--xxs);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.form-group {
  width: 100%;
  margin-bottom: var(--xl);
}
.form-group:last-of-type {
  margin-bottom: 0;
}
label {
  display: block;
  margin-bottom: var(--xxxs);
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--xs);
  font-weight: 500;
  color: var(--text-title);
  text-transform: uppercase;
}
input,
select,
textarea {
  width: 100%;
  padding: var(--xxs) var(--md);
  border: 2px solid var(--border);
  border-radius: var(--xxxs);
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--md);
  color: var(--text-base);
  background: var(--bg-main);
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: var(--bb);
}

input:hover,
select:hover,
textarea:hover {
  border-color: var(--bb);
}

input::placeholder,
textarea::placeholder {
  color: var(--text-title);
  opacity: 0.6;
}

textarea {
  resize: vertical;
  min-height: 80px;
}

textarea:focus::placeholder {
  opacity: 0;
  transition: opacity 0.3s ease;
}

/* ========================================= */
/* SELECT */
/* ========================================= */
select option:disabled {
  color: var(--text-title);
  opacity: 0.5;
}

/* ========================================= */
/* UPGRADE HINT */
/* ========================================= */
.upgrade-hint {
  display: block;
  margin-top: var(--xxxs);
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  text-align: center;
  color: var(--plan-pro-text);
  font-weight: 500;
  padding: var(--xxs) 0;
  background: var(--plan-pro-bg);
  border-radius: var(--xxxs);
  border: 1px solid var(--plan-pro-border);
}

/* ========================================= */
/* SLIDER (TON) */
/* ========================================= */
.slider-container {
  display: flex;
  align-items: center;
  width: 100%;
  margin: var(--xxs) 0;
}
.slider-container input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  padding: 0;
  height: 8px;
  background: var(--bg-group);
  border-radius: 8px;
  border: 2px solid var(--border);
  cursor: pointer;
}

.slider-container input[type='range']:hover {
  border-color: var(--bb);
}

.slider-container input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: var(--plan-free-border);
  cursor: pointer;
  border-radius: 50%;
}

.slider-container input[type='range']::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.slider-container input[type='range']::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: var(--plan-free-border);
  cursor: pointer;
  border-radius: 50%;
  border: none;
}

.slider-container input[type='range']::-moz-range-thumb:hover {
  transform: scale(1.2);
}

/* ========================================= */
/* TON INFO */
/* ========================================= */
.ton-info {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: var(--xxxs) 0;
}

.ton-info span,
.ton-info label,
.ton-info span.ton-value {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--xs);
  color: var(--text-title);
  font-weight: 500;
  text-transform: uppercase;
  line-height: var(--xs);
}
.ton-info span.ton-value {
  font-size: var(--sm);
  font-weight: 700;
}
/* ========================================= */
/* SUBMIT WRAP */
/* ========================================= */
.submit-wrap {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: var(--md);
  margin-top: var(--lg);
}

/* ========================================= */
/* ERROR MESSAGE */
/* ========================================= */
.error {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  font-weight: 600;
  color: var(--r3);
  background: var(--r1);
  margin-top: var(--lg);
  padding: var(--sm) var(--lg);
  text-align: center;
  border-radius: var(--xxs);
  border: 2px solid var(--r2);
}
</style>
