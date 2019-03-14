import json
import random
import sys


def main():
    if len(sys.argv) < 4:
        print >>sys.stderr, 'usage: edge-sample.py <nodefile> <edgefile> <numedges> <seed>'
        return 1

    # Collect command line arguments.
    nodefile = sys.argv[1]
    edgefile = sys.argv[2]
    numedges = int(sys.argv[3])
    seed = int(sys.argv[4])

    # Read in data files.
    nodes = None
    with open(nodefile) as f:
        nodes = json.loads(f.read())

    edges = None
    with open(edgefile) as f:
        edges = json.loads(f.read())

    # Seed the RNG.
    random.seed(seed)

    # Grab a population sample.
    sample = random.sample(range(len(edges)), numedges)

    # Extract the edge sample.
    edge_sample = [edges[i] for i in sample]

    # Compute the node closure of the edge sample.
    node_sample = {}
    for e in edge_sample:
        node_sample[e[0]] = nodes[e[0]]
        node_sample[e[1]] = nodes[e[1]]

    # Dump the data.
    print json.dumps({'nodes': node_sample, 'edges': edge_sample}, indent=2, separators=(',', ': '))

    return 0


if __name__ == '__main__':
    sys.exit(main())
