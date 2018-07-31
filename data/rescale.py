import json
import sys


def main():
    data = json.loads(sys.stdin.read())

    # Remove the mean from the locations.
    mean_x = sum(map(lambda d: d['x'], data)) / len(data)
    mean_y = sum(map(lambda d: d['y'], data)) / len(data)

    for d in data:
        d['x'] -= mean_x
        d['y'] -= mean_y

    print json.dumps(data)

    return 0


if __name__ == '__main__':
    sys.exit(main())
