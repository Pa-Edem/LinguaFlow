<!-- src\views\AllDialogs.vue -->
<template>
  <div v-if="dialogs && !uiStore.loading" class="page-wrapper in-view">
    <aside class="desktop-sidebar">
      <div class="sidebar-title">
        <img class="image" src="../assets/logo.svg" />
        <h1 class="header-title">Lingua Flow</h1>
      </div>
      <button
        v-if="dialogs.length > 0"
        @click="goToCreateDialog"
        class="btn btn-action oooo looo"
        :disabled="!canCreateDialog"
      >
        <span class="material-symbols-outlined">add</span>
        {{ $t('all.createNew') }}
      </button>
      <div class="grow"></div>
      <div class="user-profile">
        <router-link to="/profile" class="btn btn-common oooo oool">
          <span class="material-symbols-outlined">person</span>
          <span>{{ $t('all.profile') }}</span>
        </router-link>
        <router-link to="/settings" class="btn btn-common oooo oloo">
          <span class="material-symbols-outlined">settings</span>
          <span>{{ $t('all.settings') }}</span>
        </router-link>
      </div>
    </aside>
    <!-- | -->
    <header class="mobile-header">
      <img class="image" src="../assets/logo.svg" />
      <h1 class="header-title">Lingua Flow</h1>
      <button
        v-if="dialogs.length > 0"
        @click="goToCreateDialog"
        :disabled="!canCreateDialog"
        class="btn btn-action btn--icon-only"
      >
        <span class="material-symbols-outlined">add</span>
      </button>
    </header>

    <main class="content">
      <div v-if="dialogs.length > 0" class="dialogs-grid">
        <div v-if="!userStore.isPro" class="usage-indicator">
          <div class="usage-text">
            <span>{{ $t('all.savedDialogs') }}</span>
            <span>{{ usage.total.count }} / {{ usage.total.limit }}</span>
          </div>
          <progress class="usage-progress" :value="usage.total.count" :max="usage.total.limit"></progress>
        </div>
        <template v-for="level in levels" :key="level">
          <div v-if="groupedDialogs[level].length > 0">
            <div class="level-title">{{ level }}</div>
            <div class="dialogs-list">
              <DialogCard v-for="dialog in groupedDialogs[level]" :key="dialog.id" :dialog="dialog" />
            </div>
          </div>
        </template>
      </div>
      <div v-else class="message-container">
        <p class="message-text">{{ $t('all.notDialogs') }}</p>
        <router-link
          :to="{ name: 'new-dialog' }"
          class="btn btn-action oooo looo"
          :class="!isDesktop ? 'mobile' : 'w-250'"
        >
          <span class="material-symbols-outlined">add</span>
          {{ $t('all.createFirst') }}
        </router-link>
      </div>
    </main>

    <footer class="mobile-footer">
      <div class="tab-bar">
        <router-link to="/settings" class="tab-item">
          <span class="material-symbols-outlined">settings</span>
          <span>{{ $t('all.settings') }}</span>
        </router-link>
        <router-link to="/profile" class="tab-item">
          <span class="material-symbols-outlined">person</span>
          <span>{{ $t('all.profile') }}</span>
        </router-link>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDialogStore } from '../stores/dialogStore';
import { useUserStore } from '../stores/userStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useUiStore } from '../stores/uiStore';
import DialogCard from '../components/DialogCard.vue';
import { useBreakpoint } from '../composables/useBreakpoint';
import { usePermissions } from '../composables/usePermissions';
import { clearOldNoteFlags } from '../utils/dataTransformer';

const router = useRouter();
const dialogStore = useDialogStore();
const userStore = useUserStore();
const settingsStore = useSettingsStore();
const uiStore = useUiStore();

const { isDesktop } = useBreakpoint();

const levels = ['A1', 'A2.1', 'A2.2', 'B1.1', 'B1.2', 'B2.1', 'B2.2', 'C1.1', 'C1.2', 'C2'];
const dialogs = computed(() => dialogStore.allDialogs);
const { canGenerate } = usePermissions();

// Реактивный флаг для триггера пересчёта
const upgradeShownForCreate = ref(sessionStorage.getItem('upgradeShown_create') === 'true');

// Computed для блокировки кнопки "Создать диалог"
const canCreateDialog = computed(() => {
  if (userStore.isPro) return true;
  if (upgradeShownForCreate.value) return false;
  return canGenerate();
});

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

