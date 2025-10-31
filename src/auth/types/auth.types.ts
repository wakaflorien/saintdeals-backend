import { Request } from 'express';

export interface UserProfile {
  id: string;
  uuid: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  emailVerified: boolean;
}

export interface User {
  id: string;
  uuid: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  emailVerified: boolean;
  password?: string;
}

export interface JwtPayload {
  id: string;
  uuid: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user: UserProfile;
}

export interface LoginResponse {
  access_token: string;
  user: string; // encrypted user data
}