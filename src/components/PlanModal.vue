<!-- src/components/PlanModal.vue -->
<template>
  <div class="plan-modal-content">
    <!-- Цена и переключатель monthly/yearly -->
    <div v-if="plan.id !== 'free'" class="pricing-section">
      <div v-if="hasYearlyPlan" class="billing-toggle">
        <button
          class="toggle-btn"
          :class="{ active: billingInterval === 'monthly' }"
          @click="billingInterval = 'monthly'"
        >
          Ежемесячно
        </button>
        <button
          class="toggle-btn"
          :class="{ active: billingInterval === 'yearly' }"
          @click="billingInterval = 'yearly'"
        >
          Ежегодно
          <span class="discount-badge">-{{ yearlyDiscount }}%</span>
        </button>
      </div>

      <div class="price-display">
        <div class="price-main">
          {{ plan.currency }}{{ selectedPrice }}
          <span class="price-period">/ {{ billingInterval === 'monthly' ? 'месяц' : 'год' }}</span>
        </div>
        <div v-if="billingInterval === 'yearly'" class="price-breakdown">
          {{ plan.currency }}{{ monthlyEquivalent }}/месяц при оплате за год
        </div>
      </div>
    </div>

    <!-- FREE план - информация -->
    <div v-else class="free-info">
      <p class="free-description">Ваш текущий план</p>
    </div>

    <!-- Список всех фич -->
    <div class="features-section">
      <div class="features-title">Что включено:</div>
      <div class="features-list">
        <div v-for="(feature, index) in plan.features" :key="index" class="feature-item">
          <span class="feature-check">✓</span>
          <span class="feature-text">{{ feature }}</span>
        </div>
      </div>
    </div>

    <!-- Кнопка действия -->
    <div class="action-section">
      <!-- FREE план -->
      <template v-if="plan.id === 'free'">
        <p class="upgrade-hint">Хотите больше? Обновитесь до PRO или PREMIUM!</p>
      </template>

      <!-- PRO или PREMIUM -->
      <template v-else>
        <!-- Если это текущий план -->
        <template v-if="isCurrentPlan">
          <button class="action-btn btn-manage" @click="manageSubscription" :disabled="isLoading">
            <span v-if="!isLoading" class="material-symbols-outlined">settings</span>
            <span v-if="isLoading">Загрузка...</span>
            <span v-else>Управление подпиской</span>
          </button>
          <p class="manage-hint">Измените план или отмените подписку в Customer Portal</p>
        </template>

        <!-- Если не текущий план -->
        <template v-else>
          <button class="action-btn btn-checkout" @click="goToCheckout" :disabled="isLoading">
            <span v-if="!isLoading" class="material-symbols-outlined">arrow_forward</span>
            <span v-if="isLoading">Создание сессии...</span>
            <span v-else>Перейти к оплате</span>
          </button>
          <p class="checkout-hint">Безопасная оплата через Stripe</p>
        </template>
      </template>
    </div>

    <!-- Ошибка -->
    <div v-if="error" class="error-message">
      <span class="material-symbols-outlined">error</span>
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
// import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import { useUiStore } from '../stores/uiStore';
import { getPriceId, calculateYearlyDiscount } from '../config/stripeConfig';
import { doc, collection, addDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const props = defineProps({
  plan: {
    type: Object,
    required: true,
  },
});

// const router = useRouter();
const userStore = useUserStore();
const uiStore = useUiStore();

const billingInterval = ref('monthly');
const isLoading = ref(false);
const error = ref('');

// Есть ли годовой план
const hasYearlyPlan = computed(() => {
  return props.plan.price?.yearly && props.plan.priceIds?.yearly;
});

// Текущая выбранная цена
const selectedPrice = computed(() => {
  return billingInterval.value === 'yearly' ? props.plan.price.yearly : props.plan.price.monthly;
});

// Эквивалент в месяц для годового плана
const monthlyEquivalent = computed(() => {
  if (billingInterval.value !== 'yearly') return 0;
  return (props.plan.price.yearly / 12).toFixed(2);
});

// Скидка для годового плана
const yearlyDiscount = computed(() => {
  if (!hasYearlyPlan.value) return 0;
  return calculateYearlyDiscount(props.plan.price.monthly, props.plan.price.yearly);
});

// Является ли текущим планом
const isCurrentPlan = computed(() => {
  return userStore.tier === props.plan.id;
});

// Перейти к оплате (Stripe Checkout)
async function goToCheckout() {
  if (!userStore.user) {
    uiStore.showToast('Пожалуйста, авторизуйтесь', 'warning');
    return;
  }

  isLoading.value = true;
  error.value = '';

  try {
    // Получаем Price ID
    const priceId = getPriceId(props.plan.id, billingInterval.value);
    if (!priceId) {
      throw new Error('Price ID не найден');
    }

    // Создаём Checkout Session в Firestore
    const checkoutSessionRef = collection(doc(db, 'customers', userStore.user.uid), 'checkout_sessions');

    const sessionDoc = await addDoc(checkoutSessionRef, {
      price: priceId,
      success_url: `${window.location.origin}/profile?success=true`,
      cancel_url: `${window.location.origin}/profile?canceled=true`,
      mode: 'subscription',
      allow_promotion_codes: true, // Разрешить промо-коды в Stripe Checkout
    });

    // Слушаем изменения документа (Extension добавит URL)
    const unsubscribe = onSnapshot(sessionDoc, (snap) => {
      const data = snap.data();

      if (data?.error) {
        error.value = data.error.message;
        isLoading.value = false;
        unsubscribe();
      }

      if (data?.url) {
        // Redirect на Stripe Checkout
        window.location.assign(data.url);
        unsubscribe();
      }
    });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    error.value = err.message || 'Ошибка создания сессии оплаты';
    isLoading.value = false;
    uiStore.showToast('Ошибка при создании сессии оплаты', 'error');
  }
}

// Управление подпиской (Customer Portal)
async function manageSubscription() {
  if (!userStore.user) {
    uiStore.showToast('Пожалуйста, авторизуйтесь', 'warning');
    return;
  }

  isLoading.value = true;
  error.value = '';

  try {
    // Создаём portal session в Firestore
    const portalSessionRef = collection(doc(db, 'customers', userStore.user.uid), 'checkout_sessions');

    const sessionDoc = await addDoc(portalSessionRef, {
      returnUrl: `${window.location.origin}/profile`,
      locale: 'auto',
    });

    // Слушаем изменения документа (Extension добавит URL портала)
    const unsubscribe = onSnapshot(sessionDoc, (snap) => {
      const data = snap.data();

      if (data?.error) {
        error.value = data.error.message;
        isLoading.value = false;
        unsubscribe();
      }

      if (data?.url) {
        // Redirect на Customer Portal
        window.location.assign(data.url);
        unsubscribe();
      }
    });
  } catch (err) {
    console.error('Error creating portal session:', err);
    error.value = err.message || 'Ошибка создания портала';
    isLoading.value = false;
    uiStore.showToast('Ошибка при открытии портала управления', 'error');
  }
}
</script>

<style scoped>
.plan-modal-content {
  padding: 0;
}

/* Секция с ценой */
.pricing-section {
  margin-bottom: 24px;
}

.billing-toggle {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  padding: 4px;
  background: var(--bg-main);
  border-radius: 8px;
}

.toggle-btn {
  flex: 1;
  padding: 10px 16px;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  font-weight: 600;
  color: var(--text-base);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.toggle-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.discount-badge {
  display: inline-block;
  margin-left: 6px;
  padding: 2px 6px;
  background: #48bb78;
  color: white;
  border-radius: 4px;
  font-size: 0.75em;
  font-weight: 700;
}

.price-display {
  text-align: center;
}

.price-main {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-head);
  margin-bottom: 4px;
}

.price-period {
  font-size: 1rem;
  font-weight: 400;
  color: var(--text-title);
}

.price-breakdown {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  color: var(--text-base);
}

/* FREE план */
.free-info {
  text-align: center;
  padding: 16px;
  background: var(--bg-side);
  border-radius: 8px;
  margin-bottom: 24px;
}

.free-description {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--md);
  color: var(--text-base);
  margin: 0;
}

/* Список фич */
.features-section {
  margin-bottom: 24px;
}

.features-title {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--md);
  font-weight: 700;
  color: var(--text-head);
  margin-bottom: 12px;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.feature-check {
  color: #48bb78;
  font-size: var(--lg);
  font-weight: 700;
  flex-shrink: 0;
  line-height: 1.4;
}

.feature-text {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  color: var(--text-base);
  line-height: 1.5;
}

/* Кнопки действий */
.action-section {
  text-align: center;
}

.action-btn {
  width: 100%;
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-checkout {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-checkout:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
}

.btn-manage {
  background: var(--bg-main);
  color: var(--text-head);
  border: 2px solid var(--border);
}

.btn-manage:hover:not(:disabled) {
  background: var(--border);
}

.action-btn:active:not(:disabled) {
  transform: translateY(0);
}

.upgrade-hint,
.manage-hint,
.checkout-hint {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--xxs);
  color: var(--text-title);
  margin: 0;
}

/* Ошибка */
.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #fed7d7;
  color: #c53030;
  border-radius: 8px;
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  margin-top: 16px;
}

.error-message .material-symbols-outlined {
  font-size: 1.25rem;
}
</style>
