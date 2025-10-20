<!-- src\views\AllDialogs.vue -->
<template>
  <div
    v-if="dialogs && !uiStore.loading"
    class="page-wrapper"
  >
    <aside class="desktop-sidebar">
      <h1 class="sidebar-title">Dialogit</h1>
      <button
        v-if="dialogs.length > 0"
        @click="goToCreateDialog"
        class="btn btn-action"
        :disabled="!canGenerate()"
      >
        <span class="material-symbols-outlined">add</span>
        {{ $t('all.createNew') }}
      </button>
      <div class="grow"></div>
      <div class="user-profile">
        <router-link
          to="/profile"
          class="btn btn-common"
        >
          <span class="material-symbols-outlined">person</span>
          <span>{{ $t('all.profile') }}</span>
        </router-link>
        <router-link
          to="/settings"
          class="btn btn-common"
        >
          <span class="material-symbols-outlined">settings</span>
          <span>{{ $t('all.settings') }}</span>
        </router-link>
      </div>
    </aside>
    <!-- | -->
    <header class="mobile-header">
      <h1 class="header-title">Dialogit</h1>
      <button
        v-if="dialogs.length > 0"
        @click="goToCreateDialog"
        :disabled="!canGenerate()"
        class="btn btn-action btn--icon-only"
      >
        <span class="material-symbols-outlined">add</span>
      </button>
    </header>

    <main class="content">
      <div
        v-if="dialogs.length > 0"
        class="dialogs-grid"
      >
        <div
          v-if="!userStore.isPro"
          class="usage-indicator"
        >
          <div class="usage-text">
            <span>{{ $t('all.savedDialogs') }}</span>
            <span>{{ usage.total.count }} / {{ usage.total.limit }}</span>
          </div>
          <progress
            class="usage-progress"
            :value="usage.total.count"
            :max="usage.total.limit"
          ></progress>
        </div>
        <template
          v-for="level in levels"
          :key="level"
        >
          <div v-if="groupedDialogs[level].length > 0">
            <div class="level-title">{{ level }}</div>
            <div class="dialogs-list">
              <DialogCard
                v-for="dialog in groupedDialogs[level]"
                :key="dialog.id"
                :dialog="dialog"
              />
            </div>
          </div>
        </template>
      </div>
      <div
        v-else
        class="message-container"
      >
        <p class="message-text">{{ $t('all.notDialogs') }}</p>
        <router-link
          :to="{ name: 'new-dialog' }"
          class="btn btn-action"
          :class="!isDesktop ? 'mobile' : 'w-250'"
        >
          <span class="material-symbols-outlined">add</span>
          {{ $t('all.createFirst') }}
        </router-link>
      </div>
    </main>

    <footer class="mobile-footer">
      <div class="tab-bar">
        <router-link
          to="/settings"
          class="tab-item"
        >
          <span class="material-symbols-outlined">settings</span>
          <span>{{ $t('all.settings') }}</span>
        </router-link>
        <router-link
          to="/profile"
          class="tab-item"
        >
          <span class="material-symbols-outlined">person</span>
          <span>{{ $t('all.profile') }}</span>
        </router-link>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDialogStore } from '../stores/dialogStore';
import { useUserStore } from '../stores/userStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useUiStore } from '../stores/uiStore';
import DialogCard from '../components/DialogCard.vue';
import { useBreakpoint } from '../composables/useBreakpoint';
import { usePermissions } from '../composables/usePermissions';

const router = useRouter();
const dialogStore = useDialogStore();
const userStore = useUserStore();
const settingsStore = useSettingsStore();
const uiStore = useUiStore();

const { isDesktop } = useBreakpoint();

const levels = ['A1', 'A2.1', 'A2.2', 'B1.1', 'B1.2', 'B2.1', 'B2.2', 'C1.1', 'C1.2', 'C2'];
const dialogs = computed(() => dialogStore.allDialogs);
const { canNew, canGenerate } = usePermissions();

const usage = computed(() => {
  return {
    total: {
      count: dialogStore.allDialogs.length,
      limit: settingsStore.limit.totalDialogs,
    },
    daily: {
      count: settingsStore.dailyGenerationCount,
      limit: settingsStore.limit.dailyGenerations,
    },
  };
});

