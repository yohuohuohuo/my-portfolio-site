import axios from 'axios';
import { AuthType, HttpCode } from '../const';
import { axiosInstance } from '../context';
import { isEmpty } from '../utils';

interface IRequest {
  url: string;
  method: string;
  data?: any;
  params?: any;
  headers?: { [name: string]: any };
  onSuccess: (data: any) => void;
  onError?: (error: { code: number | string; msg: string }) => void;
  onAuthError?: () => void;
  authType: AuthType;
}

class HttpService {
  private token: string = '';
  private requestQueue: any[] = [];

  constructor() {}

  setToken(currentTokent: string) {
    this.token = currentTokent;
  }

  retry() {
    if (!this.requestQueue || this.requestQueue.length == 0) return;
    this.request(this.requestQueue[0]);
    this.requestQueue.splice(0, 1);
    this.retry();
  }

  private handleMsg(error?: any) {
    const defaultMsg = 'An error occurred. Please try again later.';
    if (!error) {
      return defaultMsg;
    }

    if (typeof error === 'string') {
      return error || defaultMsg;
    }

    return error.message || error.msg || defaultMsg;
  }

  async request(options: IRequest) {
    if (!this.token && options.authType === AuthType.Required) {
      this.requestQueue.push(options);
      return;
    }

    const cancelTokenSource = axios.CancelToken.source();
    const { url, method, data, params, headers, onSuccess, onError, onAuthError } = options;

    const requestConfig = { url, method, data, params, headers, cancelToken: cancelTokenSource.token };
    const currentHeader = requestConfig.headers || {};
    currentHeader.Authorization = this.token;
    requestConfig.headers = currentHeader;

    try {
      const { code, msg, data } = (await axiosInstance.request(requestConfig)) as any;

      if (code === HttpCode.Success) {
        onSuccess(data);
      } else if (code === HttpCode.AuthFailed) {
        if (isEmpty(this.requestQueue)) {
          onAuthError && onAuthError();
        }
        this.requestQueue.push(options);
      } else {
        onError &&
          onError({
            code,
            msg: this.handleMsg(msg),
          });
      }
    } catch (error: any) {
      onError &&
        onError({
          code: HttpCode.Error,
          msg: this.handleMsg(error),
        });
    }
    return cancelTokenSource;
  }
}

export const httpService = new HttpService();
