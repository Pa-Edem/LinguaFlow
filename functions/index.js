// LinguaFlow/functions/index.js
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { defineSecret } from 'firebase-functions/params';
import { GoogleGenerativeAI } from '@google/generative-ai';

const geminiApiKey = defineSecret('GEMINI_API_KEY');

// Инициализация
initializeApp();

const auth = getAuth();
const db = getFirestore();

// ✅ ГЛОБАЛЬНЫЕ НАСТРОЙКИ
setGlobalOptions({
  region: 'europe-west1',
  maxInstances: 10,
});

const ttsClient = new TextToSpeechClient();

/* ============================================
// ✨ Получение понедельника недели
// ==========================================*/
function getMondayOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Корректировка на понедельник
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0]; // YYYY-MM-DD
}

/* ============================================
// ✨ Определение тарифа пользователя
// ==========================================*/
async function getUserTier(userId, authToken) {
  try {
    // Получаем документ пользователя
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      console.log('⚠️ User document not found, defaulting to free');
      return 'free';
    }

    const userData = userDoc.data();

    // Manual Premium Override
    if (userData.manualPremiumOverride === true) {
      console.log('👑 Manual Premium Override active');
      return 'premium';
    }

    // Manual PRO override
    if (userData?.manualProOverride) {
      console.log('⭐ Manual Pro Override active');
      return 'pro';
    }

    // ✅ ПРОВЕРКА TRIAL
    if (userData.trialUsed === true && userData.trialEndDate) {
      const now = new Date();
      const trialEndDate = userData.trialEndDate.toDate();

      if (trialEndDate > now) {
        const daysLeft = Math.ceil((trialEndDate - now) / (1000 * 60 * 60 * 24));
        console.log(`🎁 Trial active: ${daysLeft} days left`);
        return 'pro';
      } else {
        console.log('⏰ Trial expired');
      }
    }

    // Stripe role
    const stripeRole = authToken?.stripeRole || null;

    if (stripeRole === 'premium') {
      console.log('💎 Stripe Premium subscription active');
      return 'premium';
    }

    if (stripeRole === 'pro') {
      console.log('⭐ Stripe Pro subscription active');
      return 'pro';
    }

    // FREE (по умолчанию)
    console.log('🆓 Free tier');
    return 'free';
  } catch (error) {
    console.error('❌ Ошибка определения тарифа:', error);
    return 'free';
  }
}

