<!-- \\src\components\Modal.vue -->

<template>
  <Transition name="modal">
    <div v-if="uiStore.isModalActive" class="modal-mask" @click.self="uiStore.cancelModal()">
      <div class="modal-container" :class="containerClass">
        <div class="modal-header">
          <!-- analysis -->
          <h3 v-if="uiStore.modalContent === 'analysis'" class="title">
            {{ $t('view.headerAnalysis') }}
          </h3>
          <!-- upgrade -->
          <h3 v-else-if="uiStore.modalContent === 'upgrade'" class="title">
            {{ $t('view.goToPro') }}
          </h3>
          <!-- endOfLevel -->
          <h3 v-else-if="uiStore.modalContent === 'endOfLevel'" class="title">
            {{ $t('modal.title') }}
          </h3>
          <!-- trainingComplete -->
          <h3 v-else-if="uiStore.modalContent === 'trainingComplete'" class="title">
            {{ trainingCompleteTitle }}
          </h3>
          <!-- trainingCompleteFree -->
          <h3 v-else-if="uiStore.modalContent === 'trainingCompleteFree'" class="title">💪 Отличная работа!</h3>
          <!-- trainingCompleteLevel1 -->
          <h3 v-else-if="uiStore.modalContent === 'trainingCompleteLevel1'" class="title">💪 Отличное начало!</h3>
          <!-- confirm -->
          <h3 v-else-if="uiStore.modalContent === 'confirm'" class="title">
            {{ uiStore.modalProps.title }}
          </h3>
          <!-- ✅ НОВОЕ: monthlyStats -->
          <h3 v-else-if="isMonthlyStatsModal" class="title">📊 Месячная статистика</h3>
          <!-- limits -->
          <h3 v-else-if="uiStore.modalContent === 'limits'" class="title">📊 Ваши лимиты</h3>
          <!-- plan -->
          <div v-else-if="uiStore.modalContent === 'plan'" class="header-title">
            <span
              class="material-symbols-outlined plan-icon"
              :class="planIcon === 'crown' ? 'pro-icon' : planIcon === 'star' ? 'starter-icon' : ''"
              >{{ planIcon }}</span
            >
            <h3 class="title">{{ planTitle }}</h3>
          </div>
        </div>

        <div class="modal-body">
          <!-- analysis -->
          <div v-if="uiStore.modalContent === 'analysis'" v-html="trainingStore.geminiResult"></div>
          <!-- upgrade -->
          <div v-else-if="uiStore.modalContent === 'upgrade'" class="pro-benefits">
            <h4 class="subtitle">{{ $t('view.unlock') }}</h4>
            <ul>
              <ProBenefitItem>{{ $t('view.description1') }}</ProBenefitItem>
              <ProBenefitItem>{{ $t('view.description2') }}</ProBenefitItem>
              <ProBenefitItem>{{ $t('view.description3') }}</ProBenefitItem>
              <ProBenefitItem>{{ $t('view.description4') }}</ProBenefitItem>
            </ul>
          </div>
          <!-- endOfLevel -->
          <div v-else-if="uiStore.modalContent === 'endOfLevel'" class="end-message">
            <p>{{ $t('modal.text') }}</p>
          </div>
          <!-- trainingComplete -->
          <div v-else-if="uiStore.modalContent === 'trainingComplete'" class="training-complete-message">
            <!-- ИКОНКА -->
            <div class="result-icon">
              <span class="material-symbols-outlined" :class="trainingCompleteIconClass">
                {{ trainingCompleteIcon }}
              </span>
            </div>

            <!-- ТОЧНОСТЬ -->
            <div class="accuracy-display">
              <div class="accuracy-label">Средняя точность:</div>
              <div class="accuracy-value">{{ uiStore.modalData.averageAccuracy }}%</div>
            </div>

            <!-- СТАТУС -->
            <div class="completion-status" :class="trainingCompleteStatusClass">
              {{ trainingCompleteMessage }}
            </div>

            <!-- ДЕТАЛИ (опционально) -->
            <div v-if="uiStore.modalData.replicaScores" class="replica-details">
              <div class="details-label">Результаты по репликам:</div>
              <div class="replica-scores">
                <span
                  v-for="(score, index) in uiStore.modalData.replicaScores"
                  :key="index"
                  class="replica-score"
                  :class="getReplicaScoreClass(score)"
                >
                  {{ score }}%
                </span>
              </div>
            </div>
          </div>
          <!-- trainingCompleteFree -->
          <div v-else-if="uiStore.modalContent === 'trainingCompleteFree'" class="training-complete-free-message">
            <!-- ИКОНКА -->
            <div class="result-icon">
              <span class="material-symbols-outlined success-icon">sentiment_satisfied</span>
            </div>

            <!-- ТОЧНОСТЬ (БЕЗ СОХРАНЕНИЯ) -->
            <div class="accuracy-display">
              <div class="accuracy-label">Ваша точность:</div>
              <div class="accuracy-value">{{ uiStore.modalData.averageAccuracy }}%</div>
            </div>

            <!-- UPGRADE ПРОМО -->
            <div class="upgrade-promo">
              <p class="promo-text">Хотите сохранить прогресс и получать достижения?</p>
              <div class="promo-features">
                <div class="promo-feature">✅ Отслеживание статистики</div>
                <div class="promo-feature">✅ Система достижений</div>
                <div class="promo-feature">✅ Серии дней практики</div>
                <div class="promo-feature">✅ Детальный прогресс по диалогам</div>
              </div>
            </div>
          </div>
          <!-- trainingCompleteLevel1 -->
          <div v-else-if="uiStore.modalContent === 'trainingCompleteLevel1'" class="training-complete-free-message">
            <div class="result-icon">
              <span class="material-symbols-outlined success-icon">sentiment_satisfied</span>
            </div>
            <div class="end-message">
              <p>{{ $t('modal.textLevel1') }}</p>
            </div>
          </div>
          <!-- confirm -->
          <div v-else-if="uiStore.modalContent === 'confirm'" class="confirm-message">
            {{ uiStore.modalProps.message }}
          </div>
          <!-- ✅ НОВОЕ: Месячная статистика -->
          <div v-else-if="isMonthlyStatsModal">
            <!-- PRO: базовая статистика -->
            <MonthlyStatsModal v-if="!hasDialogProgress" :data="uiStore.modalData" @close="uiStore.hideModal()" />

            <!-- PREMIUM: статистика + детальный прогресс -->
            <MonthlyStatsModalPremium v-else :data="uiStore.modalData" @close="uiStore.hideModal()" />
          </div>
          <!-- limits -->
          <LimitsModal v-else-if="uiStore.modalContent === 'limits'" />
          <!-- plan -->
          <PlanModal v-else-if="uiStore.modalContent === 'plan'" :plan="selectedPlan" />
        </div>

        <div class="modal-footer">
          <!-- analysis -->
          <button
            v-if="uiStore.modalContent === 'analysis'"
            class="btn btn-menu mx-auto"
            :class="isDesktop ? 'w-150' : 'mobile w-100'"
            @click="uiStore.hideModal()"
          >
            <span class="material-symbols-outlined">close</span>
            {{ $t('buttons.close') }}
          </button>
          <!-- upgrade -->
          <div v-else-if="uiStore.modalContent === 'upgrade'" class="footer-buttons">
            <button class="btn btn-menu" :class="isDesktop ? 'w-150' : 'mobile w-125'" @click="uiStore.hideModal()">
              {{ $t('buttons.close') }}
            </button>
            <router-link
              class="btn btn-action"
              :class="isDesktop ? 'w-150' : 'mobile w-125'"
              to="/profile"
              @click="uiStore.hideModal()"
            >
              <span class="material-symbols-outlined">details</span>
              {{ $t('buttons.findMore') }}
            </router-link>
          </div>
          <!-- endOfLevel -->
          <button
            v-else-if="uiStore.modalContent === 'endOfLevel'"
            class="btn btn-menu mx-auto"
            :class="isDesktop ? 'w-150' : 'mobile w-100'"
            @click="uiStore.hideModal()"
          >
            {{ $t('buttons.close') }}
          </button>
          <!-- trainingComplete -->
          <div v-else-if="uiStore.modalContent === 'trainingComplete'" class="footer-buttons">
            <button
              class="btn btn-menu mx-auto"
              :class="isDesktop ? 'w-150' : 'mobile w-100'"
              @click="handleTrainingCompleteClose"
            >
              {{ $t('buttons.close') }}
            </button>
          </div>
          <!-- trainingCompleteFree -->
          <div v-else-if="uiStore.modalContent === 'trainingCompleteFree'" class="footer-buttons">
            <button class="btn btn-menu" :class="isDesktop ? 'w-150' : 'mobile w-125'" @click="uiStore.hideModal()">
              {{ $t('buttons.close') }}
            </button>
            <router-link
              class="btn btn-action"
              :class="isDesktop ? 'w-150' : 'mobile w-125'"
              to="/profile"
              @click="uiStore.hideModal()"
            >
              <span class="material-symbols-outlined">crown</span>
              Купить PRO
            </router-link>
          </div>
          <!-- trainingCompleteLevel1 -->
          <div v-else-if="uiStore.modalContent === 'trainingCompleteLevel1'" class="footer-buttons">
            <button
              class="btn btn-menu mx-auto"
              :class="isDesktop ? 'w-150' : 'mobile w-100'"
              @click="handleTrainingCompleteClose"
            >
              {{ $t('buttons.close') }}
            </button>
          </div>
          <!-- confirm -->
          <div v-else-if="uiStore.modalContent === 'confirm'" class="footer-buttons">
            <button class="btn btn-menu" :class="isDesktop ? 'w-150' : 'mobile w-100'" @click="uiStore.cancelModal()">
              {{ uiStore.modalProps.cancelText || $t('buttons.cancel') }}
            </button>
            <button
              class="btn btn-danger"
              :class="isDesktop ? 'w-150' : 'mobile w-100'"
              @click="uiStore.confirmModal()"
            >
              {{ uiStore.modalProps.confirmText || $t('buttons.ok') }}
            </button>
          </div>
          <!-- ✅ НОВОЕ: monthlyStats -->
          <button
            v-else-if="isMonthlyStatsModal"
            class="btn btn-menu mx-auto"
            :class="isDesktop ? 'w-150' : 'mobile w-100'"
            @click="uiStore.hideModal()"
          >
            <span class="material-symbols-outlined">close</span>
            {{ $t('buttons.close') }}
          </button>
          <!-- limits -->
          <button
            v-else-if="uiStore.modalContent === 'limits'"
            class="btn btn-menu mx-auto"
            :class="isDesktop ? 'w-150' : 'mobile w-100'"
            @click="uiStore.hideModal()"
          >
            <span class="material-symbols-outlined">close</span>
            {{ $t('buttons.close') }}
          </button>
          <!-- plan -->
          <button
            v-else-if="uiStore.modalContent === 'plan'"
            class="btn btn-menu mx-auto"
            :class="isDesktop ? 'w-150' : 'mobile w-100'"
            @click="uiStore.hideModal()"
          >
            <span class="material-symbols-outlined">close</span>
            {{ $t('buttons.close') }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUiStore } from '../stores/uiStore';
