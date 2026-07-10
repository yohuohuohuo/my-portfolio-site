import { createSeedState } from './fixtures/seed.fixture';
import type { ActivityItem, BoxItem, IUserInfo, SpinResult, TaskVerifyResult } from '../types/api';
import { DEMO_VALUES, type MintForestDemoState } from '../types/demo-state';

interface MutationResult<T> {
  success: boolean;
  msg?: string;
  data: T;
}

export interface RuleResult<T> {
  state: MintForestDemoState;
  result: MutationResult<T>;
}

const USER_ID = DEMO_VALUES.userGreenId;

function cloneState(state: MintForestDemoState): MintForestDemoState {
  return JSON.parse(JSON.stringify(state)) as MintForestDemoState;
}

function failure<T>(state: MintForestDemoState, msg: string): RuleResult<T> {
  return { state: cloneState(state), result: { success: false, msg, data: undefined as T } };
}

function user(state: MintForestDemoState) {
  return state.users[USER_ID];
}

function withUser(state: MintForestDemoState, patch: Partial<IUserInfo>): MintForestDemoState {
  const users: Record<string, IUserInfo> = {
    ...state.users,
    [USER_ID]: { ...user(state), ...patch },
  };
  return { ...state, users };
}

function addAmount(state: MintForestDemoState, value: number) {
  return withUser(state, { mfTotalAmounts: String(Number(user(state).mfTotalAmounts) + value) });
}

function addActivity(state: MintForestDemoState, txType: number, amount: number, name: string, targetId = 0) {
  const sequence = state.nextEventSequence + 1;
  const createTime = new Date(Date.parse(DEMO_VALUES.baseEventTime) + sequence * 1000).toISOString();
  const event: ActivityItem = {
    wallet: user(state).wallet,
    domain: user(state).domain || DEMO_VALUES.userDomain,
    txType,
    txHash: `demo-event-${sequence}`,
    status: 1,
    contract: 'demo-contract',
    tokenId: '',
    destination: user(state).domain || DEMO_VALUES.userDomain,
    amount,
    targetId,
    turntableUnit: 'MF',
    name,
    createTime,
  };

  return { ...state, nextEventSequence: sequence, activities: [...state.activities, event] };
}

function requireLogin<T>(state: MintForestDemoState): RuleResult<T> | null {
  return state.session.loggedIn ? null : failure<T>(state, 'Please enter the local demo first.');
}

export function login(state: MintForestDemoState, _inviteCode: string): RuleResult<{ token: string }> {
  const nextState = cloneState(state);
  nextState.session = { ...nextState.session, loggedIn: true, token: 'demo-session-v1' };
  return { state: nextState, result: { success: true, data: { token: 'demo-session-v1' } } };
}

export function logout(state: MintForestDemoState): RuleResult<null> {
  const nextState = cloneState(state);
  nextState.session = { ...nextState.session, loggedIn: false, token: '' };
  nextState.selectedForestId = null;
  return { state: nextState, result: { success: true, data: null } };
}

export function claimGreenId(state: MintForestDemoState): RuleResult<{ greenId: number }> {
  const auth = requireLogin<{ greenId: number }>(state);
  if (auth) return auth;
  if (state.claims.greenId) return failure(state, 'GreenID has already been claimed.');

  const nextState = withUser(state, { greenIdStatus: 1 });
  nextState.claims = { ...nextState.claims, greenId: true };
  nextState.nfts = [
    ...nextState.nfts,
    {
      nftUniqueNum: 'demo-greenid-1001',
      contract: 'demo-contract',
      tokenId: '1001',
      name: 'GreenID#1001',
      logo: '/projects/mint-forest/images/nft/greenid-demo.png',
      speedAmount: '',
    },
  ];
  return { state: cloneState(nextState), result: { success: true, data: { greenId: 1001 } } };
}

export function claimDaily(state: MintForestDemoState): RuleResult<{ amount: number }> {
  const auth = requireLogin<{ amount: number }>(state);
  if (auth) return auth;
  if (state.claims.daily) return failure(state, 'Daily MF has already been claimed.');

  let nextState = addAmount(state, DEMO_VALUES.dailyReward);
  nextState = withUser(nextState, { mfDailyStatus: 1 });
  nextState.claims = { ...nextState.claims, daily: true };
  nextState = addActivity(nextState, 6, DEMO_VALUES.dailyReward, 'Claim Daily MF');
  return { state: cloneState(nextState), result: { success: true, data: { amount: DEMO_VALUES.dailyReward } } };
}

export function claimInvite(state: MintForestDemoState): RuleResult<{ amount: number }> {
  const auth = requireLogin<{ amount: number }>(state);
  if (auth) return auth;
  if (state.claims.invite) return failure(state, 'Invite MF has already been claimed.');

  let nextState = addAmount(state, DEMO_VALUES.inviteReward);
  nextState = withUser(nextState, { mfInviteStatus: 1 });
  nextState.claims = { ...nextState.claims, invite: true };
  nextState = addActivity(nextState, 7, DEMO_VALUES.inviteReward, 'Claim Invite MF');
  return { state: cloneState(nextState), result: { success: true, data: { amount: DEMO_VALUES.inviteReward } } };
}

