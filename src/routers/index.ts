import Router from 'koa-router';
import packageData from '@root/package.json';
import { ctxType } from '$type/types';

const router = new Router();

router.get('/', async (ctx: ctxType) => {
  const level: string = (process.env.SERVICE_LEVEL || 'NO LEVEL');
  const { version } = packageData;
  ctx.status = 200;

  const data: Record<string, any> = {
    status: ctx.status,
    msg: "I'm Alive!",
    version,
    level,
  };
  ctx.body = data;
});

export default router;
