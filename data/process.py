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
            'discovery': rec['discovery'],
            'x': rec['x'],
            'y': rec['y']}


def exit_error():
    print >>sys.stderr, 'usage: process.py <num_nodes> <edgefile> <existnodefile> <hyponodefile> <positionfile>'
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
    hyponodefile = sys.argv[4]
    positionfile = sys.argv[5]

    try:
        with open(edgefile) as f:
            reader = csv.reader(f)
            edges = list(reader)
    except IOError:
        print >>sys.stderr, 'fatal: could not open edgefile %s' % (edgefile)
        return 1

    nodes = unique_nodes(edges)

    node_sample = set(list(nodes)[:n]) if n > 0 else set(list(nodes))

    try:
        with open(nodefile) as f:
            data = json.loads(f.read())

        with open(hyponodefile) as f:
            hypodata = json.loads(f.read())

        for h in hypodata:
            assert h not in data

            data[h] = hypodata[h]

        with open(positionfile) as f:
            positions = json.loads(f.read())

            for p in positions:
                name = p['name']

                if name in data:
                    data[name]['x'] = p['x']
                    data[name]['y'] = p['y']

    except IOError:
        print >>sys.stderr, 'fatal: could not open nodefile %s' % (nodefile)
        return 1

    for k in data:
        data[k] = extract(data[k])

    edge_sample = filter_edges(edges, data)

    with open('edges.json', 'w') as f:
        print >>f, json.dumps(edge_sample, indent=2)

    with open('nodes.json', 'w') as f:
        print >>f, json.dumps(data)

    return 0


if __name__ == '__main__':
    sys.exit(main())
