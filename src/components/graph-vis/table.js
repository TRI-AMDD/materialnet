import React from 'react';
import Store from '../../store';
import { observer } from 'mobx-react';
import LineUp, { LineUpStringColumnDesc, LineUpNumberColumnDesc } from 'lineupjsx';
import 'lineupjsx/build/LineUpJSx.css';

@observer
class Table extends React.Component {
  static contextType = Store;

  onSelectionChanged = (selection) => {
    const store = this.context;
    store.selected = selection.length > 0 ? store.subGraphNodeObjects[selection[0]] : null;
  };
  
  render() {
    const store = this.context;
    return (<LineUp data={store.subGraphNodeObjects}
      singleSelection
      defaultRanking deriveColors sidePanel={false} style={{ flexGrow: 1, lineHeight: 'normal' }}
      selection={store.selected ? store.subGraphNodeObjects.indexOf(store.selected) : null} onSelectionChanged={this.onSelectionChanged}
    >
      <LineUpStringColumnDesc column="name" />
      {store.propertyList.map((prop) => <LineUpNumberColumnDesc key={prop.label} column={prop.property} label={prop.label} domain={prop.domain} custom={{numberFormat: '.3f'}}/>)}
    </LineUp>);
  }
}

export default Table;