// src/config/stripeConfig.js

// Price IDs из Stripe Dashboard
export const STRIPE_PRICE_IDS = {
  pro: {
    monthly: 'price_1SX1FO7sDoKjQqmAoAqB7RZH',
  },
  premium: {
    monthly: 'price_1SX1Kp7sDoKjQqmA1fFEh8hZ',
    yearly: 'price_1SX1U87sDoKjQqmAHW1LjTbP',
  },
};

// Информация о планах для UI
export const PLANS = {
  free: {
    id: 'free',
    name: 'FREE',
    displayName: 'Free',
    icon: '🆓',
    price: {
      monthly: 0,
      yearly: 0,
    },
    currency: '€',
    features: [
      '2 генерации в день',
      '10 диалогов в библиотеке',
      'Базовые тренировки (Учить, Слушать)',
      'PRO-тренировки: 2 в день',
      'Анализ диалогов: ограничен',
    ],
    limits: {
      dailyGenerations: 2,
      weeklyGenerationsCap: 10,
      dailyGenerationsMax: 4,
      dailyPreview: 2,
      weeklyPreviewCap: 20,
      dailyPreviewMax: 8,
      totalDialogs: 10,
      unlimitedAnalysis: false,
      availableLevels: ['A1', 'A2.1', 'A2.2', 'B1.1', 'B1.2'],
    },
  },
  pro: {
    id: 'pro',
    name: 'PRO',
    displayName: 'Pro',
    icon: '⭐',
    price: {
      monthly: 4.99,
    },
    currency: '€',
    features: [
      '10 генераций диалогов в день',
      '50 диалогов в библиотеке',
      'Все тренировки',
      'PRO-тренировки: 20 в день',
      'Безлимитный анализ',
      'Полная статистика',
    ],
    limits: {
      dailyGenerations: 10,
      weeklyGenerationsCap: 50,
      dailyGenerationsMax: 15,
      dailyPreview: 20,
      weeklyPreviewCap: 100,
      dailyPreviewMax: 50,
      totalDialogs: 50,
      unlimitedAnalysis: true,
      availableLevels: ['A1', 'A2.1', 'A2.2', 'B1.1', 'B1.2', 'B2.1', 'B2.2', 'C1.1', 'C1.2', 'C2'],
    },
    priceIds: {
      monthly: STRIPE_PRICE_IDS.pro.monthly,
    },
  },
  premium: {
    id: 'premium',
    name: 'PREMIUM',
    displayName: 'Premium',
    icon: '👑',
    price: {
      monthly: 9.99,
      yearly: 99.99,
    },
    currency: '€',
    features: [
      'Безлимитные генерации',
      'Безлимитное хранение диалогов',
      'Все тренировки: безлимитно',
      'Безлимитный анализ',
      'Расширенная статистика + AI-анализ',
      'Экспорт диалогов (PDF, Anki)',
      'Приоритетная поддержка',
      'Ранний доступ к новым функциям',
    ],
    limits: {
      unlimited: true,
      availableLevels: ['A1', 'A2.1', 'A2.2', 'B1.1', 'B1.2', 'B2.1', 'B2.2', 'C1.1', 'C1.2', 'C2'],
    },
    priceIds: {
      monthly: STRIPE_PRICE_IDS.premium.monthly,
      yearly: STRIPE_PRICE_IDS.premium.yearly,
    },
  },
};

/**
 * Получить информацию о плане по tier
 * @param {string} tier - 'free', 'pro', 'premium'
 * @returns {object} - Информация о плане
 */
export function getPlanInfo(tier) {
  return PLANS[tier] || PLANS.free;
}

/**
 * Получить Price ID для плана
 * @param {string} tier - 'pro', 'premium'
 * @param {string} interval - 'monthly' или 'yearly'
 * @returns {string|null} - Price ID или null
 */
export function getPriceId(tier, interval = 'monthly') {
  const plan = PLANS[tier];
  if (!plan || !plan.priceIds) return null;
  return plan.priceIds[interval] || null;
}

/**
 * Форматировать цену
 * @param {number} price - Цена
 * @param {string} currency - Валюта
 * @returns {string} - Отформатированная цена
 */
export function formatPrice(price, currency = '€') {
  if (price === 0) return 'Бесплатно';
  return `${currency}${price.toFixed(2)}`;
}

/**
 * Рассчитать скидку для годового плана
 * @param {number} monthly - Месячная цена
 * @param {number} yearly - Годовая цена
 * @returns {number} - Процент скидки
 */
export function calculateYearlyDiscount(monthly, yearly) {
  const fullYearlyPrice = monthly * 12;
  const discount = ((fullYearlyPrice - yearly) / fullYearlyPrice) * 100;
  return Math.round(discount);
}

/**
 * Проверка, доступен ли годовой план
 * @param {string} tier - 'pro', 'premium'
 * @returns {boolean}
 */
export function hasYearlyOption(tier) {
  const plan = PLANS[tier];
  return plan && plan.priceIds && !!plan.priceIds.yearly;
}
