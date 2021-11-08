import Koa from 'koa';
import Router from 'koa-router';
import koaBody from 'koa-body';

import indexRouter from '@router/index';
import MIDDLEWARE from '@middleware/middleware';
import { logger } from './logger';

const app:Koa = new Koa();
const port: number = parseInt(`${process.env.PORT || '3000'}`, 10);

app.use(MIDDLEWARE.Cors);
app.use(MIDDLEWARE.CookieParser);
app.use(MIDDLEWARE.Compression);
app.use(MIDDLEWARE.Logger);
app.use(MIDDLEWARE.MongoLogger);

const appRouter = new Router();

const parseOption: koaBody.IKoaBodyOptions = {
  patchNode: true,
  formLimit: '10mb',
  multipart: true,
  formidable: { multiples: false },
  onError: (err) => {
    logger.error('Error While Parse Body - Koabody');
    logger.error(JSON.stringify(err));
  },
};

appRouter.use('/', koaBody(parseOption), indexRouter.routes());

app.use(appRouter.routes())
  .use(appRouter.allowedMethods());

app.listen(port, () => {
  logger.info('Ticket Exhcnager is Online.');
});

export default app;
