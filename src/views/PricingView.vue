<!-- src/views/PricingView.vue -->
<template>
  <div class="pricing-page">
    <!-- Header -->
    <header class="pricing-header">
      <div class="container">
        <router-link to="/dialogs" class="logo-link">
          <img class="logo" src="../assets/logo.svg" alt="LinguaFlow" />
          <h1 class="logo-title">Lingua Flow</h1>
        </router-link>

        <router-link to="/dialogs" class="btn btn-menu" :class="isDesktop ? 'w-250' : 'w-50'">
          <span class="material-symbols-outlined">arrow_back</span>
          <span v-if="isDesktop" class="btn-text">Назад к диалогам</span>
        </router-link>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <h1 class="hero-title">Выберите свой план</h1>
        <p class="hero-description">Начните бесплатно или получите полный доступ с PRO/PREMIUM</p>
      </div>
    </section>

    <!-- Pricing Cards -->
    <section class="pricing-cards">
      <div class="container">
        <div class="cards-grid">
          <PlanCard
            v-for="plan in plansArray"
            :key="plan.id"
            :plan="plan"
            :isCurrent="userStore.tier === plan.id"
            :isFeatured="plan.id === 'premium'"
            @select="handlePlanSelect"
          />
        </div>
      </div>
    </section>

    <!-- Comparison Table -->
    <section class="comparison-section">
      <div class="container">
        <h2 class="section-title">Сравнение планов</h2>
        <PricingTable :plans="plansArray" />
      </div>
    </section>

    <!-- Trial Info -->
    <section v-if="!userStore.trialUsed && userStore.tier === 'free'" class="trial-section">
      <div class="container">
        <div class="trial-card">
          <div class="trial-icon">🎁</div>
          <h2 class="trial-title">Попробуйте PRO бесплатно!</h2>
          <p class="trial-description">
            Активируйте 7-дневный trial и получите полный доступ ко всем PRO функциям. Без автоматического продления.
            Без привязки карты.
          </p>
          <button class="btn-trial" @click="activateTrial" :disabled="isActivating">
            <span v-if="!isActivating">🚀 Активировать</span>
            <span v-else>Активация...</span>
          </button>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="faq-section">
      <div class="container">
        <h2 class="section-title">Часто задаваемые вопросы</h2>
        <PricingFAQ />
      </div>
    </section>

    <!-- Footer -->
    <footer class="pricing-footer">
      <div class="container">
        <p class="footer-text">© 2025 LinguaFlow. Все права защищены.</p>
        <div class="footer-links">
          <router-link to="/dialogs">Главная</router-link>
          <router-link to="/profile">Профиль</router-link>
          <router-link to="/settings">Настройки</router-link>
        </div>
      </div>
    </footer>

    <!-- Plan Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="selectedPlan" class="modal-overlay" @click.self="closePlanModal">
          <div class="modal-container">
            <div class="modal-header">
              <h2 class="modal-title">{{ selectedPlan.name }}</h2>
              <button class="modal-close" @click="closePlanModal">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <PlanModal :plan="selectedPlan" />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useUiStore } from '../stores/uiStore';
import { useBreakpoint } from '../composables/useBreakpoint';
import PlanCard from '../components/PlanCard.vue';
import PlanModal from '../components/PlanModal.vue';
import PricingTable from '../components/PricingTable.vue';
import PricingFAQ from '../components/PricingFAQ.vue';
import { PLANS } from '../config/stripeConfig';

const router = useRouter();
const userStore = useUserStore();
const settingsStore = useSettingsStore();
const uiStore = useUiStore();

const { isDesktop } = useBreakpoint();
const isActivating = ref(false);
const selectedPlan = ref(null);

// ✅ Конвертируем объект PLANS в массив
const plansArray = computed(() => {
  if (Array.isArray(PLANS)) {
    return PLANS;
  }
  // Если PLANS это объект { free: {...}, pro: {...}, premium: {...} }
  return Object.values(PLANS);
});

