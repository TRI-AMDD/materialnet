import templates from './templates';
import { format } from 'd3-format';
import colors from './colors';
import sizes from './sizes';


export default {
    yearRange: [1945, 2016],
    templates,
    colors,
    sizes,

    properties: {
        degree: {
            label: 'Derived materials',
            format: format('d')
        },
        formation_energy: {
            label: "Formation energy",
            format: (v) => `${format(".3f")(v)} eV /atom`
        },
        synthesis_probability: {
            label: "Synthesis probability",
            format: format(".1%")
        },
    },

    defaults: {
        template: templates[0],
        color: colors[1],
        zoom: -2.3,
        size: sizes[1],
        colorYear: 2016,
        year: 2016,
    },
}
