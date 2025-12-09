<!-- src/components/PlanCard.vue -->
<template>
  <div class="plan-card" :class="{ current: isCurrent }">
    <!-- Бейдж "Текущий" -->
    <div v-if="isCurrent" class="current-badge">Активен</div>

    <!-- Иконка и название -->
    <div class="plan-header">
      <span class="material-symbols-outlined plan-icon" :class="planIconClass">{{ planIcon }}</span>
      <div class="plan-name">{{ plan.name }}</div>
    </div>

    <!-- Цена -->
    <div class="plan-price">
      <template v-if="plan.price.monthly === 0">
        <div class="price-amount">Бесплатно</div>
      </template>
      <template v-else>
        <div class="price-amount">
          {{ plan.currency }}{{ plan.price.monthly }}
          <span class="price-period">/мес</span>
        </div>
        <div v-if="plan.price.yearly" class="price-amount">
          <span class="material-symbols-outlined or">arrow_range</span>
          {{ plan.currency }}{{ plan.price.yearly }}
          <span class="price-period">/год</span>
          <span class="price-discount">(-{{ discount }}%)</span>
        </div>
      </template>
    </div>

    <!-- Основные фичи (первые 3) -->
    <div class="plan-features">
      <div v-for="(feature, index) in topFeatures" :key="index" class="feature-item">
        <span class="feature-icon">•</span>
        <span class="feature-text">{{ feature }}</span>
      </div>
    </div>

    <!-- Кнопка -->
    <button class="btn mx-auto" :class="buttonClass" @click="handleClick" :disabled="isCurrent && !canManage">
      <span class="material-symbols-outlined" v-if="buttonIcon">{{ buttonIcon }}</span>
      {{ buttonText }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useUserStore } from '../stores/userStore';
import { useBreakpoint } from '../composables/useBreakpoint';
import { calculateYearlyDiscount } from '../config/stripeConfig';

const props = defineProps({
  plan: {
    type: Object,
    required: true,
  },
  isCurrent: {
    type: Boolean,
    default: false,
  },
});

const userStore = useUserStore();
const { isDesktop } = useBreakpoint();
const emit = defineEmits(['select']);

// ✅ Иконка для плана (FREE, PRO, PREMIUM)
const planIcon = computed(() => {
  switch (props.plan.id) {
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
  switch (props.plan.id) {
    case 'premium':
      return 'premium-icon';
    case 'pro':
      return 'pro-icon';
    case 'free':
    default:
      return 'free-icon';
  }
});

// Первые 3 фичи для краткого отображения
const topFeatures = computed(() => {
  return props.plan.features.slice(0, 3);
});

// Рассчитать скидку для годового плана
const discount = computed(() => {
  if (!props.plan.price.yearly) return 0;
  return calculateYearlyDiscount(props.plan.price.monthly, props.plan.price.yearly);
});

// Проверяем наличие реальной Stripe подписки
const hasStripeSubscription = computed(() => {
  // Manual override или trial → НЕТ Stripe подписки
  if (userStore.manualPro || userStore.manualPremium || userStore.trialActive) {
    return false;
  }

  // Если tier = 'pro' или 'premium' и НЕТ manual/trial → ЕСТЬ Stripe подписка
  return userStore.tier === 'pro' || userStore.tier === 'premium';
});

// Текст кнопки
const buttonText = computed(() => {
  if (props.isCurrent) {
    // FREE план → всегда "Детали"
    if (props.plan.id === 'free') {
      return 'Детали';
    }

    // PRO/PREMIUM с реальной Stripe подпиской → "Управление подпиской"
    if (hasStripeSubscription.value) {
      return 'Управление подпиской';
    }

    // Manual/Trial → "Детали"
    return 'Детали';
  }

  // Не текущий план → всегда "Детали"
  return 'Детали';
});

// Иконка кнопки
const buttonIcon = computed(() => {
  if (props.isCurrent && hasStripeSubscription.value) {
    return 'settings'; // Иконка "настройки" только для Stripe подписки
  }
  return 'info';
});

// CSS класс кнопки
const buttonClass = computed(() => {
  if (!isDesktop.value) {
    return props.isCurrent ? 'btn-current mobile' : 'btn-upgrade mobile';
  } else {
    return props.isCurrent ? 'btn-current' : 'btn-upgrade';
  }
});

// Можно ли управлять подпиской
const canManage = computed(() => {
  // Управлять можно только если есть реальная Stripe подписка
  return hasStripeSubscription.value;
});

// Обработчик клика
const handleClick = () => {
  emit('select', props.plan.id);
};
</script>

<style scoped>
/* MOBILES (767px and down) */
.plan-card {
  position: relative;
  background: var(--y0);
  border: 2px solid var(--border);
  border-radius: var(--xs);
  padding: var(--md);
  display: flex;
  flex-direction: column;
  gap: var(--xs);
  transition: all 0.3s ease;
}
.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}
.plan-card.current {
  border-color: var(--g3);
}
.current-badge {
  position: absolute;
  top: var(--md);
  right: var(--md);
  padding: 4px 12px;
  background: var(--g3);
  color: white;
  border-radius: var(--xxs);
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--xs);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.plan-header {
  display: flex;
  text-align: center;
}
.plan-icon {
  font-size: var(--xxxl);
}
.plan-header .free-icon {
  color: var(--text-head);
}
.plan-header .pro-icon,
.plan-header .pro-icon ~ .plan-name {
  color: var(--purple-5);
}
.plan-header .premium-icon,
.plan-header .premium-icon ~ .plan-name {
  color: var(--gold-4);
}
.plan-name {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--xxl);
  font-weight: 700;
  color: var(--text-head);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-left: var(--xs);
}
.plan-price {
  display: flex;
  justify-content: center;
  align-items: center;
}
.price-amount {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--xl);
  font-weight: 700;
  color: var(--text-head);
}
.or {
  margin: 0 var(--xxs);
  font-size: var(--md);
  font-weight: normal;
}
.price-period {
  font-size: var(--sm);
  font-weight: 400;
  color: var(--text-title);
}
.price-discount {
  margin-left: var(--xxs);
  color: var(--g3);
  font-weight: 700;
}
.plan-features {
  flex: 1;
  margin-bottom: var(--xxs);
}
.feature-item {
  display: flex;
  align-items: flex-start;
  gap: var(--xxs);
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--md);
  color: var(--text-base);
}
.feature-icon {
  color: var(--g2);
  font-size: var(--md);
  font-weight: 700;
  flex-shrink: 0;
}
.feature-text {
  line-height: 1.4;
}
.btn-current {
  background: var(--bg-main);
  color: var(--text-head);
  border: 1px solid var(--border);
}
.btn-current:hover:not(:disabled) {
  background: var(--border);
}
.btn-upgrade {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 1px solid var(--blue-3);
  color: white;
}
.btn-upgrade:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
/* TABLETS (768px and up) */
@media (min-width: 768px) {
  .plan-card {
    min-height: 320px;
  }
  .plan-price {
    min-height: 70px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .price-amount,
  .or {
    display: block;
    width: 100%;
    margin: 0 auto;
    text-align: center;
  }
}
/* DESKTOPS (1200px and up) */
@media (min-width: 1200px) {
  .plan-price {
    min-height: 100px;
  }
}
</style>
