import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createMintForestGateway,
  type DemoGateway,
  type DemoRequest,
} from '../data/mint-forest.gateway';
import { HttpCode } from '../types/api';

export interface DemoRequestError {
  code: HttpCode;
  msg: string;
}

interface DemoRequestConfig<T, Args extends unknown[]> {
  onSuccess?: (data: T, props: Args) => void | Promise<void>;
  onError?: (error: DemoRequestError, props: Args) => void | Promise<void>;
  gateway?: DemoGateway;
}

export function useDemoRequest<T = unknown, Args extends unknown[] = unknown[]>(
  getRequest: (...props: Args) => DemoRequest,
  config: DemoRequestConfig<T, Args> = {},
) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<HttpCode | 'loading' | undefined>();
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const gatewayRef = useRef<DemoGateway | null>(null);
  const getRequestRef = useRef(getRequest);
  const onSuccessRef = useRef(config.onSuccess);
  const onErrorRef = useRef(config.onError);

  if (!gatewayRef.current) {
    gatewayRef.current = config.gateway || createMintForestGateway();
  }

  useEffect(() => {
    getRequestRef.current = getRequest;
    onSuccessRef.current = config.onSuccess;
    onErrorRef.current = config.onError;
  }, [config.onError, config.onSuccess, getRequest]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, []);

  const cancel = useCallback(() => {
    requestIdRef.current += 1;
    if (mountedRef.current) {
      setLoading(false);
      setStatus(undefined);
    }
  }, []);

  const run = useCallback(
    async (...props: Args) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      setLoading(true);
      setStatus('loading');

      let response;
      try {
        response = await gatewayRef.current!.request<T>(getRequestRef.current(...props));
      } catch {
        if (!mountedRef.current || requestIdRef.current !== requestId) return;
        setLoading(false);
        setStatus(HttpCode.Error);
        await onErrorRef.current?.({ code: HttpCode.Error, msg: 'The local demo request failed.' }, props);
        return;
      }

      if (!mountedRef.current || requestIdRef.current !== requestId) return;

      setLoading(false);
      setStatus(response.code);
      if (response.code === HttpCode.Success) {
        await onSuccessRef.current?.(response.data, props);
      } else {
        await onErrorRef.current?.({ code: response.code, msg: response.msg }, props);
      }
    },
    [],
  );

  return { run, cancel, loading, status };
}
