import json
import sys
import xml.sax


class GraphMLHandler(xml.sax.ContentHandler):
    def __init__(self, debug=False):
        self.mode = None

        self.id = None
        self.x = None
        self.y = None

        self.buf = ""

        self.table = {}

        self.debug = debug

    def startElement(self, tag, attributes):
        if tag == "node":
            self.id = attributes["id"]

            if self.debug:
                print(f"encountered node {self.id}", file=sys.stderr)

        elif tag == "data" and attributes["key"] in ["x", "y"]:
            self.mode = attributes["key"]

            if self.debug:
                print(f"encountered data {self.mode}", file=sys.stderr)

    def characters(self, content):
        if self.mode in ["x", "y"]:
            self.buf += content

    def endElement(self, tag):
        if tag == "data" and self.mode is not None:
            value = float(self.buf)

            if self.mode == "x":
                self.x = value
            elif self.mode == "y":
                self.y = value

            self.mode = None
            self.buf = ""

        elif tag == "node":
            self.table[self.id] = {"x": self.x, "y": self.y}

def get_positions(filename):
    parser = xml.sax.make_parser()
    parser.setFeature(xml.sax.handler.feature_namespaces, 0)

    handler = GraphMLHandler()
    parser.setContentHandler(handler)

    parser.parse(filename)

    return handler.table


def compute_id_table(nodes):
    table = {}

    for key in nodes:
        table[key] = nodes[key]["formula"]

    return table


def compute_new_nodes(nodes, position):
    result = {}

    for key in nodes:
        node = nodes[key]

        formula = node["formula"]
        del node["formula"]

        node["x"] = position[key]["x"]
        node["y"] = position[key]["y"]

        result[formula] = node

    return result


def compute_new_edges(edges, ids):
    result = []

    for edge in edges:
        result.append([ids[edge[0]], ids[edge[1]]])

    return result


def main():
    gmlfile = sys.argv[1]

    print("extracting position data...", file=sys.stderr)
    position = get_positions(gmlfile)

    print("remapping IDs to formulae...", file=sys.stderr)
    data = json.loads(sys.stdin.read())
    ids = compute_id_table(data["nodes"])

    print("computing new nodes...", file=sys.stderr)
    new_nodes = compute_new_nodes(data["nodes"], position)

    print("computing new edges...", file=sys.stderr)
    new_edges = compute_new_edges(data["edges"], ids)

    print("dumping data to stdout...", file=sys.stderr)
    new_data = {"nodes": new_nodes, "edges": new_edges}
    print(json.dumps(new_data))

    return 0


if __name__ == "__main__":
    sys.exit(main())
