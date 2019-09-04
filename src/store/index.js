import { observable, autorun, action } from "mobx";
import { createContext } from "mobx-react-lite-context";


export class Store {
    @observable
    nodes = [];

    @observable
    edges = [];

    @observable
    dataset = 'precise';

    static datasetOptions = [
        { label: 'Precise', value: 'precise' },
        { label: 'Precise - Gephi', value: 'precise-gephi' },
        { label: 'Sample 1', value: 'sample1' },
        { label: 'Sample 1 - Gephi', value: 'sample1-gephi' },
        { label: 'Sample 2', value: 'sample2' },
    ];

    @observable
    template = 'material';

    static templateOptions = [
        { label: 'Material', value: 'material' },
        { label: 'Minimal', value: 'minimal' }
    ];

    @observable
    zoom = -2.3;
    static zoomSettings = {
        min: -3.75,
        max: 3
    };

    @observable
    spacing = 1;
    static spacingSettings = {
        min: 0.1,
        max: 10
    };


    @observable
    opacity = 0.01;
    static opacitySettings = {
        min: 0,
        max: 0.1,
        step: 0.001
    };

    @observable
    year = 2016;

    @observable
    play = false;
    @observable
    interval = null;

    static yearSettings = {
        min: 1945,
        max: 2016,
        step: 1,
    };

    @observable
    search = '';

    @observable
    color = 'discovery';

    static colorOptions = [
        { label: 'None', value: 'none' },
        { label: 'Year of discovery', value: 'discovery' },
        { label: 'Discovered/Hypothetical', value: 'boolean' },
        { label: 'Discovered/Undiscovered', value: 'undiscovered' },
        { label: 'Formation Energy', value: 'formation_energy' },
        { label: 'Synthesis Probability', value: 'synthesis_probability' },
        { label: 'Clustering Coefficient', value: 'clus_coeff' },
        { label: 'Eigenvector Centrality', value: 'eigen_cent' },
        { label: 'Degree Centrality', value: 'deg_cent' },
        { label: 'Shortest path', value: 'shortest_path' },
        { label: 'Degree Neighborhood', value: 'deg_neigh' },
    ];

    @observable
    colorYear = 2016;

    static colorYearOptions = {
        min: 1945,
        max: 2016,
        step: 1
    };

    @observable
    size = 'normal';

    static sizeOptions = [
        { label: 'None', value: 'none' },
        { label: 'Degree', value: 'normal' },
        { label: 'Degree - Large', value: 'large' },
        { label: 'Degree - Huge', value: 'huge' }
    ];

    @observable
    showLinks = false;

    @observable
    nightMode = false;

    @observable
    selected = null;

    @observable
    selectedPosition = null;

    @observable
    structure = null;

    constructor() {
        // load data and update on dataset change
        autorun(() => {
            const datafile = `sample-data/${this.dataset}.json`;
            fetch(datafile).then(resp => resp.json()).then(data => {
            this.nodes = data.nodes;
            this.edges = data.edges;
            });
        });
    }

    @action
    setPlayState(play, interval) {
        this.play = play;
        this.interval = interval;
    }

    @action
    deselect() {
        this.selected = null;
        this.structure = null;
    }
}


export default createContext(new Store());
