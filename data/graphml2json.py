import networkx
import json
import sys


def main():
    if len(sys.argv) < 3:
        print >>sys.stderr, 'usage: graphml2data.py <datafile> <graphmlfile>'
        return 1

    datafile = sys.argv[1]
    graphmlfile = sys.argv[2]

    # Read in the datafile.
    with open(datafile) as f:
        data = json.loads(f.read())

    # Read in the GraphML file.
    g = networkx.read_graphml(graphmlfile)

    # Transplant the GraphML location data into the data file.
    for mat in data['nodes'].keys():
        data['nodes'][mat]['x'] = g.node[mat]['x']
        data['nodes'][mat]['y'] = g.node[mat]['y']

    # Print the modified data out on stdout.
    print json.dumps(data, indent=2, separators=(',', ': '))

    return 0


if __name__ == '__main__':
    sys.exit(main())
