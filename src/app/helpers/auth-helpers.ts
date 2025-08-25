import { User } from '../models/user.model';

export interface AuthResult {
  user: User | null;
  message: string;
  success: boolean;
}

export const AuthMessages = {
  EMAIL_NOT_FOUND: 'Email is incorrect',
  PASSWORD_WRONG: 'Password is incorrect',
  ROLE_NOT_ALLOWED: (role: string) => `You cannot login here with a ${role} account`,
  EMAIL_EXISTS: 'Email is already registered',
  SUCCESS: 'Login successful',
};
