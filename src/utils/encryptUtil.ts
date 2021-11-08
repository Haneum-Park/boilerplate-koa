import pbkdf2 from 'pbkdf2';
import crypto from 'crypto';

import { IEncrypt } from '@util/encryptUtil.interface';

namespace ENCRYPT_UTIL {
  export function Encrypt(password: string): IEncrypt {
    const salt: string = crypto.randomBytes(384).toString('base64');
    const hash: string = pbkdf2.pbkdf2Sync(password, salt, 2048, 768, 'sha512').toString('base64');
    return {
      hash,
      salt,
    };
  }

  export function Verify(password: string, hash: string, salt: string): boolean {
    const result: boolean = (
      pbkdf2.pbkdf2Sync(password, salt, 2048, 768, 'sha512').toString('base64') === hash
      || pbkdf2.pbkdf2Sync(password, salt, 2048, 256, 'sha512').toString('base64') === hash
      || pbkdf2.pbkdf2Sync(password, salt, 1024, 256, 'sha512').toString('base64') === hash
    );
    return result;
  }

  export function simpleEnc(value: string, length?: number): string {
    return (
      crypto
        .createHash('sha512')
        .update(value)
        .digest('base64')
        .replace(/[^a-zA-Z0-9 ]/g, '_')
        .slice(0, length || undefined)
    ).trim();
  }
}

export default ENCRYPT_UTIL;
