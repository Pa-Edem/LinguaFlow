<!-- \\src\components\Modal.vue -->
<template>
  <Transition name="modal">
    <div
      v-if="uiStore.isModalActive"
      class="modal-mask"
      @click.self="uiStore.cancelModal()"
    >
      <div
        class="modal-container"
        :class="containerClass"
      >
        <div class="modal-header">
          <!-- v-if="uiStore.modalContent === 'analysis'" -->
          <h3
            v-if="uiStore.modalContent === 'analysis'"
            class="title"
          >
            {{ $t('view.headerAnalysis') }}
          </h3>
          <!-- v-if="uiStore.modalContent === 'upgrade'" -->
          <h3
            v-else-if="uiStore.modalContent === 'upgrade'"
            class="title"
          >
            {{ $t('view.goToPro') }}
          </h3>
          <!-- v-if="uiStore.modalContent === 'endOfLevel'" -->
          <h3
            v-else-if="uiStore.modalContent === 'endOfLevel'"
            class="title"
          >
            {{ $t('modal.title') }}
          </h3>
          <!-- v-if="uiStore.modalContent === 'confirm'" -->
          <h3
            v-else-if="uiStore.modalContent === 'confirm'"
            class="title"
          >
            {{ uiStore.modalProps.title }}
          </h3>
        </div>

        <div class="modal-body">
          <!-- v-if="uiStore.modalContent === 'analysis'" -->
          <div
            v-if="uiStore.modalContent === 'analysis'"
            v-html="trainingStore.geminiResult"
          ></div>
          <!-- v-if="uiStore.modalContent === 'upgrade'" -->
          <div
            v-else-if="uiStore.modalContent === 'upgrade'"
            class="pro-benefits"
          >
            <h4 class="subtitle">{{ $t('view.unlock') }}</h4>
            <ul>
              <ProBenefitItem>{{ $t('view.description1') }}</ProBenefitItem>
              <ProBenefitItem>{{ $t('view.description2') }}</ProBenefitItem>
              <ProBenefitItem>{{ $t('view.description3') }}</ProBenefitItem>
              <ProBenefitItem>{{ $t('view.description4') }}</ProBenefitItem>
            </ul>
          </div>
          <!-- v-if="uiStore.modalContent === 'endOfLevel'" -->
          <div
            v-else-if="uiStore.modalContent === 'endOfLevel'"
            class="end-message"
          >
            <p>{{ $t('modal.text') }}</p>
          </div>
          <!-- v-if="uiStore.modalContent === 'confirm'" -->
          <div
            v-else-if="uiStore.modalContent === 'confirm'"
            class="confirm-message"
          >
            {{ uiStore.modalProps.message }}
          </div>
        </div>

        <div class="modal-footer">
          <!-- v-if="uiStore.modalContent === 'analysis'" -->
          <button
            v-if="uiStore.modalContent === 'analysis'"
            class="btn btn-common"
            :class="isDesktop ? 'w-150' : 'mobile'"
            @click="uiStore.hideModal()"
          >
            <span class="material-symbols-outlined">close</span>
            {{ $t('buttons.close') }}
          </button>
          <!-- v-if="uiStore.modalContent === 'upgrade'" -->
          <div
            v-else-if="uiStore.modalContent === 'upgrade'"
            class="footer-buttons"
          >
            <button
              class="btn btn-common"
              :class="isDesktop ? 'w-150' : 'mobile'"
              @click="uiStore.hideModal()"
            >
              {{ $t('buttons.close') }}
            </button>
            <router-link
              class="btn btn-action"
              :class="isDesktop ? 'w-150' : 'mobile'"
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
            class="btn btn-common"
            :class="isDesktop ? 'w-150' : 'mobile'"
            @click="uiStore.hideModal()"
          >
            {{ $t('buttons.close') }}
          </button>
          <!-- v-if="uiStore.modalContent === 'confirm'" -->
          <div
            v-else-if="uiStore.modalContent === 'confirm'"
            class="footer-buttons"
          >
            <button
              class="btn btn-common"
              :class="isDesktop ? 'w-150' : 'mobile'"
              @click="uiStore.cancelModal()"
            >
              {{ uiStore.modalProps.cancelText || $t('buttons.cancel') }}
            </button>
            <button
              class="btn btn-danger"
              :class="isDesktop ? 'w-150' : 'mobile'"
              @click="uiStore.confirmModal()"
            >
              {{ uiStore.modalProps.confirmText || $t('buttons.ok') }}
            </button>
          </div>
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
import { useBreakpoint } from '../composables/useBreakpoint';

const uiStore = useUiStore();
const trainingStore = useTrainingStore();
const { isDesktop } = useBreakpoint();

const containerClass = computed(() => {
  return {
    analysis: uiStore.modalContent === 'analysis',
    upgrade: uiStore.modalContent === 'upgrade',
    confirm: uiStore.modalContent === 'confirm',
    endOfLevel: uiStore.modalContent === 'endOfLevel',
    default: uiStore.modalContent === 'default',
  };
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
.modal-header {
  padding: 16px 0;
  flex-shrink: 0;
}
.modal-header .title {
  font-size: var(--xl);
  color: var(--t-pro);
  margin: 0;
  text-align: center;
}
.upgrade .modal-header .title {
  font-size: var(--xxl);
}
.modal-body {
  overflow-y: auto;
  padding: 24px;
  flex-grow: 1;
}
.modal-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 0;
  border-top: 1px solid var(--border);
  box-shadow: 0 -4px 8px rgba(0, 0, 0, 0.1);
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
.analysis .modal-body ul li {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--md);
  color: var(--text-base);
  font-weight: 500;
  margin-bottom: 8px;
}
.modal-body .pro-benefits .subtitle {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--xl);
  color: var(--g3);
  text-align: center;
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
