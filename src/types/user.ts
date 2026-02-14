export type LoginType = 'phone' | 'username';

export interface LoginPayload {
  login_type: LoginType;
  username?: string | null;
  phone?: string | null;
  password: string;
  device_id: string;
  device_type: 'tv';
  device_name: string;
  notification_id?: string | null;
}

export interface LoginResponse {
  token: string;
  user: any;
}
