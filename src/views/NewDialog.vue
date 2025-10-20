<!-- src\views\NewDialog.vue -->
<template>
  <div class="layout">
    <div class="title">{{ $t('new.createNew') }}</div>
    <form
      @submit.prevent="saveDialog"
      class="dialog-form"
    >
      <div class="form-group">
        <label for="topic">{{ $t('new.topic') }}</label>
        <input
          id="topic"
          v-model="form.topic"
          type="text"
          required
        />
      </div>

      <div class="form-group">
        <label for="words">{{ $t('new.reqWords') }}</label>
        <textarea
          id="words"
          v-model="form.words"
          rows="3"
          :placeholder="$t('new.wordsPlaceholder')"
        ></textarea>
      </div>

      <div class="form-group">
        <label for="level">{{ $t('new.level') }}</label>
        <select
          id="level"
          v-model="form.level"
          required
        >
          <option
            v-for="level in levels"
            :key="level"
            :value="level"
          >
            {{ level }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="replicas">{{ $t('new.lines') }}</label>
        <input
          id="replicas"
          v-model.number="form.replicas"
          type="number"
          min="6"
          max="20"
          required
        />
      </div>
      <div class="submit-wrap">
        <router-link
          to="/dialogs"
          class="btn btn-common"
          :class="isDesktop ? 'w-250' : 'mobile'"
        >
          <span class="material-symbols-outlined icon">cancel</span>
          {{ $t('buttons.cancel') }}
        </router-link>
        <button
          class="btn btn-action"
          :class="isDesktop ? 'w-250' : 'mobile'"
          type="submit"
          :disabled="!isFormValid || trainingStore.isLoading"
        >
          <span class="material-symbols-outlined icon">save</span>
          {{ $t('buttons.save') }}
        </button>
      </div>
    </form>

    <p
      v-if="errorMessage"
      class="message error"
    >
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
const { canNew, canTotal, canGenerate } = usePermissions();
const { isDesktop } = useBreakpoint();

const form = ref({
  topic: '',
  words: '',
  level: 'B1.1',
  replicas: 10,
});
const errorMessage = ref('');
const levels = ['A1', 'A2.1', 'A2.2', 'B1.1', 'B1.2', 'B2.1', 'B2.2', 'C1.1', 'C1.2', 'C2'];
const isFormValid = computed(() => form.value.topic.trim() !== '');

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
  margin-bottom: 16px;
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
.error-message {
  color: var(--r3);
  margin-bottom: 16px;
  text-align: center;
}
</style>
