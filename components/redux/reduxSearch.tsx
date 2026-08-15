import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Contact } from '../util/types';

export interface SearchContactsArgs {
  query: string;
  limit: number;
}

export const searchApi = createApi({
  reducerPath: 'searchApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  tagTypes: ['SearchContacts'],
  keepUnusedDataFor: 60,
  endpoints: (builder) => ({
    searchContacts: builder.query<Contact[], SearchContactsArgs>({
      query: ({ query, limit }) => ({ url: '/api/contact/search', params: { query, limit,}, }),
      transformResponse: (response: { message?: Contact[] } | Contact[]) => {
        if (Array.isArray(response)) { 
            return response;
        }
        return response.message ?? [];
      },
      providesTags: ['SearchContacts'],
    }),
  }),
});

export const { useLazySearchContactsQuery } = searchApi;
