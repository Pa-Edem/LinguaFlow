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
