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
and property databases have emerged [@Jain2013; @Kirklin2015; @Curtarolo2012],
allowing a more data-driven approach to carrying out materials research. Recent
studies have demonstrated that representing these databases as material networks
can enable extraction of new materials knowledge [@Hegde2018; @Isayev2015] or
help tackle challenges like predictive synthesis [@Aykol2019a], which require
relational information between materials. Materials databases have become very
popular because they enable their users to do rapid prototyping by searching
near globally for figures of merit for their target application. However, both
scientists and engineers have little in the way of visualization of aggregates
from these databases, that is, intuitive layouts that help understand which
materials are related and how they are related. The need for a tool that does
this is particularly crucial in materials science because properties like phase
stability and crystal structure similarity are themselves functions of a
material dataset, rather than of individual materials.

In these new approaches, materials can be represented with a graph structure
that has *nodes* standing in for materials, and *links* between them encoding
the appropriate relationships of interest, such as thermodynamic co-existence,
chemical similarity or co-occurrence in text, to name a few. **MaterialNet** is
an open-source web application designed to explore the topology of such material
networks, while also displaying information about each material, highlighting
its immediate neighborhood within the graph, and offering several auxiliary
tools to help drill down into the details contained within the dataset. Such
graph-encoded datasets for a collection of materials can become large and
complex: for example, the materials stability network exemplified in this paper
contains on the order of 20,000 materials, with on the order of 200,000 links
between them [@Aykol2019a]. Large graphs of this sort demand *interactive
visualization*, empowering materials researchers to explore the data, a key user
requirement highlighted by field experts [@Aykol2019b].  To the best of our
knowledge, there exists no other interactive visualization tool for materials
networks.  MaterialNet provides interactive "maps" of the materials space
exposed in large material databases, helping researchers navigate this space
with a particular research task in mind, as showcased in
<span>Figure&nbsp;1</span>. A live deployment of MaterialNet can be accessed at
http://maps.matr.io/.

![**MaterialNet displaying the local network environment of a target material.**
The main material selected, LiOsO<sub>3</sub>, is hypothetical (i.e., a
computational discovery) and is therefore labeled "undiscovered". A well-known
material, Li<sub>2</sub>O, that exists in the vicinity of this target
material is also added to the displayed subgraph. Node sizes represent the node
degree (i.e. the number of links) for each material.](fig1.png)

# User Interface Features and Architecture

## Interactive Node-Link Diagram

MaterialNet uses [GeoJS](https://opengeoscience.github.io/geojs/) [@geojs], an
open-source mapping library developed by Kitware, to provide a highly
interactive, attractive rendering of a node-link diagram representing the graph.
Nodes in the graph are displayed with a color, encoding a data value carried on
it (e.g. year of discovery, formation energy), and with a specific
size, encoding some other data value (e.g. degree of connectivity within
the graph). Layout software such as Gephi provides an initial configuration of
the nodes in the graph, and MaterialNet has its own dynamic,
force-based layout mode as well. The GeoJS node-link diagram is equipped
with standard mouse gestures to enable interactive exploration: for example, by
clicking on a node, that material's data appears in a panel on-screen, and its
one-hop neighborhood is highlighted in the graph view. Such nodes may also be
"pinned", leaving them visible in a list while other actions are performed. They
can also be made part of a chemical subspace, which selects all materials
containing one of several chemical elements. Additionally, MaterialNet can
dynamically reconfigure the layout of these subgraphs, using a force-based
simulation to bring related nodes closer together, providing a more organic
sense of continuity and structure.

## Searching, Filtering, and Chemical Subspaces

Effective, contextual search and filtering of materials (e.g. by using chemical
formulas, constraining to chemical spaces, filtering based on material
properties, historical material data) are essential for this visualization
tool to be useful for the researchers.  For this purpose, MaterialNet includes a
simple search bar that can be used to find materials by their chemical makeup.
Once a material of interest is found, it can be "pinned" to keep it in a
special, persistent group of materials, allowing for exploration of its
graph neighborhood, of the materials spanned by its chemical subspace, or of
materials found via fresh searches. MaterialNet allows filtering the
available materials by setting ranges on data values such as formation energy.
These methods enable the researcher to winnow out unrelated materials while
building up a specific group of interest, allowing for a focus on the smaller
subgraph spanned by those interesting materials only.

## Chemical Detail Display

While interacting with the network, the user may often want to access a detailed
view of data for specific materials. When focusing on a single material,
MaterialNet displays its associated data in a table, along with an
interactive 3D view of its crystal structure (using Kitware's
[VTK.js](https://github.com/Kitware/vtk-js) toolkit [@vtkjs]), and hyperlinks to
external materials databases such as the [OQMD](http://oqmd.org).

## Tabular Data View with LineUp

MaterialNet incorporates [LineUp](https://github.com/lineupjs) [@Gratzl2013], an open-source
tabular data visualization system developed in a collaboration between Kitware
and Harvard University. LineUp displays all of the materials in the currently
selected subgraph and allows interactive sorting of those materials using
custom weighting functions. This tabulation system also allows the researcher to
select materials directly from its table view, focusing them in the graph view.
Combining the two visualization modes and linking them in this way enables
researchers to use different modes of analysis to find what they are looking for.
MaterialNet also includes prominent documentation activated by question mark
icons situated throughout the interface. Any new user can quickly learn the
system simply by trying to use it, reading these embedded help panels as
they do so.

# Future Work

In the future, we aim to explore several directions to increase the reach and
value of MaterialNet:

- MaterialNet has been architected to support different types of data.
  The current deployment at http://maps.matr.io/ includes the materials
  stability network [@Aykol2019a], a text co-occurrence network extracted from
  [MatScholar](http://www.matscholar.com) [@weston2019; @tshitoyan2019], and a
  materials similarity network [@ward2017],
  but the tool can be easily extended to display any other type of material
  network as well.
- A more powerful and flexible search mode, featuring a domain-specific
  language tailored to searching materials databases, will extend the
  researcher's ability to find materials with very specific properties or
  ranges of properties.
- New visualization modes (e.g., related to the behavior of materials in a chemical
  subspace) and integrations with existing visualization modes and tools will
  provide researchers with a choice of powerful ways to view the data, or
  subsets of it.

# References
