#!/bin/bash

#
# Assuming that is in the same lavel witht the jsChords project
#
JSCHORDS="../../jsChords"

if [ $# -gt 0 ]; then
    JSCHORDS=$1
fi

(cd $JSCHORDS && make doc)
rm -r ../doc/*
cp -r $JSCHORDS/doc/html/* ../doc