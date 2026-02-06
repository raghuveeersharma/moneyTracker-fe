import { apiSlice } from '../api/apiSlice';
import { Contact } from '../../types';

export const contactApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getContacts: builder.query<Contact[], void>({
      query: () => '/contacts',
      providesTags: ['Contact'],
    }),
    addContact: builder.mutation<Contact, Partial<Contact>>({
      query: (body) => ({
        url: '/contacts',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Contact'],
    }),
    deleteContact: builder.mutation<void, string>({
      query: (id) => ({
        url: `/contacts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Contact'],
    }),
  }),
});

export const {
  useGetContactsQuery,
  useAddContactMutation,
  useDeleteContactMutation,
} = contactApi;
