
# order matters...
JSFILES=\
	src/C.js \
	src/Util.js \
	src/Class.js \
	src/Note.js \
	src/Chord.js \
	src/ChordTypes.js \
	src/Instrument.js \
	src/IStringInstrument.js \
	src/Scale.js \
	src/ScaleTypes.js \
	
GUIFILES=$(wildcard src/gui/*.js)
INSTRUMENTS= $(wildcard src/instruments/*.js);

.PHONY: all jschords auto

all: jschords
	

jschords: $(JSFILES) $(GUIFILES) $(INSTRUMENTS)
	cat $^ > jschords-src.js

# Auto build, echo . to sterr if you need feedback...
auto: 
	@while [ true ]; \
	do \
		make jschords;\
		sleep 3; \
		echo -n "." >&2 ;\
	done
	
doc: ./src/
	-rm -r ./doc/html
	-mkdir -p ./doc/html
	jsduck -o ./doc/html $^ 