//src/services/achievementService.js

import { doc, getDoc, updateDoc, arrayUnion, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// Определения всех достижений в приложении
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
    title: '🏆 Отличный слух!',
    message: '50 тренировок понимания на слух завершено!',
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

  // Достижения по качеству
  minDialogsCount: 2,
  accuracy_90: {
    type: 'global_average_accuracy',
    threshold: 90,
    title: '🏆 Точность 90%',
    message: 'Средняя точность всех тренировок достигла 90%!',
  },
  accuracy_91: {
    type: 'global_average_accuracy',
    threshold: 91,
    title: '🏆 Точность 91%',
    message: 'Средняя точность всех тренировок достигла 91%!',
  },
  accuracy_92: {
    type: 'global_average_accuracy',
    threshold: 92,
    title: '🏆 Точность 92%',
    message: 'Средняя точность всех тренировок достигла 92%!',
  },
  accuracy_93: {
    type: 'global_average_accuracy',
    threshold: 93,
    title: '🏆 Точность 93%',
    message: 'Средняя точность всех тренировок достигла 93%!',
  },
  accuracy_94: {
    type: 'global_average_accuracy',
    threshold: 94,
    title: '🏆 Точность 94%',
    message: 'Средняя точность всех тренировок достигла 94%!',
  },
  accuracy_95: {
    type: 'global_average_accuracy',
    threshold: 95,
    title: '🏆 Точность 95%',
    message: 'Средняя точность всех тренировок достигла 95%!',
  },
  accuracy_96: {
    type: 'global_average_accuracy',
    threshold: 96,
    title: '🏆 Точность 96%',
    message: 'Средняя точность всех тренировок достигла 96%!',
  },
  accuracy_97: {
    type: 'global_average_accuracy',
    threshold: 97,
    title: '🏆 Точность 97%',
    message: 'Средняя точность всех тренировок достигла 97%!',
  },
  accuracy_98: {
    type: 'global_average_accuracy',
    threshold: 98,
    title: '🏆 Точность 98%',
    message: 'Средняя точность всех тренировок достигла 98%!',
  },
  accuracy_99: {
    type: 'global_average_accuracy',
    threshold: 99,
    title: '🏆 Точность 99%',
    message: 'Средняя точность всех тренировок достигла 99%!',
  },
  accuracy_100: {
    type: 'global_average_accuracy',
    threshold: 100,
    title: '🏆 Идеальная точность!',
    message: 'Невероятно! Средняя точность 100%!',
  },
};

