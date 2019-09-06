import React from 'react';
import { withStyles } from '@material-ui/core';

const height = 20;

const styles = theme => ({
    root: {
        flexGrow: 1,
        height: height / 2,
        position: 'relative',
        '&::before': {
            content: 'attr(data-from)',
            position: 'absolute',
            top: '100%',
            left: 0,
            whiteSpace: 'nowrap',
            paddingTop: height / 4 + 2,
            textAlign: 'left'
        },
        '&::after': {
            content: 'attr(data-to)',
            position: 'absolute',
            top: '100%',
            right: 0,
            whiteSpace: 'nowrap',
            paddingTop: height / 4 + 2,
            textAlign: 'right'
        }
    }
});

class LegendGradient extends React.Component {
    render() {
        const { classes, scale, format } = this.props;
        const gradientSamples = 10;
        const domain = scale.domain();
        // sample the color scale and create a gradient defintion out of it
        const colors = scale.copy().domain([0, gradientSamples]);
        const samples = Array.from({ length: gradientSamples + 1 }).map((_, i) => `${colors(i)} ${Math.round(i * 100 / gradientSamples)}%`).join(',');
        return <div className={classes.root} data-from={format(domain[0])} data-to={format(domain[1])} style={{ background: `linear-gradient(to right, ${samples})` }} />;
    }
}

export default withStyles(styles)(LegendGradient);
