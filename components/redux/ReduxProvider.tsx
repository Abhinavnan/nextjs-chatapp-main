'use client'
import React, {ReactNode} from 'react';
import { Provider } from 'react-redux';
import { store, persistor } from './store';
import { PersistGate } from 'redux-persist/integration/react';
import ReduxLoading from '@/components/contents/loading/ReduxLoading';

const ReduxProvider = ({ children }: {children: ReactNode}) => {
  return (
    <Provider store={store}>
      <PersistGate loading={<ReduxLoading />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  )
}

export default ReduxProvider;
