import csv
import json
import sys


def unique_nodes(edges):
    nodes = set([]);
    for e in edges:
        nodes.add(e[0])
        nodes.add(e[1])

    return nodes


def filter_edges(edges, nodes):
    return filter(lambda e: e[0] in nodes and e[1] in nodes, edges)


def main():
    reader = csv.reader(sys.stdin)
    edges = list(reader)

    nodes = unique_nodes(edges)

    node_sample = set(list(nodes)[:100])

    edge_sample = filter_edges(edges, node_sample)
    print json.dumps(edge_sample, indent=2)


if __name__ == '__main__':
    sys.exit(main())
