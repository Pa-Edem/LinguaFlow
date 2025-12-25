<!-- src\views\Level_2.vue -->
<template>
  <div v-if="isDesktop" class="in-view">
    <DialogLayout>
      <template #sidebar-content>
        <TrainingSidebar
          :dialogId="props.id"
          :slogan="$t('level2.slogan')"
          :description="$t('level2.description')"
          :mic-button="true"
        >
          <template #extra-controls>
            <button
              class="btn btn-control mic"
              @click="trainingStore.toggleSpeechRecognition()"
              :class="trainingStore.isMicActive ? ' active w-250' : ''"
              :disabled="!trainingStore.canUseMic"
            >
              <span class="material-symbols-outlined icon">{{ trainingStore.isMicActive ? 'mic' : 'mic_off' }}</span>
              <span class="btn-text">{{ $t('buttons.mic') }}</span>
            </button>
          </template>
        </TrainingSidebar>
      </template>

      <div class="content-wrapper">
        <div class="dialog-text-container-desktop" ref="desktopContent">
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
        <div class="div"></div>
        <div class="recognized-text-container">
          <div class="text-with-checkmark">
            <p
              v-if="trainingStore.formattedRecognitionText"
              class="recognized-text"
              v-html="trainingStore.formattedRecognitionText"
            ></p>
            <p v-else class="placeholder-text">
              {{ $t('level2.info') }}
            </p>

            <!-- CHECK или CROSS СПРАВА ОТ ТЕКСТА -->
            <CheckmarkAnimation :show="showCheckmark" />
            <CrossAnimation :show="showCross" />
          </div>
        </div>
      </div>
    </DialogLayout>
  </div>

  <div v-else-if="dialog" class="page-container in-view">
    <header class="level-header">
      <router-link to="/dialogs" class="level-header-btn">
        <span class="material-symbols-outlined i">arrow_back_ios</span>
      </router-link>
      <div class="level-header-title">
        <p class="level-description-mobile">{{ $t('level2.descriptionMobile') }}</p>
      </div>
    </header>

    <main class="content" ref="mobileContent">
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
      <div class="recognized-text-container-mobile">
        <!-- ✅ КОНТЕЙНЕР С ТЕКСТОМ И ГАЛОЧКОЙ -->
        <div class="text-with-checkmark">
          <p
            v-if="trainingStore.formattedRecognitionText"
            class="recognized-text-mobile"
            v-html="trainingStore.formattedRecognitionText"
          ></p>
          <p v-else class="placeholder-text-mobile">
            {{ $t('level2.info') }}
          </p>

          <!-- CHECK или CROSS СПРАВА ОТ ТЕКСТА -->
          <CheckmarkAnimation :show="showCheckmark" />
          <CrossAnimation :show="showCross" />
        </div>
      </div>
      <TrainingSidebar :dialogId="props.id" :description="$t('level2.descriptionMobile')">
        <template #extra-controls>
          <button
            class="btn btn-control mobile mic"
            @click="trainingStore.toggleSpeechRecognition()"
            :class="{ active: trainingStore.isMicActive }"
            :disabled="!trainingStore.canUseMic"
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
import { useUserStore } from '../stores/userStore';
import { useUiStore } from '../stores/uiStore';
import { useBreakpoint } from '../composables/useBreakpoint';
import { saveDialogProgress } from '../services/trainingProgressService';
import { TRAINING_CONFIG } from '../config/trainingConfig';
import DialogLayout from '../components/DialogLayout.vue';
import TrainingSidebar from '../components/TrainingSidebar.vue';
import CheckmarkAnimation from '../components/CheckmarkAnimation.vue';
import CrossAnimation from '../components/CrossAnimation.vue';

const props = defineProps({ id: { type: String, required: true } });
const dialogStore = useDialogStore();
const trainingStore = useTrainingStore();
const uiStore = useUiStore();
const userStore = useUserStore();
const { isDesktop } = useBreakpoint();

const replicaScores = ref([]);
const showCheckmark = ref(false);
const showCross = ref(false);
const mobileContent = ref(null);
const desktopContent = ref(null);

const lineIndex = computed(() => trainingStore.currentLineIndex);
const dialog = computed(() => dialogStore.currentDialog);

// АВТОСКРОЛЛ РЕПЛИК
watch(lineIndex, () => {
  setTimeout(() => {
    const container = isDesktop.value ? desktopContent.value : mobileContent.value;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }, 100);
});

