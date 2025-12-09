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
              :class="{ active: trainingStore.isMicActive }"
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
import { useUiStore } from '../stores/uiStore';
import { useUserStore } from '../stores/userStore';
import DialogLayout from '../components/DialogLayout.vue';
import TrainingSidebar from '../components/TrainingSidebar.vue';
import CheckmarkAnimation from '../components/CheckmarkAnimation.vue';
import CrossAnimation from '../components/CrossAnimation.vue';
import { saveDialogProgress } from '../services/trainingProgressService';
import { TRAINING_CONFIG } from '../config/trainingConfig';

const props = defineProps({ id: { type: String, required: true } });
const dialogStore = useDialogStore();
const trainingStore = useTrainingStore();
const uiStore = useUiStore();
const userStore = useUserStore();
const { isDesktop } = useBreakpoint();

const lineIndex = computed(() => trainingStore.currentLineIndex);
const dialog = computed(() => dialogStore.currentDialog);

const mobileContent = ref(null);
const desktopContent = ref(null);

// ✅ НОВЫЕ ПЕРЕМЕННЫЕ ДЛЯ ТОЧНОСТИ
const replicaScores = ref([]);
const showCheckmark = ref(false);
const showCross = ref(false);

// ✅ СЛЕДИМ ЗА ТОЧНОСТЬЮ ИЗ STORE
watch(
  () => trainingStore.currentAccuracy,
  (newAccuracy) => {
    if (newAccuracy > 0) {
      // Сохраняем результат реплики
      replicaScores.value[trainingStore.currentLineIndex] = newAccuracy;

      console.log(`✅ Реплика ${trainingStore.currentLineIndex + 1}: ${newAccuracy}%`);

      // ✅ ПОКАЗЫВАЕМ ГАЛОЧКУ если точность >= 85%
      if (newAccuracy >= TRAINING_CONFIG.completion.minReplicaAccuracy) {
        showCheckmark.value = true;
        setTimeout(() => {
          showCheckmark.value = false;
        }, 3000);
      } else {
        // ПОКАЗЫВАЕМ КРЕСТИК если точность < 85%
        showCross.value = true;
        setTimeout(() => {
          showCross.value = false;
        }, 3000);
      }

      // ПРОВЕРЯЕМ: ВСЕ РЕПЛИКИ ПРОЙДЕНЫ И МЫ НА ПОСЛЕДНЕЙ?
      const totalReplicas = dialog.value.fin.length;
      const completedReplicas = replicaScores.value.filter((score) => score !== undefined).length;
      const isLastReplica = trainingStore.currentLineIndex === totalReplicas - 1;

      if (completedReplicas === totalReplicas && isLastReplica) {
        completeTraining();
      }
    }
  }
);

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

// ✅ ЗАВЕРШЕНИЕ ТРЕНИРОВКИ
async function completeTraining() {
  // Фильтруем только реально пройденные реплики
  const validScores = replicaScores.value.filter((score) => score !== undefined);

  if (validScores.length === 0) {
    console.warn('⚠️ Нет результатов для сохранения');
    return;
  }

  // Вычисляем среднюю точность
  const averageAccuracy = Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length);

  // Проверяем прохождение
  const dialogCompleted = TRAINING_CONFIG.isDialogCompleted(validScores);

  console.log(`🎯 Завершение тренировки:`, {
    averageAccuracy,
    dialogCompleted,
    scores: validScores,
  });

  // ✅ ПОЛУЧИТЬ ТАРИФ ПОЛЬЗОВАТЕЛЯ
  const tier = userStore.isPremium ? 'premium' : userStore.isPro ? 'pro' : 'free';
  console.log(`💳 Тариф пользователя: ${tier}`);

  // ✅ СОХРАНИТЬ ПРОГРЕСС (в зависимости от тарифа)
  const result = await saveDialogProgress(
    props.id,
    'level2',
    {
      averageAccuracy,
      replicaScores: validScores,
    },
    tier,
    dialog.value?.languageLevel // A1, A2, B1...
  );

  // ✅ ПОКАЗАТЬ ДОСТИЖЕНИЯ (если есть)
  if (result && result.newAchievements && result.newAchievements.length > 0) {
    console.log('🎉 Новые достижения разблокированы:', result.newAchievements);
    // TODO: Показать уведомления о достижениях
  }

  // ✅ ПОКАЗАТЬ МОДАЛКУ (в зависимости от тарифа)
  if (tier === 'free') {
    // FREE: модалка без сохранения
    uiStore.showModal('trainingCompleteFree', {
      averageAccuracy,
      dialogCompleted,
    });
  } else {
    // PRO/PREMIUM: модалка с результатами
    uiStore.showModal('trainingComplete', {
      averageAccuracy,
      dialogCompleted,
      replicaScores: validScores,
      minReplicaAccuracy: TRAINING_CONFIG.completion.minReplicaAccuracy,
      minDialogAccuracy: TRAINING_CONFIG.completion.minDialogAccuracy,
    });
  }
}

onMounted(async () => {
  trainingStore.setCurrentTrainingType('level-2');
  await dialogStore.fetchDialogById(props.id);
  if (dialogStore.currentDialog) {
    trainingStore.startLevel();
  }
  // Инициализируем массив результатов
  replicaScores.value = Array(dialog.value?.fin.length || 0).fill(undefined);
});

onUnmounted(() => {
  trainingStore.stopSpeech();

  // Сбрасываем результаты
  replicaScores.value = [];
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