/* ============================================
// ✨ Получение и обновление лимитов с накоплением
// ==========================================*/
async function getOrUpdateUsage(userId, tier, limits) {
  const today = new Date().toISOString().split('T')[0];
  const weekStart = getMondayOfWeek();
  const usageRef = db.collection('usage').doc(userId);
  const usageDoc = await usageRef.get();

  let usageData = {
    date: today,
    weekStartDate: weekStart,
    lastResetDate: weekStart,
    // Накопленные
    accumulatedGenerations: 0,
    accumulatedPreview: 0,
    // Использовано сегодня
    dailyUsageToday: 0,
    dailyPreviewToday: 0,
  };

  if (usageDoc.exists) {
    const existing = usageDoc.data();

    // ✅ ПРОВЕРКА СМЕНЫ ТАРИФА
    // Если тариф изменился (например FREE → PRO при активации trial)
    // Пересчитываем accumulated с учётом новых лимитов
    if (!existing.tier || existing.tier !== tier) {
      console.log(`🔄 Смена тарифа ${existing.tier} → ${tier} для ${userId}`);

      // Вычисляем сколько уже использовано в эту неделю
      const usedGenerations = existing.dailyGenerationCount || 0;
      const usedPreview = existing.dailyPreviewCount || 0;

      // Устанавливаем новые лимиты
      // Начинаем с дневного лимита нового тарифа минус уже использованное
      usageData.accumulatedGenerations = Math.max(0, limits.dailyGenerations - usedGenerations);
      usageData.accumulatedPreview = Math.max(0, limits.dailyPreview - usedPreview);
      usageData.dailyUsageToday = existing.dailyUsageToday || 0;
      usageData.dailyPreviewToday = existing.dailyPreviewToday || 0;
      usageData.weekStartDate = existing.weekStartDate || weekStart;
      usageData.lastResetDate = existing.lastResetDate || weekStart;
      usageData.tier = tier; // ✅ Сохраняем текущий тариф
    }

    // Проверяем, новая ли неделя
    if (existing.weekStartDate !== weekStart) {
      console.log(`🔄 Новая неделя! Сброс накоплений для ${userId}`);

      // Сброс к базовым значениям
      usageData.accumulatedGenerations = limits.dailyGenerations;
      usageData.accumulatedPreview = limits.dailyPreview;
      usageData.dailyUsageToday = 0;
      usageData.dailyPreviewToday = 0;
      usageData.weekStartDate = weekStart;
      usageData.lastResetDate = weekStart;
    } else if (existing.date !== today) {
      // Новый день (но та же неделя)
      console.log(`📅 Новый день для ${userId}`);

      // ✅ FREE и PRO имеют накопление
      // PREMIUM - безлимит, не накапливаем
      if (tier === 'free' || tier === 'pro') {
        const newGenAccumulated = Math.min(
          (existing.accumulatedGenerations || 0) + limits.dailyGenerations,
          limits.weeklyGenerationsCap
        );
        const newPreviewAccumulated = Math.min(
          (existing.accumulatedPreview || 0) + limits.dailyPreview,
          limits.weeklyPreviewCap
        );

        usageData.accumulatedGenerations = newGenAccumulated;
        usageData.accumulatedPreview = newPreviewAccumulated;
      } else if (tier === 'premium') {
        // PREMIUM - безлимит, не трогаем счётчики
        usageData.accumulatedGenerations = existing.accumulatedGenerations || 0;
        usageData.accumulatedPreview = existing.accumulatedPreview || 0;
      }

      usageData.dailyUsageToday = 0;
      usageData.dailyPreviewToday = 0;
      usageData.weekStartDate = existing.weekStartDate;
      usageData.lastResetDate = existing.lastResetDate;
    } else {
      // Тот же день - копируем всё
      usageData = { ...existing };
    }
  } else {
    // Первый запуск - устанавливаем базовые значения
    if (tier === 'free' || tier === 'pro') {
      usageData.accumulatedGenerations = limits.dailyGenerations;
      usageData.accumulatedPreview = limits.dailyPreview;
    }
    // PREMIUM - оставляем 0 (безлимит)

    // ✅ Сохраняем текущий тариф
    usageData.tier = tier;
  }
  // Сохраняем обновлённые данные
  await usageRef.set(usageData, { merge: true });
  return usageData;
}

/* ============================================
// ФУНКЦИЯ 1: getSpeech (✅ ИСПРАВЛЕНА)
// ==========================================*/
export const getSpeech = onCall(async (request) => {
  const userId = request.auth?.uid;
  if (!userId) {
    throw new Error('Необходима авторизация');
  }

  // 2. Получаем данные из запроса
  console.log(`🎤 TTS запрос от пользователя: ${userId}`);
  const { text, langCode, voiceName, speechRate, pitch } = request.data;

  // 3. Проверка входных данных
  if (!text || !langCode) {
    throw new Error('Не предоставлен текст или код языка');
  }

  // 4. Проверяем статус для премиум-голосов
  try {
    // ✅ Определяем тариф (с учётом trial)
    const tier = await getUserTier(userId, request.auth.token);

    // Премиум-голоса доступны для PRO и PREMIUM (trial = pro)
    const isPro = tier === 'pro' || tier === 'premium';

    // Если пользователь НЕ PRO/PREMIUM, но просит премиум-голос
    if (!isPro && voiceName && voiceName !== 'default') {
      throw new Error('Премиум-голоса доступны только для PRO-пользователей');
    }

    // 5. Настройка голоса
    const voiceConfig = {
      languageCode: langCode,
    };

    if (voiceName && voiceName !== 'default') {
      voiceConfig.name = voiceName;
    } else {
      voiceConfig.ssmlGender = 'NEUTRAL';
    }

    // 6. Запрос к Google Cloud TTS
    const ttsRequest = {
      input: { text: text },
      voice: voiceConfig,
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: speechRate || 1.0,
        pitch: pitch || 0.0,
      },
    };

    const [ttsResponse] = await ttsClient.synthesizeSpeech(ttsRequest);

    console.log(`✅ TTS успешно для ${userId}`);

    return {
      audioContent: ttsResponse.audioContent.toString('base64'),
    };
  } catch (error) {
    console.error('❌ Ошибка TTS:', error);
    throw new Error('Не удалось синтезировать речь');
  }
});

