import React from 'react';
import { Typography } from '@material-ui/core';

export default function renderTooltip(node, _store) {
    return <Typography variant="caption">{node.name}</Typography>;
}