export function steal(state: MintForestDemoState, targetGreenId: string): RuleResult<{ amount: number; targetGreenId: string }> {
  const auth = requireLogin<{ amount: number; targetGreenId: string }>(state);
  if (auth) return auth;
  if (!state.users[targetGreenId] || targetGreenId === USER_ID) return failure(state, 'Forest ID was not found.');
  if (state.stolenForestIds.includes(targetGreenId)) return failure(state, 'This forest has already been visited.');
  if (state.stolenForestIds.length >= state.config.totalStealLimit) return failure(state, 'The daily steal limit has been reached.');

  let nextState = addAmount(state, DEMO_VALUES.stealReward);
  nextState = withUser(nextState, { stealTimes: user(nextState).stealTimes + 1 });
  nextState.stolenForestIds = [...nextState.stolenForestIds, targetGreenId];
  nextState.users[targetGreenId] = { ...nextState.users[targetGreenId], stolenStatus: 1 };
  nextState = addActivity(nextState, 8, DEMO_VALUES.stealReward, 'Steal MF', Number(targetGreenId));
  return { state: cloneState(nextState), result: { success: true, data: { amount: DEMO_VALUES.stealReward, targetGreenId } } };
}

export function spin(state: MintForestDemoState): RuleResult<SpinResult> {
  const auth = requireLogin<SpinResult>(state);
  if (auth) return auth;
  if (user(state).turntableTimes >= state.config.maxSpin) return failure(state, 'There are no spins remaining.');
  if (Number(user(state).mfTotalAmounts) < state.config.turntableSpent) return failure(state, 'Not enough MF for this spin.');

  const reward = state.config.turntableRewards[state.spinRewardCursor];
  const times = user(state).turntableTimes + 1;
  let nextState = addAmount(state, reward - state.config.turntableSpent);
  nextState = withUser(nextState, { turntableTimes: times });
  nextState.spinRewardCursor += 1;
  nextState.spinHistory = [
    ...nextState.spinHistory,
    { id: `demo-spin-${times}`, amount: reward, spent: state.config.turntableSpent, times, createTime: `${DEMO_VALUES.baseEventTime}` },
  ];
  nextState = addActivity(nextState, 10, reward, 'Lucky Spin');
  return {
    state: cloneState(nextState),
    result: { success: true, data: { signature: '', turntableId: times, times, amount: String(reward) } },
  };
}

export function openBox(state: MintForestDemoState, boxNumber: number): RuleResult<BoxItem & { amount: number }> {
  const auth = requireLogin<BoxItem & { amount: number }>(state);
  if (auth) return auth;
  const box = state.boxes.find((item) => item.boxNumber === boxNumber);
  if (!box) return failure(state, 'This box is no longer available.');

  const reward = DEMO_VALUES.boxRewards[boxNumber as 501 | 502];
  let nextState = addAmount(state, reward);
  nextState.boxes = nextState.boxes.filter((item) => item.boxNumber !== boxNumber);
  nextState = addActivity(nextState, 9, reward, 'Opened a Mystery MF Box', boxNumber);
  return {
    state: cloneState(nextState),
    result: { success: true, data: { ...box, speedAmount: String(reward), amount: reward } },
  };
}

export function verifyTask(state: MintForestDemoState, taskId: number, input: string): RuleResult<TaskVerifyResult> {
  const auth = requireLogin<TaskVerifyResult>(state);
  if (auth) return auth;
  if (!state.tasks.some((task) => task.id === taskId)) return failure(state, 'Task was not found.');
  if (state.claims.claimedTaskIds.includes(taskId)) return failure(state, 'This task has already been completed.');
  if (taskId === 3 && input !== 'FOREST-DISCORD') return failure(state, 'Use the local Discord demo code.');
  if (taskId === 4 && !input.startsWith('0x')) return failure(state, 'Enter a valid local 0x hash.');
  if (taskId === 6 && !input.trim()) return failure(state, 'Enter a valid local UID.');

  const reward = DEMO_VALUES.taskRewards[taskId as 2 | 3 | 4 | 6] ?? 0;
  let nextState = addAmount(state, reward);
  nextState.claims = { ...nextState.claims, claimedTaskIds: [...nextState.claims.claimedTaskIds, taskId] };
  nextState.tasks = nextState.tasks.map((task) => (task.id === taskId ? { ...task, status: 1, done: task.done + 1 } : task));
  nextState = addActivity(nextState, 1, reward, `Completed Task ${taskId}`, taskId);
  return { state: cloneState(nextState), result: { success: true, data: { taskId, status: 'completed', reward } } };
}

export function resetState(_state: MintForestDemoState): MintForestDemoState {
  return createSeedState();
}
