import { ApplicationStore } from '../store';
import React from 'react';
import { Typography } from '@material-ui/core';
import InfoBlock from '../components/graph-vis/info-block';
import Structure from '../components/graph-vis/structure';

const templates = [
  {
    label: 'Generic',
    render: (node, store) => {
      return (
        <>
          <Typography gutterBottom variant="h4">
            {node.name}
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

          <div style={{ width: '100%', height: '15rem' }}>
            <Structure cjson={node.structure} />
          </div>
        </>
      );
    },
    tooltip: (node) => <Typography variant="caption">{node.name}</Typography>,
  },
];

const colors = [
  {
    label: 'None',
    factory: () => ({
      legend: () => null,
      scale: () => ApplicationStore.FIXED_COLOR,
    }),
  },
];

const sizes = [
  {
    label: 'None',
    factory: () => ({
      legend: () => null,
      scale: () => 10,
    }),
  },
];

export default {
  templates,

  colors,
  zoomRange: [-3.75, 3],
  sizes,
  yearRange: null, // disable

  properties: {},

  defaults: {
    template: templates[0],
    color: colors[0],
    zoom: -2.3,
    size: sizes[0],
  },
};
