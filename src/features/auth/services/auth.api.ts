import { api } from '../../../shared/hooks/api';
import { LoginPayload } from '../../../types/user';

interface TVSession {
  session_id: string;
  code: string;
  qr_data: string;
  expires_in: number;
}

interface TVStatusResponse {
  status: 'pending' | 'confirmed' | 'expired';
  expires_in: number;
  user: any | null;
  tokens: { access_token: string; refresh_token: string } | null;
  device_id: string | null;
}

export const authApi = {
  async login(payload: LoginPayload) {
    const res = await api<any>('/auth/login', {
      method: 'POST',
      body: payload,
      retry: 2,
    });

    return res.data.tokens.access_token;
  },

  async createTVSession(
    device_id: string,
    device_name: string,
  ): Promise<TVSession> {
    const res = await api<any>('/auth/tv/session', {
      method: 'POST',
      body: { device_id, device_name },
      skipAuth: true,
    });
    return res.data as TVSession;
  },

  async checkTVStatus(session_id: string): Promise<TVStatusResponse> {
    const res = await api<any>(`/auth/tv/status/${session_id}`, {
      skipAuth: true,
    });
    return res.data as TVStatusResponse;
  },
};