// Получить значение статистики по типу достижения
function getStatValue(stats, type) {
  const mapping = {
    dialogs_learned: stats.dialogsLearned || 0,
    dialogs_learned_a1: stats.dialogsLearnedA1 || 0,
    dialogs_learned_a2: stats.dialogsLearnedA2 || 0,
    dialogs_learned_b1: stats.dialogsLearnedB1 || 0,
    dialogs_learned_b2: stats.dialogsLearnedB2 || 0,
    dialogs_learned_c1: stats.dialogsLearnedC1 || 0,
    dialogs_learned_c2: stats.dialogsLearnedC2 || 0,
    level2_completed: stats.level2Completed || 0,
    level3_completed: stats.level3Completed || 0,
    level4_completed: stats.level4Completed || 0,
    current_streak: stats.currentStreak || 0,
    longest_streak: stats.longestStreak || 0,
    global_average_accuracy: stats.globalAverageAccuracy || 0,
  };
  return mapping[type] || 0;
}
// Проверить достижения по точности
async function checkAccuracyAchievements(userId, stats, achievements) {
  try {
    const dialogsLearned = stats.dialogsLearned || 0;
    const currentAccuracy = Math.floor(stats.globalAverageAccuracy || 0);
    const previousAccuracy = Math.floor(stats.previousAverageAccuracy || 0);

    // ✅ ПРОВЕРКА 1: Минимум minDialogsCount диалогов
    if (dialogsLearned < ACHIEVEMENTS.minDialogsCount) {
      console.log(`⏸️ Достижения по точности: нужно минимум ${ACHIEVEMENTS.minDialogsCount} диалогов`);
      return [];
    }

    // ✅ ПРОВЕРКА 2: Точность должна быть >= 90%
    if (currentAccuracy < 90) {
      return [];
    }

    // ✅ ПРОВЕРКА 3: Точность должна ВЫРАСТИ
    if (currentAccuracy <= previousAccuracy) {
      return [];
    }

    console.log(`📊 Точность выросла: ${previousAccuracy}% → ${currentAccuracy}%`);

    const unlockedAchievements = [];

    // ✅ НАЙТИ ВСЕ ДОСТИЖЕНИЯ ОТ previousAccuracy ДО currentAccuracy
    const achievementsToUnlock = [];

    for (let acc = Math.max(90, previousAccuracy + 1); acc <= Math.min(100, currentAccuracy); acc++) {
      const achievementId = `accuracy_${acc}`;
      const achievement = ACHIEVEMENTS[achievementId];

      if (!achievement) continue;

      // Уже разблокировано?
      const alreadyUnlocked = achievements.some((a) => a.type === achievementId);
      if (alreadyUnlocked) continue;

      achievementsToUnlock.push({ id: achievementId, achievement, accuracy: acc });
    }

    if (achievementsToUnlock.length === 0) {
      return [];
    }

    console.log(`🎯 Разблокировка ${achievementsToUnlock.length} достижений по точности`);

    // ✅ РАЗБЛОКИРОВАТЬ ВСЕ, НО УВЕДОМЛЕНИЕ ТОЛЬКО ДЛЯ ПОСЛЕДНЕГО
    for (let i = 0; i < achievementsToUnlock.length; i++) {
      const { id, achievement } = achievementsToUnlock[i];
      const isLast = i === achievementsToUnlock.length - 1;

      // notifyUser: true только для последнего
      await unlockAchievement(userId, id, achievement, isLast);
      unlockedAchievements.push(id);

      console.log(`${isLast ? '🔔' : '🔕'} ${id}: ${achievement.title}`);
    }

    return unlockedAchievements;
  } catch (error) {
    console.error('❌ Ошибка проверки достижений по точности:', error);
    return [];
  }
}
// Проверить и разблокировать достижения
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

    // ЛОГИКА ДЛЯ ДОСТИЖЕНИЙ ПО ТОЧНОСТИ
    const accuracyAchievements = await checkAccuracyAchievements(userId, stats, achievements);
    if (accuracyAchievements.length > 0) {
      unlockedAchievements.push(...accuracyAchievements);
    }

    // ОСТАЛЬНЫЕ ДОСТИЖЕНИЯ
    for (const [achievementId, achievement] of Object.entries(ACHIEVEMENTS)) {
      // Пропускаем достижения по точности
      if (achievement.type === 'global_average_accuracy') continue;
      // Уже разблокировано?
      const alreadyUnlocked = achievements.some((a) => a.type === achievementId);
      if (alreadyUnlocked) continue;
      // Проверить условие
      const statValue = getStatValue(stats, achievement.type);

      if (statValue >= achievement.threshold) {
        console.log(`🏆 Достижение разблокировано: ${achievementId}`);
        // Разблокировать достижение (с уведомлением)
        await unlockAchievement(userId, achievementId, achievement, true);
        unlockedAchievements.push(achievementId);
      }
    }

    return unlockedAchievements;
  } catch (error) {
    console.error('❌ Ошибка проверки достижений:', error);
    return [];
  }
}
// Разблокировать достижение
async function unlockAchievement(userId, achievementId, achievement, notifyUser = true) {
  try {
    const userRef = doc(db, 'users', userId);

    // Добавить в массив достижений
    await updateDoc(userRef, {
      achievements: arrayUnion({
        type: achievementId,
        unlockedAt: new Date(),
        notified: notifyUser,
      }),
    });

    // Создать уведомление ТОЛЬКО если notifyUser = true
    if (notifyUser) {
      await createAchievementNotification(userId, achievement);
    }

    console.log(`✅ Достижение разблокировано: ${achievementId} (уведомление: ${notifyUser})`);
  } catch (error) {
    console.error('❌ Ошибка разблокировки достижения:', error);
  }
}
// Создать уведомление о достижении
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
// Получить список всех достижений (для UI)
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
