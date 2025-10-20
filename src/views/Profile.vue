<!--\\src\views\Profile.vue -->
<template>
  <div class="profile-page">
    <main class="profile-content">
      <header class="page-header">
        <h1 class="page-title">{{ $t('profile.title') }}</h1>
        <button
          @click="goBack"
          class="btn btn-action"
          :class="isDesktop ? 'w-250' : 'mobile'"
        >
          <span class="material-symbols-outlined">check</span>
          {{ $t('buttons.done') }}
        </button>
      </header>
      <section class="profile-group user-info">
        <img
          v-if="user?.photoURL"
          :src="user.photoURL"
          alt="User avatar"
          class="avatar"
        />
        <div
          v-else
          class="avatar-placeholder"
        >
          <span class="material-symbols-outlined">person</span>
        </div>
        <div class="user-details">
          <h2 class="user-name">{{ user?.displayName || 'Anonymous' }}</h2>
          <p class="user-email">{{ user?.email }}</p>
        </div>
      </section>

      <section class="profile-group">
        <h3 class="group-title">{{ $t('profile.subscr') }}</h3>

        <div class="current-plan-card">
          <div
            v-if="userStore.isPro"
            class="plan-pro"
          >
            <p class="usage-info">
              <span>{{ $t('profile.yourSubscr') }}</span>
              <span class="strong">PRO</span>
            </p>
            <p class="usage-info">
              <span>{{ $t('profile.genToday') }}</span>
              <span class="strong">{{ $t('profile.unlimit') }}</span>
            </p>
            <p class="usage-info">
              <span>{{ $t('profile.savedDialog') }}</span>
              <span class="strong">{{ $t('profile.unlimit') }}</span>
            </p>
            <p
              v-if="userStore.subscriptionEndDate"
              class="usage-info"
            >
              <span>{{ $t('profile.validUntil') }}</span>
              <span class="strong">{{ userStore.subscriptionEndDate }}</span>
            </p>
            <button
              class="btn btn-common btn-manage"
              :class="isDesktop ? 'w-250' : 'mobile'"
              @click="renewSubscr"
            >
              <span class="material-symbols-outlined">rocket_launch</span>
              {{ $t('profile.manageSubscr') }}
            </button>
          </div>
          <div
            v-else
            class="plan-free"
          >
            <p class="usage-info">
              <span>{{ $t('profile.yourSubscr') }}</span>
              <span class="strong">Free</span>
            </p>
            <p class="usage-info">
              <span>{{ $t('profile.genToday') }}</span>
              <span class="strong">{{ dialogsCreatedToday }} / {{ usage.daily.limit }}</span>
            </p>
            <p class="usage-info">
              <span>{{ $t('profile.savedDialog') }}</span>
              <span class="strong">{{ usage.total.count }} / {{ usage.total.limit }}</span>
            </p>
          </div>
        </div>
        <div
          class="pro-card"
          v-if="!userStore.isPro"
        >
          <div class="pro-header">
            <span class="material-symbols-outlined">rocket_launch</span>
            <h2>{{ $t('profile.upgrade') }}</h2>
          </div>
          <ul class="benefits-list">
            <ProBenefitItem>{{ $t('profile.unlimGen') }}</ProBenefitItem>
            <ProBenefitItem>{{ $t('profile.unlimStor') }}</ProBenefitItem>
            <ProBenefitItem>{{ $t('profile.qualityVoice') }}</ProBenefitItem>
            <ProBenefitItem>{{ $t('profile.allLevels') }}</ProBenefitItem>
            <ProBenefitItem>{{ $t('profile.allModes') }}</ProBenefitItem>
            <ProBenefitItem>{{ $t('profile.analysis') }}</ProBenefitItem>
          </ul>
          <button
            class="btn btn-action"
            :class="isDesktop ? 'w-250' : 'mobile'"
            @click="handleUpgrade"
          >
            <span class="material-symbols-outlined">rocket_launch</span>
            {{ $t('buttons.startFree') }}
          </button>
        </div>
      </section>
      <div class="grow"></div>
      <section class="profile-group">
        <h3 class="group-title">{{ $t('profile.accountMenag') }}</h3>
        <div class="actions-list">
          <button
            class="btn btn-danger"
            :class="isDesktop ? 'w-250' : 'mobile'"
            @click="handleDeleteAccount"
          >
            <span class="material-symbols-outlined">delete_forever</span>
            {{ $t('buttons.delete') }}
          </button>
          <button
            class="btn btn-danger"
            :class="isDesktop ? 'w-250' : 'mobile'"
            @click="handleLogout"
          >
            <span class="material-symbols-outlined">logout</span>
            {{ $t('buttons.logOut') }}
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUiStore } from '../stores/uiStore';
import { useUserStore } from '../stores/userStore';
import { useDialogStore } from '../stores/dialogStore';
import { useSettingsStore } from '../stores/settingsStore.js';
import ProBenefitItem from '../components/ProBenefitItem.vue';
import { useBreakpoint } from '../composables/useBreakpoint.js';
import { clearAllDialogCache } from '../utils/dataTransformer.js';

