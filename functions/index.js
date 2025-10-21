// LinguaFlow/functions/index.js
import functions from 'firebase-functions';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import cors from 'cors';

// Инициализируем CORS
const corsHandler = cors({ origin: true });

// Инициализируем клиент TTS
const ttsClient = new TextToSpeechClient();

/**
 * Вызываемая функция для синтеза речи.
 * Получает: data.text, data.langCode, data.voiceName, data.speechRate
 */
export const getSpeech = functions.https.onRequest((request, response) => {
  // Оборачиваем функцию в CORS
  corsHandler(request, response, async () => {
    // ПОЛУЧАЕМ ВСЕ НОВЫЕ ДАННЫЕ ИЗ ЗАПРОСА
    const { text, langCode, voiceName, speechRate } = request.body.data;

    // 2. Проверка данных
    if (!text || !langCode) {
      console.error('Нет текста или кода языка');
      response.status(400).send({ error: 'Не предоставлен текст или код языка.' });
      return;
    }

    // 3. СОЗДАЕМ ДИНАМИЧЕСКИЙ ОБЪЕКТ ГОЛОСА
    const voiceConfig = {
      languageCode: langCode,
    };

    // Если пользователь выбрал НЕ "default", мы используем конкретное имя голоса.
    if (voiceName && voiceName !== 'default') {
      voiceConfig.name = voiceName;
    } else {
      // Иначе, просто просим "Нейтральный" пол (Google выберет лучший).
      voiceConfig.ssmlGender = 'NEUTRAL';
    }

    // 4. Формирование запроса к Google Cloud TTS
    const ttsRequest = {
      input: { text: text },
      voice: voiceConfig, // ✨ Используем наш новый voiceConfig
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: speechRate || 1.0, // ✨ Используем скорость (или 1.0 по умолчанию)
      },
    };

    try {
      // 5. Вызов API
      const [ttsResponse] = await ttsClient.synthesizeSpeech(ttsRequest);

      // 6. Отправка аудио обратно во Vue
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

/**
 * Функция Получение списка голосов
 * Получает: data.langCode
 */
export const getAvailableVoices = functions.https.onRequest((request, response) => {
  corsHandler(request, response, async () => {
    const { langCode } = request.body.data;

    if (!langCode) {
      console.error('Код языка не предоставлен для getAvailableVoices');
      return response.status(400).send({ error: 'Код языка не предоставлен.' });
    }

    try {
      // 1. Делаем запрос в Google API
      const [result] = await ttsClient.listVoices({ languageCode: langCode });

      // 2. ФИЛЬТРУЕМ СПИСОК
      // Оставляем ТОЛЬКО премиум-голоса (Wavenet или Neural2)
      const premiumVoices = result.voices.filter(
        (voice) => voice.name.includes('Wavenet') || voice.name.includes('Neural2')
      );

      // 3. Упрощаем отфильтрованный список
      const voices = premiumVoices.map((voice) => {
        return {
          name: voice.name, // e.g., "fi-FI-Wavenet-A"
          ssmlGender: voice.ssmlGender, // e.g., "FEMALE"
        };
      });

      // 4. Отправляем ТОЛЬКО ПРЕМИУМ голоса обратно во Vue
      response.send({ data: { voices: voices } });
    } catch (error) {
      console.error('Ошибка получения списка голосов:', error);
      response.status(500).send({ error: 'Не удалось получить список голосов.' });
    }
  });
});
