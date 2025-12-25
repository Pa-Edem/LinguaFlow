<!-- src/components/stats/AchievementCard.vue -->
<template>
  <div class="achievement-card" :class="{ unlocked, locked: !unlocked }">
    <div class="achievement-icon">{{ getIcon(achievement.title) }}</div>

    <div class="achievement-content">
      <h4>{{ cleanTitle(achievement.title) }}</h4>
      <p>{{ achievement.message }}</p>

      <!-- Прогресс (для заблокированных) -->
      <div v-if="!unlocked && achievement.progress < 100" class="achievement-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: achievement.progress + '%' }"></div>
        </div>
        <div class="progress-text">{{ achievement.currentValue }} / {{ achievement.threshold }}</div>
      </div>

      <!-- Дата разблокировки (для разблокированных) -->
      <div v-if="unlocked && achievement.unlockedAt" class="achievement-date">
        {{ formatDate(achievement.unlockedAt) }}
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  achievement: {
    type: Object,
    required: true,
  },
  unlocked: {
    type: Boolean,
    default: false,
  },
});

// Извлечь эмодзи из заголовка
function getIcon(title) {
  const match = title.match(/🏆|🔥|📚|🎯|⭐|✅|📈|💯|🥇|🥈|🥉/);
  return match ? match[0] : '🏆';
}

// Убрать эмодзи из заголовка
function cleanTitle(title) {
  return title.replace(/🏆|🔥|📚|🎯|⭐|✅|📈|💯|🥇|🥈|🥉/g, '').trim();
}

// Форматировать дату
function formatDate(dateValue) {
  if (!dateValue) return '';

  // Проверяем тип даты (может быть строка или Timestamp)
  let date;
  if (typeof dateValue === 'string') {
    date = new Date(dateValue);
  } else if (dateValue.toDate) {
    // Firestore Timestamp
    date = dateValue.toDate();
  } else if (dateValue instanceof Date) {
    date = dateValue;
  } else {
    return '';
  }

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
</script>

<style scoped>
.achievement-card {
  background-color: var(--bg);
  border: 2px solid var(--g1);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  gap: 12px;
  transition: all 0.3s ease;
}

.achievement-card.unlocked {
  border-color: var(--accent);
  background: linear-gradient(135deg, var(--accent-light) 0%, var(--bg) 100%);
  animation: unlock 0.5s ease;
}

.achievement-card.locked {
  opacity: 0.6;
  filter: grayscale(50%);
}

@keyframes unlock {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.achievement-icon {
  font-size: 48px;
  line-height: 1;
  flex-shrink: 0;
}

.achievement-content {
  flex: 1;
  min-width: 0;
}

h4 {
  font-size: var(--base);
  font-weight: 600;
  color: var(--text-head);
  margin: 0 0 4px 0;
}

p {
  font-size: var(--sm);
  color: var(--text-body);
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.achievement-progress {
  margin-top: 8px;
}

.progress-bar {
  height: 6px;
  background-color: var(--g1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
}

.progress-fill {
  height: 100%;
  background-color: var(--accent);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: var(--xs);
  color: var(--text-body);
  text-align: right;
}

.achievement-date {
  font-size: var(--xs);
  color: var(--accent);
  font-weight: 500;
  margin-top: 8px;
}

/* Адаптивность */
@media (max-width: 768px) {
  .achievement-card {
    padding: 12px;
  }

  .achievement-icon {
    font-size: 40px;
  }

  h4 {
    font-size: var(--sm);
  }

  p {
    font-size: var(--xs);
  }
}
</style>
