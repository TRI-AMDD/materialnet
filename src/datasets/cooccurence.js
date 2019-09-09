import defaultTemplate from './default';
import { propertyColorFactory, propertySizeFactory } from './utils';

const properties = {
    degree: {
        label: 'Derived materials',
        format: 'd'
    },
    deg_cent: {
        label: "Degree Centrality",
        filterAble: true,
    },
    eigen_cent: {
        label: "Eigenvector Centrality",
        filterAble: true,
    },
};

const colors = [
    ...defaultTemplate.colors,
    ...Object.entries(properties).map(([prop, info]) => {
        return {
            label: info.label,
            factory: propertyColorFactory(prop)
        };
    })
]

const sizes = [
    ...defaultTemplate.sizes,
    ...Object.entries(properties).map(([prop, info]) => {
        return {
            label: info.label,
            factory: propertySizeFactory(prop)
        };
    })
]

export default {
    ...defaultTemplate,
    
    properties,
    colors,
    sizes,

    defaults: {
        ...defaultTemplate.defaults,
        color: colors[1],
        size: sizes[1]
    },
}
