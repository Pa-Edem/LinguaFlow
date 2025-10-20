<!-- src\views\Level_1.vue -->
<template>
  <div v-if="isDesktop">
    <DialogLayout>
      <template #sidebar-content>
        <TrainingSidebar
          :dialogId="props.id"
          :slogan="$t('level1.slogan')"
          :description="$t('level1.description')"
        >
          <template #extra-controls>
            <button
              class="btn btn-control"
              disabled
            >
              <span class="material-symbols-outlined icon">mic_off</span>
              <span class="btn-text">{{ $t('buttons.mic') }}</span>
            </button>
          </template>
        </TrainingSidebar>
      </template>

      <div
        v-if="dialog"
        class="dialog-text-container-desktop"
        ref="desktopContent"
      >
        <div
          v-for="(line, index) in visibleLines.fin"
          :key="index"
          class="message-bubble-desktop fade-in"
          :class="index % 2 === 0 ? 'left' : 'right'"
        >
          <p class="finnish-text">{{ line }}</p>
          <p class="russian-text">{{ visibleLines.rus[index] }}</p>
        </div>
      </div>
    </DialogLayout>
  </div>

  <div
    v-else-if="dialog"
    class="page-container"
  >
    <header class="level-header">
      <router-link
        to="/dialogs"
        class="level-header-btn"
      >
        <span class="material-symbols-outlined i">arrow_back_ios</span>
      </router-link>
      <div class="level-header-title">
        <p class="level-description-mobile">{{ $t('level1.descriptionMobile') }}</p>
      </div>
    </header>

    <main
      class="content"
      ref="mobileContent"
    >
      <div class="chat-container">
        <div
          v-for="(line, index) in visibleLines.fin"
          :key="index"
          class="message-bubble fade-in"
          :class="index % 2 === 0 ? 'left' : 'right'"
        >
          <p class="finnish-text-mobile">{{ line }}</p>
          <p class="russian-text-mobile">{{ visibleLines.rus[index] }}</p>
        </div>
      </div>
    </main>

    <footer class="actions-footer">
      <TrainingSidebar
        :dialogId="props.id"
        :description="$t('level1.description_mobile')"
      >
        <template #extra-controls>
          <button
            class="btn btn-control mobile"
            disabled
          >
            <span class="material-symbols-outlined icon">mic_off</span>
          </button>
        </template>
      </TrainingSidebar>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useDialogStore } from '../stores/dialogStore';
import { useTrainingStore } from '../stores/trainingStore';
import { useBreakpoint } from '../composables/useBreakpoint';
import DialogLayout from '../components/DialogLayout.vue';
import TrainingSidebar from '../components/TrainingSidebar.vue';

const props = defineProps({ id: { type: String, required: true } });
const dialogStore = useDialogStore();
const trainingStore = useTrainingStore();
const { isDesktop } = useBreakpoint();

const lineIndex = computed(() => trainingStore.currentLineIndex);
const dialog = computed(() => dialogStore.currentDialog);

const mobileContent = ref(null);
const desktopContent = ref(null);

watch(lineIndex, () => {
  setTimeout(() => {
    const container = isDesktop.value ? desktopContent.value : mobileContent.value;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }, 100);
});

const visibleLines = computed(() => {
  if (!dialog.value) return { fin: [], rus: [] };
  return {
    fin: dialog.value.fin.slice(0, lineIndex.value + 1),
    rus: dialog.value.rus.slice(0, lineIndex.value + 1),
  };
});

onMounted(async () => {
  trainingStore.setCurrentTrainingType('level-1');
  await dialogStore.fetchDialogById(props.id);
  if (dialogStore.currentDialog) {
    trainingStore.startLevel();
  }
});

onUnmounted(() => {
  trainingStore.stopSpeech();
});
</script>

<style scoped>
/* ======================== ДЕСКТОП ======================== */
.dialog-text-container-desktop {
  display: flex;
  flex-direction: column;
  width: 90%;
  height: 100%;
  gap: 16px;
  margin: 0 auto;
  padding-right: 8px;
  overflow-y: auto;
}
/* ======================== МОБИЛЬНЫЙ ======================== */
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 16px;
  scroll-behavior: smooth;
}
.actions-footer {
  flex-shrink: 0;
  padding: 16px;
  background-color: var(--y10);
  border-top: 1px solid var(--bb);
  box-shadow: 0 -4px 8px var(--shadow);
}
</style>
