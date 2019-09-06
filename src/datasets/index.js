import precise from './precise';
import defaultTemplate from './default';


export default [
    {
        label: 'Precise',
        ...defaultTemplate,
        ...precise
    },
    {
        label: 'Precise - Gephi',
        ...defaultTemplate,
        ...precise
    },
    {
        label: 'Sample 1',
        ...defaultTemplate,
        ...precise
    },
    {
        label: 'Sample 1 - Gephi',
        ...defaultTemplate,
        ...precise
    },
    {
        label: 'Sample 2',
        ...defaultTemplate,
        ...precise
    },
];