import { describe, expect, it } from 'vitest';
import { createSeedState } from '@/projects/mint-forest/data/fixtures/seed.fixture';
import { createMintForestRepository } from '@/projects/mint-forest/data/local-storage.repository';
import { createMintForestGateway } from '@/projects/mint-forest/data/mint-forest.gateway';
import { DEMO_VALUES } from '@/projects/mint-forest/types/demo-state';

function createMemoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

function createGateway() {
  const storage = createMemoryStorage();
  return createMintForestGateway(createMintForestRepository(() => storage));
}

describe('Mint Forest local compatibility gateway', () => {
  it('keeps auth, global config and news available before login', async () => {
    const gateway = createGateway();

    const config = await gateway.request<{ content: unknown[] }>({
      url: '/api/forest/white/getForestConfig',
      method: 'GET',
    });
    const news = await gateway.request<{ content: unknown[]; result: unknown[] }>({
      url: '/api/forest/normal/getForestNews',
      method: 'get',
      params: { cursor: '' },
    });
    const auth = await gateway.request<string>({
      url: '/api/forest/user/auth',
      method: 'POST',
      data: { wallet_address: 'ignored', signature: 'ignored', message: 'ignored', invitation_code: 'FOREST-DEMO' },
    });

    expect(config.code).toBe(200);
    expect(config.data.content.length).toBeGreaterThan(0);
    expect(news.code).toBe(200);
    expect(news.data.result).toBe(news.data.content);
    expect(auth).toMatchObject({ code: 200, data: 'demo-session-v1' });
  });

  it('rejects every protected route before local login', async () => {
    const gateway = createGateway();
    const response = await gateway.request({
      url: '/api/forest/normal/getUserInfo',
      method: 'get',
    });

    expect(response.code).toBe(401);
    expect(response.msg).toContain('local demo');
  });

  it('serves user, other-user and paginated read DTOs after login', async () => {
    const gateway = createGateway();
    await gateway.request({ url: '/api/forest/user/auth', method: 'post', data: {} });

    const user = await gateway.request<{ greenId: number; infoType: string }>({
      url: '/api/forest/normal/getUserInfo',
      method: 'get',
    });
    const other = await gateway.request<{ greenId: number; domain?: string }>({
      url: '/api/forest/normal/getOtherUserInfo',
      method: 'get',
      params: { greenId: '2001' },
    });
    const missing = await gateway.request({
      url: '/api/forest/normal/getOtherUserInfo',
      method: 'get',
      params: { greenId: '9999' },
    });
    const tasks = await gateway.request<Array<{ id: number }>>({
      url: '/api/forest/task/list',
      method: 'get',
      params: { type: 0 },
    });
    const task = await gateway.request<{ id: number }>({
      url: '/api/forest/task/detail/3',
      method: 'get',
    });
    const rank = await gateway.request<{ content: Array<{ greenId?: number }>; next: string }>({
      url: '/api/forest/normal/getRankData',
      method: 'get',
      params: { cursor: null },
    });
    const invites = await gateway.request<{ content: unknown[]; next: string }>({
      url: '/api/forest/normal/getUserInviteData',
      method: 'get',
      params: { cursor: null },
    });

    expect(user.data).toMatchObject({ greenId: 1001, infoType: 'mine' });
    expect(other.data).toMatchObject({ greenId: 2001, domain: 'forest-2001.local' });
    expect(missing.code).toBe(5001);
    expect(tasks.data.map((item) => item.id)).toEqual([1, 2, 3, 4, 6]);
    expect(task.data.id).toBe(3);
    expect(rank.data.content[0].greenId).toBe(1001);
    expect(invites.data.content.length).toBe(1);
    expect(invites.data.next).toBe('');
  });

  it('routes activity, boxes, NFTs and spin records through the local state', async () => {
    const gateway = createGateway();
    await gateway.request({ url: '/api/forest/user/auth', method: 'post', data: {} });

    const beforeActivity = await gateway.request<{ content: unknown[]; next: string }>({
      url: '/api/forest/normal/getUserActivity',
      method: 'get',
      params: { cursor: null },
    });
    const boxes = await gateway.request<{ content: Array<{ boxNumber: number }>; next: string }>({
      url: '/api/forest/normal/getBoxData',
      method: 'get',
      params: { status: 0, cursor: null },
    });
    const nfts = await gateway.request<{ content: unknown[]; next: string }>({
      url: '/api/forest/normal/getMyNft',
      method: 'get',
      params: { cursor: null },
    });
    const opened = await gateway.request<{ boxNumber: number; speedAmount: string }>({
      url: '/api/forest/normal/openBoxData',
      method: 'get',
      params: { boxNumber: 501 },
    });
    const afterActivity = await gateway.request<{ content: Array<{ amount: number }>; next: string }>({
      url: '/api/forest/normal/getUserActivity',
      method: 'get',
      params: { cursor: null },
    });
    const spin = await gateway.request<{ amount: string; times: number }>({
      url: '/api/forest/normal/openTurntable',
      method: 'GET',
      params: { name: 'legacy-ignored' },
    });

    expect(beforeActivity.data.content).toHaveLength(0);
    expect(boxes.data.content.map((item) => item.boxNumber)).toEqual([501, 502]);
    expect(nfts.data.content).toHaveLength(0);
    expect(opened.data).toMatchObject({ boxNumber: 501, speedAmount: '150' });
    expect(afterActivity.data.content).toHaveLength(1);
    expect(afterActivity.data.content[0].amount).toBe(150);
    expect(spin.data).toMatchObject({ amount: '500', times: 1 });
  });

  it('uses local task verification and returns stable error codes', async () => {
    const gateway = createGateway();
    await gateway.request({ url: '/api/forest/user/auth', method: 'post', data: {} });

    const invalidBridge = await gateway.request({
      url: '/api/forest/task/checkBridge',
      method: 'get',
      params: { txHash: 'invalid' },
    });
    const validBridge = await gateway.request<{ taskId: number; reward: number }>({
      url: '/api/forest/task/checkBridge',
      method: 'get',
      params: { txHash: '0xlocal-demo-hash' },
    });
    const duplicateBridge = await gateway.request({
      url: '/api/forest/task/checkBridge',
      method: 'get',
      params: { txHash: '0xlocal-demo-hash' },
    });
    const follow = await gateway.request<{ taskId: number; reward: number }>({
      url: '/api/forest/task/checkFollowX',
      method: 'get',
    });
    const discord = await gateway.request({
      url: '/api/forest/task/checkJoinDiscord',
      method: 'get',
      params: { code: 'wrong-code' },
    });
    const validDiscord = await gateway.request<{ taskId: number; reward: number }>({
      url: '/api/forest/task/checkJoinDiscord',
      method: 'get',
      params: { code: 'FOREST-DISCORD' },
    });
    const redot = await gateway.request({
      url: '/api/forest/task/checkRedotPay',
      method: 'get',
      params: { uid: 'demo-uid' },
    });

    expect(invalidBridge.code).toBe(5003);
    expect(validBridge).toMatchObject({ code: 200, data: { taskId: 4, reward: DEMO_VALUES.taskRewards[4] } });
    expect(duplicateBridge.code).toBe(5002);
    expect(follow).toMatchObject({ code: 200, data: { taskId: 2, reward: DEMO_VALUES.taskRewards[2] } });
    expect(discord.code).toBe(5003);
    expect(validDiscord).toMatchObject({ code: 200, data: { taskId: 3, reward: DEMO_VALUES.taskRewards[3] } });
    expect(redot).toMatchObject({ code: 200, data: { taskId: 6, reward: DEMO_VALUES.taskRewards[6] } });
  });

  it('exposes direct mutation helpers and rejects unsupported routes', async () => {
    const storage = createMemoryStorage();
    const repository = createMintForestRepository(() => storage);
    const gateway = createMintForestGateway(repository);

    await gateway.request({ url: '/api/forest/user/auth', method: 'post', data: {} });
    expect((await gateway.claimDaily()).success).toBe(true);
    expect((await gateway.claimDaily()).success).toBe(false);
    expect((await gateway.claimInvite()).success).toBe(true);
    expect((await gateway.claimGreenId()).success).toBe(true);
    expect((await gateway.steal('2001')).success).toBe(true);
    expect(repository.get().users['1001'].mfTotalAmounts).toBe('2660');

    const unknown = await gateway.request({ url: '/api/forest/unsupported', method: 'get' });
    expect(unknown.code).toBe(5004);

    const reset = gateway.reset();
    expect(reset.session.loggedIn).toBe(false);
    expect(reset.users['1001'].mfTotalAmounts).toBe(String(DEMO_VALUES.initialMf));
  });
});
