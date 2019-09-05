import React from 'react';
import Store from '../../store';
import { observer } from 'mobx-react';
import { withStyles } from '@material-ui/core';

const styles = theme => ({
    root: {
    }
});

@observer
class NodeColorLegend extends React.Component  {
    static contextType = Store;

    render() {
        const store = this.context;
        const { classes } = this.props;

        if (store.color === 'none') {
            return null;
        }

        return <div className={classes.root}>

        </div>;
    }
}

export default withStyles(styles)(NodeColorLegend);
