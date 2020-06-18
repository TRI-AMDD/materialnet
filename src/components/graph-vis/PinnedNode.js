import React from 'react';
import Store from '../../store';
import { observer } from 'mobx-react';
import { Chip } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import RotatedPin from './RotatedPin';
import { faFlask, faProjectDiagram } from '@fortawesome/free-solid-svg-icons';

@observer
class PinnedNode extends React.Component {
  static contextType = Store;
  render() {
    const store = this.context;
    const { node, includeNeighbors, defineSubspace } = this.props;

    const label = node.formula || node.name;

    const neighbors = (
      <Chip
        icon={<FontAwesomeIcon icon={faProjectDiagram} />}
        label={label}
        onClick={() => (store.selected = node)}
        onDelete={() => store.toggleIncludeNeighbors(node)}
      />
    );
    const subspace = (
      <Chip
        icon={<FontAwesomeIcon icon={faFlask} />}
        label={label}
        onClick={() => (store.selected = node)}
        onDelete={() => store.toggleDefineSubspace(node)}
      />
    );

    if (includeNeighbors && defineSubspace) {
      return (
        <>
          {neighbors} {subspace}
        </>
      );
    } else if (includeNeighbors) {
      return neighbors;
    } else if (defineSubspace) {
      return subspace;
    }
    return (
      <Chip
        icon={<RotatedPin />}
        label={label}
        onClick={() => (store.selected = node)}
        onDelete={() => store.removePinned(node)}
      />
    );
  }
}

export default PinnedNode;
