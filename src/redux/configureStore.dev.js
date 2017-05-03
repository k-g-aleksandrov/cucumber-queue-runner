import { applyMiddleware, createStore, compose } from 'redux';
import { apiMiddleware } from 'redux-api-middleware';
import thunk from 'redux-thunk';
import DevTools from 'components/DevTools';
import rootReducer from './reducers';

export default function (initialState = {}) {
  const store = createStore(rootReducer, initialState, compose(
    applyMiddleware(apiMiddleware, thunk),
    DevTools.instrument()
    )
  );

  if (module.hot) {
    module.hot.accept('./reducers', () =>
      store.replaceReducer(require('./reducers').default)
    );
  }
  return store;
}
