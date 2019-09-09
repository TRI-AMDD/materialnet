import React from 'react';
import { withStyles } from '@material-ui/core';

const height = 20;

const styles = theme => ({
    root: {
        borderRadius: '50%',
        position: 'relative',
        width: height,
        margin: '0 3em',
        height,
        '&::before': {
            content: 'attr(title)',
            position: 'absolute',
            top: '100%',
            left: '50%',
            whiteSpace: 'nowrap',
            padding: 2,
            textAlign: 'center',
            transform: 'translate(-50%,0)'
        }
    }
});

class LegendCircle extends React.Component {
    render() {
        const { classes, label, color } = this.props;

        return <div className={classes.root} title={label} style={{ background: color }} />;
    }
}

export default withStyles(styles)(LegendCircle);