import { useTrainingStore } from '../stores/trainingStore';
import ProBenefitItem from './ProBenefitItem.vue';
import LimitsModal from './LimitsModal.vue';
import MonthlyStatsModal from './MonthlyStatsModal.vue';
import MonthlyStatsModalPremium from './MonthlyStatsModalPremium.vue';
import PlanModal from './PlanModal.vue';
import { useBreakpoint } from '../composables/useBreakpoint';
import { getPlanInfo } from '../config/stripeConfig';

const uiStore = useUiStore();
const trainingStore = useTrainingStore();
const router = useRouter();
const { isDesktop } = useBreakpoint();

// Определяем какую модалку статистики показывать
const isMonthlyStatsModal = computed(() => uiStore.modalContent === 'monthlyStats');

const hasDialogProgress = computed(() => {
  return uiStore.modalData?.dialogProgress && uiStore.modalData.dialogProgress.length > 0;
});

const containerClass = computed(() => {
  return {
    analysis: uiStore.modalContent === 'analysis',
    upgrade: uiStore.modalContent === 'upgrade',
    confirm: uiStore.modalContent === 'confirm',
    endOfLevel: uiStore.modalContent === 'endOfLevel',
    trainingComplete: uiStore.modalContent === 'trainingComplete',
    trainingCompleteFree: uiStore.modalContent === 'trainingCompleteFree',
    limits: uiStore.modalContent === 'limits',
    plan: uiStore.modalContent === 'plan',
    default: uiStore.modalContent === 'default',
  };
});

