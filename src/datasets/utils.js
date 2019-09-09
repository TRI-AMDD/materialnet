import React from 'react';
import { ApplicationStore } from '../store';
import { LegendGradient, LegendCircle, SizeLegend } from '../components/legend';
import { scaleLinear } from 'd3-scale';

/**
 * coloring factory by property
 * @param {string} prop property to visualize
 */
export function propertyColorFactory(prop) {
    return (store) => {
        const meta = store.getPropertyMetaData(prop);
        const scale = store.colorScale.copy().domain(meta.domain);

        return {
            legend: () => <>
                <LegendGradient scale={scale} format={meta.format} />
                <LegendCircle label="Unknown" color={ApplicationStore.INVALID_VALUE_COLOR} />
            </>,
            scale: (node) => {
                const value = node[prop];
                return value != null ? scale(value) : ApplicationStore.INVALID_VALUE_COLOR;
            }
        };
    }
}

/**
 * coloring factory by property existence
 * @param {string} prop property to visualize
 */
export function booleanColorFactory(prop, existent, notExistent) {
    return (store) => {
        return {
            legend: () => <>
                <LegendCircle label={existent} color={ApplicationStore.DISCOVERED_COLOR} />
                <LegendCircle label={notExistent} color={ApplicationStore.UNDISCOVERED_COLOR} />
            </>,
            scale: (node) => {
                const value = node[prop];
                return value != null ? ApplicationStore.DISCOVERED_COLOR : ApplicationStore.UNDISCOVERED_COLOR;
            }
        };
    }
}

function createDefaultScale(domain) {
    return scaleLinear().domain(domain);
}

/**
 * size factory by property
 * @param {string} prop property to visualize
 */
export function propertySizeFactory(prop, createScale = createDefaultScale) {
    return (store) => {
        if (!store.data) {
            return {
                legend: () => null,
                scale: () => store.sizeScaleRange[0]
            };
        }
        const meta = store.getPropertyMetaData(prop);
        const scale = createScale(meta.domain).range(store.sizeScaleRange).clamp(true);

        return {
            legend: (factor) => <SizeLegend scale={scale} factor={factor} format={meta.format}/>,
            scale: (node) => {
                const value = node[prop];
                return value != null ? scale(value) : scale.range()[0];
            },
        };
    }
}