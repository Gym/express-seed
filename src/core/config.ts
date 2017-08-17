import * as config from 'config';
import { sync } from 'glob';
import { union } from 'lodash';
import * as path from 'path';
import { argv } from 'yargs';

export const ENV = process.env.NODE_ENV || 'development';

export class DbConfig {
  host: string = 'localhost';
  port: number = 27017;
  database: string = 'express';
  options?: any = {
    useMongoClient: true
  };
  promise?: any = global.Promise;
}

export class Config {
  /**
   * The name of the application as defined in the `package.json`.
   */
  APP_NAME = appName();

  /**
   * The version of the application as defined in the `package.json`.
   */
  APP_VERSION = appVersion();

  ENV: string = ENV;

  DEBUG = argv['debug'] || false;

  PORT = argv['port'] || this.options.port || 8082;

  db: DbConfig = this.options.mongodb || new DbConfig();

  PUBLIC_DIR = this.options.public;

  services: string = './src/*/index.ts';
  models: string = './src/*/models/**/*.ts';

  constructor(private options: any) { }

  get(key: string): any {
    return this.options[key];
  }

  globFiles(location: string): Array<string> {
    return union([], sync(location));
  }
}

function appName(): string {
  var pkg = require('../../package.json');
  return pkg.name;
}

/**
 * Returns the applications version as defined in the `package.json`.
 * @return {number} The applications version.
 */
function appVersion(): number | string {
  var pkg = require('../../package.json');
  return pkg.version;
}

const configuration: Config = new Config(convert(config));
export default configuration;

function convert(current) {
  var result = Array.isArray(current) ? [] : {};

  Object.keys(current).forEach(function (name) {
    var value = current[name];

    if ((typeof value === 'undefined' ? 'undefined' : typeof(value)) === 'object' && value !== null) {
      value = convert(value);
    }

    if (typeof value === 'string') {
      if (value.indexOf('\\') === 0) {
        value = value.replace('\\', '');
      } else {
        if (process.env[value]) {
          // value = process.env[value];
        } else if (value.indexOf('.') === 0 || value.indexOf('..') === 0) {
          // Make relative paths absolute
          value = path.resolve(path.join(config.util.getEnv('NODE_CONFIG_DIR')), value.replace(/\//g, path.sep));
        }
      }
    }

    result[name] = value;
  });

  return result;
}
