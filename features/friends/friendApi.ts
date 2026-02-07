import { apiSlice } from '../api/apiSlice';

export interface Friend {
  _id: string;
  friendshipId: string;
  username: string;
  email: string;
  unreadCount?: number;
}

export interface FriendRequest {
  _id: string;
  requester: { _id: string; username: string; email: string };
  recipient: { _id: string; username: string; email: string };
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface UserSearchResult {
  _id: string;
  username: string;
  email: string;
}

export const friendApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFriends: builder.query<Friend[], void>({
      query: () => '/friends',
      providesTags: ['Friend'],
    }),
    getPendingRequests: builder.query<FriendRequest[], void>({
      query: () => '/friends/pending',
      providesTags: ['Friend'],
    }),
    getSentRequests: builder.query<FriendRequest[], void>({
      query: () => '/friends/sent',
      providesTags: ['Friend'],
    }),
    sendFriendRequest: builder.mutation<void, string>({
      query: (recipientId) => ({
        url: '/friends/request',
        method: 'POST',
        body: { recipientId },
      }),
      invalidatesTags: ['Friend'],
    }),
    acceptFriendRequest: builder.mutation<void, string>({
      query: (id) => ({
        url: `/friends/accept/${id}`,
        method: 'POST',
      }),
      invalidatesTags: ['Friend'],
    }),
    rejectFriendRequest: builder.mutation<void, string>({
      query: (id) => ({
        url: `/friends/reject/${id}`,
        method: 'POST',
      }),
      invalidatesTags: ['Friend'],
    }),
    removeFriend: builder.mutation<void, string>({
      query: (id) => ({
        url: `/friends/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Friend'],
    }),
    searchUsers: builder.query<UserSearchResult[], string>({
      query: (q) => `/auth/users/search?q=${encodeURIComponent(q)}`,
    }),
  }),
});

export const {
  useGetFriendsQuery,
  useGetPendingRequestsQuery,
  useGetSentRequestsQuery,
  useSendFriendRequestMutation,
  useAcceptFriendRequestMutation,
  useRejectFriendRequestMutation,
  useRemoveFriendMutation,
  useLazySearchUsersQuery,
} = friendApi;
