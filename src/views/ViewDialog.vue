<!-- \\src\views\ViewDialog.vue -->
<template>
  <div v-if="dialog && !uiStore.loading">
    <!-- FOR DESKTOP -->
    <div v-if="isDesktop">
      <DialogLayout>
        <template #sidebar-content>
          <div class="grow"></div>
          <div class="dialog-info">
            <h2 class="dialog-info-title">{{ dialog?.title }}</h2>
            <span class="dialog-info-level">{{ dialog?.level }}</span>
          </div>
          <!-- кнопка анализ диалога -->
          <button
            class="btn btn-menu"
            @click="getInfo"
            :disabled="!canView()"
          >
            <span class="material-symbols-outlined">analytics</span>
            {{ $t('buttons.analysis') }}
            <span class="material-symbols-outlined pro">crown</span>
          </button>
          <!-- кнопка прослушать диалог -->
          <button
            class="btn btn-menu"
            @click="toggleListening"
          >
            <span class="material-symbols-outlined">volume_up</span>
            {{ $t('buttons.listen') }}
          </button>
          <div class="grow"></div>
          <!-- кнопки тренировок -->
          <button
            v-for="level in trainingLevels"
            :key="level.name"
            class="btn btn-menu"
            :disabled="level.isPro && !canView()"
            @click="goToTraining(level)"
          >
            <span class="material-symbols-outlined">{{ level.icon }}</span>
            {{ level.text }}
            <span
              v-if="level.isPro"
              class="material-symbols-outlined pro"
              >crown</span
            >
          </button>
          <div class="grow"></div>
          <!-- кнопка удалить диалог -->
          <button
            class="btn btn-danger"
            @click="handleDelete"
          >
            <span class="material-symbols-outlined">delete</span>
            {{ $t('buttons.delDialog') }}
          </button>
        </template>
        <!-- текст диалога -->
        <div
          v-if="dialog"
          class="scroll-container"
        >
          <div
            v-for="(fin, index) in dialog.fin"
            :key="index"
            class="dialog-line"
          >
            <p class="finnish-text">{{ fin }}</p>
            <p class="russian-text">{{ dialog.rus[index] }}</p>
          </div>
        </div>
      </DialogLayout>
    </div>

    <!-- FOR MOBILE -->
    <div
      v-else
      class="page-container"
    >
      <header class="header">
        <router-link
          to="/dialogs"
          name="all-dialogs"
          class="header-btn"
        >
          <span class="material-symbols-outlined i">arrow_back_ios</span>
        </router-link>
        <div class="header-title">
          <h1>{{ dialog.title }}</h1>
          <span class="badge">{{ dialog.level }}</span>
        </div>
      </header>
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
          <button
            class="btn btn-danger mobile w-50"
            @click="handleDelete"
          >
            <span class="material-symbols-outlined">delete</span>
          </button>

          <button
            class="btn btn-menu mobile"
            @click="getInfo"
            :disabled="!canView()"
          >
            <span class="material-symbols-outlined">analytics</span>
            {{ $t('buttons.analysisM') }}
            <span class="material-symbols-outlined pro">crown</span>
          </button>
          <button
            class="btn btn-menu mobile"
            @click="toggleListening"
          >
            <span class="material-symbols-outlined">volume_up</span>
            {{ $t('buttons.listenM') }}
          </button>
        </div>
        <div class="trainings-grid">
          <button
            v-for="level in trainingLevels"
            :key="level.name"
            class="btn btn-menu mobile w-100p"
            :disabled="level.isPro && !canView()"
            @click="goToTraining(level)"
          >
            <span class="material-symbols-outlined">{{ level.icon }}</span>
            {{ level.text }}
            <span
              v-if="level.isPro"
              class="material-symbols-outlined pro"
              >crown</span
            >
          </button>
        </div>
      </footer>
    </div>
  </div>

  <!-- <Teleport to="body">
    <Modal>
      <template #header>
        <h3
          v-if="uiStore.modalContent === 'analysis'"
          class="title"
        >
          {{ $t('view.headerAnalysis') }}
        </h3>
        <h3
          v-else-if="uiStore.modalContent === 'upgrade'"
          class="title"
        >
          {{ $t('view.goToPro') }}
        </h3>
      </template>

      <div
        v-if="uiStore.modalContent === 'analysis'"
        v-html="trainingStore.geminiResult"
      ></div>
      <div
        v-else-if="uiStore.modalContent === 'upgrade'"
        class="pro-benefits"
      >
        <h4 class="subtitle">{{ $t('view.unlock') }}</h4>
        <ul>
          <li class="description">{{ $t('view.description1') }}</li>
          <li class="description">{{ $t('view.description2') }}</li>
          <li class="description">{{ $t('view.description3') }}</li>
          <li class="description">{{ $t('view.description4') }}</li>
        </ul>
      </div>

      <template
        #footer
        v-if="uiStore.modalContent !== 'analysis'"
      >
        <div class="buttons">
          <button
            class="btn btn-common w-150"
            @click="uiStore.hideModal()"
          >
            <span class="material-symbols-outlined">close</span>
            {{ $t('buttons.close') }}
          </button>
          <router-link
            to="/profile"
            @click="uiStore.hideModal()"
          >
            <button class="btn btn-action w-150">
              <span class="material-symbols-outlined">details</span>
              {{ $t('buttons.findMore') }}
            </button>
          </router-link>
        </div>
      </template>
    </Modal>
  </Teleport> -->
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSettingsStore } from '../stores/settingsStore';
import { useDialogStore } from '../stores/dialogStore';
import { useTrainingStore } from '../stores/trainingStore';
import { useUiStore } from '../stores/uiStore';
import { useUserStore } from '../stores/userStore';
import { useBreakpoint } from '../composables/useBreakpoint';
import { usePermissions } from '../composables/usePermissions';
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

