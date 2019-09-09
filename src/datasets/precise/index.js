import templates from './templates';
import colors from './colors';
import sizes from './sizes';
import defaultTemplate from '../default';


export default {
    ...defaultTemplate,
    yearRange: [1945, 2016],
    templates,
    colors,
    sizes,

    properties: {
        degree: {
            label: 'Derived materials',
            format: 'd'
        },
        formation_energy: {
            label: "Formation energy",
            format: '.3f',
            suffix: ` eV/atom`
        },
        synthesis_probability: {
            label: "Synthesis probability",
            format: '.1%'
        },
    },

    defaults: {
        ...defaultTemplate.defaults,
        template: templates[0],
        color: colors[1],
        zoom: -2.3,
        size: sizes[1],
        colorYear: 2016,
        year: 2016,
    },
}
