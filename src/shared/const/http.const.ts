export enum HttpCode {
  Success = 200,
  Error = 500,
  NoData = 5001,
  NotEligible = 5002,
  InvalidParams = 5003,
  InvalidMethod = 5004,
  AuthFailed = 401,
}

export interface HttpResInterface {
  code: HttpCode;
  result: any;
  msg: string;
}

export enum AuthType {
  Required = 'Required',
  Optional = 'Optional',
  Ignored = 'Ignored',
}