// Computed для trainingComplete модалки
const trainingCompleteTitle = computed(() => {
  if (uiStore.modalData.dialogCompleted) {
    return '🎉 Тренировка успешна завершена!';
  }
  return '💪 Хорошая работа!';
});

const trainingCompleteIcon = computed(() => {
  if (uiStore.modalData.dialogCompleted) {
    return 'check_circle';
  }
  return 'pending';
});

const trainingCompleteIconClass = computed(() => {
  if (uiStore.modalData.dialogCompleted) {
    return 'success-icon';
  }
  return 'warning-icon';
});

const trainingCompleteMessage = computed(() => {
  console.log(uiStore.modalData);
  const { dialogCompleted, minReplicaAccuracy, minDialogAccuracy } = uiStore.modalData;

  if (dialogCompleted) {
    return `Все реплики ≥ ${minReplicaAccuracy}% и средняя точность ≥ ${minDialogAccuracy}%. Диалог засчитан!`;
  }
  return `Для зачёта нужно: каждая реплика ≥ ${minReplicaAccuracy}% и средняя ≥ ${minDialogAccuracy}%. Попробуйте ещё раз!`;
});

const trainingCompleteStatusClass = computed(() => {
  if (uiStore.modalData.dialogCompleted) {
    return 'status-success';
  }
  return 'status-warning';
});

