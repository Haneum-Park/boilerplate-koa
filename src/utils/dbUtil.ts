/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import mongoose from 'mongoose';
import mysql from 'mysql2/promise';

import EMAIL_CONFIG from '@config/emailConfig';
import DB_CONFIG from '@config/dbConfig';
import COMMON_UTIL from '@util/commonUtil';
import {
  ImongoParsedError,
  IMysqlPOOL,
  IValidateDocRet,
  IMysqlConvertResult,
  IMysqlConvertInsertQueryResult,
  ICountDoc,
} from './dbUtil.interface';
import EMAIL_UTIL from './emailUtil';

import packageData from '../../package.json';

export * from './dbUtil.interface';

const DB_ENV = COMMON_UTIL.isProduction
  ? DB_CONFIG.production
  : DB_CONFIG.development;
const DB_MYSQL = DB_ENV.mysql;

const createPoolOption: mysql.PoolOptions = {
  host: DB_MYSQL.host,
  user: DB_MYSQL.user,
  password: DB_MYSQL.password,
  database: DB_MYSQL.database,
  connectionLimit: 50,
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
};

const mysqlPool: IMysqlPOOL = { default: mysql.createPool(createPoolOption) };

const mysqlPoolInit = () => {
  mysqlPool.default.on('connection', (conn) => {
    conn.on('connection', () => {
      console.log('생성!!');
    });
    conn.on('error', () => {
      console.error(`CONNECTION ${conn.threadId} 에서 에러 발생으로, 강제 반환시킵니다.`);
      conn.release();
    });
  });
};

const mysqlPoolReInit = () => {
  mysqlPool.default.removeAllListeners();
  mysqlPool.default.end();
  mysqlPool.default = mysql.createPool(createPoolOption);
  mysqlPoolInit();
};

const keepItAlive = () => {
  mysqlPool.default.getConnection().then((conn) => {
    conn.ping();
    conn.release();
  }).catch((err) => {
    mysqlPoolReInit();
    const errorMessage = `ERROR MESSAGE: \n${err.message}\n\n\nSTACK:\n${err.stack}\n\n\nNAME:\n${err.name}`;
    console.log(errorMessage);
    EMAIL_UTIL.justsendMail(EMAIL_CONFIG.errorTo, `${packageData.name} MYSQL DATABASE KEEPITALIVE ERROR`, errorMessage);
  });
};

mysqlPoolInit();

// ? 최후의 방법, 지속적 pinging
setInterval(keepItAlive, 60 * 1000);

namespace DB_UTIL {
  // ! validDoc 오류별로 정리해둠.
  export const mongoErrDict: { [id: string]: string} = {
    '-1': 'unknown Error',
    0: 'success',
    1: 'castError',
    2: 'array projection and then modified the array in an unsafe way',
    3: 'Document Not Found',
    4: 'models are not Registered Yet,',
    5: 'Model with Given Name Already Registered!!',
    6: 'save Called Multiple Time On Same Document!!',
    7: 'model is on struct mode.. must have no changes on immutable properties',
    8: 'validation Error Check errors param',
    9: 'validator Errors Check erros param',
  };

  export function mongoErrorParser(err: mongoose.Error | any): ImongoParsedError {
    let retCode = 0;
    if (err) {
      if (err instanceof mongoose.Error) {
        retCode = -1;
        if (err instanceof mongoose.Error.CastError) retCode = 1;
        else if (err instanceof mongoose.Error.DivergentArrayError) retCode = 2;
        else if (err instanceof mongoose.Error.DocumentNotFoundError) retCode = 3;
        else if (err instanceof mongoose.Error.MissingSchemaError) retCode = 4;
        else if (err instanceof mongoose.Error.OverwriteModelError) retCode = 5;
        else if (err instanceof mongoose.Error.ParallelSaveError) retCode = 6;
        // else if (err instanceof mongoose.Error.StrictMode) retCode = 7;
        // ? StrictMode Disabled Currently
        else if (err instanceof mongoose.Error.ValidationError) retCode = 8;
        else if (err instanceof mongoose.Error.ValidatorError) retCode = 9;
      }
    }
    const retDict: ImongoParsedError = {
      code: retCode,
      err: retCode !== 0
        ? err
        : undefined,
      errors: retCode !== 0
        ? err.errors
        : undefined,
      resolvedMessage: retCode !== 0
        ? mongoErrDict[retCode.toString()]
        : undefined,
      message: retCode !== 0
        ? (err as mongoose.Error).message
        : undefined,
    };
    return retDict;
  }

