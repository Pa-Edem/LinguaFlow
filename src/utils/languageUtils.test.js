// src/utils/languageUtils.test.js

// 1. Импортируем то, что будем тестировать
import { getLangCode, getDemoPhrase } from './languageUtils.js';

// 2. Описываем, ЧТО мы тестируем
describe('languageUtils', () => {
  // 3. Первый тест-кейс для getLangCode
  it('должен возвращать правильный код для финского языка', () => {
    // ДЕЙСТВИЕ
    const result = getLangCode('Suomi');
    // ПРОВЕРКА
    expect(result).toBe('fi-FI');
  });

  // 4. Второй тест-кейс для getLangCode
  it('должен возвращать en-US для неизвестного языка', () => {
    // ДЕЙСТВИЕ
    const result = getLangCode('Klingon');
    // ПРОВЕРКА
    expect(result).toBe('en-US');
  });

  // 5. Тест-кейс для getDemoPhrase
  it('должен возвращать демо-фразу для русского языка', () => {
    // ДЕЙСТВИЕ
    const result = getDemoPhrase('Русский');
    // ПРОВЕРКА
    expect(result).toContain('Так голос звучит');
  });
});
