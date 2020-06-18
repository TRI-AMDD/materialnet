import templates_ from './templates';
import React from 'react';
import { Typography } from '@material-ui/core';
import InfoBlock from '../../components/graph-vis/info-block';
import colors from './colors';
import sizes from './sizes';
import defaultTemplate from '../default';

const templates = [
  {
    label: 'Similarity',
    render: (node, store) => {
      return (
        <>
          <Typography gutterBottom variant="h4">
            {node.formula} ({node.name})
          </Typography>
          <Typography gutterBottom variant="subtitle1" component="div">
            Properties
          </Typography>

          {store.propertyList.map((prop) => {
            const value = node[prop.property];
            if (value == null) {
              return null;
            }
            return <InfoBlock key={prop.property} value={value} {...prop} />;
          })}
        </>
      );
    },
    tooltip: (node) => (
      <Typography variant="caption">{node.formula}</Typography>
    ),
  },
];

export default {
  ...defaultTemplate,
  templates,
  colors,
  sizes,

  properties: {
    degree: {
      label: 'Derived materials',
      format: 'd',
    },
    formation_energy: {
      label: 'Formation Energy',
      filterable: true,
      format: '.3f',
      suffix: ` eV/atom`,
    },
    band_gap: {
      label: 'Band Gap',
      filterable: true,
      format: '.3f',
      suffix: ' eV/atom',
    },
  },

  defaults: {
    ...defaultTemplate.defaults,
    template: templates[0],
    color: colors[1],
    zoom: -2.3,
    size: sizes[2],
  },
};
