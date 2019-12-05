---
title: 'MaterialNet: A web-based graph explorer for materials science data'
tags:
  - materials science
  - graph visualization
authors:
  - name: Muratahan Aykol
    affiliation: 1
  - name: Joseph Montoya
    affiliation: 1
  - name: Roni Choudhury
    affiliation: 2
affiliations:
  - name: Toyota Research Institute
    index: 1
  - name: Kitware Inc.
    index: 2
date: 5 December 2019
---

# Summary

Cutting-edge materials science research involves examining existing materials
and their known chemical properties and reactions in order to hypothesize and
predict new materials that can be discovered, synthesized, and manufactured for
commercial ends. Materials can be represented with a graph structure that has
*nodes* standing in for chemicals and materials, and *links* between them
encoding the appropriate chemical relationships of interest. Such a
graph-encoded dataset for a collection of materials can become rather large and
complex: the dataset used in this paper contains on the order of 20000
materials, with on the order of 200000 links between them. Large graphs of this
sort demand *visualization*, affording researchers the ability to interactively
explore the data.

**MaterialNet** is an open-source web application designed to explore such
connections between materials, while also displaying information about each
material, highlighting its immediate neighborhood within the graph, and offering
several auxiliary tools to help drill down into the details contained within the
dataset.

The following features implement an interactive graph visualization with a
pleasant, high-quality user experience:

1. **High-performance node-link diagram.** MaterialNet uses GeoJS, an
   open-source mapping library developed by Kitware, to provide a highly
   interactive, attractive rendering of a node-link diagram representing the
   graph. Nodes in the graph are displayed with a color, encoding a data value
   carried on it (such as its year of discovery, or its formation energy), and
   with a specific size, encoding some other data value (such as its degree of
   connectivity within the graph). Layout software such as Gephi provides an
   initial configuration of the nodes in the graph, and features of MaterialNet
   itself allow for a dynamic, force-based layout as well (see :TODO:).
2. **Interactive exploration.** The GeoJS node-link diagram is equipped with
   standard mouse gestures to enable interactive exploration: for example, by
   clicking on a node, that material's data appears in a panel on-screen, and
   its one-hop neighborhood is highlighted in the graph view. Such nodes may
   also be "pinned," leaving them visible in a list while other actions are
   performed. They can also be made part of a chemical subspace, which selects
   out all materials containing one of several chemical elements. Additionally,
   MaterialNet can dynamically reconfigure the layout of these _subgraphs_,
   using a force-based simulation to bring related nodes closer together.
3. **Material searching and filtering.** MaterialNet includes a simple search
   bar that can be used to find materials by their chemical makeup. Once a
   material of interest is found, it can be "pinned" to keep it in a special,
   persistent group of materials, allowing for exploration of its own graph
   neighborhood, of the materials spanned by its chemical subspace, or of
   materials found via fresh searches. MaterialNet also allows for filtering the
   available materials by setting ranges on data values such as formation
   energy. These methods enable the researcher to winnow out unrelated materials
   while building up a specific group of interest, allowing for a focus on the
   smaller subgraph spanned by those interesting materials only.
4. **Detailed view of materials data.** When focusing on a single material,
   MaterialNet displays its associated data in an on-screen table, along with an
   interactive 3D view of its crystal structure (using Kitware's VTK.js
   toolkit), and outgoing links to external materials databases such as the
   OQMD.
4. **Powerful table view.** MaterialNet incorporates LineUp, an open-source
   tabular data visualization system developed in a collaboration between
   Kitware and Harvard University. LineUp displays all of the materials in the
   currently selected subgraph, and allows for interactive sorting of those
   materials using custom weighting functions. LineUp also allows the researcher
   to select materials directly from its table view, focusing them in the graph
   view. Combining the two visualization modes and linking them in this way
   enables the researcher to use different modes of analysis to find what they
   are looking for.
5. **Embedded help.** MaterialNet also includes prominent documentation
   activated by question mark icons situated throughout the interface. Any new
   user can quickly learn the system simply by trying to use it, and reading
   these embedded help panels as they do so.
