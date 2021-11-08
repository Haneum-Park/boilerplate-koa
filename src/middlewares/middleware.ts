import Koa from 'koa';
import cookieParser from 'cookie-parser';
import c2k from 'koa-connect';
import compress from 'koa-compress';
import zlib from 'zlib';
import { json } from 'express';
import { expressLogger, expressMongoLogger } from '@src/logger';
import { ctxType } from '$type/types';
import { ConnectMiddleware } from './middleware.interface';

const koaCompression = compress({
  threshold: 0,
  gzip: {
    flush: zlib.constants.Z_SYNC_FLUSH,
  },
  deflate: {
    flush: zlib.constants.Z_SYNC_FLUSH,
  },
  br: {
    flush: zlib.constants.Z_SYNC_FLUSH,
  },
});

namespace MIDDLEWARE {
  export const bodyParser = c2k(json({ limit: '50mb' }));
  export const CookieParser = c2k(cookieParser() as ConnectMiddleware);
  export const Compression = koaCompression;

  export const Logger = c2k(expressLogger as ConnectMiddleware);
  export const MongoLogger = c2k(expressMongoLogger as ConnectMiddleware);
  export async function Cors(ctx: ctxType, next: Koa.Next): Promise<void> {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    ctx.set('Access-Control-Allow-Headers', 'accept, accept-language, accept-encoding, content-language, content-type, token, origin, referer, cookie, host, connection, x-requested-with, authorization');
    await next();
  }
}

export default MIDDLEWARE;
