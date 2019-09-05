import React from 'react';
import Store, { ApplicationStore } from '../../store';
import { observer } from 'mobx-react';
import { withStyles } from '@material-ui/core';
import { scaleLinear } from 'd3-scale';

const styles = theme => ({
    root: {
        zIndex: 100,
        position: 'absolute',
        bottom: 0,
        left: 0,
    },
    circle: {
        position: 'absolute',
        borderRadius: '50%',
        background: ApplicationStore.FIXED_COLOR,
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
        const marginBottom = 20;
        const width = 300;

        const scale = scaleLinear().domain(minMax).range([0, width]);
        const count = Math.max(2, Math.min(10, Math.floor(width / (2 * maxRadius))));

        // use divs to fake circles
        return <div className={classes.root} style={{ height: `${maxRadius * 2 + marginBottom}px`}}>
            {scale.ticks(count).map((v) => {
                const radius = compute(v);
                return <div key={v} className={classes.circle} title={v} style={{
                    transform: `translate(${scale(v) + radius + marginLeft}px, ${maxRadius * 2 - radius * 2}px)`,
                    width: `${radius * 2}px`,
                    height: `${radius * 2}px`
                }} />;
            })}
        </div>;
    }
}

export default withStyles(styles)(NodeSizeLegend);
