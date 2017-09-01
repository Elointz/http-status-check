'use strict';
var cron = require('node-cron');

// execute every 1 min
cron.schedule('*/1 * * * *', function () {
  var shell = require('./lib/child_helper');
  var commandList = [
    'node index.js --skip-summary'
  ];
  shell.series(commandList, function (err) {
    //console.log('done')
    console.log(new Date());
  });
});
