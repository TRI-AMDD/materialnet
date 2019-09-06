import React from 'react';
import Store from '../../store';
import { observer } from 'mobx-react';
import { withStyles } from '@material-ui/core';

const styles = theme => ({
    root: {
        marginLeft: '1em',
        width: 300,
        paddingBottom: 20,
        display: 'flex',
        alignItems: 'center',
        fontSize: 'small',
        justifyContent: 'space-around'
    }
});

@observer
class NodeColorLegend extends React.Component  {
    static contextType = Store;

    render() {
        const store = this.context;
        const { classes } = this.props;
        
        const legend = store.nodeColorer.legend();

        return legend && <div className={classes.root}>{legend}</div>;
    }
}

export default withStyles(styles)(NodeColorLegend);
