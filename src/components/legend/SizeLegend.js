import React from 'react';
import { ApplicationStore } from '../../store';
import { withStyles } from '@material-ui/core';

const width = 300;
const minWidth = 30;

const styles = theme => ({
    root: {
        width,
        display: 'flex',
        paddingBottom: 20,
        justifyContent: 'space-between',
        alignSelf: 'stretch'
    },
    circle: {
        margin: '0 2px',
        minWidth,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        '&::before': {
            content: 'attr(title)',
            position: 'absolute',
            fontSize: 'small',
            top: '100%',
            left: '50%',
            padding: 2,
            textAlign: 'center',
            transform: 'translate(-50%,0)'
        }
    },
    innerCircle: {
        borderRadius: '50%',
        background: ApplicationStore.FIXED_COLOR,
    }
});

class SizeLegend extends React.Component {
    render() {
        const { classes, scale, factor } = this.props;

        // number of points to draw
        let count = 3;
        for (; count < 10; count++) {
            // ticks does some magic so compute all the time
            const actWidth = scale.ticks(count).reduce((sum, v) => {
                const width = Math.max(factor * scale(v) * 2, 30);
                return sum + width;
            }, 0);
            if (actWidth > width) {
                count--; // one too much
                break;
            }
        }

        // use divs to fake circles
        return <div className={classes.root}>
            {scale.ticks(count).map((v) => {
                const radius = factor * scale(v);
                return <div key={v} className={classes.circle} title={v}>
                    <div className={classes.innerCircle} style={{
                        width: `${radius * 2}px`,
                        height: `${radius * 2}px`,
                    }} />
                </div>;
            })}
        </div>;
    }
}

export default withStyles(styles)(SizeLegend);
