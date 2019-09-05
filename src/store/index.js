import { scaleSequential } from 'd3-scale';
import { interpolateViridis } from 'd3-scale-chromatic';
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

    @observable
    drawerVisible = true;

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
    get datasetLabel() {
        return ApplicationStore.datasetSettings.options.find((d) => d.value === this.dataset).label;
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

    @computed
    get degree2SizeFunc() {
        const factor = Math.pow(2, this.zoom);
        switch (this.size) {
            case 'none':
                return factor * 10;
            case 'normal':
                return (deg) => factor * (10 + Math.sqrt(deg));
            case 'large':
                return (deg) => factor * (10 + Math.sqrt(Math.sqrt(deg * deg * deg)));
            case 'huge':
                return (deg) => factor * (10 + deg);
            default:
                throw new Error(`bad level option: ${this.size}`);
        }
    }

    @computed
    get nodeSizeFunc() {
        const degree2size = this.degree2SizeFunc;
        if (this.size === 'none' || !this.data) {
            return degree2size;
        }
        const degrees = this.data.nodeDegrees(this.year);
        const names = this.data.nodeNames();
        return (_nodeId, i) => {
            const name = names[i];
            return degree2size(degrees[name]);
        }
    }

    @computed
    get minMaxDegrees() {
        if (!this.data) {
            return [0, 10];
        }
        const degrees = this.data.nodeDegrees(this.year);
        return this.data.nodeNames().reduce(([min, max], name) => {
            const v = degrees[name];
            return [
                Math.min(min, v),
                Math.max(max, v)
            ];
        }, [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]);
    }

    @computed
    get minMaxColorRange() {
        if (!this.data) {
            return [0, 10];
        }
        return this.data.nodeNames().reduce(([min, max], name) => {
            const v = this.data.nodeProperty(name, this.color);
            if (v == null) {
                return [min, max];
            }
            return [
                Math.min(min, v),
                Math.max(max, v)
            ];
        }, [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]);
    }


    propertyFormatter(property) {
        switch (property) {
            case 'synthesis_probability':
                return (v) => `${(v * 100).toFixed(2)}%`;
            case 'discovery':
                return (v) => v.toString();
            default:
                return (v) => typeof v === 'number' ? v.toFixed(3) : v;
        }
    }


    static COLOR_SCALE = scaleSequential(interpolateViridis);
    static INVALID_VALUE_COLOR = '#ff0000';
    static EXISTS_COLOR = 'rgb(81,96,204)';
    static NOT_EXISTENT_COLOR = '#de2d26';
    static FIXED_COLOR = `rgb(${0.2 * 255}, ${0.3 * 255}, ${0.8 * 255})`;
}

export default createContext();
