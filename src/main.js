//src/main.js
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import i18n from './i18n';
import App from './App.vue';
import './styles/colors.css';
import './styles/variables.css';
import './styles/main.css';
import './styles/buttons.css';
import { useUserStore } from './stores/userStore';
import { useSettingsStore } from './stores/settingsStore.js';
import { clearAllDialogCache } from './utils/dataTransformer.js';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(i18n);

const userStore = useUserStore();

const settingsStore = useSettingsStore();
settingsStore.initSettings();

userStore.initUser().then(() => {
  app.mount('#app');
});

// ОБРАБОТЧИК ЗАКРЫТИЯ ВКЛАДКИ
window.addEventListener('beforeunload', () => {
  clearAllDialogCache();
});
