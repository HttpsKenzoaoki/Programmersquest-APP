/**
 * Contratos da API (NestJS).
 *
 * O backend (NestJS) ainda não está conectado ao app, então estes contratos
 * definem o "shape" exato dos endpoints que serão consumidos quando a API
 * estiver disponível. Basta trocar a implementação mock por chamadas fetch().
 *
 * Endpoints esperados:
 *  - POST /auth/register        { name, email, password } -> User
 *  - POST /auth/login           { email, password }       -> User
 *  - POST /auth/logout
 *  - GET  /users/:id                                      -> User
 *  - PATCH /users/:id            { name?, avatarUri? }    -> User
 *  - GET  /leaderboard                                    -> LeaderboardEntry[]
 *  - POST /contact              { userId, subject, message } -> ContactMessage
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export const apiRoutes = {
  auth: {
    register: `${API_BASE_URL}/auth/register`,
    login: `${API_BASE_URL}/auth/login`,
    logout: `${API_BASE_URL}/auth/logout`,
  },
  users: {
    profile: (id) => `${API_BASE_URL}/users/${id}`,
  },
  leaderboard: `${API_BASE_URL}/leaderboard`,
  contact: `${API_BASE_URL}/contact`,
};
