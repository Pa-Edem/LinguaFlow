<!-- src/components/NotificationBell.vue -->
<template>
  <div :class="isDesktop ? 'notification-bell' : 'notification-bell-mobile'" ref="bellRef">
    <!-- Кнопка колокольчика -->
    <button
      v-if="isDesktop"
      class="btn btn-menu bell"
      @click="toggleDropdown"
      :class="{ 'has-unread': unreadCount > 0 }"
      aria-label="Уведомления"
    >
      <span class="material-symbols-outlined">notifications</span>
      <span>Сообщения</span>
      <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
    </button>
    <button
      v-else
      class="mobile-bell"
      @click="toggleDropdown"
      :class="{ 'has-unread': unreadCount > 0 }"
      aria-label="Уведомления"
    >
      <span class="material-symbols-outlined">notifications</span>
      <span>Сообщения</span>
      <span v-if="unreadCount > 0" class="badge-mobile">{{ unreadCount }}</span>
    </button>

    <!-- Выпадающий список уведомлений -->
    <transition name="dropdown">
      <div v-if="showDropdown" class="notifications-dropdown">
        <!-- Заголовок -->
        <div class="dropdown-header">
          <h3>Уведомления</h3>
          <button @click="closeDropdown" class="close-btn" aria-label="Закрыть">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Список уведомлений -->
        <div class="notifications-list">
          <div
            v-for="notif in notifications"
            :key="notif.id"
            class="notification-item"
            :class="{
              unread: notif.read,
              clickable:
                notif.type === 'monthly_stats' || notif.type === 'achievement' || notif.type === 'upgrade_prompt',
            }"
            @click="handleNotificationClick(notif)"
          >
            <!-- Иконка в зависимости от типа -->
            <span class="notification-icon">
              {{ getNotificationIcon(notif.type) }}
            </span>

            <!-- Содержимое -->
            <div class="notification-content">
              <h4 class="notification-title">{{ notif.title }}</h4>
              <p class="notification-message">{{ notif.message }}</p>
              <p
                v-if="notif.type === 'monthly_stats' || notif.type !== 'achievement' || notif.type === 'upgrade_prompt'"
                class="notification-hint"
              >
                👆 Нажмите для просмотра
              </p>
              <p class="notification-time">{{ formatTime(notif.createdAt) }}</p>
            </div>
          </div>

          <!-- Пустое состояние -->
          <div v-if="notifications.length === 0" class="empty-state">
            <span class="material-symbols-outlined">notifications_off</span>
            <p>Нет уведомлений</p>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useNotificationStore } from '../stores/notificationStore';
import { useBreakpoint } from '../composables/useBreakpoint';
import { useUiStore } from '../stores/uiStore';

const notificationStore = useNotificationStore();
const { isDesktop } = useBreakpoint();
const uiStore = useUiStore();
const bellRef = ref(null);
const showDropdown = ref(false);

// Количество непрочитанных
const unreadCount = computed(() => notificationStore.unreadCount);

// Список уведомлений (все за 2 недели)
const notifications = computed(() => notificationStore.allNotifications);

// Открыть dropdown
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;

  if (!showDropdown.value) {
    // Вариант C: При закрытии отмечаем все как прочитанные
    markAllAsReadOnClose();
  }
};

// Закрыть dropdown (через крестик)
const closeDropdown = () => {
  showDropdown.value = false;
  // Вариант C: При закрытии отмечаем все как прочитанные
  markAllAsReadOnClose();
};

// Отметить все как прочитанные при закрытии
const markAllAsReadOnClose = async () => {
  const unreadNotifications = notifications.value.filter((n) => !n.read);

  if (unreadNotifications.length > 0) {
    await notificationStore.markAllAsRead();
    console.log(`✅ Marked ${unreadNotifications.length} notifications as read`);
  }
};

// Иконка в зависимости от типа уведомления
const getNotificationIcon = (type) => {
  const icons = {
    // Trial
    trial_ending: '⏰',
    trial_expired: '❌',
    // ✅ Достижения
    achievement: '🏆',
    // ✅ Серии
    streak_reminder: '⏰',
    streak_broken: '💔',
    streak_milestone: '🔥',
    // ✅ Статистика
    monthly_stats: '📊',
    // ✅ Upgrade
    upgrade_prompt: '🚀',
    upgrade_premium: '💎',
    // ✅ Системные
    feature_announcement: '🎉',
    maintenance: '🔧',
    subscription_renewal: '💳',
    payment_failed: '⚠️',
    // Fallback
    default: '🔔',
  };
  return icons[type] || icons.default;
};

// Форматирование времени
const formatTime = (timestamp) => {
  if (!timestamp) return '';

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Только что';
  if (minutes < 60) return `${minutes} мин. назад`;
  if (hours < 24) return `${hours} ч. назад`;
  if (days < 7) return `${days} дн. назад`;

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
};

// Закрытие при клике вне компонента
const handleClickOutside = (event) => {
  if (bellRef.value && !bellRef.value.contains(event.target)) {
    showDropdown.value = false;
  }
};

