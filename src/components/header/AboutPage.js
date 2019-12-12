import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

export default function AboutPage() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
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
            MaterialNet is an open-source web application for loading,
            visualizing, and exploring the relationships between entities in a
            materials database. To get started, try interacting with the map
            of materials in the main display, and see what the controls in the
            left panel do. Help is available throughout the application via
            the <FontAwesomeIcon icon={faQuestionCircle} /> icons.
          </DialogContentText>

          <DialogContentText>
            In its current deployment, MaterialNet provides an interactive map
            for the materials stability network (<a
            href="https://doi.org/10.1038/s41467-019-10030-5" target="_blank"
            rel="noopener noreferrer">Aykol et al. in Nat. Comm. 2019</a>) and
            a text co-occurrence network network extracted from <a
            href="http://www.matscholar.com" target="_blank" rel="noopener noreferrer">MatScholar</a>.
          </DialogContentText>

          <DialogContentText>
            MaterialNet is released under the <a
            href="https://www.apache.org/licenses/LICENSE-2.0.txt"
            target="_blank" rel="noopener noreferrer">Apache License 2.0</a>,
            and the <a href="https://github.com/arclamp/materialnet"
            target="_blank" rel="noopener noreferrer">source code</a> is
            available for free on GitHub. If you run into trouble with the
            software, you can <a
            href="https://github.com/arclamp/materialnet/issues"
            target="_blank" rel="noopener noreferrer">file an issue</a> or <a
            href="https://github.com/arclamp/materialnet/pulls"
            target="_blank" rel="noopener noreferrer">open a pull request</a>.
          </DialogContentText>

          <DialogContentText>
            MaterialNet is a research collaboration between the <a
            href="https://www.tri.global/" target="_blank"
            rel="noopener noreferrer">Toyota Research Institute</a> and <a href="https://www.kitware.com/"
            target="_blank" rel="noopener noreferrer">Kitware Inc.</a> We
            are committed to open science and
            the open source software that supports it. If you feel we can help
            you solve your problems, please do not hesitate to contact us.
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
