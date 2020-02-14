MaterialNet
===========

MaterialNet is a visual exploration tool to explore large networks in the
context of material science.

In the past five years, materials databases have become very popular because
they enable their users to do rapid prototyping by searching near globally for
figures of merit for their target application. However, both scientists and
engineers have little in the way of visualization of aggregates from these
databases, i.e. intuitive layouts that help understand which materials are
related and how they are related. The need for a tool that does this is
particularly crucial in materials science because properties like phase
stability and crystal structure similarity are themselves functions of a
material dataset, rather than of individual materials.

MaterialNet provides for this by enabling a simple layout of a given network of
materials. The examples in the current implementation are for the aforementioned
cases (i.e. visualization of the "complete" phase diagram of the OQMD and
similarity metrics from crystal structure), but the tool may be applied to any
case in which a materials network can be constructed.

The most obvious extensions of this that we envision are users with their own
database of formation energies which may differ from the OQMD. Similarly, any
vector representing material properties can be used to construct a similarity
network, a user might want to understand how the network of materials with
similar optical properties differs from that of materials with similar
mechanical properties.

Requirements
------------
* [Yarn](https://yarnpkg.com/lang/en/)

Setup
-----
1. Install the project dependencies:

    ```
    yarn install
    ```

2. Create sample data directory:

    ```
    mkdir public/sample-data
    ```
3. Unpackage sample data with your preferred tool. Example:

    ```
    tar -xf <SAMPLE_DATA>.tar.gz
    ```

    After this step, the `public/sample-data` directory should look something like this:

    ```
    stability.json
    cooccurrence-1k.json
    cooccurrence-500k.json
    structures/
    ```


Once these steps are completed, reloading the page in your browser should render the chosen sample dataset.



Interactions
------------

* Use the `mouse wheel` to zoom into the map
* Use `ctrl + mouse wheel` to change the node spacing factor
* `Clicking` on a node will select it, clicking on the same node again will deselect it
* `ctrl + click` on a node to select and pin it



Internal Notes
--------------


### How to add a managed property to the mobx state?

Every property of the ApplicationState class (see ./src/store/index.js) annotated with the `@observable` annotation will be automatically tracked. This can be a primitive value, array or object.

In addition, the components itself has to observe the injected store using the `@observer` annotation.

Example component with proper store injection:

```js
import React from 'react';
import Store from '../../store';
import { observer } from 'mobx-react';

// marks that the component should be rerendered as soon as an used observable property of the store has changed
@observer
class Template extends React.Component {
  // see https://reactjs.org/docs/context.html to inject the store into this component
  static contextType = Store;

  render() {
    // access the context as defined by the `contextType`
    const store = this.context;

    // just access or change the value
    return <div onClick={() => { store.year = 2005; }}>
      Hello {store.year}
    </div>;
  }
}

export default Template;
```

Besides regular properties, derived/computed properties are used. Just define a property with a getter function that uses other obserable properties. Annotate with `@computed` and mobx will cache and reevaluate the property when needed.


### What is autorun?

`autorun` is similar to registering an observer. The given function will be observed for changes and reevaluated when needed.

e.g.
```js
autorun(() => {
  console.log(store.year);
});
```

each time the `store.year` changes, a log statement will be created.
