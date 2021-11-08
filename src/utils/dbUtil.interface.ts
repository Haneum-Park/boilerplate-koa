import mysql from 'mysql2/promise';

export interface ImongoParsedError {
  code: number;
  err?: any;
  errors?: any;
  resolvedMessage?: string;
  message?: any;
}

export interface IMysqlPOOL {
  default: mysql.Pool;
}

export interface IValidateDocRet {
  success: boolean;
  error?: ImongoParsedError
}

export interface IMysqlConvertResult<F> {
  success: boolean;
  doubleDepth: boolean; // ? [][] 이차원 배열 인지 여부
  length: number;
  data: F[] | F[][];
}

export interface IMysqlConvertInsertQueryResult {
  success: boolean;
  data?: mysql.ResultSetHeader;
}

export interface ICountDoc {
  count: number,
}
