import {spawn, ChildProcessByStdio, ChildProcessWithoutNullStreams} from 'child_process'


interface ExecOptions {
  stdinStr?: string
  debug?: boolean
}

export const exec = function(command, params, options: ExecOptions, exitCallback: (err: Error|number, output?: string)=>void, logCallback?: (msg: string)=>void) {
  options = options || {};

  var logger = {
    debug: function(msg) {
      if (options.debug) {
        console.log('[mini-exec] '+msg);
      }
    },
    log: function(msg) {
      if (typeof logCallback === 'function') {
        logCallback(msg);
      } else {
        console.log('[mini-exec] '+msg);
      }
    },
    info: function(msg) {
      if (typeof logCallback === 'function') {
        logCallback(msg);
      } else {
        console.log('[mini-exec] '+msg);
      }
    },
    error: function(msg, e) {
      console.error('[mini-exec] ' + msg);
      console.error(e);
      if (typeof logCallback === 'function') {
        exitCallback(e);
      }
    }
  };

  const std = {
    in: '',
    out: '',
    err: ''
  };
  let exitCode: number|null = null;
  let child: ChildProcessWithoutNullStreams;

  //if (!options.platforms.hasOwnProperty(process.platform)) {
  //  var err = new Error('Unknown process platform: ' + process.platform);
  //  self.error('Cmd.execute():', err);
  //  exitCallback(err);
  //  return false;
  //}

  logger.debug('Cmd.execute(): spawn(): command: ' + command + ', params: ' + JSON.stringify(params));

  // Starting external process

  try {
    child = spawn(command, params);

  } catch(e) {
    return logger.error('Cmd.execute(): spawn():', e);
  }

  // Write to stdin stream

  if (options.stdinStr) {
    try {
      child.stdin.write(options.stdinStr);
      child.stdin.end();
      logger.info(options.stdinStr);
      logger.debug('Cmd.execute(): child.stdin.write(): stdinStr: \'' + options.stdinStr + '\'');

    } catch (e) {
      return logger.error('Cmd.execute(): child.stdin.write():', e);
      //exitCallback(e);
      //return error;
    }
  }

  logger.debug('Cmd.execute(): spawned with pid: ' + child.pid);

  // Handlers for spawned process

  child.stdout.on('data', function(buffer: Buffer) {
    const s: string = buffer.toString('utf8');
    std.out += s;
    logger.info(s);
    logger.debug('Cmd.execute(): child.stdout.on(\'buffer\'): data: ' + s);
  });

  child.stdout.on('close', function() {
    logger.debug('Cmd.execute(): child.stdout.on(\'close\')');
    // !!! child.on('exit') may occur before child.stdout.on('data')
    // !!! we already call callback in on('finish')
    // if (exitCallback) { exitCallback(exitCode, output); }
  });

  child.stdout.on('finish', function() {
    logger.debug('Cmd.execute(): child.stdout.on(\'finish\')');
    // !!! child.on('exit') may occur before child.stdout.on('data')
    if (exitCallback) {
      exitCallback(exitCode, std.out);
    }
  });

  child.stderr.on('data', function(buffer: Buffer) {
    const data: string = buffer.toString('utf8');
    std.err += data;
    logger.log('Cmd.execute(): child.stderr.on(\'data\'): data: ' + data);
  });

  child.on('error', function(error) {
    return logger.error('Cmd.execute(): child.on(\'error\') child process returned error:', error);
  });

  child.on('exit', function(code: number) {
    logger.debug('Cmd.execute(): child.on(\'exit\') child process exited with code: ' + code);
    if (code !== 0) {
      return logger.error('Cmd.execute(): child process exited with NON-ZERO code:', code);
    }
    exitCode = code;
    // !!! child.on('exit') may occur before child.stdout.on('data')
    // if (exitCallback) { exitCallback((code !== 0), output); }
  });

  child.on('close', function(code) {
    logger.debug('Cmd.execute(): child.on(\'close\') child process exited with code: ' + code);
    if (code !== 0) {
      logger.error('Cmd.execute(): child.on(\close\') child process exited with NON-ZERO code:', code);
    }
    exitCode = code;
    // !!! child.on('exit') may occur before child.stdout.on('data')
    // if (exitCallback) { exitCallback((code !== 0), output); }
  });

  return true;
};


// Exporting object


// module.exports = exec;
