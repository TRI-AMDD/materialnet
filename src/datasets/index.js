import precise from './precise';
import similarity from './similarity';
import cooccurence from './cooccurence';

export default [
  {
    key: 'similarity',
    label: 'Materials Similarity Network',
    fileName: './sample-data/similarity.json',
    ...similarity,
  },
  {
    key: 'stability',
    label: 'Materials Stability Network',
    fileName: './sample-data/stability.json',
    ...precise,
  },
  {
    key: 'co1k',
    label: 'Materials Co-occurrence Network (~1000 edges)',
    fileName: './sample-data/cooccurrence-1k.json',
    ...cooccurence,
  },
  {
    key: 'co500k',
    label: 'Materials Co-occurrence Network (~500000 edges)',
    fileName: './sample-data/cooccurrence-500k.json',
    ...cooccurence,
  },
];
