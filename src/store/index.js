import { scaleSequential } from 'd3-scale';
import { interpolateViridis } from 'd3-scale-chromatic';
import { observable, autorun, action, computed, toJS } from "mobx";
import { createContext } from "react";
import { DiskDataProvider } from "../data-provider";
import { sortStringsLength } from "../components/graph-vis/sort";
import { fetchStructure } from "../rest";
import datasets from '../datasets';
import { isEqual, camelCase } from "lodash-es";
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
    pinnedNodes = [];

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
    drawerExpanded = {
            options: true,
            filter: false
    };

    @observable
    colorScale = scaleSequential(interpolateViridis);

    @observable
    sizeScaleRange = [2, 40];


    @observable
    showLegend = true;

    @observable
    filters = {
        // [property]: value ... filter object
    };

    @observable
    filterElements = [];

    constructor() {
        // load data and update on dataset change        
        autorun(() => {
            const toLoad = this.dataset.fileName;

            // reset state
            this.hovered = { node: null, position: null, radius: null };
            this.hoveredLine = { node1: null, node2: null, position: null };
            this.filters = {};
            this.filterElements = [];
            this.selected = null;
            this.pinnedNodes = [];

            // set the defaults from the dataset
            Object.assign(this, this.dataset.defaults || {});

            this.data = null;
            // load data and update on dataset change
            fetch(toLoad).then(resp => resp.json()).then(data => {
                if (toLoad === this.dataset.fileName) {
                    // still the same file to load
                    this.data = new DiskDataProvider(data.nodes, data.edges);
                }
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

        autorun(() => {
            if (!this.data) {
                return;
            }
            const node = this.data.nodes[this.search];
            if (node) {
                this.selected = node;
            }
        })

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
            if (state.selected || state.pinned) {
                // selected by name when data is 
                const toSelect = state.selected;
                const toPin = state.pinned;
                delete state.selected;
                delete state.pinned;

                autorun((reaction) => {
                    if (!this.data) {
                        return;
                    }
                    // lookup by name
                    this.selected = this.data.nodes[toSelect];
                    this.pinnedNodes = toPin.map((d) => this.data.nodes[d]).filter((d) => d != null);

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
            const pinned = (url.searchParams.get('p') || '').split(',');
            integrateState({
                dataset,
                selected,
                pinned
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
                filters: toJS(this.filters),
                filterElements: toJS(this.filterElements),
                selected: this.selected ? this.selected.name : null,
                pinned: this.pinnedNodes.map((d) => d.name)
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
            if (this.pinnedNodes.length > 0) { 
                url.searchParams.set('p', this.pinnedNodes.map((d) => d.name).join(','));
            } else {
                url.searchParams.delete('p');
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
    get filterFunc() {
        const filters = Object.entries(toJS(this.filters));
        const elements = new Set(this.filterElements);
        if (filters.length === 0 && elements.length === 0) {
            return null;
        }
        return (node) => {
            if (elements.size > 0 && node._elements.some((e) => !elements.has(e))) {
                return false;
            }
            return filters.every(([prop, [min, max]]) => {
                const value = node[prop];
                return value != null && value >= min && value <= max;
            });
        };
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
    get knownElements() {
        if (!this.data) {
            return [];
        }
        const s = new Set();
        for (const name of this.data.nodeNames()) {
            const elements = this.data.nodes[name]._elements;
            for (const elem of elements) {
                s.add(elem)
            }
        }
        return Array.from(s).sort();
    }

    @computed
    get filteredNodeNames() {
        if (!this.data) {
            return [];
        }
        const filter = this.filterFunc;
        if (!filter) {
            return this.data.nodeNames();
        }
        return this.data.nodeNames().filter((name) => filter(this.data.nodes[name]));
    }


    @computed
    get filteredEdges() {
        if (!this.data) {
            return [];
        }
        const filter = this.filterFunc;
        if (!filter) {
            return this.data.edges;
        }
        return this.data.edges.filter(([a , b]) => filter(this.data.nodes[a]) && filter(this.data.nodes[b]));
    }

    @computed
    get zoomNodeSizeFactor() {
        return Math.pow(2, this.zoom);
    }
    
    @computed
    get searchOptions() {
        if (!this.data) {
            return [];
        }
        return this.filteredNodeNames.slice().sort(sortStringsLength).map(value => ({ label: value, value }));
    }

    _createProperty(property, info = {}) {
        const entry = {
            property,
            isfilterable: false,
            type: 'numerical',
            label: camelCase(property),
            format: (v) => typeof v === 'number' ? v.toFixed(3) : v,
            ...info
        };
        if (typeof entry.format === 'string') {
            // create a formatter out of the spec
            entry.format = createFormatter(entry.format, entry.prefix, entry.suffix);
        }
        if (entry.type === 'numerical' && !entry.domain) {
            entry.domain = this._minMaxProperty(property);
        }
        return entry;
    }

    @computed
    get properties() {
        const properties = {};
        Object.entries(this.dataset.properties).forEach(([property, info]) => {
            properties[property] = this._createProperty(property, info);
        });
        return properties;
    }

    @computed
    get propertyList() {
        return Object.values(this.properties);
    }

    getPropertyMetaData(property) {
        const prop = this.properties[property];
        if (!prop) {
            // fake property
            return this._createProperty(property);
        }
        return prop;
    }

    _minMaxProperty(property, nodes) {
        if (!this.data) {
            return [0, 10];
        }
        nodes = nodes || this.data.nodeNames();

        return nodes.reduce(([min, max], name) => {
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
        if (!this.yearRange) {
            return;
        }
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
    selectNode(node, asPinned) {
        const currentName = this.selected ? this.selected.name : '';
        const isSelected = node && node.name === currentName;
        const isPinned = node && this.isPinned(node);

        if (asPinned) {
            if (isPinned) {
                this.removePinned(node);
                if (isSelected) {
                    this.selected = null;
                }
            } else {
                this.pushPinned(node);
                this.selected = node;
            }
            return;
        }
        this.selected = isSelected ? null : node; 
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

    @action
    pushPinned(node) {
        if (this.pinnedNodes.every((d) => d.name !== node.name)) {
            this.pinnedNodes.push(node);
        }
    }

    isPinned(node) {
        return this.pinnedNodes.some((d) => d.name === node.name);
    }

    @action
    removePinned(node) {
        this.pinnedNodes = this.pinnedNodes.filter((n) => n.name !== node.name);
    }
}

export default createContext();