// СЛЕДИМ ЗА ТОЧНОСТЬЮ
watch(
  () => trainingStore.currentAccuracy,
  (newAccuracy) => {
    if (newAccuracy > 0) {
      // Сохраняем результат реплики
      replicaScores.value[trainingStore.currentLineIndex] = newAccuracy;
      console.log(`✅ Реплика ${trainingStore.currentLineIndex + 1}: ${newAccuracy}%`);
      // ПОКАЗЫВАЕМ ГАЛОЧКУ если точность >= min
      if (newAccuracy >= TRAINING_CONFIG.completion.level2.minReplicaAccuracy) {
        showCheckmark.value = true;
        setTimeout(() => {
          showCheckmark.value = false;
          trainingStore.nextLine();
        }, 3000);
      }
      // ПОКАЗЫВАЕМ КРЕСТИК если точность < min
      if (newAccuracy < TRAINING_CONFIG.completion.level2.minReplicaAccuracy) {
        showCross.value = true;
        setTimeout(() => {
          showCross.value = false;
        }, 3000);
      }
    }
  }
);

const visibleLines = computed(() => {
  if (!dialog.value) return { fin: [], rus: [] };
  return {
    fin: dialog.value.fin.slice(0, lineIndex.value + 1),
    rus: dialog.value.rus.slice(0, lineIndex.value + 1),
  };
});

// ОБРАБОТЧИК СОБЫТИЯ "ПОСЛЕДНЯЯ РЕПЛИКА"
function handleCompleteEvent() {
  completeTraining();
}

// ЗАВЕРШЕНИЕ ТРЕНИРОВКИ
async function completeTraining() {
  console.log('Завершение, сохранение прогресса');
  // Фильтруем только реально пройденные реплики
  const validScores = replicaScores.value.filter((score) => score !== undefined);
  if (validScores.length === 0) {
    console.warn('⚠️ Нет результатов для сохранения');
    return;
  }
  // Вычисляем среднюю точность
  const averageAccuracy = Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length);
  // Проверяем прохождение
  const dialogCompleted = TRAINING_CONFIG.isDialogCompleted('level2', {
    averageAccuracy,
    replicaScores: validScores,
  });
  console.log(`Level-2 завершён:`, {
    averageAccuracy,
    dialogCompleted,
    scores: validScores,
  });
  // ТАРИФ ПОЛЬЗОВАТЕЛЯ
  const tier = userStore.isPremium ? 'premium' : userStore.isPro ? 'pro' : 'free';
  // СОХРАНИТЬ ПРОГРЕСС
  if (tier !== 'free') {
    const extractBaseLevel = (level) => {
      if (!level) return '';
      const match = level.match(/^([A-C][1-2])/);
      return match ? match[1] : '';
    };

    const languageLevel = extractBaseLevel(dialog.value?.level);

    const result = await saveDialogProgress(
      props.id,
      'level2',
      {
        averageAccuracy,
        replicaScores: validScores,
      },
      tier,
      languageLevel
    );
    console.log('СОХРАНИТЬ ПРОГРЕСС', result);
  }
  // ПОКАЗАТЬ МОДАЛКУ
  if (tier === 'free') {
    uiStore.showModal('trainingCompleteFree', {
      dialogId: props.id,
      averageAccuracy,
      dialogCompleted,
    });
  } else {
    // PRO/PREMIUM
    uiStore.showModal('trainingComplete', {
      dialogId: props.id,
      averageAccuracy,
      dialogCompleted,
      replicaScores: validScores,
      minReplicaAccuracy: TRAINING_CONFIG.completion.level2.minReplicaAccuracy,
      minDialogAccuracy: TRAINING_CONFIG.completion.level2.minDialogAccuracy,
    });
  }
}

// ЭКСПОРТИРУЕМ функцию завершения для кнопки
defineExpose({
  completeTraining,
});

onMounted(async () => {
  trainingStore.setCurrentTrainingType('level-2');
  await dialogStore.fetchDialogById(props.id);
  if (dialogStore.currentDialog) {
    trainingStore.startLevel();
  }
  // Инициализируем массив результатов
  replicaScores.value = Array(dialog.value?.fin.length || 0).fill(undefined);
  // СЛУШАЕМ СОБЫТИЕ ОТ nextLine()
  window.addEventListener('completeTraining', handleCompleteEvent);
});

onUnmounted(() => {
  trainingStore.stopSpeech();
  replicaScores.value = [];
  window.removeEventListener('completeTraining', handleCompleteEvent);
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
  min-height: 80px;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-top: 1px solid var(--border);
}
.text-with-checkmark {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.recognized-text,
.placeholder-text {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--md);
  color: var(--text-base);
}
.accuracy-text {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  color: var(--text-muted);
  font-weight: 600;
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
  background-color: var(--bg-side);
  border-top: 1px solid var(--bb);
  box-shadow: 0 -4px 8px var(--shadow);
}
.recognized-text-container-mobile {
  min-height: 40px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.recognized-text-mobile,
.placeholder-text-mobile {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--md);
  color: var(--text-head);
}
.accuracy-text-mobile {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  color: var(--text-muted);
  font-weight: 600;
  margin: 0;
}
</style>
