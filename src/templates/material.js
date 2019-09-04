import React from 'react';
import {Typography} from '@material-ui/core';
import InfoBlock from './info-block';
import InfoGroup from './info-group';

export default function ({name, degree, discovery, formationEnergy, synthesisProbability, clusCoeff, eigenCent, degCent, shortestPath, degNeigh}) {
  const hypothetical = discovery === null;

  return (
    <React.Fragment>
      <Typography gutterBottom variant="h4">{`${name} (${hypothetical ? 'undiscovered' : discovery})`}</Typography>
      
      <InfoGroup label="Material Properties">
        {degree != null && <InfoBlock label="Derived materials" value={degree} />}
        {formationEnergy != null && <InfoBlock label="Formation energy" value={`${formationEnergy.toFixed(3)} eV /atom`} />}
        {(hypothetical != null && synthesisProbability != null) && <InfoBlock label="Synthesis probability" value={`${(synthesisProbability * 100).toFixed(1)}%`} />}
      </InfoGroup>

      <InfoGroup label="Network Properties">
        {clusCoeff != null && <InfoBlock label="Formation energy" value={clusCoeff.toFixed(3)} />}
        {eigenCent != null && <InfoBlock label="Eigenvector centrality" value={eigenCent.toFixed(3)} />}
        {degCent != null && <InfoBlock label="Degree centrality" value={degCent.toFixed(3)} />}
        {shortestPath != null && <InfoBlock label="Shortest path" value={shortestPath.toFixed(3)} />}
        {degNeigh != null && <InfoBlock label="Degree neighborhood" value={degNeigh.toFixed(3)} />}
      </InfoGroup>
    </React.Fragment>
  );
}
