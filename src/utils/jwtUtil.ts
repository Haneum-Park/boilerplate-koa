import jwt from 'jsonwebtoken';

import { secretKey, options } from '@config/jwtConfig';
import {
  IJwtData,
  IJwtRet,
  IJwtDecodeData,
} from './jwtUtil.interface';

export * from './jwtUtil.interface';

namespace JWT_UTIL {
  export const errorTable: { [id:string]: string} = {
    '-2': 'String returned..', // Object를 반환하도록 생각하였는데 string이 리턴됨
    '-1': 'Unknown', // 모르는 에러
    0: 'TokenExpired', // 토큰 만료됨
    1: 'JsonWebTokenError', // webtoken Error 통틀어서
    2: 'NotBeforeError', // Json 아직 active 되지 않음.
  };

  export function sign(data: IJwtData): string {
    return jwt.sign(data, secretKey, options);
  }

  export function verify(token: string): IJwtRet {
    try {
      const data: string | Record<string, any> = jwt.verify(token, secretKey);
      if (typeof data === 'string') return { success: false, code: -2, message: data } as IJwtRet;
      return { success: true, data: data as IJwtData };
    } catch (err: any) {
      let code = -1;
      let message = '';
      if (err instanceof jwt.TokenExpiredError) code = 0;
      else if (err instanceof jwt.JsonWebTokenError) code = 1;
      else if (err instanceof jwt.NotBeforeError) code = 2;

      if (err.message) message = err.message;

      return { success: false, code, message } as IJwtRet;
    }
  }

  export function decode(
    token: string,
  ): IJwtDecodeData | null {
    return jwt.decode(token, { complete: true }) as (
      IJwtDecodeData
    );
  }
}

export default JWT_UTIL;
