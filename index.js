'use strict';

var _ = require('lodash');
var manager = require('./lib/manager');
var settings = require('./package.json');
var inAdapter = require(settings.inAdapter.type);
var outAdapter = require('./lib/outAdapters/consoleAdapter');

var main = function(verbosity, skipSummary) {
  var sites = inAdapter.getRunData();
  manager.run(sites, settings, outAdapter, verbosity, skipSummary);
};

var verbose = _.includes(process.argv.slice(2), '--verbose');
var skipPrintSummary = _.includes(process.argv.slice(2), '--skip-summary');

main(verbose, skipPrintSummary);

module.exports = {
  main: main
};
