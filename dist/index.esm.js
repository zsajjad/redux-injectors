import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { ReactReduxContext, useStore } from 'react-redux';
import invariant from 'invariant';
import isEmpty from 'lodash/isEmpty';
import isFunction from 'lodash/isFunction';
import isString from 'lodash/isString';
import has from 'lodash/has';
import conformsTo from 'lodash/conformsTo';
import isObject from 'lodash/isObject';

/**
 * Forces a reload of the injected reducers. i.e. Causes `createReducer` to be
 * called again with the injected reducers. Useful for hot-reloading.
 *
 * @param store The redux store that has been configured with
 *                  `createInjectorsEnhancer`
 * @example
 * forceReducerReload(store);
 *
 * @public
 */
function forceReducerReload(store) {
  store.replaceReducer(store.createReducer(store.injectedReducers));
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _createSuper(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct();

  return function _createSuperInternal() {
    var Super = _getPrototypeOf(Derived),
        result;

    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf(this).constructor;

      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }

    return _possibleConstructorReturn(this, result);
  };
}

/**
 * Validates the redux store is set up properly to work with this library.
 */

function checkStore(store) {
  var shape = {
    dispatch: isFunction,
    subscribe: isFunction,
    getState: isFunction,
    replaceReducer: isFunction,
    runSaga: isFunction,
    createReducer: isFunction,
    injectedReducers: isObject,
    injectedSagas: isObject
  };
  invariant(conformsTo(store, shape), '(redux-injectors...) checkStore: Expected a redux store that has been configured for use with redux-injectors.');
}

function injectReducerFactory(store, isValid) {
  return function injectReducer(key, reducer) {
    if (!isValid) checkStore(store);
    invariant(isString(key) && !isEmpty(key) && isFunction(reducer), '(redux-injectors...) injectReducer: Expected `reducer` to be a reducer function'); // Check `store.injectedReducers[key] === reducer` for hot reloading when a key is the same but a reducer is different

    if (has(store.injectedReducers, key) && store.injectedReducers[key] === reducer) return;
    store.injectedReducers[key] = reducer; // eslint-disable-line no-param-reassign

    store.replaceReducer(store.createReducer(store.injectedReducers));
  };
}
function getInjectors(store) {
  checkStore(store);
  return {
    injectReducer: injectReducerFactory(store, true)
  };
}

/**
 * A higher-order component that dynamically injects a reducer when the
 * component is instantiated
 *
 * @param {Object} params
 * @param {string} params.key The key to inject the reducer under
 * @param {function} params.reducer The reducer that will be injected
 *
 * @example
 *
 * class BooksManager extends React.PureComponent {
 *   render() {
 *     return null;
 *   }
 * }
 *
 * export default injectReducer({ key: "books", reducer: booksReducer })(BooksManager)
 *
 * @public
 */

var injectReducer = (function (_ref) {
  var key = _ref.key,
      reducer = _ref.reducer;
  return function (WrappedComponent) {
    var ReducerInjector = /*#__PURE__*/function (_React$Component) {
      _inherits(ReducerInjector, _React$Component);

      var _super = _createSuper(ReducerInjector);

      function ReducerInjector(props, context) {
        var _this;

        _classCallCheck(this, ReducerInjector);

        _this = _super.call(this, props, context);
        getInjectors(context.store).injectReducer(key, reducer);
        return _this;
      }

      _createClass(ReducerInjector, [{
        key: "render",
        value: function render() {
          return /*#__PURE__*/React.createElement(WrappedComponent, this.props);
        }
      }]);

      return ReducerInjector;
    }(React.Component);

    _defineProperty(ReducerInjector, "WrappedComponent", WrappedComponent);

    _defineProperty(ReducerInjector, "contextType", ReactReduxContext);

    _defineProperty(ReducerInjector, "displayName", "withReducer(".concat(WrappedComponent.displayName || WrappedComponent.name || 'Component', ")"));

    return hoistNonReactStatics(ReducerInjector, WrappedComponent);
  };
});
/**
 * A react hook that dynamically injects a reducer when the hook is run
 *
 * @param {Object} params
 * @param {string} params.key The key to inject the reducer under
 * @param {function} params.reducer The reducer that will be injected
 *
 * @example
 *
 * function BooksManager() {
 *   useInjectReducer({ key: "books", reducer: booksReducer })
 *
 *   return null;
 * }
 *
 * @public
 */

