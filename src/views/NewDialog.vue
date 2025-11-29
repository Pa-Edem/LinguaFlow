<!-- src\views\NewDialog.vue -->
<!-- <template>
  <div class="layout in-view">
    <div class="title">{{ $t('new.createNew') }}</div>
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

          <option v-for="level in lockedLevels" :key="level" :value="level" disabled>{{ level }} 🔒 PRO</option>
        </select>

        <small v-if="lockedLevels.length > 0" class="upgrade-hint"> 💡 Уровни B2.1 - C2 доступны в PRO/PREMIUM </small>
      </div>

      <div class="form-group">
        <div class="ton-info">
          <label for="ton-slider">{{ $t('new.tone') }}</label>
          <label for="ton-slider">{{ $t('new.neutral') }}</label>
          <label>{{ ton }}</label>
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
        <router-link to="/dialogs" class="btn btn-common oooo oloo" :class="isDesktop ? 'w-250' : 'mobile'">
          <span class="material-symbols-outlined icon">close</span>
          {{ $t('buttons.cancel') }}
        </router-link>
        <button
          class="btn btn-action oooo oool"
          :class="isDesktop ? 'w-250' : 'mobile'"
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
</template> -->

<!-- <script setup>
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
</script> -->

<!-- <style scoped>
.layout {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 16px;
}
.dialog-form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 640px;
  padding: 24px;
  border-radius: 4px;
  background: var(--bg-group);
  box-shadow: 0 4px 15px var(--shadow);
}
.title {
  text-align: center;
  margin-bottom: 24px;
  font-size: var(--xxl);
}
.form-group {
  width: 100%;
  margin-bottom: 32px;
}
label {
  display: block;
  margin-bottom: 4px;
  font-size: var(--xs);
  color: var(--text-title);
}
input,
select {
  width: 100%;
  padding: 8px 16px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: var(--sm);
}
.upgrade-hint {
  display: block;
  margin-top: 0.5rem;
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  color: var(--text-title);
}
select option:disabled {
  color: #999;
}
textarea {
  width: 100%;
  padding: 8px 16px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: var(--sm);
  font-family: inherit;
  resize: vertical;
}
input:focus,
select:focus,
textarea:focus {
  border-color: var(--bb);
}
textarea::placeholder {
  transition: color 0.3s ease-out;
}
textarea:focus::placeholder {
  color: transparent;
}
.submit-wrap {
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  gap: 16px;
}
.error {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  color: var(--r3);
  margin-top: 16px;
  padding: 0 16px;
  text-align: center;
}
.slider-container {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}
.ton-info {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.ton-info span {
  font-family: 'Roboto Condensed', sans-serif;
  margin: 4px 0 8px 0;
  font-size: var(--sm);
  color: var(--text-title);
}
.slider-container span {
  font-size: var(--xs);
  color: var(--text-base);
}
.slider-container input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  padding: 0;
  height: 8px;
  background: var(--bg-group);
  border-radius: 4px;
  border: 1px solid var(--border);
}
.slider-container input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: var(--g3);
  cursor: pointer;
  border-radius: 50%;
}
.slider-container input[type='range']::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: var(--g3);
  cursor: pointer;
  border-radius: 50%;
}
</style> -->

<!-- НОВЫЕ СТИЛИ -->
<!-- src\views\NewDialog.vue -->
<template>
  <div class="layout in-view">
    <div class="title">{{ $t('new.createNew') }}</div>
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
          <label>{{ ton }}</label>
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
        <router-link to="/dialogs" class="btn btn-common oooo oloo" :class="isDesktop ? 'w-250' : 'mobile'">
          <span class="material-symbols-outlined icon">close</span>
          {{ $t('buttons.cancel') }}
        </router-link>
        <button
          class="btn btn-action oooo oool"
          :class="isDesktop ? 'w-250' : 'mobile'"
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
  padding: var(--space-md);
  background: radial-gradient(ellipse at center, var(--radial-15) 15%, var(--radial-65) 65%);
  position: relative;
  overflow: hidden;
}

