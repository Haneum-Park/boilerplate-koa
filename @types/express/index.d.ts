declare namespace Express {
  export interface Request {
    // decoded?: {[id:string]: any};
    decoded?: Record<string, any>;
  }
  export interface Headers {
    token?: string;
  }
}
