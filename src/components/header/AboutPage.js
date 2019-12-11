import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

const useStyles = makeStyles(theme => ({
  form: {
    display: 'flex',
    flexDirection: 'column',
    margin: 'auto',
    width: 'fit-content',
  },
  formControl: {
    marginTop: theme.spacing(2),
    minWidth: 120,
  },
  formControlLabel: {
    marginTop: theme.spacing(1),
  },
}));

export default function AboutPage() {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [fullWidth, setFullWidth] = React.useState(true);
  const [maxWidth, setMaxWidth] = React.useState('sm');

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleMaxWidthChange = event => {
    setMaxWidth(event.target.value);
  };

  const handleFullWidthChange = event => {
    setFullWidth(event.target.checked);
  };

  return (
    <>
      <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        About
      </Button>
      <Dialog
        fullWidth={true}
        maxWidth={"md"}
        open={open}
        onClose={handleClose}
        aria-labelledby="max-width-dialog-title"
      >
        <DialogTitle id="max-width-dialog-title">About MaterialNet</DialogTitle>

        <DialogContent>
          <DialogContentText>

            <p>
              MaterialNet is an open-source web application for loading,
              visualizing, and exploring the relationships between entities in a
              materials database. To get started, try interacting with the map
              of materials in the main display, and see what the controls in the
              left panel do. Help is available throughout the application via
              the <FontAwesomeIcon icon={faQuestionCircle} /> icons.
            </p>

            <p>
              MaterialNet is released under the <a
              href="https://www.apache.org/licenses/LICENSE-2.0.txt">Apache
              License 2.0</a>, and the <a
              href="https://github.com/arclamp/materialnet">source code</a> is
              available for free on GitHub. If you run into trouble with the
              software, you can <a href="">file an issue</a> or <a href="">open
              a pull request</a>.
            </p>

            <p>
              MaterialNet is a research collaboration between the <a
              href="https://www.tri.global/">Toyota Research Institute</a> and <a
              href="https://www.kitware.com/">Kitware Inc.</a> We are
              committed to open science and the open source software that
              supports it. If you feel we can help you solve your problems,
              please do not hesitate to contact us.
            </p>

          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>

      </Dialog>
    </>
  );
}
