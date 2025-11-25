<!-- src/components/LimitsModal.vue -->
<template>
  <div class="limits-modal-content">
    <!-- Заголовок с тарифом -->
    <!-- <div class="modal-tier-badge">
      <span class="tier-label">Ваш тариф:</span>
      <span class="tier-badge" :class="userStore.tier">
        {{ userStore.tierName }}
      </span>
    </div> -->

    <!-- ✅ Для PREMIUM показываем специальное сообщение -->
    <div v-if="userStore.isPremium" class="premium-unlimited">
      <div class="premium-icon">👑</div>
      <div class="premium-title">PREMIUM - Безлимитный доступ</div>
      <div class="premium-description">
        У вас безлимитный доступ ко всем функциям приложения без каких-либо ограничений!
      </div>
      <div class="premium-features">
        <div class="premium-feature">✓ Безлимитная генерация диалогов</div>
        <div class="premium-feature">✓ Безлимитное хранилище</div>
        <div class="premium-feature">✓ Все тренировки без лимитов</div>
        <div class="premium-feature">✓ Все уровни A1 - C2</div>
        <div class="premium-feature">✓ AI-анализ и расширенная статистика</div>
        <div class="premium-feature">✓ Приоритетная поддержка</div>
      </div>
    </div>

    <!-- Генерация диалогов -->
    <!-- <div class="limit-card">
      <div class="card-header">
        <div class="card-header-left">
          <span class="card-icon">🎯</span>
          <div class="card-title">
            <div class="title-main">Генерация диалогов</div>
            <div class="title-sub">Создание новых диалогов</div>
          </div>
        </div>
        <div class="card-header-right">
          <div class="modal-tier-badge">
            <span v-if="isDesktop" class="tier-label">Ваш тариф:</span>
            <span class="tier-badge" :class="userStore.tier">
              {{ userStore.tierName }}
            </span>
          </div>
        </div>
      </div>

      <div class="card-stats">
        <div class="stat-item">
          <div class="stat-label">Накоплено</div>
          <div class="stat-value large">
            {{ settingsStore.accumulatedGenerations }}
            <span class="stat-max">/ {{ settingsStore.limit.weeklyGenerationsCap }}</span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Можно сегодня</div>
          <div class="stat-value">{{ settingsStore.canUseToday }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Использовано сегодня</div>
          <div class="stat-value">{{ settingsStore.dailyUsageToday }}</div>
        </div>
      </div>

      <div class="progress-section">
        <div class="progress-bar">
          <div class="progress-fill generation" :style="{ width: `${settingsStore.generationsProgress}%` }"></div>
        </div>
        <div class="progress-text">
          {{ settingsStore.accumulatedGenerations }} накоплено • До {{ settingsStore.limit.dailyGenerationsMax }}/день
          максимум
        </div>
      </div>

      <div class="hint-box">
        <span class="hint-icon">💡</span>
        <div class="hint-text">
          Неиспользованные генерации накапливаются до {{ settingsStore.limit.weeklyGenerationsCap }} максимум. Сброс
          каждый понедельник в 00:00.
        </div>
      </div>
    </div> -->
    <!-- PRO-тренировки -->
    <!-- <div class="limit-card">
      <div class="card-header">
        <div class="card-header-left">
          <span class="card-icon">💪</span>
          <div class="card-title">
            <div class="title-main">PRO-тренировки</div>
            <div class="title-sub">Говорить • Переводить</div>
          </div>
        </div>
        <div class="card-header-right">
          <div class="modal-tier-badge">
            <span v-if="isDesktop" class="tier-label">Ваш тариф:</span>
            <span class="tier-badge" :class="userStore.tier">
              {{ userStore.tierName }}
            </span>
          </div>
        </div>
      </div>

      <div class="card-stats">
        <div class="stat-item">
          <div class="stat-label">Накоплено</div>
          <div class="stat-value large">
            {{ settingsStore.accumulatedPreview }}
            <span class="stat-max">/ {{ settingsStore.limit.weeklyPreviewCap }}</span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Можно сегодня</div>
          <div class="stat-value">{{ settingsStore.canUsePreviewToday }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Использовано сегодня</div>
          <div class="stat-value">{{ settingsStore.dailyPreviewToday }}</div>
        </div>
      </div>

      <div class="progress-section">
        <div class="progress-bar">
          <div class="progress-fill preview" :style="{ width: `${settingsStore.previewProgress}%` }"></div>
        </div>
        <div class="progress-text">
          {{ settingsStore.accumulatedPreview }} накоплено • До {{ settingsStore.limit.dailyPreviewMax }}/день максимум
        </div>
      </div>

      <div class="hint-box" v-if="userStore.tier === 'starter' && settingsStore.limit.unlimitedAnalysis">
        <span class="hint-icon">⭐</span>
        <div class="hint-text"><strong>STARTER бонус:</strong> Безлимитный анализ диалогов!</div>
      </div>
    </div> -->
    <!-- Сохранённые диалоги -->
    <!-- <div class="limit-card">
      <div class="card-header">
        <div class="card-header-left">
          <span class="card-icon">📚</span>
          <div class="card-title">
            <div class="title-main">Сохранённые диалоги</div>
            <div class="title-sub">Ваша библиотека</div>
          </div>
        </div>
        <div class="card-header-right">
          <div class="modal-tier-badge">
            <span v-if="isDesktop" class="tier-label">Ваш тариф:</span>
            <span class="tier-badge" :class="userStore.tier">
              {{ userStore.tierName }}
            </span>
          </div>
        </div>
      </div>

      <div class="card-stats">
        <div class="stat-item">
          <div class="stat-label">Использовано</div>
          <div class="stat-value large">
            {{ totalDialogs }}
            <span class="stat-max">/ {{ settingsStore.limit.totalDialogs }}</span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Свободно</div>
          <div class="stat-value">{{ settingsStore.limit.totalDialogs - totalDialogs }}</div>
        </div>
      </div>

      <div class="progress-section">
        <div class="progress-bar">
          <div class="progress-fill storage" :style="{ width: `${storageProgress}%` }"></div>
        </div>
        <div class="progress-text">{{ storageProgress }}% заполнено</div>
      </div>
    </div> -->
    <!-- CTA для upgrade (только для FREE) -->
    <!-- <div v-if="userStore.tier === 'free'" class="upgrade-section">
      <div class="upgrade-icon">⭐</div>
      <div class="upgrade-content">
        <div class="upgrade-title">Хотите больше возможностей?</div>
        <div class="upgrade-features">
          <div class="feature-item">✓ STARTER: 50 генераций/неделю</div>
          <div class="feature-item">✓ PRO: Безлимитный доступ ко всему</div>
        </div>
        <div class="upgrade-price">От $4.99/месяц</div>
      </div>
      <button class="upgrade-btn" @click="goToPricing">Сравнить планы</button>
    </div> -->
    <!-- Info для STARTER -->
    <!-- <div v-else-if="userStore.tier === 'starter'" class="info-section">
      <div class="info-icon">💎</div>
      <div class="info-text">
        <strong>STARTER план:</strong> Отличный выбор для регулярных занятий! Хотите больше? Обновитесь до PRO для
        безлимитного доступа.
      </div>
      <button class="info-btn" @click="goToPricing">Узнать о PRO</button>
    </div> -->
    <!-- Следующий сброс -->
    <!-- <div class="reset-info">
      <span class="reset-icon">🔄</span>
      <span class="reset-text">
        Лимиты обновятся: <strong>{{ nextMonday }}</strong>
      </span>
    </div> -->

    <!-- ✅ Для FREE и PRO показываем детальные лимиты -->
    <template v-else>
      <!-- Генерация диалогов -->
      <div class="limit-card">
        <div class="card-header">
          <div class="card-header-left">
            <span class="card-icon">🎯</span>
            <div class="card-title">
              <div class="title-main">Генерация диалогов</div>
              <div class="title-sub">Создание новых диалогов</div>
            </div>
          </div>
          <div class="card-header-right">
            <div class="modal-tier-badge">
              <span v-if="isDesktop" class="tier-label">Ваш тариф:</span>
              <span class="tier-badge" :class="userStore.tier">
                {{ userStore.tierName }}
              </span>
            </div>
          </div>
        </div>

        <div class="card-stats">
          <div class="stat-item">
            <div class="stat-label">Накоплено</div>
            <div class="stat-value large">
              {{ settingsStore.accumulatedGenerations }}
              <span class="stat-max">/ {{ settingsStore.limit.weeklyGenerationsCap }}</span>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Можно сегодня</div>
            <div class="stat-value">{{ settingsStore.canUseToday }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Использовано сегодня</div>
            <div class="stat-value">{{ settingsStore.dailyUsageToday }}</div>
          </div>
        </div>

        <div class="progress-section">
          <div class="progress-bar">
            <div class="progress-fill generation" :style="{ width: `${settingsStore.generationsProgress}%` }"></div>
          </div>
          <div class="progress-text">
            {{ settingsStore.accumulatedGenerations }} накоплено • До {{ settingsStore.limit.dailyGenerationsMax }}/день
            максимум
          </div>
        </div>

        <div class="hint-box">
          <span class="hint-icon">💡</span>
          <div class="hint-text">
            Неиспользованные генерации накапливаются до {{ settingsStore.limit.weeklyGenerationsCap }} максимум. Сброс
            каждый понедельник в 00:00.
          </div>
        </div>
      </div>

      <!-- PRO-тренировки -->
      <div class="limit-card">
        <div class="card-header">
          <div class="card-header-left">
            <span class="card-icon">💪</span>
            <div class="card-title">
              <div class="title-main">PRO-тренировки</div>
              <div class="title-sub">Говорить • Переводить</div>
            </div>
          </div>
          <div class="card-header-right">
            <div class="modal-tier-badge">
              <span v-if="isDesktop" class="tier-label">Ваш тариф:</span>
              <span class="tier-badge" :class="userStore.tier">
                {{ userStore.tierName }}
              </span>
            </div>
          </div>
        </div>

        <div class="card-stats">
          <div class="stat-item">
            <div class="stat-label">Накоплено</div>
            <div class="stat-value large">
              {{ settingsStore.accumulatedPreview }}
              <span class="stat-max">/ {{ settingsStore.limit.weeklyPreviewCap }}</span>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Можно сегодня</div>
            <div class="stat-value">{{ settingsStore.canUsePreviewToday }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Использовано сегодня</div>
            <div class="stat-value">{{ settingsStore.dailyPreviewToday }}</div>
          </div>
        </div>

        <div class="progress-section">
          <div class="progress-bar">
            <div class="progress-fill preview" :style="{ width: `${settingsStore.previewProgress}%` }"></div>
          </div>
          <div class="progress-text">
            {{ settingsStore.accumulatedPreview }} накоплено • До {{ settingsStore.limit.dailyPreviewMax }}/день
            максимум
          </div>
        </div>

        <!-- ✅ ОБНОВЛЕНО: PRO безлимитный анализ -->
        <div class="hint-box" v-if="userStore.isPro && settingsStore.limit.unlimitedAnalysis">
          <span class="hint-icon">⭐</span>
          <div class="hint-text"><strong>PRO бонус:</strong> Безлимитный анализ диалогов!</div>
        </div>
      </div>

      <!-- Сохранённые диалоги -->
      <div class="limit-card">
        <div class="card-header">
          <div class="card-header-left">
            <span class="card-icon">📚</span>
            <div class="card-title">
              <div class="title-main">Сохранённые диалоги</div>
              <div class="title-sub">Ваша библиотека</div>
            </div>
          </div>
          <div class="card-header-right">
            <div class="modal-tier-badge">
              <span v-if="isDesktop" class="tier-label">Ваш тариф:</span>
              <span class="tier-badge" :class="userStore.tier">
                {{ userStore.tierName }}
              </span>
            </div>
          </div>
        </div>

        <div class="card-stats">
          <div class="stat-item">
            <div class="stat-label">Использовано</div>
            <div class="stat-value large">
              {{ totalDialogs }}
              <span class="stat-max">/ {{ settingsStore.limit.totalDialogs }}</span>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Свободно</div>
            <div class="stat-value">{{ settingsStore.limit.totalDialogs - totalDialogs }}</div>
          </div>
        </div>

        <div class="progress-section">
          <div class="progress-bar">
            <div class="progress-fill storage" :style="{ width: `${storageProgress}%` }"></div>
          </div>
          <div class="progress-text">{{ storageProgress }}% заполнено</div>
        </div>
      </div>

      <!-- CTA для upgrade (только для FREE) -->
      <div v-if="userStore.tier === 'free'" class="upgrade-section">
        <div class="upgrade-icon">⭐</div>
        <div class="upgrade-content">
          <div class="upgrade-title">Хотите больше возможностей?</div>
          <div class="upgrade-features">
            <div class="feature-item">✓ PRO: 50 генераций/неделю, все уровни</div>
            <div class="feature-item">✓ PREMIUM: Безлимитный доступ + AI-анализ</div>
          </div>
          <div class="upgrade-price">От €4.99/месяц</div>
        </div>
        <button class="upgrade-btn" @click="goToPricing">Сравнить планы</button>
      </div>

      <!-- Info для PRO -->
      <div v-else-if="userStore.isPro" class="info-section">
        <div class="info-icon">💎</div>
        <div class="info-text">
          <strong>PRO план:</strong> Отличный выбор для регулярных занятий! Хотите безлимит? Обновитесь до PREMIUM для
          полной свободы.
        </div>
        <button class="info-btn" @click="goToPricing">Узнать о PREMIUM</button>
      </div>

      <!-- Следующий сброс -->
      <div class="reset-info">
        <span class="reset-icon">🔄</span>
        <span class="reset-text">
          Лимиты обновятся: <strong>{{ nextMonday }}</strong>
        </span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useDialogStore } from '../stores/dialogStore';
import { useUiStore } from '../stores/uiStore';
import { useBreakpoint } from '../composables/useBreakpoint';

const router = useRouter();
const userStore = useUserStore();
const settingsStore = useSettingsStore();
const dialogStore = useDialogStore();
const uiStore = useUiStore();
const { isDesktop } = useBreakpoint();

// Общее количество диалогов
const totalDialogs = computed(() => dialogStore.allDialogs.length);

// Прогресс хранилища
const storageProgress = computed(() => {
  const max = settingsStore.limit.totalDialogs;
  if (max === 0) return 0;
  return Math.round((totalDialogs.value / max) * 100);
});

// Следующий понедельник
const nextMonday = computed(() => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  const nextMon = new Date(today);
  nextMon.setDate(today.getDate() + daysUntilMonday);
  return nextMon.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
});

// Переход на страницу тарифов
const goToPricing = () => {
  uiStore.hideModal();
  router.push('/pricing');
};
</script>

<style scoped>
.limits-modal-content {
  padding: 0;
}

.premium-unlimited {
  text-align: center;
  padding: 32px 24px;
  background: linear-gradient(135deg, #f6ad5515 0%, #ed893615 100%);
  border: 2px solid #f6ad55;
  border-radius: 12px;
  margin-bottom: 16px;
}

.premium-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.premium-title {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--xl);
  font-weight: 700;
  color: var(--text-head);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.premium-description {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--md);
  color: var(--text-base);
  margin-bottom: 24px;
  line-height: 1.6;
}

.premium-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.premium-feature {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  color: var(--text-base);
  text-align: left;
  padding: 8px 12px;
  background: var(--bg-side);
  border-radius: 8px;
}

.modal-tier-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: var(--bg-side);
  border-radius: 12px;
}

.tier-label {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  color: var(--text-base);
}

.tier-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  font-weight: 700;
  letter-spacing: 0.5px;
}