var useInjectReducer = function useInjectReducer(_ref2) {
  var key = _ref2.key,
      reducer = _ref2.reducer;
  var store = useStore();
  var isInjected = React.useRef(false);

  if (!isInjected.current) {
    getInjectors(store).injectReducer(key, reducer);
    isInjected.current = true;
  }
};

var RESTART_ON_REMOUNT = '@@saga-injector/restart-on-remount';
var DAEMON = '@@saga-injector/daemon';
var ONCE_TILL_UNMOUNT = '@@saga-injector/once-till-unmount';
/**
 * An enum of all the possible saga injection behaviours
 *
 * @property {String} RESTART_ON_REMOUNT The saga will be started on component instantiation and cancelled with
 * `task.cancel()` on component unmount for improved performance.
 * @property {String} DAEMON Causes the saga to be started on component instantiation and never canceled
 * or started again.
 * @property {String} ONCE_TILL_UNMOUNT Behaves like 'RESTART_ON_REMOUNT' but never runs it again.
 *
 * @enum
 * @public
 */

var SagaInjectionModes = {
  RESTART_ON_REMOUNT: RESTART_ON_REMOUNT,
  DAEMON: DAEMON,
  ONCE_TILL_UNMOUNT: ONCE_TILL_UNMOUNT
};

var allowedModes = [RESTART_ON_REMOUNT, DAEMON, ONCE_TILL_UNMOUNT];

var checkKey = function checkKey(key) {
  return invariant(isString(key) && !isEmpty(key), '(redux-injectors...) injectSaga: Expected `key` to be a non empty string');
};

var checkDescriptor = function checkDescriptor(descriptor) {
  var shape = {
    saga: isFunction,
    mode: function mode(_mode) {
      return isString(_mode) && allowedModes.includes(_mode);
    }
  };
  invariant(conformsTo(descriptor, shape), '(redux-injectors...) injectSaga: Expected a valid saga descriptor');
};

function injectSagaFactory(store, isValid) {
  return function injectSaga(key) {
    var descriptor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    if (!isValid) checkStore(store);

    var newDescriptor = _objectSpread2(_objectSpread2({}, descriptor), {}, {
      mode: descriptor.mode || DAEMON
    });

    var saga = newDescriptor.saga,
        mode = newDescriptor.mode;
    checkKey(key);
    checkDescriptor(newDescriptor);
    var hasSaga = has(store.injectedSagas, key);

    if (process.env.NODE_ENV !== 'production') {
      var oldDescriptor = store.injectedSagas[key]; // enable hot reloading of daemon and once-till-unmount sagas

      if (hasSaga && oldDescriptor.saga !== saga) {
        oldDescriptor.task.cancel();
        hasSaga = false;
      }
    }

    if (!hasSaga || hasSaga && mode !== DAEMON && mode !== ONCE_TILL_UNMOUNT) {
      /* eslint-disable no-param-reassign */
      store.injectedSagas[key] = _objectSpread2(_objectSpread2({}, newDescriptor), {}, {
        task: store.runSaga(saga)
      });
      /* eslint-enable no-param-reassign */
    }
  };
}
function ejectSagaFactory(store, isValid) {
  return function ejectSaga(key) {
    if (!isValid) checkStore(store);
    checkKey(key);

    if (has(store.injectedSagas, key)) {
      var descriptor = store.injectedSagas[key];

      if (descriptor.mode && descriptor.mode !== DAEMON) {
        descriptor.task.cancel(); // Clean up in production; in development we need `descriptor.saga` for hot reloading

        if (process.env.NODE_ENV === 'production') {
          // Need some value to be able to detect `ONCE_TILL_UNMOUNT` sagas in `injectSaga`
          store.injectedSagas[key] = 'done'; // eslint-disable-line no-param-reassign
        }
      }
    }
  };
}
function getInjectors$1(store) {
  checkStore(store);
  return {
    injectSaga: injectSagaFactory(store, true),
    ejectSaga: ejectSagaFactory(store, true)
  };
}

/**
 * A higher-order component that dynamically injects a saga when the component
 * is instantiated. There are several possible "modes" / "behaviours" that
 * dictate how and when the saga should be injected and ejected
 *
 * @param {Object} params
 * @param {string} params.key The key to inject the saga under
 * @param {function} params.saga The saga that will be injected
 * @param {string} [params.mode] The injection behaviour to use. The default is
 * `SagaInjectionModes.DAEMON` which causes the saga to be started on component
 * instantiation and never canceled or started again. @see
 * {@link SagaInjectionModes} for the other possible modes.
 *
 * @example
 *
 * class BooksManager extends React.PureComponent {
 *  render() {
 *    return null;
 *  }
 * }
 *
 * export default injectSaga({ key: "books", saga: booksSaga })(BooksManager)
 *
 * @public
 *
 */

