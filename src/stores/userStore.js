//src/stores/userStore.js
import { defineStore } from 'pinia';
import { useSettingsStore } from './settingsStore';
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
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  limit,
  serverTimestamp,
} from '../firebase.js';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    isLoggedIn: false,
    isLoading: true,
    isCreatingPortal: false,
    isCreatingCheckout: false,
    // ✅ Флаги подписки
    manualPro: false,
    manualPremium: false,
    tier: 'free',
    subscriptionExpires: null,
    // ✅ Trial период
    trialActive: false,
    trialStartDate: null,
    trialEndDate: null,
    trialUsed: false,
    trialDaysLeft: 0,
  }),
  getters: {
    isPro: (state) => {
      return state.tier === 'pro' || state.manualPro === true;
    },
    isPremium: (state) => {
      return state.tier === 'premium' || state.manualPremium === true;
    },
    isPaid: (state) => {
      return state.tier === 'pro' || state.tier === 'premium' || state.manualPro || state.manualPremium;
    },
    isOnTrial: (state) => {
      return state.trialActive === true;
    },
    tierName: (state) => {
      const names = {
        free: 'FREE',
        pro: 'PRO',
        premium: 'PREMIUM',
      };
      return names[state.tier] || 'FREE';
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

            const settingsStore = useSettingsStore();
            if (this.isPaid) {
              settingsStore.fetchAvailableVoices();
            }
          } else {
            this.user = null;
            this.isLoggedIn = false;
            this.manualPro = false;
            this.manualPremium = false;
            this.tier = 'free';
            this.subscriptionExpires = null;
          }
          this.isLoading = false;
          resolve();
        });
      });
    },
    async getOrCreateUserProfile(user) {
      const userDocRef = doc(db, 'users', user.uid);

      try {
        // 1. ПРОВЕРЯЕМ, существует ли профиль
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          // ✅ Профиль существует — просто читаем
          const userData = userDoc.data();
          this.manualPro = userData.manualProOverride === true;
          this.manualPremium = userData.manualPremiumOverride === true;
          // ✅ Читаем trial поля
          this.trialUsed = userData.trialUsed === true;
          this.trialStartDate = userData.trialStartDate || null;
          this.trialEndDate = userData.trialEndDate || null;
          // Проверяем активность trial
          this.checkTrialStatus();
        } else {
          // ✅ Профиля нет — создаём с merge: true
          console.log('📝 Создаём профиль...');

          const newUserProfile = {
            email: user.email,
            displayName: user.displayName || 'Anonymous',
            createdAt: serverTimestamp(),
            manualProOverride: false,
            manualPremiumOverride: false,
            // ✅ Trial поля
            trialStartDate: null,
            trialEndDate: null,
            trialUsed: false,
          };

          // ⚠️ ВАЖНО: merge: true защищает от повторного создания
          await setDoc(userDocRef, newUserProfile, { merge: true });

          this.manualPro = false;
          this.manualPremium = false;
          this.trialUsed = false;
          this.trialActive = false;
          this.trialStartDate = null;
          this.trialEndDate = null;
          this.trialDaysLeft = 0;
          console.log('✅ Профиль создан');
        }
      } catch (error) {
        console.error('❌ Ошибка профиля:', error.code, error.message);
        this.manualPro = false;
        this.manualPremium = false;
        this.trialUsed = false;
        this.trialActive = false;
      }

      // 2. Определяем tier из Firestore subscriptions
      await this.fetchUserTier(user.uid);

      // 3. Получаем дату окончания подписки
      if (this.isPaid && !this.manualPro && !this.manualPremium && !this.trialActive) {
        await this.fetchSubscriptionEndDate(user.uid);
      }
    },
    async fetchUserTier(uid) {
      try {
        // 1. ПРИОРИТЕТ: Manual Premium Override
        if (this.manualPremium) {
          this.tier = 'premium';
          console.log('🎫 Manual PREMIUM override enabled');
          return;
        }

        // 2. ПРИОРИТЕТ: Manual Pro Override
        if (this.manualPro) {
          this.tier = 'pro';
          console.log('🎫 Manual PRO override enabled');
          return;
        }

        // 3. ПРИОРИТЕТ: Trial активен
        if (this.trialActive) {
          this.tier = 'pro';
          console.log(`🎫 Trial active (${this.trialDaysLeft} days left)`);
          return;
        }

        // 4. ПРИОРИТЕТ: Stripe подписка
        // Получаем все подписки пользователя
        const subscriptionsRef = collection(db, 'customers', uid, 'subscriptions');
        const subscriptionsSnapshot = await getDocs(subscriptionsRef);

        // Ищем активную подписку
        const activeSubscription = subscriptionsSnapshot.docs.find((doc) => {
          const data = doc.data();
          return data.status === 'active' || data.status === 'trialing';
        });

        // Если есть активная подписка → берём tier из metadata
        if (activeSubscription) {
          const subscriptionData = activeSubscription.data();
          const tier = subscriptionData.metadata?.tier;

          if (tier) {
            this.tier = tier;
            console.log(`🎫 User tier: ${tier} (from Stripe)`);
            return;
          }
        }

        // 5. FALLBACK: Free tier
        this.tier = 'free';
        console.log('🎫 User tier: free (no active subscription)');
      } catch (error) {
        console.error('❌ Ошибка получения tier:', error);
        this.tier = 'free';
      }
    },
    checkTrialStatus() {
      // Если trial не был начат — неактивен
      if (!this.trialStartDate || !this.trialEndDate) {
        this.trialActive = false;
        this.trialDaysLeft = 0;
        return;
      }

      const now = new Date();
      const endDate = this.trialEndDate.toDate ? this.trialEndDate.toDate() : new Date(this.trialEndDate);

      // Если trial закончился
      if (now >= endDate) {
        this.trialActive = false;
        this.trialDaysLeft = 0;
        console.log('⏰ Trial expired');
        return;
      }

      // Trial ещё активен
      this.trialActive = true;

      // Считаем сколько дней осталось
      const diffTime = endDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      this.trialDaysLeft = diffDays;

      console.log(`✅ Trial active: ${this.trialDaysLeft} days left`);
    },
    async startTrial() {
      if (!this.user) {
        console.error('❌ User not logged in');
        return false;
      }

      // Проверяем, не использован ли уже trial
      if (this.trialUsed) {
        console.log('❌ Trial already used');
        return false;
      }

      try {
        const userDocRef = doc(db, 'users', this.user.uid);

        const now = new Date();
        const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 дней

        // Обновляем Firestore
        await updateDoc(userDocRef, {
          trialStartDate: now,
          trialEndDate: endDate,
          trialUsed: true,
        });

        // Обновляем state
        this.trialStartDate = now;
        this.trialEndDate = endDate;
        this.trialUsed = true;
        this.trialActive = true;
        this.trialDaysLeft = 7;

        // Пересчитываем tier (теперь будет 'pro')
        await this.fetchUserTier(this.user.uid);

        console.log('🎉 Trial started! 7 days of PRO access');
        return true;
      } catch (error) {
        console.error('❌ Error starting trial:', error);
        return false;
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
