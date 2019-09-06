import templates from './templates';
import { format } from 'd3-format';
import colors from './colors';
import sizes from './sizes';


export default {
    year: 2016,
    yearRange: [1945, 2016],

    templates,
    template: templates[0],

    colors,
    color: colors[1],

    colorYear: 2016,

    sizes,
    size: sizes[1],

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
    }
}