/* ============================================
// ФУНКЦИЯ 2: getAvailableVoices (✅ ИСПРАВЛЕНА + ИМЕНА)
// ==========================================*/
export const getAvailableVoices = onCall(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new Error('Необходима авторизация');
  }

  const { langCode } = request.data;

  if (!langCode) {
    throw new Error('Код языка не предоставлен');
  }

  console.log(`🎵 Запрос голосов для ${langCode} от ${userId}`);

  try {
    // 2. Получаем список голосов от Google
    const [result] = await ttsClient.listVoices({ languageCode: langCode });

    // 3. Фильтруем голоса
    const premiumFemales = result.voices.filter(
      (v) => (v.name.includes('Wavenet') || v.name.includes('Neural2')) && v.ssmlGender === 'FEMALE'
    );
    const premiumMales = result.voices.filter(
      (v) => (v.name.includes('Wavenet') || v.name.includes('Neural2')) && v.ssmlGender === 'MALE'
    );
    const standardFemales = result.voices.filter(
      (v) => !v.name.includes('Wavenet') && !v.name.includes('Neural2') && v.ssmlGender === 'FEMALE'
    );
    const standardMales = result.voices.filter(
      (v) => !v.name.includes('Wavenet') && !v.name.includes('Neural2') && v.ssmlGender === 'MALE'
    );

    const MAX_VOICES = 10;
    const TARGET_PER_GENDER = 5;

    // 4. Формируем список женских голосов
    let femaleVoices = [];
    for (const voice of premiumFemales.slice(0, 2)) {
      femaleVoices.push({
        isPremium: true,
        ssmlGender: voice.ssmlGender,
        config: { name: voice.name, pitch: 0.0 },
      });
      femaleVoices.push({
        isPremium: true,
        ssmlGender: voice.ssmlGender,
        config: { name: voice.name, pitch: -2.0 },
      });
    }
    const femalesNeeded = TARGET_PER_GENDER - femaleVoices.length;
    if (femalesNeeded > 0) {
      standardFemales.slice(0, femalesNeeded).forEach((voice) => {
        femaleVoices.push({
          isPremium: false,
          ssmlGender: voice.ssmlGender,
          config: { name: voice.name, pitch: 0.0 },
        });
      });
    }

    // 5. Формируем список мужских голосов
    let maleVoices = [];
    for (const voice of premiumMales.slice(0, 2)) {
      maleVoices.push({
        isPremium: true,
        ssmlGender: voice.ssmlGender,
        config: { name: voice.name, pitch: 0.0 },
      });
      if (maleVoices.length < TARGET_PER_GENDER) {
        maleVoices.push({
          isPremium: true,
          ssmlGender: voice.ssmlGender,
          config: { name: voice.name, pitch: -2.0 },
        });
      }
    }
    const malesNeeded = TARGET_PER_GENDER - maleVoices.length;
    if (malesNeeded > 0) {
      standardMales.slice(0, malesNeeded).forEach((voice) => {
        maleVoices.push({
          isPremium: false,
          ssmlGender: voice.ssmlGender,
          config: { name: voice.name, pitch: 0.0 },
        });
      });
    }

    // 6. ✨ НОВОЕ: Генерируем традиционные имена
    const names = generateTraditionalNames(langCode);

    // 7. Собираем финальный список с именами
    const finalRawList = [...femaleVoices, ...maleVoices].slice(0, MAX_VOICES);

    // Присваиваем имена
    // ✅ ИСПРАВЛЕННАЯ ВЕРСИЯ: Используем отдельные счётчики
    let femaleIndex = 0;
    let maleIndex = 0;

    const voicesWithNames = finalRawList.map((voice, index) => {
      let displayName;

      if (voice.ssmlGender === 'FEMALE') {
        displayName = names.female[femaleIndex] || `Voice ${index + 1}`;
        femaleIndex++;
      } else {
        displayName = names.male[maleIndex] || `Voice ${index + 1}`;
        maleIndex++;
      }

      return {
        ...voice,
        displayName: displayName,
      };
    });

    console.log(`✅ Возвращено ${voicesWithNames.length} голосов с именами`);

    return { voices: voicesWithNames };
  } catch (error) {
    console.error('❌ Ошибка получения голосов:', error);
    throw new Error('Не удалось получить список голосов');
  }
});

