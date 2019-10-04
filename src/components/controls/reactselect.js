import React from 'react';
import clsx from 'clsx';
import Select, { Async } from 'react-select';
import { emphasize, makeStyles, useTheme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';
import MenuItem from '@material-ui/core/MenuItem';
import CancelIcon from '@material-ui/icons/Cancel';
import { deburr } from 'lodash-es';
import { ListItemText, ListItemSecondaryAction } from '@material-ui/core';

// BASED on https://material-ui.com/components/autocomplete/

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
        height: 250,
        minWidth: 290,
    },
    input: {
        display: 'flex',
        padding: 0,
        height: 'auto',
    },
    valueContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        flex: 1,
        alignItems: 'center',
        overflow: 'hidden',
    },
    clearIndicator: {
        cursor: 'pointer'
    },
    dropdownIndicator: {
        cursor: 'pointer'
    },
    chip: {
        margin: theme.spacing(0.5, 0.25),
    },
    chipFocused: {
        backgroundColor: emphasize(
            theme.palette.type === 'light' ? theme.palette.grey[300] : theme.palette.grey[700],
            0.08,
        ),
    },
    noOptionsMessage: {
        padding: theme.spacing(1, 2),
    },
    singleValue: {
        fontSize: 16,
    },
    placeholder: {
        position: 'absolute',
        left: 2,
        bottom: 6,
        fontSize: 16,
    },
    paper: {
        position: 'absolute',
        zIndex: 1,
        marginTop: theme.spacing(1),
        left: 0,
        right: 0,
    },
    divider: {
        height: theme.spacing(2),
    },
}));

function NoOptionsMessage(props) {
    return (
        <Typography
            color="textSecondary"
            className={props.selectProps.classes.noOptionsMessage}
            {...props.innerProps}
        >
            {props.children}
        </Typography>
    );
}

function inputComponent({ inputRef, ...props }) {
    return <div ref={inputRef} {...props} />;
}

function Control(props) {
    const {
        children,
        innerProps,
        innerRef,
        selectProps: { classes, TextFieldProps },
    } = props;

    return (
        <TextField
            fullWidth
            InputProps={{
                inputComponent,
                inputProps: {
                    className: classes.input,
                    ref: innerRef,
                    children,
                    ...innerProps,
                },
            }}
            {...TextFieldProps}
        />
    );
}

function Option(props) {
    return (
        <MenuItem
            ref={props.innerRef}
            selected={props.isFocused}
            component="div"
            style={{
                fontWeight: props.isSelected ? 500 : 400,
            }}
            {...props.innerProps}
        >
            {props.selectProps.optionButtons ? <>
                <ListItemText primary={props.children} />
                <ListItemSecondaryAction>
                    {props.selectProps.optionButtons(props.data)}
                </ListItemSecondaryAction>
            </> : props.children}
        </MenuItem>
    );
}

function Placeholder(props) {
    const { selectProps, innerProps = {}, children } = props;
    return (
        <Typography color="textSecondary" className={selectProps.classes.placeholder} {...innerProps}>
            {children}
        </Typography>
    );
}

function SingleValue(props) {
    return (
        <Typography className={props.selectProps.classes.singleValue} {...props.innerProps}>
            {props.children}
        </Typography>
    );
}

function ValueContainer(props) {
    return <div className={props.selectProps.classes.valueContainer}>{props.children}</div>;
}

function MultiValue(props) {
    return (
        <Chip
            tabIndex={-1}
            icon={props.data ? props.data.icon : null}
            label={props.children}
            className={clsx(props.selectProps.classes.chip, {
                [props.selectProps.classes.chipFocused]: props.isFocused,
            })}
            onDelete={props.removeProps.onClick}
            deleteIcon={<CancelIcon {...props.removeProps} />}
        />
    );
}

function Menu(props) {
    return (
        <Paper square className={props.selectProps.classes.paper} {...props.innerProps}>
            {props.children}
        </Paper>
    );
}

const components = {
    Control,
    Menu,
    MultiValue,
    NoOptionsMessage,
    Option,
    Placeholder,
    SingleValue,
    ValueContainer,
};

export default function ReactSelectWrapper({label, ...rest}) {
    const classes = useStyles();
    const theme = useTheme();

    const selectStyles = {
        input: base => ({
            ...base,
            color: theme.palette.text.primary,
            '& input': {
                font: 'inherit',
            },
        }),
        clearIndicator: (base) => ({
            ...base,
            cursor: 'pointer'
        }),
        dropdownIndicator: (base) => ({
            ...base,
            cursor: 'pointer'
        })
    };

    return (
        <Select
            classes={classes}
            styles={selectStyles}
            TextFieldProps={{
                label,
                InputLabelProps: {
                    shrink: true,
                },
            }}
            components={components}
            {...rest}
        />
    );
}


export function ReactSelectSearchWrapper({ label, maxItems, options, ...rest }) {
    const classes = useStyles();
    const theme = useTheme();

    const selectStyles = {
        input: base => ({
            ...base,
            color: theme.palette.text.primary,
            '& input': {
                font: 'inherit',
            },
        }),
        clearIndicator: (base) => ({
            ...base,
            cursor: 'pointer'
        }),
        dropdownIndicator: (base) => ({
            ...base,
            cursor: 'pointer'
        })
    };

    const loadOptions = (inputValue) => {
        inputValue = deburr(inputValue.trim()).toLowerCase();

        if (!inputValue) {
            return maxItems ? options.slice(0, maxItems) : [];
        }

        const data = options.reduce((r, d) => {
            if ((!maxItems || r.length < maxItems) && d.label.toLowerCase().includes(inputValue)) {
                r.push(d);
            }
            return r;
        }, []);

        return Promise.resolve(data);
    };
    return (
        <Async
            classes={classes}
            styles={selectStyles}
            TextFieldProps={{
                label,
                InputLabelProps: {
                    shrink: true,
                },
            }}
            components={components}
            defaultOptions={options.slice(0, maxItems || 10)}
            loadOptions={loadOptions}
            {...rest}
        />
    );
}