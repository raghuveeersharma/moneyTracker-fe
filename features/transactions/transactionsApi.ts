import { apiSlice } from '../api/apiSlice';
import { Transaction, DashboardStats } from '../../types';

export const transactionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTransactions: builder.query<Transaction[], void>({
      query: () => '/transactions',
      providesTags: ['Transaction'],
    }),
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => '/transactions/dashboard',
      providesTags: ['Transaction'],
    }),
    addTransaction: builder.mutation<Transaction, Partial<Transaction>>({
      query: (body) => ({
        url: '/transactions',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Transaction'],
    }),
    updateTransaction: builder.mutation<Transaction, { id: string; body: Partial<Transaction> }>({
      query: ({ id, body }) => ({
        url: `/transactions/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Transaction'],
    }),
    respondToTransaction: builder.mutation<Transaction, { id: string; action: 'accept' | 'reject' }>({
      query: ({ id, action }) => ({
        url: `/transactions/${id}/respond`,
        method: 'POST',
        body: { action },
      }),
      invalidatesTags: ['Transaction'],
    }),
    deleteTransaction: builder.mutation<void, string>({
      query: (id) => ({
        url: `/transactions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Transaction'],
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useGetDashboardStatsQuery,
  useAddTransactionMutation,
  useUpdateTransactionMutation,
  useRespondToTransactionMutation,
  useDeleteTransactionMutation,
} = transactionApi;
