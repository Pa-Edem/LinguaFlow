// src/utils/compareTexts.js
import { TRAINING_CONFIG } from '../config/trainingConfig';

/**
 * Проверить является ли слово аббревиатурой
 * Аббревиатура = 2-3 заглавные буквы подряд (WC, OK, TV, EU, USA, etc.)
 * @param {string} word - Слово для проверки
 * @returns {boolean} - true если это аббревиатура
 */
function isAbbreviation(word) {
  return /^[A-ZА-Я]{2,3}$/u.test(word);
}

/**
 * Вычислить расстояние Левенштейна между двумя строками
 * @param {string} a - Первая строка
 * @param {string} b - Вторая строка
 * @returns {number} - Расстояние Левенштейна
 */
function levenshteinDistance(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // замена
          matrix[i][j - 1] + 1, // вставка
          matrix[i - 1][j] + 1 // удаление
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Функция для разделения текста на слова, пробелы и знаки препинания
 * @param {string} text - Исходный текст
 * @returns {Array<string>} - Массив частей текста
 */
function splitTextWithPunctuationAndSpaces(text) {
  return text.match(/\p{L}+|\s+|[.,!?;:]/gu);
}

/**
 * Попытка найти совпадение с учётом составных слов
 * @param {Array<string>} originalWords - Массив оригинальных слов
 * @param {Array<string>} recognizedWords - Массив распознанных слов
 * @param {number} i - Индекс в оригинале
 * @param {number} j - Индекс в распознанном
 * @returns {object|null} - {type, consumed_original, consumed_recognized} или null
 */
function tryCompoundMatch(originalWords, recognizedWords, i, j) {
  const origWord = originalWords[i].toLowerCase();
  const recWord = recognizedWords[j].toLowerCase();

  // 1. ТОЧНОЕ СОВПАДЕНИЕ
  if (origWord === recWord) {
    return {
      type: 'exact',
      consumed_original: 1,
      consumed_recognized: 1,
    };
  }

  // 2. АББРЕВИАТУРА (не проверяем вообще)
  if (isAbbreviation(originalWords[i])) {
    console.log(`🔤 Аббревиатура обнаружена: "${originalWords[i]}" → автоматически ПРАВИЛЬНО`);
    return {
      type: 'abbreviation',
      consumed_original: 1,
      consumed_recognized: 1,
    };
  }

  // 3. СЛУЧАЙ 1: Оригинал БОЛЬШЕ (склейка в распознанном)
  // Пример: ['totta', 'kai'] → ['tottakai']
  if (i + 1 < originalWords.length) {
    const nextOrigWord = originalWords[i + 1].toLowerCase();

    // Проверяем: начинается ли распознанное слово с текущего оригинального?
    if (recWord.startsWith(origWord)) {
      const remainder = recWord.slice(origWord.length);

      // Точное совпадение остатка
      if (remainder === nextOrigWord) {
        console.log(
          `✅ СОСТАВНОЕ (склейка): "${originalWords[i]}" + "${originalWords[i + 1]}" = "${recognizedWords[j]}"`
        );
        return {
          type: 'compound_merge',
          consumed_original: 2,
          consumed_recognized: 1,
        };
      }

      // Допуск на опечатку в остатке (Левенштейн ≤ 1 для коротких, ≤ 2 для длинных)
      const distance = levenshteinDistance(remainder, nextOrigWord);
      const threshold = nextOrigWord.length <= 5 ? 1 : 2;

      if (distance <= threshold) {
        console.log(
          `⚠️ СОСТАВНОЕ (склейка с опечаткой): "${originalWords[i]}" + "${originalWords[i + 1]}" ≈ "${
            recognizedWords[j]
          }" (Левенштейн: ${distance})`
        );
        return {
          type: 'compound_merge_typo',
          consumed_original: 2,
          consumed_recognized: 1,
        };
      }
    }
  }

  // 4. СЛУЧАЙ 2: Оригинал МЕНЬШЕ (разбивка в распознанном)
  // Пример: ['maitohyllyllä'] → ['maito', 'hyllyllä']
  if (j + 1 < recognizedWords.length) {
    const nextRecWord = recognizedWords[j + 1].toLowerCase();

    // Проверяем: начинается ли оригинальное слово с текущего распознанного?
    if (origWord.startsWith(recWord)) {
      const remainder = origWord.slice(recWord.length);

      // Точное совпадение остатка
      if (remainder === nextRecWord) {
        console.log(
          `✅ СОСТАВНОЕ (разбивка): "${originalWords[i]}" = "${recognizedWords[j]}" + "${
            recognizedWords[j + 1]
          }" → показываем "${originalWords[i]}"`
        );
        return {
          type: 'compound_split',
          consumed_original: 1,
          consumed_recognized: 2,
        };
      }

      // Допуск на опечатку в остатке
      const distance = levenshteinDistance(remainder, nextRecWord);
      const threshold = nextRecWord.length <= 5 ? 1 : 2;

      if (distance <= threshold) {
        console.log(
          `⚠️ СОСТАВНОЕ (разбивка с опечаткой): "${originalWords[i]}" ≈ "${recognizedWords[j]}" + "${
            recognizedWords[j + 1]
          }" (Левенштейн: ${distance}) → показываем "${originalWords[i]}"`
        );
        return {
          type: 'compound_split_typo',
          consumed_original: 1,
          consumed_recognized: 2,
        };
      }
    }
  }

  // 5. НЕ НАШЛИ СОСТАВНОГО → возвращаем null
  return null;
}

/**
 * Функция для сравнения и форматирования текстов с поддержкой составных слов
 * @param {string} originalText - Оригинальная реплика
 * @param {string} recognizedText - Распознанная реплика
 * @returns {{formattedText: string, accuracy: number, details: object}}
 */
export function compareAndFormatTexts(originalText, recognizedText) {
  // 🔍 ЛОГИРОВАНИЕ: Входные данные
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎯 СРАВНЕНИЕ ТЕКСТОВ');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 Оригинал:', originalText);
  console.log('🎤 Распознано:', recognizedText);
  console.log('');

  // 1. Разбиваем оригинал на части (слова, пробелы, пунктуация)
  const originalParts = splitTextWithPunctuationAndSpaces(originalText);

  // 2. Извлекаем только слова из оригинала
  const originalWords = originalParts.filter((part) => /\p{L}+/u.test(part));

  // 3. Извлекаем слова из распознанного текста (игнорируем пунктуацию)
  const recognizedWords = (recognizedText.match(/\p{L}+/gu) || []).map((word) => word.toLowerCase());

  // 🔍 ЛОГИРОВАНИЕ: Извлечённые слова
  console.log('📌 Слова из оригинала:', originalWords);
  console.log('📌 Слова из распознанного:', recognizedWords);
  console.log('📊 Количество слов: оригинал =', originalWords.length, ', распознано =', recognizedWords.length);
  console.log('');

  // 4. НОВЫЙ АЛГОРИТМ: Поиск совпадений с учётом составных слов
  const matches = [];
  let i = 0; // индекс в оригинале
  let j = 0; // индекс в распознанном

  console.log('🔬 ДЕТАЛЬНЫЙ АНАЛИЗ СЛОВ:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  while (i < originalWords.length || j < recognizedWords.length) {
    // Если закончились оригинальные слова → остались только вставки
    if (i >= originalWords.length) {
      console.log(`➕ Вставка: "${recognizedWords[j]}" (лишнее слово)`);
      matches.push({
        type: 'insertion',
        recognized: recognizedWords[j],
      });
      j++;
      continue;
    }

    // Если закончились распознанные слова → остались только пропуски
    if (j >= recognizedWords.length) {
      console.log(`❌ Пропуск: "${originalWords[i]}" (слово пропущено)`);
      matches.push({
        type: 'deletion',
        original: originalWords[i],
      });
      i++;
      continue;
    }

    // Пытаемся найти совпадение (с учётом составных слов)
    const match = tryCompoundMatch(originalWords, recognizedWords, i, j);

    if (match) {
      // ✅ НАШЛИ СОВПАДЕНИЕ
      if (match.type === 'exact') {
        console.log(`✅ Слово: "${originalWords[i]}" = ПРАВИЛЬНО`);
        matches.push({
          type: 'correct',
          original: originalWords[i],
          recognized: recognizedWords[j],
        });
      } else if (match.type === 'abbreviation') {
        matches.push({
          type: 'correct',
          original: originalWords[i],
          recognized: recognizedWords[j],
          isAbbreviation: true,
        });
      } else if (match.type === 'compound_merge' || match.type === 'compound_merge_typo') {
        // Склейка: ['totta', 'kai'] → ['tottakai']
        matches.push({
          type: 'correct',
          original: originalWords[i],
          recognized: recognizedWords[j],
          isCompound: true,
        });
        matches.push({
          type: 'correct',
          original: originalWords[i + 1],
          recognized: null, // уже учтено в предыдущем
          isCompound: true,
        });
      } else if (match.type === 'compound_split' || match.type === 'compound_split_typo') {
        // Разбивка: ['maitohyllyllä'] → ['maito', 'hyllyllä']
        // ВАЖНО: Показываем ОРИГИНАЛЬНОЕ слово целиком!
        matches.push({
          type: 'correct',
          original: originalWords[i],
          recognized: originalWords[i], // ← ПОКАЗЫВАЕМ ОРИГИНАЛ, НЕ РАСПОЗНАННОЕ!
          isCompound: true,
          compoundParts: [recognizedWords[j], recognizedWords[j + 1]], // Для отладки
        });
      }

      i += match.consumed_original;
      j += match.consumed_recognized;
    } else {
      // ❌ НЕ НАШЛИ СОВПАДЕНИЕ → обычная проверка (mismatch)
      const errorType = TRAINING_CONFIG.getErrorType(originalWords[i], recognizedWords[j]);
      const emoji = errorType === 'correct' ? '✅' : errorType === 'minor' ? '⚠️' : '❌';
      console.log(`${emoji} Слово: "${originalWords[i]}" → "${recognizedWords[j]}" (тип: ${errorType})`);

      matches.push({
        type: 'mismatch',
        original: originalWords[i],
        recognized: recognizedWords[j],
        errorType: errorType,
      });

      i++;
      j++;
    }
  }

  console.log('');

  // 5. Вычисляем точность
  const wordResults = matches
    .filter((match) => match.type !== 'insertion')
    .map((match) => {
      if (match.type === 'correct') {
        return { type: 'correct', text: match.original };
      } else if (match.type === 'mismatch') {
        return {
          type: match.errorType,
          text: match.original,
          recognized: match.recognized,
        };
      } else if (match.type === 'deletion') {
        return { type: 'major', text: match.original, recognized: null };
      }
    });

  const accuracy = TRAINING_CONFIG.calculateAccuracy(wordResults);

  // 6. Формируем HTML с цветной подсветкой
  let formattedText = '';
  let matchIndex = 0;
  let correctCount = 0;
  let minorCount = 0;
  let majorCount = 0;

  for (const part of originalParts) {
    if (/\p{L}+/u.test(part)) {
      // Это слово
      const match = matches[matchIndex];
      if (match && match.recognized !== null) {
        // Пропускаем слова где recognized = null (уже учтены в составном)
        let formattedWord = '';

        if (match.type === 'correct') {
          // 🟢 ЗЕЛЁНЫЙ — правильно (включая составные и аббревиатуры)
          correctCount++;
          let displayWord = match.recognized || match.original;

          // Сохраняем регистр первой буквы
          if (part[0] === part[0].toUpperCase()) {
            displayWord = displayWord.charAt(0).toUpperCase() + displayWord.slice(1);
          }

          formattedWord = displayWord;
        } else if (match.type === 'mismatch') {
          const errorType = match.errorType;

          if (errorType === 'correct') {
            // 🟢 ЗЕЛЁНЫЙ — игнорируемая разница
            correctCount++;
            formattedWord = match.original;
          } else if (errorType === 'minor') {
            // 🟡 ЖЁЛТЫЙ — мелкая ошибка
            minorCount++;
            let displayWord = match.recognized;

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

  // 7. Добавляем лишние вставленные слова
  const insertions = matches.filter((m) => m.type === 'insertion');
  insertions.forEach((insertion) => {
    majorCount++;
    formattedText += ` <span style="color:#C62828; font-weight: 600;">${insertion.recognized}</span>`;
  });

  // 8. Возвращаем результат
  const result = {
    formattedText,
    accuracy,
    details: {
      correct: correctCount,
      minor: minorCount,
      major: majorCount,
      total: wordResults.length,
    },
  };

  // 🔍 ЛОГИРОВАНИЕ: Итоговый результат
  console.log('📊 ИТОГОВЫЙ РЕЗУЛЬТАТ:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Правильно: ${correctCount} слов`);
  console.log(`⚠️ Мелкие ошибки: ${minorCount} слов`);
  console.log(`❌ Грубые ошибки: ${majorCount} слов`);
  console.log(`📈 Точность: ${accuracy}%`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  return result;
}

/**
 * Функция возвращает массив объектов, описывающих каждое слово
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
      if (recIndex < recognizedWords.length && part.toLowerCase() === recognizedWords[recIndex]) {
        result.push({ type: 'word', text: part, status: 'correct' });
        correctCount++;
      } else {
        result.push({ type: 'word', text: part, status: 'incorrect' });
      }
      recIndex++;
    } else {
      result.push({ type: 'separator', text: part });
    }
  });

  const score = Math.round((correctCount / (originalParts.filter((p) => /\w+/.test(p)).length || 1)) * 100);

  return { analysis: result, score };
}
