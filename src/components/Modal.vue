<!-- \\src\components\Modal.vue -->
<template>
  <Transition name="modal">
    <div v-if="uiStore.isModalActive" class="modal-mask" @click.self="uiStore.cancelModal()">
      <div class="modal-container" :class="containerClass">
        <div class="modal-header">
          <!-- v-if="uiStore.modalContent === 'analysis'" -->
          <h3 v-if="uiStore.modalContent === 'analysis'" class="title">
            {{ $t('view.headerAnalysis') }}
          </h3>
          <!-- v-if="uiStore.modalContent === 'upgrade'" -->
          <h3 v-else-if="uiStore.modalContent === 'upgrade'" class="title">
            {{ $t('view.goToPro') }}
          </h3>
          <!-- v-if="uiStore.modalContent === 'endOfLevel'" -->
          <h3 v-else-if="uiStore.modalContent === 'endOfLevel'" class="title">
            {{ $t('modal.title') }}
          </h3>
          <!-- v-if="uiStore.modalContent === 'confirm'" -->
          <h3 v-else-if="uiStore.modalContent === 'confirm'" class="title">
            {{ uiStore.modalProps.title }}
          </h3>
          <!-- v-if="uiStore.modalContent === 'limits'" -->
          <h3 v-else-if="uiStore.modalContent === 'limits'" class="title">📊 Ваши лимиты</h3>
          <!-- v-if="uiStore.modalContent === 'plan'" -->
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
          <!-- v-if="uiStore.modalContent === 'analysis'" -->
          <div v-if="uiStore.modalContent === 'analysis'" v-html="trainingStore.geminiResult"></div>
          <!-- v-if="uiStore.modalContent === 'upgrade'" -->
          <div v-else-if="uiStore.modalContent === 'upgrade'" class="pro-benefits">
            <h4 class="subtitle">{{ $t('view.unlock') }}</h4>
            <ul>
              <ProBenefitItem>{{ $t('view.description1') }}</ProBenefitItem>
              <ProBenefitItem>{{ $t('view.description2') }}</ProBenefitItem>
              <ProBenefitItem>{{ $t('view.description3') }}</ProBenefitItem>
              <ProBenefitItem>{{ $t('view.description4') }}</ProBenefitItem>
            </ul>
          </div>
          <!-- v-if="uiStore.modalContent === 'endOfLevel'" -->
          <div v-else-if="uiStore.modalContent === 'endOfLevel'" class="end-message">
            <p>{{ $t('modal.text') }}</p>
          </div>
          <!-- v-if="uiStore.modalContent === 'confirm'" -->
          <div v-else-if="uiStore.modalContent === 'confirm'" class="confirm-message">
            {{ uiStore.modalProps.message }}
          </div>
          <!-- v-if="uiStore.modalContent === 'limits'" -->
          <LimitsModal v-else-if="uiStore.modalContent === 'limits'" />
          <!-- v-if="uiStore.modalContent === 'plan'" -->
          <PlanModal v-else-if="uiStore.modalContent === 'plan'" :plan="selectedPlan" />
        </div>

        <div class="modal-footer">
          <!-- v-if="uiStore.modalContent === 'analysis'" -->
          <button
            v-if="uiStore.modalContent === 'analysis'"
            class="btn btn-menu"
            :class="isDesktop ? 'w-150' : 'mobile w-100'"
            @click="uiStore.hideModal()"
          >
            <span class="material-symbols-outlined">close</span>
            {{ $t('buttons.close') }}
          </button>
          <!-- v-if="uiStore.modalContent === 'upgrade'" -->
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
          <!-- v-if="uiStore.modalContent === 'endOfLevel'" -->
          <button
            v-else-if="uiStore.modalContent === 'endOfLevel'"
            class="btn btn-menu"
            :class="isDesktop ? 'w-150' : 'mobile w-100'"
            @click="uiStore.hideModal()"
          >
            {{ $t('buttons.close') }}
          </button>
          <!-- v-if="uiStore.modalContent === 'confirm'" -->
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
          <!-- v-if="uiStore.modalContent === 'limits'" -->
          <button
            v-else-if="uiStore.modalContent === 'limits'"
            class="btn btn-menu"
            :class="isDesktop ? 'w-150' : 'mobile w-100'"
            @click="uiStore.hideModal()"
          >
            <span class="material-symbols-outlined">close</span>
            {{ $t('buttons.close') }}
          </button>
          <!-- v-if="uiStore.modalContent === 'plan'" -->
          <button
            v-else-if="uiStore.modalContent === 'plan'"
            class="btn btn-menu"
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
import { useUiStore } from '../stores/uiStore';
import { useTrainingStore } from '../stores/trainingStore';
import ProBenefitItem from './ProBenefitItem.vue';
import LimitsModal from './LimitsModal.vue';
import PlanModal from './PlanModal.vue';
import { useBreakpoint } from '../composables/useBreakpoint';
import { getPlanInfo } from '../config/stripeConfig';

const uiStore = useUiStore();
const trainingStore = useTrainingStore();
const { isDesktop } = useBreakpoint();

const containerClass = computed(() => {
  return {
    analysis: uiStore.modalContent === 'analysis',
    upgrade: uiStore.modalContent === 'upgrade',
    confirm: uiStore.modalContent === 'confirm',
    endOfLevel: uiStore.modalContent === 'endOfLevel',
    limits: uiStore.modalContent === 'limits',
    plan: uiStore.modalContent === 'plan',
    default: uiStore.modalContent === 'default',
  };
});

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
  if (selectedPlan.value.name === 'PRO') {
    return 'crown';
  }
  if (selectedPlan.value.name === 'STARTER') {
    return 'star';
  }
  return 'lock';
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
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--shadow);
  transition: all 0.3s ease;
  /* Структура для контента */
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
.modal-container.analysis {
  max-width: 1024px;
  background: var(--bg-main);
}
.modal-container.upgrade {
  max-width: 640px;
  background: var(--gradient-pro);
}
/* Стиль для limits модалки */
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
  color: var(--t-pro);
  margin: 0;
  text-align: center;
}
.modal-body {
  overflow-y: auto;
  padding: 24px 16px;
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
</style>
