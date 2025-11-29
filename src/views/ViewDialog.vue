<!-- \\src\views\ViewDialog.vue -->
<template>
  <div v-if="dialog && !uiStore.loading" class="in-view">
    <!-- VIEW NOTE -->
    <div v-if="!hasSeenNote && dialog.culturalNote" class="note-container fade-in">
      <div class="note">
        <span class="material-symbols-outlined icon">tips_and_updates</span>
        <p class="note-text">{{ dialog.culturalNote }}</p>
        <button @click="markNoteAsSeen" class="btn btn-action" :class="isDesktop ? 'w-250' : 'mobile'">
          <span class="material-symbols-outlined"> chevron_forward</span>

          {{ $t('buttons.continue') }}
        </button>
        <div class="not-view-wrap">
          <label for="notView">{{ $t('view.notView') }}</label>
          <input id="notView" type="checkbox" class="toggle-switch" v-model="notView" />
        </div>
      </div>
    </div>

    <!-- FOR DESKTOP -->
    <div v-else-if="isDesktop" class="in-view">
      <DialogLayout>
        <template #sidebar-content>
          <div class="grow"></div>
          <div class="dialog-info">
            <h2 class="dialog-info-title">{{ dialog?.title }}</h2>
            <span class="dialog-info-level">{{ dialog?.level }}</span>
          </div>
          <!-- кнопка анализ диалога -->
          <button class="btn btn-menu" @click="getInfo" :disabled="!canUseAnalysis">
            <span class="material-symbols-outlined">analytics</span>
            {{ $t('buttons.analysis') }}
            <span class="material-symbols-outlined pro">crown</span>
          </button>
          <!-- кнопка прослушать диалог -->
          <button class="btn btn-menu" @click="toggleListening">
            <span class="material-symbols-outlined">volume_up</span>
            {{ $t('buttons.listen') }}
          </button>
          <div class="grow"></div>
          <!-- кнопки тренировок -->
          <button
            v-for="(level, index) in trainingLevels"
            :key="level.name"
            class="btn btn-menu"
            :disabled="
              level.isPro &&
              (level.name === 'level-2' ? !canUseLevel2 : level.name === 'level-3' ? !canUseLevel3 : !canView())
            "
            @click="goToTraining(level)"
          >
            <span class="material-symbols-outlined">{{ level.icon }}</span>
            {{ level.text }}
            <span v-if="level.isPro" class="material-symbols-outlined pro">crown</span>
          </button>
          <div class="grow"></div>
          <!-- кнопка удалить диалог -->
          <button class="btn btn-danger" @click="handleDelete">
            <span class="material-symbols-outlined">delete</span>
            {{ $t('buttons.delDialog') }}
          </button>
        </template>
        <!-- текст диалога -->
        <div v-if="dialog" class="scroll-container">
          <div v-for="(fin, index) in dialog.fin" :key="index" class="dialog-line">
            <p class="finnish-text">{{ fin }}</p>
            <p class="russian-text">{{ dialog.rus[index] }}</p>
          </div>
        </div>
      </DialogLayout>
    </div>

    <!-- FOR MOBILE -->
    <div v-else class="page-container in-view">
      <header class="header">
        <router-link to="/dialogs" name="all-dialogs" class="header-btn">
          <span class="material-symbols-outlined i">arrow_back_ios</span>
        </router-link>
        <div class="header-title">
          <h1>{{ dialog.title }}</h1>
          <span class="badge">{{ dialog.level }}</span>
        </div>
        <button @click="toggleMenu" class="header-btn">
          <span class="material-symbols-outlined drop">more_vert</span>
        </button>
      </header>
      <Transition name="fade">
        <div v-if="isMenuOpen" class="dropdown-menu">
          <button @click="handleDelete" class="dropdown-item danger">
            <span class="material-symbols-outlined">delete</span>
            {{ $t('buttons.delDialog') }}
          </button>
        </div>
      </Transition>
      <main class="content">
        <div class="chat-container">
          <div
            v-for="(line, index) in dialog.fin"
            :key="index"
            class="message-bubble"
            :class="index % 2 === 0 ? 'left' : 'right'"
          >
            <p class="finnish-text-mobile">{{ line }}</p>
            <p class="russian-text-mobile">{{ dialog.rus[index] }}</p>
          </div>
        </div>
      </main>
      <footer class="actions-footer">
        <div class="actions-grid">
          <button class="btn btn-menu mobile w-100p" @click="getInfo" :disabled="!canUseAnalysis">
            <span class="material-symbols-outlined">analytics</span>
            {{ $t('buttons.analysisM') }}
            <span class="material-symbols-outlined pro">crown</span>
          </button>
          <button class="btn btn-menu mobile w-100p" @click="toggleListening">
            <span class="material-symbols-outlined">volume_up</span>
            {{ $t('buttons.listenM') }}
          </button>
        </div>
        <div class="trainings-grid">
          <button
            v-for="(level, index) in trainingLevels"
            :key="level.name"
            class="btn btn-menu mobile w-100p"
            :disabled="
              level.isPro &&
              (level.name === 'level-2' ? !canUseLevel2 : level.name === 'level-3' ? !canUseLevel3 : !canView())
            "
            @click="goToTraining(level)"
          >
            <span class="material-symbols-outlined">{{ level.icon }}</span>
            {{ level.text }}
            <span v-if="level.isPro" class="material-symbols-outlined pro">crown</span>
          </button>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSettingsStore } from '../stores/settingsStore';