// Функция для определения класса реплики
function getReplicaScoreClass(score) {
  if (score >= 85) return 'score-excellent';
  if (score >= 70) return 'score-good';
  return 'score-poor';
}

// Обработчик закрытия модалки trainingComplete
function handleTrainingCompleteClose() {
  uiStore.hideModal();

  const dialogId = uiStore.modalProps.dialogId;
  if (dialogId) {
    // Возвращаемся к просмотру диалога
    router.push({ name: 'view-dialog', params: { id: dialogId } });
  } else {
    // Fallback: возвращаемся к списку диалогов
    router.push({ name: 'all-dialogs' });
  }
}

// Получить информацию о выбранном плане
const selectedPlan = computed(() => {
  if (uiStore.modalContent !== 'plan' || !uiStore.modalProps.tier) {
    return null;
  }
  return getPlanInfo(uiStore.modalProps.tier);
});

// Иконка для модалки плана
const planIcon = computed(() => {
  if (!selectedPlan.value) return '';
  if (selectedPlan.value.name === 'PREMIUM') {
    return 'crown';
  }
  if (selectedPlan.value.name === 'PRO') {
    return 'star';
  }
  return 'school';
});

// Заголовок для модалки плана
const planTitle = computed(() => {
  if (!selectedPlan.value) return '';
  return `${selectedPlan.value.name} План`;
});
</script>

<style>
.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 900;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  transition: opacity 0.3s ease;
}
.modal-container {
  width: 100%;
  max-width: 640px;
  margin: auto;
  background-color: var(--bg-main);
  border-radius: var(--xxs);
  box-shadow: var(--shadow-xl);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}
