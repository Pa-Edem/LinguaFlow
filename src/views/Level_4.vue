<!-- src\views\Level_4.vue -->

<template>
  <div v-if="isDesktop" class="in-view">
    <DialogLayout>
      <template #sidebar-content>
        <TrainingSidebar :dialogId="props.id" :slogan="$t('level4.slogan')" :description="$t('level4.description')">
          <template #extra-controls>
            <button class="btn btn-control oooo" disabled>
              <span class="material-symbols-outlined icon">mic_off</span>
              <span class="btn-text">{{ $t('buttons.mic') }}</span>
            </button>
          </template>
        </TrainingSidebar>
      </template>

      <div v-if="dialog" class="quiz-content">
        <div class="options-container">
          <button
            v-for="(option, index) in trainingStore.currentQuizOptions"
            :key="`${trainingStore.currentLineIndex}-${index}`"
            class="btn btn-quiz"
            @click="handleAnswer(option)"
            :class="{
              correct: answerStatus[option.text] === 'correct',
              incorrect: answerStatus[option.text] === 'incorrect',
            }"
            :disabled="answerStatus[option.text] === 'incorrect' || isAnswered"
          >
            {{ option.text }}
          </button>
        </div>
      </div>
    </DialogLayout>
  </div>

  <div v-else-if="dialog" class="page-container in-view">
    <header class="header">
      <router-link to="/dialogs" class="header-btn">
        <span class="material-symbols-outlined i">arrow_back_ios</span>
      </router-link>
      <div class="header-title">
        <p class="description-mobile">{{ $t('level4.descriptionMobile') }}</p>
      </div>
    </header>

    <main class="content">
      <div class="options-container">
        <button
          v-for="(option, index) in trainingStore.currentQuizOptions"
          :key="`${trainingStore.currentLineIndex}-${index}`"
          class="btn btn-quiz"
          @click="handleAnswer(option)"
          :class="{
            correct: answerStatus[option.text] === 'correct',
            incorrect: answerStatus[option.text] === 'incorrect',
          }"
          :disabled="answerStatus[option.text] === 'incorrect' || isAnswered"
        >
          <span class="text-quiz">{{ option.text }}</span>
        </button>
      </div>
    </main>

    <footer class="actions-footer">
      <TrainingSidebar :dialogId="props.id" :description="$t('level4.descriptionMobile')">
        <template #extra-controls>
          <button class="btn btn-control oooo mobile" disabled>
            <span class="material-symbols-outlined icon">mic_off</span>
          </button>
        </template>
      </TrainingSidebar>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useDialogStore } from '../stores/dialogStore';
import { useTrainingStore } from '../stores/trainingStore';
import { useUserStore } from '../stores/userStore';
import { useUiStore } from '../stores/uiStore';
import { useBreakpoint } from '../composables/useBreakpoint';
import { saveDialogProgress } from '../services/trainingProgressService';
import { TRAINING_CONFIG } from '../config/trainingConfig';
import DialogLayout from '../components/DialogLayout.vue';
import TrainingSidebar from '../components/TrainingSidebar.vue';

const props = defineProps({ id: { type: String, required: true } });
const dialogStore = useDialogStore();
const trainingStore = useTrainingStore();
const userStore = useUserStore();
const uiStore = useUiStore();
const { isDesktop } = useBreakpoint();

const dialog = computed(() => dialogStore.currentDialog);

const answerStatus = ref({});
const isAnswered = ref(false);
const totalErrors = ref(0);

watch(
  () => trainingStore.currentLineIndex,
  () => {
    answerStatus.value = {};
    isAnswered.value = false;
    if (trainingStore.currentLineIndex === 0) {
      totalErrors.value = 0;
    }
  }
);

const handleAnswer = (option) => {
  if (isAnswered.value) return;

  if (option.correct) {
    isAnswered.value = true;
    answerStatus.value[option.text] = 'correct';
    setTimeout(() => {
      trainingStore.nextLine();
    }, 1500);
  } else {
    // СЧИТАЕМ ОШИБКИ
    totalErrors.value++;
    answerStatus.value[option.text] = 'incorrect';
    trainingStore.playCurrentLineAudio();
  }
};

// ОБРАБОТЧИК СОБЫТИЯ "ПОСЛЕДНЯЯ РЕПЛИКА"
function handleCompleteEvent() {
  completeTraining();
}

