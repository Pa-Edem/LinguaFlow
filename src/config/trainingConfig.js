// src/config/trainingConfig.js

export const TRAINING_CONFIG = {
  // ВЕСА ОШИБОК
  accuracy: {
    weights: {
      correct: 100, // 🟢 Правильно
      minor: 80, // 🟡 Мелкая ошибка
      major: 0, // 🔴 Серьёзная ошибка
    },
  },

  // ПОРОГИ ДЛЯ ПРОХОЖДЕНИЯ УРОВНЯ (completed = true)
  completion: {
    level2: {
      minReplicaAccuracy: 85,
      minDialogAccuracy: 90,
    },
    level3: {
      minReplicaAccuracy: 80,
      minDialogAccuracy: 80,
    },
    level4: {
      maxAllowedErrors: 1,
    },
  },

  // ПОРОГИ ДЛЯ "ТРЕНИРОВАЛСЯ" (attempted = true)
  attempted: {
    level2: {
      minAverageAccuracy: 50,
    },
    level3: {
      minAverageAccuracy: 50,
    },
    level4: {
      maxAllowedErrors: 6,
    },
  },

  // СИМВОЛЫ КОТОРЫЕ НЕ УЧИТЫВАЕМ (всегда считаем правильными)
  ignoreAsCorrect: {
    // УМЛЯУТЫ (Германские языки)
    ä: ['a', 'ae'],
    ö: ['o', 'oe'],
    ü: ['u', 'ue'],
    å: ['a', 'aa'],
    // АКЦЕНТЫ (Романские языки)
    // A с акцентами
    á: ['a'],
    à: ['a'],
    â: ['a'],
    ã: ['a'],
    // E с акцентами
    é: ['e'],
    è: ['e'],
    ê: ['e'],
    ë: ['e'],
    // I с акцентами
    í: ['i'],
    ì: ['i'],
    î: ['i'],
    ï: ['i'],
    // O с акцентами
    ó: ['o'],
    ò: ['o'],
    ô: ['o'],
    õ: ['o'],
    // U с акцентами
    ú: ['u'],
    ù: ['u'],
    û: ['u'],
    // Y с акцентами
    ý: ['y'],
    ÿ: ['y'],
    // СПЕЦИАЛЬНЫЕ СИМВОЛЫ
    ñ: ['n'], // Испанский
    ç: ['c'], // Французский, Португальский
    ß: ['ss'], // Немецкий (эсцет)
    æ: ['ae'], // Скандинавские
    ø: ['o'], // Скандинавские
    œ: ['oe'], // Французский
    // СЛАВЯНСКИЕ ЯЗЫКИ (чешский, польский, хорватский)
    č: ['c'],
    ć: ['c'],
    š: ['s'],
    ś: ['s'],
    ž: ['z'],
    ź: ['z'],
    ż: ['z'],
    đ: ['d'],
    ď: ['d'],
    ř: ['r'],
    ł: ['l'],
    ľ: ['l'],
    ň: ['n'],
    ń: ['n'],
    ť: ['t'],
    ě: ['e'],
    ů: ['u'],
    // КИРИЛЛИЦА (украинский, русский, сербский)
    є: ['e'],
    і: ['i'],
    ї: ['i'],
    ґ: ['g'],
    ј: ['j'],
    љ: ['lj'],
    њ: ['nj'],
    ћ: ['c'],
    џ: ['dz'],
    // ВЕНГЕРСКИЙ
    ő: ['o'],
    ű: ['u'],
    // РУМЫНСКИЙ
    ă: ['a'],
    ș: ['s'],
    ț: ['t'],
  },
  // МЕЛКИЕ ОШИБКИ (считаются как 80% точности)
  minorMistakes: {
    // ДВОЙНЫЕ СОГЛАСНЫЕ И ГЛАСНЫЕ
    doubles: {
      consonants: [
        'bb',
        'cc',
        'dd',
        'ff',
        'gg',
        'hh',
        'jj',
        'kk',
        'll',
        'mm',
        'nn',
        'pp',
        'rr',
        'ss',
        'tt',
        'vv',
        'ww',
        'zz',
      ],
      vowels: ['ää', 'aa', 'ee', 'ii', 'oo', 'uu'],
    },
    // МЯГКИЕ/ТВЁРДЫЕ ПАРЫ (voicing)
    voicing: [
      ['d', 't'],
      ['b', 'p'],
      ['g', 'k'],
      ['v', 'f'],
      ['z', 's'],
    ],
    // ДИФТОНГИ (по языкам)
    diphthongs: {
      // Финский (самые частые)
      finnish: [
        'ai',
        'ei',
        'oi',
        'ui',
        'yi',
        'äi',
        'öi',
        'au',
        'eu',
        'ou',
        'iu',
        'iy',
        'ey',
        'äy',
        'öy',
        'ie',
        'uo',
        'yö',
      ],
      // Немецкий
      german: ['ei', 'ie', 'eu', 'au', 'äu'],
      // Английский
      english: ['ea', 'ee', 'oo', 'ou', 'ow'],
      // Французский
      french: ['au', 'eau', 'eu', 'ou', 'oi', 'ai'],
      // Испанский
      spanish: ['ie', 'ue'],
      // Португальский
      portuguese: ['ão', 'õe'],
      // Нидерландский
      dutch: ['ij', 'ui', 'ou'],
      // Скандинавские (шведский, норвежский, датский)
      scandinavian: ['øy', 'au', 'øi'],
    },
  },

  /**
   * Нормализация слова (убрать диакритики для проверки на "зелёный")
   * @param {string} word - Исходное слово
   * @returns {string} - Нормализованное слово
   */
  normalizeWord(word) {
    let normalized = word.toLowerCase();
    // Применяем все правила из ignoreAsCorrect
    for (const [accented, plain] of Object.entries(this.ignoreAsCorrect)) {
      // Берём первый вариант замены (самый простой)
      const replacement = Array.isArray(plain) ? plain[0] : plain;
      normalized = normalized.replace(new RegExp(accented, 'g'), replacement);
    }
    return normalized;
  },

  /**
   * Проверка на мелкую ошибку (двойные буквы)
   * @param {string} original - Оригинальное слово
   * @param {string} recognized - Распознанное слово
   * @returns {boolean}
   */
  isDoubleMistake(original, recognized) {
    const orig = original.toLowerCase();
    const recog = recognized.toLowerCase();
    // Проверяем все двойные согласные
    for (const double of this.minorMistakes.doubles.consonants) {
      const single = double[0];
      if (
        (orig.includes(double) && recog.includes(single) && orig.replace(double, single) === recog) ||
        (recog.includes(double) && orig.includes(single) && recog.replace(double, single) === orig)
      ) {
        return true;
      }
    }
    // Проверяем все двойные гласные
    for (const double of this.minorMistakes.doubles.vowels) {
      const single = double[0];
      if (
        (orig.includes(double) && recog.includes(single) && orig.replace(double, single) === recog) ||
        (recog.includes(double) && orig.includes(single) && recog.replace(double, single) === orig)
      ) {
        return true;
      }
    }
    return false;
  },

  /**
   * Проверка на мягкие/твёрдые пары
   * @param {string} original - Оригинальное слово
   * @param {string} recognized - Распознанное слово
   * @returns {boolean}
   */
  isVoicingMistake(original, recognized) {
    const orig = original.toLowerCase();
    const recog = recognized.toLowerCase();
    for (const [char1, char2] of this.minorMistakes.voicing) {
      if (
        (orig.includes(char1) && recog.includes(char2) && orig.replace(new RegExp(char1, 'g'), char2) === recog) ||
        (orig.includes(char2) && recog.includes(char1) && orig.replace(new RegExp(char2, 'g'), char1) === recog)
      ) {
        return true;
      }
    }
    return false;
  },

  /**
   * Определение типа ошибки
   * @param {string} original - Оригинальное слово
   * @param {string} recognized - Распознанное слово
   * @returns {'correct' | 'minor' | 'major'}
   */
  getErrorType(original, recognized) {
    // 1. Точное совпадение
    if (original.toLowerCase() === recognized.toLowerCase()) {
      return 'correct';
    }
    // 2. Игнорируем диакритики (ЗЕЛЁНЫЙ)
    const normalizedOriginal = this.normalizeWord(original);
    const normalizedRecognized = this.normalizeWord(recognized);
    if (normalizedOriginal === normalizedRecognized) {
      return 'correct';
    }
    // 3. Мелкие ошибки (ЖЁЛТЫЙ)
    if (this.isDoubleMistake(original, recognized)) {
      return 'minor';
    }
    if (this.isVoicingMistake(original, recognized)) {
      return 'minor';
    }
    // 4. Серьёзная ошибка (КРАСНЫЙ)
    return 'major';
  },

  /**
   * Вычисление точности в процентах
   * @param {Array<{type: 'correct'|'minor'|'major'}>} words - Массив результатов по словам
   * @returns {number} - Точность от 0 до 100
   */
  calculateAccuracy(words) {
    if (words.length === 0) return 0;
    const total = words.reduce((sum, word) => {
      return sum + this.accuracy.weights[word.type];
    }, 0);
    return Math.round(total / words.length);
  },

  // Проверка: диалог выучен? (completed)
  isDialogCompleted(levelType, data) {
    if (levelType === 'level1') return false;
    // Level-2
    if (levelType === 'level2') {
      if (!data.replicaScores || data.replicaScores.length === 0) return false;
      const config = this.completion.level2;
      const allPassed = data.replicaScores.every((s) => s >= config.minReplicaAccuracy);
      const avgAccuracy = data.replicaScores.reduce((a, b) => a + b, 0) / data.replicaScores.length;
      return allPassed && avgAccuracy >= config.minDialogAccuracy;
    }
    // Level-3
    if (levelType === 'level3') {
      if (!data.replicaScores || data.replicaScores.length === 0) return false;
      const config = this.completion.level3;
      const allPassed = data.replicaScores.every((s) => s >= config.minReplicaAccuracy);
      const avgAccuracy = data.replicaScores.reduce((a, b) => a + b, 0) / data.replicaScores.length;
      return allPassed && avgAccuracy >= config.minDialogAccuracy;
    }
    // Level-4
    if (levelType === 'level4') {
      if (data.totalErrors === undefined) return false;
      return data.totalErrors <= this.completion.level4.maxAllowedErrors;
    }
    return false;
  },

  // ✅ НОВОЕ: Проверка: пользователь тренировался? (attempted)
  isLevelAttempted(levelType, data) {
    if (levelType === 'level1') return false;
    // Level-2
    if (levelType === 'level2') {
      if (!data.replicaScores || data.replicaScores.length === 0) return false;
      return data.averageAccuracy > this.attempted.level2.minAverageAccuracy;
    }
    // Level-3
    if (levelType === 'level3') {
      if (!data.replicaScores || data.replicaScores.length === 0) return false;
      return data.averageAccuracy > this.attempted.level3.minAverageAccuracy;
    }
    // Level-4: ≤6 ошибок И прошёл все реплики
    if (levelType === 'level4') {
      if (data.totalErrors === undefined) return false;
      if (!data.allReplicasCompleted) return false;
      return data.totalErrors <= this.attempted.level4.maxAllowedErrors;
    }
    return false;
  },
};
