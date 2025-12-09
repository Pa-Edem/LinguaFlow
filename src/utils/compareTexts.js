// src/utils/compareTexts.js
import { TRAINING_CONFIG } from '../config/trainingConfig';

/**
 * Функция для разделения текста на слова, пробелы и знаки препинания
 * @param {string} text - Исходный текст
 * @returns {Array<string>} - Массив частей текста
 */
function splitTextWithPunctuationAndSpaces(text) {
  return text.match(/\p{L}+|\s+|[.,!?;:]/gu);
}

/**
 * Функция для сравнения и форматирования текстов с градацией ошибок
 * @param {string} originalText - Оригинальная реплика
 * @param {string} recognizedText - Распознанная реплика
 * @returns {{formattedText: string, accuracy: number, details: object}}
 */
export function compareAndFormatTexts(originalText, recognizedText) {
  // 1. Разбиваем оригинал на части (слова, пробелы, пунктуация)
  const originalParts = splitTextWithPunctuationAndSpaces(originalText);

  // 2. Извлекаем только слова из оригинала
  const originalWords = originalParts.filter((part) => /\p{L}+/u.test(part));

  // 3. Извлекаем слова из распознанного текста (игнорируем пунктуацию)
  const recognizedWords = (recognizedText.match(/\p{L}+/gu) || []).map((word) => word.toLowerCase());

  const m = originalWords.length;
  const n = recognizedWords.length;

  // 4. Алгоритм Левенштейна (динамическое программирование)
  const dp = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));
  const path = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(null));

  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = originalWords[i - 1].toLowerCase() === recognizedWords[j - 1].toLowerCase() ? 0 : 1;
      const deletion = dp[i - 1][j] + 1;
      const insertion = dp[i][j - 1] + 1;
      const substitution = dp[i - 1][j - 1] + cost;

      const min = Math.min(deletion, insertion, substitution);
      dp[i][j] = min;

      if (min === substitution) {
        path[i][j] = 'substitution';
      } else if (min === deletion) {
        path[i][j] = 'deletion';
      } else {
        path[i][j] = 'insertion';
      }
    }
  }

  // 5. Восстанавливаем путь (matching)
  const matches = [];
  let i = m,
    j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && path[i][j] === 'substitution') {
      const isCorrect = originalWords[i - 1].toLowerCase() === recognizedWords[j - 1];
      matches.unshift({
        type: isCorrect ? 'correct' : 'mismatch',
        original: originalWords[i - 1],
        recognized: recognizedWords[j - 1],
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || path[i][j] === 'insertion')) {
      matches.unshift({ type: 'insertion', recognized: recognizedWords[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || path[i][j] === 'deletion')) {
      matches.unshift({ type: 'deletion', original: originalWords[i - 1] });
      i--;
    }
  }

  // 6. Определяем тип ошибки для каждого слова (ЗЕЛЁНЫЙ/ЖЁЛТЫЙ/КРАСНЫЙ)
  const wordResults = matches
    .filter((match) => match.type !== 'insertion') // insertion не относится к оригиналу
    .map((match) => {
      if (match.type === 'correct') {
        return { type: 'correct', text: match.original };
      } else if (match.type === 'mismatch') {
        // Используем TRAINING_CONFIG для определения типа ошибки
        const errorType = TRAINING_CONFIG.getErrorType(match.original, match.recognized);
        return {
          type: errorType,
          text: match.original,
          recognized: match.recognized,
        };
      } else if (match.type === 'deletion') {
        // Слово пропущено = серьёзная ошибка
        return { type: 'major', text: match.original, recognized: null };
      }
    });

  // 7. Вычисляем точность
  const accuracy = TRAINING_CONFIG.calculateAccuracy(wordResults);

  // 8. Формируем HTML с цветной подсветкой
  let formattedText = '';
  let matchIndex = 0;
  let correctCount = 0;
  let minorCount = 0;
  let majorCount = 0;

  for (const part of originalParts) {
    if (/\p{L}+/u.test(part)) {
      // Это слово
      const match = matches[matchIndex];
      if (match) {
        let formattedWord = '';

        if (match.type === 'correct') {
          // 🟢 ЗЕЛЁНЫЙ — правильно
          correctCount++;
          formattedWord = match.original;
        } else if (match.type === 'mismatch') {
          // Определяем тип ошибки
          const errorType = TRAINING_CONFIG.getErrorType(match.original, match.recognized);

          if (errorType === 'correct') {
            // 🟢 ЗЕЛЁНЫЙ — игнорируемая разница (например, умляут)
            correctCount++;
            formattedWord = match.original;
          } else if (errorType === 'minor') {
            // 🟡 ЖЁЛТЫЙ — мелкая ошибка
            minorCount++;
            let displayWord = match.recognized;

            // Сохраняем регистр первой буквы
            if (part[0] === part[0].toUpperCase()) {
              displayWord = displayWord.charAt(0).toUpperCase() + displayWord.slice(1);
            }

            formattedWord = `<span style="color:#F9A825; font-weight: 500;">${displayWord}</span>`;
          } else {
            // 🔴 КРАСНЫЙ — серьёзная ошибка
            majorCount++;
            let displayWord = match.recognized;

            if (part[0] === part[0].toUpperCase()) {
              displayWord = displayWord.charAt(0).toUpperCase() + displayWord.slice(1);
            }

            formattedWord = `<span style="color:#C62828; font-weight: 600;">${displayWord}</span>`;
          }
        } else if (match.type === 'deletion') {
          // 🔴 КРАСНЫЙ — слово пропущено
          majorCount++;
          formattedWord = `<span style="color:#C62828; font-weight: 600; text-decoration: line-through;">${part}</span>`;
        }

        formattedText += formattedWord;
      }
      matchIndex++;
    } else {
      // Пробел или пунктуация — оставляем как есть
      formattedText += part;
    }
  }

  // 9. Добавляем лишние вставленные слова (insertion)
  while (matchIndex < matches.length) {
    if (matches[matchIndex].type === 'insertion') {
      majorCount++;
      formattedText += ` <span style="color:#C62828; font-weight: 600;">${matches[matchIndex].recognized}</span>`;
    }
    matchIndex++;
  }

  // 10. Возвращаем результат
  return {
    formattedText,
    accuracy,
    details: {
      correct: correctCount,
      minor: minorCount,
      major: majorCount,
      total: wordResults.length,
    },
  };
}

/**
 * Функция возвращает массив объектов, описывающих каждое слово
 * (для более детального анализа, если понадобится)
 * @param {string} originalText - Оригинальная реплика
 * @param {string} recognizedText - Распознанная реплика
 * @returns {{analysis: Array, score: number}}
 */
export function analyzeRecognition(originalText, recognizedText) {
  const originalParts = originalText.match(/(\w+)|(\s+)|[.,!?;:]/g) || [];
  const recognizedWords = recognizedText.toLowerCase().match(/\w+/g) || [];

  const result = [];
  let recIndex = 0;
  let correctCount = 0;

  originalParts.forEach((part) => {
    if (/\w+/.test(part)) {
      // Это слово
      if (recIndex < recognizedWords.length && part.toLowerCase() === recognizedWords[recIndex]) {
        result.push({ type: 'word', text: part, status: 'correct' });
        correctCount++;
      } else {
        result.push({ type: 'word', text: part, status: 'incorrect' });
      }
      recIndex++;
    } else {
      // Пробел или пунктуация
      result.push({ type: 'separator', text: part });
    }
  });

  const score = Math.round((correctCount / (originalParts.filter((p) => /\w+/.test(p)).length || 1)) * 100);

  return { analysis: result, score };
}
