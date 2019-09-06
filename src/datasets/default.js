import { ApplicationStore } from "../store"
import React from 'react';

const templates = [
    {
        label: 'Dummy',
        render: () => <h4>Dummy</h4>
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