/* ============================================
// ФУНКЦИЯ ГЕНЕРАЦИИ ТРАДИЦИОННЫХ ИМЁН
// ==========================================*/
function generateTraditionalNames(langCode) {
  // Словарь традиционных имён для разных языков
  const namesDatabase = {
    // Финский
    'fi-FI': {
      female: ['Aino', 'Maria', 'Sofia', 'Helena', 'Johanna'],
      male: ['Juhani', 'Olavi', 'Väinö', 'Tapani', 'Kalevi'],
    },
    // Английский
    'en-US': {
      female: ['Mary', 'Patricia', 'Linda', 'Barbara', 'Elizabeth'],
      male: ['James', 'Robert', 'John', 'Michael', 'William'],
    },
    'en-GB': {
      female: ['Olivia', 'Amelia', 'Isla', 'Ava', 'Lily'],
      male: ['Oliver', 'George', 'Noah', 'Arthur', 'Harry'],
    },
    // Испанский
    'es-ES': {
      female: ['María', 'Carmen', 'Ana', 'Isabel', 'Sofía'],
      male: ['Antonio', 'José', 'Manuel', 'Francisco', 'David'],
    },
    // Французский
    'fr-FR': {
      female: ['Marie', 'Anne', 'Louise', 'Jeanne', 'Catherine'],
      male: ['Jean', 'Louis', 'Pierre', 'Joseph', 'Henri'],
    },
    // Немецкий
    'de-DE': {
      female: ['Heidi', 'Gretchen', 'Maria', 'Anna', 'Ursula'],
      male: ['Hans', 'Karl', 'Otto', 'Friedrich', 'Wilhelm'],
    },
    // Итальянский
    'it-IT': {
      female: ['Maria', 'Anna', 'Rosa', 'Giuseppina', 'Angela'],
      male: ['Giuseppe', 'Antonio', 'Giovanni', 'Francesco', 'Luigi'],
    },
    // Русский
    'ru-RU': {
      female: ['Анна', 'Мария', 'Ольга', 'Наталья', 'Татьяна'],
      male: ['Александр', 'Сергей', 'Дмитрий', 'Андрей', 'Иван'],
    },
    // Португальский
    'pt-BR': {
      female: ['Maria', 'Ana', 'Francisca', 'Antonia', 'Adriana'],
      male: ['José', 'João', 'Antonio', 'Francisco', 'Carlos'],
    },
    // Голландский
    'nl-NL': {
      female: ['Maria', 'Anna', 'Johanna', 'Elisabeth', 'Catharina'],
      male: ['Johannes', 'Jan', 'Cornelis', 'Hendrik', 'Pieter'],
    },
    // Шведский
    'sv-SE': {
      female: ['Anna', 'Maria', 'Eva', 'Karin', 'Kristina'],
      male: ['Karl', 'Lars', 'Anders', 'Johan', 'Per'],
    },
    // Польский
    'pl-PL': {
      female: ['Anna', 'Maria', 'Katarzyna', 'Małgorzata', 'Agnieszka'],
      male: ['Piotr', 'Andrzej', 'Jan', 'Stanisław', 'Tomasz'],
    },
    // Украинский
    'uk-UA': {
      female: ['Софія', 'Анна', 'Марія', 'Оксана', 'Наталія'],
      male: ['Олександр', 'Андрій', 'Володимир', 'Іван', 'Михайло'],
    },
    // Чешский
    'cs-CZ': {
      female: ['Eliška', 'Anna', 'Tereza', 'Natálie', 'Adéla'],
      male: ['Jakub', 'Jan', 'Matyáš', 'Adam', 'Tomáš'],
    },
    // Венгерский
    'hu-HU': {
      female: ['Anna', 'Eszter', 'Réka', 'Szilvia', 'Mária'],
      male: ['István', 'László', 'János', 'József', 'Ferenc'],
    },
    // Норвежский
    'no-NO': {
      female: ['Anne', 'Inger', 'Kari', 'Marit', 'Ingrid'],
      male: ['Ole', 'Bjørn', 'Jan', 'Per', 'Kjell'],
    },
    // Датский
    'da-DK': {
      female: ['Anna', 'Kirsten', 'Mette', 'Hanne', 'Susanne'],
      male: ['Jens', 'Peter', 'Lars', 'Michael', 'Thomas'],
    },
    // Румынский
    'ro-RO': {
      female: ['Maria', 'Elena', 'Ioana', 'Andreea', 'Ana'],
      male: ['Andrei', 'Alexandru', 'Ion', 'Mihai', 'Stefan'],
    },
    // Хорватский
    'hr-HR': {
      female: ['Mia', 'Ema', 'Lucija', 'Sara', 'Nika'],
      male: ['Luka', 'Marko', 'Filip', 'Josip', 'Antonio'],
    },
    // Словацкий
    'sk-SK': {
      female: ['Sofia', 'Eliška', 'Viktória', 'Nina', 'Natália'],
      male: ['Jakub', 'Adam', 'Michal', 'Samuel', 'Tomáš'],
    },
    // Сербский
    'sr-RS': {
      female: ['Ana', 'Jelena', 'Marija', 'Sofija', 'Milena'],
      male: ['Nikola', 'Marko', 'Stefan', 'Milan', 'Luka'],
    },
  };

  // Возвращаем имена для языка или дефолтные английские
  return namesDatabase[langCode] || namesDatabase['en-US'];
}

