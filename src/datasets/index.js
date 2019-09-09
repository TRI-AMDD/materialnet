import precise from './precise';
import cooccurence from './cooccurence';


export default [
    {
        label: 'Precise',
        fileName: '/sample-data/precise.json',
        ...precise
    },
    {
        label: 'Precise - Gephi',
        fileName: '/sample-data/precise-gephi.json',
        ...precise
    },
    {
        label: 'Sample 1',
        fileName: '/sample-data/sample1.json',
        ...precise
    },
    {
        label: 'Sample 1 - Gephi',
        fileName: '/sample-data/sample1-gephi.json',
        ...precise
    },
    {
        label: 'Sample 2',
        fileName: '/sample-data/sample2.json',
        ...precise
    },
    {
        label: 'Coocurrence - 1k Edges',
        fileName: '/sample-data/sample_cooccurence.json',
        ...cooccurence
    },
    {
        label: 'Coocurrence - 0.5M Edges',
        fileName: '/sample-data/full_cooccurence.json',
        ...cooccurence
    }
];