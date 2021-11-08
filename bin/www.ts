#!/usr/bin/env node
import { logger } from '@src/logger';
import EMAIL_CONFIG from '@config/emailConfig';
import EMAIL_UTIL from '@util/emailUtil';

import dbInit from './dbInit';
import packageData from '../package.json';

const isProduction = (!((process.env.NODE_ENV || 'development') === 'development'));

process.env.TZ = 'Asia/Seoul';

if (isProduction) {
  process
    .on('uncaughtException', async (err) => {
      const errorMessage = `ERROR MESSAGE: \n${err.message}\n\n\nSTACK:\n${err.stack}\n\n\nNAME:\n${err.name}`;
      EMAIL_UTIL.justsendMail(EMAIL_CONFIG.errorTo, `${packageData.name.toUpperCase()} UNHANDLE EXCEPTION`, errorMessage);
    })
    .on('unhandledRejection', async (reason, p) => {
      const errorMessage = `REASON:\n\n${reason}\n\n\n\nPROMISE: \n\n${JSON.stringify(p)}`;
      EMAIL_UTIL.justsendMail(EMAIL_CONFIG.errorTo, `${packageData.name.toUpperCase()} UNHANDLE Rejection`, errorMessage);
    });
}
// ! Production 환경일경우, 메일을통해 에러 메세지 보내기

dbInit().then(() => {
  logger.info('모든 DATABASE가 준비완료되었습니다. 서버를 시작합니다.');

  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  const burnUpModule = require('@src/burnup');
  burnUpModule.burnup().then(() => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    require('@src/app');
  });
});
// ! DATABASE 실행 완료한경우, 앱실행
