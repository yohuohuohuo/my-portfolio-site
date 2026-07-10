import { create } from 'zustand';
import { AlertType } from '../components/alert.component';
import { IUserInfo } from '../interfaces';
import { energyToLevel } from '../utils';

interface StoreState {
  pageStatus: 'loading' | 'login' | 'complete';
  token?: string;
  userInfo?: IUserInfo;
  otherUserInfo?: IUserInfo;
  clientWidth?: number;
  clientHeight?: number;
  showUnRead?: boolean;
  setState: (newState: Partial<Omit<StoreState, 'setState'>>) => void;
  addAlert?: (message: string, type: AlertType, duration?: number) => void;
  updateTotalAmount: (addAmount: number) => void;
  updateUserInfo: (info: IUserInfo) => void;
}

export const useGlobalStore = create<StoreState>((set) => ({
  clientWidth: 0,
  clientHeight: 0,
  pageStatus: 'loading',
  setState: (newState) => set(newState),
  updateTotalAmount: (addAmount: number) => {
    set((state) => {
      const current = state.userInfo?.mfTotalAmounts || 0;
      return { userInfo: { ...state.userInfo, mfTotalAmounts: String(Number(current) + addAmount) } as IUserInfo };
    });
  },
  updateUserInfo: (info: IUserInfo) => {
    set({ userInfo: info });
  },
}));
