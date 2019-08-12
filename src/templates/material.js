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

      <Typography gutterBottom variant='title'>
        Network Properties
      </Typography>

      {clusCoeff &&
        <React.Fragment>
          <Typography gutterBottom variant="subheading" color="textSecondary">
            Clustering coefficient
          </Typography>
          <Typography  paragraph>
            {clusCoeff.toFixed(3)}
          </Typography>
        </React.Fragment>
      }

      {eigenCent &&
        <React.Fragment>
          <Typography gutterBottom variant="subheading" color="textSecondary">
            Eigenvector centrality
          </Typography>
          <Typography  paragraph>
            {eigenCent.toFixed(3)}
          </Typography>
        </React.Fragment>
      }

      {degCent &&
        <React.Fragment>
          <Typography gutterBottom variant="subheading" color="textSecondary">
            Degree centrality
          </Typography>
          <Typography  paragraph>
            {degCent.toFixed(3)}
          </Typography>
        </React.Fragment>
      }

      {shortestPath &&
        <React.Fragment>
          <Typography gutterBottom variant="subheading" color="textSecondary">
            Shortest path
          </Typography>
          <Typography  paragraph>
            {shortestPath.toFixed(3)}
          </Typography>
        </React.Fragment>
      }

      {degNeigh &&
        <React.Fragment>
          <Typography gutterBottom variant="subheading" color="textSecondary">
            Degree neighborhood
          </Typography>
          <Typography  paragraph>
            {degNeigh.toFixed(3)}
          </Typography>
        </React.Fragment>
      }
    </React.Fragment>
  );
}
