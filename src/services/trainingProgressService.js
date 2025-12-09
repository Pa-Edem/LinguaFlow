// src/services/trainingProgressService.js
import { db, auth } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { TRAINING_CONFIG } from '../config/trainingConfig';
import { updateUserStats, updateStreak, checkAchievements } from './statsService';

/**
 * Сервис для работы с прогрессом тренировок
 * Структура данных в Firestore:
 * users/{userId}/dialogProgress/{dialogId}
 * {
 *   dialogId: 'abc123',
 *   level2: { completed: true, averageAccuracy: 94, ... },
 *   level3: { completed: false, averageAccuracy: 0, ... },
 *   level4: { completed: false, averageAccuracy: 0, ... },
 *   updatedAt: Timestamp
 * }
 */

/**
 * Получить прогресс по диалогу
 * @param {string} dialogId - ID диалога
 * @returns {Promise<object|null>}
 */
export async function getDialogProgress(dialogId) {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('❌ Пользователь не авторизован');
      return null;
    }

    const progressRef = doc(db, 'users', user.uid, 'dialogProgress', dialogId);
    const progressDoc = await getDoc(progressRef);

    if (progressDoc.exists()) {
      return progressDoc.data();
    } else {
      // Прогресса нет — возвращаем дефолтную структуру
      return {
        dialogId,
        level2: { completed: false, averageAccuracy: 0, replicaScores: [] },
        level3: { completed: false, averageAccuracy: 0, replicaScores: [] },
        level4: { completed: false, averageAccuracy: 0, replicaScores: [] },
      };
    }
  } catch (error) {
    console.error('❌ Ошибка загрузки прогресса:', error);
    return null;
  }
}

/**
 * Сохранить прогресс по тренировке (с разделением по тарифам)
 * @param {string} dialogId - ID диалога
 * @param {string} levelType - Тип тренировки: 'level1', 'level2', 'level3', 'level4'
 * @param {object} data - Данные прогресса
 * @param {number} data.averageAccuracy - Средняя точность
 * @param {number[]} data.replicaScores - Массив точностей по репликам
 * @param {string} tier - Тариф пользователя ('free', 'pro', 'premium')
 * @param {string} languageLevel - Уровень языка диалога (A1, A2, B1...)
 * @returns {Promise<object|boolean>} - { success: true, newAchievements: [] } или false
 */
export async function saveDialogProgress(dialogId, levelType, data, tier, languageLevel) {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('❌ Пользователь не авторизован');
      return false;
    }

    console.log(`📊 Сохранение прогресса:`, { dialogId, levelType, tier, data });

    // Проверяем, выучен ли диалог
    const completed = TRAINING_CONFIG.isDialogCompleted(data.replicaScores);

    // ❌ FREE: ничего не сохраняем
    if (tier === 'free' || !tier) {
      console.log('🆓 FREE: прогресс не сохраняется');
      return { success: false, tier: 'free' };
    }

    // ✅ PRO: только stats
    if (tier === 'pro') {
      console.log('⭐ PRO: сохраняем только статистику');

      // Обновить статистику
      await updateUserStats(user.uid, levelType, {
        averageAccuracy: data.averageAccuracy,
        dialogCompleted: completed,
        dialogId,
        languageLevel,
      });

      // Обновить серию
      await updateStreak(user.uid);

      // Проверить достижения
      const newAchievements = await checkAchievements(user.uid);

      return { success: true, newAchievements, tier: 'pro' };
    }

    // ✅ PREMIUM: stats + dialogProgress
    if (tier === 'premium') {
      console.log('👑 PREMIUM: сохраняем статистику + детальный прогресс');

      // 1. Обновить статистику
      await updateUserStats(user.uid, levelType, {
        averageAccuracy: data.averageAccuracy,
        dialogCompleted: completed,
        dialogId,
        languageLevel,
      });

      // 2. Обновить серию
      await updateStreak(user.uid);

      // 3. Сохранить детальный прогресс
      await saveDetailedProgress(user.uid, dialogId, levelType, data, completed);

      // 4. Проверить достижения
      const newAchievements = await checkAchievements(user.uid);

      return { success: true, newAchievements, tier: 'premium' };
    }

    return false;
  } catch (error) {
    console.error('❌ Ошибка сохранения прогресса:', error);
    return false;
  }
}

