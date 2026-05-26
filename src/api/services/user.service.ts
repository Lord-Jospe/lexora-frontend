import api from './axios';
import type { UserProfileResponse, UserUpdateRequest } from '../../types/user.types';
 
export const getProfile = async (): Promise<UserProfileResponse> => {
  const response = await api.get<UserProfileResponse>('/users/me');
  return response.data;
};
 
export const updateUser = async (data: UserUpdateRequest): Promise<UserProfileResponse> => {
  const response = await api.put<UserProfileResponse>('/users/me', data);
  return response.data;
};
 
export const deleteUser = async (): Promise<void> => {
  await api.delete('/users/me');
};
 