var injectSaga = (function (_ref) {
  var key = _ref.key,
      saga = _ref.saga,
      mode = _ref.mode;
  return function (WrappedComponent) {
    var InjectSaga = /*#__PURE__*/function (_React$Component) {
      _inherits(InjectSaga, _React$Component);

      var _super = _createSuper(InjectSaga);

      function InjectSaga(props, context) {
        var _this;

        _classCallCheck(this, InjectSaga);

        _this = _super.call(this, props, context);
        _this.injectors = getInjectors$1(context.store);

        _this.injectors.injectSaga(key, {
          saga: saga,
          mode: mode
        });

        return _this;
      }

      _createClass(InjectSaga, [{
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
          this.injectors.ejectSaga(key);
        }
      }, {
        key: "render",
        value: function render() {
          return /*#__PURE__*/React.createElement(WrappedComponent, this.props);
        }
      }]);

      return InjectSaga;
    }(React.Component);

    _defineProperty(InjectSaga, "WrappedComponent", WrappedComponent);

    _defineProperty(InjectSaga, "contextType", ReactReduxContext);

    _defineProperty(InjectSaga, "displayName", "withSaga(".concat(WrappedComponent.displayName || WrappedComponent.name || 'Component', ")"));

    return hoistNonReactStatics(InjectSaga, WrappedComponent);
  };
});
/**
 * A react hook that dynamically injects a saga when the hook is run
 *
 * @param {Object} params
 * @param {string} params.key The key to inject the saga under
 * @param {function} params.saga The saga that will be injected
 * @param {string} [params.mode] The injection behaviour to use. The default is
 * `SagaInjectionModes.DAEMON` which causes the saga to be started on component
 * instantiation and never canceled or started again. @see
 * {@link SagaInjectionModes} for the other possible modes.
 *
 * @example
 *
 * function BooksManager() {
 *   useInjectSaga({ key: "books", saga: booksSaga })
 *
 *   return null;
 * }
 *
 * @public
 */

var useInjectSaga = function useInjectSaga(_ref2) {
  var key = _ref2.key,
      saga = _ref2.saga,
      mode = _ref2.mode;
  var store = useStore();
  var isInjected = React.useRef(false);

  if (!isInjected.current) {
    getInjectors$1(store).injectSaga(key, {
      saga: saga,
      mode: mode
    });
    isInjected.current = true;
  }

  React.useEffect(function () {
    return function () {
      getInjectors$1(store).ejectSaga(key);
    };
  }, []);
};

/**
 * Creates a store enhancer that when applied will setup the store to allow the
 * injectors to work properly
 *
 * @param {Object} params
 * @param {function} params.runSaga A function that runs a saga. Should usually be `sagaMiddleware.run`
 * @param {function} params.createReducer A function that should create and
 * return the root reducer. It's passed the injected reducers as the first
 * parameter. These should be added to the root reducer using `combineReducer`
 * or a similar method.
 *
 * @example
 *
 * import { createStore } from "redux"
 * import { createInjectorsEnhancer } from "redux-injectors"
 *
 * function createReducer(injectedReducers = {}) {
 *  const rootReducer = combineReducers({
 *    ...injectedReducers,
 *    // other non-injected reducers can go here...
 *  });
 *
 *  return rootReducer
 * }
 * const runSaga = sagaMiddleware.run
 *
 * const store = createStore(
 *   createReducer(),
 *   initialState,
 *   createInjectorsEnhancer({
 *     createReducer,
 *     runSaga,
 *   })
 * )
 *
 * @public
 */

function createInjectorsEnhancer(params) {
  invariant(conformsTo(params, {
    runSaga: isFunction,
    createReducer: isFunction
  }), '(redux-injectors...) createInjectorsEnhancer: params `runSaga` and ' + '`createReducer` are required.');
  return function (createStore) {
    return function () {
      var store = createStore.apply(void 0, arguments);
      return _objectSpread2(_objectSpread2({}, store), {}, {
        createReducer: params.createReducer,
        runSaga: params.runSaga,
        injectedReducers: {},
        // Reducer registry
        injectedSagas: {} // Saga registry

      });
    };
  };
}

export { SagaInjectionModes, createInjectorsEnhancer, forceReducerReload, injectReducer, injectSaga, useInjectReducer, useInjectSaga };
