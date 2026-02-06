import { apiSlice } from '../api/apiSlice';
import { User } from '../../types';

interface UpdateProfileRequest {
  username?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

interface AuthResponse {
  _id: string;
  username: string;
  email: string;
  token: string;
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<{ user: User; token: string }, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: AuthResponse) => ({
        user: { _id: response._id, username: response.username, email: response.email },
        token: response.token,
      }),
    }),
    register: builder.mutation<{ user: User; token: string }, { username: string; email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: AuthResponse) => ({
        user: { _id: response._id, username: response.username, email: response.email },
        token: response.token,
      }),
    }),
    updateProfile: builder.mutation<{ _id: string; username: string; email: string }, UpdateProfileRequest>({
      query: (data) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: data,
      }),
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useUpdateProfileMutation } = authApi;
