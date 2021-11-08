/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
import * as express from 'express';
import winston from 'winston';
import 'winston-mongodb';
import expressWinston from 'express-winston';
import COMMON_UTIL from '@util/commonUtil';

import DB_CONFIG from '@config/dbConfig';

const {
  combine, timestamp, label, printf, json, metadata,
} = winston.format;

const myFormat = printf(({
  level, message, label, timestamp, ...rest
}) => {
  const prettyTime = COMMON_UTIL.convertPrettyKST(timestamp);
  let prettyMessage = '';
  try {
    prettyMessage = `\n${JSON.stringify(JSON.parse(message), undefined, 2)}`;
  } catch (err) {
    try {
      if (typeof (message) !== 'string') prettyMessage = `\n${JSON.stringify(message, undefined, 2)}`;
      else prettyMessage = message;
    } catch (err2) {
      prettyMessage = message;
    }
  }
  let restString = JSON.stringify(rest, undefined, '\t');
  restString = restString === '{}' ? '' : `\n${restString.replace(/\\n/gi, '\n')}`;
  return `CLUSTER: <${process.env.NODE_APP_INSTANCE || '0'}> (${label}) [ ${prettyTime} ] <${level}>: ${prettyMessage}${restString}`;
});

// eslint-disable-next-line no-unused-vars
const myExpressFormat = printf(({
  level, message, label, timestamp,
}) => `CLUSTER: <${process.env.NODE_APP_INSTANCE || '0'}> (${label}) [ ${COMMON_UTIL.convertPrettyKST(timestamp)} ] <${level}>: ${JSON.stringify(message, null, '\t').replace('\\n', '\n')}`);

const DB_TARGET = COMMON_UTIL.isProduction
  ? DB_CONFIG.production.logger
  : DB_CONFIG.development.logger;

const {
  dbuser, dbpass, host, database,
} = DB_TARGET;
const connectUrl = `mongodb+srv://${host}/${database}?retryWrites=true&w=majority`;

const options = {
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
    format: combine(
      winston.format.colorize(),
      label({ label: 'API' }),
      timestamp(),
      myFormat,
    ),
    prettyPrint: true,
  },
  mongodb: {
    db: connectUrl,
    level: 'debug',
    collection: 'Log',
    options: {
      auth: {
        user: dbuser,
        password: dbpass,
      },
      useUnifiedTopology: true,
      useNewUrlParser: true,
      keepAlive: true,
      poolSize: 30,
    },
    format: combine(
      label({ label: 'API' }),
      timestamp(),
      metadata(),
      json(),
    ),
    json: true,
    handleExceptions: true,
    colorize: false,
  },
  expressConsole: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
    expressFormat: true,
    format: combine(
      label({ label: 'HTTP' }),
      timestamp(),
      myExpressFormat,
    ),
  },
  expressMongo: {
    db: connectUrl,
    level: 'info',
    collection: 'ticket_exchange_httpLog',
    options: {
      auth: {
        user: dbuser,
        password: dbpass,
      },
      useUnifiedTopology: true,
      useNewUrlParser: true,
      keepAlive: true,
      poolSize: 30,
    },
    format: combine(
      timestamp(),
      metadata(),
      json(),
    ),
  },
};

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(options.console),
  ],
  exitOnError: false,
});

const expressLevelFilter = (req: express.Request, res: express.Response) => {
  let level = '';
  if (res.statusCode >= 100) { level = 'info'; }
  if (res.statusCode >= 400) { level = 'warn'; }
  if (res.statusCode >= 500) { level = 'error'; }
  if (res.statusCode === 401 || res.statusCode === 403) { level = 'error'; }
  if (req.path === '/') { level = 'debug'; }
  return level;
};

const expressLogger = expressWinston.logger({
  transports: [
    new winston.transports.Console(options.expressConsole),
  ],
  level: expressLevelFilter,
  meta: false,
  expressFormat: true,
});
const { transports } = winston;

const expressMongoLogger = expressWinston.logger({
  transports: [
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (transports as any).MongoDB(options.expressMongo),
  ],
  level: expressLevelFilter,
  meta: true,
  expressFormat: false,
  colorize: false,
  format: winston.format.json(),
});

winston.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  debug: 'green',
  silly: 'yellow',
});

export {
  logger,
  options,
  expressLogger,
  expressMongoLogger,
};
