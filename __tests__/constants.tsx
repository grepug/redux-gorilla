import * as React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { createRootReducer } from './redux/rootReducer';

const TEST_BASE_API = 'http://localhost:3002';

export const getUrl = (url: string) => TEST_BASE_API + url;

export const store = createStore(createRootReducer());

export const ReduxProvider = ({ children }: { children?: React.ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);
