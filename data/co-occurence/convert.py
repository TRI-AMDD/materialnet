import networkx as nx
import random
import json
import argparse
import sys


def main():
    parser = argparse.ArgumentParser(description='convert co-occurene file')
    parser.add_argument('--delimiter', help='delimiter to parse', default=',')
    parser.add_argument('--sample', type=int, default=None,
                        help='only a sample of the edges')
    parser.add_argument('--scale', type=int, default=1000,
                        help='pixel box layout in drawn in')
    parser.add_argument('--seed', type=int,
                        help='random seed', default=None)
    parser.add_argument(
        '--layout', choices=['spring', 'spectral', 'circle'],
        default='spring', help='layout to choose')
    parser.add_argument('file', help='input file')
    
    args = parser.parse_args()
    
    graph = nx.read_edgelist(args.file, delimiter=args.delimiter)
    if args.seed:
        random.seed(args.seed)

    if args.sample:
        sub_edges = random.sample(list(graph.edges()), args.sample)
        sub_nodes = list(set([v for v, _ in sub_edges] + [v for _, v in sub_edges]))
        graph = graph.subgraph(sub_nodes)
    
    # compute some attributes
    nx.set_node_attributes(graph, graph.degree(graph), 'degree')
    nx.set_node_attributes(graph, nx.degree_centrality(graph), 'deg_cent')
    nx.set_node_attributes(
        graph, nx.eigenvector_centrality(graph), 'eigen_cent')

    if args.layout == 'spring':
        pos = nx.spring_layout(graph, scale=args.scale)
    elif args.layout == 'spectral':
        pos = nx.spectral_layout(graph, scale=args.scale)
    else:
        pos = nx.circular_layout(graph, scale=args.scale)

    nx.set_node_attributes(graph, {k: v[0] for k, v in pos.items()}, 'x')
    nx.set_node_attributes(graph, {k: v[1] for k, v in pos.items()}, 'y')

    data = dict(
        nodes={n: dict(a) for (n, a) in graph.nodes(data=True)},
        edges=[e for e in graph.edges()]
    )
    # Dump the data.
    print(json.dumps(data, indent=2, separators=(',', ': ')))

    return 0


if __name__ == '__main__':
    sys.exit(main())