import { useDialogStore } from '../stores/dialogStore';
import { useTrainingStore } from '../stores/trainingStore';
import { useUiStore } from '../stores/uiStore';
import { useUserStore } from '../stores/userStore';
import { useBreakpoint } from '../composables/useBreakpoint';
import { usePermissions } from '../composables/usePermissions';
import { clearDialogNoteFlag } from '../utils/dataTransformer';
import { functions, httpsCallable } from '../firebase';
import DialogLayout from '../components/DialogLayout.vue';

const { t } = useI18n();
const props = defineProps({ id: { type: String, required: true } });
const router = useRouter();
const settingsStore = useSettingsStore();
const dialogStore = useDialogStore();
const trainingStore = useTrainingStore();
const uiStore = useUiStore();
const userStore = useUserStore();
const { canView } = usePermissions();
const { isDesktop } = useBreakpoint();

const isMenuOpen = ref(false);
const notView = ref(false);
const noteMarkedAsSeen = ref(false);

// Реактивные флаги для триггера пересчёта
const upgradeShownFlags = ref({
  analysis: sessionStorage.getItem('upgradeShown_analysis') === 'true',
  level2: sessionStorage.getItem('upgradeShown_level2') === 'true',
  level3: sessionStorage.getItem('upgradeShown_level3') === 'true',
});

// Computed для блокировки каждой кнопки отдельно
const canUseAnalysis = computed(() => {
  if (userStore.isPro) return true;
  if (upgradeShownFlags.value.analysis) return false;
  return canView();
});
const canUseLevel2 = computed(() => {
  if (userStore.isPro) return true;
  if (upgradeShownFlags.value.level2) return false;
  return canView();
});
const canUseLevel3 = computed(() => {
  if (userStore.isPro) return true;
  if (upgradeShownFlags.value.level3) return false;
  return canView();
});

const hasSeenNote = computed(() => {
  if (noteMarkedAsSeen.value) return true;

  const key = `dialog_${props.id}_noteSkipped`;
  const savedData = localStorage.getItem(key);

  if (!savedData) return false;

  try {
    const data = JSON.parse(savedData);
    const today = new Date().toISOString().split('T')[0];

    if (data.date === today && data.skipped === true) {
      return true;
    }

    localStorage.removeItem(key);
    return false;
  } catch (e) {
    localStorage.removeItem(key);
    return false;
  }
});

const markNoteAsSeen = () => {
  if (notView.value) {
    const key = `dialog_${props.id}_noteSkipped`;
    const today = new Date().toISOString().split('T')[0];
    const data = {
      skipped: true,
      date: today,
    };
    localStorage.setItem(key, JSON.stringify(data));
  }
  noteMarkedAsSeen.value = true;
};
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const dialog = computed(() => dialogStore.currentDialog);
const trainingLevels = [
  {
    name: 'level-1',
    icon: 'interactive_space',
    text: t('buttons.learning'),
    isPro: false,
    feature: 'useBasicTraining',
  },
  { name: 'level-4', icon: 'hearing', text: t('buttons.listening'), isPro: false, feature: 'useBasicTraining' },
  {
    name: 'level-2',
    icon: 'record_voice_over',
    text: t('buttons.speaking'),
    isPro: true,
    feature: 'useAdvancedTraining',
  },
  { name: 'level-3', icon: 'translate', text: t('buttons.translation'), isPro: true, feature: 'useAdvancedTraining' },
];

