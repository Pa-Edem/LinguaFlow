<!-- src/components/stats/TrainingHistory.vue -->
<template>
  <div class="training-history">
    <h2>📚 {{ $t('stats.trainingHistory') }}</h2>

    <div class="history-placeholder">
      <div class="history-icon">📋</div>
      <p>{{ $t('stats.history.historyComingSoon') }}</p>
      <p class="history-hint">{{ $t('stats.historyHint') }}</p>
    </div>
  </div>
</template>

<script setup>
// TODO: Загружать историю тренировок из Firestore
// Показывать последние 10 тренировок с датой, диалогом, точностью
</script>

<style scoped>
.training-history {
  background-color: var(--card);
  border-radius: 12px;
  padding: 24px;
}

h2 {
  font-size: var(--lg);
  font-weight: 600;
  color: var(--text-head);
  margin: 0 0 20px 0;
}

.history-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background-color: var(--bg);
  border: 2px dashed var(--g2);
  border-radius: 8px;
  text-align: center;
}

.history-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

p {
  font-size: var(--base);
  color: var(--text-body);
  margin: 0;
}

.history-hint {
  font-size: var(--sm);
  color: var(--text-muted);
  margin-top: 8px;
}

/* Адаптивность */
@media (max-width: 768px) {
  .training-history {
    padding: 16px;
  }

  h2 {
    font-size: var(--md);
  }

  .history-placeholder {
    padding: 40px 16px;
  }

  .history-icon {
    font-size: 48px;
  }
}
</style>
