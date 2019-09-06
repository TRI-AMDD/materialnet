import { ApplicationStore } from "../store"
import React from 'react';
import { Typography } from "@material-ui/core";

const templates = [
    {
        label: 'Basic',
        render: (node) => <Typography gutterBottom variant="h4">{node.name}</Typography>,
        tooltip: (node) => node.name
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
        factory: () => ({
            legend: () => null,
            scale: () => 10,
        })
    },
]

export default {
    templates,

    colors,
    zoomRange: [-3.75, 3],
    sizes,
    yearRange: [1945, 2016],

    properties: {
        
    },

    defaults: {
        template: templates[0],
        color: colors[0],
        zoom: -2.3,
        size: sizes[0],
        year: 2016,
        colorYear: 2016
    },
}
