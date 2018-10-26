import React, { Component } from 'react';

import CssBaseline from '@material-ui/core/CssBaseline';

import GraphVis from './containers/graph-vis';
import Header from './components/header';
import './App.css';

class App extends Component {
  render() {
    return (
      <div>
        <CssBaseline />
        <Header />
        <div className="content">
          <GraphVis></GraphVis>
        </div>
      </div>
    );
  }
}

export default App;
