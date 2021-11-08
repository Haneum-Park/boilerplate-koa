/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-shadow */
import mongoose from 'mongoose';

import DB_CONFIG from '@config/dbConfig';
import { logger } from '@src/logger';
import COMMON_UTIL from '@util/commonUtil';
import DB_UTIL from '@util/dbUtil';

if (!COMMON_UTIL.isProduction) {
  mongoose.set('debug', (collectionName: any, method: any, query: any, doc: any) => {
    logger.silly(`${collectionName}.${method}`, JSON.stringify(query), doc);
  });
}
// ! Dev 환경에서 디버깅용

const dbInit = async (): Promise<void> => {
  const DB_TARGET = COMMON_UTIL.isProduction
    ? DB_CONFIG.production.main
    : DB_CONFIG.development.main;
  const {
    dbuser, dbpass, host, database,
  } = DB_TARGET;
  const connectUrl = `mongodb+srv://${host}/${database}?retryWrites=true&w=majority`;
  const connectOption: mongoose.ConnectionOptions = {
    auth: {
      user: dbuser,
      password: dbpass,
    },
    useCreateIndex: true,
    useUnifiedTopology: true,
    useNewUrlParser: true,
    keepAlive: true,
    poolSize: 30,
  };

  function connect() {
    mongoose.connect(connectUrl, connectOption, (err) => {
      if (err) {
        logger.warn('MAIN MONGDB connection error', err);
      } else {
        logger.debug('MAIN MONGODB connected..');
      }
    });
  }
  connect();
  mongoose.connection.on('disconnected', connect);
  mongoose.connection.on('error', connect);

  await COMMON_UTIL.sleep(1000);

  const testConnection = await DB_UTIL.getMysqlConnection();
  try {
    await testConnection.query('SELECT 1');
    logger.debug('MYSQL 정상 실행 가능 확인');
  } catch (err: any) {
    logger.error('MYSQL 실행중 에러 발생.');
    logger.error(JSON.stringify(err));
  }
};

export default dbInit;
