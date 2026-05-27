import client from './client';
import type { AuthResponse, User } from '../types';

export const authApi = {
  register: (name: string, email: string, password: string) =>
    client.post<AuthResponse>('/auth/register', { name, email, password }).then((r) => r.data),

  login: (email: string, password: string) =>
    client.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data),

  getMe: () => client.get<User>('/auth/me').then((r) => r.data),
};
