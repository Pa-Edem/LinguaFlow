// src/stores/settingsStore.test.js
import { setActivePinia, createPinia } from 'pinia';
import { useSettingsStore } from './settingsStore';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// --- Подготовка ---

// 1. Мокируем (подделываем) localStorage, так как в jsdom его нет по умолчанию
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// 2. Мокируем (подделываем) системные настройки (для 'prefers-color-scheme')
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false, // Говорим, что по умолчанию пользователь предпочитает 'light'
  })),
});

// --- Тесты ---

describe('settingsStore', () => {
  // 3. Эта функция будет запускаться ПЕРЕД каждым тестом (`it`)
  beforeEach(() => {
    // Она создаёт "свежий" Pinia-сторейдж для каждого теста
    setActivePinia(createPinia());
    // И очищает наш "поддельный" localStorage
    localStorage.clear();
  });

  // --- Тестируем Actions ---

  it('должен правильно инкрементировать счётчик "view"', () => {
    const settingsStore = useSettingsStore();
    expect(settingsStore.dailyPreviewCount).toBe(0); // Проверяем, что вначале 0

    // ДЕЙСТВИЕ
    settingsStore.incrementCount('view');

    // ПРОВЕРКА
    expect(settingsStore.dailyPreviewCount).toBe(1); // Счётчик в Pinia стал 1
    // Проверяем, что это сохранилось в localStorage
    expect(localStorage.getItem('usage')).toContain('"countView":1');
  });

  it('должен правильно инкрементировать счётчик "new"', () => {
    const settingsStore = useSettingsStore();
    expect(settingsStore.dailyGenerationCount).toBe(0);

    // ДЕЙСТВИЕ
    settingsStore.incrementCount('new');

    // ПРОВЕРКА
    expect(settingsStore.dailyGenerationCount).toBe(1);
    expect(localStorage.getItem('usage')).toContain('"countNew":1');
  });

  // --- Тестируем initSettings (самый сложный тест) ---

  it('должен сбрасывать счётчики, если наступил новый день', () => {
    // 1. Подготовка: симулируем "вчерашний" день
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayUsage = {
      countView: 5,
      countNew: 5,
      date: yesterday.toDateString(),
    };
    localStorage.setItem('usage', JSON.stringify(yesterdayUsage));

    // 2. ДЕЙСТВИЕ: Запускаем init
    const settingsStore = useSettingsStore();
    settingsStore.initSettings(); // initSettings должен увидеть "вчерашнюю" дату

    // 3. ПРОВЕРКА: Убеждаемся, что счётчики сбросились в 0
    expect(settingsStore.dailyPreviewCount).toBe(0);
    expect(settingsStore.dailyGenerationCount).toBe(0);
    expect(localStorage.getItem('usage')).toBe(null); // ...и старый usage удалён
  });

  it('должен загружать счётчики, если день тот же', () => {
    // 1. Подготовка: симулируем "сегодняшний" день
    const todayUsage = {
      countView: 2,
      countNew: 1,
      date: new Date().toDateString(),
    };
    localStorage.setItem('usage', JSON.stringify(todayUsage));

    // 2. ДЕЙСТВИЕ:
    const settingsStore = useSettingsStore();
    settingsStore.initSettings();

    // 3. ПРОВЕРКА: Убеждаемся, что счётчики ЗАГРУЗИЛИСЬ
    expect(settingsStore.dailyPreviewCount).toBe(2);
    expect(settingsStore.dailyGenerationCount).toBe(1);
  });
});
