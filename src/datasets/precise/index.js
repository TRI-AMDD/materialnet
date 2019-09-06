import { ApplicationStore } from '../store';
import templates from './templates';

/**
 * coloring factory by color
 * @param {string} prop property to visualize
 */
function propertyColorFactory(prop) {
    return (store) => {
        const scale = store.colorScale.copy().domain(store.minMaxProperty(prop));

        return (node) => {
            const value = node[prop];
            return value != null ? scale(value) : ApplicationStore.INVALID_VALUE_COLOR;
        };
    }
}

const colors = [
    {
        label: 'None',
        factors: () => () => ApplicationStore.FIXED_COLOR
    },
    {
        label: 'Year of discovery',
        factory: (store) => {
            const scale = store.colorScale.copy().domain(store.yearRange);

            return (node) => {
                const discovery = node.discovery;
                return discovery != null ? scale(discovery) : ApplicationStore.NOT_EXISTENT_COLOR;
            }
        }},
    {
        label: 'Discovered/Hypothetical',
        factory: () => {
            return (node) => {
                const discovery = node.discovery;
                return discovery != null ? ApplicationStore.EXISTS_COLOR : ApplicationStore.NOT_EXISTENT_COLOR;
            }
        }
    },
    {
        label: 'Discovered/Undiscovered',
        factory: (store) => {
            const year = store.colorYear;
            return (node) => {
                const discovery = node.discovery;
                return discovery != null && discovery <= year ? ApplicationStore.EXISTS_COLOR : ApplicationStore.NOT_EXISTENT_COLOR;
            }
        }
    },
    {
        label: 'Formation Energy',
        factory: propertyColorFactory('formation_energy')
    },
    {
        label: 'Synthesis Probability',
        factory: propertyColorFactory('synthesis_probability')
    },
    {
        label: 'Clustering Coefficient',
        factory: propertyColorFactory('clus_coeff') 
    },
    {
        label: 'Eigenvector Centrality',
        factory: propertyColorFactory('eigen_cent')
    },
    {
        label: 'Degree Centrality',
        factory: propertyColorFactory('deg_cent')
    },
    {
        label: 'Shortest path',
        factory: propertyColorFactory('shortest_path')
    },
    {
        label: 'Degree Neighborhood',
        factory: propertyColorFactory('deg_neigh')
    },
];

export default {
    year: 2016,
    yearRange: [1945, 2016],

    templates,
    template: templates[0],

    colors,
    color: colors[1],

    colorYear: 2016
}