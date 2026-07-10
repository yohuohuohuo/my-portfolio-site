import {
  HttpCode,
  type ActivityItem,
  type AuthType,
  type BoxItem,
  type InviteItem,
  type NftItem,
  type OpenBoxResponse,
  type RankItem,
  type SpinResult,
} from '../types/api';
import { createConfigFixture, createRankFixtures } from './fixtures/content.fixture';
import { createMintForestRepository } from './local-storage.repository';
import {
  claimDaily as applyClaimDaily,
  claimGreenId as applyClaimGreenId,
  claimInvite as applyClaimInvite,
  login as applyLogin,
  logout as applyLogout,
  openBox as applyOpenBox,
  spin as applySpin,
  steal as applySteal,
  verifyTask as applyVerifyTask,
  type RuleResult,
} from './demo-rules';
import type { MintForestDemoState } from '../types/demo-state';

export interface DemoApiResponse<T> {
  code: HttpCode;
  msg: string;
  data: T;
}

export interface DemoRequest {
  url: string;
  method: 'get' | 'GET' | 'post' | 'POST';
  data?: unknown;
  params?: Record<string, unknown>;
  authType?: AuthType;
}

export interface DemoGateway {
  request<T>(request: DemoRequest): Promise<DemoApiResponse<T>>;
  logout(): Promise<{ success: boolean; msg?: string }>;
  claimGreenId(): Promise<{ success: boolean; msg?: string }>;
  claimDaily(): Promise<{ success: boolean; msg?: string }>;
  claimInvite(): Promise<{ success: boolean; msg?: string }>;
  steal(greenId: string): Promise<{ success: boolean; msg?: string }>;
  spin(): Promise<DemoApiResponse<SpinResult>>;
  openBox(boxNumber: number): Promise<DemoApiResponse<OpenBoxResponse>>;
  reset(): MintForestDemoState;
}

type Repository = ReturnType<typeof createMintForestRepository>;

const REQUEST_DELAY_MS = 80;
const TASK_DETAIL_PREFIX = '/api/forest/task/detail/';
const USER_ID = '1001';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function wait(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY_MS));
}

function success<T>(data: T, msg = 'success'): DemoApiResponse<T> {
  return { code: HttpCode.Success, msg, data };
}

function failure<T>(code: HttpCode, msg: string): DemoApiResponse<T> {
  return { code, msg, data: null as T };
}

function requestValue(request: DemoRequest, key: string): unknown {
  if (request.params && key in request.params) return request.params[key];
  if (typeof request.data === 'object' && request.data !== null) {
    return (request.data as Record<string, unknown>)[key];
  }
  return undefined;
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : value == null ? '' : String(value);
}

function paginate<T>(items: T[], cursor: unknown, pageSize = 50): { content: T[]; next: string } {
  const parsed = cursor == null || cursor === '' ? 0 : Number(cursor);
  const start = Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
  const content = clone(items.slice(start, start + pageSize));
  const next = start + pageSize < items.length ? String(start + pageSize) : '';
  return { content, next };
}

function methodIs(request: DemoRequest, expected: 'GET' | 'POST'): boolean {
  return request.method.toUpperCase() === expected;
}

function applyMutation<T>(repository: Repository, rule: (state: MintForestDemoState) => RuleResult<T>): RuleResult<T> {
  const result = rule(repository.get());
  if (result.result.success) {
    repository.update(() => result.state);
  }
  return result;
}

function mutationResponse<T>(result: RuleResult<T>, failureCode = HttpCode.NotEligible): DemoApiResponse<T> {
  if (!result.result.success) {
    return failure(failureCode, result.result.msg || 'The local demo action was not available.');
  }
  return success(clone(result.result.data));
}

function protectedRoute(url: string): boolean {
  return (
    url === '/api/forest/normal/getUserInfo' ||
    url === '/api/forest/normal/getOtherUserInfo' ||
    url === '/api/forest/normal/getUserActivity' ||
    url === '/api/forest/task/list' ||
    url.startsWith(TASK_DETAIL_PREFIX) ||
    url.startsWith('/api/forest/task/check') ||
    url === '/api/forest/normal/getUserInviteData' ||
    url === '/api/forest/normal/getRankData' ||
    url === '/api/forest/normal/getBoxData' ||
    url === '/api/forest/normal/openBoxData' ||
    url === '/api/forest/normal/getMyNft' ||
    url === '/api/forest/normal/openTurntable'
  );
}

