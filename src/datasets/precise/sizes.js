import React from 'react';
import { SizeLegend } from '../../components/legend';
import { scalePow } from 'd3-scale';


function degreeFunction(exponent) {
    return (store) => {
        if (!store.data) {
            return {
                legend: () => null,
                scale: () => 10
            };
        }
        // map lookup
        const degrees = store.data.nodeDegrees(store.year);
        const minMax = Object.values(degrees).reduce(([min, max], v) => {
            if (v == null) {
                return [min, max];
            }
            return [
                Math.min(min, v),
                Math.max(max, v)
            ];
        }, [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]);
        
        // TODO a proper range max
        const scale = scalePow().exponent(exponent).domain(minMax).range([10, 100]);
        return {
            legend: () => <SizeLegend scale={scale} />,
            scale: (node) => {
                const degree = degrees[node.name] || 0;
                return scale(degree);
            },
        };
    }
}

export default [
    {
        label: 'None',
        factory: ({
            legend: () => null,
            scale: () => 10,
        })
    },
    {
        label: 'Degree',
        factory: degreeFunction(0.5)
    },
    {
        label: 'Degree - Large',
        factory: degreeFunction(0.75)
    },
    {
        label: 'Degree - Huge',
        factory: degreeFunction(1)
    }
]