const groupedDialogs = computed(() => {
  const groups = {};
  levels.forEach((level) => {
    groups[level] = dialogs.value.filter((d) => d.level === level);
  });
  return groups;
});

onMounted(async () => {
  clearOldNoteFlags();
  if (!userStore.isPro) {
    await Promise.all([
      dialogStore.allDialogs.length === 0 ? dialogStore.fetchAllDialogs() : Promise.resolve(),
      settingsStore.loadUsageStats(),
    ]);
  } else {
    if (dialogStore.allDialogs.length === 0) {
      await dialogStore.fetchAllDialogs();
    }
  }

  upgradeShownForCreate.value = sessionStorage.getItem('upgradeShown_create') === 'true';

  if (!userStore.isPro) {
    // uiStore.checkAndResetViewCounter();

    const totalDialogs = dialogStore.allDialogs.length;
    const dailyGen = settingsStore.dailyGenerationCount;
    const dailyGenLimit = settingsStore.limit.dailyGenerations;
    const totalLimit = settingsStore.limit.totalDialogs;

    // ✅ Проверяем последнее показанное значение
    const lastDailyCount = sessionStorage.getItem('toast_last_daily_count');
    const totalLimitToastShown = sessionStorage.getItem('toast_total_limit_shown') === 'true';

    // Toast для общего лимита (показать 1 раз)
    if (totalDialogs >= totalLimit && !totalLimitToastShown) {
      uiStore.showToast(`Достигнут лимит диалогов (${totalLimit} максимум).`, 'warning');
      sessionStorage.setItem('toast_total_limit_shown', 'true');
    }

    // ✅ Toast для дневных генераций (ТОЛЬКО последнее предупреждение + лимит)
    if (lastDailyCount !== String(dailyGen)) {
      const remaining = dailyGenLimit - dailyGen;

      if (remaining === 1) {
        // Последнее предупреждение перед лимитом
        uiStore.showToast(`У вас осталась 1 генерация на сегодня.`, 'info');
        sessionStorage.setItem('toast_last_daily_count', String(dailyGen));
      } else if (remaining === 0) {
        // Лимит исчерпан
        uiStore.showToast(`Дневной лимит генераций исчерпан (${dailyGenLimit}/день).`, 'warning');
        sessionStorage.setItem('toast_last_daily_count', String(dailyGen));
      }
      // ✅ Для remaining > 1 → ничего не показываем
    }
  }
});

const goToCreateDialog = async () => {
  if (userStore.isPro) {
    router.push({ name: 'new-dialog' });
    return;
  }

  // Сначала обновляем счётчики с сервера
  await settingsStore.loadUsageStats();

  // Проверяем актуальные лимиты
  const dailyCount = settingsStore.dailyGenerationCount;
  const dailyLimit = settingsStore.limit.dailyGenerations;
  const totalCount = dialogStore.allDialogs.length;
  const totalLimit = settingsStore.limit.totalDialogs;

  // Если можно генерировать — переходим
  if (dailyCount < dailyLimit && totalCount < totalLimit) {
    router.push({ name: 'new-dialog' });
  }
  // Если лимит достигнут — показываем модалку и блокируем кнопку
  else {
    uiStore.showUpgradeModal();
    sessionStorage.setItem('upgradeShown_create', 'true');
    upgradeShownForCreate.value = true;
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
  position: relative;
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
  padding: 8px 16px;
  background-color: var(--bg-side);
  border-bottom: 1px solid var(--bb);
}
.image {
  height: 40px;
  margin-right: 16px;
}
.header-title {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--xl);
  font-weight: 700;
  color: var(--text-head);
  margin-right: auto;
}
.btn--icon-only {
  width: 40px;
  min-width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 50%;
}
main.content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  min-height: 0;
  margin-bottom: 50px;
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
  z-index: 10;
  border-top: 1px solid var(--bb);
  position: fixed;
  width: 100%;
  bottom: 0;
}
.tab-bar {
  display: flex;
  justify-content: space-around;
  background-color: var(--bg-side);
}
.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 16px;
  color: var(--text-head);
  font-family: 'Roboto Condensed', sans-serif;
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
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
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
    overflow: visible;
    min-height: auto;
  }
  .dialogs-list {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}
</style>
