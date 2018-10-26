import json
import sys


def chunks(l, n):
    for i in range(0, len(l), n):
        yield l[i:i + n]


def empty_bb():
    return {'left': sys.float_info.max,
            'right': -sys.float_info.max,
            'bottom': -sys.float_info.max,
            'top': sys.float_info.max}


def main():
    # Error if not enough arguments.
    if len(sys.argv) != 2:
        print >>sys.stderr, 'usage: yearzones.py <datafile>'
        return 1

    # Read in data.
    # posfile = sys.argv[1]
    # with open(posfile) as f:
        # posdata = json.loads(f.read())

    datafile = sys.argv[1]
    with open(datafile) as f:
        nodedata = json.loads(f.read())

    # Compute bounding boxes for each 5-year period in the data.
    bb = {}
    global_bb = empty_bb()
    for name, data in nodedata.iteritems():
        # name = d['name']
        # rec = data[name]

        year = data['discovery']
        if year is None:
            year = 0

        zone = (year / 5) * 5

        if zone not in bb:
            bb[zone] = empty_bb()

        # Increment the zone bounding box.
        if data['x'] < bb[zone]['left']:
            bb[zone]['left'] = data['x']

        if data['x'] > bb[zone]['right']:
            bb[zone]['right'] = data['x']

        if data['y'] > bb[zone]['bottom']:
            bb[zone]['bottom'] = data['y']

        if data['y'] < bb[zone]['top']:
            bb[zone]['top'] = data['y']

        # Increment the global bounding box.
        if data['x'] < global_bb['left']:
            global_bb['left'] = data['x']

        if data['x'] > global_bb['right']:
            global_bb['right'] = data['x']

        if data['y'] > global_bb['bottom']:
            global_bb['bottom'] = data['y']

        if data['y'] < global_bb['top']:
            global_bb['top'] = data['y']

    # Sweep through the bounding boxes and generate offsets for each one, based
    # on a (0, 0) origin.
    y_offset = 0
    for row in chunks(sorted(bb.keys()), 5):
        x_offset = 0
        tallest = 0

        for zone in row:
            bb[zone]['x'] = x_offset
            bb[zone]['y'] = y_offset

            height = bb[zone]['bottom'] - bb[zone]['top']
            tallest = height if height > tallest else tallest

            x_offset += bb[zone]['right'] - bb[zone]['left'] + 10

        y_offset += tallest + 10

    print >>sys.stderr, json.dumps(bb, indent=2)
    print >>sys.stderr, json.dumps(global_bb, indent=2)

    # Finally, run through all the position data and adjust the coordinates
    # based on its zone offsets from the upper left corner of the global
    # bounding box.
    for name, data in nodedata.iteritems():
        year = data['discovery']
        if year is None:
            year = 0

        zone = (year / 5) * 5

        vector = {'x': data['x'] - global_bb['left'],
                  'y': data['y'] - global_bb['top']}

        data['x'] = bb[zone]['x'] + vector['x']
        data['y'] = bb[zone]['y'] + vector['y']

    print json.dumps(nodedata)

    return 0


if __name__ == '__main__':
    sys.exit(main())
