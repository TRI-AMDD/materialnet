import React from 'react';
import Store from '../../store';
import { observer } from 'mobx-react';
import { Chip } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import RotatedPin from './RotatedPin';
import { faFilter } from '@fortawesome/free-solid-svg-icons';

@observer
class PinnedNode extends React.Component {
    static contextType = Store;
    render() {
        const store = this.context;
        const { node, includeNeighbors, defineSubspace } = this.props;
        const label = node.label;
        // icon = {
        //     (includeNeighbors ? <RotatedPin /> : (defineSubspace ? <FontAwesomeIcon icon={faFilter} /> : null));
        return <Chip label={label} onClick={() => store.selected = node} onDelete={() => store.removePinned(node)} />;
    }
}

export default PinnedNode;