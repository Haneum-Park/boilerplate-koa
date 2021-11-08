import Koa from 'koa';
import JWT_UTIL from '@src/utils/jwtUtil';

declare module 'koa' {
  interface DefaultContext extends Koa.DefaultContextExtends {
    decoded?: JWT_UTIL.IJwtData;
    [key: string]: any;
  }
}