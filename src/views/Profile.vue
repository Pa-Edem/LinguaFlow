<!--\\src\views\Profile.vue -->

<template>
  <div class="profile-page in-view">
    <!-- Хедер с информацией о пользователе -->
    <div class="profile-header">
      <div class="user-avatar">
        <img v-if="userStore.user?.photoURL" :src="userStore.user.photoURL" class="avatar-image" />
        <span v-else class="material-symbols-outlined">person</span>
      </div>
      <div class="user-info">
        <div class="user-name">{{ userStore.user?.displayName || 'Anonymous' }}</div>
        <div class="user-email">{{ userStore.user?.email }}</div>
      </div>
      <!-- ✅ User Menu -->
      <div class="user-menu-container">
        <button @click="isMenuOpen = !isMenuOpen" class="btn-menu-dots">
          <span class="material-symbols-outlined drop" v-if="!isMenuOpen">menu</span>
          <span class="material-symbols-outlined drop" v-if="isMenuOpen">close</span>
        </button>
        <Transition name="fade">
          <div v-if="isMenuOpen" class="dropdown-menu">
            <button @click="handleLogout" class="dropdown-item danger">
              <span class="material-symbols-outlined">logout</span>
              {{ $t('buttons.logOut') }}
            </button>
            <button @click="handleDeleteAccount" class="dropdown-item danger">
              <span class="material-symbols-outlined">delete_forever</span>
              {{ $t('buttons.delete') }}
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <div class="profile-content">
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
          <!-- ✅ Trial Badge -->
          <TrialBadge v-if="userStore.isOnTrial" class="mb-16" />

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

          <!-- PREMIUM план - сообщение -->
          <div v-else class="pro-message">
            <span>Безлимитный доступ ко всем функциям!</span>
          </div>

          <!-- Кнопка "Подробнее о лимитах" -->
          <button
            class="btn btn-menu mx-auto"
            :class="isDesktop ? 'w-360' : 'mobile w-100p'"
            @click="uiStore.showLimitsModal()"
          >
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
            @select="handlePlanSelect"
          />
        </div>
      </section>
    </div>
    <!-- Кнопка "Готово" -->
    <div class="profile-actions">
      <button class="btn btn-menu" :class="isDesktop ? 'w-250' : 'mobile'" @click="goBack">
        <span class="material-symbols-outlined">check</span>
        Готово
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useUserStore } from '../stores/userStore';
import { useDialogStore } from '../stores/dialogStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useUiStore } from '../stores/uiStore';
import TrialBadge from '../components/TrialBadge.vue';
import PlanCard from '../components/PlanCard.vue';
import { PLANS, getPlanInfo } from '../config/stripeConfig';
import { clearAllDialogCache } from '../utils/dataTransformer';
import { useBreakpoint } from '../composables/useBreakpoint';

const { t } = useI18n();
const router = useRouter();
const userStore = useUserStore();
const dialogStore = useDialogStore();
const settingsStore = useSettingsStore();
const uiStore = useUiStore();

const { isDesktop } = useBreakpoint();
const isMenuOpen = ref(false);

// Информация о текущем плане
const currentPlanInfo = computed(() => {
  return getPlanInfo(userStore.tier);
});

// Иконка для плана
const planIcon = computed(() => {
  if (!currentPlanInfo.value) return 'school';

  switch (currentPlanInfo.value.id) {
    case 'premium':
      return 'crown';
    case 'pro':
      return 'star';
    case 'free':
    default:
      return 'school';
  }
});

// ✅ CSS класс для иконки
const planIconClass = computed(() => {
  switch (currentPlanInfo.value?.id) {
    case 'premium':
      return 'premium-icon';
    case 'pro':
      return 'pro-icon';
    case 'free':
    default:
      return 'free-icon';
  }
});

// ✅ Все доступные планы (FREE, PRO, PREMIUM)
const availablePlans = computed(() => {
  // Показываем только активные планы
  return [PLANS.free, PLANS.pro, PLANS.premium];
});

// Обработчик выбора плана
const handlePlanSelect = (planId) => {
  uiStore.showPlanModal(planId);
};

// ✅ Logout handler
const handleLogout = async () => {
  isMenuOpen.value = false;
  const confirmed = await uiStore.showConfirmation({
    title: t('profile.logoutConfirmTitle'),
    message: t('profile.logoutConfirmMsg'),
    confirmText: t('buttons.logOut'),
    cancelText: t('buttons.cancel'),
  });

  if (confirmed) {
    await userStore.logout();
    clearAllDialogCache();
    dialogStore.$reset();
    router.push({ name: 'auth' });
  }
};

// ✅ Delete account handler
const handleDeleteAccount = async () => {
  isMenuOpen.value = false;

  const confirmed = await uiStore.showConfirmation({
    title: t('profile.deleteConfirmTitle'),
    message: t('profile.deleteConfirmMsg'),
    confirmText: t('buttons.del'),
    cancelText: t('buttons.cancel'),
  });

  if (!confirmed) return;

  try {
    userStore.isLoading = true;
    const functions = getFunctions(undefined, 'europe-west1');
    const deleteAccount = httpsCallable(functions, 'deleteUserAccount');
    const result = await deleteAccount();

    if (result.data.success) {
      clearAllDialogCache();
      uiStore.showToast(t('profile.accountDeleted'), 'success');
      router.push({ name: 'welcome' });
    }
  } catch (error) {
    userStore.isLoading = false;
    console.error('❌ Ошибка удаления аккаунта:', error);
    uiStore.showToast('Не удалось удалить аккаунт', 'error');
  } finally {
    userStore.isLoading = false;
  }
};

