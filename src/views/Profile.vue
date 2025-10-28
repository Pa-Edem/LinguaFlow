<!--\\src\views\Profile.vue -->
<template>
  <div class="profile-page in-view">
    <main class="profile-content">
      <header class="page-header">
        <h1 class="page-title">{{ $t('profile.title') }}</h1>
      </header>
      <section class="profile-group user-info">
        <img v-if="user?.photoURL" :src="user.photoURL" class="avatar" />
        <div v-else class="avatar-placeholder">
          <span class="material-symbols-outlined">person</span>
        </div>
        <div class="user-details">
          <h2 class="user-name">{{ user?.displayName || 'Anonymous' }}</h2>
          <p class="user-email">{{ user?.email }}</p>
        </div>

        <div class="user-menu-container">
          <button @click="isMenuOpen = !isMenuOpen" class="btn-menu-dots">
            <span class="material-symbols-outlined drop" v-if="!isMenuOpen">menu</span>
            <span class="material-symbols-outlined drop" v-if="isMenuOpen">close</span>
          </button>
          <Transition name="fade">
            <div v-if="isMenuOpen" class="dropdown-menu">
              <button @click="handleLogout" class="dropdown-item danger">
                <span class="material-symbols-outlined">logout</span>
                {{ $t('buttons.logOut') }}
              </button>
              <button @click="handleDeleteAccount" class="dropdown-item danger">
                <span class="material-symbols-outlined">delete_forever</span>
                {{ $t('buttons.delete') }}
              </button>
            </div>
          </Transition>
        </div>
      </section>

      <section class="profile-group">
        <h3 class="group-title">{{ $t('profile.subscr') }}</h3>

        <div class="current-plan-card">
          <div v-if="userStore.isPro" class="plan-pro">
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
            <p v-if="userStore.subscriptionEndDate" class="usage-info">
              <span>{{ $t('profile.validUntil') }}</span>
              <span class="strong">{{ userStore.subscriptionEndDate }}</span>
            </p>
            <button
              class="btn btn-common btn-manage oooo oool"
              :class="isDesktop ? 'w-250' : 'mobile'"
              @click="createPortalLink"
              :disabled="isCreatingPortal"
            >
              <span class="material-symbols-outlined">rocket_launch</span>
              {{ $t('profile.manageSubscr') }}
            </button>
          </div>
          <div v-else class="plan-free">
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
        <div class="pro-card" v-if="!userStore.isPro">
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
          <div class="promo-code-wrapper">
            <label class="promo-label" for="promo-code">{{ $t('profile.promoCode') }}</label>
            <input
              id="promo-code"
              type="text"
              v-model="promoCode"
              :placeholder="$t('profile.promoPlaceholder')"
              class="promo-input"
              :class="isDesktop ? 'w-250' : 'mobile'"
              :disabled="isCreatingCheckout"
            />
          </div>
          <button class="btn btn-action oooo oolo" :class="isDesktop ? 'w-250' : 'mobile'" @click="handleUpgrade">
            <span class="material-symbols-outlined">rocket_launch</span>
            {{ $t('buttons.startFree') }}
          </button>
        </div>
      </section>
    </main>
    <footer class="page-footer">
      <button @click="goBack" class="btn btn-action oooo oloo" :class="isDesktop ? 'w-250' : 'mobile'">
        <span class="material-symbols-outlined">check</span>
        {{ $t('buttons.done') }}
      </button>
    </footer>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUiStore } from '../stores/uiStore';
import { useUserStore } from '../stores/userStore';
import { useDialogStore } from '../stores/dialogStore';
import { useSettingsStore } from '../stores/settingsStore.js';
import { useI18n } from 'vue-i18n';
import ProBenefitItem from '../components/ProBenefitItem.vue';
import { useBreakpoint } from '../composables/useBreakpoint.js';
import { clearAllDialogCache } from '../utils/dataTransformer.js';
import { db, collection, addDoc, onSnapshot } from '../firebase';

const router = useRouter();
const uiStore = useUiStore();
const userStore = useUserStore();
const dialogStore = useDialogStore();
const settingsStore = useSettingsStore();
const { t } = useI18n();

const user = computed(() => userStore.user);

const { isDesktop } = useBreakpoint();
const isMenuOpen = ref(false);

