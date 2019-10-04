import { scaleSequential } from 'd3-scale';
import { interpolateViridis } from 'd3-scale-chromatic';
import { observable, autorun, action, computed, toJS } from "mobx";
import { createContext } from "react";
import { DiskDataProvider } from "../data-provider";
import { sortStringsLength } from "../components/graph-vis/sort";
import { fetchStructure } from "../rest";
import datasets from '../datasets';
import { isEqual, camelCase, uniqueId } from "lodash-es";
import { createFormatter } from './format';

// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from 'worker-loader!../worker';
import { neighborsOf } from '../data-provider/graph';

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
    showTable = false;

    @observable
    drawerExpanded = {
        options: true,
        filter: false,
        layouts: false
    };

    @observable
    colorScale = scaleSequential(interpolateViridis);

    @observable
    sizeScaleRange = [2, 40];


    @observable
    showLegend = true;

    @observable
    showSubGraphOnly = true;

    @observable
    pinnedNodes = []; // {node: INode, includeNeighbors: boolean, defineSubspace: boolean}

    @observable
    filters = {
        // [property]: value ... filter object
    };

    @observable
    subGraphLayout = {
        // [name]: {x,y}
    };

    @observable
    subGraphLayouting = null; // function to abort the current layout

    worker = new Worker();

    constructor() {
        // load data and update on dataset change
        autorun(() => {
            const toLoad = this.dataset.fileName;

            // reset state
            this.hovered = { node: null, position: null, radius: null };
            this.hoveredLine = { node1: null, node2: null, position: null };
            this.filters = {};
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
            if (state.selected || state.pinned) {
                // selected by name when data is
                const toSelect = state.selected;
                // const toPin = state.pinned;
                delete state.selected;
                delete state.pinned;

                autorun((reaction) => {
                    if (!this.data) {
                        return;
                    }
                    // lookup by name
                    this.selected = this.data.nodes[toSelect];
                    // TODO
                    // this.pinnedNodes = toPin.map((d) => this.data.nodes[d]).filter((d) => d != null);

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
            // TODO const pinned = (url.searchParams.get('p') || '').split(',');
            integrateState({
                dataset,
                selected,
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
                // TODO pinned: this.pinnedNodes.map((d) => d.name)
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
            // if (this.pinnedNodes.length > 0) {
            //     url.searchParams.set('p', this.pinnedNodes.map((d) => d.name).join(','));
            // } else {
            //     url.searchParams.delete('p');
            // }
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
        const subSpaceBaseElements = new Set([].concat(...this.defineSubspaceNodes.map(d => d._elements)));
        const neighborElementNames = this.data ? neighborsOf(this.incluceNeighborsNodes.map((d) => d.name), this.data.edges) : new Set();

        if (filters.length === 0 && subSpaceBaseElements.size === 0 && neighborElementNames.size === 0) {
            return null;
        }
        const mustInclude = new Set(this.pinnedNodes.map((d) => d.node.name));

        if (this.selected) {
            mustInclude.add(this.selected.name);
        }

        return (node) => {
            if (mustInclude.has(node.name)) {
                return true;
            }
            if (!filters.every(([prop, [min, max]]) => {
                const value = node[prop];
                return value != null && value >= min && value <= max;
            })) {
                return false;
            }
            if (neighborElementNames.has(node.name)) {
                return true;
            }
            if (subSpaceBaseElements.size > 0 && node._elements.every(base => subSpaceBaseElements.has(base))) {
                return true;
            }
            // only visible if no subspace filter is set
            return neighborElementNames.size === 0 && subSpaceBaseElements.size === 0;
        };
    }

    @computed
    get nodes() {
        return this.data.nodes;
    }

    @computed
    get nodeNames() {
        return this.data ? this.data.nodeNames() : [];
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
        return this.nodeNames.filter((d) => this.data.nodes[d]._elements.length === 1).sort(sortStringsLength);
    }

    @computed
    get subGraphNodeNames() {
        const filter = this.filterFunc;
        if (!filter) {
            return this.nodeNames;
        }
        return this.nodeNames.filter((name) => filter(this.data.nodes[name]));
    }

    @computed
    get doesShowSubgraph() {
        return this.filterFunc != null;
    }

    @computed
    get subGraphNodes() {
        return this.subGraphNodeNames.map((name) => this.nodes[name]);
    }

    @computed
    get subGraphEdges() {
        const nodes = new Set(this.subGraphNodeNames);
        if (nodes.size === 0) {
            return [];
        }
        return this.data.edges.filter((d) => nodes.has(d[0]) && nodes.has(d[1]));
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
        return this.nodeNames.slice().sort(sortStringsLength).map(value => ({ label: value, value }));
    }

    _createProperty(property, info = {}) {
        const entry = {
            property,
            isfilterable: false,
            type: 'numerical',
            label: camelCase(property),
            formatSpecifier: '.3f',
            format: (v) => typeof v === 'number' ? v.toFixed(3) : v,
            ...info
        };
        if (typeof entry.format === 'string') {
            // create a formatter out of the spec
            entry.formatSpecifier = entry.format;
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
    selectNode(node, modifiers) {
        const currentName = this.selected ? this.selected.name : '';
        const isSelected = node && node.name === currentName;

        if (modifiers.ctrl && node) {
            if (this.toggleIncludeNeighbors(node)) {
                this.selected = node;
            } else if (isSelected) {
                this.selected = null;
            }
            return;
        }
        if (modifiers.alt && node) {
            if (this.toggleDefineSubspace(node)) {
                this.selected = node;
            } else if (isSelected) {
                this.selected = null;
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



    @computed
    get defineSubspaceNodes() {
        return this.pinnedNodes.filter((d) => d.defineSubspace).map((d) => d.node);
    }

    setDefineSubspaceNodes(names) {
        const old = new Set(this.defineSubspaceNodes.map((d) => d.name));
        names.forEach((name) => {
            if (!old.has(name)) {
                this.toggleDefineSubspace(this.data.nodes[name]);
            }
        });
    }

    @computed
    get incluceNeighborsNodes() {
        return this.pinnedNodes.filter((d) => d.includeNeighbors).map((d) => d.node);
    }

    @action
    toggleIncludeNeighbors(node) {
        const existing = this.pinnedNodes.find((d) => d.node.name === node.name);
        if (existing) {
            existing.includeNeighbors = !existing.includeNeighbors;
            if (!existing.defineSubspace && !existing.includeNeighbors) {
                // remove completely
                this.pinnedNodes = this.pinnedNodes.filter((d) => d !== existing);
            }
            return false;
        }
        this.pinnedNodes.push({ node, includeNeighbors: true, defineSubspace: false });
        return true;
    }

    @action
    toggleDefineSubspace(node) {
        const existing = this.pinnedNodes.find((d) => d.node.name === node.name);
        if (existing) {
            existing.defineSubspace = !existing.defineSubspace;
            if (!existing.defineSubspace && !existing.includeNeighbors) {
                // remove completely
                this.pinnedNodes = this.pinnedNodes.filter((d) => d !== existing);
            }
            return false;
        }
        this.pinnedNodes.push({ node, includeNeighbors: false, defineSubspace: true });
        return true;
    }

    isIncludeNeighborsPinned(node) {
        return this.pinnedNodes.some((d) => d.node.name === node.name && d.includeNeighbors);
    }

    isDefineSubspacePinned(node) {
        return this.pinnedNodes.some((d) => d.node.name === node.name && d.defineSubspace);
    }

    isPinned(node) {
        return this.pinnedNodes.find((d) => d.name === node.name) != null;
    }

    @action
    removePinned(node) {
        this.pinnedNodes = this.pinnedNodes.filter((d) => d.node.name !== node.name);
    }

    @action
    pushPinned(node) {
        this.pinnedNodes.push({ node, includeNeighbors: false, defineSubspace: false });
    }

    @action
    togglePinned(node) {
        const index = this.pinnedNodes.findIndex((d) => d.node.name === node.name);
        if (index >= 0) {
            this.pinnedNodes.splice(index, 1);
        } else {
            this.pinnedNodes.push({ node, includeNeighbors: false, defineSubspace: false });
        }
    }

    _postMessage(type, params, onMessage) {
        const key = uniqueId();
        const replyer = (type, params) => this.worker.postMessage({ type, params, key });

        const listener = (msg) => {
            if (msg.data.key !== key) {
                return;
            }
            const done = onMessage(msg.data, replyer);
            if (done) {
                this.worker.removeEventListener('message', listener);
            }
        }
        this.worker.addEventListener('message', listener);
        this.worker.postMessage({ type, params, key });
        return replyer;
    }

    @action
    computeSubGraphLayout() {
        const nodes = toJS(this.subGraphNodes).map((name) => {
            const node = this.nodes[name];
            const layoutNode = {
                name,
                x: node.x,
                y: node.y,
                radius: this.nodeSizer.scale(node)
            };
            return layoutNode;
        });

        if (nodes.length === 0) {
            return;
        }
        this.subGraphLayouting = true;

        const edges = toJS(this.subGraphEdges);

        this.subGraphLayouting = this._postMessage('layout', { nodes, edges }, (msg) => {
            const nodes = msg.params.nodes;
            this.subGraphLayout = nodes;

            if (msg.type === 'end') {
                this.subGraphLayouting = null;
                return true;
            }
            // just a tick
            return false;
        });
    }

    @action
    abortSubGraphLayout() {
        if (this.subGraphLayouting) {
            this.subGraphLayouting('abort', {});
            this.subGraphLayouting = null;
        }
    }

    @action
    resetSubGraphLayout() {
        this.subGraphLayout = {};
    }
}

export default createContext();
