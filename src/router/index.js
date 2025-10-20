// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../stores/userStore.js';
import Welcome from '../views/Welcome.vue';
import Auth from '../components/Auth.vue';
import AllDialogs from '../views/AllDialogs.vue';
import Profile from '../views/Profile.vue';
import Settings from '../views/Settings.vue';
import NewDialog from '../views/NewDialog.vue';
import ViewDialog from '../views/ViewDialog.vue';
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
    path: '/new',
    name: 'new-dialog',
    component: NewDialog,
    meta: { requiresAuth: true },
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
    meta: { requiresAuth: true },
  },
  {
    path: '/training/level-3/:id',
    name: 'level-3',
    component: Level_3,
    props: true,
    meta: { requiresAuth: true },
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
  const isLoggedIn = userStore.isLoggedIn;

  if (userStore.isLoading) {
    await userStore.initUser();
  }

  const requiresAuth = to.meta.requiresAuth;

  if (requiresAuth && !isLoggedIn) {
    next({ name: 'auth' });
  } else if (to.name === 'auth' && isLoggedIn) {
    // Авторизованных пользователей не пускаем на страницу входа
    next({ name: 'all-dialogs' });
  } else {
    // Во всех остальных случаях разрешаем переход
    next();
  }
});

export default router;
