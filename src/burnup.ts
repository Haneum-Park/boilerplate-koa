import COMMON_UTIL from '@util/commonUtil';

import { logger } from './logger';
// ? 시드 생성 분기 타기?

async function burnup(): Promise<void> {
  if (COMMON_UTIL.isMasterCluster) {
    logger.debug("It's Master!");
  }
}

export { burnup };
