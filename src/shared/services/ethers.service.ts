import { connectConfig } from '@/shared/hooks/use-web3.hook';
import { waitForTransactionReceipt, writeContract } from 'wagmi/actions';
import { GreenIdABI, GreenIdAddress, MintForestContractABI, MintForestContractAddress } from '../const';
import moment from 'moment';

const ContractMsgMap: { [name: string]: string } = {
  'User rejected the request': 'Request denied. Please allow access to proceed.',
  'The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account':
    'Your balance is too low to complete this transaction.',
  'Buy amount exceeds MAX_SUPPLY limit': 'The purchase quantity exceeds the MAX_SUPPLY limit.',
  'incorrect token owner': 'Activation failed, the owner does not match',
  'token has already been claimed': 'You have already activated, no need to activate again',
  'Unable to decode signature': 'Activation failed, token ID does not exist',
};

export const getContractErrorMsg = (error: any) => {
  const rawMsg: string = error.shortMessage || error.message;

  for (const key in ContractMsgMap) {
    if (Object.prototype.hasOwnProperty.call(ContractMsgMap, key)) {
      if (rawMsg.includes(key)) {
        return ContractMsgMap[key];
      }
    }
  }

  return rawMsg || 'An error occurred. Please try again later.';
};

class EthersService {
  constructor() {}

  async claimGreenId(greenId: number): Promise<{ success: boolean; msg?: string }> {
    try {
      const hash = await writeContract(connectConfig, {
        abi: GreenIdABI,
        address: GreenIdAddress,
        functionName: 'claim',
        args: [BigInt(greenId)],
      });
      const { status } = await waitForTransactionReceipt(connectConfig, {
        hash,
      });
      return {
        success: status === 'success',
      };
    } catch (error: any) {
      return { success: false, msg: getContractErrorMsg(error) };
    }
  }

  async signin(signature: string, point: number): Promise<{ success: boolean; msg?: string }> {
    try {
      const time: number = moment().utc().startOf('day').unix();
      const hash = await writeContract(connectConfig, {
        abi: MintForestContractABI,
        address: MintForestContractAddress as any,
        functionName: 'signin',
        args: [
          {
            time: BigInt(time),
            point: BigInt(point),
          },
          signature as any,
        ],
      });

      const { status } = await waitForTransactionReceipt(connectConfig, {
        hash,
      });

      return {
        success: status === 'success',
      };
    } catch (error: any) {
      return { success: false, msg: getContractErrorMsg(error) };
    }
  }

  async inviteClaim(signature: string, point: number): Promise<{ success: boolean; msg?: string }> {
    try {
      const time: number = moment().utc().startOf('day').unix();
      const hash = await writeContract(connectConfig, {
        abi: MintForestContractABI,
        address: MintForestContractAddress as any,
        functionName: 'inviteClaim',
        args: [
          {
            time: BigInt(time),
            point: BigInt(point),
          },
          signature as any,
        ],
      });

      const { status } = await waitForTransactionReceipt(connectConfig, {
        hash,
      });

      return {
        success: status === 'success',
      };
    } catch (error: any) {
      return { success: false, msg: getContractErrorMsg(error) };
    }
  }

  async steal(
    ownerSignature: string,
    ownerAddress: string,
    point: number
  ): Promise<{ success: boolean; msg?: string }> {
    try {
      const time: number = moment().utc().startOf('day').unix();
      const hash = await writeContract(connectConfig, {
        abi: MintForestContractABI,
        address: MintForestContractAddress as any,
        functionName: 'steal',
        args: [
          {
            target: ownerAddress as any,
            time: BigInt(time),
            point: BigInt(point),
          },
          ownerSignature as any,
        ],
      });

      const { status } = await waitForTransactionReceipt(connectConfig, {
        hash,
      });

      return {
        success: status === 'success',
      };
    } catch (error: any) {
      return { success: false, msg: getContractErrorMsg(error) };
    }
  }

  async turntable(signature: string, point: number, count: number): Promise<{ success: boolean; msg?: string }> {
    try {
      const time: number = moment().utc().startOf('day').unix();
      const hash = await writeContract(connectConfig, {
        abi: MintForestContractABI,
        address: MintForestContractAddress as any,
        functionName: 'turntable',
        args: [
          {
            time: BigInt(time),
            count: count,
            point: BigInt(point),
          },
          signature as any,
        ],
      });

      const { status } = await waitForTransactionReceipt(connectConfig, {
        hash,
      });

      return {
        success: status === 'success',
      };
    } catch (error: any) {
      return { success: false, msg: getContractErrorMsg(error) };
    }
  }

  async openReward(signature: string, point: number, rewardId: number): Promise<{ success: boolean; msg?: string }> {
    try {
      const hash = await writeContract(connectConfig, {
        abi: MintForestContractABI,
        address: MintForestContractAddress as any,
        functionName: 'openReward',
        args: [
          {
            rewardId: BigInt(rewardId),
            point: BigInt(point),
          },
          signature as any,
        ],
      });

      const { status } = await waitForTransactionReceipt(connectConfig, {
        hash,
      });

      return {
        success: status === 'success',
      };
    } catch (error: any) {
      return { success: false, msg: getContractErrorMsg(error) };
    }
  }
}

export const etherSvc = new EthersService();
