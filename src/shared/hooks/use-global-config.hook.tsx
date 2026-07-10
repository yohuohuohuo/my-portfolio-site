import { create } from 'zustand';
import { axiosInstance } from '../context';
import { isEmpty } from '../utils';

interface StoreState {
  totalStealLimit?: number;
  levelConfig?: number[];
  turntableSpent?: number;
  turntableConfig?: { amount: string; id: number; kind: number; name: string; unit: 'MF' | '' }[];
  initGlobalConfig: () => void;
}

export const useGlobalConfig = create<StoreState>((set) => ({
  initGlobalConfig: async () => {
    try {
      const { data } = await axiosInstance.request({
        method: 'get',
        url: '/api/forest/white/getForestConfig',
      });

      if (isEmpty(data) || isEmpty(data.content)) return;

      const newConfig: any = {};
      data.content.forEach((item: any) => {
        const { type, config } = item;
        switch (type) {
          case 'CONFIG_LEVEL':
            newConfig.levelConfig = config.map((i: any) => Number(i.amount));
            break;
          case 'CONFIG_TURNTABLE':
            newConfig.turntableConfig = config;
            break;
          case 'CONFIG_TURNTABLE_LIMIT_TIMES':
            newConfig.totalStealLimit = Number(config[0].amount);
            break;
          case 'CONFIG_STEAL_LIMIT_TIMES':
            newConfig.totalStealLimit = Number(config[0].amount);
            break;
          case 'CONFIG_TURNTABLE_SUBTRACT_MF':
            newConfig.turntableSpent = Number(config[0].amount);
            break;
          default:
            break;
        }
      });

      set(newConfig);
    } catch (error) {}
  },
}));
