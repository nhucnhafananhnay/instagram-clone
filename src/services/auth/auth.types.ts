export interface AuthUser {
  _id: string;
  email: string;
  username: string;
  fullName: string;
  profilePicture: string | null;
  bio: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginData {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type LoginResponse = ApiResponse<LoginData>;
export type AuthSession = LoginData;

export interface RegisterRequest {
  email: string;
  username: string;
  fullName: string;
  password: string;
  confirmPassword: string;
}

export interface RegisteredUser {
  _id: string;
  email: string;
  username: string;
  fullName: string;
  isVerified: boolean;
  createdAt: string;
}

export interface RegisterData {
  user: RegisteredUser;
}

export type RegisterResponse = ApiResponse<RegisterData>;

export interface VerifyEmailUser {
  _id: string;
  email: string;
  username: string;
  isVerified: boolean;
}

export interface VerifyEmailData {
  user: VerifyEmailUser;
}

export interface RefreshTokenData {
  accessToken: string;
  refreshToken: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export type ForgotPasswordResponse = ApiResponse<null>;

export interface ResetPasswordRequest {
  password: string;
  confirmPassword: string;
}
