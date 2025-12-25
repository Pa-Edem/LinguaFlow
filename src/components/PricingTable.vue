<!-- src/components/PricingTable.vue -->
<template>
  <div class="pricing-table">
    <div class="table-wrapper">
      <table class="table">
        <!-- Header -->
        <thead>
          <tr>
            <th class="feature-col">Функции</th>
            <th class="plan-col">FREE</th>
            <th class="plan-col pro">PRO</th>
            <th class="plan-col premium">PREMIUM</th>
          </tr>
        </thead>

        <!-- Body -->
        <tbody>
          <!-- Цена -->
          <tr>
            <td class="feature-name">
              <div class="feature-title">Стоимость оплаты</div>
              <div class="feature-desc">за месяц / за год</div>
            </td>
            <td class="value">бесплатно</td>
            <td class="value">€4,99</td>
            <td class="value">€9,99<br />€99,99</td>
          </tr>

          <!-- Генерация диалогов -->
          <tr>
            <td class="feature-name">
              <div class="feature-title">Генерация диалогов</div>
              <div class="feature-desc">Сколько диалогов можно создать</div>
            </td>
            <td class="value">2 в день<br /><small>(10 в неделю)</small></td>
            <td class="value">10 в день<br /><small>(50 в неделю)</small></td>
            <td class="value highlight">♾️ Безлимит</td>
          </tr>

          <!-- Хранилище -->
          <tr>
            <td class="feature-name">
              <div class="feature-title">Хранилище диалогов</div>
              <div class="feature-desc">Максимум сохранённых диалогов</div>
            </td>
            <td class="value">10 диалогов</td>
            <td class="value">50 диалогов</td>
            <td class="value highlight">♾️ Безлимит</td>
          </tr>

          <!-- Уровни сложности -->
          <tr>
            <td class="feature-name">
              <div class="feature-title">Уровни сложности</div>
              <div class="feature-desc">Доступные языковые уровни</div>
            </td>
            <td class="value">A1 - B1.2<br /><small>(5 уровней)</small></td>
            <td class="value">A1 - C2<br /><small>(все 10 уровней)</small></td>
            <td class="value highlight">A1 - C2<br /><small>(все 10 уровней)</small></td>
          </tr>

          <!-- Тренировки -->
          <tr>
            <td class="feature-name">
              <div class="feature-title">PRO-тренировки</div>
              <div class="feature-desc">Аудирование, произношение</div>
            </td>
            <td class="value">4 в день<br /><small>(20 в неделю)</small></td>
            <td class="value">10 в день<br /><small>(50 в неделю)</small></td>
            <td class="value highlight">♾️ Безлимит</td>
          </tr>

          <!-- AI-анализ -->
          <tr>
            <td class="feature-name">
              <div class="feature-title">AI-анализ диалогов</div>
              <div class="feature-desc">Умный анализ ваших ошибок</div>
            </td>
            <td class="value">❌</td>
            <td class="value">✅ Доступен</td>
            <td class="value highlight">✅ Безлимит</td>
          </tr>

          <!-- Расширенная статистика -->
          <tr>
            <td class="feature-name">
              <div class="feature-title">Расширенная статистика</div>
              <div class="feature-desc">Детальная аналитика прогресса</div>
            </td>
            <td class="value">Базовая</td>
            <td class="value">✅ Полная</td>
            <td class="value highlight">✅ Полная</td>
          </tr>

          <!-- Поддержка -->
          <tr>
            <td class="feature-name">
              <div class="feature-title">Поддержка</div>
              <div class="feature-desc">Скорость ответа на вопросы</div>
            </td>
            <td class="value">Email<br /><small>(48 часов)</small></td>
            <td class="value">Email<br /><small>(24 часа)</small></td>
            <td class="value highlight">Приоритетная<br /><small>(12 часов)</small></td>
          </tr>

          <!-- Экспорт данных -->
          <tr>
            <td class="feature-name">
              <div class="feature-title">Экспорт данных</div>
              <div class="feature-desc">Скачивание диалогов и статистики</div>
            </td>
            <td class="value">❌</td>
            <td class="value">✅ Доступен</td>
            <td class="value highlight">✅ Доступен</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  plans: {
    type: Array,
    required: true,
  },
});
</script>

<style scoped>
.pricing-table {
  width: 100%;
  overflow-x: auto;
}

.table-wrapper {
  min-width: 100%;
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-main);
  border-radius: 12px;
  overflow: hidden;
}

/* ============================================= */
/* HEADER */
/* ============================================= */
thead {
  background: var(--bg-side);
  border-bottom: 2px solid var(--border);
}

thead th {
  padding: 20px 16px;
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--md);
  font-weight: 700;
  color: var(--text-head);
  text-align: center;
}

.feature-col {
  text-align: left !important;
  width: 40%;
}

.plan-col {
  width: 20%;
}

.plan-col.pro {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
}

.plan-col.premium {
  background: linear-gradient(135deg, #f6ad5515 0%, #ed893615 100%);
}

/* ============================================= */
/* BODY */
/* ============================================= */
tbody tr {
  border-bottom: 1px solid var(--border);
  transition: background 0.2s ease;
}

tbody tr:hover {
  background: var(--bg-side);
}

tbody td {
  padding: 20px 16px;
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  color: var(--text-base);
  text-align: center;
  vertical-align: middle;
}

.feature-name {
  text-align: left !important;
}

.feature-title {
  font-size: var(--md);
  font-weight: 600;
  color: var(--text-head);
  margin-bottom: 4px;
}

.feature-desc {
  font-size: var(--xs);
  color: var(--text-title);
}

.value {
  font-size: var(--md);
  font-weight: 500;
  line-height: 1.6;
}

.value small {
  font-size: var(--xs);
  color: var(--text-title);
}

.value.highlight {
  color: #ed8936;
  font-weight: 700;
}

/* ============================================= */
/* RESPONSIVE */
/* ============================================= */
@media (max-width: 768px) {
  .table {
    font-size: var(--xs);
  }

  thead th,
  tbody td {
    padding: 12px 8px;
  }

  .feature-col {
    width: 30%;
  }

  .plan-col {
    width: 20%;
  }

  .feature-title {
    font-size: var(--sm);
  }

  .feature-desc {
    font-size: var(--xxs);
  }

  .value {
    font-size: var(--sm);
  }
}

@media (max-width: 480px) {
  .table-wrapper {
    overflow-x: scroll;
  }

  .table {
    min-width: 480px;
  }
  .feature-col {
    width: 25%;
  }

  .plan-col {
    width: 20%;
  }
}
</style>
