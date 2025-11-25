// src/composables/usePermissions.js
import { useUserStore } from '../stores/userStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useDialogStore } from '../stores/dialogStore';

export function usePermissions() {
  const userStore = useUserStore();
  const settingsStore = useSettingsStore();
  const dialogStore = useDialogStore();

  const isUnlimited = () => {
    return userStore.isPremium;
  };

  // Достигнут ли лимит на создание новых диалогов
  const canNew = () => {
    // ✅ PREMIUM — безлимит
    if (isUnlimited()) {
      return true;
    }
    // ✅ PRO — проверяем лимиты PRO
    if (userStore.isPro) {
      return settingsStore.canUseToday > 0;
    }
    // ✅ FREE — проверяем дневной лимит
    return settingsStore.canUseToday > 0;
  };

  // Достигнут ли общий лимит диалогов
  const canTotal = () => {
    // ✅ PREMIUM — безлимит
    if (isUnlimited()) {
      return true;
    }
    // ✅ PRO/FREE — проверяем общий лимит
    return dialogStore.allDialogs.length < settingsStore.limit.totalDialogs;
  };

  // Можно ли создавать новые диалоги (учитывая оба лимита)
  const canGenerate = () => {
    // ✅ PREMIUM — безлимит
    if (isUnlimited()) {
      return true;
    }
    // ✅ PRO/FREE — проверяем оба лимита
    return canNew() && canTotal();
  };

  // для блокировки PRO-кнопок
  const canView = () => {
    // ✅ PREMIUM — безлимит
    if (isUnlimited()) {
      return true;
    }
    // ✅ PRO — проверяем лимиты PRO-тренировок
    if (userStore.isPro) {
      return settingsStore.canUsePreviewToday > 0;
    }
    // ✅ FREE — проверяем дневной лимит PRO-функций
    return settingsStore.canUsePreviewToday > 0;
  };

  // ✅ Можно ли использовать анализ
  const canUseAnalysis = () => {
    // ✅ PREMIUM — безлимит
    if (isUnlimited()) {
      return true;
    }
    // ✅ PRO — безлимитный анализ
    if (userStore.isPro && settingsStore.limit.unlimitedAnalysis) {
      return true;
    }
    // ✅ FREE — ограниченный анализ (через canView)
    return canView();
  };

  // ✅ Можно ли выбрать уровень сложности
  const canSelectLevel = (level) => {
    // ✅ PREMIUM/PRO — все уровни доступны
    if (isUnlimited() || userStore.isPro) {
      return true;
    }
    // ✅ FREE — только базовые уровни (A1 - B1.2)
    const freeLevels = ['A1', 'A2.1', 'A2.2', 'B1.1', 'B1.2'];
    return freeLevels.includes(level);
  };

  // ✅ Получить доступные уровни для текущего тарифа
  const getAvailableLevels = () => {
    // ✅ PREMIUM/PRO — все уровни
    if (isUnlimited() || userStore.isPro) {
      return ['A1', 'A2.1', 'A2.2', 'B1.1', 'B1.2', 'B2.1', 'B2.2', 'C1.1', 'C1.2', 'C2'];
    }
    // ✅ FREE — только базовые уровни
    return ['A1', 'A2.1', 'A2.2', 'B1.1', 'B1.2'];
  };

  return { canNew, canTotal, canView, canGenerate, canUseAnalysis, isUnlimited, canSelectLevel, getAvailableLevels };
}