.tier-badge.free {
  background: #e2e8f0;
  color: #475569;
}

.tier-badge.pro {
  background: linear-gradient(135deg, #f6ad55 0%, #ed8936 100%);
  color: white;
}

.tier-badge.premium {
  background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
  color: white;
}

.limit-card {
  background: var(--bg-side);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid var(--border);
}

.card-header {
  display: flex;
  flex-wrap: nowrap;
  margin-bottom: 16px;
}
.card-header-left {
  display: flex;
  flex-grow: 1;
  align-items: center;
}
.card-header-right {
  display: flex;
  align-items: center;
}

.card-icon {
  font-size: 2rem;
}

.card-title {
  flex: 1;
}

.title-main {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  font-weight: 500;
  color: var(--text-head);
}

.title-sub {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--xs);
  color: var(--text-title);
}

.card-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.stat-item {
  text-align: center;
  padding: 12px;
  background: var(--bg-main);
  border-radius: 8px;
}

.stat-label {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--xxs);
  color: var(--text-title);
  margin-bottom: 4px;
}

.stat-value {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--lg);
  font-weight: 700;
  color: var(--text-head);
}

.stat-value.large {
  font-size: var(--xl);
}

.stat-max {
  font-size: var(--md);
  color: var(--text-title);
  font-weight: 400;
}