// Обработчик клика на уведомление
const handleNotificationClick = (notification) => {
  console.log(notification.data);
  // Закрыть dropdown
  showDropdown.value = false;

  // Отметить прочитанным
  if (!notification.read) {
    notificationStore.markAsRead(notification.id);
  }

  // Обработать тип уведомления
  if (notification.type === 'monthly_stats') {
    // Открыть модалку со статистикой
    uiStore.showModal('monthlyStats', notification.data);
  } else if (notification.type === 'achievement') {
    // Можно добавить модалку для достижений (TODO)
    console.log('🏆 Достижение:', notification.data);
  } else if (notification.type === 'upgrade_prompt') {
    // Модалка upgrade
    uiStore.showModal('upgrade', notification.data);
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  // Загружаем уведомления при монтировании
  notificationStore.loadNotifications();
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* ========================================= */
/* КНОПКА КОЛОКОЛЬЧИКА */
/* ========================================= */
.notification-bell {
  position: relative;
  width: 100%;
}
.notification-bell-mobile {
  position: relative;
}
.bell.has-unread .material-symbols-outlined {
  animation: ring 2s ease-in-out infinite;
}
.mobile-bell {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 16px;
  color: var(--text-head);
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--xs);
  background-color: var(--bg-side);
  border: none;
  cursor: pointer;
}
.mobile-bell.has-unread .material-symbols-outlined {
  animation: ring 2s ease-in-out infinite;
}
@keyframes ring {
  0%,
  100% {
    transform: rotate(0deg);
  }
  10%,
  30% {
    transform: rotate(-15deg);
  }
  20%,
  40% {
    transform: rotate(15deg);
  }
}
/* Бейдж с количеством */
.badge {
  position: absolute;
  top: 6px;
  right: 6px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--r2);
  color: var(--text-title);
  font-family: 'Roboto Condensed', sans-serif;
  font-size: 10px;
  font-weight: 700;
  border-radius: 9px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
.badge-mobile {
  position: absolute;
  top: 6px;
  right: 10px;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--r2);
  color: var(--text-title);
  font-family: 'Roboto Condensed', sans-serif;
  font-size: 8px;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
/* ========================================= */
/* ВЫПАДАЮЩИЙ СПИСОК - DESKTOP */
/* ========================================= */
.notification-bell .notifications-dropdown {
  position: absolute;
  bottom: calc(100% + 8px); /* ✅ Выпадает СНИЗУ ВВЕРХ */
  left: 0; /* ✅ Слева от кнопки */
  width: 360px;
  max-height: 500px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  z-index: 1000;
}
/* MOBILE - снизу экрана */
.notification-bell-mobile .notifications-dropdown {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100vh;
  max-height: none;
  background: var(--bg-card);
  border: none;
  border-radius: 0;
  box-shadow: none;
  overflow: hidden;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

/* Заголовок */
.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  border-bottom: 1px solid var(--border);
}
.dropdown-header h3 {
  margin: 0;
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--xs);
  font-weight: 500;
  color: var(--text-head);
}
/* Крестик */
.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--text-head);
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--y10);
}
.close-btn .material-symbols-outlined {
  font-size: 1.25rem;
}

/* Список */
.notifications-list {
  flex: 1;
  overflow-y: auto;
}
/* Desktop - ограниченная высота */
.notification-bell .notifications-list {
  max-height: 440px;
}

/* Mobile - на весь экран */
.notification-bell-mobile .notifications-list {
  max-height: none;
}
/* Элемент уведомления */
.notification-item {
  display: flex;
  gap: 12px;
  padding: 8px;
  border-left: 4px solid var(--gold-4);
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.2s ease;
}
.notification-item:hover {
  background: var(--y0);
}
.notification-item.unread {
  border-left: none;
  opacity: 0.6;
}

.notification-item:last-child {
  border-bottom: none;
}
/* Иконка */
.notification-icon {
  flex-shrink: 0;
  font-size: var(--lg);
  display: flex;
  align-items: center;
  justify-content: center;
}
/* Содержимое */
.notification-content {
  flex: 1;
  min-width: 0;
}
.notification-title {
  margin: 0 0 4px 0;
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  font-weight: 700;
  color: var(--text-head);
}
.notification-message {
  margin: 0 0 4px 0;
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
  color: var(--text-title);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
.notification-time {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--xs);
  color: var(--text-base);
  text-align: right;
}
/* Пустое состояние */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  color: var(--text-base);
}

.empty-state .material-symbols-outlined {
  font-size: 3rem;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--sm);
}

/* Кликабельные уведомления */
.notification-item.clickable {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.notification-item.clickable:hover {
  background-color: var(--bg-card);
}

.notification-item.clickable:active {
  transform: scale(0.98);
}

/* Футер */
.dropdown-footer {
  padding: 4px;
  border-top: 1px solid var(--border);
  text-align: center;
}

.view-all-link {
  display: inline-block;
  padding: 8px 16px;
  color: var(--color-title);
  font-family: 'Roboto Condensed', sans-serif;
  font-size: var(--xxs);
  font-weight: 500;
  text-transform: uppercase;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.view-all-link:hover {
  background: var(--y10);
}

/* Подсказка в уведомлении */
.notification-hint {
  font-size: var(--xs);
  color: var(--text-title);
  margin-top: 4px;
  font-style: italic;
}

/* Анимация при наведении */
.notification-item.clickable:hover .notification-hint {
  color: var(--text-head);
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
/* ========================================= */
/* АНИМАЦИЯ */
/* ========================================= */
/* Desktop - выезжает СНИЗУ ВВЕРХ */
.notification-bell .dropdown-enter-active,
.notification-bell .dropdown-leave-active {
  transition: all 0.3s ease;
}

.notification-bell .dropdown-enter-from,
.notification-bell .dropdown-leave-to {
  opacity: 0;
  transform: translateY(8px); /* ✅ Снизу вверх */
}
/* Mobile - выезжает СНИЗУ */
.notification-bell-mobile .dropdown-enter-active,
.notification-bell-mobile .dropdown-leave-active {
  transition: all 0.3s ease;
}

.notification-bell-mobile .dropdown-enter-from,
.notification-bell-mobile .dropdown-leave-to {
  opacity: 0;
}
</style>
