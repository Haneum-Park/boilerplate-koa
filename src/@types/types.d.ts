import Koa from 'koa';
import Router from 'koa-router';
import { ImongoParsedError } from '@util/databaseUtil';

export interface ICommonRet {
  success: boolean;
  reason?: string;
  error?: any;
}

export interface ICommonMongoRet {
  success: boolean;
  reason?: string;
  error?: ImongoParsedError;
}

export type ctxType = (
  Koa.ParameterizedContext<any, Koa.DefaultContext & Router.IRouterParamContext<any, Koa.DefaultContext>, unknown>
  | Koa.Context
);

// 모듈로 인식해주기 위해 트릭
export {};