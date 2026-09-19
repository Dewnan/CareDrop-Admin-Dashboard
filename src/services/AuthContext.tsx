import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { SupabaseClient } from '@supabase/supabase-js';
import { auth, db } from './firebaseClient';
import { getSupabaseClient } from './supabaseClient';
import { dataService } from './dataService';

export interface AdminUser {
  uid: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin';
  avatar: string;
  avatarUrl?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AdminUser | null;
  firebaseUser: FirebaseUser | null;
  token: string | null;
  supabase: SupabaseClient;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updatedData: Partial<AdminUser>) => Promise<void>;
  isLoading: boolean;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient>(() => getSupabaseClient());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setIsLoading(true);
      setAuthError(null);

      if (currentUser) {
        try {
          // Check role in Firestore users collection (Option 1B)
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userDocRef);
          const userData = userSnap.data();

          const role = userData?.role;

          if (role !== 'admin' && role !== 'super_admin') {
            await signOut(auth);
            setAuthError('Access denied: Account does not have administrative privileges.');
            setUser(null);
            setFirebaseUser(null);
            setToken(null);
            setSupabaseClient(getSupabaseClient(null));
            dataService.unsubscribeFromLiveData();
            setIsLoading(false);
            return;
          }

          const idToken = await currentUser.getIdToken(true);
          setToken(idToken);
          setFirebaseUser(currentUser);
          setSupabaseClient(getSupabaseClient(idToken));

          const adminUser: AdminUser = {
            uid: currentUser.uid,
            email: currentUser.email || '',
            name: userData?.fullName || currentUser.displayName || 'Admin User',
            role: role === 'super_admin' ? 'super_admin' : 'admin',
            avatar: (userData?.fullName || currentUser.displayName || 'AU')
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2),
            avatarUrl: userData?.profilePictureUrl || userData?.avatarUrl,
          };

          setUser(adminUser);
          dataService.subscribeToLiveData();
        } catch (err: any) {
          console.error('Error fetching admin profile from Firestore:', err);
          setAuthError(err.message || 'Failed to verify admin identity.');
          setUser(null);
          setFirebaseUser(null);
          setToken(null);
          setSupabaseClient(getSupabaseClient(null));
          dataService.unsubscribeFromLiveData();
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
        setToken(null);
        setSupabaseClient(getSupabaseClient(null));
        dataService.unsubscribeFromLiveData();
      }
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
      dataService.unsubscribeFromLiveData();
    };
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      return true;
    } catch (err: any) {
      console.error('Login error:', err);
      setAuthError(err.message || 'Invalid email or password.');
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setFirebaseUser(null);
      setToken(null);
      setSupabaseClient(getSupabaseClient(null));
      setIsLoading(false);
    }
  };

  const updateProfile = async (updatedData: Partial<AdminUser>) => {
    if (!user) return;
    const newUser = { ...user, ...updatedData };
    setUser(newUser);

    try {
      const userRef = doc(db, 'users', user.uid);
      const payload: Record<string, any> = {};
      if (updatedData.name !== undefined) {
        payload.fullName = updatedData.name;
        payload.name = updatedData.name;
      }
      if (updatedData.avatarUrl !== undefined) {
        payload.profilePictureUrl = updatedData.avatarUrl || '';
        payload.avatarUrl = updatedData.avatarUrl || '';
      }
      if (Object.keys(payload).length > 0) {
        await setDoc(userRef, payload, { merge: true });
      }
    } catch (err) {
      console.error('Error persisting profile update to Firestore:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        firebaseUser,
        token,
        supabase: supabaseClient,
        login,
        logout,
        updateProfile,
        isLoading,
        authError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