const promoCode = ref('');
const isCreatingCheckout = ref(false);
const isCreatingPortal = ref(false);

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
const handleLogout = async () => {
  isMenuOpen.value = false;
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
const createPortalLink = async () => {
  isCreatingPortal.value = true;
  try {
    // 1. Создаем ссылку на "портал" в Firestore
    const portalLinkRef = await addDoc(collection(db, 'customers', user.value.uid, 'portal_links'), {
      return_url: window.location.href, // Вернуться на эту же страницу
    });

    // 2. Слушаем изменения в этом документе
    onSnapshot(portalLinkRef, (snap) => {
      const data = snap.data();
      if (data && data.url) {
        // 3. Как только Stripe (через расширение) добавит ссылку, перенаправляем
        window.location.assign(data.url);
      }
    });
  } catch (error) {
    console.error('Ошибка создания портала Stripe:', error);
    uiStore.showToast('Не удалось открыть управление подпиской.', 'error');
    isCreatingPortal.value = false;
  }
};
const handleUpgrade = async () => {
  isCreatingCheckout.value = true;

  // ✨ 1. ВАШ ID ЦЕНЫ ИЗ STRIPE (Test mode)
  const priceId = 'price_1SNAkc7sDoKjQqmA1uahnfAU';

  try {
    // 2. Создаем документ "checkout_session" в Firestore
    const sessionRef = await addDoc(collection(db, 'customers', user.value.uid, 'checkout_sessions'), {
      price: priceId,
      // Указываем URL для успеха и отмены
      success_url: window.location.origin + '/dialogs',
      cancel_url: window.location.origin + '/profile',
      // ✨ 3. ДОБАВЛЯЕМ ПРОМО-КОД
      promotion_code: promoCode.value.trim() || null, // Отправляем, если он введен
    });

    // 4. Слушаем этот документ
    onSnapshot(sessionRef, (snap) => {
      const data = snap.data();
      if (data && data.url) {
        // 5. Как только Stripe вернет URL, перенаправляем пользователя на оплату
        window.location.assign(data.url);
      } else if (data && data.error) {
        // 6. Если Stripe вернул ошибку (напр. "промо-код не найден")
        console.error('Ошибка Stripe:', data.error.message);
        uiStore.showToast(data.error.message, 'error');
        isCreatingCheckout.value = false;
      }
    });
  } catch (error) {
    console.error('Ошибка создания сеанса Stripe:', error);
    isCreatingCheckout.value = false;
  }
};
const handleDeleteAccount = async () => {
  isMenuOpen.value = false;
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
  height: 100vh;
  max-width: 800px;
  margin: 0 auto;
  padding: 16px;
  min-height: 0;
  overflow-y: hidden;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.page-title {
  font-size: var(--lg);
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
  overflow-y: auto;
}
.profile-group {
  margin-bottom: 16px;
}
.group-title {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--xs);
  font-weight: 500;
  color: var(--text-base);
  text-transform: uppercase;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 4px;
}
.user-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  position: relative;
}
.avatar,
.avatar-placeholder {
  width: 40px;
  height: 40px;
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
  font-size: var(--xxl);
  color: var(--text-base);
}
.user-name {
  font-size: var(--sm);
  font-weight: 700;
  color: var(--text-head);
}
.user-details {
  flex-grow: 1;
}
.user-email {
  font-size: var(--xs);
  color: var(--text-title);
  word-break: break-all;
}
.user-menu-container {
  position: relative;
}
.btn-menu-dots {
  background: none;
  color: var(--text-title);
  width: 40px;
  height: 40px;
  padding: 0;
  margin-right: 4px;
  border-radius: 50%;
}
.drop {
  font-size: 24px;
}
.dropdown-menu {
  position: absolute;
  top: 40px;
  right: 24px;
  z-index: 100;
  width: 160px;
  border-radius: 24px;
  border-top-right-radius: 2px;
  border: 1px solid var(--r3);
  box-shadow: 0 4px 4px var(--shadow);
  overflow: hidden;
}
.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 0;
  background: var(--r1);
  font-size: var(--xs);
  font-weight: 500;
  width: 100%;
}
.dropdown-item:hover {
  background-color: var(--r2);
}
.dropdown-item.danger {
  font-family: 'Roboto Condensed', sans-serif;
  text-transform: uppercase;
  color: var(--r3);
}
.dropdown-item .material-symbols-outlined {
  font-size: var(--sm);
}
/* Анимация появления */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.current-plan-card {
  background: var(--gradient-pro);
  padding: 12px 16px;
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
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  color: var(--text-title);
  margin-bottom: 4px;
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
  box-shadow: 0 2px 4px var(--shadow);
}
.pro-header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}
.pro-header h2 {
  font-family: 'Roboto Condensed', sans-serif;
  text-transform: uppercase;
  font-size: var(--md);
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
.promo-code-wrapper {
  width: 100%;
  margin: 16px 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
}
.promo-label {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--md);
  color: var(--g3);
}
.promo-input {
  background: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: var(--sm);
  color: var(--g1);
  text-transform: uppercase;
  letter-spacing: 1px;
  border: 1px solid var(--g3);
}
.promo-input:focus {
  border-color: var(--g1);
  background: var(--g3);
}
.promo-input::placeholder {
  transition: color 0.3s ease-out;
}
.promo-input:focus::placeholder {
  color: transparent;
}
.page-footer {
  flex-shrink: 0;
  padding-top: 16px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: center;
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
}
</style>
