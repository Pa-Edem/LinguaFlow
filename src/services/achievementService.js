//src/services/achievementService.js

import { doc, getDoc, updateDoc, arrayUnion, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';

/**
 * Определения всех достижений в приложении
 */
const ACHIEVEMENTS = {
  // Базовые достижения по диалогам
  first_dialog: {
    type: 'dialogs_learned',
    threshold: 1,
    title: '🏆 Первые шаги!',
    message: 'Вы выучили свой первый диалог. Отличное начало!',
  },
  dialogs_10: {
    type: 'dialogs_learned',
    threshold: 10,
    title: '🏆 Трудолюбивый',
    message: 'Уже 10 диалогов выучено! Вы на правильном пути!',
  },
  dialogs_25: {
    type: 'dialogs_learned',
    threshold: 25,
    title: '🏆 Настойчивый',
    message: 'Четверть сотни диалогов! Впечатляющий прогресс!',
  },
  dialogs_50: {
    type: 'dialogs_learned',
    threshold: 50,
    title: '🏆 Полиглот',
    message: 'Уже 50 диалогов! Вы серьёзно настроены!',
  },
  dialogs_100: {
    type: 'dialogs_learned',
    threshold: 100,
    title: '🏆 Мастер диалогов',
    message: 'Невероятно! 100 диалогов освоено!',
  },

  // Достижения по уровням языка
  level_a1: {
    type: 'dialogs_learned_a1',
    threshold: 10,
    title: '🏆 Новичок A1',
    message: 'Вы освоили 10 диалогов уровня A1!',
  },
  level_a2: {
    type: 'dialogs_learned_a2',
    threshold: 10,
    title: '🏆 Базовый A2',
    message: 'Уровень A2 покорён! 10 диалогов освоено!',
  },
  level_b1: {
    type: 'dialogs_learned_b1',
    threshold: 10,
    title: '🏆 Средний B1',
    message: 'Вы достигли среднего уровня! 10 диалогов B1!',
  },
  level_b2: {
    type: 'dialogs_learned_b2',
    threshold: 10,
    title: '🏆 Уверенный B2',
    message: 'Продвинутый уровень! 10 диалогов B2 освоено!',
  },

  // Достижения по типам тренировок
  pronunciation_50: {
    type: 'level2_completed',
    threshold: 50,
    title: '🏆 Мастер произношения',
    message: '50 тренировок произношения завершено!',
  },
  translation_50: {
    type: 'level3_completed',
    threshold: 50,
    title: '🏆 Переводчик',
    message: '50 тренировок перевода позади!',
  },
  speaking_50: {
    type: 'level4_completed',
    threshold: 50,
    title: '🏆 Оратор',
    message: '50 тренировок свободной речи завершено!',
  },

  // Достижения по качеству
  perfectionist: {
    type: 'perfect_dialogs',
    threshold: 5,
    title: '🏆 Перфекционист',
    message: '5 диалогов с точностью 95%+! Впечатляет!',
  },
  master: {
    type: 'dialogs_mastered',
    threshold: 10,
    title: '🏆 Мастер',
    message: '10 диалогов освоены на отлично (95%+)!',
  },

  // Достижения по сериям
  streak_7: {
    type: 'current_streak',
    threshold: 7,
    title: '🏆 Недельная серия',
    message: '7 дней подряд практики! Отличная привычка! 🔥',
  },
  streak_30: {
    type: 'current_streak',
    threshold: 30,
    title: '🏆 Месячная серия',
    message: '30 дней практики подряд. Вы легенда! 🔥',
  },
  streak_100: {
    type: 'longest_streak',
    threshold: 100,
    title: '🏆 Непобедимый',
    message: '100 дней подряд! Невероятное постоянство!',
  },
};

/**
 * Получить значение статистики по типу достижения
 */
function getStatValue(stats, type) {
  const mapping = {
    dialogs_learned: stats.dialogsLearned || 0,
    dialogs_learned_a1: stats.dialogsLearnedA1 || 0,
    dialogs_learned_a2: stats.dialogsLearnedA2 || 0,
    dialogs_learned_b1: stats.dialogsLearnedB1 || 0,
    dialogs_learned_b2: stats.dialogsLearnedB2 || 0,
    level2_completed: stats.level2Completed || 0,
    level3_completed: stats.level3Completed || 0,
    level4_completed: stats.level4Completed || 0,
    perfect_dialogs: stats.perfectDialogs || 0,
    dialogs_mastered: stats.dialogsMastered || 0,
    current_streak: stats.currentStreak || 0,
    longest_streak: stats.longestStreak || 0,
  };
  return mapping[type] || 0;
}

/**
 * Проверить и разблокировать достижения
 * @param {string} userId - ID пользователя
 * @returns {Promise<string[]>} - Массив ID разблокированных достижений
 */
export async function checkAchievements(userId) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.error('❌ Пользователь не найден');
      return [];
    }

    const userData = userDoc.data();
    const stats = userData.stats || {};
    const achievements = userData.achievements || [];

    const unlockedAchievements = [];

    // Проверить каждое достижение
    for (const [achievementId, achievement] of Object.entries(ACHIEVEMENTS)) {
      // Уже разблокировано?
      const alreadyUnlocked = achievements.some((a) => a.type === achievementId);
      if (alreadyUnlocked) continue;

      // Проверить условие
      const statValue = getStatValue(stats, achievement.type);

      if (statValue >= achievement.threshold) {
        console.log(`🏆 Достижение разблокировано: ${achievementId}`);

        // Разблокировать достижение
        await unlockAchievement(userId, achievementId, achievement);
        unlockedAchievements.push(achievementId);
      }
    }

    return unlockedAchievements;
  } catch (error) {
    console.error('❌ Ошибка проверки достижений:', error);
    return [];
  }
}

