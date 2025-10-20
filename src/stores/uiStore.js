//src/stores/uiStore.js
import { defineStore } from 'pinia';
import { useDialogStore } from './dialogStore';
import { useUserStore } from './userStore';
import { useTrainingStore } from './trainingStore';

export const useUiStore = defineStore('ui', {
  state: () => ({
    isModalActive: false,
    modalContent: 'default',
    modalProps: {},
    modalResolve: null,
    toasts: [],
    toastIdCounter: 0,
    viewCounter: 0,
  }),
  getters: {
    loading() {
      const dialogStore = useDialogStore();
      const userStore = useUserStore();
      const trainingStore = useTrainingStore();
      return dialogStore.isLoading || userStore.isLoading || trainingStore.isLoading;
    },
  },
  actions: {
    showModal(content = 'default') {
      this.modalProps = {};
      this.modalContent = content;
      this.isModalActive = true;
    },
    showUpgradeModal() {
      this.showModal('upgrade');
    },
    // Показывает окно подтверждения и ждет ответа
    showConfirmation(props) {
      this.modalProps = props;
      this.modalContent = 'confirm';
      this.isModalActive = true;
      // Создаем Promise, который будет ждать, пока пользователь нажмет кнопку
      return new Promise((resolve) => {
        this.modalResolve = resolve;
      });
    },
    // Вызывается, когда пользователь нажимает "Подтвердить"
    confirmModal() {
      if (this.modalResolve) {
        this.modalResolve(true);
      }
      this.hideModal();
    },
    // Вызывается, когда пользователь нажимает "Отмена" или закрывает окно
    cancelModal() {
      if (this.modalResolve) {
        this.modalResolve(false);
      }
      this.hideModal();
    },
    hideModal() {
      this.isModalActive = false;
      this.modalResolve = null;
    },
    showToast(message, type = 'info') {
      const id = this.toastIdCounter++;
      this.toasts.push({ id, message, type });
      setTimeout(() => {
        this.toasts = this.toasts.filter((toast) => toast.id !== id);
      }, 3000);
    },
  },
});
