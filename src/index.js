import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import { defineCustomElements as defineSplitMe } from 'split-me/dist/loader';
import { defineCustomElements as defineMolecule } from '@openchemistry/molecule/dist/loader';
defineSplitMe(window);
defineMolecule(window);

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