onMounted(() => {
  dialogStore.fetchDialogById(props.id);
});
const handleDelete = async () => {
  // СНАЧАЛА ВЫЗЫВАЕМ МОДАЛЬНОЕ ОКНО
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
    router.push({ name: 'all-dialogs' });
  } else {
    uiStore.showToast(t('store.delDialogError'), 'error');
  }
};
const toggleListening = () => {
  if (!dialog.value) return;
  trainingStore.togglePlayStop(dialog.value.fin.join('. '));
};
const handleProClick = (action) => {
  if (userStore.isPro) {
    action();
    return;
  }
  if (settingsStore.dailyPreviewCount < settingsStore.limit.useProMode) {
    settingsStore.incrementCount('view');
    const previewsLeft = settingsStore.limit.useProMode - settingsStore.dailyPreviewCount;
    const message = t('view.usePro');
    let toastMessage = `${message}${previewsLeft}.`;
    if (previewsLeft === 0) {
      toastMessage = t('view.endPro');
    }
    uiStore.showToast(toastMessage, 'warning');
    action();
  } else {
    settingsStore.incrementCount('view');
    uiStore.showUpgradeModal();
  }
};
const getInfo = async () => {
  handleProClick(async () => {
    await trainingStore.fetchDialogAnalysis();
    uiStore.showModal('analysis');
  });
};
const goToTraining = (level) => {
  if (level.isPro) {
    handleProClick(() => {
      router.push({ name: level.name, params: { id: props.id } });
    });
  } else {
    router.push({ name: level.name, params: { id: props.id } });
  }
};
</script>

<style scoped>
/* ============================================= */
/* 1. ОБЩИЕ СТИЛИ (для обеих версий)             */
/* ============================================= */
.pro {
  position: absolute;
  top: 0;
  right: 0;
  margin-top: 8px;
  margin-right: 8px;
  font-size: var(--lg);
  color: var(--bg-pro);
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
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--border);
}
.finnish-text {
  font-size: var(--md);
  font-weight: 600;
  color: var(--text-head);
  margin-bottom: 8px;
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
  font-size: var(--md);
  font-weight: 700;
  color: var(--text-head);
  line-height: 1;
}
.badge {
  font-size: var(--sm);
  font-weight: 600;
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
.message-bubble {
  color: var(--text-head);
  padding: 8px 16px;
  border-radius: 1rem;
  max-width: 80%;
  border: 1px solid var(--bb);
}
.message-bubble.left {
  background-color: var(--bg-chat-l);
  border-bottom-left-radius: 2px;
  align-self: flex-start;
}
.message-bubble.right {
  background-color: var(--bg-chat-r);
  border-bottom-right-radius: 2px;
  align-self: flex-end;
}
.finnish-text-mobile {
  font-size: var(--md);
  font-weight: 600;
}
.russian-text-mobile {
  font-size: var(--md);
  font-style: italic;
  text-align: right;
  margin-top: 8px;
}
.actions-footer {
  flex-shrink: 0;
  padding: 16px;
  background-color: var(--bg-side);
  border-top: 1px solid var(--bb);
  box-shadow: 0 -4px 8px rgba(0, 0, 0, 0.1);
}
.actions-grid {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}
.trainings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
</style>
