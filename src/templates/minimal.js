import React from 'react';
import {
  Typography,
  IconButton
} from '@material-ui/core';

import CloseIcon from '@material-ui/icons/Close';

export default function ({name, degree, discovery, formationEnergy, synthesisProbability, clusCoeff, eigenCent, degCent, shortestPath, degNeigh, onClear}) {
  const hypothetical = discovery === null;

  return (
    <React.Fragment>
      <IconButton style={{float: 'right'}} onClick={onClear}><CloseIcon/></IconButton>
      <Typography gutterBottom variant="h4">{`${name} (${hypothetical ? 'undiscovered' : discovery})`}</Typography>

      <Typography gutterBottom variant="title">
        Material Properties
      </Typography>

      <React.Fragment>
        <Typography gutterBottom variant="subheading" color="textSecondary">
          Derived materials
        </Typography>
        <Typography  paragraph>
          {degree}
        </Typography>
      </React.Fragment>

      {formationEnergy &&
        <React.Fragment>
          <Typography gutterBottom variant="subheading" color="textSecondary">
            Formation energy
          </Typography>
          <Typography  paragraph>
            {formationEnergy.toFixed(3)} eV/atom
          </Typography>
        </React.Fragment>
      }

      {(hypothetical && synthesisProbability) &&
        <React.Fragment>
          <Typography gutterBottom variant="subheading" color="textSecondary">
            Synthesis probability
          </Typography>
          <Typography  paragraph>
            {(synthesisProbability * 100).toFixed(1)}%
          </Typography>
        </React.Fragment>
      }

    </React.Fragment>
  );
}
