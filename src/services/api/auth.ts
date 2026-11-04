import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './axios';
import { ApiResponse, AuthPayload, RegisterRequest, User } from '../../types/auth';

const TOKEN_KEY = 'userToken';
const USER_KEY = 'userData';

const saveSession = async ({ user, token }: AuthPayload): Promise<User> => {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, token],
    [USER_KEY, JSON.stringify(user)],
  ]);
  return user;
};

export const authService = {
  /** Every self sign-up gets the Commuter profile; rank admins apply afterwards */
  register: async (data: RegisterRequest): Promise<User> => {
    const response = await api.post<ApiResponse<AuthPayload>>('/auth/register', data);
    return saveSession(response.data.data!);
  },

  /** identifier: email for people, rank code for rank accounts */
  login: async (identifier: string, password: string): Promise<User> => {
    const response = await api.post<ApiResponse<AuthPayload>>('/auth/login', { identifier: identifier.trim(), password });
    return saveSession(response.data.data!);
  },

  me: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    const user = response.data.data!;
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },

  /** The server revokes every older token and returns a new one for this phone */
  changePassword: async (currentPassword: string, newPassword: string): Promise<User> => {
    const response = await api.post<ApiResponse<AuthPayload>>('/auth/change-password', { currentPassword, newPassword });
    return saveSession(response.data.data!);
  },

  storeUser: async (user: User): Promise<void> => {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  token: (): Promise<string | null> => AsyncStorage.getItem(TOKEN_KEY),

  /** The user saved at the last login, if a token is still stored */
  storedUser: async (): Promise<User | null> => {
    const [[, token], [, userJson]] = await AsyncStorage.multiGet([TOKEN_KEY, USER_KEY]);
    return token && userJson ? (JSON.parse(userJson) as User) : null;
  },

  logout: async (): Promise<void> => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  },
};
