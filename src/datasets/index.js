import precise from './precise';
import cooccurence from './cooccurence';


export default [
    {
        label: 'Materials Stability Network',
        fileName: './sample-data/stability.json',
        ...precise
    },
    {
        label: 'Materials Co-occurrence Network (~1000 edges)',
        fileName: './sample-data/cooccurrence-1k.json',
        ...cooccurence
    },
    {
        label: 'Materials Co-occurrence Network (~500000 edges)',
        fileName: './sample-data/cooccurrence-500k.json',
        ...cooccurence
    },
    {
        label: 'Materials Similarity Network',
        fileName: './sample-data/similarity.json',
        ...precise
    }
];
