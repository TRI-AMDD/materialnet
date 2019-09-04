import React from 'react';
import { Typography } from '@material-ui/core';

export default class InfoBlock extends React.Component {
    render() {
        const { label, value, children } = this.props;

        return value != null && <>
            <Typography gutterBottom variant="subheading" color="textSecondary">
                {label}
                </Typography>
            <Typography paragraph>
                {value}
                {children}
            </Typography>
        </>;
    }
}