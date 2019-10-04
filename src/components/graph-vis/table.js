import React from 'react';
import Store from '../../store';
import { observer } from 'mobx-react';
import LineUp, { LineUpStringColumnDesc, LineUpNumberColumnDesc } from 'lineupjsx';
import 'lineupjsx/build/LineUpJSx.css';
import './lineup.css';

@observer
class Table extends React.Component {
  static contextType = Store;

  onSelectionChanged = (selection) => {
    const store = this.context;
    store.selected = selection.length > 0 ? store.subGraphNodes[selection[0]] : null;
  };

  render() {
    const store = this.context;
    const selected = store.selected ? store.subGraphNodes.findIndex((d) => d.name === store.selected.name) : -1;

    return (<LineUp data={store.subGraphNodes}
      singleSelection defaultRanking
      deriveColors sidePanel={false} style={{ flexGrow: 1, lineHeight: 'normal' }}
      selection={selected >= 0 ? [selected] : undefined} onSelectionChanged={this.onSelectionChanged}
    >
      <LineUpStringColumnDesc column="name" />
      {store.propertyList.map((prop) => <LineUpNumberColumnDesc key={prop.label} column={prop.property} label={prop.label} domain={prop.domain} custom={{ numberFormat: prop.formatSpecifier }} />)}
    </LineUp>);
  }
}

export default Table;
