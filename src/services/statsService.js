// src/services/statsService.js
import { doc, getDoc, updateDoc, increment, runTransaction } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Обновить статистику пользователя (только для PRO и PREMIUM)
 * @param {string} userId - ID пользователя
 * @param {string} levelType - Тип уровня ('level2', 'level3', 'level4')
 * @param {object} data - Данные: { averageAccuracy, dialogCompleted, dialogId, languageLevel }
 */
export async function updateUserStats(userId, levelType, data) {
  try {
    const userRef = doc(db, 'users', userId);

    // ✅ Используем Transaction для атомарности
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists()) {
        console.error('❌ Пользователь не найден:', userId);
        return;
      }

      const userData = userDoc.data();
      const currentStats = userData.stats || {};

      // ✅ ПОДГОТОВКА ОБНОВЛЕНИЙ
      const updates = {
        'stats.lastActivityDate': new Date().toISOString().split('T')[0], // YYYY-MM-DD
      };

      // ✅ ИНКРЕМЕНТ СЧЁТЧИКОВ УРОВНЯ
      const levelKey = `${levelType}Completed`; // level2Completed, level3Completed, level4Completed
      updates[`stats.${levelKey}`] = increment(1);

      // ✅ ЕСЛИ ДИАЛОГ ЗАВЕРШЁН (все 3 уровня >= порог)
      if (data.dialogCompleted) {
        updates['stats.dialogsLearned'] = increment(1);

        // Инкремент по уровню языка (A1, A2, B1...)
        if (data.languageLevel) {
          const levelFieldKey = `dialogsLearned${data.languageLevel.replace('.', '')}`; // dialogsLearnedA1, dialogsLearnedA2
          updates[`stats.${levelFieldKey}`] = increment(1);
        }

        // ✅ ПРОВЕРКА: Точность >= 95% → perfectDialogs
        if (data.averageAccuracy >= 95) {
          updates['stats.perfectDialogs'] = increment(1);
        }
      }

      // ✅ ОБНОВИТЬ СРЕДНЮЮ ТОЧНОСТЬ
      // Формула: (старая_средняя * старое_количество + новая_точность) / (старое_количество + 1)
      const totalTrainings = (currentStats.trainingsCompleted || 0) + 1;
      const oldAverage = currentStats.averageAccuracy || 0;
      const newAverage = ((oldAverage * (totalTrainings - 1) + data.averageAccuracy) / totalTrainings).toFixed(1);
      updates['stats.averageAccuracy'] = parseFloat(newAverage);

      // ✅ ИНКРЕМЕНТ trainingsCompleted
      updates['stats.trainingsCompleted'] = increment(1);

      // ✅ ПРИМЕНИТЬ ОБНОВЛЕНИЯ
      transaction.update(userRef, updates);

      console.log(`✅ Статистика обновлена для ${userId}:`, updates);
    });

    return true;
  } catch (error) {
    console.error('❌ Ошибка обновления статистики:', error);
    return false;
  }
}

/**
 * Обновить серию дней (streak)
 * @param {string} userId - ID пользователя
 */
export async function updateStreak(userId) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.error('❌ Пользователь не найден:', userId);
      return;
    }

    const userData = userDoc.data();
    const stats = userData.stats || {};
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const lastActivityDate = stats.lastActivityDate;

    // ✅ Если уже обновлялось сегодня → ничего не делаем
    if (lastActivityDate === today) {
      console.log('✅ Серия уже обновлена сегодня');
      return;
    }

    // ✅ Проверить: вчера была активность?
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const isConsecutive = lastActivityDate === yesterday;

    const updates = {
      'stats.lastActivityDate': today,
    };

    if (isConsecutive) {
      // ✅ Серия продолжается
      const newStreak = (stats.currentStreak || 0) + 1;
      updates['stats.currentStreak'] = newStreak;

      // ✅ Обновить рекорд?
      if (newStreak > (stats.longestStreak || 0)) {
        updates['stats.longestStreak'] = newStreak;
      }

      console.log(`🔥 Серия продолжается: ${newStreak} дней`);
    } else {
      // ❌ Серия прервана → начинаем с 1
      updates['stats.currentStreak'] = 1;
      console.log('💔 Серия прервана → начинаем заново');
    }

    await updateDoc(userRef, updates);
    return true;
  } catch (error) {
    console.error('❌ Ошибка обновления серии:', error);
    return false;
  }
}

