import React from 'react';

import Grid from '../controls/grid';
import Store from '../../store';
import { observer } from 'mobx-react';
import { Button, CircularProgress } from '@material-ui/core';
import { StartLayoutHelp, AbortLayoutHelp, ResetLayoutHelp } from './helpPanel';

@observer
class Layouts extends React.Component {
  static contextType = Store;

  render() {
    const store = this.context;
    return (<Grid>
      {!store.subGraphLayouting && <Button
        disabled={!store.doesShowSubgraph}
        onClick={() => store.computeSubGraphLayout()}>
        <StartLayoutHelp />
      </Button>}
      {store.subGraphLayouting && <Button
        onClick={() => store.abortSubGraphLayout()}>
        <CircularProgress />&nbsp;<AbortLayoutHelp />
      </Button>}
      {!store.subGraphLayouting && <Button
        disabled={Object.keys(store.subGraphLayout).length === 0}
        onClick={() => store.resetSubGraphLayout()}>
        <ResetLayoutHelp />
      </Button>}
    </Grid>
    );
  }
}

export default Layouts;
