// src/utils/compareTexts.js

// Функция для разделения текста на слова, пробелы и знаки препинания
function splitTextWithPunctuationAndSpaces(text) {
  return text.match(/\p{L}+|\s+|[.,!?;:]/gu);
}

// Функция для сравнения и форматирования
export function compareAndFormatTexts(originalText, recognizedText) {
  const originalParts = splitTextWithPunctuationAndSpaces(originalText);
  const originalWords = originalParts.filter((part) => /\p{L}+/u.test(part));
  const recognizedWords = (recognizedText.match(/\p{L}+/gu) || []).map((word) => word.toLowerCase());

  const m = originalWords.length;
  const n = recognizedWords.length;
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

  let formattedText = '';
  let matchIndex = 0;
  let correctWordsCount = 0;

  for (const part of originalParts) {
    if (/\p{L}+/u.test(part)) {
      const match = matches[matchIndex];
      if (match) {
        if (match.type === 'correct') {
          correctWordsCount++;
          let formattedWord = match.original;
          formattedText += formattedWord;
        } else if (match.type === 'mismatch') {
          let formattedWord = match.recognized;
          if (part[0] === part[0].toUpperCase()) {
            formattedWord = formattedWord.charAt(0).toUpperCase() + formattedWord.slice(1);
          }
          formattedText += `<span style="color:#c62828; background-color: transparent;
  padding: 0;">&nbsp;${formattedWord}&nbsp;</span>`;
        } else if (match.type === 'deletion') {
          formattedText += `<span style="color:#c62828; background-color: transparent;
  padding: 0;">&nbsp;${part}&nbsp;</span>`;
        }
      }
      matchIndex++;
    } else {
      formattedText += part;
    }
  }

  while (matchIndex < matches.length) {
    if (matches[matchIndex].type === 'insertion') {
      formattedText += ` <span style="color:#c62828; background-color: transparent;
  padding: 0;">&nbsp;${matches[matchIndex].recognized}&nbsp;</span>`;
    }
    matchIndex++;
  }

  return { formattedText };
}

// Функция возвращает массив объектов, описывающих каждое слово
export function analyzeRecognition(originalText, recognizedText) {
  const originalParts = originalText.match(/(\w+)|(\s+)|[.,!?;:]/g) || [];
  const recognizedWords = recognizedText.toLowerCase().match(/\w+/g) || [];

  const result = [];
  let recIndex = 0;
  let correctCount = 0;

  originalParts.forEach((part) => {
    if (/\w+/.test(part)) {
      // Если это слово
      if (recIndex < recognizedWords.length && part.toLowerCase() === recognizedWords[recIndex]) {
        result.push({ type: 'word', text: part, status: 'correct' });
        correctCount++;
      } else {
        // Просто помечаем оригинальное слово как неправильное
        result.push({ type: 'word', text: part, status: 'incorrect' });
      }
      recIndex++;
    } else {
      // Если это пробел или пунктуация
      result.push({ type: 'separator', text: part });
    }
  });

  const score = Math.round((correctCount / (originalParts.filter((p) => /\w+/.test(p)).length || 1)) * 100);

  return { analysis: result, score };
}
