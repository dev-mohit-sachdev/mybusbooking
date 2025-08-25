import { Injectable } from '@angular/core';
import { AuthResult, AuthMessages } from '../helpers/auth-helpers';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  query,
  where,
  getDocs
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private usersCollection: CollectionReference;

  constructor(private firestore: Firestore) {
    this.usersCollection = collection(this.firestore, 'users');
  }

  async isEmailTaken(email: string): Promise<boolean> {
    const q = query(this.usersCollection, where('email', '==', email));
    const snap = await getDocs(q);
    return !snap.empty;
  }

  // ✅ Add user
async addUser(user: { email: string; password: string; role: 'user' | 'admin' }): Promise<{ status: number; message: string }> {
    // 1) check if email already exists
    const q = query(this.usersCollection, where('email', '==', user.email));
    const snap = await getDocs(q);

    if (!snap.empty) {
      return { status: 400, message: 'Email already registered' };
    }

    // 2) add user
    await addDoc(this.usersCollection, user);
    return { status: 201, message: 'User registered successfully' };
  }

  // ✅ Login with role validation
 async getUserByEmailAndPassword(
  email: string,
  password: string,
  expectedRole: 'admin' | 'user'
): Promise<AuthResult> {
  const q = query(this.usersCollection, where('email', '==', email));
  const snap = await getDocs(q);

  if (snap.empty) {
    return { user: null, message: AuthMessages.EMAIL_NOT_FOUND, success: false };
  }

  const doc = snap.docs[0];
  const data = doc.data() as User;

  if (data.role !== expectedRole) {
    return {
      user: null,
      message: AuthMessages.ROLE_NOT_ALLOWED(data.role),
      success: false,
    };
  }

  if (data.password !== password) {
    return { user: null, message: AuthMessages.PASSWORD_WRONG, success: false };
  }

  delete (data as any).password

  return {
    user: { id: doc.id, ...data },
    message: AuthMessages.SUCCESS,
    success: true,
  };

}

  // READ ALL
  getUsers(): Observable<User[]> {
    return collectionData(this.usersCollection, { idField: 'id' }) as Observable<User[]>;
  }

  // LOGIN: Check by email & password
// async getUserByEmailAndPassword(email: string, password: string): Promise<{ user: User | null; message: string }> {
//   try {
//     // 1) First check if email exists
//     const emailQuery = query(this.usersCollection, where('email', '==', email));
//     const emailSnap = await getDocs(emailQuery);

//     if (emailSnap.empty) {
//       return { user: null, message: 'Email is incorrect' };
//     }

//     const doc = emailSnap.docs[0];
//     const userData = doc.data() as Omit<User, 'id'>;

//     // 2) Now check password
//     if (userData.password !== password) {
//       return { user: null, message: 'Password is incorrect' };
//     }

//     // 3) Return success
//     return { user: { id: doc.id, ...userData }, message: 'Login successful' };

//   } catch (error) {
//     console.error('Login error:', error);
//     return { user: null, message: 'Something went wrong' };
//   }
// }


  // UPDATE
  updateUser(id: string, patch: Partial<User>) {
    const ref = doc(this.firestore, `users/${id}`);
    return updateDoc(ref, patch);
  }

  // DELETE
  deleteUser(id: string) {
    const ref = doc(this.firestore, `users/${id}`);
    return deleteDoc(ref);
  }
}
