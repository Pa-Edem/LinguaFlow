// LinguaFlow/functions/index.js
import { onCall } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

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

  // 4. Проверяем PRO-статус для премиум-голосов
  try {
    const userDoc = await db.collection('users').doc(userId).get();

    const userData = userDoc.data();
    const isPro = userData?.manualProOverride || request.auth.token.stripeRole;

    // Если пользователь НЕ PRO, но просит премиум-голос
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
