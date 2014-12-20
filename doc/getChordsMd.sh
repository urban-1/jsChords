#!/bin/bash

#
# Get the supported chords in markdown format
#

echo "| Type | Formula | Name |"
echo "|------|---------|------|"
cat ../src/ChordTypes.js | grep type: | grep formula:  | awk -F'"' '{ \
	print "| "$4" | "$6" | "$8" |"
}'

exit 0

