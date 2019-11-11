import React from 'react';

import Grid from '../controls/grid';
import Store from '../../store';
import { observer } from 'mobx-react';
import { Button } from '@material-ui/core';

@observer
class Layouts extends React.Component {
  static contextType = Store;

  render() {
    const store = this.context;
    return (<Grid>
      {!store.subGraphLayouting && <Button
        disabled={!store.doesShowSubgraph}
        onClick={() => store.computeSubGraphLayout()}>
        Start
      </Button>}
      {store.subGraphLayouting && <Button
        onClick={() => store.abortSubGraphLayout()}>
        Stop
      </Button>}
      {!store.subGraphLayouting && <Button
        disabled={Object.keys(store.subGraphLayout).length === 0}
        onClick={() => store.resetSubGraphLayout()}>
        Reset
      </Button>}
    </Grid>
    );
  }
}

export default Layouts;
