export interface IJwtData {
  id: number;
  email: string;
  name: string;
  isadmin: boolean;
}

export interface IJwtRet {
  success: boolean;
  data?: IJwtData;
  code?: number;
  message?: string;
}

export interface IJwtDecodeData {
  exp: number;
  iat: number;
  header: {
    alg: string;
    typ: string;
  };
  signature: string;
  payload: {
    id: IJwtData['id'];
    email: IJwtData['email'];
    exp: number;
    iat: number;
    isadmin: boolean;
    name: string;
  };
}
