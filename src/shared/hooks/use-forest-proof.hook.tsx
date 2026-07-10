import { Address } from 'viem';
import { sendTransaction, waitForTransactionReceipt } from 'wagmi/actions';
import { ForestContract } from '../const';
import { useAxios } from './axios.hook';
import { connectConfig } from './use-web3.hook';

export const useForestProof = (
  getParams: (...props: any) => {
    params?: any;
  },
  {
    onSuccess,
    onError,
    onFinally,
    debounceInterval,
  }: {
    onSuccess?: Function;
    onError?: Function;
    onFinally?: Function;
    debounceInterval?: number;
  }
) => {
  return useAxios(
    (...params) => ({
      url: '/api/tree/get-forest-proof',
      method: 'GET',
      ...getParams(...params),
    }),
    {
      debounce: debounceInterval,
      onSuccess: async (res: any, params: any[]) => {
        try {
          const hash = await sendTransaction(connectConfig, {
            to: ForestContract as Address,
            data: res.tx,
          });

          const { status } = await waitForTransactionReceipt(connectConfig, {
            hash,
          });

          if (status === 'success') {
            onSuccess && onSuccess(res, params);
          } else {
            onError &&
              onError({
                code: 'trans_error',
                msg: 'An error occurred. Please try again later.',
              });
          }
        } catch (error: any) {
          onError &&
            onError({
              code: 'trans_error',
              msg: error.message,
            });
        }
        onFinally && onFinally(params);
      },
      onError: (error: any, params: any[]) => {
        onError && onError(error);
        onFinally && onFinally(params);
      },
    }
  );
};
