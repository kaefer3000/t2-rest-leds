# t2-rest-leds
REST + Linked Data interface to the Tessel 2's LEDs.

## Implementation details
Serves RDF (in [JSON-LD](http://json-ld.org/), RDF/XML, Turtle, and N-Triples) on a REST interface. Built on the [Express](http://expressjs.com/) framework and [rdf-ext](http://github.com/rdf-ext). I extended rdf-ext to [produce RDF/XML](https://github.com/kaefer3000/rdf-serializer-rdfxml/) and to [properly ship N-Triples](https://github.com/kaefer3000/rdf-body-parser/). Describes the [Tessel 2](http://tessel.io/) using the following vocabularies: [SOSA](http://w3c.github.io/sdw/ssn/) and [SAREF](http://ontology.tno.nl/saref/).

## How to install
Requirements: a [Node.js](https://nodejs.org/) installation with npm (the nodejs package manager), and the [Tessel CLI](https://tessel.github.io/t2-start/). [Curl](http://curl.haxx.se/) for testing.
```bash
# Clone this repository
$ git clone https://github.com/kaefer3000/t2-rest-leds/

# My rdf-ext changes have not made it into the official repository, so get my version of rdf-body-parser:
$ git clone https://github.com/kaefer3000/rdf-body-parser/
# Similarly, for my RDF/XML serializer
$ git clone https://github.com/kaefer3000/rdf-serializer-rdfxml/

# Then enter the directory
$ cd t2-rest-leds
# Install the dependencies
$ npm install
# Give your Tessel a nice name
$ t2 rename t2-rest-leds
# Push the code to your Tessel
$ t2 push .
```

## How to use
### LAN
Depending on your network set-up, you can access the root resource on the Tessel in the following manner.
The Tessel automatically obtains an IP using DHCP.
Maybe your local DNS uses hostnames to produce domain names (like `t2-rest-leds.lan`):
```bash
$ curl http://tessel-ip-or-domain/
```
### Tessel as WiFi Access Point
The Tessel can work as an access point, you can configure it using the following steps:
```bash
$ t2 ap -n Tessel-AP -p topsecretpassw0rd -s psk2
$ t2 ap --on
```
Then connect to the WLAN with the SSID `Tessel-AP` and access the Tessel using the IP that has been presented to you in the previous step, or using the hostname set above:
```bash
$ curl http://t2-rest-leds.lan/
```
