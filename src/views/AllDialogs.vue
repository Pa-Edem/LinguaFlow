<!-- src\views\AllDialogs.vue -->
<template>
  <!-- ✅ Модалка trial при первом визите -->
  <TrialModal v-model="showTrialModal" @activated="handleTrialActivated" @declined="handleTrialDeclined" />

  <div v-if="dialogs && !uiStore.loading" class="page-wrapper in-view">
    <aside class="desktop-sidebar">
      <div class="sidebar-title">
        <img class="image" src="../assets/logo.svg" />
        <h1 class="header-title">Lingua Flow</h1>
      </div>
      <button v-if="dialogs.length > 0" @click="goToCreateDialog" class="btn btn-action" :disabled="!canCreateDialog">
        <span class="material-symbols-outlined">add</span>
        {{ $t('all.createNew') }}
      </button>
      <div class="grow"></div>
      <div class="user-profile">
        <!-- ✅ КОЛОКОЛЬЧИК -->
        <NotificationBell />
        <router-link to="/profile" class="btn btn-menu">
          <span class="material-symbols-outlined">person</span>
          <span>{{ $t('all.profile') }}</span>
        </router-link>
        <router-link to="/settings" class="btn btn-menu">
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
      <div v-if="dialogs.length > 0">
        <!-- ✅ НОВЫЙ компактный индикатор лимитов только для FREE и PRO -->
        <div v-if="!userStore.isPremium" class="limits-compact">
          <div class="limits-progress">
            <!-- Генерация -->
            <div class="limit-row">
              <div class="limit-info">
                <span class="limit-label">Генерация:</span>
                <span class="limit-value">{{ settingsStore.canUseToday }} доступно сегодня</span>
                <span class="limit-accumulated"
                  >({{ settingsStore.accumulatedGenerations }}/{{ settingsStore.limit.weeklyGenerationsCap }})</span
                >
              </div>
              <div class="limit-progress-bar">
                <div class="progress-fill generation" :style="{ width: `${settingsStore.generationsProgress}%` }"></div>
              </div>
            </div>
            <!-- PRO-тренировки -->
            <div class="limit-row">
              <div class="limit-info">
                <span class="limit-label">PRO-тренировки:</span>
                <span class="limit-value">{{ settingsStore.canUsePreviewToday }} доступно сегодня</span>
                <span class="limit-accumulated"
                  >({{ settingsStore.accumulatedPreview }}/{{ settingsStore.limit.weeklyPreviewCap }})</span
                >
              </div>
              <div class="limit-progress-bar">
                <div class="progress-fill preview" :style="{ width: `${settingsStore.previewProgress}%` }"></div>
              </div>
            </div>
            <!-- Диалоги -->
            <div class="limit-row">
              <div class="limit-info">
                <span class="limit-label">{{ $t('all.savedDialogs') }}:</span>
                <span class="limit-value">{{ usage.total.count }} / {{ usage.total.limit }}</span>
              </div>
              <div class="limit-progress-bar">
                <div class="progress-fill storage" :style="{ width: `${storageProgress}%` }"></div>
              </div>
            </div>
          </div>

          <!-- Кнопка "Подробнее" -->
          <div class="btn-wrap">
            <button class="btn btn-menu btn--icon-only" @click="uiStore.showLimitsModal()">
              <span class="material-symbols-outlined">info_i</span>
            </button>
          </div>
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
        <router-link :to="{ name: 'new-dialog' }" class="btn btn-action" :class="!isDesktop ? 'mobile' : 'w-250'">
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
        <!-- ✅ КОЛОКОЛЬЧИК -->
        <NotificationBell />
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
import { useNotificationStore } from '../stores/notificationStore';
import DialogCard from '../components/DialogCard.vue';
import TrialModal from '../components/TrialModal.vue';
import NotificationBell from '../components/NotificationBell.vue';
import { useBreakpoint } from '../composables/useBreakpoint';
import { usePermissions } from '../composables/usePermissions';
import { clearOldNoteFlags } from '../utils/dataTransformer';

const router = useRouter();
const dialogStore = useDialogStore();
const userStore = useUserStore();
const settingsStore = useSettingsStore();
const uiStore = useUiStore();
const notificationStore = useNotificationStore();

const { isDesktop } = useBreakpoint();

const levels = ['A1', 'A2.1', 'A2.2', 'B1.1', 'B1.2', 'B2.1', 'B2.2', 'C1.1', 'C1.2', 'C2'];
const dialogs = computed(() => dialogStore.allDialogs);
const { canGenerate } = usePermissions();

// ✅ Показывать ли модалку trial
const showTrialModal = ref(false);

// Реактивный флаг для триггера пересчёта
const upgradeShownForCreate = ref(sessionStorage.getItem('upgradeShown_create') === 'true');

// ✅ Computed для блокировки кнопки "Создать диалог"
const canCreateDialog = computed(() => {
  // ✅ PREMIUM — всегда можно
  if (userStore.isPremium) return true;
  // ✅ PRO/FREE — проверяем лимиты
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
      count: settingsStore.dailyUsageToday,
      limit: settingsStore.limit.dailyGenerations,
    },
  };
});

