import React from 'react';
import Store from '../../store';
import { withStyles, Paper,IconButton, Typography } from '@material-ui/core';
import Structure from './structure';
import { grey } from '@material-ui/core/colors';
import { observer } from 'mobx-react';
import CloseIcon from '@material-ui/icons/Close';
import InfoBlock from './info-block';


const visStyles = theme => ({
  root: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: '1rem',
    minWidth: '15rem',
    zIndex: 9999,
    background: grey[100]
  }
})



@observer
class InfoPanel extends React.Component {
  static contextType = Store;

  onClear = () => this.context.clearSelection();

  render() {
    const store = this.context;
    const { classes } = this.props;
    const obj = store.selected;

    if (!obj) {
      return null;
    }
    const hypothetical = obj.discovery === null;
    return <Paper className={classes.root}>
      <IconButton style={{ float: 'right' }} onClick={this.onClear}><CloseIcon /></IconButton>

      <Typography gutterBottom variant="h4">{`${obj.name} (${hypothetical ? 'undiscovered' : obj.discovery})`}</Typography>

      {store.infoTemplate.groups.map((group) => <React.Fragment key={group.label}>
        <Typography gutterBottom variant="title">
        {group.label}
        </Typography>
        { group.fields.map((field) => obj[field.property] != null && <InfoBlock key={field.label} {...field} value={obj[field.property]} />) }
      </React.Fragment>)}

      <div style={{ width: '100%', height: '15rem' }}>
        <Structure cjson={store.structure} />
      </div>
    </Paper>;
  }
}

export default withStyles(visStyles)(InfoPanel);