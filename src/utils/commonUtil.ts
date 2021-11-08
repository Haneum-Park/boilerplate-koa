import mongoose from 'mongoose';

import { IConditionalFilterQuery } from '@util/commonUtil.interface';
import { ctxType } from '$type/types';

export * from './commonUtil.interface';

namespace COMMON_UTIL {
  export const isProduction = (!((process.env.NODE_ENV || 'development') === 'development'));

  export const isMasterCluster: boolean = (
    (process.env.NODE_APP_INSTANCE === undefined
    || process.env.NODE_APP_INSTANCE === '0'
    || parseInt(process.env.NODE_APP_INSTANCE, 10) === 0)
    && (process.env.SERVICE_LEVEL === 'master' || process.env.SERVICE_LEVEL === undefined)
  );

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  export function isNotNull(data: any): boolean {
    return typeof data !== 'undefined' && data !== null;
  }

  export function objectHaveKeys(
    obj: Record<string, string>, keys: string[] = [],
  ): [boolean, string[]] {
    const lackKeys: string[] = [];
    let success = true;

    // eslint-disable-next-line no-restricted-syntax
    for (const key of keys) {
      if (key in obj) {
        if (!COMMON_UTIL.isNotNull(obj[key])) {
          lackKeys.push(key);
          success = false;
        }
      } else {
        lackKeys.push(key);
        success = false;
      }
    }
    return [success, lackKeys];
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  export function isJsonString(anyObject: any): boolean {
    try {
      JSON.parse(anyObject);
      return true;
    } catch (e) {
      return false;
    }
  }

  export function errorResult(ctx: ctxType, msg = '', statusCode = 500): void {
    ctx.status = statusCode;
    ctx.body = { status: ctx.status, msg };
  }

  export function lackKeyResult(ctx: ctxType, lackKeys: string[]): void {
    ctx.status = 500;
    ctx.body = { status: ctx.status, msg: `Following Keys must need: ${lackKeys}` };
  }

  export function successResult(ctx: ctxType, data: any = {}, msg = '', statusCode = 200): void {
    ctx.status = statusCode;
    ctx.body = { status: statusCode, msg, data };
  }

  export function convertObjectId(data: string): mongoose.Types.ObjectId {
    return mongoose.Types.ObjectId(data);
  }

  export function convertMongoTimetoKST(time: string | number | Date): Date {
    return new Date(time);
  }

  export function convertPrettyKST(
    time: string | number | Date, simple?: boolean, hmsOnly?: boolean,
  ): string {
    const dateObj = new Date(time);
    const date = (`0${dateObj.getDate()}`).slice(-2);
    const month = (`0${(dateObj.getMonth() + 1)}`).slice(-2);
    const year = dateObj.getFullYear();
    const hour = (`0${dateObj.getHours()}`).slice(-2);
    const minute = (`0${dateObj.getMinutes()}`).slice(-2);
    const second = (`0${dateObj.getSeconds()}`).slice(-2);
    if (simple) {
      if (hmsOnly) return `${hour}:${minute}:${second}`;
      return `${year}${month}${date}_${hour}${minute}${second}`;
    }
    return `${year}-${month}-${date} ${hour}:${minute}:${second}`;
  }

  export function conditionalFilterQuery(
    filterList: string[], valueDict: Record<string, any>,
  ): IConditionalFilterQuery {
    let queryString = 'WHERE ';
    let count = 0;
    const binds: any[] = [];
    for (const [idx, name] of filterList.entries()) {
      if (valueDict[name]) {
        if (count > 0) {
          queryString = `${queryString} AND ${filterList[idx]} = ?`;
        } else {
          queryString = `${queryString} ${filterList[idx]} = ?`;
        }
        binds.push(valueDict[name]);
        count += 1;
      }
    }

    if (count > 0) {
      return { success: true, queryString, binds };
    }
    return { success: false, queryString: '', binds: [] };
  }

  export function sleep(ms: number): Promise<unknown> {
    return new Promise((resolve) => { setTimeout(resolve, ms); });
  }

  export function randomGenerator(n: number, c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
    let r = ''; const cl = c.length; for (let i = 0; i < n; i += 1) { r += c.charAt(Math.floor(Math.random() * cl)); } return r;
  }

  export function randomString(n: number): string {
    return COMMON_UTIL.randomGenerator(n);
  }

  export function randomNumber(n: number): string {
    return COMMON_UTIL.randomGenerator(n, '0123456789');
  }

  export function maskingEmail(email: string): string {
    return email.replace(/(?<=.)[^@](?=[^@]*?[^@]@)|(?:(?<=@.)|(?!^)\\G(?=[^@]*$)).(?=.*[^@]\\.)/gi, '*');
  }

  export function maskingName(name: string): string {
    let maskingStr: string = name;
    if (name.length < 3) maskingStr = name.replace(/(?<=.{1})./gi, '*');
    else maskingStr = name.replace(/(?<=.{2})./gi, '*');
    return maskingStr;
  }

  export function getArrayDepth(ar: unknown): number {
    let depthMax = 1;
    if (Array.isArray(ar)) {
      for (const value of (ar as Array<unknown>)) {
        if (Array.isArray(value)) {
          depthMax = 2;
        }
      }
    }
    return depthMax;
  }

  export function rowsToCamelCase(origin: Record<string, any>): unknown {
    const newobj: Record<string, any> = {};
    for (const [name, value] of Object.entries(origin)) {
      const temp: any = (typeof value === 'string') ? value.trim() : value;
      if (name === 'created_at') newobj.createdAt = temp;
      else if (name === 'updated_at') newobj.updatedAt = temp;
      else newobj[COMMON_UTIL.camelize(name.toLowerCase())] = temp;
    }
    return newobj;
  }

  export function deepcopy(obj: Record<string, any> | any[]): any {
    let clone: Record<string, any> = {};

    if (Array.isArray(obj)) clone = [];
    (Object.keys(obj) as Array<keyof typeof obj>).forEach((key) => {
      if (typeof obj[key] === 'object' && obj[key] !== null && !(obj[key] instanceof Date)) {
        clone[key] = deepcopy(obj[key]);
      } else if (obj[key] instanceof Date) clone[key] = String(obj[key]);
      else clone[key] = obj[key];
    });

    return clone;
  }

  export function camelize(str: string): string {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => (index === 0 ? word.toLowerCase() : word.toUpperCase())).replace(/\s+/g, '');
  }

  export function checkIsPhoneNumber(pn: string): boolean {
    const regExp = /^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})-?[0-9]{3,4}-?[0-9]{4}$/;
    return regExp.test(pn);
  }

  export function getSiteName(str: string): string {
    const siteName = str.split('/')[2]?.split('.');
    if (siteName && str.indexOf('https') > -1) {
      if (siteName.length === 3) return siteName[1] as string;
      return siteName[0] as string;
    }
    return '';
  }
}

export default COMMON_UTIL;