function routeRequest(repository: Repository, request: DemoRequest): DemoApiResponse<unknown> {
  const state = repository.get();

  if (request.url === '/api/forest/user/auth') {
    if (!methodIs(request, 'POST')) return failure(HttpCode.InvalidMethod, 'This demo endpoint only accepts POST.');
    const invitationCode = asString(requestValue(request, 'invitation_code'));
    const result = applyMutation(repository, (current) => applyLogin(current, invitationCode));
    return result.result.success ? success('demo-session-v1') : failure(HttpCode.Error, result.result.msg || 'Login failed.');
  }

  if (request.url === '/api/forest/white/getForestConfig') {
    if (!methodIs(request, 'GET')) return failure(HttpCode.InvalidMethod, 'This demo endpoint only accepts GET.');
    return success({ content: clone(createConfigFixture()) });
  }

  if (request.url === '/api/forest/normal/getForestNews') {
    if (!methodIs(request, 'GET')) return failure(HttpCode.InvalidMethod, 'This demo endpoint only accepts GET.');
    const page = paginate(state.news, requestValue(request, 'cursor'));
    return success({ content: page.content, next: page.next, result: page.content });
  }

  if (!protectedRoute(request.url)) {
    return failure(HttpCode.InvalidMethod, 'The local demo route was not found.');
  }

  if (!state.session.loggedIn) {
    return failure(HttpCode.AuthFailed, 'Please enter the local demo first.');
  }

  switch (request.url) {
    case '/api/forest/normal/getUserInfo':
      if (!methodIs(request, 'GET')) return failure(HttpCode.InvalidMethod, 'This demo endpoint only accepts GET.');
      return success(clone(state.users[USER_ID]));

    case '/api/forest/normal/getOtherUserInfo': {
      if (!methodIs(request, 'GET')) return failure(HttpCode.InvalidMethod, 'This demo endpoint only accepts GET.');
      const greenId = asString(requestValue(request, 'greenId'));
      if (!greenId) return failure(HttpCode.InvalidParams, 'A Forest ID is required.');
      const otherUser = state.users[greenId];
      return otherUser && greenId !== USER_ID
        ? success(clone(otherUser))
        : failure(HttpCode.NoData, 'Forest ID was not found.');
    }

    case '/api/forest/normal/getUserActivity': {
      if (!methodIs(request, 'GET')) return failure(HttpCode.InvalidMethod, 'This demo endpoint only accepts GET.');
      return success(paginate<ActivityItem>(state.activities, requestValue(request, 'cursor')));
    }

    case '/api/forest/task/list':
      if (!methodIs(request, 'GET')) return failure(HttpCode.InvalidMethod, 'This demo endpoint only accepts GET.');
      return success({ content: clone(state.tasks), next: '' });

    case '/api/forest/normal/getUserInviteData':
      if (!methodIs(request, 'GET')) return failure(HttpCode.InvalidMethod, 'This demo endpoint only accepts GET.');
      return success(paginate<InviteItem>(state.invites, requestValue(request, 'cursor')));

    case '/api/forest/normal/getRankData': {
      if (!methodIs(request, 'GET')) return failure(HttpCode.InvalidMethod, 'This demo endpoint only accepts GET.');
      const mine: RankItem = { ...clone(state.users[USER_ID].rankVO), greenId: 1001 };
      return success(paginate<RankItem>([mine, ...createRankFixtures()], requestValue(request, 'cursor')));
    }

    case '/api/forest/normal/getBoxData':
      if (!methodIs(request, 'GET')) return failure(HttpCode.InvalidMethod, 'This demo endpoint only accepts GET.');
      return success(paginate<BoxItem>(state.boxes, requestValue(request, 'cursor')));

    case '/api/forest/normal/getMyNft':
      if (!methodIs(request, 'GET')) return failure(HttpCode.InvalidMethod, 'This demo endpoint only accepts GET.');
      return success(paginate<NftItem>(state.nfts, requestValue(request, 'cursor')));

    case '/api/forest/normal/openBoxData': {
      if (!methodIs(request, 'GET')) return failure(HttpCode.InvalidMethod, 'This demo endpoint only accepts GET.');
      const boxNumber = Number(requestValue(request, 'boxNumber'));
      if (!Number.isInteger(boxNumber)) return failure(HttpCode.InvalidParams, 'A box number is required.');
      return mutationResponse(
        applyMutation(repository, (current) => applyOpenBox(current, boxNumber)),
      ) as DemoApiResponse<unknown>;
    }

    case '/api/forest/normal/openTurntable':
      if (!methodIs(request, 'GET')) return failure(HttpCode.InvalidMethod, 'This demo endpoint only accepts GET.');
      return mutationResponse(applyMutation(repository, (current) => applySpin(current)));

    case '/api/forest/task/checkFollowX':
      if (!methodIs(request, 'GET')) return failure(HttpCode.InvalidMethod, 'This demo endpoint only accepts GET.');
      return mutationResponse(applyMutation(repository, (current) => applyVerifyTask(current, 2, '')));

    case '/api/forest/task/checkBridge': {
      if (!methodIs(request, 'GET')) return failure(HttpCode.InvalidMethod, 'This demo endpoint only accepts GET.');
      const txHash = asString(requestValue(request, 'txHash'));
      if (!txHash.startsWith('0x')) return failure(HttpCode.InvalidParams, 'Enter a valid local 0x hash.');
      return mutationResponse(applyMutation(repository, (current) => applyVerifyTask(current, 4, txHash)));
    }

    case '/api/forest/task/checkRedotPay': {
      if (!methodIs(request, 'GET')) return failure(HttpCode.InvalidMethod, 'This demo endpoint only accepts GET.');
      const uid = asString(requestValue(request, 'uid'));
      if (!uid.trim()) return failure(HttpCode.InvalidParams, 'Enter a valid local UID.');
      return mutationResponse(applyMutation(repository, (current) => applyVerifyTask(current, 6, uid)));
    }

    case '/api/forest/task/checkJoinDiscord': {
      if (!methodIs(request, 'GET')) return failure(HttpCode.InvalidMethod, 'This demo endpoint only accepts GET.');
      const code = asString(requestValue(request, 'code'));
      if (code !== 'FOREST-DISCORD') return failure(HttpCode.InvalidParams, 'Use the local Discord demo code.');
      return mutationResponse(applyMutation(repository, (current) => applyVerifyTask(current, 3, code)));
    }

    default:
      break;
  }

  if (request.url.startsWith(TASK_DETAIL_PREFIX)) {
    if (!methodIs(request, 'GET')) return failure(HttpCode.InvalidMethod, 'This demo endpoint only accepts GET.');
    const taskId = Number(request.url.slice(TASK_DETAIL_PREFIX.length));
    const task = state.tasks.find((item) => item.id === taskId);
    return task ? success(clone(task)) : failure(HttpCode.NoData, 'Task was not found.');
  }

  return failure(HttpCode.InvalidMethod, 'The local demo route was not found.');
}

