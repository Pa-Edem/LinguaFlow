<!-- src/components/PlanCard.vue -->
<template>
  <div class="plan-card" :class="{ current: isCurrent, featured: isFeatured }">
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
        <div v-if="plan.price.yearly" class="price-yearly">
          или {{ plan.currency }}{{ plan.price.yearly }}/год
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
    <button class="plan-button" :class="buttonClass" @click="handleClick" :disabled="isCurrent && !canManage">
      <span class="material-symbols-outlined" v-if="buttonIcon">{{ buttonIcon }}</span>
      {{ buttonText }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
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
  isFeatured: {
    type: Boolean,
    default: false,
  },
});

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

// Текст кнопки
const buttonText = computed(() => {
  if (props.isCurrent) {
    return props.plan.id === 'free' ? 'Детали' : 'Управление подпиской';
  }
  return props.plan.id === 'free' ? 'Детали' : 'Детали';
});

// Иконка кнопки
const buttonIcon = computed(() => {
  if (props.isCurrent && props.plan.id !== 'free') return 'settings';
  return props.plan.id === 'free' ? 'info' : 'info';
});

// CSS класс кнопки
const buttonClass = computed(() => {
  if (props.isCurrent) return 'btn-current';
  if (props.isFeatured) return 'btn-featured';
  return 'btn-upgrade';
});

// Можно ли управлять подпиской
const canManage = computed(() => {
  return props.plan.id !== 'free';
});

// Обработчик клика
const handleClick = () => {
  emit('select', props.plan.id);
};
</script>

<style scoped>
.plan-card {
  position: relative;
  background: var(--bg-side);
  border: 2px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  min-height: 320px;
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

/* Текущий план */
.plan-card.current {
  border-color: #48bb78;
  background: linear-gradient(135deg, #48bb7810 0%, #38a16910 100%);
}

/* Featured план (PREMIUM) */
.plan-card.featured {
  border-color: #f6ad55;
  background: linear-gradient(135deg, #f6ad5510 0%, #ed893610 100%);
  box-shadow: 0 4px 16px rgba(246, 173, 85, 0.2);
}

/* Бейдж "Активен" */
.current-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  background: #48bb78;
  color: white;
  border-radius: 12px;
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--xxs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Хедер с иконкой */
.plan-header {
  text-align: center;
  margin-bottom: 16px;
}

.plan-icon {
  font-size: 3rem;
  margin-bottom: 8px;
}
.plan-header .free-icon {
  color: var(--text-head);
}
.plan-header .pro-icon {
  color: var(--g3);
}
.plan-header .premium-icon {
  color: var(--bg-pro);
}
.plan-name {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--lg);
  font-weight: 700;
  color: var(--text-head);
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Цена */
.plan-price {
  text-align: center;
  margin-bottom: 8px;
  min-height: 60px;
}

.price-amount {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--xl);
  font-weight: 700;
  color: var(--text-head);
  margin-bottom: 4px;
}

.price-period {
  font-size: var(--sm);
  font-weight: 400;
  color: var(--text-title);
}

.price-yearly {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--xxs);
  color: var(--text-base);
}

.price-discount {
  color: #48bb78;
  font-weight: 700;
}

/* Фичи */
.plan-features {
  flex: 1;
  margin-bottom: 8px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  color: var(--text-base);
}

.feature-icon {
  color: #48bb78;
  font-size: var(--md);
  font-weight: 700;
  flex-shrink: 0;
}

.feature-text {
  line-height: 1.4;
}

/* Кнопка */
.plan-button {
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.plan-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Кнопка для текущего плана */
.btn-current {
  background: var(--bg-main);
  color: var(--text-head);
  border: 1px solid var(--border);
}

.btn-current:hover:not(:disabled) {
  background: var(--border);
}

/* Кнопка для upgrade */
.btn-upgrade {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-upgrade:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Кнопка для featured плана */
.btn-featured {
  background: linear-gradient(135deg, #f6ad55 0%, #ed8936 100%);
  color: white;
}

.btn-featured:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(246, 173, 85, 0.4);
}

.plan-button:active:not(:disabled) {
  transform: translateY(0);
}

/* Адаптив */
@media (max-width: 768px) {
  .plan-card {
    min-height: auto;
  }
}
/* Mobile optimizations */
@media (max-width: 480px) {
  .plan-card {
    padding: 12px;
    min-height: auto;
  }
  .plan-icon {
    font-size: 2.5rem;
    margin: 0;
  }
}
</style>
