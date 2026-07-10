import { describe, expect, it } from 'vitest';
import { createSeedState } from '@/projects/mint-forest/data/fixtures/seed.fixture';
import {
  claimDaily,
  claimGreenId,
  claimInvite,
  login,
  logout,
  openBox,
  resetState,
  spin,
  steal,
  verifyTask,
} from '@/projects/mint-forest/data/demo-rules';
import { DEMO_VALUES } from '@/projects/mint-forest/types/demo-state';

const loggedIn = () => login(createSeedState(), 'FOREST-DEMO').state;
const amount = (state: ReturnType<typeof createSeedState>) => Number(state.users['1001'].mfTotalAmounts);

describe('Mint Forest deterministic rules', () => {
  it('restores the same user state after logout and login', () => {
    const afterClaim = claimDaily(loggedIn()).state;
    const afterLogout = logout(afterClaim).state;
    const afterLogin = login(afterLogout, '').state;

    expect(afterLogin.session.token).toBe('demo-session-v1');
    expect(amount(afterLogin)).toBe(DEMO_VALUES.initialMf + DEMO_VALUES.dailyReward);
  });

  it('allows GreenID, daily and invite rewards only once', () => {
    const state = loggedIn();
    const greenId = claimGreenId(state);
    const daily = claimDaily(greenId.state);
    const invite = claimInvite(daily.state);

    expect(greenId.result.success).toBe(true);
    expect(claimGreenId(greenId.state).result.success).toBe(false);
    expect(daily.result.success).toBe(true);
    expect(claimDaily(daily.state).result.success).toBe(false);
    expect(invite.result.success).toBe(true);
    expect(claimInvite(invite.state).result.success).toBe(false);
    expect(amount(invite.state)).toBe(
      DEMO_VALUES.initialMf + DEMO_VALUES.dailyReward + DEMO_VALUES.inviteReward,
    );
  });

  it('allows one steal per target and rejects the fourth target at the limit', () => {
    const state = loggedIn();
    const first = steal(state, '2001');
    const second = steal(first.state, '2002');
    const third = steal(second.state, '2003');
    const duplicate = steal(third.state, '2001');
    const fourth = steal(third.state, '2004');

    expect(first.result.success && second.result.success && third.result.success).toBe(true);
    expect(duplicate.result.success).toBe(false);
    expect(fourth.result.success).toBe(false);
    expect(amount(third.state)).toBe(DEMO_VALUES.initialMf + DEMO_VALUES.stealReward * 3);
  });

  it('charges each spin and returns the fixed reward sequence', () => {
    let state = loggedIn();
    const rewards: number[] = [];

    for (let index = 0; index < DEMO_VALUES.maxSpin; index += 1) {
      const result = spin(state);
      expect(result.result.success).toBe(true);
      rewards.push(Number(result.result.data.amount));
      state = result.state;
    }

    expect(rewards).toEqual(DEMO_VALUES.spinRewards);
    expect(spin(state).result.success).toBe(false);
    expect(amount(state)).toBe(
      DEMO_VALUES.initialMf - DEMO_VALUES.spinCost * DEMO_VALUES.maxSpin + DEMO_VALUES.spinRewards.reduce((sum, value) => sum + value, 0),
    );
  });

  it('rejects a spin when MF is insufficient without consuming an attempt', () => {
    const state = loggedIn();
    const poorState = {
      ...state,
      users: { ...state.users, '1001': { ...state.users['1001'], mfTotalAmounts: '50' } },
    };

    const result = spin(poorState);

    expect(result.result.success).toBe(false);
    expect(result.state).toEqual(poorState);
  });

  it('consumes boxes and credits each fixed reward once', () => {
    const state = loggedIn();
    const first = openBox(state, 501);
    const second = openBox(first.state, 502);
    const duplicate = openBox(second.state, 501);

    expect(first.result.data.amount).toBe(DEMO_VALUES.boxRewards[501]);
    expect(second.result.data.amount).toBe(DEMO_VALUES.boxRewards[502]);
    expect(duplicate.result.success).toBe(false);
    expect(amount(second.state)).toBe(DEMO_VALUES.initialMf + 400);
  });

  it('validates tasks and credits their rewards only once', () => {
    let state = loggedIn();
    const invalidBridge = verifyTask(state, 4, 'not-a-hash');
    const validBridge = verifyTask(state, 4, '0xlocal-demo-hash');
    state = validBridge.state;
    const duplicateBridge = verifyTask(state, 4, '0xlocal-demo-hash');
    const validDiscord = verifyTask(state, 3, 'FOREST-DISCORD');

    expect(invalidBridge.result.success).toBe(false);
    expect(validBridge.result.data.reward).toBe(DEMO_VALUES.taskRewards[4]);
    expect(duplicateBridge.result.success).toBe(false);
    expect(validDiscord.result.success).toBe(true);
    expect(amount(validDiscord.state)).toBe(DEMO_VALUES.initialMf + 150);
  });

  it('reset restores the default seed', () => {
    const changed = claimDaily(loggedIn()).state;
    const reset = resetState(changed);

    expect(reset.session.loggedIn).toBe(false);
    expect(amount(reset)).toBe(DEMO_VALUES.initialMf);
    expect(reset.claims.daily).toBe(false);
    expect(reset.boxes.map((box) => box.boxNumber)).toEqual([501, 502]);
  });
});
