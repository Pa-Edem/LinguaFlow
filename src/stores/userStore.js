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
  db,
  doc,
  getDoc,
  setDoc,
  getIdTokenResult,
} from '../firebase.js';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    isLoggedIn: false,
    isLoading: true,
    manualPro: false,
    stripeRole: null,
  }),
  getters: {
    isPro: (state) => {
      return state.manualPro === true || !!state.stripeRole;
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
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            this.user = user;
            this.isLoggedIn = true;

            await this.getOrCreateUserProfile(user);
          } else {
            this.user = null;
            this.isLoggedIn = false;
            this.manualPro = false;
            this.stripeRole = null;
          }
          this.isLoading = false;
          resolve();
        });
      });
    },
    async getOrCreateUserProfile(user) {
      // 1. Проверяем Firestore (для "ручного" PRO)
      const userDocRef = doc(db, 'users', user.uid);
      try {
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          // --- Пользователь существует ---
          const userData = userDoc.data();
          this.manualPro = userData.manualProOverride === true;
        } else {
          // --- Пользователь НЕ существует ---
          const newUserProfile = {
            email: user.email,
            displayName: user.displayName || 'Anonymous',
            createdAt: new Date(),
            manualProOverride: false,
          };
          await setDoc(userDocRef, newUserProfile);
          this.manualPro = false;
        }
      } catch (error) {
        console.error('Ошибка получения/создания профиля:', error);
        this.manualPro = false;
      }
      // 2. ПРОВЕРЯЕМ "МЕТКИ" (Custom Claims) ОТ STRIPE
      try {
        // Принудительно обновляем токен, чтобы получить свежие данные от Stripe
        const idTokenResult = await getIdTokenResult(user, true);
        // Расширение Stripe записывает роль в 'stripeRole'
        this.stripeRole = idTokenResult.claims.stripeRole || null;
      } catch (error) {
        console.error('Ошибка получения Custom Claims:', error);
        this.stripeRole = null;
      }
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
