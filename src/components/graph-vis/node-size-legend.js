import React from 'react';
import Store from '../../store';
import { observer } from 'mobx-react';
import { withStyles } from '@material-ui/core';

const styles = theme => ({
    root: {
    }
});

@observer
class NodeSizeLegend extends React.Component  {
    static contextType = Store;

    render() {
        const store = this.context;
        const { factor, classes } = this.props;

        

        return <svg className={classes.root} width={300} height={50}>

        </svg>;
    }
}

export default withStyles(styles)(NodeSizeLegend);
