// LinguaFlow/functions/index.js
import functions from 'firebase-functions';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import cors from 'cors';

const corsHandler = cors({ origin: true });
const ttsClient = new TextToSpeechClient();

export const getSpeech = functions.https.onRequest((request, response) => {
  corsHandler(request, response, async () => {
    const { text, langCode, voiceName, speechRate, pitch } = request.body.data;

    // 2. Проверка данных
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

export const getAvailableVoices = functions.https.onRequest((request, response) => {
  corsHandler(request, response, async () => {
    const { langCode } = request.body.data;
    if (!langCode) {
      return response.status(400).send({ error: 'Код языка не предоставлен.' });
    }

    try {
      const [result] = await ttsClient.listVoices({ languageCode: langCode });

      // 1. Разделяем все голоса по качеству И полу
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

      const curatedList = [];
      const MAX_VOICES = 10;
      const TARGET_PER_GENDER = 5;

      // 2. ФОРМИРУЕМ СПИСОК (ПРИОРИТЕТ PREMIUM)

      // --- Женские голоса ---
      let femaleVoices = [];
      // Сначала пресеты из премиум-голосов (макс. 2 голоса, 4 пресета)
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
      // "Добиваем" до 5 стандартными женскими
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

      // --- Мужские голоса ---
      let maleVoices = [];
      // Сначала пресеты из премиум-голосов
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
      // "Добиваем" до 5 стандартными мужскими
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

      // 3. Собираем финальный список и обрезаем до 10
      const finalRawList = [...femaleVoices, ...maleVoices].slice(0, MAX_VOICES);

      // 4. Отправляем "сырые" данные
      response.send({ data: { voices: finalRawList } });
    } catch (error) {
      console.error('Ошибка получения списка голосов:', error);
      response.status(500).send({ error: 'Не удалось получить список голосов.' });
    }
  });
});
