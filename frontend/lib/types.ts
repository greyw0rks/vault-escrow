export type Role = 'client' | 'worker' | 'resolver' | 'observer';

export interface EscrowSummary {
  id: number;
  role: Role;
  stateLabel: string;
  amountSTX: string;
  progress: number;
}

export interface NewEscrowForm {
  worker: string;
  resolver: string;
  deposit: string;
  milestones: { description: string; amount: string }[];
}
