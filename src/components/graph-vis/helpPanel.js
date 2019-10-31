import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle, faFlask } from '@fortawesome/free-solid-svg-icons';

const useStyles = makeStyles(theme => ({
  typography: {
    padding: theme.spacing(1),
  }
}));

export function HelpPanel({name, children}) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
    event.stopPropagation();
    event.preventDefault();
  };

  const handleClose = event => {
    setAnchorEl(null);
    event.stopPropagation();
    event.preventDefault();
  };

  const open = Boolean(anchorEl);
  const id = open ? name : undefined;

  return (
    <>
      <FontAwesomeIcon
        icon={faQuestionCircle}
        onClick={handleClick}
      />
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClick={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}>
          <Typography className={classes.typography}>
            {children}
          </Typography>
      </Popover>
    </>
  );
}

export function HelpPanelLabel({name, label, children}) {
  return (
    <span>
      {label}
      &nbsp;
      <HelpPanel
        name={name}
        children={children}
      />
    </span>
  );
}

export function SearchHelp() {
  return (
    <HelpPanelLabel name='search-help' label='Search'>
      <p></p>
    </HelpPanelLabel>
  );
}

export function OptionsHelp() {
  return (
    <HelpPanelLabel name='options-help' label='Options'>
      <p></p>
    </HelpPanelLabel>
  );
}

export function SpacingHelp() {
  return (
    <HelpPanelLabel name='spacing-help' label='Node spacing'>
      <p>Spaaaace!</p>
    </HelpPanelLabel>
  );
}

export function TemplateHelp() {
  return (
    <HelpPanelLabel name='template-help' label='Template'>
      <p></p>
    </HelpPanelLabel>
  );
}

export function ColorYearHelp() {
  return (
    <HelpPanelLabel name='color-year-help' label='Color year'>
      <p></p>
    </HelpPanelLabel>
  );
}

export function SubgraphOnlyHelp() {
  return (
    <HelpPanelLabel name='subgraph-only-help' label='Show Sub Graph Only'>
      <p>Heya</p>
    </HelpPanelLabel>
  );
}

export function AutoNeighborsHelp() {
  return (
    <HelpPanelLabel name='auto-neighbors-help' label='Auto Include Neighbors of Selected'>
      <p></p>
    </HelpPanelLabel>
  );
}

export function TableHelp() {
  return (
    <HelpPanelLabel name='table-help' label='Show Table'>
      <p></p>
    </HelpPanelLabel>
  );
}

export function FilteringHelp() {
  return (
    <HelpPanelLabel name='filtering-help' label='Filtering'>
      <p></p>
    </HelpPanelLabel>
  );
}

export function ElementsHelp() {
  return (
    <HelpPanelLabel name='elements-help' label={<><FontAwesomeIcon icon={faFlask} /> Elements</>}>
      <p></p>
    </HelpPanelLabel>
  );
}

export function LayoutHelp() {
  return (
    <HelpPanelLabel name='layout-help' label={'Layout'}>
      <p></p>
    </HelpPanelLabel>
  );
}

export function StartLayoutHelp() {
  return (
    <HelpPanelLabel name='start-layout-help' label='Start Layout'>
      <p></p>
    </HelpPanelLabel>
  );
}

export function ResetLayoutHelp() {
  return (
    <HelpPanelLabel name='reset-layout-help' label='Reset Layout'>
      <p></p>
    </HelpPanelLabel>
  );
}

export function AbortLayoutHelp() {
  return (
    <HelpPanelLabel name='abort-layout-help' label='Abort Layout'>
      <p></p>
    </HelpPanelLabel>
  );
}