// ЗАВЕРШЕНИЕ ТРЕНИРОВКИ
async function completeTraining() {
  console.log('Завершение, сохранение прогресса');

  const dialog = dialogStore.currentDialog;
  const totalReplicas = dialog?.fin.length || 6;
  const allReplicasCompleted = trainingStore.currentLineIndex >= totalReplicas - 1;
  const averageAccuracy = totalErrors.value <= 1 ? 100 : 50;
  const fakeScores = Array(totalReplicas).fill(averageAccuracy);

  const tier = userStore.isPremium ? 'premium' : userStore.isPro ? 'pro' : 'free';

  // Сохранить прогресс
  if (tier !== 'free') {
    const extractBaseLevel = (level) => {
      if (!level) return '';
      const match = level.match(/^([A-C][1-2])/);
      return match ? match[1] : '';
    };

    const languageLevel = extractBaseLevel(dialog.value?.level);
    const result = await saveDialogProgress(
      props.id,
      'level4',
      {
        averageAccuracy,
        replicaScores: fakeScores,
        totalErrors: totalErrors.value,
        allReplicasCompleted,
      },
      tier,
      languageLevel
    );
  }

  // Показать модалку
  const dialogCompleted = TRAINING_CONFIG.isDialogCompleted('level4', {
    totalErrors: totalErrors.value,
  });

  if (tier === 'free') {
    uiStore.showModal('trainingCompleteFree', {
      dialogId: props.id,
      averageAccuracy,
      dialogCompleted,
    });
  } else {
    uiStore.showModal('trainingComplete', {
      dialogId: props.id,
      averageAccuracy,
      dialogCompleted,
      replicaScores: fakeScores,
      minReplicaAccuracy: 0,
      minDialogAccuracy: 0,
    });
  }
}

onMounted(async () => {
  trainingStore.setCurrentTrainingType('level-4');
  await dialogStore.fetchDialogById(props.id);
  if (dialogStore.currentDialog) {
    trainingStore.startLevel();
  }
  window.addEventListener('completeTraining', handleCompleteEvent);
});

onUnmounted(() => {
  trainingStore.stopSpeech();
  window.removeEventListener('completeTraining', handleCompleteEvent);
});
</script>

<style scoped>
/* ======================== ОБЩИЕ СТИЛИ КВИЗА ======================== */
.quiz-content,
.content {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}
.btn-quiz {
  min-width: 240px;
  max-width: 480px;
  font-family: 'Roboto Condensed', sans-serif;
  white-space: normal;
  word-break: break-word;
  padding: 16px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  font-weight: 500;
  text-align: center;
  text-transform: none;
  cursor: pointer;
  background-color: var(--bg-side);
  color: var(--text-head);
  border-radius: 12px;
  border: 1px solid var(--border);
  transition: all 0.2s ease-in-out;
}
.btn-quiz:not(:disabled):hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px var(--shadow);
  border-color: var(--bb);
}
.btn-quiz.correct {
  background-color: var(--g0);
  color: var(--g3);
  border-color: var(--g3);
  transform: scale(1.025);
  opacity: 1;
}
.btn-quiz.incorrect {
  background-color: var(--r1);
  color: var(--r3);
  border-color: var(--r3);
  opacity: 0.8;
  cursor: not-allowed;
}

/* ======================== МОБИЛЬНЫЙ ======================== */
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.header {
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: var(--bg-side);
  border-bottom: 1px solid var(--bb);
  box-shadow: 0 4px 8px var(--shadow);
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
}
.description-mobile {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--md);
  font-style: italic;
  font-weight: 500;
  color: var(--g3);
  text-align: center;
}
.content {
  padding: 32px;
}
.options-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  width: 100%;
}
.btn-quiz {
  min-height: 80px;
  font-size: var(--md);
}
.actions-footer {
  flex-shrink: 0;
  padding: 16px;
  background-color: var(--y10);
  border-top: 1px solid var(--bb);
  box-shadow: 0 -4px 8px var(--shadow);
}

/* ======================== ДЕСКТОП ======================== */
@media (min-width: 1024px) {
  .quiz-content {
    padding: 32px;
  }
  .options-container {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
    max-width: 1024px;
  }
  .btn-quiz {
    min-height: 120px;
    font-size: var(--md);
  }
}
</style>