/* Декоративный элемент */
.layout::before {
  content: '';
  position: absolute;
  width: 350px;
  height: 350px;
  background: var(--gradient-green);
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.15;
  bottom: -100px;
  left: -100px;
  pointer-events: none;
  animation: float-slow 20s ease-in-out infinite;
}

@keyframes float-slow {
  0%,
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(40px, 40px);
  }
}

/* ========================================= */
/* TITLE */
/* ========================================= */
.title {
  text-align: center;
  margin-bottom: var(--space-xl);
  font-size: var(--xxl);
  color: var(--text-head);
  font-weight: 700;
  letter-spacing: var(--tracking-tight);
  animation: fadeInDown 0.6s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ========================================= */
/* DIALOG FORM */
/* ========================================= */
.dialog-form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 640px;
  padding: var(--space-2xl);
  border-radius: var(--radius-xl);
  background: var(--bg-card);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-xl);
  position: relative;
  z-index: 2;
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ========================================= */
/* FORM GROUP */
/* ========================================= */
.form-group {
  width: 100%;
  margin-bottom: var(--space-xl);
}

.form-group:last-of-type {
  margin-bottom: 0;
}

/* ========================================= */
/* LABELS */
/* ========================================= */
label {
  display: block;
  margin-bottom: var(--space-xs);
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  font-weight: 600;
  color: var(--text-title);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
}

/* ========================================= */
/* INPUTS */
/* ========================================= */
input,
select,
textarea {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  color: var(--text-base);
  background: var(--bg-main);
  transition: all var(--transition-base);
  box-shadow: var(--shadow-xs);
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: var(--plan-free-border);
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
  transform: translateY(-1px);
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
  line-height: var(--leading-relaxed);
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
  margin-top: var(--space-xs);
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--xs);
  color: var(--plan-pro-text);
  font-weight: 500;
  padding: var(--space-xs) var(--space-sm);
  background: var(--plan-pro-bg);
  border-radius: var(--radius-sm);
  border: 1px solid var(--plan-pro-border);
}

/* ========================================= */
/* SLIDER (TON) */
/* ========================================= */
.slider-container {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  width: 100%;
  margin: var(--space-sm) 0;
}

.slider-container input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  padding: 0;
  height: 8px;
  background: var(--bg-group);
  border-radius: var(--radius-full);
  border: 2px solid var(--border);
  cursor: pointer;
  transition: all var(--transition-base);
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
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
}

.slider-container input[type='range']::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: var(--shadow-md);
}

.slider-container input[type='range']::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: var(--plan-free-border);
  cursor: pointer;
  border-radius: 50%;
  border: none;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
}

.slider-container input[type='range']::-moz-range-thumb:hover {
  transform: scale(1.2);
  box-shadow: var(--shadow-md);
}

/* ========================================= */
/* TON INFO */
/* ========================================= */
.ton-info {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: var(--space-xs) 0;
}

.ton-info span,
.ton-info label {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--xs);
  color: var(--text-title);
  font-weight: 500;
}

/* ========================================= */
/* SUBMIT WRAP */
/* ========================================= */
.submit-wrap {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: var(--space-md);
  margin-top: var(--space-lg);
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
  margin-top: var(--space-lg);
  padding: var(--space-md) var(--space-lg);
  text-align: center;
  border-radius: var(--radius-md);
  border: 2px solid var(--r2);
  box-shadow: var(--shadow-md);
  animation: shake 0.4s ease-in-out;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-8px);
  }
  75% {
    transform: translateX(8px);
  }
}

/* ========================================= */
/* RESPONSIVE */
/* ========================================= */
@media (max-width: 768px) {
  .layout {
    padding: var(--space-sm);
  }

  .dialog-form {
    padding: var(--space-xl);
  }

  .title {
    font-size: var(--xl);
  }

  .submit-wrap {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .dialog-form {
    padding: var(--space-lg);
  }

  .form-group {
    margin-bottom: var(--space-lg);
  }

  input,
  select,
  textarea {
    padding: var(--space-xs) var(--space-sm);
    font-size: var(--xs);
  }
}
</style>
