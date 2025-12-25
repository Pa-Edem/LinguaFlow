// src/services/statsService.js
import { doc, getDoc, updateDoc, setDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// Инициализировать статистику для нового пользователя
export async function initializeStats(userId) {
  try {
    const userRef = doc(db, 'users', userId);

    await updateDoc(userRef, {
      stats: {
        // Основные счётчики
        dialogsLearned: 0, // Полностью выученных диалогов (все 3 уровня)
        trainingsCompleted: 0, // Уникальных успешных тренировок

        // По типам тренировок (уникальные диалоги)
        level2Completed: 0,
        level3Completed: 0,
        level4Completed: 0,

        // По уровням языка (выученные диалоги)
        dialogsLearnedA1: 0,
        dialogsLearnedA2: 0,
        dialogsLearnedB1: 0,
        dialogsLearnedB2: 0,
        dialogsLearnedC1: 0,
        dialogsLearnedC2: 0,

        // Качество - глобальная средняя
        globalAverageAccuracy: 0,
        previousAverageAccuracy: 0,

        // Серии
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
      },
      achievements: [],
    });

    console.log('✅ Статистика инициализирована для', userId);
  } catch (error) {
    console.error('❌ Ошибка инициализации статистики:', error);
  }
}
// Обновить прогресс диалога (PREMIUM ONLY)
export async function updateDialogProgress(userId, dialogId, levelType, data) {
  try {
    const progressRef = doc(db, 'users', userId, 'dialogProgress', dialogId);
    const progressDoc = await getDoc(progressRef);

    if (!progressDoc.exists()) {
      // ✅ Создать новый документ прогресса
      await setDoc(progressRef, {
        dialogId,
        topic: data.topic || '',
        languageLevel: data.languageLevel || '',

        level2: {
          averageAccuracy: 0,
          completed: false,
          replicaScores: [],
        },
        level3: {
          averageAccuracy: 0,
          completed: false,
          replicaScores: [],
        },
        level4: {
          averageAccuracy: 0,
          completed: false,
          replicaScores: [],
        },

        overallAccuracy: 0,
        isFullyLearned: false,
        learnedAt: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    // ✅ Обновить конкретный уровень
    const progressData = progressDoc.exists() ? progressDoc.data() : {};
    const currentLevel = progressData[levelType] || {};

    // ⚠️ ВАЖНО: Обновляем accuracy только если новый результат ЛУЧШЕ
    const newAccuracy =
      data.averageAccuracy > (currentLevel.averageAccuracy || 0)
        ? data.averageAccuracy
        : currentLevel.averageAccuracy || 0;

    const updates = {
      [`${levelType}.averageAccuracy`]: newAccuracy,
      [`${levelType}.completed`]: data.completed,
      [`${levelType}.replicaScores`]: data.replicaScores || [],
      [`${levelType}.lastAttempt`]: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // ✅ Вычислить overallAccuracy (средняя по всем пройденным уровням)
    const level2Data = levelType === 'level2' ? { ...currentLevel, averageAccuracy: newAccuracy } : progressData.level2;
    const level3Data = levelType === 'level3' ? { ...currentLevel, averageAccuracy: newAccuracy } : progressData.level3;
    const level4Data = levelType === 'level4' ? { ...currentLevel, averageAccuracy: newAccuracy } : progressData.level4;

    const completedLevels = [level2Data, level3Data, level4Data].filter((l) => l && l.averageAccuracy > 0);
    const overallAccuracy =
      completedLevels.length > 0
        ? completedLevels.reduce((sum, l) => sum + l.averageAccuracy, 0) / completedLevels.length
        : 0;

    updates.overallAccuracy = Math.round(overallAccuracy);

    // ✅ Проверить isFullyLearned (все 3 уровня completed)
    const isFullyLearned =
      (levelType === 'level2' ? data.completed : level2Data?.completed) &&
      (levelType === 'level3' ? data.completed : level3Data?.completed) &&
      (levelType === 'level4' ? data.completed : level4Data?.completed);

    if (isFullyLearned && !progressData.isFullyLearned) {
      updates.isFullyLearned = true;
      updates.learnedAt = serverTimestamp();
    }

    await updateDoc(progressRef, updates);

    console.log(`✅ Прогресс обновлён: ${dialogId} → ${levelType} → ${newAccuracy}%`);
    return { overallAccuracy, isFullyLearned };
  } catch (error) {
    console.error('❌ Ошибка обновления прогресса:', error);
    return null;
  }
}
// Обновить глобальную статистику пользователя (PRO/PREMIUM)
export async function updateGlobalStats(userId, dialogId, levelType, data) {
  try {
    console.log('📊 Обновление глобальной статистики:', { userId, dialogId, levelType, data });

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.error('❌ Пользователь не найден:', userId);
      return;
    }

    const updates = {};

    // ✅ 1. Обновить lastActivityDate
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    updates['stats.lastActivityDate'] = today;

    // ✅ 2. Обновить серию (streak) - для completed ИЛИ attempted
    if (data.completed || data.attempted) {
      const userData = userDoc.data();
      const stats = userData.stats || {};
      const lastActivityDate = stats.lastActivityDate;

      if (lastActivityDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastActivityDate === yesterdayStr) {
          // Продолжаем серию
          updates['stats.currentStreak'] = increment(1);
        } else if (lastActivityDate !== today) {
          // Пропустили день - сброс серии
          updates['stats.currentStreak'] = 1;
        }
        // Если lastActivityDate === today, ничего не делаем (уже учились сегодня)
      } else {
        // Первая активность
        updates['stats.currentStreak'] = 1;
      }

      // Обновить longestStreak если нужно
      const newStreak = updates['stats.currentStreak'] || stats.currentStreak || 0;
      if (newStreak > (stats.longestStreak || 0)) {
        updates['stats.longestStreak'] = newStreak;
      }
    }

    // ✅ 3. Инкремент trainingsCompleted (только для ПЕРВОГО успешного прохождения уровня)
    if (data.completed && data.isFirstCompletion) {
      updates['stats.trainingsCompleted'] = increment(1);

      // Инкремент level{X}Completed
      const levelKey = `${levelType}Completed`;
      updates[`stats.${levelKey}`] = increment(1);
    }

    // ✅ 4. Проверить полное изучение диалога (все 3 уровня)
    if (data.isFullyLearned && data.isFirstFullCompletion) {
      updates['stats.dialogsLearned'] = increment(1);

      // Инкремент по уровню языка
      if (data.languageLevel) {
        const langKey = `dialogsLearned${data.languageLevel}`;
        updates[`stats.${langKey}`] = increment(1);
      }
    }

    // ✅ 5. Обновить globalAverageAccuracy
    const userData = userDoc.data();
    const stats = userData.stats || {};
    const currentGlobalAccuracy = stats.globalAverageAccuracy || 0;
    const currentTrainingsCount = stats.trainingsCompleted || 0;
    // Если это первое прохождение - добавляем 1 к счётчику
    const totalCount = data.completed && data.isFirstCompletion ? currentTrainingsCount + 1 : currentTrainingsCount;
    // Вычисляем новую среднюю
    const newGlobalAccuracy =
      totalCount > 0
        ? (currentGlobalAccuracy * currentTrainingsCount + data.averageAccuracy) / totalCount
        : data.averageAccuracy;
    // СОХРАНЯЕМ ПРЕДЫДУЩУЮ ТОЧНОСТЬ (для достижений)
    updates['stats.previousAverageAccuracy'] = currentGlobalAccuracy;
    // ОКРУГЛЕНИЕ ВНИЗ (Math.floor)
    updates['stats.globalAverageAccuracy'] = Math.floor(newGlobalAccuracy * 10) / 10;

    console.log(`📊 Точность: ${currentGlobalAccuracy} → ${updates['stats.globalAverageAccuracy']}`);

    // ✅ Применить обновления
    await updateDoc(userRef, updates);

    console.log('✅ Глобальная статистика обновлена:', userId);
  } catch (error) {
    console.error('❌ Ошибка обновления глобальной статистики:', error);
  }
}
// Проверить является ли это первым успешным прохождением уровня
export async function isFirstCompletion(userId, dialogId, levelType) {
  try {
    const progressRef = doc(db, 'users', userId, 'dialogProgress', dialogId);
    const progressDoc = await getDoc(progressRef);

    if (!progressDoc.exists()) {
      return true; // Документа нет = первый раз
    }

    const progressData = progressDoc.data();
    const levelData = progressData[levelType];

    // Первый раз если уровень ещё не был completed
    return !levelData?.completed;
  } catch (error) {
    console.error('❌ Ошибка проверки первого прохождения:', error);
    return false;
  }
}
// Проверить является ли диалог полностью выученным
export async function isDialogFullyLearned(userId, dialogId) {
  try {
    const progressRef = doc(db, 'users', userId, 'dialogProgress', dialogId);
    const progressDoc = await getDoc(progressRef);

    if (!progressDoc.exists()) {
      return false;
    }

    const progressData = progressDoc.data();
    return progressData.isFullyLearned === true;
  } catch (error) {
    console.error('❌ Ошибка проверки полного изучения:', error);
    return false;
  }
}
// Получить статистику пользователя
export async function getUserStats(userId) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return null;
    }

    return userDoc.data().stats || null;
  } catch (error) {
    console.error('❌ Ошибка получения статистики:', error);
    return null;
  }
}
