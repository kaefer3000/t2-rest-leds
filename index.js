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

// The root app
var app = express();
// The two routers for the sensors/actuators
var ledApp   = express.Router({ 'strict' : true });
ledApp.use(bodyParser.json({ 'type' : "*/*" }));

app.use(function (req, res, next) {
  res.header("Content-Type",'application/ld+json');
  next();
});

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
app.all('/', redirectMissingTrailingSlash);
app.get('/', function(request, response) {
  response.json({
    '@id' : '' ,
    '@type' : 'http://www.w3.org/ns/ldp#BasicContainer' ,
    'http://www.w3.org/ns/ldp#contains' : ['led/']
  });
});

// LDP description of the the leds
ledApp.route('/')
  .all(redirectMissingTrailingSlash)
  .get(function(request, response) {
    response.json({
      '@context' : { 'http://www.w3.org/ns/ldp#contains' : { '@type' : '@id'} },
      '@id' : '' ,
      '@type' : 'http://www.w3.org/ns/ldp#BasicContainer' ,
      'http://www.w3.org/ns/ldp#contains' : [ '0', '1', '2', '3' ]
    });
  })
  .delete(function(request, response){
    for (i = 0; i <= 3; i++) {
      tessel.led[i].off();
    }
    response.sendStatus(204);
  });

// GETting the state of one led
ledApp.route("/:id").get(function(request, response) {

  id = Number(request.params.id);

  if (0 <= id && id <= 3) {
    response.json({
      '@context' : { 'http://xmlns.com/foaf/0.1/isPrimaryTopicOf' : { '@type' : '@id'} },
      '@id' : '#actuator',
      'http://xmlns.com/foaf/0.1/isPrimaryTopicOf' : '',
      '@type' : 'http://purl.oclc.org/NET/UNIS/fiware/iot-lite#ActuatingDevice',
      'http://example.org/isSwitchedOn' : tessel.led[id].isOn
    });
  } else {
    response.sendStatus(404);
  }
});

// PUTting the state of one led
ledApp.route("/:id").put(function(request, response) {

  id = Number(request.params.id);

  if (0 <= id && id <= 3) {
      var datatype = typeof request.body['http://example.org/isSwitchedOn'];
      var targetState;

      switch (datatype) {
        case "boolean":
          targetState = request.body['http://example.org/isSwitchedOn'];
          break;
        case "string":
          targetState = request.body['http://example.org/isSwitchedOn'].toLowerCase() == "true";
          if (!targetState && request.body['http://example.org/isSwitchedOn'].toLowerCase() !== "false") {
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
var port = 8080;
app.listen(port, function () {
  console.log('Tessel2 LED REST app listening on port ' + port);
});

// For finding the server in the network, some handy output on the console
console.log(require('os').networkInterfaces());

// check mediatype of a request for json or json-ld
var acceptJSONLDMediaType = function(req) {
  var datatype = typeof req.headers['content-type'];
  switch (datatype) {
    case "string": 
      var mediatype = req.headers['content-type'].toLowerCase();
      if (mediatype.startsWith("application/ld+json")
        || mediatype.startsWith("application/json"))
        return true;
      else
        return false;
      break;
    default:
      return false;
    }
};

// accept any media type for a request
var acceptAnyMediaType = function(req) { return true; };

