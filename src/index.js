import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import Store, { ApplicationStore } from './store';

import { defineCustomElements as defineSplitMe } from 'split-me/loader';
import { defineCustomElements as defineMolecule } from '@openchemistry/molecule/loader';
defineSplitMe(window);
defineMolecule(window);

const store = new ApplicationStore();

ReactDOM.render(
  <Store.Provider value={store}>
    <App />
  </Store.Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
