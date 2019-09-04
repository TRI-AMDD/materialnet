import { observable, autorun, action, computed } from "mobx";
import { createContext } from "react";
import { DiskDataProvider } from "../data-provider";
import { sortStringsLength } from "../components/graph-vis/sort";
import { fetchStructure } from "../rest";


export class ApplicationStore {
    @observable
    data = null;

    @observable
    dataset = 'precise';

    static datasetSettings = {
        options: [
            { label: 'Precise', value: 'precise' },
            { label: 'Precise - Gephi', value: 'precise-gephi' },
            { label: 'Sample 1', value: 'sample1' },
            { label: 'Sample 1 - Gephi', value: 'sample1-gephi' },
            { label: 'Sample 2', value: 'sample2' },
        ]
    };

    @observable
    template = 'material';

    static templateSettings = {
        options: [
            { label: 'Material', value: 'material' },
            { label: 'Minimal', value: 'minimal' }
        ]
    };

    @observable
    zoom = -2.3;
    static zoomSettings = {
        range: [-3.75, 3]
    };

    @observable
    spacing = 1;
    static spacingSettings = {
        range: [0.1, 10]
    };


    @observable
    opacity = 0.01;
    static opacitySettings = {
        range: [0, 0.1],
        step: 0.001
    };

    @observable
    year = 2016;

    @observable
    play = false;
    @observable
    interval = null;

    static yearSettings = {
        range: [1945, 2016],
        step: 1,
    };

    @observable
    search = '';

    @observable
    color = 'discovery';

    static colorSettings = {
        options: [
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
        ]
    };

    @observable
    colorYear = 2016;

    static colorYearSettings = {
        range: [1945, 2016],
        step: 1
    };

    @observable
    size = 'normal';

    static sizeSettings = {
        options: [
            { label: 'None', value: 'none' },
            { label: 'Degree', value: 'normal' },
            { label: 'Degree - Large', value: 'large' },
            { label: 'Degree - Huge', value: 'huge' }
        ]
    };

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
                this.data = new DiskDataProvider(data.nodes, data.edges);
            });
        });
    }

    @computed
    get nodes() {
        return this.data.nodes;
    }

    @computed
    get edges() {
        return this.data.edges;
    }
    
    @computed
    get searchOptions() {
        if (!this.data) {
            return null;
        }
        return this.data.nodeNames().slice().sort(sortStringsLength).map(val => ({ label: val }));
    }

    @action
    setPlayState(play, interval) {
        this.play = play;
        this.interval = interval;
    }

    @action
    clearSelection() {
        this.selected = null;
        this.structure = null;
    }

    @action
    toggleAutoplay() {
        let interval = this.interval;
        let play = !this.play;

        if (this.play && this.interval) {
            clearInterval(this.interval);
            interval = null;
        }

        if (!this.play) {
            interval = setInterval(() => {
                let nextYear = this.year + 1;
                if (this.year === ApplicationStore.yearSettings.range[1]) {
                    nextYear = ApplicationStore.yearSettings.range[0];
                }
                this.year = nextYear;
            }, 1000);
        }

        this.setPlayState(play, interval);
    }

    @action
    selectNode(obj, position) {
        const currentName = this.selected ? this.selected.name : '';
        // toggle if click on selected
        if (obj.name === currentName) {
            obj = null;
        }
        this.selected = obj;
        this.selectedPosition = position;
        this.structure = null;

        if (!obj) {
            return;
        }

        fetchStructure(obj.name).then(cjson => {
            if (cjson) {
                this.structure = cjson;
            }
        });
    }
}

export default createContext();
