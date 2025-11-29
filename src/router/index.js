// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../stores/userStore.js';
import { usePermissions } from '../composables/usePermissions.js';
import Welcome from '../views/Welcome.vue';
import Auth from '../components/Auth.vue';
import AllDialogs from '../views/AllDialogs.vue';
import Profile from '../views/Profile.vue';
import Settings from '../views/Settings.vue';
import NewDialog from '../views/NewDialog.vue';
import ViewDialog from '../views/ViewDialog.vue';
import PricingView from '../views/PricingView.vue';
import Level_1 from '../views/Level_1.vue';
import Level_2 from '../views/Level_2.vue';
import Level_3 from '../views/Level_3.vue';
import Level_4 from '../views/Level_4.vue';

const routes = [
  {
    path: '/',
    name: 'welcome',
    component: Welcome,
  },
  {
    path: '/auth',
    name: 'auth',
    component: Auth,
  },
  {
    path: '/dialogs',
    name: 'all-dialogs',
    component: AllDialogs,
    meta: { requiresAuth: true },
  },
  { path: '/profile', name: 'profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/settings', name: 'settings', component: Settings, meta: { requiresAuth: true } },
  {
    path: '/pricing',
    name: 'pricing',
    component: PricingView,
    meta: { requiresAuth: false },
  },
  {
    path: '/new',
    name: 'new-dialog',
    component: NewDialog,
    meta: { requiresAuth: true, requiresGenerate: true },
  },
  {
    path: '/dialog/:id',
    name: 'view-dialog',
    component: ViewDialog,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/training/level-1/:id',
    name: 'level-1',
    component: Level_1,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/training/level-2/:id',
    name: 'level-2',
    component: Level_2,
    props: true,
    meta: { requiresAuth: true, requiresPaid: true },
  },
  {
    path: '/training/level-3/:id',
    name: 'level-3',
    component: Level_3,
    props: true,
    meta: { requiresAuth: true, requiresPaid: true },
  },
  {
    path: '/training/level-4/:id',
    name: 'level-4',
    component: Level_4,
    props: true,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  const { canGenerate, canView } = usePermissions();

  if (userStore.isLoading) {
    await userStore.initUser();
  }

  const isLoggedIn = userStore.isLoggedIn;

  // --- Проверка №1: Требуется ли вход? ---
  if (to.meta.requiresAuth && !isLoggedIn) {
    return next({ name: 'auth' });
  }

  // --- Проверка №2: Вход для залогиненных на страницу 'auth' ---
  if (to.name === 'auth' && isLoggedIn) {
    return next({ name: 'all-dialogs' });
  }

  // --- Проверка №3: Требуется ли право на ГЕНЕРАЦИЮ? ---
  if (to.meta.requiresGenerate && !canGenerate()) {
    // Если пользователь пытается зайти на /new, но лимиты исчерпаны
    return next({ name: 'all-dialogs' }); // Отправляем его обратно
  }

  // --- Проверка №4: Требуется ли PRO/PREMIUM? ---
  if (to.meta.requiresPaid && !canView()) {
    // Если пользователь пытается зайти на /level-2 или /level-3
    // (canView() вернет false, если он Free и потратил "пробные клики")
    return next({ name: 'view-dialog', params: to.params });
  }

  // --- Проверка №5: Все в порядке ---
  return next();
});

export default router;
