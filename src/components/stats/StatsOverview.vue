<!-- src/components/stats/StatsOverview.vue -->
<template>
  <div class="stats-overview">
    <h2>{{ $t('stats.overview') }}</h2>

    <!-- Статистика тренировок (PRO + PREMIUM) -->
    <div v-if="tier === 'pro' || tier === 'premium'" class="training-stats">
      <h3>Выучено диалогов</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-label">{{ $t('stats.completedDialogs') }}</div>
            <div class="stat-value-large">{{ stats.dialogsLearned || 0 }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📈</div>
          <div class="stat-content">
            <div class="stat-label">{{ $t('stats.averageAccuracy') }}</div>
            <div class="stat-value-large">{{ formatAccuracy(stats.globalAverageAccuracy) }}%</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-content">
            <div class="stat-label">{{ $t('stats.totalTrainings') }}</div>
            <div class="stat-value-large">{{ stats.trainingsCompleted || 0 }}</div>
          </div>
        </div>
      </div>

      <!-- Расширенная статистика (только PREMIUM) -->
      <div v-if="tier === 'premium'" class="extended-stats">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">🔥</div>
            <div class="stat-content">
              <div class="stat-label">{{ $t('stats.currentStreak') }}</div>
              <div class="stat-value">{{ stats.currentStreak || 0 }} {{ $t('stats.days') }}</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-content">
              <div class="stat-label">{{ $t('stats.longestStreak') }}</div>
              <div class="stat-value">{{ stats.longestStreak || 0 }} {{ $t('stats.days') }}</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">📅</div>
            <div class="stat-content">
              <div class="stat-label">{{ $t('stats.lastActivity') }}</div>
              <div class="stat-value">{{ formatDate(stats.lastActivityDate) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useUserStore } from '../../stores/userStore';

const props = defineProps({
  tier: {
    type: String,
    required: true,
    validator: (value) => ['free', 'pro', 'premium'].includes(value),
  },
});

const userStore = useUserStore();

const stats = computed(() => userStore.stats || {});

// Форматирование
function formatAccuracy(value) {
  if (!value) return '0.0';
  return typeof value === 'number' ? value.toFixed(1) : '0.0';
}

function formatDate(dateString) {
  if (!dateString) return '—';

  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Сегодня';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Вчера';
  } else {
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  }
}
</script>

<style scoped>
.stats-overview {
  background-color: var(--card);
  border-radius: 12px;
  padding: 24px;
}
h2 {
  text-align: center;
  font-size: var(--lg);
  margin: 0 0 20px 0;
}
h3 {
  font-size: var(--md);
  margin: 32px 0 16px 0;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}
.stat-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  transition: transform 0.2s, box-shadow 0.2s;
}
.stat-card:hover {
  transform: translateY(-2px);
  border-color: var(--bb);
  box-shadow: 0 4px 12px var(--shadow);
}

.stat-icon {
  font-size: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: var(--sm);
  color: var(--text-muted);
  margin-bottom: 6px;
  font-weight: 500;
}

.stat-value {
  font-size: var(--md);
  font-weight: 600;
  color: var(--text-head);
}

.stat-subvalue {
  font-size: var(--sm);
  color: var(--text-muted);
  margin-top: 2px;
}

.stat-value-large {
  font-size: var(--xl);
  font-weight: 700;
  color: var(--text-head);
}

.stat-progress {
  margin-top: 8px;
  height: 6px;
  background-color: var(--g1);
  border-radius: 3px;
  overflow: hidden;
}

.stat-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--accent));
  border-radius: 3px;
  transition: width 0.3s ease;
}

.training-stats {
  margin-top: 24px;
}

.extended-stats {
  margin-top: 16px;
}

/* Адаптивность */
@media (max-width: 768px) {
  .stats-overview {
    padding: 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-icon {
    font-size: 24px;
    min-width: 24px;
  }

  .stat-value-large {
    font-size: var(--lg);
  }
}
</style>