onMounted(async () => {
  if (!userStore.isPro) {
    await settingsStore.loadUsageStats();
  }

  // Синхронизируем флаги из sessionStorage
  upgradeShownFlags.value = {
    analysis: sessionStorage.getItem('upgradeShown_analysis') === 'true',
    level2: sessionStorage.getItem('upgradeShown_level2') === 'true',
    level3: sessionStorage.getItem('upgradeShown_level3') === 'true',
  };

  if (!dialogStore.currentDialog || dialogStore.currentDialog.id !== props.id) {
    dialogStore.fetchDialogById(props.id);
  }
});
const handleDelete = async () => {
  isMenuOpen.value = false;
  // ВЫЗЫВАЕМ МОДАЛЬНОЕ ОКНО
  const confirmed = await uiStore.showConfirmation({
    title: t('buttons.delDialog'),
    message: t('view.deleteConfirmMsg'),
    confirmText: t('buttons.del'),
    cancelText: t('buttons.cancel'),
  });
  // Если пользователь не подтвердил, ничего не делаем
  if (!confirmed) return;
  // Если подтвердил, вызываем action из стора
  const success = await dialogStore.deleteDialog(props.id);
  if (success) {
    clearDialogNoteFlag(props.id);
    router.push({ name: 'all-dialogs' });
  } else {
    uiStore.showToast(t('store.delDialogError'), 'error');
  }
};
const toggleListening = () => {
  if (!dialog.value) return;
  trainingStore.togglePlayStop(dialog.value.fin.join('. '));
};
const handleProClick = async (action, buttonType) => {
  if (userStore.isPro) {
    action();
    return;
  }
  await settingsStore.loadUsageStats();

  const previewCount = settingsStore.dailyPreviewCount;
  const previewLimit = settingsStore.limit.useProMode;

  // Если ещё можно использовать
  if (previewCount < previewLimit) {
    await action();
    await settingsStore.loadUsageStats();

    const previewsLeft = settingsStore.limit.useProMode - settingsStore.dailyPreviewCount;
    const message = t('view.usePro');
    let toastMessage = `${message}${previewsLeft}.`;
    if (previewsLeft === 0) {
      toastMessage = t('view.endPro');
    }
    uiStore.showToast(toastMessage, 'warning');
  }
  // Если лимит достигнут
  else {
    uiStore.showUpgradeModal();
    if (buttonType) {
      sessionStorage.setItem(`upgradeShown_${buttonType}`, 'true');
      upgradeShownFlags.value[buttonType] = true;
    }
  }
};
const getInfo = async () => {
  await handleProClick(async () => {
    await trainingStore.fetchDialogAnalysis();
    uiStore.showModal('analysis');
  }, 'analysis');
};
const goToTraining = async (level) => {
  if (!level.isPro) {
    // Бесплатная тренировка — просто переходим
    router.push({ name: level.name, params: { id: props.id } });
    return;
  }

  // PRO-тренировка (level-2 или level-3)
  if (userStore.isPro) {
    router.push({ name: level.name, params: { id: props.id } });
    return;
  }

  // Free-пользователь → проверяем лимит
  await settingsStore.loadUsageStats();

  const previewCount = settingsStore.dailyPreviewCount;
  const previewLimit = settingsStore.limit.useProMode;

  if (previewCount < previewLimit) {
    // ✅ Увеличиваем счётчик на сервере
    try {
      const callGemini = httpsCallable(functions, 'callGemini');
      await callGemini({
        prompt: 'increment_preview_count', // Специальный промпт
        operationType: 'training',
      });

      // Перезагружаем счётчики
      await settingsStore.loadUsageStats();

      // Показываем тост
      const previewsLeft = settingsStore.limit.useProMode - settingsStore.dailyPreviewCount;
      const message = t('view.usePro');
      let toastMessage = `${message}${previewsLeft}.`;
      if (previewsLeft === 0) {
        toastMessage = t('view.endPro');
      }
      uiStore.showToast(toastMessage, 'warning');

      // Переходим на тренировку
      router.push({ name: level.name, params: { id: props.id } });
    } catch (error) {
      console.error('Ошибка увеличения счётчика:', error);
      uiStore.showToast('Произошла ошибка', 'error');
    }
  } else {
    // Лимит достигнут → модалка и блокировка
    uiStore.showUpgradeModal();
    const buttonType = level.name === 'level-2' ? 'level2' : 'level3';
    sessionStorage.setItem(`upgradeShown_${buttonType}`, 'true');
    upgradeShownFlags.value[buttonType] = true;
  }
};
</script>

