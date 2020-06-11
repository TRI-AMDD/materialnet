import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbtack } from '@fortawesome/free-solid-svg-icons';

export default class RotatedPin extends React.Component {
  render() {
    return (
      <FontAwesomeIcon
        icon={faThumbtack}
        style={{ transform: `rotate(45deg)` }}
        {...this.props}
      />
    );
  }
}
