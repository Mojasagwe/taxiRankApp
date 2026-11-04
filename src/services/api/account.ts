import { ImageSourcePropType } from 'react-native';
import api from './axios';
import { authService } from './auth';
import { ApiResponse, User } from '../../types/auth';
import { NotificationSettings } from '../../types/trips';

const data = <T>(response: { data: ApiResponse<T> }): T => response.data.data as T;

export interface UpdateMyDetails {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  /** Required by the server when the email or phone number changes */
  currentPassword?: string;
}

/** A photo picked on the phone, ready to upload */
export interface PickedPhoto {
  uri: string;
  type?: string;
  fileName?: string;
}

/** The signed-in person's own account (/api/users/me) */
export const myAccountService = {
  updateDetails: async (changes: UpdateMyDetails) => data<User>(await api.put('/users/me', changes)),

  notifications: async () => data<NotificationSettings>(await api.get('/users/me/notifications')),

  updateNotifications: async (settings: NotificationSettings) =>
    data<NotificationSettings>(await api.put('/users/me/notifications', settings)),

  /** Permanent. The caller logs out afterwards; the server has already revoked every token. */
  deleteAccount: async (password: string, confirmation: string) => {
    await api.post('/users/me/delete', { password, confirmation });
  },

  uploadPhoto: async (photo: PickedPhoto) => {
    const form = new FormData();
    form.append('photo', { uri: photo.uri, type: photo.type ?? 'image/jpeg', name: photo.fileName ?? 'photo.jpg' } as any);
    return data<User>(
      await api.put('/users/me/photo', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        // Let React Native's networking encode the multipart body
        transformRequest: body => body,
      }),
    );
  },

  removePhoto: async () => data<User>(await api.delete('/users/me/photo')),

  /** Image source for a photoUrl from the server; photos need the login token */
  photoSource: async (photoUrl: string): Promise<ImageSourcePropType> => {
    const root = (api.defaults.baseURL ?? '').replace(/\/api\/?$/, '');
    const token = await authService.token();
    return { uri: root + photoUrl, headers: token ? { Authorization: `Bearer ${token}` } : undefined };
  },
};
