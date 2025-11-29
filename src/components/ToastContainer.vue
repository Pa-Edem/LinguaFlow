<!-- // src/components/ToastContainer.vue -->
<!-- <template>
  <div class="toast-container in-view">
    <TransitionGroup name="toast">
      <div v-for="toast in uiStore.toasts" :key="toast.id" :class="`toast toast--${toast.type}`">
        {{ toast.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useUiStore } from '../stores/uiStore';
const uiStore = useUiStore();
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 8px;
  right: 8px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.toast {
  padding: 16px 24px;
  border-radius: 4px;
  color: var(--text-toast);
  font-weight: 500;
  box-shadow: 0 4px 12px var(--shadow);
  transition: all 0.3s ease;
}
.toast--info {
  background-color: var(--bg-t-info);
}
.toast--success {
  background-color: var(--bg-t-success);
}
.toast--warning {
  background-color: var(--bg-t-warning);
  color: var(--r3);
}
.toast--error {
  background-color: var(--bg-t-error);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
.toast-leave-active {
  position: absolute;
}
</style> -->

<!-- НОВЫЕ СТИЛИ -->
<template>
  <div class="toast-container in-view">
    <TransitionGroup name="toast">
      <div v-for="toast in uiStore.toasts" :key="toast.id" :class="`toast toast--${toast.type}`">
        {{ toast.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useUiStore } from '../stores/uiStore';
const uiStore = useUiStore();
</script>

<style scoped>
/* ========================================= */
/* TOAST CONTAINER */
/* ========================================= */
.toast-container {
  position: fixed;
  top: var(--space-sm);
  right: var(--space-sm);
  z-index: var(--z-tooltip);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  max-width: 400px;
  pointer-events: none;
}

/* ========================================= */
/* TOAST */
/* ========================================= */
.toast {
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-md);
  color: var(--text-toast);
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  font-weight: 600;
  line-height: var(--leading-normal);
  box-shadow: var(--shadow-lg);
  border: 2px solid transparent;
  pointer-events: auto;
  backdrop-filter: blur(8px);
  transition: all var(--transition-base);
  animation: slideIn 0.3s ease-out;
  position: relative;
  overflow: hidden;
}

@keyframes slideIn {
  from {
    transform: translateX(120%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Прогресс-бар (опциональный декоративный элемент) */
.toast::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  background: currentColor;
  opacity: 0.3;
  animation: progress 3s linear;
}

@keyframes progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* Hover эффект */
.toast:hover {
  transform: translateX(-4px);
  box-shadow: var(--shadow-xl);
}

/* ========================================= */
/* TOAST TYPES */
/* ========================================= */

/* Info (Голубой) */
.toast--info {
  background: var(--bg-t-info);
  border-color: var(--plan-trial-border);
  color: var(--plan-trial-text);
}

.toast--info::before {
  background: var(--plan-trial-border);
}

/* Success (Зелёный) */
.toast--success {
  background: var(--bg-t-success);
  border-color: var(--plan-free-border);
  color: var(--plan-free-text);
}

.toast--success::before {
  background: var(--plan-free-border);
}

/* Warning (Жёлтый) */
.toast--warning {
  background: var(--bg-t-warning);
  border-color: var(--gold-4);
  color: var(--text-toast);
}

.toast--warning::before {
  background: var(--gold-4);
}

/* Error (Красный) */
.toast--error {
  background: var(--bg-t-error);
  border-color: var(--r2);
  color: var(--r3);
}

.toast--error::before {
  background: var(--r2);
}

/* ========================================= */
/* TRANSITIONS */
/* ========================================= */
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  position: absolute;
  transition: all 0.3s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

/* ========================================= */
/* RESPONSIVE */
/* ========================================= */
@media (max-width: 768px) {
  .toast-container {
    top: var(--space-xs);
    right: var(--space-xs);
    left: var(--space-xs);
    max-width: none;
  }

  .toast {
    padding: var(--space-sm) var(--space-md);
    font-size: var(--xs);
  }
}

@media (max-width: 480px) {
  .toast {
    border-radius: var(--radius-sm);
  }
}
</style>
