import React from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  Typography
} from '@material-ui/core';

export default function ({name, degree, discovery, formationEnergy, synthesisProbability, clusCoeff, eigenCent, degCent, shortestPath, degNeigh, onClear}) {
  const hypothetical = discovery === null;

  return (
    <Card>
      <CardHeader title={`${name} (${hypothetical ? 'undiscovered' : discovery})`} action={<Button onClick={onClear}>Clear selection</Button>}>

      </CardHeader>
      <CardContent>
        <Typography gutterBottom variant="title">
          Material Properties
        </Typography>

        <div>
          <Typography gutterBottom variant="subheading" color="textSecondary">
            Derived materials
          </Typography>
          <Typography  paragraph>
            {degree}
          </Typography>
        </div>

        {formationEnergy &&
            <div>
              <Typography gutterBottom variant="subheading" color="textSecondary">
                Formation energy
              </Typography>
              <Typography  paragraph>
                {formationEnergy.toFixed(3)} eV/atom
              </Typography>
            </div>
        }

        {(hypothetical && synthesisProbability) &&
            <div>
              <Typography gutterBottom variant="subheading" color="textSecondary">
                Synthesis probability
              </Typography>
              <Typography  paragraph>
                {(synthesisProbability * 100).toFixed(1)}%
              </Typography>
            </div>
        }

        <Typography gutterBottom variant='title'>
          Network Properties
        </Typography>

        {clusCoeff &&
            <div>
              <Typography gutterBottom variant="subheading" color="textSecondary">
                Clustering coefficient
              </Typography>
              <Typography  paragraph>
                {clusCoeff.toFixed(3)}
              </Typography>
            </div>
        }

        {eigenCent &&
            <div>
              <Typography gutterBottom variant="subheading" color="textSecondary">
                Eigenvector centrality
              </Typography>
              <Typography  paragraph>
                {eigenCent.toFixed(3)}
              </Typography>
            </div>
        }

        {degCent &&
            <div>
              <Typography gutterBottom variant="subheading" color="textSecondary">
                Degree centrality
              </Typography>
              <Typography  paragraph>
                {degCent.toFixed(3)}
              </Typography>
            </div>
        }

        {shortestPath &&
            <div>
              <Typography gutterBottom variant="subheading" color="textSecondary">
                Shortest path
              </Typography>
              <Typography  paragraph>
                {shortestPath.toFixed(3)}
              </Typography>
            </div>
        }

        {degNeigh &&
            <div>
              <Typography gutterBottom variant="subheading" color="textSecondary">
                Degree neighborhood
              </Typography>
              <Typography  paragraph>
                {degNeigh.toFixed(3)}
              </Typography>
            </div>
        }

      </CardContent>
    </Card>
  );
}
