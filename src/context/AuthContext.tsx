import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { authService } from '../services/api/auth';
import { AuthContextType, Permission, RegisterRequest, SignUpIntent, User } from '../types/auth';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signUpIntent, setSignUpIntent] = useState<SignUpIntent | null>(null);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setSignUpIntent(null);
  }, []);

  // Restore the stored session, then confirm it with the server: a suspension,
  // block or password reset since the last launch takes effect here
  useEffect(() => {
    (async () => {
      try {
        const stored = await authService.storedUser();
        if (stored) {
          setUser(stored);
          try {
            setUser(await authService.me());
          } catch (error: any) {
            const status = error?.response?.status;
            if (status === 401 || (status === 403 && error?.response?.data?.error !== 'PASSWORD_CHANGE_REQUIRED')) {
              await logout();
            }
            // Offline or server down: keep the stored session
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [logout]);

  const login = useCallback(async (identifier: string, password: string) => {
    const loggedIn = await authService.login(identifier, password);
    setSignUpIntent(null);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const register = useCallback(async (data: RegisterRequest, intent: SignUpIntent) => {
    const created = await authService.register(data);
    setSignUpIntent(intent);
    setUser(created);
    return created;
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    const updated = await authService.changePassword(currentPassword, newPassword);
    setUser(updated);
    return updated;
  }, []);

  const refreshUser = useCallback(async () => {
    setUser(await authService.me());
  }, []);

  const updateUser = useCallback(async (updated: User) => {
    await authService.storeUser(updated);
    setUser(updated);
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      signUpIntent,
      login,
      register,
      changePassword,
      refreshUser,
      updateUser,
      logout,
      can: (permission: Permission) => !!user?.permissions?.includes(permission),
      clearSignUpIntent: () => setSignUpIntent(null),
    }),
    [user, loading, signUpIntent, login, register, changePassword, refreshUser, updateUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