<style scoped>
/* ============================================= */
/* 1. ОБЩИЕ СТИЛИ (для обеих версий)             */
/* ============================================= */
.not-view-wrap {
  width: 100%;
  display: flex;
  justify-content: end;
  align-items: center;
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  color: var(--text-base);
  gap: 8px;
}
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  appearance: none;
  -webkit-appearance: none;
  background: var(--y0);
  border-radius: 34px;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: background-color 0.2s;
}
.toggle-switch::before {
  content: '';
  position: absolute;
  left: 2px;
  top: 2px;
  width: 18px;
  height: 18px;
  background-color: var(--y10);
  border-radius: 50%;
  transition: transform 0.2s;
}
.toggle-switch:checked {
  background-color: var(--y9);
}
.toggle-switch:checked::before {
  background-color: var(--text-title);
  transform: translateX(20px);
}
.toggle-switch:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.note-container {
  position: fixed;
  width: 100%;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px;
  height: 100vh;
  background-color: var(--bg-main);
  text-align: center;
  z-index: 100;
}
.fade-in {
  animation-name: fade-in;
  animation-duration: 0.8s;
  animation-timing-function: ease-in-out;
}
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.note {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
}
.note .icon {
  font-size: 48px;
  color: var(--bg-pro);
}
.note button {
  margin-top: 16px;
  margin-left: auto;
}
.note .note-text {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--lg);
  line-height: 1.5;
  font-weight: 400;
  color: var(--text-title);
}
/* ============================================= */
/* 2. СТИЛИ ДЛЯ ПЛАНШЕТОВ И ДЕСКТОПОВ */
/* ============================================= */
@media (min-width: 768px) {
  .note {
    max-width: 800px;
  }
  .note button {
    margin-top: 32px;
  }
}
.pro {
  position: absolute;
  top: 0;
  right: 0;
  margin-top: 8px;
  margin-right: 8px;
  font-size: var(--xs);
  color: var(--gold-4);
  background: none;
}
.title {
  font-size: var(--xxl);
  text-align: center;
  color: var(--t-pro);
}
.subtitle {
  font-size: var(--xl);
  text-align: center;
  color: var(--text-head);
  margin-bottom: 16px;
}
.description {
  font-size: var(--md);
  text-align: center;
  color: var(--text-base);
  margin: 8px 0;
}
.buttons {
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 16px;
}
/* ============================================= */
/* 2. СТИЛИ ДЛЯ ДЕСКТОПНОГО МАКЕТА (>= 768px)    */
/* ============================================= */
.scroll-container {
  padding: 16px 0;
}
.dialog-info {
  text-align: center;
  margin-bottom: 32px;
}
.dialog-info-title {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--lg);
  font-weight: 700;
  color: var(--g3);
}
.dialog-info-level {
  font-size: var(--md);
  color: var(--text-head);
}
.dialog-line {
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border);
}
.finnish-text {
  font-size: var(--md);
  font-weight: 500;
  color: var(--text-head);
  margin-bottom: 16px;
}
.russian-text {
  font-size: var(--sm);
  font-style: italic;
  color: var(--text-title);
  padding-left: 32px;
}
/* ============================================= */
/* 3. СТИЛИ ДЛЯ МОБИЛЬНОГО МАКЕТА (< 768px)      */
/* ============================================= */
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--bg-main);
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  background-color: var(--bg-side);
  border-bottom: 1px solid var(--bb);
  flex-shrink: 0;
}
.header-btn {
  background: none;
  color: var(--text-head);
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.header-btn .i {
  font-size: 40px;
  margin-left: 32px;
}
.header-title {
  flex-grow: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}
.header-title h1 {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--md);
  font-weight: 700;
  color: var(--text-head);
  line-height: 1;
}
.badge {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--xs);
  font-weight: 600;
}
.drop {
  font-size: 24px;
}
.dropdown-menu {
  position: absolute;
  top: 48px;
  right: 24px;
  z-index: 100;
  border-radius: 24px;
  border: 1px solid var(--r3);
  box-shadow: 0 4px 12px var(--shadow);
  overflow: hidden;
}
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--r1);
  font-size: var(--xs);
  font-weight: 500;
  width: 100%;
}
.dropdown-item:hover {
  background-color: var(--r2);
}
.dropdown-item.danger {
  font-family: 'Roboto Condensed', sans-serif;
  text-transform: uppercase;
  color: var(--r3);
}
.dropdown-item .material-symbols-outlined {
  font-size: var(--md);
}
/* Анимация появления */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 8px 16px;
}
.chat-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.actions-footer {
  flex-shrink: 0;
  padding: 16px;
  background-color: var(--bg-side);
  border-top: 1px solid var(--bb);
  box-shadow: 0 -4px 8px rgba(0, 0, 0, 0.1);
}
.actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}
.trainings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
</style>
