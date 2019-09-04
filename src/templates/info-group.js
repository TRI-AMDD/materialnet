import React from 'react';
import { Typography } from '@material-ui/core';

export default class InfoGroup extends React.Component {
    render() {
        const { label, children } = this.props;

        return <>
            <Typography gutterBottom variant="title">
                {label}
            </Typography>
            {children}
        </>;
    }
}