import React from 'react';
import { Typography } from '@material-ui/core';
import tooltip from './tooltip';
import InfoBlock from '../../../components/graph-vis/info-block';
import Structure from '../../../components/graph-vis/structure';

export default {
    label: 'Material',
    render: (node, store) => {
        const hypothetical = node.discovery == null;
        const structureFile = `/sample-data/structures/${node.name}.cjson`;

        return <>
            <Typography gutterBottom variant="h4">{`${node.name} (${hypothetical ? 'undiscovered' : node.discovery})`}</Typography>

            <Typography gutterBottom variant="subtitle1" component="div">Material Properties</Typography>

            {node.degree != null && <InfoBlock value={node.degree} {...store.getPropertyMetaData('degree')} />}
            {node.formation_energy != null && <InfoBlock value={node.formation_energy} {...store.getPropertyMetaData('formation_energy')} />}
            {node.synthesis_probability != null && <InfoBlock value={node.synthesis_probability} {...store.getPropertyMetaData('synthesis_probability')} />}

            <Typography gutterBottom variant="subtitle1" component="div">Network Properties</Typography>

            {node.eigen_cent != null && <InfoBlock value={node.eigen_cent} {...store.getPropertyMetaData('eigen_cent')} />}
            {node.deg_cent != null && <InfoBlock value={node.deg_cent} {...store.getPropertyMetaData('deg_cent')} />}
            {node.shortest_path != null && <InfoBlock value={node.shortest_path} {...store.getPropertyMetaData('shortest_path')} />}
            {node.deg_neigh != null && <InfoBlock value={node.deg_neigh} {...store.getPropertyMetaData('deg_neigh')} />}

            <div style={{ width: '100%', height: '15rem' }}>
                <Structure cjson={node.structure} />
            </div>

            <a href={structureFile} download>structure data</a>
        </>;
    },
    tooltip
}
