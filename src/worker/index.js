import { forceSimulation, forceManyBody, forceLink, forceCollide } from 'd3-force';
import { throttle } from 'lodash-es';

// eslint-disable-next-line no-restricted-globals
const root = self;

function onMessage(listener) {
    const l = (msg) => {
        listener(msg.data, msg);
    }
    root.addEventListener('message', l);

    return () => {
        root.removeEventListener('message', l);
    }
}

function layout(params, replyer, key) {
    params = Object.assign({
        nodes: [],
        edges: [],
        alpha: 1,

    }, params);

    // nodes format as input: {name: string, x: number, y: number, radius: number}[]
    // edge format as inptu: [string, string];

    // position output format: {[node string]: {x, y}};

    const lookup = new Map();
    const nodes = params.nodes;
    for (const node of nodes) {
        lookup.set(node.name, node);
    };
    const edges = params.edges.map(([a, b]) => {
        return {
            source: lookup.get(a),
            target: lookup.get(b)
        };
    });

    const simulation = forceSimulation()
        .nodes(nodes)
        .alpha(params.alpha)
        .force('charge', forceManyBody())
        .force('collide', forceCollide().radius((node) => node.radius))
        .force('link', forceLink(edges));
    
    const stopper = onMessage((msg) => {
        if (msg.key !== key) {
            return;
        }
        switch (msg.type) {
            case 'abort':
                simulation.stop();
                stopper();
                break;
            default:
                console.log('unknown message', msg);
        }
    });

    const toNodePos = () => {
        const r = {};
        for (const node of nodes) {
            r[node.name] = { x: node.x, y: node.y };
        }
        return r;
    }
    
    simulation.on('tick', throttle(() => {
        replyer('tick', {
            nodes: toNodePos(nodes)
        });
    }, 200));
    simulation.on('end', () => {
        replyer('end', {
            nodes: toNodePos(nodes)
        });
        // no more extras
        stopper();
    });
}


onMessage((data) => {
    const type = data.type;
    const key = data.key;
    const params = data.params;

    const cmds = {
        layout
    };

    const replyer = (type, params) => root.postMessage({ type, params, key });
    
    if (cmds[type]) {
        cmds[type](params, replyer, key);
    }
});