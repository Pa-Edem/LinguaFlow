// src/utils/languageUtils.js

// 1. Карта "человеческих" названий (из settingsStore) в BCP 47 коды
const languageMap = {
  // 'Название из вашего списка': 'BCP 47 код'
  English: 'en-US',
  Español: 'es-ES',
  Français: 'fr-FR',
  Deutsch: 'de-DE',
  Italiano: 'it-IT',
  Русский: 'ru-RU',
  Português: 'pt-BR',
  Nederlands: 'nl-NL',
  Svenska: 'sv-SE',
  Polski: 'pl-PL',
  Українська: 'uk-UA',
  Čeština: 'cs-CZ',
  Magyar: 'hu-HU',
  Suomi: 'fi-FI',
  Norsk: 'no-NO',
  Dansk: 'da-DK',
  Română: 'ro-RO',
  Hrvatski: 'hr-HR',
  Slovenčina: 'sk-SK',
  // ... можно добавить еще
};

// 2. Карта с демо-фразами для каждого языка
const demoPhrases = {
  Suomi: 'Näin ääni kuulostaa PRO-versiossa. Paljon parempi, eikö niin?',
  English: "This is how the voice sounds in the PRO version. Much better, isn't it?",
  Русский: 'Так голос звучит в PRO-версии. Намного лучше, не правда ли?',
  Українська: 'Так голос звучить у PRO-версії. Набагато краще, чи не так?',
  Español: 'Así es como suena la voz en la versión PRO. Mucho mejor, ¿verdad?',
  Français: "Voici comment sonne la voix dans la version PRO. Bien mieux, n'est-ce pas ?",
  Deutsch: 'So klingt die Stimme in der PRO-Version. Viel besser, oder?',
  Italiano: 'Così suona la voce nella versione PRO. Molto meglio, vero?',
  Português: 'É assim que a voz soa na versão PRO. Muito melhor, não é?',
  Nederlands: 'Zo klinkt de stem in de PRO-versie. Veel beter, hè?',
  Svenska: 'Så låter rösten i PRO-versionen. Mycket bättre, eller hur?',
  Polski: 'Tak brzmi głos w wersji PRO. Znacznie lepiej, prawda?',
  Ceština: 'Tak zní hlas v PRO verzi. Hodně lepší, ne?',
  Magyar: 'Így hangzik a PRO-verzióban. Sokkal jobb, nem igaz?',
  Norsk: 'Slik høres stemmen ut i PRO-versjonen. Mye bedre, ikke sant?',
  Dansk: 'Så lyder stemmen i PRO-versionen. Meget bedre, ikke?',
  Română: 'Așa sună vocea în versiunea PRO. Mult mai bine, nu-i așa?',
  Hrvatski: 'Tako zvuči glas u PRO verziji. Mnogo bolje, zar ne?',
  Slovenčina: 'Tak znie hlas v PRO verzii. Oveľa lepšie, však?',
};

/**
 * Получает BCP 47 код языка по его "человеческому" названию.
 * @param {string} languageName - Название языка (напр. "Finnish" или "Suomi")
 * @returns {string} - Код BCP 47 (напр. "fi-FI")
 */
export function getLangCode(languageName) {
  return languageMap[languageName] || 'en-US'; // 'en-US' как запасной вариант
}

/**
 * Получает демо-фразу для выбранного языка.
 * @param {string} languageName - Название языка (напр. "Finnish" или "Suomi")
 * @returns {string} - Тестовая фраза
 */
export function getDemoPhrase(languageName) {
  return demoPhrases[languageName] || demoPhrases['English']; // 'English' как запасной
}
