import http from 'http';

export declare type ConnectMiddleware = (
  // eslint-disable-next-line no-unused-vars
  req: http.IncomingMessage,
  // eslint-disable-next-line no-unused-vars
  res: http.ServerResponse,
  // eslint-disable-next-line no-unused-vars
  callback: (...args: unknown[]
) => void) => void;
