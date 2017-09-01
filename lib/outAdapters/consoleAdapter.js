'use strict';

var _ = require('lodash');
var colors = require('colors/safe');
//var bunyan = require('bunyan');
//var log = bunyan.createLogger({
//  name: 'http-status-check',
//  streams: [{
//      path: './httpstatuscheck.log'
//    }
//  ]
//});

var successHits = 0;
var failHits = 0;
var disableHits = 0;

var organizeErrors = function(errors) {
  if(!Array.isArray(errors)){
    if(_.isObject(errors)){
      errors = _.map(errors, function(value, key){
        return key + ': ' + value;
      });
    } else {
      errors = [errors];
    }
  }
  return _.flatten(errors);
};

var writeResult = function(result, uri) {
  switch(result) {
    case 'success':
      if(uri.verbose) {
        console.log('_ ' + uri.name + ' (' + uri.requestUrl + ') working as expected.');
      }
      successHits++;
      break;
    case 'fail':
      console.log(colors.red.bold('X ' + uri.name + ' (' + uri.requestUrl + ') failed. Here are the problems:'));
      if(uri.errors) {
        uri.errors = organizeErrors(uri.errors);
        _.forEach(uri.errors, function(error) { console.log(colors.red.bold('  - ' + error)); } );
      }
      failHits++;
      break;
    case 'disabled':
      if(uri.verbose) {
        console.log('_ ' + uri.name + ' (' + uri.requestUrl + ') testing disabled.');
      }
      disableHits++;
      break;
    default:
      throw new Error('unknown case statement: ' + result);
  }
};

var done = function() {
  console.log('A total of ' + colors.cyan(successHits + failHits + disableHits) + ' URIs were tested.');
  console.log('Failure count: ' + colors.red(failHits));
  console.log('Success count: ' + colors.green(successHits));
  console.log('Disable count: ' + colors.yellow(disableHits));
};

module.exports = {
  writeResult: writeResult,
  done: done
};
