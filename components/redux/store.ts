import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer, PersistConfig } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import userDetailsReducer from "./userDetailsSlice";
import { searchApi } from './reduxSearch';

// Root reducer
const rootReducer = combineReducers({ userDetails: userDetailsReducer, [searchApi.reducerPath]: searchApi.reducer, });

// Derive RootState from rootReducer so we can type persist config
export type RootState = ReturnType<typeof rootReducer>;

// Persist config
const persistConfig: PersistConfig<RootState> = {
    key: 'root',
    storage,
    whitelist: ['authDetails', 'userDetails'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // ignore redux-persist actions
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }).concat(searchApi.middleware),
});

export const persistor = persistStore(store);

// AppDispatch type
export type AppDispatch = typeof store.dispatch;