const router = useRouter();
const uiStore = useUiStore();
const userStore = useUserStore();
const dialogStore = useDialogStore();
const settingsStore = useSettingsStore();

const user = computed(() => userStore.user);

const { isDesktop } = useBreakpoint();

const usage = computed(() => {
  return {
    total: {
      count: dialogStore.allDialogs.length,
      limit: settingsStore.limit.totalDialogs,
    },
    daily: {
      count: settingsStore.dailyGenerationCount,
      limit: settingsStore.limit.dailyGenerations,
    },
  };
});

const dialogsCreatedToday = computed(() => {
  const todayString = new Date().toDateString();
  return dialogStore.allDialogs.filter((dialog) => {
    if (!dialog.createdAt || typeof dialog.createdAt.seconds !== 'number') {
      return false;
    }
    const dialogDate = new Date(dialog.createdAt.seconds * 1000);
    return dialogDate.toDateString() === todayString;
  }).length;
});

const goBack = () => {
  router.back();
};
const renewSubscr = () => {
  console.log('Renew Subscr!');
};
const handleLogout = async () => {
  const confirmed = await uiStore.showConfirmation({
    title: t('profile.logoutConfirmTitle'),
    message: t('profile.logoutConfirmMsg'),
    confirmText: t('buttons.logOut'),
    cancelText: t('buttons.cancel'),
  });

  if (confirmed) {
    await userStore.logout();
    clearAllDialogCache();
    dialogStore.$reset();
    router.push({ name: 'auth' });
  }
};
const handleUpgrade = () => {
  // Здесь в дальнейшем реализуем переход на PRO-подписку
  alert('Функция PRO-подписки пока не реализована.');
};
const handleDeleteAccount = async () => {
  const confirmed = await uiStore.showConfirmation({
    title: t('profile.deleteConfirmTitle'),
    message: t('profile.deleteConfirmMsg'),
    confirmText: t('buttons.del'),
    cancelText: t('buttons.cancel'),
  });

  if (confirmed) {
    alert('Функция удаления аккаунта пока не реализована.');
    // В БУДУЩЕМ ЗДЕСЬ БУДЕТ:
    // 1. Вызов Firebase Function для удаления данных пользователя из Firestore.
    // 2. Вызов функции Firebase Auth для удаления самого аккаунта.
    // 3. Обработка ошибок.
    // 4. Редирект на главную страницу.
  }
};
</script>

<style scoped>
/* 1. Стили для МОБИЛЬНЫХ (по умолчанию) */
.profile-page {
  display: flex;
  flex-direction: column;
  max-width: 800px;
  margin: 0 auto;
  padding: 16px;
  min-height: 0;
  height: 100vh;
  overflow-y: auto;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.page-title {
  font-size: var(--xxl);
  font-family: 'Roboto Condensed', sans-serif;
  color: var(--text-head);
  margin: 0;
}
.profile-content {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.profile-group {
  margin-bottom: 16px;
}
.group-title {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  font-weight: 700;
  color: var(--text-base);
  text-transform: uppercase;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 8px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}
.avatar,
.avatar-placeholder {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.avatar-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--bg-group);
  border: 1px solid var(--border);
}
.avatar-placeholder .material-symbols-outlined {
  font-size: var(--xxxl);
  color: var(--text-base);
}
.user-name {
  font-size: var(--md);
  font-weight: 700;
  color: var(--text-head);
}
.user-email {
  font-size: var(--sm);
  color: var(--text-title);
  word-break: break-all;
}
.current-plan-card {
  background-color: var(--bg-group);
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
}
.plan-pro {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.plan-free {
  width: 100%;
  display: flex;
  flex-direction: column;
}
.usage-info {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  font-family: 'Roboto Condensed', Helvetica, sans-serif;
  font-size: var(--md);
  color: var(--text-title);
  margin-bottom: 8px;
}
.usage-info .strong {
  color: var(--text-head);
  font-weight: 700;
}
.btn-manage {
  margin: 0 auto;
  margin-top: 32px;
}
/* Карточка PRO */
.pro-card {
  background: var(--gradient-pro);
  color: var(--t-pro);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 10px 20px var(--shadow);
}
.pro-header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}
.pro-header h2 {
  font-size: var(--lg);
  font-weight: 700;
}
.benefits-list {
  list-style: none;
  padding: 0;
  text-align: left;
  display: inline-block;
  margin: 0 8px;
  margin-bottom: 16px;
}
.actions-list {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
}
/* 2. Улучшения для ДЕСКТОПОВ */
@media (min-width: 768px) {
  .profile-page {
    padding: 32px 0;
  }
  .avatar,
  .avatar-placeholder {
    width: 60px;
    height: 60px;
  }
  .user-name {
    font-size: var(--md);
  }
  .user-email {
    font-size: var(--sm);
  }
  .usage-info {
    font-size: var(--sm);
  }
  .pro-card {
    font-size: var(--md);
  }
  .pro-header h2 {
    font-family: 'Roboto Condensed', sans-serif;
    font-size: var(--xxl);
  }
  .actions-list {
    flex-direction: row;
    gap: 32px;
  }
}
</style>