const viewToast = computed(() => uiStore.viewCounter);

const groupedDialogs = computed(() => {
  const groups = {};
  levels.forEach((level) => {
    groups[level] = dialogs.value.filter((d) => d.level === level);
  });
  return groups;
});

onMounted(() => {
  if (dialogStore.allDialogs.length === 0) {
    dialogStore.fetchAllDialogs();
  }
  if (!userStore.isPro && usage.value.total.count >= usage.value.total.limit) {
    if (viewToast.value < 2) {
      uiStore.viewCounter++;
      uiStore.showToast(`Достигнут лимит диалогов (${settingsStore.limit.totalDialogs}).`, 'warning');
    }
  }
});

const goToCreateDialog = () => {
  // для про можно всегда
  if (userStore.isPro) {
    router.push({ name: 'new-dialog' });
  }
  // для бесплатных проверяем оба лимита и жестко проверяем общий лимит
  else if (canGenerate() && usage.value.total.count < usage.value.total.limit) {
    router.push({ name: 'new-dialog' });
  }
  // если нельзя генерировать
  else if (!canNew()) {
    // делаем инкремент и показываем модалку
    settingsStore.incrementCount('new');
    uiStore.showUpgradeModal();
  }
  // если достигнут общий лимит диалогов
  else {
    settingsStore.incrementCount('total');
    uiStore.showUpgradeModal();
  }
};
</script>

<style scoped>
/* ============================================= */
/* 1. СТИЛИ ДЛЯ МОБИЛЬНЫХ (по умолчанию) */
/* ============================================= */
.page-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: var(--bg-main);
}
.desktop-sidebar {
  display: none;
}
.mobile-header {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: var(--bg-side);
  border-bottom: 1px solid var(--bb);
}
.header-title {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--xl);
  font-weight: 700;
  color: var(--text-head);
}
.btn--icon-only {
  width: 40px;
  min-width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 50%;
}
.content {
  flex: 1;
  overflow: auto;
  padding: 16px;
}
.level-title {
  font-size: var(--xxs);
  color: var(--text-title);
  text-transform: uppercase;
  padding-left: 8px;
  margin: 8px 0;
  border-bottom: 1px solid var(--border);
}
.dialogs-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
.mobile-footer {
  flex-shrink: 0;
}
.tab-bar {
  display: flex;
  justify-content: space-around;
  background-color: var(--bg-side);
  border-top: 1px solid var(--bb);
}
.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 16px;
  color: var(--text-head);
  font-size: var(--xxs);
}
.message-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.message-text {
  font-size: var(--md);
  font-weight: 700;
  color: var(--text-head);
  margin-bottom: 32px;
}
.usage-indicator {
  margin-bottom: 8px;
}
.usage-text {
  display: flex;
  justify-content: space-between;
  font-size: var(--xxs);
  color: var(--text-title);
  margin-bottom: -8px;
}
.usage-progress {
  width: 100%;
  height: 8px;
  -webkit-appearance: none;
  appearance: none;
}
.usage-progress::-webkit-progress-bar {
  background-color: var(--y3);
  border-radius: 4px;
}
.usage-progress::-webkit-progress-value {
  background-color: var(--bb);
  border-radius: 4px;
  transition: width 0.3s ease;
}
/* ============================================= */
/* 2. СТИЛИ ДЛЯ ПЛАНШЕТОВ И ДЕСКТОПОВ */
/* ============================================= */
@media (min-width: 768px) {
  .page-wrapper {
    flex-direction: row;
    height: 100vh;
    overflow: hidden;
  }
  .desktop-sidebar {
    display: flex;
    flex-direction: column;
    width: 280px;
    flex-shrink: 0;
    padding: 24px;
    background: var(--bg-side);
    border-right: 1px solid var(--border);
    gap: 16px;
  }
  .sidebar-title {
    font-size: var(--xxl);
    color: var(--text-head);
    text-align: center;
    margin-bottom: 16px;
  }
  .user-profile {
    margin-top: auto;
    padding-top: 16px;
    border-top: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 16px;
  }
  .mobile-header,
  .mobile-footer {
    display: none;
  }
  .content {
    padding: 32px;
    overflow: auto;
    flex-grow: 1;
  }
  .dialogs-list {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}
</style>
