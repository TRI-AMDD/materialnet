import React from 'react';
import { Typography } from '@material-ui/core';
import InfoBlock from '../../../components/graph-vis/info-block';
import Structure from '../../../components/graph-vis/structure';

export default {
    label: 'Minimal',
    render: (node, store) => {
        const hypothetical = node.discovery == null;

        return <>
            <Typography gutterBottom variant="h4">{`${node.name} (${hypothetical ? 'undiscovered' : node.discovery})`}</Typography>

            <Typography gutterBottom variant="title">
                Material Properties
            </Typography>

            {node.degree != null && <InfoBlock label="Derived materials" value={node.degree} format={store.getFormatter('degree')}/>}
            {node.formation_energy != null && <InfoBlock label="Formation energy" value={node.formation_energy} format={store.getFormatter('formation_energy')} />}
            {node.synthesis_probability != null && <InfoBlock label="Synthesis probability" value={node.synthesis_probability} format={store.getFormatter('synthesis_probability')} />}

            <div style={{ width: '100%', height: '15rem' }}>
                <Structure cjson={node.structure} />
            </div>
        </>;
    }
}