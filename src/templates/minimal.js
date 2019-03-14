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

      </CardContent>
    </Card>
  );
}
