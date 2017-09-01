'use strict';

var uriCheck = require('./uriCheck');
var _ = require('lodash');
var async = require('async');

var iterateURLs = function(concurrentRequests, sites, skipSummary) {
  async.eachLimit(sites, concurrentRequests, uriCheck.checkUri, function(err) {
    if(err) {
      throw err;
    }
    // skip printing summary
    if(!skipSummary) {
      uriCheck.done();
    }
  });
};

// This function accepts an array of sites and if
// the requestUrl on any of its elements is an array
// it will duplicate that element and split out the
// elements of the requestUrl array
var expandRequestUrlInput = function(sites) {
  var result = _.map(sites, function(site){
    if(_.isArray(site.requestUrl)){
      var urls = site.requestUrl;
      delete site.requestUrl;
      return _.map(urls, function(url){
        var newItem = _.cloneDeep(site);
        newItem.requestUrl = url;
        return newItem;
      });
    } else {
      return site;
    }
  });

  return _.flatten(result);
};

// This function accepts an array of sites and will
// iterate through each site object and expand the
// expectedText property out into an arry of objects
// if it is not already an array of objects.
var expandExpectedTextInput = function(sites) {
  var err;
  return _.map(sites, function(site){
    if(site.expectedText) {
      // We expect site.expectedText to be one of the
      // following:
      // 1. a string: "some search text"
      // 2. an object: {text: "some search text", caseSensitive (optional): true/false }
      // 3. an array: Of 1. or 2. or a mixture of them.
      //
      // First step, if it's not an array then we need to get it into a 1 element array
      // for the rest of the function.
      if(!_.isArray(site.expectedText)){
        site.expectedText = [site.expectedText];
      }
      // Now we know that it's an array of 1 or more "somethings." We'll iterate through
      // that and make each of them objects and throw errors for anything we can't handle
      // or recognize
      site.expectedText = _.map(site.expectedText, function(expectedText){
        if(_.isObject(expectedText)) {
          // We have an expectation that if this is already an object that it has at a minimum
          // the 'text' property
          if(!expectedText.text) {
            err = new Error('text property is missing from expectedText object.');
            err.expectedText = expectedText;
            throw err;
          }
        } else if(_.isString(expectedText)) {
          expectedText = { text: expectedText };
        } else {
          err = new Error('Unknown/Unexpected type for text property.');
          err.expectedText = expectedText;
          err.type = typeof expectedText;
          throw err;
        }
        return expectedText;
      });
    }
    return site;
  });
};

// This function accepts an array of sites and will
// iterate through each site object and expand the
// notExpectedText property out into an arry of objects
// if it is not already an array of objects.
var expandNotExpectedTextInput = function(sites) {
  var err;
  return _.map(sites, function(site){
    if(site.notExpectedText) {
      // We expect site.notExpectedText to be one of the
      // following:
      // 1. a string: "some search text"
      // 2. an object: {text: "some search text", caseSensitive (optional): true/false }
      // 3. an array: Of 1. or 2. or a mixture of them.
      //
      // First step, if it's not an array then we need to get it into a 1 element array
      // for the rest of the function.
      if(!_.isArray(site.notExpectedText)){
        site.notExpectedText = [site.notExpectedText];
      }
      // Now we know that it's an array of 1 or more "somethings." We'll iterate through
      // that and make each of them objects and throw errors for anything we can't handle
      // or recognize
      site.notExpectedText = _.map(site.notExpectedText, function(notExpectedText){
        if(_.isObject(notExpectedText)) {
          // We have an expectation that if this is already an object that it has at a minimum
          // the 'text' property
          if(!notExpectedText.text) {
            err = new Error('text property is missing from notExpectedText object.');
            err.notExpectedText = notExpectedText;
            throw err;
          }
        } else if(_.isString(notExpectedText)) {
          notExpectedText = { text: notExpectedText };
        } else {
          err = new Error('Unknown/Unexpected type for text property.');
          err.notExpectedText = notExpectedText;
          err.type = typeof notExpectedText;
          throw err;
        }
        return notExpectedText;
      });
    }
    return site;
  });
};


var start = function(runData, settings, outAdapter, verbose, skipSummary) {
  var sites = expandExpectedTextInput(expandRequestUrlInput(runData.sites));
  sites = expandNotExpectedTextInput(sites);

  if (settings.allSites) {
    settings.allSites.verbose = verbose;
  }

  // At this point sites array has now been "normalized".
  // Now take the allSites data and apply that to each element of the sites
  // array that doesn't have that data
  sites = _.map(sites, function(item) {
    return _.assign(_.clone(settings.allSites), item);
  });

  var concurrentRequests = settings.concurrentRequests;
  if(!concurrentRequests || isNaN(concurrentRequests) || concurrentRequests < 1) {
    concurrentRequests = 3;
  }
  uriCheck.init(outAdapter);
  iterateURLs(concurrentRequests, sites, skipSummary);
};

module.exports = {
  iterateURLs: iterateURLs,
  expandRequestUrlInput: expandRequestUrlInput,
  expandExpectedTextInput: expandExpectedTextInput,
  expandNotExpectedTextInput: expandNotExpectedTextInput,
  run: start
};
