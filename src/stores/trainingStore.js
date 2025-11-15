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
    // ... можно добавить еще
  };
  return names[langCode] || 'English';
}

export const useTrainingStore = defineStore('training', {
  state: () => ({
    currentTrainingType: '',
    currentLineIndex: 0,
    recognition: null,
    isVoiceOver: false,
    isMicActive: false,
    recognitionText: '',
    formattedRecognitionText: '',
    geminiResult: '',
    isLoading: false,
    currentAudio: null,
  }),
  getters: {
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
    setCurrentTrainingType(type) {
      this.currentTrainingType = type;
    },
    startLevel() {
      this.stopSpeech();
      this.currentLineIndex = 0;
      this.resetLineState();
      if (this.currentTrainingType !== 'level-3') {
        setTimeout(() => this.playCurrentLineAudio(), 500);
      }
    },
    nextLine() {
      this.stopSpeech();
      const dialogStore = useDialogStore();
      if (this.currentLineIndex < dialogStore.currentDialog.fin.length - 1) {
        this.currentLineIndex++;
        this.resetLineState();
        if (this.currentTrainingType !== 'level-3') {
          this.playCurrentLineAudio();
        }
      } else {
        const uiStore = useUiStore();
        uiStore.showModal('endOfLevel');
      }
    },
    repeatLevel() {
      this.stopSpeech();
      this.startLevel();
    },
    resetLineState() {
      this.recognitionText = '';
      this.formattedRecognitionText = '';
      this.geminiResult = '';
    },
    playCurrentLineAudio() {
      const dialogStore = useDialogStore();
      const text = dialogStore.currentDialog?.fin[this.currentLineIndex];
      if (text) {
        this.playText(text);
      }
    },
    playProDemoVoice() {
      const settingsStore = useSettingsStore();
      const langName = settingsStore.learningLanguage;
      const demoText = getDemoPhrase(langName);
      this.playText(demoText, true);
    },
    async playText(text, forcePro = false) {
      if (!text) return;
      this.stopSpeech();

      const settingsStore = useSettingsStore();
      const userStore = useUserStore();
      const uiStore = useUiStore();
      const langCode = getLangCode(settingsStore.learningLanguage);

      const rate = settingsStore.speechRate;
      const voiceConfig = settingsStore.selectedVoiceConfig;

      const useProVoice = (userStore.isPro || forcePro) && !settingsStore.preferBrowserTTS;

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
    stopSpeech() {
      speechSynthesis.cancel();

      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio = null;
      }

      this.isVoiceOver = false;
    },
    togglePlayStop(text) {
      !this.isVoiceOver ? this.playText(text) : this.stopSpeech();
    },
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
      this.geminiResult = '';

      this.recognition = new SpeechRecognition();
      this.recognition.lang = langCode;
      this.recognition.continuous = true;
      this.recognition.interimResults = true;

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
            const { formattedText } = compareAndFormatTexts(finText, finalTranscript);
            this.formattedRecognitionText = formattedText;
          } else if (this.currentTrainingType === 'level-3') {
            this.checkUserTranslation(rusText, finText, level);
          }
        } else {
          this.recognitionText = '';
        }
      };
      this.recognition.start();
    },
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
    getPromptForTranslation(rusText, finText, level) {
      const settingsStore = useSettingsStore();
      const learningLanguage = settingsStore.learningLanguage;
      const uiLanguageName = getUiLanguageName(settingsStore.uiLanguage);

      const feedback_perfect = i18n.global.t('feedback.perfect');
      const feedback_natural = i18n.global.t('feedback.natural');
      const feedback_minor = i18n.global.t('feedback.minor');
      const feedback_wrong = i18n.global.t('feedback.wrong');

      return `
You are an expert ${learningLanguage} language tutor.
Your task is to evaluate a ${level} user's spoken ${learningLanguage} translation of a ${uiLanguageName} dialogue line.

You will receive three inputs:
1. Original ${uiLanguageName}: ${rusText}
2. Correct ${learningLanguage} (for reference): ${finText}
3. User's Spoken ${learningLanguage} (transcription): ${this.recognitionText}

Analyze the user's transcription.
Your entire response MUST be written in ${uiLanguageName}, in 2-3 sentences maximum.

Choose ONE of the following four response types:

1.  **If the translation is accurate AND natural:**
    (Respond with a variation of: "${feedback_perfect}")

2.  **If the translation is accurate BUT unnatural or too literal:**
    (Respond with a variation of: "${feedback_natural} [the more natural phrase in ${learningLanguage}].")

3.  **If the translation has minor errors:**
    (Respond with a variation of: "${feedback_minor} [the brief correction in ${learningLanguage}].")

4.  **If the translation is semantically wrong:**
    (Respond with a variation of: "${feedback_wrong} [the correct phrase in ${learningLanguage}].")
      `;
    },
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
    async checkUserTranslation(rusText, finText, level) {
      this.isLoading = true;
      this.geminiResult = '';
      try {
        const prompt = this.getPromptForTranslation(rusText, finText, level);

        // Вызываем Cloud Function
        const callGemini = httpsCallable(functions, 'callGemini');
        const response = await callGemini({
          prompt: prompt,
          operationType: 'translation',
        });

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
