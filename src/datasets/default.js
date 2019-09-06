import { ApplicationStore } from "../store"
import React from 'react';
import { Typography } from "@material-ui/core";

const templates = [
    {
        label: 'Basic',
        render: (node) =>  <Typography gutterBottom variant="h4">{node.name}</Typography>
    }
]

const colors = [
    {
        label: 'None',
        factory: () => ({
            legend: () => null,
            scale: () => ApplicationStore.FIXED_COLOR
        })
    },
]

const sizes = [
    {
        label: 'None',
        factory: ({
            legend: () => null,
            scale: () => 10,
        })
    },
]

export default {
    templates,
    template: templates[0],

    colors,
    color: colors[0],

    zoom: -2.3,
    zoomRange: [-3.75, 3],

    sizes,
    size: sizes[0], 

    properties: {
        
    }
}
