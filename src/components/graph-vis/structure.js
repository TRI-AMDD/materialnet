import React from 'react';

import { wc } from '../../utils/webcomponents.js';

const Structure = ({ cjson }) => (
  <oc-molecule
    ref={wc(
      // Events
      {},
      // Props
      {
        cjson,
        moleculeRenderer: 'vtkjs',
      }
    )}
  />
);

export default Structure;
