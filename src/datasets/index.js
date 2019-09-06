import precise from './precise';
import defaultTemplate from './default';


export default [
    {
        label: 'Precise',
        fileName: '/sample-data/precise.json',
        ...defaultTemplate,
        ...precise
    },
    {
        label: 'Precise - Gephi',
        fileName: '/sample-data/precise-gephi.json',
        ...defaultTemplate,
        ...precise
    },
    {
        label: 'Sample 1',
        fileName: '/sample-data/sample1.json',
        ...defaultTemplate,
        ...precise
    },
    {
        label: 'Sample 1 - Gephi',
        fileName: '/sample-data/sample1-gephi.json',
        ...defaultTemplate,
        ...precise
    },
    {
        label: 'Sample 2',
        fileName: '/sample-data/sample2.json',
        ...defaultTemplate,
        ...precise
    },
];