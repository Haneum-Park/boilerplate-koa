import { IncomingMessage as originIncomingMessage } from 'http';
declare module "http" {
  export interface IncomingHttpHeaders {
    token?: string;
  }
  export interface IncomingMessage {
    cookies?: Record<string, string>;
    body?: any;//Record<string, any>;
    files?: any;
  }
  
}