// ✅ Прогресс хранилища
const storageProgress = computed(() => {
  const max = settingsStore.limit.totalDialogs;
  if (max === 0) return 0;
  return Math.round((usage.value.total.count / max) * 100);
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
  // ✅ Для FREE и PRO загружаем лимиты
  if (!userStore.isPremium) {
    await Promise.all([
      dialogStore.allDialogs.length === 0 ? dialogStore.fetchAllDialogs() : Promise.resolve(),
      settingsStore.loadUsageStats(),
    ]);
  } else {
    // ✅ Для PREMIUM просто загружаем диалоги (лимитов нет)
    if (dialogStore.allDialogs.length === 0) {
      await dialogStore.fetchAllDialogs();
    }
  }

  upgradeShownForCreate.value = sessionStorage.getItem('upgradeShown_create') === 'true';

  // ✅ Показываем модалку trial при первом визите
  if (!userStore.trialUsed && userStore.tier === 'free') {
    const trialModalShown = localStorage.getItem('trial_modal_shown');
    if (!trialModalShown) {
      // Первый визит → показываем модалку
      setTimeout(() => {
        showTrialModal.value = true;
      }, 1000); // Задержка 1 секунда для плавности

      localStorage.setItem('trial_modal_shown', 'true');
    }
    // else {
    //   console.log('❌ Trial Modal already shown');
    // }
  }
  // else {
  // console.log('❌ Trial Modal conditions not met:', {
  //   reason: userStore.trialUsed ? 'trial already used' : 'not free tier',
  // });
  // }

  // ✅ Проверяем, закончился ли trial (показываем toast 1 раз)
  const trialExpiredShown = sessionStorage.getItem('trial_expired_shown') === 'true';
  if (userStore.trialUsed && !userStore.trialActive && !trialExpiredShown && userStore.tier === 'free') {
    // Trial закончился — показываем toast с предложением апгрейда
    uiStore.showToast('⏰ Ваш PRO trial закончился. Обновитесь до PRO для полного доступа!', 'info');
    sessionStorage.setItem('trial_expired_shown', 'true');
  }

  // ✅ Toast'ы только для FREE и PRO
  if (!userStore.isPremium) {
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

  // ✅ ПРОВЕРКА УВЕДОМЛЕНИЙ
  await notificationStore.checkForNewNotifications();
});

// ✅ Обработчик активации trial из модалки
const goToCreateDialog = async () => {
  // ✅ PREMIUM — всегда можно создавать
  if (userStore.isPremium) {
    router.push({ name: 'new-dialog' });
    return;
  }

  // ✅ PRO/FREE — проверяем лимиты
  await settingsStore.loadUsageStats();

  // ✅ НОВЫЕ СЧЁТЧИКИ
  const usedToday = settingsStore.dailyUsageToday;
  const accumulated = settingsStore.accumulatedGenerations;
  const dailyMax = settingsStore.limit.dailyGenerationsMax;
  const totalCount = dialogStore.allDialogs.length;
  const totalLimit = settingsStore.limit.totalDialogs;

  // ✅ Проверка: есть ли накопленные И не превышен дневной максимум И не превышен лимит диалогов
  const canUse = usedToday < dailyMax && accumulated > 0 && totalCount < totalLimit;

  if (canUse) {
    // ✅ Можно создавать — переходим
    router.push({ name: 'new-dialog' });
  } else {
    // ❌ Лимит исчерпан — модалка + блокировка
    uiStore.showUpgradeModal();
    sessionStorage.setItem('upgradeShown_create', 'true');
    upgradeShownForCreate.value = true;
  }
};

const handleTrialActivated = () => {
  // Модалка уже закрыта, toast показан в TrialModal
  console.log('✅ Trial activated from modal');
};

// ✅ Обработчик отказа от trial
const handleTrialDeclined = () => {
  console.log('ℹ️ User declined trial');
};
</script>

<style scoped>
/* MOBILES (767px and down) */
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
  border-radius: 20px;
}
main.content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  min-height: 0;
  margin-bottom: 50px;
}
.level-title {
  font-size: var(--xs);
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
  font-size: var(--xs);
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
.limits-compact {
  display: flex;
  flex-wrap: nowrap;
  background: var(--bg-side);
  border-radius: 12px;
  padding: var(--xxs) var(--sm);
  border: 1px solid var(--border);
}
.limits-progress {
  flex-grow: 1;
  padding: 0 8px;
}
.limit-row {
  margin-bottom: 8px;
}
.limit-row:last-of-type {
  margin-bottom: 0;
}
.limit-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  color: var(--text-base);
}
.limit-label {
  font-weight: 400;
}
.limit-value {
  font-weight: 500;
  color: var(--text-head);
}
.limit-accumulated {
  color: var(--text-title);
}
.limit-progress-bar {
  height: 6px;
  background: var(--y3);
  border-radius: 3px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}
.progress-fill.generation {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}
.progress-fill.preview {
  background: linear-gradient(90deg, #48bb78 0%, #38a169 100%);
}
.progress-fill.storage {
  background: linear-gradient(90deg, #ed8936 0%, #dd6b20 100%);
}
.btn-wrap {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
/* TABLETS & DESKTOPS (768px and up)  */
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