  export function validateDoc<T extends mongoose.Document>(instance: T): IValidateDocRet {
    const err = instance.validateSync();

    if (err) {
      const retDict: IValidateDocRet = { success: false, error: mongoErrorParser(err) };
      return retDict;
    }
    const retDict: IValidateDocRet = { success: true };
    return retDict;
  }

  export const getMysqlPool = mysqlPool.default;

  export async function getMysqlConnection(): Promise<mysql.PoolConnection> {
    try {
      const conn = await getMysqlPool.getConnection();
      conn.config.namedPlaceholders = true;
      return conn;
    } catch (err) {
      console.error(err);
      await mysqlPoolReInit();
    }
    const conn = await getMysqlPool.getConnection();
    return conn;
  }

  export function mysqlConvertResultAsInsertQuery(
    result: mysql.RowDataPacket[][]
    | mysql.RowDataPacket[]
    | mysql.OkPacket
    | mysql.OkPacket[]
    | mysql.ResultSetHeader,
  ): IMysqlConvertInsertQueryResult {
    let success = false;
    let data: mysql.ResultSetHeader | undefined;

    if (result.constructor.name === 'ResultSetHeader') {
      success = true;
      const tempRow = (result as unknown as (mysql.ResultSetHeader));
      data = tempRow;
    }

    return { success, data };
  }

  export function mysqlConvertResult<F>(
    result
    : mysql.RowDataPacket[][]
    | mysql.RowDataPacket[]
    | mysql.OkPacket
    | mysql.OkPacket[]
    | mysql.ResultSetHeader,
  ): IMysqlConvertResult<F> {
    let success = false;
    let doubleDepth = false;
    let length = -1;
    let data: F[] | F[][];
    if (result.constructor.name === 'RowDataPacket' || result.constructor.name === 'Array') {
      success = true;
      const tempRow = (result as unknown as (mysql.RowDataPacket[][] | mysql.RowDataPacket[]));
      length = tempRow.length;
      if (tempRow.length > 0) doubleDepth = (COMMON_UTIL.getArrayDepth(tempRow) > 1);
      if (doubleDepth) {
        const tempData: F[][] = [];
        for (const fIdx in tempRow as unknown as mysql.RowDataPacket[][]) {
          if (fIdx) {
            const tempDataSecond: F[] = [];
            for (const sIdx in tempRow[fIdx] as unknown as mysql.RowDataPacket[]) {
              if (sIdx) {
                tempDataSecond.push(tempRow[fIdx]![sIdx] as unknown as F);
              }
            }
            tempData.push(tempDataSecond);
          }
        }
        data = Object.values(JSON.parse(JSON.stringify(tempData))) as F[][];
      } else {
        const tempData: F[] = [];
        for (const idx in tempRow as unknown as mysql.RowDataPacket[]) {
          if (idx) tempData.push(tempRow[idx] as unknown as F);
        }
        data = Object.values(JSON.parse(JSON.stringify(tempData))) as F[];
      }
      return {
        success,
        doubleDepth,
        length,
        data,
      };
    }
    return {
      success: false,
      doubleDepth: false,
      length: -1,
      data: [] as F[],
    };
  }

  export function getDefault(): mongoose.Connection { return mongoose.connection; }

  export function mysqlGetCount(rows
  : mysql.RowDataPacket[][]
  | mysql.RowDataPacket[]
  | mysql.OkPacket
  | mysql.OkPacket[]
  | mysql.ResultSetHeader): number {
    // * SELECT COUNT(~~~) as count from ~~~~ 이런 식으로 작성된 경우 count 를 바로 반환 해주도록 유틸 함수 식으로 만듦
    const result = DB_UTIL.mysqlConvertResult<ICountDoc>(rows);
    return (result.success && result.length > 0) ? (result.data[0] as ICountDoc).count : 0;
  }
}

export default DB_UTIL;
