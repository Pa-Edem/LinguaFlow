<!-- src/components/PricingFAQ.vue -->
<template>
  <div class="faq-container">
    <div v-for="(item, index) in faqItems" :key="index" class="faq-item" :class="{ open: openIndex === index }">
      <!-- Вопрос -->
      <button class="faq-question" @click="toggle(index)">
        <span class="question-text">{{ item.question }}</span>
        <span class="material-symbols-outlined icon">
          {{ openIndex === index ? 'expand_less' : 'expand_more' }}
        </span>
      </button>

      <!-- Ответ -->
      <Transition name="slide">
        <div v-if="openIndex === index" class="faq-answer">
          <p v-html="item.answer"></p>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const openIndex = ref(null);

const faqItems = [
  {
    question: '❓ Что такое trial период?',
    answer:
      'Trial — это 7 дней бесплатного доступа ко всем PRO функциям. Вы можете активировать его в любой момент. <strong>Без автоматического продления</strong>, без привязки карты.',
  },
  {
    question: '💳 Нужна ли карта для trial?',
    answer:
      'Нет! Trial период <strong>полностью бесплатный</strong> и не требует привязки карты. Просто нажмите кнопку "Активировать trial".',
  },
  {
    question: '🔄 Что будет после окончания trial?',
    answer:
      'После окончания trial вы вернётесь на FREE план. Никаких автоматических списаний. Если хотите продолжить пользоваться PRO функциями — просто обновитесь до платного плана.',
  },
  {
    question: '🆓 Чем FREE план отличается от PRO?',
    answer:
      '<strong>FREE:</strong> 2 генерации в день, 10 диалогов в хранилище, уровни A1-B1.2.<br><strong>PRO:</strong> 10 генераций в день, 50 диалогов, все уровни A1-C2, AI-анализ, расширенная статистика.',
  },
  {
    question: '👑 Что даёт PREMIUM план?',
    answer:
      '<strong>PREMIUM</strong> — это безлимитный доступ ко всем функциям. Никаких ограничений на генерации, хранилище и тренировки. Плюс приоритетная поддержка и будущие premium функции.',
  },
  {
    question: '💰 Можно ли платить ежегодно?',
    answer:
      'Да! PREMIUM план доступен с ежегодной оплатой со <strong>скидкой 17%</strong> (€99.99/год вместо €119.88).',
  },
  {
    question: '🔒 Как отменить подписку?',
    answer:
      'Вы можете отменить подписку в любой момент в разделе <strong>Профиль → Управление подпиской</strong>. Доступ сохранится до конца оплаченного периода.',
  },
  {
    question: '📊 Что такое AI-анализ диалогов?',
    answer:
      'AI-анализ — это умная система, которая анализирует ваши ошибки, даёт персонализированные рекомендации и помогает быстрее улучшить знание языка. Доступна в PRO и PREMIUM.',
  },
  {
    question: '🎓 Для каких уровней подходит LinguaFlow?',
    answer:
      '<strong>FREE:</strong> A1, A2.1, A2.2, B1.1, B1.2 (начинающие и средний уровень).<br><strong>PRO/PREMIUM:</strong> Все уровни от A1 до C2 (от начинающих до продвинутых).',
  },
  {
    question: '🌐 Можно ли использовать оффлайн?',
    answer:
      'Оффлайн режим находится в разработке и будет доступен для <strong>PREMIUM</strong> пользователей в ближайшее время.',
  },
  {
    question: '💬 Как связаться с поддержкой?',
    answer:
      'Вы можете написать нам на <strong>support@linguaflow.app</strong>. FREE пользователи получают ответ в течение 48 часов, PRO — 24 часа, PREMIUM — 12 часов.',
  },
];

const toggle = (index) => {
  openIndex.value = openIndex.value === index ? null : index;
};
</script>

<style scoped>
.faq-container {
  max-width: 800px;
  margin: 0 auto;
}

.faq-item {
  background: var(--bg-main);
  border: 1px solid var(--border);
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.faq-item:hover {
  border-color: var(--text-title);
}

.faq-item.open {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

/* Вопрос */
.faq-question {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: 'background-color' 0.2s ease;
}

.faq-question:hover {
  background-color: var(--bg-side);
}

.question-text {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--md);
  font-weight: 600;
  color: var(--text-head);
  flex: 1;
  padding-right: 16px;
}

.icon {
  font-size: 1.5rem;
  color: var(--text-base);
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.faq-item.open .icon {
  transform: rotate(180deg);
}

/* Ответ */
.faq-answer {
  padding: 0 24px 20px;
}

.faq-answer p {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  color: var(--text-base);
  line-height: 1.6;
  margin: 0;
}

.faq-answer :deep(strong) {
  color: var(--text-head);
  font-weight: 600;
}

/* Анимация */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  max-height: 0;
}

.slide-enter-to {
  opacity: 1;
  max-height: 500px;
}

.slide-leave-from {
  opacity: 1;
  max-height: 500px;
}

.slide-leave-to {
  opacity: 0;
  max-height: 0;
}

/* ============================================= */
/* RESPONSIVE */
/* ============================================= */
@media (max-width: 768px) {
  .faq-question {
    padding: 16px 20px;
  }

  .question-text {
    font-size: var(--sm);
  }

  .faq-answer {
    padding: 0 20px 16px;
  }

  .faq-answer p {
    font-size: var(--xs);
  }
}
</style>