.modal-container.default {
  max-width: 640px;
  background: var(--bg-main);
}
.modal-container.analysis {
  max-width: 1024px;
  background: var(--bg-main);
}
.modal-container.endOfLevel {
  max-width: 640px;
  background: var(--bg-main);
}
.modal-container.upgrade {
  max-width: 640px;
  background: var(--gradient-pro);
}
.modal-container.limits {
  max-width: 720px;
  background: var(--bg-main);
}
.modal-container.plan {
  max-width: 600px;
  background: var(--bg-main);
}
.modal-header {
  padding-top: 16px;
  flex-shrink: 0;
}
.header-title {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
}
.modal-header .plan-icon {
  font-size: var(--xxxl);
  margin-right: 8px;
  color: var(--text-head);
}
.modal-header .starter-icon {
  color: var(--g3);
}
.modal-header .pro-icon {
  color: var(--bg-pro);
}
.modal-header .title {
  font-size: var(--xl);
  color: var(--text-head);
  margin: 0;
  text-align: center;
}
.modal-body {
  overflow-y: auto;
  padding: var(--xxxl);
  flex-grow: 1;
}
.modal-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 0;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}
.modal-footer .footer-buttons {
  display: flex;
  width: 100%;
  padding: 0 16px;
  justify-content: space-between;
}
.confirm-message,
.end-message {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--md);
  text-align: center;
}
.analysis .modal-body h1,
.analysis .modal-body h2,
.analysis .modal-body h3 {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--xl);
  color: var(--g3);
  text-align: center;
  margin-bottom: 8px;
}
.analysis .modal-body ul {
  list-style-type: none;
  padding-left: 8px;
  margin-bottom: 32px;
}
.analysis .modal-body ul li,
.analysis .modal-body p {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--md);
  color: var(--text-base);
  font-weight: 500;
  margin-bottom: 8px;
}
.modal-body .pro-benefits .subtitle {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--md);
  color: var(--g3);
  text-align: center;
  margin-bottom: 8px;
}
.modal-body .pro-benefits ul li {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  color: var(--head);
  margin-bottom: 8px;
}
.modal-body li code,
.modal-body li strong code {
  font-family: 'Roboto Condensed', sans-serif !important;
  font-weight: 600;
  color: var(--g3);
}
.modal-body li strong {
  font-family: 'Roboto Condensed', sans-serif !important;
  font-weight: 700;
  color: var(--r3);
}
.modal-info ul li ul li {
  padding-left: 16px;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
}
.training-complete-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
}
.result-icon {
  font-size: 64px;
}
.result-icon .success-icon {
  color: #4caf50;
  font-size: 64px;
}
.result-icon .warning-icon {
  color: #ff9800;
  font-size: 64px;
}
.accuracy-display {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.accuracy-label {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--md);
  color: var(--text-muted);
}
.accuracy-value {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--xxxl);
  font-weight: 700;
  color: var(--text-head);
}
.completion-status {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--md);
  padding: 12px 24px;
  border-radius: 8px;
  max-width: 90%;
}
.completion-status.status-success {
  background-color: rgba(76, 175, 80, 0.1);
  color: #4caf50;
  border: 1px solid #4caf50;
}
.completion-status.status-warning {
  background-color: rgba(255, 152, 0, 0.1);
  color: var(--text-base);
  border: 1px solid #ff9800;
}
.replica-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  margin-top: 16px;
}
.details-label {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  color: var(--text-muted);
}
.replica-scores {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}
.replica-score {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 4px;
  min-width: 60px;
}
.replica-score.score-excellent {
  background-color: rgba(76, 175, 80, 0.2);
  color: var(--g3);
  border: 1px solid #4caf50;
}
.replica-score.score-good {
  background-color: rgba(255, 193, 7, 0.2);
  color: var(--text-base);
  border: 1px solid #ffc107;
}
.replica-score.score-poor {
  background-color: rgba(244, 67, 54, 0.2);
  color: #f44336;
  border: 1px solid #f44336;
}
.training-complete-free-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  text-align: center;
}
.upgrade-promo {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}
.promo-text {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--lg);
  color: var(--text-head);
  font-weight: 600;
}
.promo-features {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.promo-feature {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--md);
  color: var(--text-base);
  text-align: left;
  padding-left: 8px;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
}
</style>
