
export interface AuthResponse {
  code: string;
  status: boolean;
  message: string;
  date: string;
  data: {
    access_token: string;
    refresh_token?: string;
    token_type: string;
    expires_in: number;
  };

}
