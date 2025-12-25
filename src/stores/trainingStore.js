//src/stores/trainingStore.js
import { defineStore } from 'pinia';
import i18n from '../i18n';
import { marked } from 'marked';
import { useDialogStore } from './dialogStore';
import { useSettingsStore } from './settingsStore';
import { useUiStore } from './uiStore';
import { useUserStore } from './userStore';
import { compareAndFormatTexts } from '../utils/compareTexts';
import { getLangCode, getDemoPhrase } from '../utils/languageUtils';
import { functions, httpsCallable } from '../firebase';

/**
 * Получить название языка интерфейса по коду
 * @param {string} langCode - Код языка (en, ru, fi, etc.)
 * @returns {string} - Название языка на английском
 */
function getUiLanguageName(langCode) {
  const names = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    ru: 'Russian',
    pt: 'Portuguese',
    nl: 'Dutch',
    sv: 'Swedish',
    pl: 'Polish',
    uk: 'Ukrainian',
    cs: 'Czech',
    hu: 'Hungarian',
    fi: 'Finnish',
    no: 'Norwegian',
    da: 'Danish',
    ro: 'Romanian',
    hr: 'Croatian',
    sl: 'Slovene',
    sr: 'Serbian',
  };
  return names[langCode] || 'English';
}

export const useTrainingStore = defineStore('training', {
  state: () => ({
    currentTrainingType: '', // Текущий тип тренировки: 'level-1', 'level-2', 'level-3', 'level-4'
    currentLineIndex: 0, // Индекс текущей реплики в диалоге (0 - первая реплика)
    recognition: null, // Объект SpeechRecognition (распознавание речи)
    isVoiceOver: false, // Идёт ли озвучка текста (TTS)
    isMicActive: false, // Активен ли микрофон (идёт ли запись)
    canUseMic: true, // Можно ли использовать микрофон (блокировка после распознавания)
    recognitionText: '', // Текст распознанной речи
    formattedRecognitionText: '', // Форматированный текст с подсветкой ошибок (HTML)
    currentAccuracy: 0, // Точность текущей реплики (0-100%)
    geminiResult: '', // Результат от Gemini AI (анализ диалога или проверка перевода)
    isLoading: false, // Идёт ли загрузка (вызов Cloud Function)
    currentAudio: null, // Текущий Audio объект для PRO озвучки
  }),
  getters: {
    /**
     * Получить варианты ответов для квиза (Level-4)
     * Возвращает массив из 4 объектов: 1 правильный + 3 неправильных
     * @returns {Array} - [{text: string, correct: boolean}, ...]
     */
    currentQuizOptions(state) {
      const dialogStore = useDialogStore();
      const dialog = dialogStore.currentDialog;
      if (!dialog || !dialog.options || !dialog.options[state.currentLineIndex]) {
        return [];
      }
      const correctAnswer = { text: dialog.rus[state.currentLineIndex], correct: true };
      const incorrectOptions = dialog.options[state.currentLineIndex].map((o) => ({ text: o, correct: false }));
      const allOptions = [correctAnswer, ...incorrectOptions];

      return allOptions.sort(() => Math.random() - 0.5);
    },
  },
  actions: {
    /**
     * Установить текущий тип тренировки
     * @param {string} type - 'level-1', 'level-2', 'level-3', 'level-4'
     */
    setCurrentTrainingType(type) {
      this.currentTrainingType = type;
    },
    /**
     * Остановить озвучку (TTS) и аудио
     * Останавливает как браузерную озвучку, так и PRO (Google Cloud TTS)
     */
    stopSpeech() {
      speechSynthesis.cancel();
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio = null;
      }
      this.isVoiceOver = false;
    },
    /**
     * Сбросить состояние текущей реплики
     * Очищает распознанный текст, точность, результаты AI
     * Разрешает использование микрофона
     */
    resetLineState() {
      this.recognitionText = '';
      this.formattedRecognitionText = '';
      this.currentAccuracy = 0;
      this.geminiResult = '';
      this.canUseMic = true;
    },
    /**
     * Начать тренировку с первой реплики
     * Сбрасывает индекс, состояние, воспроизводит первую реплику
     */
    startLevel() {
      this.stopSpeech();
      this.currentLineIndex = 0;
      this.canUseMic = true;
      this.resetLineState();
      if (this.currentTrainingType !== 'level-3') {
        setTimeout(() => this.playCurrentLineAudio(), 500);
      }
    },
    /**
     * Перейти к следующей реплике
     * Если это последняя реплика → показать модалку завершения
     * Иначе → увеличить индекс, сбросить состояние, воспроизвести следующую
     */
    nextLine() {
      this.stopSpeech();
      const dialogStore = useDialogStore();

      if (this.currentLineIndex < dialogStore.currentDialog.fin.length - 1) {
        // ✅ НЕ последняя реплика → переход на следующую
        this.currentLineIndex++;
        this.resetLineState();
        if (this.currentTrainingType !== 'level-3') {
          this.playCurrentLineAudio();
        }
      } else {
        // ✅ ПОСЛЕДНЯЯ РЕПЛИКА → генерируем событие для Level_2.vue
        if (this.currentTrainingType === 'level-2' || this.currentTrainingType === 'level-3') {
          // Для Level-2 и Level-3 — вызываем completeTraining через событие
          window.dispatchEvent(new CustomEvent('completeTraining'));
        } else {
          // Для Level-1 и Level-4 — стандартная модалка
          const uiStore = useUiStore();
          uiStore.showModal('endOfLevel');
        }
      }
    },
    /**
     * Повторить диалог с начала
     * Разрешает микрофон, останавливает озвучку, начинает с первой реплики
     */
    repeatLevel() {
      this.canUseMic = true;
      this.stopSpeech();
      this.startLevel();
    },
    /**
     * Воспроизвести текущую реплику (озвучка)
     * Разрешает микрофон, воспроизводит финский текст текущей реплики
     */
    playCurrentLineAudio() {
      this.canUseMic = true;
      const dialogStore = useDialogStore();
      const text = dialogStore.currentDialog?.fin[this.currentLineIndex];
      if (text) {
        this.playText(text);
      }
    },
    /**
     * Воспроизвести демо-фразу для PRO голоса
     * Используется в настройках для прослушивания разных голосов
     */
    playProDemoVoice() {
      const settingsStore = useSettingsStore();
      const langName = settingsStore.learningLanguage;
      const demoText = getDemoPhrase(langName);
      this.playText(demoText, true);
    },
    /**
     * Озвучить текст (TTS)
     * @param {string} text - Текст для озвучки
     * @param {boolean} forcePro - Принудительно использовать PRO голос (для демо)
     *
     * Логика:
     * - Если PRO/PREMIUM и НЕ выбрана браузерная озвучка → Google Cloud TTS (PRO)
     * - Иначе → браузерная озвучка (FREE)
     */
    async playText(text, forcePro = false) {
      if (!text) return;
      this.stopSpeech();

      const settingsStore = useSettingsStore();
      const userStore = useUserStore();
      const uiStore = useUiStore();
      const langCode = getLangCode(settingsStore.learningLanguage);

      const rate = settingsStore.speechRate;
      const voiceConfig = settingsStore.selectedVoiceConfig;

      const useProVoice = (userStore.isPro || userStore.isPremium || forcePro) && !settingsStore.preferBrowserTTS;

      // Проверяем, нужно ли использовать PRO-голос
      if (useProVoice) {
        // === PRO (Google Cloud TTS) ===
        this.isVoiceOver = true;
        try {
          const getSpeech = httpsCallable(functions, 'getSpeech');

          const response = await getSpeech({
            text: text,
            langCode: langCode,
            speechRate: rate,
            voiceName: voiceConfig.name,
            pitch: voiceConfig.pitch,
          });

          const audioData = response.data.audioContent;
          const audio = new Audio('data:audio/mp3;base64,' + audioData);

          this.currentAudio = audio;
          audio.play();

          audio.onended = () => {
            this.isVoiceOver = false;
            this.currentAudio = null;
          };
        } catch (error) {
          console.error('❌ Ошибка TTS:', error);
          uiStore.showToast(i18n.global.t('store.ttsError'), 'error');
          this.isVoiceOver = false;
          this.currentAudio = null;
        }
      } else {
        // === FREE (Браузерная озвучка) ===
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langCode;
        utterance.rate = rate;
        utterance.pitch = voiceConfig.pitch;
        speechSynthesis.speak(utterance);

        utterance.onstart = () => {
          this.isVoiceOver = true;
        };
        utterance.onend = () => {
          this.isVoiceOver = false;
        };
      }
    },
    /**
     * Переключить воспроизведение/остановку озвучки
     * @param {string} text - Текст для озвучки
     * Если озвучка идёт → остановить, иначе → начать
     */
    togglePlayStop(text) {
      !this.isVoiceOver ? this.playText(text) : this.stopSpeech();
    },
    /**
     * Переключить запись речи (микрофон)
     * Если микрофон активен → остановить запись
     * Иначе → начать запись и распознавание речи
     *
     * Логика:
     * 1. Нажатие 1: начать запись (isMicActive = true)
     * 2. Нажатие 2: остановить запись → распознавание → результат
     * 3. После распознавания: canUseMic = false (блокировка)
     */
    toggleSpeechRecognition() {
      if (this.recognition) {
        this.recognition.stop();
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        const uiStore = useUiStore();
        uiStore.showToast(i18n.global.t('store.noSpeechApi'), 'error');
        return;
      }

      const dialogStore = useDialogStore();
      const currentDialog = dialogStore.currentDialog;
      if (!currentDialog) return;

      const finText = currentDialog.fin[this.currentLineIndex];
      const rusText = currentDialog.rus[this.currentLineIndex];
      const level = currentDialog.level;

      const settingsStore = useSettingsStore();
      const langCode = getLangCode(settingsStore.learningLanguage);

      this.recognitionText = '';
      this.formattedRecognitionText = '';
      this.currentAccuracy = 0;
      this.geminiResult = '';

      this.recognition = new SpeechRecognition();
      this.recognition.lang = langCode;
      this.recognition.continuous = true; // Непрерывная запись
      this.recognition.interimResults = false; // Промежуточные результаты

      this.recognition.onstart = () => {
        this.isMicActive = true;
        this.recognitionText = i18n.global.t('store.listening');
      };

      this.recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = 0; i < event.results.length; ++i) {
          finalTranscript += event.results[i][0].transcript;
        }
        this.recognitionText = finalTranscript;
      };

      this.recognition.onerror = (event) => {
        const message = i18n.global.t('store.errRec');
        console.error(message, event.error);
        this.recognitionText = i18n.global.t('store.error');
        this.isMicActive = false;
        this.recognition = null;
      };

      this.recognition.onend = () => {
        this.isMicActive = false;
        this.recognition = null;

        const finalTranscript = this.recognitionText.trim();

        if (finalTranscript && finalTranscript !== i18n.global.t('store.listening')) {
          if (this.currentTrainingType === 'level-2') {
            const result = compareAndFormatTexts(finText, finalTranscript);
            this.formattedRecognitionText = result.formattedText;
            this.currentAccuracy = result.accuracy; // ✅ НОВОЕ: сохраняем точность
            console.log(`✅ Точность реплики: ${result.accuracy}%`, result.details);
            // ✅ БЛОКИРУЕМ микрофон после распознавания
            this.canUseMic = false;
          } else if (this.currentTrainingType === 'level-3') {
            this.checkUserTranslation(rusText, finText, level);
            // ✅ БЛОКИРУЕМ микрофон после распознавания
            this.canUseMic = false;
          }
        } else {
          this.recognitionText = '';
        }
      };
      this.recognition.start();
    },
    /**
     * Сгенерировать и создать новый диалог через AI
     * @param {object} creationParams - Параметры создания диалога
     *   {topic, level, replicas, words}
     * @returns {string|null} - ID созданного диалога или null при ошибке
     *
     * Процесс:
     * 1. Формируем промпт для Gemini
     * 2. Вызываем Cloud Function 'callGemini'
     * 3. Парсим JSON ответ
     * 4. Создаём диалог в Firestore
     * 5. Перезагружаем счётчики использования
     */
    async generateAndCreateDialog(creationParams) {
      this.isLoading = true;
      try {
        const prompt = this.getPromptForNewDialog(creationParams);

        // Вызываем Cloud Function
        const callGemini = httpsCallable(functions, 'callGemini');
        const response = await callGemini({
          prompt: prompt,
          operationType: 'generateDialog',
        });
        const responseText = response.data.text;

        const cleanJsonString = responseText.trim().replace(/```json|```/g, '');
        const dialogData = JSON.parse(cleanJsonString);

        // ✨ ПРЕОБРАЗУЕМ НОВЫЕ КЛЮЧИ В СТАРЫЕ
        const dataForDb = {
          fin: dialogData.langLearn,
          rus: dialogData.langNative,
          options: dialogData.options,
          culturalNote: dialogData.culturalNote,
        };

        const dialogStore = useDialogStore();
        // Передаем понятные для createDialog данные
        const newDialogId = await dialogStore.createDialog(dataForDb, creationParams);

        // ✅ Перезагружаем счётчики после успешного создания
        if (newDialogId) {
          const settingsStore = useSettingsStore();
          await settingsStore.loadUsageStats();
        }

        return newDialogId;
      } catch (error) {
        console.error('Ошибка генерации диалога:', error);

        // Показываем понятное сообщение об ошибке
        const uiStore = useUiStore();
        if (error.message && error.message.includes('лимит')) {
          uiStore.showToast(error.message, 'error');
        } else {
          uiStore.showToast('Не удалось сгенерировать диалог', 'error');
        }

        return null;
      } finally {
        this.isLoading = false;
      }
    },
    /**
     * Получить анализ диалога от AI
     * Анализирует словарный запас, грамматику, идиомы, прагматику
     *
     * Процесс:
     * 1. Проверяем есть ли сохранённый анализ
     * 2. Если нет → вызываем Cloud Function
     * 3. Форматируем результат (Markdown → HTML)
     * 4. Сохраняем анализ в диалог
     * 5. Перезагружаем счётчики
     */
    async fetchDialogAnalysis() {
      const dialogStore = useDialogStore();
      const dialog = dialogStore.currentDialog;
      if (!dialog) return;

      if (dialog.analysis) {
        this.geminiResult = dialog.analysis;
        return;
      }

      this.isLoading = true;
      this.geminiResult = '';
      try {
        const fullDialogText = dialog.fin.join('\n');
        const prompt = this.getPromptInfo(fullDialogText, dialog.level);

        // Вызываем Cloud Function
        const callGemini = httpsCallable(functions, 'callGemini');
        const response = await callGemini({
          prompt: prompt,
          operationType: 'analysis',
        });
        const rawResult = response.data.text;

        const formattedResult = marked.parse(rawResult);
        this.geminiResult = formattedResult;
        await dialogStore.updateDialogAnalysis(dialog.id, formattedResult);

        // ✅ Перезагружаем счётчики
        const settingsStore = useSettingsStore();
        await settingsStore.loadUsageStats();
      } catch (error) {
        console.error('Ошибка анализа диалога:', error);
        const errorMessage = i18n.global.t('store.resultError');
        this.geminiResult = `<p>${errorMessage}</p>`;
      } finally {
        this.isLoading = false;
      }
    },
    /**
     * Сформировать промпт для генерации нового диалога
     * @param {object} params - {topic, level, replicas, words}
     * @returns {string} - Промпт для Gemini
     *
     * Промпт создаёт диалог с:
     * - Заданной темой и уровнем
     * - Нужным количеством реплик
     * - Включением указанных слов
     * - Культурной заметкой
     */
    getPromptForNewDialog(params) {
      // Получаем языки из настроек
      const settingsStore = useSettingsStore();
      const learningLanguage = settingsStore.learningLanguage; // e.g., "Finnish"
      const uiLanguage = settingsStore.uiLanguage; // e.g., "ru"
      const ton = settingsStore.ton;

      const { topic, level, replicas, words } = params;

      return `
Create a coherent short dialogue in ${learningLanguage} on the topic of "${topic}", with a parallel ${uiLanguage} translation for each line.

The dialogue MUST be realistic, practical, and reflect modern, everyday life situations.
The ${learningLanguage} dialogue should be at the language proficiency level ${level}, using vocabulary appropriate for that level.
The dialogue should use a level of formality corresponding to the parameter ${ton} (default "0" for neutral tone), where "-5" is very casual (everyday tone) and "5" is very formal (official tone).
The dialogue must naturally include common idioms and expressions currently used by native speakers.

IMPORTANT: If the proficiency level is B1.1 or higher, the dialogue MUST also include:
1. Appropriate colloquialisms (e.g., "puhekieli" for Finnish).
2. Specialized or professional terms related to the topic.

The entire dialogue must consist of exactly ${replicas} replicas (alternating speakers).
Incorporate all the following ${learningLanguage} words naturally: ${words}.

For each ${learningLanguage} replica, you must also generate three incorrect but plausible ${uiLanguage} translations. These incorrect options should be plausible distractors for a language learner.

Finally, add a single top-level JSON key named "culturalNote". This key should contain a brief (1-2 sentences) cultural or practical tip in ${uiLanguage} related to the dialogue's content, explaining a nuance that would help a person integrate into society (e.g., etiquette, common customs).

Output the response strictly in JSON format with four keys: "langLearn", "langNative", "options", and "culturalNote". Do not include any additional text or keys.

Example output format for a Finnish (learning) / Russian (native) request:
{
  "langLearn": ["Moi.", "Mitä kuuluu?"],
  "langNative": ["Привет.", "Как дела?"],
  "options": [
    ["Мой.", "Пока.", "Доброе утро."],
    ["Что включено?", "Как твое имя?", "Куда ты идешь?"]
  ],
  "culturalNote": "В Финляндии не принято задавать 'Как дела?', если вы не готовы слушать подробный и честный ответ."
}
    `;
    },
    /**
     * Сформировать промпт для проверки перевода (Level-3)
     * @param {string} rusText - Оригинальный русский текст
     * @param {string} finText - Правильный финский перевод (для справки)
     * @param {string} level - Уровень диалога
     * @returns {string} - Промпт для Gemini
     */
    getPromptForTranslation(rusText, finText, level) {
      const settingsStore = useSettingsStore();
      const learningLanguage = settingsStore.learningLanguage;
      const uiLanguageName = getUiLanguageName(settingsStore.uiLanguage);

      return `
You are a ${learningLanguage} tutor. Level: ${level}. UI language: ${uiLanguageName}.

Original (${uiLanguageName}): ${rusText}
Correct (${learningLanguage}): ${finText}
User said: ${this.recognitionText}

Response format (in ${uiLanguageName}):
PERFECT: [phrase]
GOOD: [better variant]
CLOSE: Replace 'X' with 'Y'
WRONG: [correct phrase]

Rules:
- PERFECT = exact meaning + natural
- GOOD = correct meaning, unnatural phrasing
- CLOSE = minor mistakes
- WRONG = different meaning
- Response in ${uiLanguageName} only
- Кeywords (PERFECT, GOOD, CLOSE, INCORRECT) as is.
      `.trim();
    },
    /**
     * Сформировать промпт для анализа диалога
     * @param {string} fullDialogText - Полный текст диалога (все реплики)
     * @param {string} level - Уровень диалога
     * @returns {string} - Промпт для Gemini
     *
     * AI анализирует диалог по 4 направлениям:
     * 1. Интересная лексика
     * 2. Разговорные выражения и идиомы
     * 3. Грамматические особенности
     * 4. Прагматика и вежливость
     */
    getPromptInfo(fullDialogText, level) {
      if (!fullDialogText || fullDialogText.trim().length === 0) {
        return i18n.global.t('store.noData');
      }

      const settingsStore = useSettingsStore();
      const learningLanguage = settingsStore.learningLanguage;
      const uiLanguageName = getUiLanguageName(settingsStore.uiLanguage);

      return `
You are an expert ${learningLanguage} language tutor.
Analyze the following dialogue in ${learningLanguage}, assuming the user has a ${level} proficiency level.

Your task is to provide a concise analysis.
IMPORTANT: Your entire response, including all headings and explanations, MUST be written strictly in ${uiLanguageName}.

Focus the analysis on these four key areas (translate these headings into ${uiLanguageName}):

1.  **Interesting Vocabulary:** (Provide explanation in ${uiLanguageName})
2.  **Colloquialisms & Idioms:** (Provide explanation in ${uiLanguageName})
3.  **Grammatical Features:** (Provide explanation in ${uiLanguageName})
4.  **Pragmatics & Politeness:** (Provide explanation in ${uiLanguageName})

RULES:
- Respond ONLY in ${uiLanguageName}.
- Do NOT include a long introductory sentence.
- Do NOT quote full sentences from the dialogue.
- Format the output strictly using Markdown headings and bullet points.

Dialogue:
${fullDialogText}
      `;
    },
    /**
     * Проверить перевод пользователя через AI (Level-3)
     * @param {string} rusText - Оригинальный русский текст
     * @param {string} finText - Правильный финский перевод
     * @param {string} level - Уровень диалога
     *
     * Процесс:
     * 1. Формируем промпт с оригиналом, правильным переводом и переводом пользователя
     * 2. Вызываем Cloud Function
     * 3. Получаем обратную связь от AI
     * 4. Сохраняем в geminiResult
     * 5. Перезагружаем счётчики
     */
    async checkUserTranslation(rusText, finText, level) {
      this.isLoading = true;
      this.geminiResult = '';
      try {
        const prompt = this.getPromptForTranslation(rusText, finText, level);

        // ✅ Вызываем Cloud Function с БЫСТРОЙ моделью
        const callGemini = httpsCallable(functions, 'callGemini');
        const response = await callGemini({
          prompt: prompt,
          operationType: 'translation',
          modelType: 'fast', // ✅ ВАЖНО: используем gemini-1.5-flash (быстрая)
        });

        console.log('geminiResponseData', response.data);
        this.geminiResult = response.data.text;

        // ✅ Перезагружаем счётчики
        const settingsStore = useSettingsStore();
        await settingsStore.loadUsageStats();
      } catch (error) {
        console.error('Ошибка проверки перевода:', error);
        const errorMessage = i18n.global.t('store.trError');
        this.geminiResult = `<p>${errorMessage}</p>`;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
