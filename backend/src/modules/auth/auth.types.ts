export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthUserResponse {
  id: string;
  email: string;
  name: string;
  firstName?: string | null;
  lastName?: string | null;
  roleId: string;
  roleName: string;
  status: string;
}

export interface LoginResponseData {
  user: AuthUserResponse;
  accessToken: string;
}

export interface RefreshResponseData {
  user: AuthUserResponse;
  accessToken: string;
}

export interface SessionResponseData {
  user: AuthUserResponse;
  permissions: string[];
}