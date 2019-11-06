import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle, faFlask } from '@fortawesome/free-solid-svg-icons';

const useStyles = makeStyles(theme => ({
  typography: {
    padding: theme.spacing(1),
  },
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
        style={{
          maxWidth: '400px',
        }}
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
      <p>
        Use this panel to search for items in the loaded dataset. Search results
        will match the phrase used anywhere in the name of the item. For
        example, searching for <tt>N</tt> will match Nitrogen (<tt>N</tt>), but
        also Sodium (<tt>Na</tt>), Sodium Chloride (<tt>NaCl</tt>), and
        Potassium Azide (<tt>KN<sub>3</sub></tt>).
      </p>

      <h5>Pinning, Neighbors, and Subspaces</h5>

      <p>
        Next to the search results, you will see icons for <b>pinning</b>, <b>neighbors</b>,
        and <b>elemental subspace</b>.
      </p>

      <p>
        <i>Pinning</i> an item maintains it in a list of items, so that you will
        not lose track of it while navigating the map. The list of pinned
        items appears as clickable badges below the search panel. You can
        click on the <i>neighbors</i> icon in order to additionally bring in
        the immediate neighbors of the pinned item. This provides an easy way
        to see an item's one-hop network without having to pin all of them.
      </p>

      <p>
        Finally, you can click on the <i>subspace</i> icon to add the item to
        the elemental subspace. This is a special collection of items that
        causes all materials containing any of the elements in it to appear. For
        instance, marking <tt>N</tt> and <tt>O</tt> for inclusion in the
        subspace will cause Nitrogen (<tt>N</tt>), Oxygen (<tt>O</tt>) to
        appear, but also Nitrogen Dioxide (<tt>NO<sub>2</sub></tt>) and Nitrous
        Oxide (<tt>N<sub>2</sub>O</tt>), and any other compound made exclusively
        from nitrogen and oxygen atoms.
      </p>

      <p>
        Displaying neighbors and adding to a subspace both imply pinning. To
        remove either effect, you can click on the "X" on the pinned item's
        badge. Clicking again with go on to unpin the item as well.
      </p>

      <p>
        The pinned/neighbor/subpsace state of each material is also visible in
        the item detail panel, which can be opened by clicking on an item, or
        its pinned badge.
      </p>

      <p>
        These states can also be toggled by interacting with the map directly:
        Ctrl-click will pin an item; shift-click will pin it and show neighbors;
        and alt-click will add its constituents to the subspace.  You can also
        simply <i>select</i> an item by clicking on it without any keys pressed:
        while this opens the detail panel, it does not affect the item's
        pinned/neighbor/subspace status. Once the detail panel is open, you can
        also use the icons to affect that status for that item.
      </p>
    </HelpPanelLabel>
  );
}

export function OptionsHelp() {
  return (
    <HelpPanelLabel name='options-help' label='Options'>
      <p>
        This panel contains several general options and settings for the map and
        visualization.
      </p>
    </HelpPanelLabel>
  );
}

export function SpacingHelp() {
  return (
    <HelpPanelLabel name='spacing-help' label='Node spacing'>

      <p>
        This is an alternative zooming mode which simply expands or contracts
        the space between nodes in the map, without changing the size of the
        nodes themselves.
      </p>

      <p>
        In addition to using the slider, you can also hold <tt>Ctrl</tt> while
        rolling the mousewheel on on the map. The zoom effect will center on the
        mouse position.
      </p>

    </HelpPanelLabel>
  );
}

export function TemplateHelp() {
  return (
    <HelpPanelLabel name='template-help' label='Detail Panel Template'>

      <p>
        This menu lets you select which informational template will be shown in
        the detail panel that appears after clicking on a node.
      </p>

    </HelpPanelLabel>
  );
}

export function ColorYearHelp() {
  return (
    <HelpPanelLabel name='color-year-help' label='Color year'>

      <p>
        This sets the year for the purposes of the "Undiscovered/Discovered"
        color mode.
      </p>

      <p>
        This mode displays materials discovered <i>as of the selected year</i>
        in the "discovered" color, and all other materials in the "undiscovered
        color". By using this mode, then sweeping the discovery year slider, you
        can get a sense for the progression of material discovery within the
        displayed data.
      </p>

    </HelpPanelLabel>
  );
}

export function SubgraphOnlyHelp() {
  return (
    <HelpPanelLabel name='subgraph-only-help' label='Show subgraph only'>

      <p>
        Selecting this checkbox causes the map to only display nodes that have
        been pinned (including those that have been set to show neighbors, or
        that have been added to the element subspace). When nothing is pinned,
        the entire dataset will be displayed.
      </p>

      <p>
        If this option is disabled, then unpinned items will be visible in a
        faded color in the background of the map. However, they can still be
        interacted with. When the option is enabled, these "hidden" items can be
        found by using the search box, or by activating the neighbors of pinned
        items, and then iteratively adding more neighbors to the display.
      </p>

    </HelpPanelLabel>
  );
}

export function AutoNeighborsHelp() {
  return (
    <HelpPanelLabel name='auto-neighbors-help' label='Show neighbors of selected'>

      <p>
        This option will cause the display to temporarily hide all but the
        immediate neighbors of any selected item. Note that this is different
        from pinning an item together with its neighbors. This mode enables an
        exploration mode in which clicking on a neighbor also shows its one-hop
        neighborhood, which in turn may enable a progressive exploration further
        and further into the network from the original item.
      </p>

    </HelpPanelLabel>
  );
}

export function TableHelp() {
  return (
    <HelpPanelLabel name='table-help' label='Show LineUp Table'>

      <p>
        This checkbox toggles the display of a <a
        href="https://vcg.seas.harvard.edu/publications/lineup-visual-analysis-of-multi-attribute-rankings"
        target="_blank" rel="noopener noreferrer">LineUp table</a> containing
        the current subgraph of items.
      </p>

      <p>
        LineUp provides a highly interactive experience: for example, controls
        in each column enable actions such as sorting the table by that column's
        values, construction of compound value columns by dragging and dropping
        one column onto another, etc. See the link above for more information.
      </p>

      <p>
        The rows shown in the LineUp table can be clicked in order to select
        that item. Together with the analysis features mentioned above, this
        enables you to find items with specific values within the map.
      </p>

    </HelpPanelLabel>
  );
}

export function FilteringHelp() {
  return (
    <HelpPanelLabel name='filtering-help' label='Filtering'>

      <p>
        This panel contains sliders for filtering the items included in the
        subgraph by their data values.
      </p>

      <p>
        The "discovery year" slider also has a playback feature: when the play
        button is pressed, the slider will automatically show the progress of
        material discovery as an animation.
      </p>

    </HelpPanelLabel>
  );
}

export function LayoutHelp() {
  return (
    <HelpPanelLabel name='layout-help' label={'Live Layout'}>

      <p>
        This panel contains controls for performing live layout of the subgraph.
      </p>

      <p>
        The "Start" button kicks off a background worker that uses a force-based
        layout algorithm to flow the node of the graph around the map as though
        the links between them were springs pulling them closer together.
        Because this can be a costly operation, you may see more infrequent
        updates for larger subgraphs, but this is normal.
      </p>

      <p>
        Once live layout begins, a "Stop" button will appear; whenever you wish
        to pause the layout process, click this button. That will cause the
        "Start" button to reappear, along with the "Reset" button.
      </p>

      <p>
        "Reset" will restore the layout of the whole graph back to its original
        state.
      </p>

    </HelpPanelLabel>
  );
}
