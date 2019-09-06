import { scaleSequential } from 'd3-scale';
import { interpolateViridis } from 'd3-scale-chromatic';
import { observable, autorun, action, computed } from "mobx";
import { createContext } from "react";
import { DiskDataProvider } from "../data-provider";
import { sortStringsLength } from "../components/graph-vis/sort";
import { fetchStructure } from "../rest";
import datasets from '../datasets';

export class ApplicationStore {
    @observable
    data = null;

    @observable
    datasets = datasets;

    @observable
    dataset = datasets[0];

    @observable
    templates = [
        { label: 'Material', value: 'material' },
        { label: 'Minimal', value: 'minimal' }
    ];

    @observable
    template = this.templates[0];

    @observable
    zoom = -2.3;
    @observable
    zoomRange = [-3.75, 3]; // dataset specific ?

    @observable
    spacing = 1;
    @observable
    spacingRange = [0.1, 10];

    @observable
    opacity = 0.01;

    // dataset specific or not existing
    @observable
    year = 2016;

    @observable
    play = false;
    @observable
    interval = null;

    @observable
    yearRange = [1945, 2016]; // dataset specific

    @observable
    search = '';

    @observable
    color = 'discovery'; // dataset specific

    @observable
    colors = [
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
    colorYear = 2016; // dataset specific

    @observable
    size = 'normal';

    @observable
    sizes = [
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
    drawerVisible = true;

    constructor() {
        // load data and update on dataset change
        autorun(() => {
            const datafile = `sample-data/${this.dataset.label}.json`;
            fetch(datafile).then(resp => resp.json()).then(data => {
                this.data = new DiskDataProvider(data.nodes, data.edges);
            });
        });

        // auto inject the structure
        autorun(() => {
            const node = this.selected;
            if (!node || node.structure) {
                return; // already fetched
            }
            node.structurePromise = fetchStructure(node.name).then(cjson => {
                return node.structure = cjson;
            });
        })
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
                if (this.year === this.yearRange[1]) {
                    nextYear = this.yearRange[0];
                }
                this.year = nextYear;
            }, 1000);
        }

        this.setPlayState(play, interval);
    }

    @action
    selectNode(node, position) {
        const currentName = this.selected ? this.selected.name : '';
        // toggle if click on selected
        if (node.name === currentName) {
            node = null;
        }
        this.selected = node;
        this.selectedPosition = position;
    }

    @computed
    get degree2SizeFunc() {
        const factor = Math.pow(2, this.zoom);
        switch (this.size) {// dataset specific, assumes some degree ranges
            case 'none':
                return () => factor * 10;
            case 'normal':
                return (deg) => factor * (10 + Math.sqrt(deg));
            case 'large':
                return (deg) => factor * (10 + Math.sqrt(Math.sqrt(deg * deg * deg))); //x^3/4
            case 'huge':
                return (deg) => factor * (10 + deg);
            default:
                throw new Error(`bad level option: ${this.size}`);
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
        return this.minMaxProperty(this.color);
    }

    minMaxProperty(property) {
        if (!this.data) {
            return [0, 10];
        }
        return this.nodes.reduce(([min, max], node) => {
            const v = node[property];
            if (v == null) {
                return [min, max];
            }
            return [
                Math.min(min, v),
                Math.max(max, v)
            ];
        }, [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]);
    }

    // dataset specific
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

    @observable
    colorScale = scaleSequential(interpolateViridis);

    static INVALID_VALUE_COLOR = '#ff0000';
    static EXISTS_COLOR = 'rgb(81,96,204)';
    static NOT_EXISTENT_COLOR = '#de2d26';
    static FIXED_COLOR = `rgb(${0.2 * 255}, ${0.3 * 255}, ${0.8 * 255})`;
}

export default createContext();
