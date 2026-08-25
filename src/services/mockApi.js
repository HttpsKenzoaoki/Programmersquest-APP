/**
 * Mock da API NestJS.
 *
 * Simula os endpoints de auth, perfil, leaderboard e contato enquanto o
 * backend real não está conectado. Toda a "persistência" é em memória +
 * AsyncStorage (feita pela camada de store), mantendo os mesmos contratos
 * definidos em api.js.
 */

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

function makeId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

const FAKE_LEADERBOARD = [
  { userId: 'u1', name: 'Morgana', avatarUri: null, points: 1820 },
  { userId: 'u2', name: 'Merlin', avatarUri: null, points: 1540 },
  { userId: 'u3', name: 'Gandalf', avatarUri: null, points: 1320 },
  { userId: 'u4', name: 'Circe', avatarUri: null, points: 1180 },
  { userId: 'u5', name: 'Albus', avatarUri: null, points: 940 },
  { userId: 'u6', name: 'Hermione', avatarUri: null, points: 760 },
  { userId: 'u7', name: 'Raven', avatarUri: null, points: 520 },
  { userId: 'u8', name: 'Draco', avatarUri: null, points: 300 },
  { userId: 'u9', name: 'Luna', avatarUri: null, points: 120 },
];

export const mockApi = {
  async register({ name, email }) {
    await delay();
    return {
      id: makeId('user'),
      name,
      email,
      avatarUri: null,
      points: 0,
      streak: 0,
      createdAt: Date.now(),
    };
  },

  async login(email, _password) {
    await delay();
    const name = email.split('@')[0];
    return {
      id: makeId('user'),
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email,
      avatarUri: null,
      points: 0,
      streak: 0,
      createdAt: Date.now(),
    };
  },

  async logout() {
    await delay(200);
  },

  async getProfile(userId) {
    await delay(200);
    return {
      id: userId,
      name: 'Mago',
      email: 'mago@exemplo.com',
      avatarUri: null,
      points: 0,
      streak: 0,
      createdAt: Date.now(),
    };
  },

  async updateProfile(userId, patch) {
    await delay();
    return {
      id: userId,
      name: patch.name ?? 'Mago',
      email: 'mago@exemplo.com',
      avatarUri: patch.avatarUri ?? null,
      points: 0,
      streak: 0,
      createdAt: Date.now(),
    };
  },

  async getLeaderboard() {
    await delay(400);
    return [...FAKE_LEADERBOARD];
  },

  async sendContact(message) {
    await delay(700);
    return { ...message, id: makeId('msg'), createdAt: Date.now() };
  },
};
