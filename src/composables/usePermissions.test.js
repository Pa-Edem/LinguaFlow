// src/composables/usePermissions.test.js
import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from '../stores/userStore';
import { useDialogStore } from '../stores/dialogStore';
import { useSettingsStore } from '../stores/settingsStore';
import { usePermissions } from './usePermissions';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Мокируем uiStore (для "громких" проверок в будущем)
vi.mock('../stores/uiStore', () => ({
  useUiStore: () => ({
    showToast: vi.fn(),
  }),
}));

// --- Тесты ---
describe('usePermissions Composable', () => {
  let userStore;
  let dialogStore;
  let settingsStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    userStore = useUserStore();
    dialogStore = useDialogStore();
    settingsStore = useSettingsStore();
    localStorage.clear();
  });

  // --- Тестируем canGenerate ---

  it('canGenerate: должен РАЗРЕШАТЬ, если пользователь PRO', () => {
    vi.spyOn(userStore, 'isPro', 'get').mockReturnValue(true);
    const { canGenerate } = usePermissions();

    // ✨ ИСПРАВЛЕНИЕ: Вызываем как функцию
    expect(canGenerate()).toBe(true);
  });

  it('canGenerate: должен РАЗРЕШАТЬ, если пользователь Free, но лимиты не превышены', () => {
    vi.spyOn(userStore, 'isPro', 'get').mockReturnValue(false);
    settingsStore.dailyGenerationCount = 1; // 1 из 2
    dialogStore.allDialogs = Array(5).fill({}); // 5 из 10

    const { canGenerate } = usePermissions();
    expect(canGenerate()).toBe(true);
  });

  it('canGenerate: должен ЗАПРЕЩАТЬ, если превышен ДНЕВНОЙ лимит', () => {
    vi.spyOn(userStore, 'isPro', 'get').mockReturnValue(false);
    settingsStore.dailyGenerationCount = 3; // 3 из 2 (больше лимита)
    dialogStore.allDialogs = [];

    const { canGenerate } = usePermissions();
    expect(canGenerate()).toBe(false);
  });

  it('canGenerate: должен ЗАПРЕЩАТЬ, если превышен ОБЩИЙ лимит', () => {
    vi.spyOn(userStore, 'isPro', 'get').mockReturnValue(false);
    settingsStore.dailyGenerationCount = 0;
    dialogStore.allDialogs = Array(11).fill({}); // 11 из 10 (больше лимита)

    const { canGenerate } = usePermissions();
    expect(canGenerate()).toBe(false);
  });

  // --- Тестируем canView (вместо isButtonActive) ---

  it('canView: должен РАЗРЕШАТЬ, если пользователь PRO', () => {
    vi.spyOn(userStore, 'isPro', 'get').mockReturnValue(true);
    const { canView } = usePermissions();

    // ✨ ИСПРАВЛЕНИЕ: Тестируем canView
    expect(canView()).toBe(true);
  });

  it('canView: должен РАЗРЕШАТЬ, если у Free-пользователя есть попытки', () => {
    vi.spyOn(userStore, 'isPro', 'get').mockReturnValue(false);
    settingsStore.dailyPreviewCount = 1; // 1 из 2

    const { canView } = usePermissions();
    expect(canView()).toBe(true);
  });

  it('canView: должен РАЗРЕШАТЬ на последней попытке', () => {
    vi.spyOn(userStore, 'isPro', 'get').mockReturnValue(false);
    settingsStore.dailyPreviewCount = 2; // 2 из 2 (включительно)

    const { canView } = usePermissions();
    expect(canView()).toBe(true);
  });

  it('canView: должен ЗАПРЕЩАТЬ, если у Free-пользователя закончились попытки', () => {
    vi.spyOn(userStore, 'isPro', 'get').mockReturnValue(false);
    settingsStore.dailyPreviewCount = 3; // 3 из 2 (больше лимита)

    const { canView } = usePermissions();
    expect(canView()).toBe(false);
  });
});
