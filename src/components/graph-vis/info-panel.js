import { Component } from 'react';

class InfoPanel extends Component {
  render() {
    const {
      template
    } = this.props;

    return template(this.props);
  }
}

export default InfoPanel;
