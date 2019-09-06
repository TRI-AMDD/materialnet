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
        factors: () => () => ApplicationStore.FIXED_COLOR
    },
]

export default {
    templates,
    template: templates[0],

    colors,
    color: colors[0],

    zoom: -2.3,
    zoomRange: [-3.75, 3],
}