/**
 * Разблокировать достижение
 * @param {string} userId - ID пользователя
 * @param {string} achievementId - ID достижения
 * @param {Object} achievement - Данные достижения
 */
async function unlockAchievement(userId, achievementId, achievement) {
  try {
    const userRef = doc(db, 'users', userId);

    // Добавить в массив достижений
    await updateDoc(userRef, {
      achievements: arrayUnion({
        type: achievementId,
        unlockedAt: new Date(),
        notified: false,
      }),
    });

    // Создать уведомление
    await createAchievementNotification(userId, achievement);

    console.log(`✅ Достижение разблокировано: ${achievementId}`);
  } catch (error) {
    console.error('❌ Ошибка разблокировки достижения:', error);
  }
}

/**
 * Создать уведомление о достижении
 * @param {string} userId - ID пользователя
 * @param {Object} achievement - Данные достижения
 */
async function createAchievementNotification(userId, achievement) {
  try {
    const notificationsRef = collection(db, 'notifications');

    await addDoc(notificationsRef, {
      userId,
      type: 'achievement',
      title: achievement.title,
      message: achievement.message,
      read: false,
      createdAt: serverTimestamp(),
    });

    console.log(`✅ Уведомление о достижении создано для пользователя ${userId}`);
  } catch (error) {
    console.error('❌ Ошибка создания уведомления:', error);
  }
}

/**
 * Получить список всех достижений (для UI)
 * @param {Object} stats - Статистика пользователя
 * @param {Array} achievements - Разблокированные достижения
 * @returns {Array} - Список достижений с прогрессом
 */
export function getAllAchievements(stats = {}, achievements = []) {
  return Object.entries(ACHIEVEMENTS).map(([achievementId, achievement]) => {
    const unlocked = achievements.some((a) => a.type === achievementId);
    const currentValue = getStatValue(stats, achievement.type);
    const progress = Math.min(100, (currentValue / achievement.threshold) * 100);

    return {
      id: achievementId,
      title: achievement.title,
      message: achievement.message,
      threshold: achievement.threshold,
      currentValue,
      progress,
      unlocked,
      unlockedAt: unlocked ? achievements.find((a) => a.type === achievementId)?.unlockedAt : null,
    };
  });
}
