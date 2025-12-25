<!-- src/components/stats/ProgressChart.vue -->
<template>
  <div class="progress-chart">
    <h2>📈 {{ $t('stats.progressChart') }}</h2>

    <div class="chart-placeholder">
      <div class="chart-icon">📊</div>
      <p>{{ $t('stats.chartComingSoon') }}</p>
      <p class="chart-hint">{{ $t('stats.chartHint') }}</p>
    </div>
  </div>
</template>

<script setup>
// TODO: Интегрировать библиотеку для графиков (Chart.js или Recharts)
// Показывать график точности по дням за последние 30 дней
</script>

<style scoped>
.progress-chart {
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

.chart-placeholder {
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

.chart-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

p {
  font-size: var(--base);
  color: var(--text-body);
  margin: 0;
}

.chart-hint {
  font-size: var(--sm);
  color: var(--text-muted);
  margin-top: 8px;
}

/* Адаптивность */
@media (max-width: 768px) {
  .progress-chart {
    padding: 16px;
  }

  h2 {
    font-size: var(--md);
  }

  .chart-placeholder {
    padding: 40px 16px;
  }

  .chart-icon {
    font-size: 48px;
  }
}
</style>
