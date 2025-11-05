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
  serverTimestamp,
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
      console.log('🔍 Проверка профиля для:', user.uid);

      const userDocRef = doc(db, 'users', user.uid);

      try {
        // 1. ПРОВЕРЯЕМ, существует ли профиль
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          // ✅ Профиль существует — просто читаем
          const userData = userDoc.data();
          this.manualPro = userData.manualProOverride === true;
          console.log('✅ Профиль загружен, PRO:', this.manualPro);
        } else {
          // ✅ Профиля нет — создаём с merge: true
          console.log('📝 Создаём профиль...');

          const newUserProfile = {
            email: user.email,
            displayName: user.displayName || 'Anonymous',
            createdAt: serverTimestamp(),
            manualProOverride: false,
          };

          // ⚠️ ВАЖНО: merge: true защищает от повторного создания
          await setDoc(userDocRef, newUserProfile, { merge: true });

          this.manualPro = false;
          console.log('✅ Профиль создан');
        }
      } catch (error) {
        console.error('❌ Ошибка профиля:', error.code, error.message);
        this.manualPro = false;
      }

      // 2. Проверяем Custom Claims от Stripe
      try {
        const idTokenResult = await getIdTokenResult(user, true);
        this.stripeRole = idTokenResult.claims.stripeRole || null;
      } catch (error) {
        console.error('❌ Ошибка Custom Claims:', error.code);
        this.stripeRole = null;
      }

      // 3. Получаем дату подписки
      if (this.isPro && !this.manualPro) {
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
