import { create } from 'zustand';
import type { ForestConfigItem } from '../types/api';
import { mintForestGateway } from '../data/runtime';

interface MintForestConfigState {
  totalStealLimit?: number;
  levelConfig?: number[];
  turntableSpent?: number;
  turntableConfig?: ForestConfigItem['config'];
  initGlobalConfig: () => Promise<void>;
}

export const useGlobalConfig = create<MintForestConfigState>((set) => ({
  initGlobalConfig: async () => {
    const response = await mintForestGateway.request<{ content: ForestConfigItem[] }>({
      url: '/api/forest/white/getForestConfig',
      method: 'GET',
    });
    if (response.code !== 200 || !response.data.content.length) return;

    const next: Pick<MintForestConfigState, 'totalStealLimit' | 'levelConfig' | 'turntableSpent' | 'turntableConfig'> = {};
    response.data.content.forEach((item) => {
      switch (item.type) {
        case 'CONFIG_LEVEL':
          next.levelConfig = item.config.map((config) => Number(config.amount));
          break;
        case 'CONFIG_TURNTABLE':
          next.turntableConfig = item.config;
          break;
        case 'CONFIG_TURNTABLE_LIMIT_TIMES':
        case 'CONFIG_STEAL_LIMIT_TIMES':
          next.totalStealLimit = Number(item.config[0]?.amount);
          break;
        case 'CONFIG_TURNTABLE_SUBTRACT_MF':
          next.turntableSpent = Number(item.config[0]?.amount);
          break;
        default:
          break;
      }
    });
    set(next);
  },
}));
