import { createMintForestGateway } from './mint-forest.gateway';
import { createMintForestRepository } from './local-storage.repository';

export const mintForestRepository = createMintForestRepository();
export const mintForestGateway = createMintForestGateway(mintForestRepository);
