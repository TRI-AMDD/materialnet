import { propertyColorFactory } from '../utils';
import defaultTemplate from '../default';

export default [
  ...defaultTemplate.colors,
  {
    label: 'Formation Energy',
    factory: propertyColorFactory('formation_energy'),
  },
  {
    label: 'Band Gap',
    factory: propertyColorFactory('band_gap'),
  },
];
