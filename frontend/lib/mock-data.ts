import type { Escrow, Milestone } from './contract';

export const MOCK_ESCROWS: Escrow[] = [
  {
    id: 1,
    client: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    worker: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
    resolver: 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC',
    totalAmount: 1000000000n,
    deposited: 1000000000n,
    released: 250000000n,
    milestoneCount: 4,
    activeMilestone: 1,
    state: 'active',
    createdAt: 145000,
  },
];

export const MOCK_MILESTONES: Milestone[] = [
  { description: 'Project setup and architecture', amount: 250000000n, state: 'approved', blockSubmitted: 145010, blockResolved: 145020 },
  { description: 'Core smart contract development', amount: 250000000n, state: 'submitted', blockSubmitted: 145100, blockResolved: 0 },
  { description: 'Frontend integration', amount: 250000000n, state: 'pending', blockSubmitted: 0, blockResolved: 0 },
  { description: 'Testing and deployment', amount: 250000000n, state: 'pending', blockSubmitted: 0, blockResolved: 0 },
];
