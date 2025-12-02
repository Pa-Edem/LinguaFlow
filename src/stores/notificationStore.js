// src/stores/notificationStore.js
import { defineStore } from 'pinia';
import { db } from '../firebase';
import { collection, query, where, orderBy, limit, getDocs, updateDoc, doc, writeBatch } from 'firebase/firestore';
import { useUserStore } from './userStore';

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    loading: false,
    lastChecked: null,
  }),

  getters: {
    // Количество непрочитанных уведомлений
    unreadCount: (state) => {
      return state.notifications.filter((n) => !n.read).length;
    },

    // Последние 5 уведомлений для выпадающего списка
    recentNotifications: (state) => {
      return state.notifications.slice(0, 5);
    },

    // Все уведомления (для страницы /notifications)
    allNotifications: (state) => {
      return state.notifications;
    },
  },

  actions: {
    /**
     * Загрузить уведомления пользователя
     */
    async loadNotifications() {
      const userStore = useUserStore();

      if (!userStore.isLoggedIn) {
        return;
      }

      this.loading = true;

      try {
        const notificationsRef = collection(db, 'notifications');

        // Запрос: уведомления текущего пользователя, отсортированные по дате
        const q = query(
          notificationsRef,
          where('userId', '==', userStore.user.uid),
          orderBy('createdAt', 'desc'),
          limit(20) // Загружаем максимум 20 последних
        );

        const snapshot = await getDocs(q);

        this.notifications = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        this.lastChecked = new Date();
      } catch (error) {
        console.error('❌ Error loading notifications:', error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Отметить уведомление как прочитанное
     */
    async markAsRead(notificationId) {
      try {
        const notificationRef = doc(db, 'notifications', notificationId);
        await updateDoc(notificationRef, { read: true });

        // Обновляем локальное состояние
        const notification = this.notifications.find((n) => n.id === notificationId);
        if (notification) {
          notification.read = true;
        }
      } catch (error) {
        console.error('❌ Error marking notification as read:', error);
      }
    },

    /**
     * Отметить все уведомления как прочитанные
     */
    async markAllAsRead() {
      const userStore = useUserStore();

      if (!userStore.isLoggedIn) return;

      try {
        const batch = writeBatch(db);

        // Находим все непрочитанные уведомления
        const unreadNotifications = this.notifications.filter((n) => !n.read);

        unreadNotifications.forEach((notification) => {
          const notificationRef = doc(db, 'notifications', notification.id);
          batch.update(notificationRef, { read: true });
        });

        await batch.commit();

        // Обновляем локальное состояние
        this.notifications.forEach((n) => {
          n.read = true;
        });
      } catch (error) {
        console.error('❌ Error marking all as read:', error);
      }
    },

    /**
     * Проверить новые уведомления
     * (вызывается при переходе на /dialogs)
     */
    async checkForNewNotifications() {
      const userStore = useUserStore();

      if (!userStore.isLoggedIn) return;

      // Если последняя проверка была меньше минуты назад - пропускаем
      if (this.lastChecked && new Date() - this.lastChecked < 60000) {
        return;
      }

      await this.loadNotifications();
    },

    /**
     * Очистить уведомления (при выходе)
     */
    clearNotifications() {
      this.notifications = [];
      this.lastChecked = null;
    },
  },
});
