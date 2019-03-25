#!/bin/bash
girder-cli --host data.kitware.com download --parent-type item 5c99179c8d777f072bd8b6c1 public/
tar xfv public/sample-data.tar.gz -C public/
rm public/sample-data.tar.gz
