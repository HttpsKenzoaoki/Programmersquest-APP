import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockApi } from '../services/mockApi';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      initialized: false,

      async register(credentials) {
        set({ loading: true });
        try {
          const user = await mockApi.register(credentials);
          set({ user, loading: false, initialized: true });
        } finally {
          set({ loading: false });
        }
      },

      async login(email, password) {
        set({ loading: true });
        try {
          const user = await mockApi.login(email, password);
          set({ user, loading: false, initialized: true });
        } finally {
          set({ loading: false });
        }
      },

      async logout() {
        await mockApi.logout();
        set({ user: null, initialized: true });
      },

      async updateProfile(patch) {
        const current = get().user;
        if (!current) return;
        const updated = await mockApi.updateProfile(current.id, patch);
        set({
          user: {
            ...current,
            ...updated,
            name: patch.name ?? current.name,
            avatarUri: patch.avatarUri ?? current.avatarUri,
          },
        });
      },

      addPoints(amount) {
        const current = get().user;
        if (!current) return;
        set({ user: { ...current, points: current.points + amount } });
      },

      incrementStreak() {
        const current = get().user;
        if (!current) return;
        set({ user: { ...current, streak: current.streak + 1 } });
      },
    }),
    {
      name: 'pq-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ initialized: true });
      },
    },
  ),
);