// Вернуться назад
const goBack = () => {
  router.push('/dialogs');
};

// При монтировании загружаем данные
onMounted(async () => {
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
});
</script>

<style scoped>
/* MOBILES (767px and down) */
.profile-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--lg);
  overflow: hidden;
}
.profile-header {
  display: flex;
  align-items: center;
  gap: var(--md);
  padding: var(--sm) var(--lg);
  background: var(--bg-card);
  border-radius: var(--xxs);
  margin-bottom: var(--xl);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  position: relative;
}
.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--gradient-purple);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: var(--xxl);
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}
.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}
.user-info {
  flex: 1;
  min-width: 0;
}
.user-name {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--md);
  font-weight: 700;
  color: var(--text-head);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-email {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  color: var(--text-base);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-menu-container {
  position: relative;
  flex-shrink: 0;
}
.btn-menu-dots {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--xs);
  color: var(--text-base);
  transition: all var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--xxs);
}
.btn-menu-dots:hover {
  color: var(--text-head);
  background: var(--bg-side);
}
.btn-menu-dots .drop {
  font-size: var(--xl);
}
.dropdown-menu {
  position: absolute;
  top: calc(100% + var(--xxxs));
  right: 0;
  margin-top: var(--xs);
  background: var(--bg-card);
  border: 2px solid var(--border);
  border-radius: var(--md);
  box-shadow: var(--shadow-xl);
  min-width: 200px;
  z-index: var(--z-dropdown);
  overflow: hidden;
}
.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--sm);
  padding: var(--sm);
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--md);
  font-weight: 600;
  color: var(--text-base);
  transition: all var(--transition-base);
  text-align: left;
}
.dropdown-item:hover {
  background: var(--bg-side);
}
.dropdown-item.danger {
  color: var(--r3);
}
.dropdown-item.danger:hover {
  background: var(--r1);
}
.dropdown-item .material-symbols-outlined {
  font-size: var(--md);
}
.fade-enter-active,
.fade-leave-active {
  transition: all var(--transition-base);
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.profile-content {
  flex-grow: 1;
  overflow-y: auto;
  padding-bottom: var(--lg);
  padding-right: 8px;
}
.subscription-section {
  margin-bottom: var(--xl);
}
.section-title {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  font-weight: 700;
  color: var(--text-title);
  text-transform: uppercase;
  margin-bottom: var(--xxxs);
  padding-left: var(--md);
}
.current-subscription {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--xxs);
  padding: var(--xs) var(--sm);
  box-shadow: var(--shadow-sm);
}
.subscription-header {
  margin-bottom: var(--xxxs);
}
.tier-info {
  display: flex;
  align-items: center;
  gap: var(--xxs);
}
.tier-info .tier-badge {
  font-size: var(--lg);
}
.tier-info .free-icon {
  color: var(--y7);
}
.tier-info .pro-icon {
  color: var(--blue-5);
}
.tier-info .premium-icon {
  color: var(--gold-5);
}
.tier-name {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--md);
  font-weight: 700;
  color: var(--text-head);
  text-transform: uppercase;
}
.limits-summary {
  display: flex;
  flex-direction: column;
  gap: var(--xxxs);
  margin-bottom: var(--sm);
  background: transparent;
}
.limit-row {
  display: flex;
  align-items: center;
  gap: var(--xxs);
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  color: var(--text-base);
  flex-wrap: wrap;
}
.limit-icon {
  font-size: var(--sm);
  flex-shrink: 0;
}
.limit-label {
  font-weight: 600;
  flex-shrink: 0;
}
.limit-value {
  font-weight: 700;
  color: var(--text-head);
}
.limit-detail {
  color: var(--text-title);
  font-size: var(--sm);
}
.pro-message {
  display: flex;
  padding: var(--md);
  background: var(--g1);
  border: 1px solid var(--g3);
  border-radius: var(--xxs);
  margin-bottom: var(--md);
}
.pro-message span {
  width: 100%;
  text-align: center;
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--md);
  font-weight: 600;
  color: var(--g3);
}
.plans-section {
  margin-bottom: var(--xl);
}
.plans-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--md);
}
.profile-actions {
  display: flex;
  justify-content: center;
  flex-shrink: 0;
  padding: var(--lg) 0;
  border-top: 1px solid var(--border);
}
/* TABLETS (768px and up) */
@media (min-width: 768px) {
  .profile-page {
    padding: var(--xl);
  }
  .profile-header {
    padding: var(--sm);
  }
  .current-subscription {
    padding: var(--md);
  }
  .plans-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
/* DESKTOPS (1200px and up) */
@media (min-width: 1200px) {
  .profile-page {
    padding: var(--xl);
  }
  .subscription-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
