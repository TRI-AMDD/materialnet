import defaultTemplate from './default';

export default {
    ...defaultTemplate,
    yearRange: [1945, 2016],
    
    properties: {
        degree: {
            label: 'Derived materials',
            format: 'd'
        },
        deg_cent: {
            label: "Degree Centrality",
        },
        eigen_cent: {
            label: "Eigenvector Centrality"
        },
    },

    defaults: {
        ...defaultTemplate.defaults,
        zoom: -2.3,
        colorYear: 2016,
        year: 2016,
    },
}
