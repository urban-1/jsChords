#!/bin/bash

#
# Get the supported chords in markdown format
#

echo "| Name | Interval Structure |"
echo "|------|---------|"
cat ../src/ScaleTypes.js | grep "C.Scale.TYPES\["  | awk -F '[][\"]' '{ \
	intervals = $6
	gsub(/ .5/, " H", intervals)
	gsub(/ 1\.5/, " W+H", intervals)
	gsub(/ 1/, " W", intervals)
	print "| "$3" | "intervals"|"
}'

exit 0

