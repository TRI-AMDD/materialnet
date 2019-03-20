import json
import sys


def main():
    if len(sys.argv) < 2:
        print >>sys.stderr, 'usage: json2gephi.py <jsonfile>'

    jsonfile = sys.argv[1]

    with open(jsonfile) as f:
        data = json.loads(f.read())

    for edge in data['edges']:
        print '{},{}'.format(*edge)

    return 0


if __name__ == '__main__':
    sys.exit(main())
