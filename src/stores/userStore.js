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
  collection,
  getDocs,
  query,
  where,
  limit,
  getIdTokenResult,
} from '../firebase.js';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    isLoggedIn: false,
    isLoading: true,
    isCreatingPortal: false,
    isCreatingCheckout: false,
    manualPro: false,
    stripeRole: null,
    subscriptionExpires: null,
  }),
  getters: {
    isPro: (state) => {
      return state.manualPro === true || !!state.stripeRole;
    },
    subscriptionEndDate: (state) => {
      if (state.subscriptionExpires) {
        return new Date(state.subscriptionExpires * 1000).toLocaleDateString();
      }
      return null;
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
            this.subscriptionExpires = null;
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
      // 3. ПОЛУЧАЕМ ДАТУ ОКОНЧАНИЯ ПОДПИСКИ
      if (this.isPro && !this.manualPro) {
        // Если пользователь PRO (и это не "ручной" PRO), ищем его подписку
        await this.fetchSubscriptionEndDate(user.uid);
      }
    },
    async fetchSubscriptionEndDate(uid) {
      try {
        // Ищем в 'customers/{uid}/subscriptions'
        const subsRef = collection(db, 'customers', uid, 'subscriptions');
        // Запрос: "дай мне одну (limit(1)) активную ('active') подписку"
        const q = query(
          subsRef,
          where('status', 'in', ['trialing', 'active']), // Ищем активную или триальную
          limit(1)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Подписка найдена
          const subData = querySnapshot.docs[0].data();
          // Сохраняем timestamp (e.g., 176... )
          this.subscriptionExpires = subData.current_period_end.seconds;
        } else {
          this.subscriptionExpires = null;
        }
      } catch (error) {
        console.error('Ошибка получения даты подписки:', error);
        this.subscriptionExpires = null;
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
