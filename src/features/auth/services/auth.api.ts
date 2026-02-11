import { api } from '../../../shared/hooks/api';
import { LoginPayload } from '../types';

export const authApi = {
  async login(payload: LoginPayload) {
    const res = await api<any>('/auth/login', {
      method: 'POST',
      body: payload,
      retry: 2,
    });

    return res.data.tokens.access_token;
  },
};