.progress-section {
  margin-bottom: 12px;
}

.progress-bar {
  height: 8px;
  background: var(--y3);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-fill.generation {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.progress-fill.preview {
  background: linear-gradient(90deg, #48bb78 0%, #38a169 100%);
}

.progress-fill.storage {
  background: linear-gradient(90deg, #ed8936 0%, #dd6b20 100%);
}

.progress-text {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--xxs);
  color: var(--text-title);
  text-align: center;
}

.hint-box {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: var(--bg-main);
  border-left: 3px solid #667eea;
  border-radius: 4px;
}

.hint-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.hint-text {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--xxs);
  color: var(--text-base);
  line-height: 1.5;
}

.hint-text strong {
  color: var(--text-head);
  font-weight: 700;
}

.upgrade-section {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border: 2px dashed #667eea;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  text-align: center;
}

.upgrade-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.upgrade-title {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--lg);
  font-weight: 700;
  color: var(--text-head);
  margin-bottom: 12px;
}

.upgrade-features {
  margin-bottom: 12px;
}

.feature-item {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  color: var(--text-base);
  margin-bottom: 4px;
}

.upgrade-price {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--md);
  font-weight: 700;
  color: #667eea;
  margin-bottom: 16px;
}

.upgrade-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.upgrade-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.upgrade-btn:active {
  transform: translateY(0);
}

.info-section {
  background: var(--bg-side);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  text-align: center;
}

.info-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
}

.info-text {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  color: var(--text-base);
  margin-bottom: 16px;
  line-height: 1.5;
}

.info-text strong {
  color: var(--text-head);
}

.info-btn {
  padding: 10px 20px;
  background: var(--bg-main);
  color: var(--text-head);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.info-btn:hover {
  background: var(--border);
}

.reset-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: var(--bg-side);
  border-radius: 8px;
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--xxs);
  color: var(--text-base);
}

.reset-icon {
  font-size: 1.25rem;
}

.reset-text strong {
  color: var(--text-head);
  font-weight: 700;
}

@media (max-width: 768px) {
  .card-stats {
    grid-template-columns: 1fr;
  }
  .premium-features {
    grid-template-columns: 1fr;
  }
}
</style>
