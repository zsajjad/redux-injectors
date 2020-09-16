/**
 * Test injectors
 */

import identity from 'lodash/identity';
import createSagaMiddleware from 'redux-saga';
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import { createInjectorsEnhancer } from '../createInjectorsEnhancer';
import getInjectors, { injectReducerFactory } from '../reducerInjectors';

const initialState = { reduced: 'soon' };

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'TEST':
      return {
        ...state,
        reduced: action.payload,
      };
    default:
      return state;
  }
};

function configureStore() {
  const createReducer = (injectedReducers = {}) =>
    combineReducers({
      ...injectedReducers,
      nonInjected: (s = {}) => s,
    });

  const sagaMiddleware = createSagaMiddleware();
  const runSaga = sagaMiddleware.run;
  const middlewares = [sagaMiddleware];
  const enhancers = [
    applyMiddleware(...middlewares),
    createInjectorsEnhancer({ createReducer, runSaga }),
  ];

  const store = createStore(createReducer(), {}, compose(...enhancers));

  return store;
}

describe('reducer injectors', () => {
  let store;
  let injectReducer;

  describe('getInjectors', () => {
    beforeEach(() => {
      store = configureStore();
    });

    it('should return injectors', () => {
      expect(getInjectors(store)).toEqual(
        expect.objectContaining({
          injectReducer: expect.any(Function),
        }),
      );
    });

    it('should throw if passed invalid store shape', () => {
      delete store.dispatch;
      expect(() => getInjectors(store)).toThrow();
    });
  });

  describe('injectReducer helper', () => {
    beforeEach(() => {
      store = configureStore();
      injectReducer = injectReducerFactory(store, true);
    });

    it('should check a store if the second argument is falsy', () => {
      const inject = injectReducerFactory({});

      expect(() => inject('test', reducer)).toThrow();
    });

    it('it should not check a store if the second argument is true', () => {
      delete store.dispatch;
      expect(() => injectReducer('test', reducer)).not.toThrow();
    });

    it("should validate a reducer and reducer's key", () => {
      expect(() => injectReducer('', reducer)).toThrow();
      expect(() => injectReducer(1, reducer)).toThrow();
      expect(() => injectReducer(1, 1)).toThrow();
    });

    it('given a store, it should provide a function to inject a reducer', () => {
      injectReducer('test', reducer);

      const actual = store.getState().test;
      const expected = initialState;

      expect(actual).toEqual(expected);
    });

    it('should not assign reducer if already existing', () => {
      store.replaceReducer = jest.fn();
      injectReducer('test', reducer);
      injectReducer('test', reducer);

      expect(store.replaceReducer).toHaveBeenCalledTimes(1);
    });

    it('should assign reducer if different implementation for hot reloading', () => {
      store.replaceReducer = jest.fn();
      injectReducer('test', reducer);
      injectReducer('test', identity);

      expect(store.replaceReducer).toHaveBeenCalledTimes(2);
    });
  });
});
