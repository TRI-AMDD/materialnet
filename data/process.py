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


def extract(rec):
    return {'degree': rec['deg'][-1],
            'discovery': rec['discovery']}


def exit_error():
    print >>sys.stderr, 'usage: process.py <num_nodes> <edgefile> <nodefile>'
    return 1


def main():
    if len(sys.argv) < 4:
        return exit_error()

    n = None
    try:
        n = int(sys.argv[1])
    except ValueError:
        return exit_error()

    edgefile = sys.argv[2]
    nodefile = sys.argv[3]

    try:
        with open(edgefile) as f:
            reader = csv.reader(f)
            edges = list(reader)
    except IOError:
        print >>sys.stderr, 'fatal: could not open edgefile %s' % (edgefile)
        return 1

    nodes = unique_nodes(edges)

    node_sample = set(list(nodes)[:n]) if n > 0 else set(list(nodes))

    edge_sample = filter_edges(edges, node_sample)

    try:
        with open(nodefile) as f:
            data = json.loads(f.read())

    except IOError:
        print >>sys.stderr, 'fatal: could not open nodefile %s' % (nodefile)
        return 1

    for k in data:
        data[k] = extract(data[k])

    with open('edges.json', 'w') as f:
        print >>f, json.dumps(edge_sample, indent=2)

    with open('nodes.json', 'w') as f:
        print >>f, json.dumps(data)

    return 0


if __name__ == '__main__':
    sys.exit(main())
