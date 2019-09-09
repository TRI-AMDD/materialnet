import { scaleSequential } from 'd3-scale';
import { interpolateViridis } from 'd3-scale-chromatic';
import { observable, autorun, action, computed } from "mobx";
import { createContext } from "react";
import { DiskDataProvider } from "../data-provider";
import { sortStringsLength } from "../components/graph-vis/sort";
import { fetchStructure } from "../rest";
import datasets from '../datasets';
import { isEqual } from "lodash-es";
import { createFormatter } from './format';

export class ApplicationStore {
    static INVALID_VALUE_COLOR = '#ff0000';
    static DISCOVERED_COLOR = 'rgb(81,96,204)';
    static UNDISCOVERED_COLOR = '#de2d26';
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
    hovered = {
            node: null,
            position: null,
            radius: null
    };
    @observable
    hoveredLine = {
            node1: null,
            node2: null,
            position: null
    };

    
    @observable
    drawerVisible = true;

    @observable
    colorScale = scaleSequential(interpolateViridis);

    @observable
    sizeScaleRange = [2, 40];


    @observable
    showLegend = true;

    constructor() {
        // load data and update on dataset change        
        autorun(() => {
            // set the defaults from the dataset
            Object.assign(this, this.dataset.defaults, {});

            this.data = null;
            // load data and update on dataset change
            fetch(this.dataset.fileName).then(resp => resp.json()).then(data => {
                this.data = new DiskDataProvider(data.nodes, data.edges);
            });
        });

        // after loading defaults
        this.initState();

        // auto inject the structure
        autorun(() => {
            const node = this.selected;
            if (!node || node.structure) {
                return; // already fetched
            }
            node.structurePromise = fetchStructure(node.name).then(cjson => {
                return node.structure = cjson;
            });
        });

    }

    initState() {
        const integrateState = (state) => {
            state = { ...state }; // copy to manipuate
            ['dataset', 'color', 'size'].forEach((attr) => {
                const value = state[attr];
                delete state[attr];
                if (!value) {
                    return;
                }
                // find by label
                const found = this[`${attr}s`].find((d) => d.label === value);
                if (found) {
                    this[attr] = found;
                }
            });
            if (state.selected) {
                // selected by name when data is 
                const toSelect = state.selected;
                delete state.selected;
                autorun((reaction) => {
                    if (!this.data) {
                        return;
                    }
                    // lookup by name
                    this.selected = this.data.nodes[toSelect];
                    reaction.dispose(); // stop updating
                });
            }
            // rest pure copy
            Object.assign(this, state);
        };

        const state = window.history.state;
        if (state && state.dataset != null) {
            // use the stored state to init
            integrateState(state);
        } else {
            // try using the url
            const url = new URL(window.location.href);
            const dataset = url.searchParams.get('ds');
            const selected = url.searchParams.get('s');
            integrateState({
                dataset,
                selected
            });
        }
        
        let firstRun = true;
        // track state and update the url automatically
        autorun(() => {
            const state = {
                dataset: this.dataset.label,
                color: this.color.label,
                size: this.size.label,
                zoom: this.zoom,
                colorYear: this.colorYear,
                drawerVisible: this.drawerVisible,
                selected: this.selected ? this.selected.name : null
            };

            if (isEqual(state, window.history.state)) {
                // no change
                return;
            }

            const url = new URL(window.location.href);
            url.searchParams.set('ds', this.dataset.label);
            if (this.selected) {
                url.searchParams.set('s', this.selected.name);
            } else {
                url.searchParams.delete('s');
            }
            const title = document.title = `MaterialNet - ${this.dataset.label}${this.selected ? ` - ${this.selected.name}` : ''}`;
            if (firstRun) {
                firstRun = false;
                window.history.replaceState(state, title, url.href);
            } else {
                window.history.pushState(state, title, url.href);
            }
        }, { delay: 300 }); // debounce 300ms
        
        // track history changes by the user (e.g. go back)
        window.addEventListener('popstate', (evt) => {
            const state = evt.state;
            if (state && state.dataset != null) {
                integrateState(state);
            }
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
    get zoomNodeSizeFactor() {
        return Math.pow(2, this.zoom);
    }
    
    @computed
    get searchOptions() {
        if (!this.data) {
            return null;
        }
        return this.data.nodeNames().slice().sort(sortStringsLength).map(val => ({ label: val }));
    }

    minMaxProperty(property) {
        if (!this.data) {
            return [0, 10];
        }
        return this.data.nodeNames().reduce(([min, max], name) => {
            const v = this.data.nodeProperty(name, property);
            if (v == null) {
                return [min, max];
            }
            return [
                Math.min(min, v),
                Math.max(max, v)
            ];
        }, [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]);
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

    getPropertyMetaData(property) {
        const props = this.dataset.properties || {};
        const base = Object.assign({
            format: (v) => typeof v === 'number' ? v.toFixed(3) : v
        }, props[property] || {});

        if (typeof base.format === 'string') {
            // create a formatter out of the spec
            base.format = createFormatter(base.format, base.prefix, base.suffix);
        }
        return base;
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
