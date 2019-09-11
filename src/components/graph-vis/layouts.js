import React from 'react';

import Grid from '../controls/grid';
import Store from '../../store';
import { observer } from 'mobx-react';
import { Button, CircularProgress } from '@material-ui/core';

@observer
class Layouts extends React.Component {
  static contextType = Store;
  
  render() {
    const store = this.context;
    return (<Grid>
      {!store.subGraphLayouting && <Button
        disabled={store.selected == null && store.pinnedNodes.length === 0}
        onClick={() => store.computeSubGraphLayout()}>
        start layout
      </Button>}
      {store.subGraphLayouting && <Button
        onClick={() => store.abortSubGraphLayout()}>
        <CircularProgress /> <span>abort</span>
      </Button>}
      {!store.subGraphLayouting && <Button
        disabled={Object.keys(store.subGraphLayout).length === 0}
        onClick={() => store.resetSubGraphLayout()}>
        reset layout
      </Button>}      
    </Grid>
    );
  }
}

export default Layouts;