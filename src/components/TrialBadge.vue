<!-- src/components/TrialBadge.vue -->
<template>
  <div v-if="userStore.isOnTrial" class="trial-badge-container">
    <div class="trial-badge" :class="badgeClass">
      <span class="trial-icon">🎁</span>
      <span class="trial-label">TRIAL</span>
      <span class="trial-days">{{ daysText }}</span>
    </div>

    <!-- Предупреждение за 1 день -->
    <div v-if="userStore.trialDaysLeft === 1" class="trial-warning">
      <span class="material-symbols-outlined">schedule</span>
      <span class="trial-warning-text">Trial заканчивается завтра! </span>
      <router-link to="/pricing" class="trial-warning-link">Купить PRO</router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useUserStore } from '../stores/userStore';

const userStore = useUserStore();

// Текст с количеством дней
const daysText = computed(() => {
  const days = userStore.trialDaysLeft;
  if (days === 0) return 'Последний день';
  if (days === 1) return '1 день';
  if (days >= 2 && days <= 4) return `${days} дня`;
  return `${days} дней`;
});

// CSS класс для цвета (красный если < 2 дней)
const badgeClass = computed(() => {
  const days = userStore.trialDaysLeft;
  if (days <= 1) return 'trial-badge--urgent';
  if (days <= 3) return 'trial-badge--warning';
  return 'trial-badge--active';
});
</script>

<style scoped>
.trial-badge-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ========================================= */
/* БЕЙДЖ */
/* ========================================= */
.trial-badge {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.trial-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

/* Цвета в зависимости от оставшихся дней */
.trial-badge--active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.trial-badge--warning {
  background: linear-gradient(135deg, #f6ad55 0%, #ed8936 100%);
}

.trial-badge--urgent {
  background: linear-gradient(135deg, #fc8181 0%, #f56565 100%);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 4px 12px rgba(252, 129, 129, 0.3);
  }
  50% {
    box-shadow: 0 6px 20px rgba(252, 129, 129, 0.6);
  }
}

/* Иконка */
.trial-icon {
  font-size: 1.25rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

/* Информация */
.trial-label {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--lg);
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.trial-days {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--lg);
  font-weight: 700;
  color: white;
}

/* ========================================= */
/* ПРЕДУПРЕЖДЕНИЕ */
/* ========================================= */
.trial-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #fed7d7;
  border: 1px solid #fc8181;
  border-radius: 8px;
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  color: #c53030;
}

.trial-warning .material-symbols-outlined {
  font-size: 1.25rem;
  color: #c53030;
}

.trial-warning-text {
  flex: 1;
  font-weight: 600;
}

.trial-warning-link {
  color: #c53030;
  font-weight: 700;
  text-decoration: none;
  border-bottom: 2px solid #c53030;
  transition: all 0.2s ease;
}

.trial-warning-link:hover {
  color: #9b2c2c;
  border-bottom-color: #9b2c2c;
}

/* ========================================= */
/* АДАПТИВ */
/* ========================================= */
@media (max-width: 768px) {
  .trial-badge {
    padding: 10px 12px;
    gap: 10px;
  }

  .trial-icon {
    font-size: 1.5rem;
  }

  .trial-days {
    font-size: var(--md);
  }

  .trial-warning {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .trial-warning-text {
    flex: none;
  }
}
</style>
