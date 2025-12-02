// src\utils\levelHelper.js

// ========================================
// ХЕЛПЕР: Преобразование уровней языка
// ========================================
// Использовать при сохранении статистики

/**
 * Преобразовать детальный уровень в упрощённый
 * @param {string} level - Уровень языка (A2.1, B1.2, C1 и т.д.)
 * @returns {string} - Упрощённый уровень (A2, B1, C1)
 */
export function getSimplifiedLevel(level) {
  if (!level || typeof level !== 'string') {
    console.warn('⚠️ Неверный уровень:', level);
    return 'A1'; // Fallback
  }

  // Убрать пробелы и привести к верхнему регистру
  level = level.trim().toUpperCase();

  // Если уже упрощённый (A1, B2, C1) — вернуть как есть
  if (/^[ABC][12]$/.test(level)) {
    return level;
  }

  // Если детальный (A2.1, B1.2, C1.1) — взять только первую часть
  if (/^[ABC][12]\.[12]$/.test(level)) {
    return level.split('.')[0];
  }

  // Если что-то неожиданное
  console.warn('⚠️ Неизвестный формат уровня:', level);
  return 'A1'; // Fallback
}

/**
 * Примеры использования:
 */
// getSimplifiedLevel('A2.1')  → 'A2'
// getSimplifiedLevel('B1.2')  → 'B1'
// getSimplifiedLevel('C1.1')  → 'C1'
// getSimplifiedLevel('C2')    → 'C2'
// getSimplifiedLevel('a2.1')  → 'A2' (автоматически uppercase)
// getSimplifiedLevel('X9')    → 'A1' (fallback)

/**
 * Использование при обновлении статистики:
 */
/*
import { getSimplifiedLevel } from '@/utils/levelHelper';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/firebase';

async function completeDialog(dialogId, languageLevel) {
  const userStore = useUserStore();
  
  if (userStore.tier === 'pro' || userStore.tier === 'premium') {
    const userRef = doc(db, 'users', userStore.user.uid);
    
    // ✅ Преобразовать детальный уровень
    const simplifiedLevel = getSimplifiedLevel(languageLevel);
    // 'A2.1' → 'A2', 'B1.2' → 'B1'
    
    await updateDoc(userRef, {
      'stats.dialogsLearned': increment(1),
      [`stats.dialogsLearned${simplifiedLevel}`]: increment(1),
      // Например: stats.dialogsLearnedA2 += 1
      'stats.lastActivityDate': new Date().toISOString().split('T')[0],
    });
  }
}
*/

/**
 * Тесты:
 */
export function testLevelHelper() {
  const tests = [
    { input: 'A1', expected: 'A1' },
    { input: 'A2.1', expected: 'A2' },
    { input: 'A2.2', expected: 'A2' },
    { input: 'B1.1', expected: 'B1' },
    { input: 'B1.2', expected: 'B1' },
    { input: 'B2.1', expected: 'B2' },
    { input: 'B2.2', expected: 'B2' },
    { input: 'C1.1', expected: 'C1' },
    { input: 'C1.2', expected: 'C1' },
    { input: 'C2', expected: 'C2' },
    { input: 'a2.1', expected: 'A2' },
    { input: ' B1.2 ', expected: 'B1' },
    { input: 'X9', expected: 'A1' }, // Fallback
    { input: '', expected: 'A1' }, // Fallback
    { input: null, expected: 'A1' }, // Fallback
  ];

  console.log('🧪 Тестирование getSimplifiedLevel:');

  let passed = 0;
  let failed = 0;

  tests.forEach((test) => {
    const result = getSimplifiedLevel(test.input);
    if (result === test.expected) {
      console.log(`✅ "${test.input}" → "${result}"`);
      passed++;
    } else {
      console.error(`❌ "${test.input}" → "${result}" (ожидалось "${test.expected}")`);
      failed++;
    }
  });

  console.log(`\n📊 Результаты: ${passed} ✅ | ${failed} ❌`);
}

// Раскомментировать для запуска тестов:
// testLevelHelper();
