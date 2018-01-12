/**
 * Created by alykoshin on 22.04.16.
 */

'use strict';

var exec = require('../');


//exec('ls', ['-l'], null, function(err, stderr, stdout) {
exec('ls', ['-l'], null, function(err, stderr, stdout) {
    console.log('=============================');
    console.log('* err:',    err);
    console.log('* stderr:', stderr);
    console.log('* stdout:', stdout);
    console.log('=============================');

  }, function(log) {
    var lines = log.split(/\r|\n/);
    lines.forEach(function(s) {console.log('* ' + s); });
    //console.log('* log:', log);
  }
);
