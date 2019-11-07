import { combineReducers } from 'redux';
import { gorillaReducerFactory } from '../../src/lib/reducer';

export const createRootReducer = () =>
  combineReducers({
    gorilla: gorillaReducerFactory(),
  });
