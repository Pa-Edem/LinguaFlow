<!-- src/components/TrialBanner.vue -->
<template>
  <!-- Показываем только для FREE пользователей -->
  <div v-if="shouldShowBanner" class="trial-banner" :class="bannerClass">
    <!-- Вариант 1: Trial НЕ использован → Кнопка активации -->
    <div v-if="!userStore.trialUsed && !userStore.trialActive" class="banner-content">
      <div class="banner-icon">🎁</div>
      <div class="banner-text">
        <div class="banner-title">Попробуйте PRO бесплатно!</div>
        <div class="banner-subtitle">7 дней полного доступа ко всем функциям</div>
      </div>
      <button class="banner-btn" @click="activateTrial" :disabled="isLoading">
        <span v-if="!isLoading">Активировать trial</span>
        <span v-else>Активация...</span>
      </button>
    </div>

    <!-- Вариант 2: Trial активен → Таймер -->
    <div v-else-if="userStore.trialActive" class="banner-content">
      <div class="banner-icon">⏰</div>
      <div class="banner-text">
        <div class="banner-title">PRO trial активен</div>
        <div class="banner-subtitle">Осталось {{ userStore.trialDaysLeft }} {{ daysWord }} до окончания</div>
      </div>
      <button class="banner-btn upgrade" @click="goToPricing">Обновить до PRO</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useUiStore } from '../stores/uiStore';

const router = useRouter();
const userStore = useUserStore();
const settingsStore = useSettingsStore();
const uiStore = useUiStore();

const isLoading = ref(false);

// Показывать ли баннер
// Показывать ли баннер
const shouldShowBanner = computed(() => {
  // Показываем только для FREE пользователей
  if (userStore.tier !== 'free') return false;

  // 1. ПРИОРИТЕТ: Trial АКТИВЕН → ВСЕГДА показываем (таймер важен!)
  if (userStore.trialActive) {
    return true;
  }

  // 2. Trial использован и закончился → НЕ показываем
  if (userStore.trialUsed && !userStore.trialActive) {
    return false;
  }

  // 3. Trial доступен (не использован) → показываем 1 раз в день
  if (!userStore.trialUsed) {
    const lastShown = localStorage.getItem('trial_banner_last_shown');
    const today = new Date().toDateString();

    // Уже показывали сегодня → НЕ показываем
    if (lastShown === today) {
      return false;
    }

    // Показываем и сохраняем дату
    localStorage.setItem('trial_banner_last_shown', today);
    return true;
  }

  return false;
});

// CSS класс баннера
const bannerClass = computed(() => {
  return userStore.trialActive ? 'trial-active' : 'trial-available';
});

// Склонение слова "день"
const daysWord = computed(() => {
  const days = userStore.trialDaysLeft;
  if (days === 1) return 'день';
  if (days >= 2 && days <= 4) return 'дня';
  return 'дней';
});

// Активировать trial
const activateTrial = async () => {
  isLoading.value = true;

  const success = await userStore.startTrial();

  if (success) {
    // Показываем успешный тост
    uiStore.showToast('🎉 Trial активирован! У вас 7 дней PRO доступа', 'success');

    // Перезагружаем лимиты (теперь они PRO)
    await settingsStore.loadUsageStats();
  } else {
    // Показываем ошибку
    uiStore.showToast('❌ Не удалось активировать trial', 'error');
  }

  isLoading.value = false;
};

// Перейти на страницу тарифов
const goToPricing = () => {
  router.push('/pricing');
};
</script>

<style scoped>
.trial-banner {
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 16px;
  border: 2px solid;
  transition: all 0.3s ease;
}

.trial-banner.trial-available {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border-color: #667eea;
}

.trial-banner.trial-active {
  background: linear-gradient(135deg, #f6ad5515 0%, #ed893615 100%);
  border-color: #f6ad55;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.banner-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.banner-text {
  flex: 1;
}

.banner-title {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--md);
  font-weight: 700;
  color: var(--text-head);
  margin-bottom: 4px;
}

.banner-subtitle {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  color: var(--text-base);
}

.banner-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.trial-available .banner-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.trial-available .banner-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.trial-active .banner-btn.upgrade {
  background: linear-gradient(135deg, #f6ad55 0%, #ed8936 100%);
  color: white;
}

.trial-active .banner-btn.upgrade:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(246, 173, 85, 0.4);
}

.banner-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.banner-btn:active:not(:disabled) {
  transform: translateY(0);
}

/* Адаптив */
@media (max-width: 768px) {
  .banner-content {
    flex-direction: column;
    text-align: center;
  }

  .banner-btn {
    width: 100%;
  }
}
</style>