/**
 * Сохранить детальный прогресс (только для PREMIUM)
 * @param {string} userId - ID пользователя
 * @param {string} dialogId - ID диалога
 * @param {string} levelType - Тип уровня
 * @param {object} data - Данные тренировки
 * @param {boolean} completed - Пройден ли уровень
 */
async function saveDetailedProgress(userId, dialogId, levelType, data, completed) {
  try {
    const progressRef = doc(db, 'users', userId, 'dialogProgress', dialogId);
    const progressDoc = await getDoc(progressRef);

    const levelData = {
      completed,
      averageAccuracy: data.averageAccuracy,
      replicaScores: data.replicaScores,
      lastAttempt: new Date(),
    };

    if (progressDoc.exists()) {
      // Обновляем существующий документ
      await updateDoc(progressRef, {
        [levelType]: levelData,
        updatedAt: new Date(),
      });
      console.log(`✅ Прогресс обновлён: ${dialogId} → ${levelType}`);
    } else {
      // Создаём новый документ
      await setDoc(progressRef, {
        dialogId,
        level1: { completed: false, averageAccuracy: 0, replicaScores: [] },
        level2: { completed: false, averageAccuracy: 0, replicaScores: [] },
        level3: { completed: false, averageAccuracy: 0, replicaScores: [] },
        level4: { completed: false, averageAccuracy: 0, replicaScores: [] },
        [levelType]: levelData,
        updatedAt: new Date(),
      });
      console.log(`✅ Прогресс создан: ${dialogId} → ${levelType}`);
    }
  } catch (error) {
    console.error('❌ Ошибка сохранения детального прогресса:', error);
  }
}

/**
 * Получить статус всех тренировок для карточки диалога
 * @param {string} dialogId - ID диалога
 * @returns {Promise<object>} - { level2: false, level3: false, level4: false }
 */
export async function getDialogTrainingStatus(dialogId) {
  try {
    const progress = await getDialogProgress(dialogId);

    if (!progress) {
      return {
        level2: false,
        level3: false,
        level4: false,
      };
    }

    return {
      level2: progress.level2?.completed || false,
      level3: progress.level3?.completed || false,
      level4: progress.level4?.completed || false,
    };
  } catch (error) {
    console.error('❌ Ошибка загрузки статуса тренировок:', error);
    return {
      level2: false,
      level3: false,
      level4: false,
    };
  }
}

/**
 * Проверить: все тренировки пройдены?
 * @param {string} dialogId - ID диалога
 * @returns {Promise<boolean>}
 */
export async function isDialogFullyCompleted(dialogId) {
  try {
    const status = await getDialogTrainingStatus(dialogId);
    return status.level2 && status.level3 && status.level4;
  } catch (error) {
    console.error('❌ Ошибка проверки завершения:', error);
    return false;
  }
}

/**
 * Получить общую статистику по всем диалогам пользователя
 * @returns {Promise<object>} - { totalDialogs, completedDialogs, completionRate }
 */
export async function getUserTrainingStats() {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('❌ Пользователь не авторизован');
      return { totalDialogs: 0, completedDialogs: 0, completionRate: 0 };
    }

    // TODO: Реализовать когда будет нужно
    // Можно сделать запрос ко всем документам в dialogProgress
    // и подсчитать сколько полностью пройдено

    return { totalDialogs: 0, completedDialogs: 0, completionRate: 0 };
  } catch (error) {
    console.error('❌ Ошибка загрузки статистики:', error);
    return { totalDialogs: 0, completedDialogs: 0, completionRate: 0 };
  }
}