// Активировать trial
const activateTrial = async () => {
  isActivating.value = true;

  const success = await userStore.startTrial();

  if (success) {
    uiStore.showToast('🎉 Trial активирован! У вас 7 дней PRO доступа', 'success');
    await settingsStore.loadUsageStats();

    // Перенаправляем на главную
    setTimeout(() => {
      router.push('/dialogs');
    }, 2000);
  } else {
    uiStore.showToast('❌ Не удалось активировать trial', 'error');
  }

  isActivating.value = false;
};

// ✅ Обработка клика на "Детали" в PlanCard
const handlePlanSelect = (planId) => {
  // Находим план из массива
  const plan = plansArray.value.find((p) => p.id === planId);
  if (plan) {
    selectedPlan.value = plan;
  }
};

// Закрыть модалку
const closePlanModal = () => {
  selectedPlan.value = null;
};
</script>

<style scoped>
/* ============================================= */
/* BASE STYLES */
/* ============================================= */
.pricing-page {
  min-height: 100vh;
  background: var(--bg-main);
  color: var(--text-base);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

/* ============================================= */
/* HEADER */
/* ============================================= */
.pricing-header {
  background: var(--bg-side);
  border-bottom: 1px solid var(--border);
  padding: 16px 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.pricing-header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.logo {
  height: 40px;
}

.logo-title {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--xl);
  font-weight: 700;
  color: var(--text-head);
  margin: 0;
}

/* ============================================= */
/* HERO SECTION */
/* ============================================= */
.hero-section {
  padding: 64px 0 32px;
  text-align: center;
}

.hero-title {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: 3rem;
  font-weight: 700;
  color: var(--text-head);
  margin: 0 0 16px;
}

.hero-description {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--lg);
  color: var(--text-base);
}

/* ============================================= */
/* PRICING CARDS */
/* ============================================= */
.pricing-cards {
  padding: 32px 0 64px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

/* ============================================= */
/* COMPARISON TABLE */
/* ============================================= */
.comparison-section {
  padding: 64px 0;
  background: var(--bg-side);
}

.section-title {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-head);
  text-align: center;
  margin: 0 0 48px;
}

/* ============================================= */
/* TRIAL SECTION */
/* ============================================= */
.trial-section {
  padding: 64px 0;
}

.trial-card {
  max-width: 600px;
  margin: 0 auto;
  padding: 48px 32px;
  background: var(--bg-side);
  border: 2px solid #667eea;
  border-radius: 16px;
  text-align: center;
}

.trial-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.trial-title {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-head);
  margin: 0 0 16px;
}

.trial-description {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--md);
  color: var(--text-base);
  line-height: 1.6;
  margin: 0 0 24px;
}

.btn-trial {
  padding: 16px 48px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-trial:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.btn-trial:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ============================================= */
/* FAQ SECTION */
/* ============================================= */
.faq-section {
  padding: 64px 0;
  background: var(--bg-side);
}

/* ============================================= */
/* FOOTER */
/* ============================================= */
.pricing-footer {
  padding: 32px 0;
  background: var(--bg-main);
  border-top: 1px solid var(--border);
}

.pricing-footer .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.footer-text {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  color: var(--text-title);
  margin: 0;
}

.footer-links {
  display: flex;
  gap: 24px;
}

.footer-links a {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  color: var(--text-base);
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: var(--text-head);
}

/* ============================================= */
/* MODAL */
/* ============================================= */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-container {
  background: var(--bg-card);
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  padding: var(--space-md);
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px;
  border-bottom: 1px solid var(--border);
}

.modal-title {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--xl);
  font-weight: 700;
  color: var(--text-head);
  margin: 0;
  text-transform: uppercase;
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-base);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: var(--bg-main);
  color: var(--text-head);
}

.modal-close .material-symbols-outlined {
  font-size: 1.5rem;
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}

/* ============================================= */
/* RESPONSIVE */
/* ============================================= */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-description {
    font-size: var(--md);
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }

  .trial-card {
    padding: 32px 20px;
  }

  .pricing-footer .container {
    flex-direction: column;
    text-align: center;
  }

  .section-title {
    font-size: 1.5rem;
  }
}
</style>
