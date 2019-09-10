export function neighborsOf(nodeNameOrSet, edges) {
    const lookup = typeof nodeNameOrSet === 'string' ? new Set([nodeNameOrSet]) : nodeNameOrSet;
    // Collect neighborhood of selected node.
    const nodes = new Set(lookup);
    for (const edge of edges) {
        if (lookup.has(edge[0]) || lookup.has(edge[1])) {
            nodes.add(edge[0]);
            nodes.add(edge[1]);
        }
    }
    return nodes;
}