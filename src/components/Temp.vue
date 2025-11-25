<!-- src\views\AllDialogs.vue -->
<template>
  <!-- ✅ НОВОЕ: Модалка trial при первом визите -->
  <TrialModal v-model="showTrialModal" @activated="handleTrialActivated" @declined="handleTrialDeclined" />

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
        class="btn btn-action btn--icon-only oolo"
      >
        <span class="material-symbols-outlined">add</span>
      </button>
    </header>

    <main class="content">
      <div v-if="dialogs.length > 0" class="dialogs-grid">
        <!-- ✅ НОВОЕ: Trial баннер (для FREE пользователей) -->
        <TrialBanner />

        <!-- ✅ ОБНОВЛЕНО: Показываем лимиты только для FREE и PRO -->
        <div v-if="!userStore.isPremium" class="limits-compact" :class="!isDesktop ? '' : 'p16'">
          <div class="limits-progress">
            <!-- Генерация -->
            <div class="limit-row">
              <div class="limit-info">
                <span class="limit-label">Генерация:</span>
                <span class="limit-value">{{ settingsStore.canUseToday }} сегодня</span>
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
                <span class="limit-value">{{ settingsStore.canUsePreviewToday }} сегодня</span>
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
            <button class="btn btn-menu btn--icon-only looo" @click="uiStore.showLimitsModal()">
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
import TrialBanner from '../components/TrialBanner.vue';
import TrialModal from '../components/TrialModal.vue';
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

// ✅ НОВОЕ: Показывать ли модалку trial
const showTrialModal = ref(false);

// Реактивный флаг для триггера пересчёта
const upgradeShownForCreate = ref(sessionStorage.getItem('upgradeShown_create') === 'true');

// ✅ ОБНОВЛЕНО: Computed для блокировки кнопки "Создать диалог"
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
      count: settingsStore.dailyGenerationCount,
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

  // ✅ ОБНОВЛЕНО: Для FREE и PRO загружаем лимиты
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

  // ✅ НОВОЕ: Показываем модалку trial при первом визите
  if (!userStore.trialUsed && userStore.tier === 'free') {
    const trialModalShown = localStorage.getItem('trial_modal_shown');
    if (!trialModalShown) {
      // Первый визит → показываем модалку
      setTimeout(() => {
        showTrialModal.value = true;
      }, 1000); // Задержка 1 секунда для плавности

      localStorage.setItem('trial_modal_shown', 'true');
    }
  }

  // ✅ НОВОЕ: Проверяем, закончился ли trial (показываем toast 1 раз)
  const trialExpiredShown = sessionStorage.getItem('trial_expired_shown') === 'true';
  if (userStore.trialUsed && !userStore.trialActive && !trialExpiredShown && userStore.tier === 'free') {
    // Trial закончился — показываем toast с предложением апгрейда
    uiStore.showToast('⏰ Ваш PRO trial закончился. Обновитесь до PRO для полного доступа!', 'info');
    sessionStorage.setItem('trial_expired_shown', 'true');
  }

  // ✅ ОБНОВЛЕНО: Toast'ы только для FREE и PRO
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
});

const goToCreateDialog = async () => {
  // ✅ PREMIUM — всегда можно создавать
  if (userStore.isPremium) {
    router.push({ name: 'new-dialog' });
    return;
  }

  // ✅ PRO/FREE — проверяем лимиты
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

// ✅ НОВОЕ: Обработчик активации trial из модалки
const handleTrialActivated = () => {
  // Модалка уже закрыта, toast показан в TrialModal
  console.log('✅ Trial activated from modal');
};

// ✅ НОВОЕ: Обработчик отказа от trial
const handleTrialDeclined = () => {
  console.log('ℹ️ User declined trial');
};
</script>
