# jsChords:README

jsChords aims to be a complete and independent javascript-based music library.
It can be used for educational purposes or integrated in larger music sites 
(chord databases, song/tab listings, etc). However, it is mainly written by 
programmers at the moment so any feedback/help would be very much appreciated.

The idea is to keep this library as simple and extensible as possible. Javascript 
was chosen  due to good integration with other web technologies and frameworks. 
Additionally, requires no server setup and can run in "offline" mode on any device 
with a browser (in theory at least). Server-side implementation may be provided in 
the future (TeaJS, nodejs?)

Visit [Am demo page!](http://urban-1.github.io/jsChords/demo.html?chord=Am&inst=Guitar) to see
what is possible atm.

## Usage

For use in another website just download jschords-src.js and include it. Optionally,
maybe a good idea to use a minifier/compiler of your choice to compress the library.
Code examples [here](http://urban-1.github.io/jsChords/) (the demo code)

## Editing and rebuilding

If you want to edit and extend the project, clone it (or fork on github) and use the
provided makefile. This simply combines all the files into jschords-src.js.

Documentation is build with jsduck which is assumed to be in your path. To rebuild:

    cd <path_to_project>/doc
    make doc

The output will be generated in /doc/html. Online documentation will be updated 
regularly and can be found at [the project homepage](http://urban-1.github.io/jsChords/doc).


## Supported Chords 

jsChords is easy to extend with new chords (any request would be implemented given
the formulas). At the moment the following are supported:

| Type | Formula | Name |
|------|---------|------|
| M | 1 3 5 | Major |
| m | 1 b3 5 | Minor |
| 7 | 1 3 5 b7 | 7th |
| m7 | 1 b3 5 b7 | Minor 7th |
| maj7 | 1 3 5 7 | Major 7th |
| sus4 | 1 4 5 | Suspended 4th |
| dim | 1 b3 b5 | Diminished |
| aug | 1 3 #5 | Augmented |
| 6 | 1 3 5 6 | 6th |
| m6 | 1 b3 5 6 | Minor 6th |
| 6add9 | 1 3 5 6 9 | 6th Add 9th |
| 9 | 1 3 5 b7 9 | 9th |
| m9 | 1 b3 5 b7 9 | Minor 9th |
| maj9 | 1 3 5 7 9 | Major 9th |
| 11 | 1 (3) 5 b7 (9) 11 | 11th |
| m11 | 1 b3 5 b7 (9) 11 | Minor 11th |
| maj11 | 1 3 5 7 (9) 11 | Major 11th |
| 13 | 1 3 5 b7 (9) (11) 13 | 13th |
| m13 | 1 b3 5 b7 (9) (11) 13 | Minor 13th |
| maj13 | 1 3 5 7 (9) (11) 13 | Major 13th |
| maj7#11 | 1 3 5 7 #11 | Major seven sharp 7th |
| maj-5 | 1 3 b5 | Major Flat Five |
| m/maj7 | 1 b3 5 7 | Minor/Major 9th |
| m/maj9 | 1 b3 5 7 9 | Minor/Major 9th |
| m/maj11 | 1 b3 5 7 (9) 11 | Minor/Major 11th |
| m/maj13 | 1 b3 5 7 (9) (11) 13 | Minor/Major 13th |
| m7-5 | 1 b3 b5 b7 | Minor seven flat fifth |
| 7#5 | 1 3 #5 b7 | Seven sharp five |
| 7b5 | 1 3 b5 b7 | Seven flat five |
| 7b9 | 1 3 5 b7 b9 | Seven flat ninth |
| 7#9 | 1 3 5 b7 #9 | Seven sharp ninth |
| 9#5 | 1 3 #5 b7 9 | Nine sharp five |
| 9b5 | 1 3 b5 b7 9 | Nine flat five |
| 7#5#9 | 1 3 #5 b7 #9 | Seven sharp five sharp nine |
| 7#5b9 | 1 3 #5 b7 b9 | Seven sharp five flat nine |
| 7b5#9 | 1 3 b5 b7 #9 | Seven flat five sharp nine |
| 7b5b9 | 1 3 b5 b7 b9 | Seven flat five flat nine |
| 7#11 | 1 3 5 b7 #11 | Seven sharp eleven |
| dim7 | 1 b3 b5 bb7 | Diminished 7th |
| 5 | 1 5 | 5th |
| -5 | 1 b5 | Flat 5th |
| sus2 | 1 2 5 | Suspended 2nd |
| #11 | 1 5 #11 | Sharp Eleven |


## Supported Scales

TODO: When scales are implemented...
