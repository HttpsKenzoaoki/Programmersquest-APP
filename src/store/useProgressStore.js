import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useProgressStore = create(
  persist(
    (set, get) => ({
      completedLessonIds: [],

      markLessonComplete(lessonId) {
        const current = get().completedLessonIds;
        if (current.includes(lessonId)) return;
        set({ completedLessonIds: [...current, lessonId] });
      },

      isLessonCompleted(lessonId) {
        return get().completedLessonIds.includes(lessonId);
      },

      resetProgress() {
        set({ completedLessonIds: [] });
      },
    }),
    {
      name: 'pq-progress',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
