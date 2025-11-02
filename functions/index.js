// LinguaFlow/functions/index.js
// ✅ V2 ИМПОРТЫ
import { onRequest, onCall } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import admin from 'firebase-admin';
import cors from 'cors';

// Инициализация
if (!admin.apps.length) {
  admin.initializeApp();
}

// ✅ ГЛОБАЛЬНЫЕ НАСТРОЙКИ (регион для всех функций)
setGlobalOptions({
  region: 'europe-west1',
  maxInstances: 10, // Опционально: лимит инстансов
});

const corsHandler = cors({ origin: true });
const ttsClient = new TextToSpeechClient();

// ============================================
// ФУНКЦИЯ 1: getSpeech
// ============================================
export const getSpeech = onRequest((request, response) => {
  corsHandler(request, response, async () => {
    const { text, langCode, voiceName, speechRate, pitch } = request.body.data;

    if (!text || !langCode) {
      console.error('Нет текста или кода языка');
      return response.status(400).send({ error: 'Не предоставлен текст или код языка.' });
    }

    const voiceConfig = {
      languageCode: langCode,
    };

    if (voiceName && voiceName !== 'default') {
      voiceConfig.name = voiceName;
    } else {
      voiceConfig.ssmlGender = 'NEUTRAL';
    }

    const ttsRequest = {
      input: { text: text },
      voice: voiceConfig,
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: speechRate || 1.0,
        pitch: pitch || 0.0,
      },
    };

    try {
      const [ttsResponse] = await ttsClient.synthesizeSpeech(ttsRequest);
      response.send({
        data: {
          audioContent: ttsResponse.audioContent.toString('base64'),
        },
      });
    } catch (error) {
      console.error('Ошибка синтеза речи:', error);
      response.status(500).send({ error: 'Не удалось синтезировать речь.' });
    }
  });
});

// ============================================
// ФУНКЦИЯ 2: getAvailableVoices
// ============================================
export const getAvailableVoices = onRequest((request, response) => {
  corsHandler(request, response, async () => {
    const { langCode } = request.body.data;
    if (!langCode) {
      return response.status(400).send({ error: 'Код языка не предоставлен.' });
    }

    try {
      const [result] = await ttsClient.listVoices({ languageCode: langCode });

      // Разделяем все голоса по качеству И полу
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

      // Женские голоса
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

      // Мужские голоса
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

      const finalRawList = [...femaleVoices, ...maleVoices].slice(0, MAX_VOICES);

      response.send({ data: { voices: finalRawList } });
    } catch (error) {
      console.error('Ошибка получения списка голосов:', error);
      response.status(500).send({ error: 'Не удалось получить список голосов.' });
    }
  });
});

// ============================================
// ФУНКЦИЯ 3: deleteUserAccount
// ============================================
export const deleteUserAccount = onCall(async (request) => {
  // ✅ В v2: request.auth вместо context.auth
  if (!request.auth) {
    throw new Error('Необходима авторизация');
  }

  const userId = request.auth.uid;
  console.log(`🗑️ Начинаем удаление аккаунта: ${userId}`);

  try {
    const db = admin.firestore();

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
    await admin.auth().deleteUser(userId);
    console.log('✅ Firebase Auth аккаунт удален');

    return { success: true };
  } catch (error) {
    console.error('❌ Ошибка удаления аккаунта:', error);
    throw new Error('Не удалось удалить аккаунт');
  }
});
