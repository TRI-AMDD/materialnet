import React from 'react';
import { ApplicationStore } from '../../store';
import { LegendGradient, LegendCircle } from '../../components/legend';

/**
 * coloring factory by color
 * @param {string} prop property to visualize
 */
function propertyColorFactory(prop) {
    return (store) => {
        const format = store.getFormatter(prop);        
        const scale = store.colorScale.copy().domain(store.minMaxProperty(prop));

        return {
            legend: () => <>
                <LegendGradient scale={scale} format={format} />
                <LegendCircle label="Unknown" color={ApplicationStore.INVALID_VALUE_COLOR} />
            </>,
            scale: (node) => {
                const value = node[prop];
                return value != null ? scale(value) : ApplicationStore.INVALID_VALUE_COLOR;
            }
        };
    }
}

export default [
    {
        label: 'None',
        factory: () => ({
            legend: () => null,
            scale: () => ApplicationStore.FIXED_COLOR
        })
    },
    {
        label: 'Year of discovery',
        factory: (store) => {
            const scale = store.colorScale.copy().domain(store.yearRange);

            return {
                legend: () => <>
                    <LegendGradient scale={scale} format={(v) => v.toString()} />
                    <LegendCircle label="Undiscovered" color={ApplicationStore.NOT_EXISTENT_COLOR} />
                </>,
                scale: (node) => {
                    const discovery = node.discovery;
                    return discovery != null ? scale(discovery) : ApplicationStore.NOT_EXISTENT_COLOR;
                }
            }
        }
    },
    {
        label: 'Discovered/Hypothetical',
        factory: () => ({
            legend: () => <>
                <LegendCircle label="Discovered" color={ApplicationStore.EXISTS_COLOR} />
                <LegendCircle label="Hypothetical" color={ApplicationStore.NOT_EXISTENT_COLOR} />
            </>,
            scale: (node) => {
                const discovery = node.discovery;
                return discovery != null ? ApplicationStore.EXISTS_COLOR : ApplicationStore.NOT_EXISTENT_COLOR;
            }
        })
    },
    {
        label: 'Discovered/Undiscovered',
        factory: (store) => {
            const year = store.colorYear;
            return {
                legend: () => <>
                    <LegendCircle label="Discovered" color={ApplicationStore.EXISTS_COLOR} />
                    <LegendCircle label="Undiscovered" color={ApplicationStore.NOT_EXISTENT_COLOR} />
                </>,
                scale: (node) => {
                    const discovery = node.discovery;
                    return discovery != null && discovery <= year ? ApplicationStore.EXISTS_COLOR : ApplicationStore.NOT_EXISTENT_COLOR;
                }
            };
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