/* ============================================
// ФУНКЦИЯ УДАЛЕНИЯ АККАУНТА
// ==========================================*/
export const deleteUserAccount = onCall(async (request) => {
  if (!request.auth) {
    throw new Error('Необходима авторизация');
  }

  const userId = request.auth.uid;
  console.log(`🗑️ Начинаем удаление аккаунта: ${userId}`);

  try {
    // 1. Удаляем все диалоги пользователя
    const dialogsSnapshot = await db.collection('dialogs').where('userId', '==', userId).get();

    if (!dialogsSnapshot.empty) {
      const batch = db.batch();
      dialogsSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      console.log(`✅ Удалено ${dialogsSnapshot.size} диалогов`);
    }

    // 2. Удаляем документ пользователя
    await db.collection('users').doc(userId).delete();
    console.log('✅ Документ пользователя удален');

    // 3. Удаляем usage данные
    const usageRef = db.collection('users').doc(userId).collection('usage').doc('daily');
    const usageDoc = await usageRef.get();

    if (usageDoc.exists) {
      await usageRef.delete();
      console.log('✅ Usage данные удалены');
    }

    // 4. Удаляем данные Stripe Extension (customers)
    const customerRef = db.collection('customers').doc(userId);
    const customerSnapshot = await customerRef.get();

    if (customerSnapshot.exists) {
      // Удаляем подколлекции
      const subcollections = ['subscriptions', 'checkout_sessions', 'payments'];

      for (const subcollection of subcollections) {
        const subcollectionSnapshot = await customerRef.collection(subcollection).get();

        if (!subcollectionSnapshot.empty) {
          const batch = db.batch();
          subcollectionSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
          await batch.commit();
          console.log(`✅ Удалена подколлекция ${subcollection}`);
        }
      }

      // Удаляем основной документ
      await customerRef.delete();
      console.log('✅ Документ customers удален');
    }

    // 5. Удаляем Firebase Auth аккаунт (последним!)
    await auth.deleteUser(userId);
    console.log('✅ Firebase Auth аккаунт удален');

    return { success: true };
  } catch (error) {
    console.error('❌ Ошибка удаления аккаунта:', error);
    throw new Error('Не удалось удалить аккаунт');
  }
});

