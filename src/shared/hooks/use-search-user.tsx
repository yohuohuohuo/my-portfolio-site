import { useAxios } from './axios.hook';

export const useSearchUser = (config: { onSuccess?: Function; onError?: Function }) => {
  return useAxios((greenId: string) => {
    return {
      url: '/api/forest/normal/getOtherUserInfo',
      method: 'get',
      params: { greenId },
    };
  }, config);
};