/**
 * Проверить новые достижения
 * @param {string} userId - ID пользователя
 */
export async function checkAchievements(userId) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.error('❌ Пользователь не найден:', userId);
      return;
    }

    const userData = userDoc.data();
    const stats = userData.stats || {};
    const achievements = userData.achievements || [];

    // ✅ Список всех достижений
    const achievementRules = [
      { type: 'first_dialog', check: () => stats.dialogsLearned >= 1, title: '🏆 Первые шаги!' },
      { type: 'dialogs_10', check: () => stats.dialogsLearned >= 10, title: '🏆 Трудолюбивый' },
      { type: 'dialogs_50', check: () => stats.dialogsLearned >= 50, title: '🏆 Полиглот' },
      { type: 'perfectionist', check: () => stats.perfectDialogs >= 5, title: '🏆 Перфекционист' },
      { type: 'streak_7', check: () => stats.currentStreak >= 7, title: '🏆 Недельная серия' },
      { type: 'streak_30', check: () => stats.currentStreak >= 30, title: '🏆 Месячная серия' },
      { type: 'level_a1_master', check: () => stats.dialogsLearnedA1 >= 10, title: '🏆 Новичок A1' },
      { type: 'level_a2_master', check: () => stats.dialogsLearnedA2 >= 10, title: '🏆 Новичок A2' },
    ];

    const newAchievements = [];

    for (const rule of achievementRules) {
      // Проверить: уже разблокировано?
      const alreadyUnlocked = achievements.some((a) => a.type === rule.type);

      if (!alreadyUnlocked && rule.check()) {
        newAchievements.push({
          type: rule.type,
          unlockedAt: new Date(),
          notified: false,
          title: rule.title,
        });
      }
    }

    // ✅ Если есть новые достижения → сохранить
    if (newAchievements.length > 0) {
      const updatedAchievements = [...achievements, ...newAchievements];
      await updateDoc(userRef, { achievements: updatedAchievements });

      console.log(`🎉 Разблокировано ${newAchievements.length} новых достижений:`, newAchievements);
      return newAchievements;
    }

    return [];
  } catch (error) {
    console.error('❌ Ошибка проверки достижений:', error);
    return [];
  }
}

/**
 * Инициализировать статистику для нового пользователя
 * @param {string} userId - ID пользователя
 */
export async function initializeStats(userId) {
  try {
    const userRef = doc(db, 'users', userId);

    await updateDoc(userRef, {
      stats: {
        // Основные
        dialogsLearned: 0,
        dialogsMastered: 0,

        // По типам тренировок
        level2Completed: 0,
        level3Completed: 0,
        level4Completed: 0,

        // По уровням языка
        dialogsLearnedA1: 0,
        dialogsLearnedA21: 0,
        dialogsLearnedA22: 0,
        dialogsLearnedB11: 0,
        dialogsLearnedB12: 0,
        dialogsLearnedB21: 0,
        dialogsLearnedB22: 0,
        dialogsLearnedC11: 0,
        dialogsLearnedC12: 0,
        dialogsLearnedC2: 0,

        // Качество
        averageAccuracy: 0,
        perfectDialogs: 0,
        trainingsCompleted: 0,

        // Серии
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,

        // Время (опционально)
        totalTimeSpent: 0,
      },
      achievements: [],
    });

    console.log('✅ Статистика инициализирована для', userId);
  } catch (error) {
    console.error('❌ Ошибка инициализации статистики:', error);
  }
}
