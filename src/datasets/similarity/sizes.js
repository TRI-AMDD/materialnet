import React from 'react';
import { SizeLegend } from '../../components/legend';
import { scaleLinear, scaleLog, scaleSqrt } from 'd3-scale';
import defaultTemplate from '../default';

function degreeFunction(createScale) {
  return (store) => {
    if (!store.data) {
      return {
        legend: () => null,
        scale: () => store.sizeScaleRange[0],
      };
    }

    const degrees = Object.values(store.data.nodes).map((node) => node.degree);
    const minMax = degrees.reduce(
      ([min, max], v) => {
        if (v == null) {
          return [min, max];
        }
        return [Math.min(min, v), Math.max(max, v)];
      },
      [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]
    );

    const scale = createScale(minMax).range(store.sizeScaleRange).clamp(true);

    return {
      legend: (factor) => <SizeLegend scale={scale} factor={factor} />,
      scale: (node) => {
        const degree = node.degree || 0;
        return scale(degree);
      },
    };
  };
}

export default [
  ...defaultTemplate.sizes,
  {
    label: 'Degree - Linear',
    factory: degreeFunction((domain) => scaleLinear().domain(domain)),
  },
  {
    label: 'Degree - Sqrt',
    factory: degreeFunction((domain) => scaleSqrt().domain(domain)),
  },
  {
    label: 'Degree - Log',
    factory: degreeFunction((domain) =>
      scaleLog().domain([Math.max(1, domain[0]), domain[1]])
    ),
  },
];
