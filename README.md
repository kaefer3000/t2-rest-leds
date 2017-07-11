# t2-rest-leds
REST + Linked Data interface to the Tessel 2's LEDs.

## Implementation details
Serves [JSON-LD](http://json-ld.org/) on a REST interface. Built on the [Express](http://expressjs.com/) framework and [rdf-ext](http://github.com/rdf-ext). Describes the [Tessel 2](http://tessel.io/) using the following vocabularies: [SOSA](http://w3c.github.io/sdw/ssn/) and [SAREF](http://ontology.tno.nl/saref/).

Access the root resource like:
````
$ curl http://tessel-ip-or-hostname/
````

## Status
First rough implementation.