export function createMintForestGateway(repository: Repository = createMintForestRepository()): DemoGateway {
  const runDirectMutation = async <T>(rule: (state: MintForestDemoState) => RuleResult<T>) => {
    await wait();
    const result = applyMutation(repository, rule);
    return { success: result.result.success, ...(result.result.msg ? { msg: result.result.msg } : {}) };
  };

  return {
    async request<T>(request: DemoRequest): Promise<DemoApiResponse<T>> {
      await wait();
      return routeRequest(repository, request) as DemoApiResponse<T>;
    },
    logout: () => runDirectMutation((state) => applyLogout(state)),
    claimGreenId: () => runDirectMutation((state) => applyClaimGreenId(state)),
    claimDaily: () => runDirectMutation((state) => applyClaimDaily(state)),
    claimInvite: () => runDirectMutation((state) => applyClaimInvite(state)),
    steal: (greenId: string) => runDirectMutation((state) => applySteal(state, greenId)),
    async spin(): Promise<DemoApiResponse<SpinResult>> {
      await wait();
      return mutationResponse(applyMutation(repository, (state) => applySpin(state)));
    },
    async openBox(boxNumber: number): Promise<DemoApiResponse<OpenBoxResponse>> {
      await wait();
      return mutationResponse(applyMutation(repository, (state) => applyOpenBox(state, boxNumber)));
    },
    reset: () => repository.reset(),
  };
}
