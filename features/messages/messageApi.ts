import { apiSlice } from '../api/apiSlice';

export interface ChatMessage {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export const messageApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMessages: builder.query<ChatMessage[], string>({
      query: (friendId) => `/messages/${friendId}`,
      providesTags: ['Message'],
    }),
    sendMessage: builder.mutation<ChatMessage, { receiverId: string; content: string }>({
      query: (body) => ({
        url: '/messages',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Message'],
    }),
    markMessagesAsRead: builder.mutation<void, string>({
      query: (friendId) => ({
        url: `/messages/read/${friendId}`,
        method: 'PUT',
      }),
      invalidatesTags: ['Message', 'Friend'], // Invalidate Friend to update unread count
    }),
  }),
});

export const { useGetMessagesQuery, useSendMessageMutation, useMarkMessagesAsReadMutation } = messageApi;
