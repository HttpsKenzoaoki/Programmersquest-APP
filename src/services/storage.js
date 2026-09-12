import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  user: '@pq/user',
  completedLessons: '@pq/completedLessons',
  audits: '@pq/audit_history',
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

export async function saveAuditRecord(record) {
  const existing = await loadAuditHistory();
  const updated = [record, ...existing];
  await AsyncStorage.setItem(KEYS.audits, JSON.stringify(updated));
  return updated;
}

export async function loadAuditHistory() {
  const raw = await AsyncStorage.getItem(KEYS.audits);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function clearAuditHistory() {
  await AsyncStorage.removeItem(KEYS.audits);
}

