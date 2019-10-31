import React from 'react';

import {
  Checkbox,
  IconButton,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Typography,
  withStyles
} from '@material-ui/core';

import { ExpandMore } from '@material-ui/icons';

import Grid from '../controls/grid';
import { ReactSelectSearchWrapper} from '../controls/reactselect';
import SliderControl from '../controls/slider';
import SelectControl from '../controls/select';
import CheckboxControl from '../controls/checkbox';
import Filters from './filters';
import Store from '../../store';
import { observer } from 'mobx-react';
import { deburr } from 'lodash-es';
import Layouts from './layouts';
import PinnedNode from './PinnedNode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import RotatedPin from './RotatedPin';
import { faProjectDiagram, faFlask } from '@fortawesome/free-solid-svg-icons';
import {
  HelpPanel,
  ZoomHelp,
  SpacingHelp,
} from './helpPanel';

function simplify(label) {
  // simplify the label for better values
  return deburr(label).replace(/[ ,.<>/|\\[]{}-_=+()*&^%$#@!~\t\n\r]+/gm, '');
}

function toOption(v) {
  const label = v.label;
  const value = v.value || simplify(label);
  return { label, value };
}

const visStyles = theme => ({
  denseCheckbox: {
    padding: 0,
    '& .MuiCheckbox-root': {
      padding: '0 9px'
    }
  }
});

@observer
class Controls extends React.Component {
  static contextType = Store;

  filterSearchOption = ({ value }, rawInput) => {
    rawInput = rawInput.trim();
    value = value.trim();
    if (!rawInput) {
      return false;
    }
    return value.includes(rawInput);
  }

  renderOptionButtons = ({ node }) => {
    const store = this.context;
    return <>
      <IconButton onClick={() => store.togglePinned(node)} title={store.isPinned(node) ? 'UnPin Selection' : 'Pin Selection'} size="small" color={store.isPinned(node) ? 'primary' : 'default'}>
        <RotatedPin />
      </IconButton>
      <IconButton onClick={() => store.toggleIncludeNeighbors(node)} title={store.isIncludeNeighborsPinned(node) ? 'Hide Neighbors' : 'Show Neighbors'} size="small" color={store.isIncludeNeighborsPinned(node) ? 'primary' : 'default'}>
        <FontAwesomeIcon icon={faProjectDiagram} />
      </IconButton>
      <IconButton onClick={() => store.toggleDefineSubspace(node)} title={store.isDefineSubspacePinned(node) ? 'Release Subspace Restriction' : 'Restrict Subspace'} size="small" color={store.isDefineSubspacePinned(node) ? 'primary' : 'default'}>
        <FontAwesomeIcon icon={faFlask} />
      </IconButton>
    </>;
  }

  render() {
    const store = this.context;
    const { classes } = this.props;
    return (
      <Grid>
        {store.datasets.length > 1 && <SelectControl
          value={toOption(store.dataset).value}
          options={store.datasets.map(toOption)}
          label={'Dataset'}
          onChange={(val) => { store.dataset = store.datasets.find((d) => toOption(d).value === val); }}
        />}
        <ReactSelectSearchWrapper
          label={'Search'}
          options={store.searchOptions}
          optionButtons={this.renderOptionButtons}
          value={store.search ? {label: store.search, value: store.search} : null}
          isSearchable
          placeholder="Search (e.g. NaCl)"
          isClearable
          maxItems={20}
          onChange={(val) => store.search = val ? val.value : null}
        />

        <div>
          {store.pinnedNodes.map((node) => (<PinnedNode key={node.node.name} {...node} />))}
        </div>

        <ExpansionPanel expanded={store.drawerExpanded.options} onChange={(_, isExpanded) => { store.drawerExpanded.options = isExpanded }}>
          <ExpansionPanelSummary expandIcon={<ExpandMore />}>
            <Typography>
              <HelpPanel name='options-help'>
                <p>Hello</p>
              </HelpPanel>&nbsp;
              Options
            </Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Grid>
              <SliderControl
                value={store.zoom}
                range={store.zoomRange}
                label={<ZoomHelp />}
                onChange={(val) => { store.zoom = val; }}
              />
              <SliderControl
                value={store.spacing}
                range={store.spacingRange}
                step={0.1}
                label={<SpacingHelp />}
                onChange={(val) => { store.spacing = val; }}
              />
              <SliderControl
                value={store.opacity}
                range={[0, 0.1]}
                step={0.001}
                label={'Link opacity / display'}
                disabled={!store.showLinks}
                onChange={(val) => { store.opacity = val; }}
              >
                <Checkbox checked={store.showLinks} onChange={(_e, val) => { store.showLinks = val; }} />
              </SliderControl>
              {store.templates.length > 1 && <SelectControl
                value={toOption(store.template).value}
                options={store.templates.map(toOption)}
                label={'Template'}
                onChange={(val) => { store.template = store.templates.find((d) => toOption(d).value === val); }}
              />}
              <SelectControl
                value={toOption(store.size).value}
                options={store.sizes.map(toOption)}
                label={'Node size'}
                onChange={(val) => {
                  store.size = store.sizes.find((d) => toOption(d).value === val);
                }}
              />
              <SelectControl
                value={toOption(store.color).value}
                options={store.colors.map(toOption)}
                label={'Node color'}
                onChange={(val) => { store.color = store.colors.find((d) => toOption(d).value === val); }}
              />
              { /* dataset specific */}
              {store.yearRange && <SliderControl
                value={store.colorYear}
                range={store.yearRange}
                step={1}
                label={'Color year'}
                digits={0}
                disabled={!store.color || store.color.label !== 'Discovered/Undiscovered'}
                onChange={(val) => { store.colorYear = val; }}
              />}
              <CheckboxControl
                className={classes.denseCheckbox}
                label="Show Sub Graph Only"
                value={store.showSubGraphOnly}
                onChange={(val) => { store.showSubGraphOnly = val; }}
              />
              <CheckboxControl
                className={classes.denseCheckbox}
                label="Auto Include Neigbhors of Selected"
                value={store.autoIncludeNeighorsForSelection}
                onChange={(val) => { store.autoIncludeNeighorsForSelection = val; }}
              />
              <CheckboxControl
                className={classes.denseCheckbox}
                label="Show Legend"
                value={store.showLegend}
                onChange={(val) => { store.showLegend = val; }}
              />
              <CheckboxControl
                className={classes.denseCheckbox}
                label="Show Table"
                value={store.showTable}
                onChange={(val) => { store.showTable = val; }}
              />
              <CheckboxControl
                className={classes.denseCheckbox}
                label="Night mode"
                value={store.nightMode}
                onChange={(val) => { store.nightMode = val; }}
                />
            </Grid>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel expanded={store.drawerExpanded.filter} onChange={(_, isExpanded) => { store.drawerExpanded.filter = isExpanded }}>
          <ExpansionPanelSummary expandIcon={<ExpandMore />}>
            <Typography>Filtering</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Filters />
          </ExpansionPanelDetails>
        </ExpansionPanel>

        <ExpansionPanel expanded={store.drawerExpanded.layouts} onChange={(_, isExpanded) => { store.drawerExpanded.layouts = isExpanded }}>
          <ExpansionPanelSummary expandIcon={<ExpandMore />}>
            <Typography>Layout</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Layouts />
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </Grid>
    );
  }
}

export default withStyles(visStyles)(Controls);
