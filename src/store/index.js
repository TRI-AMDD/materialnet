import { scaleSequential } from 'd3-scale';
import { interpolateViridis } from 'd3-scale-chromatic';
import { observable, autorun, action, computed } from "mobx";
import { createContext } from "react";
import { DiskDataProvider } from "../data-provider";
import { sortStringsLength } from "../components/graph-vis/sort";
import { fetchStructure } from "../rest";
import datasets from '../datasets';

export class ApplicationStore {
    static INVALID_VALUE_COLOR = '#ff0000';
    static EXISTS_COLOR = 'rgb(81,96,204)';
    static NOT_EXISTENT_COLOR = '#de2d26';
    static FIXED_COLOR = `rgb(${0.2 * 255}, ${0.3 * 255}, ${0.8 * 255})`;

    @observable
    datasets = datasets;

    @observable
    dataset = datasets[0];

    @observable
    data = null;

    @observable
    template = null;

    @computed
    get templates() {
        return this.dataset.templates;
    }

    @observable
    zoom = 1;

    @computed
    get zoomRange() {
        return this.dataset.zoomRange;
    }

    @observable
    spacing = 1;
    @observable
    spacingRange = [0.1, 10];

    @observable
    opacity = 0.01;

    @observable
    play = false;
    @observable
    interval = null;

    @observable
    year = null;

    @observable
    colorYear = null;

    @computed
    get yearRange() {
        return this.dataset.yearRange;
    }

    @observable
    search = '';

    @observable
    color = null;

    @computed
    get colors() {
        return this.dataset.colors;
    }

    @observable
    size = null;

    @computed
    get sizes() {
        return this.dataset.sizes;
    }

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

    @observable
    colorScale = scaleSequential(interpolateViridis);


    constructor() {
        autorun(() => {
            // set the defaults from the dataset
            Object.assign(this, this.dataset.defaults, {});

            // load data and update on dataset change
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
        return this.data.nodes.slice().sort(sortStringsLength).map(val => ({ label: val }));
    }

    @action
    setPlayState(play, interval) {
        this.play = play;
        this.interval = interval;
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

    getFormatter(property) {
        const props = this.dataset.properties || {};
        const info = props[property];
        if (info && info.format) {
            return info.format;
        }
        return (v) => typeof v === 'number' ? v.toFixed(3) : v;
    }

    @computed
    get nodeColorer() {
        if (!this.color) {
            return {
                legend: () => null,
                scale: () => ApplicationStore.FIXED_COLOR
            };
        }
        return this.color.factory(this);
    }

    @computed
    get nodeSizer() {
        if (!this.size) {
            return {
                legend: () => null,
                scale: () => 10
            };
        }
        return this.size.factory(this);
    }
}

export default createContext();
