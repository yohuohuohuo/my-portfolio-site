export interface HttpDataType {
  data: any;
  code: number;
  msg: string;
}

export enum HttpProceedStatus {
  Initial = 'initial',
  Loading = 'loading',
  Success = 'success',
  Failed = 'failed',
  Nodata = 'nodata',
}
