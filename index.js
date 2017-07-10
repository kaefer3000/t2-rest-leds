//
// Serves the LEDs on a REST interface.
//
// TODO: Other RDF serialisations
// TODO: LDP headers and implementation streamlining
// Author: kaefer3000
//

// Import the interface to Tessel hardware
var tessel = require('tessel');
// Load the web framework
var express = require('express');
// Load the logger for the web framework
var logger = require('morgan');
// Load some parsers for HTTP message bodys
var bodyParser = require('body-parser');
// Load RDF
var rdf = require('rdf-ext')
// Load the RDF parsers for HTTP messages
var rdfBodyParser = require('rdf-body-parser');
var RdfXmlSerializer = require('rdf-serializer-rdfxml');

// The root app
app = express();

// Preparing to use my rdf/xml serialiser
var formatparams = {};
formatparams.serializers = new rdf.Serializers();
formatparams.serializers['application/rdf+xml'] = RdfXmlSerializer;
var formats = require('rdf-formats-common')(formatparams);

var configuredBodyParser = rdfBodyParser({'defaultMediaType' : 'text/turtle', 'formats' : formats});

app.use(configuredBodyParser);

// The two routers for the sensors/actuators
var ledApp   = express.Router({ 'strict' : true });
ledApp.use(configuredBodyParser);

// configuring the app
app.set('json spaces', 2);
app.set('case sensitive routing', true);
app.set('strict routing', true);
app.use(logger('dev'));

// defining a utility method that redirects (301) missing trailing slashes
var redirectMissingTrailingSlash = function(request, response, next) {
  if (!request.originalUrl.endsWith('/'))
    response.redirect(301, request.originalUrl + '/');
  else
    next();
};

// wiring the apps and routers
app.use("/led", ledApp);

// LDP description of the root app
var rootRdfGraph = rdf.createGraph();
rootRdfGraph.addAll(
  [
    new rdf.Triple(
      new rdf.NamedNode(''),
      new rdf.NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
      new rdf.NamedNode('http://w3c.github.io/wot/w3c-wot-td-ontology.owl#Thing')),
    new rdf.Triple(
      new rdf.NamedNode(''),
      new rdf.NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
      new rdf.NamedNode('http://www.w3.org/ns/sosa/Platform')),
   new rdf.Triple(
      new rdf.NamedNode(''),
      new rdf.NamedNode('http://www.w3.org/ns/sosa/hosts'),
      new rdf.NamedNode('led/')),
    new rdf.Triple(
      new rdf.NamedNode(''),
      new rdf.NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
      new rdf.NamedNode('http://www.w3.org/ns/ldp#BasicContainer')),
   new rdf.Triple(
      new rdf.NamedNode(''),
      new rdf.NamedNode('http://www.w3.org/ns/ldp#contains'),
      new rdf.NamedNode('led/'))
  ])

app.all('/', redirectMissingTrailingSlash);
app.get('/', function(request, response) {
  response.sendGraph(rootRdfGraph);
});

// LDP description of the the leds
var ledRootGraph = rdf.createGraph();
ledRootGraph.addAll(
  [
    new rdf.Triple(
      new rdf.NamedNode(''),
      new rdf.NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
      new rdf.NamedNode('http://www.w3.org/ns/ldp#BasicContainer')),
   new rdf.Triple(
      new rdf.NamedNode(''),
      new rdf.NamedNode('http://www.w3.org/ns/ldp#contains'),
      new rdf.NamedNode('0')),
   new rdf.Triple(
      new rdf.NamedNode(''),
      new rdf.NamedNode('http://www.w3.org/ns/ldp#contains'),
      new rdf.NamedNode('1')),
   new rdf.Triple(
      new rdf.NamedNode(''),
      new rdf.NamedNode('http://www.w3.org/ns/ldp#contains'),
      new rdf.NamedNode('2')),
   new rdf.Triple(
      new rdf.NamedNode(''),
      new rdf.NamedNode('http://www.w3.org/ns/ldp#contains'),
      new rdf.NamedNode('3')),
   new rdf.Triple(
      new rdf.NamedNode(''),
      new rdf.NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
      new rdf.NamedNode('http://www.w3.org/ns/sosa/Platform')),
   new rdf.Triple(
      new rdf.NamedNode(''),
      new rdf.NamedNode('http://www.w3.org/ns/sosa/hosts'),
      new rdf.NamedNode('0#led')),
   new rdf.Triple(
      new rdf.NamedNode(''),
      new rdf.NamedNode('http://www.w3.org/ns/sosa/hosts'),
      new rdf.NamedNode('1#led')),
   new rdf.Triple(
      new rdf.NamedNode(''),
      new rdf.NamedNode('http://www.w3.org/ns/sosa/hosts'),
      new rdf.NamedNode('2#led')),
   new rdf.Triple(
      new rdf.NamedNode(''),
      new rdf.NamedNode('http://www.w3.org/ns/sosa/hosts'),
      new rdf.NamedNode('3#led'))
  ])
