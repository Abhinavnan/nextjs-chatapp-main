import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserDetails, Contact } from '../util/types';

const initialState: UserDetails = {
    userId: '',
    name: '',
    email: '',
    profilePicture: '',
    contacts: [],
};

const userDetailsSlice = createSlice({
    name: 'userDetails',
    initialState,
    reducers: {
        resetUserDetails: (state: UserDetails) => initialState,
        updateUserDetails: (state: UserDetails, action: PayloadAction<Partial<UserDetails>>) => ({ ...state, ...action.payload }),
        addContact: (state: UserDetails, action: PayloadAction<Contact>) => {
            const contact = action.payload;
            const existingContacts = Array.isArray(state.contacts) ? state.contacts : [];
            const existingContact = existingContacts.find(c => c?.id === contact.id) || {};
            const updatedContact = { ...existingContact, ...contact };
            const updatedContacts = [...existingContacts.filter(c => c?.id !== contact.id), updatedContact];
            return { ...state, contacts: updatedContacts };
        }
    },
});

export const { resetUserDetails, updateUserDetails, addContact } = userDetailsSlice.actions;
export default userDetailsSlice.reducer;
