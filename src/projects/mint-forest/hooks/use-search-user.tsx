import type { IUserInfo } from '../types/api';
import { mintForestGateway } from '../data/runtime';
import { useDemoRequest } from './use-demo-request.hook';

interface SearchUserConfig {
  onSuccess?: (data: IUserInfo, props: [string]) => void | Promise<void>;
  onError?: (error: { code: number; msg: string }, props: [string]) => void | Promise<void>;
}

export const useSearchUser = (config: SearchUserConfig = {}) => {
  return useDemoRequest<IUserInfo, [string]>(
    (greenId) => ({
      url: '/api/forest/normal/getOtherUserInfo',
      method: 'GET',
      params: { greenId },
    }),
    {
      gateway: mintForestGateway,
      onSuccess: async (data, props) => {
        await config.onSuccess?.({ ...data, infoType: 'other' }, props);
      },
      onError: config.onError,
    },
  );
};
