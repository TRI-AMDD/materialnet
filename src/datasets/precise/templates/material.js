import React from 'react';
import { Typography } from '@material-ui/core';
import InfoBlock from '../../../components/graph-vis/info-block';
import Structure from '../../../components/graph-vis/structure';

export default {
    label: 'Material',
    render: (node, store) => {
        const hypothetical = node.discovery === null;

        return <>
            <Typography gutterBottom variant="h4">{`${node.name} (${hypothetical ? 'undiscovered' : node.discovery})`}</Typography>

            <Typography gutterBottom variant="title">Material Properties</Typography>

            {node.degree != null && <InfoBlock label="Derived materials" value={node.degree} />}
            {node.formation_energy != null && <InfoBlock label="Formation energy" value={node.formation_energy} format=".3f" suffix="eV /atom" />}
            {node.synthesis_probability != null && <InfoBlock label="Synthesis probability" value={node.synthesis_probability} format=".1%" />}

            <Typography gutterBottom variant="title">Network Properties</Typography>

            {node.formation_energy != null && <InfoBlock label="Formation energy" value={node.formation_energy} />}
            {node.eigen_cent != null && <InfoBlock label="Eigenvector centrality" value={node.eigen_cent} />}
            {node.deg_cent != null && <InfoBlock label="Degree centrality" value={node.deg_cent} />}
            {node.shortest_path != null && <InfoBlock label="Shortest path" value={node.shortest_path} />}
            {node.deg_neigh != null && <InfoBlock label="Degree neighborhood" value={node.deg_neigh} />}

            
            <div style={{ width: '100%', height: '15rem' }}>
                <Structure cjson={store.structure} />
            </div>
        </>;
    }
}