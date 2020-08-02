// Debug.enable('*');

import { EventEmitter } from 'events';
import { spawn } from 'child_process'
// import {ONE_MINUTE,ONE_SECOND} from '../../utils';
import Debug from 'debug';

const debug = Debug('Runner');

const ONE_MS = 1;
const ONE_SECOND = 1000 * ONE_MS;
const ONE_MINUTE = 60 * ONE_SECOND;
//export const DEFAULT_TIMEOUT = 10*ONE_SECOND;
export const DEFAULT_TIMEOUT = 1*ONE_MINUTE;


export class ShellRunner extends EventEmitter {
  timeout: number = DEFAULT_TIMEOUT

  constructor({ timeout=DEFAULT_TIMEOUT }: { timeout: number }) {
    super();
    this.timeout = timeout;
  }

  async run({ command: command_, args, cwd, NODE_ENV, timeout }: { command: string, args: string[], cwd?: string, NODE_ENV: string, timeout?: number }) {
    debug('run', { command_, args, cwd, NODE_ENV, timeout });

    if (timeout) this.timeout = timeout;

    return new Promise( (resolve, reject) => {
      let error = '';
      let stdout  = '';
      let stderr = '';
      let output = '';
      let timer = null;

      //const command = spawn('ls', [ '-lh', '/usr' ]);

      const env = Object.assign({}, process.env);
      env.NODE_ENV = NODE_ENV;

      const options = {
        cwd,
        //  env,
      };
      const command = spawn(command_, args, options);

      command.stdout.on('data', (_data) => {
        const data = _data.toString();
        stdout += data;
        output += data;
        this.emit('stdout', data);
        this.emit('output', data);
        //debug(`stdout: ${data}`);
      });

      command.stderr.on('data', (_data) => {
        const data = _data.toString();
        stderr += data;
        output += data;
        this.emit('stderr', data);


        this.emit('output', data);
        //debug(`stderr: ${data}`);
      });

      command.on('error', (e) => {
        debug(`ERROR:`, e);
        //console.error(`ERROR:`, e);
        error = e.message;
      });

      function handleExit (event, code, signal) {
        debug(`handleExit(): child process ${event} with code: ${code}, signal: ${signal}`);
        if (timer) clearTimeout(timer);
        if (code !== 0) {
          error = error || `non-zero result code: ${code}`;
        }
        return error
               ? reject({ code, error })
               : resolve({ code, output, stdout, stderr });
      }

      command.on('exit', (code, signal) => {
        return handleExit('exit', code, signal);
      });

      command.on('close', (code, signal) => {
        return handleExit('close', code, signal);
      });

      function handleTimeout () {
        error = `timeout ${timeout} ms`;
        debug(`handleTimeout() ERROR: ${error}`);
        //console.error(`ERROR: ${error}`);

        //command.kill('SIGHUP');
        command.kill('SIGINT');
        //command.kill('SIGKILL');
      }

      debug(`setting timer for ${timeout} ms`);
      timer = setTimeout(handleTimeout, timeout);

    });
  }

}