/* ============================================
// ФУНКЦИЯ 4: callGemini
// ==========================================*/
export const callGemini = onCall(
  {
    secrets: [geminiApiKey],
  },
  async (request) => {
    const userId = request.auth?.uid;
    if (!userId) {
      throw new HttpsError('unauthenticated', 'Необходима авторизация');
    }

    const { prompt, operationType } = request.data;
    if (!prompt) {
      throw new HttpsError('invalid-argument', 'Промпт не предоставлен');
    }
    console.log(`🤖 Gemini запрос от ${userId}, тип: ${operationType}`);

    try {
      // ✅ Читаем лимиты из Firestore
      const limitsDoc = await db.collection('config').doc('limits').get();

      if (!limitsDoc.exists) {
        throw new Error('Лимиты не настроены в Firestore');
      }

      const limitsData = limitsDoc.data();

      // ✅ Определяем тариф пользователя
      const tier = await getUserTier(userId, request.auth.token);
      console.log(`👤 Пользователь ${userId} на тарифе: ${tier}`);

      // ✅ ТОЛЬКО PREMIUM = безлимит
      if (tier === 'premium') {
        console.log(`👑 PREMIUM: безлимитный доступ`);

        // Специальная операция: только увеличить счётчик
        if (operationType === 'training') {
          return { text: 'counter_incremented' };
        }

        // Вызов Gemini без проверок
        const apiKey = geminiApiKey.value();
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log(`✅ Gemini ответил (${text.length} символов)`);
        return { text: text };
      }

      // ✅ FREE и PRO - проверяем лимиты
      let tierLimits;
      if (tier === 'free') {
        tierLimits = limitsData.free;
      } else if (tier === 'pro') {
        tierLimits = limitsData.pro;
      } else {
        // Fallback
        tierLimits = limitsData.free;
      }

      // ✅ Получаем или обновляем usage с накоплением
      const usageData = await getOrUpdateUsage(userId, tier, tierLimits);

      console.log(`📊 ${tier.toUpperCase()}: 
        accumulated gen=${usageData.accumulatedGenerations}/${tierLimits.weeklyGenerationsCap}, 
        today=${usageData.dailyUsageToday}/${tierLimits.dailyGenerationsMax},
        accumulated preview=${usageData.accumulatedPreview}/${tierLimits.weeklyPreviewCap}`);

      // ✅ Специальная операция: только увеличить счётчик тренировки
      if (operationType === 'training') {
        // Проверка лимитов PRO-тренировок
        if (usageData.accumulatedPreview <= 0) {
          throw new HttpsError('resource-exhausted', `Достигнут лимит PRO-функций. Накоплено: 0.`);
        }

        if (usageData.dailyPreviewToday >= tierLimits.dailyPreviewMax) {
          throw new HttpsError(
            'resource-exhausted',
            `Достигнут дневной лимит использования (${tierLimits.dailyPreviewMax}/день).`
          );
        }

        // Уменьшаем accumulated и увеличиваем daily
        usageData.accumulatedPreview--;
        usageData.dailyPreviewToday++;

        console.log(
          `✅ Счётчик training: accumulated=${usageData.accumulatedPreview}, today=${usageData.dailyPreviewToday}`
        );

        const usageRef = db.collection('usage').doc(userId);
        await usageRef.set(usageData, { merge: true });

        return { text: 'counter_incremented' };
      }

      // ✅ Проверка лимитов для генерации диалогов
      if (operationType === 'generateDialog') {
        // Проверка накопленных
        if (usageData.accumulatedGenerations <= 0) {
          throw new HttpsError(
            'resource-exhausted',
            `Достигнут недельный лимит генераций. Накоплено: 0. Сброс: понедельник.`
          );
        }

        // Проверка дневного максимума
        if (usageData.dailyUsageToday >= tierLimits.dailyGenerationsMax) {
          throw new HttpsError(
            'resource-exhausted',
            `Достигнут дневной лимит использования (${tierLimits.dailyGenerationsMax}/день). Накоплено: ${usageData.accumulatedGenerations}.`
          );
        }

        // Проверка общего лимита диалогов
        const dialogsSnapshot = await db.collection('dialogs').where('userId', '==', userId).get();

        if (dialogsSnapshot.size >= tierLimits.totalDialogs) {
          throw new HttpsError(
            'resource-exhausted',
            `Достигнут лимит сохранённых диалогов (${tierLimits.totalDialogs} максимум). Обновитесь или удалите старые.`
          );
        }

        console.log(
          `📊 ${tier.toUpperCase()}: gen accumulated ${usageData.accumulatedGenerations}, today ${
            usageData.dailyUsageToday
          }, dialogs ${dialogsSnapshot.size}/${tierLimits.totalDialogs}`
        );
      }

      // ✅ Проверка лимитов для Анализа
      if (operationType === 'analysis') {
        // ✅ FREE - анализ БЛОКИРОВАН
        if (tier === 'free' && !tierLimits.unlimitedAnalysis) {
          throw new HttpsError('permission-denied', 'Анализ диалога доступен только для PRO и PREMIUM пользователей.');
        }

        // ✅ PRO - безлимитный анализ (не тратит preview)
        // ✅ PREMIUM - безлимитный анализ
        console.log(`📊 ${tier.toUpperCase()}: безлимитный анализ`);

        // Вызываем Gemini БЕЗ изменения счётчиков
        const apiKey = geminiApiKey.value();
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log(`✅ Gemini ответил (${text.length} символов) - анализ БЕЗ лимитов`);
        return { text: text };
      }

      // ✅ Проверка лимитов для Перевода и Произношения
      if (operationType === 'translation' || operationType === 'pronunciation') {
        // Проверка накопленных
        if (usageData.accumulatedPreview <= 0) {
          throw new HttpsError('resource-exhausted', `Достигнут недельный лимит PRO-функций. Накоплено: 0.`);
        }

        // Проверка дневного максимума
        if (usageData.dailyPreviewToday >= tierLimits.dailyPreviewMax) {
          throw new HttpsError(
            'resource-exhausted',
            `Достигнут дневной лимит использования (${tierLimits.dailyPreviewMax}/день).`
          );
        }

        console.log(
          `📊 ${tier.toUpperCase()}: preview accumulated ${usageData.accumulatedPreview}, today ${
            usageData.dailyPreviewToday
          }`
        );
      }

      // ✅ Вызов Gemini API
      const apiKey = geminiApiKey.value();
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log(`✅ Gemini ответил (${text.length} символов)`);

      // ✅ Увеличиваем счётчики после успеха
      const usageRef = db.collection('usage').doc(userId);

      if (operationType === 'generateDialog') {
        usageData.accumulatedGenerations--;
        usageData.dailyUsageToday++;
        console.log(
          `✅ Счётчик gen: accumulated=${usageData.accumulatedGenerations}, today=${usageData.dailyUsageToday}`
        );
      } else if (operationType === 'translation' || operationType === 'pronunciation') {
        // ✅ ТОЛЬКО перевод и произношение тратят preview
        usageData.accumulatedPreview--;
        usageData.dailyPreviewToday++;
        console.log(
          `✅ Счётчик preview: accumulated=${usageData.accumulatedPreview}, today=${usageData.dailyPreviewToday}`
        );
      }
      // ✅ analysis НЕ тратит preview - ничего не делаем

      await usageRef.set(usageData, { merge: true });

      return { text: text };
    } catch (error) {
      console.error('❌ Ошибка Gemini:', error);

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError('internal', 'Не удалось получить ответ от Gemini');
    }
  }
);

