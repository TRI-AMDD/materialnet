import React from 'react';

import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import Autosuggest from 'react-autosuggest';

import { deburr } from 'lodash-es';

import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';

function renderInputComponent(inputProps) {
  const { classes, inputRef = () => {}, ref, ...other } = inputProps;

  return (
    <TextField
      fullWidth
      InputProps={{
        inputRef: node => {
          ref(node);
          inputRef(node);
        },
        classes: {
          input: classes.input,
        },
      }}
      {...other}
    />
  );
}

function renderSuggestion(suggestion, { query, isHighlighted }) {
  const matches = match(suggestion.label, query);
  const parts = parse(suggestion.label, matches);

  return (
    <MenuItem selected={isHighlighted} component="div">
      <div>
        {parts.map((part, index) => {
          return part.highlight ? (
            <span key={String(index)} style={{ fontWeight: 500 }}>
              {part.text}
            </span>
          ) : (
            <strong key={String(index)} style={{ fontWeight: 300 }}>
              {part.text}
            </strong>
          );
        })}
      </div>
    </MenuItem>
  );
}

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  container: {
    position: 'relative',
  },
  suggestionsContainerOpen: {
    position: 'absolute',
    zIndex: 1,
    marginTop: theme.spacing.unit,
    left: 0,
    right: 0,
  },
  suggestion: {
    display: 'block',
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: 'none'
  },
  suggestionsContainer: {
    maxHeight: '15rem',
    overflowY: 'scroll'
  }
});

class IntegrationAutosuggest extends React.Component {
  state = {
    suggestions: [],
  };

  handleSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: this.getSuggestions(value),
    });
  };

  handleSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    });
  };

  handleChange = name => (event, { newValue }) => {
    this.setState({
      [name]: newValue,
    });
  };

  getSuggestions(value) {
    const inputValue = deburr(value.trim()).toLowerCase();
    const inputLength = inputValue.length;
    const { maxItems } =  this.props;
    let count = 0;

    const matchFn = (suggestion) => {
      if (count >= maxItems) {
        return false;
      }

      const match = suggestion.label.toLowerCase().includes(inputValue);

      if (match) {
        count += 1;
      }

      return match;
    }

    return inputLength === 0
      ? []
      : this.props.options.filter(matchFn);
  }

  getSuggestionValue(suggestion) {
    return suggestion.label;
  }

  render() {
    const { classes, onChange, value, maxItems, label } = this.props;

    const autosuggestProps = {
      renderInputComponent,
      suggestions: this.state.suggestions,
      onSuggestionsFetchRequested: this.handleSuggestionsFetchRequested,
      onSuggestionsClearRequested: this.handleSuggestionsClearRequested,
      getSuggestionValue: this.getSuggestionValue,
      renderSuggestion,
    };

    return (
      <div className={classes.root}>
        <Autosuggest
          {...autosuggestProps}
          inputProps={{
            classes,
            label,
            placeholder: 'Search (e.g. NaCl)',
            value: value,
            onChange: onChange,
            InputLabelProps: {
              shrink: true,
            },
            inputRef: node => {
              this.popperNode = node;
            }
          }}
          theme={{
            container: classes.container,
            suggestionsContainerOpen: classes.suggestionsContainerOpen,
            suggestionsList: classes.suggestionsList,
            suggestion: classes.suggestion,
          }}
          renderSuggestionsContainer={({containerProps, children, query}) => {
            return Boolean(children) ? (
              <Paper square
                {... containerProps}
                className={classes.suggestionsContainer}
              >
                {children}
                {(children && children.props.items.length === maxItems) &&
                  <MenuItem disabled>...</MenuItem>
                }
              </Paper>
            ) : null;
          }}
        />
      </div>
    );
  }
}

export default withStyles(styles)(IntegrationAutosuggest);
