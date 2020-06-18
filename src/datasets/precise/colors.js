import React from 'react';
import { ApplicationStore } from '../../store';
import { LegendGradient, LegendCircle } from '../../components/legend';
import { propertyColorFactory, booleanColorFactory } from '../utils';
import defaultTemplate from '../default';

export default [
  ...defaultTemplate.sizes,
  {
    label: 'Year of discovery',
    factory: (store) => {
      const scale = store.colorScale.copy().domain(store.yearRange);

      return {
        legend: () => (
          <>
            <LegendGradient scale={scale} format={(v) => v.toString()} />
            <LegendCircle
              label="Undiscovered"
              color={ApplicationStore.UNDISCOVERED_COLOR}
            />
          </>
        ),
        scale: (node) => {
          const discovery = node.discovery;
          return discovery != null
            ? scale(discovery)
            : ApplicationStore.UNDISCOVERED_COLOR;
        },
      };
    },
  },
  {
    label: 'Discovered/Hypothetical',
    factory: booleanColorFactory('discovery', 'Discovered', 'Hypothetical'),
  },
  {
    label: 'Discovered/Undiscovered',
    factory: (store) => {
      const year = store.colorYear;
      return {
        legend: () => (
          <>
            <LegendCircle
              label="Discovered"
              color={ApplicationStore.DISCOVERED_COLOR}
            />
            <LegendCircle
              label="Undiscovered"
              color={ApplicationStore.UNDISCOVERED_COLOR}
            />
          </>
        ),
        scale: (node) => {
          const discovery = node.discovery;
          return discovery != null && discovery <= year
            ? ApplicationStore.DISCOVERED_COLOR
            : ApplicationStore.UNDISCOVERED_COLOR;
        },
      };
    },
  },
  {
    label: 'Formation Energy',
    factory: propertyColorFactory('formation_energy'),
  },
  {
    label: 'Synthesis Probability',
    factory: propertyColorFactory('synthesis_probability'),
  },
  {
    label: 'Clustering Coefficient',
    factory: propertyColorFactory('clus_coeff'),
  },
  {
    label: 'Eigenvector Centrality',
    factory: propertyColorFactory('eigen_cent'),
  },
  {
    label: 'Degree Centrality',
    factory: propertyColorFactory('deg_cent'),
  },
  {
    label: 'Shortest path',
    factory: propertyColorFactory('shortest_path'),
  },
  {
    label: 'Degree Neighborhood',
    factory: propertyColorFactory('deg_neigh'),
  },
];
