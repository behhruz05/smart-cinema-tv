import { api } from '../../../shared/hooks/api';
import { LoginPayload, LoginResponse } from '../types';

export const authApi = {
  login(payload: LoginPayload) {
    return api<LoginResponse>('/auth/login', {
      method: 'POST',
      body: payload,
      retry: 2,
    });
  },
};
