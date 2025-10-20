//src/stores/userStore.js
import { defineStore } from 'pinia';
import { onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  googleProvider,
} from '../firebase.js';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    isLoggedIn: false,
    isLoading: true,
  }),
  getters: {
    isPro: (state) => {
      return true;
    },
    subscriptionEndDate: (state) => {
      // В будущем: получать дату из state.user.subscriptionData
      if (state.isPro) {
        // Возвращаем дату через год от сегодня (просто для примера)
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1);
        return endDate.toLocaleDateString(); // Форматируем в локальный формат ДД.ММ.ГГГГ
      }
      return null; // Для Free-пользователей возвращаем null
    },
  },
  actions: {
    initUser() {
      return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
          this.user = user;
          this.isLoggedIn = !!user;
          this.isLoading = false;
          resolve();
        });
      });
    },
    async loginWithEmail(email, password) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (error) {
        console.error('Login error:', error.code);
        throw error;
      }
    },
    async registerWithEmail(email, password) {
      try {
        await createUserWithEmailAndPassword(auth, email, password);
      } catch (error) {
        console.error('Registration error:', error.code);
        throw error;
      }
    },
    async loginWithGoogle() {
      try {
        await signInWithPopup(auth, googleProvider);
      } catch (error) {
        console.error('Google login error:', error.code);
        throw error;
      }
    },
    async logout() {
      try {
        await signOut(auth);
      } catch (error) {
        console.error('Logout error:', error.code);
        throw error;
      }
    },
  },
});
