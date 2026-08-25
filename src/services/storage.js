import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  user: '@pq/user',
  completedLessons: '@pq/completedLessons',
};

export async function saveUser(userJson) {
  await AsyncStorage.setItem(KEYS.user, userJson);
}

export async function loadUser() {
  return AsyncStorage.getItem(KEYS.user);
}

export async function clearUser() {
  await AsyncStorage.removeItem(KEYS.user);
}

export async function saveCompletedLessons(ids) {
  await AsyncStorage.setItem(KEYS.completedLessons, JSON.stringify(ids));
}

export async function loadCompletedLessons() {
  const raw = await AsyncStorage.getItem(KEYS.completedLessons);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function clearCompletedLessons() {
  await AsyncStorage.removeItem(KEYS.completedLessons);
}
