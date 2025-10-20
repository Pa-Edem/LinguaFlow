<!-- src\components\DialogLayout.vue -->
<template>
  <div
    class="dialog-layout"
    v-if="dialog"
  >
    <aside class="sidebar">
      <router-link
        to="/dialogs"
        name="all-dialogs"
        class="btn btn-common back-link"
      >
        <span class="material-symbols-outlined">arrow_back_ios</span>
        {{ $t('buttons.dialogList') }}
      </router-link>
      <slot name="sidebar-content"></slot>
    </aside>

    <main class="content">
      <slot></slot>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useDialogStore } from '../stores/dialogStore';

const dialogStore = useDialogStore();
const dialog = computed(() => dialogStore.currentDialog);
</script>

<style scoped>
/* 1. Стили для МОБИЛЬНЫХ УСТРОЙСТВ */
.dialog-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.sidebar {
  width: 100%;
  padding: 8px 16px;
  border-bottom: 1px solid var(--border);
  background-color: var(--bg-side);
  flex-shrink: 0;
  overflow-y: auto;
}
.back-link {
  margin-bottom: 16px;
}
.content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  min-height: 0;
}
/* 2. Улучшения для ПЛАНШЕТОВ И БОЛЬШЕ */
@media (min-width: 768px) {
  .dialog-layout {
    flex-direction: row;
    height: 100vh;
    overflow-y: auto;
  }
  .sidebar {
    width: 320px;
    min-height: 100%;
    border-bottom: none;
    border-right: 1px solid var(--border);
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .content {
    padding: 32px;
    overflow-y: auto;
  }
}
</style>
