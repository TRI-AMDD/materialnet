import json
import sys


def compute_id_table(nodes):
    table = {}

    for key in nodes:
        table[key] = nodes[key]["formula"]

    return table


def compute_new_nodes(nodes):
    result = {}

    for key in nodes:
        node = nodes[key]

        formula = node["formula"]
        del node["formula"]

        result[formula] = node

    return result


def compute_new_edges(edges, ids):
    result = []

    for edge in edges:
        result.append([ids[edge[0]], ids[edge[1]]])

    return result


def main():
    data = json.loads(sys.stdin.read())

    ids = compute_id_table(data["nodes"])

    new_nodes = compute_new_nodes(data["nodes"])
    new_edges = compute_new_edges(data["edges"], ids)

    new_data = {"nodes": new_nodes, "edges": new_edges}
    print(json.dumps(new_data))

    return 0


if __name__ == "__main__":
    sys.exit(main())
