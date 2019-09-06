
// interface ITemplate {
//   label: string;
//   groups: ITemplateGroup[];
// }

// interface ITemplateGroup {
//   label: String | React.Element
//   fields: ITemplateField[];
// }
// interface ITemplateField {
//   label: string | React.Element
//   property: string;
//   format?: (v: any) => String | String; // the string has to be a valid d3-format qualifier
//   suffix?: string | React.Element
// }

export default [
    {
        label: 'Material',
        groups: [
            {
                label: 'Material Properties',
                fields: [
                    {
                        label: 'Derived materials',
                        property: 'degree'
                    },
                    {
                        label: 'Formation energy',
                        property: 'formationEnergy',
                        format: '.3f',
                        suffix: 'eV /atom'
                    },
                    {
                        label: 'Synthesis probability',
                        property: 'synthesisProbability',
                        format: '.1%'
                    }
                ]
            },
            {
                label: 'Network Properties',
                fields: [
                    {
                        label: 'Formation energy',
                        property: 'clusCoeff'
                    },
                    {
                        label: 'Eigenvector centrality',
                        property: 'eigenCent'
                    },
                    {
                        label: 'Degree centrality',
                        property: 'degCent'
                    },
                    {
                        label: 'Shortest path',
                        property: 'shortestPath'
                    },
                    {
                        label: 'Degree neighborhood',
                        property: 'degNeigh'
                    }
                ]
            }
        ],
    },
    {
        label: 'Minimal',
        groups: [
            {
                label: 'Material Properties',
                fields: [
                    {
                        label: 'Derived materials',
                        property: 'degree'
                    },
                    {
                        label: 'Formation energy',
                        property: 'formationEnergy',
                        format: '.3f',
                        suffix: 'eV /atom'
                    },
                    {
                        label: 'Synthesis probability',
                        property: 'synthesisProbability',
                        format: '.1%'
                    }
                ]
            }
        ]
    }
]