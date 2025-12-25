// src/services/trainingProgressService.js
import { db, auth } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { TRAINING_CONFIG } from '../config/trainingConfig';
import { updateDialogProgress, updateGlobalStats, isFirstCompletion, isDialogFullyLearned } from './statsService';
import { checkAchievements } from './achievementService';

// Получить прогресс по диалогу
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

// Сохранить прогресс по тренировке (с разделением по тарифам)
export async function saveDialogProgress(dialogId, levelType, data, tier, languageLevel, topic = '') {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('❌ Пользователь не авторизован');
      return false;
    }
    console.log(`📊 Сохранение прогресса:`, { dialogId, levelType, tier, data });

    const completed = TRAINING_CONFIG.isDialogCompleted(levelType, data);
    const attempted = TRAINING_CONFIG.isLevelAttempted(levelType, data);
    console.log(`📊 Результат: completed=${completed}, attempted=${attempted}`);

    // ❌ FREE: ничего не сохраняем
    if (tier === 'free' || !tier) {
      console.log('🆓 FREE: прогресс не сохраняется');
      return { success: false, tier: 'free' };
    }

    // ✅ PRO: только stats
    if (tier === 'pro') {
      console.log('⭐ PRO: сохраняем только статистику');

      const isFirst = await isFirstCompletion(user.uid, dialogId, levelType);

      // Обновить глобальную статистику
      await updateGlobalStats(user.uid, dialogId, levelType, {
        averageAccuracy: data.averageAccuracy,
        completed,
        attempted,
        languageLevel,
        isFirstCompletion: isFirst,
        isFullyLearned: false,
        isFirstFullCompletion: false,
      });

      // Проверить достижения
      const newAchievements = await checkAchievements(user.uid);

      return { success: true, newAchievements, tier: 'pro' };
    }

    // ✅ PREMIUM: stats + dialogProgress
    if (tier === 'premium') {
      console.log('👑 PREMIUM: сохраняем статистику + детальный прогресс');

      const isFirst = await isFirstCompletion(user.uid, dialogId, levelType);
      const wasFullyLearnedBefore = await isDialogFullyLearned(user.uid, dialogId);

      // 3. Обновить детальный прогресс (dialogProgress)
      const progressResult = await updateDialogProgress(user.uid, dialogId, levelType, {
        averageAccuracy: data.averageAccuracy,
        completed,
        replicaScores: data.replicaScores,
        topic,
        languageLevel,
      });

      // 4. Обновить глобальную статистику
      const isFullyLearnedNow = progressResult?.isFullyLearned || false;
      const isFirstFullCompletion = isFullyLearnedNow && !wasFullyLearnedBefore;

      await updateGlobalStats(user.uid, dialogId, levelType, {
        averageAccuracy: data.averageAccuracy,
        completed,
        attempted,
        languageLevel,
        isFirstCompletion: isFirst,
        isFullyLearned: isFullyLearnedNow,
        isFirstFullCompletion,
      });

      // 5. Проверить достижения
      const newAchievements = await checkAchievements(user.uid);

      return { success: true, newAchievements, tier: 'premium' };
    }

    return false;
  } catch (error) {
    console.error('❌ Ошибка сохранения прогресса:', error);
    return false;
  }
}

// Получить статус всех тренировок для карточки диалога
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

// Проверить: все тренировки пройдены?
export async function isDialogFullyCompleted(dialogId) {
  try {
    const status = await getDialogTrainingStatus(dialogId);
    return status.level2 && status.level3 && status.level4;
  } catch (error) {
    console.error('❌ Ошибка проверки завершения:', error);
    return false;
  }
}

// Получить общую статистику по всем диалогам пользователя
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
