import { create } from 'zustand';
import type { IUserInfo } from '../types/api';
import { mintForestGateway, mintForestRepository } from '../data/runtime';

export type MintForestPageStatus = 'loading' | 'login' | 'complete';
export type MintForestAlertType = 'success' | 'info' | 'error';

interface MintForestViewState {
  pageStatus: MintForestPageStatus;
  token: string;
  userInfo?: IUserInfo;
  otherUserInfo?: IUserInfo;
  selectedForestId: string | null;
  clientWidth: number;
  clientHeight: number;
  showUnRead: boolean;
  readNewsTimes: string[];
  audioMuted: boolean;
  hydrated: boolean;
  addAlert?: (message: string, type: MintForestAlertType, duration?: number) => void;
}

export interface MintForestStore extends MintForestViewState {
  setState: (newState: Partial<MintForestViewState>) => void;
  hydrate: () => void;
  syncFromRepository: () => void;
  login: (inviteCode?: string) => Promise<{ success: boolean; msg?: string }>;
  logout: () => Promise<{ success: boolean; msg?: string }>;
  reset: () => void;
  setOtherUserInfo: (userInfo?: IUserInfo) => void;
  clearSelectedForest: () => void;
  updateTotalAmount: (amount: number) => void;
  updateUserInfo: (info: IUserInfo) => void;
  markNewsRead: (times: string[]) => void;
  setAudioMuted: (muted: boolean) => void;
}

const INITIAL_VIEW_STATE: MintForestViewState = {
  pageStatus: 'loading',
  token: '',
  selectedForestId: null,
  clientWidth: 0,
  clientHeight: 0,
  showUnRead: false,
  readNewsTimes: [],
  audioMuted: false,
  hydrated: false,
};

function toViewState(): Pick<MintForestViewState, 'pageStatus' | 'token' | 'userInfo' | 'selectedForestId' | 'readNewsTimes' | 'audioMuted'> {
  const state = mintForestRepository.get();
  const loggedIn = state.session.loggedIn;
  return {
    pageStatus: loggedIn ? 'complete' : 'login',
    token: loggedIn ? state.session.token : '',
    userInfo: loggedIn ? { ...state.users[state.session.userGreenId], infoType: 'mine' } : undefined,
    selectedForestId: state.selectedForestId,
    readNewsTimes: [...state.readNewsTimes],
    audioMuted: state.preferences.audioMuted,
  };
}

export const useMintForestStore = create<MintForestStore>((set, get) => ({
  ...INITIAL_VIEW_STATE,
  setState: (newState) => set(newState),
  hydrate: () => {
    set({ ...toViewState(), hydrated: true });
  },
  syncFromRepository: () => {
    set({ ...toViewState(), hydrated: true });
  },
  login: async (inviteCode = '') => {
    const response = await mintForestGateway.request<string>({
      url: '/api/forest/user/auth',
      method: 'POST',
      data: {
        wallet_address: 'demo-user-1001',
        signature: '',
        message: '',
        invitation_code: inviteCode,
      },
    });
    if (response.code !== 200) return { success: false, msg: response.msg };
    get().syncFromRepository();
    return { success: true };
  },
  logout: async () => {
    const result = await mintForestGateway.logout();
    get().syncFromRepository();
    set({ otherUserInfo: undefined, selectedForestId: null });
    mintForestRepository.update((state) => ({ ...state, selectedForestId: null }));
    return result;
  },
  reset: () => {
    mintForestGateway.reset();
    set({ ...toViewState(), otherUserInfo: undefined, hydrated: true });
  },
  setOtherUserInfo: (userInfo) => set({ otherUserInfo: userInfo, selectedForestId: userInfo ? String(userInfo.greenId) : null }),
  clearSelectedForest: () => {
    mintForestRepository.update((state) => ({ ...state, selectedForestId: null }));
    set({ otherUserInfo: undefined, selectedForestId: null });
  },
  updateTotalAmount: (amount) => {
    const current = mintForestRepository.get();
    const user = current.users[current.session.userGreenId];
    if (!user) return;
    const next = { ...user, mfTotalAmounts: String(Number(user.mfTotalAmounts) + amount) };
    mintForestRepository.update((state) => ({ ...state, users: { ...state.users, [current.session.userGreenId]: next } }));
    set({ userInfo: { ...next, infoType: 'mine' } });
  },
  updateUserInfo: (info) => {
    const current = mintForestRepository.get();
    mintForestRepository.update((state) => ({ ...state, users: { ...state.users, [current.session.userGreenId]: info } }));
    set({ userInfo: { ...info, infoType: 'mine' } });
  },
  markNewsRead: (times) => {
    const current = mintForestRepository.get();
    const readNewsTimes = Array.from(new Set([...current.readNewsTimes, ...times]));
    mintForestRepository.update((state) => ({ ...state, readNewsTimes }));
    set({ readNewsTimes, showUnRead: false });
  },
  setAudioMuted: (muted) => {
    mintForestRepository.update((state) => ({ ...state, preferences: { ...state.preferences, audioMuted: muted } }));
    set({ audioMuted: muted });
  },
}));

export const useGlobalStore = useMintForestStore;
