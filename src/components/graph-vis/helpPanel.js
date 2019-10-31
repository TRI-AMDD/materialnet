import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

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
  };

  const handleClose = event => {
    setAnchorEl(null);
    event.stopPropagation();
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
