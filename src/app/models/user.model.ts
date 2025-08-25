export interface User {
  id?: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

