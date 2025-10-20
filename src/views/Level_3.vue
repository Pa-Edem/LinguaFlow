<!-- src\views\Level_3.vue -->
<template>
  <div v-if="isDesktop">
    <DialogLayout>
      <template #sidebar-content>
        <TrainingSidebar
          :dialogId="props.id"
          :slogan="$t('level3.slogan')"
          :description="$t('level3.description')"
          :mic-button="true"
        >
          <template #extra-controls>
            <button
              class="btn btn-control mic"
              @click="trainingStore.toggleSpeechRecognition()"
              :class="{ active: trainingStore.isMicActive }"
            >
              <span class="material-symbols-outlined icon">{{ trainingStore.isMicActive ? 'mic' : 'mic_off' }}</span>
              <span class="btn-text">{{ $t('buttons.mic') }}</span>
            </button>
          </template>
        </TrainingSidebar>
      </template>

      <div class="content-wrapper">
        <div
          class="dialog-text-container-desktop"
          ref="desktopContent"
        >
          <div
            v-for="(rusLine, index) in visibleLines.rus"
            :key="index"
            class="message-bubble-desktop fade-in"
            :class="index % 2 === 0 ? 'left' : 'right'"
          >
            <p
              v-if="visibleLines.fin[index]"
              class="finnish-text"
            >
              {{ visibleLines.fin[index] }}
            </p>

            <p class="russian-text">
              {{ rusLine }}
            </p>
          </div>
        </div>
        <div class="div"></div>
        <div class="recognized-text-container">
          <p
            v-if="trainingStore.geminiResult"
            class="gemini-result"
          >
            {{ trainingStore.geminiResult }}
          </p>
          <p
            v-else
            class="placeholder-text"
          >
            {{ $t('level3.info') }}
          </p>
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
        <p class="level-description-mobile">{{ $t('level3.descriptionMobile') }}</p>
      </div>
    </header>

    <main
      class="content"
      ref="mobileContent"
    >
      <div class="chat-container">
        <div
          v-for="(rusLine, index) in visibleLines.rus"
          :key="index"
          class="message-bubble fade-in"
          :class="index % 2 === 0 ? 'left' : 'right'"
        >
          <p
            v-if="visibleLines.fin[index]"
            class="finnish-text-mobile"
          >
            {{ visibleLines.fin[index] }}
          </p>

          <p class="russian-text-mobile">
            {{ rusLine }}
          </p>
        </div>
      </div>
    </main>

    <footer class="actions-footer">
      <div class="recognized-text-container-mobile">
        <p
          v-if="trainingStore.geminiResult"
          class="gemini-result"
        >
          {{ trainingStore.geminiResult }}
        </p>
        <p
          v-else
          class="placeholder-text-mobile"
        >
          {{ $t('level3.info') }}
        </p>
      </div>
      <TrainingSidebar
        :dialogId="props.id"
        :description="$t('level3.description_mobile')"
      >
        <template #extra-controls>
          <button
            class="btn btn-control mobile mic"
            @click="trainingStore.toggleSpeechRecognition()"
            :class="{ active: trainingStore.isMicActive }"
          >
            <span class="material-symbols-outlined icon">{{ trainingStore.isMicActive ? 'mic' : 'mic_off' }}</span>
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

  const currentIndex = lineIndex.value;
  const finLines = dialog.value.fin.slice(0, currentIndex);
  const rusLines = dialog.value.rus.slice(0, currentIndex + 1);

  return {
    fin: finLines,
    rus: rusLines,
  };
});

onMounted(async () => {
  trainingStore.setCurrentTrainingType('level-3');
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
.content-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}
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

.recognized-text-container {
  height: 90px;
  flex-shrink: 0;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.recognized-text,
.placeholder-text {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--md);
  color: var(--text-base);
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
  padding: 8px 16px 16px;
  background-color: var(--y10);
  border-top: 1px solid var(--bb);
  box-shadow: 0 -4px 8px var(--shadow);
}
.recognized-text-container-mobile {
  flex-shrink: 0;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.gemini-result,
.placeholder-text-mobile {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--md);
  color: var(--text-head);
}
</style>
