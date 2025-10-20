// src/utils/dataTransformer.js

// --- Firestore Data Transformers ---
export function prepareDialogForFirestore(dialogData) {
  if (!dialogData.options || !Array.isArray(dialogData.options)) return dialogData;
  const optionsForFirestore = dialogData.options.map((optionSet) => ({ values: optionSet }));
  return { ...dialogData, options: optionsForFirestore };
}

export function prepareDialogFromFirestore(dialogData) {
  if (dialogData.options && dialogData.options[0]?.values) {
    const options = dialogData.options.map((item) => item.values);
    return { ...dialogData, options };
  }
  return dialogData;
}

// --- LocalStorage Cache Management ---
const DIALOG_LIST_KEY = 'dialogsList';

/**
 * Сохраняет ОБЛЕГЧЕННЫЙ список диалогов в кеш.
 * @param {Array} dialogs - Полный массив диалогов.
 */
export function saveDialogsListToCache(dialogs) {
  try {
    const lightweightList = dialogs.map(({ id, title, level, fin, createdAt }) => ({
      id,
      title,
      level,
      replicasCount: fin.length,
      createdAt,
    }));
    localStorage.setItem(DIALOG_LIST_KEY, JSON.stringify(lightweightList));
  } catch (e) {
    console.error('Error saving dialogues list to cache:', e);
  }
}

/**
 * Получает список диалогов из кеша.
 * @returns {Array|null}
 */
export function getDialogsListFromCache() {
  try {
    const listData = localStorage.getItem(DIALOG_LIST_KEY);
    return listData ? JSON.parse(listData) : null;
  } catch (e) {
    console.error('Error getting dialogues list from cache:', e);
    return null;
  }
}

/**
 * Сохраняет ПОЛНЫЙ объект одного диалога в кеш.
 * @param {object} dialog - Объект диалога.
 */
export function saveDialogToCache(dialog) {
  if (!dialog || !dialog.id) return;
  try {
    localStorage.setItem(`dialog_${dialog.id}`, JSON.stringify(dialog));
  } catch (e) {
    console.error('Error saving dialogue to cache:', e);
  }
}

/**
 * Получает ПОЛНЫЙ объект одного диалога из кеша.
 * @param {string} id - ID диалога.
 * @returns {object|null}
 */
export function getDialogFromCache(id) {
  if (!id) return null;
  try {
    const dialogData = localStorage.getItem(`dialog_${id}`);
    return dialogData ? JSON.parse(dialogData) : null;
  } catch (e) {
    console.error('Error getting dialogue from cache:', e);
    return null;
  }
}

/**
 * Очищает ВЕСЬ кеш, связанный с диалогами.
 */
export function clearAllDialogCache() {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('dialog_') || key === DIALOG_LIST_KEY) {
        localStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.error('Error clearing cache:', e);
  }
}

/**
 * Сбрасывает кеш лимитов Free-тарифа для тестирования.
 * Удаляет счётчики дневных генераций и PRO-просмотров.
 */
export function resetFreeTierCache() {
  try {
    localStorage.removeItem('usage');
  } catch (e) {
    console.error('Error resetting cache:', e);
  }
}
