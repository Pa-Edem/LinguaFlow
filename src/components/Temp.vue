<!--\\src\views\Profile.vue -->

<template>
  <div class="profile-page">
    <!-- Хедер с информацией о пользователе -->
    <div class="profile-header">
      <div class="user-avatar">
        <span class="material-symbols-outlined">person</span>
      </div>
      <div class="user-info">
        <div class="user-name">{{ userStore.user?.displayName || 'Anonymous' }}</div>
        <div class="user-email">{{ userStore.user?.email }}</div>
      </div>
    </div>

    <!-- Блок "Моя подписка" -->
    <section class="subscription-section">
      <h2 class="section-title">МОЯ ПОДПИСКА</h2>
      <div class="current-subscription">
        <!-- Заголовок с бейджем -->
        <div class="subscription-header">
          <div class="tier-info">
            <span class="material-symbols-outlined tier-badge" :class="planIconClass">{{ planIcon }}</span>
            <span class="tier-name">{{ currentPlanInfo.name }}</span>
          </div>
        </div>

        <!-- Статистика лимитов (для FREE и PRO) -->
        <div v-if="!userStore.isPremium" class="limits-summary">
          <div class="limit-row">
            <span class="limit-icon">🎯</span>
            <span class="limit-label">Генерация:</span>
            <span class="limit-value">{{ settingsStore.canUseToday }} сегодня</span>
            <span class="limit-detail"
              >({{ settingsStore.accumulatedGenerations }}/{{ settingsStore.limit.weeklyGenerationsCap }})</span
            >
          </div>
          <div class="limit-row">
            <span class="limit-icon">💪</span>
            <span class="limit-label">PRO-тренировки:</span>
            <span class="limit-value">{{ settingsStore.canUsePreviewToday }} сегодня</span>
            <span class="limit-detail"
              >({{ settingsStore.accumulatedPreview }}/{{ settingsStore.limit.weeklyPreviewCap }})</span
            >
          </div>
          <div class="limit-row">
            <span class="limit-icon">📚</span>
            <span class="limit-label">Диалоги:</span>
            <span class="limit-value"
              >{{ dialogStore.allDialogs.length }} / {{ settingsStore.limit.totalDialogs }}</span
            >
          </div>
        </div>

        <!-- PREMIUM план - сообщение о безлимите -->
        <div v-else class="pro-message">
          <span class="material-symbols-outlined">check_circle</span>
          <span>Безлимитный доступ ко всем функциям!</span>
        </div>

        <!-- Кнопка "Подробнее о лимитах" -->
        <button class="limits-details-btn" @click="uiStore.showLimitsModal()">
          <span class="material-symbols-outlined">info</span>
          Подробнее о лимитах
        </button>
      </div>
    </section>

    <!-- Блок "Доступные планы" -->
    <section class="plans-section">
      <h2 class="section-title">ДОСТУПНЫЕ ПЛАНЫ</h2>
      <div class="plans-grid">
        <PlanCard
          v-for="plan in availablePlans"
          :key="plan.id"
          :plan="plan"
          :isCurrent="userStore.tier === plan.id"
          :isFeatured="plan.id === 'premium'"
          @select="handlePlanSelect"
        />
      </div>
    </section>

    <!-- Кнопка "Готово" -->
    <div class="profile-actions">
      <button class="btn btn-common oooo oloo w-150" @click="goBack">
        <span class="material-symbols-outlined">check</span>
        Готово
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import { useDialogStore } from '../stores/dialogStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useUiStore } from '../stores/uiStore';
import PlanCard from '../components/PlanCard.vue';
import { PLANS, getPlanInfo } from '../config/stripeConfig';

const router = useRouter();
const userStore = useUserStore();
const dialogStore = useDialogStore();
const settingsStore = useSettingsStore();
const uiStore = useUiStore();

// Информация о текущем плане
const currentPlanInfo = computed(() => {
  return getPlanInfo(userStore.tier);
});

// Иконка для плана
const planIcon = computed(() => {
  if (!currentPlanInfo.value) return 'lock';

  switch (currentPlanInfo.value.id) {
    case 'premium':
      return 'crown';
    case 'pro':
      return 'star';
    case 'starter':
      return 'star';
    case 'free':
    default:
      return 'lock';
  }
});

// ✅ НОВОЕ: CSS класс для иконки
const planIconClass = computed(() => {
  switch (currentPlanInfo.value?.id) {
    case 'premium':
      return 'premium-icon';
    case 'pro':
      return 'pro-icon';
    case 'starter':
      return 'star';
    case 'free':
    default:
      return 'free-icon';
  }
});

// ✅ ОБНОВЛЕНО: Все доступные планы (FREE, PRO, PREMIUM)
const availablePlans = computed(() => {
  // Показываем только активные планы (без STARTER для новых пользователей)
  return [PLANS.free, PLANS.pro, PLANS.premium];
});

// Обработчик выбора плана
const handlePlanSelect = (planId) => {
  uiStore.showPlanModal(planId);
};

// Вернуться назад
const goBack = () => {
  router.push('/dialogs');
};

// При монтировании загружаем данные
onMounted(async () => {
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
});
</script>
