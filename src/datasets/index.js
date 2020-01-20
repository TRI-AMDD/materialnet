import precise from './precise';
import cooccurence from './cooccurence';


export default [
    {
        label: 'Materials Stability Network',
        fileName: './sample-data/precise-gephi.json',
        ...precise
    },
    {
        label: 'Materials Co-occurrence Network (~1000 edges)',
        fileName: './sample-data/sample_cooccurence.json',
        ...cooccurence
    },
    {
        label: 'Materials Co-occurrence Network (~500000 edges)',
        fileName: './sample-data/full_cooccurence.json',
        ...cooccurence
    }
];