/* ============================================
// ФУНКЦИЯ 5: getUsageStats
// ==========================================*/
export const getUsageStats = onCall(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'Необходима авторизация');
  }

  try {
    // ✅ ЧИТАЕМ ЛИМИТЫ ИЗ FIRESTORE
    const limitsDoc = await db.collection('config').doc('limits').get();

    if (!limitsDoc.exists) {
      throw new Error('Лимиты не настроены в Firestore');
    }

    const limitsData = limitsDoc.data();

    // ✅ Определяем тариф пользователя
    const tier = await getUserTier(userId, request.auth.token);

    // ✅ Выбираем лимиты в зависимости от тарифа
    let tierLimits;
    if (tier === 'free') {
      tierLimits = limitsData.free;
    } else if (tier === 'pro') {
      tierLimits = limitsData.pro;
    } else if (tier === 'premium') {
      tierLimits = limitsData.premium;
    } else {
      // Fallback на free
      tierLimits = limitsData.free;
    }

    // ✅ Получаем usage с обновлением (если новый день/неделя)
    const usageData = await getOrUpdateUsage(userId, tier, tierLimits);

    // Подсчёт диалогов
    const dialogsSnapshot = await db.collection('dialogs').where('userId', '==', userId).get();
    const totalDialogs = dialogsSnapshot.size;

    console.log(
      `📊 Статистика ${userId} (${tier}): 
        accumulated gen=${usageData.accumulatedGenerations}, today=${usageData.dailyUsageToday},
        accumulated preview=${usageData.accumulatedPreview}, today=${usageData.dailyPreviewToday},
        total dialogs=${totalDialogs}`
    );

    return {
      totalDialogs,
      date: usageData.date,

      // ✅ НОВЫЕ поля с накоплением
      accumulatedGenerations: usageData.accumulatedGenerations || 0,
      accumulatedPreview: usageData.accumulatedPreview || 0,
      dailyUsageToday: usageData.dailyUsageToday || 0,
      dailyPreviewToday: usageData.dailyPreviewToday || 0,
      weekStartDate: usageData.weekStartDate,

      // ✅ Возвращаем лимиты и тариф
      limits: tierLimits,
      tier: tier,
    };
  } catch (error) {
    console.error('❌ Ошибка получения статистики:', error);
    throw new HttpsError('internal', 'Не удалось получить статистику использования');
  }
});

/**
 * ⏰ АВТОМАТИЧЕСКОЕ ОКОНЧАНИЕ TRIAL
 * Запускается каждый день в 00:00 UTC
 * Проверяет всех пользователей с истёкшим trial
 * Возвращает их на FREE tier
 */
