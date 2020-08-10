const exec = require('../').exec;


//exec('ls', ['-l'], null, function(err, stderr, stdout) {
exec('ls', ['-l'], null, function(err, stderr, stdout) {
    console.log('=============================');
    console.log('* err:',    err);
    console.log('* stderr:', stderr);
    console.log('* stdout:', stdout);
    console.log('=============================');

  }, function(log) {
  const lines = log.split(/\r|\n/);
    lines.forEach(function(s) {console.log('* ' + s); });
    //console.log('* log:', log);
  }
);
