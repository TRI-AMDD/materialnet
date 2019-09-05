import React from 'react';
import Store, { ApplicationStore } from '../../store';
import { observer } from 'mobx-react';
import { withStyles } from '@material-ui/core';
import { scaleLinear } from 'd3-scale';

const width = 300;
const marginBottom = 20;

const styles = theme => ({
    root: {
        width,
        alignSelf: 'stretch'
    },
    circle: {
        position: 'absolute',
        bottom: marginBottom,
        height: `calc(100% - ${marginBottom}px)`,
        display: 'flex',
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

@observer
class NodeSizeLegend extends React.Component  {
    static contextType = Store;

    render() {
        const store = this.context;
        const { classes } = this.props;

        if (store.size === 'none') {
            return null;
        }

        const compute = store.degree2SizeFunc;
        const minMax = store.minMaxDegrees;
        const maxRadius = compute(minMax[1]);
        const marginLeft = 20; // 20px left offset

        // number of circles to draw
        const maxCircleWidth = Math.max(maxRadius * 2, 30); // at least 50px width for the label
        const count = Math.max(2, Math.min(10, Math.floor((width - marginLeft * 2) / maxCircleWidth)));
        const scale = scaleLinear().domain(minMax).range([marginLeft, width - maxRadius - marginLeft]);

        // use divs to fake circles
        return <div className={classes.root} style={{height: `${maxRadius * 2 + marginBottom}px`}}>
            {scale.ticks(count).map((v) => {
                const radius = compute(v);
                return <div key={v} className={classes.circle} title={v} style={{
                    transform: `translate(${scale(v)}px, ${0}px)`,
                    width: `${radius * 2}px`
                }}>
                    <div className={classes.innerCircle} style={{
                        height: `${radius * 2}px`
                    }}/>
                </div>;
            })}
        </div>;
    }
}

export default withStyles(styles)(NodeSizeLegend);