ledApp.route('/')
  .all(redirectMissingTrailingSlash)
  .get(function(request, response) {
    response.sendGraph(ledRootGraph);
  })
  .delete(function(request, response){
    for (i = 0; i <= 3; i++) {
      tessel.led[i].off();
    }
    response.sendStatus(204);
  });

// GETting the state of one led
var ledBasicGraph = rdf.createGraph();
ledBasicGraph.addAll(
  [
    new rdf.Triple(
      new rdf.NamedNode('#led'),
      new rdf.NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
      new rdf.NamedNode('http://purl.oclc.org/NET/UNIS/fiware/iot-lite#ActuatingDevice')),
   new rdf.Triple(
      new rdf.NamedNode('#led'),
      new rdf.NamedNode('http://xmlns.com/foaf/0.1/isPrimaryTopicOf'),
      new rdf.NamedNode(''))
  ])
ledApp.route("/:id").get(function(request, response) {

  id = Number(request.params.id);

  if (0 <= id && id <= 3) {
    response.sendGraph(ledBasicGraph.merge([
          new rdf.Triple(
            new rdf.NamedNode('#led'),
            new rdf.NamedNode('http://example.org/isSwitchedOn'),
            new rdf.Literal(tessel.led[id].isOn, null, 'http://www.w3.org/2001/XMLSchema#boolean'))
        ]));
  } else {
    response.sendStatus(404);
  }
});

// PUTting the state of one led
ledApp.route("/:id").put(function(request, response) {

  id = Number(request.params.id);

  if (0 <= id && id <= 3) {
      var targetStateTripleCount = 0;
      var object;
      request.graph.filter(
        function(triple) {
          return triple.predicate.nominalValue === 'http://example.org/isSwitchedOn'
        }).forEach(function(triple) {
          ++targetStateTripleCount;
          // disabled:
          // object = triple.object.valueOf();
          object = triple.object.nominalValue;
        })
      if (targetStateTripleCount === 0 || targetStateTripleCount > 1) {
          response.status(400);
          response.send('Please supply exactly one triple with desired state');
          return;
      }
      var datatype = typeof object;
      var targetState;

      switch (datatype) {
        case "boolean":
          targetState = object;
          break;
        case "string":
          targetState = object.toLowerCase() == "true";
          if (!targetState && object.toLowerCase() !== "false") {
            response.status(400);
            response.send("Please supply something with a proper boolean value for the http://example.org/isSwitchedOn property");
            return;
          }
          break;
        case "undefined":
          response.status(400);
          response.send("Please supply something with http://example.org/isSwitchedOn property (and give it a boolean value)");
          return;
        default:
          response.status(400);
          response.send("Please supply something with a proper boolean value for the http://example.org/isSwitchedOn property");
          return;
      }
      if (typeof targetState !== "boolean") {
        response.sendStatus(500);
      } else if (targetState !== tessel.led[id].isOn) {

        if (targetState === true)
          tessel.led[id].on();
        else
          tessel.led[id].off();
        response.sendStatus(204);
        return;
      }
      response.sendStatus(204);
      return;
  } else {
    response.sendStatus(404);
    return;
  }
});

// Startup the server
var port = 80;
app.listen(port, function () {
  console.log('Tessel2 LED REST app listening on port ' + port);
});

// For finding the server in the network, some handy output on the console
console.log(require('os').networkInterfaces());

