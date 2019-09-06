import React from 'react';
import { SizeLegend } from '../../components/legend';
import { scalePow, scaleLinear, scaleLog, scaleSqrt } from 'd3-scale';

const minSize = 2;
const maxSize = 40;

function degreeFunction(createScale) {
    return (store) => {
        if (!store.data) {
            return {
                legend: () => null,
                scale: () => minSize
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

        const scale = createScale(minMax).range([minSize, maxSize]).clamp(true);
        return {
            legend: (factor) => <SizeLegend scale={scale} factor={factor}/>,
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
        factory: () => ({
            legend: () => null,
            scale: () => minSize,
        })
    },
    {
        label: 'Degree - Linear',
        factory: degreeFunction((domain) => scaleLinear().domain(domain))
    },
    {
        label: 'Degree - Sqrt',
        factory: degreeFunction((domain) => scaleSqrt().domain(domain))
    },
    {
        label: 'Degree - Power 2',
        factory: degreeFunction((domain) => scalePow().domain(domain).exponent(2))
    },
    {
        label: 'Degree - Log',
        factory: degreeFunction((domain) => scaleLog().domain([Math.max(1, domain[0]), domain[1]]))
    }
]