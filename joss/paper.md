---
title: 'MaterialNet: A web-based graph explorer for materials science data'
tags:
  - materials science
  - graph visualization
authors:
  - name: Roni Choudhury
    affiliation: 1
  - name: Muratahan Aykol
    affiliation: 2
  - name: Samuel Gratzl
    affiliation: 1
  - name: Joseph Montoya
    affiliation: 2
  - name: Jens Hummelshøj
    affiliation: 2
affiliations:
  - name: Kitware Inc.
    index: 1
  - name: Toyota Research Institute
    index: 2
date: 5 December 2019
bibliography: paper.bib

---

# Summary

Materials science research deals primarily with understanding the relationship
between the structure and properties of materials. With recent advances in
computational power and automation of simulation techniques, material structure
and property databases have emerged [@Jain2013, @Kirklin2015, @Curtarolo2012],
allowing a more "data-driven" approach to carrying out materials research.
Recent studies demonstrated that representation of these databases in the form
of material networks can enable extraction of new materials knowledge
[@Hegde2018, @Isayev2015] or help tackle challenges like predictive synthesis
[@Aykol2019a], which would need to relational information between materials. In
these new approaches, materials can be represented  with a graph structure that
has *nodes* standing in materials, and *links* between them encoding the
appropriate relationships of interest, such as thermodynamic co-existence,
chemical similarity or co-occurence in text, to name a few.

**MaterialNet** is an open-source web application designed to explore the
topology of such connected material datasets, while also displaying information
about each material, highlighting its immediate neighborhood within the graph,
and offering several auxiliary tools to help drill down into the details
contained within the dataset. Such graph-encoded dataset for a collection of
materials can become large and complex; for example, the materials stability
network exemplified in this paper contains on the order of 20,000 materials,
with on the order of 200,000 links between them.[@Aykol2019a] Large graphs of
this sort demand *visualization*, affording materials researchers the ability to
interactively explore the data, a key user requirement highlighted by field
experts [@Aykol2019b].  To the best of our knowledge, there exist no other
interactive visualization tool for materials networks.  MaterialNet can provide
its users with interactive "maps" of the materials space exposed in large
material databases, and in turn help researchers navigate this space with a
particular research task in mind, as showcased in **Figure 1**. A live
deployment of MaterialNet can be accessed at
[http://matr.io/materialnet](https://arclamp.github.io/materialnet/?ds=Precise).

![**MaterialNet displaying the local network environment of a target material**
Main material selected, namely LiOsO<sub>2</sub> is a hypothetical one (i.e. a
computational discovery) and is hence labeled undiscovered. A well-known
material, namely Li<sub>2</sub>O, that exists in the vicinity of this target
material is also added to the displayed subgraph. Node sizes represent the node
degree (i.e. the number of tie-lines) for each material.](fig1.png)

In MaterialNet, we use [GeoJS](https://opengeoscience.github.io/geojs/), an
open-source mapping library developed by Kitware, to provide a highly
interactive, attractive rendering of a node-link diagram representing the graph.
Nodes in the graph are displayed with a color, encoding a data value carried on
it (such as its year of discovery, or its formation energy), and with a specific
size, encoding some other data value (such as its degree of connectivity within
the graph). Layout software such as Gephi provides an initial configuration of
the nodes in the graph, and features of MaterialNet itself allow for a dynamic,
force-based layout as well (see :TODO:). The GeoJS node-link diagram is equipped
with standard mouse gestures to enable interactive exploration: for example, by
clicking on a node, that material's data appears in a panel on-screen, and its
one-hop neighborhood is highlighted in the graph view. Such nodes may also be
"pinned," leaving them visible in a list while other actions are performed. They
can also be made part of a chemical subspace, which selects out all materials
containing one of several chemical elements. Additionally, MaterialNet can
dynamically reconfigure the layout of these _subgraphs_, using a force-based
simulation to bring related nodes closer together.

Effective, contextual search and filtering of materials (e.g. by using chemical
formulas, constraining to chemical spaces, filtering based on material
properties, historical material data etc.) are essential for this visualization
tool to be useful for the researchers.  For this purpose, MaterialNet includes a
simple search bar that can be used to find materials by their chemical makeup.
Once a material of interest is found, it can be "pinned" to keep it in a
special, persistent group of materials, allowing for exploration of its own
graph neighborhood, of the materials spanned by its chemical subspace, or of
materials found via fresh searches. MaterialNet also allows for filtering the
available materials by setting ranges on data values such as formation energy.
These methods enable the researcher to winnow out unrelated materials while
building up a specific group of interest, allowing for a focus on the smaller
subgraph spanned by those interesting materials only.

While interacting with the network, user may often want to access a detailed
view of data for specific materials. When focusing on a single material,
MaterialNet displays its associated data in an on-screen table, along with an
interactive 3D view of its crystal structure (using Kitware's
[VTK.js](https://github.com/Kitware/vtk-js) toolkit), and outgoing links to
external materials databases such as the [OQMD](http://oqmd.org).

MaterialNet incorporates [LineUp](https://github.com/lineupjs), an open-source
tabular data visualization system developed in a collaboration between Kitware
and Harvard University. LineUp displays all of the materials in the currently
selected subgraph, and allows for interactive sorting of those materials using
custom weighting functions. This tabulation system also allows the researcher to
select materials directly from its table view, focusing them in the graph view.
Combining the two visualization modes and linking them in this way enables the
researcher to use different modes of analysis to find what they are looking for.
MaterialNet also includes prominent documentation activated by question mark
icons situated throughout the interface. Any new user can quickly learn the
system simply by trying to use it, and reading these embedded help panels as
they do so.

In its current deployment at
[http://matr.io/materialnet](https://arclamp.github.io/materialnet/?ds=Precise),
MaterialNet provides an interactive map for the  materials stability network
([@Aykol2019a]) and a text co-occurrence network extracted from
[MatScholar](http://www.matscholar.com), and the tool can be easily extended to
display any other network of materials.

# References