export const checkTrialExpiration = onSchedule(
  {
    schedule: 'every day 00:00',
    timeZone: 'UTC',
    region: 'europe-west1',
  },
  async (event) => {
    console.log('⏰ Starting trial expiration check...');

    try {
      const now = FieldValue.serverTimestamp();
      const nowDate = new Date();

      // Найти всех пользователей с истёкшим trial
      const usersRef = db.collection('users');

      // Запрос: trialUsed = true И trialEndDate <= now
      const snapshot = await usersRef.where('trialUsed', '==', true).where('trialEndDate', '<=', nowDate).get();

      if (snapshot.empty) {
        console.log('✅ No expired trials found');
        return null;
      }

      console.log(`📋 Found ${snapshot.size} expired trials`);

      // Обновляем пакетом (batch) для производительности
      const batch = db.batch();
      let count = 0;

      snapshot.forEach((doc) => {
        const userData = doc.data();

        // Проверяем что trial действительно истёк
        const trialEndDate = userData.trialEndDate?.toDate();

        if (trialEndDate && trialEndDate <= nowDate) {
          // Добавляем в batch обновление
          batch.update(doc.ref, {
            // Не меняем trialUsed - остаётся true
            // Не меняем trialStartDate/trialEndDate - история
            // Просто помечаем что trial истёк
            trialExpired: true,
            trialExpiredAt: now,
            updatedAt: now,
          });

          count++;

          console.log(`⏰ Expiring trial for user: ${doc.id}`);
        }
      });

      // Выполняем все обновления одновременно
      await batch.commit();

      console.log(`✅ Successfully expired ${count} trials`);

      return {
        success: true,
        count: count,
        timestamp: nowDate.toISOString(),
      };
    } catch (error) {
      console.error('❌ Error checking trial expiration:', error);
      throw error;
    }
  }
);

/**
 * 📧 УВЕДОМЛЕНИЕ ЗА 1 ДЕНЬ ДО ОКОНЧАНИЯ TRIAL
 * Запускается каждый день в 10:00 UTC
 * Находит пользователей у которых trial заканчивается завтра
 * Отправляет уведомление (Toast при следующем входе)
 */
export const notifyTrialEnding = onSchedule(
  {
    schedule: 'every day 10:00',
    timeZone: 'UTC',
    region: 'europe-west1',
  },
  async (event) => {
    console.log('📧 Checking for trials ending soon...');

    try {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999); // Конец завтрашнего дня

      const usersRef = db.collection('users');

      // Найти пользователей у которых trial заканчивается завтра
      const snapshot = await usersRef
        .where('trialUsed', '==', true)
        .where('trialEndDate', '<=', tomorrow)
        .where('trialEndDate', '>', now)
        .get();

      if (snapshot.empty) {
        console.log('✅ No trials ending tomorrow');
        return null;
      }

      console.log(`📋 Found ${snapshot.size} trials ending soon`);

      // Создаём уведомления
      const batch = db.batch();
      let count = 0;

      snapshot.forEach((doc) => {
        const userData = doc.data();
        const trialEndDate = userData.trialEndDate?.toDate();

        if (trialEndDate) {
          // Вычисляем сколько часов осталось
          const hoursLeft = Math.ceil((trialEndDate - now) / (1000 * 60 * 60));

          // Создаём документ уведомления
          const notificationRef = db.collection('notifications').doc();

          batch.set(notificationRef, {
            userId: doc.id,
            type: 'trial_ending',
            title: '⏰ Trial заканчивается скоро!',
            message: `У вас осталось ${hoursLeft} часов PRO доступа. Купите подписку, чтобы сохранить все функции!`,
            read: false,
            createdAt: FieldValue.serverTimestamp(),
            expiresAt: trialEndDate,
          });

          count++;

          console.log(`📧 Notification created for user: ${doc.id} (${hoursLeft}h left)`);
        }
      });

      await batch.commit();

      console.log(`✅ Created ${count} notifications`);

      return {
        success: true,
        count: count,
        timestamp: now.toISOString(),
      };
    } catch (error) {
      console.error('❌ Error notifying trial ending:', error);
      throw error;
    }
  }
);

/**
 * Автоматическая очистка уведомлений старше 2 недель
 */
export const cleanupOldNotifications = onSchedule(
  {
    schedule: 'every day 03:00',
    timeZone: 'UTC',
    region: 'europe-west1',
  },
  async (event) => {
    try {
      console.log('🧹 Starting notification cleanup...');

      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const snapshot = await db.collection('notifications').where('createdAt', '<', twoWeeksAgo).get();

      if (snapshot.empty) {
        console.log('✅ No old notifications to delete');
        return;
      }

      const batch = db.batch();
      let count = 0;

      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
        count++;
      });

      await batch.commit();

      console.log(`✅ Deleted ${count} old notifications`);
    } catch (error) {
      console.error('❌ Error cleaning up notifications:', error);
    }
  }
);
