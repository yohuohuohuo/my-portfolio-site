import { debounce } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AuthType, HttpCode } from '../const';
import { httpService } from '../services';
import { NotifyEvent, notifyService } from '../services/notify.service';
import { isEmpty } from '../utils';
import { useAlert } from './use-alert.hook';

export const useAxios = <T = any,>(
  getParams: (...props: any) => {
    url: string;
    method: string;
    data?: any;
    params?: any;
    headers?: { [name: string]: any };
  },
  config?: {
    onSuccess?: Function;
    onError?: Function;
    debounce?: number;
    authType?: AuthType;
    original?: boolean;
  }
) => {
  const { onSuccess, onError, authType } = config || {};
  const alert = useAlert();

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<HttpCode | 'loading' | undefined>();

  const cancelTokenRef = useRef<any>(null);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const cancel = () => {
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel();
    }
  };

  const request = useCallback(
    async (...props: any) => {
      setLoading(true);
      setStatus('loading');

      const { url, method, data, params, headers } = getParams(...props);

      cancelTokenRef.current = await httpService.request({
        url,
        method,
        data,
        params,
        headers,
        authType: authType || AuthType.Required,
        onSuccess: (data) => {
          setLoading(false);
          cancelTokenRef.current = null;

          if (config?.original) {
            setStatus(HttpCode.Success);
            if (onSuccessRef.current) {
              onSuccessRef.current(data, [...props]);
            }
            return;
          }

          if (isEmpty(data)) {
            setStatus(HttpCode.NoData);
            onErrorRef.current && onErrorRef.current({ code: HttpCode.NoData, msg: 'no data' }, [...props]);
            return;
          }

          setStatus(HttpCode.Success);
          if (onSuccessRef.current) {
            onSuccessRef.current(data, [...props]);
          }
        },
        onError: ({ code, msg }) => {
          setStatus(code as HttpCode);
          setLoading(false);
          cancelTokenRef.current = null;

          if (onErrorRef.current) {
            onErrorRef.current({ code: code, msg });
          } else {
            alert.error(msg);
          }
        },
        onAuthError: () => {
          setLoading(false);
          cancelTokenRef.current = null;
          setStatus(HttpCode.AuthFailed);

          notifyService.notify(NotifyEvent.LOGIN_REFRESH);
        },
      });
    },
    [getParams, authType, alert]
  );

  const run = useMemo(() => {
    return config?.debounce ? debounce(request, config.debounce) : request;
  }, [request, config?.debounce]);

  return { cancel, run, loading, status };
};
