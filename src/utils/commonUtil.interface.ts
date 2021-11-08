export type HTTP_METHOD = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'HEAD' | 'DELETE' | 'OPTIONS' | 'TRACE' | 'get' | 'post' | 'put' | 'patch' | 'head' | 'delete' | 'options' | 'trace' | undefined;

export interface IConditionalFilterQuery {
  success: boolean;
  queryString: string;
  binds: any[];
}
