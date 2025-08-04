
export interface LoginPayload {
  msisdn?: string;
  password?: string;
  grantType: 'password' | 'refreshToken';
  withRefreshToken: boolean;
  refreshToken?: string;

}
