// src/composables/usePermissions.js
import { useUserStore } from '../stores/userStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useDialogStore } from '../stores/dialogStore';

export function usePermissions() {
  const userStore = useUserStore();
  const settingsStore = useSettingsStore();
  const dialogStore = useDialogStore();

  // Достигнут ли лимит на создание новых диалогов
  const canNew = () => {
    if (userStore.isPro) {
      return true;
    } else {
      const dailyCount = settingsStore.dailyGenerationCount;
      return dailyCount <= settingsStore.limit.dailyGenerations;
    }
  };

  // Достигнут ли общий лимит диалогов
  const canTotal = () => {
    if (userStore.isPro) {
      return true;
    } else {
      const totalCount = dialogStore.allDialogs.length;
      return totalCount <= settingsStore.limit.totalDialogs;
    }
  };

  // Можно ли создавать новые диалоги (учитывая оба лимита)
  const canGenerate = () => {
    if (userStore.isPro) {
      return true;
    } else {
      return canNew() && canTotal();
    }
  };

  // для блокировки кнопок VIEW
  const canView = () => {
    if (userStore.isPro) {
      return true;
    } else {
      return settingsStore.dailyPreviewCount <= settingsStore.limit.useProMode;
    }
  };

  return { canNew, canTotal, canView, canGenerate };
}
